import { Readable } from 'stream'
import { MessageContract } from '../Contract/MessageContract';
import { AttachmentOptionsNode, EnvolpeNode, MessageNode } from '../Contract/type';
import { RfcComplianceException } from '../Exceptions/RfcComplianceException';

/**
 * Fluent API to construct node mailer message object
 */
export class Message implements MessageContract {
    private nodeMailerMessage: MessageNode = {};
    private emailValidator = require('email-validator');

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
     * Returns address node with correctly formatted way
     */
    private getAddress(address: string, name?: string): { address: string, name?: string } {
        const actualMailboxes = name ? { address, name } : { address };

        this.assertValidAddress(actualMailboxes.address);

        return actualMailboxes;
    }

    /**
     * override address node with correctly formatted way
     *
     * @param address
     * @param name
     * @param type
     */
    private setOverride(address: string, name: string, type: string) {
        if ( ! address && ! name ) {
            delete this.nodeMailerMessage[type];
            return this;
        }

        this.nodeMailerMessage[type] = [this.getAddress(address, name)];
        return this;
    }

    /**
     * Add receipent as `to`
     */
    public to(address: string, name?: string, override: boolean = false): this {
        if ( override ) {
            return this.setOverride(address, name, 'to');
        }
        this.nodeMailerMessage.to = this.nodeMailerMessage.to || [];
        this.nodeMailerMessage.to.push(this.getAddress(address, name))
        return this
    }

    /**
     * Get the To addresses of this message.
     *
     */
    public getTo() {
        return this.nodeMailerMessage.to;
    }

    /**
     * Add `from` name and email
     *
     * @example
     * ```ts
     *  // just email
     * message.from('foo@bar.com')
     *
     *  // name + email
     * message.from('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.from([{ email: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    public from(address: string, name?: string): this {
        this.nodeMailerMessage.from = this.getAddress(address, name)
        return this
    }

    /**
     * Get the from address of this message.
     */
    public getFrom() {
        return this.nodeMailerMessage.from;
    }

    /**
     * Add receipent as `cc`
     */
    public cc(address: string, name?: string, override: boolean = false): this {
        if ( override ) {
            return this.setOverride(address, name, 'cc');
        }
        this.nodeMailerMessage.cc = this.getCc();
        this.nodeMailerMessage.cc.push(this.getAddress(address, name))
        return this
    }

    /**
     * Get the cc addresses of this message
     */
    public getCc() {
        return this.nodeMailerMessage.cc || [];
    }

    /**
     * Add receipent as `bcc`
     */
    public bcc(address: string, name?: string, override: boolean = false): this {
        if ( override ) {
            return this.setOverride(address, name, 'bcc');
        }
        this.nodeMailerMessage.bcc = this.getBcc();
        this.nodeMailerMessage.bcc.push(this.getAddress(address, name))
        return this
    }

    /**
     * Get the bcc addresses of this message
     */
    public getBcc() {
        return this.nodeMailerMessage.bcc || [];
    }

    /**
     * Define custom message id
     */
    public messageId(messageId: string): this {
        this.nodeMailerMessage.messageId = messageId
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
     * Get the subject address of this message
     */
    public getSubject() {
        return this.nodeMailerMessage.subject;
    }

    /**
     * Define replyTo email and name
     *
     * @example
     * ```ts
     *  // just email
     * message.replyTo('foo@bar.com')
     *
     *  // name + email
     * message.replyTo('foo@bar.com', 'Foo')
     *
     * // Address object
     * message.replyTo([{ email: 'foo@bar.com', name: 'Foo' }])
     * ```
     */
    public replyTo(address: string, name?: string): this {
        this.nodeMailerMessage.replyTo = this.nodeMailerMessage.replyTo || [];
        this.nodeMailerMessage.replyTo.push(this.getAddress(address, name));
        return this
    }

    /**
     * Define inReplyTo message id
     * @method inReplyTo
     *
     * @param  {String}  messageId
     *
     * @example
     *
     * ```ts
     * message.inReplyTo('101002001')
     * ```
     */
    public inReplyTo(messageId: string): this {
        this.nodeMailerMessage.inReplyTo = messageId
        return this
    }

    /**
     * Define multiple message id's as references
     *
     * @example
     *
     * ```ts
     * message.references(['101002001'])
     * ```
     */
    public references(messagesIds: string[]): this {
        this.nodeMailerMessage.references = messagesIds
        return this
    }

    /**
     * Optionally define email envolpe
     */
    public envelope(envelope: EnvolpeNode): this {
        this.nodeMailerMessage.envelope = envelope
        return this
    }

    /**
     * Define contents encoding
     */
    public encoding(encoding: string): this {
        this.nodeMailerMessage.encoding = encoding
        return this
    }

    /**
     * Define email prority
     */
    public priority(priority: 'low' | 'normal' | 'high'): this {
        this.nodeMailerMessage.priority = priority
        return this
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
        this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
        this.nodeMailerMessage.attachments.push({
            path: filePath,
            ...options,
        })

        return this
    }

    /**
     * Define attachment from raw data
     */
    public attachData(content: Readable | Buffer, options?: AttachmentOptionsNode): this {
        this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
        this.nodeMailerMessage.attachments.push({
            content,
            ...options,
        })

        return this
    }

    /**
     * Embed attachment inside content using `cid`
     */
    public embed(filePath: string, cid: string, options?: AttachmentOptionsNode): this {
        this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
        this.nodeMailerMessage.attachments.push({
            path: filePath,
            cid,
            ...options,
        })

        return this
    }

    /**
     * Embed attachment from raw data inside content using `cid`
     */
    public embedData(content: Readable | Buffer, cid: string, options?: AttachmentOptionsNode): this {
        this.nodeMailerMessage.attachments = this.nodeMailerMessage.attachments || []
        this.nodeMailerMessage.attachments.push({
            content,
            cid,
            ...options,
        })

        return this
    }

    /**
     * Define custom headers for email
     */
    public header(key: string, value: string | string[]): this {
        this.nodeMailerMessage.headers = this.nodeMailerMessage.headers || []
        this.nodeMailerMessage.headers.push({ [key]: value })

        return this
    }

    /**
     * Define custom prepared headers for email
     */
    public preparedHeader(key: string, value: string | string[]): this {
        this.nodeMailerMessage.headers = this.nodeMailerMessage.headers || []
        this.nodeMailerMessage.headers.push({ [key]: { prepared: true, value } })

        return this
    }

    /**
     * Get message JSON. The packet can be sent over to nodemailer
     */
    public toJSON(): MessageNode {
        return Object.assign(this.content, this.nodeMailerMessage)
    }

    /**
     * Throws an Exception if the address passed does not comply with RFC 2822
     *
     * @param address
     */
    private assertValidAddress(address: string) {
        if ( ! this.emailValidator.validate(address) ) {
            throw new RfcComplianceException(`Address in mailbox given [${ address }] does not comply with RFC 2822.`);
        }
    }
}
