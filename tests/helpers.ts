/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 9:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const nodemailer = require('nodemailer');

type tp = {
    host?: string,
    port?: number,
    secure?: boolean
}

type account = {
    user?: string,
    pass?: string,
    smtp?: tp,
    imap?: tp,
    pop3?: tp,
    web?: tp,
}

export function createTestAccount(): Promise<account> {
    return new Promise((resolve, reject) => {
        nodemailer.createTestAccount((err, account) => {
            if ( err ) {
                reject(err);
            }
            resolve(account);
        })
    });
}

export function config(account: account, defaultMailer: string = 'smtp') {
    return {
        default: defaultMailer,
        mailers: {
            smtp: {
                transport: 'smtp',
                ...account.smtp,
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass  // generated ethereal password
                }
            },
            imap: {
                transport: 'imap',
                ...account.smtp,
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass  // generated ethereal password
                }
            },
            pop3: {
                transport: 'pop3',
                ...account.smtp,
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass  // generated ethereal password
                }
            },
            web: {
                transport: 'web',
                ...account.smtp,
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass  // generated ethereal password
                }
            },
            ethereal: {
                transport: 'ethereal',
                user: account.user, // generated ethereal user
                pass: account.pass  // generated ethereal password
            },
            memory: {
                transport: 'memory'
            }
        },
        from: {
            address: 'sender@example.com',
            name: 'Sender Name'
        }
    }
}
