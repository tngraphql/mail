/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 10:03 AM
 */

import {Readable} from "stream";
import {AttachmentOptionsNode, EnvolpeNode, MessageNode} from "./type";

/**
 * Shape of the message instance passed to `send` method callback
 */
export interface MessageContract {
    /**
     * Common fields
     */
    to (address: string| any, name?: string): this
    from (address: string, name?: string): this
    cc (address: string|any, name?: string): this
    bcc (address: string|any, name?: string): this
    messageId (messageId: string): this
    subject (message: string): this

    /**
     * Routing options
     */
    replyTo (address: string, name?: string): this
    inReplyTo (messageId: string): this
    references (messagesIds: string[]): this
    envelope (envelope: EnvolpeNode): this
    priority (priority: 'low' | 'normal' | 'high'): this

    /**
     * Content options
     */
    encoding (encoding: string): this
    html (content: string): this
    text (content: string): this
    watch (content: string): this

    /**
     * Attachments
     */
    attach (filePath: string, options: AttachmentOptionsNode): this
    attachData (content: Readable | Buffer, options: AttachmentOptionsNode): this
    embed (filePath: string, cid: string, options: AttachmentOptionsNode)
    embedData (content: Readable | Buffer, cid: string, options: AttachmentOptionsNode)

    header (key: string, value: string | string[]): this
    preparedHeader (key: string, value: string | string[]): this

    toJSON (): MessageNode
}
