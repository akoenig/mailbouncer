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

var email = require('emailjs');
var VError = require('verror');

/**
 * The mail carrier which provides the functionality
 * for sending mails.
 *
 * @param {object} config
 * The configuration object (see `smtp` section -> config -> README).
 *
 */
function Carrier (config) {
    this.$config = config;

    this.$config.ssl = this.$config.ssl || true;
    this.$config.port = this.$config.port || 25;
}

/**
 * @private
 *
 * Creates a connection to the configured SMTP server.
 *
 */
Carrier.prototype.$connect = function $connect () {
    return email.server.connect({
        user: this.$config.user, 
        password: this.$config.password, 
        host: this.$config.host,
        port: this.$config.port,
        ssl: this.$config.ssl
    });
};

/**
 * Forwards a mail to a given recipient.
 *
 * @param {object} mail
 * The mail object.
 *
 * @param {string} recipient
 * The mail recipient.
 *
 * @param {function} callback
 * Will be executed when the mail has been forwarded. Executed as `callback(err, recipient)`
 *
 */
Carrier.prototype.forward = function forward (mail, recipient, callback) {
    var connection = this.$connect();

    function onSend (err) {
        if (err) {
            return callback(new VError(err, 'failed to forward the email'), recipient);
        }

        callback(null, recipient);
    }

    mail.to = recipient;

    connection.send(mail, onSend);
};

/**
 * Instantiates a interaction object with which it is possible
 * to forward mails.
 *
 * @param {object} config
 * The configuration object (see `smtp` section -> config -> README).
 *
 * @returns {object}
 * The SMTP interaction object.
 *
 */
module.exports = function instantiate (config) {
    var carrier = new Carrier(config);

    return {
        forward : function forward (mail) {
            return {
                to: function to (recipient, callback) {
                    carrier.forward(mail, recipient, callback);
                }
            };
        }
    };
};
