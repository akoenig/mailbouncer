# MailBouncer [![Build Status](https://travis-ci.org/akoenig/mailbouncer.svg?branch=master)](https://travis-ci.org/akoenig/mailbouncer)

An easy-to-configurable mail bouncer.

## Example

```javascript
var MailBouncer = require('mailbouncer');

var config = {...};

MailBouncer(config)
    .on('mail', function (mail, bounce) {
        if ('logfile' === mail.subject) {
            bounce(['andre.koenig@posteo.de', 'akoenig@posteo.de']);
        }
    })
    .on('error', function (err) {
        console.error('Autsch! An error occurred: %s', err.message);
    });
```

## Usage

### Installation

```sh
npm i --save mailbouncer
```

### Configuration

The `MailBouncer` module accepts the following configuration entries:

```javascript
var config = {
    prefix: '[BOUNCED MAIL]',    // Subject prefix; optional; default: '[FORWARDED]'

    imap: {
        host: 'host.tld',
        user: 'foo',
        password: 'bar',
        port: 993,               // default: 993
        ssl: true,               // optional; default: true
        folder: 'INBOX',         // optional; default: 'INBOX'
    },
    
    smtp: {
        host: 'host.tld',
        user: 'foo',
        password: 'bar',
        port: 465,               // default: 25
        ssl: true                // optional; default: true
    }
};
```

### Events

#### .on('mail', function (mail, bounce) {...});

Will be emitted when a new mail arrived. `mail` is an ordinary JavaScript object which consists of all available mail information (subject, text, attachments, etc.). The `bounce` parameter is a function that awaits one or an `array` of email addresses to which the `mail` should be forwarded. Example:

```javascript
bounce('andre.koenig@posteo.de');
```

will bounce the mail to one address, whereas

```javascript
bounce(['andre.koenig@posteo.de', 'akoenig@posteo.de']);
```

will bounce the current mail to multiple addresses.

#### .on('bounce', function (mail) {...});

Will be emitted when a `mail` has been bounced successfully. Note: The bounced `mail` data object will be passed to the callback function.

#### .on('error', function (err) {...});

Will be emitted when an error occurred.

## Tests

```sh
gulp test
```

The specs are very rudimental at the moment. Did not find an IMAP mock solution for node. [Contact](http://andrekoenig.info) me if you know one :)

## License

The MIT License (MIT)

Copyright (c) 2014 [André König](http://andrekoenig.info), Germany

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
