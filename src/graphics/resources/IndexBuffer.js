/**
 * IndexBuffer 索引缓冲
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {IndexBuffer}
 * @extends {Buffer}
 */
import {Buffer} from './Buffer'
import {D3Object} from '../../core/D3Object'
import * as util from '../../util/util'

export class IndexBuffer extends Buffer {

    /**
     * @param numElements {number}
     * @param elementSize {number}
     * @param usage {number} 缓冲用途， 参照L5.BU_XXX
     */
    constructor(numElements = 0, elementSize = 0, usage = Buffer.BU_STATIC) {
        super(numElements, elementSize, usage);
        this.offset = 0;
    }

    /**
     * @param inStream {InStream}
     */
    load(inStream) {
        super.load(inStream);
        this.offset = inStream.readUint32();
    }
}
D3Object.Register('L5.IndexBuffer', IndexBuffer.factory);
