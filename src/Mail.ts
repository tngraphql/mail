/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/7/2020
 * Time: 6:26 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Facade } from '@tngraphql/illuminate/dist/Support/Facade';
import { MailFake } from './Fake';
import { MailFakeContract } from './Contract/MailFakeContract';

interface MailFacade extends MailFakeContract {
    fake(): MailFake;
}

export const Mail = Facade.create<MailFacade>('mail.manager', {
    fake: function() {
        const fake = new MailFake()
        this.swap('mail.manager', fake);
        return fake;
    }
});
