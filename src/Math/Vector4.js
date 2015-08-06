/**
 * Vector4
 * @author lonphy
 * @version 1.0
 */

L5.Vector4 = function (
    x, y, z, w
) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
};

L5.Vector4.name = "Vector4";

// const
L5.Vector4.ZERO   = new L5.Vector4(0, 0, 0, 0);
L5.Vector4.UINT_X = new L5.Vector4(1, 0, 0, 0);
L5.Vector4.UINT_Y = new L5.Vector4(0, 1, 0, 0);
L5.Vector4.UINT_Z = new L5.Vector4(0, 0, 1, 0);
L5.Vector4.UINT_W = new L5.Vector4(0, 0, 0, 1);
L5.Vector4.ONE    = new L5.Vector4(1, 1, 1, 1);

/**
 * 计算向量的极值，返回最大向量和最小向量
 * @param vectors {Array<L5.Vector4>}
 * @returns {Array<L5.Vector4>} (min,max)
 */
L5.Vector4.computeExtremes = function(
    vectors
) {
    var min = vectors[0].clone();
    var max = min.clone();
    for (var i= 0,len=vectors.length; i<len;++i)
    {
        if (vectors[i].x < min.x)
        {
            min.x = vectors[i].x;
        }
        else if (vectors[i].x > max.x)
        {
            max.x = vectors[i].x;
        }

        if (vectors[i].y < min.y)
        {
            min.y = vectors[i].y;
        }
        else if (vectors[i].y > max.y)
        {
            max.y = vectors[i].y;
        }

        if (vectors[i].z < min.z)
        {
            min.z = vectors[i].z;
        }
        else if (vectors[i].z > max.z)
        {
            max.z = vectors[i].z;
        }

        if (vectors[i].w < min.w)
        {
            min.w = vectors[i].w;
        }
        else if (vectors[i].w > max.w)
        {
            max.w = vectors[i].w;
        }
    }

    return [min, max];
};

// method
/**
 * copy value to this
 * @param v {L5.Vector4}
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.copy = function (v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
};

/**
 * return vector's length
 * none side-effect
 * @returns {number}
 */
L5.Vector4.prototype.length = function () {
    return Math.sqrt(
        this.x * this.x +
        this.y * this.y +
        this.z * this.z +
        this.w * this.w
    );
};

/**
 * return vector's length pow 2
 * none side-effect
 * @returns {number}
 */
L5.Vector4.prototype.squaredLength = function () {
    return this.x * this.x +
           this.y * this.y +
           this.z * this.z +
           this.w * this.w;
};

/**
 * normalize Vector
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.normalize = function () {
    var length = this.length();
    if (length > 0) {
        var invLength = 1 / length;
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
        this.w *= invLength;
    }
    else
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }
    return this;
};
/**
 * dot this * v
 * none side-effect
 * @param v {L5.Vector4}
 * @returns {number}
 */
L5.Vector4.prototype.dot = function (v) {
    return  this.x * v.x +
            this.y * v.y +
            this.z * v.z +
            this.w * v.w;
};

/**
 * add two Vector
 * none side-effect
 *
 * @param v {L5.Vector4}
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.add = function (
    v
) {
    return new L5.Vector4
    (
        this.x + v.x,
        this.y + v.y,
        this.z + v.z,
        this.w + v.w
    );
};

/**
 * sub two Vector
 * none side-effect
 * @param v {L5.Vector4}
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.sub = function (
    v
) {
    return new L5.Vector4
    (
        this.x - v.x,
        this.y - v.y,
        this.z - v.z,
        this.w - v.w
    );
};

/**
 * scalar Vector4
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.scalar = function (
    scalar
) {
    return new L5.Vector4
    (
        this.x * scalar,
        this.y * scalar,
        this.z * scalar,
        this.w * scalar
    );
};

/**
 * div Vector
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.div = function (
    scalar
) {
    if (scalar !== 0) {
        scalar = 1 / scalar;

        return new L5.Vector4
        (
            this.x * scalar,
            this.y * scalar,
            this.z * scalar,
            this.w * scalar
        );
    }

    var max = L5.Math.MAX_REAL;
    return new L5.Vector4(max, max, max, max);
};
/**
 * negative APoint
 * none side-effect
 * @returns {L5.Vector4}
 */
L5.Vector4.prototype.negative = function () {
    return new L5.Vector4
    (
        -this.x,
        -this.y,
        -this.z,
        -this.w
    );
};
