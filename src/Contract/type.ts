/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 10:05 AM
 */

import {Readable} from "stream";
/**
 * Attachment options
 */
export type AttachmentOptionsNode = {
    filename?: string,
    href?: string,
    httpHeaders?: { [key: string]: any },
    contentType?: string,
    contentDisposition?: string,
    encoding?: string,
    headers?: { [key: string]: any },
}

/**
 * Shape of envolpe
 */
export type EnvolpeNode = { from?: string, to?: string, cc?: string, bcc?: string }


/**
 * Message node is compatible with nodemailer `sendMail` method
 */
export type MessageNode = {
    from?: { address: string, name?: string },
    to?: { address: string, name?: string }[],
    cc?: { address: string, name?: string }[],
    bcc?: { address: string, name?: string }[],
    messageId?: string,
    subject?: string,
    replyTo?: { address: string, name?: string }[],
    inReplyTo?: string,
    references?: string[],
    encoding?: string,
    priority?: 'low' | 'normal' | 'high',
    envelope?: EnvolpeNode,
    attachments?: (AttachmentOptionsNode & { path?: string, cid?: string, content?: Buffer | Readable })[],
    headers?: ({
        [key: string]: string | string[],
    } | {
        [key: string]: { prepared: true, value: string | string[] },
    })[],
    html?: string,
    watch?: string,
    text?: string,
}

/**
 * Shape of the driver contract. Each driver must adhere to
 * this interface
 */
export interface MailTransportContract {
    send (message: MessageNode, config?: any): Promise<any>
    close (): void | Promise<void>
}

export type OneOrMany<T> = T | T[];

export type MailAddressType = string | {
    email: string;
    name?: string;
}
