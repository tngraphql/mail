/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 2:38 PM
 */
import { Readable } from 'stream'
import { AttachmentOptionsNode, MailAddressType, OneOrMany } from '../Contract/type';
import { Mailer } from './Mailer';
import { Message } from '../Message';
import { MailableContract } from '../Contract/MailableContract';
import _ = require('lodash');

export class Mailable implements MailableContract {
    private nodeMailerMessage: any = {}
    private _view: any;

    private attachments;
    private rawAttachments;
    private _callbacks = [];

    constructor() {
    }

    /**
     * Explicit content set on the message object. This will get
     * preference over views
     */
    private content: {
        html?: string,
        text?: string,
        watch?: string,
    } = {}

    /**
     * Set the recipients of the message.
     *
     * All recipients are stored internally as [['name' => ?, 'address' => ?]]
     *
     * @param address
     * @param name
     * @param property
     */
    public setAddress(address: OneOrMany<MailAddressType>, name?, property = 'to'): void {
        for( let recipient of this.addressesToArray(address, name) ) {
            recipient = this.normalizeRecipient(recipient);

            this.nodeMailerMessage[property].push({
                name: recipient.name || null,
                address: recipient.email
            });
        }
    }

    /**
     * Convert the given recipient arguments to an array.
     *
     * @param address
     * @param name
     */
    protected addressesToArray(address, name?) {
        if ( ! Array.isArray(address) ) {
            address = _.isString(name) ? [{ name, email: address }] : [address];
        }

        return address;
    }

    /**
     * Convert the given recipient into an object.
     *
     * @param recipient
     */
    protected normalizeRecipient(recipient): { name?: string, email: string } {
        if ( _.isString(recipient) ) {
            return { email: recipient };
        }

        return recipient;
    }

    /**
     * Add receipent as `to`
     */
    public to(address: OneOrMany<MailAddressType>, name?: string): this {
        this.nodeMailerMessage.to = this.nodeMailerMessage.to || []
        this.setAddress(address, name, 'to');
        return this
    }

    /**
     * Add `from` name and email
     */
    public from(address: OneOrMany<MailAddressType>, name?: string): this {
        this.nodeMailerMessage.from = this.nodeMailerMessage.from || [];
        this.setAddress(address, name, 'from');
        return this
    }

    /**
     * Add receipent as `cc`
     */
    public cc(address: OneOrMany<MailAddressType>, name?: string): this {
        this.nodeMailerMessage.cc = this.nodeMailerMessage.cc || [];
        this.setAddress(address, name, 'cc');
        return this
    }

    /**
     * Add receipent as `bcc`
     */
    public bcc(address: OneOrMany<MailAddressType>, name?: string): this {
        this.nodeMailerMessage.bcc = this.nodeMailerMessage.bcc || [];
        this.setAddress(address, name, 'bcc');
        return this
    }

    /**
     * Define subject
     */
    public subject(message: string): this {
        this.nodeMailerMessage.subject = message
        return this
    }

    /**
     * Define replyTo email and name
     */
    public replyTo(address: OneOrMany<MailAddressType>, name?: string): this {
        this.nodeMailerMessage.replyTo = this.nodeMailerMessage.replyTo || [];
        this.setAddress(address, name, 'replyTo');
        return this
    }

    /**
     * Define email prority
     */
    public priority(priority: 'low' | 'normal' | 'high'): this {
        this._callbacks.push((message: Message) => {
            message.priority(priority);
        });

        return this
    }

    /**
     * Compute email html from defined view
     */
    public htmlView(template: string, data?: any): this {
        this.content.html = this.render(template, data)
        return this
    }

    /**
     * Compute apple watch html from defined view
     */
    public watchView(template: string, data?: any): this {
        this.content.watch = this.render(template, data)
        return this
    }

    protected render(template: string, data?: any) {
        if ( ! this._view ) {
            const { Application } = require('@tngraphql/illuminate');
            this._view = Application.getInstance().use('view');
        }

        return this._view.render(template, data);
    }

    /**
     * Compute email html from raw text
     */
    public html(content: string): this {
        this.content.html = content
        return this
    }

    /**
     * Compute email text from raw text
     */
    public text(content: string): this {
        this.content.text = content
        return this
    }

    /**
     * Compute email watch html from raw text
     */
    public watch(content: string): this {
        this.content.watch = content
        return this
    }

    /**
     * Define one or attachments
     */
    public attach(filePath: string, options?: AttachmentOptionsNode): this {
        this.attachments = this.attachments || [];
        this.attachments.push({
            path: filePath,
            ...options,
        })

        return this
    }

    /**
     * Define attachment from raw data
     */
    public attachData(content: Readable | Buffer, options?: AttachmentOptionsNode): this {
        this.rawAttachments = this.rawAttachments || [];
        this.rawAttachments.push({
            content,
            ...options,
        })

        return this
    }

    /**
     * Send the message using the given mailer.
     *
     * @param mailer
     */
    public send<T = any>(mailer: Mailer): Promise<T> {
        return mailer.send((message: Message) => {
            this.buildFrom(message)
                .buildRecipients(message)
                .buildSubject(message)
                .buildSubject(message)
                .runCallbacks(message)
                .buildContent(message)
                .buildAttachments(message);
        });
    }

    /**
     * Set the body for the message.
     *
     * @param message
     */
    public buildContent(message: Message): this {
        if ( typeof this['build'] === 'function' ) {
            this['build']();
        }

        if ( this.content.html ) {
            message.html(this.content.html);
        }
        if ( this.content.text ) {
            message.text(this.content.text);
        }
        if ( this.content.watch ) {
            message.watch(this.content.watch);
        }
        return this;
    }

    /**
     * Add the sender to the message.
     *
     * @param message
     */
    public buildFrom(message: Message): this {
        if ( this.nodeMailerMessage.from ) {
            const from = this.nodeMailerMessage.from;

            message.from(from[0].address, from[0].name);
        }

        return this;
    }

    /**
     * Add all of the recipients to the message.
     *
     * @param message
     */
    public buildRecipients(message: Message): this {
        for( const type of ['to', 'cc', 'bcc', 'replyTo'] ) {
            if ( this.nodeMailerMessage[type] )
                for( const recipient of this.nodeMailerMessage[type] ) {
                    message[type](recipient.address, recipient.name);
                }
        }
        return this;
    }

    /**
     * Set the subject for the message.
     *
     * @param message
     */
    public buildSubject(message: Message): this {
        if ( this.nodeMailerMessage.subject ) {
            message.subject(this.nodeMailerMessage.subject);
        } else {
            message.subject(this.constructor.name);
        }
        return this;
    }

    /**
     * Run the callbacks for the message.
     *
     * @param message
     */
    public runCallbacks(message: Message): this {
        for( let callback of this._callbacks ) {
            callback(message);
        }
        return this;
    }

    /**
     * Add all of the attachments to the message.
     *
     * @param message
     */
    public buildAttachments(message: Message): this {
        if ( this.attachments ) {
            for( let attach of this.attachments ) {
                message.attach(attach.path, attach);
            }
        }
        if ( this.rawAttachments ) {
            for( let attach of this.rawAttachments ) {
                message.attachData(attach.content, attach);
            }
        }

        return this;
    }

    /**
     * Register a callback to be called with the message instance.
     *
     * @param callback
     */
    public withMessage(callback: (message: Message) => void) {
        this._callbacks.push(callback);
        return this;
    }
}
