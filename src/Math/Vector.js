/**
 * Vector
 * @author lonphy
 * @version 1.0
 */

L5.Vector = function (x, y, z) {
    if (x instanceof Float32Array) {
        this._content = new Float32Array(4);
        this._content[0] = x[0];
        this._content[1] = x[1];
        this._content[2] = x[2];
        this._content[3] = 0;
    } else {
        this._content = new Float32Array([x || 0, y || 0, z || 0, 0]);
    }
};

L5.nameFix(L5.Vector, 'Vector');

L5.Vector.prototype = {
    constructor: L5.Vector,

    // getter and setter
    get x() {
        return this._content[0];
    },
    get y() {
        return this._content[1];
    },
    get z() {
        return this._content[2];
    },
    get w() {
        return this._content[3];
    },
    set x(val) {
        this._content[0] = val || 0;
    },
    set y(val) {
        this._content[1] = val || 0;
    },
    set z(val) {
        this._content[2] = val || 0;
    },
    set w(val) {
        this._content[3] = val || 0;
    },

    get 0() {
        return this._content[0];
    },
    get 1() {
        return this._content[1];
    },
    get 2() {
        return this._content[2];
    },
    get 3() {
        return this._content[3];
    },
    set 0(val) {
        this._content[0] = val || 0;
    },
    set 1(val) {
        this._content[1] = val || 0;
    },
    set 2(val) {
        this._content[2] = val || 0;
    },
    set 3(val) {
        this._content[3] = val || 0;
    }
};

/**
 * 复制
 * @param vec {L5.Vector}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.copy = function (vec) {
    this[0] = vec[0];
    this[1] = vec[1];
    this[2] = vec[2];
    this[3] = 0;
    return this;
};
/**
 * 赋值
 * @param x {float}
 * @param y {float}
 * @param z {float}
 * @param w {float}
 */
L5.Vector.prototype.set = function (x, y, z, w) {
    this[0] = x;
    this[1] = y;
    this[2] = z;
    this[3] = w || 0;
};

/**
 * 求向量长度
 * none side-effect
 * @returns {number}
 */
L5.Vector.prototype.length = function () {
    var x = this._content[0], y = this._content[1], z = this._content[2];
    return Math.sqrt(x * x + y * y + z * z);
};
/**
 * 是否相等
 * @param p {L5.Vector}
 * @returns {boolean}
 */
L5.Vector.prototype.equals = function (p) {
    return this._content[0] === p._content[0] &&
        this._content[1] === p._content[1] &&
        this._content[2] === p._content[2];
};
/**
 * 长度平方
 * none side-effect
 * @returns {number}
 */
L5.Vector.prototype.squaredLength = function () {
    return this._content[0] * this._content[0] +
        this._content[1] * this._content[1] +
        this._content[2] * this._content[2];
};
/**
 * 规格化向量
 * @returns {number}
 */
L5.Vector.prototype.normalize = function () {
    var length = this.length();
    if (length === 1) {
        return length;
    } else if (length > 0) {
        var invLength = 1 / length;
        this._content[0] *= invLength;
        this._content[1] *= invLength;
        this._content[2] *= invLength;
    } else {
        length = 0;
        this._content[0] = 0;
        this._content[1] = 0;
        this._content[2] = 0;
    }
    return length;
};
/**
 * calc cross to vec
 * none side-effect
 * @param vec {L5.Vector}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.cross = function (vec) {
    return new L5.Vector
    (
        this._content[1] * vec._content[2] - this._content[2] * vec._content[1],
        this._content[2] * vec._content[0] - this._content[0] * vec._content[2],
        this._content[0] * vec._content[1] - this._content[1] * vec._content[0]
    );
};
/**
 * calc unitCross to vec
 * none side-effect
 * @param vec {L5.Vector}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.unitCross = function (vec) {
    var a = this._content, b = vec._content,
        x = a[0], y = a[1], z = a[2],
        bx = b[0], by = b[1], bz = b[2];
    var cross = new L5.Vector
    (
        y * bz - z * by,
        z * bx - x * bz,
        x * by - y * bx
    );
    cross.normalize();
    return cross;
};


/**
 * add two Vector
 * none side-effect
 * @param v {L5.Vector}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.add = function (v) {
    return new L5.Vector
    (
        this._content[0] + v._content[0],
        this._content[1] + v._content[1],
        this._content[2] + v._content[2]
    );
};

/**
 * sub two Vector
 * none side-effect
 * @param v {L5.Vector}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.sub = function (v) {
    return new L5.Vector
    (
        this._content[0] - v._content[0],
        this._content[1] - v._content[1],
        this._content[2] - v._content[2]
    );
};

/**
 * scalar Vector
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.scalar = function (scalar) {
    return new L5.Vector
    (
        this._content[0] * scalar,
        this._content[1] * scalar,
        this._content[2] * scalar
    );
};
/**
 * div Vector
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector}
 */
L5.Vector.prototype.div = function (scalar) {
    if (scalar !== 0) {
        scalar = 1 / scalar;

        return new L5.Vector
        (
            this._content[0] * scalar,
            this._content[1] * scalar,
            this._content[2] * scalar
        );
    }
    return L5.Vector.ZERO;
};
/**
 * negative Vector
 * none side-effect
 * @returns {L5.Vector}
 */
L5.Vector.prototype.negative = function () {
    return new L5.Vector
    (
        -this._content[0],
        -this._content[1],
        -this._content[2]
    );
};
/**
 * dot two Vector
 * none side-effect
 * @param v {L5.Vector}
 * @returns {number}
 */
L5.Vector.prototype.dot = function (v) {
    return this._content[0] * v._content[0] +
        this._content[1] * v._content[1] +
        this._content[2] * v._content[2];
};


// const
Object.defineProperties(L5.Vector, {
    ZERO: {
        /**
         * @returns {L5.Vector}
         */
        get: function () {
            return new L5.Vector(0, 0, 0);
        }
    },
    UNIT_X: {
        /**
         * @returns {L5.Vector}
         */
        get: function () {
            return new L5.Vector(1, 0, 0);
        }
    },
    UNIT_Y: {
        /**
         * @returns {L5.Vector}
         */
        get: function () {
            return new L5.Vector(0, 1, 0);
        }
    },
    UNIT_Z: {
        /**
         * @returns {L5.Vector}
         */
        get: function () {
            return new L5.Vector(0, 0, 1);
        }
    }
});
/**
 * 正交化给定的3个向量
 *
 * u0 = normalize(v0)
 * u1 = normalize(v1 - dot(u0,v1)u0)
 * u2 = normalize(v2 - dot(u0,v2)u0 - dot(u1,v2)u1)
 *
 * @param vec0 {L5.Vector}
 * @param vec1 {L5.Vector}
 * @param vec2 {L5.Vector}
 */
L5.Vector.orthoNormalize = function (vec0, vec1, vec2) {
    vec0.normalize();

    var dot0 = vec0.dot(vec1);
    var t = vec0.scalar(dot0);
    vec1.copy(vec1.sub(t));
    vec1.normalize();

    var dot1 = vec1.dot(vec2);
    dot0 = vec0.dot(vec2);
    t = vec0.scalar(dot0);
    var t1 = vec1.scalar(dot1);
    vec2.copy(vec2.sub(t.add(t1)));
    vec2.normalize();
};

// Input vec2 must be a nonzero vector. The output is an orthonormal
// basis {vec0,vec1,vec2}.  The input vec2 is normalized by this function.
// If you know that vec2 is already unit length, use the function
// GenerateComplementBasis to compute vec0 and vec1.
// Input vec0 must be a unit-length vector.  The output vectors
// {vec0,vec1} are unit length and mutually perpendicular, and
// {vec0,vec1,vec2} is an orthonormal basis.
/**
 * @param vec0 {L5.Vector}
 * @param vec1 {L5.Vector}
 * @param vec2 {L5.Vector}
 */
L5.Vector.generateComplementBasis = function (vec0, vec1, vec2) {
    vec2.normalize();
    var invLength;

    if (L5.Math.abs(vec2.x) >= L5.Math.abs(vec2.y)) {
        // vec2.x or vec2.z is the largest magnitude component, swap them
        invLength = 1 / L5.Math.sqrt(vec2.x * vec2.x + vec2.z * vec2.z);
        vec0.x = -vec2.z * invLength;
        vec0.y = 0;
        vec0.z = +vec2.x * invLength;
        vec1.x = vec2.y * vec0.z;
        vec1.y = vec2.z * vec0.x - vec2.x * vec0.z;
        vec1.z = -vec2.y * vec0.x;
    }
    else {
        // vec2.y or vec2.z is the largest magnitude component, swap them
        invLength = 1 / L5.Math.sqrt(vec2.y * vec2.y + vec2.z * vec2.z);
        vec0.x = 0;
        vec0.y = +vec2.z * invLength;
        vec0.z = -vec2.y * invLength;
        vec1.x = vec2.y * vec0.z - vec2.mz * vec0.y;
        vec1.y = -vec2.x * vec0.z;
        vec1.z = vec2.x * vec0.y;
    }
};
