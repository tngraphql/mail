/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/1/2020
 * Time: 10:03 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { BaseCommand } from '@tngraphql/console';

export class MailMakeCommand extends BaseCommand {
    static commandName = 'make:mail';

    static description = 'Create a new email class';

    handle(...args: any[]): Promise<any> {
        return undefined;
    }

}
