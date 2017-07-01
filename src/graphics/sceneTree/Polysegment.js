import { Visual } from './Visual';

class Polysegment extends Visual {

	/**
	 * If 'contiguous' is 'true', then the vertices form a true 
	 * polysegment in the sense that each pair of consecutive vertices 
	 * are connected by a line segment.  For example,
	 * {V0,V1,V2,V3} form segments <V0,V1>, <V1,V2>, and <V2,V3>.  If you
	 * want a closed polysegment, the input vertex buffer's last element must
	 * be a duplicate of the first element.  For example, {V0,V1,V2,V3=V0}
	 * forms the triangle with segments <V0,V1>, <V1,V2>, and <V2,V0>.
	 * If 'contiguous' is 'false', the vertices form a set of disconnected
	 * line segments.  For example, {V0,V1,V2,V3} form segments <V0,V1>
	 * and <V2,V3>.  In this case, the input vertex buffer must have an
	 * even number of elements.
	 * @param {VertexFormat} vformat 
	 * @param {VertexBuffer} vbuffer 
	 * @param {boolean} contiguous 
	 */
	constructor(vformat, vbuffer, contiguous) {
		super(contiguous ? Visual.PT_POLYSEGMENTS_CONTIGUOUS : Visual.PT_POLYSEGMENTS_DISJOINT, vformat, vbuffer, null);
		// The polyline has contiguous or disjoint segments.
		this.contiguous = contiguous;

		let numVertices = vbuffer.numElements;
		console.assert(numVertices >= 2, 'Polysegments must have at least two points.');

		// The number of segments currently active.

		if (contiguous) {
			this.numSegments = numVertices - 1;
		}
		else {
			console.assert((numVertices & 1) == 0, 'Disconnected segments require an even number of vertices.');
			this.numSegments = numVertices / 2;
		}
	}

	getMaxNumSegments() {
		let numVertices = this.vertexBuffer.numElements;
		return this.contiguous ? numVertices - 1 : numVertices / 2;
	}

	SetNumSegments(numSegments) {
		let numVertices = this.vertexBuffer.numElements;
		if (this.contiguous) {
			let numVerticesM1 = numVertices - 1;
			if (0 <= numSegments && numSegments <= numVerticesM1) {
				this.numSegments = numSegments;
			}
			else {
				this.numSegments = numVerticesM1;
			}
		}
		else {
			let numVerticesD2 = numVertices / 2;
			if (0 <= numSegments && numSegments <= numVerticesD2) {
				this.numSegments = numSegments;
			}
			else {
				this.numSegments = numVerticesD2;
			}
		}
	}

}

export { Polysegment };