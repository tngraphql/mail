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

function toNewlineArray (contents: string): string[] {
    return contents.split(/\r?\n/)
}

const fs = new Filesystem(join(__dirname, 'app'));
describe('command', () => {
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
})
