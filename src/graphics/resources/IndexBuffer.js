import { Buffer } from './Buffer';
import { D3Object } from '../../core/D3Object';

class IndexBuffer extends Buffer {

    /**
     * @param {number} numElements
     * @param {number} elementSize
     * @param {number} usage - 缓冲用途， 参照Buffer.BU_XXX
     */
    constructor(numElements = 0, elementSize = 0, usage = Buffer.BU_STATIC) {
        super(numElements, elementSize, usage);
        this.offset = 0;
    }

    /**
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        this.offset = inStream.readUint32();
    }
}
D3Object.Register('IndexBuffer', IndexBuffer.factory);

export { IndexBuffer };