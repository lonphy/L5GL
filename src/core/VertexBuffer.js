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