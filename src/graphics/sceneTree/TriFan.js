/**
 * TriFan
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexSize {number}
 *
 * @class
 * @extends {L5.Triangles}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TriFan = function (
    format, vertexBuffer, indexSize
) {
    L5.Triangles.call (this, L5.Visual.PT_TRIFAN, format, vertexBuffer, null);
    L5.assert (indexSize === 2 || indexSize === 4, 'Invalid index size.');

    var numVertices  = this.vertexBuffer.numElements;
    this.indexBuffer = new L5.IndexBuffer (numVertices, indexSize);
    var i, indices;

    if (indexSize == 2) {
        indices = new Uint16Array (this.indexBuffer.getData ());
    }
    else // indexSize == 4
    {
        indices = new Uint32Array (this.indexBuffer.getData ());
    }
    for (i = 0; i < numVertices; ++i) {
        indices[ i ] = i;
    }
};

L5.nameFix (L5.TriFan, 'TriFan');
L5.extendFix (L5.TriFan, L5.Triangles);

/**
 * 获取网格中的三角形数量
 * @returns {number}
 */
L5.TriFan.prototype.getNumTriangles = function () {
    return this.indexBuffer.numElements - 2;
};
/**
 * 获取位置I处的三角形索引
 * @param i {number}
 * @param output {Array} 3 elements
 * @returns {boolean}
 */
L5.TriFan.prototype.getTriangle     = function (
    i, output
) {
    if (0 <= i && i < this.getNumTriangles ()) {
        var data    = new Uint32Array(this.indexBuffer.getData ());
        output[ 0 ] = data[ 0 ];
        output[ 1 ] = data[ i+1 ];
        output[ 2 ] = data[ i+2 ];
        return true;
    }
    return false;
};