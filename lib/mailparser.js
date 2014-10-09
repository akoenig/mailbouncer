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

/**
 * @private
 *
 * Minimizes the data object overhead of the attachments.
 * The attachment objects will be truncated to the necessary
 * information.
 *
 * @param {array} attachments
 * The bloated attachment array from the parser.
 *
 * @returns {array}
 * The minimized attachment objects.
 *
 */
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

/**
 * @private
 *
 * Converts addresses from objects to strings in the form:
 *
 *     Name <user@host.tld.>
 *
 * @param {array} addresses
 * An array with email address information that should be converted.
 *
 */
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

/**
 * Converts a raw email to a JavaScript object (preserves all
 * header information)
 *
 * @param {string} raw
 * The raw email.
 *
 * @param {function} callback
 * Will be executed when the mail has been parsed. Executed as `callback(err, mail)`.
 *
 */
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
