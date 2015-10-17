/**
 * VertexBuffer 顶点缓冲
 * @param numElements
 * @param elementSize
 * @param usage {number} 缓冲用途， 参照L5.BU_XXX
 * @class
 * @extends {L5.Buffer}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VertexBuffer = function (
    numElements, elementSize, usage
) {
    usage = usage || L5.Buffer.BU_STATIC;
    L5.Buffer.call (this, numElements, elementSize, usage);
};

L5.nameFix (L5.VertexBuffer, 'VertexBuffer');
L5.extendFix (L5.VertexBuffer, L5.Buffer);

/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.VertexBuffer}
 */
L5.VertexBuffer.factory = function (inStream) {
    var obj = new L5.VertexBuffer(0, 0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.VertexBuffer', L5.VertexBuffer.factory);