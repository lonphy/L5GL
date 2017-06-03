import { _Math } from './Math';
import { Point } from './Point';

/**
 * 4阶矩阵
 */
export class Matrix extends Float32Array {
    constructor(m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33) {
        super(16);
        this[0] = m00;
        this[1] = m01;
        this[2] = m02;
        this[3] = m03;

        this[4] = m10;
        this[5] = m11;
        this[6] = m12;
        this[7] = m13;

        this[8] = m20;
        this[9] = m21;
        this[10] = m22;
        this[11] = m23;

        this[12] = m30;
        this[13] = m31;
        this[14] = m32;
        this[15] = m33;
    }

    /**
     * 复制
     * @param {Matrix} m
     * @returns {Matrix}
     */
    copy(m) {
        this[0] = m[0];
        this[1] = m[1];
        this[2] = m[2];
        this[3] = m[3];
        this[4] = m[4];
        this[5] = m[5];
        this[6] = m[6];
        this[7] = m[7];
        this[8] = m[8];
        this[9] = m[9];
        this[10] = m[10];
        this[11] = m[11];
        this[12] = m[12];
        this[13] = m[13];
        this[14] = m[14];
        this[15] = m[15];
        return this;
    }

    /**
     * 判断2个矩阵是否相等
     * @param {Matrix} m
     * @returns {boolean}
     */
    equals(m) {
        let floatEqual = _Math.floatEqual;
        for (let i = 0; i < 16; ++i) {
            if (!floatEqual(this[i], m[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断2个矩阵是否不等
     * @param {Matrix} m
     * @returns {boolean}
     */
    notEquals(m) {
        let floatEqual = _Math.floatEqual;
        for (let i = 0; i < 16; ++i) {
            if (!floatEqual(this[i], m[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 置零矩阵
     * @returns {Matrix}
     */
    zero() {
        return this.fill(0);
    }

    /**
     * 置单位矩阵
     * @returns {Matrix}
     */
    identity() {
        this.fill(0);
        this[0] = this[5] = this[10] = this[15] = 1;
        return this;
    }

    /**
     * 转置
     */
    transpose() {
        let m = this;
        return new Matrix(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        );
    }

    /**
     * 计算逆矩阵
     * @returns {Matrix}
     */
    inverse() {
        let m = this;
        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        let a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        let a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        let a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        let invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
        return new Matrix(
            (a11 * b11 - a12 * b10 + a13 * b09) * invDet,
            (-a01 * b11 + a02 * b10 - a03 * b09) * invDet,
            (a31 * b05 - a32 * b04 + a33 * b03) * invDet,
            (-a21 * b05 + a22 * b04 - a23 * b03) * invDet,
            (-a10 * b11 + a12 * b08 - a13 * b07) * invDet,
            (a00 * b11 - a02 * b08 + a03 * b07) * invDet,
            (-a30 * b05 + a32 * b02 - a33 * b01) * invDet,
            (a20 * b05 - a22 * b02 + a23 * b01) * invDet,
            (a10 * b10 - a11 * b08 + a13 * b06) * invDet,
            (-a00 * b10 + a01 * b08 - a03 * b06) * invDet,
            (a30 * b04 - a31 * b02 + a33 * b00) * invDet,
            (-a20 * b04 + a21 * b02 - a23 * b00) * invDet,
            (-a10 * b09 + a11 * b07 - a12 * b06) * invDet,
            (a00 * b09 - a01 * b07 + a02 * b06) * invDet,
            (-a30 * b03 + a31 * b01 - a32 * b00) * invDet,
            (a20 * b03 - a21 * b01 + a22 * b00) * invDet
            );
    }


    /**
     * 伴随矩阵
     * @returns {Matrix}
     */
    adjoint() {
        let m00 = this[0], m01 = this[1], m02 = this[2], m03 = this[3];
        let m10 = this[4], m11 = this[5], m12 = this[6], m13 = this[7];
        let m20 = this[8], m21 = this[9], m22 = this[10], m23 = this[11];
        let m30 = this[12], m31 = this[13], m32 = this[14], m33 = this[15];


        let a0 = m00 * m11 - m01 * m10;
        let a1 = m00 * m12 - m02 * m10;
        let a2 = m00 * m13 - m03 * m10;
        let a3 = m01 * m12 - m02 * m11;
        let a4 = m01 * m13 - m03 * m11;
        let a5 = m02 * m13 - m03 * m12;
        let b0 = m20 * m31 - m21 * m30;
        let b1 = m20 * m32 - m22 * m30;
        let b2 = m20 * m33 - m23 * m30;
        let b3 = m21 * m32 - m22 * m31;
        let b4 = m21 * m33 - m23 * m31;
        let b5 = m22 * m33 - m23 * m32;

        return Matrix(
            +m11 * b5 - m12 * b4 + m13 * b3,
            -m01 * b5 + m02 * b4 - m03 * b3,
            +m31 * a5 - m32 * a4 + m33 * a3,
            -m21 * a5 + m22 * a4 - m23 * a3,

            -m10 * b5 + m12 * b2 - m13 * b1,
            +m00 * b5 - m02 * b2 + m03 * b1,
            -m30 * a5 + m32 * a2 - m33 * a1,
            +m20 * a5 - m22 * a2 + m23 * a1,

            +m10 * b4 - m11 * b2 + m13 * b0,
            -m00 * b4 + m01 * b2 - m03 * b0,
            +m30 * a4 - m31 * a2 + m33 * a0,
            -m20 * a4 + m21 * a2 - m23 * a0,

            -m10 * b3 + m11 * b1 - m12 * b0,
            +m00 * b3 - m01 * b1 + m02 * b0,
            -m30 * a3 + m31 * a1 - m32 * a0,
            +m20 * a3 - m21 * a1 + m22 * a0
            );
    }

    /**
     * 计算行列式
     * @returns {number}
     */
    det() {
        let m = this;
        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        let a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        let a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        let a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

        return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
            a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
            a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
            a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
            a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
            a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
    }

    /**
     * 对点或向量应用矩阵
     * @param {Point|Vector} p
     * @return {Point|Vector}
     */
    mulPoint(p) {
        let c = this,
            x = p.x, y = p.y, z = p.z, w = p.w;

        return new p.constructor(
            c[0] * x + c[4] * y + c[8] * z + c[12] * w,
            c[1] * x + c[5] * y + c[9] * z + c[13] * w,
            c[2] * x + c[6] * y + c[10] * z + c[14] * w,
            c[3] * x + c[7] * y + c[11] * z + c[15] * w
        );
    }

    /**
     * 矩阵相乘
     * @param {Matrix} b
     */
    mul(b) {
        let a = this,

            a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

            b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3],
            b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7],
            b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11],
            b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

        return new Matrix(
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
            );
    }

    /**
     * @param {number} s 
     * @return {Matrix}
     */
    scalar(s) {
        for (let i = 0; i < 16; ++i)
            this[i] *= s;
        return this;
    }

    /**
     * @param {Matrix} m
     * @return {Matrix}
     */
    add(m) {
        for (let i = 0; i < 16; ++i)
            this[i] += m[i];
        return this;
    }

    /**
     * 对点数组应用矩阵
     * @param {number} num
     * @param {Array<Point>} points
     * @return {Array<Point>}
     */
    batchMul(num, points) {
        let ret = new Array(points.length);
        for (let i = 0; i < num; ++i) {
            ret[i] = this.mulPoint(points[i]);
        }
        return ret;
    }

    /**
     * 正交化矩阵旋转部分
     * @return {Matrix}
     */
    orthoNormalize() {
        // Algorithm uses Gram-Schmidt orthogonalization.  If 'this' matrix has
        // upper-left 3x3 block M = [m0|m1|m2], then the orthonormal output matrix
        // is Q = [q0|q1|q2],
        //
        //   q0 = m0/|m0|
        //   q1 = (m1-(q0*m1)q0)/|m1-(q0*m1)q0|
        //   q2 = (m2-(q0*m2)q0-(q1*m2)q1)/|m2-(q0*m2)q0-(q1*m2)q1|
        //
        // where |V| indicates length of vector V and A*B indicates dot
        // product of vectors A and B.

        // Compute q0.
        let invLength = _Math.invSqrt(this[0] * this[0] + this[4] * this[4] + this[8] * this[8]);

        this[0] *= invLength;
        this[4] *= invLength;
        this[8] *= invLength;

        // Compute q1.
        let dot0 = this[0] * this[1] + this[4] * this[5] + this[8] * this[9];

        this[1] -= dot0 * this[0];
        this[5] -= dot0 * this[4];
        this[9] -= dot0 * this[8];

        invLength = _Math.invSqrt(this[1] * this[1] + this[5] * this[5] + this[9] * this[9]);

        this[1] *= invLength;
        this[5] *= invLength;
        this[9] *= invLength;

        // Compute q2.
        let dot1 = this[1] * this[2] + this[5] * this[6] + this[9] * this[10];

        dot0 = this[0] * this[2] + this[4] * this[6] + this[8] * this[10];

        this[2] -= dot0 * this[0] + dot1 * this[1];
        this[6] -= dot0 * this[4] + dot1 * this[5];
        this[10] -= dot0 * this[8] + dot1 * this[9];

        invLength = _Math.invSqrt(this[2] * this[2] + this[6] * this[6] + this[10] * this[10]);

        this[2] *= invLength;
        this[6] *= invLength;
        this[10] *= invLength;
        return this;
    }

    /**
     * 获取矩阵R行N列的值
     * @param {number} r  行
     * @param {number} c  列
     */
    item(r, c) {
        return this[r + 4 * c];
    }

    /**
     * 设置矩阵R行N列的值
     * @param {number} r 行
     * @param {number} c 列
     * @param {number} value 值
     */
    setItem(r, c, value) {
        this[r + 4 * c] = value;
    }

    /**
     * @param {Point} p
     */
    timesDiagonal(p) {
        let c = this;
        return new Matrix(
            c[0] * p[0], c[1] * p[1], c[2] * p[2], c[3],
            c[4] * p[0], c[5] * p[1], c[6] * p[2], c[7],
            c[8] * p[0], c[9] * p[1], c[10] * p[2], c[11],
            c[12] * p[0], c[13] * p[1], c[14] * p[2], c[15]
        );
    }

    /**
     * @param {number} row
     * @param {Point} p
     */
    setRow(row, p) {
        let i = 4 * row;
        this[i] = p[0];
        this[i + 1] = p[1];
        this[i + 2] = p[2];
        this[i + 3] = p[3];
    }

    /**
     * @param {number} row
     */
    getRow(row) {
        let i = 4 * row;
        let ret = new Point(this[i], this[i + 1], this[i + 2]);
        ret[3] = this[i + 3];
        return ret;
    }

    /**
     * @param {number} col
     * @param {Vector} p
     */
    setColumn(col, p) {
        let s = col * 4;
        this[s] = p[0];
        this[s + 1] = p[1];
        this[s + 2] = p[2];
        this[s + 3] = p[3];
    }

    /**
     * @param {number} col in
     * @param {Vector} v out
     */
    getColumn(col, v) {
        let s = col * 4;
        v[0] = this[s];
        v[1] = this[s + 1];
        v[2] = this[s + 2];
        v[3] = this[s + 3];
    }

    debug() {
        let str = '------------- matrix info ----------------\n';
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                if (j !== 0) {
                    str += "\t\t";
                }
                str += this[i * 4 + j].toFixed(10);
            }
            str += "\n";
        }
        console.log(str);
    }

    static get IDENTITY() {
        return (new Matrix()).identity();
    }

    static get ZERO() {
        return (new Matrix()).zero();
    }

    /**
     * @param {Vector} p0
     * @param {Vector} p1
     * @param {Vector} p2
     * @param {Point} p3
     * @returns {Matrix}
     */
    static IPMake(p0, p1, p2, p3) {
        return new Matrix(
            p0.x, p1.x, p2.x, p3.x,
            p0.y, p1.y, p2.y, p3.y,
            p0.z, p1.z, p2.z, p3.z,
            p0.w, p1.w, p2.w, p3.w
        );
    }

    /**
     * Set the transformation to a perspective projection matrix onto a specified plane.
     *
     * @param {Point} origin - plane's origin
     * @param {Vector} normal - unit-length normal for plane
     * @param {Point} eye - the origin of projection
     */
    makePerspectiveProjection(origin, normal, eye) {
        //     +-                                                 -+
        // M = | Dot(N,E-P)*I - E*N^T    -(Dot(N,E-P)*I - E*N^T)*E |
        //     |        -N^t                      Dot(N,E)         |
        //     +-                                                 -+
        //
        // where E is the eye point, P is a point on the plane, and N is a
        // unit-length plane normal.

        let dotND = normal.dot(eye.sub(origin)); // normal * (eye -origin)

        let nx = normal.x, ny = normal.y, nz = normal.z;
        let ex = eye.x, ey = eye.y, ez = eye.z;
        let t = this;

        t[0] = dotND - ex * nx;
        t[1] = -ey * nx;
        t[2] = -ez * nx;
        t[3] = -nx;

        t[4] = -ex * ny;
        t[5] = dotND - ey * ny;
        t[6] = -ez * ny;
        t[7] = -ny;
        t[8] = -ex * nz;
        t[9] = -ey * nz;
        t[10] = dotND - ez * nz;
        t[11] = -nz;

        t[12] = -(t[0] * ex + t[1] * ey + t[2] * ez);
        t[13] = -(t[4] * ex + t[5] * ey + t[6] * ez);
        t[14] = -(t[8] * ex + t[9] * ey + t[10] * ez);
        t[15] = eye.dot(normal);
    }


    /**
     * 设置为在一个有效平面上的斜投影矩阵
     *
     * @param {Point} origin 平面上任意一点
     * @param {Vector} normal 平面法向量
     * @param {Vector} dir 光源方向
     */
    makeObliqueProjection(origin, normal, dir) {
        // 平面方程 origin * normal + d = 0
        // n = (nx, ny, nz)  平面法向量
        // l = (lx, ly, lz) 光源方向(单位向量)
        //
        // | nl-nx*lx    -nx*ly   -nx*lz  -nx  |
        // |   -ny*lx  nl-ny*ly   -ny*lz  -ny  |
        // |   -nz*lx    -nz*ly nl-nz*lz  -nz  |
        // |    -d*lx     -d*ly    -d*lz   nl  |

        let nl = normal.dot(dir);
        let c = origin.dot(normal);

        let m = this;
        let lx = dir.x, ly = dir.y, lz = dir.z,
            nx = normal.x, ny = normal.y, nz = normal.z;

        m[0] = lx * nx - nl;
        m[1] = ly * nx;
        m[2] = lz * nx;
        m[3] = 0;
        m[4] = lx * ny;
        m[5] = ly * ny - nl;
        m[6] = lz * ny;
        m[7] = 0;
        m[8] = lx * nz;
        m[9] = ly * nz;
        m[10] = lz * nz - nl;
        m[11] = 0;
        m[12] = -c * lx;
        m[13] = -c * ly;
        m[14] = -c * lz;
        m[15] = -nl;
    }

    /**
     * Set the transformation to a reflection matrix through a specified plane.
     *
     * @param {Point} origin plane's origin
     * @param {Vector} normal unit-length normal for plane
     */
    makeReflection(origin, normal) {
        let d = 2 * origin.dot(normal);
        let x = normal.x, y = normal.y, z = normal.z;
        let xy = x * y, xz = x * z, yz = y * z;
        this.fill(0);
        this[0] = 1 - 2 * x * x;
        this[1] = -2 * xy;
        this[2] = -2 * xz;

        this[4] = -2 * xy;
        this[5] = 1 - 2 * y * y;
        this[6] = -2 * yz;

        this[8] = -2 * xz;
        this[9] = -2 * yz;
        this[10] = 1 - 2 * z * z;


        this[12] = d * x;
        this[13] = d * y;
        this[14] = d * z;
        this[15] = 1;
    }

    /**
     * @param {Vector} v0
     * @param {Vector} v1
     * @param {Vector} v2
     * @param {Point} p
     */
    static fromVectorAndPoint(v0, v1, v2, p) {
        return new Matrix(
            v0.x, v0.y, v0.z, v0.w,
            v1.x, v1.y, v1.z, v1.w,
            v2.x, v2.y, v2.z, v2.w,
            p.x, p.y, p.z, p.w
        );
    }

    /**
     * 生成旋转矩阵
     * @param {Vector} axis 旋转轴
     * @param {number} angle 旋转角度
     */
    static makeRotation(axis, angle) {
        let c = _Math.cos(angle),
            s = _Math.sin(angle),
            x = axis.x, y = axis.y, z = axis.z,
            oc = 1 - c,
            xx = x * x,
            yy = y * y,
            zz = z * z,
            xym = x * y * oc,
            xzm = x * z * oc,
            yzm = y * z * oc,
            xs = x * s,
            ys = y * s,
            zs = z * s;

        return new Matrix(
            oc * xx + c, xym + zs, xzm - ys, 0,
            xym - zs, yy * oc + c, yzm + xs, 0,
            xzm + ys, yzm - xs, zz * oc + c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 从数组创建矩阵
     * @param  {ArrayBuffer|Array<number>} arr
     */
    static fromArray(arr) {
        console.assert(arr.length >= 16, 'invalid array for Matrix.fromArray');

        return new Matrix(
            arr[0], arr[1], arr[2], arr[3],
            arr[4], arr[5], arr[6], arr[7],
            arr[8], arr[9], arr[10], arr[11],
            arr[12], arr[13], arr[14], arr[15]
        );
    }

    /**
     * 生成旋转矩阵
     * @param {number} angle 旋转角度
     */
    static makeRotateX(angle) {
        let c = _Math.cos(angle), s = _Math.sin(angle);

        return new Matrix(
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * @param {number} angle
     */
    static makeRotateY(angle) {
        let c = _Math.cos(angle), s = _Math.sin(angle);
        return new Matrix(
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        );
    }


    /**
     * 生成缩放矩阵
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {number} scaleZ
     */
    static makeScale(scaleX, scaleY, scaleZ) {
        return new Matrix(
            scaleX, 0, 0, 0,
            0, scaleY, 0, 0,
            0, 0, scaleZ, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 平移快捷函数
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    static makeTranslate(x, y, z) {
        return new Matrix(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        );
    }

    /**
     * 是否是单位矩阵
     * @param {Matrix} dst
     * @returns {boolean}
     */
    static isIdentity(dst) {
        for (let i = 0, l = 16; i < l; ++i) {
            if (i % 5) {
                if (dst[i] !== 0) return false;
            } else {
                if (dst[i] !== 1) return false;
            }
        }
        return true;
    }
}
