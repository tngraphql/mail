/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/1/2020
 * Time: 8:36 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
interface IAddress {
    email: string;
    name?: string;
}

type AddressType = IAddress & string;

export interface MailableContract {
    /**
     * Send the message using the given mailer.
     *
     * @return void
     */
    send(mailer);

    /**
     * Set the recipients of the message.
     *
     * @return this
     */
    cc(address: AddressType, name?: string | null);

    /**
     * Set the recipients of the message.
     *
     * @return this
     */
    bcc(address: AddressType, name?: string | null);

    /**
     * Set the recipients of the message.
     *
     * @return this
     */
    to(address: AddressType, name?: string | null);

    /**
     * Set the name of the mailer that should be used to send the message.
     *
     * @return this
     */
    // mailer(mailer: string);
}
