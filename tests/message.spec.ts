/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 7:53 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Message } from '../src/Message';
import { Readable } from 'stream';

describe('message', () => {

    it('Add receipent as `to`', async () => {
        const message: Message | any = new Message();
        message.to('simple@gmail.com');
        message.to('simple2@gmail.com', 'simple');
        expect(message.nodeMailerMessage.to).toEqual([
            {
                address: 'simple@gmail.com'
            },
            {
                address: 'simple2@gmail.com',
                name: 'simple'
            }
        ]);
        message.to('simple@gmail.com', null, true);
        expect(message.nodeMailerMessage.to).toEqual([
            {
                address: 'simple@gmail.com'
            }
        ]);
    });

    it('Add `from` name and email', async () => {
        const message: Message | any = new Message();
        message.from('simple@gmail.com');

        expect(message.nodeMailerMessage.from).toEqual({ address: 'simple@gmail.com' });
        message.from('simple@gmail.com', 'simple');
        expect(message.nodeMailerMessage.from).toEqual({ address: 'simple@gmail.com', name: 'simple' });
    });

    it('Add receipent as `cc`', async () => {
        const message: Message | any = new Message();
        message.cc('simple@gmail.com');
        message.cc('simple2@gmail.com', 'simple');
        expect(message.nodeMailerMessage.cc).toEqual([
            {
                address: 'simple@gmail.com'
            },
            {
                address: 'simple2@gmail.com',
                name: 'simple'
            }
        ]);
        message.cc('simple@gmail.com', null, true);
        expect(message.nodeMailerMessage.cc).toEqual([
            {
                address: 'simple@gmail.com'
            }
        ]);
    });

    it('Add receipent as `bcc`', async () => {
        const message: Message | any = new Message();
        message.bcc('simple@gmail.com');
        message.bcc('simple2@gmail.com', 'simple');
        expect(message.nodeMailerMessage.bcc).toEqual([
            {
                address: 'simple@gmail.com'
            },
            {
                address: 'simple2@gmail.com',
                name: 'simple'
            }
        ]);
        message.bcc('simple@gmail.com', null, true);
        expect(message.nodeMailerMessage.bcc).toEqual([
            {
                address: 'simple@gmail.com'
            }
        ]);
    });

    it('Define custom message id', async () => {
        const message: Message | any = new Message();
        message.messageId('simpleid');
        expect(message.nodeMailerMessage.messageId).toBe('simpleid');
    });

    it('Define subject', async () => {
        const message: Message | any = new Message();
        message.subject('subject');
        expect(message.nodeMailerMessage.subject).toBe('subject');
    });

    it('Define replyTo email and name', async () => {
        const message: Message | any = new Message();
        message.replyTo('simple@gmail.com');
        message.replyTo('simple2@gmail.com', 'simple');
        expect(message.nodeMailerMessage.replyTo).toEqual([
            {
                address: 'simple@gmail.com'
            },
            {
                address: 'simple2@gmail.com',
                name: 'simple'
            }
        ]);
    });

    it('Define inReplyTo message id', async () => {
        const message: Message | any = new Message();
        message.inReplyTo('101002001');
        expect(message.nodeMailerMessage.inReplyTo).toBe('101002001');
    });

    it('Define multiple message id\'s as references', async () => {
        const message: Message | any = new Message();
        message.references(['101002001']);
        expect(message.nodeMailerMessage.references).toEqual(['101002001']);
    });

    it('Optionally define email envolpe', async () => {
        const message: Message | any = new Message();
        message.envelope({
            from: 'sapmle@gmail.com'
        });
        expect(message.nodeMailerMessage.envelope).toEqual({
            from: 'sapmle@gmail.com'
        });
    });

    it('Define contents encoding', async () => {
        const message: Message | any = new Message();
        message.encoding('coding');
        expect(message.nodeMailerMessage.encoding).toBe('coding');
    });

    it('Define email prority', async () => {
        const message: Message | any = new Message();
        message.priority('high');
        expect(message.nodeMailerMessage.priority).toBe('high');
    });

    it('Compute email html from raw text', async () => {
        const message: Message | any = new Message();
        message.html('<h1>hello</h1>');
        expect(message.content.html).toBe('<h1>hello</h1>');
    });

    it('Compute email text from raw text', async () => {
        const message: Message | any = new Message();
        message.text('hello');
        expect(message.content.text).toBe('hello');
    });

    it('Compute email watch html from raw text', async () => {
        const message: Message | any = new Message();
        message.watch('hello');
        expect(message.content.watch).toBe('hello');
    });

    it('Define one or attachments', async () => {
        const message: Message | any = new Message();
        message.attach('hello.txt');
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                path: 'hello.txt'
            }
        ]);
        message.attach('hello.txt');
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                path: 'hello.txt'
            },
            {
                path: 'hello.txt'
            }
        ]);
    });

    it('Define attachment from raw data', async () => {
        const message: Message | any = new Message();
        const content = new Readable();
        const buffer = Buffer.from('hello');

        message.attachData(content);
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                content
            }
        ]);
        message.attachData(buffer);
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                content
            },
            {
                content: buffer
            }
        ]);
    });

    it('Embed attachment inside content using `cid`', async () => {
        const message: Message | any = new Message();
        message.embed('hello.txt', '1');
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                path: 'hello.txt',
                cid: '1'
            }
        ]);
        message.embed('hello.txt', '2');
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                path: 'hello.txt',
                cid: '1'
            },
            {
                path: 'hello.txt',
                cid: '2'
            }
        ]);
    });

    it('Embed attachment from raw data inside content using `cid`', async () => {
        const message: Message | any = new Message();
        const content = new Readable();
        const buffer = Buffer.from('hello');

        message.embedData(content, '1');
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                content,
                cid: '1'
            }
        ]);
        message.embedData(buffer, '1');
        expect(message.nodeMailerMessage.attachments).toEqual([
            {
                content,
                cid: '1'
            },
            {
                content: buffer,
                cid: '1'
            }
        ]);
    });

    it('Define custom headers for email', async () => {
        const message: Message | any = new Message();
        message.header('hello', 'users');
        expect(message.nodeMailerMessage.headers).toEqual([{ 'hello': 'users' }]);
        message.header('hi', ['jack', 'bông']);
        expect(message.nodeMailerMessage.headers).toEqual([
            { 'hello': 'users' },
            { 'hi': ['jack', 'bông'] }
        ]);
    });

    it('Define custom prepared headers for email', async () => {
        const message: Message | any = new Message();
        message.preparedHeader('hello', 'users');
        expect(message.nodeMailerMessage.headers).toEqual([{ 'hello': {prepared: true, value: 'users'} }]);
        message.preparedHeader('hi', ['jack', 'bông']);
        expect(message.nodeMailerMessage.headers).toEqual([
            { 'hello': {prepared: true, value: 'users'} },
            { 'hi': {prepared: true, value: ['jack', 'bông']} }
        ]);
    });

    it('Get message JSON. The packet can be sent over to nodemailer', async () => {
        const message: Message | any = new Message();
        message.to('simple@gmail.com');
        message.text('hello');
        expect(message.toJSON()).toEqual({
            to: [
                {
                    address: 'simple@gmail.com'
                }
            ],
            text: 'hello'
        })
    });
})
