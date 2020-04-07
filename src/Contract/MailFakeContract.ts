import { MailableContract } from './MailableContract';
import { MailerContract } from './MailerContract';
import { MailFake } from '../Fake';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/7/2020
 * Time: 6:31 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface MailFakeContract extends MailerContract {
    mailer(name?: string): this;

    send<T = any>(view: MailableContract): Promise<T>;

    /**
     * Determine if the given mailable has been sent.
     *
     * @param mailable
     */
    hasSent(mailable: Function): boolean;

    /**
     * Get all of the mailables matching a truth-test callback.
     *
     * @param mailable
     * @param callback
     */
    sent(mailable: Function, callback?: (mailable: MailableContract) => boolean): MailableContract[];

    /**
     * Assert if a mailable was sent based on a truth-test callback.
     *
     * @param mailable
     * @param callback
     */
    assertSent(mailable: Function, callback?: ((mailable: MailableContract) => boolean) | number): void;

    /**
     * Determine if a mailable was not sent based on a truth-test callback.
     *
     * @param mailable
     * @param callback
     */
    assertNotSent(mailable: Function, callback?): void;

    /**
     * Assert that no mailables were sent.
     *
     */
    assertNothingSent(): void
}
