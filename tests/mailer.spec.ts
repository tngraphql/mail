/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 9:14 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { MailManager } from '../src/Mail/MailManager';
import { Mailer } from '../src/Mail/Mailer';
import { Message } from '../src/Message';
import { Mailable } from '../src';
import { MessageSending } from '../src/Events';
import { MessageSent } from '../src/Events';
import { Readable } from "stream";

describe('mailer', () => {
    let app: Application;
    let mail: MailManager;
    beforeAll(async () => {
        app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        mail = new MailManager(app);
        app.config.set('mail', {
            default: 'smtp',
            mailers: {
                smtp: {
                    transport: 'smtp'
                },
                custom1: {
                    transport: 'smtp'
                },
                custom2: {
                    transport: 'ses'
                }
            }
        });
    });

    beforeEach(async () => {
        mail.reset();
    })

    it('set the global from address and name.', async () => {
        const mailer: any | Mailer = new Mailer({} as any);
        mailer.alwaysFrom('global@gmail.com');
        expect(mailer._from.address).toBe('global@gmail.com');
        expect(mailer._from.name).toBe(undefined);
        mailer.alwaysFrom('global@gmail.com', 'global');
        expect(mailer._from.address).toBe('global@gmail.com');
        expect(mailer._from.name).toBe('global');
    });

    it('set the global reply to address and name.', async () => {
        const mailer: any | Mailer = new Mailer({} as any);
        mailer.alwaysReplyTo('global@gmail.com');
        expect(mailer._replyTo.address).toBe('global@gmail.com');
        expect(mailer._replyTo.name).toBe(undefined);
        mailer.alwaysReplyTo('global@gmail.com', 'global');
        expect(mailer._replyTo.address).toBe('global@gmail.com');
        expect(mailer._replyTo.name).toBe('global');
    });

    it('Set the global to address and name.', async () => {
        const mailer: any | Mailer = new Mailer({} as any);
        mailer.alwaysTo('global@gmail.com');
        expect(mailer._to.address).toBe('global@gmail.com');
        expect(mailer._to.name).toBe(undefined);
        mailer.alwaysTo('global@gmail.com', 'global');
        expect(mailer._to.address).toBe('global@gmail.com');
        expect(mailer._to.name).toBe('global');
    });

    // it('Set the global return path address.', async () => {
    //     const mailer: any | Mailer = new Mailer({} as any);
    //     mailer.alwaysReturnPath('global@gmail.com');
    //     expect(mailer._returnPath.address).toBe('global@gmail.com');
    // });

    it('Begin the process of mailing a mailable class instance.', async () => {
        const mailer: any | Mailer = new Mailer({} as any);
        const pendding = mailer.to({ name: 'simple', email: 'simple@gmail.com' });
        expect(pendding.$to).toEqual({ name: 'simple', email: 'simple@gmail.com' });

        const pendding1 = mailer.cc({ name: 'simple', email: 'simple@gmail.com' });
        expect(pendding1.$cc).toEqual({ name: 'simple', email: 'simple@gmail.com' });

        const pendding2 = mailer.bcc({ name: 'simple', email: 'simple@gmail.com' });
        expect(pendding2.$bcc).toEqual({ name: 'simple', email: 'simple@gmail.com' });
    });

    it('createMessage', async () => {
        const mailer: any | Mailer = new Mailer({} as any);
        expect(mailer.createMessage()).toBeInstanceOf(Message);
    });

    it('Set the global "to" address on the given message.', async () => {
        const mailer: any | Mailer = new Mailer({} as any);
        const message: any | Message = mailer.createMessage();
        mailer.alwaysTo('address@gmail.com');

        message.to('address1@gmail.com');
        message.cc('address2@gmail.com');
        message.bcc('address3@gmail.com');

        mailer.setGlobalToAndRemoveCcAndBcc(message);
        expect(message.nodeMailerMessage).toEqual({
            to: [{
                address: 'address@gmail.com'
            }]
        })
    });

    it('send simple mail', async () => {
        const messages = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any);

        class Simple extends Mailable {

        }

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({ subject: 'Simple' });
    });

    it('throw TypeError when view is not callback and Mailable', async () => {
        const messages = [];
        const transport = {};
        const mailer: any | Mailer = new Mailer(transport as any);
        try {
            await mailer.send({});
        } catch (e) {

            expect(e.message).toBe('view must be a Funtion or Mailable');
        }
    });

    it('send mail using global default from', async () => {
        const messages = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any);

        class Simple extends Mailable {

        }

        mailer.alwaysFrom('simple@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            from: {
                address: 'simple@gmail.com'
            },
            subject: 'Simple'
        });
    });

    it('send mail using global default from, reply_to', async () => {
        const messages = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any);

        class Simple extends Mailable {

        }

        mailer.alwaysFrom('simple@gmail.com');
        mailer.alwaysReplyTo('simple@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            from: {
                address: 'simple@gmail.com'
            },
            replyTo: [
                {
                    address: 'simple@gmail.com'
                }
            ],
            subject: 'Simple'
        });
    });

    it('send mail using global to', async () => {
        const messages = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any);

        class Simple extends Mailable {

        }

        mailer.alwaysFrom('simple@gmail.com');
        mailer.alwaysTo('simple@gmail.com');

        await mailer
            .to({ email: 'simplenew@gmail.com' })
            .bcc({ email: 'simplenew@gmail.com' })
            .send(new Simple());

        expect(messages[0]).toEqual({
            from: {
                address: 'simple@gmail.com'
            },
            subject: 'Simple',
            'to': [
                {
                    'address': 'simple@gmail.com'
                }
            ]
        });
    });

    it('send event before sending mail and after sent', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

        }

        mailer.alwaysFrom('simple@gmail.com');
        mailer.alwaysTo('simple@gmail.com');

        await mailer
            .to({ email: 'simplenew@gmail.com' })
            .bcc({ email: 'simplenew@gmail.com' })
            .send(new Simple());

        expect(events[0]).toBeInstanceOf(MessageSending);
        expect(events[0].message).toBeInstanceOf(Message);
        expect(events[1]).toBeInstanceOf(MessageSent);
        expect(events[1].message).toBeInstanceOf(Message);
        expect(events[0].message.toJSON()).toEqual(messages[0]);
        expect(events[1].message.toJSON()).toEqual(messages[0]);
    });

    it('send email settings build', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {
            public build() {
                this.from('simple@gmail.com');
                this.to({ email: 'simplenew@gmail.com' })
                    .bcc({ email: 'simplenew@gmail.com' })
                    .text('simple text')
            }
        }

        await mailer.send(new Simple());

        const message = events[0].message.toJSON();
        expect(message.from.address).toBe('simple@gmail.com')
        expect(message.to[0].address).toBe('simplenew@gmail.com')
        expect(message.bcc[0].address).toBe('simplenew@gmail.com')
        expect(message.text).toBe('simple text')
    });

    it('send email when set from address', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

            constructor() {
                super();
                this.from('user@gmail.com');
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({ from: { address: 'user@gmail.com' }, subject: 'Simple' });
    });

    it('send email from raw text as plain body', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

            constructor() {
                super();
            }

            build() {
                this.text('simple text');
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            text: 'simple text',
            from: { address: 'global@gmail.com' },
            subject: 'Simple'
        });
    });

    it('send email from raw text as html', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

            constructor() {
                super();
            }

            build() {
                this.html('<h1>simple text</h1>');
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            html: '<h1>simple text</h1>',
            from: { address: 'global@gmail.com' },
            subject: 'Simple'
        });
    });

    it('parse views for text and watch only', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

            constructor() {
                super();
            }

            build() {
                this.watch('hello');
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            watch: 'hello',
            from: { address: 'global@gmail.com' },
            subject: 'Simple'
        });
    });

    it('send mail when custom subject', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

            constructor() {
                super();
                this.subject('simple-subject')
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({ from: { address: 'global@gmail.com' }, subject: 'simple-subject' });
    });

    it('send message with callback', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        class Simple extends Mailable {

            constructor() {
                super();
                this.withMessage(message => {
                    message.to('address@gmail.com')
                })
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            from: { address: 'global@gmail.com' },
            to: [{ address: 'address@gmail.com' }],
            subject: 'Simple' });
    });

    it('send email from file attactments', async () => {
        const messages = [];
        const events = [];
        const transport = {
            send: (message) => {
                messages.push(message);
            }
        }
        const event = {
            emit: (eventName, data) => {
                events.push(data);
            }
        }
        const mailer: any | Mailer = new Mailer(transport as any, event);

        const content = new Readable();

        class Simple extends Mailable {

            constructor() {
                super();
                this.attach('file.txt');
                this.attachData(content);
            }
        }

        mailer.alwaysFrom('global@gmail.com');

        await mailer.send(new Simple());

        expect(messages[0]).toEqual({
            from: { address: 'global@gmail.com' },
            attachments: [
                {
                    path: "file.txt",
                },
                {
                    content: content
                }
            ],
            subject: 'Simple' });
    });
})
