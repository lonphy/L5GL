import { Visual } from './Visual';

class PolyPoint extends Visual {

    /**
     * @param {VertexFormat} format
     * @param {VertexBuffer} vertexBuffer
     */
    constructor(format, vertexBuffer) {
        super(Visual.PT_POLYPOINT, format, vertexBuffer, null);
        this.numPoints = vertexBuffer.numElements;
    }

    getMaxNumPoints() {
        return this.vertexBuffer.numElements;
    }

    setNumPoints(num) {
        let numVertices = this.vertexBuffer.numElements;
        if (0 <= num && num <= numVertices) {
            this.numPoints = num;
        }
        else {
            this.numPoints = numVertices;
        }
    }
}

export { PolyPoint };