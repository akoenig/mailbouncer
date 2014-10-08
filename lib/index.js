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

var carrier = require('./carrier');
var mailparser = require('./mailparser');
var watchdog = require('./watchdog');

function MailBouncer (config) {
    this.informant = new events.EventEmitter();

    this.$watchdog = watchdog(config.imap);
    this.$watchdog.on('mail', this.$mail.bind(this));
    this.$watchdog.on('error', this.$error.bind(this));
    this.$watchdog.connect();

    this.$carrier = carrier(config.smtp);
}

MailBouncer.prototype.$error = function $error (err) {
    this.informant.emit('error', new VError(err, 'MailBouncer transaction failed'));
};

MailBouncer.prototype.$createBouncer = function $createBouncer (mail) {
    var self = this;

    function createCallback () {
        return function done (err, recipient) {
            if (err) {
                return self.$error(new VError(err, 'failed to forward mail to "%s"', recipient));
            }

            self.informant.emit('bounce', mail, recipient);
        }
    }

    return function bounce (recipients) {
        if (!util.isArray(recipients)) {
            recipients = [recipients];
        }

        recipients.forEach(function (recipient) {
            var callback = createCallback();

            self.$carrier.forward(mail).to(recipient, callback);
        });
    };
};

MailBouncer.prototype.$mail = function $mail (mail) {
    var self = this;

    function onParse (err, mail) {
        var bounce;

        if (err) {
            return self.$error(new VError(err, 'failed to parse mail'));
        }

        // TODO: Add prefix to subject
        bounce = self.$createBouncer(mail);

        self.informant.emit('mail', mail, bounce);
    }

    mailparser(mail, onParse);
};

module.exports = function instantiate (config) {
    var mailbouncer;
   
    mandatory(config).is('object', 'Please define a proper configuration object.');

    mailbouncer = new MailBouncer(config);

    return mailbouncer.informant;
};
