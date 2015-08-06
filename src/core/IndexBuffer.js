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

