/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/8/2020
 * Time: 6:41 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { BaseCommand, flags } from '@tngraphql/console';
import { Filesystem } from '@poppinss/dev-utils/build';
import { Application } from '@tngraphql/illuminate';
import { KernelContract } from '@tngraphql/console/dist/Contracts';
import * as path from 'path';

export class MailInstallCommand extends BaseCommand {
    static commandName = 'install:mail';

    static description = 'Copy layout mail views file';

    @flags.boolean({ description: 'Install the file even if the file already exists' })
    public force: boolean;

    private fs = new Filesystem(this.app.basePath('resources/views'));

    constructor(protected app: Application, kernel: KernelContract) {
        super(app, kernel);
    }

    async handle(...args: any[]): Promise<any> {
        const files = [
            'button.edge',
            'footer.edge',
            'header.edge',
            'layout.edge',
            'message.edge',
            'order.edge',
            'subcopy.edge'
        ];

        for( let file of files ) {
            const exists = await this.alreadyExists(file);

            if ( exists && ! this['force'] ) {
                this.logger.skip(`${ file } already exists`);
                return false;
            }
        }

        await Promise.all(files.map(fileName => {
            return this.copyfile(fileName);
        }));

        return undefined;
    }

    private async copyfile(name: string) {
        await this.fs.add(name, await this.fs.get(path.join(__dirname, '../resources/views', name)));
        this.logger.create(path.join(this.fs.basePath, name));
    }

    private async alreadyExists(file: string): Promise<boolean> {
        return this.fs.exists(file);
    }
}
