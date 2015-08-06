/**
 * Quaternion 四元数
 * @author lonphy
 * @version 1.0
 */


/**
 * 四元数表示为: q = w + x*i + y*j + z*k
 * 但(w,x,y,z) 在4D空间不一定是单位向量
 * @class
 */
L5.HQuaternion = function(
    w, x, y, z
) {
    this.content = new Float32Array([w, x, y, z]);
};

L5.HQuaternion.name     = "HQuaternion";

L5.HQuaternion.prototype = {
    constructor: L5.HQuaternion,

    get w() { return this.content[0]; },
    get x() { return this.content[1]; },
    get y() { return this.content[2]; },
    get z() { return this.content[3]; },

    set w(val) { this.content[0] = val; },
    set x(val) { this.content[1] = val; },
    set y(val) { this.content[2] = val; },
    set z(val) { this.content[3] = val; }
};

/**
 * 复制
 * @param q {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.copy = function(
    q
) {
    this.content[0] = q.content[0];
    this.content[1] = q.content[1];
    this.content[2] = q.content[2];
    this.content[3] = q.content[3];
    return this;
};
/**
 * 判断是否相等
 * @param q {L5.HQuaternion}
 * @returns {boolean}
 */
L5.HQuaternion.prototype.equals = function(
    q
) {
    return this.content[0] === q.content[0] &&
           this.content[1] === q.content[1] &&
           this.content[2] === q.content[2] &&
           this.content[3] === q.content[3];
};

/**
 * 加法
 * @param q {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.add = function(
    q
) {
    return new L5.HQuaternion
    (
        this.content[0] + q.content[0],
        this.content[1] + q.content[1],
        this.content[2] + q.content[2],
        this.content[3] + q.content[3]
    );
};

/**
 * 减法
 * @param q {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.sub = function(
    q
) {
    return new L5.HQuaternion
    (
        this.content[0] - q.content[0],
        this.content[1] - q.content[1],
        this.content[2] - q.content[2],
        this.content[3] - q.content[3]
    );
};

/**
 * 乘标量
 * @param scalar {number}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.scalar = function(
    scalar
) {
    return new L5.HQuaternion
    (
        this.content[0] * scalar,
        this.content[1] * scalar,
        this.content[2] * scalar,
        this.content[3] * scalar
    );
};

/**
 * 乘四元数
 * @param q {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.mul = function(
    q
) {
    var tw = this.content[0], tx = this.content[1], ty = this.content[2], tz = this.content[3];
    var qw = q.content[0], qx = q.content[1], qy = q.content[2], qz = q.content[3];

    return new L5.HQuaternion
    (
        tw*qw - tx*qx - ty*qy - tz*qz,
        tw*qx + tx*qw + ty*qz - tz*qy,
        tw*qy + ty*qw + tz*qx - tx*qz,
        tw*qz + tz*qw + tx*qy - ty*qx
    );
};

/**
 * 除标量
 * @param scalar {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.div = function(
    scalar
) {
    if ( q !== 0)
    {
        var invScalar = 1/scalar;
        return new L5.HQuaternion
        (
            this.content[0] * invScalar,
            this.content[1] * invScalar,
            this.content[2] * invScalar,
            this.content[3] * invScalar
        );
    }
    var max = L5.Math.MAX_REAL;
    return new L5.HQuaternion(max, max, max, max);
};

/**
 * 求负
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.negative = function() {
    return new L5.HQuaternion
    (
        -this.content[0],
        -this.content[1],
        -this.content[2],
        -this.content[3]
    );
};

/**
 * 提取旋转矩阵
 * @returns {L5.Matrix}
 */
L5.HQuaternion.prototype.toRotateMatrix = function(){
    var w = this.content[0], x = this.content[1], y = this.content[2], z = this.content[3],
        x2  = 2* x, y2  = 2* y, z2  = 2* z,
        wx2 = x2* w, wy2 = y2* w, wz2 = z2* w,
        xx2 = x2* x, xy2 = y2* x, xz2 = z2* x,
        yy2 = y2* y, yz2 = z2* y, zz2 = z2*z;

    return new L5.Matrix
    (
        1-yy2-zz2,   xy2 - wz2,  xz2 + wy2,   0,
        xy2 + wz2,   1-xx2-zz2,  yz2 - wx2,   0,
        xz2 - wy2,   yz2 + wx2,  1-xx2-yy2,   0,
        0,           0,          0,           1
    );
};

/**
 * 提取旋转矩阵
 * @returns {Array} 0: axis 1: angle
 */
L5.HQuaternion.prototype.toAxisAngle = function(){
    // The quaternion representing the rotation is
    //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

    var ret = [];

    var sqrLength = this.content[1]*this.content[1] +
                    this.content[2]*this.content[2] +
                    this.content[3]*this.content[3];

    if (sqrLength > 0)
    {
        ret[1] = 2 * L5.Math.acos(this.content[0]);
        var invLength = 1/L5.Math.sqrt(sqrLength);
        ret[0] = new L5.Vector(
            this.content[1]*invLength,
            this.content[2]*invLength,
            this.content[3]*invLength
        );
    }
    else
    {
        // Angle is 0 (mod 2*pi), so any axis will do.
        ret[1] = 0;
        ret[0] = new L5.Vector(1,0,0);
    }

    return ret;
};

/**
 * 求当前四元数的模
 * @returns {number}
 */
L5.HQuaternion.prototype.length = function(){
    return L5.Math.sqrt
    (
        this.content[0]*this.content[0] +
        this.content[1]*this.content[1] +
        this.content[2]*this.content[2] +
        this.content[3]*this.content[3]
    );
};
/**
 * 模的平方
 * @returns {number}
 */
L5.HQuaternion.prototype.squaredLength = function() {
    return this.content[0] * this.content[0] +
           this.content[1] * this.content[1] +
           this.content[2] * this.content[2] +
           this.content[3] * this.content[3];
};
/**
 * 求2个四元素点积
 * @param q {L5.HQuaternion}
 * @returns {number}
 */
L5.HQuaternion.prototype.dot = function(
    q
){
    return this.content[0] * q.content[0] +
           this.content[1] * q.content[1] +
           this.content[2] * q.content[2] +
           this.content[3] * q.content[3];
};

/**
 * 规格化
 * @returns {number}
 */
L5.HQuaternion.prototype.normalize = function(){
    var length = this.length();

    if (length > 0)
    {
        var invLength = 1/length;
        this.content[0] *= invLength;
        this.content[1] *= invLength;
        this.content[2] *= invLength;
        this.content[3] *= invLength;
    }
    else
    {
        length = 0;
        this.content[0] = 0;
        this.content[1] = 0;
        this.content[2] = 0;
        this.content[3] = 0;
    }

    return length;
};

/**
 * apply to non-zero quaternion
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.inverse = function(){
    var norm = this.quaredLength();
    if (norm > 0)
    {
        var invNorm = 1/norm;
        return new L5.HQuaternion
        (
            this.content[0]*invNorm,
            -this.content[1]*invNorm,
            -this.content[2]*invNorm,
            -this.content[3]*invNorm
        );
    }
    return L5.HQuaternion.ZERO;
};

/**
 * negate x, y, and z terms
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.conjugate = function(){
    return new L5.HQuaternion
    (
        this.content[0],
        -this.content[1],
        -this.content[2],
        -this.content[3]
    );
};

/**
 * apply to quaternion with w = 0
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.exp = function(){
    // If q = A*(x*i+y*j+z*k) where (x,y,z) is unit length, then
    // exp(q) = cos(A)+sin(A)*(x*i+y*j+z*k).  If sin(A) is near zero,
    // use exp(q) = cos(A)+A*(x*i+y*j+z*k) since A/sin(A) has limit 1.

    var angle = L5.Math.sqrt(
        this.content[1]*this.content[1] +
        this.content[2]*this.content[2] +
        this.content[3]*this.content[3]
    );

    var sn = L5.Math.sin(angle);
    var w = L5.Math.cos(angle);


    if (L5.Math.abs(sn) > 0)
    {
        var coeff = sn/angle;
        return new L5.HQuaternion
        (
            w,
            coeff * this.content[1],
            coeff * this.content[2],
            coeff * this.content[3]
        );
    }
    return new L5.HQuaternion
    (
        w,
        this.content[1],
        this.content[2],
        this.content[3]
    );
};

/**
 * apply to unit-length quaternion
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.log = function(){
    // If q = cos(A)+sin(A)*(x*i+y*j+z*k) where (x,y,z) is unit length, then
    // log(q) = A*(x*i+y*j+z*k).  If sin(A) is near zero, use log(q) =
    // sin(A)*(x*i+y*j+z*k) since sin(A)/A has limit 1.

    if (L5.Math.abs(this.content[0]) < 1)
    {
        var angle = L5.Math.acos(this.content[0]);
        var sn = L5.Math.sin(angle);
        if (L5.Math.abs(sn) > 0)
        {
            var coeff = angle/sn;
            return new L5.HQuaternion
            (
                0,
                coeff * this.content[1],
                coeff * this.content[2],
                coeff * this.content[3]
            );
        }
    }

    return new L5.HQuaternion
    (
        0,
        this.content[1],
        this.content[2],
        this.content[3]
    );
};

/**
 * 使用四元数旋转向量
 * 内部转为矩阵后旋转
 * @param vec {L5.Vector}
 * @returns {L5.Vector}
 */
L5.HQuaternion.prototype.rotate = function(
    vec
){
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
    // of the rotation matrix computed in HQuaternion::ToRotationMatrix.
    // The vector v is obtained as the product of that rotation matrix with
    // vector u.  As such, the quaternion representation of a rotation
    // matrix requires less space than the matrix and more time to compute
    // the rotated vector.  Typical space-time tradeoff...

    return this.toRotateMatrix().mulPoint(vec);
};

/**
 * 球面插值
 * @param t {number}
 * @param p {L5.HQuaternion}
 * @param q {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.slerp = function(
    t, p, q
){
    var cs = p.dot(q);
    var angle = L5.Math.acos(cs);

    if (L5.Math.abs(angle) > 0)
    {
        var sn = L5.Math.sin(angle);
        var invSn = 1/sn;
        var tAngle = t*angle;
        var coeff0 = L5.Math.sin(angle - tAngle)*invSn;
        var coeff1 = L5.Math.sin(tAngle)*invSn;

        this.content[0] = coeff0*p.content[0] + coeff1*q.content[0];
        this.content[1] = coeff0*p.content[1] + coeff1*q.content[1];
        this.content[2] = coeff0*p.content[2] + coeff1*q.content[2];
        this.content[3] = coeff0*p.content[3] + coeff1*q.content[3];
    }
    else
    {
        this.copy(p);
    }

    return this;
};

/**
 * 球面插值
 * @param t {number}
 * @param p {L5.HQuaternion}
 * @param q {L5.HQuaternion}
 * @param extraSpins {number}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.slerpExtraSpins = function(
    t, p, q, extraSpins
) {
    var cs = p.dot(q);
    var angle = L5.Math.acos(cs);

    if (L5.Math.abs(angle) >= L5.Math.ZERO_TOLERANCE)
    {
        var sn = L5.Math.sin(angle);
        var phase = L5.Math.PI*extraSpins*t;
        var invSin = 1/sn;
        var coeff0 = L5.Math.sin((1 - t)*angle - phase)*invSin;
        var coeff1 = L5.Math.sin(t*angle + phase)*invSin;

        this.content[0] = coeff0*p.content[0] + coeff1*q.content[0];
        this.content[1] = coeff0*p.content[1] + coeff1*q.content[1];
        this.content[2] = coeff0*p.content[2] + coeff1*q.content[2];
        this.content[3] = coeff0*p.content[3] + coeff1*q.content[3];
    }
    else
    {
        this.copy(p);
    }

    return this;
};

/**
 * 球面2次插值中间项
 * @param q0 {L5.HQuaternion}
 * @param q1 {L5.HQuaternion}
 * @param q2 {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.intermediate = function(
    q0, q1, q2
){
    var q1Inv = q1.conjugate();
    var p0 = q1Inv.mul(q0).log();
    var p2 = q1Inv.mul(q2).log();
    var arg = p0.add(p2).scalar(-0.25).exp();
    this.copy( q1.mul(arg) );

    return this;
};

/**
 * 球面2次插值
 * @param t {number}
 * @param q0 {L5.HQuaternion}
 * @param a0 {L5.HQuaternion}
 * @param a1 {L5.HQuaternion}
 * @param q1 {L5.HQuaternion}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.prototype.squad = function(
    t, q0, a0, a1, q1
){
    var slerpT = 2*t*(1 - t);

    var slerpP = this.slerp(t, q0, q1);
    var slerpQ = this.slerp(t, a0, a1);
    return this.slerp(slerpT, slerpP, slerpQ);
};

L5.HQuaternion.ZERO     = new L5.HQuaternion(0,0,0,0);
L5.HQuaternion.IDENTIRY = new L5.HQuaternion(1,0,0,0);

/**
 * 从矩阵的旋转部分创建四元数
 * @param rot {L5.Matrix}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.fromRotateMatrix = function(
    rot
){
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "HQuaternion Calculus and Fast Animation".

    var trace = rot.item(0,0) + rot.item(1,1) + rot.item(2,2);
    var root;

    if (trace > 0)
    {
        // |w| > 1/2, may as well choose w > 1/2
        root = L5.Math.sqrt(trace + 1);  // 2w
        var root1 = 0.5/root;  // 1/(4w)

        return new L5.HQuaternion
        (
            0.5*root,
            (rot.item(2,1) - rot.item(1,2))*root1,
            (rot.item(0,2) - rot.item(2,0))*root1,
            (rot.item(1,0) - rot.item(0,1))*root1
        );
    }

    var next = [ 1, 2, 0 ];

    // |w| <= 1/2
    var i = 0;
    if (rot.item(1,1) > rot.item(0,0))
    {
        i = 1;
    }
    if (rot.item(2,2) > rot.item(i,i))
    {
        i = 2;
    }

    var j = next[i];
    var k = next[j];
    root = L5.Math.sqrt(rot.item(i,i) - rot.item(j,j) - rot.item(k,k) + 1);
    var ret = new Array(4);
    ret[i+1] = 0.5*root;
    root = 0.5/root;
    ret[0] = (rot.item(k,j) - rot.item(j,k))*root;
    ret[j] = (rot.item(j,i) + rot.item(i,j))*root;
    ret[k] = (rot.item(k,i) + rot.item(i,k))*root;

    return new L5.HQuaternion(ret[0], ret[1], ret[2], ret[3]);
};



/**
 * 使用旋转轴和旋转角度创建四元数
 * @param axis {L5.Vector}
 * @param angle {number}
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.fromAxisAngle = function(
    axis, angle
){
    // assert:  axis[] is unit length
    //
    // The quaternion representing the rotation is
    //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

    var halfAngle = 0.5*angle;
    var sn = L5.Math.sin(halfAngle);
    return new L5.HQuaternion(
        L5.Math.cos(halfAngle),
        sn*axis.x,
        sn*axis.y,
        sn*axis.z
    );
};
/**
 * 计算V1 到 V2 的旋转四元数， 旋转轴同时垂直于V1&V1
 * @param v1 {L5.Vector} 单位向量
 * @param v2 {L5.Vector} 单位向量
 * @returns {L5.HQuaternion}
 */
L5.HQuaternion.align = function(
    v1, v2
) {
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

        var bisector = v1.add(v2).normalize();
        var cosHalfAngle = v1.dot(bisector);
        var w, x, y, z;

        w = cosHalfAngle;

        if (cosHalfAngle !== 0)
        {
            var cross = v1.cross(bisector);
            x = cross.x;
            y = cross.y;
            z = cross.z;
        }
        else
        {
            var invLength;
            if (L5.Math.abs(v1.x) >= L5.Math.abs(v1.y))
            {
                // V1.x or V1.z is the largest magnitude component.
                invLength = L5.Math.invSqrt(v1.x*v1.x + v1.z*v1.z);
                x = -v1.z*invLength;
                y = 0;
                z = +v1.x*invLength;
            }
            else
            {
                // V1.y or V1.z is the largest magnitude component.
                invLength = L5.Math.invSqrt(v1.y*v1.y + v1.z*v1.z);
                x = 0;
                y = +v1.z*invLength;
                z = -v1.y*invLength;
            }
        }

        return new L5.HQuaternion(w, x, y, z);
};