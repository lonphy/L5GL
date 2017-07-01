import { Vector } from './Vector';

class Triangle3 {
	/**
	 * @param {Vector} v0 
	 * @param {Vector} v1 
	 * @param {Vector} v2 
	 */
	constructor(v0 = undefined, v1 = undefined, v2 = undefined) {
		this.V = [Vector.ZERO, Vector.ZERO, Vector.ZERO];
		if (v0 !== undefined) {
			this.V[0].copy(v0);
			this.V[1].copy(v1);
			this.V[2].copy(v2);
		}
	}

	/**
	 * @param {Vector} v 
	 */
	distanceTo(v) {
		let diff = this.V[0].sub(v);
		let edge0 = this.V[1].sub(this.V[0]);
		let edge1 = this.V[2].sub(this.V[0]);
		let a00 = edge0.squaredLength();
		let a01 = edge0.dot(edge1);
		let a11 = edge1.squaredLength();
		let b0 = diff.dot(edge0);
		let b1 = diff.dot(edge1);
		let c = diff.squaredLength();
		let det = Math.abs(a00 * a11 - a01 * a01);
		let s = a01 * b1 - a11 * b0;
		let t = a01 * b0 - a00 * b1;
		let sqrDistance;

		if (s + t <= det) {
			if (s < 0) {
				if (t < 0)  // region 4
				{
					if (b0 < 0) {
						if (-b0 >= a00) {
							sqrDistance = a00 + (2) * b0 + c;
						}
						else {
							sqrDistance = c - b0 * b0 / a00;
						}
					}
					else {
						if (b1 >= 0) {
							sqrDistance = c;
						}
						else if (-b1 >= a11) {
							sqrDistance = a11 + 2 * b1 + c;
						}
						else {
							sqrDistance = c - b1 * b1 / a11;
						}
					}
				}
				else  // region 3
				{
					if (b1 >= 0) {
						sqrDistance = c;
					}
					else if (-b1 >= a11) {
						sqrDistance = a11 + 2 * b1 + c;
					}
					else {
						sqrDistance = c - b1 * b1 / a11;
					}
				}
			}
			else if (t < 0)  // region 5
			{
				if (b0 >= 0) {
					sqrDistance = c;
				}
				else if (-b0 >= a00) {
					sqrDistance = a00 + 2 * b0 + c;
				}
				else {
					sqrDistance = b0 * s + c - b0 * b0 / a00;
				}
			}
			else  // region 0
			{
				// The minimum is at an interior point of the triangle.
				let invDet = 1 / det;
				s *= invDet;
				t *= invDet;
				sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
			}
		}
		else {
			let tmp0, tmp1, numer, denom;

			if (s < 0)  // region 2
			{
				tmp0 = a01 + b0;
				tmp1 = a11 + b1;
				if (tmp1 > tmp0) {
					numer = tmp1 - tmp0;
					denom = a00 - 2 * a01 + a11;
					if (numer >= denom) {
						sqrDistance = a00 + 2 * b0 + c;
					}
					else {
						s = numer / denom;
						t = 1 - s;
						sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
					}
				}
				else {
					if (tmp1 <= 0) {
						sqrDistance = a11 + 2 * b1 + c;
					}
					else if (b1 >= 0) {
						sqrDistance = c;
					}
					else {
						sqrDistance = c - b1 * b1 / a11;
					}
				}
			}
			else if (t < 0)  // region 6
			{
				tmp0 = a01 + b1;
				tmp1 = a00 + b0;
				if (tmp1 > tmp0) {
					numer = tmp1 - tmp0;
					denom = a00 - 2 * a01 + a11;
					if (numer >= denom) {
						t = 1;
						s = 0;
						sqrDistance = a11 + 2 * b1 + c;
					}
					else {
						t = numer / denom;
						s = 1 - t;
						sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
					}
				}
				else {
					if (tmp1 <= 0) {
						sqrDistance = a00 + 2 * b0 + c;
					}
					else if (b0 >= 0) {
						sqrDistance = c;
					}
					else {
						sqrDistance = c - b0 * b0 / a00;
					}
				}
			}
			else  // region 1
			{
				numer = a11 + b1 - a01 - b0;
				if (numer <= 0) {
					sqrDistance = a11 + 2 * b1 + c;
				}
				else {
					denom = a00 - 2 * a01 + a11;
					if (numer >= denom) {
						sqrDistance = a00 + 2 * b0 + c;
					}
					else {
						s = numer / denom;
						t = 1 - s;
						sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
					}
				}
			}
		}

		return Math.sqrt(Math.abs(sqrDistance));
	}
}

export { Triangle3 };