/**
 * 点 模型
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @class
 * @extends {L5.Visual}
 *
 * @author lonphy
 * @version 1.0
 *
 */
L5.PolyPoint = function (format, vertexBuffer) {
    L5.Visual.call(this, L5.Visual.PT_POLYPOINT, format, vertexBuffer, null);

    // 点数量
    this.numPoints = vertexBuffer.numElements;

};
L5.nameFix(L5.PolyPoint, 'PolyPoint');
L5.extendFix(L5.PolyPoint, L5.Visual);

L5.PolyPoint.prototype.getMaxNumPoints = function () {
    return this.vertexBuffer.numElements;
};
/**
 *
 * @param num {int}
 */
L5.PolyPoint.prototype.setNumPoints = function (num) {
    var numVertices = this.vertexBuffer.numElements;
    if (0 <= num && num <= numVertices) {
        this.numPoints = num;
    }
    else {
        this.numPoints = numVertices;
    }
};