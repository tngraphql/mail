/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 4/2/2020
 * Time: 8:35 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { MailManager } from '../src/Mail/MailManager';
import { Mailer } from '../src/Mail/Mailer';
import { SmtpTransport } from '../src/Transport/SmtpTransport';
import { SesTransport } from '../src/Transport/SesTransport';
import { Mailable } from '../src/Mail/Mailable';
import { PendingMail } from '../src/Mail/PendingMail';
import { EtherealTransport } from '../src/Transport/EtherealTransport';
import { MemoryTransport } from '../src/Transport/MemoryTransport';
import { MailgunTransport } from '../src/Transport/MailgunTransport';

describe('mail-manager', () => {
    let app: Application;
    let mail: MailManager|any;
    beforeAll(async () => {
        app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        mail = new MailManager(app);
        app.config.set('mail', {
            default: 'smtp',
            mailers: {
                smtp: {
                    transport: 'smtp'
                },
                custom1: {
                    transport: 'smtp'
                },
                custom2: {
                    transport: 'ses'
                },
                custom3: {
                    transport: 'customTransport'
                }
            },
            from: {
                address: 'simple@gmail.com'
            }
        });
    });

    beforeEach(async () => {
        mail.reset();
        app.config.set('mail', {
            default: 'smtp',
            mailers: {
                smtp: {
                    transport: 'smtp'
                },
                custom1: {
                    transport: 'smtp'
                },
                custom2: {
                    transport: 'ses'
                },
                custom3: {
                    transport: 'customTransport'
                }
            },
            from: {
                address: 'simple@gmail.com'
            }
        });
    })

    it('should get driver default', async () => {
        expect(mail.getDefaultDriver()).toBe('smtp');
        expect(mail.mailer()).toBeInstanceOf(Mailer);
        expect(mail.driver()).toBeInstanceOf(Mailer);
        expect(Object.keys((mail as any)._mailers)).toHaveLength(1);
    });

    it('should get driver a choose', async () => {
        expect(mail.mailer('custom1')).toBeInstanceOf(Mailer);
        expect(mail.driver('custom1')).toBeInstanceOf(Mailer);
        expect(Object.keys((mail as any)._mailers)).toHaveLength(1);
        expect((mail as any)._mailers['custom1']).toBeInstanceOf(Mailer);
    });

    it('should create smtp transport', async () => {
        const config = mail.getConfig('smtp');
        expect(mail.createTransport(config)).toBeInstanceOf(SmtpTransport);
    });

    it('should create ses transport', async () => {
        const config = mail.getConfig('custom2');
        expect(mail.createTransport(config)).toBeInstanceOf(SesTransport);
    });

    it('throw exception when unable to find mail', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        const mail = new MailManager(app);
        app.config.set('mail', {
            mailers: {
                smtp: {
                    transport: 'smtp'
                }
            }
        });


        expect(() => mail.mailer()).toThrow('Make sure to define default inside config/mail.ts file');
    });

    it('throw exception when unable to find mailer', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        const mail = new MailManager(app);
        app.config.set('mail', {
            default: 'smtp'
        });

        expect(() => mail.mailer()).toThrow('Mailer [smtp] is not defined.');
    });

    it('throw exception when mailers[name].transport is not defined', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        const mail = new MailManager(app);
        app.config.set('mail', {
            default: 'smtp',
            mailers: {
                smtp: {
                }
            }
        });
        expect(() => mail.mailer()).toThrow('transport is not defined, mailers[name].transport');
    });

    it('throw exception when Unsupported mail transport', async () => {
        const app = new Application(__dirname);
        await (new LoadConfiguration()).bootstrap(app);
        const mail = new MailManager(app);
        app.config.set('mail', {
            default: 'smtp',
            mailers: {
                smtp: {
                    transport: 'smtp2'
                }
            }
        });
        expect(() => mail.mailer()).toThrow(`Unsupported mail transport [smtp2].`);
    });

    it('custom transport', async () => {
        mail.extend('customTransport', config => {
            return {
                custom: true,
                send: function(view) {
                    return view;
                }
            }
        });
        const transport: any = mail.createTransport({ transport: 'customTransport' });

        expect(transport.custom).toBe(true);
        expect(mail.mailer('custom3')).toBeInstanceOf(Mailer)
    });

    it('send simple mail', async () => {
        const messages = [];

        mail.extend('customTransport', config => {
            return {
                custom: true,
                send: function(view) {
                    messages.push(view);
                    return view;
                }
            }
        });

        app.config.set('mail.mailers.customTransport', {
            transport: 'customTransport'
        });
        app.config.set('mail.default', 'customTransport');

        class Simple extends Mailable {

        }

        await mail.send(new Simple());

        expect(messages[0]).toEqual({
            from: { address: 'simple@gmail.com' }, subject: 'Simple'
        });
    });

    it('send simple mail when select mailer', async () => {
        const messages = [];

        mail.extend('customTransport', config => {
            return {
                custom: true,
                send: function(view) {
                    messages.push(view);
                    return view;
                }
            }
        });

        app.config.set('mail.mailers.customTransport', {
            transport: 'customTransport'
        });

        class Simple extends Mailable {

        }

        await mail.mailer('customTransport').send(new Simple());

        expect(messages[0]).toEqual({
            from: { address: 'simple@gmail.com' }, subject: 'Simple'
        });
    });

    it('Begin the process of mailing a mailable class instance.', async () => {
        const messages = [];

        mail.extend('customTransport', config => {
            return {
                custom: true,
                send: function(view) {
                    messages.push(view);
                    return view;
                }
            }
        });

        app.config.set('mail.mailers.customTransport', {
            transport: 'customTransport'
        });
        app.config.set('mail.default', 'customTransport');

        const mailer1: any = await mail.to({ name: 'asfsf', email: 'abc@gmail.com' });
        const mailer2: any = await mail.bcc({ name: 'asfsf', email: 'abc@gmail.com' });
        const mailer3: any = await mail.cc({ name: 'asfsf', email: 'abc@gmail.com' });
        expect(mailer1).toBeInstanceOf(PendingMail);
        expect(mailer2).toBeInstanceOf(PendingMail);
        expect(mailer3).toBeInstanceOf(PendingMail);
        expect(mailer1.$to).toEqual({ name: 'asfsf', email: 'abc@gmail.com' });
        expect(mailer2.$bcc).toEqual({ name: 'asfsf', email: 'abc@gmail.com' });
        expect(mailer3.$cc).toEqual({ name: 'asfsf', email: 'abc@gmail.com' });
    });

    it('should create ethereal transport instance', async () => {
        expect(mail.createEtherealTransport({})).toBeInstanceOf(EtherealTransport);
    });

    it('should create memory transport instace', async () => {
        expect(mail.createMemoryTransport({})).toBeInstanceOf(MemoryTransport);
    });

    it('should create mailgun transport instance', async () => {
        expect(mail.createMailgunTransport({auth: {api_key: '123123'}})).toBeInstanceOf(MailgunTransport);
    });

    it('Closes a the mapping instance and removes it from the cache', async () => {
        await mail.mailer();
        expect(mail._mailers['smtp']).toBeInstanceOf(Mailer);
        await mail.close('smtp');
        expect(mail._mailers['smtp']).toBeUndefined();
    });

    it('Closes default the mapping instance and removes it from the cache', async () => {
        await mail.mailer();
        expect(mail._mailers['smtp']).toBeInstanceOf(Mailer);
        await mail.close();
        expect(mail._mailers['smtp']).toBeUndefined();
    });

    it('should remove cache mailer', async () => {
        await mail.mailer();
        expect(mail._mailers['smtp']).toBeInstanceOf(Mailer);
        await mail.release('smtp');
        expect(mail._mailers['smtp']).toBeUndefined();
    });

    it('Closes all the mapping instance and removes it from the cache', async () => {
        await mail.mailer();
        await mail.mailer('custom1');
        await mail.mailer('custom2');
        expect(Object.keys(mail._mailers).length).toBe(3);
        await mail.closeAll();
        expect(Object.keys(mail._mailers).length).toBe(0);
    });
})
