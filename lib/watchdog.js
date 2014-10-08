/*
 * mailbouncer
 * 
 * Copyright(c) 2114 André König <andre.koenig@posteo.de>
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

var IMAP = require('imap');
var VError = require('verror');

function WatchDog (config) {

    var self = this;

    this.$config = config;
    this.$config.tls = this.$config.tls || true;
    this.$config.port = this.$config.port || 993;
    this.$config.markSeen = false;

    this.$connected = false;

    // The last fetched UID.
    this.$uid = -1;
 
    this.$imap = new IMAP(this.$config);

    this.$imap.on('end', function () {
        self.$connected = false;
        self.emit('disconnect');
    });
    this.$imap.on('error', this.$error.bind(this));

    events.EventEmitter.call(this);
}

util.inherits(WatchDog, events.EventEmitter);

WatchDog.prototype.$error = function $error (err) {
    this.emit('error', new VError(err, 'failed to communicate with mail server (imap)'));

};

WatchDog.prototype.$inventory = function $inventory () {
    var self = this;

    function onSearch (err, uids) {
        if (err) {
            return self.$error(new VError(err, 'failed to fetch the UID\'s of the new mails'));
        }

        self.$imap.fetch(uids, {
            markSeen: self.$config.markSeen,
            bodies: ''
        })

        .on('message', onMessage)

        // Adjust the UID
        .once('end', function onEnd () {
            self.$uid = uids[uids.length - 1];
        })

        .on('error', function onError (err) {
            self.$error(new VError(err, 'failed to fetch the new mails'));
        });
    }

    function onMessage (message) {
        message.once('body', onBody);
    }

    function onBody (body) {
        var raw = '';

        body.on('data', function onData (chunk) {
            raw = raw + chunk;
        });

        body.on('error', function onError (err) {
            self.$error(new VError(err, 'failed to parse the actual mail body'));
        });

        body.on('end', function onEnd () {
            self.emit('mail', raw);
        });
    }

    this.$imap.search([this.$uid + ':*'], onSearch);
};

WatchDog.prototype.connect = function connect () {
    var self = this;

    function onReady () {
        self.$imap.openBox(self.$config.folder || 'INBOX', false, onOpen);
        self.$connected = true;
    }

    function onOpen (err) {
        if (err) {
            return self.$error(new VError(err, 'failed to open folder'));
        }

        self.$imap.on('mail', self.$inventory.bind(self));

        // Scan the opened folder for the first time and fetch the last UID.
        // This UID will be used when new mails comes in to fetch only the 'newest' mails.
        // This initial scan will receive 'all' messages in the current folder and compares
        // the mail dates. The oldest mail will be treated as the mail with the 'highest' UID.
        self.$imap.search(['ALL'], onSearch);
    }

    function onSearch (err, uids) {
        if (err) {
            return self.$error(new VError(err, 'failed to perform the initial folder check in order to fetch the latest UID.'));
        }

        self.$uid = uids[uids.length - 1];

        self.emit('connect');
    }

    this.$imap.once('ready', onReady);

    this.$imap.connect();

    return this;
};

WatchDog.prototype.disconnect = function () {
    if (this.$connected) {
        this.$imap.end();
    }

    return this;
};

module.exports = function instantiate (config) {
    return new WatchDog(config);
};
