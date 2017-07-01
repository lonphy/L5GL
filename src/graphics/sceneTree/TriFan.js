import { Triangles } from './Triangles';

class TriFan extends Triangles {
    /**
     * @param {VertexFormat} format
     * @param {VertexBuffer} vertexBuffer
     * @param {number} indexSize
     */
    constructor(format, vertexBuffer, indexSize) {
        super(Visual.PT_TRIFAN, format, vertexBuffer, null)
        console.assert(indexSize === 2 || indexSize === 4, 'Invalid index size.');

        var numVertices = this.vertexBuffer.numElements;
        this.indexBuffer = new IndexBuffer(numVertices, indexSize);
        var i, indices;

        if (indexSize == 2) {
            indices = new Uint16Array(this.indexBuffer.getData());
        }
        else // indexSize == 4
        {
            indices = new Uint32Array(this.indexBuffer.getData());
        }
        for (i = 0; i < numVertices; ++i) {
            indices[i] = i;
        }
    }

    /**
     * 获取网格中的三角形数量
     * @returns {number}
     */
    getNumTriangles() {
        return this.indexBuffer.numElements - 2;
    }
    
    /**
     * 获取位置I处的三角形索引
     * @param {number} i
     * @param {Array<number>} output - 3 elements
     * @returns {boolean}
     */
    getTriangle(i, output) {
        if (0 <= i && i < this.getNumTriangles()) {
            var data = new Uint32Array(this.indexBuffer.getData());
            output[0] = data[0];
            output[1] = data[i + 1];
            output[2] = data[i + 2];
            return true;
        }
        return false;
    }
}
export { TriFan };