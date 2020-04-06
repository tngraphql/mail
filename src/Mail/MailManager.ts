/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 9:50 AM
 */
import { Manager } from '@tngraphql/illuminate/dist/Support/Manager';
import { InvalidArgumentException } from '@tngraphql/illuminate';
import { Mailer } from './Mailer';
import { Mailable } from './Mailable';
import _ = require('lodash');
import { MailTransportContract } from '../Contract/type';

export class MailManager extends Manager {
    protected config: any;

    protected _mailers: any = {};

    /**
     * reset mail drivers
     */
    public reset(): void {
        this._mailers = {};
        this._customCreators = {};
        this._drivers = new Map<any, any>();
    }

    /**
     * Get a mailer instance by name.
     *
     * @param name
     */
    public mailer(name: string = null): Mailer {
        name = name || this.getDefaultDriver();

        if ( ! name ) {
            throw new InvalidArgumentException(`Make sure to define default inside config/mail.ts file`);
        }

        return this._mailers[name] = this.get(name);
    }

    /**
     * Get a mailer driver instance.
     *
     * @param name
     */
    public driver(name: string = null): Mailer {
        return this.mailer(name);
    }

    /**
     * Get the default mail driver name.
     *
     */
    public getDefaultDriver(): string {
        return this.config.get('mail.default', null);
    }

    /**
     * Attempt to get the mailer from the local cache.
     *
     * @param name
     */
    protected get(name: string): Mailer {
        if ( this._mailers[name] ) {
            return this._mailers[name];
        }

        return this.resolve(name);
    }

    /**
     * Resolve the given mailer.
     *
     * @param name
     */
    protected resolve(name: string): Mailer {
        const config = this.getConfig(name);

        if ( ! config ) {
            throw new InvalidArgumentException(`Mailer [${ name }] is not defined.`)
        }

        const mailer = new Mailer(
            this.createNodemailer(config),
            this.app['events']
        );

        // Next we will set all of the global addresses on this mailer, which allows
        // for easy unification of all "from" addresses as well as easy debugging
        // of sent messages since these will be sent to a single email address.
        // Chúng tôi thiết lập tất cả địa chỉ toàn cầu trên hộp thư này.
        // Cho phép thống nhất tất cả địa chỉ "from" cũng như dễ gỡ lỗi các thư đã gửi
        // vì chúng sẽ được gửi tới một địa chỉ email duy nhất.
        for( let type of ['from', 'reply_to', 'to'] ) {
            this.setGlobalAddress(mailer, config, type);
        }

        return mailer;
    }

    public getConfig(name: string): string | null {
        return this.config.get(`mail.mailers.${ name }`, null);
    }

    /**
     * craete a new nodemailer
     *
     * @param config
     */
    protected createNodemailer(config: any): MailTransportContract {
        return this.createTransport(config);
    }

    /**
     * set global address to mailer
     *
     * @param mailer
     * @param config
     * @param type
     */
    setGlobalAddress(mailer: Mailer, config, type): void {
        const address = _.get(config, type, this.config.get(`mail.${ type }`));

        if ( address && Object.keys(address).length ) {
            mailer[`always${ _.upperFirst(_.camelCase(type)) }`](address.address, address.name);
        }
    }

    /**
     * Create a new transport instance.
     *
     * @param config
     */
    public createTransport(config): MailTransportContract {
        const transport = config.transport;

        if ( ! transport ) {
            throw new InvalidArgumentException(`transport is not defined, mailers[name].transport`);
        }

        if ( this._customCreators[transport] ) {
            return this._customCreators[transport](config);
        }

        const method = `create${ _.upperFirst(transport) }Transport`;
        if ( typeof this[method] !== 'function' ) {
            throw new InvalidArgumentException(`Unsupported mail transport [${ transport }].`);
        }

        return this[method](config);
    }

    /**
     * Create smtp transport instance
     *
     * @param config
     */
    protected createSmtpTransport(config): MailTransportContract {
        const { SmtpTransport } = require('../Transport/SmtpTransport');

        return new SmtpTransport(config);
    }

    /**
     * Create ses transport instance
     *
     * @param config
     */
    protected createSesTransport(config): MailTransportContract {
        const { SesTransport } = require('../Transport/SesTransport');

        return new SesTransport(config);
    }

    /**
     * Create ethereal transport instance
     *
     * @param config
     */
    protected createEtherealTransport(config) {
        const { EtherealTransport } = require('../Transport/EtherealTransport');

        return new EtherealTransport(config);
    }

    /**
     * Create memory transport instance
     * @param config
     */
    protected createMemoryTransport(config) {
        const { MemoryTransport } = require('../Transport/MemoryTransport');

        return new MemoryTransport(config);
    }

    /**
     * Create mailgun transport instance
     *
     * @param config
     */
    protected createMailgunTransport(config) {
        const { MailgunTransport } = require('../Transport/MailgunTransport');

        return new MailgunTransport(config);
    }

    public to(users) {
        return this.mailer().to(users);
    }

    public cc(users) {
        return this.mailer().cc(users);
    }

    public bcc(users) {
        return this.mailer().bcc(users);
    }

    public send(mailable: Mailable | any) {
        return this.mailer().send(mailable);
    }
}
