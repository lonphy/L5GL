/**
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexSize {number}
 */
import { Triangles } from './Triangles'
import { D3Object } from '../../core/D3Object'

export class TriStrip extends Triangles {
    constructor(format, vertexBuffer, indexSize) {
        super(Visual.PT_TRISTRIP, format, vertexBuffer, null);
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
     * @param i {number}
     * @param output {Array} 3 elements
     * @returns {boolean}
     */
    getTriangle(i, output) {
        if (0 <= i && i < this.getNumTriangles()) {
            var data = new Uint32Array(this.indexBuffer.getData());
            output[0] = data[i];
            if (i & 1) {
                output[1] = data[i + 2];
                output[2] = data[i + 1];
            }
            else {
                output[1] = data[i + 1];
                output[2] = data[i + 2];
            }
            return output[0] !== output[1] &&
                output[0] !== output[2] &&
                output[1] !== output[2];
        }
        return false;
    }
}

D3Object.Register('L5.TriStrip', TriStrip.factory);
