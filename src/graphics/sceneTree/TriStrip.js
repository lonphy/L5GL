/**
 * TriStrip
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
L5.TriStrip = function (
    format, vertexBuffer, indexSize
) {
    L5.Triangles.call (this, L5.Visual.PT_TRISTRIP, format, vertexBuffer, null);
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

L5.nameFix (L5.TriStrip, 'TriStrip');
L5.extendFix (L5.TriStrip, L5.Triangles);

/**
 * 获取网格中的三角形数量
 * @returns {number}
 */
L5.TriStrip.prototype.getNumTriangles = function () {
    return this.indexBuffer.numElements - 2;
};
/**
 * 获取位置I处的三角形索引
 * @param i {number}
 * @param output {Array} 3 elements
 * @returns {boolean}
 */
L5.TriStrip.prototype.getTriangle     = function (
    i, output
) {
    if (0 <= i && i < this.getNumTriangles ()) {
        var data    = new Uint32Array(this.indexBuffer.getData ());
        output[ 0 ] = data[ i ];
        if (i & 1) {
            output[ 1 ] = data[ i + 2 ];
            output[ 2 ] = data[ i + 1 ];
        }
        else {
            output[ 1 ] = data[ i + 1 ];
            output[ 2 ] = data[ i + 2 ];
        }
        return output[0]!==output[1] &&
            output[0] !== output[2] &&
            output[1] !== output[2];
    }
    return false;
};