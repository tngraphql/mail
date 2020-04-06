import { SmtpMailResponse } from './SmtpTransport';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 8:27 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

export class MailgunTransport {
    private transporter: any

    constructor(config: any) {
        this.transporter = nodemailer.createTransport(mg(config));
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
