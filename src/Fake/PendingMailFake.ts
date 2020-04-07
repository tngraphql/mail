/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 9:25 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { PendingMail } from '../Mail/PendingMail';
import { MailableContract } from '../Contract/MailableContract';
import { MailerContract } from '../Contract/MailerContract';

export class PendingMailFake extends PendingMail {
    constructor(protected mailer: MailerContract) {
        super(mailer);
    }

    send(mailable: MailableContract): Promise<any> {
        return this.mailer.send(this.fill(mailable));
    }
}
