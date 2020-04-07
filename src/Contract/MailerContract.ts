/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/7/2020
 * Time: 12:43 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface MailerContract {
    send<T = any>(view: any): Promise<T>;

    to(users)

    cc(users)

    bcc(users)
}
