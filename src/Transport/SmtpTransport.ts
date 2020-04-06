/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/1/2020
 * Time: 7:46 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const nodemailer = require('nodemailer');
import { MailTransportContract } from '../Contract/type';

/**
 * Shape of mail response for the smtp driver
 */
export type SmtpMailResponse = {
    response: string
    accepted: string[]
    rejected: string[]
    envelope: {
        from: string,
        to: string[],
        cc?: string[],
        bcc?: string[],
    }
    messageId: string,
}

export class SmtpTransport implements MailTransportContract {
    private transporter: any

    constructor(config: any) {
        this.transporter = nodemailer.createTransport(config)
    }

    /**
     * Send message
     */
    public async send(message: any): Promise<SmtpMailResponse> {
        if ( ! this.transporter ) {
            throw new Error('Driver transport has been closed and cannot be used for sending emails')
        }

        return new Promise((resolve, reject) => {
            this.transporter.sendMail(message, (error, result) => {
                if ( error ) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        });
    }

    /**
     * Close transporter connection, helpful when using connections pool
     */
    public async close() {
        await this.transporter.close()
        this.transporter = null
    }
}
