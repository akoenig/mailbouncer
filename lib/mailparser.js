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

function streamline (attachments) {
    var result = [];

    attachments.forEach(function (attachment) {
        result.push({
            name: attachment.fileName,
            type: attachment.contentType,
            data: attachment.content
        });
    });

    return result;
}

function csv (addresses) {
    var streamlined = '';

    addresses.forEach(function (human, index) {
        streamlined = streamlined + human.name  + ' <' + human.address + '>';

        if (index !== (addresses.length - 1)) {
            streamlined = streamlined + ',';
        }
    });

    return streamlined;
}

module.exports = function parse (raw, callback) {
    var parser = new MailParser();

    function onEnd (mail) {
        if (mail.attachments) {
            mail.attachment = streamline(mail.attachments);
        }

        mail.from = csv(mail.from);
        mail.to = csv(mail.to);

        callback(null, mail);
    }

    parser.on('end', onEnd);
    parser.write(raw);
    parser.end();
};
