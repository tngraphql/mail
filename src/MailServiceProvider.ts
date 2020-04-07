/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 9:50 AM
 */
import { Service, ServiceProvider } from '@tngraphql/illuminate';

@Service()
export class MailServiceProvider extends ServiceProvider {
    register(): void {
        this.app.singleton('mail.manager', () => {
            const { MailManager } = require('./Mail/MailManager');

            this.app.config.defaults('mail', {});

            return new MailManager(this.app);
        })
    }
}
