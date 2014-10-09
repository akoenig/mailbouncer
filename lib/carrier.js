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

function Carrier (config) {
    this.$config = config;

    this.$config.ssl = this.$config.ssl || true;
    this.$config.port = this.$config.port || 25;
}

Carrier.prototype.$connect = function $connect () {
    return email.server.connect({
        user: this.$config.user, 
        password: this.$config.password, 
        host: this.$config.host,
        port: this.$config.port,
        ssl: this.$config.ssl
    });
};

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
