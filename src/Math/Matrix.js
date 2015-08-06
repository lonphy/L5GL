/**
 * 4阶矩阵 - L5
 * @author lonphy
 * @version 0.1
 */
L5.Matrix = function (
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33
) {
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
L5.Matrix.prototype.copy = function (
    mat
) {

    this.content[ 0 ]  = mat.content[ 0 ];
    this.content[ 1 ]  = mat.content[ 1 ];
    this.content[ 2 ]  = mat.content[ 2 ];
    this.content[ 3 ]  = mat.content[ 3 ];
    this.content[ 4 ]  = mat.content[ 4 ];
    this.content[ 5 ]  = mat.content[ 5 ];
    this.content[ 6 ]  = mat.content[ 6 ];
    this.content[ 7 ]  = mat.content[ 7 ];
    this.content[ 8 ]  = mat.content[ 8 ];
    this.content[ 9 ]  = mat.content[ 9 ];
    this.content[ 10 ] = mat.content[ 10 ];
    this.content[ 11 ] = mat.content[ 11 ];
    this.content[ 12 ] = mat.content[ 12 ];
    this.content[ 13 ] = mat.content[ 13 ];
    this.content[ 14 ] = mat.content[ 14 ];
    this.content[ 15 ] = mat.content[ 15 ];
    return this;
};

/**
 * 判断2个矩阵是否相等
 * @param m {L5.Matrix}
 * @returns {boolean}
 */
L5.Matrix.prototype.equals = function (
    m
) {
    for (var i = 0, l = 16; i < l; ++i) {
        if (this.content[ i ] != m.content[ i ]) {
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
L5.Matrix.prototype.notEquals = function (
    m
) {
    for (var i = 0, l = 16; i < l; ++i) {
        if (this.content[ i ] != m.content[ i ]) {
            return true;
        }
    }
    return false;
};

/**
 * 置零
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.zero     = function () {
    this.content[ 0 ] = this.content[ 1 ] = this.content[ 2 ] = this.content[ 3 ] = 0;
    this.content[ 4 ] = this.content[ 5 ] = this.content[ 6 ] = this.content[ 7 ] = 0;
    this.content[ 8 ] = this.content[ 9 ] = this.content[ 10 ] = this.content[ 11 ] = 0;
    this.content[ 10 ] = this.content[ 13 ] = this.content[ 14 ] = this.content[ 15 ] = 0;
    return this;
};
/**
 * 置单位矩阵
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.identity = function () {
    this.content[ 0 ] = this.content[ 5 ] = this.content[ 10 ] = this.content[ 15 ] = 1;
    this.content[ 4 ] = this.content[ 1 ] = this.content[ 6 ] = this.content[ 7 ] = 0;
    this.content[ 8 ] = this.content[ 9 ] = this.content[ 2 ] = this.content[ 11 ] = 0;
    this.content[ 10 ] = this.content[ 13 ] = this.content[ 14 ] = this.content[ 3 ] = 0;
    return this;
};

/**
 * 加法
 * @param mat {L5.Matrix}
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.add = function (
    mat
) {
    return new L5.Matrix
    (
        this.content[ 0 ] + mat.content[ 0 ],
        this.content[ 1 ] + mat.content[ 1 ],
        this.content[ 2 ] + mat.content[ 2 ],
        this.content[ 3 ] + mat.content[ 3 ],

        this.content[ 4 ] + mat.content[ 4 ],
        this.content[ 5 ] + mat.content[ 5 ],
        this.content[ 6 ] + mat.content[ 6 ],
        this.content[ 7 ] + mat.content[ 7 ],

        this.content[ 8 ] + mat.content[ 8 ],
        this.content[ 9 ] + mat.content[ 9 ],
        this.content[ 10 ] + mat.content[ 10 ],
        this.content[ 11 ] + mat.content[ 11 ],

        this.content[ 12 ] + mat.content[ 12 ],
        this.content[ 13 ] + mat.content[ 13 ],
        this.content[ 14 ] + mat.content[ 14 ],
        this.content[ 15 ] + mat.content[ 15 ]
    );
};

/**
 * 减法
 * @param mat {L5.Matrix}
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.sub = function (
    mat
) {
    return new L5.Matrix
    (
        this.content[ 0 ] - mat.content[ 0 ],
        this.content[ 1 ] - mat.content[ 1 ],
        this.content[ 2 ] - mat.content[ 2 ],
        this.content[ 3 ] - mat.content[ 3 ],

        this.content[ 4 ] - mat.content[ 4 ],
        this.content[ 5 ] - mat.content[ 5 ],
        this.content[ 6 ] - mat.content[ 6 ],
        this.content[ 7 ] - mat.content[ 7 ],

        this.content[ 8 ] - mat.content[ 8 ],
        this.content[ 9 ] - mat.content[ 9 ],
        this.content[ 10 ] - mat.content[ 10 ],
        this.content[ 11 ] - mat.content[ 11 ],

        this.content[ 12 ] - mat.content[ 12 ],
        this.content[ 13 ] - mat.content[ 13 ],
        this.content[ 14 ] - mat.content[ 14 ],
        this.content[ 15 ] - mat.content[ 15 ]
    );
};

/**
 * 转置
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.transpose = function () {
    return new L5.Matrix (
        this.content[ 0 ], this.content[ 4 ], this.content[ 8 ], this.content[ 12 ],
        this.content[ 1 ], this.content[ 5 ], this.content[ 9 ], this.content[ 13 ],
        this.content[ 2 ], this.content[ 6 ], this.content[ 10 ], this.content[ 14 ],
        this.content[ 3 ], this.content[ 7 ], this.content[ 11 ], this.content[ 15 ]
    );
};

/**
 * 求逆
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.inverse = function () {
    var m00 = this.content[ 0 ], m01 = this.content[ 1 ], m02 = this.content[ 2 ], m03 = this.content[ 3 ],
        m10 = this.content[ 4 ], m11 = this.content[ 5 ], m12 = this.content[ 6 ], m13 = this.content[ 7 ],
        m20 = this.content[ 8 ], m21 = this.content[ 9 ], m22 = this.content[ 10 ], m23 = this.content[ 11 ],
        m30 = this.content[ 12 ], m31 = this.content[ 13 ], m32 = this.content[ 14 ], m33 = this.content[ 15 ];

    var a0 = m00 * m11 - m01 * m10,
        a1 = m00 * m12 - m02 * m10,
        a2 = m00 * m13 - m03 * m10,
        a3 = m01 * m12 - m02 * m11,
        a4 = m01 * m13 - m03 * m11,
        a5 = m02 * m13 - m03 * m12,
        b0 = m20 * m31 - m21 * m30,
        b1 = m20 * m32 - m22 * m30,
        b2 = m20 * m33 - m23 * m30,
        b3 = m21 * m32 - m22 * m31,
        b4 = m21 * m33 - m23 * m31,
        b5 = m22 * m33 - m23 * m32;

    var det     = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
    var inverse = new L5.Matrix
    (
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    );
    if (L5.Math.abs (det) <= 0.0001) {
        return inverse;
    }

    det = 1 / det;

    inverse.content[ 0 ]  = (+m11 * b5 - m12 * b4 + m13 * b3) * det;
    inverse.content[ 4 ]  = (-m10 * b5 + m12 * b2 - m13 * b1) * det;
    inverse.content[ 8 ]  = (+m10 * b4 - m11 * b2 + m13 * b0) * det;
    inverse.content[ 12 ] = (-m10 * b3 + m11 * b1 - m12 * b0) * det;
    inverse.content[ 1 ]  = (-m01 * b5 + m02 * b4 - m03 * b3) * det;
    inverse.content[ 5 ]  = (+m00 * b5 - m02 * b2 + m03 * b1) * det;
    inverse.content[ 9 ]  = (-m00 * b4 + m01 * b2 - m03 * b0) * det;
    inverse.content[ 13 ] = (+m00 * b3 - m01 * b1 + m02 * b0) * det;
    inverse.content[ 2 ]  = (+m31 * a5 - m32 * a4 + m33 * a3) * det;
    inverse.content[ 6 ]  = (-m30 * a5 + m32 * a2 - m33 * a1) * det;
    inverse.content[ 10 ] = (+m30 * a4 - m31 * a2 + m33 * a0) * det;
    inverse.content[ 14 ] = (-m30 * a3 + m31 * a1 - m32 * a0) * det;
    inverse.content[ 3 ]  = (-m21 * a5 + m22 * a4 - m23 * a3) * det;
    inverse.content[ 7 ]  = (+m20 * a5 - m22 * a2 + m23 * a1) * det;
    inverse.content[ 11 ] = (-m20 * a4 + m21 * a2 - m23 * a0) * det;
    inverse.content[ 15 ] = (+m20 * a3 - m21 * a1 + m22 * a0) * det;

    return inverse;
};

/**
 * 伴随矩阵
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.adjoint = function () {
    var m00 = this.content[ 0 ], m01 = this.content[ 1 ], m02 = this.content[ 2 ], m03 = this.content[ 3 ];
    var m10 = this.content[ 4 ], m11 = this.content[ 5 ], m12 = this.content[ 6 ], m13 = this.content[ 7 ];
    var m20 = this.content[ 8 ], m21 = this.content[ 9 ], m22 = this.content[ 10 ], m23 = this.content[ 11 ];
    var m30 = this.content[ 12 ], m31 = this.content[ 13 ], m32 = this.content[ 14 ], m33 = this.content[ 15 ];


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
 * 求行列式的值
 * @returns {number}
 */
L5.Matrix.prototype.det      = function () {
    var a0 = this.content[ 0 ] * this.content[ 5 ] - this.content[ 1 ] * this.content[ 4 ];
    var a1 = this.content[ 0 ] * this.content[ 6 ] - this.content[ 2 ] * this.content[ 4 ];
    var a2 = this.content[ 0 ] * this.content[ 7 ] - this.content[ 3 ] * this.content[ 4 ];
    var a3 = this.content[ 1 ] * this.content[ 6 ] - this.content[ 2 ] * this.content[ 5 ];
    var a4 = this.content[ 1 ] * this.content[ 7 ] - this.content[ 3 ] * this.content[ 5 ];
    var a5 = this.content[ 2 ] * this.content[ 7 ] - this.content[ 3 ] * this.content[ 6 ];
    var b0 = this.content[ 8 ] * this.content[ 13 ] - this.content[ 9 ] * this.content[ 12 ];
    var b1 = this.content[ 8 ] * this.content[ 14 ] - this.content[ 10 ] * this.content[ 12 ];
    var b2 = this.content[ 8 ] * this.content[ 15 ] - this.content[ 11 ] * this.content[ 12 ];
    var b3 = this.content[ 9 ] * this.content[ 14 ] - this.content[ 10 ] * this.content[ 13 ];
    var b4 = this.content[ 9 ] * this.content[ 15 ] - this.content[ 11 ] * this.content[ 13 ];
    var b5 = this.content[ 10 ] * this.content[ 15 ] - this.content[ 11 ] * this.content[ 14 ];
    return a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
};
/**
 * 对点或向量应用矩阵
 * @param p {L5.Point|L5.Vector}
 * @return {L5.Point|L5.Vector}
 */
L5.Matrix.prototype.mulPoint = function (p) {
    return new p.constructor (
        this.content[ 0 ] * p.x + this.content[ 1 ] * p.y + this.content[ 2 ] * p.z + this.content[ 3 ] * p.w,
        this.content[ 4 ] * p.x + this.content[ 5 ] * p.y + this.content[ 6 ] * p.z + this.content[ 7 ] * p.w,
        this.content[ 8 ] * p.x + this.content[ 9 ] * p.y + this.content[ 10 ] * p.z + this.content[ 11 ] * p.w,
        this.content[ 12 ] * p.x + this.content[ 13 ] * p.y + this.content[ 14 ] * p.z + this.content[ 15 ] * p.w
    );
};
/**
 * 2矩阵相乘
 * @param m {L5.Matrix}
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.mul      = function (m) {
    var a00 = this.content[ 0 ], a01 = this.content[ 1 ], a02 = this.content[ 2 ], a03 = this.content[ 3 ],
        a10 = this.content[ 4 ], a11 = this.content[ 5 ], a12 = this.content[ 6 ], a13 = this.content[ 7 ],
        a20 = this.content[ 8 ], a21 = this.content[ 9 ], a22 = this.content[ 10 ], a23 = this.content[ 11 ],
        a30 = this.content[ 12 ], a31 = this.content[ 13 ], a32 = this.content[ 14 ], a33 = this.content[ 15 ];

    var b00 = m.content[ 0 ], b01 = m.content[ 1 ], b02 = m.content[ 2 ], b03 = m.content[ 3 ],
        b10 = m.content[ 4 ], b11 = m.content[ 5 ], b12 = m.content[ 6 ], b13 = m.content[ 7 ],
        b20 = m.content[ 8 ], b21 = m.content[ 9 ], b22 = m.content[ 10 ], b23 = m.content[ 11 ],
        b30 = m.content[ 12 ], b31 = m.content[ 13 ], b32 = m.content[ 14 ], b33 = m.content[ 15 ];


    return new L5.Matrix
    (
        a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
        a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
        a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
        a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,

        a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
        a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
        a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
        a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,

        a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
        a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
        a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
        a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,

        a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
        a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
        a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
        a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
    );
};

/**
 * 对点数组应用矩阵
 * @param num {number}
 * @param points {Array<L5.Point>}
 */
L5.Matrix.prototype.batchMul = function (
    num, points
) {
    var ret = new Array (points.length);
    for (var i = 0; i < num; ++i) {
        ret[ i ] = this.mulPoint (points[ i ]);
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
    var invLength = L5.Math.invSqrt (
        this.content[ 0 ] * this.content[ 0 ] +
        this.content[ 4 ] * this.content[ 4 ] +
        this.content[ 8 ] * this.content[ 8 ]);

    this.content[ 0 ] *= invLength;
    this.content[ 4 ] *= invLength;
    this.content[ 8 ] *= invLength;

    // Compute q1.
    var dot0 = this.content[ 0 ] * this.content[ 1 ] +
        this.content[ 4 ] * this.content[ 5 ] +
        this.content[ 8 ] * this.content[ 9 ];

    this.content[ 1 ] -= dot0 * this.content[ 0 ];
    this.content[ 5 ] -= dot0 * this.content[ 4 ];
    this.content[ 9 ] -= dot0 * this.content[ 8 ];

    invLength = L5.Math.invSqrt (
        this.content[ 1 ] * this.content[ 1 ] +
        this.content[ 5 ] * this.content[ 5 ] +
        this.content[ 9 ] * this.content[ 9 ]);

    this.content[ 1 ] *= invLength;
    this.content[ 5 ] *= invLength;
    this.content[ 9 ] *= invLength;

    // Compute q2.
    var dot1 = this.content[ 1 ] * this.content[ 2 ] +
        this.content[ 5 ] * this.content[ 6 ] +
        this.content[ 9 ] * this.content[ 10 ];

    dot0 = this.content[ 0 ] * this.content[ 2 ] +
        this.content[ 4 ] * this.content[ 6 ] +
        this.content[ 8 ] * this.content[ 10 ];

    this.content[ 2 ] -= dot0 * this.content[ 0 ] + dot1 * this.content[ 1 ];
    this.content[ 6 ] -= dot0 * this.content[ 4 ] + dot1 * this.content[ 5 ];
    this.content[ 10 ] -= dot0 * this.content[ 8 ] + dot1 * this.content[ 9 ];

    invLength = L5.Math.invSqrt (
        this.content[ 2 ] * this.content[ 2 ] +
        this.content[ 6 ] * this.content[ 6 ] +
        this.content[ 10 ] * this.content[ 10 ]);

    this.content[ 2 ] *= invLength;
    this.content[ 6 ] *= invLength;
    this.content[ 10 ] *= invLength;
    return this;
};

/**
 * 获取矩阵R行N列的值
 * @param r {number} 行
 * @param c {number} 列
 * @returns {number}
 */
L5.Matrix.prototype.item = function (
    r, c
) {
    return this.content[ c + 4 * r ];
};
/**
 * 设置矩阵R行N列的值
 * @param r {number} 行
 * @param c {number} 列
 * @param value {number} 值
 * @returns {number}
 */
L5.Matrix.prototype.setItem = function (
    r, c, value
) {
    this.content[ c + 4 * r ] = value;
};

/**
 *
 * @param m {L5.Matrix}
 * @returns {L5.Matrix}
 */
L5.Matrix.prototype.xMatrix = function (m) {
    var a00 = this.content[ 0 ], a01 = this.content[ 1 ], a02 = this.content[ 2 ], a03 = this.content[ 3 ],
        a10 = this.content[ 4 ], a11 = this.content[ 5 ], a12 = this.content[ 6 ], a13 = this.content[ 7 ],
        a20 = this.content[ 8 ], a21 = this.content[ 9 ], a22 = this.content[ 10 ], a23 = this.content[ 11 ],
        a30 = this.content[ 12 ], a31 = this.content[ 13 ], a32 = this.content[ 14 ], a33 = this.content[ 15 ];

    var b00 = m.content[ 0 ], b01 = m.content[ 1 ], b02 = m.content[ 2 ], b03 = m.content[ 3 ],
        b10 = m.content[ 4 ], b11 = m.content[ 5 ], b12 = m.content[ 6 ], b13 = m.content[ 7 ],
        b20 = m.content[ 8 ], b21 = m.content[ 9 ], b22 = m.content[ 10 ], b23 = m.content[ 11 ],
        b30 = m.content[ 12 ], b31 = m.content[ 13 ], b32 = m.content[ 14 ], b33 = m.content[ 15 ];

    return new L5.Matrix (
        a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
        a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
        a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
        a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,

        a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
        a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
        a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
        a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,

        a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
        a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
        a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
        a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,

        a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
        a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
        a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
        a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
    );
};

/**
 * 对点或向量应用矩阵
 * @param p {L5.Point|L5.Vector}
 * @return {L5.Point|L5.Vector}
 */
L5.Matrix.prototype.xPoint = function (p) {
    return new p.constructor (
        this.content[ 0 ] * p.x + this.content[ 1 ] * p.y + this.content[ 2 ] * p.z + this.content[ 3 ] * p.w,
        this.content[ 4 ] * p.x + this.content[ 5 ] * p.y + this.content[ 6 ] * p.z + this.content[ 7 ] * p.w,
        this.content[ 8 ] * p.x + this.content[ 9 ] * p.y + this.content[ 10 ] * p.z + this.content[ 11 ] * p.w,
        this.content[ 12 ] * p.x + this.content[ 13 ] * p.y + this.content[ 14 ] * p.z + this.content[ 15 ] * p.w
    );
};
/**
 *
 * @param row {number}
 * @param p {L5.Point}
 */
L5.Matrix.prototype.setRow = function(
    row, p
) {
    var i = 4*row;
    this.content[i  ] = p[0];
    this.content[i+1] = p[1];
    this.content[i+2] = p[2];
    this.content[i+3] = p[3];
};
/**
 *
 * @param row {number}
 * @returns {L5.Point}
 */
L5.Matrix.prototype.getRow = function(
    row
) {
    var i = 4*row;
    var ret =  new L5.Point
    (
        this.content[i  ],
        this.content[i+1],
        this.content[i+2]
    );
    ret[3] = this.content[i+3];
    return ret;
};
/**
 * @param col {number}
 * @param p {L5.Point}
 */
L5.Matrix.prototype.setColumn = function(
    col, p
) {
    this.content[col   ] = p[0];
    this.content[col+4 ] = p[1];
    this.content[col+8 ] = p[2];
    this.content[col+12] = p[3];
};
/**
 * @param col {number}
 * @returns {L5.Point}
 */
L5.Matrix.prototype.getColumn = function(
    col
) {
    var ret =  new L5.Point
    (
        this.content[col  ],
        this.content[col+4],
        this.content[col+8]
    );
    ret[3] = this.content[col+12];
    return ret;
};

L5.Matrix.IDENTIRY = (new L5.Matrix ()).identity ();
L5.Matrix.ZERO     = (new L5.Matrix ()).zero ();

/**
 *
 * @param p0 {L5.Vector}
 * @param p1 {L5.Vector}
 * @param p2 {L5.Vector}
 * @param p3 {L5.Point}
 * @returns {L5.Matrix}
 */
L5.Matrix.IPMake = function (
    p0, p1, p2, p3
) {
    return new L5.Matrix (
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
L5.Matrix.makePerspectiveProjection = function (
    origin, normal, eye
) {
    //     +-                                                 -+
    // M = | Dot(N,E-P)*I - E*N^T    -(Dot(N,E-P)*I - E*N^T)*E |
    //     |        -N^t                      Dot(N,E)         |
    //     +-                                                 -+
    //
    // where E is the eye point, P is a point on the plane, and N is a
    // unit-length plane normal.

    var dotND = normal.dot (eye.sub (origin)); // normal * (eye -origin)
    var nx  = normal.x, ny = normal.y, nz = normal.z;
    var ex  = eye.x, ey = eye.y, ez = eye.z;
    var ret = new L5.Matrix ();

    ret.content[ 0 ]  = dotND - ex * nx;
    ret.content[ 1 ]  = -ex * ny;
    ret.content[ 2 ]  = -ex * nz;
    ret.content[ 3 ]  = -(ret.content[ 0 ] * ex + ret.content[ 1 ] * ey + ret.content[ 2 ] * ez);
    ret.content[ 4 ]  = -ey * nx;
    ret.content[ 5 ]  = dotND - ey * ny;
    ret.content[ 6 ]  = -ey * nz;
    ret.content[ 7 ]  = -(ret.content[ 4 ] * ex + ret.content[ 5 ] * ey + ret.content[ 6 ] * ez);
    ret.content[ 8 ]  = -ez * nx;
    ret.content[ 9 ]  = -ez * ny;
    ret.content[ 10 ] = dotND - ez * nz;
    ret.content[ 11 ] = -(ret.content[ 8 ] * ex + ret.content[ 9 ] * ey + ret.content[ 10 ] * ez);
    ret.content[ 12 ] = -nx;
    ret.content[ 13 ] = -ny;
    ret.content[ 14 ] = -nz;
    ret.content[ 15 ] = eye.dot (normal);
    return ret;
};

/**
 * Set the transformation to a reflection matrix through a specified plane.
 *
 * @param origin {L5.Point} plane's origin
 * @param normal {L5.Vector} unit-length normal for plane
 * @returns {L5.Matrix}
 */
L5.Matrix.makeReflection = function (
    origin, normal
) {
    //     +-                         -+
    // M = | I-2*N*N^T    2*Dot(N,P)*N |
    //     |     0^T            1      |
    //     +-                         -+
    //
    // where P is a point on the plane and N is a unit-length plane normal.

    var twoDotNO = 2 * origin.dot (normal);
    var nx       = normal.x, ny = normal.y, nz = normal.z;
    var nxy      = nx * ny, nxz = nx * nz, nyz = ny * nz;

    return new L5.Matrix
    (
        1 - 2 * nx * nx, -2 * nxy, -2 * nxz, twoDotNO * nx,
        -2 * nxy, 1 - 2 * ny * ny, -2 * nyz, twoDotNO * ny,
        -2 * nxz, -2 * nyz, 1 - 2 * nz * nz, twoDotNO * nz,
        0, 0, 0, 1
    );
};


/**
 * 生成旋转矩阵
 * @param axis {L5.Vector} 旋转轴
 * @param angle {number} 旋转角度
 * @return {L5.Matrix}
 */
L5.Matrix.makeRotation = function (
    axis, angle
) {
    var c   = L5.Math.cos (angle),
        s   = L5.Math.sin (angle),
        x   = axis.x, y = axis.y, z = axis.z,
        oc  = 1 - c,
        xx  = x * x,
        yy  = y * y,
        zz  = z * z,
        xym = x * y * oc,
        xzm = x * z * oc,
        yzm = y * z * oc,
        xs  = x * s,
        ys  = y * s,
        zs  = z * s;

    return new L5.Matrix
    (
        xx * oc + c, xym - zs, xzm + ys, 0,
        xym + zs, yy * oc + c, yzm - xs, 0,
        xzm - ys, yzm + xs, zz * oc + c, 0,
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
L5.Matrix.makeScale = function (
    scaleX, scaleY, scaleZ
) {
    return new L5.Matrix
    (
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1
    );
};

/**
 * 是否是单位矩阵
 * @returns {boolean}
 */
L5.Matrix.isIdentity = (function () {
    var idt = L5.Matrix.IDENTIRY;

    return function (dst) {
        for (var i = 0, l = 16; i < l; ++i) {
            if (idt.content[ i ] !== dst.content[ i ]) {
                return false;
            }
        }
        return true;
    };
}) ();



