/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 9:33 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { MailManager } from '../src/Mail/MailManager';
import { Mailable } from '../src/Mail/Mailable';
import { config, createTestAccount } from './helpers';
import { EtherealTransport } from '../src/Transport/EtherealTransport';
import { Message } from '../src/Message';

describe('Ethereal Transport', () => {
    let account;
    beforeAll(async () => {
        jest.setTimeout(20000);
        account = await createTestAccount();
    })

    it('send simple mail', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        app.config.set('mail', config(account, 'ethereal'));
        const mail = new MailManager(app);

        class Simple extends Mailable {

            constructor() {
                super();
                this.text('hello to myself');
                this.subject('Simple email');
            }
        }

        await mail.to('recipient@example.com').send(new Simple());
    });

    it('create test account and send email', async () => {
        let messageUrl = null;

        const ethereal = new EtherealTransport({
            log (url) {
                messageUrl = url
            }
        });
        const message = new Message();
        message.from('sender@example.com', 'Sender name');
        message.to('recipient@example.com');
        await ethereal.send(message.toJSON());

        expect(messageUrl).toBeDefined();
    });
});
