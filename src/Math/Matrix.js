/**
 * 4阶矩阵 - L5
 * @author lonphy
 * @version 0.1
 */
L5.Matrix = function (m00, m01, m02, m03,
                      m10, m11, m12, m13,
                      m20, m21, m22, m23,
                      m30, m31, m32, m33) {
    this.content = new Float32Array
    ([
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33
    ]);
};

L5.nameFix(L5.Matrix, 'Matrix');

/**
 * 复制
 * @param mat {L5.Matrix}
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.copy = function (mat) {
    var m = mat.content;
    this.content[0] = m[0];
    this.content[1] = m[1];
    this.content[2] = m[2];
    this.content[3] = m[3];
    this.content[4] = m[4];
    this.content[5] = m[5];
    this.content[6] = m[6];
    this.content[7] = m[7];
    this.content[8] = m[8];
    this.content[9] = m[9];
    this.content[10] = m[10];
    this.content[11] = m[11];
    this.content[12] = m[12];
    this.content[13] = m[13];
    this.content[14] = m[14];
    this.content[15] = m[15];
    return this;
};
L5.Matrix.prototype.set = function (m00, m01, m02, m03,
                                    m10, m11, m12, m13,
                                    m20, m21, m22, m23,
                                    m30, m31, m32, m33) {
    var t = this.content;
    t[0] = m00;
    t[1] = m01;
    t[2] = m02;
    t[3] = m03;
    t[4] = m10;
    t[5] = m11;
    t[6] = m12;
    t[7] = m13;
    t[8] = m20;
    t[9] = m21;
    t[10] = m22;
    t[11] = m23;
    t[12] = m30;
    t[13] = m31;
    t[14] = m32;
    t[15] = m33;
};

/**
 * 判断2个矩阵是否相等
 * @param m {L5.Matrix}
 * @returns {boolean}
 */
L5.Matrix.prototype.equals = function (m) {
    for (var i = 0; i < 16; ++i) {
        if (!L5.Math.floatEqual(this.content[i], m.content[i])) {
            return false;
        }
    }
    return true;
};

/**
 * 判断2个矩阵是否不等
 * @param m {L5.Matrix}
 * @returns {boolean}
 */
L5.Matrix.prototype.notEquals = function (m) {
    for (var i = 0; i < 16; ++i) {
        if (!L5.Math.floatEqual(this.content[i], m.content[i])) {
            return true;
        }
    }
    return false;
};

/**
 * 置零矩阵
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.zero = function () {
    this.content[0] = this.content[1] = this.content[2] = this.content[3] = 0;
    this.content[4] = this.content[5] = this.content[6] = this.content[7] = 0;
    this.content[8] = this.content[9] = this.content[10] = this.content[11] = 0;
    this.content[12] = this.content[13] = this.content[14] = this.content[15] = 0;
    return this;
};

/**
 * 置单位矩阵
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.identity = function () {
    this.content[0] = this.content[5] = this.content[10] = this.content[15] = 1;
    this.content[4] = this.content[1] = this.content[6] = this.content[7] = 0;
    this.content[8] = this.content[9] = this.content[2] = this.content[11] = 0;
    this.content[12] = this.content[13] = this.content[14] = this.content[3] = 0;
    return this;
};

/**
 * 转置
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.transpose = function () {
    var m = this.content;
    return new L5.Matrix(
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    );
};

/**
 * 计算逆矩阵
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.inverse = function () {
    var m = this.content;
    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    var a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    var a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    var a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;

    var invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
    return new L5.Matrix
    (
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
};

/**
 * 伴随矩阵
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.adjoint = function () {
    var m00 = this.content[0], m01 = this.content[1], m02 = this.content[2], m03 = this.content[3];
    var m10 = this.content[4], m11 = this.content[5], m12 = this.content[6], m13 = this.content[7];
    var m20 = this.content[8], m21 = this.content[9], m22 = this.content[10], m23 = this.content[11];
    var m30 = this.content[12], m31 = this.content[13], m32 = this.content[14], m33 = this.content[15];


    var a0 = m00 * m11 - m01 * m10;
    var a1 = m00 * m12 - m02 * m10;
    var a2 = m00 * m13 - m03 * m10;
    var a3 = m01 * m12 - m02 * m11;
    var a4 = m01 * m13 - m03 * m11;
    var a5 = m02 * m13 - m03 * m12;
    var b0 = m20 * m31 - m21 * m30;
    var b1 = m20 * m32 - m22 * m30;
    var b2 = m20 * m33 - m23 * m30;
    var b3 = m21 * m32 - m22 * m31;
    var b4 = m21 * m33 - m23 * m31;
    var b5 = m22 * m33 - m23 * m32;

    return L5.Matrix
    (
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
};

/**
 * 计算行列式
 * @returns {number}
 */
L5.Matrix.prototype.det = function () {
    var m = this.content;
    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    var a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    var a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    var a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

    return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
        a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
        a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
        a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
        a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
        a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
};
/**
 * 对点或向量应用矩阵
 * @param p {L5.Point|L5.Vector}
 * @return {L5.Point|L5.Vector}
 */
L5.Matrix.prototype.mulPoint = function (p) {
    var c = this.content,
        x = p.x, y = p.y, z = p.z, w = p.w;

    return new p.constructor(
        c[0] * x + c[4] * y + c[8] * z + c[12] * w,
        c[1] * x + c[5] * y + c[9] * z + c[13] * w,
        c[2] * x + c[6] * y + c[10] * z + c[14] * w,
        c[3] * x + c[7] * y + c[11] * z + c[15] * w
    );
};
/**
 * 矩阵相乘
 *
 * @param m {L5.Matrix}
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.mul = function (m) {
    var a = this.content, b = m.content,

        a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3],
        b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7],
        b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11],
        b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

    return new L5.Matrix
    (
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
};

/**
 * 对点数组应用矩阵
 * @param num {number}
 * @param points {Array<L5.Point>}
 */
L5.Matrix.prototype.batchMul = function (num, points) {
    var ret = new Array(points.length);
    for (var i = 0; i < num; ++i) {
        ret[i] = this.mulPoint(points[i]);
    }
    return ret;
};

/**
 * 正交化矩阵旋转部分
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.orthoNormalize = function () {
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
    var invLength = L5.Math.invSqrt(
        this.content[0] * this.content[0] +
        this.content[4] * this.content[4] +
        this.content[8] * this.content[8]);

    this.content[0] *= invLength;
    this.content[4] *= invLength;
    this.content[8] *= invLength;

    // Compute q1.
    var dot0 = this.content[0] * this.content[1] +
        this.content[4] * this.content[5] +
        this.content[8] * this.content[9];

    this.content[1] -= dot0 * this.content[0];
    this.content[5] -= dot0 * this.content[4];
    this.content[9] -= dot0 * this.content[8];

    invLength = L5.Math.invSqrt(
        this.content[1] * this.content[1] +
        this.content[5] * this.content[5] +
        this.content[9] * this.content[9]);

    this.content[1] *= invLength;
    this.content[5] *= invLength;
    this.content[9] *= invLength;

    // Compute q2.
    var dot1 = this.content[1] * this.content[2] +
        this.content[5] * this.content[6] +
        this.content[9] * this.content[10];

    dot0 = this.content[0] * this.content[2] +
        this.content[4] * this.content[6] +
        this.content[8] * this.content[10];

    this.content[2] -= dot0 * this.content[0] + dot1 * this.content[1];
    this.content[6] -= dot0 * this.content[4] + dot1 * this.content[5];
    this.content[10] -= dot0 * this.content[8] + dot1 * this.content[9];

    invLength = L5.Math.invSqrt(
        this.content[2] * this.content[2] +
        this.content[6] * this.content[6] +
        this.content[10] * this.content[10]);

    this.content[2] *= invLength;
    this.content[6] *= invLength;
    this.content[10] *= invLength;
    return this;
};

/**
 * 获取矩阵R行N列的值
 * @param r {number} 行
 * @param c {number} 列
 * @returns {number}
 */
L5.Matrix.prototype.item = function (r, c) {
    return this.content[r + 4 * c];
};
/**
 * 设置矩阵R行N列的值
 * @param r {number} 行
 * @param c {number} 列
 * @param value {number} 值
 * @returns {number}
 */
L5.Matrix.prototype.setItem = function (r, c, value) {
    this.content[r + 4 * c] = value;
};

/**
 *
 * @param p {L5.Point}
 */
L5.Matrix.prototype.timesDiagonal = function (p) {
    var c = this.content;
    return new L5.Matrix(
        c[0] * p[0], c[1] * p[1], c[2] * p[2], c[3],
        c[4] * p[0], c[5] * p[1], c[6] * p[2], c[7],
        c[8] * p[0], c[9] * p[1], c[10] * p[2], c[11],
        c[12] * p[0], c[13] * p[1], c[14] * p[2], c[15]
    );
};
/**
 *
 * @param row {number}
 * @param p {L5.Point}
 */
L5.Matrix.prototype.setRow = function (row, p) {
    var i = 4 * row;
    this.content[i] = p[0];
    this.content[i + 1] = p[1];
    this.content[i + 2] = p[2];
    this.content[i + 3] = p[3];
};
/**
 *
 * @param row {number}
 * @returns {L5.Point}
 */
L5.Matrix.prototype.getRow = function (row) {
    var i = 4 * row;
    var ret = new L5.Point
    (
        this.content[i],
        this.content[i + 1],
        this.content[i + 2]
    );
    ret[3] = this.content[i + 3];
    return ret;
};
/**
 * @param col {number}
 * @param p {L5.Vector}
 */
L5.Matrix.prototype.setColumn = function (col, p) {
    var s = col * 4;
    this.content[s] = p[0];
    this.content[s + 1] = p[1];
    this.content[s + 2] = p[2];
    this.content[s + 3] = p[3];
};
/**
 * @param col {number}
 * @param v {L5.Vector}
 */
L5.Matrix.prototype.getColumn = function (col, v) {
    var s = col * 4;
    v.set(
        this.content[s],
        this.content[s + 1],
        this.content[s + 2],
        this.content[s + 3]
    );
};

L5.Matrix.prototype.debug = function () {
    var str = '------------- matrix info ----------------\n';
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (j !== 0) {
                str += "\t\t";
            }
            str += this.content[i * 4 + j].toFixed(10);
        }
        str += "\n";
    }
    console.log(str);
};
Object.defineProperty(L5.Matrix, 'IDENTITY', {
        get: function () {
            return (new L5.Matrix()).identity();
        }
    }
);
Object.defineProperty(L5.Matrix, 'ZERO', {
        get: function () {
            return (new L5.Matrix()).zero();
        }
    }
);

/**
 *
 * @param p0 {L5.Vector}
 * @param p1 {L5.Vector}
 * @param p2 {L5.Vector}
 * @param p3 {L5.Point}
 * @returns {L5.Matrix}
 */
L5.Matrix.IPMake = function (p0, p1, p2, p3) {
    return new L5.Matrix(
        p0.x, p1.x, p2.x, p3.x,
        p0.y, p1.y, p2.y, p3.y,
        p0.z, p1.z, p2.z, p3.z,
        p0.w, p1.w, p2.w, p3.w
    );
};


/**
 * Set the transformation to a perspective projection matrix onto a specified plane.
 *
 * @param origin {L5.Point} plane's origin
 * @param normal {L5.Vector} unit-length normal for plane
 * @param eye {L5.Point} the origin of projection
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.makePerspectiveProjection = function (origin, normal, eye) {
    //     +-                                                 -+
    // M = | Dot(N,E-P)*I - E*N^T    -(Dot(N,E-P)*I - E*N^T)*E |
    //     |        -N^t                      Dot(N,E)         |
    //     +-                                                 -+
    //
    // where E is the eye point, P is a point on the plane, and N is a
    // unit-length plane normal.

    var dotND = normal.dot(eye.sub(origin)); // normal * (eye -origin)
    var nx = normal.x, ny = normal.y, nz = normal.z;
    var ex = eye.x, ey = eye.y, ez = eye.z;
    var t = this.content;

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
};

/**
 * Set the transformation to an oblique projection matrix onto a
 * specified plane.  The plane has an 'origin' point and a unit-length 'normal'.
 *
 * @param origin {L5.Point}
 * @param normal {L5.Vector}
 * @param direction {L5.Vector}
 */
L5.Matrix.prototype.makeObliqueProjection = function (origin, normal, direction) {
    // The projection plane is Dot(N,X-P) = 0 where N is a 3-by-1 unit-length
    // normal vector and P is a 3-by-1 point on the plane.  The projection
    // is oblique to the plane, in the direction of the 3-by-1 vector D.
    // Necessarily Dot(N,D) is not zero for this projection to make sense.
    // Given a 3-by-1 point U, compute the intersection of the line U+t*D
    // with the plane to obtain t = -Dot(N,U-P)/Dot(N,D).  Then
    //
    //   projection(U) = P + [I - D*N^T/Dot(N,D)]*(U-P)
    //
    // A 4-by-4 homogeneous transformation representing the projection is
    //
    //       +-                               -+
    //   M = | D*N^T - Dot(N,D)*I   -Dot(N,P)D |
    //       |          0^T          -Dot(N,D) |
    //       +-                               -+
    //
    // where M applies to [U^T 1]^T by M*[U^T 1]^T.  The matrix is chosen so
    // that M[3][3] > 0 whenever Dot(N,D) < 0 (projection is onto the
    // "positive side" of the plane).

    var dotND = normal.dot(direction);
    var dotNO = origin.dot(normal);
    var m = this.content;
    var dx = direction.x,
        dy = direction.y,
        dz = direction.z,
        nx = normal.x,
        ny = normal.y,
        nz = normal.z;

    m[0] = dx * nx - dotND;
    m[1] = dy * nx;
    m[2] = dz * nx;
    m[3] = 0;
    m[4] = dx * ny;
    m[5] = dy * ny - dotND;
    m[6] = dz * ny;
    m[7] = 0;
    m[8] = dx * nz;
    m[9] = dy * nz;
    m[10] = dz * nz - dotND;
    m[11] = 0;
    m[12] = -dotNO * dx;
    m[13] = -dotNO * dy;
    m[14] = -dotNO * dz;
    m[15] = -dotND;
};

/**
 * Set the transformation to a reflection matrix through a specified plane.
 *
 * @param origin {L5.Point} plane's origin
 * @param normal {L5.Vector} unit-length normal for plane
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.makeReflection = function (origin, normal) {
    var d = 2 * origin.dot(normal);
    var x = normal.x, y = normal.y, z = normal.z;
    var xy = x * y, xz = x * z, yz = y * z;
    this.set(
        1 - 2 * x * x, -2 * xy, -2 * xz, 0,
        -2 * xy, 1 - 2 * y * y, -2 * yz, 0,
        -2 * xz, -2 * yz, 1 - 2 * z * z, 0,
        d * x, d * y, d * z, 1
    );
};

/**
 *
 * @param v0 {L5.Vector}
 * @param v1 {L5.Vector}
 * @param v2 {L5.Vector}
 * @param p {L5.Point}
 * @param rows {boolean}
 */
L5.Matrix.fromVectorAndPoint = function (v0, v1, v2, p) {
    return new L5.Matrix(
        v0.x, v0.y, v0.z, v0.w,
        v1.x, v1.y, v1.z, v1.w,
        v2.x, v2.y, v2.z, v2.w,
        p.x, p.y, p.z, p.w
    );
};

/**
 * 生成旋转矩阵
 * @param axis {L5.Vector} 旋转轴
 * @param angle {number} 旋转角度
 * @return {L5.Matrix}
 */
L5.Matrix.makeRotation = function (axis, angle) {
    var c = L5.Math.cos(angle),
        s = L5.Math.sin(angle),
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

    return new L5.Matrix
    (
        oc * xx + c, xym + zs, xzm - ys, 0,
        xym - zs, yy * oc + c, yzm + xs, 0,
        xzm + ys, yzm - xs, zz * oc + c, 0,
        0, 0, 0, 1
    );
};
/**
 * 从数组创建矩阵
 * @param arr {ArrayBuffer|Array}
 * @returns {L5.Matrix}
 */
L5.Matrix.fromArray = function (arr) {
    L5.assert(arr.length >= 16, 'invalid array for Matrix.fromArray');

    return new L5.Matrix(
        arr[0], arr[1], arr[2], arr[3],
        arr[4], arr[5], arr[6], arr[7],
        arr[8], arr[9], arr[10], arr[11],
        arr[12], arr[13], arr[14], arr[15]
    );
};
/**
 * 生成旋转矩阵
 * @param axis {L5.Vector} 旋转轴
 * @param angle {number} 旋转角度
 * @return {L5.Matrix}
 */
L5.Matrix.makeRotateX = function (angle) {
    var c = L5.Math.cos(angle), s = L5.Math.sin(angle);

    return new L5.Matrix(
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    );
};
L5.Matrix.makeRotateY = function (angle) {
    var c = L5.Math.cos(angle), s = L5.Math.sin(angle);
    return new L5.Matrix(
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    );
};

/**
 * 生成缩放矩阵
 * @param scaleX {number}
 * @param scaleY {number}
 * @param scaleZ {number}
 * @returns {L5.Matrix}
 */
L5.Matrix.makeScale = function (scaleX, scaleY, scaleZ) {
    return new L5.Matrix
    (
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1
    );
};

L5.Matrix.makeTranslate = function (x, y, z) {
    return new L5.Matrix
    (
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    );
};
/**
 * 是否是单位矩阵
 * @returns {boolean}
 */
L5.Matrix.isIdentity = (function () {
    var idt = L5.Matrix.IDENTITY;

    return function (dst) {
        for (var i = 0, l = 16; i < l; ++i) {
            if (idt.content[i] !== dst.content[i]) {
                return false;
            }
        }
        return true;
    };
})();



