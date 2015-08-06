/**
 * Vector2
 * @author lonphy
 * @version 1.0
 */

L5.Vector2 = function (
    x, y
) {
    this.x = x || 0;
    this.y = y || 0;
};

L5.Vector2.name = "Vector2";

// const
L5.Vector2.ZERO   = new L5.Vector2(0, 0);
L5.Vector2.UINT_X = new L5.Vector2(1, 0);
L5.Vector2.UINT_Y = new L5.Vector2(0, 1);
L5.Vector2.ONE    = new L5.Vector2(1, 1);

/**
 * 计算向量的极值，返回最大向量和最小向量
 * @param vectors {Array<L5.Vector2>}
 * @returns {Array<L5.Vector2>} (min,max)
 */
L5.Vector2.computeExtremes = function(
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
    }

    return [min, max];
};
/**
 *
 * @param u {L5.Vector2}
 * @param v {L5.Vector2}
 * @returns {L5.Vector2}
 */
L5.Vector2.orthoNormalize = function (
    u, v
) {
    // If the input vectors are v0 and v1, then the Gram-Schmidt
    // orthonormalization produces vectors u0 and u1 as follows,
    //
    //   u0 = v0/|v0|
    //   u1 = (v1-(u0*v1)u0)/|v1-(u0*v1)u0|
    //
    // where |A| indicates length of vector A and A*B indicates dot
    // product of vectors A and B.

    // Compute u0.
    u.normalize();

    // Compute u1.
    var dot0 = u.dot(v);
    var d = v.sub(u.scalar(dot0));
    d.normalize();
    v.copy(d);
};
/**
 * Input V must be a nonzero vector.  The output is an orthonormal basis {U,V}.
 * The input V is normalized by this function.
 * If you know V is already unit length, use U = V.Perp().
 * @param u {L5.Vector2}
 * @param v {L5.Vector2}
*/
L5.Vector2.generateOrthonormalBasis = function (
        u, v
) {
    v.normalize();
    u.copy(v.perp());
};

// Compute the barycentric coordinates of the point V with respect to the
// triangle <V0,V1,V2>, V = b0*V0 + b1*V1 + b2*V2, where b0 + b1 + b2 = 1.
// The return value is 'true' iff {V0,V1,V2} is a linearly independent
// set.  Numerically, this is measured by |det[V0 V1 V2]| <= epsilon.
// The values bary[...] are valid only when the return value is 'true'
// but set to zero when the return value is 'false'.
L5.Vector2.prototype.getBarycentrics = function (
    v0, v1, v2, bary, epsilon
){
    // Compute the vectors relative to V2 of the triangle.
    var diff = [
        v0.sub(v2),
        v1.sub(v2),
        this.sub(v2)
    ];
    var det = diff[0].dotPerp(diff[1]);
    if (L5.Math.abs(det) > epsilon)
    {
        var invDet = 1/det;
        bary[0] = diff[2].dotPerp(diff[1])*invDet;
        bary[1] = diff[0].dotPerp(diff[2])*invDet;
        bary[2] = 1 - bary[0] - bary[1];
        return true;
    }

    for (var i = 0; i < 3; ++i)
    {
        bary[i] = 0;
    }

    return false;
};

// method
/**
 * copy value to this
 * @param v {L5.Vector2}
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.copy = function (v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};

/**
 * return vector's length
 * none side-effect
 * @returns {number}
 */
L5.Vector2.prototype.length = function () {
    return Math.sqrt(this.x*this.x + this.y*this.y);
};

/**
 * return vector's length pow 2
 * none side-effect
 * @returns {number}
 */
L5.Vector2.prototype.squaredLength = function () {
    return this.x*this.x + this.y*this.y;
};
/**
 * normalize Vector
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.normalize = function () {
    var length = this.length();
    if (length > 0) {
        var invLength = 1 / length;
        this.x *= invLength;
        this.y *= invLength;
    }
    return this;
};
/**
 * dot this * v
 * none side-effect
 * @param v {L5.Vector2}
 * @returns {number}
 */
L5.Vector2.prototype.dot = function (v) {
    return this.x*v.x + this.y*v.y;
};

/**
 * Returns (y,-x).
 * none side-effect
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.perp = function () {
    return new L5.Vector2( this.y, -this.x);
};

/**
 * Returns (y,-x)/sqrt(x*x+y*y).
 * none side-effect
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.unitPerp = function () {
    var ret = new L5.Vector2(this.y, -this.x);
    ret.normalize();
    return ret;
};

/**
 * Returns dotPerp(this,v) = x*v.y - y*v.x.
 * none side-effect
 *
 * @param v {L5.Vector2}
 * @returns {number}
 */
L5.Vector2.prototype.dotPerp = function (
    v
) {
    return this.x*v.y -this.y*v.x;
};


/**
 * add two Vector
 * none side-effect
 *
 * @param v {L5.Vector2}
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.add = function (
    v
) {
    return new L5.Vector2
    (
        this.x + v.x,
        this.y + v.y
    );
};

/**
 * sub two Vector
 * none side-effect
 * @param v {L5.Vector2}
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.sub = function (
    v
) {
    return new L5.Vector2
    (
        this.x - v.x,
        this.y - v.y
    );
};

/**
 * scalar Vector2
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.scalar = function (
    scalar
) {
    return new L5.Vector2
    (
        this.x * scalar,
        this.y * scalar
    );
};

/**
 * div Vector
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.div = function (
    scalar
) {
    if (scalar !== 0) {
        scalar = 1 / scalar;

        return new L5.Vector2
        (
            this.x * scalar,
            this.y * scalar
        );
    }
    var max = L5.Math.MAX_REAL;
    return new L5.Vector2(max, max);
};
/**
 * negative APoint
 * none side-effect
 * @returns {L5.Vector2}
 */
L5.Vector2.prototype.negative = function () {
    return new L5.Vector2
    (
        -this.x,
        -this.y
    );
};
