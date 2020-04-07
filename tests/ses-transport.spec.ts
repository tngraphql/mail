/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/3/2020
 * Time: 7:13 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SesTransport } from '../src/Transport/SesTransport';
import { Message } from '../src/Message';
import { MemoryTransport } from '../src/Transport/MemoryTransport';
require('dotenv').config();

describe('ses-transport', () => {
    it('send plain email', async () => {
        const ses = new SesTransport({
            apiVersion: '2010-12-01',
            accessKeyId: process.env.SES_KEY,
            secretAccessKey: process.env.SES_SECRET,
            region: 'us-west-2'
        })

        const message = new Message();
        message.from(process.env.SMTP_FROM_EMAIL, 'Sender name');
        message.to(process.env.SMTP_TO_EMAIL)
               .html('<h2> Hello </h2>')
               .subject('Plain email');

        const response = await ses.send(message.toJSON());

        expect(response.messageId).toBeDefined();
    }, 80000);

    it('throw errors if unable to send email', async () => {
        const ses = new SesTransport({
            apiVersion: '2010-12-01',
            accessKeyId: process.env.SES_KEY,
            secretAccessKey: process.env.SES_SECRET,
            region: 'us-west-2'
        })

        const message = new Message();
        message
               .html('<h2> Hello </h2>')
               .subject('Plain email');

        try {
            await ses.send(message.toJSON());
        } catch (e) {
            expect(e.message).toBe('Expected params.Source to be a string');
        }

    });

    it('should throw error when transport is closed', async () => {
        const mem: SesTransport|any = new SesTransport({});
        await mem.close();

        try {
            await mem.send(undefined)
        } catch (e) {
            expect(e.message).toBe('Driver transport has been closed and cannot be used for sending emails');
        }
    });
});
