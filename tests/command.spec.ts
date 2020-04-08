/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/6/2020
 * Time: 7:30 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, ConsoleKernel } from '@tngraphql/illuminate';
import { MailMakeCommand } from '../src/Command/MailMakeCommand';
import { join } from "path";
import { Filesystem } from '@poppinss/dev-utils/build';
import * as path from 'path';
import { MailInstallCommand } from '../src/Command/MailInstallCommand';

function toNewlineArray (contents: string): string[] {
    return contents.split(/\r?\n/)
}

const fs = new Filesystem(join(__dirname, 'app'));
describe('Command', () => {
    describe('Make | Mail', () => {
        afterEach(async () => {
            await fs.cleanup();
        });

        it('should create file mail.', async () => {
            const app = new Application(fs.basePath);
            app.environment = 'test';
            const kernel = new ConsoleKernel(app);
            const makeCommand = new MailMakeCommand(app, kernel.getAce());
            makeCommand.name = 'OrderCreate';

            await makeCommand.handle();

            expect(makeCommand.logger.logs[0].startsWith('underline(green(create))')).toBeTruthy();

            const schemaTemplate = await fs.get((makeCommand as any).getStub());
            const file = await fs.get(join(makeCommand.getDestinationPath(), 'OrderCreate.ts'));
            expect((makeCommand as any).getSuffix()).toBe('');

            expect(toNewlineArray(file)).toEqual(toNewlineArray(
                schemaTemplate
                    .replace('${filename}', 'OrderCreate')
                    .replace('${filename}', 'OrderCreate'),
            ));

            expect(file).toMatchSnapshot();
        });

        it('should skip when file exists', async () => {
            const app = new Application(fs.basePath);
            app.environment = 'test';
            const kernel = new ConsoleKernel(app);
            const makeCommand = new MailMakeCommand(app, kernel.getAce());
            makeCommand.name = 'OrderCreate';

            await makeCommand.handle();
            await makeCommand.handle();

            expect(makeCommand.logger.logs[1].startsWith('underline(magenta(skip))')).toBeTruthy();
        });

        it('should create file class email when file exists using force', async () => {
            const app = new Application(fs.basePath);
            app.environment = 'test';
            const kernel = new ConsoleKernel(app);
            const makeCommand = new MailMakeCommand(app, kernel.getAce());
            makeCommand.name = 'OrderCreate';

            await makeCommand.handle();

            const reMakeCommand = new MailMakeCommand(app, kernel.getAce());
            reMakeCommand.name = 'OrderCreate';
            reMakeCommand.force = true;
            await reMakeCommand.handle();

            expect(reMakeCommand.logger.logs[0].startsWith('underline(green(create))')).toBeTruthy();
        });
    });

    describe('Install | Mail', () => {
        afterEach(async () => {
            await fs.cleanup();
        });

        it('should install views mail', async () => {
            const app = new Application(fs.basePath);
            app.environment = 'test';
            const kernel = new ConsoleKernel(app);
            const install = new MailInstallCommand(app, kernel.getAce());

            await install.handle();

            expect(await fs.get('resources/views/button.edge')).toMatchSnapshot();
            expect(await fs.get('resources/views/footer.edge')).toMatchSnapshot();
            expect(await fs.get('resources/views/header.edge')).toMatchSnapshot();
            expect(await fs.get('resources/views/layout.edge')).toMatchSnapshot();
            expect(await fs.get('resources/views/message.edge')).toMatchSnapshot();
            expect(await fs.get('resources/views/order.edge')).toMatchSnapshot();
            expect(await fs.get('resources/views/subcopy.edge')).toMatchSnapshot();
        });

        it('should skip when file exists', async () => {
            const app = new Application(fs.basePath);
            app.environment = 'test';
            const kernel = new ConsoleKernel(app);
            const install = new MailInstallCommand(app, kernel.getAce());

            await install.handle();

            const reinstall = new MailInstallCommand(app, kernel.getAce());

            await reinstall.handle();
            expect(reinstall.logger.logs).toHaveLength(1);
            expect(reinstall.logger.logs[0].startsWith('underline(magenta(skip))')).toBeTruthy();
        });

        it('should install views mail when file exists using force', async () => {
            const app = new Application(fs.basePath);
            app.environment = 'test';
            const kernel = new ConsoleKernel(app);
            const install = new MailInstallCommand(app, kernel.getAce());

            await install.handle();

            const reinstall = new MailInstallCommand(app, kernel.getAce());
            reinstall.force=true;

            await reinstall.handle();
            expect(reinstall.logger.logs).toHaveLength(7);
            expect(reinstall.logger.logs[0].startsWith('underline(green(create))')).toBeTruthy();
        });
    });
})
