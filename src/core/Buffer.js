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
L5.Buffer = function (
    numElements, elementSize, usage
) {
    this.numElements = numElements;
    this.elementSize = elementSize;
    this.usage       = usage;
    this.numBytes    = numElements * elementSize;

    this._data = new ArrayBuffer (this.numBytes);
};

L5.nameFix (L5.Buffer, 'Buffer');
/**
 * @returns {ArrayBuffer}
 */
L5.Buffer.prototype.getData = function () {
    return this._data;
};


/////////////////////// 缓冲用途定义 ///////////////////////////
L5.Buffer.BU_STATIC       = 0;
L5.Buffer.BU_DYNAMIC      = 1;
L5.Buffer.BU_RENDERTARGET = 2;
L5.Buffer.BU_DEPTHSTENCIL = 3;