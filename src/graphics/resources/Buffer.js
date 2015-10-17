/**
 * Buffer 缓冲构造
 * @param numElements {number} 元素数量
 * @param elementSize {number} 一个元素的尺寸，单位比特
 * @param usage {number} 缓冲用途， 参照L5.BU_XXX
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Buffer = function (numElements, elementSize, usage) {
    L5.D3Object.call(this);
    this.numElements = numElements;
    this.elementSize = elementSize;
    this.usage = usage;
    this.numBytes = numElements * elementSize;
    if (this.numBytes > 0) {
        this._data = new Uint8Array(this.numBytes);
    }
};

L5.nameFix(L5.Buffer, 'Buffer');
L5.extendFix(L5.Buffer, L5.D3Object);

/**
 * @returns {Uint8Array}
 */
L5.Buffer.prototype.getData = function () {
    return this._data;
};


/////////////////////// 缓冲用途定义 ///////////////////////////
L5.Buffer.BU_STATIC = 0;
L5.Buffer.BU_DYNAMIC = 1;
L5.Buffer.BU_RENDERTARGET = 2;
L5.Buffer.BU_DEPTHSTENCIL = 3;

/**
 * @param inStream {L5.InStream}
 */
L5.Buffer.prototype.load = function (inStream) {

    L5.D3Object.prototype.load.call(this, inStream);
    this.numElements = inStream.readUint32();
    this.elementSize = inStream.readUint32();
    this.usage = inStream.readEnum();
    this._data = new Uint8Array(inStream.readBinary(this.numBytes));
    this.numBytes = this._data.length;
};