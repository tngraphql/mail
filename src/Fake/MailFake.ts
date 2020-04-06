/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 9:25 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class MailFake {
    protected _currentMailer;
    protected _mailables = [];

    mailer(name?: string) {
        this._currentMailer = name;
        return this;
    }

    send(view) {

        this._mailables.push(view);
    }
}
