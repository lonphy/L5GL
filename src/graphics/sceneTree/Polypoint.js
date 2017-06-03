import { Visual } from './Visual'

export class PolyPoint extends Visual {

    /**
     * @param format {L5.VertexFormat}
     * @param vertexBuffer {L5.VertexBuffer}
     */
    constructor(format, vertexBuffer) {
        super(Visual.PT_POLYPOINT, format, vertexBuffer, null);
        this.numPoints = vertexBuffer.numElements;
    }

    getMaxNumPoints() {
        return this.vertexBuffer.numElements;
    }

    setNumPoints(num) {
        var numVertices = this.vertexBuffer.numElements;
        if (0 <= num && num <= numVertices) {
            this.numPoints = num;
        }
        else {
            this.numPoints = numVertices;
        }
    }
}
