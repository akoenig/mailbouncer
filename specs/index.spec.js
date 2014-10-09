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

var should = require('should');

var MailBouncer = require('../');

describe('The MailBouncer module', function () {

    it('should fail when no configuration has been passed.', function (done) {
        try {
            MailBouncer();
        } catch (e) {
            e.should.be.ok;
        }

        done();
    });
});
