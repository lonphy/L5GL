import { _Math } from './Math';

// The solution is unique.
const EA_UNIQUE = 0;
// The solution is not unique.  A sum of angles is constant.
const EA_NOT_UNIQUE_SUM = 1;
// The solution is not unique.  A difference of angles is constant.
const EA_NOT_UNIQUE_DIF = 2;

class Matrix3 extends Float32Array {
	constructor(
		m00 = 1, m01 = 0, m02 = 0,
		m10 = 0, m11 = 1, m12 = 0,
		m20 = 0, m21 = 0, m22 = 1
	) {
		super(9);
		this.set([m00, m01, m02, m10, m11, m12, m20, m21, m22]);
	}

	/**
	 * @param {Matrix3} mat3 
	 */
	copy(mat3) {
		this.set(mat3);
		return this;
	}

	makeZero() {
		this.fill(0);
		return this;
	}

	makeIdentity() {
		this.fill(0);
		this[0] = this[4] = this[8] = 1;
		return this;
	}

	/**
	 * 
	 * @param {Vector} vector 
	 * @return {number}
	 */
	extractEulerZYX(vec) {
		// +-           -+   +-                                      -+
		// | r00 r01 r02 |   |  cy*cz  cz*sx*sy-cx*sz  cx*cz*sy+sx*sz |
		// | r10 r11 r12 | = |  cy*sz  cx*cz+sx*sy*sz -cz*sx+cx*sy*sz |
		// | r20 r21 r22 |   | -sy     cy*sx           cx*cy          |
		// +-           -+   +-                                      -+

		if (this[6] < 1) {
			if (this[6] > -1) {
				// y_angle = asin(-r20)
				// z_angle = atan2(r10,r00)
				// x_angle = atan2(r21,r22)
				vec.y = _Math.asin(-this[6]);
				vec.z = Math.atan2(this[3], this[0]);
				vec.x = Math.atan2(this[7], this[8]);
				return EA_UNIQUE;
			}
			else {
				// y_angle = +pi/2
				// x_angle - z_angle = atan2(r01,r02)
				// WARNING.  The solution is not unique.  Choosing x_angle = 0.
				vec.y = _Math.HALF_PI;
				vec.z = -Math.atan2(this[1], this[2]);
				vec.x = 0;
				return EA_NOT_UNIQUE_DIF;
			}
		}
		else {
			// y_angle = -pi/2
			// x_angle + z_angle = atan2(-r01,-r02)
			// WARNING.  The solution is not unique.  Choosing x_angle = 0;
			vec.y = -_Math.HALF_PI;
			vec.z = Math.atan2(-this[1], -this[2]);
			vec.x = 0;
			return EA_NOT_UNIQUE_SUM;
		}
	}

	/**
	 * @param {Matrix3} mat3
	 */
	mul(mat3) {
		return new Matrix3(
			this[0] * mat3[0] + this[1] * mat3[3] + this[2] * mat3[6],
			this[0] * mat3[1] + this[1] * mat3[4] + this[2] * mat3[7],
			this[0] * mat3[2] + this[1] * mat3[5] + this[2] * mat3[8],

			this[3] * mat3[0] + this[4] * mat3[3] + this[5] * mat3[6],
			this[3] * mat3[1] + this[4] * mat3[4] + this[5] * mat3[7],
			this[3] * mat3[2] + this[4] * mat3[5] + this[5] * mat3[8],

			this[6] * mat3[0] + this[7] * mat3[3] + this[8] * mat3[6],
			this[6] * mat3[1] + this[7] * mat3[4] + this[8] * mat3[7],
			this[6] * mat3[2] + this[7] * mat3[5] + this[8] * mat3[8]
		);
	}

	makeEulerZYX(vec) {
		let cs, sn;
		cs = Math.cos(vec.z);
		sn = Math.sin(vec.z);
		let zMat = new Matrix3(
			cs, -sn, 0,
			sn, cs, 0,
			0, 0, 1
		);

		cs = Math.cos(vec.y);
		sn = Math.sin(vec.y);
		let yMat = new Matrix3(
			cs, 0, sn,
			0, 1, 0,
			-sn, 0, cs);

		cs = Math.cos(vec.x);
		sn = Math.sin(vec.x);
		let xMat = new Matrix3(
			1, 0, 0,
			0, cs, -sn,
			0, sn, cs);
		this.copy(zMat.mul(yMat.mul(xMat)));
	}

	static get ZERO() { return new Matrix3().makeZero(); }
	static get IDENTITY() { return new Matrix3().makeIdentity(); }
}

export { Matrix3 };
