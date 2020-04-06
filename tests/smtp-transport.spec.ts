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

const nodemailer = require('nodemailer');

describe('smtp-transport', () => {
    let account;
    beforeAll(async () => {
        jest.setTimeout(20000);
        account = await createTestAccount();
    })

    it('send simple email', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
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

        const info: any = await mail.to('recipient@example.com').send(new Simple());
        console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
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
})
