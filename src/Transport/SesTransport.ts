import { MailTransportContract } from '../Contract/type';

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/1/2020
 * Time: 8:48 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const nodemailer = require('nodemailer');

export class SesTransport implements MailTransportContract{
    private transporter: any

    constructor(config: any) {
        // configure AWS SDK
        this.transporter = nodemailer.createTransport({
            SES: new (require('aws-sdk')).SES(config)
        })
    }

    /**
     * Close transporter connection, helpful when using connections pool
     */
    public async close() {
        await this.transporter.close()
        this.transporter = null
    }

    send(message: any, config?: any): Promise<any> {
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

}
