/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 9:50 AM
 */
import { ServiceProvider } from '@tngraphql/illuminate';

class MailServiceProvider extends ServiceProvider {
    register(): void {
        this.app.singleton('mail.manager', () => {
            const { MailManager } = require('./Mail/MailManager');

            this.app.config.set('mail', {});

            return new MailManager(this.app);
        })
    }
}
