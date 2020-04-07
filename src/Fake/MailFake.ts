import { PendingMailFake } from './PendingMailFake';
import { MailerContract } from '../Contract/MailerContract';
import { Mailable } from '..';
import { MailFakeContract } from '../Contract/MailFakeContract';
import { MailableContract } from '../Contract/MailableContract';

const assert = require('assert');

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 9:25 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

function assertMailableType(mailable) {
    if ( typeof mailable !== 'function' ) {
        throw new TypeError('mailable must be a function');
    }
}

export class MailFake implements MailerContract, MailFakeContract {

    /**
     * All of the mailables that have been sent.
     */
    protected _mailables: MailableContract[] = [];

    public mailer(name?: string) {
        return this;
    }

    public async send<T = any>(view: MailableContract): Promise<T> {
        if ( ! (view instanceof Mailable) ) {
            return;
        }

        this._mailables.push(view);
        return;
    }

    public to(users) {
        return this.createPenddingMail().to(users);
    }

    public cc(users) {
        return this.createPenddingMail().cc(users);
    }

    public bcc(users) {
        return this.createPenddingMail().bcc(users);
    }

    /**
     * Determine if the given mailable has been sent.
     *
     * @param mailable
     */
    public hasSent(mailable: Function): boolean {
        assertMailableType(mailable);

        return this.mailablesOf(mailable).length > 0;
    }

    /**
     * Get all of the mailables matching a truth-test callback.
     *
     * @param mailable
     * @param callback
     */
    public sent(mailable: Function, callback?: (mailable: MailableContract) => boolean): MailableContract[] {
        assertMailableType(mailable);

        if ( ! this.hasSent(mailable) ) {
            return [];
        }

        callback = callback ? callback : () => true;

        return this.mailablesOf(mailable).filter(mailable => callback(mailable));
    }

    /**
     * Assert if a mailable was sent based on a truth-test callback.
     *
     * @param mailable
     * @param callback
     */
    public assertSent(mailable: Function, callback?: ((mailable: MailableContract) => boolean) | number): void {
        assertMailableType(mailable);

        if ( typeof callback === 'number' ) {
            return this.assertSentTimes(mailable, callback);
        }

        const message = `The expected [${ mailable.name }] mailable was not sent.`;

        new assert(this.sent(mailable, callback as any).length > 0, message);
    }

    /**
     * Determine if a mailable was not sent based on a truth-test callback.
     *
     * @param mailable
     * @param callback
     */
    public assertNotSent(mailable: Function, callback?): void {
        assertMailableType(mailable);

        new assert(
            this.sent(mailable, callback).length === 0,
            `The unexpected [${ mailable.name }] mailable was sent.`
        );
    }

    /**
     * Assert that no mailables were sent.
     *
     */
    public assertNothingSent(): void {
        const mailableNames = this._mailables.map(mailable => mailable.constructor.name).join(', ');

        new assert(this._mailables.length === 0, `The following mailables were sent unexpectedly: ${mailableNames}`)
    }

    protected createPenddingMail() {
        return new PendingMailFake(this);
    }

    /**
     * Get all of the mailed mailables for a given type.
     *
     * @param type
     */
    protected mailablesOf(type: Function): MailableContract[] {
        assertMailableType(type);

        return this._mailables.filter(mailable => mailable instanceof type);
    }

    /**
     * Assert if a mailable was sent a number of times.
     *
     * @param mailable
     * @param times
     */
    protected assertSentTimes(mailable: Function, times: number = 1): void {
        assertMailableType(mailable);

        const count = this.sent(mailable).length;
        new assert(count === times, `The expected [${ mailable.name }] mailable was sent ${ count } times instead of {$times} times.`)
    }
}
