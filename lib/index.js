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

var mandatory = require('mandatory');

function MailBouncer (options) {
    this.informant = new events.EventEmitter();
}

module.exports = function instantiate (config) {
    var mailbouncer;
   
    mandatory(config).is('object', 'Please define a proper configuration object.');

    mailbouncer = new MailBouncer();

    return mailbouncer.informant;
};
