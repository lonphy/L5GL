import { D3Object } from '../../core/D3Object';
import { DECLARE_ENUM } from '../../util/util';

/**
 * Buffer - 缓冲基础类
 * @abstract
 */
class Buffer extends D3Object {
    /**
     * @param {number} numElements - 元素数量
     * @param {number} elementSize - 一个元素的尺寸，单位比特
     * @param {number} usage - 缓冲用途， 参照Buffer.BU_XXX
     */
    constructor(numElements, elementSize, usage) {
        super();
        this.numElements = numElements;
        this.elementSize = elementSize;
        this.usage = usage;
        this.numBytes = numElements * elementSize;
        if (this.numBytes > 0) {
            this._data = new Uint8Array(this.numBytes);
        }
    }
    /**
     * @returns {(Uint8Array|null)}
     */
    getData() {
        return this._data;
    }

    load(inStream) {
        super.load(inStream);
        this.numElements = inStream.readUint32();
        this.elementSize = inStream.readUint32();
        this.usage = inStream.readEnum();
        this._data = new Uint8Array(inStream.readBinary(this.numBytes));
        this.numBytes = this._data.length;
    }
}

DECLARE_ENUM(Buffer, {
    BU_STATIC: 0,
    BU_DYNAMIC: 1,
    BU_RENDER_TARGET: 2,
    BU_DEPTH_STENCIL: 3
});

export { Buffer };