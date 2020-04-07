/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 6:36 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MemoryTransport } from '../src/Transport/MemoryTransport';
import { Message } from '../src/Message';
import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { config } from './helpers';
import { MailManager } from '../src/Mail/MailManager';
import { Mailable } from '../src/Mail/Mailable';

describe('memory-transport', () => {

    it('new setup driver', async () => {
        const mem: any = new MemoryTransport({});
        expect(mem).toBeInstanceOf(MemoryTransport);
        expect(mem.transporter).toBeDefined();
    });

    it('send plain email', async () => {
        const mem = new MemoryTransport({});
        const message = new Message();
        message.from('sender@example.com', 'Sender name');
        message.to('recipient@example.com');
        message.html('<h2> Hello </h2>')
               .subject('Plain email');

        const info: any = await mem.send(message.toJSON());

        expect(info.messageId).toBeDefined();
        expect(info.message.from.address).toBe(message.getFrom().address);
        expect(info.message.to).toEqual(message.getTo());
        expect(info.message.subject).toBe(message.getSubject());
    });

    it('send simple email', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        app.config.set('mail', config({}, 'memory'));
        const mail = new MailManager(app);

        class Simple extends Mailable {

            constructor() {
                super();
                this.text('hello to myself');
                this.subject('Simple email');
            }
        }

        const messages = [];
        app.singleton('events', () =>({
            emit: function(name, message) {
                messages.push(message);
            }
        }))

        const info = await mail.to('recipient@example.com').send(new Simple());

        expect(mail.mailer().transport).toBeInstanceOf(MemoryTransport);
        expect(info.messageId).toBeDefined();
        expect(info.message.from.address).toBe('sender@example.com');
        expect(messages[0].message.nodeMailerMessage.from.address).toBe('sender@example.com');
        expect(messages[0].message.nodeMailerMessage.to[0].address).toEqual('recipient@example.com');
        expect(messages[0].message.nodeMailerMessage.subject).toBe('Simple email');
    });

    it('should throw error when transport is closed', async () => {
        const mem: MemoryTransport|any = new MemoryTransport({});
        await mem.close();

        try {
            await mem.send(undefined)
        } catch (e) {
            expect(e.message).toBe('Driver transport has been closed and cannot be used for sending emails');
        }

    });
})
