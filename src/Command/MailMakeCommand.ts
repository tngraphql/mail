/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/1/2020
 * Time: 10:03 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { GeneratorCommand } from '@tngraphql/illuminate/dist/Foundation';
import * as path from "path";

export class MailMakeCommand extends GeneratorCommand {
    protected getStub(): string {
        return path.join(__dirname, 'stub/mail.stub');
    }

    protected getSuffix(): string {
        return '';
    }

    static commandName = 'make:mail';

    static description = 'Create a new email class';

    handle(...args: any[]): Promise<any> {
        return super.handle(...args);
    }

    getDestinationPath() {
        return path.join(this.application.getBasePath(), 'app/Mail');
    }

}
