import { _Math, Point, Vector, Triangle3, Line3 } from '../../math/index';
import { DECLARE_ENUM } from '../../util/util';
import { VertexBufferAccessor } from '../resources/VertexBufferAccessor';
import { SwitchNode } from '../detail/SwitchNode';
import { PickRecord } from './PickRecord';
import { Triangles } from './Triangles';
import { Node } from './Node';

class Picker {

	constructor() {
		this._origin = Point.ORIGIN;
		this._direction = Vector.ZERO;
		this._tmin = 0;
		this._tmax = 0;
		/**
		 * @type {Array<PickRecord>}
		 */
		this.records = [];
	}

	/**
	 * The linear component is parameterized by P + t*D, where P is a point on
	 * the component (P is the origin), D is a unit-length direction, and t is
	 * a scalar in the interval [tmin,tmax] with tmin < tmax.  The P and D
	 * values must be in world coordinates.  The choices for tmin and tmax are
	 *    line:     tmin = -Math.MAX_REAL, tmax = Math.MAX_REAL
	 *    ray:      tmin = 0, tmax = Math.MAX_REAL
	 *    segment:  tmin = 0, tmax > 0;
	 * 
	 * A call to this function will automatically clear the Records array.
	 * If you need any information from this array obtained by a previous
	 * call to execute, you must save it first.
	 * 
	 * @param {Spatial} scene
	 * @param {Point} origin
	 * @param {Vector} direction
	 * @param {number} tmin
	 * @param {number} tmax
	 */
	execute(scene, origin, direction, tmin, tmax) {
		this._origin.copy(origin);
		this._direction.copy(direction);
		this._tmin = tmin;
		this._tmax = tmax;
		this.records.length = 0;
		this._executeRecursive(scene);
	}

    /**
	 * Locate the record whose T value is smallest in absolute value.
	 * @return {PickRecord}
	 */
	getClosestToZero() {
		if (this.records.length == 0) {
			return msInvalid;
		}

		let closest = _Math.abs(this.records[0].T);
		let index = 0;
		const numRecords = this.records.length;
		for (let i = 1; i < numRecords; ++i) {
			let tmp = _Math.abs(this.records[i].T);
			if (tmp < closest) {
				closest = tmp;
				index = i;
			}
		}
		return this.records[index];
	}

	/**
	 * Locate the record with nonnegative T value closest to zero.
	 * @return {PickRecord}
	 */
	getClosestNonnegative() {
		if (this.records.length === 0) {
			return Picker.invalid;
		}

		// Get first nonnegative value.
		let closest = _Math.MAX_REAL;
		let index;
		const numRecords = this.records.length;
		for (index = 0; index < numRecords; ++index) {
			if (this.records[index].T >= 0) {
				closest = this.records[index].T;
				break;
			}
		}
		if (index == numRecords) {
			return Picker.invalid;
		}

		for (let i = index + 1; i < numRecords; ++i) {
			if (0 <= this.records[i].T && this.records[i].T < closest) {
				closest = this.records[i].T;
				index = i;
			}
		}
		return this.records[index];
	}

	/**
	 * Locate the record with nonpositive T value closest to zero
	 * @return {PickRecord}
	 */
	getClosestNonpositive() {
		if (this.records.length === 0) {
			return Picker.invalid;
		}

		// Get first nonpositive value.
		let closest = -_Math.MAX_REAL;
		let index;
		const numRecords = this.records.length;
		for (index = 0; index < numRecords; ++index) {
			if (this.records[index].T <= 0) {
				closest = this.records[index].T;
				break;
			}
		}
		if (index === numRecords) {
			return Picker.invalid; // All values are positive.
		}

		for (let i = index + 1; i < numRecords; ++i) {
			if (closest < this.records[i].T && this.records[i].T <= 0) {
				closest = this.records[i].T;
				index = i;
			}
		}
		return this.records[index];
	}

	/**
	 * The picking occurs recursively by traversing the input scene
	 * @param {Spatial} obj
	 */
	_executeRecursive(obj) {
		let mesh = obj;
		if (mesh instanceof Triangles) {
			if (mesh.worldBound.testIntersection(this._origin, this._direction, this._tmin, this._tmax)) {
				// Convert the linear component to model-space coordinates.
				let ptmp = mesh.worldTransform.inverse().mulPoint(this._origin);
				let modelOrg = new Vector(ptmp.x, ptmp.y, ptmp.z);

				let vtmp = mesh.worldTransform.inverse.mulPoint(this._direction);
				let modelDirection = new Vector(vtmp.x, vtmp.y, vtmp.z);

				let line = new Line3(modelOrg, modelDirection);

				// Get the position data.
				let vba = VertexBufferAccessor.fromVisual(mesh);

				// Compute intersections with the model-space triangles.
				let numTriangles = mesh.getNumTriangles();
				for (let i = 0; i < numTriangles; ++i) {
					let vs = [0, 0, 0];
					if (!mesh.getTriangle(i, v0, v1, v2)) {
						continue;
					}
					let v0 = vba.getPosition(vs[0]);
					let v1 = vba.getPosition(vs[1]);
					let v2 = vba.getPosition(vs[2]);
					let triangle = new Triangle3(v0, v1, v2);
					let calc = new IntrLineTriangle(line, triangle);
					if (calc.find() && this._tmin <= calc.getLineParameter() && calc.getLineParameter() <= this._tmax) {
						let record = new PickRecord;
						record.intersected = mesh;
						record.T = calc.getLineParameter();
						record.Triangle = i;
						record.bary[0] = calc.getTriBary0();
						record.bary[1] = calc.getTriBary1();
						record.bary[2] = calc.getTriBary2();
						this.records.push(record);
					}
				}
			}
			return;
		}

		if (mesh instanceof SwitchNode) {
			let activeChild = mesh.getActiveChild();
			if (activeChild != SwitchNode.SN_INVALID_CHILD) {
				if (mesh.worldBound.testIntersection(this._origin, this._direction, this._tmin, this._tmax)) {
					let child = mesh.getChild(activeChild);
					if (child) {
						this._executeRecursive(child);
					}
				}
			}
			return;
		}

		if (mesh instanceof Node) {
			if (mesh.worldBound.testIntersection(this._origin, this._direction, this._tmin, this._tmax)) {
				for (let i = 0, t = mesh.getChildsNumber(); i < t; ++i) {
					let child = mesh.getChild(i);
					if (child) {
						this._executeRecursive(child);
					}
				}
			}
		}
	}
}

DECLARE_ENUM(Picker, { invalid: new PickRecord });
export { Picker };
