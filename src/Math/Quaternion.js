import { _Math } from './Math';
import { Matrix } from './Matrix';

/**
 * Quaternion 四元数
 * 
 * 四元数表示为  
 * `q = w + x*i + y*j + z*k`  
 * 但(w, x, y, z) 在4D空间不一定是单位向量
 */
class Quaternion extends Float32Array {

    constructor(w = 0, x = 0, y = 0, z = 0) {
        super(4);
        this[0] = w;
        this[1] = x;
        this[2] = y;
        this[3] = z;
    }

    get w() {
        return this[0];
    }

    get x() {
        return this[1];
    }

    get y() {
        return this[2];
    }

    get z() {
        return this[3];
    }

    set w(n) {
        this[0] = n;
    }

    set x(n) {
        this[1] = n;
    }

    set y(n) {
        this[2] = n;
    }

    set z(n) {
        this[3] = n;
    }

    /**
     * 复制
     * @param {Quaternion} q
     * @returns {Quaternion}
     */
    copy(q) {
        this.set(q);
        return this;
    }

    /**
     * 克隆四元素
     */
    clone() {
        return new Quaternion(this[0], this[1], this[2], this[3]);
    }

    /**
     * 判断是否相等
     * @param {Quaternion} q
     */
    equals(q) {
        return this[0] === q[0] && this[1] === q[1] && this[2] === q[2] && this[3] === q[3];
    }

    /**
     * 加法
     * @param {Quaternion} q
     */
    add(q) {
        return new Quaternion(this[0] + q[0], this[1] + q[1], this[2] + q[2], this[3] + q[3]);
    }

    /**
     * 减法
     * @param {Quaternion} q
     */
    sub(q) {
        return new Quaternion(this[0] - q[0], this[1] - q[1], this[2] - q[2], this[3] - q[3]);
    }

    /**
     * 乘标量
     * @param {number} scalar
     */
    scalar(scalar) {
        return new Quaternion(this[0] * scalar, this[1] * scalar, this[2] * scalar, this[3] * scalar);
    }

    /**
     * 除标量
     * @param {Quaternion} scalar
     */
    div(scalar) {
        if (q !== 0) {
            let invScalar = 1 / scalar;
            return new Quaternion(this[0] * invScalar, this[1] * invScalar, this[2] * invScalar, this[3] * invScalar);
        }
        return new Quaternion(_Math.MAX_REAL, _Math.MAX_REAL, _Math.MAX_REAL, _Math.MAX_REAL);
    }

    /**
     * 乘四元数
     * @param {Quaternion} q
     */
    mul(q) {
        let tw = this[0], tx = this[1], ty = this[2], tz = this[3];
        let qw = q[0], qx = q[1], qy = q[2], qz = q[3];

        return new Quaternion(
            tw * qw - tx * qx - ty * qy - tz * qz,
            tw * qx + tx * qw + ty * qz - tz * qy,
            tw * qy + ty * qw + tz * qx - tx * qz,
            tw * qz + tz * qw + tx * qy - ty * qx
        );
    }

    /**
     * 求负
     */
    negative() {
        return new Quaternion(-this[0], -this[1], -this[2], -this[3]);
    }

    /**
     * 提取旋转矩阵
     */
    toRotateMatrix() {
        let w = this[0], x = this[1], y = this[2], z = this[3],
            x2 = 2 * x, y2 = 2 * y, z2 = 2 * z,
            wx2 = x2 * w, wy2 = y2 * w, wz2 = z2 * w,
            xx2 = x2 * x, xy2 = y2 * x, xz2 = z2 * x,
            yy2 = y2 * y, yz2 = z2 * y, zz2 = z2 * z;

        return new Matrix(
            1 - yy2 - zz2, xy2 - wz2, xz2 + wy2, 0,
            xy2 + wz2, 1 - xx2 - zz2, yz2 - wx2, 0,
            xz2 - wy2, yz2 + wx2, 1 - xx2 - yy2, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 提取旋转矩阵
     * - 0: axis
     * - 1: angle
     * @returns {Array<number|Vector>}
     */
    toAxisAngle() {
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

        let ret = [];
        let sqrLength = this[1] * this[1] + this[2] * this[2] + this[3] * this[3];

        if (sqrLength > 0) {
            ret[1] = 2 * _Math.acos(this[0]);
            let invLength = 1 / Math.sqrt(sqrLength);
            ret[0] = new Vector(this[1] * invLength, this[2] * invLength, this[3] * invLength);
        }
        else {
            // Angle is 0 (mod 2*pi), so any axis will do.
            ret[1] = 0;
            ret[0] = new Vector(1);
        }
        return ret;
    }

    /**
     * 求当前四元数的模
     */
    get length() {
        return Math.hypot(this[0], this[1], this[2], this[3]);
    }

    /**
     * 模的平方
     */
    squaredLength() {
        return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3];
    }

    /**
     * 规格化
     */
    normalize() {
        let length = this.length;

        if (length > 0) {
            let invLength = 1 / length;
            this[0] *= invLength;
            this[1] *= invLength;
            this[2] *= invLength;
            this[3] *= invLength;
        }
        else {
            length = 0;
            super.fill(0);
        }

        return length;
    }

    /**
     * apply to non-zero quaternion
     * @returns {Quaternion}
     */
    inverse() {
        let norm = this.squaredLength();
        if (norm > 0) {
            let invNorm = 1 / norm;
            return new Quaternion(this[0] * invNorm, -this[1] * invNorm, -this[2] * invNorm, -this[3] * invNorm);
        }
        return Quaternion.ZERO;
    }

    /**
     * negate x, y, and z terms
     * @returns {Quaternion}
     */
    conjugate() {
        return new Quaternion(this[0], -this[1], -this[2], -this[3]);
    }

    /**
     * apply to quaternion with w = 0
     */
    exp() {
        // If q = A*(x*i+y*j+z*k) where (x,y,z) is unit length, then
        // exp(q) = cos(A)+sin(A)*(x*i+y*j+z*k).  If sin(A) is near zero,
        // use exp(q) = cos(A)+A*(x*i+y*j+z*k) since A/sin(A) has limit 1.

        let angle = Math.hypot(this[1], this[2], this[3]);
        let sn = Math.sin(angle);
        let w = Math.cos(angle);
        if (Math.abs(sn) > 0) {
            let coeff = sn / angle;
            return new Quaternion(w, coeff * this[1], coeff * this[2], coeff * this[3]);
        }
        return new Quaternion(w, this[1], this[2], this[3]);
    }

    /**
     * apply to unit-length quaternion
     */
    log() {
        // If q = cos(A)+sin(A)*(x*i+y*j+z*k) where (x,y,z) is unit length, then
        // log(q) = A*(x*i+y*j+z*k).  If sin(A) is near zero, use log(q) =
        // sin(A)*(x*i+y*j+z*k) since sin(A)/A has limit 1.

        if (Math.abs(this[0]) < 1) {
            let angle = _Math.acos(this[0]);
            let sn = Math.sin(angle);
            if (Math.abs(sn) > 0) {
                let coeff = angle / sn;
                return new Quaternion(0, coeff * this[1], coeff * this[2], coeff * this[3]);
            }
        }
        return new Quaternion(0, this[1], this[2], this[3]);
    }

    /**
     * 使用四元数旋转向量
     * >内部转为矩阵后旋转
     * @param {Vector} vec
     * @returns {Vector}
     */
    rotate(vec) {
        // Given a vector u = (x0,y0,z0) and a unit length quaternion
        // q = <w,x,y,z>, the vector v = (x1,y1,z1) which represents the
        // rotation of u by q is v = q*u*q^{-1} where * indicates quaternion
        // multiplication and where u is treated as the quaternion <0,x0,y0,z0>.
        // Note that q^{-1} = <w,-x,-y,-z>, so no real work is required to
        // invert q.  Now
        //
        //   q*u*q^{-1} = q*<0,x0,y0,z0>*q^{-1}
        //     = q*(x0*i+y0*j+z0*k)*q^{-1}
        //     = x0*(q*i*q^{-1})+y0*(q*j*q^{-1})+z0*(q*k*q^{-1})
        //
        // As 3-vectors, q*i*q^{-1}, q*j*q^{-1}, and 2*k*q^{-1} are the columns
        // of the rotation matrix computed in Quaternion::ToRotationMatrix.
        // The vector v is obtained as the product of that rotation matrix with
        // vector u.  As such, the quaternion representation of a rotation
        // matrix requires less space than the matrix and more time to compute
        // the rotated vector.  Typical space-time tradeoff...

        return this.toRotateMatrix().mulPoint(vec);
    }

    /**
     * 球面插值
     * @param {number} t
     * @param {Quaternion} p
     * @param {Quaternion} q
     * @returns {Quaternion}
     */
    slerp(t, p, q) {
        let cs = p.dot(q);
        let angle = _Math.acos(cs);

        if (Math.abs(angle) > 0) {
            let sn = Math.sin(angle);
            let invSn = 1 / sn;
            let tAngle = t * angle;
            let coeff0 = Math.sin(angle - tAngle) * invSn;
            let coeff1 = Math.sin(tAngle) * invSn;

            this[0] = coeff0 * p[0] + coeff1 * q[0];
            this[1] = coeff0 * p[1] + coeff1 * q[1];
            this[2] = coeff0 * p[2] + coeff1 * q[2];
            this[3] = coeff0 * p[3] + coeff1 * q[3];
        }
        else {
            this.copy(p);
        }
        return this;
    }

    /**
     * 球面插值
     * @param {number} t
     * @param {Quaternion} p
     * @param {Quaternion} q
     * @param {number} extraSpins
     * @returns {Quaternion}
     */
    slerpExtraSpins(t, p, q, extraSpins) {
        let cs = p.dot(q);
        let angle = _Math.acos(cs);

        if (Math.abs(angle) >= _Math.ZERO_TOLERANCE) {
            let sn = Math.sin(angle);
            let phase = Math.PI * extraSpins * t;
            let invSin = 1 / sn;
            let coeff0 = Math.sin((1 - t) * angle - phase) * invSin;
            let coeff1 = Math.sin(t * angle + phase) * invSin;

            this[0] = coeff0 * p[0] + coeff1 * q[0];
            this[1] = coeff0 * p[1] + coeff1 * q[1];
            this[2] = coeff0 * p[2] + coeff1 * q[2];
            this[3] = coeff0 * p[3] + coeff1 * q[3];
        }
        else {
            this.copy(p);
        }

        return this;
    }

    /**
     * 球面2次插值中间项
     * @param {Quaternion} q0
     * @param {Quaternion} q1
     * @param {Quaternion} q2
     * @returns {Quaternion}
     */
    intermediate(q0, q1, q2) {
        let q1Inv = q1.conjugate();
        let p0 = q1Inv.mul(q0).log();
        let p2 = q1Inv.mul(q2).log();
        let arg = p0.add(p2).scalar(-0.25).exp();
        this.copy(q1.mul(arg));

        return this;
    }

    /**
     * 球面2次插值
     * @param {number} t
     * @param {Quaternion} q0
     * @param {Quaternion} a0
     * @param {Quaternion} a1
     * @param {Quaternion} q1
     * @returns {Quaternion}
     */
    squad(t, q0, a0, a1, q1) {
        let slerpT = 2 * t * (1 - t);

        let slerpP = this.slerp(t, q0, q1);
        let slerpQ = this.slerp(t, a0, a1);
        return this.slerp(slerpT, slerpP, slerpQ);
    }

    static get ZERO() {
        return new Quaternion();
    }

    static get IDENTIRY() {
        return new Quaternion(1);
    }

    /**
     * 从矩阵的旋转部分创建四元数
     * @param {Matrix} rot
     */
    static fromRotateMatrix(rot) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".

        let trace = rot[0] + rot[5] + rot[10];
        let root;

        if (trace > 0) {
            // |w| > 1/2, may as well choose w > 1/2
            root = Math.sqrt(trace + 1);  // 2w
            let root1 = 0.5 / root;  // 1/(4w)

            return new Quaternion(
                0.5 * root,
                (rot[9] - rot[6]) * root1,
                (rot[2] - rot[8]) * root1,
                (rot[4] - rot[1]) * root1
            );
        }

        let next = [1, 2, 0];

        // |w| <= 1/2
        let i = 0;
        if (rot[5] > rot[0]) {
            i = 1;
        }
        if (rot[10] > rot.item(i, i)) {
            i = 2;
        }

        let j = next[i];
        let k = next[j];
        root = Math.sqrt(rot.item(i, i) - rot.item(j, j) - rot.item(k, k) + 1);
        let ret = new Array(4);
        ret[i + 1] = 0.5 * root;
        root = 0.5 / root;
        ret[0] = (rot.item(k, j) - rot.item(j, k)) * root;
        ret[j] = (rot.item(j, i) + rot.item(i, j)) * root;
        ret[k] = (rot.item(k, i) + rot.item(i, k)) * root;

        return new Quaternion(ret[0], ret[1], ret[2], ret[3]);
    }

    /**
     * 使用旋转轴和旋转角度创建四元数
     * @param {Vector} axis
     * @param {number} angle
     */
    static fromAxisAngle(axis, angle) {
        // assert:  axis[] is unit length
        //
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

        let halfAngle = 0.5 * angle;
        let sn = Math.sin(halfAngle);
        return new Quaternion(Math.cos(halfAngle), sn * axis.x, sn * axis.y, sn * axis.z);
    }


    /**
     * 计算V1 到 V2 的旋转四元数， 旋转轴同时垂直于V1&V1
     * @param {Vector} v1 单位向量
     * @param {Vector} v2 单位向量
     */
    static align(v1, v2) {
        // If V1 and V2 are not parallel, the axis of rotation is the unit-length
        // vector U = Cross(V1,V2)/Length(Cross(V1,V2)).  The angle of rotation,
        // A, is the angle between V1 and V2.  The quaternion for the rotation is
        // q = cos(A/2) + sin(A/2)*(ux*i+uy*j+uz*k) where U = (ux,uy,uz).
        //
        // (1) Rather than extract A = acos(Dot(V1,V2)), multiply by 1/2, then
        //     compute sin(A/2) and cos(A/2), we reduce the computational costs by
        //     computing the bisector B = (V1+V2)/Length(V1+V2), so cos(A/2) =
        //     Dot(V1,B).
        //
        // (2) The rotation axis is U = Cross(V1,B)/Length(Cross(V1,B)), but
        //     Length(Cross(V1,B)) = Length(V1)*Length(B)*sin(A/2) = sin(A/2), in
        //     which case sin(A/2)*(ux*i+uy*j+uz*k) = (cx*i+cy*j+cz*k) where
        //     C = Cross(V1,B).
        //
        // If V1 = V2, then B = V1, cos(A/2) = 1, and U = (0,0,0).  If V1 = -V2,
        // then B = 0.  This can happen even if V1 is approximately -V2 using
        // floating point arithmetic, since Vector3::Normalize checks for
        // closeness to zero and returns the zero vector accordingly.  The test
        // for exactly zero is usually not recommend for floating point
        // arithmetic, but the implementation of Vector3::Normalize guarantees
        // the comparison is robust.  In this case, the A = pi and any axis
        // perpendicular to V1 may be used as the rotation axis.

        let bisector = v1.add(v2).normalize();
        let cosHalfAngle = v1.dot(bisector);
        let w, x, y, z;

        w = cosHalfAngle;

        if (cosHalfAngle !== 0) {
            let cross = v1.cross(bisector);
            x = cross.x;
            y = cross.y;
            z = cross.z;
        }
        else {
            let invLength;
            if (Math.abs(v1.x) >= Math.abs(v1.y)) {
                // V1.x or V1.z is the largest magnitude component.
                invLength = Math.hypot(v1.x, v1.z);
                x = -v1.z * invLength;
                y = 0;
                z = +v1.x * invLength;
            }
            else {
                // V1.y or V1.z is the largest magnitude component.
                invLength = Math.hypot(v1.y, v1.z);
                x = 0;
                y = +v1.z * invLength;
                z = -v1.y * invLength;
            }
        }

        return new Quaternion(w, x, y, z);
    }

    /**
     * @param {Quaternion} q 
     */
    dot(q) {
        return this[0] * q[0] + this[1] * q[1] + this[2] * q[2] + this[3] * q[3];
    }
}

export { Quaternion };