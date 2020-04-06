import { SmtpMailResponse } from './SmtpTransport';

const nodemailer = require('nodemailer');

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 9:28 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class EtherealTransport {
    private transporter: any;
    protected log: any;

    constructor(config: any) {
        this.setConfig(config);
    }

    /**
     * This method is called by mail manager automatically
     * and passes the config object
     *
     * @method setConfig
     *
     * @param  {Object}  config
     */
    setConfig(config) {
        if ( config.user && config.pass ) {
            this.setTransporter(config.user, config.pass)
        } else {
            this.transporter = null
        }

        this.log = typeof (config.log) === 'function' ? config.log : function(messageUrl) {
            console.log(messageUrl)
        }
    }

    /**
     * Initiate transporter
     *
     * @method setTransporter
     *
     * @param  {String}       user
     * @param  {String}       pass
     */
    setTransporter(user, pass) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user, pass }
        })
    }

    /**
     * Creates a new transporter on fly
     *
     * @method createTransporter
     *
     * @return {String}
     */
    createTransporter() {
        return new Promise((resolve, reject) => {
            nodemailer.createTestAccount((error, account) => {
                if ( error ) {
                    reject(error)
                    return
                }
                this.setTransporter(account.user, account.pass)
                resolve()
            })
        })
    }

    /**
     * Sends email
     *
     * @method sendEmail
     *
     * @param  {Object}  message
     *
     * @return {Object}
     */
    sendEmail(message) {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(message, (error, result) => {
                if ( error ) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })
    }

    /**
     * Send message
     */
    public async send(message: any): Promise<SmtpMailResponse> {
        if ( ! this.transporter ) {
            await this.createTransporter()
        }

        const mail: any = await this.sendEmail(message);

        this.log(nodemailer.getTestMessageUrl(mail));

        return mail;
    }

    /**
     * Close transporter connection, helpful when using connections pool
     */
    public async close() {
        await this.transporter.close()
        this.transporter = null
    }
}
