/**
 * Point
 * @author lonphy
 * @version 1.0
 */

L5.Point = function (
    x, y, z
) {
    if(x instanceof Float32Array) {
        this._content = new Float32Array(4);
        this._content[0] = x[0];
        this._content[1] = x[1];
        this._content[2] = x[2];
        this._content[3] = 1;
    } else {
        this._content = new Float32Array ([ x || 0, y || 0, z || 0, 1 ]);
    }
};

L5.nameFix (L5.Point, 'Point');

L5.Point.prototype = {
    constructor: L5.Point,

    // getter and setter
    get x () { return this._content[ 0 ]; },
    get y () { return this._content[ 1 ]; },
    get z () { return this._content[ 2 ]; },
    get w () { return this._content[ 3 ]; },
    set x (val) { this._content[ 0 ] = val || 0; },
    set y (val) { this._content[ 0 ] = val || 0; },
    set z (val) { this._content[ 0 ] = val || 0; },
    set w (val) { this._content[ 0 ] = val || 1; },

    get 0 () {return this._content[ 0 ];},
    get 1 () {return this._content[ 1 ];},
    get 2 () {return this._content[ 2 ];},
    get 3 () {return this._content[ 3 ];},
    set 0 (val) {this._content[ 0 ] = val || 0;},
    set 1 (val) {this._content[ 1 ] = val || 0;},
    set 2 (val) {this._content[ 2 ] = val || 0;},
    set 3 (val) {this._content[ 3 ] = val || 1;}
};

/**
 * 是否相等
 * @param p {L5.Point}
 * @returns {boolean}
 */
L5.Point.prototype.equals = function (p) {
    return this._content[ 0 ] === p._content[ 0 ] &&
        this._content[ 1 ] === p._content[ 1 ] &&
        this._content[ 2 ] === p._content[ 2 ] &&
        this._content[ 3 ] === p._content[ 3 ];
};

/**
 * 复制
 * @param p {L5.Point}
 * @returns {L5.Point}
 */
L5.Point.prototype.copy = function (p) {
    this._content[ 0 ] = p._content[ 0 ];
    this._content[ 1 ] = p._content[ 1 ];
    this._content[ 2 ] = p._content[ 2 ];
    this._content[ 3 ] = p._content[ 3 ];
    return this;
};

/**
 * 是否相等
 * @param p {L5.Point}
 * @returns {boolean}
 */
L5.Point.prototype.equals = function (p) {
    return this._content[ 0 ] === p._content[ 0 ] &&
        this._content[ 1 ] === p._content[ 1 ] &&
        this._content[ 2 ] === p._content[ 2 ] &&
        this._content[ 3 ] === p._content[ 3 ];
};

/**
 * 2个点相减，结果为向量
 * @param p {L5.Point}
 * @returns {L5.Vector}
 */
L5.Point.prototype.subP = function (p) {
    return new L5.Vector
    (
        this._content[ 0 ] - p._content[ 0 ],
        this._content[ 1 ] - p._content[ 1 ],
        this._content[ 2 ] - p._content[ 2 ]
    );
};

/**
 * 点减向量，结果为点
 * @param v {L5.Vector}
 * @returns {L5.Point}
 */
L5.Point.prototype.sub = function (v) {
    return new L5.Point
    (
        this._content[ 0 ] - v.x,
        this._content[ 1 ] - v.y,
        this._content[ 2 ] - v.z
    );
};
/**
 * 点减向量，结果为点
 * @param v {L5.Vector}
 * @returns {L5.Point}
 */
L5.Point.prototype.add = function (v) {
    return new L5.Point
    (
        this._content[ 0 ] + v.x,
        this._content[ 1 ] + v.y,
        this._content[ 2 ] + v.z
    );
};

/**
 * 点乘标量
 * @param scalar {number}
 * @returns {L5.Point}
 */
L5.Point.prototype.scalar = function (scalar) {
    return new L5.Point
    (
        scalar * this._content[ 0 ],
        scalar * this._content[ 1 ],
        scalar * this._content[ 2 ]
    );
};

/**
 * div Point
 * @param scalar {number}
 * @returns {L5.Point}
 */
L5.Point.prototype.div = function (scalar) {
    if (scalar !== 0) {
        scalar = 1 / scalar;

        return new L5.Point
        (
            this.content[ 0 ] * scalar,
            this.content[ 1 ] * scalar,
            this.content[ 2 ] * scalar
        );
    }
    var max = L5.Math.MAX_REAL;
    return new L5.Point (max, max, max);
};

/**
 * 求中心对称点
 * @returns {L5.Point}
 */
L5.Point.prototype.negative = function () {
    return new L5.Point
    (
        -this._content[ 0 ],
        -this._content[ 1 ],
        -this._content[ 2 ]
    );
};

/**
 * 点与向量求点积
 * @param vec {L5.Vector}
 * @returns {number}
 */
L5.Point.prototype.dot = function (vec) {
    return this._content[ 0 ] * vec.x + this._content[ 1 ] * vec.y + this._content[ 2 ] * vec.z;
};

L5.Point.ORIGIN = new L5.Point (0, 0, 0);