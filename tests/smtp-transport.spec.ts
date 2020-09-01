/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 8:39 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { MailManager } from '../src/Mail/MailManager';
import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { Mailable } from '../src/Mail/Mailable';
import { config, createTestAccount } from './helpers';
import { SmtpTransport } from '../src/Transport/SmtpTransport';
import {Filesystem} from "@poppinss/dev-utils/build";
import {join} from "path";

const nodemailer = require('nodemailer');

const fs = new Filesystem(join(__dirname, 'app'));
describe('smtp-transport', () => {
    let account;
    let app;

    beforeAll(async () => {
        jest.setTimeout(20000);
        account = await createTestAccount();
        app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
    })

    it('send simple email', async () => {
        app.config.set('mail', config(account, 'smtp'));
        const mail = new MailManager(app);

        class Simple extends Mailable {

            constructor() {
                super();
                this.text('hello to myself');
                this.subject('Simple email');
            }
        }

        const info: any = await mail.to('recipient@example.com').send(new Simple());
        console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
    });

    it('send plain mail', async () => {
        app.config.set('mail', config(account, 'smtp'));
        const mail = new MailManager(app);

        class Simple extends Mailable {

            constructor() {
                super();
                this.html('<h1>hello</h1>');
                this.subject('plain email');
            }
        }

        const info: any = await mail.to('recipient@example.com').send(new Simple());
        console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
    });

    it('send html mail', async () => {
        app.config.set('mail', config(account, 'smtp'));
        await fs.add('views/message.edge', `<h1>hello {{ user }}</h1>`);
        app.singleton('view', () => {
            const edge = require('edge.js')
            edge.registerViews(join(fs.basePath, 'views'));
            return {
                render: async (template, data) => {
                    return edge.render(template, data)
                }
            };
        });

        const mail = new MailManager(app);

        class Simple extends Mailable {

            constructor() {
                super();
                this.htmlView('message', {});
                this.subject('plain email');
            }
        }

        const info: any = await mail.to('recipient@example.com').send(new Simple());
        console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));

        await fs.cleanup();
    });

    it('throw errors if unable to send email', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        app.config.set('mail', config(account, 'smtp'));
        const mail = new MailManager(app);

        class Simple extends Mailable {

            constructor() {
                super();
                this.html('<h1>hello</h1>');
                this.subject('plain email');
            }
        }

        try {
            await mail.send(new Simple());
        } catch (e) {
            expect(e.message).toBe('No recipients defined');
        }
    });

    it('should throw error when transport is closed', async () => {
        const smtp = new SmtpTransport({});
        await smtp.close();
        try {
            await smtp.send('message');
        }catch (e) {
            expect(e.message).toBe('Driver transport has been closed and cannot be used for sending emails')
        }
    });
})
