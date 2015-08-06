/**
 * Vector3
 * @author lonphy
 * @version 1.0
 */

L5.Vector3 = function (
    x, y, z
) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

L5.Vector3.name = "Vector3";

// const
L5.Vector3.ZERO   = new L5.Vector3(0, 0, 0);
L5.Vector3.UINT_X = new L5.Vector3(1, 0, 0);
L5.Vector3.UINT_Y = new L5.Vector3(0, 1, 0);
L5.Vector3.UINT_Z = new L5.Vector3(0, 0, 1);
L5.Vector3.ONE    = new L5.Vector3(1, 1, 1);

/**
 * 计算向量的极值，返回最大向量和最小向量
 * @param vectors {Array<L5.Vector3>}
 * @returns {Array<L5.Vector3>} (min,max)
 */
L5.Vector3.computeExtremes = function(
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
    }

    return [min, max];
};
/**
 *
 * @param u {L5.Vector3}
 * @param v {L5.Vector3}
 * @param w {L5.Vector3}
 * @returns {L5.Vector3}
 */
L5.Vector3.orthoNormalize = function (
    u, v, w
) {
    // If the input vectors are v0, v1, and v2, then the Gram-Schmidt
    // orthonormalization produces vectors u0, u1, and u2 as follows,
    //
    //   u0 = v0/|v0|
    //   u1 = (v1-(u0*v1)u0)/|v1-(u0*v1)u0|
    //   u2 = (v2-(u0*v2)u0-(u1*v2)u1)/|v2-(u0*v2)u0-(u1*v2)u1|
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

    // compute u2
    var dot1 = v.Dot(w);
    dot0 = u.Dot(w);
    d = w.sub(u.scalar(dot0).add(v.scalar(dot1)));
    d.normalize();
    w.copy(d);
};
/**
 * The output is an orthonormal basis {u, v, w}.
 *
 * If you know W is already unit length,
 * use L5.Vector3.generateComplementBasis to compute U and V.
 *
 * @param u {L5.Vector3}
 * @param v {L5.Vector3}
 * @param w {L5.Vector3} must be a nonzero vector, when return this value is normalized by this function
*/
L5.Vector3.generateOrthonormalBasis = function (
        u, v, w
) {
    w.normalize();
    L5.Vector3.generateComplementBasis(u, v, w);
};

/**
 * The output vectors {u, v} are unit length and mutually perpendicular,
 * and {u, v, w} is an orthonormal basis.
 *
 * @param u {L5.Vector3}
 * @param v {L5.Vector3}
 * @param w {L5.Vector3} must be a unit-length vector.
 */
L5.Vector3.generateComplementBasis = function (
    u, v, w
) {
    var invLength;

    if (L5.Math.abs(w.x) >= L5.Math.abs(w.y))
    {
        // w.x or w.z is the largest magnitude component, swap them
        invLength = L5.Math.invSqrt(w.x * w.x + w.z * w.z);
        u.x = -w.z*invLength;
        u.y = 0;
        u.z = +w.x * invLength;
        v.x = w.y * u.z;
        v.y = w.z * u.x - w.x * u.z;
        v.z = -w.y * u.x;
    }
    else
    {
        // w.y or w.z is the largest magnitude component, swap them
        invLength = L5.Math.invSqrt(w.y * w.y + w.z * w.z);
        u.x = 0;
        u.y = +w.z * invLength;
        u.z = -w.y * invLength;
        v.x = w.y * u.z - w.z * u.y;
        v.y = -w.x * u.z;
        v.z = w.x * u.y;
    }
};

/**
 * Compute the barycentric coordinates of the point V with respect to the tetrahedron <V0,V1,V2,V3>,
 * V = b0*V0 + b1*V1 + b2*V2 + b3*V3, where b0 + b1 + b2 + b3 = 1.
 * The return value is true if {V0,V1,V2,V3} is a linearly independent set.
 * Numerically, this is measured by |det[V0 V1 V2 V3]| <= epsilon.
 * The values bary[4] are valid only when the return value is true but set to zero when the return value is false.
 *
 * @param v0 {L5.Vector3}
 * @param v1 {L5.Vector3}
 * @param v2 {L5.Vector3}
 * @param v3 {L5.Vector3}
 * @param bary {Array<number>} 4 elements
 * @param epsilon {number}
 * @returns {boolean}
 */
L5.Vector3.prototype.getBarycentrics = function (
    v0, v1, v2, v3, bary, epsilon
){
    // Compute the vectors relative to V3 of the tetrahedron.
    var diff = [
        v0.sub(v3),
        v1.sub(v3),
        v2.sub(v3),
        this.sub(v3)
    ];

    var det = diff[0].dot(diff[1].cross(diff[2]));
    var e1ce2 = diff[1].cross(diff[2]);
    var e2ce0 = diff[2].cross(diff[0]);
    var e0ce1 = diff[0].cross(diff[1]);

    if (L5.Math.abs(det) > epsilon)
    {
        var invDet = 1/det;
        bary[0] = diff[3].dot(e1ce2)*invDet;
        bary[1] = diff[3].dot(e2ce0)*invDet;
        bary[2] = diff[3].dot(e0ce1)*invDet;
        bary[3] = 1 - bary[0] - bary[1] - bary[2];
        return true;
    }

    for (var i = 0; i < 4; ++i)
    {
        bary[i] = 0;
    }
    return false;
};

// method
/**
 * copy value to this
 * @param v {L5.Vector3}
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.copy = function (v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * return vector's length
 * none side-effect
 * @returns {number}
 */
L5.Vector3.prototype.length = function () {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};

/**
 * return vector's length pow 2
 * none side-effect
 * @returns {number}
 */
L5.Vector3.prototype.squaredLength = function () {
    return this.x*this.x + this.y*this.y + this.z*this.z;
};
/**
 * normalize Vector
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.normalize = function () {
    var length = this.length();
    if (length > 0) {
        var invLength = 1 / length;
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
    }
    else
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    return this;
};
/**
 * dot this * v
 * none side-effect
 * @param v {L5.Vector3}
 * @returns {number}
 */
L5.Vector3.prototype.dot = function (v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
};

/**
 * this cross v
 * none side-effect
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.cross = function (
    v
) {
    return new L5.Vector3
    (
        this.y* v.z - this.z* v.y,
        this.z* v.x - this.x* v.z,
        this.x* v.y - this.y* v.x
    );
};

/**
 * this cross v then normalize
 * none side-effect
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.unitCross = function (
    v
) {
    var ret = new L5.Vector3
    (
        this.y* v.z - this.z* v.y,
        this.z* v.x - this.x* v.z,
        this.x* v.y - this.y* v.x
    );
    ret.normalize();
    return ret;
};

/**
 * add two Vector
 * none side-effect
 *
 * @param v {L5.Vector3}
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.add = function (
    v
) {
    return new L5.Vector3
    (
        this.x + v.x,
        this.y + v.y,
        this.z + v.z
    );
};

/**
 * sub two Vector
 * none side-effect
 * @param v {L5.Vector3}
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.sub = function (
    v
) {
    return new L5.Vector3
    (
        this.x - v.x,
        this.y - v.y,
        this.z - v.z
    );
};

/**
 * scalar Vector3
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.scalar = function (
    scalar
) {
    return new L5.Vector3
    (
        this.x * scalar,
        this.y * scalar,
        this.z * scalar
    );
};

/**
 * div Vector
 * none side-effect
 * @param scalar {number}
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.div = function (
    scalar
) {
    if (scalar !== 0) {
        scalar = 1 / scalar;

        return new L5.Vector3
        (
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }
    var max = L5.Math.MAX_REAL;
    return new L5.Vector3(max, max, max);
};
/**
 * negative APoint
 * none side-effect
 * @returns {L5.Vector3}
 */
L5.Vector3.prototype.negative = function () {
    return new L5.Vector3
    (
        -this.x,
        -this.y,
        -this.z
    );
};
