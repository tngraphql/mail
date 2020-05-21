/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 2:38 PM
 */
import { MailableContract } from '../Contract/MailableContract';
import { MailerContract } from '../Contract/MailerContract';

export class PendingMail {
    /**
     * The "to" recipients of the message.
     *
     * @var array
     */
    protected $to = [];

    /**
     * The "cc" recipients of the message.
     *
     * @var array
     */
    protected $cc = [];

    /**
     * The "bcc" recipients of the message.
     *
     * @var array
     */
    protected $bcc = [];

    constructor(protected mailer: MailerContract) {
    }

    public to(users): this {
        this.$to = users;
        return this;
    }

    public cc(users): this {
        this.$cc = users;
        return this;
    }

    public bcc(users): this {
        this.$bcc = users;
        return this;
    }

    public send<T = any>(mailable: MailableContract): Promise<T> {
        return this.mailer.send<T>(this.fill(mailable));
    }

    public fill(mailable: any): MailableContract {
        return mailable.to(this.$to)
            .cc(this.$cc)
            .bcc(this.$bcc)
    }
}
