import { Triangles } from './Triangles';
import { Visual } from './Visual';
import { D3Object } from '../../core/D3Object';

class TriMesh extends Triangles {

    /**
     * @param {VertexFormat} format
     * @param {VertexBuffer} vertexBuffer
     * @param {IndexBuffer} indexBuffer
     */
    constructor(format, vertexBuffer, indexBuffer) {
        super(Visual.PT_TRIMESH, format, vertexBuffer, indexBuffer);
    }

    /**
     * @returns {number}
     */
    getNumTriangles() {
        return this.indexBuffer.numElements / 3;
    }

    /**
     * 获取位置I处的三角形索引
     * @param {number} i
     * @param {Array<number>} output 3 elements
     * @returns {boolean}
     */
    getTriangle(i, output) {
        if (0 <= i && i < this.getNumTriangles()) {
            let data = this.indexBuffer.getData();
            data = new Uint32Array(data.subarray(3 * i * 4, 3 * (i + 1) * 4).buffer);
            output[0] = data[0];
            output[1] = data[1];
            output[2] = data[2];
            return true;
        }
        return false;
    }
}

D3Object.Register('TriMesh', TriMesh.factory);

export { TriMesh };