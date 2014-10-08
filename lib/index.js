/*
 * mailbouncer
 * 
 * Copyright(c) 2014 André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 *
 */

/**
 * @author André König <andre.koenig@posteo.de>
 *
 *
 */

'use strict';

var events = require('events');
var util = require('util');

var mandatory = require('mandatory');
var VError = require('verror');

var mailparser = require('./mailparser');
var watchdog = require('./watchdog');

function MailBouncer (config) {
    this.informant = new events.EventEmitter();

    this.$watchdog = watchdog(config);
    this.$watchdog.on('mail', this.$mail.bind(this));
    this.$watchdog.on('error', this.$error.bind(this));
    this.$watchdog.connect();
}

MailBouncer.prototype.$error = function $error (err) {
    this.informant.emit('error', new VError(err, 'MailBouncer transaction failed'));
};

MailBouncer.prototype.$createBouncer = function $createBouncer (mail) {

    return function bounce (recipients) {
        var i = 0;
        var len;
        var recipient;

        if (util.isArray(recipients)) {
            recipients = [recipients];
        }

        len = recipients.length;

        for (i; i < len; i = i + 1) {
            recipient = recipients[i];

            console.log('Sending mail to: ' + recipient);
        }
    };
};

MailBouncer.prototype.$mail = function $mail (mail) {
    var self = this;
    var bounce = this.$createBouncer(mail);

    function onParse (err, parsed) {
        if (err) {
            return self.$error(new VError(err, 'failed to convert email to JSON'));
        }

        self.informant.emit('mail', parsed, bounce);
    }

    mailparser.toJSON(mail, onParse);
};

module.exports = function instantiate (config) {
    var mailbouncer;
   
    mandatory(config).is('object', 'Please define a proper configuration object.');

    mailbouncer = new MailBouncer(config);

    return mailbouncer.informant;
};
