/**
 * VertexBuffer 顶点缓冲
 *
 * @author lonphy
 * @version 1.0
 *
 * @type VertexBuffer
 * @extends {Buffer}
 */
import {Buffer} from './Buffer'
import {D3Object} from '../../core/D3Object'

export class VertexBuffer extends Buffer {

    /**
     * @param numElements
     * @param elementSize
     * @param usage {number} 缓冲用途， 参照Buffer.BU_XXX
     */
    constructor(numElements, elementSize, usage = Buffer.BU_STATIC) {
        super(numElements, elementSize, usage);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {VertexBuffer}
     */
    static factory(inStream) {
        var obj = new VertexBuffer(0, 0);
        obj.load(inStream);
        return obj;
    }
}
D3Object.Register('L5.VertexBuffer', VertexBuffer.factory);
