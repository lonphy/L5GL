import { Buffer } from './Buffer';
import { D3Object } from '../../core/D3Object';

class VertexBuffer extends Buffer {

    /**
     * @param numElements
     * @param elementSize
     * @param usage {number} 缓冲用途， 参照Buffer.BU_XXX
     */
    constructor(numElements, elementSize, usage = Buffer.BU_STATIC) {
        super(numElements, elementSize, usage);
    }

    static factory(inStream) {
        var obj = new VertexBuffer(0, 0);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('VertexBuffer', VertexBuffer.factory);

export { VertexBuffer };
