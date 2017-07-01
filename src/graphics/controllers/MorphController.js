import { Controller } from './Controller';
import { Point } from '../../math/index';
import { VertexBufferAccessor } from '../resources/namespace';

class MorphController extends Controller {
	/**
	 * The numbers of vertices, morph targets, and the keys are fixed 
	 * for the lifetime of the object.  The constructor does some of 
	 * the work of creating the controller.  The vertices per target, 
	 * the times, and the weights must all be assigned by the
	 * appropriate member accessors.
	 * 
	 *  numVertices:  The number of vertices per target.  All targets have the
	 *                same number of vertices.
	 * 
	 *  numTargets:  The number of targets to morph.
	 * 
	 * numKeys:  The number of keys, each key occurring at a specific time.
	 * 
	 * @param {number} numVertices 
	 * @param {number} numTargets
	 * @param {number} numKeys 
	 */
	constructor(numVertices, numTargets, numKeys) {
		super();

		// For O(1) lookup on bounding keys.
		this._lastIndex = 0;

		// Target geometry.  The number of vertices per target must match the
		// number of vertices in the managed geometry object.  The array of
		// vertices at location 0 are those of one of the targets.  Based on the
		// comments about "Morph keys" (below), the array at location i >= 1 is
		// computed as the difference between the i-th target and the 0-th target.
		this.numVertices = numVertices;
		this.numTargets = numTargets;
		this.vertices = new Array(numTargets);
		this.vertices.map(v => new Array(numVertices));

		// Morph keys.  The morphed object is a combination of N targets by
		// weights w[0] through w[N-1] with w[i] in [0,1] and sum_i w[i] = 1.
		// Each combination is sum_{i=0}^{N-1} w[i]*X[i] where X[i] is a vertex
		// of the i-th target.  This can be rewritten as a combination
		// X[0] + sum_{i=0}^{N-2} w'[i] Y[i] where w'[i] = w[i+1] and
		// Y[i] = X[i+1] - X[0].  The weights stored in this class are the
		// w'[i] (to reduce storage).  This also reduces computation time by a
		// small amount (coefficient of X[0] is 1, so no multiplication must
		// occur).
		this.numKeys = numKeys;
		this.times = new Float32Array(numKeys);
		this.weights = new Array(numKeys);
		this.weights.map(v => new Float32Array(numTargets - 1)); // [numKeys][numTargets-1]
	}

	/**
	 * Lookup on bounding keys.
	 * @param {number} ctrlTime
	 * @return {Array<number>} - [normTime, i0, i1]
	 */
	getKeyInfo(ctrlTime, normTime, i0, i1) {
		const times = this.times;
		const numKeys = this.numKeys;

		if (ctrlTime <= times[0]) {
			this._lastIndex = 0;
			return [0, 0, 0];
		}

		if (ctrlTime >= times[numKeys - 1]) {
			this._lastIndex = numKeys - 1;
			return [0, this._lastIndex, this._lastIndex];
		}

		let nextIndex;
		if (ctrlTime > times[this._lastIndex]) {
			nextIndex = this._lastIndex + 1;
			while (ctrlTime >= times[nextIndex]) {
				this._lastIndex = nextIndex;
				++nextIndex;
			}
			return [
				(ctrlTime - times[i0]) / (times[i1] - times[i0]),
				this._lastIndex,
				nextIndex
			];
		}
		else if (ctrlTime < times[this._lastIndex]) {
			nextIndex = this._lastIndex - 1;
			while (ctrlTime <= times[nextIndex]) {
				this._lastIndex = nextIndex;
				--nextIndex;
			}
			return [
				(ctrlTime - times[i0]) / (times[i1] - times[i0]),
				nextIndex,
				this._lastIndex
			]
		}
		return [0, this._lastIndex, this._lastIndex];
	}

	/**
	 * The animation update.  The application time is in milliseconds.
	 * @param {number} applicationTime
	 */
	update(applicationTime) {
		// The key interpolation uses linear interpolation.  To get higher-order
		// interpolation, you need to provide a more sophisticated key (Bezier
		// cubic or TCB spline, for example).

		if (!super.update(applicationTime)) {
			return false;
		}

		// Get access to the vertex buffer to store the blended targets.
		let visual = this.object;
		console.assert(visual.vertexBuffer.numElements === this.numVertices, 'Mismatch in number of vertices.');

		let vba = VertexBufferAccessor.fromVisual(visual);

		// Set vertices to target[0].
		let baseTarget = this.vertices[0];
		let i;
		for (i = 0; i < this.numVertices; ++i) {
			vba.setPosition(i, baseTarget[i]);
		}

		// Look up the bounding keys.
		let ctrlTime = this.getControlTime(applicationTime);
		let [normTime, i0, i1] = this.getKeyInfo(ctrlTime, normTime, i0, i1);

		// Add the remaining components in the convex composition.
		let weights0 = this.weights[i0];
		let weights1 = this.weights[i1];
		for (i = 1; i < this.numTargets; ++i) {
			// Add in the delta-vertices of target[i].
			let coeff = (1 - normTime) * weights0[i - 1] + normTime * weights1[i - 1];
			let target = this.vertices[i];
			for (let j = 0; j < this.numVertices; ++j) {
				vba.setPosition(j, target[j].scalar(coeff).add(vba.getPosition(j)));
			}
		}

		visual.updateModelSpace(Visual.GU_NORMALS);
		Renderer.updateAll(visual.vertexBuffer);
		return true;
	}
}

export { MorphController };
