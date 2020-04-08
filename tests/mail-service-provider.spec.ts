/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/7/2020
 * Time: 12:27 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, ConsoleKernel, LoadConfiguration } from '@tngraphql/illuminate';
import { MailServiceProvider } from '../src';
import { MailManager } from '../src/Mail/MailManager';
import { Filesystem } from '@poppinss/dev-utils/build';
import { join } from "path";

const fs = new Filesystem(join(__dirname, 'app'));

describe('mail-service-provider', () => {

    it('should register mail.manager', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration().bootstrap(app));
        await app.register(new MailServiceProvider(app));
        expect(app['mail.manager']).toBeInstanceOf(MailManager);
    });

    it('should register command', async () => {
        const app = new Application(fs.basePath);
        app.environment = 'test';
        await app.register(new MailServiceProvider(app));
        const kernel = new ConsoleKernel(app);

        await kernel.call('install:mail', []);
        await kernel.call('make:mail', ['name']);
        await fs.cleanup();
    });
})
