/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/7/2020
 * Time: 10:22 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { Facade } from '@tngraphql/illuminate/dist/Support/Facade';
import { Mailable, MailFake, MailServiceProvider } from '../src';
import { Mail } from '../src/Mail';
import { Mailer } from '../src/Mail/Mailer';

describe('mail-facade', () => {
    it('should work properly', async () => {
        const app = new Application();
        await (new LoadConfiguration()).bootstrap(app);
        app.config.set('mail', {default: 'smtp', mailers: {smtp: {transport: 'smtp'}}});
        Facade.setFacadeApplication(app);
        await app.register(new MailServiceProvider(app));

        expect(Mail.mailer()).toBeInstanceOf(Mailer);
        expect(() => Mail.hasSent(Mailable)).toThrow();
        expect(Mail.fake()).toBeInstanceOf(MailFake);
        expect(Mail.hasSent(Mailable)).toBe(false);
    });
})
