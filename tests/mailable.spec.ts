/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 4:07 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Mailable } from '../src/Mail/Mailable';
import { Readable } from 'stream';
import * as path from 'path';
import { join } from 'path';
import { Filesystem } from '@poppinss/dev-utils/build';
import { Application } from '@tngraphql/illuminate';

describe('mailable', () => {

    it('Add receipent as `to`', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.to('user@gmail.com', 'user');

        expect(mailable.nodeMailerMessage.to).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            }
        ]);
    });

    it('add receipent as `to` using object user', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.to({
            email: 'user@gmail.com',
            name: 'user'
        });

        expect(mailable.nodeMailerMessage.to).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            }
        ]);
    });

    it('add receipent as `to` using multiple object user', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.to([
            {
                email: 'user@gmail.com',
                name: 'user'
            },
            {
                email: 'user2@gmail.com',
                name: 'user'
            },

        ]);

        expect(mailable.nodeMailerMessage.to).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            },
            {
                address: 'user2@gmail.com',
                name: 'user'
            }
        ])
    });

    it('add receipent as `to` using multiple address', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.to([
            'user@gmail.com',
            'user2@gmail.com'
        ]);

        expect(mailable.nodeMailerMessage.to).toEqual([
            {
                address: 'user@gmail.com',
                name: null
            },
            {
                address: 'user2@gmail.com',
                name: null
            }
        ])
    });

    it('Add `from` name and email', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.from('user@gmail.com', 'user');

        expect(mailable.nodeMailerMessage.from).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            }
        ]);
    });

    it('Add receipent as `cc`', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.cc('user@gmail.com', 'user');

        expect(mailable.nodeMailerMessage.cc).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            }
        ]);
    });

    it('Add receipent as `bcc`', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.bcc('user@gmail.com', 'user');

        expect(mailable.nodeMailerMessage.bcc).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            }
        ]);
    });

    it('Define subject', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.subject('subject name');

        expect(mailable.nodeMailerMessage.subject).toBe('subject name');

    });

    it('Define replyTo email and name', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.replyTo('user@gmail.com', 'user');

        expect(mailable.nodeMailerMessage.replyTo).toEqual([
            {
                address: 'user@gmail.com',
                name: 'user'
            }
        ]);
    });

    it('Define email prority', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.priority('high');

        const priorities = [];

        mailable._callbacks[0]({
            priority: (priority) => {
                priorities.push(priority);
            }
        });

        expect(priorities[0]).toBe('high');
    });

    it('Compute email html from raw text', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.html('<h1>hello</h1>');

        expect(mailable.content.html).toBe('<h1>hello</h1>');
    });

    it('Compute email text from raw text', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.text('hello');

        expect(mailable.content.text).toBe('hello');
    });

    it('Compute email watch html from raw text', async () => {
        const mailable: any | Mailable = new Mailable();

        mailable.watch('hello');

        expect(mailable.content.watch).toBe('hello');
    });

    it('Define one or attachments', async () => {
        expect.assertions(3);

        const mailable: any | Mailable = new Mailable();

        mailable.attach('hello.js');

        expect(mailable.attachments).toEqual([
            { path: 'hello.js' }
        ]);
        mailable.attachments = [];

        mailable.attach('hello.js', {
            filename: 'test'
        })

        expect(mailable.attachments).toEqual([
            { path: 'hello.js', filename: 'test' }
        ]);

        mailable.attach('goodbye.js');

        expect(mailable.attachments).toEqual([
            { path: 'hello.js', filename: 'test' },
            { path: 'goodbye.js' }
        ]);
    });

    it('Define attachment from raw data', async () => {
        expect.assertions(3);

        const mailable: any | Mailable = new Mailable();
        const content = new Readable();
        const buffer = Buffer.from('12312');

        mailable.attachData(content);

        expect(mailable.rawAttachments).toEqual([
            { content }
        ]);
        mailable.rawAttachments = [];

        mailable.attachData(buffer, {
            filename: 'test'
        })

        expect(mailable.rawAttachments).toEqual([
            { content: buffer, filename: 'test' }
        ]);

        mailable.attachData(content);

        expect(mailable.rawAttachments).toEqual([
            { content: buffer, filename: 'test' },
            { content }
        ]);
    });

    describe('render template', () => {
        const fs = new Filesystem(join(__dirname, 'app'));

        beforeEach(async () => {
            await fs.add('views/message.edge', `<h1>hello {{ user }}</h1>`);
        });

        afterEach(async () => {
            await fs.cleanup()
        })

        it('Compute email html from defined view', async () => {
            const app = new Application(fs.basePath);
            app.singleton('view', () => {
                const edge = require('edge.js')
                edge.registerViews(path.join(fs.basePath, 'views'));
                return edge;
            });

            const mailable: any | Mailable = new Mailable();

            mailable.htmlView('message', { user: 'nguyenpl' });

            expect(mailable.content.html).toBe('<h1>hello nguyenpl</h1>\n')
        });

        it('Compute email html from defined view using inject view', async () => {
            const app = new Application(fs.basePath);

            app.singleton('view', () => {
                const edge = require('edge.js')
                edge.registerViews(path.join(fs.basePath, 'views'));
                return edge;
            });

            const mailable: any | Mailable = new Mailable();

            mailable.htmlView('message', { user: 'nguyenpl' });
            mailable._view = app.use('view');

            expect(mailable.content.html).toBe('<h1>hello nguyenpl</h1>\n')
        });

        it('Compute apple watch html from defined view', async () => {
            const app = new Application(fs.basePath);
            app.singleton('view', () => {
                const edge = require('edge.js')
                edge.registerViews(path.join(fs.basePath, 'views'));
                return edge;
            });

            const mailable: any | Mailable = new Mailable();

            mailable.watchView('message', { user: 'nguyenpl' });

            expect(mailable.content.watch).toBe('<h1>hello nguyenpl</h1>\n')
        });

    });
})
