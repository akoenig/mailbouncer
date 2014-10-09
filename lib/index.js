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

/**
 * Constructor function of the MailBouncer.
 *
 * @param {object} config
 * The configuration object (see README).
 *
 */
function MailBouncer (config) {
    this.informant = new events.EventEmitter();

    this.$config = config;
    this.$config.prefix = this.$config.prefix || '[FORWARDED]';

    this.$watchdog = watchdog(config.imap);
    this.$watchdog.on('mail', this.$mail.bind(this));
    this.$watchdog.on('error', this.$error.bind(this));
    this.$watchdog.connect();

    this.$carrier = carrier(config.smtp);
}

/**
 * @private
 *
 * Function that handle error events from the sub-modules.
 *
 * @param {object} err
 * The respective error (VError) object.
 *
 */
MailBouncer.prototype.$error = function $error (err) {
    this.informant.emit('error', new VError(err, 'MailBouncer transaction failed'));
};

/**
 * @private
 *
 * Function that handles incoming mail events (will be executed
 * when a new mail is available in the configured IMAP folder.
 *
 * @param {string} mail
 * The raw mail body from the IMAP server.
 *
 */
MailBouncer.prototype.$mail = function $mail (mail) {
    var self = this;

    function onParse (err, mail) {
        var bounce;

        if (err) {
            return self.$error(new VError(err, 'failed to parse mail'));
        }

        bounce = self.$createBouncer(mail);

        self.informant.emit('mail', mail, bounce);
    }

    mailparser(mail, onParse);
};

/**
 * @private
 *
 * Creates the bouncer function which is responsible for forwarding
 * the given mail. This function will be passed to the `mail` event
 * of the MailBouncer.
 *
 * @param {object} mail
 * The mail data object.
 *
 */
MailBouncer.prototype.$createBouncer = function $createBouncer (mail) {
    var self = this;

    function createCallback () {
        return function done (err, recipient) {
            if (err) {
                return self.$error(new VError(err, 'failed to forward mail to "%s"', recipient));
            }

            self.informant.emit('bounce', mail, recipient);
        };
    }

    return function bounce (recipients) {
        if (!util.isArray(recipients)) {
            recipients = [recipients];
        }

        recipients.forEach(function (recipient) {
            var callback = createCallback();

            self.$carrier.forward({
                from: mail.from,
                to: mail.to,
                subject: self.$config.prefix + ' ' + mail.subject,
                text: mail.text,
                attachment: mail.attachment
            }).to(recipient, callback);
        });
    };
};

/**
 * Instantiates a new MailBouncer object.
 *
 * @param {object} config
 * The MailBouncer configuration (see README).
 *
 */
module.exports = function instantiate (config) {
    var mailbouncer;
   
    mandatory(config).is('object', 'Please define a proper configuration object.');

    mailbouncer = new MailBouncer(config);

    return mailbouncer.informant;
};
