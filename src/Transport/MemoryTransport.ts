/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 6:33 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const nodemailer = require('nodemailer');

/**
 * Memory driver is used to get the message back as
 * an object over sending it to a real user.
 *
 */
export class MemoryTransport {
    private transporter: any;

    constructor(config: any) {
        this.setConfig();
    }

    /**
     * This method is called by mail manager automatically
     * and passes the config object
     *
     * @method setConfig
     */
    setConfig() {
        this.transporter = nodemailer.createTransport({
            jsonTransport: true
        })
    }

    /**
     * Send a message via message object
     *
     * @method send
     * @async
     *
     * @param  {Object} message
     *
     * @return {Object}
     *
     * @throws {Error} If promise rejects
     */
    send<T = any>(message): Promise<T> {
        if ( ! this.transporter ) {
            throw new Error('Driver transport has been closed and cannot be used for sending emails')
        }

        return new Promise((resolve, reject) => {
            this.transporter.sendMail(message, (error, result) => {
                result.message = JSON.parse(result.message)
                resolve(result);
            })
        })
    }

    /**
     * Close transporter connection, helpful when using connections pool
     */
    public async close() {
        await this.transporter.close()
        this.transporter = null
    }
}
