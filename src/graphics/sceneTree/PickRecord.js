class PickRecord {
	constructor() {
		/**
		 * The intersected object.
		 * @type {Spatial}
		 */
		this.intersected = null;

		// The linear component is parameterized by P + t*D.  The T member is
		// the value of parameter t at the intersection point.
		this.T = 0;

		// The index of the triangle that is intersected by the ray.
		this.triangle = 0;

		// The barycentric coordinates of the point of intersection.  All of the
		// coordinates are in [0,1] and b0 + b1 + b2 = 1.
		this.bary = new Array(3);
	}
}

export { PickRecord };