/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 9:51 AM
 */
import { PendingMail } from './PendingMail';
import { Mailable } from './Mailable';
import { Message } from '../Message';
import { MailTransportContract } from '../Contract/type';
import { MailableContract } from '../Contract/MailableContract';
import { event } from '@tngraphql/illuminate/dist/Support/helpers';
import { MessageSending } from '../Events/MessageSending';
import { MessageSent } from '../Events/MessageSent';
import { MailerContract } from '../Contract/MailerContract';

type AddressContact = {
    address?: string;
    name?: string;
}

export class Mailer implements MailerContract {
    protected _from: AddressContact = {};
    protected _to: AddressContact = {};
    protected _returnPath: AddressContact = {};
    protected _replyTo: AddressContact = {};

    constructor(public transport: MailTransportContract, public events?) {
    }

    /**
     * Set the global from address and name.
     *
     * @param address
     * @param name
     */
    public alwaysFrom(address: string, name?: string) {
        this._from = { address, name };
    }

    /**
     * Set the global reply to address and name.
     *
     * @param address
     * @param name
     */
    public alwaysReplyTo(address: string, name?: string) {
        this._replyTo = { address, name };
    }

    /**
     * Set the global to address and name.
     *
     * @param address
     * @param name
     */
    public alwaysTo(address: string, name?: string) {
        this._to = { address, name };
    }

    /**
     * Set the global return path address.
     *
     * @param address
     * @param name
     */
    // public alwaysReturnPath(address: string) {
    //     this._returnPath = { address };
    // }

    /**
     * Begin the process of mailing a mailable class instance.
     *
     * @param users
     */
    public to(users) {
        return this.createPenddingMail().to(users);
    }

    /**
     * Begin the process of mailing a mailable class instance.
     *
     * @param users
     */
    public cc(users) {
        return this.createPenddingMail().cc(users);
    }

    /**
     * Begin the process of mailing a mailable class instance.
     *
     * @param users
     */
    public bcc(users) {
        return this.createPenddingMail().bcc(users);
    }

    protected createPenddingMail() {
        return new PendingMail(this);
    }

    /**
     * Create a new message instance.
     */
    protected createMessage(): Message {
        const message = new Message();

        // If a global from address has been specified we will set it on every message
        // instance so the developer does not have to repeat themselves every time
        // they create a new message. We'll just go ahead and push this address.
        if ( this._from && this._from.address ) {
            message.from(this._from.address, this._from.name);
        }

        // When a global reply address was specified we will set this on every message
        // instance so the developer does not have to repeat themselves every time
        // they create a new message. We will just go ahead and push this address.
        if ( this._replyTo && this._replyTo.address ) {
            message.replyTo(this._replyTo.address, this._replyTo.name);
        }

        return message;
    }

    public async send<T = any>(view: MailableContract | ((message: Message) => any)): Promise<T> {
        if ( view instanceof Mailable ) {
            return view.send(this);
        }

        if ( typeof view !== 'function' ) {
            throw new TypeError('view must be a Funtion or Mailable');
        }

        const message = this.createMessage();

        const callback: (message: any) => any = view as any;

        callback && callback(message);

        // Nếu "to" được đặt mặc định. Chúng tôi sẽ đặt địa chỉ đó trên thư.
        // Điều này sẽ hữu ích trong quá trình phát triển, trong đó muỗi thư
        // sẽ được gửi tới địa chỉ duy nhất để kiểm tra
        if ( this._to && this._to.address ) {
            this.setGlobalToAndRemoveCcAndBcc(message);
        }

        await this.shouldSendMessage(message)
        const res = await this.transport.send(message.toJSON());
        this.dispatchSentEvent(message);

        return res;
    }

    /**
     * Determines if the message can be sent.
     *
     * @param message
     */
    protected async shouldSendMessage(message): Promise<boolean> {
        if ( ! this.events ) {
            return true;
        }
        await event(new MessageSending(message), this.events);
        return true;
    }

    /**
     * Dispatch the message sent event.
     */
    protected dispatchSentEvent(message) {
        if ( this.events ) {
            event(new MessageSent(message), this.events);
        }
    }

    /**
     * Set the global "to" address on the given message.
     *
     * @param message
     */
    protected setGlobalToAndRemoveCcAndBcc(message): void {
        message.to(this._to.address, this._to.name, true);
        message.cc(null, null, true);
        message.bcc(null, null, true);
    }

    public close() {
        return this.transport.close();
    }
}
