/**
 * IndexBuffer 索引缓冲
 *
 * @param numElements {number}
 * @param elementSize {number}
 * @param usage {number} 缓冲用途， 参照L5.BU_XXX
 *
 * @extends {L5.Buffer}
 *
 * @author lonphy
 * @version 1.0
 * @class
 */
L5.IndexBuffer = function (
    numElements, elementSize, usage
) {
    usage = usage || L5.Buffer.BU_STATIC;
    L5.Buffer.call (this, numElements, elementSize, usage);

    this.offset = 0;
};

L5.nameFix (L5.IndexBuffer, 'IndexBuffer');
L5.extendFix (L5.IndexBuffer, L5.Buffer);

/**
 *
 * @param inStream {L5.InStream}
 */
L5.IndexBuffer.prototype.load = function (inStream) {
    L5.Buffer.prototype.load.call(this, inStream);
    this.offset = inStream.readUint32();
};
/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.IndexBuffer}
 */
L5.IndexBuffer.factory = function (inStream) {
    var obj = new L5.IndexBuffer(0, 0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.IndexBuffer', L5.IndexBuffer.factory);