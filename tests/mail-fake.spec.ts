/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/7/2020
 * Time: 12:49 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '@tngraphql/illuminate';
import { MailFake } from '../src/Fake';
import { Mailable } from '../src';
import { MailFakeContract } from '../src/Contract/MailFakeContract';

describe('mail-fake', () => {
    it('sent plain mail', async () => {
        const app = new Application();
        const mail: any | MailFakeContract = new MailFake();
        const mailable = new Mailable();
        mailable.from('asjgns@gmail.com')
                .text('plain mail');

        class Foo extends Mailable {

        }

        mail.assertNothingSent();

        mail.to('mail@gmail.com').send(mailable);

        expect(mail.hasSent(Mailable)).toBe(true);
        expect(mail.hasSent(Foo)).toBe(false);
        expect(mail.sent(Mailable)).toEqual([mailable]);
        expect(mail.sent(Foo)).toEqual([]);

        expect(() => mail.assertNothingSent()).toThrow();

        expect(mail.hasSent(Mailable)).toBe(true);

        expect(() => mail.hasSent('Foo')).toThrow('mailable must be a function');
    });

    it('Assert if a mailable was sent based on a truth-test callback.', async () => {
        const app = new Application();
        const mail: any | MailFakeContract = new MailFake();

        class PlainMail extends Mailable {
            constructor() {
                super();
                this.to('plain@gmail.com');
            }
        }

        mail.assertNothingSent();

        await mail.send(new PlainMail());

        expect(() => mail.assertSent(PlainMail, 1)).not.toThrow();
        expect(() => mail.assertSentTimes(PlainMail, 1)).not.toThrow();
        expect(() => mail.assertSentTimes(PlainMail)).not.toThrow();
        expect(() => mail.assertSent(PlainMail, 2))
            .toThrow(`The expected [${ PlainMail.name }] mailable was sent 1 times instead of {$times} times.`);
        expect(() => mail.assertSent(PlainMail)).not.toThrow();
        expect(() => mail.assertSent(PlainMail, () => false))
            .toThrow(`The expected [${ PlainMail.name }] mailable was not sent.`);
    });

    it('Determine if a mailable was not sent based on a truth-test callback.', async () => {
        const app = new Application();
        const mail: any | MailFakeContract = new MailFake();

        class PlainMail extends Mailable {
            constructor() {
                super();
                this.to('plain@gmail.com');
            }
        }

        expect(() => mail.assertNotSent(PlainMail)).not.toThrow();

        await mail.send(new PlainMail());

        expect(() => mail.assertNotSent(PlainMail))
            .toThrow(`The unexpected [${ PlainMail.name }] mailable was sent.`);

    });

    it('should not send when mailable not instanceof Mailable', async () => {
        const app = new Application();
        const mail: any | MailFakeContract = new MailFake();

        class Plain {

        }

        await mail.send(new Plain());

        expect(mail.hasSent(Plain)).toBe(false);
    });

    it('should sent email when cc, bcc', async () => {
        const app = new Application();
        const mail: any | MailFakeContract = new MailFake();

        class PlainCC extends Mailable {

        }
        class PlainBCC extends Mailable {

        }

        mail.cc({ email: 'plain@gmail.com' }).send(new PlainCC());
        mail.bcc({ email: 'plain@gmail.com' }).send(new PlainBCC());
        expect(mail.hasSent(PlainCC)).toBe(true);
        expect(mail.hasSent(PlainBCC)).toBe(true);
    });

    it('using mailer should return MailFake', async () => {
        const app = new Application();
        const mail: any | MailFakeContract = new MailFake();

        expect(await mail.mailer()).toBeInstanceOf(MailFake);
    });
})
