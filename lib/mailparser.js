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

var MailParser = require('mailparser').MailParser;

module.exports.toJSON = function toJSON (raw, callback) {
    var parser = new MailParser();

    function onEnd (mail) {
        callback(null, mail);
    }

    parser.on('end', onEnd);
    parser.write(raw);
    parser.end();
};
