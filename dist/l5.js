(function (global) {
    "use strict";

    var L5 = Object.create(null);
    Object.defineProperty(L5, 'VERSION', {value: 'WM_VERSION_5_1'});

    L5.setDebug = function (flag) {
        if (flag) {
            L5.assert = function (expression, message) {
                console.assert(expression, message);
            };
        }
        else {
            L5.assert = function () {
            };
        }
    };
    L5.setDebug(true);


    const HEX_TABLE = '0123456789abcdef';
    /**
     * 生成UUID
     * @return {String}
     */
    L5.UUID = function () {
        var s = new Array(35);
        for (var i = 0; i < 36; i++) {
            s[i] = i > 7 && ( (i - 8) % 5 === 0 ) ? '-' : HEX_TABLE[(Math.random() * 0x10) | 0];
        }
        s[14] = '4';
        s[19] = HEX_TABLE[(s[19] & 0x3) | 0x8];
        return s.join('');
    };

    /**
     * 修正原型
     * @param sub
     * @param base
     */
    L5.extendFix = function (sub, base) {
        sub.prototype = Object.create(base.prototype);
        sub.prototype.constructor = sub;
    };
    /**
     * 定义构造函数名称
     * @param c {Function}
     * @param name {string}
     */
    L5.nameFix = function(c, name) {
        Object.defineProperty(c, 'name', {value: name});
    };

    L5.runApplication = function(Klass){
        var i = new Klass();
        window.x = i;
        i.run();
    };

    global.L5 = L5;

})(this);

/**
 * Quaternion 四元数
 * @author lonphy
 * @version 1.0
 *
 * 四元数表示为: q = w + x*i + y*j + z*k
 * 但(w,x,y,z) 在4D空间不一定是单位向量
 * @class
 */
L5.Quaternion = function(
    w, x, y, z
) {
    this.content = new Float32Array([w, x, y, z]);
};

L5.Quaternion.name     = "Quaternion";

L5.Quaternion.prototype = {
    constructor: L5.Quaternion,

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
 * @param q {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.copy = function(
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
 * @param q {L5.Quaternion}
 * @returns {boolean}
 */
L5.Quaternion.prototype.equals = function(
    q
) {
    return this.content[0] === q.content[0] &&
           this.content[1] === q.content[1] &&
           this.content[2] === q.content[2] &&
           this.content[3] === q.content[3];
};

/**
 * 加法
 * @param q {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.add = function(
    q
) {
    return new L5.Quaternion
    (
        this.content[0] + q.content[0],
        this.content[1] + q.content[1],
        this.content[2] + q.content[2],
        this.content[3] + q.content[3]
    );
};

/**
 * 减法
 * @param q {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.sub = function(
    q
) {
    return new L5.Quaternion
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
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.scalar = function(
    scalar
) {
    return new L5.Quaternion
    (
        this.content[0] * scalar,
        this.content[1] * scalar,
        this.content[2] * scalar,
        this.content[3] * scalar
    );
};

/**
 * 乘四元数
 * @param q {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.mul = function(
    q
) {
    var tw = this.content[0], tx = this.content[1], ty = this.content[2], tz = this.content[3];
    var qw = q.content[0], qx = q.content[1], qy = q.content[2], qz = q.content[3];

    return new L5.Quaternion
    (
        tw*qw - tx*qx - ty*qy - tz*qz,
        tw*qx + tx*qw + ty*qz - tz*qy,
        tw*qy + ty*qw + tz*qx - tx*qz,
        tw*qz + tz*qw + tx*qy - ty*qx
    );
};

/**
 * 除标量
 * @param scalar {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.div = function(
    scalar
) {
    if ( q !== 0)
    {
        var invScalar = 1/scalar;
        return new L5.Quaternion
        (
            this.content[0] * invScalar,
            this.content[1] * invScalar,
            this.content[2] * invScalar,
            this.content[3] * invScalar
        );
    }
    var max = L5.Math.MAX_REAL;
    return new L5.Quaternion(max, max, max, max);
};

/**
 * 求负
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.negative = function() {
    return new L5.Quaternion
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
L5.Quaternion.prototype.toRotateMatrix = function(){
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
L5.Quaternion.prototype.toAxisAngle = function(){
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
L5.Quaternion.prototype.length = function(){
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
L5.Quaternion.prototype.squaredLength = function() {
    return this.content[0] * this.content[0] +
           this.content[1] * this.content[1] +
           this.content[2] * this.content[2] +
           this.content[3] * this.content[3];
};
/**
 * 求2个四元素点积
 * @param q {L5.Quaternion}
 * @returns {number}
 */
L5.Quaternion.prototype.dot = function(
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
L5.Quaternion.prototype.normalize = function(){
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
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.inverse = function(){
    var norm = this.quaredLength();
    if (norm > 0)
    {
        var invNorm = 1/norm;
        return new L5.Quaternion
        (
            this.content[0]*invNorm,
            -this.content[1]*invNorm,
            -this.content[2]*invNorm,
            -this.content[3]*invNorm
        );
    }
    return L5.Quaternion.ZERO;
};

/**
 * negate x, y, and z terms
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.conjugate = function(){
    return new L5.Quaternion
    (
        this.content[0],
        -this.content[1],
        -this.content[2],
        -this.content[3]
    );
};

/**
 * apply to quaternion with w = 0
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.exp = function(){
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
        return new L5.Quaternion
        (
            w,
            coeff * this.content[1],
            coeff * this.content[2],
            coeff * this.content[3]
        );
    }
    return new L5.Quaternion
    (
        w,
        this.content[1],
        this.content[2],
        this.content[3]
    );
};

/**
 * apply to unit-length quaternion
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.log = function(){
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
            return new L5.Quaternion
            (
                0,
                coeff * this.content[1],
                coeff * this.content[2],
                coeff * this.content[3]
            );
        }
    }

    return new L5.Quaternion
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
L5.Quaternion.prototype.rotate = function(
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
    // of the rotation matrix computed in Quaternion::ToRotationMatrix.
    // The vector v is obtained as the product of that rotation matrix with
    // vector u.  As such, the quaternion representation of a rotation
    // matrix requires less space than the matrix and more time to compute
    // the rotated vector.  Typical space-time tradeoff...

    return this.toRotateMatrix().mulPoint(vec);
};

/**
 * 球面插值
 * @param t {number}
 * @param p {L5.Quaternion}
 * @param q {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.slerp = function(
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
 * @param p {L5.Quaternion}
 * @param q {L5.Quaternion}
 * @param extraSpins {number}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.slerpExtraSpins = function(
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
 * @param q0 {L5.Quaternion}
 * @param q1 {L5.Quaternion}
 * @param q2 {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.intermediate = function(
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
 * @param q0 {L5.Quaternion}
 * @param a0 {L5.Quaternion}
 * @param a1 {L5.Quaternion}
 * @param q1 {L5.Quaternion}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.prototype.squad = function(
    t, q0, a0, a1, q1
){
    var slerpT = 2*t*(1 - t);

    var slerpP = this.slerp(t, q0, q1);
    var slerpQ = this.slerp(t, a0, a1);
    return this.slerp(slerpT, slerpP, slerpQ);
};

L5.Quaternion.ZERO     = new L5.Quaternion(0,0,0,0);
L5.Quaternion.IDENTIRY = new L5.Quaternion(1,0,0,0);

/**
 * 从矩阵的旋转部分创建四元数
 * @param rot {L5.Matrix}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.fromRotateMatrix = function(
    rot
){
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".

    var trace = rot.item(0,0) + rot.item(1,1) + rot.item(2,2);
    var root;

    if (trace > 0)
    {
        // |w| > 1/2, may as well choose w > 1/2
        root = L5.Math.sqrt(trace + 1);  // 2w
        var root1 = 0.5/root;  // 1/(4w)

        return new L5.Quaternion
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

    return new L5.Quaternion(ret[0], ret[1], ret[2], ret[3]);
};



/**
 * 使用旋转轴和旋转角度创建四元数
 * @param axis {L5.Vector}
 * @param angle {number}
 * @returns {L5.Quaternion}
 */
L5.Quaternion.fromAxisAngle = function(
    axis, angle
){
    // assert:  axis[] is unit length
    //
    // The quaternion representing the rotation is
    //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

    var halfAngle = 0.5*angle;
    var sn = L5.Math.sin(halfAngle);
    return new L5.Quaternion(
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
 * @returns {L5.Quaternion}
 */
L5.Quaternion.align = function(
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

        return new L5.Quaternion(w, x, y, z);
};

/**
 * Math - 通用工具类
 * @version 1.0
 * @author lonphy
 */

L5.Math = Object.create(null);

/**
 * 是否是2的整次幂
 * @param value {number} 需要判断的整数
 * @returns {boolean}
 */
L5.Math.isPowerOfTwo = function (value) {
    return (value > 0) && ((value & (value - 1)) === 0);
};

/**
 * 判断2个浮点数是否相等
 * @param a {number}
 * @param b {number}
 * @returns {boolean}
 */
L5.Math.floatEqual = function(a,b) {
    if (Math.abs(a - b) < 0.000001) {
        return true;
    }
    return false;
};

/**
 * 获取以2为底的对数
 * @param powerOfTwo {number}
 * @returns {number}
 */
L5.Math.log2OfPowerOfTwo = function (powerOfTwo) {
    var log2 = (powerOfTwo & 0xaaaaaaaa) !== 0;
    log2 |= ((powerOfTwo & 0xffff0000) !== 0) << 4;
    log2 |= ((powerOfTwo & 0xff00ff00) !== 0) << 3;
    log2 |= ((powerOfTwo & 0xf0f0f0f0) !== 0) << 2;
    log2 |= ((powerOfTwo & 0xcccccccc) !== 0) << 1;
    return log2;
};

/**
 * 转换IEEE 32位浮点数value[0,1]到32位整数[0,2^power-1]
 */
L5.Math.scaledFloatToInt = (function () {
    var da = new Float32Array([0]);
    var dv = new DataView(da.buffer);

    /**
     * @param value {number} 需要转换的浮点数 [0,1]
     * @param power {number}
     * @returns {number}
     */
    return function (value, power) {
        da[0] = value;
        var result = 0;
        var shift = 150 - power - (dv.getUint8(3) << 1) + (dv.getUint8(2) >> 7);
        if (shift < 24) {
            result = ((dv.getUint32(0) & 0x007fffff) | 0x00800000) >> shift;
            if (result == (1 << power)) {
                --result;
            }
        }
        return result;
    };

})();

L5.Math.random = Math.random;
L5.Math.floor = Math.floor;
L5.Math.ceil = Math.ceil;
L5.Math.abs = Math.abs;
L5.Math.atan = Math.atan;
L5.Math.atan2 = Math.atan2;
L5.Math.exp = Math.exp;
L5.Math.cos = Math.cos;
L5.Math.sin = Math.sin;
L5.Math.tan = Math.tan;

/**
 * @param value {number}
 * @returns {number}
 */
L5.Math.acos = function (value) {
    if (-1 < value) {
        return value < 1 ? Math.acos(value) : 0;
    }
    return Math.PI;
};
/**
 * @param value {number}
 * @returns {number}
 */
L5.Math.asin = function (value) {
    if (-1 < value) {
        return value < 1 ? Math.asin(value) : L5.Math.HALF_PI;
    }
    return -L5.Math.HALF_PI;
};
/**
 * @param value {number}
 * @returns {number}
 */
L5.Math.invSqrt = function (value) {
    if (value !== 0) {
        return 1 / Math.sqrt(value);
    }
    console.warn('Division by zero in invSqr');
    return 0;
};
/**
 * @param value {number}
 * @returns {number}
 */
L5.Math.log = function (value) {
    if (value > 0) {
        return Math.log(value);
    }
    console.warn('Nonpositive input to log');
    return 0;
};
/**
 * @param value {number}
 * @returns {number}
 */
L5.Math.log2 = function (value) {
    if (value > 0) {
        return Math.INV_LN_2 * Math.log(value);
    }
    console.warn('Nonpositive input to log2');
    return 0;
};
/**
 * @param value {number}
 * @returns {number}
 */
L5.Math.log10 = function (value) {
    if (value > 0) {
        return L5.Math.INV_LN_10 * Math.log(value);
    }
    console.warn('Nonpositive input to log10');
    return 0;
};
/**
 * @param base {number}
 * @param exponent {number}
 * @returns {number}
 */
L5.Math.pow = function (base, exponent) {
    if (base >= 0) {
        return Math.pow(base, exponent);
    }
    console.warn('Negative base not allowed in Pow');
    return L5.Math.MAX_REAL;
};
/**
 * 求平方
 * @param value {number}
 * @returns {number}
 */
L5.Math.sqr = function (value) {
    return value * value;
};
/**
 * 开平方
 * @param value {number}
 * @returns {number}
 */
L5.Math.sqrt = function (value) {
    if (value >= 0) {
        return Math.sqrt(value);
    }
    console.warn('Negative input to Sqrt');
    return 0;
};
/**
 * 获取值的符号
 * -1 负 1 正 0 零值
 * @param value
 * @returns {number}
 */
L5.Math.sign = function (value) {
    if (value > 0) {
        return 1;
    }
    if (value < 0) {
        return -1;
    }
    return 0;
};
/**
 * 生成[-1,1]随机数
 * @returns {number}
 */
L5.Math.symmetricRandom = function () {
    return 2 * Math.random() - 1;
};
/**
 * 生成[0,1]随机数
 * @returns {number}
 */
L5.Math.unitRandom = function () {
    return Math.random();
};
/**
 * 生成[min,max]随机数
 * @param min {number} 随机数的最小值
 * @param max {number} 随机数的最大值
 * @returns {number}
 */
L5.Math.intervalRandom = function (min, max) {
    return min + (max - min) * Math.random();
};
/**
 * Clamp the input to the specified interval [min,max].
 * @param value {number} 夹取的值
 * @param min {number} 区间开始
 * @param max {number} 区间结束
 * @returns {number}
 */
L5.Math.clamp = function (value, min, max) {
    if (value <= min) {
        return min;
    }
    if (value >= max) {
        return max;
    }
    return value;
};

/**
 * Clamp the input to [0,1].
 * @param value {number}
 * @returns {number}
 */
L5.Math.saturate = function (value) {
    if (value <= 0) {
        return 0;
    }
    if (value >= 1) {
        return 1;
    }
    return value;
};

// 快速版本的三角/反三角函数,使用多项式逼近，提升计算性能
/**
 * @param angle {number} 必须在[0,pi/2]
 * @returns {number}
 */
L5.Math.fastSin0 = function (angle) {
    var angleSqr = angle * angle;
    var result = 7.61e-03;
    result *= angleSqr;
    result -= 1.6605e-01;
    result *= angleSqr;
    result += 1;
    return result * angle;
};
/**
 * @param angle {number} 必须在[0,pi/2]
 * @returns {number}
 */
L5.Math.fastSin1 = function (angle) {
    var angleSqr = angle * angle;
    var result = -2.39e-08;
    result *= angleSqr;
    result += 2.7526e-06;
    result *= angleSqr;
    result -= 1.98409e-04;
    result *= angleSqr;
    result += 8.3333315e-03;
    result *= angleSqr;
    result -= 1.666666664e-01;
    result *= angleSqr;
    result += 1;
    return result * angle;
};
/**
 * @param angle {number} 必须在[0,pi/2]
 * @returns {number}
 */
L5.Math.fastCos0 = function (angle) {
    var angleSqr = angle * angle;
    var result = 3.705e-02;
    result *= angleSqr;
    result -= 4.967e-01;
    return result * angleSqr + 1;
};
/**
 * @param angle {number} 必须在[0,pi/2]
 * @returns {number}
 */
L5.Math.fastCos1 = function (angle) {
    var angleSqr = angle * angle;
    var result = -2.605e-07;
    result *= angleSqr;
    result += 2.47609e-05;
    result *= angleSqr;
    result -= 1.3888397e-03;
    result *= angleSqr;
    result += 4.16666418e-02;
    result *= angleSqr;
    result -= 4.999999963e-01;
    return result * angleSqr + 1;
};

/**
 * @param angle {number} 必须在[0,pi/4]
 * @returns {number}
 */
L5.Math.fastTan0 = function (angle) {
    var angleSqr = angle * angle;
    var result = 2.033e-01;
    result *= angleSqr;
    result += 3.1755e-01;
    result *= angleSqr;
    result += 1;
    return result * angle;
};
/**
 * @param angle {number} 必须在[0,pi/4]
 * @returns {number}
 */
L5.Math.fastTan1 = function (angle) {
    var angleSqr = angle * angle;
    var result = 9.5168091e-03;
    result *= angleSqr;
    result += 2.900525e-03;
    result *= angleSqr;
    result += 2.45650893e-02;
    result *= angleSqr;
    result += 5.33740603e-02;
    result *= angleSqr;
    result += 1.333923995e-01;
    result *= angleSqr;
    result += 3.333314036e-01;
    result *= angleSqr;
    result += 1;
    return result * angle;
};
/**
 * @param value {number} 必须在[0,1]
 * @returns {number}
 */
L5.Math.fastInvSin0 = function (value) {
    var root = Math.sqrt(Math.abs(1 - value));
    var result = -0.0187293;
    result *= value;
    result += 0.0742610;
    result *= value;
    result -= 0.2121144;
    result *= value;
    result += 1.5707288;
    result = L5.Math.HALF_PI - root * result;
    return result;
};
/**
 * @param value {number} 必须在[0,1]
 * @returns {number}
 */
L5.Math.fastInvSin1 = function (value) {
    var root = Math.sqrt(Math.abs(1 - value));
    var result = -0.0012624911;
    result *= value;
    result += 0.0066700901;
    result *= value;
    result -= 0.0170881256;
    result *= value;
    result += 0.0308918810;
    result *= value;
    result -= 0.0501743046;
    result *= value;
    result += 0.0889789874;
    result *= value;
    result -= 0.2145988016;
    result *= value;
    result += 1.5707963050;
    result = L5.Math.HALF_PI - root * result;
    return result;
};
/**
 * @param value {number} 必须在[0,1]
 * @returns {number}
 */
L5.Math.fastInvCos0 = function (value) {
    var root = Math.sqrt(Math.abs(1 - value));
    var result = -0.0187293;
    result *= value;
    result += 0.0742610;
    result *= value;
    result -= 0.2121144;
    result *= value;
    result += 1.5707288;
    return result * root;
};
/**
 * @param value {number} 必须在[0,1]
 * @returns {number}
 */
L5.Math.fastInvCos1 = function (value) {
    var root = Math.sqrt(Math.abs(1 - value));
    var result = -0.0012624911;
    result *= value;
    result += 0.0066700901;
    result *= value;
    result -= 0.0170881256;
    result *= value;
    result += 0.0308918810;
    result *= value;
    result -= 0.0501743046;
    result *= value;
    result += 0.0889789874;
    result *= value;
    result -= 0.2145988016;
    result *= value;
    result += 1.5707963050;
    return result * root;
};
/**
 * @param value {number} 必须在[-1,1]
 * @returns {number}
 */
L5.Math.fastInvTan0 = function (value) {
    var valueSqr = value * value;
    var result = 0.0208351;
    result *= valueSqr;
    result -= 0.085133;
    result *= valueSqr;
    result += 0.180141;
    result *= valueSqr;
    result -= 0.3302995;
    result *= valueSqr;
    result += 0.999866;
    return result * value;
};
/**
 * @param value {number} 必须在[-1,1]
 * @returns {number}
 */
L5.Math.fastInvTan1 = function (value) {
    var valueSqr = value * value;
    var result = 0.0028662257;
    result *= valueSqr;
    result -= 0.0161657367;
    result *= valueSqr;
    result += 0.0429096138;
    result *= valueSqr;
    result -= 0.0752896400;
    result *= valueSqr;
    result += 0.1065626393;
    result *= valueSqr;
    result -= 0.1420889944;
    result *= valueSqr;
    result += 0.1999355085;
    result *= valueSqr;
    result -= 0.3333314528;
    result *= valueSqr;
    result += 1;
    return result * value;
};

// exp(-x)快速逼近版本
/**
 * @param value {number} 值必须在[0, Infinity)
 * @returns {number}
 */
L5.Math.fastNegExp0 = function (value) {
    var result = 0.0038278;
    result *= value;
    result += 0.0292732;
    result *= value;
    result += 0.2507213;
    result *= value;
    result += 1;
    result *= result;
    result *= result;
    return 1 / result;
};
/**
 * @param value {number} 值必须在[0, Infinity)
 * @returns {number}
 */
L5.Math.fastNegExp1 = function (value) {
    var result = 0.00026695;
    result *= value;
    result += 0.00227723;
    result *= value;
    result += 0.03158565;
    result *= value;
    result += 0.24991035;
    result *= value;
    result += 1;
    result *= result;
    result *= result;
    return 1 / result;
};
/**
 * @param value {number} 值必须在[0, Infinity)
 * @returns {number}
 */
L5.Math.fastNegExp2 = function (value) {
    var result = 0.000014876;
    result *= value;
    result += 0.000127992;
    result *= value;
    result += 0.002673255;
    result *= value;
    result += 0.031198056;
    result *= value;
    result += 0.250010936;
    result *= value;
    result += 1;
    result *= result;
    result *= result;
    return 1 / result;
};
/**
 * @param value {number} 值必须在[0, Infinity)
 * @returns {number}
 */
L5.Math.fastNegExp3 = function (value) {
    var result = 0.0000006906;
    result *= value;
    result += 0.0000054302;
    result *= value;
    result += 0.0001715620;
    result *= value;
    result += 0.0025913712;
    result *= value;
    result += 0.0312575832;
    result *= value;
    result += 0.2499986842;
    result *= value;
    result += 1;
    result *= result;
    result *= result;
    return 1 / result;
};

// 一些通用常量.
L5.Math.EPSILON = 1e-07;
L5.Math.ZERO_TOLERANCE = 1e-07;
L5.Math.MAX_REAL = window.Infinity;
L5.Math.PI = Math.PI;
L5.Math.TWO_PI = 2 * Math.PI;
L5.Math.HALF_PI = 0.5 * Math.PI;
L5.Math.INV_PI = 1 / Math.PI;
L5.Math.INV_TWO_PI = 1 / L5.Math.TWO_PI;
L5.Math.DEG_TO_RAD = Math.PI / 180;
L5.Math.RAD_TO_DEG = 180 / Math.PI;
L5.Math.LN_2 = L5.Math.log(2);
L5.Math.LN_10 = L5.Math.log(10);
L5.Math.INV_LN_2 = 1 / L5.Math.LN_2;
L5.Math.INV_LN_10 = 1 / L5.Math.LN_10;
L5.Math.SQRT_2 = Math.sqrt(2);
L5.Math.INV_SQRT_2 = 1 / L5.Math.SQRT_2;
L5.Math.SQRT_3 = Math.sqrt(3);
L5.Math.INV_SQRT_3 = 1 / L5.Math.SQRT_3;

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
    var xy = x*y, xz = x*z, yz = y*z;
    this.set(
        1-2*x*x,   -2*xy,   -2*xz, 0,
          -2*xy, 1-2*y*y,   -2*yz, 0,
          -2*xz,   -2*yz, 1-2*z*z, 0,
            d*x,     d*y,     d*z, 1
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





/**
 * Matrix3
 * @author lonphy
 * @version 1.0
 */

// The (x,y,z) coordinate system is assumed to be right-handed.  Coordinate
// axis rotation matrices are of the form
//   RX =    1       0       0
//           0     cos(t) -sin(t)
//           0     sin(t)  cos(t)
// where t > 0 indicates a counterclockwise rotation in the yz-plane
//   RY =  cos(t)    0     sin(t)
//           0       1       0
//        -sin(t)    0     cos(t)
// where t > 0 indicates a counterclockwise rotation in the zx-plane
//   RZ =  cos(t) -sin(t)    0
//         sin(t)  cos(t)    0
//           0       0       1
// where t > 0 indicates a counterclockwise rotation in the xy-plane.
L5.Matrix2 = function(
    m00, m01,
    m10, m11
) {

};

/**
 * Matrix3
 * @author lonphy
 * @version 1.0
 */

// The (x,y,z) coordinate system is assumed to be right-handed.  Coordinate
// axis rotation matrices are of the form
//   RX =    1       0       0
//           0     cos(t) -sin(t)
//           0     sin(t)  cos(t)
// where t > 0 indicates a counterclockwise rotation in the yz-plane
//   RY =  cos(t)    0     sin(t)
//           0       1       0
//        -sin(t)    0     cos(t)
// where t > 0 indicates a counterclockwise rotation in the zx-plane
//   RZ =  cos(t) -sin(t)    0
//         sin(t)  cos(t)    0
//           0       0       1
// where t > 0 indicates a counterclockwise rotation in the xy-plane.
L5.Matrix3 = function(
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22
) {

};

/**
 * Plane - 平面
 *
 * 平面表示为 Dot(N,X) - c = 0,其中：
 *  N = (n0,n1,n2,0)，一个单位法向量
 *  X = (x0,x1,x2,1)，是任何在该平面上的点
 *  c 是平面常量
 *
 * @author lonphy
 * @version 1.0
 */

/**
 * @param normal {L5.Vector} 平面单位法向量
 * @param constant {number} 平面常量
 * @class
 */
L5.Plane = function (normal, constant) {
    this._content = new Float32Array(4);
    this._content[0] = normal[0];
    this._content[1] = normal[1];
    this._content[2] = normal[2];
    this._content[3] = -constant;
};

L5.Plane.name = "Plane";

/**
 *  c = dot(normal, point)
 * @param normal {L5.Vector} specified
 * @param point {L5.Point} 平面上的点
 * @returns {L5.Plane}
 */
L5.Plane.fromPoint1 = function (normal, point) {
    return new L5.Plane
    (
        normal,
        point.dot(normal)
    );
};

/**
 *
 * @param normal0 {number}
 * @param normal1 {number}
 * @param normal2 {number}
 * @param constant {number}
 * @returns {L5.Plane}
 */
L5.Plane.fromNumber = function (normal0, normal1, normal2, constant) {
    return new L5.Plane
    (
        new L5.Vector
        (
            normal0,
            normal1,
            normal2
        ),
        constant
    );
};

/**
 * 通过3个点创建一个平面
 *
 * normal = normalize(cross(point1-point0,point2-point0))
 * c = dot(normal,point0)
 *
 * @param point0 {L5.Point} 平面上的点
 * @param point1 {L5.Point} 平面上的点
 * @param point2 {L5.Point} 平面上的点
 * @returns {L5.Plane}
 */
L5.Plane.fromPoint3 = function (point0, point1, point2) {
    var edge1 = point1.subP(point0);
    var edge2 = point2.subP(point0);
    var normal = edge1.unitCross(edge2);
    return new L5.Plane
    (
        normal,
        point0.dot(normal)
    );
};


L5.Plane.prototype = {
    constructor: L5.Plane,

    /**
     * @returns {L5.Vector}
     */
    get normal() {
        return new L5.Vector
        (
            this._content[0],
            this._content[1],
            this._content[2]
        );
    },
    /**
     * @param val {L5.Vector}
     */
    set normal(val) {
        this._content[0] = val.x;
        this._content[1] = val.y;
        this._content[2] = val.z;
    },
    get constant() {
        return -this._content[3];
    },
    set constant(val) {
        this._content[3] = -val || 0;
    }
};

/**
 * 复制
 * @param plane {L5.Plane}
 */
L5.Plane.prototype.copy = function (plane) {
    this._content[0] = plane._content[0];
    this._content[1] = plane._content[1];
    this._content[2] = plane._content[2];
    this._content[3] = plane._content[3];
    return this;
};

/**
 * 计算平面法向量的长度，并返回，同时规格化法向量和平面常量
 * @returns {number}
 */
L5.Plane.prototype.normalize = function () {
    var length = L5.Math.sqrt(
        this._content[0] * this._content[0] +
        this._content[1] * this._content[1] +
        this._content[2] * this._content[2]);

    if (length > 0) {
        var invLength = 1 / length;
        this._content[0] *= invLength;
        this._content[1] *= invLength;
        this._content[2] *= invLength;
        this._content[3] *= invLength;
    }

    return length;
};

/**
 * 计算点到平面的距离[有符号]
 *
 * d = dot(normal, point) - c
 *  normal 是平面的法向量
 *  c 是平面常量
 *  如果返回值是正值则点在平面的正坐标一边，
 *  如果是负值，则在负坐标一边
 *  否则在平面上
 *
 * @param p {L5.Point}
 * @returns {number}
 */
L5.Plane.prototype.distanceTo = function (p) {
    var c = this._content;
    return c[0] * p.x + c[1] * p.y + c[2] * p.z + c[3];
};

L5.Plane.prototype.whichSide = function (p) {
    var distance = this.distanceTo(p);

    if (distance < 0) {
        return -1;
    }
    else if (distance > 0) {
        return +1;
    }

    return 0;
};

/**
 * Point
 * @author lonphy
 * @version 1.0
 */

L5.Point = function (x, y, z) {
    if (x instanceof Float32Array) {
        this._content = new Float32Array(4);
        this._content[0] = x[0];
        this._content[1] = x[1];
        this._content[2] = x[2];
        this._content[3] = 1;
    } else {
        this._content = new Float32Array([x || 0, y || 0, z || 0, 1]);
    }
};

L5.nameFix(L5.Point, 'Point');

L5.Point.prototype = {
    constructor: L5.Point,

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
        this._content[0] = val || 0;
    },
    set z(val) {
        this._content[0] = val || 0;
    },
    set w(val) {
        this._content[0] = val || 1;
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
        this._content[3] = val || 1;
    }
};

/**
 * 是否相等
 * @param p {L5.Point}
 * @returns {boolean}
 */
L5.Point.prototype.equals = function (p) {
    return this._content[0] === p._content[0] &&
        this._content[1] === p._content[1] &&
        this._content[2] === p._content[2] &&
        this._content[3] === p._content[3];
};

/**
 * 复制
 * @param p {L5.Point}
 * @returns {L5.Point}
 */
L5.Point.prototype.copy = function (p) {
    this._content[0] = p._content[0];
    this._content[1] = p._content[1];
    this._content[2] = p._content[2];
    this._content[3] = p._content[3];
    return this;
};
/**
 * 赋值
 * @param x {float}
 * @param y {float}
 * @param z {float}
 */
L5.Point.prototype.set = function (x,y,z) {
    this[0] = x;
    this[1] = y;
    this[2] = z;
    this[3] = 1;
};

/**
 * 是否相等
 * @param p {L5.Point}
 * @returns {boolean}
 */
L5.Point.prototype.equals = function (p) {
    return this._content[0] === p._content[0] &&
        this._content[1] === p._content[1] &&
        this._content[2] === p._content[2] &&
        this._content[3] === p._content[3];
};

/**
 * 2个点相减，结果为向量
 * @param p {L5.Point}
 * @returns {L5.Vector}
 */
L5.Point.prototype.subP = function (p) {
    return new L5.Vector
    (
        this._content[0] - p._content[0],
        this._content[1] - p._content[1],
        this._content[2] - p._content[2]
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
        this._content[0] - v.x,
        this._content[1] - v.y,
        this._content[2] - v.z
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
        this._content[0] + v.x,
        this._content[1] + v.y,
        this._content[2] + v.z
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
        scalar * this._content[0],
        scalar * this._content[1],
        scalar * this._content[2]
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
            this.content[0] * scalar,
            this.content[1] * scalar,
            this.content[2] * scalar
        );
    }
    var max = L5.Math.MAX_REAL;
    return new L5.Point(max, max, max);
};
/**
 * 求中心对称点
 */
L5.Point.prototype.assign = function (val) {
    this._content[0] = val;
    this._content[1] = val;
    this._content[2] = val;
};
/**
 * 求中心对称点
 * @returns {L5.Point}
 */
L5.Point.prototype.negative = function () {
    return new L5.Point
    (
        -this._content[0],
        -this._content[1],
        -this._content[2]
    );
};

/**
 * 点与向量求点积
 * @param vec {L5.Vector}
 * @returns {number}
 */
L5.Point.prototype.dot = function (vec) {
    return this._content[0] * vec.x + this._content[1] * vec.y + this._content[2] * vec.z;
};

Object.defineProperty(L5.Point, 'ORIGIN', {
    get: function () {
        return new L5.Point(0, 0, 0);
    }
});


/**
 * Polynomial1
 * @author lonphy
 * @version 0.1
 */

L5.Polynomial1 = function() {};

L5.Polynomial1.name = "Polynomial1";



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


/**
 * D3Object - 对象基类
 * @version 1.0
 * @author lonphy
 */


/**
 * 类型构造
 * @param name {string} 对象名称
 * @constructor
 */
L5.D3Object = function (name) {
    this.name = name || '';
};
L5.D3Object.name = "D3Object";

/**
 * @param name {string} 对象名称
 * @returns {L5.D3Object}
 */
L5.D3Object.prototype.getObjectByName = function (name) {
    return name === this.name ? this : null;
};

/**
 * @param name {string} 对象名称
 * @returns {Array<L5.D3Object>}
 */
L5.D3Object.prototype.getAllObjectsByName = function (name) {
    return name === this.name ? this : null;
};

//============================== 文件流支持 ==============================
/**
 * @param inStream {L5.InStream}
 */
L5.D3Object.prototype.load = function (inStream) {
    inStream.readUniqueID(this);
    this.name = inStream.readString();
};
/**
 * @param inStream {L5.InStream}
 */
L5.D3Object.prototype.link = function (inStream) {};
L5.D3Object.prototype.postLink = function () {};

/**
 * @param tar {L5.OutStream}
 */
L5.D3Object.prototype.save = function (tar) {
    tar.writeString(this.constructor.name);
    tar.writeUniqueID(this);
    tar.writeString(this.name);
};

// 工厂类注册map, k => string v =>class
L5.D3Object.factories = new Map();

L5.D3Object.find = function (name) {
    return L5.D3Object.factories.get(name);
};

/**
 * Color 颜色
 * @author lonphy
 * @version 1.0
 */

L5.Color = {
    /**
     * @type {DataView}
     * @private
     */
    dv: new DataView(new Uint32Array(4).buffer)
};

/**
 * Make a 32-bit RGB color from 8-bit channels.
 * The alpha channel is set to 255.
 * @param red {number}
 * @param green {number}
 * @param blue {number}
 * @static
 */
L5.Color.makeR8G8B8 = function(red, green, blue) {
    this.dv.setUint8(0, red);
    this.dv.setUint8(1, green);
    this.dv.setUint8(2, blue);
    this.dv.setUint8(3, 255);
    return this.dv.getUint32(0);
};

/**
 * Make a 32-bit RGB color from 8-bit channels.
 * @param red {number}
 * @param green {number}
 * @param blue {number}
 * @param alpha {number}
 * @static
 */
L5.Color.makeR8G8B8A8 = function(red, green, blue, alpha) {
    this.dv.setUint8(0, red);
    this.dv.setUint8(1, green);
    this.dv.setUint8(2, blue);
    this.dv.setUint8(3, alpha);
    return this.dv.getUint32(0);
};
/**
 * Extract 8-bit channels from a 32bit-RGBA color.
 * 透明通道将被丢弃
 * @param color {Uint32Array}
 * @returns {Array} [r,g,b]
 */
//
L5.Color.extractR8G8B8 = function(color){
    this.dv.setUint32(0,color);
    return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2)];
};

/**
 * Extract 8-bit channels from a 32bit-RGBA color.
 * @param color {Uint32Array}
 * @returns {Array} [r,g,b,a]
 */
//
L5.Color.extractR8G8B8A8 = function(color){
    this.dv.setUint32(0,color);
    return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2), this.dv.getUint8(3)];
};

// Same as L5.TEXTURE_FORMAT_QUANTITY
L5.COLOR_FORMAT_QUANTITY = 23;

/**
 * 从 R5G6B5 转换到 32bit-RGBA
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} R5G6B5
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromR5G6B5 = function(
    numTexels, inTexels, outTexels
) {
    var len = 4*numTexels, i,j;

    for (i=0,j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = inTexels[j] >> 3; // r
        outTexels[i+1] = ( (inTexels[j] & 0x07) << 3 ) | (inTexels[j+1] >> 5); // g
        outTexels[i+2] = inTexels[j+1] & 0x1f; //b
        outTexels[i+3] = 0;      //a
    }
};
/**
 * 从 A1R5G5B5 转换到 32bit-RGBA
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} A1R5G5B5
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA1R5G5B5 = function (
    numTexels, inTexels, outTexels
){
    var len = 4*numTexels, i,j;
    for (i=0,j=0; i<len; i+=4,j+=2)
    {
        outTexels[i  ] = inTexels[j] & 0x80 >> 2; // r
        outTexels[i+1] = ( (inTexels[j] & 0x03) << 3) | (inTexels[j+1] >> 5); // g
        outTexels[i+2] = inTexels[j+1] & 0x1f; //b
        outTexels[i+3] = inTexels[j] >> 7;      //a
    }
};

/**
 * 从 4bit-ARGB 转换到 32bit-RGBA
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 4bit-ARGB
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA4R4G4B4 = function (
    numTexels, inTexels, outTexels
){
    var len = 4*numTexels, i,j;
    for (i=0,j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = outTexels[j  ] & 0x0f;
        outTexels[i+1] = outTexels[j+1] & 0xf0 >> 4;
        outTexels[i+2] = outTexels[j+1] & 0x0f;
        outTexels[i+3] = outTexels[j  ] & 0xf0 >> 4;
    }
};

/**
 * 从 8bit-A 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-A
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j;
    for (i=0,j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = 0;
        outTexels[i+1] = 0;
        outTexels[i+2] = 0;
        outTexels[i+3] = inTexels[j];
    }
};

/**
 * 从 8bit-L 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-L
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromL8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j;
    for (i=0,j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = inTexels[j];
        outTexels[i+1] = inTexels[j];
        outTexels[i+2] = inTexels[j];
        outTexels[i+3] = 255;
    }
};

/**
 * 从 8bit-AL 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-AL
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8L8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j;
    for (i=0, j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = inTexels[j+1];
        outTexels[i+1] = inTexels[j+1];
        outTexels[i+2] = inTexels[j+1];
        outTexels[i+3] = inTexels[j];
    }
};

/**
 * 从 8bit-RGB 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-RGB
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromR8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j;
    for (i=0, j=0; i < len; i+=4,j+=3)
    {
        outTexels[i  ] = inTexels[j];
        outTexels[i+1] = inTexels[j+1];
        outTexels[i+2] = inTexels[j+2];
        outTexels[i+3] = 0;
    }
};

/**
 * 从 8bit-ARGB 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-ARGB
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8R8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i;
    for (i=0; i < len; i+=4)
    {
        outTexels[i  ] = inTexels[i+1];
        outTexels[i+1] = inTexels[i+2];
        outTexels[i+2] = inTexels[i+3];
        outTexels[i+3] = inTexels[i  ];
    }
};

/**
 * 从 8bit-ABGR 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-ABGR
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8B8G8R8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i;
    for (i=0; i < len; i+=4)
    {
        outTexels[i  ] = inTexels[i+3];
        outTexels[i+1] = inTexels[i+2];
        outTexels[i+2] = inTexels[i+1];
        outTexels[i+3] = inTexels[i  ];
    }
};

/**
 * 从 16bit-L 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16bit-L
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromL16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j,
        dv = new Uint16Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = dv[j];
        outTexels[i+1] = dv[j];
        outTexels[i+2] = dv[j];
        outTexels[i+3] = 65535;
    }
};

/**
 * 从 16bit-GR 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16bit-GR
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromG16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j,
        dv = new Uint16Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = dv[j+1];
        outTexels[i+1] = dv[j];
        outTexels[i+2] = 0;
        outTexels[i+3] = 0;
    }
};

/**
 * 从 16bit-ABGR 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16bit-ABGR
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA16B16G16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,
        dv = new Uint16Array(inTexels);
    for (i = 0; i < len; i+=4)
    {
        outTexels[i  ] = dv[i+3];
        outTexels[i+1] = dv[i+2];
        outTexels[i+2] = dv[i+1];
        outTexels[i+3] = dv[i];
    }
};

/**
 * 从 16-bit RF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16-bit RF
 * @param outTexels {Float32Array} 32bit-RGBA
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertFromR16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 16-bit GRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16-bit GRF
 * @param outTexels {Float32Array} 32bit-RGBA
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertFromG16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 16-bit ABGRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16-bit ABGRF
 * @param outTexels {Float32Array} 32bit-RGBA
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertFromA16B16G16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 32-bit RF
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromR32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j,
        dv = new Float32Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = dv[j];
        outTexels[i+1] = 0;
        outTexels[i+2] = 0;
        outTexels[i+3] = 0;
    }
};

/**
 * 从 32-bit GRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit GRF
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromG32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i, j,
        dv = new Float32Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = dv[j+1];
        outTexels[i+1] = dv[j  ];
        outTexels[i+2] = 0;
        outTexels[i+3] = 0;
    }
};

/**
 * 从 32-bit ABGRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 32-bit ABGRF
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA32B32G32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,
        dv = new Float32Array(inTexels);
    for (i=0; i < len; i+=4)
    {
        outTexels[i  ] = dv[i+3];
        outTexels[i+1] = dv[i+2];
        outTexels[i+2] = dv[i+1];
        outTexels[i+3] = dv[i];
    }
};

/**
 * 从 32-bit RGBA 转换到 R5G6B5.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} R5G6B5
 */
L5.Color.convertToR5G6B5 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = (inTexels[i]<<3) | (inTexels[i+1]>>3);           // r<<3 | g>>3
        outTexels[j++] = ( (inTexels[i+1] & 0x07) << 5 ) | inTexels[i+2]; // g&0x7 << 5 | b
    }
};

/**
 * 从 32-bit RGBA 转换到 A1R5G6B5.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} A1R5G6B5
 */
L5.Color.convertToA1R5G5B5 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = (inTexels[i+3] << 7) | (inTexels[i]<<2) | (inTexels[i+1]>>3);           // a<<7 | r<<2 | g>>3
        outTexels[j++] = ( (inTexels[i+1] & 0x07) << 5 ) | inTexels[i+2]; // (g&0x7 << 5) | b
    }
};

/**
 * 从 32-bit RGBA 转换到 4-bit ARGB.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 4-bit ARGB
 */
L5.Color.convertToA4R4G4B4 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = (inTexels[i+3] << 4) | inTexels[i];           // a<<4 | r
        outTexels[j++] = (inTexels[i+1] << 4) | inTexels[i+2];         // g<<4 | b
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit Alpha.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit Alpha
 */
L5.Color.convertToA8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit Luminance.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit Luminance
 */
L5.Color.convertToL8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit Alpha-Luminance
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit Alpha-Luminance
 */
L5.Color.convertToA8L8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
        outTexels[j++] = inTexels[i];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit RGB
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit RGB
 */
L5.Color.convertToR8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i  ];
        outTexels[j++] = inTexels[i+1];
        outTexels[j++] = inTexels[i+2];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit ARGB
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit ARGB
 */
L5.Color.convertToA8R8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
        outTexels[j++] = inTexels[i  ];
        outTexels[j++] = inTexels[i+1];
        outTexels[j++] = inTexels[i+2];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit ABGR
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit ABGR
 */
L5.Color.convertToA8B8G8R8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
        outTexels[j++] = inTexels[i+2];
        outTexels[j++] = inTexels[i+1];
        outTexels[j++] = inTexels[i  ];
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit Luminance.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit Luminance
 */
L5.Color.convertToL16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=2)
    {
        dv.setUint16(j, inTexels[i]);
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit GR.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit GR
 */
L5.Color.convertToG16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=4)
    {
        dv.setUint16(j,   inTexels[i+1]);
        dv.setUint16(j+2, inTexels[i  ]);
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit ABGR.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit ABGR
 */
L5.Color.convertToA16B16G16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=8)
    {
        dv.setUint16(j,   inTexels[i+3]);
        dv.setUint16(j+2, inTexels[i+2]);
        dv.setUint16(j+4, inTexels[i+1]);
        dv.setUint16(j+6, inTexels[i  ]);
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit RF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit RF
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertToR16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RGBA 转换到 16-bit GRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit GRF
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertToG16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RGBA 转换到 16-bit ABGRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit ABGRF
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertToA16B16G16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RGBA 转换到 32-bit RF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 32-bit RF
 */
L5.Color.convertToR32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4)
    {
        dv.setFloat32(i, inTexels[i]);
    }
};

/**
 * 从 32-bit RGBA 转换到 32-bit GRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 32-bit GRF
 */
L5.Color.convertToG32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=8)
    {
        dv.setFloat32(j  , inTexels[i]);
        dv.setFloat32(j+4, inTexels[i+1]);
    }
};

/**
 * 从 32-bit RGBA 转换到 32-bit ABGRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 32-bit ABGRF
 */
L5.Color.convertToA32B32G32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=16)
    {
        dv.setFloat32(j,    inTexels[i+3]);
        dv.setFloat32(j+4,  inTexels[i+2]);
        dv.setFloat32(j+8,  inTexels[i+1]);
        dv.setFloat32(j+12, inTexels[i]);
    }
};

/**
 * Buffer 缓冲构造
 * @param numElements {number} 元素数量
 * @param elementSize {number} 一个元素的尺寸，单位比特
 * @param usage {number} 缓冲用途， 参照L5.BU_XXX
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Buffer = function (numElements, elementSize, usage) {
    L5.D3Object.call(this);
    this.numElements = numElements;
    this.elementSize = elementSize;
    this.usage = usage;
    this.numBytes = numElements * elementSize;
    if (this.numBytes > 0) {
        this._data = new Uint8Array(this.numBytes);
    }
};

L5.nameFix(L5.Buffer, 'Buffer');
L5.extendFix(L5.Buffer, L5.D3Object);

/**
 * @returns {Uint8Array}
 */
L5.Buffer.prototype.getData = function () {
    return this._data;
};


/////////////////////// 缓冲用途定义 ///////////////////////////
L5.Buffer.BU_STATIC = 0;
L5.Buffer.BU_DYNAMIC = 1;
L5.Buffer.BU_RENDERTARGET = 2;
L5.Buffer.BU_DEPTHSTENCIL = 3;

/**
 * @param inStream {L5.InStream}
 */
L5.Buffer.prototype.load = function (inStream) {

    L5.D3Object.prototype.load.call(this, inStream);
    this.numElements = inStream.readUint32();
    this.elementSize = inStream.readUint32();
    this.usage = inStream.readEnum();
    this._data = new Uint8Array(inStream.readBinary(this.numBytes));
    this.numBytes = this._data.length;
};

/**
 * IndexBuffer 索引缓冲
 *
 * @param numElements {number}
 * @param elementSize {number}
 * @param usage {number} 缓冲用途， 参照L5.BU_XXX
 *
 * @extends {L5.Buffer}
 *
 * @author lonphy
 * @version 1.0
 * @class
 */
L5.IndexBuffer = function (
    numElements, elementSize, usage
) {
    usage = usage || L5.Buffer.BU_STATIC;
    L5.Buffer.call (this, numElements, elementSize, usage);

    this.offset = 0;
};

L5.nameFix (L5.IndexBuffer, 'IndexBuffer');
L5.extendFix (L5.IndexBuffer, L5.Buffer);

/**
 *
 * @param inStream {L5.InStream}
 */
L5.IndexBuffer.prototype.load = function(inStream){
    L5.Buffer.prototype.load.call(this, inStream);
    this.offset = inStream.readUint32();
};
/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.IndexBuffer}
 */
L5.IndexBuffer.factory = function (inStream) {
    var obj = new L5.IndexBuffer(0,0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.IndexBuffer', L5.IndexBuffer.factory);

/**
 *
 * @param numTargets {number}
 * @param format {number}
 * @param width {number}
 * @param height {number}
 * @param hasMipmaps {boolean}
 * @param hasDepthStencil {boolean}
 * @constructor
 */
L5.RenderTarget = function(
    numTargets, format, width, height, hasMipmaps, hasDepthStencil
) {
    L5.assert(numTargets > 0, "Number of targets must be at least one.\n");

    this.numTargets = numTargets;
    this.hasMipmaps = hasMipmaps;

    /**
     * @type {L5.Texture2D}
     */
    this.colorTextures = new Array(numTargets);

    var i;
    for (i = 0; i < numTargets; ++i)
    {
        this.colorTextures[i] = new L5.Texture2D(format, width, height, hasMipmaps, L5.Buffer.BU_RENDERTARGET);
    }

    if (hasDepthStencil)
    {
        this.depthStencilTexture = new L5.Texture2D(L5.TEXTURE_FORMAT_D24S8, width, height, 1, L5.Buffer.BU_DEPTHSTENCIL);
    }
    else
    {
        this.depthStencilTexture = null;
    }
};
L5.RenderTarget.name = "RenderTarget";

L5.RenderTarget.prototype = {
    constructor: L5.RenderTarget,

    get width() {
        return this.colorTextures[0].width;
    },
    get height() {
        return this.colorTextures[0].height;
    },
    get format() {
        return this.colorTextures[0].format;
    },

    getColorTexture: function(index) {
        return this.colorTextures[index];
    },

    hasDepthStencil: function() {
        return this.depthStencilTexture !== null;
    }
};

/**
 * Texture 纹理基类构造
 *
 * @param format {number} 纹理格式， 参考L5.Texture.TF_XXX
 * @param type {number} 纹理类型, 参考L5.Texture.TT_XXX
 * @param usage {number} 用途, 参考L5.Buffer.BU_XXX
 * @param numLevels {number} 纹理级数
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Texture = function (format, type, usage, numLevels) {
    L5.D3Object.call(this);
    this.data = null;

    this.format = format;       // 纹理元素格式
    this.type = type;           // 纹理类型， 例如 2d, 3d...
    this.usage = usage;         // 纹理用途
    this.numLevels = numLevels; // MipMaps级数
    this.numDimensions = L5.Texture.DIMENSIONS[type];

    const max_levels = L5.Texture.MAX_MIPMAP_LEVELS;

    this.dimension = [
        new Array(max_levels),
        new Array(max_levels),
        new Array(max_levels)
    ];

    this.numLevelBytes = new Array(max_levels);
    this.numTotalBytes = 0;
    this.levelOffsets = new Array(max_levels);
    for (var level = 0; level < max_levels; ++level) {
        this.dimension[0][level] = 0;
        this.dimension[1][level] = 0;
        this.dimension[2][level] = 0;
        this.numLevelBytes[level] = 0;
        this.levelOffsets[level] = 0;
    }

    // 用户字段, 用于存储特定于APP的未知结构数据
    const maxUserFields = L5.Texture.MAX_USER_FIELDS;
    this.userField = new Array(maxUserFields);
    for (var i = 0; i < maxUserFields; ++i) {
        this.userField[i] = 0;
    }
};

L5.nameFix(L5.Texture, 'Texture');
L5.extendFix(L5.Texture, L5.D3Object);

///////////////////////// 纹理通用常量定义 /////////////////////////////////////
L5.Texture.MAX_MIPMAP_LEVELS = 16; // MipMap纹理最大级数0-15
L5.Texture.MAX_USER_FIELDS = 8;  // 用户特定纹理 最大数量

////////////////////////////////  纹理类型 ////////////////////////////////////
L5.Texture.TT_2D = 1;
L5.Texture.TT_CUBE = 3;

//////////////////////////////// 纹理格式定义 /////////////////////////////////
L5.Texture.TF_NONE = 0;
L5.Texture.TF_R5G6B5 = 1;
L5.Texture.TF_A1R5G5B5 = 2;
L5.Texture.TF_A4R4G4B4 = 3;
L5.Texture.TF_A8 = 4;
L5.Texture.TF_L8 = 5;
L5.Texture.TF_A8L8 = 6;
L5.Texture.TF_R8G8B8 = 7;
L5.Texture.TF_A8R8G8B8 = 8;
L5.Texture.TF_A8B8G8R8 = 9;
L5.Texture.TF_L16 = 10;
L5.Texture.TF_G16R16 = 11;
L5.Texture.TF_A16B16G16R16 = 12;
L5.Texture.TF_R16F = 13;  // not support
L5.Texture.TF_G16R16F = 14;  // not support
L5.Texture.TF_A16B16G16R16F = 15;  // not support
L5.Texture.TF_R32F = 16;
L5.Texture.TF_G32R32F = 17;
L5.Texture.TF_A32B32G32R32F = 18;
L5.Texture.TF_DXT1 = 19;
L5.Texture.TF_DXT3 = 20;
L5.Texture.TF_DXT5 = 21;
L5.Texture.TF_D24S8 = 22;
L5.Texture.TF_QUANTITY = 23;

////////////////////////// 每种格式纹理是否支持生成MipMaps /////////////////////
L5.Texture.MIPMAPABLE = [
    false,  // L5.Texture.TF_NONE
    true,   // L5.Texture.TF_R5G6B5
    true,   // L5.Texture.TF_A1R5G5B5
    true,   // L5.Texture.TF_A4R4G4B4
    true,   // L5.Texture.TF_A8
    true,   // L5.Texture.TF_L8
    true,   // L5.Texture.TF_A8L8
    true,   // L5.Texture.TF_R8G8B8
    true,   // L5.Texture.TF_A8R8G8B8
    true,   // L5.Texture.TF_A8B8G8R8
    true,   // L5.Texture.TF_L16
    true,   // L5.Texture.TF_G16R16
    true,   // L5.Texture.TF_A16B16G16R16
    false,   // L5.Texture.TF_R16F
    false,   // L5.Texture.TF_G16R16F
    false,   // L5.Texture.TF_A16B16G16R16F
    false,  // L5.Texture.TF_R32F
    false,  // L5.Texture.TF_G32R32F
    false,  // L5.Texture.TF_A32B32G32R32F,
    true,   // L5.Texture.TF_DXT1 (special handling)
    true,   // L5.Texture.TF_DXT3 (special handling)
    true,   // L5.Texture.TF_DXT5 (special handling)
    false   // L5.Texture.TF_D24S8
];

/////////////////////////    纹理类型维度    //////////////////////////////////
L5.Texture.DIMENSIONS = [
    2,  // TT_2D
    2  // TT_CUBE
];

////////////////// 每种像素格式单个像素占用的尺寸单位，字节  //////////////////////
L5.Texture.PIXEL_SIZE = [
    0,              // L5.Texture.TF_NONE
    2,              // L5.Texture.TF_R5G6B5
    2,              // L5.Texture.TF_A1R5G5B5
    2,              // L5.Texture.TF_A4R4G4B4
    1,              // L5.Texture.TF_A8
    1,              // L5.Texture.TF_L8
    2,              // L5.Texture.TF_A8L8
    3,              // L5.Texture.TF_R8G8B8
    4,              // L5.Texture.TF_A8R8G8B8
    4,              // L5.Texture.TF_A8B8G8R8
    2,              // L5.Texture.TF_L16
    4,              // L5.Texture.TF_G16R16
    8,              // L5.Texture.TF_A16B16G16R16
    2,              // L5.Texture.TF_R16F
    4,              // L5.Texture.TF_G16R16F
    8,              // L5.Texture.TF_A16B16G16R16F
    4,              // L5.Texture.TF_R32F
    8,              // L5.Texture.TF_G32R32F
    16,             // L5.Texture.TF_A32B32G32R32F,
    0,              // L5.Texture.TF_DXT1 (special handling)
    0,              // L5.Texture.TF_DXT3 (special handling)
    0,              // L5.Texture.TF_DXT5 (special handling)
    4               // L5.Texture.TF_D24S8
];

/////////////////////////    纹理格式转换函数   //////////////////////////////////
L5.Texture.COLOR_FROM_FUNC = [
    null,
    L5.Color.convertFromR5G6B5,
    L5.Color.convertFromA1R5G5B5,
    L5.Color.convertFromA4R4G4B4,
    L5.Color.convertFromA8,
    L5.Color.convertFromL8,
    L5.Color.convertFromA8L8,
    L5.Color.convertFromR8G8B8,
    L5.Color.convertFromA8R8G8B8,
    L5.Color.convertFromA8B8G8R8,
    L5.Color.convertFromL16,
    L5.Color.convertFromG16R16,
    L5.Color.convertFromA16B16G16R16,
    L5.Color.convertFromR16F,
    L5.Color.convertFromG16R16F,
    L5.Color.convertFromA16B16G16R16F,
    L5.Color.convertFromR32F,
    L5.Color.convertFromG32R32F,
    L5.Color.convertFromA32B32G32R32F,
    null,
    null,
    null,
    null
];
L5.Texture.COLOR_TO_FUNC = [
    null,
    L5.Color.convertToR5G6B5,
    L5.Color.convertToA1R5G5B5,
    L5.Color.convertToA4R4G4B4,
    L5.Color.convertToA8,
    L5.Color.convertToL8,
    L5.Color.convertToA8L8,
    L5.Color.convertToR8G8B8,
    L5.Color.convertToA8R8G8B8,
    L5.Color.convertToA8B8G8R8,
    L5.Color.convertToL16,
    L5.Color.convertToG16R16,
    L5.Color.convertToA16B16G16R16,
    L5.Color.convertToR16F,
    L5.Color.convertToG16R16F,
    L5.Color.convertToA16B16G16R16F,
    L5.Color.convertToR32F,
    L5.Color.convertToG32R32F,
    L5.Color.convertToA32B32G32R32F,
    null,
    null,
    null,
    null
];

/////////////////////////////   方法定义   ///////////////////////////////////
L5.Texture.prototype.isCompressed = function () {
    return this.format === L5.Texture.TF_DXT1 ||
        this.format === L5.Texture.TF_DXT3 ||
        this.format === L5.Texture.TF_DXT5;
};

/**
 * 获取纹理级数数据
 * @param i {number}
 * @param level {number}
 */
L5.Texture.prototype.getDimension = function (i, level) {
    return this.dimension[i][level];
};

/**
 * 判断是否可以生成MipMaps纹理
 * @returns {boolean}
 */
L5.Texture.prototype.isMipMapsAble = function () {
    return L5.Texture.MIPMAPABLE[this.format];
};

/**
 * 在系统内存中管理纹理的一个拷贝
 *
 * 字节数通过getNumTotalBytes查询
 * 获取到的数据不能修改，因为渲染器并不会知道
 * @returns {ArrayBuffer}
 */
L5.Texture.prototype.getData = function () {
};

L5.Texture.loadWMTF = function (name, mode) {
    var p = new Promise(function (resolve, reject) {
        var file = new L5.XhrTask('wmtf/' + name, 'arraybuffer');

        file.then(function (result) {

            var inFile = new DataView(result);

            const MAX_MIPMAP_LEVELS = L5.Texture.MAX_MIPMAP_LEVELS;
            const MAX_USER_FIELDS = L5.Texture.MAX_USER_FIELDS;

            var dimension = [
                new Array(MAX_MIPMAP_LEVELS),
                new Array(MAX_MIPMAP_LEVELS),
                new Array(MAX_MIPMAP_LEVELS)
            ];
            var numLevelBytes = new Array(MAX_MIPMAP_LEVELS);
            var levelOffsets = new Array(MAX_MIPMAP_LEVELS);
            var userField = new Array(MAX_USER_FIELDS);
            var i = 0, j;
            var format = inFile.getInt32(i++ * 4, true);
            var type = inFile.getInt32(i++ * 4, true);
            var usage = inFile.getInt32(i++ * 4, true);
            var numLevels = inFile.getInt32(i++ * 4, true);
            var numDimensions = inFile.getInt32(i++ * 4, true);

            for (j = 0; j < MAX_MIPMAP_LEVELS; ++j) {
                dimension[0][j] = inFile.getInt32(i++ * 4, true);
            }
            for (j = 0; j < MAX_MIPMAP_LEVELS; ++j) {
                dimension[1][j] = inFile.getInt32(i++ * 4, true);
            }
            for (j = 0; j < MAX_MIPMAP_LEVELS; ++j) {
                dimension[2][j] = inFile.getInt32(i++ * 4, true);
            }
            for (j = 0; j < MAX_MIPMAP_LEVELS; ++j) {
                numLevelBytes[j] = inFile.getInt32(i++ * 4, true);
            }
            var numTotalBytes = inFile.getInt32(i++ * 4, true);
            for (j = 0; j < MAX_MIPMAP_LEVELS; ++j) {
                levelOffsets[j] = inFile.getInt32(i++ * 4, true);
            }
            for (j = 0; j < MAX_USER_FIELDS; ++j) {
                userField[j] = inFile.getInt32(i++ * 4, true);
            }

            var texture;
            switch (type) {
                case L5.Texture.TT_2D:
                    texture = new L5.Texture2D(format, dimension[0][0], dimension[1][0], numLevels, usage);
                    break;
                case L5.Texture.TT_CUBE:
                    texture = new L5.TextureCube(format, dimension[0][0], numLevels, usage);
                    break;
                default:
                    L5.assert(false, 'Unknown texture type.');
                    return 0;
            }

            i *= 4;
            switch (texture.format) {
                // Small-bit color formats.
                case L5.Texture.TF_R5G6B5:
                case L5.Texture.TF_A1R5G5B5:
                case L5.Texture.TF_A4R4G4B4:
                    texture.data = result.slice(i, i + numTotalBytes / 2);
                    break;

                // 8-bit integer formats.
                case L5.Texture.TF_A8:
                case L5.Texture.TF_L8:
                case L5.Texture.TF_A8L8:
                case L5.Texture.TF_R8G8B8:
                case L5.Texture.TF_A8R8G8B8:
                case L5.Texture.TF_A8B8G8R8:
                    texture.data = result.slice(i, i + numTotalBytes);
                    break;

                // 16-bit formats.
                case L5.Texture.TF_L16:
                case L5.Texture.TF_G16R16:
                case L5.Texture.TF_A16B16G16R16:
                case L5.Texture.TF_R16F:
                case L5.Texture.TF_G16R16F:
                case L5.Texture.TF_A16B16G16R16F:
                    texture.data = result.slice(i, i + numTotalBytes / 2);
                    break;

                // 32-bit formats.
                case L5.Texture.TF_R32F:
                case L5.Texture.TF_G32R32F:
                case L5.Texture.TF_A32B32G32R32F:
                case L5.Texture.TF_D24S8:
                    texture.data = result.slice(i, i + numTotalBytes / 4);
                    break;

                // DXT compressed formats.  TODO: How to handle?
                case L5.Texture.TF_DXT1:
                case L5.Texture.TF_DXT3:
                case L5.Texture.TF_DXT5:
                    texture.data = result.slice(i, i + numTotalBytes);
                    break;

                default:
                    L5.assert(false, 'Unknown texture format.');
                    return null;
            }

            for (j = 0; j < MAX_USER_FIELDS; ++j) {
                texture.userField[j] = userField[j];
            }
            texture.data = new Uint8Array(texture.data);
            resolve(texture);
        }).catch(function () {
            reject('Failed to load file ' + name);
        });
    });

    return p;
};

/**
 * Texture2D 2D纹理构造
 * @param format {number} 纹理格式， 参考L5.Texture.TT_XXX
 * @param dimension0 {number} 相当于宽度
 * @param dimension1 {number} 相当于高度
 * @param numLevels {number} 纹理级数 0 为最大值
 * @param usage {number} 用途, 参考L5.Buffer.BU_XXX
 * @class
 * @extends {L5.Texture}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Texture2D = function (format, dimension0, dimension1, numLevels, usage) {
    L5.assert(dimension0 > 0, 'Dimension0 must be positive');
    L5.assert(dimension1 > 0, 'Dimension1 must be positive');

    usage = usage === undefined ? L5.Buffer.BU_TEXTURE : usage;

    L5.Texture.call(this, format, L5.Texture.TT_2D, usage, numLevels);

    this.dimension[0][0] = dimension0;
    this.dimension[1][0] = dimension1;

    var logDim0 = L5.Math.log2OfPowerOfTwo(dimension0 | 0);
    var logDim1 = L5.Math.log2OfPowerOfTwo(dimension1 | 0);
    var maxLevels = (logDim0 >= logDim1 ? logDim0 : logDim1) + 1;

    if (numLevels === 0) {
        this.numLevels = maxLevels;
    } else if (numLevels <= maxLevels) {
        this.numLevels = numLevels;
    } else {
        L5.assert(false, 'Invalid number of levels');
    }

    this.computeNumLevelBytes();
    this.data = new Uint8Array(this.numTotalBytes);
};
L5.nameFix(L5.Texture2D, 'Texture2D');
L5.extendFix(L5.Texture2D, L5.Texture);

Object.defineProperties
(
    L5.Texture2D.prototype,
    {
        // Get the width of the 0 level MipMaps.
        width: {
            get: function () {
                return this.getDimension(0, 0);
            }
        },
        // Get the height of the 0 level MipMaps.
        height: {
            get: function () {
                return this.getDimension(1, 0);
            }
        },
        hasMipmaps: {
            get: function () {
                var logDim0 = L5.Math.log2OfPowerOfTwo(this.dimension[0][0]);
                var logDim1 = L5.Math.log2OfPowerOfTwo(this.dimension[1][0]);
                var maxLevels = (logDim0 >= logDim1 ? logDim0 : logDim1) + 1;

                return this.numLevels === maxLevels;
            }
        }
    }
);
/**
 * 获取纹理数据
 *  返回指定纹理级别以下的所有mipmaps
 * @param level {number} 纹理级别，
 * @returns {ArrayBufferView}
 */
L5.Texture2D.prototype.getData = function (level) {
    if (0 <= level && level < this.numLevels) {
        return this.data.subarray(this.levelOffsets[level],
            this.levelOffsets[level] + this.numLevelBytes[level]);
    }

    L5.assert(false, '[ L5.Texture2D.getData ] \'s param level invalid');
    return null;
};

L5.Texture2D.prototype.generateMipmaps = function () {
    var width = this.dimension[0][0];
    var height = this.dimension[1][0];
    var logDim0 = L5.Math.log2OfPowerOfTwo(width);
    var logDim1 = L5.Math.log2OfPowerOfTwo(height);

    var maxLevels = (logDim0 >= logDim1 ? logDim0 : logDim1) + 1;

    var retainBindings = true;
    if (this.numLevels != maxLevels) {
        retainBindings = false;
        //Renderer.UnbindAll(this);
        this.numLevels = maxLevels;
        this.computeNumLevelBytes();

        var newData = new Uint8Array(this.numTotalBytes);
        newData.set(this.data.slice(0, this.numLevelBytes[0]), 0);
        delete this.data;
        this.data = newData;
    }

    // 临时存储生成的mipmaps.
    var rgba = new Float32Array(width * height * 4),
        levels = this.numLevels;

    var texels = 0;
    var level, widthNext, heightNext, texelsNext;
    for (level = 1; level < levels; ++level) {
        texelsNext = this.levelOffsets[level];
        widthNext = this.dimension[0][level];
        heightNext = this.dimension[1][level];

        this.generateNextMipmap(width, height, texels, widthNext, heightNext, texelsNext, rgba);

        width = widthNext;
        height = heightNext;
        texels = texelsNext;
    }

    if (retainBindings) {
        for (level = 0; level < levels; ++level) {
            L5.Renderer.updateAll(this, level);
        }
    }
};

/**
 * 计算各级纹理需要的字节数
 * @protected
 */
L5.Texture2D.prototype.computeNumLevelBytes = function () {

    var format = this.format;

    switch (format) {
        case L5.Texture.TT_R32F:
        case L5.Texture.TT_G32R32F:
        case L5.Texture.TT_A32B32G32R32F:
            if (this.numLevels > 1) {
                L5.assert(false, 'No mipmaps for 32-bit float textures');
                this.numLevels = 1;
            }
            break;
        case L5.Texture.TT_D24S8:
            if (this.numLevels > 1) {
                L5.assert(false, 'No mipmaps for 2D depth textures');
                this.numLevels = 1;
            }
    }

    this.numTotalBytes = 0;

    var dim0 = this.dimension[0][0],
        dim1 = this.dimension[1][0],
        m = this.numLevels,
        level, max0, max1;


    if (format === L5.Texture.TT_DXT1) {
        for (level = 0; level < m; ++level) {
            max0 = dim0 / 4;
            if (max0 < 1) {
                max0 = 1;
            }
            max1 = dim1 / 4;
            if (max1 < 1) {
                max1 = 1;
            }

            this.numLevelBytes[level] = 8 * max0 * max1;
            this.numTotalBytes += this.numLevelBytes[level];
            this.dimension[0][level] = dim0;
            this.dimension[1][level] = dim1;
            this.dimension[2][level] = 1;

            if (dim0 > 1) {
                dim0 >>= 1;
            }
            if (dim1 > 1) {
                dim1 >>= 1;
            }
        }
    }
    else if (format === L5.Texture.TT_DXT3 || format === L5.Texture.TT_DXT5) {
        for (level = 0; level < m; ++level) {
            max0 = dim0 / 4;
            if (max0 < 1) {
                max0 = 1;
            }
            max1 = dim1 / 4;
            if (max1 < 1) {
                max1 = 1;
            }

            this.numLevelBytes[level] = 16 * max0 * max1;
            this.numTotalBytes += this.numLevelBytes[level];
            this.dimension[0][level] = dim0;
            this.dimension[1][level] = dim1;
            this.dimension[2][level] = 1;

            if (dim0 > 1) {
                dim0 >>= 1;
            }
            if (dim1 > 1) {
                dim1 >>= 1;
            }
        }
    }
    else {
        var pixelSize = L5.Texture.PIXEL_SIZE[format];
        for (level = 0; level < m; ++level) {
            this.numLevelBytes[level] = pixelSize * dim0 * dim1;
            this.numTotalBytes += this.numLevelBytes[level];
            this.dimension[0][level] = dim0;
            this.dimension[1][level] = dim1;
            this.dimension[2][level] = 1;

            if (dim0 > 1) {
                dim0 >>= 1;
            }
            if (dim1 > 1) {
                dim1 >>= 1;
            }
        }
    }

    this.levelOffsets[0] = 0;
    for (level = 0, --m; level < m; ++level) {
        this.levelOffsets[level + 1] = this.levelOffsets[level] + this.numLevelBytes[level];
    }
};

/**
 *
 * @param width {number}
 * @param height {number}
 * @param texels {ArrayBuffer}
 * @param widthNext {number}
 * @param heightNext {number}
 * @param texelsNext {number}
 * @param rgba {Array<number>}
 * @protected
 */
L5.Texture2D.prototype.generateNextMipmap = function (width, height, texels,
                                                      widthNext, heightNext, texelsNext,
                                                      rgba) {
    var numTexels = width * height;
    var pixelSize = L5.Texture.PIXEL_SIZE[this.format];
    // 转换纹理元素到32bitRGBA
    L5.Texture.COLOR_FROM_FUNC[this.format](numTexels, this.data.subarray(texels, texels + numTexels * pixelSize),
        rgba);

    var i1, i0, j, c, base;
    // Create the next miplevel in-place.
    for (i1 = 0; i1 < heightNext; ++i1) {
        for (i0 = 0; i0 < widthNext; ++i0) {
            j = i0 + widthNext * i1;
            base = 2 * (i0 + width * i1);
            for (c = 0; c < 4; ++c) {
                rgba[j * 4 + c] = 0.25 * (
                        rgba[base * 4 + c] +
                        rgba[(base + 1) * 4 + c] +
                        rgba[(base + width) * 4 + c] +
                        rgba[(base + width + 1) * 4 + c]
                    );
            }
        }
    }

    var numTexelsNext = widthNext * heightNext;
    // 从32bit-RGBA转换成原始格式, subArray使用的是指针
    L5.Texture.COLOR_TO_FUNC[this.format](numTexelsNext, rgba,
        this.data.subarray(texelsNext, (texelsNext + numTexelsNext * pixelSize)));
};

L5.Texture2D.loadWMTF = function (name, mode) {
    return L5.Texture.loadWMTF(name, mode).then(function (texture) {
        if (texture && texture instanceof L5.Texture2D) {
            return texture;
        }
        return null;
    });
};

/**
 * TextureCube 立方纹理构造
 * @param format {number} 纹理格式， 参考L5.Texture.TT_XXX
 * @param dimension {number} 相当于宽度、高度， 宽=高
 * @param numLevels {number} 纹理级数 0 为最大值
 * @param usage {number} 用途, 参考L5.BU_XXX
 * @class
 * @extends {L5.Texture}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TextureCube                   = function (
    format, dimension, numLevels, usage
) {
    L5.assert (dimension > 0, 'Dimension0 must be positive');

    usage = usage === undefined ? L5.Buffer.BU_TEXTURE : usage;

    L5.Texture.call (this, format, L5.Texture.TT_CUBE, usage, numLevels);

    this.dimension[ 0 ][ 0 ] = dimension;
    this.dimension[ 1 ][ 0 ] = dimension;

    var maxLevels = 1 + L5.Math.log2OfPowerOfTwo (dimension | 0);

    if (numLevels === 0) {
        this.numLevels = maxLevels;
    }
    else if (numLevels <= maxLevels) {
        this.numLevels = numLevels;
    }
    else {
        L5.assert (false, "Invalid number of levels\n");
    }

    this.computeNumLevelBytes ();
    this.data     = new Uint8Array (this.numTotalBytes);
};

L5.nameFix (L5.TextureCube, 'TextureCube');
L5.extendFix (L5.TextureCube, L5.Texture);

Object.defineProperties
(
    L5.TextureCube.prototype,
    {
        width     : {
            get: function () {
                return this.getDimension (0, 0);
            }
        },
        height    : {
            get: function () {
                return this.getDimension (1, 0);
            }
        },
        hasMipmaps: {
            get: function () {
                var logDim = L5.Math.log2OfPowerOfTwo (this.dimension[ 0 ][ 0 ]);
                return this.numLevels === (logDim + 1);
            }
        }
    }
);
/**
 * 获取纹理数据
 *  返回指定纹理级别以下的所有mipmaps
 * @param face {number} 纹理级别，
 * @param level {number} 纹理级别，
 * @returns {ArrayBuffer}
 */
L5.TextureCube.prototype.getData = function (face, level) {
    if (0 <= level && level < this.numLevels) {
        var faceOffset = face * this.numTotalBytes / 6;
        var start      = faceOffset + this.levelOffsets[ level ];
        var end        = start + this.numLevelBytes[ level ];
        return this.data.subarray (start, end);
    }

    L5.assert (false, "[ L5.TextureCube.getData ] 's param level invalid \n");
    return null;
};

L5.TextureCube.prototype.generateMipmaps = function () {

    var dim                                               = this.dimension[ 0 ][ 0 ],
        maxLevels                                         = L5.Math.log2OfPowerOfTwo (dim) + 1,
        face, faceOffset, faceSize, level, retainBindings = true;

    if (this.numLevels != maxLevels) {
        retainBindings = false;
        //Renderer.UnbindAll(this);
        this.numLevels       = maxLevels;
        var oldNumTotalBytes = this.numTotalBytes / 6;
        this.computeNumLevelBytes ();

        var newData = new Uint8Array (this.numTotalBytes);
        faceSize    = this.numTotalBytes / 6;
        for (face = 0; face < 6; ++face) {
            var oldFaceOffset = face * oldNumTotalBytes;
            faceOffset        = face * faceSize;
            newData.set (this.data.subarray (oldFaceOffset, this.numLevelBytes[ 0 ]), faceOffset);
        }
        delete this.data;
        this.data = newData;
    }

    // 临时存储生成的mipmaps.
    var rgba   = new Float32Array (dim * dim * 4),
        levels = this.numLevels,
        texels, texelsNext, dimNext;
    faceSize   = this.numTotalBytes / 6;

    for (face = 0; face < 6; ++face) {
        faceOffset = face * faceSize;
        texels     = faceOffset;

        for (level = 1; level < levels; ++level) {
            texelsNext = faceOffset + this.levelOffsets[ level ];
            dimNext    = this.dimension[ 0 ][ level ];
            this.generateNextMipmap (dim, texels, dimNext, texelsNext, rgba);
            dim        = dimNext;
            texels     = texelsNext;
        }
    }

    if (retainBindings) {
        for (face = 0; face < 6; ++face) {
            for (level = 0; level < levels; ++level) {
                L5.Renderer.updateAll (this, face, level);
            }
        }
    }
};

/**
 * 计算各级纹理需要的字节数
 * @protected
 */
L5.TextureCube.prototype.computeNumLevelBytes = function () {

    var format = this.format;

    switch (format) {
        case L5.Texture.TT_R32F:
        case L5.Texture.TT_G32R32F:
        case L5.Texture.TT_A32B32G32R32F:
            if (this.numLevels > 1) {
                L5.assert (false, 'No mipmaps for 32-bit float textures');
                this.numLevels = 1;
            }
            break;
        case L5.Texture.TT_D24S8:
            if (this.numLevels > 1) {
                L5.assert (false, 'No mipmaps for 2D depth textures');
                this.numLevels = 1;
            }
    }
    this.numTotalBytes = 0;

    var dim = this.dimension[ 0 ][ 0 ],
        m   = this.numLevels,
        level, max;


    if (format === L5.Texture.TT_DXT1) {
        for (level = 0; level < m; ++level) {
            max = dim / 4;
            if (max < 1) {
                max = 1;
            }

            this.numLevelBytes[ level ]  = 8 * max * max;
            this.numTotalBytes += this.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = dim;
            this.dimension[ 1 ][ level ] = dim;

            if (dim > 1) {
                dim >>= 1;
            }
        }
    }
    else if (format === L5.Texture.TT_DXT3 || format === L5.Texture.TT_DXT5) {
        for (level = 0; level < m; ++level) {
            max = dim / 4;
            if (max < 1) {
                max = 1;
            }

            this.numLevelBytes[ level ]  = 16 * max * max;
            this.numTotalBytes += this.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = dim;
            this.dimension[ 1 ][ level ] = dim;

            if (dim > 1) {
                dim >>= 1;
            }
        }
    }
    else {
        var pixelSize = L5.Texture.PIXEL_SIZE[ format ];
        for (level = 0; level < m; ++level) {
            this.numLevelBytes[ level ]  = pixelSize * dim * dim;
            this.numTotalBytes += this.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = dim;
            this.dimension[ 1 ][ level ] = dim;

            if (dim > 1) {
                dim >>= 1;
            }
        }
    }

    this.numTotalBytes *= 6;

    this.levelOffsets[ 0 ] = 0;
    for (level = 0, --m; level < m; ++level) {
        this.levelOffsets[ level + 1 ] = this.levelOffsets[ level ] + this.numLevelBytes[ level ];
    }
};

/**
 *
 * @param dim {number}
 * @param texels {ArrayBuffer}
 * @param dimNext {number}
 * @param texelsNext {number}
 * @param rgba {ArrayBuffer}
 * @protected
 */
L5.TextureCube.prototype.generateNextMipmap = function (
    dim, texels,
    dimNext, texelsNext,
    rgba
) {
    var numTexels = dim * dim,
        format    = this.format;
    var pixelSize = L5.Texture.PIXEL_SIZE[ format ];
    // 转换纹理元素到32bitRGBA
    L5.Texture.COLOR_FROM_FUNC[ format ] (numTexels, this.data.subarray (texels, texels + numTexels * pixelSize), rgba);

    var i1, i0, j, c, base;
    // Create the next miplevel in-place.
    for (i1 = 0; i1 < dimNext; ++i1) {
        for (i0 = 0; i0 < dimNext; ++i0) {
            j    = i0 + dimNext * i1;
            base = 2 * (i0 + dim * i1);
            for (c = 0; c < 4; ++c) {
                rgba[ j * 4 + c ] = 0.25 * (
                        rgba[ base * 4 + c ] +
                        rgba[ (base + 1) * 4 + c ] +
                        rgba[ (base + dim) * 4 + c ] +
                        rgba[ (base + dim + 1) * 4 + c ]
                    );
            }
        }
    }

    var numTexelsNext = dimNext * dimNext;
    // 从32bit-RGBA转换成原始格式, subArray使用的是指针
    L5.Texture.COLOR_TO_FUNC[ format ] (numTexelsNext, rgba,
        this.data.subarray (texelsNext, (texelsNext + numTexelsNext * pixelSize)));
};

/**
 * VertexBuffer 顶点缓冲
 * @param numElements
 * @param elementSize
 * @param usage {number} 缓冲用途， 参照L5.BU_XXX
 * @class
 * @extends {L5.Buffer}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VertexBuffer = function (
    numElements, elementSize, usage
) {
    usage = usage || L5.Buffer.BU_STATIC;
    L5.Buffer.call (this, numElements, elementSize, usage);
};

L5.nameFix (L5.VertexBuffer, 'VertexBuffer');
L5.extendFix (L5.VertexBuffer, L5.Buffer);

/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.VertexBuffer}
 */
L5.VertexBuffer.factory = function (inStream) {
    var obj = new L5.VertexBuffer(0,0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.VertexBuffer', L5.VertexBuffer.factory);

/**
 * VertexBufferAccessor 顶点缓冲访问器
 * @param format {L5.VertexFormat}
 * @param buffer {L5.VertexBuffer}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.VertexBufferAccessor = function (format, buffer) {
    /**
     * @type {L5.VertexFormat}
     */
    this.format = format;
    /**
     * @type {L5.VertexBuffer}
     */
    this.vertexBuffer = buffer;

    this.stride = format.stride;

    /**
     * @type {ArrayBuffer}
     */
    this.data = buffer.getData();

    var i;
    const MAX_TCOORD_UNITS = L5.VertexFormat.MAX_TCOORD_UNITS;
    const MAX_COLOR_UNITS = L5.VertexFormat.MAX_COLOR_UNITS;

    // byte offsets
    this.position = -1;
    this.normal = -1;
    this.tangent = -1;
    this.binormal = -1;
    this.tCoord = new Array(MAX_TCOORD_UNITS);
    this.color = new Array(MAX_COLOR_UNITS);
    this.blendIndices = -1;
    this.blendWeight = -1;

    this.positionChannels = 0;
    this.normalChannels = 0;
    this.tangentChannels = 0;
    this.binormalChannels = 0;
    this.tCoordChannels = new Array(MAX_TCOORD_UNITS);
    this.colorChannels = new Array(MAX_COLOR_UNITS);

    for (i = 0; i < MAX_TCOORD_UNITS; ++i) {
        this.tCoord[i] = -1;
        this.tCoordChannels[i] = 0;
    }
    for (i = 0; i < MAX_COLOR_UNITS; ++i) {
        this.color[i] = -1;
        this.colorChannels[i] = 0;
    }

    this.initialize();
};
L5.nameFix(L5.VertexBufferAccessor, 'VertexBufferAccessor');

/**
 * @param visual {L5.Visual}
 * @returns {L5.VertexBufferAccessor}
 */
L5.VertexBufferAccessor.fromVisual = function (visual) {
    return new L5.VertexBufferAccessor(visual.format, visual.vertexBuffer);
};

/**
 * 获取顶点数量
 * @returns {number}
 */
L5.VertexBufferAccessor.prototype.getNumVertices = function () {
    return this.vertexBuffer.numElements;
};

/**
 * 获取顶点坐标
 * @param index {number} 索引
 * @returns {Float32Array} 顶点坐标引用
 */
L5.VertexBufferAccessor.prototype.getPosition = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.position + index * this.stride,
        this.positionChannels
    );
};
/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setPosition = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.position + index * this.stride,
        this.positionChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};
L5.VertexBufferAccessor.prototype.hasPosition = function () {
    return this.position !== -1;
};

/**
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getNormal = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.normal + index * this.stride,
        this.normalChannels
    );
};

/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setNormal = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.normal + index * this.stride,
        this.normalChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};

L5.VertexBufferAccessor.prototype.hasNormal = function () {
    return this.normal !== -1;
};

/**
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getTangent = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.tangent + index * this.stride,
        this.tangentChannels
    );
};
/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setTangent = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.tangent + index * this.stride,
        this.tangentChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};
L5.VertexBufferAccessor.prototype.hasTangent = function () {
    return this.tangent !== -1;
};

/**
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getBinormal = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.binormal + index * this.stride,
        this.binormalChannels
    );
};
/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setBinormal = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.binormal + index * this.stride,
        this.binormalChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};

L5.VertexBufferAccessor.prototype.hasBinormal = function () {
    return this.binormal !== -1;
};

/**
 * @param unit {number}
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getTCoord = function (unit, index) {
    return new Float32Array
    (
        this.data.buffer,
        this.tCoord[unit] + index * this.stride,
        this.tCoordChannels[unit]
    );
};
L5.VertexBufferAccessor.prototype.setTCoord = function (unit, index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.tCoord[unit] + index * this.stride,
        this.tCoordChannels[unit]
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};

/**
 * @param unit {number}
 * @returns {boolean}
 */
L5.VertexBufferAccessor.prototype.hasTCoord = function (unit) {
    return this.tCoord[unit] !== -1;
};
/**
 * @param unit {number}
 * @returns {number}
 */
L5.VertexBufferAccessor.prototype.getTCoordChannels = function (unit) {
    return this.tCoordChannels[unit];
};

/**
 * @param unit {number}
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getColor = function (unit, index) {
    return new Float32Array
    (
        this.data.buffer,
        this.color[unit] + index * this.stride,
        this.colorChannels[unit]
    );
};
L5.VertexBufferAccessor.prototype.setColor = function (unit, index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.color[unit] + index * this.stride,
        this.colorChannels[unit]
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};
/**
 * @param unit {number}
 * @returns {boolean}
 */
L5.VertexBufferAccessor.prototype.hasColor = function (unit) {
    return this.color[unit] !== -1;
};
/**
 * @param unit {number}
 * @returns {boolean}
 */
L5.VertexBufferAccessor.prototype.getColorChannels = function (unit) {
    return this.colorChannels[unit];
};

/**
 * @fixme
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getBlendIndices = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.blendIndices + index * this.stride,
        1
    );
};
L5.VertexBufferAccessor.prototype.hasBlendIndices = function () {
    return this.blendIndices !== -1;
};

/**
 * @fixme
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getBlendWeight = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.blendWeight + index * this.stride,
        1
    );
};
L5.VertexBufferAccessor.prototype.hasBlendWeight = function () {
    return this.blendWeight !== -1;
};

L5.VertexBufferAccessor.prototype.getData = function () {
    return this.data;
};

/**
 * @private
 */
L5.VertexBufferAccessor.prototype.initialize = function () {
    var format = this.format;
    var data = this.data;

    var type;

    // 顶点坐标
    var index = format.getIndex(L5.VertexFormat.AU_POSITION);
    if (index >= 0) {
        this.position = format.getOffset(index);
        type = format.getAttributeType(index);
        this.positionChannels = type;
        if (this.positionChannels > 4) {
            this.positionChannels = 0;
        }
    }

    // 法线
    index = format.getIndex(L5.VertexFormat.AU_NORMAL);
    if (index >= 0) {
        this.normal = format.getOffset(index);
        type = format.getAttributeType(index);
        this.normalChannels = type;
        if (this.normalChannels > 4) {
            this.normalChannels = 0;
        }
    }

    // 切线
    index = format.getIndex(L5.VertexFormat.AU_TANGENT);
    if (index >= 0) {
        this.tangent = format.getOffset(index);
        type = format.getAttributeType(index);
        this.tangentChannels = type;
        if (this.tangentChannels > 4) {
            this.tangentChannels = 0;
        }
    }

    // 双切线
    index = format.getIndex(L5.VertexFormat.AU_BINORMAL);
    if (index >= 0) {
        this.binormal = format.getOffset(index);
        type = format.getAttributeType(index);
        this.binormalChannels = type;
        if (this.binormalChannels > 4) {
            this.binormalChannels = 0;
        }
    }

    // 纹理坐标
    var unit;
    var units = L5.VertexFormat.MAX_TCOORD_UNITS;
    const AU_TEXCOORD = L5.VertexFormat.AU_TEXCOORD;
    for (unit = 0; unit < units; ++unit) {
        index = format.getIndex(AU_TEXCOORD, unit);
        if (index >= 0) {
            this.tCoord[unit] = format.getOffset(index);
            type = format.getAttributeType(index);
            this.tCoordChannels[unit] = type;
            if (this.tCoordChannels[unit] > 4) {
                this.tCoordChannels[unit] = 0;
            }
        }
    }

    // 颜色
    units = L5.VertexFormat.MAX_COLOR_UNITS;
    const AU_COLOR = L5.VertexFormat.AU_COLOR;
    for (unit = 0; unit < units; ++unit) {
        index = format.getIndex(AU_COLOR, unit);
        if (index >= 0) {
            this.color[unit] = format.getOffset(index);
            type = format.getAttributeType(index);
            this.colorChannels[unit] = type;
            if (this.colorChannels[unit] > 4) {
                this.colorChannels[unit] = 0;
            }
        }
    }

    index = format.getIndex(L5.VertexFormat.AU_BLENDINDICES);
    if (index >= 0) {
        this.blendIndices = format.getOffset(index);
    }

    index = format.getIndex(L5.VertexFormat.AU_BLENDWEIGHT);
    if (index >= 0) {
        this.blendWeight = format.getOffset(index);
    }
};




/**
 * VertexFormat 顶点格式
 * @author lonphy
 * @version 1.0
 *
 * @param numAttributes {number} 属性数量
 * @class
 * @extends {L5.D3Object}
 */
L5.VertexFormat = function (numAttributes) {
    L5.assert(numAttributes >= 0, 'Number of attributes must be positive');
    L5.D3Object.call(this);

    const MAX_ATTRIBUTES = L5.VertexFormat.MAX_ATTRIBUTES;

    this.numAttributes = numAttributes;
    this.stride = 0;

    this.elements = new Array(MAX_ATTRIBUTES);
    for (var i = 0; i < MAX_ATTRIBUTES; ++i) {
        this.elements[i] = new L5.VertexFormat.Element(0, 0, L5.VertexFormat.AT_NONE, L5.VertexFormat.AU_NONE, 0);
    }
};

L5.nameFix(L5.VertexFormat, 'VertexFormat');
L5.extendFix(L5.VertexFormat, L5.D3Object);

// 顶点各种属性最大个数
L5.VertexFormat.MAX_ATTRIBUTES = 16;
L5.VertexFormat.MAX_TCOORD_UNITS = 8;
L5.VertexFormat.MAX_COLOR_UNITS = 2;

// 属性类型
L5.VertexFormat.AT_NONE = 0;
L5.VertexFormat.AT_FLOAT1 = 1;
L5.VertexFormat.AT_FLOAT2 = 2;
L5.VertexFormat.AT_FLOAT3 = 3;
L5.VertexFormat.AT_FLOAT4 = 4;
L5.VertexFormat.AT_UBYTE4 = 5;
L5.VertexFormat.AT_SHORT1 = 6;
L5.VertexFormat.AT_SHORT2 = 7;
L5.VertexFormat.AT_SHORT4 = 8;

// 属性用途
L5.VertexFormat.AU_NONE = 0;
L5.VertexFormat.AU_POSITION = 1;   // 顶点
L5.VertexFormat.AU_NORMAL = 2;   // 法线
L5.VertexFormat.AU_TANGENT = 3;   // 切线
L5.VertexFormat.AU_BINORMAL = 4;   // 双切线
L5.VertexFormat.AU_TEXCOORD = 5;   // 纹理坐标
L5.VertexFormat.AU_COLOR = 6;   // 颜色
L5.VertexFormat.AU_BLENDINDICES = 7;   // 混合索引
L5.VertexFormat.AU_BLENDWEIGHT = 8;   // 混合权重
L5.VertexFormat.AU_FOGCOORD = 9;   // 雾坐标
L5.VertexFormat.AU_PSIZE = 10;  // 点大小


// 属性类型的尺寸 字节
L5.VertexFormat.TYPE_SIZE = [
    0,  // AT_NONE
    4,  // AT_FLOAT1
    8,  // AT_FLOAT2
    12, // AT_FLOAT3
    16, // AT_FLOAT4
    4,  // AT_UBYTE4
    2,  // AT_SHORT1
    4,  // AT_SHORT2
    8   // AT_SHORT4
];
L5.VertexFormat.COMPONENTS_SIZE = [
    0,  // AT_NONE
    4,  // AT_FLOAT1
    4,  // AT_FLOAT2
    4,  // AT_FLOAT3
    4,  // AT_FLOAT4
    1,  // AT_UBYTE4
    2,  // AT_SHORT1
    2,  // AT_SHORT2
    2   // AT_SHORT4
];
L5.VertexFormat.NUM_COMPONENTS = [
    0,  // AT_NONE
    1,  // AT_FLOAT1
    2,  // AT_FLOAT2
    3,  // AT_FLOAT3
    4,  // AT_FLOAT4
    4,  // AT_UBYTE4
    1,  // AT_SHORT1
    2,  // AT_SHORT2
    4   // AT_SHORT4
];


/**
 * 创建顶点格式快捷函数
 * @param numAttributes {number} 顶点元素数量
 *
 * @returns {L5.VertexFormat}
 */
L5.VertexFormat.create = function (numAttributes    /*, usage1, type1, usageIndex1, usage2,...*/) {
    var vf = new L5.VertexFormat(numAttributes);

    var args = Array.prototype.slice.call(arguments, 1);
    var offset = 0;
    var start = 0;
    const TYPE_SIZE = L5.VertexFormat.TYPE_SIZE;

    for (var i = 0; i < numAttributes; ++i, start += 3) {
        var usage = args[start];
        var type = args[start + 1];
        var usageIndex = args[start + 2];
        vf.setAttribute(i, 0, offset, type, usage, usageIndex);

        offset += TYPE_SIZE[type];
    }
    vf.setStride(offset);

    return vf;
};

/**
 * 设置指定位置顶点元素
 * @param attribute {number}
 * @param streamIndex {number}
 * @param offset {number}
 * @param type {number} AttributeType
 * @param usage {number} AttributeUsage
 * @param usageIndex {number}
 */
L5.VertexFormat.prototype.setAttribute = function (attribute, streamIndex, offset, type, usage, usageIndex) {
    L5.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in SetAttribute');

    var element = this.elements[attribute];
    element.streamIndex = streamIndex;
    element.offset = offset;
    element.type = type;
    element.usage = usage;
    element.usageIndex = usageIndex;
};

/**
 * 获取指定位置顶点元素
 * @param attribute {number} 顶点元素索引
 * @returns {L5.VertexFormat.Element}
 */
L5.VertexFormat.prototype.getAttribute = function (attribute) {
    L5.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in GetAttribute');
    return this.elements[attribute].clone();
};
/**
 * 获取指定位置顶点元素
 * @param stride {number} 顶点步幅
 */
L5.VertexFormat.prototype.setStride = function (stride) {
    L5.assert(0 < stride, 'Stride must be positive');
    this.stride = stride;
};

/**
 * 根据用途获取顶点元素位置
 * @param usage {number} 用途，参考L5.VertexFormat.AU_XXX
 * @param usageIndex {number}
 * @returns {number}
 */
L5.VertexFormat.prototype.getIndex = function (usage, usageIndex) {
    usageIndex = usageIndex || 0;

    for (var i = 0; i < this.numAttributes; ++i) {
        if (this.elements[i].usage === usage &&
            this.elements[i].usageIndex === usageIndex
        ) {
            return i;
        }
    }

    return -1;
};
/**
 * @param attribute {number}
 * @returns {number}
 */
L5.VertexFormat.prototype.getStreamIndex = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].streamIndex;
    }
    L5.assert(false, 'Invalid index in getStreamIndex');
    return 0;
};
/**
 * 获取顶点元素偏移
 * @param attribute {number} 用途，参考L5.VertexFormat.AU_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getOffset = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].offset;
    }
    L5.assert(false, 'Invalid index in getOffset');
    return 0;
};
/**
 * 获取顶点元素数据类型
 * @param attribute {number} 顶点索引
 * @returns {number} L5.VertexFormat.AT_XXX
 */
L5.VertexFormat.prototype.getAttributeType = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].type;
    }
    L5.assert(false, 'Invalid index in GetAttributeType');
    return L5.VertexFormat.AT_NONE;
};

L5.VertexFormat.prototype.getAttributeUsage = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].usage;
    }
    L5.assert(false, 'Invalid index in GetAttributeUsage');
    return L5.VertexFormat.AU_NONE;
};
L5.VertexFormat.prototype.getUsageIndex = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].usageIndex;
    }
    L5.assert(false, 'Invalid index in getUsageIndex');
    return 0;
};

/**
 * 获取顶点元素类型单位字节
 * @param type {number} 参考L5.AT_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getComponentSize = function (type) {
    return L5.VertexFormat.COMPONENTS_SIZE[type];
};
/**
 * 获取顶点元素类型单位个数
 * @param type {number} 参考L5.AT_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getNumComponents = function (type) {
    return L5.VertexFormat.NUM_COMPONENTS[type];
};
/**
 * 获取顶点元素类型所占字节
 * @param type {number} 参考L5.AT_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getTypeSize = function (type) {
    return L5.VertexFormat.TYPE_SIZE[type];
};

////////////////////////////////////////////////////////////////////////
/**
 * 顶点元素构造
 * @class
 *
 * @param streamIndex
 * @param offset
 * @param type
 * @param usage
 * @param usageIndex
 * @constructor
 */
L5.VertexFormat.Element = function (streamIndex, offset, type, usage, usageIndex) {
    this.streamIndex = streamIndex || 0;
    this.offset = offset || 0;
    this.type = type || L5.VertexFormat.AT_NONE;
    this.usage = usage || L5.VertexFormat.AU_NONE;
    this.usageIndex = usageIndex || 0;
};

L5.VertexFormat.Element.prototype.clone = function () {
    return new L5.VertexFormat.Element
    (
        this.streamIndex,
        this.offset,
        this.type,
        this.usage,
        this.usageIndex
    );
};

L5.VertexFormat.getUsageString = function (u) {
    return ['未使用', '顶点坐标', '法线', '切线', '双切线', '纹理坐标', '颜色', '混合索引', '混合权重', '雾坐标', '点尺寸'][(u >= 0 && u <= 10) ? u : 0];
};
L5.VertexFormat.getTypeString = function (t) {
    return ['NONE', 'FLOAT1', 'FLOAT2', 'FLOAT3', 'FLOAT4', 'UBYTE4', 'SHORT1', 'SHORT2', 'SHORT4'][(t >= 0 && t <= 8) ? t : 0];
};

L5.VertexFormat.prototype.debug = function () {
    console.log("================ VertexFormat 类型 ===============");
    console.log("  属性个数:", this.numAttributes, "步幅:", this.stride, "字节");
    for (var i = 0, l = this.numAttributes; i < l; ++i) {
        this.elements[i].debug();
    }
    console.log("================ VertexFormat 类型 ===============");
};

L5.VertexFormat.Element.prototype.debug = function () {
    console.log("------------ VertexFormat.Element 偏移:", this.offset, "字节 ---------------");
    console.log("  用途:", L5.VertexFormat.getUsageString(this.usage));
    console.log("  类型:", L5.VertexFormat.getTypeString(this.type));
};

/**
 *
 * @param inStream {L5.InStream}
 */
L5.VertexFormat.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.numAttributes = inStream.readUint32();
    const MAX_ATTRIBUTES = L5.VertexFormat.MAX_ATTRIBUTES;

    for (var i = 0; i < MAX_ATTRIBUTES; ++i) {
        this.elements[i].streamIndex = inStream.readUint32();
        this.elements[i].offset = inStream.readUint32();
        this.elements[i].type = inStream.readEnum();
        this.elements[i].usage = inStream.readEnum();
        this.elements[i].usageIndex = inStream.readUint32();
    }

    this.stride = inStream.readUint32();
};
/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.VertexFormat}
 */
L5.VertexFormat.factory = function (inStream) {
    var obj = new L5.VertexFormat(0);
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VertexFormat', L5.VertexFormat.factory);

/**
 * 着色器基类
 * 该类是顶点着色器和片元着色器的基类
 * The class data defines the shader but does not contain instances
 * of shader constants and shader textures.  Each instance of Shader
 * may therefore be a singleton,identified by 'shaderName'.
 * The drawing of geometry involves a Shader (the abstraction) and a
 * ShaderParameters (the instance of constants and textures).
 *
 * The constructor arrays must be dynamically allocated.  Shader assumes
 * responsibility for deleting them.  The construction of a Shader is not
 * complete until all programs (for the various profiles) are provided
 * via the SetProgram function.
 *
 * @param programName {string}
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @param profileOwner {boolean}
 *
 * @author lonphy
 * @version 1.0
 * @class
 * @extends {L5.D3Object}
 */
L5.Shader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.D3Object.call(this, programName);

    if (numInputs > 0) {
        this.inputName = new Array(numInputs);
        this.inputType = new Array(numInputs);
        this.inputSemantic = new Array(numInputs);
    }
    else {
        this.inputName = null;
        this.inputType = null;
        this.inputSemantic = null;
    }
    this.numInputs = numInputs;

    this.numOutputs = numOutputs;
    this.outputName = new Array(numOutputs);
    this.outputType = new Array(numOutputs);
    this.outputSemantic = new Array(numOutputs);

    var i, dim;

    this.numConstants = numConstants;
    if (numConstants > 0) {
        this.constantName = new Array(numConstants);
        this.constantType = new Array(numConstants);
        this.constantFuncName = new Array(numConstants);
    } else {
        this.constantName = null;
        this.constantType = null;
        this.constantFuncName = null;
    }

    this.numSamplers = numSamplers;
    this.coordinate = new Array(3);
    this.textureUnit = [];
    if (numSamplers > 0) {
        this.samplerName = new Array(numSamplers);
        this.samplerType = new Array(numSamplers);

        this.filter = new Array(numSamplers);
        this.coordinate[0] = new Array(numSamplers);
        this.coordinate[1] = new Array(numSamplers);
        this.coordinate[2] = new Array(numSamplers);
        this.lodBias = new Float32Array(numSamplers);
        this.anisotropy = new Float32Array(numSamplers);
        this.borderColor = new Float32Array(numSamplers * 4);

        for (i = 0; i < numSamplers; ++i) {
            this.filter[i] = L5.Shader.SF_NEAREST;
            this.coordinate[0][i] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[1][i] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[2][i] = L5.Shader.SC_CLAMP_EDGE;
            this.lodBias[i] = 0;
            this.anisotropy[i] = 1;

            this.borderColor[i * 4] = 0;
            this.borderColor[i * 4 + 1] = 0;
            this.borderColor[i * 4 + 2] = 0;
            this.borderColor[i * 4 + 3] = 0;
        }
        this.textureUnit = new Array(numSamplers);
    } else {
        this.samplerName = null;
        this.samplerType = null;
        this.filter = null;
        for (dim = 0; dim < 3; ++dim) {
            this.coordinate[dim] = null;
        }
        this.lodBias = null;
        this.anisotropy = null;
        this.borderColor = null;
        this.textureUnit = null;
    }

    this.program = '';
};

L5.nameFix(L5.Shader, 'Shader');
L5.extendFix(L5.Shader, L5.D3Object);

// Maximum number of profiles.  The derived classes VertexShader and
// PixelShader each have this number of profiles.  If you add a new
// profile, change this constant and modify the enums in the derived
// classes.
L5.Shader.MAX_PROFILES = 5;

// Maximum value for anisotropic filtering.
L5.Shader.MAX_ANISOTROPY = 16;

// Types for the input and output variables of the shader program.
//------------------------------------------------------------------------
L5.Shader.VT_NONE = 0;

L5.Shader.VT_BOOL = 1;
L5.Shader.VT_BVEC2 = 2;
L5.Shader.VT_BVEC3 = 3;
L5.Shader.VT_BVEC4 = 4;

L5.Shader.VT_FLOAT = 5;

L5.Shader.VT_VEC2 = 6;
L5.Shader.VT_VEC3 = 7;
L5.Shader.VT_VEC4 = 8;

L5.Shader.VT_MAT2 = 9;
L5.Shader.VT_MAT3 = 10;
L5.Shader.VT_MAT4 = 11;

L5.Shader.VT_INT = 12;
L5.Shader.VT_IVEC2 = 13;
L5.Shader.VT_IVEC3 = 14;
L5.Shader.VT_IVEC4 = 15;

//------------------------------------------------------------------------

// Semantics for the input and output variables of the shader program.
L5.Shader.VS_NONE = 0;
L5.Shader.VS_POSITION = 1;        // ATTR0
L5.Shader.VS_BLENDWEIGHT = 2;     // ATTR1
L5.Shader.VS_NORMAL = 3;          // ATTR2
L5.Shader.VS_COLOR0 = 4;          // ATTR3 (and for render targets)
L5.Shader.VS_COLOR1 = 5;          // ATTR4 (and for render targets)
L5.Shader.VS_FOGCOORD = 6;        // ATTR5
L5.Shader.VS_PSIZE = 7;           // ATTR6
L5.Shader.VS_BLENDINDICES = 8;    // ATTR7
L5.Shader.VS_TEXCOORD0 = 9;       // ATTR8
L5.Shader.VS_TEXCOORD1 = 10;       // ATTR9
L5.Shader.VS_TEXCOORD2 = 11;       // ATTR10
L5.Shader.VS_TEXCOORD3 = 12;       // ATTR11
L5.Shader.VS_TEXCOORD4 = 13;       // ATTR12
L5.Shader.VS_TEXCOORD5 = 14;       // ATTR13
L5.Shader.VS_TEXCOORD6 = 15;       // ATTR14
L5.Shader.VS_TEXCOORD7 = 16;       // ATTR15
L5.Shader.VS_FOG = 17;             // same as L5.Shader.VS_FOGCOORD (ATTR5)
L5.Shader.VS_TANGENT = 18;         // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
L5.Shader.VS_BINORMAL = 19;        // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
L5.Shader.VS_COLOR2 = 20;          // support for multiple render targets
L5.Shader.VS_COLOR3 = 21;          // support for multiple render targets
L5.Shader.VS_DEPTH0 = 22;          // support for multiple render targets
L5.Shader.VS_QUANTITY = 23;

// The sampler type for interpreting the texture assigned to the sampler.
L5.Shader.ST_NONE = 0;
L5.Shader.ST_2D = 1;
L5.Shader.ST_3D = 2;
L5.Shader.ST_CUBE = 3;
L5.Shader.ST_2D_ARRAY = 4;

// Texture coordinate modes for the samplers.
L5.Shader.SC_NONE = 0;
L5.Shader.SC_REPEAT = 1;
L5.Shader.SC_MIRRORED_REPEAT = 2;
L5.Shader.SC_CLAMP_EDGE = 3;

// Filtering modes for the samplers.
L5.Shader.SF_NONE = 0;
L5.Shader.SF_NEAREST = 1;
L5.Shader.SF_LINEAR = 2;
L5.Shader.SF_NEAREST_NEAREST = 3;
L5.Shader.SF_NEAREST_LINEAR = 4;
L5.Shader.SF_LINEAR_NEAREST = 5;
L5.Shader.SF_LINEAR_LINEAR = 6;


/**
 * 着色器属性变量声明
 * @param i {number} 属性变量索引
 * @param name {string} 属性变量名称
 * @param type {number} L5.Shader.VT_XXX 属性变量类型
 * @param semantic {number} L5.Shader.VS_XXX 属性变量语义
 */
L5.Shader.prototype.setInput = function (i, name, type, semantic) {
    if (0 <= i && i < this.numInputs) {
        this.inputName[i] = name;
        this.inputType[i] = type;
        this.inputSemantic[i] = semantic;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * 着色器输出变量声明
 * @param i {number}
 * @param name {string} 输出变量名称
 * @param type {number} L5.Shader.VT_XXX 输出变量类型
 * @param semantic {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.setOutput = function (i, name, type, semantic) {
    if (0 <= i && i < this.numOutputs) {
        this.outputName[i] = name;
        this.outputType[i] = type;
        this.outputSemantic[i] = semantic;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string}
 * @param type {number} L5.Shader.VT_XXX uniform类型
 */
L5.Shader.prototype.setConstant = function (i, name, type) {
    if (0 <= i && i < this.numConstants) {
        this.constantName[i] = name;
        this.constantType[i] = type;
        var f = '';
        switch (type) {
            case L5.Shader.VT_MAT4:
                f = 'uniformMatrix4fv';
                break;
            case L5.Shader.VT_BOOL:
            case L5.Shader.VT_INT:
                f = 'uniform1i';
                break;
            case L5.Shader.VT_BVEC2:
            case L5.Shader.VT_IVEC2:
                f = 'uniform2iv';
                break;
            case L5.Shader.VT_BVEC3:
            case L5.Shader.VT_IVEC3:
                f = 'uniform3iv';
                break;
            case L5.Shader.VT_BVEC4:
            case L5.Shader.VT_IVEC4:
                f = 'uniform4iv';
                break;
            case L5.Shader.VT_FLOAT:
                f = 'uniform1f';
                break;
            case L5.Shader.VT_VEC2:
                f = 'uniform2fv';
                break;
            case L5.Shader.VT_VEC3:
                f = 'uniform3fv';
                break;
            case L5.Shader.VT_VEC4:
                f = 'uniform4fv';
                break;
            case L5.Shader.VT_MAT2:
                f = 'uniformMatrix2fv';
                break;
            case L5.Shader.VT_MAT3:
                f = 'uniformMatrix3fv';
                break;
        }
        this.constantFuncName[i] = f;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string} 采样器名称
 * @param type {number} L5.Shader.ST_XXX 采样器类型
 */
L5.Shader.prototype.setSampler = function (i, name, type) {
    if (0 <= i && i < this.numSamplers) {
        this.samplerName[i] = name;
        this.samplerType[i] = type;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param filter {number} L5.Shader.SF_XXX 过滤器类型
 */
L5.Shader.prototype.setFilter = function (i, filter) {
    if (0 <= i && i < this.numSamplers) {
        this.filter[i] = filter;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param dim {number}
 * @param coordinate {number} L5.Shader.SC_XXX
 */
L5.Shader.prototype.setCoordinate = function (i, dim, coordinate) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            this.coordinate[dim][i] = coordinate;
            return;
        }
        L5.assert(false, 'Invalid dimension.');
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param lodBias {number}
 */
L5.Shader.prototype.setLodBias = function (i, lodBias) {
    if (0 <= i && i < this.numSamplers) {
        this.lodBias[i] = lodBias;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param anisotropy {number}
 */
L5.Shader.prototype.setAnisotropy = function (i, anisotropy) {
    if (0 <= i && i < this.numSamplers) {
        this.anisotropy[i] = anisotropy;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 *
 * @param i {number}
 * @param borderColor {Float32Array} 4 length
 */
L5.Shader.prototype.setBorderColor = function (i, borderColor) {
    if (0 <= i && i < this.numSamplers) {
        this.borderColor[i].set(borderColor.subarray(0, 4), 0);
        return;
    }
    L5.assert(false, 'Invalid index.');
};

L5.Shader.prototype.setTextureUnit = function (i, textureUnit) {
    if (0 <= i && i < this.numSamplers) {
        this.textureUnit[i] = textureUnit;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * 着色器源码赋值
 * @param program {string}
 */
L5.Shader.prototype.setProgram = function (program) {
    this.program = program;
};

L5.Shader.prototype.setTextureUnits = function (textureUnits) {
    this.textureUnit = textureUnits.slice();
};

L5.Shader.prototype.getInputName = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getInputType = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
/**
 * 获取属性语义
 * @param i {number}
 * @returns {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.getInputSemantic = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputSemantic[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getOutputName = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getOutputType = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
L5.Shader.prototype.getOutputSemantic = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputSemantic[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getConstantFuncName = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantFuncName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};

L5.Shader.prototype.getConstantName = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getConstantType = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantType[i];
    }

    L5.assert(false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getSamplerName = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getSamplerType = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.ST_NONE;
};
L5.Shader.prototype.getFilter = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.filter[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.SF_NONE;
};
L5.Shader.prototype.getCoordinate = function (i, dim) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            return this.coordinate[dim][i];
        }
        L5.assert(false, 'Invalid dimension.');
        return L5.Shader.SC_NONE;
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.SC_NONE;
};
L5.Shader.prototype.getLodBias = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.lodBias[i];
    }

    L5.assert(false, 'Invalid index.');
    return 0;
};
L5.Shader.prototype.getAnisotropy = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.anisotropy[i];
    }

    L5.assert(false, 'Invalid index.');
    return 1;
};
L5.Shader.prototype.getBorderColor = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.borderColor[i];
    }

    L5.assert(false, 'Invalid index.');
    return new Float32Array(4);
};

L5.Shader.prototype.getTextureUnit = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.textureUnit[i];
    }
    L5.assert(false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getProgram = function () {
    return this.program;
};

L5.Shader.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.inputName = inStream.readStringArray();
    this.numInputs = this.inputName.length;
    this.inputType = inStream.readSizedEnumArray(this.numInputs);
    this.inputSemantic = inStream.readSizedEnumArray(this.numInputs);

    this.outputName = inStream.readStringArray();
    this.numOutputs = this.outputName.length;
    this.outputType = inStream.readSizedEnumArray(this.numOutputs);
    this.outputSemantic = inStream.readSizedEnumArray(this.numOutputs);

    this.constantName = inStream.readStringArray();
    this.numConstants = this.constantName.length;
    this.numRegistersUsed = inStream.readSizedInt32Array(this.numConstants);

    this.samplerName = inStream.readStringArray();
    this.numSamplers = this.samplerName.length;
    this.samplerType = inStream.readSizedEnumArray(this.numSamplers);
    this.filter = inStream.readSizedEnumArray(this.numSamplers);
    this.coordinate[0] = inStream.readSizedEnumArray(this.numSamplers);
    this.coordinate[1] = inStream.readSizedEnumArray(this.numSamplers);
    this.coordinate[2] = inStream.readSizedEnumArray(this.numSamplers);
    this.lodBias = inStream.readSizedInt32Array(this.numSamplers);
    this.anisotropy = inStream.readSizedInt32Array(this.numSamplers);
    this.borderColor = inStream.readSizedFFloatArray(this.numSamplers);
    var maxProfiles = inStream.readUint32();

    this.profileOwner = inStream.readBool();
};

/**
 * AlphaState - 透明状态
 *
 * @class
 *
 * @extends {L5.D3Object}
 * @author lonphy
 * @version 1.0
 */
L5.AlphaState = function () {
    L5.D3Object.call(this);
    this.blendEnabled = false;
    this.srcBlend = L5.AlphaState.BM_SRC_ALPHA;
    this.dstBlend = L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA;
    this.constantColor = new Float32Array ([ 0, 0, 0, 0 ]);
};

L5.nameFix (L5.AlphaState, 'AlphaState');
L5.extendFix(L5.AlphaState, L5.D3Object);


/////////////////////////// 混合模式  ////////////////
L5.AlphaState.BM_ZERO                     = 0;
L5.AlphaState.BM_ONE                      = 1;
L5.AlphaState.BM_SRC_COLOR                = 2;
L5.AlphaState.BM_ONE_MINUS_SRC_COLOR      = 3;
L5.AlphaState.BM_DST_COLOR                = 4;
L5.AlphaState.BM_ONE_MINUS_DST_COLOR      = 5;
L5.AlphaState.BM_SRC_ALPHA                = 6;
L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA      = 7;
L5.AlphaState.BM_DST_ALPHA                = 8;
L5.AlphaState.BM_ONE_MINUS_DST_ALPHA      = 9;
L5.AlphaState.BM_SRC_ALPHA_SATURATE       = 10;
L5.AlphaState.BM_CONSTANT_COLOR           = 11;
L5.AlphaState.BM_ONE_MINUS_CONSTANT_COLOR = 12;
L5.AlphaState.BM_CONSTANT_ALPHA           = 13;
L5.AlphaState.BM_ONE_MINUS_CONSTANT_ALPHA = 14;


L5.AlphaState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.blendEnabled = inStream.readBool();
    this.srcBlend = inStream.readEnum();
    // todo: remove unused code.
    if (this.srcBlend > 1) {
        this.srcBlend += 2;
    }

    this.dstBlend = inStream.readEnum();
    // todo: remove unused code.
    if (this.dstBlend >= 8) {
        this.dstBlend += 3;
    }
    else if(this.dstBlend >= 4) {
        this.dstBlend += 2;
    }

    // todo : remove unused code.
    var compareEnabled = inStream.readBool();
    var compare = inStream.readEnum();
    var reference = inStream.readFloat32();

    this.constantColor = new Float32Array(inStream.readFloat32Range(4));
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.AlphaState}
 */
L5.AlphaState.factory = function (inStream) {
    var obj = new L5.AlphaState();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.AlphaState', L5.AlphaState.factory);

/**
 * 剔除表面 状态
 *
 * @extends {L5.D3Object}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.CullState = function () {
    L5.D3Object.call(this);
    this.enabled = true;
    this.CCWOrder = true;
};

L5.nameFix(L5.CullState, 'CullState');
L5.extendFix(L5.CullState, L5.D3Object);

L5.CullState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.enabled = inStream.readBool();
    this.CCWOrder = inStream.readBool();
};

L5.CullState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.enabled);
    outStream.writeBool(this.CCWOrder);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.CullState}
 */
L5.CullState.factory = function (inStream) {
    var obj = new L5.CullState();
    obj.enabled = false;
    obj.CCWOrder = false;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.CullState', L5.CullState.factory);

/**
 * DepthState - 深度测试状态
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.DepthState = function () {
    L5.D3Object.call(this);
    this.enabled = true;
    this.writable = true;
    this.compare = L5.DepthState.COMPARE_MODE_LESS;
};

L5.nameFix (L5.DepthState, 'DepthState');
L5.extendFix(L5.DepthState, L5.D3Object);

// 比较模式
L5.DepthState.COMPARE_MODE_NEVER    = 0;
L5.DepthState.COMPARE_MODE_LESS     = 1;
L5.DepthState.COMPARE_MODE_EQUAL    = 2;
L5.DepthState.COMPARE_MODE_LEQUAL   = 3;
L5.DepthState.COMPARE_MODE_GREATER  = 4;
L5.DepthState.COMPARE_MODE_NOTEQUAL = 5;
L5.DepthState.COMPARE_MODE_GEQUAL   = 6;
L5.DepthState.COMPARE_MODE_ALWAYS   = 7;

L5.DepthState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.enabled = inStream.readBool();
    this.writable = inStream.readBool();
    this.compare = inStream.readEnum();
};

L5.DepthState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.enabled);
    outStream.writeBool(this.writable);
    outStream.writeEnum(this.compare);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.DepthState}
 */
L5.DepthState.factory = function (inStream) {
    var obj = new L5.DepthState();
    obj.enabled = false;
    obj.writable = false;
    obj.compare = L5.DepthState.COMPARE_MODE_NEVER;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.DepthState', L5.DepthState.factory);

/**
 * FragShader 片元着色器
 *
 * @param programName {string} 程序名称
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @param profileOwner {boolean}
 * @class
 * @extends {L5.Shader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.FragShader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.Shader.call(this, programName, numInputs, numOutputs, numConstants, numSamplers);
};

L5.nameFix(L5.FragShader, 'FragShader');
L5.extendFix(L5.FragShader, L5.Shader);

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.FragShader}
 */
L5.FragShader.factory = function (inStream) {
    var obj = new L5.FragShader();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.PixelShader', L5.FragShader.factory);



/**
 * OffsetState - 偏移状态
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */

L5.OffsetState = function(){
    L5.D3Object.call(this);
    // Set whether offset should be enabled for the various polygon drawing
    // modes (fill, line, point).
    this.fillEnabled = false;

    // The offset is Scale*dZ + Bias*r where dZ is the change in depth
    // relative to the screen space area of the poly, and r is the smallest
    // resolvable depth difference.  Negative values move polygons closer to
    // the eye.
    this.scale = 0;
    this.bias = 0;
};

L5.nameFix (L5.OffsetState, 'OffsetState');
L5.extendFix(L5.OffsetState, L5.D3Object);

L5.OffsetState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.fillEnabled = inStream.readBool();
    var lineEnabled = inStream.readBool();
    var pointEnabled = inStream.readBool();

    this.scale = inStream.readFloat32();
    this.bias = inStream.readFloat32();
};

L5.OffsetState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.fillEnabled);
    outStream.writeFloat32(this.scale);
    outStream.writeFloat32(this.bias);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.OffsetState}
 */
L5.OffsetState.factory = function (inStream) {
    var obj = new L5.OffsetState();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.OffsetState', L5.OffsetState.factory);

/**
 * Program GPU程序
 *
 * @param programName {string} 程序名称
 * @param vertextShader {L5.VertexShader}
 * @param fragShader {L5.FragShader}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Program = function (
    programName, vertexShader, fragShader
) {
    L5.D3Object.call(this, programName);
    this.vertexShader = vertexShader;
    this.fragShader = fragShader;
    this.inputMap = new Map();
};

L5.nameFix (L5.Program, 'Program');
L5.extendFix (L5.Program, L5.D3Object);



/**
 * 着色器基类
 * 该类是顶点着色器和片元着色器的基类
 * The class data defines the shader but does not contain instances
 * of shader constants and shader textures.  Each instance of Shader
 * may therefore be a singleton,identified by 'shaderName'.
 * The drawing of geometry involves a Shader (the abstraction) and a
 * ShaderParameters (the instance of constants and textures).
 *
 * The constructor arrays must be dynamically allocated.  Shader assumes
 * responsibility for deleting them.  The construction of a Shader is not
 * complete until all programs (for the various profiles) are provided
 * via the SetProgram function.
 *
 * @param programName {string}
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @param profileOwner {boolean}
 *
 * @author lonphy
 * @version 1.0
 * @class
 * @extends {L5.D3Object}
 */
L5.Shader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.D3Object.call(this, programName);

    if (numInputs > 0) {
        this.inputName = new Array(numInputs);
        this.inputType = new Array(numInputs);
        this.inputSemantic = new Array(numInputs);
    }
    else {
        this.inputName = null;
        this.inputType = null;
        this.inputSemantic = null;
    }
    this.numInputs = numInputs;

    this.numOutputs = numOutputs;
    this.outputName = new Array(numOutputs);
    this.outputType = new Array(numOutputs);
    this.outputSemantic = new Array(numOutputs);

    var i, dim;

    this.numConstants = numConstants;
    if (numConstants > 0) {
        this.constantName = new Array(numConstants);
        this.constantType = new Array(numConstants);
        this.constantFuncName = new Array(numConstants);
    } else {
        this.constantName = null;
        this.constantType = null;
        this.constantFuncName = null;
    }

    this.numSamplers = numSamplers;
    this.coordinate = new Array(3);
    this.textureUnit = [];
    if (numSamplers > 0) {
        this.samplerName = new Array(numSamplers);
        this.samplerType = new Array(numSamplers);

        this.filter = new Array(numSamplers);
        this.coordinate[0] = new Array(numSamplers);
        this.coordinate[1] = new Array(numSamplers);
        this.coordinate[2] = new Array(numSamplers);
        this.lodBias = new Float32Array(numSamplers);
        this.anisotropy = new Float32Array(numSamplers);
        this.borderColor = new Float32Array(numSamplers * 4);

        for (i = 0; i < numSamplers; ++i) {
            this.filter[i] = L5.Shader.SF_NEAREST;
            this.coordinate[0][i] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[1][i] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[2][i] = L5.Shader.SC_CLAMP_EDGE;
            this.lodBias[i] = 0;
            this.anisotropy[i] = 1;

            this.borderColor[i * 4] = 0;
            this.borderColor[i * 4 + 1] = 0;
            this.borderColor[i * 4 + 2] = 0;
            this.borderColor[i * 4 + 3] = 0;
        }
        this.textureUnit = new Array(numSamplers);
    } else {
        this.samplerName = null;
        this.samplerType = null;
        this.filter = null;
        for (dim = 0; dim < 3; ++dim) {
            this.coordinate[dim] = null;
        }
        this.lodBias = null;
        this.anisotropy = null;
        this.borderColor = null;
        this.textureUnit = null;
    }

    this.program = '';
};

L5.nameFix(L5.Shader, 'Shader');
L5.extendFix(L5.Shader, L5.D3Object);

// Maximum number of profiles.  The derived classes VertexShader and
// PixelShader each have this number of profiles.  If you add a new
// profile, change this constant and modify the enums in the derived
// classes.
L5.Shader.MAX_PROFILES = 5;

// Maximum value for anisotropic filtering.
L5.Shader.MAX_ANISOTROPY = 16;

// Types for the input and output variables of the shader program.
//------------------------------------------------------------------------
L5.Shader.VT_NONE = 0;

L5.Shader.VT_BOOL = 1;
L5.Shader.VT_BVEC2 = 2;
L5.Shader.VT_BVEC3 = 3;
L5.Shader.VT_BVEC4 = 4;

L5.Shader.VT_FLOAT = 5;

L5.Shader.VT_VEC2 = 6;
L5.Shader.VT_VEC3 = 7;
L5.Shader.VT_VEC4 = 8;

L5.Shader.VT_MAT2 = 9;
L5.Shader.VT_MAT3 = 10;
L5.Shader.VT_MAT4 = 11;

L5.Shader.VT_INT = 12;
L5.Shader.VT_IVEC2 = 13;
L5.Shader.VT_IVEC3 = 14;
L5.Shader.VT_IVEC4 = 15;

//------------------------------------------------------------------------

// Semantics for the input and output variables of the shader program.
L5.Shader.VS_NONE = 0;
L5.Shader.VS_POSITION = 1;        // ATTR0
L5.Shader.VS_BLENDWEIGHT = 2;     // ATTR1
L5.Shader.VS_NORMAL = 3;          // ATTR2
L5.Shader.VS_COLOR0 = 4;          // ATTR3 (and for render targets)
L5.Shader.VS_COLOR1 = 5;          // ATTR4 (and for render targets)
L5.Shader.VS_FOGCOORD = 6;        // ATTR5
L5.Shader.VS_PSIZE = 7;           // ATTR6
L5.Shader.VS_BLENDINDICES = 8;    // ATTR7
L5.Shader.VS_TEXCOORD0 = 9;       // ATTR8
L5.Shader.VS_TEXCOORD1 = 10;       // ATTR9
L5.Shader.VS_TEXCOORD2 = 11;       // ATTR10
L5.Shader.VS_TEXCOORD3 = 12;       // ATTR11
L5.Shader.VS_TEXCOORD4 = 13;       // ATTR12
L5.Shader.VS_TEXCOORD5 = 14;       // ATTR13
L5.Shader.VS_TEXCOORD6 = 15;       // ATTR14
L5.Shader.VS_TEXCOORD7 = 16;       // ATTR15
L5.Shader.VS_FOG = 17;             // same as L5.Shader.VS_FOGCOORD (ATTR5)
L5.Shader.VS_TANGENT = 18;         // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
L5.Shader.VS_BINORMAL = 19;        // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
L5.Shader.VS_COLOR2 = 20;          // support for multiple render targets
L5.Shader.VS_COLOR3 = 21;          // support for multiple render targets
L5.Shader.VS_DEPTH0 = 22;          // support for multiple render targets
L5.Shader.VS_QUANTITY = 23;

// The sampler type for interpreting the texture assigned to the sampler.
L5.Shader.ST_NONE = 0;
L5.Shader.ST_2D = 1;
L5.Shader.ST_3D = 2;
L5.Shader.ST_CUBE = 3;
L5.Shader.ST_2D_ARRAY = 4;

// Texture coordinate modes for the samplers.
L5.Shader.SC_NONE = 0;
L5.Shader.SC_REPEAT = 1;
L5.Shader.SC_MIRRORED_REPEAT = 2;
L5.Shader.SC_CLAMP_EDGE = 3;

// Filtering modes for the samplers.
L5.Shader.SF_NONE = 0;
L5.Shader.SF_NEAREST = 1;
L5.Shader.SF_LINEAR = 2;
L5.Shader.SF_NEAREST_NEAREST = 3;
L5.Shader.SF_NEAREST_LINEAR = 4;
L5.Shader.SF_LINEAR_NEAREST = 5;
L5.Shader.SF_LINEAR_LINEAR = 6;


/**
 * 着色器属性变量声明
 * @param i {number} 属性变量索引
 * @param name {string} 属性变量名称
 * @param type {number} L5.Shader.VT_XXX 属性变量类型
 * @param semantic {number} L5.Shader.VS_XXX 属性变量语义
 */
L5.Shader.prototype.setInput = function (i, name, type, semantic) {
    if (0 <= i && i < this.numInputs) {
        this.inputName[i] = name;
        this.inputType[i] = type;
        this.inputSemantic[i] = semantic;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * 着色器输出变量声明
 * @param i {number}
 * @param name {string} 输出变量名称
 * @param type {number} L5.Shader.VT_XXX 输出变量类型
 * @param semantic {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.setOutput = function (i, name, type, semantic) {
    if (0 <= i && i < this.numOutputs) {
        this.outputName[i] = name;
        this.outputType[i] = type;
        this.outputSemantic[i] = semantic;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string}
 * @param type {number} L5.Shader.VT_XXX uniform类型
 */
L5.Shader.prototype.setConstant = function (i, name, type) {
    if (0 <= i && i < this.numConstants) {
        this.constantName[i] = name;
        this.constantType[i] = type;
        var f = '';
        switch (type) {
            case L5.Shader.VT_MAT4:
                f = 'uniformMatrix4fv';
                break;
            case L5.Shader.VT_BOOL:
            case L5.Shader.VT_INT:
                f = 'uniform1i';
                break;
            case L5.Shader.VT_BVEC2:
            case L5.Shader.VT_IVEC2:
                f = 'uniform2iv';
                break;
            case L5.Shader.VT_BVEC3:
            case L5.Shader.VT_IVEC3:
                f = 'uniform3iv';
                break;
            case L5.Shader.VT_BVEC4:
            case L5.Shader.VT_IVEC4:
                f = 'uniform4iv';
                break;
            case L5.Shader.VT_FLOAT:
                f = 'uniform1f';
                break;
            case L5.Shader.VT_VEC2:
                f = 'uniform2fv';
                break;
            case L5.Shader.VT_VEC3:
                f = 'uniform3fv';
                break;
            case L5.Shader.VT_VEC4:
                f = 'uniform4fv';
                break;
            case L5.Shader.VT_MAT2:
                f = 'uniformMatrix2fv';
                break;
            case L5.Shader.VT_MAT3:
                f = 'uniformMatrix3fv';
                break;
        }
        this.constantFuncName[i] = f;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string} 采样器名称
 * @param type {number} L5.Shader.ST_XXX 采样器类型
 */
L5.Shader.prototype.setSampler = function (i, name, type) {
    if (0 <= i && i < this.numSamplers) {
        this.samplerName[i] = name;
        this.samplerType[i] = type;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param filter {number} L5.Shader.SF_XXX 过滤器类型
 */
L5.Shader.prototype.setFilter = function (i, filter) {
    if (0 <= i && i < this.numSamplers) {
        this.filter[i] = filter;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param dim {number}
 * @param coordinate {number} L5.Shader.SC_XXX
 */
L5.Shader.prototype.setCoordinate = function (i, dim, coordinate) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            this.coordinate[dim][i] = coordinate;
            return;
        }
        L5.assert(false, 'Invalid dimension.');
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param lodBias {number}
 */
L5.Shader.prototype.setLodBias = function (i, lodBias) {
    if (0 <= i && i < this.numSamplers) {
        this.lodBias[i] = lodBias;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param anisotropy {number}
 */
L5.Shader.prototype.setAnisotropy = function (i, anisotropy) {
    if (0 <= i && i < this.numSamplers) {
        this.anisotropy[i] = anisotropy;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 *
 * @param i {number}
 * @param borderColor {Float32Array} 4 length
 */
L5.Shader.prototype.setBorderColor = function (i, borderColor) {
    if (0 <= i && i < this.numSamplers) {
        this.borderColor[i].set(borderColor.subarray(0, 4), 0);
        return;
    }
    L5.assert(false, 'Invalid index.');
};

L5.Shader.prototype.setTextureUnit = function (i, textureUnit) {
    if (0 <= i && i < this.numSamplers) {
        this.textureUnit[i] = textureUnit;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * 着色器源码赋值
 * @param program {string}
 */
L5.Shader.prototype.setProgram = function (program) {
    this.program = program;
};

L5.Shader.prototype.setTextureUnits = function (textureUnits) {
    this.textureUnit = textureUnits.slice();
};

L5.Shader.prototype.getInputName = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getInputType = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
/**
 * 获取属性语义
 * @param i {number}
 * @returns {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.getInputSemantic = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputSemantic[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getOutputName = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getOutputType = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
L5.Shader.prototype.getOutputSemantic = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputSemantic[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getConstantFuncName = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantFuncName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};

L5.Shader.prototype.getConstantName = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getConstantType = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantType[i];
    }

    L5.assert(false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getSamplerName = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getSamplerType = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.ST_NONE;
};
L5.Shader.prototype.getFilter = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.filter[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.SF_NONE;
};
L5.Shader.prototype.getCoordinate = function (i, dim) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            return this.coordinate[dim][i];
        }
        L5.assert(false, 'Invalid dimension.');
        return L5.Shader.SC_NONE;
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.SC_NONE;
};
L5.Shader.prototype.getLodBias = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.lodBias[i];
    }

    L5.assert(false, 'Invalid index.');
    return 0;
};
L5.Shader.prototype.getAnisotropy = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.anisotropy[i];
    }

    L5.assert(false, 'Invalid index.');
    return 1;
};
L5.Shader.prototype.getBorderColor = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.borderColor[i];
    }

    L5.assert(false, 'Invalid index.');
    return new Float32Array(4);
};

L5.Shader.prototype.getTextureUnit = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.textureUnit[i];
    }
    L5.assert(false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getProgram = function () {
    return this.program;
};

L5.Shader.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.inputName = inStream.readStringArray();
    this.numInputs = this.inputName.length;
    this.inputType = inStream.readSizedEnumArray(this.numInputs);
    this.inputSemantic = inStream.readSizedEnumArray(this.numInputs);

    this.outputName = inStream.readStringArray();
    this.numOutputs = this.outputName.length;
    this.outputType = inStream.readSizedEnumArray(this.numOutputs);
    this.outputSemantic = inStream.readSizedEnumArray(this.numOutputs);

    this.constantName = inStream.readStringArray();
    this.numConstants = this.constantName.length;
    this.numRegistersUsed = inStream.readSizedInt32Array(this.numConstants);

    this.samplerName = inStream.readStringArray();
    this.numSamplers = this.samplerName.length;
    this.samplerType = inStream.readSizedEnumArray(this.numSamplers);
    this.filter = inStream.readSizedEnumArray(this.numSamplers);
    this.coordinate[0] = inStream.readSizedEnumArray(this.numSamplers);
    this.coordinate[1] = inStream.readSizedEnumArray(this.numSamplers);
    this.coordinate[2] = inStream.readSizedEnumArray(this.numSamplers);
    this.lodBias = inStream.readSizedInt32Array(this.numSamplers);
    this.anisotropy = inStream.readSizedInt32Array(this.numSamplers);
    this.borderColor = inStream.readSizedFFloatArray(this.numSamplers);
    var maxProfiles = inStream.readUint32();

    this.profileOwner = inStream.readBool();
};

/**
 * ShaderParameters 着色器参数
 *
 * @param shader {L5.Shader}
 * @param [__privateCreate] {boolean}
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.ShaderParameters = function (shader, __privateCreate) {
    L5.D3Object.call(this);

    if (!__privateCreate) {
        L5.assert(shader !== null, 'Shader must be specified.');

        /**
         * @type {L5.Shader}
         */
        this.shader = shader;

        var nc = shader.numConstants;
        this.numConstants = nc;

        if (nc > 0) {
            /**
             * @type {Array<L5.ShaderFloat>}
             */
            this.constants = new Array(nc);
        } else {
            this.constants = null;
        }

        var ns = shader.numSamplers;
        this.numTextures = ns;
        if (ns > 0) {
            this.textures = new Array(ns);
        } else {
            this.textures = null;
        }
    }
    else {
        this.shader = null;
        this.numConstants = 0;
        this.constants = null;
        this.numTextures = 0;
        this.textures = null;
    }
};

L5.nameFix(L5.ShaderParameters, 'ShaderParameters');
L5.extendFix(L5.ShaderParameters, L5.D3Object);


// These functions set the constants/textures.  If successful, the return
// value is nonnegative and is the index into the appropriate array.  This
// index may passed to the Set* functions that have the paremeter
// 'handle'.  The mechanism allows you to set directly by index and avoid
// the name comparisons that occur with the Set* functions that have the
// parameter 'const std::string& name'.
/**
 * @param name {string}
 * @param sfloat {Array}
 * @return {number}
 */
L5.ShaderParameters.prototype.setConstantByName = function (name, sfloat) {
    var i, m = this.numConstants, shader = this.shader;

    for (i = 0; i < m; ++i) {
        if (shader.getConstantName(i) === name) {
            this.constants[i] = sfloat;
            return i;
        }
    }

    L5.assert(false, 'Cannot find constant.');
    return -1;
};
/**
 * @param handle {number}
 * @param sfloat {Array}
 * @return {number}
 */
L5.ShaderParameters.prototype.setConstant = function (handle, sfloat) {
    if (0 <= handle && handle < this.numConstants) {
        this.constants[handle] = sfloat;
        return handle;
    }
    L5.assert(false, 'Invalid constant handle.');
    return -1;
};
/**
 * @param name {string}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.ShaderParameters.prototype.setTextureByName = function (name, texture) {
    var i, m = this.numTextures, shader = this.shader;

    for (i = 0; i < m; ++i) {
        if (shader.getSamplerName(i) === name) {
            this.textures[i] = texture;
            return i;
        }
    }

    L5.assert(false, 'Cannot find texture.');
    return -1;
};
/**
 * @param handle {number}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.ShaderParameters.prototype.setTexture = function (handle, texture) {
    if (0 <= handle && handle < this.numTextures) {
        this.textures[handle] = texture;
        return handle;
    }
    L5.assert(false, 'Invalid texture handle.');
    return -1;
};
/**
 * @param name {string}
 * @returns {ArrayBuffer}
 */
L5.ShaderParameters.prototype.getConstantByName = function (name) {
    var i, m = this.numConstants, shader = this.shader;
    for (i = 0; i < m; ++i) {
        if (shader.getConstantName(i) === name) {
            return this.constants[i];
        }
    }

    L5.assert(false, 'Cannot find constant.');
    return null;
};
/**
 * @param name {string}
 * @returns {L5.Texture}
 */
L5.ShaderParameters.prototype.getTextureByName = function (name) {
    var i, m = this.numTextures, shader = this.shader;
    for (i = 0; i < m; ++i) {
        if (shader.getSamplerName(i) === name) {
            return this.textures[i];
        }
    }

    L5.assert(false, 'Cannot find texture.');
    return null;
};

/**
 * @param index {number}
 * @returns {ArrayBuffer}
 */
L5.ShaderParameters.prototype.getConstant = function (index) {
    if (0 <= index && index < this.numConstants) {
        return this.constants[index];
    }

    L5.assert(false, 'Invalid constant handle.');
    return null;
};

/**
 * @param index {number}
 * @returns {L5.Texture}
 */
L5.ShaderParameters.prototype.getTexture = function (index) {
    if (0 <= index && index < this.numTextures) {
        return this.textures[index];
    }

    L5.assert(false, 'Invalid texture handle.');
    return null;
};
/**
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ShaderParameters.prototype.updateConstants = function (visual, camera) {
    var constants = this.constants,
        i, m = this.numConstants;
    for (i = 0; i < m; ++i) {
        var constant = constants[i];
        if (constant.allowUpdater) {
            constant.update(visual, camera);
        }
    }
};

L5.ShaderParameters.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    console.debug();
    this.shader = inStream.readPointer();
    this.constants = inStream.readPointerArray();
    this.numConstants = this.constants.length;
    this.textures = inStream.readPointerArray();
    this.numTextures = this.textures.length;
};

L5.ShaderParameters.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.shader = inStream.resolveLink(this.shader);
    this.constants = inStream.resolveArrayLink(this.numConstants, this.constants);
    this.textures = inStream.resolveArrayLink(this.numTextures, this.textures);
};

L5.ShaderParameters.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writePointer(this.shader);
    outStream.writePointerArray(this.numConstants, this.constants);
    outStream.writePointerArray(this.numTextures, this.textures);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.ShaderParameters}
 */
L5.ShaderParameters.factory = function (inStream) {
    var obj = new L5.ShaderParameters(null, true);
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.ShaderParameters', L5.ShaderParameters.factory);

/**
 * StencilState - 模板状态
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.StencilState = function () {
    L5.D3Object.call(this);
    this.mask = 0xffffffff;       // default: unsigned int max
    this.writeMask = 0xffffffff;  // default: unsigned int max
    this.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;
    this.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
    this.onZPass = L5.StencilState.OPERAETION_TYPE_KEEP;

    this.enabled = false;
    this.compare = L5.StencilState.COMPARE_MODE_NEVER;
    this.reference = 0;     // [0,1]
};

L5.nameFix(L5.StencilState, 'StencilState');
L5.extendFix(L5.StencilState, L5.D3Object);

// 操作类型
L5.StencilState.OPERAETION_TYPE_KEEP = 0;
L5.StencilState.OPERAETION_TYPE_ZERO = 1;
L5.StencilState.OPERAETION_TYPE_REPLACE = 2;
L5.StencilState.OPERAETION_TYPE_INCREMENT = 3;
L5.StencilState.OPERAETION_TYPE_DECREMENT = 4;
L5.StencilState.OPERAETION_TYPE_INVERT = 5;


// 比较模式
L5.StencilState.COMPARE_MODE_NEVER = 0;
L5.StencilState.COMPARE_MODE_LESS = 1;
L5.StencilState.COMPARE_MODE_EQUAL = 2;
L5.StencilState.COMPARE_MODE_LEQUAL = 3;
L5.StencilState.COMPARE_MODE_GREATER = 4;
L5.StencilState.COMPARE_MODE_NOTEQUAL = 5;
L5.StencilState.COMPARE_MODE_GEQUAL = 6;
L5.StencilState.COMPARE_MODE_ALWAYS = 7;

L5.StencilState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.enabled = inStream.readBool();
    this.compare = inStream.readEnum();
    this.reference = inStream.readUint32();
    this.mask = inStream.readUint32();
    this.writeMask = inStream.readUint32();
    this.onFail = inStream.readEnum();
    this.onZFail = inStream.readEnum();
    this.onZPass = inStream.readEnum();
};

L5.StencilState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.enabled);
    outStream.writeEnum(this.compare);
    outStream.writeUint32(this.reference);
    outStream.writeUint32(this.mask);
    outStream.writeUint32(this.writeMask);
    outStream.writeEnum(this.onFail);
    outStream.writeEnum(this.onZFail);
    outStream.writeEnum(this.onZPass);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.StencilState}
 */
L5.StencilState.factory = function (inStream) {
    var obj = new L5.StencilState();
    obj.mask = 0;
    obj.writeMask = 0;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.StencilState', L5.StencilState.factory);

/**
 * VertexShader 顶点着色器
 *
 * @param programName {string} 程序名称
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @class
 * @extends {L5.Shader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VertexShader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.Shader.call(this, programName, numInputs, numOutputs, numConstants, numSamplers);
};

L5.nameFix(L5.VertexShader, 'VertexShader');
L5.extendFix(L5.VertexShader, L5.Shader);

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.VertexShader}
 */
L5.VertexShader.factory = function (inStream) {
    var obj = new L5.VertexShader();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VertexShader', L5.VertexShader.factory);

/**
 * VisualEffect
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */

L5.VisualEffect = function () {
    this.techniques = [];
};

L5.nameFix(L5.VisualEffect, 'VisualEffect');
L5.extendFix(L5.VisualEffect, L5.D3Object);

/**
 * @param technique {L5.VisualTechnique}
 */
L5.VisualEffect.prototype.insertTechnique = function (technique) {
    if (technique) {
        this.techniques.push(technique);
    }
    else {
        L5.assert(false, 'Input to insertTechnique must be nonnull.');
    }
};
/**
 * @returns {number}
 */
L5.VisualEffect.prototype.getNumTechniques = function () {
    return this.techniques.length;
};

/**
 * @param techniqueIndex {number}
 * @returns {number}
 */
L5.VisualEffect.prototype.getNumPasses = function (techniqueIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getNumPass();
    }
    L5.assert(false, "Invalid index in getNumPasses.\n");
    return 0;
};
/**
 * @param techniqueIndex {number}
 * @returns {L5.VisualTechnique}
 */
L5.VisualEffect.prototype.getTechnique = function (techniqueIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex];
    }
    L5.assert(false, "Invalid index in getTechnique.\n");
    return null;
};

/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.VisualPass}
 */
L5.VisualEffect.prototype.getPass = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getPass(passIndex);
    }
    L5.assert(false, "Invalid index in GetPass.\n");
    return null;
};

/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.VertexShader}
 */
L5.VisualEffect.prototype.getVertexShader = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getVertexShader(passIndex);
    }

    L5.assert(false, 'Invalid index in getVertexShader.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.FragShader}
 */
L5.VisualEffect.prototype.getFragShader = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getFragShader(passIndex);
    }

    L5.assert(false, 'Invalid index in getFragShader.');
    return null;
};

/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.AlphaState}
 */
L5.VisualEffect.prototype.getAlphaState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getAlphaState(passIndex);
    }

    L5.assert(false, 'Invalid index in getAlphaState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.CullState}
 */
L5.VisualEffect.prototype.getCullState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getCullState(passIndex);
    }

    L5.assert(false, 'Invalid index in getCullState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.DepthState}
 */
L5.VisualEffect.prototype.getDepthState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getDepthState(passIndex);
    }

    L5.assert(false, 'Invalid index in getDepthState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.OffsetState}
 */
L5.VisualEffect.prototype.getOffsetState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getOffsetState(passIndex);
    }

    L5.assert(false, 'Invalid index in getOffsetState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.StencilState}
 */
L5.VisualEffect.prototype.getStencilState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getStencilState(passIndex);
    }

    L5.assert(false, 'Invalid index in getStencilState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.WireState}
 */
L5.VisualEffect.prototype.getWireState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getWireState(passIndex);
    }

    L5.assert(false, 'Invalid index in getWireState.');
    return null;
};

L5.VisualEffect.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    var numTechniques = inStream.readUint32();
    this.techniques.length = numTechniques;
    this.techniques = inStream.readSizedPointerArray(numTechniques);
};

L5.VisualEffect.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.techniques.forEach(function (t, i) {
        this.techniques[i] = inStream.resolveLink(t);
    }, this);
};

/**
 * VisualEffectInstance
 *
 * @param effect {L5.VisualEffect}
 * @param techniqueIndex {number}
 * @param [_privateCreate] {boolean}
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualEffectInstance = function (effect, techniqueIndex, _privateCreate) {
    if (!_privateCreate) {
        L5.assert(effect !== null, 'effect must be specified.');
        L5.assert(
            0 <= techniqueIndex && techniqueIndex < effect.getNumTechniques(),
            'Invalid technique index.');
        /**
         * @type {L5.VisualEffect}
         */
        this.effect = effect;
        this.techniqueIndex = techniqueIndex;

        var technique = effect.getTechnique(techniqueIndex);
        var numPasses = technique.getNumPasses();

        this.numPasses = numPasses;
        this.vertexParameters = new Array(numPasses);
        this.fragParameters = new Array(numPasses);

        for (var p = 0; p < numPasses; ++p) {
            var pass = technique.getPass(p);
            this.vertexParameters[p] = new L5.ShaderParameters(pass.getVertexShader());
            this.fragParameters[p] = new L5.ShaderParameters(pass.getFragShader());
        }
    }
    else {
        this.effect = null;
        this.techniqueIndex = 0;
        this.numPasses = 0;
        this.vertexParameters = null;
        this.fragParameters = null;
    }
    L5.D3Object.call(this);
};

L5.nameFix(L5.VisualEffectInstance, 'VisualEffectInstance');
L5.extendFix(L5.VisualEffectInstance, L5.D3Object);

L5.VisualEffectInstance.prototype.getNumPasses = function () {
    return this.effect.getTechnique(this.techniqueIndex).getNumPasses();
};
/**
 * @param pass {number}
 * @returns {L5.VisualPass}
 */
L5.VisualEffectInstance.prototype.getPass = function (pass) {
    if (0 <= pass && pass < this.numPasses) {
        return this.effect.getTechnique(this.techniqueIndex).getPass(pass);
    }

    L5.assert(false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @returns {L5.ShaderParameters}
 */
L5.VisualEffectInstance.prototype.getVertexParameters = function (pass) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass];
    }
    L5.assert(false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @returns {L5.ShaderParameters}
 */
L5.VisualEffectInstance.prototype.getFragParameters = function (pass) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass];
    }
    L5.assert(false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param sfloat {L5.ShaderFloat}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setVertexConstantByName = function (pass, name, sfloat) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].setConstantByName(name, sfloat);
    }
    L5.assert(false, 'Invalid pass index.');
    return -1;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param sfloat {L5.ShaderFloat}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setFragConstantByName = function (pass, name, sfloat) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].setConstantByName(name, sfloat);
    }

    L5.assert(false, 'Invalid pass index.\n');
    return -1;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setVertexTextureByName = function (pass, name, texture) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].setTextureByName(name, texture);
    }
    L5.assert(false, 'Invalid pass index.');
    return -1;
};
/**
 * @param pass {number}
 * @param name {string}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.VisualEffectInstance.prototype.setFragTextureByName = function (pass, name, texture) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].setTextureByName(name, texture);
    }
    L5.assert(false, 'Invalid pass index.');
    return -1;
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param sfloat {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.setVertexConstant = function (pass, handle, sfloat) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].setConstant(handle, sfloat);
    }

    L5.assert(false, 'Invalid pass index.');
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param sfloat {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.setFragConstant = function (pass, handle, sfloat) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].setConstant(handle, sfloat);
    }

    L5.assert(false, 'Invalid pass index.');
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param texture {L5.Texture}
 */
L5.VisualEffectInstance.prototype.setVertexTexture = function (pass, handle, texture) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].setTexture(handle, texture);
    }

    L5.assert(false, 'Invalid pass index.');
};
/**
 *
 * @param pass {number}
 * @param handle {number}
 * @param texture {L5.Texture}
 */
L5.VisualEffectInstance.prototype.setFragTexture = function (pass, handle, texture) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].setTexture(handle, texture);
    }

    L5.assert(false, 'Invalid pass index.');
};

/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getVertexConstantByName = function (pass, name) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].getConstantByName(name);
    }

    L5.assert(false, 'Invalid pass index.');
    return null;
};
/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getFragConstantByName = function (pass, name) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].getConstantByName(name);
    }

    L5.assert(false, 'Invalid pass index.\n');
    return 0;
};
/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.Texture}
 */
L5.VisualEffectInstance.prototype.getVertexTextureByName = function (pass, name) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].getTextureByName(name);
    }

    L5.assert(false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param name {string}
 * @returns {L5.Texture}
 */
L5.VisualEffectInstance.prototype.getFragTextureByName = function (pass, name) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].getTextureByName(name);
    }

    L5.assert(false, 'Invalid pass index.');
    return 0;
};

/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getVertexConstant = function (pass, handle) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].getConstant(handle);
    }

    L5.assert(false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.ShaderFloat}
 */
L5.VisualEffectInstance.prototype.getFragConstant = function (pass, handle) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].getConstant(handle);
    }
    L5.assert(false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.Texture}
 */

L5.VisualEffectInstance.prototype.getVertexTexture = function (pass, handle) {
    if (0 <= pass && pass < this.numPasses) {
        return this.vertexParameters[pass].getTexture(handle);
    }
    L5.assert(false, 'Invalid pass index.');
    return 0;
};
/**
 * @param pass {number}
 * @param handle {number}
 * @returns {L5.Texture}
 */
L5.VisualEffectInstance.prototype.getFragTexture = function (pass, handle) {
    if (0 <= pass && pass < this.numPasses) {
        return this.fragParameters[pass].getTexture(handle);
    }

    L5.assert(false, 'Invalid pass index.');
    return 0;
};

//============================== 文件流支持 ==============================
L5.VisualEffectInstance.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.techniqueIndex = inStream.readUint32();
    this.effect = inStream.readPointer();
    this.vertexParameters = inStream.readPointerArray();
    this.numPasses = this.vertexParameters.length;
    this.fragParameters = inStream.readSizedPointerArray(this.numPasses);
};
L5.VisualEffectInstance.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.effect = inStream.resolveLink(this.effect);
    this.vertexParameters = inStream.resolveArrayLink(this.numPasses, this.vertexParameters);
    this.fragParameters = inStream.resolveArrayLink(this.numPasses, this.fragParameters);
};

L5.VisualEffectInstance.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.VisualEffectInstance}
 */
L5.VisualEffectInstance.factory = function (inStream) {
    var obj = new L5.VisualEffectInstance(0,0,true);
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VisualEffectInstance', L5.VisualEffectInstance.factory);

/**
 * VisualPass
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualPass = function () {
    L5.D3Object.call(this);
    /**
     * @type {L5.Program}
     */
    this.program = null;
    /**
     * @type {L5.AlphaState}
     */
    this.alphaState = null;
    /**
     * @type {L5.CullState}
     */
    this.cullState = null;
    /**
     * @type {L5.DepthState}
     */
    this.depthState = null;
    /**
     * @type {L5.OffsetState}
     */
    this.offsetState = null;
    /**
     * @type {L5.StencilState}
     */
    this.stencilState = null;
    /**
     * @type {L5.WireState}
     */
    this.wireState = null;
};
L5.nameFix(L5.VisualPass, 'VisualPass');
L5.extendFix(L5.VisualPass, L5.D3Object);

/**
 * @returns {L5.FragShader}
 */
L5.VisualPass.prototype.getFragShader = function () {
    return this.program.fragShader;
};

/**
 * @returns {L5.VertexShader}
 */
L5.VisualPass.prototype.getVertexShader = function () {
    return this.program.vertexShader;
};


L5.VisualPass.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    var vertexShader = inStream.readPointer();
    var fragShader = inStream.readPointer();
    this.program = new L5.Program('L5.Program', vertexShader, fragShader);
    this.alphaState = inStream.readPointer();
    this.cullState = inStream.readPointer();
    this.depthState = inStream.readPointer();
    this.offsetState = inStream.readPointer();
    this.stencilState = inStream.readPointer();
    this.wireState = inStream.readPointer();
};

L5.VisualPass.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);

    this.program.vertexShader = inStream.resolveLink(this.program.vertexShader);
    this.program.fragShader = inStream.resolveLink(this.program.fragShader);

    this.alphaState = inStream.resolveLink(this.alphaState);
    this.cullState = inStream.resolveLink(this.cullState);
    this.depthState = inStream.resolveLink(this.depthState);
    this.offsetState = inStream.resolveLink(this.offsetState);
    this.stencilState = inStream.resolveLink(this.stencilState);
    this.wireState = inStream.resolveLink(this.wireState);
};

L5.VisualPass.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.VisualPass}
 */
L5.VisualPass.factory = function (inStream) {
    var obj = new L5.VisualPass();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VisualPass', L5.VisualPass.factory);

/**
 * VisualTechnique
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualTechnique = function () {
    L5.D3Object.call(this);
    this.passes = [];
};

L5.nameFix(L5.VisualTechnique, 'VisualTechnique');
L5.extendFix(L5.VisualTechnique, L5.D3Object);

/**
 *
 * @param pass {L5.VisualPass}
 */
L5.VisualTechnique.prototype.insertPass = function (pass) {
    if (pass) {
        this.passes.push(pass);
    }
    else {
        L5.assert(false, 'Input to insertPass must be nonnull.');
    }
};
/**
 *
 * @returns {number}
 */
L5.VisualTechnique.prototype.getNumPasses = function () {
    return this.passes.length;
};
/**
 *
 * @returns {number}
 */
L5.VisualTechnique.prototype.getPass = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex];
    }
    L5.assert(false, "Invalid index in GetPass.\n");
    return null;
};

/**
 * @param passIndex {number}
 * @returns {L5.VertexShader}
 */
L5.VisualTechnique.prototype.getVertexShader = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].getVertexShader();
    }

    L5.assert(false, 'Invalid index in getVertexShader.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.FragShader}
 */
L5.VisualTechnique.prototype.getFragShader = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].getFragShader();
    }

    L5.assert(false, 'Invalid index in getFragShader.');
    return null;
};

/**
 * @param passIndex {number}
 * @returns {L5.AlphaState}
 */
L5.VisualTechnique.prototype.getAlphaState = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].alphaState;
    }

    L5.assert(false, 'Invalid index in getAlphaState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.CullState}
 */
L5.VisualTechnique.prototype.getCullState = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].cullState;
    }

    L5.assert(false, 'Invalid index in getCullState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.DepthState}
 */
L5.VisualTechnique.prototype.getDepthState = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].depthState;
    }

    L5.assert(false, 'Invalid index in getDepthState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.OffsetState}
 */
L5.VisualTechnique.prototype.getOffsetState = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].offsetState;
    }

    L5.assert(false, 'Invalid index in getOffsetState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.StencilState}
 */
L5.VisualTechnique.prototype.getStencilState = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].stencilState;
    }

    L5.assert(false, 'Invalid index in getStencilState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.WireState}
 */
L5.VisualTechnique.prototype.getWireState = function (passIndex) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[passIndex].wireState;
    }

    L5.assert(false, 'Invalid index in getWireState.');
    return null;
};


L5.VisualTechnique.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    var numPasses = inStream.readUint32();
    this.passes.length = numPasses;
    this.passes = inStream.readSizedPointerArray(numPasses);
};

L5.VisualTechnique.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.passes.forEach(function(p,i){
        this.passes[i] = inStream.resolveLink(p);
    }, this);
};

L5.VisualTechnique.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.VisualTechnique}
 */
L5.VisualTechnique.factory = function (inStream) {
    var obj = new L5.VisualTechnique();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VisualTechnique', L5.VisualTechnique.factory);

/**
 * WireState - 网格状态
 *
 * @deprecated
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.WireState = function(){
    this.enabled = false;
};
L5.nameFix(L5.WireState, 'WireState');
L5.extendFix(L5.WireState, L5.D3Object);

L5.WireState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.enabled = inStream.readBool();
};

L5.StencilState.prototype.save = function (outStream) {
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.WireState}
 */
L5.WireState.factory = function (inStream) {
    var obj = new L5.WireState();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.WireState', L5.WireState.factory);

/**
 * ControlledObject - 控制基类
 * @version 1.0
 * @author lonphy
 */

L5.ControlledObject = function () {
    L5.D3Object.call(this);

    this.numControllers = 0;
    this.controllers = [];
};

L5.nameFix(L5.ControlledObject, 'ControlledObject');
L5.extendFix(L5.ControlledObject, L5.D3Object);

/**
 * @param i {number}
 * @returns {L5.Controller}
 */
L5.ControlledObject.prototype.getController = function (i) {
    if (0 <= i && i < this.numControllers) {
        return this.controllers[i];
    }

    L5.assert(false, 'Invalid index in getController.');
    return null;
};
/**
 * @param controller {L5.Controller}
 */
L5.ControlledObject.prototype.attachController = function (controller) {
    // By design, controllers may not be controlled.  This avoids arbitrarily
    // complex graphs of controllers.  TODO:  Consider allowing this?
    if (!(controller instanceof L5.Controller)) {
        L5.assert(false, 'Controllers may not be controlled');
        return;
    }

    // The controller must exist.
    if (!controller) {
        L5.assert(false, 'Cannot attach a null controller');
        return;
    }

    // Test whether the controller is already in the array.
    var i, l = this.numControllers;
    for (i = 0; i < l; ++i) {
        if (controller === this.controllers[i]) {
            return;
        }
    }

    // Bind the controller to the object.
    controller.object = this;

    this.controllers[(this.numControllers)++] = controller;
};
/**
 * @param controller {L5.Controller}
 */
L5.ControlledObject.prototype.detachController = function (controller) {
    var l = this.numControllersl;
    for (var i = 0; i < l; ++i) {
        if (controller == this.controllers[i]) {
            // Unbind the controller from the object.
            controller.object = null;

            // Remove the controller from the array, keeping the array
            // compact.
            for (var j = i + 1; j < l; ++j, ++i) {
                this.controllers[i] = this.controllers[j];
            }
            this.controllers[--(this.numControllers)] = null;
            return;
        }
    }
};
L5.ControlledObject.prototype.detachAllControllers = function () {
    var i, l = this.numControllers;
    for (i = 0; i < l; ++i) {
        // Unbind the controller from the object.
        this.controllers[i].object = null;
        this.controllers[i] = null;
    }
    this.numControllers = 0;
};

L5.ControlledObject.prototype.updateControllers = function (applicationTime) {
    var someoneUpdated = false, l = this.numControllers;
    for (var i = 0; i < l; ++i) {
        if (this.controllers[i].update(applicationTime)) {
            someoneUpdated = true;
        }
    }
    return someoneUpdated;
};

/**
 *
 * @param inStream {L5.InStream}
 */
L5.ControlledObject.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    var r = inStream.readPointerArray();
    if (r !== false) {
        this.numControllers = r.length;
        this.controllers = r.slice();
    }
    this.capacity = this.numControllers;
};

L5.ControlledObject.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.controllers = inStream.resolveArrayLink(this.numControllers, this.controllers);
};

/**
 * Controller - 控制基类
 *
 * @version 1.0
 * @author lonphy
 *
 * @extends {L5.D3Object}
 * @class
 */

L5.Controller = function () {
    L5.D3Object.call (this);

    this.repeat = L5.Controller.RT_CLAMP;  // default = RT_CLAMP
    this.minTime = 0;                      // default = 0
    this.maxTime = 0;                      // default = 0
    this.phase = 0;                        // default = 0
    this.frequency = 1;                    // default = 1
    this.active = true;                    // default = true
    this.object = null;                    // ControlledObject.
    this.applicationTime = -L5.Math.MAX_REAL;              // 应用程序时间 毫秒.
};

L5.nameFix (L5.Controller, 'Controller');
L5.extendFix (L5.Controller, L5.D3Object);

// 时间管理。一个控制器可以用自己的时标, 指定如何映射到应用程序时间。
L5.Controller.RT_CLAMP = 0;
L5.Controller.RT_WRAP  = 1;
L5.Controller.RT_CYCLE = 2;

/**
 * 从应用程序时间转换为控制器时间
 * @param applicationTime {number}
 * @returns {number}
 */
L5.Controller.prototype.getControlTime = function (applicationTime) {
    var controlTime = this.frequency * applicationTime + this.phase;

    if (this.repeat == L5.Controller.RT_CLAMP) {
        // Clamp the time to the [min,max] interval.
        if (controlTime < this.minTime) {
            return this.minTime;
        }
        if (controlTime > this.maxTime) {
            return this.maxTime;
        }
        return controlTime;
    }

    var timeRange = this.maxTime - this.minTime;
    if (timeRange > 0) {
        var multiples    = (controlTime - this.minTime) / timeRange;
        var integerTime  = L5.Math.floor (multiples);
        var fractionTime = multiples - integerTime;
        if (this.repeat == L5.Controller.RT_WRAP) {
            return this.minTime + fractionTime * timeRange;
        }

        // Repeat == WM5_RT_CYCLE
        if (integerTime & 1) {
            // Go backward in time.
            return this.maxTime - fractionTime * timeRange;
        }
        else {
            // Go forward in time.
            return this.minTime + fractionTime * timeRange;
        }
    }

    return this.minTime;
};


L5.Controller.prototype.update = function (applicationTime) {
    if (this.active) {
        this.applicationTime = applicationTime;
        return true;
    }
    return false;
};

L5.Controller.prototype.load = function(inStream){
    L5.D3Object.prototype.load.call(this, inStream);
    this.repeat = inStream.readEnum();
    this.minTime = inStream.readFloat64();
    this.maxTime = inStream.readFloat64();
    this.phase = inStream.readFloat64();
    this.frequency = inStream.readFloat64();
    this.active = inStream.readBool();
    this.object = inStream.readPointer();
    this.applicationTime = -L5.Math.MAX_REAL;
};

L5.Controller.prototype.link = function(inStream){
    L5.D3Object.prototype.link.call(this, inStream);
    this.object = inStream.resolveLink(this.object);
};

/**
 * TransformControlledObject - 控制基类
 * @version 1.0
 * @author lonphy
 */
/**
 *
 * @param localTransform {L5.Transform}
 * @constructor
 */
L5.TransformController = function (localTransform) {
    L5.Controller.call(this);
    this.localTransform = localTransform;
};

L5.TransformController.name = "TransformController";
L5.extendFix(L5.TransformController, L5.Controller);

L5.TransformController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    this.object.localTransform = localTransform;
    return true;
};

/**
 *
 * @param inStream {L5.InStream}
 */
L5.TransformController.prototype.load = function(inStream){
    L5.Controller.prototype.load.call(this, inStream);
    this.localTransform = inStream.readAggregate();
};

/**
 * Spatial - 场景空间
 *
 * @extends {L5.ControlledObject}
 *
 * @version 1.0
 * @author lonphy
 */

L5.Spatial = function () {
    L5.ControlledObject.call(this);
    /**
     * @type {L5.Transform}
     */
    this.localTransform = new L5.Transform();
    /**
     * @type {L5.Transform}
     */
    this.worldTransform = new L5.Transform();
    // 在一些情况下直接更新worldTransform而跳过Spatial.update()
    // 在这种情况下必须将this.worldTransformIsCurrent设置为true
    this.worldTransformIsCurrent = false;

    /**
     * @type {L5.Bound}
     */
    this.worldBound = new L5.Bound();
    // 在一些情况下直接更新worldBound而跳过Spatial.update()
    // 在这种情况下必须将this.worldBoundIsCurrent设置为true
    this.worldBoundIsCurrent = false;

    this.culling = L5.Spatial.CULLING_DYNAMIC;
    /**
     * @type {L5.Spatial}
     */
    this.parent = null;
};

L5.nameFix(L5.Spatial, 'Spatial');
L5.extendFix(L5.Spatial, L5.ControlledObject);

/////////////////// const CULLING_MODE /////////////////////////////////

// 通过比较世界包围盒裁剪平面确定可见状态
L5.Spatial.CULLING_DYNAMIC = 0;
// 强制裁剪对象, 如果节点被裁剪，那么它的整个子树也被裁剪
L5.Spatial.CULLING_ALWAYS = 1;
// 不裁剪对象， 如果一个节点是不裁剪对象，那么它的整个子树也不被裁剪。
L5.Spatial.CULLING_NEVER = 2;

/**
 * 在向下遍历场景树或向上遍历世界包围盒时，计算世界变换，
 *
 * 更新几何体的状态和控制器
 *
 * @param applicationTime {number}
 * @param initiator {boolean}
 */
L5.Spatial.prototype.update = function (applicationTime, initiator) {
    applicationTime = applicationTime || -L5.Math.MAX_REAL;
    this.updateWorldData(applicationTime);
    this.updateWorldBound();

    if (initiator === undefined || initiator === true) {
        this.propagateBoundToRoot();
    }
};

/**
 *
 * @param applicationTime {number}
 */
L5.Spatial.prototype.updateWorldData = function (applicationTime) {
    // 更新当前空间的所有控制器
    this.updateControllers(applicationTime);

    // 更新世界变换
    if (!this.worldTransformIsCurrent) {
        if (this.parent) {
            this.worldTransform = this.parent.worldTransform.mul(this.localTransform);
        }
        else {
            this.worldTransform = this.localTransform;
        }
    }
};

L5.Spatial.prototype.propagateBoundToRoot = function () {
    if (this.parent) {
        this.parent.updateWorldBound();
        this.parent.propagateBoundToRoot();
    }
};

/**
 * 裁剪支持
 * @param culler {L5.Culler}
 * @param noCull {boolean}
 */
L5.Spatial.prototype.onGetVisibleSet = function (culler, noCull) {
    if (this.culling === L5.Spatial.CULLING_ALWAYS) {
        return;
    }

    if (this.culling == L5.Spatial.CULLING_NEVER) {
        noCull = true;
    }

    var savePlaneState = culler.planeState;
    if (noCull || culler.isVisible(this.worldBound)) {
        this.getVisibleSet(culler, noCull);
    }
    culler.planeState = savePlaneState;
};

// 子类实现， 用于更新世界包围盒
L5.Spatial.prototype.updateWorldBound = function () {
};

L5.Spatial.prototype.load = function (inStream) {
    L5.ControlledObject.prototype.load.call(this, inStream);
    this.localTransform = inStream.readAggregate();
    this.worldTransform = inStream.readAggregate();
    this.worldTransformIsCurrent = inStream.readBool();
    this.worldBound = inStream.readBound();
    this.worldBoundIsCurrent = inStream.readBool();
    this.culling = inStream.readEnum();
};

/**
 * Scene Node - 场景节点
 *
 * @class
 * @extends {L5.Spatial}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Node = function () {
    L5.Spatial.call(this);
    this.childs = [];
};
L5.nameFix(L5.Node, 'Node');
L5.extendFix(L5.Node, L5.Spatial);

/**
 * 获取子节点数量
 * @returns {number}
 */
L5.Node.prototype.getChildsNumber = function () {
    return this.childs.length;
};

/**
 * 加载子节点.
 * 如果执行成功，则返回子节点存储的索引i, 0 <= i < getNumChildren()
 * 数组中第一个空槽将被用来存储子节点. 如果所有的槽都不为空，则添加到数组末尾[js底层可能需要重新分配空间]
 *
 * 以下情况会失败,并返回-1
 * child === null or child.parent !== null
 *
 * @param child {L5.Spatial}
 * @returns {number}
 */
L5.Node.prototype.attachChild = function (child) {
    if (child === null) {
        L5.assert(false, 'You cannot attach null children to a node.');
        return -1;
    }
    if (child.parent !== null) {
        L5.assert(false, 'The child already has a parent.');
        return -1;
    }

    child.parent = this;

    var nodes = this.childs.slice(),
        max = nodes.length;
    for (var idx = 0; idx < max; ++idx) {
        if (nodes[idx] === null) {
            this.childs[idx] = child;
            return idx;
        }
    }
    this.childs[max] = child;
    return max;
};

/**
 * 从当前节点卸载子节点
 * 如果child不为null且在数组中， 则返回存储的索引， 否则返回-1
 * @param child {L5.Spatial}
 * @returns {number}
 */
L5.Node.prototype.detachChild = function (child) {
    if (child !== null) {
        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx] === child) {
                this.childs[idx] = null;
                child.parent = null;
                return idx;
            }
        }
    }
    return -1;
};

/**
 * 从当前节点卸载子节点
 * 如果 0 <= index < getNumChildren(), 则返回存储在index位置的子节点，否则返回null
 *
 * @param index {number}
 * @returns {L5.Spatial|null}
 */
L5.Node.prototype.detachChildAt = function (index) {
    var child = null;
    if (index >= 0 && index < this.childs.length) {
        child = this.childs[index];
        if (child !== null) {
            child.parent = null;
            this.childs[index] = null;
        }
    }
    return child;
};

/**
 * 在index位置放入child,并返回被替换的元素
 * @param index {number}
 * @param child {L5.Spatial}
 * @returns {L5.Spatial|null}
 */
L5.Node.prototype.setChild = function (index, child) {
    if (child && child.parent !== null) return null;

    if (index >= 0 && index < this.childs.length) {
        var prev = this.childs[index];
        if (prev !== null) {
            prev.parent = null;
        }
        if (child) {
            child.parent = this;
        }
        this.childs[index] = child;
        return prev;
    }

    if (child) {
        child.parent = this;
    }
    this.childs.push(child);
    return null;
};

/**
 * 通过索引获取子节点
 * @param index {number}
 * @returns {L5.Spatial|null}
 */
L5.Node.prototype.getChild = function (index) {
    var child = null;
    if (index >= 0 && index < this.childs.length) {
        child = this.childs[index];
    }
    return child;
};

/**
 * @param applicationTime {number}
 */
L5.Node.prototype.updateWorldData = function (applicationTime) {
    L5.Spatial.prototype.updateWorldData.call(this, applicationTime);
    var nodes = this.childs.slice(),
        max = nodes.length;
    for (var idx = 0; idx < max; ++idx) {
        if (nodes[idx]) {
            nodes[idx].update(applicationTime, false);
        }
    }
};

L5.Node.prototype.updateWorldBound = function () {
    if (!this.worldBoundIsCurrent) {
        // Start with an invalid bound.
        this.worldBound.center = L5.Point.ORIGIN;
        this.worldBound.radius = 0;
        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx]) {
                this.worldBound.growToContain(nodes[idx].worldBound);
            }
        }
    }
};
/**
 *
 * @param culler {L5.Culler}
 * @param noCull {boolean}
 */
L5.Node.prototype.getVisibleSet = function (culler, noCull) {
    var nodes = this.childs.slice(),
        max = nodes.length;
    for (var idx = 0; idx < max; ++idx) {
        if (nodes[idx]) {
            nodes[idx].onGetVisibleSet(culler, noCull);
        }
    }
};

/**
 * @param inStream {L5.InStream}
 */
L5.Node.prototype.load = function (inStream) {

    L5.Spatial.prototype.load.call(this, inStream);

    var numChildren = inStream.readUint32();
    if (numChildren > 0) {
        this.childs = inStream.readSizedPointerArray(numChildren);
    }
};

/**
 * @param inStream {L5.InStream}
 */
L5.Node.prototype.link = function (inStream) {

    L5.Spatial.prototype.link.call(this, inStream);

    this.childs.forEach(function (c, i) {
        this.childs[i] = inStream.resolveLink(c);
        this.setChild(i, this.childs[i]);
    }, this);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.Node}
 */
L5.Node.factory = function (inStream) {
    var obj = new L5.Node();
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.Node', L5.Node.factory);

/**
 * Visual
 *
 * @param type {number} primitiveType
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexBuffer {L5.IndexBuffer}
 * @class
 *
 * @extends {L5.Spatial}
 *
 * @version 1.0
 * @author lonphy
 */
L5.Visual = function (type, format, vertexBuffer, indexBuffer) {
    L5.Spatial.call(this);

    this.primitiveType = type || L5.Visual.PT_NONE;

    /**
     * @type {L5.VertexFormat}
     */
    this.format = format;

    /**
     * @type {L5.VertexBuffer}
     */
    this.vertexBuffer = vertexBuffer;

    /**
     * @type {L5.IndexBuffer}
     */
    this.indexBuffer = indexBuffer;
    /**
     * @type {L5.Bound}
     */
    this.modelBound = new L5.Bound();

    /**
     * Shader effect used to draw the Visual.
     * @type {L5.VisualEffectInstance}
     * @private
     */
    this.effect = null;

    if (format && vertexBuffer && indexBuffer) {
        this.updateModelSpace(L5.Spatial.GU_MODEL_BOUND_ONLY);
    }
};

L5.nameFix(L5.Visual, 'Visual');
L5.extendFix(L5.Visual, L5.Spatial);

L5.Visual.prototype.updateModelSpace = function (type) {
    this.updateModelBound();
};

L5.Visual.prototype.updateWorldBound = function () {
    this.modelBound.transformBy(this.worldTransform, this.worldBound);
};
L5.Visual.prototype.updateModelBound = function () {
    var numVertices = this.vertexBuffer.numElements;
    const format = this.format;
    var stride = format.stride;

    var posIndex = format.getIndex(L5.VertexFormat.AU_POSITION);
    if (posIndex == -1) {
        L5.assert(false, 'Update requires vertex positions');
        return;
    }

    var posType = format.getAttributeType(posIndex);
    if (posType != L5.VertexFormat.AT_FLOAT3 &&
        posType != L5.VertexFormat.AT_FLOAT4
    ) {
        L5.assert(false, 'Positions must be 3-tuples or 4-tuples');
        return;
    }

    var data = this.vertexBuffer.getData();
    var posOffset = format.getOffset(posIndex);
    this.modelBound.computeFromData(numVertices, stride, data.slice(posOffset));
};

/**
 * Support for hierarchical culling.
 * @param culler {L5.Culler}
 * @param noCull {boolean}
 */
L5.Visual.prototype.getVisibleSet = function (culler, noCull) {
    culler.insert(this);
};

/////////////////// 绘制类型 //////////////////////////////
L5.Visual.PT_NONE = 0;  // 默认
L5.Visual.PT_POLYPOINT = 1;   // 点
L5.Visual.PT_POLYSEGMENTS_DISJOINT = 2;
L5.Visual.PT_POLYSEGMENTS_CONTIGUOUS = 3;
L5.Visual.PT_TRIANGLES = 4;  // abstract
L5.Visual.PT_TRIMESH = 5;
L5.Visual.PT_TRISTRIP = 6;
L5.Visual.PT_TRIFAN = 7;
L5.Visual.PT_MAX_QUANTITY = 8;

// Geometric updates.  If the positions in the vertex buffer have been
// modified, you might want to update the surface frames (normals,
// tangents, and bitangents) for indexed-triangle primitives.  It is
// assumed that the positions have been updated and the vertex buffer is
// unlocked.  The argument of UpdateModelSpace specifies the update
// algorithm:
//
//   GU_MODEL_BOUND_ONLY:
//      Update only the model-space bound of the new positions.
//
// For the other options, the model-space bound is always recomputed,
// regardless of type of primitive.  For the surface frames to be updated,
// the Visual must represent an indexed-triangle primitive and must have
// the relevant channels (normal, tangents, bitangents).  If the primitive
// is not indexed triangles, the update call does nothing to the frames.
// An update occurs only for those channels present in the vertex buffer.
// For example, if the vertex buffer has no normals, GU_NORMALS will
// have no effect on the vertex buffer.  As another example, if you
// specify GU_USE_GEOMETRY and the vertex buffer has normals and tangents
// but not bitangents, only normals and tangents are updated (i.e. the
// vertex buffer is not regenerated to have bitangents).
//
//   GU_NORMALS:
//      Update the normals.
//
//   GU_USE_GEOMETRY:
//      Use the mesh topology to determine the surface frames.  The
//      algorithm uses a least-squares method, which is expensive.
//
//   GU_USE_TCOORD_CHANNEL + nonnegative_integer:
//      The standard way to generate surface frames is to use a texture
//      coordinate unit from the vertex buffer.
//
// To reduce video memory usage by the vertex buffers, if your vertex
// shaders use normals, tangents, and bitangents, consider passing in
// normals and tangents, and then have the shader compute the bitangent as
//    bitangent = Cross(normal, tangent)
L5.Visual.GU_MODEL_BOUND_ONLY = -3;
L5.Visual.GU_NORMALS = -2;
L5.Visual.GU_USE_GEOMETRY = -1;
L5.Visual.GU_USE_TCOORD_CHANNEL = 0;

/**
 * @param inStream {L5.InStream}
 */
L5.Visual.prototype.load = function (inStream) {
    L5.Spatial.prototype.load.call(this, inStream);
    this.type = inStream.readEnum();
    this.modelBound = inStream.readBound();
    this.format = inStream.readPointer();
    this.vertexBuffer = inStream.readPointer();
    this.indexBuffer = inStream.readPointer();
    this.effect = inStream.readPointer();
};

L5.Visual.prototype.link = function (inStream) {
    L5.Spatial.prototype.link.call(this, inStream);
    this.format = inStream.resolveLink(this.format);
    this.vertexBuffer = inStream.resolveLink(this.vertexBuffer);
    this.indexBuffer = inStream.resolveLink(this.indexBuffer);
    this.effect = inStream.resolveLink(this.effect);
};

/**
 * Triangles
 *
 * @param type {number}
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexBuffer {L5.IndexBuffer}
 * @class
 * @extends {L5.Visual}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Triangles = function (type, format, vertexBuffer, indexBuffer) {
    L5.Visual.call(this, type, format, vertexBuffer, indexBuffer);
};

L5.nameFix(L5.Triangles, 'Triangles');
L5.extendFix(L5.Triangles, L5.Visual);

L5.Triangles.prototype.getNumTriangles = function () {
    throw new Error('Method:' + this.constructor.name + '.getNumTriangles not defined.');
};
L5.Triangles.prototype.getTriangle = function (index, output) {
    throw new Error('Method:' + this.constructor.name + '.getTriangle not defined.');
};

L5.Triangles.prototype.getNumVertices = function () {
    return this.vertexBuffer.numElements;
};
/**
 * 获取物体坐标系的三角形顶点数组
 * @param i {number}
 * @param modelTriangle {Array<L5.Point>}
 */
L5.Triangles.prototype.getModelTriangle = function (i, modelTriangle) {
    var v = new Array(3);
    if (this.getTriangle(i, v)) {
        var vba = new L5.VertexBufferAccessor(this.format, this.vertexBuffer);
        var p = vba.getPosition(v[0]);
        modelTriangle[0] = new L5.Point(p[0], p[1], p[2]);

        p = vba.getPosition(v[1]);
        modelTriangle[1] = new L5.Point(p[0], p[1], p[2]);

        p = vba.getPosition(v[2]);
        modelTriangle[2] = new L5.Point(p[0], p[1], p[2]);
        return true;
    }
    return false;
};

/**
 * 获取世界坐标系的三角形顶点数组
 * @param i {number}
 * @param worldTriangle {L5.Point}
 */
L5.Triangles.prototype.getWorldTriangle = function (i, worldTriangle) {
    var pos = new Array(3);
    if (this.getModelTriangle(i, pos)) {
        worldTriangle[0] = this.worldTransform.mulPoint(pos[0]);
        worldTriangle[1] = this.worldTransform.mulPoint(pos[1]);
        worldTriangle[2] = this.worldTransform.mulPoint(pos[2]);
        return true;
    }
    return false;
};

/**
 *
 * @param v {number}
 * @returns {L5.Point}
 */
L5.Triangles.prototype.getPosition = function (v) {
    var index = this.format.getIndex(L5.VertexFormat.AU_POSITION);
    if (index >= 0) {
        var offset = this.format.getOffset(index);
        var stride = this.format.stride;
        var start = offset + v * stride;
        return new L5.Point(
            new Float32Array(this.vertexBuffer.getData(), start, 3)
        );
    }

    L5.assert(false, 'GetPosition failed.');
    return new L5.Point(0, 0, 0);
};

L5.Triangles.prototype.updateModelSpace = function (type) {
    this.updateModelBound();
    if (type === L5.Visual.GU_MODEL_BOUND_ONLY) {
        return;
    }

    var vba = L5.VertexBufferAccessor.fromVisual(this);
    if (vba.hasNormal()) {
        this.updateModelNormals(vba);
    }

    if (type !== L5.Visual.GU_NORMALS) {
        if (vba.hasTangent() || vba.hasBinormal()) {
            if (type === L5.Visual.GU_USE_GEOMETRY) {
                this.updateModelTangentsUseGeometry(vba);
            }
            else {
                this.updateModelTangentsUseTCoords(vba);
            }
        }
    }

    L5.Renderer.updateAll(this.vertexBuffer);
};
/**
 * 更新物体模型空间法线
 * @param vba {L5.VertexBufferAccessor}
 */
L5.Triangles.prototype.updateModelNormals = function (vba) {
    var i, t, pos0, pos1, pos2, tv0, tv1, tNormal,
        v = new Array(3);
    const numTriangles = this.getNumTriangles();
    for (i = 0; i < numTriangles; ++i) {
        // 获取三角形3个顶点对应的索引.
        if (!this.getTriangle(i, v)) {
            continue;
        }

        // 获取顶点坐标.
        pos0 = new L5.Point(vba.getPosition(v[0]));
        pos1 = new L5.Point(vba.getPosition(v[1]));
        pos2 = new L5.Point(vba.getPosition(v[2]));

        // 计算三角形法线.
        tv0 = pos1.subP(pos0);
        tv1 = pos2.subP(pos0);
        tNormal = tv0.cross(tv1);
        tNormal.normalize();

        // 更新对应3个顶点的法线
        t = vba.getNormal(v[0]);
        t[0] = tNormal.x;
        t[1] = tNormal.y;
        t[2] = tNormal.z;

        t = vba.getNormal(v[1]);
        t[0] = tNormal.x;
        t[1] = tNormal.y;
        t[2] = tNormal.z;

        t = vba.getNormal(v[2]);
        t[0] = tNormal.x;
        t[1] = tNormal.y;
        t[2] = tNormal.z;
    }
};

/**
 * 更新物体模型空间切线
 * @param vba {L5.VertexBufferAccessor}
 */
L5.Triangles.prototype.updateModelTangentsUseGeometry = function (vba) {
    // Compute the matrix of normal derivatives.
    const numVertices = vba.getNumVertices();
    var dNormal = new Array(numVertices);
    var wwTrn = new Array(numVertices);
    var dwTrn = new Array(numVertices);
    var i, j, row, col;

    for (i = 0; i < numTriangles; ++i) {
        wwTrn[i] = new L5.Matrix().zero();
        dwTrn[i] = new L5.Matrix().zero();
        dNormal[i] = new L5.Matrix().zero();

        // 获取三角形的3个顶点索引.
        var v = new Array(3);
        if (!this.getTriangle(i, v)) {
            continue;
        }

        for (j = 0; j < 3; j++) {
            // 获取顶点坐标和法线.
            var v0 = v[j];
            var v1 = v[(j + 1) % 3];
            var v2 = v[(j + 2) % 3];
            var pos0 = new L5.Point(vba.getPosition(v0));
            var pos1 = new L5.Point(vba.getPosition(v1));
            var pos2 = new L5.Point(vba.getPosition(v2));
            var nor0 = new L5.Vector(vba.getNormal(v0));
            var nor1 = new L5.Vector(vba.getNormal(v1));
            var nor2 = new L5.Vector(vba.getNormal(v2));

            // 计算从pos0到pos1的边,使其射向顶点切面，然后计算相邻法线的差
            var edge = pos1.subP(pos0);
            var proj = edge.sub(nor0.scalar(edge.dot(nor0)));
            var diff = nor1.sub(nor0);
            for (row = 0; row < 3; ++row) {
                for (col = 0; col < 3; ++col) {
                    wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
                    dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
                }
            }

            // 计算从pos0到pos2的边,使其射向顶点切面，然后计算相邻法线的差
            edge = pos2.subP(pos0);
            proj = edge.sub(nor0.scalar(edge.dot(nor0)));
            diff = nor2.sub(nor0);
            for (row = 0; row < 3; ++row) {
                for (col = 0; col < 3; ++col) {
                    wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
                    dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
                }
            }
        }
    }

    // Add N*N^T to W*W^T for numerical stability.  In theory 0*0^T is added
    // to D*W^T, but of course no update is needed in the implementation.
    // Compute the matrix of normal derivatives.
    for (i = 0; i < numVertices; ++i) {
        var nor = vba.getNormal(i);
        for (row = 0; row < 3; ++row) {
            for (col = 0; col < 3; ++col) {
                wwTrn[i].setItem(row, col, 0.5 * wwTrn[i].item(row, col) + nor[row] * nor[col]);
                dwTrn[i].setItem(row, col, dwTrn[i].item(row, col) * 0.5);
            }
        }

        wwTrn[i].setColumn(3, L5.Point.ORIGIN);
        dNormal[i] = dwTrn[i].mul(wwTrn[i]).inverse();
    }

    // gc?
    wwTrn = null;
    dwTrn = null;

    // If N is a unit-length normal at a vertex, let U and V be unit-length
    // tangents so that {U, V, N} is an orthonormal set.  Define the matrix
    // J = [U | V], a 3-by-2 matrix whose columns are U and V.  Define J^T
    // to be the transpose of J, a 2-by-3 matrix.  Let dN/dX denote the
    // matrix of first-order derivatives of the normal vector field.  The
    // shape matrix is
    //   S = (J^T * J)^{-1} * J^T * dN/dX * J = J^T * dN/dX * J
    // where the superscript of -1 denotes the inverse.  (The formula allows
    // for J built from non-perpendicular vectors.) The matrix S is 2-by-2.
    // The principal curvatures are the eigenvalues of S.  If k is a principal
    // curvature and W is the 2-by-1 eigenvector corresponding to it, then
    // S*W = k*W (by definition).  The corresponding 3-by-1 tangent vector at
    // the vertex is called the principal direction for k, and is J*W.  The
    // principal direction for the minimum principal curvature is stored as
    // the mesh tangent.  The principal direction for the maximum principal
    // curvature is stored as the mesh bitangent.
    for (i = 0; i < numVertices; ++i) {
        // Compute U and V given N.
        var norvec = new L5.Vector(vba.getNormal(i));
        var uvec = new L5.Vector(),
            vvec = new L5.Vector();

        L5.Vector.generateComplementBasis(uvec, vvec, norvec);

        // Compute S = J^T * dN/dX * J.  In theory S is symmetric, but
        // because we have estimated dN/dX, we must slightly adjust our
        // calculations to make sure S is symmetric.
        var s01 = uvec.dot(dNormal[i].mulPoint(vvec));
        var s10 = vvec.dot(dNormal[i].mulPoint(uvec));
        var sAvr = 0.5 * (s01 + s10);
        var smat = [
            [uvec.dot(dNormal[i].mulPoint(uvec)), sAvr],
            [sAvr, vvec.dot(dNormal[i].mulPoint(vvec))]
        ];

        // Compute the eigenvalues of S (min and max curvatures).
        var trace = smat[0][0] + smat[1][1];
        var det = smat[0][0] * smat[1][1] - smat[0][1] * smat[1][0];
        var discr = trace * trace - 4.0 * det;
        var rootDiscr = L5.Math.sqrt(L5.Math.abs(discr));
        var minCurvature = 0.5 * (trace - rootDiscr);
        // float maxCurvature = 0.5f*(trace + rootDiscr);

        // Compute the eigenvectors of S.
        var evec0 = new L5.Vector(smat[0][1], minCurvature - smat[0][0], 0);
        var evec1 = new L5.Vector(minCurvature - smat[1][1], smat[1][0], 0);

        var tanvec, binvec;
        if (evec0.squaredLength() >= evec1.squaredLength()) {
            evec0.normalize();
            tanvec = uvec.scalar(evec0.x).add(vvec.scalar(evec0.y));
            binvec = norvec.cross(tanvec);
        }
        else {
            evec1.normalize();
            tanvec = uvec.scalar(evec1.x).add(vvec.scalar(evec1.y));
            binvec = norvec.cross(tanvec);
        }

        if (vba.hasTangent()) {
            var t = vba.getTangent(i);
            t[0] = tanvec.x;
            t[1] = tanvec.y;
            t[2] = tanvec.z;
        }

        if (vba.hasBinormal()) {
            var b = vba.getBinormal(i);
            b[0] = binvec.x;
            b[1] = binvec.y;
            b[2] = binvec.z;
        }
    }
    dNormal = null;
};

/**
 * @param vba {L5.VertexBufferAccessor}
 */
L5.Triangles.prototype.updateModelTangentsUseTCoords = function (vba) {
    // Each vertex can be visited multiple times, so compute the tangent
    // space only on the first visit.  Use the zero vector as a flag for the
    // tangent vector not being computed.
    const numVertices = vba.getNumVertices();
    var hasTangent = vba.hasTangent();
    var zero = L5.Vector.ZERO;
    var i, t;
    if (hasTangent) {
        for (i = 0; i < numVertices; ++i) {
            t = vba.getTangent(i);
            t[0] = 0;
            t[1] = 0;
            t[2] = 0;
        }
    } else {
        for (i = 0; i < numVertices; ++i) {
            t = vba.getBinormal(i);
            t[0] = 0;
            t[1] = 0;
            t[2] = 0;
        }
    }

    const numTriangles = this.getNumTriangles();
    for (i = 0; i < numTriangles; i++) {
        // Get the triangle vertices' positions, normals, tangents, and
        // texture coordinates.
        var v = [0, 0, 0];
        if (!this.getTriangle(i, v)) {
            continue;
        }

        var locPosition = new Array(3);
        var locNormal = new Array(3);
        var locTangent = new Array(3);
        var locTCoord = new Array(2);
        var curr, k;
        for (curr = 0; curr < 3; ++curr) {
            k = v[curr];
            locPosition[curr] = new L5.Point(vba.getPosition(k));
            locNormal[curr] = new L5.Vector(vba.getNormal(k));
            locTangent[curr] = new L5.Vector((hasTangent ? vba.getTangent(k) : vba.getBinormal(k)));
            locTCoord[curr] = vba.getTCoord(0, k);
        }

        for (curr = 0; curr < 3; ++curr) {
            var currLocTangent = locTangent[curr];
            if (!currLocTangent.equals(zero)) {
                // 该顶点已被计算过
                continue;
            }

            // 计算顶点切线空间
            var norvec = locNormal[curr];
            var prev = ((curr + 2) % 3);
            var next = ((curr + 1) % 3);
            var tanvec = L5.Triangles.computeTangent(
                locPosition[curr], locTCoord[curr],
                locPosition[next], locTCoord[next],
                locPosition[prev], locTCoord[prev]
            );

            // Project T into the tangent plane by projecting out the surface
            // normal N, and then making it unit length.
            tanvec -= norvec.dot(tanvec) * norvec;
            tanvec.normalize();

            // Compute the bitangent B, another tangent perpendicular to T.
            var binvec = norvec.unitCross(tanvec);

            k = v[curr];
            if (hasTangent) {
                locTangent[k] = tanvec;
                if (vba.hasBinormal()) {
                    t = vba.getBinormal(k);
                    t[0] = binvec.x;
                    t[1] = binvec.y;
                    t[2] = binvec.z;
                }
            }
            else {
                t = vba.getBinormal(k);
                t[0] = tanvec.x;
                t[1] = tanvec.y;
                t[2] = tanvec.z;
            }
        }
    }
};
/**
 * 计算切线
 *
 * @param position0 {L5.Point}
 * @param tcoord0 {Array}
 * @param position1 {L5.Point}
 * @param tcoord1 {Array}
 * @param position2 {L5.Point}
 * @param tcoord2 {Array}
 * @returns {L5.Vector}
 */
L5.Triangles.computeTangent = function (position0, tcoord0,
                                        position1, tcoord1,
                                        position2, tcoord2) {
    // Compute the change in positions at the vertex P0.
    var v10 = position1.subP(position0);
    var v20 = position2.subP(position0);

    const ZERO_TOLERANCE = L5.Math.ZERO_TOLERANCE;
    const abs = L5.Math.abs;

    if (abs(v10.length()) < ZERO_TOLERANCE ||
        abs(v20.length()) < ZERO_TOLERANCE) {
        // The triangle is very small, call it degenerate.
        return L5.Vector.ZERO;
    }

    // Compute the change in texture coordinates at the vertex P0 in the
    // direction of edge P1-P0.
    var d1 = tcoord1[0] - tcoord0[0];
    var d2 = tcoord1[1] - tcoord0[1];
    if (abs(d2) < ZERO_TOLERANCE) {
        // The triangle effectively has no variation in the v texture
        // coordinate.
        if (abs(d1) < ZERO_TOLERANCE) {
            // The triangle effectively has no variation in the u coordinate.
            // Since the texture coordinates do not vary on this triangle,
            // treat it as a degenerate parametric surface.
            return L5.Vector.ZERO;
        }

        // The variation is effectively all in u, so set the tangent vector
        // to be T = dP/du.
        return v10.div(d1);
    }

    // Compute the change in texture coordinates at the vertex P0 in the
    // direction of edge P2-P0.
    var d3 = tcoord2[0] - tcoord0[0];
    var d4 = tcoord2[1] - tcoord0[1];
    var det = d2 * d3 - d4 * d1;
    if (abs(det) < ZERO_TOLERANCE) {
        // The triangle vertices are collinear in parameter space, so treat
        // this as a degenerate parametric surface.
        return L5.Vector.ZERO;
    }

    // The triangle vertices are not collinear in parameter space, so choose
    // the tangent to be dP/du = (dv1*dP2-dv2*dP1)/(dv1*du2-dv2*du1)
    return v20.scalar(d2).sub(v10.scalar(d4)).div(det);
};

/**
 * TriMesh
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexBuffer {L5.IndexBuffer}
 *
 * @class
 * @extends {L5.Triangles}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TriMesh = function (format, vertexBuffer, indexBuffer) {
    L5.Triangles.call(this, L5.Visual.PT_TRIMESH, format, vertexBuffer, indexBuffer);
};

L5.nameFix(L5.TriMesh, 'TriMesh');
L5.extendFix(L5.TriMesh, L5.Triangles);

/**
 * 获取网格中的三角形数量
 * @returns {number}
 */
L5.TriMesh.prototype.getNumTriangles = function () {
    return this.indexBuffer.numElements / 3;
};
/**
 * 获取位置I处的三角形索引
 * @param i {number}
 * @param output {Array} 3 elements
 * @returns {boolean}
 */
L5.TriMesh.prototype.getTriangle = function (i, output) {
    if (0 <= i && i < this.getNumTriangles()) {
        var data = this.indexBuffer.getData();
        data = new Uint32Array(data.subarray(3 * i*4, 3*(i+1)*4).buffer);
        output[0] = data[0];
        output[1] = data[1];
        output[2] = data[2];
        return true;
    }
    return false;
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.TriMesh}
 */
L5.TriMesh.factory = function (inStream) {
    var obj = new L5.TriMesh();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.TriMesh', L5.TriMesh.factory);

/**
 * Renderer 渲染器
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */

L5.Renderer = function (canvas, width, height, clearColor, colorFormat, depthStencilFormat, numMultiSamples) {
    /**
     * @type {WebGLRenderingContext}
     */
    var gl = canvas.getContext('webgl',{
        alpha: true,
        depth: true,
        stencil: false
    });
    this.gl = gl;
    this.clearColor = new Float32Array([0,0,0,1]);
    this.clearColor.set(clearColor);
    this.initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples);

    // The platform-specific data.  It is in public scope to allow the
    // renderer resource classes to access it.
    var data = new L5.GLRenderData();
    this.data = data;

    data.maxVShaderImages = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    data.maxFShaderImages = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    data.maxCombinedImages = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

    // Set the default render states.
    data.currentRS.initialize(gl,
        this.defaultAlphaState,
        this.defaultCullState,
        this.defaultDepthState,
        this.defaultOffsetState,
        this.defaultStencilState
    );
    L5.Renderer.renderers.add(this);
};

L5.nameFix(L5.Renderer, 'Renderer');
L5.Renderer.renderers = new Set();

/**
 *
 * @param width {number}
 * @param height {number}
 * @param colorFormat {number} L5.TEXTURE_FORMAT_XXX
 * @param depthStencilFormat {number} L5.TEXTURE_FORMAT_XXX
 * @param numMultiSamples {number}
 */
L5.Renderer.prototype.initialize = function (width, height, colorFormat, depthStencilFormat, numMultiSamples) {

    this._loadExt();

    this.width = width;
    this.height = height;
    this.colorFormat = colorFormat;
    this.depthStencilFormat = depthStencilFormat;
    this.numMultiSamples = numMultiSamples;

    // 全局状态
    this.alphaState = new L5.AlphaState();
    this.cullState = new L5.CullState();
    this.depthState = new L5.DepthState();
    this.offsetState = new L5.OffsetState();
    this.stencilState = new L5.StencilState();

    this.defaultAlphaState = new L5.AlphaState();
    this.defaultCullState = new L5.CullState();
    this.defaultDepthState = new L5.DepthState();
    this.defaultOffsetState = new L5.OffsetState();
    this.defaultStencilState = new L5.StencilState();


    // 覆盖全局状态
    this.overrideAlphaState = new L5.AlphaState();
    this.overrideCullState = new L5.CullState();
    this.overrideDepthState = new L5.DepthState();
    this.overrideOffsetState = new L5.OffsetState();
    this.overrideStencilState = new L5.StencilState();


    this.reverseCullOrder = false;

    // Geometric transformation pipeline.  The camera stores the view,
    // projection, and postprojection matrices.
    this.camera = null;


    // Access to the current clearing parameters for the color, depth, and
    // stencil buffers.  The color buffer is the back buffer.
    this.clearDepth = 1.0;
    this.clearStencil = 0;

    // Channel masking for the back buffer., allow rgba,
    this._colorMask = (0x1 | 0x2 | 0x4 | 0x8);

    // 框架结构对应到底层结构
    this.vertexFormats = new Map();
    this.vertexBuffers = new Map();
    this.indexBuffers = new Map();
    this.texture2Ds = new Map();
    this.texture3Ds = new Map();
    this.textureCubes = new Map();
    this.renderTargets = new Map();
    this.vertexShaders = new Map();
    this.fragShaders = new Map();
    this.programs = new Map();

    var gl = this.gl;
    var cc = this.clearColor;
    gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
    gl.clearDepth(this.clearDepth);
    gl.clearStencil(this.clearStencil);

};

L5.Renderer.prototype._loadExt = function () {
    L5.GLExtensions.init(this.gl);
};

L5.Renderer.prototype.terminate = function () {
};


// 访问当前摄像机状态
L5.Renderer.prototype.getViewMatrix = function () {
};
L5.Renderer.prototype.getProjectionMatrix = function () {
};
L5.Renderer.prototype.getPostProjectionMatrix = function () {
};

// Compute a picking ray from the specified left-handed screen
// coordinates (x,y) and using the current camera.  The output
// 'origin' is the camera position and the 'direction' is a
// unit-length vector.  Both are in world coordinates.  The return
// value is 'true' iff (x,y) is in the current viewport.
/**
 *
 * @param x {number} in
 * @param y {number} in
 * @param origin {L5.Point} out
 * @param direction {L5.Vector} out
 */
L5.Renderer.prototype.getPickRay = function (x, y, origin, direction) {

};


// === 资源管理
// 资源对象是已定义的
//    VertexFormat
//    VertexBuffer
//    IndexBuffer
//    Texture(2d, cube),
//    RenderTarget
//    VertexShader
//    FragmentShader
//
// bind:  创建对象对应的资源
//    渲染器维护对象和资源之间的映射，大多数情况下，显存中会分配一个资源对应对象在系统内存对应的副本
//    如果在bind之前调用了 enable 或 lock, 渲染器会创建一个资源而不是抛出异常
//
// bindAll:  为所有的渲染器对象创建对应的资源
//
// unbind:  销毁对象对应的资源
//    渲染器会移除对象-资源映射，和资源，但不会移除对象，所以对象可以重新绑定
//
// unbindAll:  销毁所有渲染器对象创建的资源和对象本身
//
// enable: 在drawPrimitive之前调用，激活资源，以便在本次渲染中使用
//
// disable: 在drawPrimitive之后调用, 取消激活资源，以便下次渲染中不使用
//
// lock:  获取一个显存资源位置
//    使用这个方法更新显存, 如果要这么干，请注意更新失败的情况，因为内存和显存复制不同步;
//    也可以锁定后只读，在这种情况下显存内容是保留的;
//    尽可能让资源锁定状态保持最少的时间
//
// unlock:  释放一个显存资源位置
//
// update:  锁定资源占用的显存，并复制内存数据到显存。渲染器会自动调用
//
// updateAll:  和update类似，但它更新所有渲染器共享的资源
//
// readColor:  只能由RenderTarget调用, 在调用时, RenderTarget必须是未激活状态
//    方法返回一个2D纹理对象，包含renderTarget在显存中的颜色值
// === 资源管理


/**
 * Access to the current color channel masks.
 * allowRed : 0x1
 * allowGreen: 0x2
 * allowBlue: 0x4
 * allowAlpha: 0x8
 * return
 */
L5.Renderer.prototype.getColorMask = function () {
    return (0x1 | 0x2 | 0x4 | 0x8);
};

// Override the global state.  If overridden, this state is used instead
// of the VisualPass state during a drawing call.  To undo the override,
// pass a null pointer.

Object.defineProperties(L5.Renderer.prototype, {
    overrideAlphaState: {
        get: function () {
            return this._overrideAlphaState;
        },
        set: function (val) {
            this._overrideAlphaState = val;
        }
    },
    overrideCullState: {
        get: function () {
            return this._overrideCullState;
        },
        set: function (val) {
            this._overrideCullState = val;
        }
    },
    overrideDepthState: {
        get: function () {
            return this._overrideDepthState;
        },
        set: function (val) {
            this._overrideDepthState = val;
        }
    },
    overrideOffsetState: {
        get: function () {
            return this._overrideOffsetState;
        },
        set: function (val) {
            this._overrideOffsetState = val;
        }
    },
    overrideStencilState: {
        get: function () {
            return this._overrideStencilState;
        },
        set: function (val) {
            this._overrideStencilState = val;
        }
    }
});

/**
 * The entry point to drawing the visible set of a scene tree.
 * @param visibleSet {L5.VisibleSet}
 * @param globalEffect {*}
 */
L5.Renderer.prototype.drawVisibleSet = function (visibleSet, globalEffect) {
    if (!globalEffect) {
        var numVisible = visibleSet.getNumVisible();
        for (var i = 0; i < numVisible; ++i) {
            var visual = visibleSet.getVisible(i);
            this.drawInstance(visual, visual.effect);
        }
    }
    else {
        globalEffect.draw(this, visibleSet);
    }
};

/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype.drawVisible = function (visual) {
    this.drawInstance(visual, visual.effect);
};

/**
 * 渲染单个对象
 * @param visual {L5.Visual}
 * @param instance {L5.VisualEffectInstance}
 */
L5.Renderer.prototype.drawInstance = function (visual, instance) {
    if (!visual) {
        L5.assert(false, 'The visual object must exist.');
        return;
    }

    if (!instance) {
        L5.assert(false, 'The visual object must have an effect instance.');
        return;
    }

    var vformat = visual.format;
    var vbuffer = visual.vertexBuffer;
    var ibuffer = visual.indexBuffer;

    var numPasses = instance.getNumPasses();
    for (var i = 0; i < numPasses; ++i) {
        var pass = instance.getPass(i);
        var vparams = instance.getVertexParameters(i);
        var fparams = instance.getFragParameters(i);
        var program = pass.program;

        // Update any shader constants that vary during runtime.
        vparams.updateConstants(visual, this.camera);
        fparams.updateConstants(visual, this.camera);

        // Set visual state.
        this.setAlphaState(pass.alphaState);
        this.setCullState(pass.cullState);
        this.setDepthState(pass.depthState);
        this.setOffsetState(pass.offsetState);
        this.setStencilState(pass.stencilState);
        //this.setWireState(pass.wireState);

        // enable data
        this._enableProgram(program, vparams, fparams);
        this._enableVertexBuffer(vbuffer);
        this._enableVertexFormat(vformat, program);
        if (ibuffer) {
            this._enableIndexBuffer(ibuffer);
        }

        // Draw the primitive.
        this.drawPrimitive(visual);

        // disable data
        if (ibuffer) {
            this._disableIndexBuffer(ibuffer);
        }
        this._disableVertexFormat(vformat);
        this._disableVertexBuffer(vbuffer);

        // Disable the shaders.
        this._disableProgram(program, vparams, fparams);
    }
};

// The entry point for drawing 3D objects, called by the single-object
// Draw function.
/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype._drawPrimitive = function (visual) {
};

//============================================================================
/**
 * 设置渲染视口
 * @param x {int}
 * @param y {int}
 * @param width {int}
 * @param height {int}
 */
L5.Renderer.prototype.setViewport = function (x, y, width, height) {
    this.gl.viewport(x, y, width, height);
};
/**
 * 获取渲染视口参数
 * @returns {Array<int>}
 */
L5.Renderer.prototype.getViewport = function () {
    var gl = this.gl;
    return gl.getParameter(gl.VIEWPORT);
};
/**
 * 调整渲染视口大小
 * @param width {int}
 * @param height {int}
 */
L5.Renderer.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    var gl = this.gl;
    var p = gl.getParameter(gl.VIEWPORT);
    gl.viewport(p[0], p[1], width, height);
};

/**
 * 设置深度测试范围
 * @param min {float}
 * @param max {float}
 */
L5.Renderer.prototype.setDepthRange = function (min, max) {
    this.gl.depthRange(min, max);
};
/**
 * 获取当前深度测试范围
 * @returns {Array<int>}
 */
L5.Renderer.prototype.getDepthRange = function () {
    var gl = this.gl;
    return gl.getParameter(gl.DEPTH_RANGE);
};



// Support for clearing the color, depth, and stencil buffers.
L5.Renderer.prototype.clearColorBuffer = function () {
};
L5.Renderer.prototype.clearDepthBuffer = function () {
};
L5.Renderer.prototype.clearStencilBuffer = function () {
};
L5.Renderer.prototype.clearColorBuffer = function (x, y, w, h) {
};
L5.Renderer.prototype.clearDepthBuffer = function (x, y, w, h) {
};
L5.Renderer.prototype.clearStencilBuffer = function (x, y, w, h) {
};
L5.Renderer.prototype.displayColorBuffer = function () {
};

// The entry point for drawing 2D text.
L5.Renderer.prototype.draw = function (x, y, color, message) {
};

// For render target access to allow creation of color/depth textures.
L5.Renderer.prototype.inTexture2DMap = function (texture) {
    return true;
};
L5.Renderer.prototype.insertInTexture2DMap = function (texture, platformTexture) {

};

L5.Renderer.updateAll = function (obj /*, params... */) {
    switch (obj.constructor.name) {
        case "Texture2D":
            this._updateAllTexture2D(obj, arguments[1]);
            break;
        case "Texture3D":
            this._updateAllTexture3D(obj, arguments[1], arguments[2]);
            break;
        case "TextureCube":
            this._updateAllTextureCube(obj, arguments[1], arguments[2]);
            break;
        case "VertexBuffer":
            this._updateAllVertexBuffer(obj);
            break;
        case "IndexBuffer":
            this._updateAllIndexBuffer(obj);
            break;
        default :
            L5.assert(false, obj.constructor.name + 'not support [updateAll] method.');
    }
};

/**
 * Shader 底层包装
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLShader = function () {
};
L5.nameFix(L5.GLShader, 'GLShader');

/**
 * @param shader {L5.Shader}
 * @param parameters {L5.ShaderParameters}
 * @param maxSamplers {number}
 * @param renderer {L5.Renderer}
 * @param currentSS {number} RendererData::SamplerState
 */
L5.GLShader.prototype.setSamplerState = function (renderer, shader, parameters, maxSamplers, currentSS) {
    var gl = renderer.gl;

    var numSamplers = shader.numSamplers;
    if (numSamplers > maxSamplers) {
        numSamplers = maxSamplers;
    }

    for (var i = 0; i < numSamplers; ++i) {
        var type = shader.getSamplerType(i);
        var target = L5.Webgl.TextureTarget[type];
        var textureUnit = shader.getTextureUnit(i);
        const texture = parameters.getTexture(i);
        var current = currentSS[textureUnit];
        var wrap0, wrap1;

        switch (type) {
            case L5.Shader.ST_2D:
            {
                renderer._enableTexture2D(texture, textureUnit);
                current.getCurrent(renderer, target);

                wrap0 = L5.Webgl.WrapMode[shader.getCoordinate(i, 0)];
                if (wrap0 != current.wrap[0]) {
                    current.wrap[0] = wrap0;
                    gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap0);
                }

                wrap1 = L5.Webgl.WrapMode[shader.getCoordinate(i, 1)];
                if (wrap1 != current.wrap[1]) {
                    current.wrap[1] = wrap1;
                    gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap1);
                }
                break;
            }
            case L5.Shader.ST_CUBE:
            {
                renderer._enableTextureCube(texture, textureUnit);
                current.getCurrent(renderer, target);

                wrap0 = L5.Webgl.WrapMode[shader.getCoordinate(i, 0)];
                if (wrap0 != current.wrap[0]) {
                    current.wrap[0] = wrap0;
                    gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap0);
                }

                wrap1 = L5.Webgl.WrapMode[shader.getCoordinate(i, 1)];
                if (wrap1 != current.wrap[1]) {
                    current.wrap[1] = wrap1;
                    gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap1);
                }
                break;
            }
            default:
                L5.assert(false, 'Invalid sampler type');
                break;
        }

        // Set the anisotropic filtering value.
        const maxAnisotropy = L5.Shader.MAX_ANISOTROPY;
        var anisotropy = shader.getAnisotropy(i);
        if (anisotropy < 1 || anisotropy > maxAnisotropy) {
            anisotropy = 1;
        }
        if (anisotropy != current.anisotropy) {
            current.anisotropy = anisotropy;
            gl.texParameterf(target, L5.Webgl.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
        }

        // Set the magfilter mode.
        var filter = shader.getFilter(i);
        if (filter === L5.Shader.SF_NEAREST) {
            if (gl.NEAREST !== current.magFilter) {
                current.magFilter = gl.NEAREST;
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
        } else {
            if (gl.LINEAR != current.magFilter) {
                current.magFilter = gl.LINEAR;
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        }

        // Set the minfilter mode.
        var minFilter = L5.Webgl.TextureFilter[filter];
        if (minFilter != current.minFilter) {
            current.minFilter = minFilter;
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);
        }
    }
};
/**
 * @param shader {L5.Shader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 * @param maxSamplers {number}
 */
L5.GLShader.prototype.disableTexture = function (renderer, shader, parameters, maxSamplers) {
    var numSamplers = shader.numSamplers;
    if (numSamplers > maxSamplers) {
        numSamplers = maxSamplers;
    }

    var type, textureUnit, texture;

    for (var i = 0; i < numSamplers; ++i) {
        type = shader.getSamplerType(i);
        textureUnit = shader.getTextureUnit(i);
        texture = parameters.getTexture(i);

        switch (type) {
            case L5.Shader.ST_2D:
            {
                renderer._disableTexture2D(texture, textureUnit);
                break;
            }
            case L5.Shader.ST_CUBE:
            {
                renderer._disableTextureCube(texture, textureUnit);
                break;
            }
            default:
                L5.assert(false, "Invalid sampler type\n");
                break;
        }
    }
};

/**
 * 默认应用核心类
 *
 * @version 1.0
 * @author lonphy
 */
// 事件处理器
var handles = {
    /**
     * 窗口大小调整事件
     * @param evt {Event}
     */
    ResizeHandler: function (evt) {
        var ins = L5.Application.instance;
        if (ins) {
            var r = evt.target.document.documentElement;
            ins.onResize(r.clientWidth, r.clientHeight);
        }
    },

    KeyDownHandler: function (evt) {
        var key = evt.keyCode;
        var ins = L5.Application.instance;
        if (ins) {
            if (key === L5.Input.KB_ESC && evt.ctrlKey) {
                ins.onTerminate();
                return;
            }
            ins.onKeyDown(key, L5.Application.mX, L5.Application.mY);
            ins.onSpecialKeyDown(key, L5.Application.mX, L5.Application.mY);
        }
    },
    KeyUpHandler: function (evt) {
        var key = evt.keyCode;
        var ins = L5.Application.instance;
        if (ins) {
            ins.onKeyUp(key, L5.Application.mX, L5.Application.mY);
            ins.onSpecialKeyUp(key, L5.Application.mX, L5.Application.mY);

        }
    },
    MouseMoveHandler: function (evt) {
        L5.Application.mX = evt.x;
        L5.Application.mY = evt.y;
    },
    MouseHandler: function (evt) {
        var ins = L5.Application.instance;
        if (ins) {
            L5.Application.gModifyButton = evt.ctrlKey;
            if (evt.state === 'down') {
                L5.Application.gButton = evt.button;
            } else {
                L5.Application.gButton = -1;
            }
            ins.onMouseClick(evt.button, evt.state, x, y, L5.Application.gModifyButton);
        }
    },
    MotionHandler: function (x, y) {
        var ins = L5.Application.instance;
        if (ins) {
            ins.onMotion(L5.Application.gButton, x, y, L5.Application.gModifyButton);
        }
    },
    PassiveMotionHandler: function (x, y) {
        var ins = L5.Application.instance;
        if (ins) {
            ins.onPassiveMotion(x, y);
        }
    }
};

/**
 * 应用基类
 * @param title
 * @param width
 * @param height
 * @param clearColor
 * @param canvas
 *
 * @class
 */
L5.Application = function (title, width, height, clearColor, canvas) {
    L5.Application.instance = this;

    var renderDOM = document.getElementById(canvas);
    renderDOM = renderDOM || document.createElement('canvas');

    renderDOM.width = width;
    renderDOM.height = height;

    this.title = title; // 实例名称
    this.width = width;
    this.height = height;
    this.clearColor = clearColor;

    this.colorFormat = L5.Texture.TF_A8R8G8B8;
    this.depthStencilFormat = L5.Texture.TF_D24S8;

    this.numMultisamples = 0;

    this.renderer = new L5.Renderer(renderDOM, width, height, clearColor, this.colorFormat, this.depthStencilFormat, this.numMultisamples);
    this.renderDOM = renderDOM;

    this.lastTime = -1;
    this.accumulatedTime = 0;
    this.frameRate = 0;

    this.frameCount = 0;
    this.accumulatedFrameCount = 0;
    this.timer = 30;
    this.maxTimer = 30;

    this.textColor = '#000';

    this.loadWait = 0;

    this.applicationRun = false;
};

L5.Application.prototype.resetTime = function () {
    this.lastTime = -1;
};

L5.Application.prototype.run = function () {

    if (!this.onPreCreate()) {
        return -2;
    }

    if (!this.fpsOutput) {

        this.fpsOutput = document.createElement('div');
        this.fpsOutput.setAttribute('style', 'position:absolute;top:8px;left:8px;color:' + this.textColor);
        this.renderDOM.parentNode.appendChild(this.fpsOutput);
    }

    // Create the renderer.
    this.renderer.initialize(this.title, this.width, this.height,
        this.colorFormat, this.depthStencilFormat, this.numMultisamples);


    // TODO : 事件回调定义
    window.addEventListener('resize', handles.ResizeHandler, false);
    window.addEventListener('keydown', handles.KeyDownHandler, false);
    window.addEventListener('keyup', handles.KeyUpHandler, false);
    window.addEventListener('mousemove', handles.MouseMoveHandler, false);
    //glutSpecialFunc(SpecialKeyDownCallback);
    //glutSpecialUpFunc(SpecialKeyUpCallback);
    //glutMouseFunc(MouseClickCallback);
    //glutMotionFunc(MotionCallback);
    //glutPassiveMotionFunc(PassiveMotionCallback);

    if (!this.onInitialize()) {
        return -4;
    }

    // The default OnPreidle() clears the buffers.  Allow the application to
    // fill them before the window is shown and before the event loop starts.
    this.onPreIdle();

    // Run event loop.
    this.applicationRun = true;
    var $this = this;
    var loopFunc = function () {
        if (!$this.applicationRun) {
            $this.onTerminate();
            delete $this.renderer;
            delete $this.renderDOM;
            return;
        }
        $this.updateFrameCount();
        requestAnimationFrame(loopFunc);
        if ($this.loadWait === 0) {
            $this.onIdle.call($this);
        }
    };
    requestAnimationFrame(loopFunc);

    return 0;
};
L5.Application.prototype.measureTime = function () {
    // start performance measurements
    if (this.lastTime === -1.0) {
        this.lastTime = Date.now();
        this.accumulatedTime = 0;
        this.frameRate = 0;
        this.frameCount = 0;
        this.accumulatedFrameCount = 0;
        this.timer = this.maxTimer;
    }

    // accumulate the time only when the miniature time allows it
    if (--this.timer === 0) {
        var currentTime = Date.now();
        var dDelta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulatedTime += dDelta;
        this.accumulatedFrameCount += this.frameCount;
        this.frameCount = 0;
        this.timer = this.maxTimer;
    }
};
L5.Application.prototype.updateFrameCount = function () {
    ++this.frameCount;
};
/**
 * 更新FPS显示
 */
L5.Application.prototype.drawFrameRate = function () {
    if (this.accumulatedTime > 0) {
        this.frameRate = (this.accumulatedFrameCount / this.accumulatedTime) * 1000;
    }
    else {
        this.frameRate = 0;
    }
    this.fpsOutput.textContent = 'fps: ' + this.frameRate.toFixed(1);
};
L5.Application.prototype.getAspectRatio = function () {
    return this.width / this.height;
};


L5.Application.prototype.onInitialize = function () {
    this.renderer.clearColor = this.clearColor;
    return true;
};
L5.Application.prototype.onTerminate = function () {
    this.applicationRun = false;
};

// 预创建,添加输入事件监听
L5.Application.prototype.onPreCreate = function () {
    return true;
};

L5.Application.prototype.onPreIdle = function () {
    this.renderer.clearBuffers();
};
L5.Application.prototype.onIdle = function () {
};
L5.Application.prototype.onKeyDown = function (key, x, y) {
    if (key === L5.Input.KB_F2) {
        this.resetTime();
        return true;
    }
    return false;
};
L5.Application.prototype.onKeyUp = function (key, x, y) {
};
L5.Application.prototype.onMouseClick = function (button, state, x, y, modifiers) {
};
L5.Application.prototype.onMotion = function (button, x, y, modifiers) {
};
L5.Application.prototype.onPassiveMotion = function (x, y) {
};
L5.Application.prototype.onMouseWheel = function (delta, x, y, modifiers) {
};

L5.Application.prototype.onResize = function (w, h) {
    if (w > 0 && h > 0) {
        if (this.renderer) {
            this.renderer.resize(w, h);
            this.renderDOM.width = w;
            this.renderDOM.height = h;
        }
        this.width = w;
        this.height = h;
    }
};
L5.Application.prototype.getMousePosition = function () {
};


/**
 * 应用实例
 * @type {L5.Application}
 */
L5.Application.instance = null;
L5.Application.gButton = -1;
L5.Application.gModifyButton = -1;
L5.Application.mX = 0;
L5.Application.mY = 0;

/**
 * ShaderFloat - 着色器浮点数
 * @param numRegisters {number}
 * @constructor
 *
 * @extends {L5.D3Object}
 */
L5.ShaderFloat = function (numRegisters) {
    L5.D3Object.call(this);
    this.numElements = 0;
    this.data = null;
    this.allowUpdater = false;
    this.setNumRegisters(numRegisters);
};
L5.nameFix(L5.ShaderFloat, 'ShaderFloat');
L5.extendFix(L5.ShaderFloat, L5.D3Object);


/**
 * @param numRegisters {number}
 */
L5.ShaderFloat.prototype.setNumRegisters = function (numRegisters) {
    L5.assert(numRegisters > 0, 'Number of registers must be positive');
    this.numElements = 4 * numRegisters;
    this.data = new Float32Array(this.numElements);
}
;
L5.ShaderFloat.prototype.getNumRegisters = function () {
    return this.numElements / 4;
};

L5.ShaderFloat.prototype.item = function (index, val) {
    L5.assert(0 <= index && index < this.numElements, 'Invalid index');
    if (val === undefined) {
        return this.data[index];
    }
    this.data[index] = val;
};

/**
 * @param i {number} location of elements
 * @param data {Float32Array} 4-tuple float
 */
L5.ShaderFloat.prototype.setOneRegister = function (i, data) {
    L5.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
    this.data.set(data.subarray(0, 4), 4 * i);
};
/**
 * @param data {Float32Array}
 */
L5.ShaderFloat.prototype.setRegister = function (data) {
    this.data.set(data.subarray(0, this.numElements));
};
/**
 * @param i {number}
 * @returns {Float32Array}
 */
L5.ShaderFloat.prototype.getOneRegister = function (i) {
    L5.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
    return new Float32Array(this.data.subarray(4 * i, 4 * i + 4));
};
/**
 * @returns {Float32Array}
 */
L5.ShaderFloat.prototype.getRegisters = function () {
    return new Float32Array(this.data);
};

/**
 * @param data {Float32Array}
 */
L5.ShaderFloat.prototype.copy = function (data) {
    this.data.set(data.subarray(0, this.numElements));
    return this;
};

/**
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ShaderFloat.prototype.update = function (visual, camera) {
    // 占位函数,子类实现
};

L5.ShaderFloat.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.data = new Float32Array(inStream.readFloatArray());
    this.numElements = this.data.length;
    this.allowUpdater = inStream.readBool();
};

L5.ShaderFloat.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeFloat32Array(this.numElements, this.data);
    outStream.writeBool(this.allowUpdater);
};

/**
 * Application 2D
 * @param title {string}
 * @param width {number}
 * @param height {number}
 * @param clearColor
 * @param canvas
 *
 * @extends {L5.Application}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Application2 = function (
    title, width, height, clearColor, canvas
) {
    L5.Application.call (this, title, width, height, clearColor, canvas);
    this.screenWidth   = 0;
    this.screenHeight  = 0;
    this.screen        = null;
    this.clampToWindow = true;
    this.doFlip        = false;
};

L5.nameFix(L5.Application2, 'Application2');
L5.extendFix (L5.Application2, L5.Application);


// Event callbacks.
L5.Application2.prototype.onInitialize = function () {
    if (!this._proto__.onInitialize.call (this)) {
        return false;
    }

    // The RGBA screen pixels.
    this.screenWidth  = this.width;
    this.screenHeight = this.height;
    this.screen       = new Array (this.screenWidth * this.screenHeight);
    this.clearScreen ();
    return true;
};
L5.Application2.prototype.onTerminate  = function () {};
L5.Application2.prototype.onDisplay    = function () {
    if (this.renderer.preDraw ()) {
        this.renderer.clearBuffers ();
        this.renderer.draw (this.screen, this.doFlip);
        this.screenOverlay ();
        this.renderer.postDraw ();
        this.renderer.displayColorBuffer ();
    }
};

// Allows you to do additional drawing after the screen polygon is drawn.
// Screen overlays should use the Renderer calls and not access the
// mScreen array directly.
L5.Application2.prototype.screenOverlay = function () {};
L5.Application2.prototype.clearScreen   = function () {
    var r       = 255 * this.clearColor[ 0 ];
    var g       = 255 * this.clearColor[ 1 ];
    var b       = 255 * this.clearColor[ 2 ];
    var a       = 255 * this.clearColor[ 3 ];
    var color   = new L5.Application2.ColorRGB (r, g, b, a);
    var current = this.screen;
    var imax    = this.width * this.height;
    for (var i = 0; i < imax; ++i, ++current) {
        this.screen[ i ] = color;
    }
};


// For right-handed drawing.  You still draw to the left-handed screen,
// but immediately before drawing, the screen is copied into another
// buffer with the rows reversed.  You need only call DoFlip(true) once
// for an application.  The default is 'false'.
L5.Application2.prototype.setFlip = function (doFlip) {
    this.doFlip = doFlip;
};

// The drawing routines listed below perform range checking on any (x,y)
// {Set/Get}Pixel call when mClampToWindow is 'true'.  Each pixel is
// processed only when in range.
L5.Application2.prototype.getClampToWindow = function () {
    return this.clampToWindow;
};

// Set the pixel at location (x,y) to the specified color.
L5.Application2.prototype.setPixel = function (
    x, y, color
) {
    var width  = this.width,
        height = this.height;

    if (this.clampToWindow) {
        if (0 <= x && x < width && 0 <= y && y < height) {
            this.screen[ x + width * y ] = color;
        }
    }
    else {
        this.screen[ x + width * y ] = color;
    }
};

// Set the pixels (x',y') for x-thick <= x' <= x+thick and
// y-thick <= y' <= y+thick.
L5.Application2.prototype.setThickPixel = function (
    x, y, thick, color
) {
    for (var dy = -thick; dy <= thick; ++dy) {
        for (var dx = -thick; dx <= thick; ++dx) {
            this.setPixel (x + dx, y + dy, color);
        }
    }
};

// Get the pixel color at location (x,y).
L5.Application2.prototype.getPixel = function (x, y) {
    var width  = this.width,
        height = this.height;
    if (this.clampToWindow) {
        if (0 <= x && x < width && 0 <= y && y < height) {
            return this.screen[ x + width * y ];
        }
        else {
            return new L5.Application2.ColorRGB (0, 0, 0, 0);
        }
    }
    else {
        return this.screen[ x + width * y ];
    }
};

// Use Bresenham's algorithm to draw the line from (x0,y0) to (x1,y1)
// using the specified color for the drawn pixels.  The algorithm is
// biased in that the pixels set by DrawLine(x0,y0,x1,y1) are not
// necessarily the same as those set by DrawLine(x1,y1,x0,y0).
// TODO: Implement the midpoint algorithm to avoid the bias.
L5.Application2.prototype.drawLine = function (
    x0, y0, x1, y1, color
) {
    var x = x0, y = y0;

    // The direction of the line segment.
    var dx = x1 - x0, dy = y1 - y0;

    // Increment or decrement depending on the direction of the line.
    var sx = (dx > 0 ? 1 : (dx < 0 ? -1 : 0));
    var sy = (dy > 0 ? 1 : (dy < 0 ? -1 : 0));

    // Decision parameters for pixel selection.
    if (dx < 0) {
        dx = -dx;
    }
    if (dy < 0) {
        dy = -dy;
    }
    var ax = 2 * dx, ay = 2 * dy;
    var decx, decy;

    // Determine the largest direction component and single-step using the
    // related variable.
    var dir = 0;
    if (dy > dx) {
        dir = 1;
    }

    // Traverse the line segment using Bresenham's algorithm.
    switch (dir) {
        case 0:  // Single-step in the x-direction.
            decy = ay - dx;
            for (/**/; /**/; x += sx, decy += ay) {
                // Process the pixel.
                this.setPixel (x, y, color);

                // Take the Bresenham step.
                if (x == x1) {
                    break;
                }
                if (decy >= 0) {
                    decy -= ax;
                    y += sy;
                }
            }
            break;
        case 1:  // Single-step in the y-direction.
            decx = ax - dy;
            for (/**/; /**/; y += sy, decx += ax) {
                // Process the pixel.
                this.setPixel (x, y, color);

                // Take the Bresenham step.
                if (y == y1) {
                    break;
                }
                if (decx >= 0) {
                    decx -= ay;
                    x += sx;
                }
            }
            break;
    }
};

// Draw an axis-aligned rectangle using the specified color.  The
// 'solid' parameter indicates whether or not to fill the rectangle.
L5.Application2.prototype.drawRectangle = function (
    xMin, yMin, xMax, yMax, color, solid
) {
    if (xMin >= this.width || xMax < 0 || yMin >= this.height || yMax < 0) {
        // rectangle not visible
        return;
    }

    var x, y;

    if (solid) {
        for (y = yMin; y <= yMax; ++y) {
            for (x = xMin; x <= xMax; ++x) {
                this.setPixel (x, y, color);
            }
        }
    }
    else {
        for (x = xMin; x <= xMax; ++x) {
            this.setPixel (x, yMin, color);
            this.setPixel (x, yMax, color);
        }
        for (y = yMin + 1; y <= yMax - 1; ++y) {
            this.setPixel (xMin, y, color);
            this.setPixel (xMax, y, color);
        }
    }
};

// Use Bresenham's algorithm to draw the circle centered at
// (xCenter,yCenter) with the specified 'radius' and using the
// specified color.  The 'solid' parameter indicates whether or not
// to fill the circle.
L5.Application2.prototype.drawCircle = function (
    cx, cy, radius, color, solid
) {
    var x, y, dec;

    if (solid) {
        var xValue, yMin, yMax, i;
        for (x = 0, y = radius, dec = 3 - 2 * radius; x <= y; ++x) {
            xValue = cx + x;
            yMin   = cy - y;
            yMax   = cy + y;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            xValue = cx - x;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            xValue = cx + y;
            yMin   = cy - x;
            yMax   = cy + x;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            xValue = cx - y;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            if (dec >= 0) {
                dec += -4 * (y--) + 4;
            }
            dec += 4 * x + 6;
        }
    }
    else {
        for (x = 0, y = radius, dec = 3 - 2 * radius; x <= y; ++x) {
            this.setPixel (cx + x, cy + y, color);
            this.setPixel (cx + x, cy - y, color);
            this.setPixel (cx - x, cy + y, color);
            this.setPixel (cx - x, cy - y, color);
            this.setPixel (cx + y, cy + x, color);
            this.setPixel (cx + y, cy - x, color);
            this.setPixel (cx - y, cy + x, color);
            this.setPixel (cx - y, cy - x, color);

            if (dec >= 0) {
                dec += -4 * (y--) + 4;
            }
            dec += 4 * x + 6;
        }
    }
};

// Flood-fill a region whose pixels are of color 'backColor' by
// changing their color to 'foreColor'.  The fill treats the screen
// as 4-connected; that is, after (x,y) is visited, then (x-1,y),
// (x+1,y), (x,y-1), and (x,y+1) are visited (as long as they are in
// the screen boundary).  The function simulates recursion by using
// stacks, which avoids the expense of true recursion and the potential
// to overflow the calling stack.
L5.Application2.prototype.fill = function (
    x, y, foreColor, backColor
) {
    // Allocate the maximum amount of space needed.  If you prefer less, you
    // need to modify this data structure to allow for dynamic reallocation
    // when it is needed.  An empty stack has top == -1.
    var xMax      = this.width, yMax = this.height;
    var stackSize = xMax * yMax;
    var xStack    = new Array (stackSize);
    var yStack    = new Array (stackSize);

    // Push the seed point onto the stack if it has the background color.  All
    // points pushed onto stack have background color backColor.
    var top       = 0;
    xStack[ top ] = x;
    yStack[ top ] = y;

    while (top >= 0)  // The stack is not empty.
    {
        // Read the top of the stack.  Do not pop it since we need to return
        // to this top value later to restart the fill in a different
        // direction.
        x = xStack[ top ];
        y = yStack[ top ];

        // Fill the pixel.
        this.setPixel (x, y, foreColor);

        var xp1 = x + 1;
        if (xp1 < xMax && this.getPixel (xp1, y).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = xp1;
            yStack[ top ] = y;
            continue;
        }

        var xm1 = x - 1;
        if (0 <= xm1 && this.getPixel (xm1, y).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = xm1;
            yStack[ top ] = y;
            continue;
        }

        var yp1 = y + 1;
        if (yp1 < yMax && this.getPixel (x, yp1).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = x;
            yStack[ top ] = yp1;
            continue;
        }

        var ym1 = y - 1;
        if (0 <= ym1 && this.getPixel (x, ym1).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = x;
            yStack[ top ] = ym1;
            continue;
        }

        // We are done in all directions, so pop and return to search other
        // directions.
        top--;
    }
};

// TODO:  Added an alpha channel to get 32-bits per pixel for performance
// in drawing on the GPU.  A change in class name will affect many
// applications, so that will be deferred until closer to shipping WM5.6.
L5.Application2.ColorRGB = function (
    red, green, blue, alpha
) {
    this.r = red;
    this.g = green;
    this.b = blue;
    this.a = alpha === undefined ? 255 : alpha;
};

L5.Application2.ColorRGB.prototype.equals = function (c) {
    return b === color.b && g === color.g && r === color.r && a === color.a;
};

L5.Application2.ColorRGB.prototype.notEquals = function (c) {
    return b !== color.b || g !== color.g || r !== color.r || a !== color.a;
};

/**
 * Application 3D
 * @param title {string}
 * @param width {number}
 * @param height {number}
 * @param clearColor
 * @param canvas
 *
 * @extends {L5.Application}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Application3 = function (title, width, height, clearColor, canvas) {
    L5.Application.call(this, title, width, height, clearColor, canvas);

    this.camera = null;
    this.worldAxis = [
        L5.Vector.ZERO,
        L5.Vector.ZERO,
        L5.Vector.ZERO
    ];

    this.trnSpeed = 0;
    this.trnSpeedFactor = 0;
    this.rotSpeed = 0;
    this.rotSpeedFactor = 0;

    this.UArrowPressed = false;
    this.DArrowPressed = false;
    this.LArrowPressed = false;
    this.RArrowPressed = false;
    this.PgUpPressed = false;
    this.PgDnPressed = false;
    this.HomePressed = false;
    this.EndPressed = false;
    this.InsertPressed = false;
    this.DeletePressed = false;
    this.cameraMoveable = false;

    /**
     * @type {L5.Spatial}
     */
    this.motionObject = null;
    this.doRoll = 0;
    this.doYaw = 0;
    this.doPitch = 0;
    this.xTrack0 = 0;
    this.xTrack1 = 0;
    this.yTrack0 = 0;
    this.yTrack1 = 0;
    /**
     * @type {L5.Matrix}
     */
    this.saveRotate = null;
    this.useTrackBall = true;
    this.trackBallDown = false;
};

L5.extendFix(L5.Application3, L5.Application);

/**
 * @param motionObject {L5.Spatial}
 */
L5.Application3.prototype.initializeObjectMotion = function (motionObject) {
    this.motionObject = motionObject;
};
L5.Application3.prototype.moveObject = function () {
    // The coordinate system in which the rotations are applied is that of
    // the object's parent, if it has one.  The parent's world rotation
    // matrix is R, of which the columns are the coordinate axis directions.
    // Column 0 is "direction", column 1 is "up", and column 2 is "right".
    // If the object does not have a parent, the world coordinate axes are
    // used, in which case the rotation matrix is I, the identity.  Column 0
    // is (1,0,0) and is "direction", column 1 is (0,1,0) and is "up", and
    // column 2 is (0,0,1) and is "right".  This choice is consistent with
    // the use of rotations in the Camera and Light classes to store
    // coordinate axes.
    //
    // Roll is about the "direction" axis, yaw is about the "up" axis, and
    // pitch is about the "right" axis.
    var motionObject = this.motionObject;

    if (!this.cameraMoveable || !motionObject) {
        return false;
    }

    // Check if the object has been moved by the virtual trackball.
    if (this.trackBallDown) {
        return true;
    }

    // Check if the object has been moved by the function keys.
    var parent = motionObject.parent;
    var axis = L5.Vector.ZERO;
    var angle;
    var rot, incr;
    var rotSpeed = this.rotSpeed;

    if (this.doRoll) {
        rot = motionObject.localTransform.getRotate();

        angle = this.doRoll * rotSpeed;
        if (parent) {
            parent.worldTransform.getRotate().getColumn(0, axis);
        }
        else {
            axis.set(1, 0, 0); // L5.Vector.UNIT_X;
        }

        incr.makeRotation(axis, angle);
        rot = incr * rot;
        rot.orthoNormalize();
        motionObject.localTransform.setRotate(rot);
        return true;
    }

    if (this.doYaw) {
        rot = motionObject.localTransform.getRotate();

        angle = this.doYaw * rotSpeed;
        if (parent) {
            parent.worldTransform.getRotate().getColumn(1, axis);
        }
        else {
            axis.set(0,1,0); // L5.Vector.UNIT_Y;
        }

        incr.makeRotation(axis, angle);
        rot = incr * rot;
        rot.orthoNormalize();
        motionObject.localTransform.setRotate(rot);
        return true;
    }

    if (this.doPitch) {
        rot = motionObject.localTransform.getRotate();

        angle = this.doPitch * rotSpeed;
        if (parent) {
            parent.worldTransform.getRotate().getColumn(2, axis);
        }
        else {
            axis.set(0,0,1); // L5.Vector.UNIT_Z;
        }

        incr.makeRotation(axis, angle);
        rot = incr * rot;
        rot.orthoNormalize();
        motionObject.localTransform.setRotate(rot);
        return true;
    }

    return false;
};

L5.Application3.prototype.rotateTrackBall = function (x0, y0, x1, y1) {
    if ((x0 == x1 && y0 == y1) || !this.camera) {
        // Nothing to rotate.
        return;
    }

    // Get the first vector on the sphere.
    var length = L5.Math.sqrt(x0 * x0 + y0 * y0), invLength, z0, z1;
    if (length > 1) {
        // Outside the unit disk, project onto it.
        invLength = 1 / length;
        x0 *= invLength;
        y0 *= invLength;
        z0 = 0;
    }
    else {
        // Compute point (x0,y0,z0) on negative unit hemisphere.
        z0 = 1 - x0 * x0 - y0 * y0;
        z0 = z0 <= 0 ? 0 : L5.Math.sqrt(z0);
    }
    z0 = -z0;

    // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
    var vec0 = new L5.Vector(z0, y0, x0);

    // Get the second vector on the sphere.
    length = L5.Math.sqrt(x1 * x1 + y1 * y1);
    if (length > 1) {
        // Outside unit disk, project onto it.
        invLength = 1 / length;
        x1 *= invLength;
        y1 *= invLength;
        z1 = 0;
    }
    else {
        // Compute point (x1,y1,z1) on negative unit hemisphere.
        z1 = 1 - x1 * x1 - y1 * y1;
        z1 = z1 <= 0 ? 0 : L5.Math.sqrt(z1);
    }
    z1 = -z1;

    // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
    var vec1 = new L5.Vector(z1, y1, x1);

    // Create axis and angle for the rotation.
    var axis = vec0.cross(vec1);
    var dot = vec0.dot(vec1);
    var angle;
    if (axis.normalize() > L5.Math.ZERO_TOLERANCE) {
        angle = L5.Math.acos(dot);
    }
    else  // Vectors are parallel.
    {
        if (dot < 0) {
            // Rotated pi radians.
            invLength = L5.Math.invSqrt(x0 * x0 + y0 * y0);
            axis.x = y0 * invLength;
            axis.y = -x0 * invLength;
            axis.z = 0;
            angle = L5.Math.PI;
        }
        else {
            // Rotation by zero radians.
            axis = L5.Vector.UNIT_X;
            angle = 0;
        }
    }

    // Compute the world rotation matrix implied by trackball motion.  The
    // axis vector was computed in camera coordinates.  It must be converted
    // to world coordinates.  Once again, I use the camera ordering (D,U,R).
    var worldAxis = this.camera.direction.scalar(axis.x).add(
        this.camera.up.scalar(axis.y).add(
            this.camera.right.scalar(axis.z)
        )
    );


    var trackRotate = new L5.Matrix(worldAxis, angle);

    // Compute the new local rotation.  If the object is the root of the
    // scene, the new rotation is simply the *incremental rotation* of the
    // trackball applied *after* the object has been rotated by its old
    // local rotation.  If the object is not the root of the scene, you have
    // to convert the incremental rotation by a change of basis in the
    // parent's coordinate space.
    var parent = this.motionObject.parent;
    var localRot;
    if (parent) {
        var parWorRotate = parent.worldTransform.GetRotate();
        localRot = parWorRotate.transposeTimes(trackRotate) * parWorRotate * this.saveRotate;
    }
    else {
        localRot = trackRotate * this.saveRotate;
    }
    localRot.orthonormalize();
    this.motionObject.localTransform.setRotate(localRot);
};

/**
 * 初始化相机运动参数
 *
 * @param trnSpeed {float} 移动速度
 * @param rotSpeed {float} 旋转速度
 * @param trnSpeedFactor {float} 移动速度变化因子 默认为2
 * @param rotSpeedFactor {float} 旋转速度变化因子 默认为2
 */
L5.Application3.prototype.initializeCameraMotion = function (trnSpeed, rotSpeed, trnSpeedFactor, rotSpeedFactor) {
    this.cameraMoveable = true;

    this.trnSpeed = trnSpeed;
    this.rotSpeed = rotSpeed;
    this.trnSpeedFactor = trnSpeedFactor || 2;
    this.rotSpeedFactor = rotSpeedFactor || 2;

    this.worldAxis[0] = this.camera.direction;
    this.worldAxis[1] = this.camera.up;
    this.worldAxis[2] = this.camera.right;
};

/**
 * 移动相机,如果有则更新相机
 *
 * @returns {boolean}
 */
L5.Application3.prototype.moveCamera = function () {
    if (!this.cameraMoveable) {
        return false;
    }

    var moved = false;

    if (this.UArrowPressed) {
        this.moveForward();
        moved = true;
    }

    if (this.DArrowPressed) {
        this.moveBackward();
        moved = true;
    }

    if (this.HomePressed) {
        this.moveUp();
        moved = true;
    }

    if (this.EndPressed) {
        this.moveDown();
        moved = true;
    }

    if (this.LArrowPressed) {
        this.turnLeft();
        moved = true;
    }

    if (this.RArrowPressed) {
        this.turnRight();
        moved = true;
    }

    if (this.PgUpPressed) {
        this.lookUp();
        moved = true;
    }

    if (this.PgDnPressed) {
        this.lookDown();
        moved = true;
    }

    if (this.InsertPressed) {
        this.moveRight();
        moved = true;
    }

    if (this.DeletePressed) {
        this.moveLeft();
        moved = true;
    }

    return moved;
};

L5.Application3.prototype.moveForward = function () {
    var pos = this.camera.position;
    var t = this.worldAxis[0].scalar(this.trnSpeed);
    this.camera.setPosition(pos.sub(t));
};
L5.Application3.prototype.moveBackward = function () {
    var pos = this.camera.position;
    var t = this.worldAxis[0].scalar(this.trnSpeed);
    this.camera.setPosition(pos.add(t));
};
L5.Application3.prototype.moveUp = function () {
    var pos = this.camera.position;
    var t = this.worldAxis[1].scalar(this.trnSpeed);
    this.camera.setPosition(pos.sub(t));
};
L5.Application3.prototype.moveDown = function () {
    var pos = this.camera.position;
    var t = this.worldAxis[1].scalar(this.trnSpeed);
    this.camera.setPosition(pos.add(t));
};

L5.Application3.prototype.moveLeft = function () {
    var pos = this.camera.position;
    var t = this.worldAxis[2].scalar(this.trnSpeed);
    this.camera.setPosition(pos.sub(t));
};

L5.Application3.prototype.moveRight = function () {
    var pos = this.camera.position;
    var t = this.worldAxis[2].scalar(this.trnSpeed);
    this.camera.setPosition(pos.add(t));
};

L5.Application3.prototype.turnLeft = function () {
    var incr = new L5.Matrix.makeRotation(this.worldAxis[1], -this.rotSpeed);
    this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
    this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
    var camera = this.camera;
    var dir = incr.mulPoint(camera.direction);
    var up = incr.mulPoint(camera.up);
    var right = incr.mulPoint(camera.right);
    this.camera.setAxes(dir, up, right);
};

L5.Application3.prototype.turnRight = function () {
    var incr = new L5.Matrix.makeRotation(this.worldAxis[1], this.rotSpeed);
    this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
    this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
    var camera = this.camera;
    var dVector = incr.mulPoint(camera.direction);
    var uVector = incr.mulPoint(camera.up);
    var rVector = incr.mulPoint(camera.right);
    this.camera.setAxes(dVector, uVector, rVector);
};


L5.Application3.prototype.lookUp = function () {
    var incr = new L5.Matrix.makeRotation(this.worldAxis[2], -this.rotSpeed);
    var camera = this.camera;
    var dVector = incr.mulPoint(camera.direction);
    var uVector = incr.mulPoint(camera.up);
    var rVector = incr.mulPoint(camera.right);
    this.camera.setAxes(dVector, uVector, rVector);
};
L5.Application3.prototype.lookDown = function () {
    var incr = new L5.Matrix.makeRotation(this.worldAxis[2], this.rotSpeed);
    var camera = this.camera;
    var dVector = incr.mulPoint(camera.direction);
    var uVector = incr.mulPoint(camera.up);
    var rVector = incr.mulPoint(camera.right);
    this.camera.setAxes(dVector, uVector, rVector);
};


L5.Application3.prototype.onInitialize = function () {
    if (!L5.Application.prototype.onInitialize.call(this)) {
        return false;
    }
    this.camera = new L5.Camera(true);
    this.renderer.camera = this.camera;
    this.motionObject = null;
    return true;
};

L5.Application3.prototype.onKeyDown = function (key, x, y) {
    if (L5.Application.prototype.onKeyDown.call(this, key, x, y)) {
        return true;
    }
    var cameraMoveable = this.cameraMoveable;

    switch (key) {
        case L5.Input.KB_1:  // Slower camera translation.
            if (cameraMoveable) {
                this.trnSpeed /= this.trnSpeedFactor;
            }
            return true;
        case L5.Input.KB_2:  // Faster camera translation.
            if (cameraMoveable) {
                this.trnSpeed *= this.trnSpeedFactor;
            }
            return true;
        case L5.Input.KB_3:  // Slower camera rotation.
            if (cameraMoveable) {
                this.rotSpeed /= this.rotSpeedFactor;
            }
            return true;
        case L5.Input.KB_4:  // Faster camera rotation.
            if (cameraMoveable) {
                this.rotSpeed *= this.rotSpeedFactor;
            }
            return true;
    }

    return false;
};

L5.Application3.prototype.onSpecialKeyDown = function (key, x, y) {
    if (this.cameraMoveable) {
        switch (key) {
            case L5.Input.KB_LEFT:
                return (this.LArrowPressed = true);
            case L5.Input.KB_RIGHT:
                return (this.RArrowPressed = true);
            case L5.Input.KB_UP:
                return (this.UArrowPressed = true);
            case L5.Input.KB_DOWN:
                return (this.DArrowPressed = true);
        }
    }

    if (this.motionObject) {
        if (key === L5.Input.KB_F1) {
            this.doRoll = -1;
            return true;
        }
        if (key === L5.Input.KB_F2) {
            this.doRoll = 1;
            return true;
        }
        if (key === L5.Input.KB_F3) {
            this.doYaw = -1;
            return true;
        }
        if (key === L5.Input.KB_F4) {
            this.doYaw = 1;
            return true;
        }
        if (key === L5.Input.KB_F5) {
            this.doPitch = -1;
            return true;
        }
        if (key === L5.Input.KB_F6) {
            this.doPitch = 1;
            return true;
        }
    }

    return false;
};

L5.Application3.prototype.onSpecialKeyUp = function (key, x, y) {
    if (this.cameraMoveable) {
        if (key === L5.Input.KB_LEFT) {
            this.LArrowPressed = false;
            return true;
        }
        if (key === L5.Input.KB_RIGHT) {
            this.RArrowPressed = false;
            return true;
        }
        if (key === L5.Input.KB_UP) {
            this.UArrowPressed = false;
            return true;
        }
        if (key === L5.Input.KB_DOWN) {
            this.DArrowPressed = false;
            return true;
        }
    }

    if (this.motionObject) {
        if (key === L5.Input.KB_F1) {
            this.doRoll = 0;
            return true;
        }
        if (key === L5.Input.KB_F2) {
            this.doRoll = 0;
            return true;
        }
        if (key === L5.Input.KB_F3) {
            this.doYaw = 0;
            return true;
        }
        if (key === L5.Input.KB_F4) {
            this.doYaw = 0;
            return true;
        }
        if (key === L5.Input.KB_F5) {
            this.doPitch = 0;
            return true;
        }
        if (key === L5.Input.KB_F6) {
            this.doPitch = 0;
            return true;
        }
    }

    return false;
};


L5.Application3.prototype.onMouseClick = function (button, state, x, y, modifiers) {
    var width = this.width;
    var height = this.height;
    if (!this.useTrackBall ||
        button !== L5.Input.MS_LEFT || !this.motionObject
    ) {
        return false;
    }

    var mult = 1 / (width >= height ? height : width);

    if (state === L5.Input.MS_RIGHT) {
        // Get the starting point.
        this.trackBallDown = true;
        this.saveRotate = this.motionObject.localTransform.getRotate();
        this.xTrack0 = (2 * x - width) * mult;
        this.yTrack0 = (2 * (height - 1 - y) - height) * mult;
    }
    else {
        this.trackBallDown = false;
    }

    return true;
};

L5.Application3.prototype.onMotion = function (button, x, y, modifiers) {
    if (
        !this.useTrackBall ||
        button !== L5.Input.MS_LEFT || !this.trackBallDown || !this.motionObject
    ) {
        return false;
    }
    var width = this.width;
    var height = this.height;

    // Get the ending point.
    var mult = 1 / (width >= height ? height : width);
    this.xTrack1 = (2 * x - width) * mult;
    this.yTrack1 = (2 * (height - 1 - y) - height) * mult;

    // Update the object's local rotation.
    this.rotateTrackBall(this.xTrack0, this.yTrack0, this.xTrack1, this.yTrack1);
    return true;
};

/**
 * 输入流处理 - InStream
 *
 * @param file {String} 文件名
 * @constructor
 *
 * @author lonphy
 * @version 1.0
 */
L5.InStream = function (file) {
    this.filePath = 'wmof/' + file;
    this.fileLength = 0;
    this.fileOffset = 0;
    this.source = null;
    this.onload = null;
    this.onerror = null;
    this.topLevel = [];
    this.linked = new Map();
    this.ordered = [];
};
L5.nameFix(L5.InStream, 'InStream');

Object.defineProperties(
    L5.InStream.prototype,
    {
        numObjects: {
            get: function () {

            }
        }

    }
);

L5.InStream.prototype.read = function () {
    var $this = this;
    return new Promise(function(resolve, reject){
        var file = new L5.XhrTask($this.filePath, 'arraybuffer');
        file.then(function (buffer) {
            $this.fileLength = buffer.byteLength;
            $this.source = new DataView(buffer);
            $this.parse();
            resolve($this);
        }).catch(function(e){
            reject(e);
        });
    });
};

// 检查文件版本
L5.InStream.prototype.checkVersion = function () {
    var length = L5.VERSION.length;
    if (this.fileLength < length) {
        delete this.source;
        return false;
    }

    var fileVersion = '';
    for (i = 0; i < length; ++i) {
        fileVersion += String.fromCharCode(this.source.getUint8(i));
    }
    if (fileVersion !== L5.VERSION) {
        delete this.source;
        return false;
    }

    this.fileOffset += length;
    return true;
};

L5.InStream.prototype.readString = function () {
    var length = this.source.getUint32(this.fileOffset, true);
    this.fileOffset += 4;
    if (length <= 0) {
        return '';
    }
    var padding = (length % 4);
    if (padding > 0) {
        padding = 4 - padding;
    }

    var str = '', i = this.fileOffset, len = this.fileOffset + length;
    for (; i < len; ++i) {
        str += String.fromCharCode(this.source.getUint8(i));
    }
    this.fileOffset += length + padding;
    return str;
};
/**
 * 读取字符串数组
 * @returns {Array<string>}
 */
L5.InStream.prototype.readStringArray = function(){
    var numElements = this.readUint32();
    if (numElements === undefined) {
        return [];
    }

    if (numElements > 0) {
        var ret = [], i, str;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readString();
            if (ret[i] === '') {
                return [];
            }
        }
        return ret;
    }
    return [];
};
/**
 * 读取字符串数组
 * @param numElements {number}
 * @returns {Array<string>}
 */
L5.InStream.prototype.readSizedStringArray = function(numElements){
    if (numElements > 0) {
        var ret = [], i, str;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readString();
            if (!ret[i]) {
                return [];
            }
        }
        return ret;
    }
    return [];
};

// 解析
L5.InStream.prototype.parse = function () {
    if (!this.checkVersion()) {
        return this.onerror && this.onerror('invalid File: ', this.filePath, ', can not parse.');
    }

    var topLevel = 'Top Level';
    while (this.fileOffset < this.fileLength) {
        var name = this.readString();
        var isTopLevel = (name == topLevel);
        if (isTopLevel) {
            // Read the RTTI name.
            name = this.readString();
        }
        // console.log('正在解析', name);

        var factory = L5.D3Object.find(name);
        if (!factory) {
            L5.assert(false, "Cannot find factory for " + name);
            return;
        }
        var obj = factory(this);
        if (isTopLevel) {
            this.topLevel.push(obj);
        }
    }
    var $this = this;
    this.ordered.forEach(function (obj) {
        obj.link($this);
    });


    this.ordered.forEach(function (obj) {
        obj.postLink($this);
    });

     this.linked.clear();
     this.ordered.length = 0;
     this.source = null;

};
L5.InStream.prototype.getObjectAt = function (i) {
    if (0 <= i && i < this.topLevel.length) {
        return this.topLevel[i];
    }
    return null;
};

/**
 * @param obj {L5.D3Object}
 */
L5.InStream.prototype.readUniqueID = function (obj) {
    var uniqueID = this.source.getUint32(this.fileOffset, true);
    this.fileOffset += 4;
    if (uniqueID) {
        this.linked.set(uniqueID, obj);
        this.ordered.push(obj);
    }
};
L5.InStream.prototype.readUint32 = function () {
    var limit = this.fileOffset + 4;
    if (limit <= this.fileLength) {
        var ret = this.source.getUint32(this.fileOffset, true);
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};
L5.InStream.prototype.readSizedInt32Array = function (numElements) {
    if (numElements <= 0) {
        return [];
    }
    var limit = this.fileOffset + 4*numElements;
    if (limit >= this.fileLength) {
        return [];
    }

    var ret = [], i;
    for(i=this.fileOffset; i<limit; i+=4) {
        ret[i] = this.source.getInt32(i, true);
    }
    this.fileOffset = limit;
    return ret;
};
L5.InStream.prototype.readFloat32Range = function (num) {
    var limit = this.fileOffset + 4 * num;
    if (limit <= this.fileLength) {
        var ret = [];
        for (var i = this.fileOffset; i < limit; i += 4) {
            ret.push(this.source.getFloat32(i, true));
        }
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};

L5.InStream.prototype.readFloat32 = function () {
    var limit = this.fileOffset + 4;
    if (limit <= this.fileLength) {
        var ret = this.source.getFloat32(this.fileOffset, true);
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};

L5.InStream.prototype.readFloat64 = function () {
    var limit = this.fileOffset + 8;
    if (limit <= this.fileLength) {
        var ret = this.source.getFloat64(this.fileOffset, true);
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};

L5.InStream.prototype.readEnum = function () {
    var value = this.readUint32();
    if (value === undefined) {
        return false;
    }
    return value;
};

L5.InStream.prototype.readSizedEnumArray = function (numElements) {
    if (numElements > 0) {
        var ret = [], i, e;
        for(i=0;i<numElements;++i) {
            ret[i] = this.readEnum();
            if (ret[i] === undefined) {
                return [];
            }
        }
        return ret;
    }
    return [];
};

L5.InStream.prototype.readBool = function () {
    var val = this.readUint32();
    if (val === undefined) {
        return false;
    }
    return val !== 0;
};

L5.InStream.prototype.readSizedPointerArray = function (numElements) {
    if (numElements > 0) {
        var ret = new Array(numElements), v;
        for (var i = 0; i < numElements; ++i) {
            v = this.readPointer();
            if (v === undefined) {
                return false;
            }
            ret[i] = v;
        }
        return ret;
    }
    return false;
};

L5.InStream.prototype.readPointerArray = function () {
    var numElements = this.readUint32();
    if (numElements === undefined) {
        return false;
    }

    if (numElements > 0) {
        var ret = new Array(numElements);
        for (var i = 0; i < numElements; ++i) {
            ret[i] = this.readPointer();
            if (ret[i] === undefined) {
                return false;
            }
        }
        return ret;
    }
    return false;
};

L5.InStream.prototype.readPointer = function () {
    return this.readUint32();
};
/**
 * 读取变换Transform
 * @returns {L5.Transform|boolean}
 */
L5.InStream.prototype.readAggregate = function () {
    var ret = new L5.Transform();
    var t = this.readMatrix();
    if (t === false) {
        return false;
    }
    ret.__matrix = t;

    t = this.readMatrix();
    if (t === false) {
        return false;
    }
    ret._invMatrix = t;

    t = this.readMatrix();
    if (t === false) {
        return false;
    }
    ret._matrix = t;

    t = this.readPoint();
    if (t === false) {
        return false;
    }
    ret._translate = t;

    t = this.readPoint();
    if (t === false) {
        return false;
    }
    ret._scale = t;

    ret._isIdentity = this.readBool();
    ret._isRSMatrix = this.readBool();
    ret._isUniformScale = this.readBool();
    ret._inverseNeedsUpdate = this.readBool();
    return ret;
};

L5.InStream.prototype.readArray = function (num) {
    return this.readFloat32Range(num);
};

L5.InStream.prototype.readSizedFFloatArray = function(numElements){
    if (numElements<=0) {
        return [];
    }
    var ret = [], i;
    for (i=0;i<numElements;++i) {
        ret[i] = this.readFloat32Range(4);
    }
    return ret;
};

/**
 * 获取浮点数数组
 * @returns {Array<number>}
 */
L5.InStream.prototype.readFloatArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readFloat32();
        }
        return ret;
    }
    return [];
};
L5.InStream.prototype.readTransformArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readAggregate();
        }
        return ret;
    }
    return [];
};

L5.InStream.prototype.readMatrix = function () {
    var d = this.readFloat32Range(16);
    if (d === undefined) {
        return false;
    }
    return L5.Matrix.fromArray(d);
};

L5.InStream.prototype.readPoint = function () {
    var d = this.readFloat32Range(4);
    if (d === undefined) {
        return false;
    }
    return new L5.Point(d[0], d[1], d[2], d[3]);
};
L5.InStream.prototype.readPointArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readPoint();
        }
        return ret;
    }
    return [];
};
L5.InStream.prototype.readSizedPointArray = function (size) {
    if (size > 0) {
        var ret = new Array(size);
        for (var i = 0; i < size; ++i) {
            ret[i] = this.readPoint();
        }
        return ret;
    }
    return [];
};
/**
 * 读取四元素
 * @returns {L5.Quaternion|boolean}
 */
L5.InStream.prototype.readQuaternion = function () {
    var d = this.readFloat32Range(4);
    if (d === undefined) {
        return false;
    }
    return new L5.Quaternion(d[0], d[1], d[2], d[3]);
};
/**
 * 读取四元素数组
 * @returns {Array<L5.Quaternion>}
 */
L5.InStream.prototype.readQuaternionArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readQuaternion();
        }
        return ret;
    }
    return [];
};
/**
 * 读取四元素数组
 * @param size {number} 数组大小
 * @returns {Array<L5.Quaternion>}
 */
L5.InStream.prototype.readSizedQuaternionArray = function (size) {
    if (size > 0) {
        var ret = new Array(size);
        for (var i = 0; i < size; ++i) {
            ret[i] = this.readQuaternion();
        }
        return ret;
    }
    return [];
};

L5.InStream.prototype.readBound = function () {
    var b = new L5.Bound();
    var t1 = this.readPoint();
    var t2 = this.readFloat32();
    if (t1 === false || t2 === undefined) {
        return false;
    }
    b.center = t1;
    b.radius = t2;
    return b;
};
/**
 * 读取2进制
 * @returns {ArrayBuffer}
 */
L5.InStream.prototype.readBinary = function () {
    var byteSize = this.readUint32();
    if (byteSize > 0) {
        var limit = this.fileOffset + byteSize;
        if (limit <= this.fileLength) {
            var ret = this.source.buffer.slice(this.fileOffset, limit);
            this.fileOffset = limit;
            return ret;
        }
    }
    return new ArrayBuffer(0);
};

L5.InStream.prototype.resolveLink = function (obj) {
    if (obj) {
        var t = this.linked.get(obj);
        if (t !== undefined) {
            return t;
        }
        else {
            L5.assert(false, "Unexpected link failure");
            return null;
        }
    }
};

L5.InStream.prototype.resolveArrayLink = function(numElements, objs) {
    var ret = [];
    for (var i = 0; i < numElements; ++i) {
        ret[i] = this.resolveLink(objs[i]);
    }
    return ret;
};

/**
 * 输出流处理 - OutStream
 * @constructor
 *
 * @author lonphy
 * @version 1.0
 */
L5.OutStream = function(){};
L5.nameFix(L5.OutStream, 'OutStream');

L5.OutStream.prototype.writeString = function(str){};
L5.OutStream.prototype.writeUniqueID = function(obj){};
L5.OutStream.prototype.writeBool = function(obj){};
L5.OutStream.prototype.writeEnum = function(obj){};
L5.OutStream.prototype.writeFloat32 = function(obj){};
L5.OutStream.prototype.writeUint32 = function(obj){};
L5.OutStream.prototype.writePointer = function(obj){};
L5.OutStream.prototype.writePointerArray = function(len, objs){};
L5.OutStream.prototype.writeBinary = function(obj){};
L5.OutStream.prototype.writeFloat32Array = function(num, objs){};

L5.Stream = function(){};
L5.nameFix(L5.Stream, 'Stream');


L5.Stream.prototype.getStreamingSize = function(){

};

/**
 * BlendTransformController
 *
 * Set 'rsMatrices' to 'true' when theinput controllers manage
 * transformations of the form Y = R*S*X + T, where R is a rotation, S is
 * a diagonal scale matrix of positive scales, and T is a translation;
 * that is, each transform has mIsRSMatrix equal to 'true'.  In this case,
 * the rotation and scale blending is either geometric or arithmetic, as
 * specified in the other constructor inputs.  Translation blending is
 * always arithmetic.  Let {R0,S0,T0} and {R1,S1,T1} be the transformation
 * channels, and let weight w be in [0,1].  Let {R,S,T} be the blended
 * result.  Let q0, q1, and q be quaternions corresponding to R0, R1, and
 * R with Dot(q0,q1) >= 0 and A = angle(q0,q1) = acos(Dot(q0,q1)).
 *     Translation:  T = (1-w)*T0 + w*T1
 *
 * Arithmetic rotation:  q = Normalize((1-w)*q0 + w*q1)
 * Geometric rotation:
 *     q = Slerp(w,q0,q1)
 *       = (sin((1-w)*A)*q0 + sin(w*A)*q1)/sin(A)
 * Arithmetic scale:  s = (1-w)*s0 + w*s1 for each channel s0, s1, s
 * Geometric scale:  s = sign(s0)*sign(s1)*pow(|s0|,1-w)*pow(|s1|,w)
 *     If either of s0 or s1 is zero, then s is zero.
 *
 * Set 'rsMatrices' to 'false' when mIsRMatrix is 'false' for either
 * transformation.  In this case, a weighted average of the full
 * transforms is computed.  This is not recommended, because the visual
 * results are difficult to predict.
 *
 * @param controller0 {L5.TransformController}
 * @param controller1 {L5.TransformController}
 * @param rsMatrices {boolean}
 * @param geometricRotation {boolean} default false
 * @param geometricScale {boolean} default false
 * @class
 *
 * @extends {L5.TransformController}
 *
 * @author lonphy
 * @version 1.0
 */
L5.BlendTransformController = function(
    controller0, controller1, rsMatrices, geometricRotation, geometricScale
){};
L5.nameFix(L5.BlendTransformController, 'BlendTransformController');
L5.extendFix(L5.BlendTransformController, L5.TransformController);

L5.BlendTransformController.prototype.getController0 = function(){};
L5.BlendTransformController.prototype.getController1 = function(){};
L5.BlendTransformController.prototype.getRSMatrices = function(){};
L5.BlendTransformController.prototype.setWeight = function(weight){};
L5.BlendTransformController.prototype.getWeight = function(){};
L5.BlendTransformController.prototype.update = function(applicationTime){};
/**
 *
 * @param obj {L5.ControlledObject}
 */
L5.BlendTransformController.prototype.setObject = function(obj){};




/**
 * Created by lonphy on 15/10/8.
 */


/**
 * Created by lonphy on 15/10/8.
 */


/**
 * Created by lonphy on 15/10/8.
 */


/**
 * 关键帧控制器
 *
 * @param numCommonTimes {number}
 * @param numTranslations {number}
 * @param numRotations {number}
 * @param numScales {number}
 * @param localTransform {L5.Transform}
 *
 * @constructor
 * @extends {L5.TransformController}
 *
 * @version 1.0
 * @author lonphy
 */
L5.KeyframeController = function (numCommonTimes,
                                  numTranslations,
                                  numRotations,
                                  numScales,
                                  localTransform) {
    L5.TransformController.call(this, localTransform);

    if (numCommonTimes > 0) {
        this.numCommonTimes = numCommonTimes;
        this.commonTimes = new Array(numCommonTimes);

        if (numTranslations > 0) {
            this.numTranslations = numTranslations;
            this.translationTimes = this.commonTimes;
            this.translations = new Array(numTranslations);
        }
        else {
            this.numTranslations = 0;
            this.translationTimes = null;
            this.translations = null;
        }

        if (numRotations > 0) {
            this.numRotations = numRotations;
            this.rotationTimes = this.commonTimes;
            this.rotations = new Array(numRotations);
        }
        else {
            this.numRotations = 0;
            this.rotationTimes = null;
            this.rotations = null;
        }

        if (numScales > 0) {
            this.numScales = numScales;
            this.scaleTimes = this.commonTimes;
            this.scales = new Array(numScales);
        }
        else {
            mNumScales = 0;
            mScaleTimes = null;
            mScales = null;
        }
    }
    else {
        this.numCommonTimes = 0;
        this.commonTimes = null;

        if (numTranslations > 0) {
            this.numTranslations = numTranslations;
            this.translationTimes = new Array(numTranslations);
            this.translations = new Array(numTranslations);
        }
        else {
            this.numTranslations = 0;
            this.translationTimes = null;
            this.translations = null;
        }

        if (numRotations > 0) {
            this.numRotations = numRotations;
            this.rotationTimes = new Array(numRotations);
            this.rotations = new Array(numRotations);
        }
        else {
            this.numRotations = 0;
            this.rotationTimes = null;
            this.rotations = null;
        }

        if (numScales > 0) {
            this.numScales = numScales;
            this.scaleTimes = new Array(numScales);
            this.scales = new Array(numScales);
        }
        else {
            this.numScales = 0;
            this.scaleTimes = null;
            this.scales = null;
        }
    }

    this.tLastIndex = 0;
    this.rLastIndex = 0;
    this.sLastIndex = 0;
    this.cLastIndex = 0;

};

L5.nameFix(L5.KeyframeController, 'KeyframeController');
L5.extendFix(L5.KeyframeController, L5.TransformController);

L5.KeyframeController.prototype.getNumCommonTimes = function () {
    return this.numCommonTimes;
};
L5.KeyframeController.prototype.getCommonTimes = function () {
    return this.commonTimes;
};

L5.KeyframeController.prototype.getNumTranslations = function () {
    return this.numTranslations;
};
L5.KeyframeController.prototype.getTranslationTimes = function () {
    return this.translationTimes;
};
L5.KeyframeController.prototype.getTranslations = function () {
    return this.translations;
};

L5.KeyframeController.prototype.getNumRotations = function () {
    return this.numRotations;
};
L5.KeyframeController.prototype.getRotationTimes = function () {
    return this.rotationTimes;
};
L5.KeyframeController.prototype.getRotations = function () {
    return this.rotations;
};

L5.KeyframeController.prototype.getNumScales = function () {
    return this.numScales;
};
L5.KeyframeController.prototype.getScaleTimes = function () {
    return this.scaleTimes;
};
L5.KeyframeController.prototype.getScales = function () {
    return this.scales;
};

/**
 * 动画更新
 * @param applicationTime {number}
 */
L5.KeyframeController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    var ctrlTime = this.getControlTime(applicationTime);
    var trn = new L5.Point();
    var rot = new L5.Matrix();
    var scale = 0;
    var t;

    // The logic here checks for equal-time arrays to minimize the number of
    // times GetKeyInfo is called.
    if (this.numCommonTimes > 0) {
        t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numCommonTimes, this.commonTimes, this.cLastIndex);
        this.cLastIndex = t[0];
        var normTime = t[1], i0 = t[2], i1 = t[3];
        t = null;

        if (this.numTranslations > 0) {
            trn = this.getTranslate(normTime, i0, i1);
            this.localTransform.setTranslate(trn);
        }

        if (this.numRotations > 0) {
            rot = this.getRotate(normTime, i0, i1);
            this.localTransform.setRotate(rot);
        }

        if (this.numScales > 0) {
            scale = this.getScale(normTime, i0, i1);
            this.localTransform.setUniformScale(scale);
        }
    }
    else {
        if (this.numTranslations > 0) {
            t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numTranslations, this.translationTimes, this.tLastIndex);
            this.tLastIndex = t[0];
            trn = this.getTranslate(t[1], t[2], t[3]);
            this.localTransform.setTranslate(trn);
        }

        if (this.numRotations > 0) {
            t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numRotations, this.rotationTimes, this.rLastIndex);
            this.rLastIndex = t[0];
            rot = this.getRotate(t[1], t[2], t[3]);
            this.localTransform.setRotate(rot);
        }

        if (this.numScales > 0) {
            t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numScales, this.scaleTimes, this.sLastIndex);
            this.sLastIndex = t[0];
            scale = this.getScale(t[1], t[2], t[3]);
            this.localTransform.setUniformScale(scale);
        }
    }

    this.object.localTransform = this.localTransform;
    return true;
};


// Support for looking up keyframes given the specified time.
L5.KeyframeController.getKeyInfo = function (ctrlTime, numTimes, times, lIndex) {
    if (ctrlTime <= times[0]) {
        return [0, 0, 0, 0];
    }

    if (ctrlTime >= times[numTimes - 1]) {
        var l = numTimes - 1;
        return [0, l, l, l];
    }

    var nextIndex;
    if (ctrlTime > times[lIndex]) {
        nextIndex = lIndex + 1;
        while (ctrlTime >= times[nextIndex]) {
            lIndex = nextIndex;
            ++nextIndex;
        }

        return [
            lIndex,
            (ctrlTime - times[lIndex]) / (times[nextIndex] - times[lIndex]),
            lIndex,
            nextIndex
        ];
    }
    else if (ctrlTime < times[lIndex]) {
        nextIndex = lIndex - 1;
        while (ctrlTime <= times[nextIndex]) {
            lIndex = nextIndex;
            --nextIndex;
        }
        return [
            lIndex,
            (ctrlTime - times[nextIndex]) / (times[lIndex] - times[nextIndex]),
            nextIndex,
            lIndex
        ];
    }

    return [lIndex, 0, lIndex, lIndex];
};
/**
 *
 * @param normTime
 * @param i0
 * @param i1
 * @returns {L5.Point}
 */
L5.KeyframeController.prototype.getTranslate = function (normTime, i0, i1) {
    var t0 = this.translations[i0];
    var t1 = this.translations[i1];
    return t0.add(t1.sub(t0).scalar(normTime));
};
/**
 *
 * @param normTime
 * @param i0
 * @param i1
 * @returns {L5.Matrix}
 */
L5.KeyframeController.prototype.getRotate = function (normTime, i0, i1) {
    var q = new L5.Quaternion();
    q.slerp(normTime, this.rotations[i0], this.rotations[i1]);
    return q.toRotateMatrix();
};
/**
 *
 * @param normTime
 * @param i0
 * @param i1
 * @returns {number}
 */
L5.KeyframeController.prototype.getScale = function (normTime, i0, i1) {
    return this.scales[i0] + normTime * (this.scales[i1] - this.scales[i0]);
};

/**
 * @param inStream {L5.InStream}
 */
L5.KeyframeController.prototype.load = function (inStream) {

    L5.TransformController.prototype.load.call(this, inStream);
    this.numCommonTimes = inStream.readUint32();
    if (this.numCommonTimes > 0) {
        this.commonTimes = inStream.readArray(this.numCommonTimes);

        this.translations = inStream.readPointArray();
        this.numTranslations = this.translations.length;

        this.rotations = inStream.readQuaternionArray();
        this.numRotations = this.rotations.length;

        this.scales = inStream.readFloatArray();
        this.numScales = this.scales.length;
    }
    else {
        this.translationTimes = inStream.readFloatArray();
        this.numTranslations = this.translationTimes.length;
        this.translations = inStream.readSizedPointArray(this.numTranslations);

        this.rotationTimes = inStream.readFloatArray();
        this.numRotations = this.rotationTimes.length;
        this.rotations = inStream.readSizedQuaternionArray(this.numRotations);

        this.scaleTimes = inStream.readFloatArray();
        this.numScales = this.scaleTimes.length;
        this.scales = inStream.readArray(this.numScales);
    }
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.KeyframeController}
 */
L5.KeyframeController.factory = function (inStream) {
    var obj = new L5.KeyframeController(0,0,0,0, 0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.KeyframeController', L5.KeyframeController.factory);

/**
 * Created by lonphy on 15/10/8.
 */


/**
 * Created by lonphy on 15/10/8.
 */


/**
 * 点控制器
 *
 * @class
 * @extends {L5.Controller}
 */
L5.PointController = function () {
    L5.Controller.call(this);
    this.systemLinearSpeed = 0.0;
    this.systemAngularSpeed = 0.0;
    this.systemLinearAxis = L5.Vector.UNIT_Z;
    this.systemAngularAxis = L5.Vector.UNIT_Z;

    this.numPoints = 0;
    this.pointLinearSpeed = 0.0;
    this.pointAngularSpeed = 0.0;
    this.pointLinearAxis = L5.Vector.UNIT_Z;
    this.pointAngularAxis = L5.Vector.UNIT_Z;
};
L5.nameFix(L5.PointController, 'PointController');
L5.extendFix(L5.PointController, L5.Controller);

L5.PointController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    var ctrlTime = this.getControlTime(applicationTime);

    this.updateSystemMotion(ctrlTime);
    this.updatePointMotion(ctrlTime);
    return true;
};

//----------------------------------------------------------------------------
L5.PointController.prototype.reallocate = function (numPoints) {
    delete this.pointLinearSpeed;
    delete this.pointAngularSpeed;
    delete this.pointLinearAxis;
    delete this.pointAngularAxis;

    this.numPoints = numPoints;
    if (numPoints > 0) {
        this.pointLinearSpeed = new Array(numPoints);
        this.pointAngularSpeed = new Array(numPoints);
        this.pointLinearAxis = new Array(numPoints);
        this.pointAngularAxis = new Array(numPoints);
        for (var i = 0; i < numPoints; ++i) {
            this.pointLinearSpeed[i] = 0.0;
            this.pointAngularSpeed[i] = 0.0;
            this.pointLinearAxis[i] = L5.Vector.UNIT_Z;
            this.pointAngularAxis[i] = L5.Vector.UNIT_Z;
        }
    }
};

/**
 *
 * @ctldObj {L5.ControlledObject}
 */
L5.PointController.prototype.setObject = function (ctldObj) {

    this.object = ctldObj;

    if (object) {
        L5.assert(!(ctldObj instanceof L5.PolyPoint), 'Invalid class');
        this.reallocate(ctldObj.vertexBuffer.numElements);
    }
    else {
        this.reallocate(0);
    }
};

//----------------------------------------------------------------------------
L5.PointController.prototype.updateSystemMotion = function (ctrlTime) {
    var points = this.object;

    var distance = ctrlTime * this.systemLinearSpeed;
    var deltaTrn = this.systemLinearAxis.scalar(distance);
    points.localTransform.setTranslate(
        points.localTransform.getTranslate().add(deltaTrn)
    );

    var angle = ctrlTime * this.systemAngularSpeed;
    var deltaRot = L5.Matrix.makeRotation(this.systemAngularAxis, angle);

    points.localTransform.setRotate(deltaRot.mul(points.localTransform.getRotate()));
};

//----------------------------------------------------------------------------
L5.PointController.prototype.updatePointMotion = function (ctrlTime) {

    var points = this.object;

    var vba = L5.VertexBufferAccessor.fromVisual(points);

    const numPoints = points.numPoints;
    var i, distance, pos, deltaTrn;
    for (i = 0; i < numPoints; ++i) {
        distance = ctrlTime * this.pointLinearSpeed[i];
        deltaTrn = this.pointLinearAxis[i].scalar(distance);

        pos = vba.getPosition(i);
        pos[0] += deltaTrn.x;
        pos[1] += deltaTrn.y;
        pos[2] += deltaTrn.z;
    }

    var angle, normal, deltaRot;
    if (vba.hasNormal()) {
        for (i = 0; i < numPoints; ++i) {
            angle = ctrlTime * this.pointAngularSpeed[i];
            normal = vba.getNormal(i);
            normal.normalize();
            deltaRot = L5.Matrix.makeRotation(this.pointAngularAxis[i], angle);
            vba.setNormal(i, deltaRot.mulPoint(normal));
        }
    }

    L5.Renderer.updateAll(points.vertexBuffer);
};

/**
 *
 * @param numVertices {number}
 * @param numBones {number}
 * @constructor
 */

L5.SkinController = function(numVertices, numBones){
    numVertices = numVertices || 0;
    numBones = numBones || 0;

    this.numVertices = numVertices; // int
    this.numBones = numBones; // int

    this._init();
};
L5.nameFix(L5.SkinController, 'SkinController');
L5.extendFix(L5.SkinController, L5.Controller);

L5.SkinController.prototype._init = function(){
    var numBones = this.numBones;
    var numVertices = this.numVertices;
    if (numBones===0 || numVertices===0) {
        return;
    }
    /**
     * @type {Array<L5.Node>}
     */
    this.bones = new Array(numBones);
    /**
     * @type {Array< Array<number> >}
     */
    this.weights = new Array(numVertices);
    /**
     * @type {Array< Array<Point> >}
     */
    this.offsets = new Array(numVertices);

    for(var i= 0;i<numVertices;++i) {
        this.weights[i] = new Array(numBones);
        this.offsets[i] = new Array(numBones);
    }
};

L5.SkinController.prototype.getNumVertices = function(){
    return this.numVertices;
};
L5.SkinController.prototype.getNumBones = function(){
    return this.numBones;
};
L5.SkinController.prototype.getBones = function(){
    return this.bones;
};
L5.SkinController.prototype.getWeights = function(){
    return this.weights;
};
L5.SkinController.prototype.getOffsets = function(){
    return this.offsets;
};

L5.SkinController.prototype.update = function(applicationTime){
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    var visual = this.object;
    L5.assert(
        this.numVertices === visual.vertexBuffer.numElements,
        "Controller must have the same number of vertices as the buffer"
    );
    var vba = L5.VertexBufferAccessor.fromVisual(visual);

    // The skin vertices are calculated in the bone world coordinate system,
    // so the visual's world transform must be the identity.
    visual.worldTransform = L5.Transform.IDENTITY;
    visual.worldTransformIsCurrent = true;

    // Compute the skin vertex locations.
    var nv = this.numVertices,nb = this.numBones, vertex, bone, weight, offset, worldOffset;
    for (vertex = 0; vertex < nv; ++vertex) {
        var position = L5.Point.ORIGIN;

        for (bone = 0; bone < nb; ++bone) {
            weight = this.weights[vertex][bone];
            if (weight !== 0.0) {
                offset = this.offsets[vertex][bone];
                worldOffset = this.bones[bone].worldTransform.mulPoint(offset);
                position = position.add(worldOffset.scalar(weight));
            }
        }
        vba.setPosition(vertex, [position.x, position.y, position.z]);
    }

    visual.updateModelSpace(L5.Visual.GU_NORMALS);
    L5.Renderer.updateAll(visual.vertexBuffer());
    return true;
};


/**
 * @param inStream {L5.InStream}
 */
L5.SkinController.prototype.load = function (inStream) {

    L5.Controller.prototype.load.call(this, inStream);
    var numVertices = inStream.readUint32();
    var numBones = inStream.readUint32();

    this.numVertices = numVertices;
    this.numBones = numBones;
    this._init();
    var total = this.numVertices * this.numBones, i;
    var t = inStream.readArray(total);
    var t1 = inStream.readSizedPointArray(total);
    for(i= 0;i<numVertices;++i) {
        this.weights[i] = t.slice(i*numBones, (i+1)*numBones);
        this.offsets[i] = t1.slice(i*numBones, (i+1)*numBones);
    }
    this.bones = inStream.readSizedPointerArray(numBones);

};

L5.SkinController.prototype.link = function (inStream) {
    L5.Controller.prototype.link.call(this, inStream);
    inStream.resolveArrayLink(this.numBones, this.bones);
};


/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.SkinController}
 */
L5.SkinController.factory = function (inStream) {
    var obj = new L5.SkinController(0,0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.SkinController', L5.SkinController.factory);

/**
 * Bound
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Bound = function () {
    this.center = L5.Point.ORIGIN;
    this.radius = 0;
};

L5.nameFix(L5.Bound, 'Bound');

/**
 * 复制
 * @param bound {L5.Bound}
 * @returns {L5.Bound}
 */
L5.Bound.prototype.copy = function (bound) {
    this.center.copy(bound.center);
    this.radius = bound.radius;
    return this;
};

/**
 * @param plane {L5.Plane}
 * @returns {number}
 */
L5.Bound.prototype.whichSide = function (plane) {
    var signedDistance = plane.distanceTo(this.center);

    if (signedDistance <= -this.radius) {
        return -1;
    }

    if (signedDistance >= this.radius) {
        return +1;
    }

    return 0;
};
/**
 * @param bound {L5.Bound}
 */
L5.Bound.prototype.growToContain = function (bound) {
    if (bound.radius === 0) {
        // The incoming bound is invalid and cannot affect growth.
        return;
    }

    if (this.radius === 0) {
        // The current bound is invalid, so just assign the incoming bound.
        this.copy(bound);
        return;
    }

    var centerDiff = bound.center.subP(this.center);
    var lengthSqr = centerDiff.squaredLength();
    var radiusDiff = bound.radius - this.radius;
    var radiusDiffSqr = radiusDiff * radiusDiff;

    if (radiusDiffSqr >= lengthSqr) {
        if (radiusDiff >= 0) {
            this.center = bound.center;
            this.radius = bound.radius;
        }
        return;
    }

    var length = L5.Math.sqrt(lengthSqr);
    if (length > L5.Math.ZERO_TOLERANCE) {
        var coeff = (length + radiusDiff) / (2 * length);
        this.center = this.center.add(centerDiff.scalar(coeff));
    }
    this.radius = 0.5 * (length + this.radius + bound.radius);
};

/**
 * @param transform {L5.Transform}
 * @param bound {L5.Bound}
 */
L5.Bound.prototype.transformBy = function (transform, bound) {
    bound.center = transform.mulPoint(this.center);
    bound.radius = transform.getNorm() * this.radius;
};

/**
 *
 * @param numElements {number}
 * @param stride {number}
 * @param data {ArrayBuffer}
 */
L5.Bound.prototype.computeFromData = function (numElements, stride, data) {
    // The center is the average of the positions.
    var sum = [0, 0, 0];
    var i, position;
    for (i = 0; i < numElements; ++i) {
        // This assumes the positions are at offset zero, which they should be
        // for vertex buffer data.
        position = new Float32Array(data, i * stride, 3);
        sum[0] += position[0];
        sum[1] += position[1];
        sum[2] += position[2];
    }
    var invNumElements = 1 / numElements;
    this.center.x = sum[0] * invNumElements;
    this.center.y = sum[1] * invNumElements;
    this.center.z = sum[2] * invNumElements;
    this.center.w = 1;

    // The radius is the largest distance from the center to the positions.
    this.radius = 0;
    for (i = 0; i < numElements; ++i) {
        // This assumes the positions are at offset zero, which they should be
        // for vertex buffer data.
        position = new Float32Array(data, i * stride, 3);
        var diff = [
            position[0] - this.center.x,
            position[1] - this.center.y,
            position[2] - this.center.z
        ];
        var radiusSqr = diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2];
        if (radiusSqr > this.radius) {
            this.radius = radiusSqr;
        }
    }

    this.radius = L5.Math.sqrt(this.radius);
};

// Test for intersection of linear component and bound (points of
// intersection not computed).  The linear component is parameterized by
// P + t*D, where P is a point on the component (the origin) and D is a
// unit-length direction vector.  The interval [tmin,tmax] is
//   line:     tmin = -Mathf::MAX_REAL, tmax = Mathf::MAX_REAL
//   ray:      tmin = 0.0f, tmax = Mathf::MAX_REAL
//   segment:  tmin >= 0.0f, tmax > tmin
/**
 * @param origin {L5.Point}
 * @param direction {L5.Vector}
 * @param tmin {number}
 * @param tmax {number}
 * @returns {boolean}
 */
L5.Bound.prototype.testIntersection = function (origin, direction, tmin, tmax) {
    if (this.radius === 0) {
        // The bound is invalid and cannot be intersected.
        return false;
    }

    var diff;
    var a0, a1, discr;

    if (tmin === -L5.Math.MAX_REAL) {
        L5.assert(tmax === L5.Math.MAX_REAL, 'tmax must be infinity for a line.');

        // Test for sphere-line intersection.
        diff = origin.sub(this.center);
        a0 = diff.dot(diff) - this.radius * this.radius;
        a1 = direction.dot(diff);
        discr = a1 * a1 - a0;
        return discr >= 0;
    }

    if (tmax === L5.Math.MAX_REAL) {
        L5.assert(tmin === 0, 'tmin must be zero for a ray.');

        // Test for sphere-ray intersection.
        diff = origin.sub(this.center);
        a0 = diff.dot(diff) - this.radius * this.radius;
        if (a0 <= 0) {
            // The ray origin is inside the sphere.
            return true;
        }
        // else: The ray origin is outside the sphere.

        a1 = direction.dot(diff);
        if (a1 >= 0) {
            // The ray forms an acute angle with diff, and so the ray is
            // directed from the sphere.  Thus, the ray origin is outside
            // the sphere, and points P+t*D for t >= 0 are even farther
            // away from the sphere.
            return false;
        }

        discr = a1 * a1 - a0;
        return discr >= 0;
    }

    L5.assert(tmax > tmin, 'tmin < tmax is required for a segment.');

    // Test for sphere-segment intersection.
    var segExtent = 0.5 * (tmin + tmax);
    var segOrigin = origin.add(segExtent * direction);

    diff = segOrigin.sub(this.center);
    a0 = diff.dot(diff) - this.radius * this.radius;
    a1 = direction.dot(diff);
    discr = a1 * a1 - a0;
    if (discr < 0) {
        return false;
    }

    var tmp0 = segExtent * segExtent + a0;
    var tmp1 = 2 * a1 * segExtent;
    var qm = tmp0 - tmp1;
    var qp = tmp0 + tmp1;
    if (qm * qp <= 0) {
        return true;
    }

    return qm > 0 && L5.Math.abs(a1) < segExtent;


};


/**
 * Test for intersection of the two stationary bounds.
 * @param bound {L5.Bound}
 * @returns {boolean}
 */
L5.Bound.prototype.testIntersection1 = function (bound) {
    if (bound.radius === 0 || this.radius === 0) {
        // One of the bounds is invalid and cannot be intersected.
        return false;
    }

    // Test for staticSphere-staticSphere intersection.
    var diff = this.center - bound.center;
    var rSum = this.radius + bound.radius;
    return diff.squaredLength() <= rSum * rSum;
};

/**
 * Test for intersection of the two moving bounds.  Velocity0 is that of
 * the calling Bound and velocity1 is that of the input bound.
 * @param bound {L5.Bound}
 * @param tmax {number}
 * @param velocity0 {L5.Vector}
 * @param velocity1 {L5.Vector}
 * @returns {boolean}
 */
L5.Bound.prototype.testIntersection2 = function (bound, tmax, velocity0, velocity1) {
    if (bound.radius === 0 || this.radius === 0) {
        // One of the bounds is invalid and cannot be intersected.
        return false;
    }

    // Test for movingSphere-movingSphere intersection.
    var relVelocity = velocity1.sub(velocity0);
    var cenDiff = bound.center - (this.center);
    var a = relVelocity.squaredLength();
    var c = cenDiff.squaredLength();
    var rSum = bound.radius + this.radius;
    var rSumSqr = rSum * rSum;

    if (a > 0) {
        var b = cenDiff.dot(relVelocity);
        if (b <= 0) {
            if (-tmax * a <= b) {
                return a * c - b * b <= a * rSumSqr;
            }
            else {
                return tmax * (tmax * a + 2 * b) + c <= rSumSqr;
            }
        }
    }

    return c <= rSumSqr;
};


/**
 * Transform
 *
 * 变换用公式 Y= M*X+T 表示:
 *    M - 3*3矩阵, 大部分情况下为旋转矩阵,
 *        或者 M = R*S:
 *        R = 旋转矩阵, S = 正缩放对角矩阵
 *        为支持模型包,允许普通仿射变换, M可以是任意可逆3*3矩阵
 *
 *    T - 平移向量
 *
 *    X - 前方向为Y轴的向量
 *        从Y翻转至X, 一般情况下记做: X = M^{-1}*(Y-T)
 *
 * 在 M = R*S 的特殊情况下, X = S^{-1}*R^t*(Y-T),
 *    S^{-1}   -  S的逆
 *    R^t      -  R的转置矩阵
 *
 * 构造默认是个单位变换
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Transform = function () {
    // The full 4x4 homogeneous matrix H = {{M,T},{0,1}} and its inverse
    // H^{-1} = {M^{-1},-M^{-1}*T},{0,1}}.  The inverse is computed only
    // on demand.

    // 变换矩阵
    this.__matrix = L5.Matrix.IDENTITY;
    // 变换矩阵的逆矩阵
    this._invMatrix = L5.Matrix.IDENTITY;

    this._matrix = L5.Matrix.IDENTITY;     // M (general) or R (rotation)


    this._scale = new L5.Point(1, 1, 1);        // S
    this._translate = new L5.Point(0, 0, 0);    // T

    this._isIdentity = true;
    this._isRSMatrix = true;
    this._isUniformScale = true;
    this._inverseNeedsUpdate = false;
};
L5.nameFix(L5.Transform, 'Transform');

/**
 * 置单位变换
 */
L5.Transform.prototype.makeIdentity = function () {
    this._matrix = L5.Matrix.IDENTITY;
    this._translate.assign(0);
    this._scale.assign(1);
    this._isIdentity = true;
    this._isRSMatrix = true;
    this._isUniformScale = true;
    this._updateMatrix();
    return this;
};
/**
 * 缩放置1
 */
L5.Transform.prototype.makeUnitScale = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    this._scale.assign(1);
    this._isUniformScale = true;
    this._updateMatrix();
    return this;
};

/**
 * I
 * @returns {boolean}
 */
L5.Transform.prototype.isIdentity = function () {
    return this._isIdentity;
};
/**
 * R*S
 * @returns {boolean}
 */
L5.Transform.prototype.isRSMatrix = function () {
    return this._isRSMatrix;
};
/**
 * R*S, S = c*I
 * @returns {boolean}
 */
L5.Transform.prototype.isUniformScale = function () {
    return this._isRSMatrix && this._isUniformScale;
};


// Member access.
// (1) The Set* functions set the is-identity hint to false.
// (2) The SetRotate function sets the is-rsmatrix hint to true.  If this
//     hint is false,  GetRotate fires an "assert" in debug mode.
// (3) The SetMatrix function sets the is-rsmatrix and is-uniform-scale
//     hints to false.
// (4) The SetScale function sets the is-uniform-scale hint to false.
//     The SetUniformScale function sets the is-uniform-scale hint to
//     true.  If this hint is false, GetUniformScale fires an "assert" in
//     debug mode.
// (5) All Set* functions set the inverse-needs-update to true.  When
//     GetInverse is called, the inverse must be computed in this case and
//     the inverse-needs-update is reset to false.
/**
 * @param rotate {L5.Matrix}
 */
L5.Transform.prototype.setRotate = function (rotate) {
    this._matrix = rotate;
    this._isIdentity = false;
    this._isRSMatrix = true;
    this._updateMatrix();
    return this;
};
/**
 * @param matrix {L5.Matrix}
 */
L5.Transform.prototype.setMatrix = function (matrix) {
    this._matrix = matrix;
    this._isIdentity = false;
    this._isRSMatrix = false;
    this._isUniformScale = false;
    this._updateMatrix();
    return this;
};

/**
 * @param translate {L5.Point}
 */
L5.Transform.prototype.setTranslate = function (translate) {
    this._translate = translate;
    this._isIdentity = false;
    this._updateMatrix();
    return this;
};
/**
 * @param scale {L5.Point}
 */
L5.Transform.prototype.setScale = function (scale) {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    L5.assert(!this._scale.equals(L5.Point.ORIGIN), 'Scales must be nonzero');
    this._scale.copy(scale);
    this._isIdentity = false;
    this._isUniformScale = false;
    this._updateMatrix();
    return this;
};
/**
 * @param scale {number}
 */
L5.Transform.prototype.setUniformScale = function (scale) {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    L5.assert(scale !== 0, 'Scale must be nonzero');

    this._scale.assign(scale);
    this._isIdentity = false;
    this._isUniformScale = true;
    this._updateMatrix();
    return this;
};
/**
 * @returns {L5.Matrix}
 */
L5.Transform.prototype.getRotate = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    return this._matrix;
};
/**
 * @returns {L5.Matrix}
 */
L5.Transform.prototype.getMatrix = function () {
    return this._matrix;
};
/**
 * @returns {L5.Point}
 */
L5.Transform.prototype.getTranslate = function () {
    return this._translate;
};
/**
 * @returns {L5.Point}
 */
L5.Transform.prototype.getScale = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
    return this._scale;
};
/**
 * @returns {number}
 */
L5.Transform.prototype.getUniformScale = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
    L5.assert(this._isUniformScale, 'Matrix is not uniform scale');
    return this._scale[0];
};

// For M = R*S, the largest value of S in absolute value is returned.
// For general M, the max-row-sum norm is returned, which is a reasonable
// measure of maximum scale of the transformation.
/**
 *
 * @returns {number}
 */
L5.Transform.prototype.getNorm = function () {
    const abs = L5.Math.abs;
    if (this._isRSMatrix) {
        var maxValue = abs(this._scale[0]);
        if (abs(this._scale[1]) > maxValue) {
            maxValue = abs(this._scale[1]);
        }
        if (abs(this._scale[2]) > maxValue) {
            maxValue = abs(this._scale[2]);
        }
        return maxValue;
    }

    // A general matrix.  Use the max-row-sum matrix norm.  The spectral
    // norm (the maximum absolute value of the eigenvalues) is smaller or
    // equal to this norm.  Therefore, this function returns an approximation
    // to the maximum scale.
    var m = this._matrix;
    var maxRowSum = abs(m.item(0, 0)) + abs(m.item(0, 1)) + abs(m.item(0, 2));
    var rowSum = abs(m.item(1, 0)) + abs(m.item(1, 1)) + abs(m.item(1, 2));

    if (rowSum > maxRowSum) {
        maxRowSum = rowSum;
    }
    rowSum = abs(m.item(2, 0)) + abs(m.item(2, 1)) + abs(m.item(2, 2));
    if (rowSum > maxRowSum) {
        maxRowSum = rowSum;
    }

    return maxRowSum;
};

/**
 * @param p {L5.Point|L5.Vector}
 * Matrix-point/vector 乘法, M*p.
 */
L5.Transform.prototype.mulPoint = function (p) {
    return this.__matrix.mulPoint(p);
};

/**
 * Matrix-matrix multiplication.
 * @param transform {L5.Transform}
 * @returns {L5.Transform}
 */
L5.Transform.prototype.mul = function (transform) {
    if (this._isIdentity) {
        return transform;
    }

    if (transform.isIdentity()) {
        return this;
    }
    const IsRS = this._isRSMatrix;
    var product = new L5.Transform();

    if (IsRS && transform.isRSMatrix()) {
        if (this._isUniformScale) {
            var scale0 = this._scale[0];
            product.setRotate(this._matrix.mul(transform.getMatrix()));

            product.setTranslate(
                this._matrix.mulPoint(transform.getTranslate())
                    .scalar(scale0)
                    .add(this._translate)
            );

            if (transform.isUniformScale()) {
                product.setUniformScale(scale0 * transform.getUniformScale());
            } else {
                product.setScale(transform.getScale().scalar(scale0));
            }

            return product;
        }
    }

    // In all remaining cases, the matrix cannot be written as R*S*X+T.
    var matMA = (IsRS ? this._matrix.timesDiagonal(this._scale) : this._matrix);
    var matMB = (
        transform.isRSMatrix() ?
            transform.getMatrix().timesDiagonal(transform.getScale()) :
            transform.getMatrix()
    );

    product.setMatrix(matMA.mul(matMB));
    product.setTranslate(matMA.mulPoint(transform.getTranslate()).add(this._translate));
    return product;
};
/**
 * Get the homogeneous matrix.
 */
L5.Transform.prototype.toMatrix = function () {
    return this.__matrix;
};

/**
 * Get the inverse homogeneous matrix, recomputing it when necessary.
 * If H = {{M,T},{0,1}}, then H^{-1} = {{M^{-1},-M^{-1}*T},{0,1}}.
 * @returns {L5.Matrix}
 */
L5.Transform.prototype.inverse = function () {
    if (!this._inverseNeedsUpdate) {
        return this._invMatrix;
    }
    if (this._isIdentity) {
        this._invMatrix = L5.Matrix.IDENTITY;
        this._inverseNeedsUpdate = false;
        return this._invMatrix;
    }

    var im = this._invMatrix,
    m = this._matrix;

    if (this._isRSMatrix) {
        var s0 = this._scale[0],
        s1 = this._scale[1],
        s2 = this._scale[2];

        if (this._isUniformScale) {
            var invScale = 1 / s0;
            im.setItem(0, 0, invScale * m.item(0, 0));
            im.setItem(0, 1, invScale * m.item(1, 0));
            im.setItem(0, 2, invScale * m.item(2, 0));
            im.setItem(1, 0, invScale * m.item(0, 1));
            im.setItem(1, 1, invScale * m.item(1, 1));
            im.setItem(1, 2, invScale * m.item(2, 1));
            im.setItem(2, 0, invScale * m.item(0, 2));
            im.setItem(2, 1, invScale * m.item(1, 2));
            im.setItem(2, 2, invScale * m.item(2, 2));
        } else {
            // Replace 3 reciprocals by 6 multiplies and 1 reciprocal.
            var s01 = s0 * s1;
            var s02 = s0 * s2;
            var s12 = s1 * s2;
            var invs012 = 1 / (s01 * s2);
            var invS0 = s12 * invs012;
            var invS1 = s02 * invs012;
            var invS2 = s01 * invs012;
            im.setItem(0, 0, invS0 * m.item(0, 0));
            im.setItem(0, 1, invS0 * m.item(1, 0));
            im.setItem(0, 2, invS0 * m.item(2, 0));
            im.setItem(1, 0, invS1 * m.item(0, 1));
            im.setItem(1, 1, invS1 * m.item(1, 1));
            im.setItem(1, 2, invS1 * m.item(2, 1));
            im.setItem(2, 0, invS2 * m.item(0, 2));
            im.setItem(2, 1, invS2 * m.item(1, 2));
            im.setItem(2, 2, invS2 * m.item(2, 2));
        }
    } else {
        L5.Transform.invert3x3(this.__matrix, im);
    }

    var t0 = this._translate[0],
    t1 = this._translate[1],
    t2 = this._translate[2];
    im.setItem(0, 3, -(im.item(0, 0) * t0 + im.item(0, 1) * t1 + im.item(0, 2) * t2));
    im.setItem(1, 3, -(im.item(1, 0) * t0 + im.item(1, 1) * t1 + im.item(1, 2) * t2));
    im.setItem(2, 3, -(im.item(2, 0) * t0 + im.item(2, 1) * t1 + im.item(2, 2) * t2));

    this._inverseNeedsUpdate = false;
    return this._invMatrix;
};

/**
 * Get the inversion transform.  No test is performed to determine whether
 * the caller transform is invertible.
 * @returns {L5.Transform}
 */
L5.Transform.prototype.inverseTransform = function () {
    if (this._isIdentity) {
        return L5.Transform.IDENTIRY;
    }

    var inverse = new L5.Transform();
    var invTrn = new L5.Point();

    if (this._isRSMatrix) {
        var invRot = this._matrix.transpose();
        var invScale;
        inverse.setRotate(invRot);
        if (this._isUniformScale) {
            invScale = 1 / this._scale[0];
            inverse.setUniformScale(invScale);
            invTrn = invRot.mulPoint(this._translate).scalar(-invScale);
        }
        else {
            invScale = new L5.Point(1 / this._scale[0], 1 / this._scale[1], 1 / this._scale[2]);
            inverse.setScale();
            invTrn = invRot.mulPoint(this._translate);
            invTrn[0] *= -invScale[0];
            invTrn[1] *= -invScale[1];
            invTrn[2] *= -invScale[2];
        }
    }
    else {
        var invMat = new L5.Matrix();
        L5.Transform.invert3x3(this._matrix, invMat);
        inverse.setMatrix(invMat);
        invTrn = invMat.mulPoint(this._translate).negative();
    }
    inverse.setTranslate(invTrn);

    return inverse;
};

/**
 * Fill in the entries of mm whenever one of the components
 * m, mTranslate, or mScale changes.
 * @private
 */
L5.Transform.prototype._updateMatrix = function () {
    if (this._isIdentity) {
        this.__matrix = L5.Matrix.IDENTITY;
    }
    else {
        var mm = this.__matrix;
        var m = this._matrix;

        if (this._isRSMatrix) {
            var s0 = this._scale[0],
                s1 = this._scale[1],
                s2 = this._scale[2];

            mm.setItem(0, 0, m.item(0, 0) * s0);
            mm.setItem(0, 1, m.item(0, 1) * s1);
            mm.setItem(0, 2, m.item(0, 2) * s2);
            mm.setItem(1, 0, m.item(1, 0) * s0);
            mm.setItem(1, 1, m.item(1, 1) * s1);
            mm.setItem(1, 2, m.item(1, 2) * s2);
            mm.setItem(2, 0, m.item(2, 0) * s0);
            mm.setItem(2, 1, m.item(2, 1) * s1);
            mm.setItem(2, 2, m.item(2, 2) * s2);
        }
        else {
            mm.setItem(0, 0, m.item(0, 0));
            mm.setItem(0, 1, m.item(0, 1));
            mm.setItem(0, 2, m.item(0, 2));
            mm.setItem(1, 0, m.item(1, 0));
            mm.setItem(1, 1, m.item(1, 1));
            mm.setItem(1, 2, m.item(1, 2));
            mm.setItem(2, 0, m.item(2, 0));
            mm.setItem(2, 1, m.item(2, 1));
            mm.setItem(2, 2, m.item(2, 2));
        }

        mm.setItem(0, 3, this._translate[0]);
        mm.setItem(1, 3, this._translate[1]);
        mm.setItem(2, 3, this._translate[2]);

        // The last row of mm is always (0,0,0,1) for an affine
        // transformation, so it is set once in the constructor.  It is not
        // necessary to reset it here.
    }

    this._inverseNeedsUpdate = true;
};

/**
 * Invert the 3x3 upper-left block of the input matrix.
 * @param mat {L5.Matrix}
 * @param invMat {L5.Matrix}
 * @private
 */
L5.Transform.invert3x3 = function (mat, invMat) {
    // Compute the adjoint of M (3x3).
    invMat.setItem(0, 0, mat.item(1, 1) * mat.item(2, 2) - mat.item(1, 2) * mat.item(2, 1));
    invMat.setItem(0, 1, mat.item(0, 2) * mat.item(2, 1) - mat.item(0, 1) * mat.item(2, 2));
    invMat.setItem(0, 2, mat.item(0, 1) * mat.item(1, 2) - mat.item(0, 2) * mat.item(1, 1));
    invMat.setItem(1, 0, mat.item(1, 2) * mat.item(2, 0) - mat.item(1, 0) * mat.item(2, 2));
    invMat.setItem(1, 1, mat.item(0, 0) * mat.item(2, 2) - mat.item(0, 2) * mat.item(2, 0));
    invMat.setItem(1, 2, mat.item(0, 2) * mat.item(1, 0) - mat.item(0, 0) * mat.item(1, 2));
    invMat.setItem(2, 0, mat.item(1, 0) * mat.item(2, 1) - mat.item(1, 1) * mat.item(2, 0));
    invMat.setItem(2, 1, mat.item(0, 1) * mat.item(2, 0) - mat.item(0, 0) * mat.item(2, 1));
    invMat.setItem(2, 2, mat.item(0, 0) * mat.item(1, 1) - mat.item(0, 1) * mat.item(1, 0));

    // Compute the reciprocal of the determinant of M.
    var invDet = 1 / (
            mat.item(0, 0) * invMat.item(0, 0) +
            mat.item(0, 1) * invMat.item(1, 0) +
            mat.item(0, 2) * invMat.item(2, 0)
        );

    // inverse(M) = adjoint(M)/determinant(M).
    invMat.setItem(0, 0, invMat.item(0, 0) * invDet);
    invMat.setItem(0, 1, invMat.item(0, 1) * invDet);
    invMat.setItem(0, 2, invMat.item(0, 2) * invDet);
    invMat.setItem(1, 0, invMat.item(1, 0) * invDet);
    invMat.setItem(1, 1, invMat.item(1, 1) * invDet);
    invMat.setItem(1, 2, invMat.item(1, 2) * invDet);
    invMat.setItem(2, 0, invMat.item(2, 0) * invDet);
    invMat.setItem(2, 1, invMat.item(2, 1) * invDet);
    invMat.setItem(2, 2, invMat.item(2, 2) * invDet);
};
Object.defineProperty(
    L5.Transform,
    'IDENTIRY',
    {
        get: function () {
            return new L5.Transform().makeIdentity();
        }
    }
);



/**
 * BillboardNode
 *
 * @param camera {L5.Camera} default is null
 */
L5.BillboardNode = function (
    camera
) {

    this._camera = camera || null;
    L5.Node.call(this);

};
L5.nameFix (L5.BillboardNode, 'BillboardNode');
L5.extendFix (L5.BillboardNode, L5.Node);


/**
 * The camera to which the billboard is aligned.
 *
 * @param camera {L5.Camera}
 */
L5.BillboardNode.alignTo = function (camera){
    this._camera = camera;
};

/**
 * Support for the geometric update
 *
 * @param applicationTime {number}
 */
L5.BillboardNode.prototype.updateWorldData = function( applicationTime) {
    // Compute the billboard's world transforms based on its parent's world
    // transform and its local transforms.  Notice that you should not call
    // Node::UpdateWorldData since that function updates its children.  The
    // children of a BillboardNode cannot be updated until the billboard is
    // aligned with the camera.
    L5.Spatial.prototype.updateWorldData.call(this, applicationTime);

    if (this._camera) {
        // Inverse-transform the camera to the model space of the billboard.
        var modelPos = this.worldTransform.inverse().mulPoint(this._camera.position);

        // To align the billboard, the projection of the camera to the
        // xz-plane of the billboard's model space determines the angle of
        // rotation about the billboard's model y-axis.  If the projected
        // camera is on the model axis (x = 0 and z = 0), ATan2 returns zero
        // (rather than NaN), so there is no need to trap this degenerate
        // case and handle it separately.
        var angle = L5.Math.atan2(modelPos[0], modelPos[2]);
        console.log(angle*(180/Math.PI));
        var orient = new L5.Matrix.makeRotateY(angle);
        this.worldTransform.setRotate(this.worldTransform.getRotate().mul(orient));
    }

    // Update the children now that the billboard orientation is known.
    this.childs.forEach(function(c){
        c.update(applicationTime, false);
    });
};

/**
 * 全局特效 - 镜像
 *
 * @param numPlanes {int}
 * @class
 * @extends {L5.D3Object}
 */
L5.PlanarReflectionEffect = function(numPlanes){

    L5.D3Object.call(this, 'L5.GlobalPlanarReflection');
    this.numPlanes = numPlanes;

    this.planes = new Array(numPlanes);
    this.reflectances = new Array(numPlanes);
    this.alphaState = new L5.AlphaState();
    this.depthState = new L5.DepthState();
    this.stencilState = new L5.StencilState();
};
L5.nameFix(L5.PlanarReflectionEffect, 'PlanarReflectionEffect');
L5.extendFix(L5.PlanarReflectionEffect, L5.D3Object);


/**
 * @param renderer {L5.Renderer}
 * @param visibleSet {L5.VisibleSet}
 */
L5.PlanarReflectionEffect.prototype.draw = function(renderer, visibleSet) {
    // 保存全局覆盖状态
    const oldDepthState = renderer.overrideDepthState;
    const oldStencilState = renderer.overrideStencilState;

    var depthState = this.depthState;
    var stencilState = this.stencilState;
    var alphaState = this.alphaState;

    // 使用当前特效的状态
    renderer.overrideDepthState = depthState;
    renderer.overrideStencilState = stencilState;

    // 获取默认深度范围
    var depthRange = renderer.getDepthRange();

    // Get the camera to store post-world transformations.
    var camera = renderer.camera;

    const numVisible = visibleSet.getNumVisible();
    var i, j;
    for (i = 0; i < this.numPlanes; ++i) {
        // Render the mirror into the stencil plane.  All visible mirror
        // pixels will have the stencil value of the mirror.  Make sure that
        // no pixels are written to the depth buffer or color buffer, but use
        // depth buffer testing so that the stencil will not be written where
        // the plane is behind something already in the depth buffer.
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_ALWAYS;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;     // irrelevant
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;    // invisible to 0
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_REPLACE; // visible to i+1

        // 允许从深度缓冲读取,但是禁止写入
        depthState.enabled = true;
        depthState.writable = false;
        depthState.compare = L5.DepthState.COMPARE_MODE_LEQUAL;

        // 禁用颜色缓冲
        renderer.setColorMask(false, false, false, false);

        renderer.drawVisible(this.planes[i]);
        // 恢复
        renderer.setColorMask(true, true, true, true);

        // Render the mirror plane again by only processing pixels where the
        // stencil buffer contains the reference value.  This time there are
        // no changes to the stencil buffer and the depth buffer value is
        // reset to the far clipping plane.  This is done by setting the range
        // of depth values in the viewport volume to be [1,1].  Since the
        // mirror plane cannot also be semi-transparent, we do not care what
        // is behind the mirror plane in the depth buffer.  We need to move
        // the depth buffer values back where the mirror plane will be
        // rendered so that when the reflected object is rendered, it can be
        // depth buffered correctly.  Note that the rendering of the reflected
        // object will cause depth value to be written, which will appear to
        // be behind the mirror plane.  Enable writes to the color buffer.
        // Later when we want to render the reflecting plane and have it blend
        // with the background, which should contain the reflected caster, we
        // want to use the same blending function so that the pixels where the
        // reflected object was not rendered will contain the reflecting plane
        // colors.  In that case, the blending result will have the reflecting
        // plane appear to be opaque when in reality it was blended with
        // blending coefficients adding to one.
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_EQUAL;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_KEEP;

        // Set the depth buffer to "infinity" at those pixels for which the
        // stencil buffer is the reference value i+1.
        renderer.setDepthRange(1, 1);
        depthState.enabled = true;
        depthState.writable = true;
        depthState.compare = L5.DepthState.COMPARE_MODE_ALWAYS;

        renderer.drawVisible(this.planes[i]);

        // Restore the depth range and depth testing function.
        depthState.compare = L5.DepthState.COMPARE_MODE_LEQUAL;
        renderer.setDepthRange(depthRange[0], depthRange[1]);

        // Compute the equation for the mirror plane in model coordinates
        // and get the reflection matrix in world coordinates.
        var reflection = L5.Matrix.ZERO;
        var modelPlane = new L5.Plane([], 0);
        this.getReflectionMatrixAndModelPlane(i, reflection, modelPlane);

        // TODO:  Add clip plane support to the renderer.
        // Enable a clip plane so that only objects above the mirror plane
        // are reflected.  This occurs before SetTransformation because it
        // needs the current geometric pipeline matrices to compute the clip
        // plane in the correct coordinate system.
        //pkRenderer->EnableUserClipPlane(0,kPlane);

        // This temporarily modifies the world matrix to apply the reflection
        // after the model-to-world transformation.
        camera.setPreViewMatrix(reflection);

        // Reverse the cull direction.  Allow for models that are not
        // necessarily set up with front or back face culling.
        renderer.reverseCullOrder = true;

        // Render the reflected object.  Only render where the stencil buffer
        // contains the reference value.
        for (j = 0; j < numVisible; ++j) {
            renderer.drawVisible(visibleSet.getVisible(j));
        }

        renderer.reverseCullOrder = false;

        camera.setPreViewMatrix(L5.Matrix.IDENTITY);
        // TODO:  Add clip plane support to the renderer.
        //pkRenderer->DisableUserClipPlane(0);

        // We are about to render the reflecting plane again.  Reset to the
        // global state for the reflecting plane.  We want to blend the
        // reflecting plane with what is already in the color buffer,
        // particularly either the image of the reflected caster or the
        // reflecting plane.  All we want for the reflecting plane at this
        // stage is to force the alpha channel to always be the reflectance
        // value for the reflecting plane.  Render the reflecting plane
        // wherever the stencil buffer is set to the reference value.  This
        // time clear the stencil buffer reference value where it is set.
        // Perform the normal depth buffer testing and writes.  Allow the
        // color buffer to be written to, but this time blend the reflecting
        // plane with the values in the color buffer based on the reflectance
        // value.  Note that where the stencil buffer is set, the color buffer
        // has either color values from the reflecting plane or the reflected
        // object.  Blending will use src=1-alpha (reflecting plane) and
        // dest=alpha background (reflecting plane or reflected object).
        const oldAlphaState = renderer.overrideAlphaState;
        renderer.overrideAlphaState = alphaState;
        alphaState.blendEnabled = true;
        alphaState.srcBlend = L5.AlphaState.BM_ONE_MINUS_CONSTANT_ALPHA;
        alphaState.dstBlend = L5.AlphaState.BM_CONSTANT_ALPHA;
        alphaState.constantColor.set([0, 0, 0, this.reflectances[i]]);

        stencilState.compare = L5.StencilState.COMPARE_MODE_EQUAL;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_INVERT;

        renderer.drawVisible(this.planes[i]);
        renderer.overrideAlphaState = oldAlphaState;
    }

    // 恢复全局状态
    renderer.overrideStencilState = oldStencilState;
    renderer.overrideDepthState = oldDepthState;

    // 正常渲染物体
    for (j = 0; j < numVisible; ++j) {
        renderer.drawVisible(visibleSet.getVisible(j));
    }
};

/**
 *
 * @param i {int}
 * @param reflection {L5.Matrix} output
 * @param modelPlane {L5.Plane} output
 *
 */
L5.PlanarReflectionEffect.prototype.getReflectionMatrixAndModelPlane = function(i, reflection, modelPlane) {
    // Compute the equation for the mirror plane in world coordinates.
    var vertex = new Array(3);
    this.planes[i].getWorldTriangle(0, vertex);
    var worldPlane = L5.Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);

    // Compute the reflection matrix.
    reflection.makeReflection(vertex[0], worldPlane.normal);

    this.planes[i].getModelTriangle(0, vertex);
    worldPlane = L5.Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);
    modelPlane.copy(worldPlane);
};


/**
 * 设置镜像平面
 * @param i {int} 索引
 * @param plane {L5.TriMesh}
 */
L5.PlanarReflectionEffect.prototype.setPlane = function (i, plane) {
    plane.culling = L5.Spatial.CULLING_ALWAYS;
    this.planes[i] = plane;
};

/**
 * 获取镜像平面
 * @param i {int} 索引
 * @returns {L5.TriMesh}
 */
L5.PlanarReflectionEffect.prototype.getPlane = function (i) {
    return this.planes[i];
};

/**
 * 设置镜像反射系数
 * @param i {int} 索引
 * @param reflectance {float} 反射系数
 */
L5.PlanarReflectionEffect.prototype.setReflectance = function (i, reflectance) {
    this.reflectances[i] = reflectance;
};

/**
 * 获取镜像反射系数
 * @param i {int} 索引
 * @returns {float}
 */
L5.PlanarReflectionEffect.prototype.getReflectance = function (i) {
    return this.reflectances[i];
};

/**
 * 全局特效 - 平面投影
 * @param numPlanes {int} 投影的平面数量
 * @param shadowCaster {L5.Node} 需要投影的物体
 * @class
 * @extends {L5.D3Object}
 */
L5.PlanarShadowEffect = function (numPlanes, shadowCaster) {
    L5.D3Object.call(this, 'L5.GlobalPlanarShadow');
    this.numPlanes = numPlanes;
    this.planes = new Array(numPlanes);
    this.projectors = new Array(numPlanes);
    this.shadowColors = new Array(numPlanes);

    this.alphaState = new L5.AlphaState();
    this.depthState = new L5.DepthState();
    this.stencilState = new L5.StencilState();

    this.shadowCaster = shadowCaster;

    this.material = new L5.Material();
    this.materialEffect = new L5.MaterialEffect();
    this.materialEffectInstance = this.materialEffect.createInstance(this.material);
};
L5.nameFix(L5.PlanarShadowEffect, 'PlanarShadowEffect');
L5.extendFix(L5.PlanarShadowEffect, L5.D3Object);

/**
 * @param renderer {L5.Renderer}
 * @param visibleSet {L5.VisibleSet}
 */
L5.PlanarShadowEffect.prototype.draw = function (renderer, visibleSet) {
    // Draw the potentially visible portions of the shadow caster.
    const numVisible = visibleSet.getNumVisible();
    var j;
    for (j = 0; j < numVisible; ++j) {
        renderer.drawVisible(visibleSet.getVisible(j));
    }

    // 保存全局覆盖状态
    var saveDState = renderer.overrideDepthState;
    var saveSState = renderer.overrideStencilState;
    var depthState = this.depthState;
    var stencilState = this.stencilState;
    var alphaState = this.alphaState;

    // 渲染系统使用当前特效的状态
    renderer.overrideDepthState = depthState;
    renderer.overrideStencilState = stencilState;

    // Get the camera to store post-world transformations.
    var camera = renderer.camera;

    for (var i = 0; i < this.numPlanes; ++i) {
        // 开启深度测试
        depthState.enabled = true;
        depthState.writable = true;
        depthState.compare = L5.DepthState.COMPARE_MODE_LEQUAL;

        // 开启模板测试, 这样,投影平面可以裁剪阴影
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_ALWAYS;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;      // irrelevant
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;     // invisible to 0
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_REPLACE;  // visible to i+1

        // 绘制平面
        renderer.drawVisible(this.planes[i]);

        // Blend the shadow color with the pixels drawn on the projection
        // plane.  The blending equation is
        //   (rf,gf,bf) = as*(rs,gs,bs) + (1-as)*(rd,gd,bd)
        // where (rf,gf,bf) is the final color to be written to the frame
        // buffer, (rs,gs,bs,as) is the shadow color, and (rd,gd,bd) is the
        // current color of the frame buffer.
        var saveAlphaState = renderer.overrideAlphaState;
        renderer.overrideAlphaState = alphaState;
        alphaState.blendEnabled = true;
        alphaState.srcBlend = L5.AlphaState.BM_SRC_ALPHA;
        alphaState.dstBlend = L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA;

        this.material.diffuse = this.shadowColors[i];

        // Disable the depth buffer reading so that no depth-buffer fighting
        // occurs.  The drawing of pixels is controlled solely by the stencil
        // value.
        depthState.enabled = false;

        // Only draw where the plane has been drawn.
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_EQUAL;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;   // invisible kept 0
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;  // irrelevant
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_ZERO;  // visible set to 0

        // 计算光源的投影矩阵
        var projection = L5.Matrix.ZERO;
        if (!this.getProjectionMatrix(i, projection)) {
            continue;
        }
        camera.setPreViewMatrix(projection);

        // Draw the caster again, but temporarily use a material effect so
        // that the shadow color is blended onto the plane.  TODO:  This
        // drawing pass should use a VisibleSet relative to the projector so
        // that objects that are out of view (i.e. culled relative to the
        // camera and not in the camera's VisibleSet) can cast shadows.
        for (j = 0; j < numVisible; ++j) {
            var visual = visibleSet.getVisible(j);
            var save = visual.effect;
            visual.effect = this.materialEffectInstance;
            renderer.drawVisible(visual);
            visual.effect = save;
        }

        camera.setPreViewMatrix(L5.Matrix.IDENTITY);

        renderer.overrideAlphaState = saveAlphaState;
    }

    // 恢复全局状态
    renderer.overrideStencilState = saveSState;
    renderer.overrideDepthState = saveDState;
};

/**
 *
 * @param i {int}
 * @param projection {L5.Matrix}
 */
L5.PlanarShadowEffect.prototype.getProjectionMatrix = function (i, projection) {
    // 计算投影平面在世界坐标系的方程

    var vertex = new Array(3);
    this.planes[i].getWorldTriangle(0, vertex);
    var worldPlane = L5.Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);

    // This is a conservative test to see whether a shadow should be cast.
    // This can cause incorrect results if the caster is large and intersects
    // the plane, but ordinarily we are not trying to cast shadows in such
    // situations.
    // 计算需要计算阴影的物体在投影平面的哪一边
    if (this.shadowCaster.worldBound.whichSide(worldPlane) < 0) {
        // The shadow caster is on the far side of plane, so it cannot cast
        // a shadow.
        return false;
    }

    // 计算光源的投影矩阵
    var projector = this.projectors[i];
    var normal = worldPlane.normal;
    if (projector.type === L5.Light.LT_DIRECTIONAL) {
        var NdD = normal.dot(projector.direction);
        if (NdD >= 0) {
            // The projection must be onto the "positive side" of the plane.
            return false;
        }

        projection.makeObliqueProjection(vertex[0], normal, projector.direction);
    }

    else if (projector.type === L5.Light.LT_POINT || projector.type === L5.Light.LT_SPOT) {
        var NdE = projector.position.dot(normal);
        if (NdE <= 0) {
            // The projection must be onto the "positive side" of the plane.
            return false;
        }

        projection.makePerspectiveProjection(vertex[0], normal, projector.position);
    }
    else {
        L5.assert(false, 'Light type not supported.');
        return false;
    }

    return true;
};

/**
 * 设置阴影的投影平面
 * @param i {int}
 * @param plane {L5.TriMesh}
 */
L5.PlanarShadowEffect.prototype.setPlane = function (i, plane) {
    // 设置原来的投影平面为不可见, 由该特效实例负责渲染
    plane.culling = L5.Spatial.CULLING_ALWAYS;
    this.planes[i] = plane;
};

/**
 * 获取阴影的投影平面
 * @param i {int}
 * @returns {L5.TriMesh}
 */
L5.PlanarShadowEffect.prototype.getPlane = function (i) {
    return this.planes[i];
};

/**
 * 设置阴影的光源
 * @param i {int}
 * @param projector {L5.Light}
 */
L5.PlanarShadowEffect.prototype.setProjector = function (i, projector) {
    this.projectors[i] = projector;
};

/**
 * 获取阴影的光源
 * @param i {int}
 * @returns {L5.Light}
 */
L5.PlanarShadowEffect.prototype.getProjector = function (i) {
    return this.projectors[i];
};

/**
 * 设置阴影颜色
 * @param i {int}
 * @param shadowColor {Float32Array}
 */
L5.PlanarShadowEffect.prototype.setShadowColor = function (i, shadowColor) {
    if (!this.shadowColors[i]) {
        this.shadowColors[i] = new Float32Array(shadowColor, 0, 4);
    }
    else {
        this.shadowColors[i].set(shadowColor, 0);
    }
};

/**
 * 获取阴影的颜色
 * @param i {int} 索引
 * @returns {Float32Array}
 */
L5.PlanarShadowEffect.prototype.getShadowColor = function (i) {
    return new Float32Array(this.shadowColors[i]);
};

/**
 * 默认效果着色器
 * @constructor
 * @extends {L5.VisualEffect}
 */
L5.DefaultEffect = function(){
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.Default", 1, 1, 1, 0, false);
    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setProgram(L5.DefaultEffect.VertextSource);

    var fs = new L5.FragShader("L5.Default", 0, 1, 0, 0, false);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.DefaultEffect.FragSource);

    var program = new L5.Program("L5.DefaultProgram", vs, fs);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};

L5.nameFix(L5.DefaultEffect, 'DefaultEffect');
L5.extendFix(L5.DefaultEffect, L5.VisualEffect);

L5.DefaultEffect.prototype.createInstance = function () {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    return instance;
};

L5.DefaultEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'uniform mat4 PVWMatrix;',
    'void main(){',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.DefaultEffect.FragSource = [
    'precision highp float;',
    'void main (void) {',
    '\t gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);',
    '}'
].join("\n");


/**
 * 只有环境光和发射光的着色器
 * @constructor
 * @extends {L5.VisualEffect}
 */
L5.LightAmbEffect = function(){
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.Default", 1, 2, 5, 0, false);
    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setConstant(1, "MaterialEmissive", L5.Shader.VT_VEC4);
    vs.setConstant(2, "MaterialAmbient", L5.Shader.VT_VEC4);
    vs.setConstant(3, "LightAmbient", L5.Shader.VT_VEC4);
    vs.setConstant(4, "LightAttenuation", L5.Shader.VT_VEC4);
    vs.setProgram(L5.LightAmbEffect.VertextSource);

    var fs = new L5.FragShader("L5.Default", 1, 1, 0, 0, false);
    fs.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.LightAmbEffect.FragSource);

    var program = new L5.Program("L5.DefaultProgram", vs, fs);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};

L5.nameFix(L5.LightAmbEffect, 'LightAmbEffect');
L5.extendFix(L5.LightAmbEffect, L5.VisualEffect);

L5.LightAmbEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 2, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 3, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 4, new L5.LightAttenuationConstant(light));
    return instance;
};
L5.LightAmbEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightAmbEffect();
    return effect.createInstance(light, material);
};

L5.LightAmbEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'uniform mat4 PVWMatrix;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 LightAmbient;',        // c[7]
    'uniform vec4 LightAttenuation;',    // c[8], [constant, linear, quadratic, intensity]
    'varying vec4 vertexColor;',
    'void main(){',
    '\t vec3 la = LightAmbient.rgb * LightAttenuation.w;',
    '\t la = la * MaterialAmbient.rgb + MaterialEmissive.rgb;',
    '\t vertexColor = vec4(la, 1.0);',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightAmbEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
        '\t gl_FragColor = vertexColor;',
    '}'
].join("\n");


/**
 * Gouraud 光照效果 (片段Blinn光照)
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightDirPerFragEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightDirPerFrag", 2, 3, 1, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);

    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(1, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setProgram(L5.LightDirPerFragEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightDirPerFrag", 2, 1, 10, 0);
    fshader.setInput(0, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    fshader.setInput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    fshader.setConstant(0, "CameraModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(1, "MaterialEmissive", L5.Shader.VT_VEC4);
    fshader.setConstant(2, "MaterialAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(3, "MaterialDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(4, "MaterialSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(5, "LightModelDirection", L5.Shader.VT_VEC4);
    fshader.setConstant(6, "LightAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(7, "LightDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(8, "LightSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(9, "LightAttenuation", L5.Shader.VT_VEC4);
    fshader.setProgram(L5.LightDirPerFragEffect.FragSource);

    var program = new L5.Program("L5.LightDirPerFrag", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightDirPerFragEffect, 'LightDirPerFragEffect');
L5.extendFix(L5.LightDirPerFragEffect, L5.VisualEffect);

L5.LightDirPerFragEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setFragConstant(0, 0, new L5.CameraModelPositionConstant());
    instance.setFragConstant(0, 1, new L5.MaterialEmissiveConstant(material));
    instance.setFragConstant(0, 2, new L5.MaterialAmbientConstant(material));
    instance.setFragConstant(0, 3, new L5.MaterialDiffuseConstant(material));
    instance.setFragConstant(0, 4, new L5.MaterialSpecularConstant(material));
    instance.setFragConstant(0, 5, new L5.LightModelDirectionConstant(light));
    instance.setFragConstant(0, 6, new L5.LightAmbientConstant(light));
    instance.setFragConstant(0, 7, new L5.LightDiffuseConstant(light));
    instance.setFragConstant(0, 8, new L5.LightSpecularConstant(light));
    instance.setFragConstant(0, 9, new L5.LightAttenuationConstant(light));
    return instance;
};
L5.LightDirPerFragEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightDirPerFragEffect();
    return effect.createInstance(light, material);
};

L5.LightDirPerFragEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
        '\t vertexPosition = modelPosition;',
        '\t vertexNormal = modelNormal;',
        '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightDirPerFragEffect.FragSource = [
    'precision highp float;',
    'uniform vec4 CameraModelPosition;', // c[0], 物体坐标系中相机的位置
    'uniform vec4 MaterialEmissive;',    // c[1]
    'uniform vec4 MaterialAmbient;',     // c[2]
    'uniform vec4 MaterialDiffuse;',     // c[3]
    'uniform vec4 MaterialSpecular;',    // c[4] [,,,光滑度]
    'uniform vec4 LightModelDirection;', // c[5]
    'uniform vec4 LightAmbient;',        // c[6]
    'uniform vec4 LightDiffuse;',        // c[7]
    'uniform vec4 LightSpecular;',       // c[8]
    'uniform vec4 LightAttenuation;',    // c[9], [constant, linear, quadratic, intensity]
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main (void) {',
    '  vec3 nor = normalize(vertexNormal);',
    '  vec3 color = LightAmbient.rgb * MaterialAmbient.rgb;',           // 计算环境光分量
    '  float t = abs(dot(nor, LightModelDirection.xyz));',        // 计算入射角cos值
    '  color = color + t * MaterialDiffuse.rgb * LightDiffuse.rgb;',   // 计算漫反射分量
    '  if (t > 0.0) {',
    '    vec3 tmp = normalize(CameraModelPosition.xyz - vertexPosition);',
    '    tmp = normalize(tmp - LightModelDirection.xyz);',
    '    t = max(dot(nor, tmp), 0.0);',
    '    float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0) );',
    '    color = weight * MaterialSpecular.rgb * LightSpecular.rgb + color;',
    '  }',
    '  color = color * LightAttenuation.w + MaterialEmissive.rgb;',
    '  gl_FragColor = vec4(color, 1.0);',
    '}'
].join("\n");


L5.LightDirPerFragEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightDirPerFragEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightDirPerFragEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightDirPerFragEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightDirPerFragEffect.FragSource);

    this.techniques = this.___;
};

L5.LightDirPerFragEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightDirPerFragEffect}
 */
L5.LightDirPerFragEffect.factory = function (inStream) {
    var obj = new L5.LightDirPerFragEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightDirPerFragEffect', L5.LightDirPerFragEffect.factory);

/**
 * 平行光 光照效果 (顶点Blinn光照)
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightDirPerVerEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightDirPerVer", 2, 2, 11, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(1, "CameraModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(2, "MaterialEmissive", L5.Shader.VT_VEC4);
    vshader.setConstant(3, "MaterialAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(4, "MaterialDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(5, "MaterialSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(6, "LightModelDirection", L5.Shader.VT_VEC4);
    vshader.setConstant(7, "LightAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(8, "LightDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(9, "LightSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(10, "LightAttenuation", L5.Shader.VT_VEC4);
    vshader.setProgram(L5.LightDirPerVerEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightDirPerVer", 1, 1, 0, 0);
    fshader.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setProgram(L5.LightDirPerVerEffect.FragSource);

    var program = new L5.Program("L5.Program", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightDirPerVerEffect, 'LightDirPerVerEffect');
L5.extendFix(L5.LightDirPerVerEffect, L5.VisualEffect);

L5.LightDirPerVerEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.CameraModelPositionConstant());
    instance.setVertexConstant(0, 2, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 3, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 4, new L5.MaterialDiffuseConstant(material));
    instance.setVertexConstant(0, 5, new L5.MaterialSpecularConstant(material));
    instance.setVertexConstant(0, 6, new L5.LightModelDirectionConstant(light));
    instance.setVertexConstant(0, 7, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 8, new L5.LightDiffuseConstant(light));
    instance.setVertexConstant(0, 9, new L5.LightSpecularConstant(light));
    instance.setVertexConstant(0, 10, new L5.LightAttenuationConstant(light));
    return instance;
};
L5.LightDirPerVerEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightDirPerVerEffect();
    return effect.createInstance(light, material);
};

L5.LightDirPerVerEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',           // c[1],c[2],c[3],c[4]
    'uniform vec4 CameraModelPosition;', // c[5], 物体坐标系中相机的位置
    'uniform vec4 MaterialEmissive;',    // c[6]
    'uniform vec4 MaterialAmbient;',     // c[7]
    'uniform vec4 MaterialDiffuse;',     // c[8]
    'uniform vec4 MaterialSpecular;',    // c[9] [,,,光滑度]
    'uniform vec4 LightModelDirection;', // c[10]
    'uniform vec4 LightAmbient;',        // c[11]
    'uniform vec4 LightDiffuse;',        // c[12]
    'uniform vec4 LightSpecular;',       // c[13]
    'uniform vec4 LightAttenuation;',    // c[14], [constant, linear, quadratic, intensity]
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec4 vertexColor;',
    'void main(){',
    '  vec3 nor = normalize(modelNormal.xyz);',
    '  vec3 dir = normalize(LightModelDirection.xyz);',
    '  vec3 color = LightAmbient.rgb * MaterialAmbient.rgb;',                      // 环境光分量
    '  float t = max( dot(nor, dir) , 0.0);',                                      // 入射角cos值
    '  if ( t > 0.0) {',
    '    color = color + t * MaterialDiffuse.rgb * LightDiffuse.rgb;',             // 漫反射分量
    '    vec3 viewVector = normalize(CameraModelPosition.xyz - modelPosition);',   // 观察方向
    '    vec3 reflectDir = normalize( reflect(-dir, nor) );',                      // 反射方向
    '    t = max( dot(reflectDir, viewVector), 0.0);',
    '    float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0));',
    '    color = weight * MaterialSpecular.rgb * LightSpecular.rgb + color;',      // 高光分量
    '  }',
    '  color = color * LightAttenuation.w + MaterialEmissive.rgb;',                // 加入总光强系数
    '  vertexColor = vec4(color, MaterialDiffuse.a);',
    '  gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightDirPerVerEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
        'gl_FragColor = vertexColor;',
    '}'
].join("\n");


L5.LightDirPerVerEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightDirPerVerEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightDirPerVerEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightDirPerVerEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightDirPerVerEffect.FragSource);

    this.techniques = this.___;
};

L5.LightDirPerVerEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightDirPerVerEffect}
 */
L5.LightDirPerVerEffect.factory = function (inStream) {
    var obj = new L5.LightDirPerVerEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightDirPerVerEffect', L5.LightDirPerVerEffect.factory);

/**
 * 点光源 片元光照效果
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightPointPerFragmentEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightPointPerFragment", 2, 3, 1, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setOutput(2, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);

    vshader.setProgram(L5.LightPointPerFragmentEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightPointPerFragment", 2, 1, 11, 0);
    fshader.setInput(0, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    fshader.setInput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);

    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    fshader.setConstant(0, "WMatrix", L5.Shader.VT_MAT4);
    fshader.setConstant(1, "CameraModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(2, "MaterialEmissive", L5.Shader.VT_VEC4);
    fshader.setConstant(3, "MaterialAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(4, "MaterialDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(5, "MaterialSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(6, "LightModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(7, "LightAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(8, "LightDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(9, "LightSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(10, "LightAttenuation", L5.Shader.VT_VEC4);

    fshader.setProgram(L5.LightPointPerFragmentEffect.FragSource);

    var program = new L5.Program("L5.LightPointPerFragmentEffectProgram", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightPointPerFragmentEffect, 'LightPointPerFragmentEffect');
L5.extendFix(L5.LightPointPerFragmentEffect, L5.VisualEffect);

/**
 * 创建点光源顶点光照程序
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightPointPerFragmentEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    
    instance.setFragConstant(0, 0, new L5.WMatrixConstant());
    instance.setFragConstant(0, 1, new L5.CameraModelPositionConstant());
    instance.setFragConstant(0, 2, new L5.MaterialEmissiveConstant(material));
    instance.setFragConstant(0, 3, new L5.MaterialAmbientConstant(material));
    instance.setFragConstant(0, 4, new L5.MaterialDiffuseConstant(material));
    instance.setFragConstant(0, 5, new L5.MaterialSpecularConstant(material));
    instance.setFragConstant(0, 6, new L5.LightModelPositionConstant(light));
    instance.setFragConstant(0, 7, new L5.LightAmbientConstant(light));
    instance.setFragConstant(0, 8, new L5.LightDiffuseConstant(light));
    instance.setFragConstant(0, 9, new L5.LightSpecularConstant(light));
    instance.setFragConstant(0, 10, new L5.LightAttenuationConstant(light));
    return instance;
};

/**
 * 创建唯一点光源顶点光照程序
 *
 * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightPointPerFragmentEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightPointPerFragmentEffect();
    return effect.createInstance(light, material);
};

L5.LightPointPerFragmentEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
    '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '    vertexPosition = modelPosition;',
    '    vertexNormal = modelNormal;',
    '}'
].join("\n");

L5.LightPointPerFragmentEffect.FragSource = [
    'precision highp float;',
    'uniform mat4 WMatrix;',
    'uniform vec4 CameraModelPosition;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 MaterialDiffuse;',
    'uniform vec4 MaterialSpecular;',
    'uniform vec4 LightModelPosition;',
    'uniform vec4 LightAmbient;',
    'uniform vec4 LightDiffuse;',
    'uniform vec4 LightSpecular;',
    'uniform vec4 LightAttenuation;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
    '    vec3 nor = normalize(vertexNormal);',
    '    vec3 dir = LightModelPosition.xyz - vertexPosition;',
    '    float t = length(WMatrix * vec4(dir, 0.0));',
    // t = intensity / (constant + d * linear + d*d* quadratic);
    '    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));',
    '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',

    '    dir = normalize(dir);',
    '    float d = max(dot(nor, dir), 0.0);',
    '    color = color + d * MaterialDiffuse.rgb*LightDiffuse.rgb;',


    '    if (d > 0.0) {',
    '        vec3 viewVector = normalize(CameraModelPosition.xyz - vertexPosition);',
    '        vec3 reflectDir = normalize( reflect(-dir, nor) );',               // 计算反射方向
    '        d = max(dot(reflectDir, viewVector), 0.0);',
    '        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));',
    '        color = color + d * MaterialSpecular.rgb*LightSpecular.rgb;',
    '    }',
    '    gl_FragColor.rgb = MaterialEmissive.rgb + t*color;',
    '    gl_FragColor.a = MaterialDiffuse.a;',
    '}'
].join("\n");


L5.LightPointPerFragmentEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightPointPerFragmentEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightPointPerFragmentEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightPointPerFragmentEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightPointPerFragmentEffect.FragSource);

    this.techniques = this.___;
};

L5.LightPointPerFragmentEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightPointPerFragmentEffect}
 */
L5.LightPointPerFragmentEffect.factory = function (inStream) {
    var obj = new L5.LightPointPerFragmentEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightPointPerFragmentEffect', L5.LightPointPerFragmentEffect.factory);

/**
 * 点光源 顶点光照效果 (顶点Blinn光照)
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightPointPerVertexEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightPointPerVertex", 2, 2, 12, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(1, "WMatrix", L5.Shader.VT_MAT4);

    vshader.setConstant(2, "CameraModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(3, "MaterialEmissive", L5.Shader.VT_VEC4);
    vshader.setConstant(4, "MaterialAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(5, "MaterialDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(6, "MaterialSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(7, "LightModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(8, "LightAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(9, "LightDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(10, "LightSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(11, "LightAttenuation", L5.Shader.VT_VEC4);
    vshader.setProgram(L5.LightPointPerVertexEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightPointPerVertex", 1, 1, 0, 0);
    fshader.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setProgram(L5.LightPointPerVertexEffect.FragSource);

    var program = new L5.Program("L5.LightPointPerVertexEffectProgram", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightPointPerVertexEffect, 'LightPointPerVertexEffect');
L5.extendFix(L5.LightPointPerVertexEffect, L5.VisualEffect);

/**
 * 创建点光源顶点光照程序
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightPointPerVertexEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.WMatrixConstant());
    instance.setVertexConstant(0, 2, new L5.CameraModelPositionConstant());
    instance.setVertexConstant(0, 3, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 4, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 5, new L5.MaterialDiffuseConstant(material));
    instance.setVertexConstant(0, 6, new L5.MaterialSpecularConstant(material));
    instance.setVertexConstant(0, 7, new L5.LightModelPositionConstant(light));
    instance.setVertexConstant(0, 8, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 9, new L5.LightDiffuseConstant(light));
    instance.setVertexConstant(0, 10, new L5.LightSpecularConstant(light));
    instance.setVertexConstant(0, 11, new L5.LightAttenuationConstant(light));
    return instance;
};

/**
 * 创建唯一点光源顶点光照程序
 *
 * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightPointPerVertexEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightPointPerVertexEffect();
    return effect.createInstance(light, material);
};

L5.LightPointPerVertexEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'uniform mat4 WMatrix;',
    'uniform vec4 CameraModelPosition;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 MaterialDiffuse;',
    'uniform vec4 MaterialSpecular;',
    'uniform vec4 LightModelPosition;',
    'uniform vec4 LightAmbient;',
    'uniform vec4 LightDiffuse;',
    'uniform vec4 LightSpecular;',
    'uniform vec4 LightAttenuation;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec4 vertexColor;',
    'void main(){',
    '    vec3 nor = normalize(modelNormal);',
    '    vec3 v1 = LightModelPosition.xyz - modelPosition;',  // 指向光源的方向
    '    float t = length(WMatrix * vec4(v1, 0.0));',
    '    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));',
    '    vec3 dir = normalize(v1);',                              // 光源方向
    '    float d = max( dot(nor, dir), 0.0);',                    // 计算漫反射权重
    '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',        // 环境光分量
    '    color = d * MaterialDiffuse.rgb*LightDiffuse.rgb + color;', // 漫反射分量
    '    if (d > 0.0) {',
    '        vec3 viewVector = normalize(CameraModelPosition.xyz - modelPosition);', // 观察方向
    '        vec3 reflectDir = normalize( reflect(-dir, nor) );',               // 计算反射方向
    '        d = max(dot(reflectDir, viewVector), 0.0);',
    '        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));',
    '        color = color + d*MaterialSpecular.rgb*LightSpecular.rgb;',
    '    }',
    '    vertexColor = vec4(MaterialEmissive.rgb + t*color, MaterialDiffuse.a);',
    '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightPointPerVertexEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    '    gl_FragColor = vertexColor;',
    '}'
].join("\n");


L5.LightPointPerVertexEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightPointPerVertexEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightPointPerVertexEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightPointPerVertexEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightPointPerVertexEffect.FragSource);

    this.techniques = this.___;
};

L5.LightPointPerVertexEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightPointPerVertexEffect}
 */
L5.LightPointPerVertexEffect.factory = function (inStream) {
    var obj = new L5.LightPointPerVertexEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightPointPerVertexEffect', L5.LightPointPerVertexEffect.factory);

/**
 * 聚光灯 片元光照效果
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightSpotPerFragmentEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightSpotPerFragment", 2, 3, 1, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setOutput(2, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setProgram(L5.LightSpotPerFragmentEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightSpotPerFragment", 2, 1, 13, 0);
    fshader.setInput(0, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    fshader.setInput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setConstant(0, "WMatrix", L5.Shader.VT_MAT4);
    fshader.setConstant(1, "CameraModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(2, "MaterialEmissive", L5.Shader.VT_VEC4);
    fshader.setConstant(3, "MaterialAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(4, "MaterialDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(5, "MaterialSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(6, "LightModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(7, "LightModelDirection", L5.Shader.VT_VEC4);
    fshader.setConstant(8, "LightAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(9, "LightDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(10, "LightSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(11, "LightSpotCutoff", L5.Shader.VT_VEC4);
    fshader.setConstant(12, "LightAttenuation", L5.Shader.VT_VEC4);
    fshader.setProgram(L5.LightSpotPerFragmentEffect.FragSource);

    var program = new L5.Program("L5.LightSpotPerFragmentEffectProgram", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightSpotPerFragmentEffect, 'LightSpotPerFragmentEffect');
L5.extendFix(L5.LightSpotPerFragmentEffect, L5.VisualEffect);

/**
 * 创建聚光灯片元光照程序
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightSpotPerFragmentEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setFragConstant(0, 0, new L5.WMatrixConstant());
    instance.setFragConstant(0, 1, new L5.CameraModelPositionConstant());
    instance.setFragConstant(0, 2, new L5.MaterialEmissiveConstant(material));
    instance.setFragConstant(0, 3, new L5.MaterialAmbientConstant(material));
    instance.setFragConstant(0, 4, new L5.MaterialDiffuseConstant(material));
    instance.setFragConstant(0, 5, new L5.MaterialSpecularConstant(material));
    instance.setFragConstant(0, 6, new L5.LightModelPositionConstant(light));
    instance.setFragConstant(0, 7, new L5.LightModelDirectionConstant(light));
    instance.setFragConstant(0, 8, new L5.LightAmbientConstant(light));
    instance.setFragConstant(0, 9, new L5.LightDiffuseConstant(light));
    instance.setFragConstant(0, 10, new L5.LightSpecularConstant(light));
    instance.setFragConstant(0, 11, new L5.LightSpotConstant(light));
    instance.setFragConstant(0, 12, new L5.LightAttenuationConstant(light));
    return instance;
};

/**
 * 创建唯一聚光灯光照程序
 *
 * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightSpotPerFragmentEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightSpotPerFragmentEffect();
    return effect.createInstance(light, material);
};

L5.LightSpotPerFragmentEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
    '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '    vertexPosition = modelPosition;',
    '    vertexNormal = modelNormal;',
    '}'
].join("\n");

L5.LightSpotPerFragmentEffect.FragSource = [
    'precision highp float;',
    'uniform mat4 WMatrix;',
    'uniform vec4 CameraModelPosition;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 MaterialDiffuse;',
    'uniform vec4 MaterialSpecular;',
    'uniform vec4 LightModelPosition;',
    'uniform vec4 LightModelDirection;',
    'uniform vec4 LightAmbient;',
    'uniform vec4 LightDiffuse;',
    'uniform vec4 LightSpecular;',
    'uniform vec4 LightSpotCutoff;',
    'uniform vec4 LightAttenuation;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main (void) {',
    '    vec3 nor = normalize(vertexNormal);',
    '    vec3 spotDir = normalize(LightModelDirection.xyz);',
    '    vec3 lightDir = LightModelPosition.xyz - vertexPosition;',     // 指向光源的向量
    '    float attr = length(WMatrix * vec4(lightDir, 1.0));',         // 距离, 距离衰减系数
    '    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));',
    '    lightDir = normalize(lightDir);',
    '    float dWeight = max(dot(nor, lightDir), 0.0);',         // 漫反射权重
    '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',
    '    if (dWeight > 0.0) {',
    '        float spotEffect = dot(spotDir, -lightDir);',          // 聚光轴 与 光线 的夹角cos值
    '        if (spotEffect >= LightSpotCutoff.y) {',
    '            spotEffect = pow(spotEffect, LightSpotCutoff.w);',
    '            vec3 reflectDir = normalize( reflect(-lightDir, nor) );',               // 计算反射方向
    '            vec3 viewVector = normalize(CameraModelPosition.xyz - vertexPosition);', // 观察方向
    '            float sWeight = max( dot(reflectDir, viewVector), 0.0);',
    '            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));',
    '            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse.rgb;',  // 漫反射分量
    '            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular.rgb;',  // 高光分量
    '            color = color + spotEffect * sColor;',
    '        }',
    '    }',
    '    gl_FragColor = vec4(MaterialEmissive.rgb + attr*color, MaterialDiffuse.a);',
    '}'
].join("\n");


L5.LightSpotPerFragmentEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightSpotPerFragmentEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightSpotPerFragmentEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightSpotPerFragmentEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightSpotPerFragmentEffect.FragSource);

    this.techniques = this.___;
};

L5.LightSpotPerFragmentEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightSpotPerFragmentEffect}
 */
L5.LightSpotPerFragmentEffect.factory = function (inStream) {
    var obj = new L5.LightSpotPerFragmentEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightSpotPerFragmentEffect', L5.LightSpotPerFragmentEffect.factory);

/**
 * 聚光灯 顶点光照效果
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightSpotPerVertexEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightSpotPerVertex", 2, 2, 14, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(1, "WMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(2, "CameraModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(3, "MaterialEmissive", L5.Shader.VT_VEC4);
    vshader.setConstant(4, "MaterialAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(5, "MaterialDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(6, "MaterialSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(7, "LightModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(8, "LightModelDirection", L5.Shader.VT_VEC4);
    vshader.setConstant(9, "LightAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(10, "LightDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(11, "LightSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(12, "LightSpotCutoff", L5.Shader.VT_VEC4);
    vshader.setConstant(13, "LightAttenuation", L5.Shader.VT_VEC4);
    vshader.setProgram(L5.LightSpotPerVertexEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightSpotPerVertex", 1, 1, 0, 0);
    fshader.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setProgram(L5.LightSpotPerVertexEffect.FragSource);

    var program = new L5.Program("L5.LightSpotPerVertexEffectProgram", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightSpotPerVertexEffect, 'LightSpotPerVertexEffect');
L5.extendFix(L5.LightSpotPerVertexEffect, L5.VisualEffect);

/**
 * 创建点光源顶点光照程序
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightSpotPerVertexEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.WMatrixConstant());
    instance.setVertexConstant(0, 2, new L5.CameraModelPositionConstant());
    instance.setVertexConstant(0, 3, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 4, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 5, new L5.MaterialDiffuseConstant(material));
    instance.setVertexConstant(0, 6, new L5.MaterialSpecularConstant(material));
    instance.setVertexConstant(0, 7, new L5.LightModelPositionConstant(light));
    instance.setVertexConstant(0, 8, new L5.LightModelDirectionConstant(light));
    instance.setVertexConstant(0, 9, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 10, new L5.LightDiffuseConstant(light));
    instance.setVertexConstant(0, 11, new L5.LightSpecularConstant(light));
    instance.setVertexConstant(0, 12, new L5.LightSpotConstant(light));
    instance.setVertexConstant(0, 13, new L5.LightAttenuationConstant(light));
    return instance;
};

/**
 * 创建唯一点光源顶点光照程序
 *
 * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightSpotPerVertexEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightSpotPerVertexEffect();
    return effect.createInstance(light, material);
};

L5.LightSpotPerVertexEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'uniform mat4 WMatrix;',
    'uniform vec4 CameraModelPosition;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 MaterialDiffuse;',
    'uniform vec4 MaterialSpecular;',
    'uniform vec4 LightModelPosition;',
    'uniform vec4 LightModelDirection;',
    'uniform vec4 LightAmbient;',
    'uniform vec4 LightDiffuse;',
    'uniform vec4 LightSpecular;',
    'uniform vec4 LightSpotCutoff;',
    'uniform vec4 LightAttenuation;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec4 vertexColor;',
    'void main(){',
    '    vec3 nor = normalize(modelNormal);',
    '    vec3 spotDir = normalize(LightModelDirection.xyz);',
    '    vec3 lightDir = LightModelPosition.xyz - modelPosition;',     // 指向光源的向量
    '    float attr = length(WMatrix * vec4(lightDir, 1.0));',         // 距离, 距离衰减系数
    '    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));',
    '    lightDir = normalize(lightDir);',
    '    float dWeight = max(dot(nor, lightDir), 0.0);',         // 漫反射权重
    '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',
    '    if (dWeight > 0.0) {',
    '        float spotEffect = dot(spotDir, -lightDir);',          // 聚光轴 与 光线 的夹角cos值
    '        if (spotEffect >= LightSpotCutoff.y) {',
    '            spotEffect = pow(spotEffect, LightSpotCutoff.w);',
    '            vec3 reflectDir = normalize( reflect(-lightDir, nor) );',               // 计算反射方向
    '            vec3 viewVector = normalize(CameraModelPosition.xyz - modelPosition);', // 观察方向
    '            float sWeight = max( dot(reflectDir, viewVector), 0.0);',
    '            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));',
    '            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse.rgb;',  // 漫反射分量
    '            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular.rgb;',  // 高光分量
    '            color = color + spotEffect * sColor;',
    '        }',
    '    }',
    '    vertexColor = vec4(MaterialEmissive.rgb + attr*color, MaterialDiffuse.a);',
    '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightSpotPerVertexEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    '    gl_FragColor = vertexColor;',
    '}'
].join("\n");


L5.LightSpotPerVertexEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightSpotPerVertexEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightSpotPerVertexEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightSpotPerVertexEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightSpotPerVertexEffect.FragSource);

    this.techniques = this.___;
};

L5.LightSpotPerVertexEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightSpotPerVertexEffect}
 */
L5.LightSpotPerVertexEffect.factory = function (inStream) {
    var obj = new L5.LightSpotPerVertexEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightSpotPerVertexEffect', L5.LightSpotPerVertexEffect.factory);

/**
 * 材质效果着色器
 * @constructor
 * @extends {L5.VisualEffect}
 */
L5.MaterialEffect = function () {
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.Material", 1, 2, 2, 0);
    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);

    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setConstant(1, "MaterialDiffuse", L5.Shader.VT_VEC4);

    vs.setProgram(L5.MaterialEffect.VertextSource);

    var fs = new L5.FragShader("L5.Material", 1, 1, 0, 0);
    fs.setInput(0, "vectexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.MaterialEffect.FragSource);

    var program = new L5.Program("L5.MaterialProgram", vs, fs);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};

L5.nameFix(L5.MaterialEffect, 'MaterialEffect');
L5.extendFix(L5.MaterialEffect, L5.VisualEffect);

/**
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.MaterialEffect.prototype.createInstance = function (material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.MaterialDiffuseConstant(material));
    return instance;
};

/**
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.MaterialEffect.createUniqueInstance = function (material) {
    var effect = new L5.MaterialEffect();
    return effect.createInstance(material);
};

L5.MaterialEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'uniform mat4 PVWMatrix;',
    'uniform vec4 MaterialDiffuse;',
    'varying vec4 vertexColor;',
    'void main(){',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '\t vertexColor = MaterialDiffuse;',
    '}'
].join("\n");

L5.MaterialEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    '\t gl_FragColor = vertexColor;',
    '}'
].join("\n");








/**
 * Texture2DEffect 2D纹理效果
 * @param filter {number} 纹理格式， 参考L5.Shader.SF_XXX
 * @param coordinate0 {number} 相当于宽度 参考L5.Shader.SC_XXX
 * @param coordinate1 {number} 相当于高度 参考L5.Shader.SC_XXX
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Texture2DEffect= function(
    filter, coordinate0, coordinate1
){

    if (!filter) {
        filter = L5.Shader.SF_NEAREST;
    }
    if (!coordinate0) {
        coordinate0 = L5.Shader.SC_CLAMP_EDGE;
    }
    if (!coordinate1) {
        coordinate1 = L5.Shader.SC_CLAMP_EDGE;
    }

    L5.VisualEffect.call(this);

    var vshader = new L5.VertexShader("L5.Texture2D",2, 2, 1, 0, false);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelTCoord0", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexTCoord", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setProgram(L5.Texture2DEffect.VertextSource);

    var fshader = new L5.FragShader("L5.Texture2D", 1, 1, 0, 1, false);
    fshader.setInput(0, "vertexTCoord", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setSampler(0, "BaseSampler", L5.Shader.ST_2D);
    fshader.setFilter(0, filter);
    fshader.setCoordinate(0, 0, coordinate0);
    fshader.setCoordinate(0, 1, coordinate1);
    fshader.setTextureUnit(0, L5.Texture2DEffect.FragTextureUnit);
    fshader.setProgram(L5.Texture2DEffect.FragSource);
    
    var program = new L5.Program("L5.Program", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);

};

L5.nameFix (L5.Texture2DEffect, 'Texture2DEffect');
L5.extendFix (L5.Texture2DEffect, L5.VisualEffect);

/**
 * Any change in sampler state is made via the frag shader.
 * @returns {L5.FragShader}
 */
L5.Texture2DEffect.prototype.getFragShader = function(){
    return L5.VisualEffect.prototype.getFragShader.call(this, 0,0);
};

/**
 * Create an instance of the effect with unique parameters.
 * If the sampler filter mode is set to a value corresponding to mipmapping,
 * then the mipmaps will be generated if necessary.
 *
 * @params texture {L5.Texture2D}
 * @returns {L5.VisualEffectInstance}
 */
L5.Texture2DEffect.prototype.createInstance = function(texture){
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setFragTexture(0, 0, texture);

    var filter = this.getFragShader().getFilter(0);
    if (filter !== L5.Shader.SF_NEAREST && filter != L5.Shader.SF_LINEAR &&  !texture.hasMipmaps) {
        texture.generateMipmaps();
    }

    return instance;
};

/**
 * Convenience for creating an instance.  The application does not have to
 * create the effect explicitly in order to create an instance from it.
 * @param texture {L5.Texture2D}
 * @param filter {number}
 * @param coordinate0 {number}
 * @param coordinate1 {number}
 * @returns {L5.VisualEffectInstance}
 */
L5.Texture2DEffect.createUniqueInstance = function(
    texture, filter, coordinate0, coordinate1
){
    var effect = new L5.Texture2DEffect();
    var fshader = effect.getFragShader();
    fshader.setFilter(0, filter);
    fshader.setCoordinate(0, 0, coordinate0);
    fshader.setCoordinate(0, 1, coordinate1);
    return effect.createInstance(texture);
};

L5.Texture2DEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'attribute vec2 modelTCoord0;',
    'uniform mat4 PVWMatrix;',
    'varying vec2 vertexTCoord;',
    'void main (void) {',
        'gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
        'vertexTCoord = modelTCoord0;',
    '}'
].join("\n");
L5.Texture2DEffect.FragTextureUnit = 0;
L5.Texture2DEffect.FragSource = [
    'precision highp float;',
    'uniform sampler2D BaseSampler;',
    'varying vec2 vertexTCoord;',
    'void main (void) {',
        'gl_FragColor = texture2D(BaseSampler, vertexTCoord);',
    '}'
].join("\n");



/**
 * 颜色缓冲 - 效果
 *
 * @class
 * @extends {L5.VisualEffect}
 */
L5.VertexColor3Effect = function(){
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.VertexColor3", 2, 2, 1, 0, false);

    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vs.setInput(0, "modelColor", L5.Shader.VT_VEC3, L5.Shader.VS_COLOR0);
    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setProgram(L5.VertexColor3Effect.VertextSource);

    var fs = new L5.FragShader("L5.VertexColor3", 1, 1, 0, 0, false);
    fs.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.VertexColor3Effect.FragSource);

    var program = new L5.Program("L5.VertexColor3Program", vs, fs);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};

L5.nameFix(L5.VertexColor3Effect, 'VertexColor3Effect');
L5.extendFix(L5.VertexColor3Effect, L5.VisualEffect);

L5.VertexColor3Effect.prototype.createInstance = function () {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    return instance;
};

L5.VertexColor3Effect.createUniqueInstance = function () {
    var effect = new L5.VertexColor3Effect();
    return effect.createInstance();
};

L5.VertexColor3Effect.VertextSource = [
    'attribute vec3 modelPosition;',
    'attribute vec3 modelColor;',
    'uniform mat4 PVWMatrix;',
    'varying vec3 vertexColor;',
    'void main(){',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '\t vertexColor = modelColor;',
    '\t gl_PointSize = 1.0;',
    '}'
].join("\n");

L5.VertexColor3Effect.FragSource = [
    'precision highp float;',
    'varying vec3 vertexColor;',
    'void main (void) {',
    '\t gl_FragColor = vec4(vertexColor, 1.0);',
    '}'
].join("\n");





// === 片元着色器管理

/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer.prototype._bindFragShader = function(
    shader
) {
    if (!this.fragShaders.get(shader)) {
        this.fragShaders.set(shader, new L5.GLFragShader(this, shader));
    }
};
/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer._bindAllFragShader = function(
    shader
){
    this.renderers.forEach(function(r){
        r._bindFragShader(shader);
    });
};
/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer.prototype._unbindFragShader = function(
    shader
) {
    var glFShader = this.fragShaders.get(shader);
    if (glFShader) {
        glFShader.free(this.gl);
        this.fragShaders.delete(shader);
    }
};
/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer._unbindAllFragShader = function(
    shader
){
    this.renderers.forEach(function(r){
        r._unbindFragShader(shader);
    });
};
/**
 * @param shader {L5.FragShader}
 * @param mapping {Map}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._enableFragShader = function(
    shader, mapping, parameters
) {
    var glFShader = this.fragShaders.get(shader);
    if (!glFShader) {
        glFShader = new L5.GLFragShader(this, shader);
        this.fragShaders.set(shader, glFShader);
    }
    glFShader.enable(this,mapping, shader, parameters);
};
/**
 * @param shader {L5.FragShader}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._disableFragShader = function(
    shader, parameters
){
    var glFShader = this.fragShaders.get(shader);
    if (glFShader) {
        glFShader.disable(this, shader, parameters);
    }
};


/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._bindIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer._bindAllIndexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._unbindIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer._unbindAllIndexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._enableIndexBuffer = function(
    buffer
) {
    var glIBuffer = this.indexBuffers.get(buffer);
    if (!glIBuffer) {
        glIBuffer = new L5.GLIndexBuffer(this, buffer);
        this.indexBuffers.set(buffer, glIBuffer);
    }
    glIBuffer.enable(this);
};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._disableIndexBuffer = function(
    buffer
){
    var glIBuffer = this.indexBuffers.get(buffer);
    if (glIBuffer) {
        glIBuffer.disable(this);
    }
};
/**
 * @param buffer {L5.IndexBuffer}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockIndexBuffer = function(
    buffer, mode
){};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._unlockIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._updateIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer._updateAllIndexBuffer = function(
    buffer
) {};


// === 着色器程序管理

/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer.prototype._bindProgram = function (program) {
    if (!this.programs.get(program)) {
        this.programs.set(program, new L5.GLProgram(this, program));
    }
};

/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer._bindAllProgram = function (program) {
    this.renderers.forEach(function (r) {
        r._bindProgram(program);
    });
};

/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer.prototype._unbindProgram = function (program) {
    var glProgram = this.programs.get(program);
    if (glProgram) {
        glProgram.free(this.gl);
        this.programs.delete(program);
    }
};
/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer._unbindAllProgram = function (program) {
    this.renderers.forEach(function (r) {
        r._unbindProgram(program);
    });
};
/**
 * @param program {L5.Program}
 * @param vp {L5.ShaderParameters}
 * @param fp {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._enableProgram = function (program, vp, fp) {
    var glProgram = this.programs.get(program);
    if (!glProgram) {
        this._bindVertexShader(program.vertexShader);
        this._bindFragShader(program.fragShader);

        glProgram = new L5.GLProgram(
            this,
            program,
            this.vertexShaders.get(program.vertexShader),
            this.fragShaders.get(program.fragShader)
        );
        this.programs.set(program, glProgram);
    }
    glProgram.enable(this);

    // Enable the shaders.
    this._enableVertexShader(program.vertexShader, program.inputMap, vp);
    this._enableFragShader(program.fragShader,program.inputMap, fp);
};
/**
 * @param program {L5.Program}
 * @param vp {L5.ShaderParameters}
 * @param fp {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._disableProgram = function (program, vp, fp) {

    this._disableVertexShader(program.vertexShader, vp);
    this._disableFragShader(program.fragShader, fp);
    var glProgram = this.programs.get(program);
    if (glProgram) {
        glProgram.disable(this);
    }
};



// RenderTarget管理.
// The index i in ReadColor is the index of the target in a multiple render target object.
// Set the input texture pointer to null if you want ReadColor to create the
// texture.  If you provide an already existing texture, it must be of the
// correct format and size; otherwise, ReadColor creates an appropriate
// one, destroys yours, and gives you the new one.

/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._bindRenderTarget = function(
    renderTarget
) {};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer._bindAllRenderTarget = function(
    renderTarget
){};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._unbindRenderTarget = function(
    renderTarget
) {};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer._unbindAllRenderTarget = function(
    renderTarget
){};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._enableRenderTarget = function(
    renderTarget
) {};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._disableRenderTarget = function(
    renderTarget
){};

/**
 * @param i {number}
 * @param renderTarget {L5.RenderTarget}
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer.prototype.readerColor = function(
    i, renderTarget, texture
) {};



/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer.prototype._bindTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer._bindAllTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer.prototype._unbindTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer._unbindAllTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._enableTexture2D = function (texture, textureUnit) {
    var glTexture2D = this.texture2Ds.get(texture);
    if (!glTexture2D) {
        glTexture2D = new L5.GLTexture2D(this, texture);
        this.texture2Ds.set(texture, glTexture2D);
    }
    glTexture2D.enable(this, textureUnit);
};
/**
 * @param texture {L5.Texture2D}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._disableTexture2D = function (texture, textureUnit) {
    var glTexture2D = this.texture2Ds.get(texture);
    if (glTexture2D) {
        glTexture2D.disable(this, textureUnit);
    }
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockTexture2D = function (texture, level, mode) {
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._unlockTexture2D = function (texture, level) {
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._updateTexture2D = function (texture, level) {
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @private
 */
L5.Renderer._updateAllTexture2D = function (texture, level) {
};


/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer.prototype._bindTextureCube = function(
    texture
) {};
/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer._bindAllTextureCube = function(
    texture
){};
/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer.prototype._unbindTextureCube = function(
    texture
) {};
/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer._unbindAllTextureCube = function(
    texture
){};
/**
 * @param texture {L5.TextureCube}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._enableTextureCube = function(
    texture, textureUnit
) {};
/**
 * @param texture {L5.TextureCube}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._disableTextureCube = function(
    texture, textureUnit
){};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockTextureCube = function(
    texture, face, level, mode
){};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._unlockTextureCube = function(
    texture, face, level
) {};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._updateTextureCube = function(
    texture, face, level
) {};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @private
 */
L5.Renderer._updateAllTextureCube = function(
    texture, face, level
) {};


/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._bindVertexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer._bindAllVertexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._unbindVertexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer._unbindAllVertexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.VertexBuffer}
 * @param streamIndex {number}
 * @param offset {number}
 * @private
 */
L5.Renderer.prototype._enableVertexBuffer = function(
    buffer, streamIndex, offset
) {
    // TODO:  Renderer::Draw calls Enable, but using the default values
    // of 0 for streamIndex and offset.  This means that the DX9 renderer can
    // never set a streamIndex different from 1.  The DX9 and OpenGL renderers
    // always enabled the buffer starting at offset 0.  Minimally, the
    // streamIndex handling needs to be different.

    var glVBuffer = this.vertexBuffers.get(buffer);
    if (!glVBuffer) {
        glVBuffer = new L5.GLVertexBuffer(this, buffer);
        this.vertexBuffers.set(buffer, glVBuffer);
    }

    glVBuffer.enable(this, buffer.elementSize);
};
/**
 * @param buffer {L5.VertexBuffer}
 * @param streamIndex {number}
 * @private
 */
L5.Renderer.prototype._disableVertexBuffer = function(
    buffer, streamIndex
){
    var glVBuffer = this.vertexBuffers.get(buffer);
    if (glVBuffer) {
        glVBuffer.disable(this, streamIndex);
    }
};
/**
 * @param buffer {L5.VertexBuffer}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockVertexBuffer = function(
    buffer, mode
){};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._unlockVertexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._updateVertexBuffer = function(
    buffer
) {
    var glVBuffer = this.vertexBuffers.get(buffer);
    if (!glVBuffer) {
        glVBuffer = new L5.GLVertexBuffer(this, buffer);
        this.vertexBuffers.set(buffer, glVBuffer);
    }

    glVBuffer.update(this, buffer);
};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer._updateAllVertexBuffer = function(
    buffer
) {
    L5.Renderer.renderers.forEach(function(renderer){
       renderer._updateVertexBuffer(buffer);
    });
};

/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._bindVertexFormat = function(
    format
) {
    if (!this.vertexFormats.has(format)) {
        this.vertexFormats.set(format, new L5.GLVertexFormat(this, format));
    }
};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer._bindAllVertexFormat = function(
    format
){};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._unbindVertexFormat = function(
    format
) {};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer._unbindAllVertexFormat = function(
    format
){};
/**
 * @param format {L5.VertexFormat}
 * @param program {L5.Program}
 * @private
 */
L5.Renderer.prototype._enableVertexFormat = function(
    format, program
) {
    var glFormat = this.vertexFormats.get(format);
    if (!glFormat) {
        glFormat = new L5.GLVertexFormat(this, format, program);
        this.vertexFormats.set(format, glFormat);
    }
    glFormat.enable(this);
};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._disableVertexFormat = function(
    format, vp, fp
){
    var glFormat = this.vertexFormats.get(format);
    if (glFormat) {
        glFormat.disable(this);
    }
};

// TODO.
// ShaderParameters should be another resource, mapped to
// "constant buffers".  Add these to the renderer.  When ready, remove the
// ShaderParameters inputs to Enable/Disable of shaders and set up a block
// of Bind/Unbind/Enable/Disable functions.

// === 顶点着色器管理

/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer.prototype._bindVertexShader = function(
    shader
) {
    if (!this.vertexShaders.get(shader)) {
        this.vertexShaders.set(shader, new L5.GLVertexShader(this, shader));
    }
};
/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer._bindAllVertexShader = function(
    shader
){};
/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer.prototype._unbindVertexShader = function(
    shader
) {};
/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer._unbindAllVertexShader = function(
    shader
){};
/**
 * @param shader {L5.VertexShader}
 * @param program {Map}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._enableVertexShader = function(
    shader, mapping, parameters
) {
    var glVShader = this.vertexShaders.get(shader);
    if (!glVShader) {
        glVShader = new L5.GLVertexShader(this, shader);
        this.vertexShaders.set(shader, glVShader);
    }

    glVShader.enable(this, mapping, shader, parameters);
};
/**
 * @param shader {L5.VertexShader}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._disableVertexShader = function(
    shader, parameters
){
    var glVShader = this.vertexShaders.get(shader);
    if (glVShader) {
        glVShader.disable(this, shader, parameters);
    }
};


L5.GLExtensions = {_extensions: {}};

L5.GLExtensions.init = function (gl) {
    var exts = this._extensions;
    gl.getSupportedExtensions ().forEach (function (name) {
        if (name.match (/^(?:WEBKIT_)|(?:MOZ_)/)) {
            return;
        }
        exts[ name ] = gl.getExtension (name);
    });

    if (exts.ANGLE_instanced_arrays) {
        L5.Webgl.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 0x88FE;
    }

    if (exts.EXT_blend_minmax) {
        L5.Webgl.MIN_EXT = 0x8007;
        L5.Webgl.MAX_EXT = 0x8008;
    }

    if (exts.EXT_sRGB) {
        L5.Webgl.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT = 0x8210;
        L5.Webgl.SRGB_EXT                                  = 0x8C40;
        L5.Webgl.SRGB_ALPHA_EXT                            = 0x8C42;
        L5.Webgl.SRGB8_ALPHA8_EXT                          = 0x8C43;
    }

    if (exts.EXT_texture_filter_anisotropic) {
        L5.Webgl.TEXTURE_MAX_ANISOTROPY_EXT     = 0x84FE;
        L5.Webgl.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;
    }

    if (exts.OES_standard_derivatives) {
        L5.Webgl.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;
    }

    if (exts.OES_texture_half_float) {
        L5.Webgl.HALF_FLOAT_OES = 0x8D61;
    }

    if (exts.OES_vertex_array_object) {
        L5.Webgl.VERTEX_ARRAY_BINDING_OES = 0x85B5;
    }

    if (exts.WEBGL_compressed_texture_s3tc) {
        L5.Webgl.COMPRESSED_RGB_S3TC_DXT1_EXT  = 0x83F0;
        L5.Webgl.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
        L5.Webgl.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
        L5.Webgl.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    }

    if (exts.WEBGL_depth_texture) {
        L5.Webgl.UNSIGNED_INT_24_8_WEBGL = 0x84FA;
    }

    if (exts.WEBGL_draw_buffers) {
        L5.Webgl.MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF;
        L5.Webgl.COLOR_ATTACHMENT0_WEBGL     = 0x8CE0;
        L5.Webgl.COLOR_ATTACHMENT1_WEBGL     = 0x8CE1;
        L5.Webgl.COLOR_ATTACHMENT2_WEBGL     = 0x8CE2;
        L5.Webgl.COLOR_ATTACHMENT3_WEBGL     = 0x8CE3;
        L5.Webgl.COLOR_ATTACHMENT4_WEBGL     = 0x8CE4;
        L5.Webgl.COLOR_ATTACHMENT5_WEBGL     = 0x8CE5;
        L5.Webgl.COLOR_ATTACHMENT6_WEBGL     = 0x8CE6;
        L5.Webgl.COLOR_ATTACHMENT7_WEBGL     = 0x8CE7;
        L5.Webgl.COLOR_ATTACHMENT8_WEBGL     = 0x8CE8;
        L5.Webgl.COLOR_ATTACHMENT9_WEBGL     = 0x8CE9;
        L5.Webgl.COLOR_ATTACHMENT10_WEBGL    = 0x8CEA;
        L5.Webgl.COLOR_ATTACHMENT11_WEBGL    = 0x8CEB;
        L5.Webgl.COLOR_ATTACHMENT12_WEBGL    = 0x8CEC;
        L5.Webgl.COLOR_ATTACHMENT13_WEBGL    = 0x8CED;
        L5.Webgl.COLOR_ATTACHMENT14_WEBGL    = 0x8CEF;
        L5.Webgl.COLOR_ATTACHMENT15_WEBGL    = 0x8CF0;
        L5.Webgl.MAX_DRAW_BUFFERS_WEBGL      = 0x8824;
        L5.Webgl.DRAW_BUFFER0_WEBGL          = 0x8825;
        L5.Webgl.DRAW_BUFFER1_WEBGL          = 0x8826;
        L5.Webgl.DRAW_BUFFER2_WEBGL          = 0x8827;
        L5.Webgl.DRAW_BUFFER3_WEBGL          = 0x8828;
        L5.Webgl.DRAW_BUFFER4_WEBGL          = 0x8829;
        L5.Webgl.DRAW_BUFFER5_WEBGL          = 0x882A;
        L5.Webgl.DRAW_BUFFER6_WEBGL          = 0x882B;
        L5.Webgl.DRAW_BUFFER7_WEBGL          = 0x882C;
        L5.Webgl.DRAW_BUFFER8_WEBGL          = 0x882D;
        L5.Webgl.DRAW_BUFFER9_WEBGL          = 0x882E;
        L5.Webgl.DRAW_BUFFER10_WEBGL         = 0x882F;
        L5.Webgl.DRAW_BUFFER11_WEBGL         = 0x8830;
        L5.Webgl.DRAW_BUFFER12_WEBGL         = 0x8831;
        L5.Webgl.DRAW_BUFFER13_WEBGL         = 0x8832;
        L5.Webgl.DRAW_BUFFER14_WEBGL         = 0x8833;
        L5.Webgl.DRAW_BUFFER15_WEBGL         = 0x8834;
    }
};

/**
 * FragShader 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param shader {L5.VertexShader}
 * @class
 * @extends {L5.GLShader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLFragShader = function (
    renderer, shader
) {
    L5.GLShader.call(this);
    var gl      = renderer.gl;
    this.shader = gl.createShader(gl.FRAGMENT_SHADER);

    var programText = shader.getProgram();

    gl.shaderSource(this.shader, programText);
    gl.compileShader(this.shader);

    L5.assert(
        gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
        gl.getShaderInfoLog(this.shader)
    );
};
L5.nameFix (L5.GLFragShader, 'GLFragShader');
L5.extendFix(L5.GLFragShader, L5.GLShader);

/**
 * 释放持有的GL资源
 *
 * @param gl {WebGLRenderingContext}
 */
L5.GLFragShader.prototype.free = function (gl){
    gl.deleteShader(this.shader);
    delete this.shader;
};

/**
 * @param shader {L5.FragShader}
 * @param mapping {Map}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLFragShader.prototype.enable  = function (
    renderer, mapping, shader, parameters
) {
    var gl = renderer.gl;
    // step1. 遍历顶点着色器常量
    var numConstants = shader.numConstants;
    for (var i = 0; i < numConstants; ++i) {
        var locating = mapping.get(shader.getConstantName(i));
        var funcName = shader.getConstantFuncName(i);
        var data = parameters.getConstant(i).data;
        if (data.length > 4) {
            gl[funcName](locating, false, data);
        } else {
            gl[funcName](locating, data);
        }
    }

    this.setSamplerState(renderer, shader, parameters, renderer.data.maxFShaderImages, renderer.data.currentSS);
};
/**
 * @param shader {L5.FragShader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLFragShader.prototype.disable = function (
    renderer, shader, parameters
) {
    var gl = renderer.gl;
    this.disableTexture(renderer, shader, parameters, renderer.data.maxFShaderImages);
};

/**
 * IndexBuffer 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param buffer {L5.IndexBuffer}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLIndexBuffer = function (
    renderer, buffer
) {
    var gl      = renderer.gl;
    this.buffer = gl.createBuffer ();
    var dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData ().buffer), L5.Webgl.BufferUsage[ buffer.usage ]);
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, null);
};
L5.nameFix (L5.GLIndexBuffer, 'GLIndexBuffer');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLIndexBuffer.prototype.enable  = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.buffer);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLIndexBuffer.prototype.disable = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, null);
};

L5.Webgl = {};
(function () {
    /* ClearBufferMask */
    L5.Webgl.DEPTH_BUFFER_BIT   = 0x00000100;
    L5.Webgl.STENCIL_BUFFER_BIT = 0x00000400;
    L5.Webgl.COLOR_BUFFER_BIT   = 0x00004000;

    /* BeginMode */
    L5.Webgl.POINTS         = 0x0000;
    L5.Webgl.LINES          = 0x0001;
    L5.Webgl.LINE_LOOP      = 0x0002;
    L5.Webgl.LINE_STRIP     = 0x0003;
    L5.Webgl.TRIANGLES      = 0x0004;
    L5.Webgl.TRIANGLE_STRIP = 0x0005;
    L5.Webgl.TRIANGLE_FAN   = 0x0006;

    /* AlphaFunction (not supported in ES20) */
    /*      NEVER */
    /*      LESS */
    /*      EQUAL */
    /*      LEQUAL */
    /*      GREATER */
    /*      NOTEQUAL */
    /*      GEQUAL */
    /*      ALWAYS */

    /* BlendingFactorDest */
    L5.Webgl.ZERO                = 0;
    L5.Webgl.ONE                 = 1;
    L5.Webgl.SRC_COLOR           = 0x0300;
    L5.Webgl.ONE_MINUS_SRC_COLOR = 0x0301;
    L5.Webgl.SRC_ALPHA           = 0x0302;
    L5.Webgl.ONE_MINUS_SRC_ALPHA = 0x0303;
    L5.Webgl.DST_ALPHA           = 0x0304;
    L5.Webgl.ONE_MINUS_DST_ALPHA = 0x0305;

    /* BlendingFactorSrc */
    /*      ZERO */
    /*      ONE */
    L5.Webgl.DST_COLOR           = 0x0306;
    L5.Webgl.ONE_MINUS_DST_COLOR = 0x0307;
    L5.Webgl.SRC_ALPHA_SATURATE  = 0x0308;
    /*      SRC_ALPHA */
    /*      ONE_MINUS_SRC_ALPHA */
    /*      DST_ALPHA */
    /*      ONE_MINUS_DST_ALPHA */

    /* BlendEquationSeparate */
    L5.Webgl.FUNC_ADD           = 0x8006;
    L5.Webgl.BLEND_EQUATION     = 0x8009;
    L5.Webgl.BLEND_EQUATION_RGB = 0x8009;
    /* same as BLEND_EQUATION */
    L5.Webgl.BLEND_EQUATION_ALPHA = 0x883D;

    /* BlendSubtract */
    L5.Webgl.FUNC_SUBTRACT         = 0x800A;
    L5.Webgl.FUNC_REVERSE_SUBTRACT = 0x800B;

    /* Separate Blend Functions */
    L5.Webgl.BLEND_DST_RGB            = 0x80C8;
    L5.Webgl.BLEND_SRC_RGB            = 0x80C9;
    L5.Webgl.BLEND_DST_ALPHA          = 0x80CA;
    L5.Webgl.BLEND_SRC_ALPHA          = 0x80CB;
    L5.Webgl.CONSTANT_COLOR           = 0x8001;
    L5.Webgl.ONE_MINUS_CONSTANT_COLOR = 0x8002;
    L5.Webgl.CONSTANT_ALPHA           = 0x8003;
    L5.Webgl.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
    L5.Webgl.BLEND_COLOR              = 0x8005;

    /* Buffer Objects */
    L5.Webgl.ARRAY_BUFFER                 = 0x8892;
    L5.Webgl.ELEMENT_ARRAY_BUFFER         = 0x8893;
    L5.Webgl.ARRAY_BUFFER_BINDING         = 0x8894;
    L5.Webgl.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

    L5.Webgl.STREAM_DRAW  = 0x88E0;
    L5.Webgl.STATIC_DRAW  = 0x88E4;
    L5.Webgl.DYNAMIC_DRAW = 0x88E8;

    L5.Webgl.BUFFER_SIZE  = 0x8764;
    L5.Webgl.BUFFER_USAGE = 0x8765;

    L5.Webgl.CURRENT_VERTEX_ATTRIB = 0x8626;

    /* CullFaceMode */
    L5.Webgl.FRONT          = 0x0404;
    L5.Webgl.BACK           = 0x0405;
    L5.Webgl.FRONT_AND_BACK = 0x0408;

    /* DepthFunction */
    /*      NEVER */
    /*      LESS */
    /*      EQUAL */
    /*      LEQUAL */
    /*      GREATER */
    /*      NOTEQUAL */
    /*      GEQUAL */
    /*      ALWAYS */

    /* EnableCap */
    /* TEXTURE_2D */
    L5.Webgl.CULL_FACE                = 0x0B44;
    L5.Webgl.BLEND                    = 0x0BE2;
    L5.Webgl.DITHER                   = 0x0BD0;
    L5.Webgl.STENCIL_TEST             = 0x0B90;
    L5.Webgl.DEPTH_TEST               = 0x0B71;
    L5.Webgl.SCISSOR_TEST             = 0x0C11;
    L5.Webgl.POLYGON_OFFSET_FILL      = 0x8037;
    L5.Webgl.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
    L5.Webgl.SAMPLE_COVERAGE          = 0x80A0;

    /* ErrorCode */
    L5.Webgl.NO_ERROR          = 0;
    L5.Webgl.INVALID_ENUM      = 0x0500;
    L5.Webgl.INVALID_VALUE     = 0x0501;
    L5.Webgl.INVALID_OPERATION = 0x0502;
    L5.Webgl.OUT_OF_MEMORY     = 0x0505;

    /* FrontFaceDirection */
    L5.Webgl.CW  = 0x0900;
    L5.Webgl.CCW = 0x0901;

    /* GetPName */
    L5.Webgl.LINE_WIDTH                   = 0x0B21;
    L5.Webgl.ALIASED_POINT_SIZE_RANGE     = 0x846D;
    L5.Webgl.ALIASED_LINE_WIDTH_RANGE     = 0x846E;
    L5.Webgl.CULL_FACE_MODE               = 0x0B45;
    L5.Webgl.FRONT_FACE                   = 0x0B46;
    L5.Webgl.DEPTH_RANGE                  = 0x0B70;
    L5.Webgl.DEPTH_WRITEMASK              = 0x0B72;
    L5.Webgl.DEPTH_CLEAR_VALUE            = 0x0B73;
    L5.Webgl.DEPTH_FUNC                   = 0x0B74;
    L5.Webgl.STENCIL_CLEAR_VALUE          = 0x0B91;
    L5.Webgl.STENCIL_FUNC                 = 0x0B92;
    L5.Webgl.STENCIL_FAIL                 = 0x0B94;
    L5.Webgl.STENCIL_PASS_DEPTH_FAIL      = 0x0B95;
    L5.Webgl.STENCIL_PASS_DEPTH_PASS      = 0x0B96;
    L5.Webgl.STENCIL_REF                  = 0x0B97;
    L5.Webgl.STENCIL_VALUE_MASK           = 0x0B93;
    L5.Webgl.STENCIL_WRITEMASK            = 0x0B98;
    L5.Webgl.STENCIL_BACK_FUNC            = 0x8800;
    L5.Webgl.STENCIL_BACK_FAIL            = 0x8801;
    L5.Webgl.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
    L5.Webgl.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
    L5.Webgl.STENCIL_BACK_REF             = 0x8CA3;
    L5.Webgl.STENCIL_BACK_VALUE_MASK      = 0x8CA4;
    L5.Webgl.STENCIL_BACK_WRITEMASK       = 0x8CA5;
    L5.Webgl.VIEWPORT                     = 0x0BA2;
    L5.Webgl.SCISSOR_BOX                  = 0x0C10;
    /*      SCISSOR_TEST */
    L5.Webgl.COLOR_CLEAR_VALUE    = 0x0C22;
    L5.Webgl.COLOR_WRITEMASK      = 0x0C23;
    L5.Webgl.UNPACK_ALIGNMENT     = 0x0CF5;
    L5.Webgl.PACK_ALIGNMENT       = 0x0D05;
    L5.Webgl.MAX_TEXTURE_SIZE     = 0x0D33;
    L5.Webgl.MAX_VIEWPORT_DIMS    = 0x0D3A;
    L5.Webgl.SUBPIXEL_BITS        = 0x0D50;
    L5.Webgl.RED_BITS             = 0x0D52;
    L5.Webgl.GREEN_BITS           = 0x0D53;
    L5.Webgl.BLUE_BITS            = 0x0D54;
    L5.Webgl.ALPHA_BITS           = 0x0D55;
    L5.Webgl.DEPTH_BITS           = 0x0D56;
    L5.Webgl.STENCIL_BITS         = 0x0D57;
    L5.Webgl.POLYGON_OFFSET_UNITS = 0x2A00;
    /*      POLYGON_OFFSET_FILL */
    L5.Webgl.POLYGON_OFFSET_FACTOR  = 0x8038;
    L5.Webgl.TEXTURE_BINDING_2D     = 0x8069;
    L5.Webgl.SAMPLE_BUFFERS         = 0x80A8;
    L5.Webgl.SAMPLES                = 0x80A9;
    L5.Webgl.SAMPLE_COVERAGE_VALUE  = 0x80AA;
    L5.Webgl.SAMPLE_COVERAGE_INVERT = 0x80AB;

    /* GetTextureParameter */
    /*      TEXTURE_MAG_FILTER */
    /*      TEXTURE_MIN_FILTER */
    /*      TEXTURE_WRAP_S */
    /*      TEXTURE_WRAP_T */

    L5.Webgl.COMPRESSED_TEXTURE_FORMATS = 0x86A3;

    /* HintMode */
    L5.Webgl.DONT_CARE = 0x1100;
    L5.Webgl.FASTEST   = 0x1101;
    L5.Webgl.NICEST    = 0x1102;

    /* HintTarget */
    L5.Webgl.GENERATE_MIPMAP_HINT = 0x8192;

    /* DataType */
    L5.Webgl.BYTE           = 0x1400;
    L5.Webgl.UNSIGNED_BYTE  = 0x1401;
    L5.Webgl.SHORT          = 0x1402;
    L5.Webgl.UNSIGNED_SHORT = 0x1403;
    L5.Webgl.INT            = 0x1404;
    L5.Webgl.UNSIGNED_INT   = 0x1405;
    L5.Webgl.FLOAT          = 0x1406;

    /* PixelFormat */
    L5.Webgl.DEPTH_COMPONENT = 0x1902;
    L5.Webgl.ALPHA           = 0x1906;
    L5.Webgl.RGB             = 0x1907;
    L5.Webgl.RGBA            = 0x1908;
    L5.Webgl.LUMINANCE       = 0x1909;
    L5.Webgl.LUMINANCE_ALPHA = 0x190A;

    /* PixelType */
    /*      UNSIGNED_BYTE */
    L5.Webgl.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
    L5.Webgl.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
    L5.Webgl.UNSIGNED_SHORT_5_6_5   = 0x8363;

    /* Shaders */
    L5.Webgl.FRAGMENT_SHADER                  = 0x8B30;
    L5.Webgl.VERTEX_SHADER                    = 0x8B31;
    L5.Webgl.MAX_VERTEX_ATTRIBS               = 0x8869;
    L5.Webgl.MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
    L5.Webgl.MAX_VARYING_VECTORS              = 0x8DFC;
    L5.Webgl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
    L5.Webgl.MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
    L5.Webgl.MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
    L5.Webgl.MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
    L5.Webgl.SHADER_TYPE                      = 0x8B4F;
    L5.Webgl.DELETE_STATUS                    = 0x8B80;
    L5.Webgl.LINK_STATUS                      = 0x8B82;
    L5.Webgl.VALIDATE_STATUS                  = 0x8B83;
    L5.Webgl.ATTACHED_SHADERS                 = 0x8B85;
    L5.Webgl.ACTIVE_UNIFORMS                  = 0x8B86;
    L5.Webgl.ACTIVE_ATTRIBUTES                = 0x8B89;
    L5.Webgl.SHADING_LANGUAGE_VERSION         = 0x8B8C;
    L5.Webgl.CURRENT_PROGRAM                  = 0x8B8D;

    /* StencilFunction */
    L5.Webgl.NEVER    = 0x0200;
    L5.Webgl.LESS     = 0x0201;
    L5.Webgl.EQUAL    = 0x0202;
    L5.Webgl.LEQUAL   = 0x0203;
    L5.Webgl.GREATER  = 0x0204;
    L5.Webgl.NOTEQUAL = 0x0205;
    L5.Webgl.GEQUAL   = 0x0206;
    L5.Webgl.ALWAYS   = 0x0207;

    /* StencilOp */
    /*      ZERO */
    L5.Webgl.KEEP      = 0x1E00;
    L5.Webgl.REPLACE   = 0x1E01;
    L5.Webgl.INCR      = 0x1E02;
    L5.Webgl.DECR      = 0x1E03;
    L5.Webgl.INVERT    = 0x150A;
    L5.Webgl.INCR_WRAP = 0x8507;
    L5.Webgl.DECR_WRAP = 0x8508;

    /* StringName */
    L5.Webgl.VENDOR   = 0x1F00;
    L5.Webgl.RENDERER = 0x1F01;
    L5.Webgl.VERSION  = 0x1F02;

    /* TextureMagFilter */
    L5.Webgl.NEAREST = 0x2600;
    L5.Webgl.LINEAR  = 0x2601;

    /* TextureMinFilter */
    /*      NEAREST */
    /*      LINEAR */
    L5.Webgl.NEAREST_MIPMAP_NEAREST = 0x2700;
    L5.Webgl.LINEAR_MIPMAP_NEAREST  = 0x2701;
    L5.Webgl.NEAREST_MIPMAP_LINEAR  = 0x2702;
    L5.Webgl.LINEAR_MIPMAP_LINEAR   = 0x2703;

    /* TextureParameterName */
    L5.Webgl.TEXTURE_MAG_FILTER = 0x2800;
    L5.Webgl.TEXTURE_MIN_FILTER = 0x2801;
    L5.Webgl.TEXTURE_WRAP_S     = 0x2802;
    L5.Webgl.TEXTURE_WRAP_T     = 0x2803;

    /* TextureTarget */
    L5.Webgl.TEXTURE_2D                  = 0x0DE1;
    L5.Webgl.TEXTURE                     = 0x1702;
    L5.Webgl.TEXTURE_CUBE_MAP            = 0x8513;
    L5.Webgl.TEXTURE_BINDING_CUBE_MAP    = 0x8514;
    L5.Webgl.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
    L5.Webgl.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
    L5.Webgl.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
    L5.Webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
    L5.Webgl.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
    L5.Webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
    L5.Webgl.MAX_CUBE_MAP_TEXTURE_SIZE   = 0x851C;

    /* TextureUnit */
    L5.Webgl.TEXTURE0       = 0x84C0;
    L5.Webgl.TEXTURE1       = 0x84C1;
    L5.Webgl.TEXTURE2       = 0x84C2;
    L5.Webgl.TEXTURE3       = 0x84C3;
    L5.Webgl.TEXTURE4       = 0x84C4;
    L5.Webgl.TEXTURE5       = 0x84C5;
    L5.Webgl.TEXTURE6       = 0x84C6;
    L5.Webgl.TEXTURE7       = 0x84C7;
    L5.Webgl.TEXTURE8       = 0x84C8;
    L5.Webgl.TEXTURE9       = 0x84C9;
    L5.Webgl.TEXTURE10      = 0x84CA;
    L5.Webgl.TEXTURE11      = 0x84CB;
    L5.Webgl.TEXTURE12      = 0x84CC;
    L5.Webgl.TEXTURE13      = 0x84CD;
    L5.Webgl.TEXTURE14      = 0x84CE;
    L5.Webgl.TEXTURE15      = 0x84CF;
    L5.Webgl.TEXTURE16      = 0x84D0;
    L5.Webgl.TEXTURE17      = 0x84D1;
    L5.Webgl.TEXTURE18      = 0x84D2;
    L5.Webgl.TEXTURE19      = 0x84D3;
    L5.Webgl.TEXTURE20      = 0x84D4;
    L5.Webgl.TEXTURE21      = 0x84D5;
    L5.Webgl.TEXTURE22      = 0x84D6;
    L5.Webgl.TEXTURE23      = 0x84D7;
    L5.Webgl.TEXTURE24      = 0x84D8;
    L5.Webgl.TEXTURE25      = 0x84D9;
    L5.Webgl.TEXTURE26      = 0x84DA;
    L5.Webgl.TEXTURE27      = 0x84DB;
    L5.Webgl.TEXTURE28      = 0x84DC;
    L5.Webgl.TEXTURE29      = 0x84DD;
    L5.Webgl.TEXTURE30      = 0x84DE;
    L5.Webgl.TEXTURE31      = 0x84DF;
    L5.Webgl.ACTIVE_TEXTURE = 0x84E0;

    /* TextureWrapMode */
    L5.Webgl.REPEAT          = 0x2901;
    L5.Webgl.CLAMP_TO_EDGE   = 0x812F;
    L5.Webgl.MIRRORED_REPEAT = 0x8370;

    /* Uniform Types */
    L5.Webgl.FLOAT_VEC2   = 0x8B50;
    L5.Webgl.FLOAT_VEC3   = 0x8B51;
    L5.Webgl.FLOAT_VEC4   = 0x8B52;
    L5.Webgl.INT_VEC2     = 0x8B53;
    L5.Webgl.INT_VEC3     = 0x8B54;
    L5.Webgl.INT_VEC4     = 0x8B55;
    L5.Webgl.BOOL         = 0x8B56;
    L5.Webgl.BOOL_VEC2    = 0x8B57;
    L5.Webgl.BOOL_VEC3    = 0x8B58;
    L5.Webgl.BOOL_VEC4    = 0x8B59;
    L5.Webgl.FLOAT_MAT2   = 0x8B5A;
    L5.Webgl.FLOAT_MAT3   = 0x8B5B;
    L5.Webgl.FLOAT_MAT4   = 0x8B5C;
    L5.Webgl.SAMPLER_2D   = 0x8B5E;
    L5.Webgl.SAMPLER_CUBE = 0x8B60;

    /* Vertex Arrays */
    L5.Webgl.VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

    /* Read Format */
    L5.Webgl.IMPLEMENTATION_COLOR_READ_TYPE   = 0x8B9A;
    L5.Webgl.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

    /* Shader Source */
    L5.Webgl.COMPILE_STATUS = 0x8B81;

    /* Shader Precision-Specified Types */
    L5.Webgl.LOW_FLOAT    = 0x8DF0;
    L5.Webgl.MEDIUM_FLOAT = 0x8DF1;
    L5.Webgl.HIGH_FLOAT   = 0x8DF2;
    L5.Webgl.LOW_INT      = 0x8DF3;
    L5.Webgl.MEDIUM_INT   = 0x8DF4;
    L5.Webgl.HIGH_INT     = 0x8DF5;

    /* Framebuffer Object. */
    L5.Webgl.FRAMEBUFFER  = 0x8D40;
    L5.Webgl.RENDERBUFFER = 0x8D41;

    L5.Webgl.RGBA4             = 0x8056;
    L5.Webgl.RGB5_A1           = 0x8057;
    L5.Webgl.RGB565            = 0x8D62;
    L5.Webgl.DEPTH_COMPONENT16 = 0x81A5;
    L5.Webgl.STENCIL_INDEX     = 0x1901;
    L5.Webgl.STENCIL_INDEX8    = 0x8D48;
    L5.Webgl.DEPTH_STENCIL     = 0x84F9;

    L5.Webgl.RENDERBUFFER_WIDTH           = 0x8D42;
    L5.Webgl.RENDERBUFFER_HEIGHT          = 0x8D43;
    L5.Webgl.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
    L5.Webgl.RENDERBUFFER_RED_SIZE        = 0x8D50;
    L5.Webgl.RENDERBUFFER_GREEN_SIZE      = 0x8D51;
    L5.Webgl.RENDERBUFFER_BLUE_SIZE       = 0x8D52;
    L5.Webgl.RENDERBUFFER_ALPHA_SIZE      = 0x8D53;
    L5.Webgl.RENDERBUFFER_DEPTH_SIZE      = 0x8D54;
    L5.Webgl.RENDERBUFFER_STENCIL_SIZE    = 0x8D55;

    L5.Webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
    L5.Webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
    L5.Webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
    L5.Webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

    L5.Webgl.COLOR_ATTACHMENT0        = 0x8CE0;
    L5.Webgl.DEPTH_ATTACHMENT         = 0x8D00;
    L5.Webgl.STENCIL_ATTACHMENT       = 0x8D20;
    L5.Webgl.DEPTH_STENCIL_ATTACHMENT = 0x821A;

    L5.Webgl.NONE = 0;

    L5.Webgl.FRAMEBUFFER_COMPLETE                      = 0x8CD5;
    L5.Webgl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
    L5.Webgl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
    L5.Webgl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
    L5.Webgl.FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;
    L5.Webgl.FRAMEBUFFER_BINDING                       = 0x8CA6;
    L5.Webgl.RENDERBUFFER_BINDING                      = 0x8CA7;
    L5.Webgl.MAX_RENDERBUFFER_SIZE                     = 0x84E8;

    L5.Webgl.INVALID_FRAMEBUFFER_OPERATION = 0x0506;

    /* WebGL-specific enums */
    L5.Webgl.UNPACK_FLIP_Y_WEBGL                = 0x9240;
    L5.Webgl.UNPACK_PREMULTIPLY_ALPHA_WEBGL     = 0x9241;
    L5.Webgl.CONTEXT_LOST_WEBGL                 = 0x9242;
    L5.Webgl.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
    L5.Webgl.BROWSER_DEFAULT_WEBGL              = 0x9244;

    var NS = L5.Webgl;

    // 属性数据类型
    L5.Webgl.AttributeType = [
        0,                          // AT_NONE (unsupported)
        NS.FLOAT,                   // AT_FLOAT1
        NS.FLOAT,                   // AT_FLOAT2
        NS.FLOAT,                   // AT_FLOAT3
        NS.FLOAT,                   // AT_FLOAT4
        NS.UNSIGNED_BYTE,           // AT_UBYTE4
        NS.SHORT,                   // AT_SHORT1
        NS.SHORT,                   // AT_SHORT2
        NS.SHORT                    // AT_SHORT4
    ];

    // 属性尺寸
    L5.Webgl.AttributeSize = [
        0,  // AT_NONE (unsupported)
        1,  // AT_FLOAT1
        2,  // AT_FLOAT2
        3,  // AT_FLOAT3
        4,  // AT_FLOAT4
        4,  // AT_UBYTE4
        1,  // AT_SHORT1
        2,  // AT_SHORT2
        4   // AT_SHORT4
    ];

    // 缓冲使用方式
    L5.Webgl.BufferUsage = [
        NS.STATIC_DRAW,     // BU_STATIC
        NS.DYNAMIC_DRAW,    // BU_DYNAMIC
        NS.DYNAMIC_DRAW,    // BU_RENDERTARGET
        NS.DYNAMIC_DRAW,    // BU_DEPTHSTENCIL
        NS.DYNAMIC_DRAW     // BU_TEXTURE
    ];

    // 纹理目标
    L5.Webgl.TextureTarget = [
        0,                   // ST_NONE
        NS.TEXTURE_2D,       // ST_2D
        NS.TEXTURE_3D,       // ST_3D
        NS.TEXTURE_CUBE_MAP, // ST_CUBE
        NS.TEXTURE_2D_ARRAY  // ST_2D_ARRAY
    ];

    // 纹理包装方式
    L5.Webgl.WrapMode = [
        NS.CLAMP_TO_EDGE,   // SC_NONE
        NS.REPEAT,          // SC_REPEAT
        NS.MIRRORED_REPEAT, // SC_MIRRORED_REPEAT
        NS.CLAMP_TO_EDGE    // SC_CLAMP_EDGE
    ];

    L5.Webgl.DepthCompare = [
        NS.NEVER,       // CM_NEVER
        NS.LESS,        // CM_LESS
        NS.EQUAL,       // CM_EQUAL
        NS.LEQUAL,      // CM_LEQUAL
        NS.GREATER,     // CM_GREATER
        NS.NOTEQUAL,    // CM_NOTEQUAL
        NS.GEQUAL,      // CM_GEQUAL
        NS.ALWAYS       // CM_ALWAYS
    ];

    L5.Webgl.StencilCompare = [
        NS.NEVER,       // CM_NEVER
        NS.LESS,        // CM_LESS
        NS.EQUAL,       // CM_EQUAL
        NS.LEQUAL,      // CM_LEQUAL
        NS.GREATER,     // CM_GREATER
        NS.NOTEQUAL,    // CM_NOTEQUAL
        NS.GEQUAL,      // CM_GEQUAL
        NS.ALWAYS       // CM_ALWAYS
    ];

    L5.Webgl.StencilOperation = [
        NS.KEEP,    // OT_KEEP
        NS.ZERO,    // OT_ZERO
        NS.REPLACE, // OT_REPLACE
        NS.INCR,    // OT_INCREMENT
        NS.DECR,    // OT_DECREMENT
        NS.INVERT   // OT_INVERT
    ];

    // 透明通道混合
    L5.Webgl.AlphaBlend = [
        NS.ZERO,
        NS.ONE,
        NS.SRC_COLOR,
        NS.ONE_MINUS_SRC_COLOR,
        NS.DST_COLOR,
        NS.ONE_MINUS_DST_COLOR,
        NS.SRC_ALPHA,
        NS.ONE_MINUS_SRC_ALPHA,
        NS.DST_ALPHA,
        NS.ONE_MINUS_DST_ALPHA,
        NS.SRC_ALPHA_SATURATE,
        NS.CONSTANT_COLOR,
        NS.ONE_MINUS_CONSTANT_COLOR,
        NS.CONSTANT_ALPHA,
        NS.ONE_MINUS_CONSTANT_ALPHA
    ];

    L5.Webgl.TextureFilter = [
        0,                          // SF_NONE
        NS.NEAREST,                 // SF_NEAREST
        NS.LINEAR,                  // SF_LINEAR
        NS.NEAREST_MIPMAP_NEAREST,  // SF_NEAREST_NEAREST
        NS.NEAREST_MIPMAP_LINEAR,   // SF_NEAREST_LINEAR
        NS.LINEAR_MIPMAP_NEAREST,   // SF_LINEAR_NEAREST
        NS.LINEAR_MIPMAP_LINEAR     // SF_LINEAR_LINEAR
    ];

    L5.Webgl.TextureFormat = [
        0,                                  // TF_NONE
        NS.RGB,                             // TF_R5G6B5
        NS.RGBA,                            // TF_A1R5G5B5
        NS.RGBA,                            // TF_A4R4G4B4
        NS.ALPHA,                           // TF_A8
        NS.LUMINANCE,                       // TF_L8
        NS.LUMINANCE_ALPHA,                 // TF_A8L8
        NS.RGB,                             // TF_R8G8B8
        NS.RGBA,                            // TF_A8R8G8B8
        NS.RGBA,                            // TF_A8B8G8R8
        NS.LUMINANCE,                       // TF_L16
        0,                                  // TF_G16R16
        NS.RGBA,                            // TF_A16B16G16R16
        0,                                  // TF_R16F
        0,                                  // TF_G16R16F
        NS.RGBA,                            // TF_A16B16G16R16F
        0,                                  // TF_R32F
        0,                                  // TF_G32R32F
        NS.RGBA,                            // TF_A32B32G32R32F
        NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
        NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
        NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
        NS.UNSIGNED_INT_24_8_WEBGL          // TF_D24S8
    ];

    L5.Webgl.TextureType =[
        0,                              // TF_NONE
        NS.UNSIGNED_SHORT_5_6_5,        // TF_R5G6B5
        NS.UNSIGNED_SHORT_1_5_5_5,      // TF_A1R5G5B5
        NS.UNSIGNED_SHORT_4_4_4_4,      // TF_A4R4G4B4
        NS.UNSIGNED_BYTE,               // TF_A8
        NS.UNSIGNED_BYTE,               // TF_L8
        NS.UNSIGNED_BYTE,               // TF_A8L8
        NS.UNSIGNED_BYTE,               // TF_R8G8B8
        NS.UNSIGNED_BYTE,               // TF_A8R8G8B8
        NS.UNSIGNED_BYTE,               // TF_A8B8G8R8
        NS.UNSIGNED_SHORT,              // TF_L16
        NS.UNSIGNED_SHORT,              // TF_G16R16
        NS.UNSIGNED_SHORT,              // TF_A16B16G16R16
        NS.HALF_FLOAT_OES,              // TF_R16F
        NS.HALF_FLOAT_OES,              // TF_G16R16F
        NS.HALF_FLOAT_OES,              // TF_A16B16G16R16F
        NS.FLOAT,                       // TF_R32F
        NS.FLOAT,                       // TF_G32R32F
        NS.FLOAT,                       // TF_A32B32G32R32F
        NS.NONE,                        // TF_DXT1 (not needed)
        NS.NONE,                        // TF_DXT3 (not needed)
        NS.NONE,                        // TF_DXT5 (not needed)
        NS.UNSIGNED_INT_24_8_WEBGL      // TF_D24S8
    ];
    
    L5.Webgl.PrimitiveType  = [
        0,                  // PT_NONE (not used)
        NS.POINTS,          // PT_POLYPOINT
        NS.LINES,           // PT_POLYSEGMENTS_DISJOINT
        NS.LINE_STRIP,      // PT_POLYSEGMENTS_CONTIGUOUS
        0,                  // PT_TRIANGLES (not used)
        NS.TRIANGLES,       // PT_TRIMESH
        NS.TRIANGLE_STRIP,  // PT_TRISTRIP
        NS.TRIANGLE_FAN     // PT_TRIFAN
    ];

}) ();






/**
 * Program 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param program {L5.Program}
 * @param vs {L5.GLVertexShader}
 * @param fs {L5.GLFragShader}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLProgram = function (renderer, program, vs, fs) {
    var gl = renderer.gl;
    var p = gl.createProgram();
    gl.attachShader(p, vs.shader);
    gl.attachShader(p, fs.shader);
    gl.linkProgram(p);
    L5.assert(
        gl.getProgramParameter(p, gl.LINK_STATUS),
        gl.getProgramInfoLog(p)
    );
    this.program = p;
    gl.useProgram(p);
    var attributesLength = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES),
        uniformsLength = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS),
        item, name,i;

    for(i=0; i< attributesLength; ++i){
        item = gl.getActiveAttrib(p, i);
        name = item.name;
        program.inputMap.set(name, gl.getAttribLocation(p, name));
    }

    for(i=0; i< uniformsLength; ++i){
        item = gl.getActiveUniform(p, i);
        name = item.name;
        program.inputMap.set(name, gl.getUniformLocation(p, name));
    }
};
L5.nameFix(L5.GLProgram, 'GLProgram');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLProgram.prototype.free = function (renderer) {
    renderer.gl.deleteProgram(this.program);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLProgram.prototype.enable = function (renderer) {
    renderer.gl.useProgram(this.program);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLProgram.prototype.disable = function (renderer) {
    //renderer.gl.useProgram(null);
};

/**
 *
 *
 * @class
 */
L5.GLRenderData = function () {

    /**
     * @type {L5.GLRenderState}
     */
    this.currentRS = new L5.GLRenderState();

    const m = L5.GLRenderData.MAX_NUM_PSAMPLERS;
    /**
     * @type {Array<L5.GLSamplerState>}
     */
    this.currentSS = new Array (m);
    for (var i=0; i<m;++i) {
        this.currentSS[i] = new L5.GLSamplerState();
    }

    // Capabilities (queried at run time).
    this.maxVShaderImages  = 0;
    this.maxFShaderImages  = 0;
    this.maxCombinedImages = 0;

    /**
     * @type {L5.GLRenderData.DisplayListInfo}
     */
    this.font = new L5.GLRenderData.DisplayListInfo();
};

// Display list base indices for fonts/characters.
L5.GLRenderData.DisplayListInfo = function()
{
    this.quantity = 1;  // number of display lists, input to glGenLists
    this.start = 0;     // start index, output from glGenLists
    this.base = 0;      // base index for glListBase
};

L5.GLRenderData.MAX_NUM_VSAMPLERS = 4;  // VSModel 3 has 4, VSModel 2 has 0.
L5.GLRenderData.MAX_NUM_PSAMPLERS = 16;  // PSModel 2 and PSModel 3 have 16.

/**
 * Bitmapped fonts/characters.
 * @param font
 * @param c {string}
 */
L5.GLRenderData.prototype.drawCharacter = function(
    font, c
){
    // const BitmapFontChar* bfc = font.mCharacters[(unsigned int)c];
    //
    //const bfc = font.characters[c];
    //
    //// Save unpack state.
    //var swapBytes, lsbFirst, rowLength, skipRows, skipPixels, alignment;
    //glGetIntegerv(GL_UNPACK_SWAP_BYTES, &swapBytes);
    //glGetIntegerv(GL_UNPACK_LSB_FIRST, &lsbFirst);
    //glGetIntegerv(GL_UNPACK_ROW_LENGTH, &rowLength);
    //glGetIntegerv(GL_UNPACK_SKIP_ROWS, &skipRows);
    //glGetIntegerv(GL_UNPACK_SKIP_PIXELS, &skipPixels);
    //glGetIntegerv(GL_UNPACK_ALIGNMENT, &alignment);
    //
    //glPixelStorei(GL_UNPACK_SWAP_BYTES, false);
    //glPixelStorei(GL_UNPACK_LSB_FIRST, false);
    //glPixelStorei(GL_UNPACK_ROW_LENGTH, 0);
    //glPixelStorei(GL_UNPACK_SKIP_ROWS, 0);
    //glPixelStorei(GL_UNPACK_SKIP_PIXELS, 0);
    //glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    //glBitmap(bfc.xSize, bfc.ySize, bfc.xOrigin, bfc.yOrigin, bfc.xSize, 0, bfc.bitmap);
    //
    //// Restore unpack state.
    //glPixelStorei(GL_UNPACK_SWAP_BYTES, swapBytes);
    //glPixelStorei(GL_UNPACK_LSB_FIRST, lsbFirst);
    //glPixelStorei(GL_UNPACK_ROW_LENGTH, rowLength);
    //glPixelStorei(GL_UNPACK_SKIP_ROWS, skipRows);
    //glPixelStorei(GL_UNPACK_SKIP_PIXELS, skipPixels);
    //glPixelStorei(GL_UNPACK_ALIGNMENT, alignment);
};

/**
 * maintain current render states to avoid redundant state changes.
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLRenderState = function () {
    // AlphaState
    this.alphaBlendEnabled = false;
    this.alphaSrcBlend = 0;
    this.alphaDstBlend = 0;
    this.blendColor = new Float32Array([0, 0, 0, 0]);

    // CullState
    this.cullEnabled = false;
    this.CCWOrder = true;

    // DepthState
    this.depthEnabled = true;
    this.depthWriteEnabled = true;
    this.depthCompareFunction = true;

    // OffsetState
    this.fillEnabled = false;
    this.offsetScale = 0;
    this.offsetBias = 0;

    // StencilState
    this.stencilEnabled = false;
    this.stencilCompareFunction = false;
    this.stencilReference = false;
    this.stencilMask = false;
    this.stencilWriteMask = false;
    this.stencilOnFail = false;
    this.stencilOnZFail = false;
    this.stencilOnZPass = false;

    // WireState
    this.wireEnabled = false;
};
L5.nameFix(L5.GLRenderState, 'GLRenderState');

/**
 *
 * @param gl {WebGLRenderingContext}
 * @param alphaState {L5.AlphaState}
 * @param cullState {L5.CullState}
 * @param depthState {L5.DepthState}
 * @param offsetState {L5.OffsetState}
 * @param stencilState {L5.StencilState}
 */
L5.GLRenderState.prototype.initialize = function (gl, alphaState, cullState, depthState, offsetState, stencilState) {
    var op = ['disable', 'enable'];

    // AlphaState
    this.alphaBlendEnabled = alphaState.blendEnabled;
    this.alphaSrcBlend = L5.Webgl.AlphaBlend[alphaState.srcBlend];
    this.alphaDstBlend = L5.Webgl.AlphaBlend[alphaState.dstBlend];
    this.blendColor = alphaState.constantColor;

    gl[op[this.alphaBlendEnabled | 0]](gl.BLEND);
    gl.blendFunc(this.alphaSrcBlend, this.alphaDstBlend);
    gl.blendColor(this.blendColor[0], this.blendColor[1], this.blendColor[2], this.blendColor[3]);

    // CullState
    this.cullEnabled = cullState.enabled;
    this.CCWOrder = cullState.CCWOrder;

    gl[op[this.cullEnabled | 0]](gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(this.CCWOrder ? gl.BACK : gl.FRONT);

    // DepthState
    this.depthEnabled = depthState.enabled;
    this.depthWriteEnabled = depthState.writable;
    this.depthCompareFunction = L5.Webgl.DepthCompare[depthState.compare];

    gl[op[this.depthEnabled | 0]](gl.DEPTH_TEST);
    gl.depthMask(this.depthWriteEnabled);
    gl.depthFunc(this.depthCompareFunction);

    // OffsetState
    this.fillEnabled = offsetState.fillEnabled;
    this.offsetScale = offsetState.scale;
    this.offsetBias = offsetState.bias;

    gl[op[this.fillEnabled | 0]](gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(this.offsetScale, this.offsetBias);

    // StencilState
    this.stencilEnabled = stencilState.enabled;
    this.stencilCompareFunction = L5.Webgl.StencilCompare[stencilState.compare];
    this.stencilReference = stencilState.reference;
    this.stencilMask = stencilState.mask;
    this.stencilWriteMask = stencilState.writeMask;
    this.stencilOnFail = L5.Webgl.StencilOperation[stencilState.onFail];
    this.stencilOnZFail = L5.Webgl.StencilOperation[stencilState.onZFail];
    this.stencilOnZPass = L5.Webgl.StencilOperation[stencilState.onZPass];

    gl[op[this.stencilEnabled | 0]](gl.STENCIL_TEST);
    gl.stencilFunc(this.stencilCompareFunction, this.stencilReference, this.stencilMask);
    gl.stencilMask(this.stencilWriteMask);
    gl.stencilOp(this.stencilOnFail, this.stencilOnZFail, this.stencilOnZPass);
};


/**
 *
 * @param renderer {L5.Renderer}
 * @param renderTarget {L5.RenderTarget}
 * @param renderTarget
 * @constructor
 */
L5.GLRenderTarget = function (
    renderer, renderTarget
) {
    this.numTargets = renderTarget.numTargets;
    L5.assert (this.numTargets >= 1, 'Number of render targets must be at least one.');

    this.width           = renderTarget.width;
    this.height          = renderTarget.height;
    this.format          = renderTarget.format;
    this.hasMipmaps      = renderTarget.hasMipmaps;
    this.hasDepthStencil = renderTarget.hasDepthStencil;

    this.prevViewport[ 0 ]   = 0;
    this.prevViewport[ 1 ]   = 0;
    this.prevViewport[ 2 ]   = 0;
    this.prevViewport[ 3 ]   = 0;
    this.prevDepthRange[ 0 ] = 0;
    this.prevDepthRange[ 1 ] = 0;

    var gl = renderer.gl;

    // Create a framebuffer object.
    this.frameBuffer = gl.createFramebuffer ();
    gl.bindFramebuffer (gl.FRAMEBUFFER, this.frameBuffer);

    var previousBind = gl.getParameter (gl.TEXTURE_BINDING_2D);

    this.colorTextures = new Array (this.numTargets);
    this.drawBuffers   = new Array (this.numTargets);
    for (var i = 0; i < this.numTargets; ++i) {
        var colorTexture = renderTarget.getColorTexture (i);
        L5.assert (!renderer.inTexture2DMap (colorTexture), 'Texture should not yet exist.');

        var ogColorTexture      = new L5.GLTexture2D (renderer, colorTexture);
        renderer.insertInTexture2DMap (colorTexture, ogColorTexture);
        this.colorTextures[ i ] = ogColorTexture.getTexture ();
        this.drawBuffers[ i ]   = gl.COLOR_ATTACHMENT0 + i;

        // Bind the color texture.
        gl.bindTexture (gl.TEXTURE_2D, this.colorTextures[ i ]);
        if (this.hasMipmaps) {
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        else {
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }

        // Attach the texture to the framebuffer.
        gl.framebufferTexture2D (gl.FRAMEBUFFER, this.drawBuffers[ i ], gl.TEXTURE_2D, this.colorTextures[ i ], 0);
    }

    var depthStencilTexture = renderTarget.depthStencilTexture;
    if (depthStencilTexture) {
        L5.assert (!renderer.inTexture2DMap (depthStencilTexture), 'Texture should not yet exist.');

        var ogDepthStencilTexture = new L5.GLTexture2D (renderer, depthStencilTexture);
        renderer.insertInTexture2DMap (depthStencilTexture, ogDepthStencilTexture);
        this.depthStencilTexture  = ogDepthStencilTexture.getTexture ();

        // Bind the depthstencil texture.
        gl.bindTexture (gl.TEXTURE_2D, this.depthStencilTexture);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // Attach the depth to the framebuffer.
        gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthStencilTexture, 0);

        // Attach the stencil to the framebuffer.
        gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.depthStencilTexture, 0);
    }

    gl.bindTexture (gl.TEXTURE_2D, previousBind);

    switch (gl.checkFramebufferStatus (gl.FRAMEBUFFER)) {
        case gl.FRAMEBUFFER_COMPLETE:
            gl.bindFramebuffer (gl.FRAMEBUFFER, null);
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            L5.assert (false, 'Framebuffer incomplete attachments');
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            L5.assert (false, 'Framebuffer incomplete missing attachment');
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            L5.assert (false, 'Framebuffer incomplete dimensions');
            break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            L5.assert (false, 'Framebuffer unsupported');
            break;
        default:
            L5.assert (false, 'Framebuffer unknown error');
            break;
    }
};

/**
 *
 * @param renderer {L5.Renderer}
 */
L5.GLRenderTarget.prototype.enable    = function (renderer) {
    var gl = renderer.gl;

    gl.bindFramebuffer (gl.FRAMEBUFFER, this.frameBuffer);
    gl.drawBuffers (this.numTargets, this.drawBuffers);

    this.prevViewport   = gl.getParameter (gl.VIEWPORT);
    this.prevDepthRange = gl.getParameter (gl.DEPTH_RANGE);
    gl.viewport (0, 0, this.width, this.height);
    gl.depthRange (0, 1);
};
/**
 *
 * @param renderer {L5.Renderer}
 */
L5.GLRenderTarget.prototype.disable   = function (renderer) {
    var gl = renderer.gl;
    var pv = this.prevViewport;
    var pd = this.prevDepthRange;

    gl.bindFramebuffer (gl.FRAMEBUFFER, null);

    if (this.hasMipmaps) {
        var previousBind = gl.getParameter (gl.TEXTURE_BINDING_2D);
        for (var i = 0; i < this.numTargets; ++i) {
            gl.bindTexture (gl.TEXTURE_2D, this.colorTextures[ i ]);
            gl.generateMipmap (gl.TEXTURE_2D);
        }
        gl.bindTexture (gl.TEXTURE_2D, previousBind);
    }

    gl.viewport (pv[ 0 ], pv[ 1 ], pv[ 2 ], pv[ 3 ]);
    gl.depthRange (pd[ 0 ], pd[ 1 ]);
};
/**
 *
 * @param i {number}
 * @param renderer {L5.Renderer}
 * @param texture {L5.Texture2D}
 */
L5.GLRenderTarget.prototype.readColor = function (
    i, renderer, texture
) {
    var gl     = renderer.gl;
    var format = this.format;
    var width  = this.width;
    var height = this.height;

    if (i < 0 || i >= this.numTargets) {
        L5.assert (false, 'Invalid target index.');
    }

    this.enable (renderer);

    if (texture) {
        if (texture.format !== format ||
            texture.width !== width ||
            texture.height !== height) {
            L5.assert (false, 'Incompatible texture.');
            texture = new L5.Texture2D (format, width, height, 1);
        }
    }
    else {
        texture = new L5.Texture2D (format, width, height, 1);
    }

    gl.readPixels (0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, texture.getData (0));

    this.disable (renderer);
};

/**
 * 混合状态设置
 * @param alphaState {L5.AlphaState}
 */
L5.Renderer.prototype.setAlphaState = function (alphaState) {

    var gl = this.gl;
    if (!this.overrideAlphaState) {
        this.alphaState = alphaState;
    } else {
        this.alphaState = this.overrideAlphaState;
    }
    var as = this.alphaState;
    var CRS = this.data.currentRS;

    if (as.blendEnabled) {
        if (!CRS.alphaBlendEnabled) {
            CRS.alphaBlendEnabled = true;
            gl.enable(gl.BLEND);
        }
        var srcBlend = L5.Webgl.AlphaBlend[as.srcBlend];

        var dstBlend = L5.Webgl.AlphaBlend[as.dstBlend];

        if (srcBlend != CRS.alphaSrcBlend || dstBlend != CRS.alphaDstBlend) {
            CRS.alphaSrcBlend = srcBlend;
            CRS.alphaDstBlend = dstBlend;
            gl.blendFunc(srcBlend, dstBlend);
        }

        if (as.constantColor !== CRS.blendColor) {
            CRS.blendColor = as.constantColor;
            gl.blendColor(CRS.blendColor[0], CRS.blendColor[1], CRS.blendColor[2], CRS.blendColor[3]);
        }
    } else {
        if (CRS.alphaBlendEnabled) {
            CRS.alphaBlendEnabled = false;
            gl.disable(gl.BLEND);
        }
    }
};

/**
 * 剔除状态
 * @param cullState {L5.CullState}
 */
L5.Renderer.prototype.setCullState = function (cullState) {
    var cs;
    var gl = this.gl;
    if (!this.overrideCullState) {
        cs = cullState;
    }
    else {
        cs = this.overrideCullState;
    }
    this.cullState = cs;
    var CRS = this.data.currentRS;

    if (cs.enabled) {
        if (!CRS.cullEnabled) {
            CRS.cullEnabled = true;
            gl.enable(gl.CULL_FACE);
            gl.frontFace(gl.CCW);
        }
        var order = cs.CCWOrder;
        if (this.reverseCullOrder) {
            order = !order;
        }
        if (order != CRS.CCWOrder) {
            CRS.CCWOrder = order;
            gl.cullFace(CRS.CCWOrder ? gl.BACK : gl.FRONT);
        }

    }
    else {
        if (CRS.cullEnabled) {
            CRS.cullEnabled = false;
            gl.disable(gl.CULL_FACE);
        }
    }
};

/**
 * 设置深度测试状态
 * @param depthState {L5.DepthState}
 */
L5.Renderer.prototype.setDepthState = function (depthState) {
    var ds;
    var gl = this.gl;

    if (!this.overrideDepthState) {
        ds = depthState;
    } else {
        ds = this.overrideDepthState;
    }
    this.depthState = ds;
    var CRS = this.data.currentRS;

    if (ds.enabled) {
        if (!CRS.depthEnabled) {
            CRS.depthEnabled = true;
            gl.enable(gl.DEPTH_TEST);
        }

        var compare = L5.Webgl.DepthCompare[ds.compare];
        if (compare != CRS.depthCompareFunction) {
            CRS.depthCompareFunction = compare;
            gl.depthFunc(compare);
        }
    }
    else {
        if (CRS.depthEnabled) {
            CRS.depthEnabled = false;
            gl.disable(gl.DEPTH_TEST);
        }
    }

    if (ds.writable) {
        if (!CRS.depthWriteEnabled) {
            CRS.depthWriteEnabled = true;
            gl.depthMask(true);
        }
    }
    else {
        if (CRS.depthWriteEnabled) {
            CRS.depthWriteEnabled = false;
            gl.depthMask(false);
        }
    }
};
/**
 * @param offsetState {L5.OffsetState}
 */
L5.Renderer.prototype.setOffsetState = function (offsetState) {
    var os;
    var gl = this.gl;
    var CRS = this.data.currentRS;
    if (!this.overrideOffsetState) {
        os = offsetState;
    }
    else {
        os = this.overrideOffsetState;
    }

    if (os.fillEnabled) {
        if (!CRS.fillEnabled) {
            CRS.fillEnabled = true;
            gl.enable(gl.POLYGON_OFFSET_FILL);
        }
    }
    else {
        if (CRS.fillEnabled) {
            CRS.fillEnabled = false;
            gl.disable(gl.POLYGON_OFFSET_FILL);
        }
    }

    if (os.scale != CRS.offsetScale || os.bias != CRS.offsetBias) {
        CRS.offsetScale = os.scale;
        CRS.offsetBias = os.bias;
        gl.polygonOffset(os.scale, os.bias);
    }
};

/**
 * 设置模板测试状态
 * @param stencilState {L5.StencilState}
 */
L5.Renderer.prototype.setStencilState = function (stencilState) {
    var gl = this.gl;
    var ss;
    if (!this.overrideStencilState) {
        ss = stencilState;
    }
    else {
        ss = this.overrideStencilState;
    }
    this.stencilState = ss;
    var CRS = this.data.currentRS;
    if (ss.enabled) {
        if (!CRS.stencilEnabled) {
            CRS.stencilEnabled = true;
            gl.enable(gl.STENCIL_TEST);
        }

        var compare = L5.Webgl.StencilCompare[ss.compare];
        if (compare != CRS.stencilCompareFunction || ss.reference != CRS.stencilReference || ss.mask != CRS.stencilMask) {
            CRS.stencilCompareFunction = compare;
            CRS.stencilReference = ss.reference;
            CRS.stencilMask = ss.mask;
            gl.stencilFunc(compare, ss.reference, ss.mask);
        }

        if (ss.writeMask != CRS.stencilWriteMask) {
            CRS.stencilWriteMask = ss.writeMask;
            gl.stencilMask(ss.writeMask);
        }

        var onFail = L5.Webgl.StencilOperation[ss.onFail];
        var onZFail = L5.Webgl.StencilOperation[ss.onZFail];
        var onZPass = L5.Webgl.StencilOperation[ss.onZPass];

        if (onFail != CRS.stencilOnFail || onZFail != CRS.stencilOnZFail || onZPass != CRS.stencilOnZPass) {
            CRS.stencilOnFail = onFail;
            CRS.stencilOnZFail = onZFail;
            CRS.stencilOnZPass = onZPass;
            gl.stencilOp(onFail, onZFail, onZPass);
        }
    }
    else {
        if (CRS.stencilEnabled) {
            CRS.stencilEnabled = false;
            gl.disable(gl.STENCIL_TEST);
        }
    }
};


//----------------------------------------------------------------------------
// Viewport management.
//----------------------------------------------------------------------------
/**
 * @param x {number}
 * @param y {number}
 * @param width {number}
 * @param height {number}
 */
L5.Renderer.prototype.setViewport = function (x, y, width, height) {
    this.gl.viewport(x, y, width, height);
};
L5.Renderer.prototype.setDepthRange = function (min, max) {
    this.gl.depthRange(min, max);
};
L5.Renderer.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    var gl = this.gl;

    var param = gl.getParameter(gl.VIEWPORT);
    gl.viewport(param[0], param[1], width, height);
};

//----------------------------------------------------------------------------
// Support for clearing the color, depth, and stencil buffers.
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearColorBuffer = function () {
    var c = this.clearColor;
    var gl = this.gl;

    gl.clearColor(c[0], c[1], c[2], c[3]);

    gl.clear(gl.COLOR_BUFFER_BIT);
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearDepthBuffer = function () {
    var gl = this.gl;
    gl.clearDepth(this.clearDepth);
    gl.clear(gl.DEPTH_BUFFER_BIT);
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearStencilBuffer = function () {
    var gl = this.gl;
    gl.clearStencil(this.clearStencil);
    gl.clear(gl.STENCIL_BUFFER_BIT);
};
//----------------------------------------------------------------------------

/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearColorBuffer = function (x, y, w, h) {
    var gl = this.gl;
    var cc = this.clearColor;
    gl.clearColor(cc[0], cc[1], cc[2], cc[3]);

    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearDepthBuffer = function (x, y, w, h) {
    var gl = this.gl;
    gl.clearDepth(this.clearDepth);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, w, h);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearStencilBuffer = function (x, y, w, h) {
    var gl = this.gl;
    gl.clearStencil(this.clearStencil);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, w, h);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearBuffers = function (x, y, w, h) {
    var gl = this.gl;

    if (x) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(x, y, w, h);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    if (x) {
        gl.disable(gl.SCISSOR_TEST);
    }
};
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// Support for masking color channels.
//----------------------------------------------------------------------------
/**
 * 设置颜色掩码
 * @param allowRed {boolean}
 * @param allowGreen {boolean}
 * @param allowBlue {boolean}
 * @param allowAlpha {boolean}
 */
L5.Renderer.prototype.setColorMask = function (allowRed, allowGreen, allowBlue, allowAlpha) {
    this.allowRed = allowRed || false;
    this.allowGreen = allowGreen || false;
    this.allowBlue = allowBlue || false;
    this.allowAlpha = allowAlpha || false;
    this.gl.colorMask(allowRed, allowGreen, allowBlue, allowBlue);
};
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// Support for predraw and postdraw semantics.
//----------------------------------------------------------------------------
L5.Renderer.prototype.preDraw = function () {
    return true;
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.postDraw = function () {
    this.gl.flush();
};
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// Drawing routines.
//----------------------------------------------------------------------------
/**
 * @param screenBuffer {Uint8Array}
 * @param reflectY {boolean}
 */
L5.Renderer.prototype.draw = function (screenBuffer, reflectY) {
    if (!screenBuffer) {
        L5.assert(false, "Incoming screen buffer is null.\n");
        return;
    }

    var gl = this.gl;

    gl.matrixMode(gl.MODELVIEW);
    gl.pushMatrix();
    gl.loadIdentity();
    gl.matrixMode(gl.PROJECTION);
    gl.pushMatrix();
    gl.loadIdentity();
    gl.ortho(0, this.width, 0, this.height, 0, 1);
    gl.rasterPos3f(0, 0, 0);

    if (!reflectY) {
        // Set raster position to window coord (0,H-1).  The hack here avoids
        // problems with invalid raster positions which would cause
        // glDrawPixels not to execute.  OpenGL uses right-handed screen
        // coordinates, so using (0,H-1) as the raster position followed by
        // glPixelZoom(1,-1) tells OpenGL to draw the screen in left-handed
        // coordinates starting at the top row of the screen and finishing
        // at the bottom row.
        var bitmap = [0];
        gl.bitmap(0, 0, 0, 0, 0, this.height, bitmap);
    }
    gl.popMatrix();
    gl.matrixMode(gl.MODELVIEW);
    gl.popMatrix();

    if (!reflectY) {
        gl.pixelZoom(1, -1);
    }

    gl.drawPixels(this.width, this.height, gl.BGRA, gl.UNSIGNED_BYTE, screenBuffer);

    if (!reflectY) {
        gl.pixelZoom(1, 1);
    }
};

//----------------------------------------------------------------------------
/**
 *
 * @param x {number}
 * @param y {number}
 * @param color {Float32Array}
 * @param message {string}
 */
L5.Renderer.prototype.drawText = function (x, y, color, message) {
    var gl = this.gl;


    // Switch to orthogonal view.
    gl.matrixMode(gl.PROJECTION);
    gl.pushMatrix();
    gl.loadIdentity();
    gl.ortho(-0.5, this.width - 0.5, -0.5, this.height - 0.5, -1, 1);
    gl.matrixMode(gl.MODELVIEW);
    gl.pushMatrix();
    gl.loadIdentity();

    // Set default render states, except for depth buffering that must be
    // disabled because text is always overlayed.
    this.setAlphaState(this.defaultAlphaState);
    this.setCullState(this.defaultCullState);
    this.setOffsetState(this.defaultOffsetState);
    this.setStencilState(this.defaultStencilState);

    var CRS = this.data.currentRS;
    CRS.depthEnabled = false;
    gl.disable(gl.DEPTH_TEST);

    // Set the text color.
    gl.color4fv(color[0], color[1], color[2], color[3]);

    // Draw the text string (use right-handed coordinates).
    gl.rasterPos3i(x, this.height - 1 - y, 0);

    // Restore visual state.  Only depth buffering state varied from the
    // default state.
    CRS.depthEnabled = true;
    gl.enable(gl.DEPTH_TEST);

    // Restore matrices.
    gl.PopMatrix();
    gl.MatrixMode(gl.PROJECTION);
    gl.PopMatrix();
    gl.MatrixMode(gl.MODELVIEW);
};

//----------------------------------------------------------------------------
/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype.drawPrimitive = function (visual) {
    var type = visual.primitiveType;
    var vbuffer = visual.vertexBuffer;
    var ibuffer = visual.indexBuffer;
    var gl = this.gl;
    var numPixelsDrawn;
    var numSegments;

    switch (type) {
        case L5.Visual.PT_TRIMESH:
        case L5.Visual.PT_TRISTRIP:
        case L5.Visual.PT_TRIFAN:
        {
            var numVertices = vbuffer.numElements;
            var numIndices = ibuffer.numElements;
            if (numVertices > 0 && numIndices > 0) {
                var indexType = (ibuffer.elementSize == 2) ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
                var indexData = ibuffer.offset;
                gl.drawElements(L5.Webgl.PrimitiveType[type], numIndices, indexType, indexData);
                // gl.drawElements (this.gl.LINE_LOOP, numIndices, indexType, indexData);
            }
            break;
        }
        case L5.Visual.PT_POLYSEGMENTS_CONTIGUOUS:
        {
            numSegments = visual.getNumSegments();
            if (numSegments > 0) {
                gl.drawArrays(gl.LINE_STRIP, 0, numSegments + 1);
            }
            break;
        }
        case L5.Visual.PT_POLYSEGMENTS_DISJOINT:
        {
            numSegments = visual.getNumSegments();
            if (numSegments > 0) {
                gl.drawArrays(gl.LINES, 0, 2 * numSegments);
            }
            break;
        }
        case L5.Visual.PT_POLYPOINT:
        {
            var numPoints = visual.numPoints;
            if (numPoints > 0) {
                gl.drawArrays(gl.POINTS, 0, numPoints);
            }
            break;
        }
        default:
            L5.assert(false, 'Invalid type');
    }
};
//----------------------------------------------------------------------------


/**
 * SamplerState 采样器状态
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLSamplerState = function () {
    this.anisotropy  = 1;
    this.magFilter   = L5.Webgl.LINEAR;
    this.minFilter   = L5.Webgl.NEAREST_MIPMAP_LINEAR;
    this.wrap        = [
        L5.Webgl.REPEAT,
        L5.Webgl.REPEAT,
        L5.Webgl.REPEAT
    ];
};

/**
 * Get the state of the currently enabled texture.  This state appears
 * to be associated with the OpenGL texture object.  How does this
 * relate to the sampler state?  In my opinion, OpenGL needs to have
 * the sampler state separate from the texture object state.
 *
 * @param renderer {L5.Renderer}
 * @param target
 */
L5.GLSamplerState.prototype.getCurrent = function (
    renderer, target
) {
    var gl          = renderer.gl;

    // EXT_Texture_Filter_Anisotropic
    this.anisotropy = gl.getTexParameter (target, L5.Webgl.TEXTURE_MAX_ANISOTROPY_EXT);

    this.magFilter  = gl.getTexParameter (target, gl.TEXTURE_MAG_FILTER);
    this.minFilter  = gl.getTexParameter (target, gl.TEXTURE_MIN_FILTER);
    this.wrap[ 0 ]  = gl.getTexParameter (target, gl.TEXTURE_WRAP_S);
    this.wrap[ 1 ]  = gl.getTexParameter (target, gl.TEXTURE_WRAP_T);

    // WebGL 2.0
    // this.wrap[2] = gl.getTexParameter(target, gl.TEXTURE_WRAP_R);
};


/**
 * Texture2D 底层封装
 * @param renderer
 * @param texture
 * @constructor
 */
L5.GLTexture2D = function (renderer, texture) {
    var gl = renderer.gl;
    var _format = texture.format;
    this.internalFormat = L5.Webgl.TextureFormat[_format];

    this.format = L5.Webgl.TextureFormat[_format];
    this.type = L5.Webgl.TextureType[_format];

    // Create pixel buffer objects to store the texture data.
    var level, levels = texture.numLevels;

    const MAX_MIPMAP_LEVELS = L5.Texture.MAX_MIPMAP_LEVELS;
    this.numLevels = levels;
    this.numLevelBytes = new Array(MAX_MIPMAP_LEVELS);
    this.dimension = [
        new Array(MAX_MIPMAP_LEVELS),
        new Array(MAX_MIPMAP_LEVELS)
    ];

    for (level = 0; level < levels; ++level) {
        this.numLevelBytes[level] = texture.numLevelBytes[level];
        this.dimension[0][level] = texture.getDimension(0, level);
        this.dimension[1][level] = texture.getDimension(1, level);
    }

    // Create a texture structure.
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    var width, height;
    // Create the mipmap level structures.  No image initialization occurs.
    this.isCompressed = texture.isCompressed();
    if (this.isCompressed) {
        for (level = 0; level < levels; ++level) {
            width = this.dimension[0][level];
            height = this.dimension[1][level];

            gl.compressedTexImage2D(
                gl.TEXTURE_2D,
                level,
                this.internalFormat,
                width,
                height,
                0,
                this.numLevelBytes[level],
                0);
        }
    } else {
        for (level = 0; level < levels; ++level) {
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                this.internalFormat,
                this.dimension[0][level],
                this.dimension[1][level],
                0,
                this.format,
                this.type,
                texture.getData(level)
            );
        }
    }
};

/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTexture2D.prototype.enable = function (renderer, textureUnit) {
    var gl = renderer.gl;
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
};
/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTexture2D.prototype.disable = function (renderer, textureUnit) {
};

/**
 * TextureCube 底层封装
 * @param renderer
 * @param texture
 * @constructor
 */
L5.GLTextureCube = function (
    renderer, texture
) {
    var gl              = renderer.gl;
    var _format         = texture.format;
    this.internalFormat = L5.Webgl.TextureFormat[ _format ];

    this.format = L5.Webgl.TextureFormat[ _format ];
    this.type   = L5.Webgl.TextureType[ _format ];

    // Create pixel buffer objects to store the texture data.
    var level, levels = texture.numLevels;
    this.numLevels    = levels;

    for (level = 0; level < levels; ++level) {
        this.numLevelBytes[ level ]  = texture.numLevelBytes[ level ];
        this.dimension[ 0 ][ level ] = texture.getDimension (0, level);
        this.dimension[ 1 ][ level ] = texture.getDimension (1, level);
    }

    // Create a texture structure.
    this.texture         = gl.createTexture ();
    this.previousTexture = gl.getTexParameter (gl.TEXTURE_BINDING_CUBE_MAP);
    gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.texture);

    var face;
    // Create the mipmap level structures.  No image initialization occurs.
    this.isCompressed = texture.isCompressed ();
    if (this.isCompressed) {
        for (face = 0; face < 6; ++face) {
            for (level = 0; level < levels; ++level) {
                gl.compressedTexImage2D (
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                    level,
                    this.internalFormat,
                    this.dimension[ 0 ][ level ],
                    this.dimension[ 1 ][ level ],
                    0,
                    this.numLevelBytes[ level ],
                    0);
            }
        }
    } else {
        for (face = 0; face < 6; ++face) {
            for (level = 0; level < mNumLevels; ++level) {
                gl.texImage2D (
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                    level,
                    this.internalFormat,
                    this.dimension[ 0 ][ level ],
                    this.dimension[ 1 ][ level ],
                    0,
                    this.format,
                    this.type,
                    texture.getData (level)
                );
            }
        }
    }

    gl.bindTexture (gl.TEXTURE_CUBE_MAP, previousBind);
};

/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTextureCube.prototype.enable  = function (
    renderer, textureUnit
) {
    var gl               = renderer.gl;
    gl.activeTexture (gl.TEXTURE0 + textureUnit);
    this.previousTexture = gl.getTexParameter (gl.TEXTURE_BINDING_CUBE_MAP);
    gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.texture);
};
/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTextureCube.prototype.disable = function (
    renderer, textureUnit
) {
    var gl = renderer.gl;
    gl.activeTexture (gl.TEXTURE0 + textureUnit);
    gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.previousTexture);
};

/**
 * VertexBuffer 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param buffer {L5.VertexBuffer}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLVertexBuffer = function (
    renderer, buffer
) {
    var gl      = renderer.gl;
    this.buffer = gl.createBuffer ();
    gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData (gl.ARRAY_BUFFER, buffer.getData (), L5.Webgl.BufferUsage[ buffer.usage ]);
    gl.bindBuffer (gl.ARRAY_BUFFER, null);
};
L5.nameFix (L5.GLVertexBuffer, 'GLVertexBuffer');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexBuffer.prototype.enable  = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexBuffer.prototype.disable = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ARRAY_BUFFER, null);
};

/**
 * @param renderer {L5.Renderer}
 * @param buffer {L5.VertexBuffer}
 */
L5.GLVertexBuffer.prototype.update = function (
    renderer, buffer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData (gl.ARRAY_BUFFER, buffer.getData (), L5.Webgl.BufferUsage[ buffer.usage ]);
    gl.bindBuffer (gl.ARRAY_BUFFER, null);
};

/**
 * VertexFormat 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param format {L5.VertexFormat}
 * @param format {L5.Program}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLVertexFormat = function (renderer, format, p) {
    this.stride = format.stride;

    var type;

    var i = format.getIndex(L5.VertexFormat.AU_POSITION);
    if (i >= 0) {
        this.hasPosition = 1;
        type = format.getAttributeType(i);
        this.positionSize = L5.Webgl.AttributeSize[type];
        this.positionChannels = p.inputMap.get('modelPosition');
        this.positionType = L5.Webgl.AttributeType[type];
        this.positionOffset = format.getOffset(i);
    } else {
        this.hasPosition = 0;
        this.positionSize = 0;
        this.positionChannels = 0;  // 属性大小
        this.positionType = 0;  // 属性类型
        this.positionOffset = 0;  // 属性偏移量
    }

    i = format.getIndex(L5.VertexFormat.AU_NORMAL);
    if (i >= 0) {
        this.hasNormal = 1;
        type = format.getAttributeType(i);
        this.normalSize = L5.Webgl.AttributeSize[type];
        this.normalChannels = p.inputMap.get('modelNormal');
        this.normalType = L5.Webgl.AttributeType[type];
        this.normalOffset = format.getOffset(i);
    } else {
        this.hasNormal = 0;
        this.normalSize = 0;
        this.normalChannels = 0;
        this.normalType = 0;
        this.normalOffset = 0;
    }

    i = format.getIndex(L5.VertexFormat.AU_TANGENT);
    if (i >= 0) {
        this.hasTangent = 1;
        type = format.getAttributeType(i);
        this.tangentSize = L5.Webgl.AttributeSize[type];
        this.tangentChannels = p.inputMap.get('modelTangent');
        this.tangentType = L5.Webgl.AttributeType[type];
        this.tangentOffset = format.getOffset(i);
    } else {
        this.hasTangent = 0;
        this.tangentChannels = 0;
        this.tangentType = 0;
        this.tangentOffset = 0;
    }

    i = format.getIndex(L5.VertexFormat.AU_BINORMAL);
    if (i >= 0) {
        this.hasBinormal = 1;
        type = format.getAttributeType(i);
        this.binormalSize = L5.Webgl.AttributeSize[type];
        this.binormalChannels = p.inputMap.get('modelBinormal');
        this.binormalType = L5.Webgl.AttributeType[type];
        this.binormalOffset = format.getOffset(i);
    }
    else {
        this.hasBinormal = 0;
        this.binormalSize = 0;
        this.binormalChannels = 0;
        this.binormalType = 0;
        this.binormalOffset = 0;
    }

    var unit;
    const AM_MAX_TCOORD_UNITS = L5.VertexFormat.MAX_TCOORD_UNITS;

    this.hasTCoord = new Array(AM_MAX_TCOORD_UNITS);
    this.tCoordsSize = new Array(AM_MAX_TCOORD_UNITS);
    this.tCoordChannels = new Array(AM_MAX_TCOORD_UNITS);
    this.tCoordType = new Array(AM_MAX_TCOORD_UNITS);
    this.tCoordOffset = new Array(AM_MAX_TCOORD_UNITS);

    for (unit = 0; unit < AM_MAX_TCOORD_UNITS; ++unit) {
        i = format.getIndex(L5.VertexFormat.AU_TEXCOORD, unit);
        if (i >= 0) {
            this.hasTCoord[unit] = 1;
            type = format.getAttributeType(i);
            this.tCoordsSize[unit] = L5.Webgl.AttributeSize[type];
            this.tCoordChannels[unit] = p.inputMap.get('modelTCoord' + unit);
            this.tCoordType[unit] = L5.Webgl.AttributeType[type];
            this.tCoordOffset[unit] = format.getOffset(i);
        } else {
            this.hasTCoord[unit] = 0;
            this.tCoordsSize[unit] = 0;
            this.tCoordChannels[unit] = 0;
            this.tCoordType[unit] = 0;
            this.tCoordOffset[unit] = 0;
        }
    }

    const AM_MAX_COLOR_UNITS = L5.VertexFormat.MAX_COLOR_UNITS;
    this.hasColor = new Array(AM_MAX_COLOR_UNITS);
    this.colorSize = new Array(AM_MAX_COLOR_UNITS);
    this.colorChannels = new Array(AM_MAX_COLOR_UNITS);
    this.colorType = new Array(AM_MAX_COLOR_UNITS);
    this.colorOffset = new Array(AM_MAX_COLOR_UNITS);
    for (unit = 0; unit < AM_MAX_COLOR_UNITS; ++unit) {
        i = format.getIndex(L5.VertexFormat.AU_COLOR, unit);
        if (i >= 0) {
            this.hasColor[unit] = 1;
            type = format.getAttributeType(i);
            this.colorSize[unit] = L5.Webgl.AttributeSize[type];
            this.colorChannels[unit] = p.inputMap.get('modelColor' + unit);
            this.colorType[unit] = L5.Webgl.AttributeType[type];
            this.colorOffset[unit] = format.getOffset(i);
        } else {
            this.hasColor[unit] = 0;
            this.colorSize[unit] = 0;
            this.colorChannels[unit] = 0;
            this.colorType[unit] = 0;
            this.colorOffset[unit] = 0;
        }
    }

    i = format.getIndex(L5.VertexFormat.AU_BLENDINDICES);
    if (i >= 0) {
        this.hasBlendIndices = 1;
        type = format.getAttributeType(i);
        this.blendIndicesSize = L5.Webgl.AttributeSize[type];
        this.blendIndicesChannels = p.inputMap.get('modelBlendIndices');
        this.blendIndicesType = L5.Webgl.AttributeType[type];
        this.blendIndicesOffset = format.getOffset(i);
    }
    else {
        this.hasBlendIndices = 0;
        this.blendIndicesSize = 0;
        this.blendIndicesChannels = 0;
        this.blendIndicesType = 0;
        this.blendIndicesOffset = 0;
    }

    i = format.getIndex(L5.VertexFormat.AU_BLENDWEIGHT);
    if (i >= 0) {
        this.hasBlendWeight = 1;
        type = format.getAttributeType(i);
        this.blendWeightSize = L5.Webgl.AttributeSize[type];
        this.blendWeightChannels = p.inputMap.get('modelBlendWeight');
        this.blendWeightType = L5.Webgl.AttributeType[type];
        this.blendWeightOffset = format.getOffset(i);
    }
    else {
        this.hasBlendWeight = 0;
        this.blendWeightSize = 0;
        this.blendWeightChannels = 0;
        this.blendWeightType = 0;
        this.blendWeightOffset = 0;
    }

    i = format.getIndex(L5.VertexFormat.AU_FOGCOORD);
    if (i >= 0) {
        this.hasFogCoord = 1;
        type = format.getAttributeType(i);
        this.fogCoordsSize = L5.Webgl.AttributeSize[type];
        this.fogCoordChannels = p.inputMap.get('modelFogCoord');
        this.fogCoordType = L5.Webgl.AttributeType[type];
        this.fogCoordOffset = format.getOffset(i);
    } else {
        this.hasFogCoord = 0;
        this.fogCoordsSize = 0;
        this.fogCoordChannels = 0;
        this.fogCoordType = 0;
        this.fogCoordOffset = 0;
    }

    i = format.getIndex(L5.VertexFormat.AU_PSIZE);
    if (i >= 0) {
        this.hasPSize = 1;
        type = format.getAttributeType(i);
        this.pSizeSize = L5.Webgl.AttributeSize[type];
        this.pSizeChannels = p.inputMap.get('modelPointSize');
        this.pSizeType = L5.Webgl.AttributeType[type];
        this.pSizeOffset = format.getOffset(i);
    } else {
        this.hasPSize = 0;
        this.pSizeSize = 0;
        this.pSizeChannels = 0;
        this.pSizeType = 0;
        this.pSizeOffset = 0;
    }

};
L5.nameFix(L5.GLVertexFormat, 'GLVertexFormat');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexFormat.prototype.enable = function (renderer) {
    // Use the enabled vertex buffer for data pointers.

    var stride = this.stride;
    var gl = renderer.gl;

    if (this.hasPosition) {
        gl.enableVertexAttribArray(this.positionChannels);
        gl.vertexAttribPointer(this.positionChannels, this.positionSize, this.positionType, false, stride, this.positionOffset);
    }

    if (this.hasNormal) {
        gl.enableVertexAttribArray(this.normalChannels);
        gl.vertexAttribPointer(this.normalChannels, this.normalSize, this.normalType, false, stride, this.normalOffset);
    }

    if (this.hasTangent) {
        gl.enableVertexAttribArray(this.tangentChannels);
        gl.vertexAttribPointer(this.tangentChannels, this.tangentSize, this.tangentType, false, stride, this.tangentOffset);
    }

    if (this.hasBinormal) {
        gl.enableVertexAttribArray(this.normalChannels);
        gl.vertexAttribPointer(this.normalChannels, this.normalSize, this.normalType, false, stride, this.normalOffset);
    }

    var unit;
    for (unit = 0; unit < L5.VertexFormat.MAX_TCOORD_UNITS; ++unit) {
        if (this.hasTCoord[unit]) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.enableVertexAttribArray(this.tCoordChannels[unit]);
            gl.vertexAttribPointer(this.tCoordChannels[unit], this.tCoordsSize[unit], this.tCoordType[unit], false, stride,
                this.tCoordOffset[unit]);
        }
    }

    if (this.hasColor[0]) {
        gl.enableVertexAttribArray(this.colorChannels[0]);
        gl.vertexAttribPointer(this.colorChannels[0], this.colorSize[0], this.colorType[0], false, stride,
            this.colorOffset[0]);
    }

    if (this.hasColor[1]) {
        gl.enableVertexAttribArray(this.colorChannels[1]);
        gl.vertexAttribPointer(this.colorChannels[1], this.colorSize[1], this.colorType[1], false, stride,
            this.colorOffset[1]);
    }

    if (this.hasBlendIndices) {
        gl.enableVertexAttribArray(this.blendIndicesChannels);
        gl.vertexAttribPointer(this.blendIndicesChannels, this.blendIndicesSize, this.blendIndicesType, false, stride,
            this.blendIndicesOffset);
    }

    if (this.hasBlendWeight) {
        gl.enableVertexAttribArray(this.blendWeightChannels);
        gl.vertexAttribPointer(this.blendWeightChannels, this.blendWeightSize, this.blendWeightType, false, stride,
            this.blendWeightOffset);
    }

    if (this.hasFogCoord) {
        gl.enableVertexAttribArray(this.fogCoordChannels);
        gl.vertexAttribPointer(this.fogCoordChannels, this.fogCoordsSize, this.fogCoordType, false, stride, this.fogCoordOffset);
    }

    if (this.hasPSize) {
        gl.enableVertexAttribArray(this.pSizeChannels);
        gl.vertexAttribPointer(this.pSizeChannels, this.pSizeSize, this.pSizeType, false, stride, this.pSizeOffset);
    }
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexFormat.prototype.disable = function (renderer) {
    var gl = renderer.gl;
    if (this.hasPosition) {
        gl.disableVertexAttribArray(this.positionChannels);
    }

    if (this.hasNormal) {
        gl.disableVertexAttribArray(this.normalChannels);
    }

    if (this.hasTangent) {
        gl.disableVertexAttribArray(this.tangentChannels);
    }

    if (this.hasBinormal) {
        gl.disableVertexAttribArray(this.binormalChannels);
    }

    var unit;
    for (unit = 0; unit < L5.VertexFormat.MAX_TCOORD_UNITS; ++unit) {
        if (this.hasTCoord[unit]) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    if (this.hasColor[0]) {
        gl.disableVertexAttribArray(this.colorChannels[0]);
    }

    if (this.hasColor[1]) {
        gl.disableVertexAttribArray(this.colorChannels[1]);
    }

    if (this.hasBlendIndices) {
        gl.disableVertexAttribArray(this.blendIndicesChannels);
    }

    if (this.hasBlendWeight) {
        gl.disableVertexAttribArray(this.blendWeightChannels);
    }

    if (this.hasFogCoord) {
        gl.disableVertexAttribArray(this.fogCoordChannels);
    }

    if (this.hasPSize) {
        gl.disableVertexAttribArray(this.pSizeChannels);
    }
};

/**
 * VertexShader 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param shader {L5.VertexShader}
 * @class
 * @extends {L5.GLShader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLVertexShader = function (renderer, shader) {
    L5.GLShader.call(this);
    var gl = renderer.gl;
    this.shader = gl.createShader(gl.VERTEX_SHADER);

    var programText = shader.getProgram();

    gl.shaderSource(this.shader, programText);
    gl.compileShader(this.shader);

    L5.assert(
        gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
        gl.getShaderInfoLog(this.shader)
    );
};
L5.nameFix(L5.GLVertexShader, 'GLVertexShader');
L5.extendFix(L5.GLVertexShader, L5.GLShader);

/**
 * @param shader {L5.VertexShader}
 * @param mapping {Map}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLVertexShader.prototype.enable = function (renderer, mapping, shader, parameters) {
    var gl = renderer.gl;

    // 更新uniform 变量

    // step1. 遍历顶点着色器常量
    var numConstants = shader.numConstants;
    for (var i = 0; i < numConstants; ++i) {
        var locating = mapping.get(shader.getConstantName(i));
        var funcName = shader.getConstantFuncName(i);
        var data = parameters.getConstant(i).data;
        if (data.length > 4) {
            gl[funcName](locating, false, data);
        } else {
            gl[funcName](locating, data);
        }
    }

    this.setSamplerState(renderer, shader, parameters, renderer.data.maxVShaderImages, renderer.data.currentSS);
};
/**
 * @param shader {L5.VertexShader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLVertexShader.prototype.disable = function (renderer, shader, parameters) {
    var gl = renderer.gl;
    this.disableTexture(renderer, shader, parameters, renderer.data.maxVShaderImages);
};

/**
 * Camera - 摄像机
 *
 * @param isPerspective {boolean} 是否是透视相机, true-透视, false-正交
 * @extends {L5.D3Object}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Camera = function (isPerspective /* default : false */) {
    L5.D3Object.call(this, 'L5.Camera');

    this.isPerspective = isPerspective || false;

    this.position = L5.Point.ORIGIN;
    this.direction = L5.Vector.UNIT_Z.negative(); //-z
    this.up = L5.Vector.UNIT_Y;
    this.right = L5.Vector.UNIT_X;

    // 摄像机视图矩阵
    this.viewMatrix = L5.Matrix.IDENTITY;

    // 视截体存储结构, 存储顺序 NEAR-FAR-BOTTOM-TOP-LEFT-RIGHT
    this.frustum = new Float32Array(6);

    // 摄像机投影矩阵
    this.projectionMatrix = L5.Matrix.IDENTITY;

    // 投影视图矩阵， 即投影矩阵和视图矩阵的乘积
    // 当视图前置/后置矩阵不为空时会包含它们
    this.projectionViewMatrix = L5.Matrix.IDENTITY;

    // 视图前置矩阵，位置在模型矩阵之后，但在视图矩阵之前
    // 用于对物体的变换， 例如反射等，默认为单位矩阵
    this.preViewMatrix = L5.Matrix.IDENTITY;
    this.preViewIsIdentity = true;

    // 视图后置矩阵，用于屏幕空间转换，例如反射渲染后的图像等，默认为单位矩阵
    this.postProjectionMatrix = L5.Matrix.IDENTITY;
    this.postProjectionIsIdentity = true;

    // 初始化
    this.setFrame(this.position, this.direction, this.up, this.right);
    this.setPerspective(90, 1, 1, 1000);
};

L5.nameFix(L5.Camera, 'Camera');
L5.extendFix(L5.Camera, L5.D3Object);


////////////////////// const 视截体常量定义 //////////////////////
L5.Camera.VF_NEAR = 0;
L5.Camera.VF_FAR = 1;
L5.Camera.VF_BOTTOM = 2;
L5.Camera.VF_TOP = 3;
L5.Camera.VF_LEFT = 4;
L5.Camera.VF_RIGHT = 5;
L5.Camera.VF_QUANTITY = 6;

/**
 *
 * @param eye {L5.Point} 眼睛位置
 * @param center {L5.Point} 场景中心
 * @param up {L5.Vector} 观察者上方向
 */
L5.Camera.prototype.lookAt = function (eye, center, up) {

    if (eye.equals(center)) {
        this.position.copy(L5.Point.ORIGIN);
        this.up.copy(up);
        this.direction.copy(L5.Vector.UNIT_Z.negative());
        this.right.copy(L5.Vector.UNIT_X);
        return;
    }

    this.position.copy(eye);

    // 这里可直接计算正-Z方向, 上面已经做过判断
    var z = eye.subP(center);
    z.normalize();

    // 计算右方向
    var x = up.cross(z);
    x.normalize();

    // 计算右方向
    var y = z.cross(x);
    y.normalize();

    this.direction.copy(z);
    this.up.copy(y);
    this.right.copy(x);

    this.onFrameChange();
};

/**
 * 摄像机的向量使用世界坐标系.
 *
 * @param position  {L5.Point } 位置 default (0, 0,  0; 1)
 * @param direction {L5.Vector} 观察方向 default (0, 0, -1; 0)
 * @param up        {L5.Vector} 上方向 default default (0, 1, 0; 0)
 * @returns {void}
 */
L5.Camera.prototype.setFrame = function (position, direction, up) {
    this.position.copy(position);
    var right = direction.cross(up);
    this.setAxes(direction, up, right);
};

/**
 * 设置摄像机位置
 * @param position {L5.Point}
 * @returns {void}
 */
L5.Camera.prototype.setPosition = function (position) {
    this.position.copy(position);
    this.onFrameChange();
};

/**
 * 设置摄像机坐标系的3个轴
 *
 * @param direction {L5.Vector} 观察方向
 * @param up        {L5.Vector} 上方向
 * @param right     {L5.Vector} 右方向
 * @returns {void}
 */
L5.Camera.prototype.setAxes = function (direction, up, right) {
    this.direction.copy(direction);
    this.up.copy(up);
    this.right.copy(right);

    // 判断3个轴是否正交, 否则需要校正
    var det = direction.dot(up.cross(right));
    if (Math.abs(1 - det) > 0.00001) {
        L5.Vector.orthoNormalize(this.direction, this.up, this.right);
    }
    this.onFrameChange();
};

/**
 * 设置透视矩阵参数
 * @param fov {float} 垂直视角, 单位: 度
 * @param aspect {float} 高宽比
 * @param near {float} 近平面
 * @param far {float} 远平面
 */
L5.Camera.prototype.setPerspective = function (fov, aspect, near, far) {
    var top = near * Math.tan(fov * L5.Math.PI / 360);
    var right = top * aspect;

    this.frustum[L5.Camera.VF_TOP] = top;
    this.frustum[L5.Camera.VF_BOTTOM] = -top;
    this.frustum[L5.Camera.VF_RIGHT] = right;
    this.frustum[L5.Camera.VF_LEFT] = -right;
    this.frustum[L5.Camera.VF_NEAR] = near;
    this.frustum[L5.Camera.VF_FAR] = far;

    this.onFrustumChange();
};

/**
 * 返回透视图的4个参数
 * returns {Float32Array} [fov, aspect, near, far]
 */
L5.Camera.prototype.getPerspective = function () {
    var ret = new Float32Array(4);

    if (
        this.frustum[L5.Camera.VF_LEFT] == -this.frustum[L5.Camera.VF_RIGHT] &&
        this.frustum[L5.Camera.VF_BOTTOM] == -this.frustum[L5.Camera.VF_TOP]
    ) {
        var tmp = this.frustum[L5.Camera.VF_TOP] / this.frustum[L5.Camera.VF_NEAR];
        ret[0] = L5.Math.atan(tmp) * 360 / L5.Math.PI;
        ret[1] = this.frustum[L5.Camera.VF_RIGHT] / this.frustum[L5.Camera.VF_TOP];
        ret[2] = this.frustum[L5.Camera.VF_NEAR];
        ret[3] = this.frustum[L5.Camera.VF_FAR];
    }
    return ret;
};
/**
 * 通过6个面的参数设置视截体
 * @param near   {number} 近平面
 * @param far    {number} 远平面
 * @param bottom {number} 底面
 * @param top    {number} 顶面
 * @param left   {number} 左面
 * @param right  {number} 右面
 * @returns {void}
 */
L5.Camera.prototype.setFrustum = function (near, far, bottom, top, left, right) {
    this.frustum[L5.Camera.VF_NEAR] = near;
    this.frustum[L5.Camera.VF_FAR] = far;
    this.frustum[L5.Camera.VF_BOTTOM] = bottom;
    this.frustum[L5.Camera.VF_TOP] = top;
    this.frustum[L5.Camera.VF_LEFT] = left;
    this.frustum[L5.Camera.VF_RIGHT] = right;

    this.onFrustumChange();
};

/**
 * p00 {L5.Point}
 * p10 {L5.Point}
 * p11 {L5.Point}
 * p01 {L5.Point}
 * nearExtrude {number}
 * farExtrude {number}
 *
 */
L5.Camera.prototype.setProjectionMatrix = function (p00, p10, p11, p01,
                                                    nearExtrude, farExtrude) {

    var // 计算近平面
        q000 = p00.scalar(nearExtrude),
        q100 = p01.scalar(nearExtrude),
        q110 = p11.scalar(nearExtrude),
        q010 = p01.scalar(nearExtrude),

    // 计算远平面
        q001 = p00.scalar(farExtrude),
        q101 = p10.scalar(farExtrude),
        q111 = p11.scalar(farExtrude),
        q011 = p01.scalar(farExtrude);

    // Compute the representation of q111.
    var u0 = q100.sub(q000),
        u1 = q010.sub(q000),
        u2 = q001.sub(q000);

    var m = L5.Matrix.IPMake(u0, u1, u2, q000);
    var invM = m.inverse(0.001);
    var a = invM.mulPoint(q111);

    // Compute the coeffients in the fractional linear transformation.
    //   y[i] = n[i]*x[i]/(d[0]*x[0] + d[1]*x[1] + d[2]*x[2] + d[3])
    var n0 = 2 * a.x;
    var n1 = 2 * a.y;
    var n2 = 2 * a.z;
    var d0 = +a.x - a.y - a.z + 1;
    var d1 = -a.x + a.y - a.z + 1;
    var d2 = -a.x - a.y + a.z + 1;
    var d3 = +a.x + a.y + a.z - 1;

    // 从规范正方体[-1,1]^2 x [0,1]计算透视投影
    var n20 = n2 / n0,
        n21 = n2 / n1,
        n20d0 = n20 * d0,
        n21d1 = n21 * d1,
        d32 = 2 * d3,
        project = new L5.Matrix(
            n20 * d32 + n20d0, n21d1, d2, -n2,
            n20d0, n21 * d32 + n21d1, d2, -n2,
            n20d0, n21d1, d2, -n2,
            -n20d0, -n21d1, -d2, n2
        );

    this.postProjectionMatrix.copy(project.mul(invM));
    this.postProjectionIsIdentity = L5.Matrix.isIdentity(this.postProjectionMatrix);
    this.updatePVMatrix();
};

/**
 * 设置视图前置矩阵
 *
 * @param mat {L5.Matrix}
 * @returns {void}
 */
L5.Camera.prototype.setPreViewMatrix = function (mat) {
    this.preViewMatrix.copy(mat);
    this.preViewIsIdentity = L5.Matrix.isIdentity(mat);
    this.updatePVMatrix();
};

/**
 * 设置视图后置矩阵
 *
 * @param mat {L5.Matrix}
 * @returns {void}
 */
L5.Camera.prototype.setPostProjectionMatrix = function (mat) {
    this.postProjectionMatrix.copy(mat);
    this.postProjectionIsIdentity = L5.Matrix.isIdentity(mat);
    this.updatePVMatrix();
};

/**
 * 在归一化后的显示空间[-1,1]x[-1,1]计算物体轴对齐包围盒
 *
 * @param numVertices  {number}       顶点数量
 * @param vertices     {Float32Array} 顶点数组
 * @param stride       {number}       步幅
 * @param worldMatrix  {L5.Matrix}   物体变换矩阵
 * @returns {object}
 */
L5.Camera.prototype.computeBoundingAABB = function (numVertices,
                                                    vertices,
                                                    stride,
                                                    worldMatrix) {
    // 计算当前物体，世界视图投影矩阵.
    var vpMatrix = this.projectionMatrix.mul(this.viewMatrix);
    if (!this.postProjectionIsIdentity) {
        vpMatrix.copy(this.postProjectionMatrix.mul(vpMatrix));
    }
    var wvpMatrix = vpMatrix.mul(worldMatrix);
    var xmin, xmax, ymin, ymax;
    // 计算规范化后的显示坐标包围盒
    xmin = ymin = Infinity;
    xmax = ymax = -Infinity;

    for (var i = 0; i < numVertices; ++i) {
        var pos = new L5.Point(vertices[i + stride], vertices[i + stride + 1], vertices[i + stride + 2]);
        var hpos = wvpMatrix.mulPoint(pos);
        var invW = 1 / hpos.w;
        var xNDC = hpos.x * invW;
        var yNDC = hpos.y * invW;
        if (xNDC < xmin) {
            xmin = xNDC;
        }
        if (xNDC > xmax) {
            xmax = xNDC;
        }
        if (yNDC < ymin) {
            ymin = yNDC;
        }
        if (yNDC > ymax) {
            ymax = yNDC;
        }
    }
    return {xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax};
};

/**
 * 计算变更后的视图矩阵
 * @returns {void}
 */
L5.Camera.prototype.onFrameChange = function () {
    var nPos = this.position;
    var x = this.right, y = this.up, z = this.direction;

    this.viewMatrix.content[0] = x[0];
    this.viewMatrix.content[1] = y[0];
    this.viewMatrix.content[2] = z[0];
    this.viewMatrix.content[3] = 0;

    this.viewMatrix.content[4] = x[1];
    this.viewMatrix.content[5] = y[1];
    this.viewMatrix.content[6] = z[1];
    this.viewMatrix.content[7] = 0;

    this.viewMatrix.content[8] = x[2];
    this.viewMatrix.content[9] = y[2];
    this.viewMatrix.content[10] = z[2];
    this.viewMatrix.content[11] = 0;

    this.viewMatrix.content[12] = -nPos.dot(x);
    this.viewMatrix.content[13] = -nPos.dot(y);
    this.viewMatrix.content[14] = -nPos.dot(z);
    this.viewMatrix.content[15] = 1;

    this.updatePVMatrix();
};

/**
 * 视截体变化后计算投影矩阵
 * @returns {void}
 */
L5.Camera.prototype.onFrustumChange = function () {
    var f = this.frustum;
    var near = f[L5.Camera.VF_NEAR],
        far = f[L5.Camera.VF_FAR],
        bottom = f[L5.Camera.VF_BOTTOM],
        top = f[L5.Camera.VF_TOP],
        left = f[L5.Camera.VF_LEFT],
        right = f[L5.Camera.VF_RIGHT],

        rl = right - left,
        tb = top - bottom,
        fn = far - near;

    this.projectionMatrix.zero();

    if (this.isPerspective) {
        var near2 = 2 * near;
        this.projectionMatrix.content[0] = near2 / rl;
        this.projectionMatrix.content[5] = near2 / tb;
        this.projectionMatrix.content[8] = (right + left) / rl;
        this.projectionMatrix.content[9] = (top + bottom) / tb;
        this.projectionMatrix.content[10] = -(far + near) / fn;
        this.projectionMatrix.content[11] = -1;
        this.projectionMatrix.content[14] = -(far * near2) / fn;
    }
    else {
        this.projectionMatrix.content[0] = 2 / rl;
        this.projectionMatrix.content[5] = 2 / tb;
        this.projectionMatrix.content[10] = -2 / fn;
        this.projectionMatrix.content[12] = -(left + right) / rl;
        this.projectionMatrix.content[13] = -(top + bottom) / tb;
        this.projectionMatrix.content[14] = -(far + near) / fn;
        this.projectionMatrix.content[15] = 1;
    }

    this.updatePVMatrix();
};

/**
 * 计算postproj-proj-view-preview的乘积
 * @returns {void}
 */
L5.Camera.prototype.updatePVMatrix = function () {

    this.projectionViewMatrix.copy(this.projectionMatrix.mul(this.viewMatrix));


    if (!this.postProjectionIsIdentity) {
        this.projectionViewMatrix.copy(this.postProjectionMatrix.mul(this.projectionViewMatrix));
    }

    if (!this.preViewIsIdentity) {
        this.projectionViewMatrix.copy(this.projectionViewMatrix.mul(this.preViewMatrix));
    }
};

L5.Camera.prototype.debug = function () {
    if (!this.output) {
        this.output = document.createElement('div');
        this.output.style.position = 'absolute';
        this.output.style.right = 0;
        this.output.style.top = 0;
        this.output.style.textAlign = 'right';
        this.output.style.color = 'green';
        document.body.appendChild(this.output);
    }
    var info = '';
    info += '位置:[' +
        Array.from(this.position._content.slice(0, 3))
            .map(function (i) {
                return i.toFixed(4);
            })
            .join(',') + ']<br/>';
    info += '观察方向:[' +
        Array.from(this.direction._content.slice(0, 3))
            .map(function (i) {
                return i.toFixed(4);
            }).join(',') + ']';
    this.output.innerHTML = info;
};

/**
 * CameraNode - 相机节点
 *
 * @param camera {L5.Camera}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.CameraNode = function(camera) {
    L5.Node.call(this);

    this.camera = camera;
};

L5.nameFix(L5.CameraNode, 'CameraNode');
L5.extendFix(L5.CameraNode, L5.Node);

L5.CameraNode.prototype = {
    constructor: L5.CameraNode,

    set camera (val) {
        this._camera = val;
        if (val)
        {
            this.localTransform.setTranslate(val.position);

            var rotate = new L5.Matrix.IPMake(
                val.direction,
                val.up,
                val.right,
                L5.Point.ORIGIN
            );
            this.localTransform.setRotate(rotate);
            this.update();
        }
    },
    get camera () {
        return this._camera;
    },

    updateWorldData: function(applicationTime) {
        L5.Node.prototype.updateWorldData(applicationTime);

        if (this._camera)
        {
            var pos = this.worldTransform.getTranslate();
            var rotate = this.worldTransform.getRotate();
            var direction = L5.Vector.ZERO;
            var up = L5.Vector.ZERO;
            var right = L5.Vector.ZERO;
            rotate.getColumn(0, direction);
            rotate.getColumn(1, up);
            rotate.getColumn(2, right);
            this._camera.setFrame(pos, direction, up, right);
        }
    }
};


/**
 * Culler - 裁剪
 * @version 1.0
 * @author lonphy
 */

L5.Culler = function (camera) {
    // The data members mFrustum, mPlane, and mPlaneState are
    // uninitialized.  They are initialized in the GetVisibleSet call.

    // The input camera has information that might be needed during the
    // culling pass over the scene.
    this._camera = camera || null;

    /**
     * The potentially visible set for a call to GetVisibleSet.
     * @type {L5.VisibleSet}
     * @private
     */
    this._visibleSet = new L5.VisibleSet();

    // The world culling planes corresponding to the view frustum plus any
    // additional user-defined culling planes.  The member m_uiPlaneState
    // represents bit flags to store whether or not a plane is active in the
    // culling system.  A bit of 1 means the plane is active, otherwise the
    // plane is inactive.  An active plane is compared to bounding volumes,
    // whereas an inactive plane is not.  This supports an efficient culling
    // of a hierarchy.  For example, if a node's bounding volume is inside
    // the left plane of the view frustum, then the left plane is set to
    // inactive because the children of the node are automatically all inside
    // the left plane.
    this._planeQuantity = 6;
    this._plane = new Array(L5.Culler.MAX_PLANE_QUANTITY);
    for (var i = 0, l = this._plane.length; i < l; ++i) {
        this._plane[i] = new L5.Plane(L5.Vector.ZERO, 0);
    }
    this._planeState = 0;

    // A copy of the view frustum for the input camera.  This allows various
    // subsystems to change the frustum parameters during culling (for
    // example, the portal system) without affecting the camera, whose initial
    // state is needed by the renderer.
    this._frustum = new Array(L5.Camera.VF_QUANTITY);
};

L5.nameFix(L5.Culler, 'Culler');
L5.Culler.MAX_PLANE_QUANTITY = 32;

L5.Culler.prototype = {
    get camera() {
        return this._camera;
    },
    set camera(val) {
        this._camera = val;
    },

    set frustum(frustum) {
        if (!this._camera) {
            L5.assert(false, "set frustum requires the existence of a camera\n");
            return;
        }

        const VF_NEAR = L5.Camera.VF_NEAR, VF_FAR = L5.Camera.VF_FAR,
            VF_BOTTOM = L5.Camera.VF_BOTTOM, VF_TOP = L5.Camera.VF_TOP,
            VF_LEFT = L5.Camera.VF_LEFT, VF_RIGHT = L5.Camera.VF_RIGHT;

        var near, far, bottom, top, left, right;

        // 赋值到当前实例.
        this._frustum[VF_NEAR] = near = frustum[VF_NEAR];
        this._frustum[VF_FAR] = far = frustum[VF_FAR];
        this._frustum[VF_BOTTOM] = bottom = frustum[VF_BOTTOM];
        this._frustum[VF_TOP] = top = frustum[VF_TOP];
        this._frustum[VF_LEFT] = left = frustum[VF_LEFT];
        this._frustum[VF_RIGHT] = right = frustum[VF_RIGHT];

        var near2 = near * near;
        var bottom2 = bottom * bottom;
        var top2 = top * top;
        var left2 = left * left;
        var right2 = right * right;

        // 获取相机坐标结构
        var position = this._camera.position;
        var directionVec = this._camera.direction;
        var upVec = this._camera.up;
        var rightVec = this._camera.right;
        var dirDotEye = position.dot(directionVec);

        // 更新近平面
        this._plane[VF_NEAR].normal = directionVec;
        this._plane[VF_NEAR].constant = dirDotEye + near;

        // 更新远平面
        this._plane[VF_FAR].normal = directionVec.negative();
        this._plane[VF_FAR].constant = -(dirDotEye + far);

        // 更新下平面
        var invLength = L5.Math.invSqrt(near2 + bottom2);
        var c0 = bottom * -invLength;
        var c1 = near * invLength;
        var normal = directionVec.scalar(c0).add(upVec.scalar(c1));
        var constant = position.dot(normal);
        this._plane[VF_BOTTOM].normal = normal;
        this._plane[VF_BOTTOM].constant = constant;

        // 更新上平面
        invLength = L5.Math.invSqrt(near2 + top2);
        c0 = top * invLength;
        c1 = near * -invLength;
        normal = directionVec.scalar(c0).add(upVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_TOP].normal = normal;
        this._plane[VF_TOP].constant = constant;

        // 更新左平面
        invLength = L5.Math.invSqrt(near2 + left2);
        c0 = left * -invLength;
        c1 = near * invLength;
        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_LEFT].normal = normal;
        this._plane[VF_LEFT].constant = constant;

        // 更新右平面
        invLength = L5.Math.invSqrt(near2 + right2);
        c0 = right * invLength;
        c1 = near * -invLength;
        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_RIGHT].normal = normal;
        this._plane[VF_RIGHT].constant = constant;

        // All planes are active initially.
        this._planeState = 0xFFFFFFFF;
    },
    get frustum() {
        return this._frustum;
    },

    get visibleSet() {
        return this._visibleSet;
    },
    get planeState() {
        return this._planeState;
    },
    set planeState(val) {
        this._planeState = val;
    },
    get planes() {
        return this._plane;
    },

    get planeQuantity() {
        return this._planeQuantity;
    },


    pushPlan: function (plane) {
        if (this._planeQuantity < L5.Culler.MAX_PLANE_QUANTITY) {
            // The number of user-defined planes is limited.
            this._plane[this._planeQuantity] = plane;
            ++this._planeQuantity;
        }
    },
    popPlane: function () {
        if (this._planeQuantity > L5.Camera.VF_QUANTITY) {
            // Frustum planes may not be removed from the stack.
            --this._planeQuantity;
        }
    },

    /**
     * The base class behavior is to append the visible object to the end of
     * the visible set (stored as an array).  Derived classes may override
     * this behavior; for example, the array might be maintained as a sorted
     * array for minimizing render state changes or it might be/ maintained
     * as a unique list of objects for a portal system.
     * @param visible {L5.Spatial}
     */
    insert: function (visible) {
        this._visibleSet.insert(visible);
    },

    /**
     * Compare the object's world bound against the culling planes.
     * Only Spatial calls this function.
     *
     * @param bound {L5.Bound}
     * @returns {boolean}
     */
    isVisible: function (bound) {
        if (bound.radius === 0) {
            // 该节点是虚拟节点，不可见
            return false;
        }

        // Start with the last pushed plane, which is potentially the most
        // restrictive plane.
        var index = this._planeQuantity - 1;
        var mask = (1 << index);

        for (var i = 0; i < this._planeQuantity; ++i, --index, mask >>= 1) {
            if (this._planeState & mask) {
                var side = bound.whichSide(this._plane[index]);

                if (side < 0) {
                    // The object is on the negative side of the plane, so
                    // cull it.
                    return false;
                }

                if (side > 0) {
                    // The object is on the positive side of plane.  There is
                    // no need to compare subobjects against this plane, so
                    // mark it as inactive.
                    this._planeState &= ~mask;
                }
            }
        }

        return true;
    },

    /**
     * Support for Portal.getVisibleSet.
     * @param numVertices {number}
     * @param vertices {Array<L5.Point>}
     * @param ignoreNearPlane {boolean}
     */
    isVisible1: function (numVertices, vertices, ignoreNearPlane) {
        // The Boolean variable ignoreNearPlane should be set to 'true' when
        // the test polygon is a portal.  This avoids the situation when the
        // portal is in the view pyramid (eye+left/right/top/bottom), but is
        // between the eye and near plane.  In such a situation you do not want
        // the portal system to cull the portal.  This situation typically occurs
        // when the camera moves through the portal from current region to
        // adjacent region.

        // Start with the last pushed plane, which is potentially the most
        // restrictive plane.
        var index = this._planeQuantity - 1;
        for (var i = 0; i < this._planeQuantity; ++i, --index) {
            var plane = this._plane[index];
            if (ignoreNearPlane && index == L5.Camera.VF_NEAR) {
                continue;
            }

            var j;
            for (j = 0; j < numVertices; ++j) {
                var side = plane.whichSide(vertices[j]);
                if (side >= 0) {
                    // The polygon is not totally outside this plane.
                    break;
                }
            }

            if (j == numVertices) {
                // The polygon is totally outside this plane.
                return false;
            }
        }

        return true;
    },

    // Support for BspNode::GetVisibleSet.  Determine whether the view frustum
    // is fully on one side of a plane.  The "positive side" of the plane is
    // the half space to which the plane normal points.  The "negative side"
    // is the other half space.  The function returns +1 if the view frustum
    // is fully on the positive side of the plane, -1 if the view frustum is
    // fully on the negative side of the plane, or 0 if the view frustum
    // straddles the plane.  The input plane is in world coordinates and the
    // world camera coordinate system is used for the test.
    /**
     * @param plane {L5.Plane}
     * @returns {number}
     */
    whichSide: function (plane) {
        // The plane is N*(X-C) = 0 where the * indicates dot product.  The signed
        // distance from the camera location E to the plane is N*(E-C).
        var NdEmC = plane.distanceTo(this._camera.position);

        var normal = plane.normal;
        var NdD = normal.dot(this._camera.direction);
        var NdU = normal.dot(this._camera.up);
        var NdR = normal.dot(this._camera.right);
        var FdN = this._frustum[L5.Camera.VF_FAR] / this._frustum[L5.Camera.VF_NEAR];

        var positive = 0, negative = 0, sgnDist;

        // Check near-plane vertices.
        var PDMin = this._frustum[L5.Camera.VF_NEAR] * NdD;
        var NUMin = this._frustum[L5.Camera.VF_BOTTOM] * NdU;
        var NUMax = this._frustum[L5.Camera.VF_TOP] * NdU;
        var NRMin = this._frustum[L5.Camera.VF_LEFT] * NdR;
        var NRMax = this._frustum[L5.Camera.VF_RIGHT] * NdR;

        // V = E + dmin*D + umin*U + rmin*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umin*(N*U) + rmin*(N*R)
        sgnDist = NdEmC + PDMin + NUMin + NRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmin*D + umin*U + rmax*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umin*(N*U) + rmax*(N*R)
        sgnDist = NdEmC + PDMin + NUMin + NRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmin*D + umax*U + rmin*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umax*(N*U) + rmin*(N*R)
        sgnDist = NdEmC + PDMin + NUMax + NRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmin*D + umax*U + rmax*R
        // N*(V-C) = N*(E-C) + dmin*(N*D) + umax*(N*U) + rmax*(N*R)
        sgnDist = NdEmC + PDMin + NUMax + NRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // check far-plane vertices (s = dmax/dmin)
        var PDMax = this._frustum[L5.Camera.VF_FAR] * NdD;
        var FUMin = FdN * NUMin;
        var FUMax = FdN * NUMax;
        var FRMin = FdN * NRMin;
        var FRMax = FdN * NRMax;

        // V = E + dmax*D + umin*U + rmin*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umin*(N*U) + s*rmin*(N*R)
        sgnDist = NdEmC + PDMax + FUMin + FRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmax*D + umin*U + rmax*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umin*(N*U) + s*rmax*(N*R)
        sgnDist = NdEmC + PDMax + FUMin + FRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmax*D + umax*U + rmin*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umax*(N*U) + s*rmin*(N*R)
        sgnDist = NdEmC + PDMax + FUMax + FRMin;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        // V = E + dmax*D + umax*U + rmax*R
        // N*(V-C) = N*(E-C) + dmax*(N*D) + s*umax*(N*U) + s*rmax*(N*R)
        sgnDist = NdEmC + PDMax + FUMax + FRMax;
        if (sgnDist > 0) {
            positive++;
        }
        else if (sgnDist < 0) {
            negative++;
        }

        if (positive > 0) {
            if (negative > 0) {
                // Frustum straddles the plane.
                return 0;
            }

            // Frustum is fully on the positive side.
            return +1;
        }

        // Frustum is fully on the negative side.
        return -1;
    },

    /**
     * 计算裁剪后的可见物体
     * @param scene {L5.Spatial}
     */
    computeVisibleSet: function (scene) {
        if (this._camera && scene) {
            this.frustum = this.camera.frustum;
            this._visibleSet.clear();
            scene.onGetVisibleSet(this, false);
            return;
        }
        L5.assert(false, "A camera and a scene are required for culling\n");
    }
};

/**
 * 灯光 - Light
 * @class
 * @extends {L5.D3Object}
 * @author lonphy
 * @version 1.0
 *
 * @param type {number} 灯光类型
 */
L5.Light = function (type) {
    this.type = type;

    // 灯光颜色属性
    this.ambient = new Float32Array([0, 0, 0, 1]);
    this.diffuse = new Float32Array([0, 0, 0, 1]);
    this.specular = new Float32Array([0, 0, 0, 1]);

    // 衰减系数
    //     m = 1/(C + L*d + Q*d*d)
    // C : 常量系数
    // L : 线性系数
    // Q : 2次系数
    // d : 从光源位置到顶点的距离
    // 使用线性衰减光强,可用:m = I/(C + L*d + Q*d*d)替代, I是强度系数
    this.constant = 1.0;
    this.linear = 0.0;
    this.quadratic = 0.0;
    this.intensity = 1.0;

    // 聚光灯参数
    // 椎体夹角为弧度制, 范围为: 0 < angle <= Math.PI.
    this.angle = L5.Math.PI;
    this.cosAngle = -1.0;
    this.sinAngle = 0.0;
    this.exponent = 1.0;

    this.position = L5.Point.ORIGIN;
    this.direction = new L5.Vector(0, 0, -1);
    this.up = new L5.Vector(0, 1, 0);
    this.right = new L5.Vector(1, 0, 0);

};
L5.nameFix(L5.Light, 'Light');
L5.extendFix(L5.Light, L5.D3Object);

L5.Light.LT_AMBIENT = 0;  // 环境光
L5.Light.LT_DIRECTIONAL = 1; // 方向光
L5.Light.LT_POINT = 2; // 点光源
L5.Light.LT_SPOT = 3; // 聚光等
L5.Light.LT_INVALID = 4; // 无效光源

L5.Light.prototype.setAngle = function (angle) {
    L5.assert(0 < angle && angle <= L5.Math.PI, "Angle out of range in SetAngle");
    this.angle = angle;
    this.cosAngle = L5.Math.cos(angle);
    this.sinAngle = L5.Math.sin(angle);
};
L5.Light.prototype.setDirection = function (dir) {
    dir.normalize();
    this.direction.copy(dir);
    L5.Vector.generateComplementBasis(this.up, this.right, this.direction);
};
L5.Light.prototype.setPosition = function(pos) {
    this.position.copy(pos);
};


L5.Light.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.type = inStream.readEnum();
    this.ambient.set(inStream.readFloat32Range(4));
    this.diffuse.set(inStream.readFloat32Range(4));
    this.specular.set(inStream.readFloat32Range(4));
    this.constant = inStream.readFloat32();
    this.linear = inStream.readFloat32();
    this.quadratic = inStream.readFloat32();
    this.intensity = inStream.readFloat32();
    this.angle = inStream.readFloat32();
    this.cosAngle = inStream.readFloat32();
    this.sinAngle = inStream.readFloat32();
    this.exponent = inStream.readFloat32();
    this.position = inStream.readPoint();
    this.direction.copy(inStream.readFloat32Range(4));
    this.up.copy(inStream.readFloat32Range(4));
    this.right.copy(inStream.readFloat32Range(4));
};

L5.Light.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeEnum(this.type);
    outStream.writeFloat32Array(4, this.ambient);
    outStream.writeFloat32Array(4, this.diffuse);
    outStream.writeFloat32Array(4, this.specular);
    outStream.writeFloat32(this.constant);
    outStream.writeFloat32(this.linear);
    outStream.writeFloat32(this.quadratic);
    outStream.writeFloat32(this.intensity);
    outStream.writeFloat32(this.angle);
    outStream.writeFloat32(this.cosAngle);
    outStream.writeFloat32(this.sinAngle);
    outStream.writeFloat32(this.exponent);
    outStream.writeFloat32Array(4, this.position);
    outStream.writeFloat32Array(4, this.direction);
    outStream.writeFloat32Array(4, this.up);
    outStream.writeFloat32Array(4, this.right);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.Light}
 */
L5.Light.factory = function (inStream) {
    var obj = new L5.Light(L5.Light.LT_INVALID);
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.Light', L5.Light.factory);

/**
 * 光源节点
 * @param light {L5.Light}
 * @constructor
 * @extends {L5.Node}
 */
L5.LightNode = function (light) {
    L5.Node.call(this);
    this.light = light;

    if (light) {
        this.localTransform.setTranslate(light.position);
        var rotate = L5.Matrix.fromVectorAndPoint(light.direction, light.up, light.right, L5.Point.ORIGIN);
        this.localTransform.setRotate(rotate);
    }
};
L5.nameFix(L5.LightNode, 'LightNode');
L5.extendFix(L5.LightNode, L5.Node);

/**
 *
 * @param light {L5.Light}
 */
L5.LightNode.prototype.setLight = function (light) {
    this.light = light;
    if (light) {
        this.localTransform.setTranslate(light.position);
        var rotate = L5.Matrix.fromVectorAndPoint(light.direction, light.up, light.right, L5.Point.ORIGIN);
        this.localTransform.setRotate(rotate);
        this.update();
    }
};
/**
 * @param applicationTime {float}
 */
L5.LightNode.prototype.updateWorldData = function (applicationTime) {
    L5.Node.prototype.updateWorldData.call(this, applicationTime);
    var light = this.light;
    if (light) {
        light.position = this.worldTransform.getTranslate();
        var rotate = this.worldTransform.getRotate();
        rotate.getColumn(0, light.direction);
        rotate.getColumn(1, light.up);
        rotate.getColumn(2, light.right);
    }
};

/**
 * Material 材质
 *
 * @extends {L5.D3Object}
 * @class
 */
L5.Material = function(){
    L5.D3Object.call(this);

    this.emissive = new Float32Array([0,0,0,0]);
    this.ambient = new Float32Array([0,0,0,1]);
    this.diffuse = new Float32Array([0,0,0,1]);

    // 光滑度在alpha通道
    this.specular = new Float32Array([0,0,0,0]);
};
L5.nameFix(L5.Material, 'Material');
L5.extendFix(L5.Material, L5.D3Object);

L5.Material.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.emissive.set(inStream.readFloat32Range(4));
    this.ambient.set(inStream.readFloat32Range(4));
    this.diffuse.set(inStream.readFloat32Range(4));
    this.specular.set(inStream.readFloat32Range(4));
};

L5.Material.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeFloat32Array(4, this.emissive);
    outStream.writeFloat32Array(4, this.ambient);
    outStream.writeFloat32Array(4, this.diffuse);
    outStream.writeFloat32Array(4, this.specular);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.Material}
 */
L5.Material.factory = function (inStream) {
    var obj = new L5.Material();
    obj.emissive[3] = 0;
    obj.ambient[3] = 0;
    obj.diffuse[3] = 0;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.Material', L5.Material.factory);

L5.Particles = function(){
    L5.TriMesh.call(this);
};

L5.nameFix(L5.Particles, 'Particles');
L5.extendFix(L5.Particles, L5.TriMesh);

L5.PickRecord = function(){};
L5.nameFix(L5.PickRecord, 'PickRecord');

L5.Picker = function(){};
L5.nameFix(L5.Picker, 'Picker');

/**
 * 点 模型
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @class
 * @extends {L5.Visual}
 *
 * @author lonphy
 * @version 1.0
 *
 */
L5.PolyPoint = function(format, vertexBuffer){
    L5.Visual.call(this,L5.Visual.PT_POLYPOINT, format, vertexBuffer, null);

    // 点数量
    this.numPoints = vertexBuffer.numElements;

};
L5.nameFix(L5.PolyPoint, 'PolyPoint');
L5.extendFix(L5.PolyPoint, L5.Visual);

L5.PolyPoint.prototype.getMaxNumPoints = function(){
        return this.vertexBuffer.numElements;
};
/**
 *
 * @param num {int}
 */
L5.PolyPoint.prototype.setNumPoints = function(num) {
    var numVertices = this.vertexBuffer.numElements;
    if (0 <= num && num <= numVertices) {
        this.numPoints = num;
    }
    else {
        this.numPoints = numVertices;
    }
};

L5.Polysegment = function(){};
L5.nameFix(L5.Polysegment, 'Polysegment');
L5.extendFix(L5.Polysegment, L5.Visual);

L5.Projector = function(){};
L5.nameFix(L5.Projector, 'Projector');
L5.extendFix(L5.Projector, L5.Camera);

L5.ScreenTarget = function(){};

L5.nameFix(L5.ScreenTarget, 'ScreenTarget');

/**
 * 标准网格 - StandardMesh
 *
 * @param format {L5.VertexFormat} 网格顶点格式
 * @param isStatic {boolean} 是否使用静态缓冲, 默认true;
 * @param inside {boolean} 是否反向卷绕, 默认false
 * @param transform {L5.Transform} 默认为单位变换
 */
L5.StandardMesh = function (format, isStatic, inside, transform) {
    isStatic = isStatic === undefined ? true : isStatic;
    this.format = format;
    this.transform = transform || L5.Transform.IDENTIRY;
    this.isStatic = true;
    this.inside = !!inside;
    this.hasNormals = false;

    this.usage = isStatic ? L5.Buffer.BU_STATIC : L5.Buffer.BU_DYNAMIC;

    // 检查顶点坐标
    var posIndex = format.getIndex(L5.VertexFormat.AU_POSITION);
    L5.assert(posIndex >= 0, 'Vertex format must have positions');
    var posType = format.getAttributeType(posIndex);
    L5.assert(posType === L5.VertexFormat.AT_FLOAT3, 'Positions must be 3-element of floats');

    // 检查法线
    var norIndex = format.getIndex(L5.VertexFormat.AU_NORMAL);
    if (norIndex >= 0) {
        var norType = format.getAttributeType(norIndex);
        this.hasNormals = (norType === L5.VertexFormat.AT_FLOAT3);
    }

    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;
    const AU_TEXCOORD = L5.VertexFormat.AU_TEXCOORD;
    const AT_FLOAT2 = L5.VertexFormat.AT_FLOAT2;

    this.hasTCoords = new Array(MAX_UNITS);
    for (var unit = 0; unit < MAX_UNITS; ++unit) {
        this.hasTCoords[unit] = false;
        var tcdIndex = format.getIndex(AU_TEXCOORD, unit);
        if (tcdIndex >= 0) {
            var tcdType = format.getAttributeType(tcdIndex);
            if (tcdType === AT_FLOAT2) {
                this.hasTCoords[unit] = true;
            }
        }
    }
};
L5.nameFix(L5.StandardMesh, 'StandardMesh');
L5.StandardMesh.MAX_UNITS = L5.VertexFormat.MAX_TCOORD_UNITS;

/**
 * 长方形
 * @param xSamples {number} x方向点数量
 * @param ySamples {number} y方向点数量
 * @param xExtent {number} x 方向长度
 * @param yExtent {number} y 方向长度
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.rectangle = function (xSamples, ySamples, xExtent, yExtent) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormals = this.hasNormals;

    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;
    var numVertices = xSamples * ySamples;
    var numTriangles = 2 * (xSamples - 1) * (ySamples - 1);
    var numIndices = 3 * numTriangles;

    // 创建顶点缓冲
    var vertexBuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vertexBuffer);

    // 生成几何体
    var stepX = 1 / (xSamples - 1); // x 方向每2个顶点间的距离
    var stepY = 1 / (ySamples - 1); // y 方向每2个顶点间的距离
    var u, v, x, y, p;
    var i, i0, i1, unit;
    for (i1 = 0, i = 0; i1 < ySamples; ++i1) {
        v = i1 * stepY;
        y = (2 * v - 1) * yExtent;
        for (i0 = 0; i0 < xSamples; ++i0, ++i) {
            u = i0 * stepX;
            x = (2 * u - 1) * xExtent;

            p = vba.setPosition(i, [x, y, 0]);

            if (hasNormals) {
                p = vba.setNormal(i, [0, 0, 1]);
            }

            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    p = vba.setTCoord(unit, i, [u, v]);
                }
            }
        }
    }
    this.transformData(vba);

    // 生成顶点索引
    var indexBuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(indexBuffer.getData().buffer);
    var v0, v1, v2, v3, idx = 0;
    for (i1 = 0; i1 < ySamples - 1; ++i1) {
        for (i0 = 0; i0 < xSamples - 1; ++i0) {
            v0 = i0 + xSamples * i1;
            v1 = v0 + 1;
            v2 = v1 + xSamples;
            v3 = v0 + xSamples;
            indices[idx++] = v0;
            indices[idx++] = v1;
            indices[idx++] = v2;
            indices[idx++] = v0;
            indices[idx++] = v2;
            indices[idx++] = v3;
        }
    }

    return new L5.TriMesh(format, vertexBuffer, indexBuffer);
};

/**
 * 圆盘
 * todo error
 * @param shellSamples {number}
 * @param radialSamples {number}
 * @param radius {number}
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.disk = function (shellSamples, radialSamples, radius) {
    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;
    const usage = this.usage;
    const format = this.format;
    const hasNormals = this.hasNormals;
    const cos = L5.Math.cos;
    const sin = L5.Math.sin;

    var rsm1 = radialSamples - 1,
        ssm1 = shellSamples - 1;
    var numVertices = 1 + radialSamples * ssm1;
    var numTriangles = radialSamples * (2 * ssm1 - 1);
    var numIndices = 3 * numTriangles;

    var vertexBuffer = new L5.VertexBuffer(numVertices, format.stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vertexBuffer);

    var t;

    // Center of disk.
    vba.setPosition(0, [0, 0, 0]);

    if (hasNormals) {
        vba.setNormal(0, [0, 0, 1]);
    }

    var unit;
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, 0, [0.5, 0.5]);
        }
    }

    var invSSm1 = 1 / ssm1;
    var invRS = 1 / radialSamples;
    var rsPI = L5.Math.TWO_PI * invRS;
    var tcoord = [0.5, 0.5];

    var angle, cs, sn, s, fraction, fracRadial, fracRadial1, i;

    for (var r = 0; r < radialSamples; ++r) {
        angle = rsPI * r;
        cs = cos(angle);
        sn = sin(angle);

        var radial = new L5.Vector(cs, sn, 0);

        for (s = 1; s < shellSamples; ++s) {
            fraction = invSSm1 * s;  // in (0,R]
            fracRadial = radial.scalar(fraction);
            i = s + ssm1 * r;

            fracRadial1 = fracRadial.scalar(radius);
            vba.setPosition(i, [fracRadial1.x, fracRadial1.y, fracRadial1.z]);

            if (hasNormals) {
                vba.setNormal(i, [0, 0, 1]);
            }

            tcoord[0] = 0.5 + 0.5 * fracRadial[0];
            tcoord[1] = 0.5 + 0.5 * fracRadial[1];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }
        }
    }
    this.transformData(vba);

    // Generate indices.
    var indexBuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(indexBuffer.getData().buffer);
    var r0, r1;
    for (r0 = rsm1, r1 = 0, t = 0; r1 < radialSamples; r0 = r1++) {
        indices[0] = 0;
        indices[1] = 1 + ssm1 * r0;
        indices[2] = 1 + ssm1 * r1;
        indices += 3;
        ++t;
        for (s = 1; s < ssm1; ++s, indices += 6) {
            var i00 = s + ssm1 * r0;
            var i01 = s + ssm1 * r1;
            var i10 = i00 + 1;
            var i11 = i01 + 1;
            indices[0] = i00;
            indices[1] = i10;
            indices[2] = i11;
            indices[3] = i00;
            indices[4] = i11;
            indices[5] = i01;
            t += 2;
        }
    }

    return new L5.TriMesh(format, vertexBuffer, indexBuffer);
};

/**
 * 长方体
 * 中心点 [0,0,0]
 * @param xExtent {number}
 * @param yExtent {number}
 * @param zExtent {number}
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.box = function (xExtent, yExtent, zExtent) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;

    var numVertices = 8;
    var numTriangles = 12;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [-xExtent, -yExtent, -zExtent]);
    vba.setPosition(1, [+xExtent, -yExtent, -zExtent]);
    vba.setPosition(2, [+xExtent, +yExtent, -zExtent]);
    vba.setPosition(3, [-xExtent, +yExtent, -zExtent]);
    vba.setPosition(4, [-xExtent, -yExtent, +zExtent]);
    vba.setPosition(5, [+xExtent, -yExtent, +zExtent]);
    vba.setPosition(6, [+xExtent, +yExtent, +zExtent]);
    vba.setPosition(7, [-xExtent, +yExtent, +zExtent]);

    for (var unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, 0, [0.25, 0.75]);
            vba.setTCoord(unit, 1, [0.75, 0.75]);
            vba.setTCoord(unit, 2, [0.75, 0.25]);
            vba.setTCoord(unit, 3, [0.25, 0.25]);
            vba.setTCoord(unit, 4, [0, 1]);
            vba.setTCoord(unit, 5, [1, 1]);
            vba.setTCoord(unit, 6, [1, 0]);
            vba.setTCoord(unit, 7, [0, 0]);
        }
    }
    this.transformData(vba);

    // Generate indices (outside view).
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;

    indices[6] = 0;
    indices[7] = 5;
    indices[8] = 1;
    indices[9] = 0;
    indices[10] = 4;
    indices[11] = 5;

    indices[12] = 0;
    indices[13] = 7;
    indices[14] = 4;
    indices[15] = 0;
    indices[16] = 3;
    indices[17] = 7;

    indices[18] = 6;
    indices[19] = 5;
    indices[20] = 4;
    indices[21] = 6;
    indices[22] = 4;
    indices[23] = 7;

    indices[24] = 6;
    indices[25] = 1;
    indices[26] = 5;
    indices[27] = 6;
    indices[28] = 2;
    indices[29] = 1;

    indices[30] = 6;
    indices[31] = 3;
    indices[32] = 2;
    indices[33] = 6;
    indices[34] = 7;
    indices[35] = 3;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    var mesh = new L5.TriMesh(format, vbuffer, ibuffer);
    if (this.hasNormals) {
        mesh.updateModelSpace(L5.Visual.GU_NORMALS);
    }
    return mesh;
};

// 圆通
// The cylinder has center (0,0,0), the specified 'radius', and the
// specified 'height'.  The cylinder axis is a line segment of the
// form (0,0,0) + t*(0,0,1) for |t| <= height/2.  The cylinder wall
// is implicitly defined by x^2+y^2 = radius^2.  If 'open' is 'true',
// the cylinder end-disks are omitted; you have an open tube.  If
// 'open' is 'false', the end-disks are included.  Each end-disk is
// a regular polygon that is tessellated by including a vertex at
// the center of the polygon and decomposing the polygon into triangles
// that all share the center vertex and each triangle containing an
// edge of the polygon.
L5.StandardMesh.prototype.cylinder = function (axisSamples, radialSamples, radius, height, open) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const TWO_PI = L5.Math.TWO_PI;
    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;
    const cos = L5.Math.cos;
    const sin = L5.Math.sin;
    const hasNormals = this.hasNormals;
    const inside = this.inside;

    var unit, numVertices, vba;
    var tcoord;
    var t, i;
    var vertexBuffer, ibuffer;
    var mesh;

    if (open) {
        numVertices = axisSamples * (radialSamples + 1);
        var numTriangles = 2 * (axisSamples - 1) * radialSamples;
        var numIndices = 3 * numTriangles;

        // Create a vertex buffer.
        vertexBuffer = new L5.VertexBuffer(numVertices, stride, usage);
        vba = new L5.VertexBufferAccessor(format, vertexBuffer);

        // Generate geometry.
        var invRS = 1 / radialSamples;
        var invASm1 = 1 / (axisSamples - 1);
        var halfHeight = 0.5 * height;
        var r, a, aStart, angle;

        // Generate points on the unit circle to be used in computing the
        // mesh points on a cylinder slice.
        var cs = new Float32Array(radialSamples + 1);
        var sn = new Float32Array(radialSamples + 1);
        for (r = 0; r < radialSamples; ++r) {
            angle = TWO_PI * invRS * r;
            cs[r] = cos(angle);
            sn[r] = sin(angle);
        }
        cs[radialSamples] = cs[0];
        sn[radialSamples] = sn[0];

        // Generate the cylinder itself.
        for (a = 0, i = 0; a < axisSamples; ++a) {
            var axisFraction = a * invASm1;  // in [0,1]
            var z = -halfHeight + height * axisFraction;

            // Compute center of slice.
            var sliceCenter = new L5.Point(0, 0, z);

            // Compute slice vertices with duplication at endpoint.
            var save = i;
            for (r = 0; r < radialSamples; ++r) {
                var radialFraction = r * invRS;  // in [0,1)
                var normal = new L5.Vector(cs[r], sn[r], 0);
                t = sliceCenter.add(normal.scalar(radius));
                vba.setPosition(i, [t.x, t.y, t.z]);

                if (hasNormals) {
                    if (inside) {
                        normal = normal.negative();
                    }
                    vba.setNormal(i, [normal.x, normal.y, normal.z]);
                }

                tcoord = [radialFraction, axisFraction];
                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        vba.setTCoord(unit, i, tcoord);
                    }
                }

                ++i;
            }

            vba.setPosition(i, vba.getPosition(save));
            if (hasNormals) {
                vba.setNormal(i, vba.getNormal(save));
            }

            tcoord = [1, axisFraction];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(0, i, tcoord);
                }
            }

            ++i;
        }
        this.transformData(vba);

        // Generate indices.
        ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
        var indices = new Uint32Array(ibuffer.getData().buffer);
        var j = 0;
        for (a = 0, aStart = 0; a < axisSamples - 1; ++a) {
            var i0 = aStart;
            var i1 = i0 + 1;
            aStart += radialSamples + 1;
            var i2 = aStart;
            var i3 = i2 + 1;
            for (i = 0; i < radialSamples; ++i, j += 6) {
                if (inside) {
                    indices[j] = i0++;
                    indices[j + 1] = i2;
                    indices[j + 2] = i1;
                    indices[j + 3] = i1++;
                    indices[j + 4] = i2++;
                    indices[j + 5] = i3++;
                }
                else { // outside view
                    indices[j] = i0++;
                    indices[j + 1] = i1;
                    indices[j + 2] = i2;
                    indices[j + 3] = i1++;
                    indices[j + 4] = i3++;
                    indices[j + 5] = i2++;
                }
            }
        }
        mesh = new L5.TriMesh(format, vertexBuffer, ibuffer);
    }
    else {
        mesh = this.sphere(axisSamples, radialSamples, radius);
        vertexBuffer = mesh.vertexBuffer;
        numVertices = vertexBuffer.numElements;
        vba = new L5.VertexBufferAccessor(format, vertexBuffer);

        // Flatten sphere at poles.
        var hDiv2 = 0.5 * height;
        vba.getPosition(numVertices - 2)[2] = -hDiv2;  // south pole
        vba.getPosition(numVertices - 1)[2] = +hDiv2;  // north pole

        // Remap z-values to [-h/2,h/2].
        var zFactor = 2 / (axisSamples - 1);
        var tmp0 = radius * (-1 + zFactor);
        var tmp1 = 1 / (radius * (1 - zFactor));
        for (i = 0; i < numVertices - 2; ++i) {
            var pos = vba.getPosition(i);
            pos[2] = hDiv2 * (-1 + tmp1 * (pos[2] - tmp0));
            var adjust = radius * L5.Math.invSqrt(pos[0] * pos[0] + pos[1] * pos[1]);
            pos[0] *= adjust;
            pos[1] *= adjust;
        }
        this.transformData(vba);

        if (hasNormals) {
            mesh.updateModelSpace(L5.Visual.GU_NORMALS);
        }
    }

    // The duplication of vertices at the seam causes the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.

    mesh.modelBound.center = L5.Point.ORIGIN;
    mesh.modelBound.radius = L5.Math.sqrt(radius * radius + height * height);
    return mesh;
};

/**
 * 球体
 * 物体中心:(0,0,0), 半径: radius, 北极点(0,0,radius), 南极点(0,0,-radius)
 *
 * @param radius {float} 球体半径
 * @param zSamples {int}
 * @param radialSamples {int}
 */
L5.StandardMesh.prototype.sphere = function (zSamples, radialSamples, radius) {
    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;
    const TWO_PI = L5.Math.TWO_PI;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormal = this.hasNormals;
    const inside = this.inside;

    var zsm1 = zSamples - 1,
        zsm2 = zSamples - 2,
        zsm3 = zSamples - 3;
    var rsp1 = radialSamples + 1;
    var numVertices = zsm2 * rsp1 + 2;
    var numTriangles = 2 * zsm2 * radialSamples;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    var invRS = 1 / radialSamples;
    var zFactor = 2 / zsm1;
    var r, z, zStart, i, unit, tcoord, angle;

    // Generate points on the unit circle to be used in computing the mesh
    // points on a cylinder slice.
    var sn = new Float32Array(rsp1);
    var cs = new Float32Array(rsp1);
    for (r = 0; r < radialSamples; ++r) {
        angle = TWO_PI * invRS * r;
        cs[r] = L5.Math.cos(angle);
        sn[r] = L5.Math.sin(angle);
    }
    sn[radialSamples] = sn[0];
    cs[radialSamples] = cs[0];

    var t;

    // Generate the cylinder itself.
    for (z = 1, i = 0; z < zsm1; ++z) {
        var zFraction = zFactor * z - 1;  // in (-1,1)
        var zValue = radius * zFraction;

        // Compute center of slice.
        var sliceCenter = new L5.Point(0, 0, zValue);

        // Compute radius of slice.
        var sliceRadius = L5.Math.sqrt(L5.Math.abs(radius * radius - zValue * zValue));

        // Compute slice vertices with duplication at endpoint.
        var save = i;
        for (r = 0; r < radialSamples; ++r) {
            var radialFraction = r * invRS;  // in [0,1)
            var radial = new L5.Vector(cs[r], sn[r], 0);
            t = radial.scalar(sliceRadius).add(sliceCenter);
            vba.setPosition(i, [t.x, t.y, t.z]);

            if (hasNormal) {
                t.normalize();
                if (inside) {
                    t = t.negative();
                }
                vba.setNormal(i, [t.x, t.y, t.z]);
            }

            tcoord = [radialFraction, 0.5 * (zFraction + 1)];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }
            ++i;
        }

        vba.setPosition(i, vba.getPosition(save));
        if (hasNormal) {
            vba.setNormal(i, vba.getNormal(save));
        }

        tcoord = [1, 0.5 * (zFraction + 1)];
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, tcoord);
            }
        }
        ++i;
    }

    // south pole
    vba.setPosition(i, [0, 0, -radius]);
    var nor = [0, 0, inside ? 1 : -1];
    if (hasNormal) {
        vba.setNormal(i, nor);
    }
    tcoord = [0.5, 0.5];
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, i, tcoord);
        }
    }
    ++i;

    // north pole
    vba.setPosition(i, [0, 0, radius]);
    nor = [0, 0, inside ? -1 : 1];
    if (hasNormal) {
        vba.setNormal(i, nor);
    }
    tcoord = [0.5, 1];
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, i, tcoord);
        }
    }
    ++i;

    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    var j;
    for (z = 0, j = 0, zStart = 0; z < zsm3; ++z) {
        var i0 = zStart;
        var i1 = i0 + 1;
        zStart += rsp1;
        var i2 = zStart;
        var i3 = i2 + 1;
        for (i = 0; i < radialSamples; ++i, j += 6) {
            if (inside) {
                indices[j] = i0++;
                indices[j + 1] = i2;
                indices[j + 2] = i1;
                indices[j + 3] = i1++;
                indices[j + 4] = i2++;
                indices[j + 5] = i3++;
            }
            else  // inside view
            {
                indices[j] = i0++;
                indices[j + 1] = i1;
                indices[j + 2] = i2;
                indices[j + 3] = i1++;
                indices[j + 4] = i3++;
                indices[j + 5] = i2++;
            }
        }
    }

    // south pole triangles
    var numVerticesM2 = numVertices - 2;
    for (i = 0; i < radialSamples; ++i, j += 3) {
        if (inside) {
            indices[j] = i;
            indices[j + 1] = i + 1;
            indices[j + 2] = numVerticesM2;
        }
        else {
            indices[j] = i;
            indices[j + 1] = numVerticesM2;
            indices[j + 2] = i + 1;
        }
    }

    // north pole triangles
    var numVerticesM1 = numVertices - 1,
        offset = zsm3 * rsp1;
    for (i = 0; i < radialSamples; ++i, j += 3) {
        if (inside) {
            indices[j] = i + offset;
            indices[j + 1] = numVerticesM1;
            indices[j + 2] = i + 1 + offset;
        }
        else {
            indices[j] = i + offset;
            indices[j + 1] = i + 1 + offset;
            indices[j + 2] = numVerticesM1;
        }
    }

    // The duplication of vertices at the seam cause the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.
    var mesh = new L5.TriMesh(this.format, vbuffer, ibuffer);
    mesh.modelBound.center = L5.Point.ORIGIN;
    mesh.modelBound.radius = radius;
    return mesh;
};

/**
 * 圆环
 * @param circleSamples {int} 大圆细分
 * @param radialSamples {int} 小圆细分
 * @param outerRadius {float} 大圆半径
 * @param innerRadius {float} 小圆半径
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.torus = function (circleSamples, radialSamples, outerRadius, innerRadius) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormals = this.hasNormals;
    const inside = this.inside;
    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;

    const TWO_PI = L5.Math.TWO_PI;
    const cos = L5.Math.cos;
    const sin = L5.Math.sin;

    var numVertices = (circleSamples + 1) * (radialSamples + 1);
    var numTriangles = 2 * circleSamples * radialSamples;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    var invCS = 1 / circleSamples;
    var invRS = 1 / radialSamples;
    var c, r, i, save, unit, tcoord;
    var circleFraction, theta, cosTheta, sinTheta;
    var radialFraction, phi, cosPhi, sinPhi;
    var radial = L5.Vector.ZERO;
    var torusMiddle = L5.Vector.ZERO;
    var normal = L5.Vector.ZERO;

    // Generate the cylinder itself.
    for (c = 0, i = 0; c < circleSamples; ++c) {
        // Compute center point on torus circle at specified angle.
        circleFraction = c * invCS;  // in [0,1)
        theta = TWO_PI * circleFraction;
        cosTheta = cos(theta);
        sinTheta = sin(theta);
        radial.set(cosTheta, sinTheta, 0);
        torusMiddle.set(cosTheta * outerRadius, sinTheta * outerRadius, 0);

        // Compute slice vertices with duplication at endpoint.
        save = i;
        for (r = 0; r < radialSamples; ++r) {
            radialFraction = r * invRS;  // in [0,1)
            phi = TWO_PI * radialFraction;
            cosPhi = cos(phi);
            sinPhi = sin(phi);

            normal.set(innerRadius * cosTheta * cosPhi, innerRadius * sinTheta * cosPhi, innerRadius * sinPhi);
            vba.setPosition(i, torusMiddle.add(normal));
            if (hasNormals) {
                if (inside) {
                    normal.set(-normal.x, -normal.y, -normal.z);
                }
                vba.setNormal(i, normal);
            }

            tcoord = [radialFraction, circleFraction];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }

            ++i;
        }

        vba.setPosition(i, vba.getPosition(save));
        if (hasNormals) {
            vba.setNormal(i, vba.getNormal(save));
        }

        tcoord = [1, circleFraction];
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, tcoord);
            }
        }

        ++i;
    }

    // Duplicate the cylinder ends to form a torus.
    for (r = 0; r <= radialSamples; ++r, ++i) {
        vba.setPosition(i, vba.getPosition(r));
        if (hasNormals) {
            vba.setNormal(i, vba.getNormal(r));
        }

        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, [vba.getTCoord(unit, r)[0], 1]);
            }
        }
    }

    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    var i0, i1, i2, i3, offset = 0;
    var cStart = 0;
    for (c = 0; c < circleSamples; ++c) {
        i0 = cStart;
        i1 = i0 + 1;
        cStart += radialSamples + 1;
        i2 = cStart;
        i3 = i2 + 1;
        for (i = 0; i < radialSamples; ++i, offset += 6) {
            if (inside) {
                indices[offset] = i0++;
                indices[offset + 1] = i1;
                indices[offset + 2] = i2;
                indices[offset + 3] = i1++;
                indices[offset + 4] = i3++;
                indices[offset + 5] = i2++;
            }
            else {  // inside view
                indices[offset] = i0++;
                indices[offset + 1] = i2;
                indices[offset + 2] = i1;
                indices[offset + 3] = i1++;
                indices[offset + 4] = i2++;
                indices[offset + 5] = i3++;
            }
        }
    }

    // The duplication of vertices at the seam cause the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.
    var mesh = new L5.TriMesh(format, vbuffer, ibuffer);
    mesh.modelBound.center.set(0, 0, 0);
    mesh.modelBound.radius = outerRadius;
    return mesh;
};

/**
 * 四面体
 */
L5.StandardMesh.prototype.tetrahedron = function () {
    const fSqrt2Div3 = L5.Math.sqrt(2) / 3;
    const fSqrt6Div3 = L5.Math.sqrt(6) / 3;
    const fOneThird = 1 / 3;

    const numVertices = 4;
    const numTriangles = 4;
    const numIndices = 12;
    const stride = this.format.stride;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, this.usage);
    var vba = new L5.VertexBufferAccessor(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [0, 0, 1]);
    vba.setPosition(1, [2 * fSqrt2Div3, 0, -fOneThird]);
    vba.setPosition(2, [-fSqrt2Div3, fSqrt6Div3, -fOneThird]);
    vba.setPosition(3, [-fSqrt2Div3, -fSqrt6Div3, -fOneThird]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, this.usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;
    indices[6] = 0;
    indices[7] = 3;
    indices[8] = 1;
    indices[9] = 1;
    indices[10] = 3;
    indices[11] = 2;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new L5.TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 六面体
 */
L5.StandardMesh.prototype.hexahedron = function () {
    const fSqrtThird = L5.Math.sqrt(1 / 3);

    const numVertices = 8;
    const numTriangles = 12;
    const numIndices = 36;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [-fSqrtThird, -fSqrtThird, -fSqrtThird]);
    vba.setPosition(1, [fSqrtThird, -fSqrtThird, -fSqrtThird]);
    vba.setPosition(2, [fSqrtThird, fSqrtThird, -fSqrtThird]);
    vba.setPosition(3, [-fSqrtThird, fSqrtThird, -fSqrtThird]);
    vba.setPosition(4, [-fSqrtThird, -fSqrtThird, fSqrtThird]);
    vba.setPosition(5, [fSqrtThird, -fSqrtThird, fSqrtThird]);
    vba.setPosition(6, [fSqrtThird, fSqrtThird, fSqrtThird]);
    vba.setPosition(7, [-fSqrtThird, fSqrtThird, fSqrtThird]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 3;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 1;
    indices[6] = 0;
    indices[7] = 1;
    indices[8] = 5;
    indices[9] = 0;
    indices[10] = 5;
    indices[11] = 4;
    indices[12] = 0;
    indices[13] = 4;
    indices[14] = 7;
    indices[15] = 0;
    indices[16] = 7;
    indices[17] = 3;
    indices[18] = 6;
    indices[19] = 5;
    indices[20] = 1;
    indices[21] = 6;
    indices[22] = 1;
    indices[23] = 2;
    indices[24] = 6;
    indices[25] = 2;
    indices[26] = 3;
    indices[27] = 6;
    indices[28] = 3;
    indices[29] = 7;
    indices[30] = 6;
    indices[31] = 7;
    indices[32] = 4;
    indices[33] = 6;
    indices[34] = 4;
    indices[35] = 5;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new L5.TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 八面体
 */
L5.StandardMesh.prototype.octahedron = function () {
    const numVertices = 6;
    const numTriangles = 8;
    const numIndices = 24;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [1, 0, 0]);
    vba.setPosition(1, [-1, 0, 0]);
    vba.setPosition(2, [0, 1, 0]);
    vba.setPosition(3, [0, -1, 0]);
    vba.setPosition(4, [0, 0, 1]);
    vba.setPosition(5, [0, 0, -1]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 4;
    indices[1] = 0;
    indices[2] = 2;
    indices[3] = 4;
    indices[4] = 2;
    indices[5] = 1;
    indices[6] = 4;
    indices[7] = 1;
    indices[8] = 3;
    indices[9] = 4;
    indices[10] = 3;
    indices[11] = 0;
    indices[12] = 5;
    indices[13] = 2;
    indices[14] = 0;
    indices[15] = 5;
    indices[16] = 1;
    indices[17] = 2;
    indices[18] = 5;
    indices[19] = 3;
    indices[20] = 1;
    indices[21] = 5;
    indices[22] = 0;
    indices[23] = 3;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new L5.TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 十二面体
 */
L5.StandardMesh.prototype.dodecahedron = function () {
    const a = 1 / L5.Math.sqrt(3);
    const b = L5.Math.sqrt((3 - L5.Math.sqrt(5)) / 6);
    const c = L5.Math.sqrt((3 + L5.Math.sqrt(5)) / 6);

    const numVertices = 20;
    const numTriangles = 36;
    const numIndices = 108;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [a, a, a]);
    vba.setPosition(1, [a, a, -a]);
    vba.setPosition(2, [a, -a, a]);
    vba.setPosition(3, [a, -a, -a]);
    vba.setPosition(4, [-a, a, a]);
    vba.setPosition(5, [-a, a, -a]);
    vba.setPosition(6, [-a, -a, a]);
    vba.setPosition(7, [-a, -a, -a]);
    vba.setPosition(8, [b, c, 0]);
    vba.setPosition(9, [-b, c, 0]);
    vba.setPosition(10, [b, -c, 0]);
    vba.setPosition(11, [-b, -c, 0]);
    vba.setPosition(12, [c, 0, b]);
    vba.setPosition(13, [c, 0, -b]);
    vba.setPosition(14, [-c, 0, b]);
    vba.setPosition(15, [-c, 0, -b]);
    vba.setPosition(16, [0, b, c]);
    vba.setPosition(17, [0, -b, c]);
    vba.setPosition(18, [0, b, -c]);
    vba.setPosition(19, [0, -b, -c]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 8;
    indices[2] = 9;
    indices[3] = 0;
    indices[4] = 9;
    indices[5] = 4;
    indices[6] = 0;
    indices[7] = 4;
    indices[8] = 16;
    indices[9] = 0;
    indices[10] = 12;
    indices[11] = 13;
    indices[12] = 0;
    indices[13] = 13;
    indices[14] = 1;
    indices[15] = 0;
    indices[16] = 1;
    indices[17] = 8;
    indices[18] = 0;
    indices[19] = 16;
    indices[20] = 17;
    indices[21] = 0;
    indices[22] = 17;
    indices[23] = 2;
    indices[24] = 0;
    indices[25] = 2;
    indices[26] = 12;
    indices[27] = 8;
    indices[28] = 1;
    indices[29] = 18;
    indices[30] = 8;
    indices[31] = 18;
    indices[32] = 5;
    indices[33] = 8;
    indices[34] = 5;
    indices[35] = 9;
    indices[36] = 12;
    indices[37] = 2;
    indices[38] = 10;
    indices[39] = 12;
    indices[40] = 10;
    indices[41] = 3;
    indices[42] = 12;
    indices[43] = 3;
    indices[44] = 13;
    indices[45] = 16;
    indices[46] = 4;
    indices[47] = 14;
    indices[48] = 16;
    indices[49] = 14;
    indices[50] = 6;
    indices[51] = 16;
    indices[52] = 6;
    indices[53] = 17;
    indices[54] = 9;
    indices[55] = 5;
    indices[56] = 15;
    indices[57] = 9;
    indices[58] = 15;
    indices[59] = 14;
    indices[60] = 9;
    indices[61] = 14;
    indices[62] = 4;
    indices[63] = 6;
    indices[64] = 11;
    indices[65] = 10;
    indices[66] = 6;
    indices[67] = 10;
    indices[68] = 2;
    indices[69] = 6;
    indices[70] = 2;
    indices[71] = 17;
    indices[72] = 3;
    indices[73] = 19;
    indices[74] = 18;
    indices[75] = 3;
    indices[76] = 18;
    indices[77] = 1;
    indices[78] = 3;
    indices[79] = 1;
    indices[80] = 13;
    indices[81] = 7;
    indices[82] = 15;
    indices[83] = 5;
    indices[84] = 7;
    indices[85] = 5;
    indices[86] = 18;
    indices[87] = 7;
    indices[88] = 18;
    indices[89] = 19;
    indices[90] = 7;
    indices[91] = 11;
    indices[92] = 6;
    indices[93] = 7;
    indices[94] = 6;
    indices[95] = 14;
    indices[96] = 7;
    indices[97] = 14;
    indices[98] = 15;
    indices[99] = 7;
    indices[100] = 19;
    indices[101] = 3;
    indices[102] = 7;
    indices[103] = 3;
    indices[104] = 10;
    indices[105] = 7;
    indices[106] = 10;
    indices[107] = 11;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new L5.TriMesh(format, vbuffer, ibuffer);
};
/**
 * 二十面体
 */
L5.StandardMesh.prototype.icosahedron = function () {
    const goldenRatio = 0.5 * (1 + L5.Math.sqrt(5));
    const invRoot = 1 / L5.Math.sqrt(1 + goldenRatio * goldenRatio);
    const u = goldenRatio * invRoot;
    const v = invRoot;

    const numVertices = 12;
    const numTriangles = 20;
    const numIndices = 60;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new L5.VertexBuffer(numVertices, stride, usage);
    var vba = new L5.VertexBufferAccessor(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [u, v, 0]);
    vba.setPosition(1, [-u, v, 0]);
    vba.setPosition(2, [u, -v, 0]);
    vba.setPosition(3, [-u, -v, 0]);
    vba.setPosition(4, [v, 0, u]);
    vba.setPosition(5, [v, 0, -u]);
    vba.setPosition(6, [-v, 0, u]);
    vba.setPosition(7, [-v, 0, -u]);
    vba.setPosition(8, [0, u, v]);
    vba.setPosition(9, [0, -u, v]);
    vba.setPosition(10, [0, u, -v]);
    vba.setPosition(11, [0, -u, -v]);

    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new L5.IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 8;
    indices[2] = 4;
    indices[3] = 0;
    indices[4] = 5;
    indices[5] = 10;
    indices[6] = 2;
    indices[7] = 4;
    indices[8] = 9;
    indices[9] = 2;
    indices[10] = 11;
    indices[11] = 5;
    indices[12] = 1;
    indices[13] = 6;
    indices[14] = 8;
    indices[15] = 1;
    indices[16] = 10;
    indices[17] = 7;
    indices[18] = 3;
    indices[19] = 9;
    indices[20] = 6;
    indices[21] = 3;
    indices[22] = 7;
    indices[23] = 11;
    indices[24] = 0;
    indices[25] = 10;
    indices[26] = 8;
    indices[27] = 1;
    indices[28] = 8;
    indices[29] = 10;
    indices[30] = 2;
    indices[31] = 9;
    indices[32] = 11;
    indices[33] = 3;
    indices[34] = 11;
    indices[35] = 9;
    indices[36] = 4;
    indices[37] = 2;
    indices[38] = 0;
    indices[39] = 5;
    indices[40] = 0;
    indices[41] = 2;
    indices[42] = 6;
    indices[43] = 1;
    indices[44] = 3;
    indices[45] = 7;
    indices[46] = 3;
    indices[47] = 1;
    indices[48] = 8;
    indices[49] = 6;
    indices[50] = 4;
    indices[51] = 9;
    indices[52] = 4;
    indices[53] = 6;
    indices[54] = 10;
    indices[55] = 5;
    indices[56] = 7;
    indices[57] = 11;
    indices[58] = 7;
    indices[59] = 5;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new L5.TriMesh(format, vbuffer, ibuffer);
};

/**
 * @param vba {L5.VertexBufferAccessor}
 */
L5.StandardMesh.prototype.transformData = function (vba) {
    if (this.transform.isIdentity()) {
        return;
    }

    const numVertices = vba.getNumVertices();
    var i, f3, t;
    for (i = 0; i < numVertices; ++i) {
        t = vba.getPosition(i);
        f3 = new L5.Point(t);
        f3 = this.transform.mulPoint(f3);
        t[0] = f3.x;
        t[1] = f3.y;
        t[2] = f3.z;
    }

    if (this.hasNormals) {
        for (i = 0; i < numVertices; ++i) {
            t = vba.getNormal(i);
            f3 = (new L5.Vector(t)).normalize();
            t[0] = f3.x;
            t[1] = f3.y;
            t[2] = f3.z;
        }
    }
};

/**
 * 更改三角形卷绕顺序
 * @param numTriangles {number} 三角形数量
 * @param indices {Uint32Array} 顶点索引数组
 */
L5.StandardMesh.prototype.reverseTriangleOrder = function (numTriangles, indices) {
    var i, j1, j2, save;
    for (i = 0; i < numTriangles; ++i) {
        j1 = 3 * i + 1;
        j2 = j1 + 1;
        save = indices[j1];
        indices[j1] = indices[j2];
        indices[j2] = save;
    }
};
/**
 *
 * @param vba {L5.VertexBufferAccessor}
 */
L5.StandardMesh.prototype.createPlatonicNormals = function (vba) {
    if (this.hasNormals) {
        const numVertices = vba.getNumVertices();
        var t;
        for (var i = 0; i < numVertices; ++i) {
            t = Array.from(vba.getPosition(i));
            vba.setNormal(i, t);
        }
    }
};
/**
 *
 * @param vba {L5.VertexBufferAccessor}
 */
L5.StandardMesh.prototype.createPlatonicUVs = function (vba) {
    const MAX_UNITS = L5.StandardMesh.MAX_UNITS;
    const numVertices = vba.getNumVertices();
    const INV_PI = L5.Math.INV_PI;
    var unit, i, pos, t;
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            for (i = 0; i < numVertices; ++i) {
                pos = vba.getPosition(i);
                t = 0.5;
                if (L5.Math.abs(pos[2]) < 1) {
                    t *= 1 + L5.Math.atan2(pos[1], pos[0]) * INV_PI;
                }
                vba.setTCoord(unit, i, [t, L5.Math.acos(pos[2]) * INV_PI]);
            }
        }
    }
};


/**
 * TriFan
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexSize {number}
 *
 * @class
 * @extends {L5.Triangles}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TriFan = function (
    format, vertexBuffer, indexSize
) {
    L5.Triangles.call (this, L5.Visual.PT_TRIFAN, format, vertexBuffer, null);
    L5.assert (indexSize === 2 || indexSize === 4, 'Invalid index size.');

    var numVertices  = this.vertexBuffer.numElements;
    this.indexBuffer = new L5.IndexBuffer (numVertices, indexSize);
    var i, indices;

    if (indexSize == 2) {
        indices = new Uint16Array (this.indexBuffer.getData ());
    }
    else // indexSize == 4
    {
        indices = new Uint32Array (this.indexBuffer.getData ());
    }
    for (i = 0; i < numVertices; ++i) {
        indices[ i ] = i;
    }
};

L5.nameFix (L5.TriFan, 'TriFan');
L5.extendFix (L5.TriFan, L5.Triangles);

/**
 * 获取网格中的三角形数量
 * @returns {number}
 */
L5.TriFan.prototype.getNumTriangles = function () {
    return this.indexBuffer.numElements - 2;
};
/**
 * 获取位置I处的三角形索引
 * @param i {number}
 * @param output {Array} 3 elements
 * @returns {boolean}
 */
L5.TriFan.prototype.getTriangle     = function (
    i, output
) {
    if (0 <= i && i < this.getNumTriangles ()) {
        var data    = new Uint32Array(this.indexBuffer.getData ());
        output[ 0 ] = data[ 0 ];
        output[ 1 ] = data[ i+1 ];
        output[ 2 ] = data[ i+2 ];
        return true;
    }
    return false;
};

/**
 * TriStrip
 *
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexSize {number}
 *
 * @class
 * @extends {L5.Triangles}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TriStrip = function (
    format, vertexBuffer, indexSize
) {
    L5.Triangles.call (this, L5.Visual.PT_TRISTRIP, format, vertexBuffer, null);
    L5.assert (indexSize === 2 || indexSize === 4, 'Invalid index size.');

    var numVertices  = this.vertexBuffer.numElements;
    this.indexBuffer = new L5.IndexBuffer (numVertices, indexSize);
    var i, indices;

    if (indexSize == 2) {
        indices = new Uint16Array (this.indexBuffer.getData ());
    }
    else // indexSize == 4
    {
        indices = new Uint32Array (this.indexBuffer.getData ());
    }
    for (i = 0; i < numVertices; ++i) {
        indices[ i ] = i;
    }
};

L5.nameFix (L5.TriStrip, 'TriStrip');
L5.extendFix (L5.TriStrip, L5.Triangles);

/**
 * 获取网格中的三角形数量
 * @returns {number}
 */
L5.TriStrip.prototype.getNumTriangles = function () {
    return this.indexBuffer.numElements - 2;
};
/**
 * 获取位置I处的三角形索引
 * @param i {number}
 * @param output {Array} 3 elements
 * @returns {boolean}
 */
L5.TriStrip.prototype.getTriangle     = function (
    i, output
) {
    if (0 <= i && i < this.getNumTriangles ()) {
        var data    = new Uint32Array(this.indexBuffer.getData ());
        output[ 0 ] = data[ i ];
        if (i & 1) {
            output[ 1 ] = data[ i + 2 ];
            output[ 2 ] = data[ i + 1 ];
        }
        else {
            output[ 1 ] = data[ i + 1 ];
            output[ 2 ] = data[ i + 2 ];
        }
        return output[0]!==output[1] &&
            output[0] !== output[2] &&
            output[1] !== output[2];
    }
    return false;
};

/**
 * VisibleSet
 * @version 1.0
 * @author lonphy
 */

L5.VisibleSet = function () {
    this.numVisible = 0;
    this.visibles = [];
};

L5.VisibleSet.name = "VisibleSet";


L5.VisibleSet.prototype.getNumVisible = function () {
    return this.numVisible;
};

L5.VisibleSet.prototype.getAllVisible = function () {
    return this.visibles;
};

L5.VisibleSet.prototype.getVisible = function (index) {
    L5.assert(0 <= index && index < this.numVisible, 'Invalid index to getVisible');
    return this.visibles[index];
};

L5.VisibleSet.prototype.insert = function (visible) {
    var size = this.visibles.length;
    if (this.numVisible < size) {
        this.visibles[this.numVisible] = visible;
    }
    else {
        this.visibles.push(visible);
    }
    ++this.numVisible;
};

L5.VisibleSet.prototype.clear = function () {
    this.numVisible = 0;
};

/**
 * 相机位置
 *
 * CameraModelPositionConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.CameraModelPositionConstant = function () {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
};
L5.nameFix(L5.CameraModelPositionConstant, 'CameraModelPositionConstant');
L5.extendFix(L5.CameraModelPositionConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.CameraModelPositionConstant.prototype.update = function (visual, camera) {

    var worldPosition = camera.position;
    var worldInvMatrix = visual.worldTransform.inverse();
    var modelPosition = worldInvMatrix.mulPoint(worldPosition);
    this.copy(modelPosition._content);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.CameraModelPositionConstant}
 */
L5.CameraModelPositionConstant.factory = function (inStream) {
    var obj = new L5.CameraModelPositionConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.CameraModelPositionConstant', L5.CameraModelPositionConstant.factory);

/**
 * 灯光 - 环境光分量
 *
 * LightAmbientConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightAmbientConstant = function (light) {
    L5.ShaderFloat.call (this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix (L5.LightAmbientConstant, 'LightAmbientConstant');
L5.extendFix (L5.LightAmbientConstant, L5.ShaderFloat);

L5.LightAmbientConstant.prototype.getLight = function() {
    return this.light;
};

/**
 * 更新环境光分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightAmbientConstant.prototype.update = function(visual, camera) {
    this.copy(this.light.ambient);
};

L5.LightAmbientConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightAmbientConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightAmbientConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightAmbientConstant}
 */
L5.LightAmbientConstant.factory = function (inStream) {
    var obj = new L5.LightAmbientConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightAmbientConstant', L5.LightAmbientConstant.factory);

/**
 * 灯光 - 衰减系数 LightAttenuationConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightAttenuationConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightAttenuationConstant, 'LightAttenuationConstant');
L5.extendFix(L5.LightAttenuationConstant, L5.ShaderFloat);

L5.LightAttenuationConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新衰减系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightAttenuationConstant.prototype.update = function (visual, camera) {
    this.data[0] = this.light.constant;
    this.data[1] = this.light.linear;
    this.data[2] = this.light.quadratic;
    this.data[3] = this.light.intensity;
};

L5.LightAttenuationConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightAttenuationConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightAttenuationConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightAttenuationConstant}
 */
L5.LightAttenuationConstant.factory = function (inStream) {
    var obj = new L5.LightAttenuationConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightAttenuationConstant', L5.LightAttenuationConstant.factory);

/**
 * 灯光 - 漫反射分量 LightDiffuseConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightDiffuseConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightDiffuseConstant, 'LightDiffuseConstant');
L5.extendFix(L5.LightDiffuseConstant, L5.ShaderFloat);

L5.LightDiffuseConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新漫反射分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightDiffuseConstant.prototype.update = function (visual, camera) {
    this.copy(this.light.diffuse);
};

L5.LightDiffuseConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightDiffuseConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightDiffuseConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightDiffuseConstant}
 */
L5.LightDiffuseConstant.factory = function (inStream) {
    var obj = new L5.LightDiffuseConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightDiffuseConstant', L5.LightDiffuseConstant.factory);

/**
 * 灯光 - 入射方向向量
 *
 * LightModelDirectionConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightModelDirectionConstant = function (light) {
    L5.ShaderFloat.call (this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix (L5.LightModelDirectionConstant, 'LightModelDirectionConstant');
L5.extendFix (L5.LightModelDirectionConstant, L5.ShaderFloat);

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightModelDirectionConstant.prototype.update = function(visual, camera) {
    var worldInvMatrix = visual.worldTransform.inverse();
    var modelDir = worldInvMatrix.mulPoint(this.light.direction);
    this.copy(modelDir._content);
};


L5.LightModelDirectionConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightModelDirectionConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightModelDirectionConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};
/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightModelDirectionConstant}
 */
L5.LightModelDirectionConstant.factory = function (inStream) {
    var obj = new L5.LightModelDirectionConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightModelDirectionConstant', L5.LightModelDirectionConstant.factory);


/**
 * 灯光 - 光源位置
 *
 * LightModelPositionConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightModelPositionConstant = function (light) {
    L5.ShaderFloat.call (this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix (L5.LightModelPositionConstant, 'LightModelPositionConstant');
L5.extendFix (L5.LightModelPositionConstant, L5.ShaderFloat);

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightModelPositionConstant.prototype.update = function(visual, camera) {
    var worldInvMatrix = visual.worldTransform.inverse();
    var modelPosition = worldInvMatrix.mulPoint(this.light.position);
    this.copy(modelPosition._content);
};

/**
 * 灯光 - 高光分量 LightSpecularConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightSpecularConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightSpecularConstant, 'LightSpecularConstant');
L5.extendFix(L5.LightSpecularConstant, L5.ShaderFloat);

L5.LightSpecularConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新高光分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightSpecularConstant.prototype.update = function (visual, camera) {
    this.copy(this.light.specular);
};

L5.LightSpecularConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightSpecularConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightSpecularConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightSpecularConstant}
 */
L5.LightSpecularConstant.factory = function (inStream) {
    var obj = new L5.LightSpecularConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightSpecularConstant', L5.LightSpecularConstant.factory);

/**
 * 灯光 - 聚光灯参数
 *
 * LightSpotConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightSpotConstant = function (light) {
    L5.ShaderFloat.call (this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix (L5.LightSpotConstant, 'LightSpotConstant');
L5.extendFix (L5.LightSpotConstant, L5.ShaderFloat);

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightSpotConstant.prototype.update = function(visual, camera) {
    this.data[0] = this.light.angle;
    this.data[1] = this.light.cosAngle;
    this.data[2] = this.light.sinAngle;
    this.data[3] = this.light.exponent;
};

/**
 * 灯光 - 世界坐标系方向
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightWorldDVectorConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightWorldDVectorConstant, 'LightWorldDVectorConstant');
L5.extendFix(L5.LightWorldDVectorConstant, L5.ShaderFloat);

L5.LightWorldDVectorConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新光源世界坐标系的方向
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightWorldDVectorConstant.prototype.update = function (visual, camera) {
};

/**
 * 灯光 - 世界坐标
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightWorldPositionConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightWorldPositionConstant, 'LightWorldPositionConstant');
L5.extendFix(L5.LightWorldPositionConstant, L5.ShaderFloat);

L5.LightWorldPositionConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新高光分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightWorldPositionConstant.prototype.update = function (visual, camera) {
};

/**
 * 材质环境光系数
 *
 * MaterialAmbientConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialAmbientConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialAmbientConstant, 'MaterialAmbientConstant');
L5.extendFix(L5.MaterialAmbientConstant, L5.ShaderFloat);


L5.MaterialAmbientConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialAmbientConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.ambient);
};

L5.MaterialAmbientConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialAmbientConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialAmbientConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialAmbientConstant}
 */
L5.MaterialAmbientConstant.factory = function (inStream) {
    var obj = new L5.MaterialAmbientConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialAmbientConstant', L5.MaterialAmbientConstant.factory);

/**
 * 材质漫反射系数
 *
 * MaterialDiffuseConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialDiffuseConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialDiffuseConstant, 'MaterialDiffuseConstant');
L5.extendFix(L5.MaterialDiffuseConstant, L5.ShaderFloat);


L5.MaterialDiffuseConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新材质漫反射系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialDiffuseConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.diffuse);
};

L5.MaterialDiffuseConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialDiffuseConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialDiffuseConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialDiffuseConstant}
 */
L5.MaterialDiffuseConstant.factory = function (inStream) {
    var obj = new L5.MaterialDiffuseConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialDiffuseConstant', L5.MaterialDiffuseConstant.factory);

/**
 * 材质自发光系数
 *
 * MaterialEmissiveConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialEmissiveConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialEmissiveConstant, 'MaterialEmissiveConstant');
L5.extendFix(L5.MaterialEmissiveConstant, L5.ShaderFloat);


L5.MaterialEmissiveConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新自发光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialEmissiveConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.emissive);
};

L5.MaterialEmissiveConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialEmissiveConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialEmissiveConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialEmissiveConstant}
 */
L5.MaterialEmissiveConstant.factory = function (inStream) {
    var obj = new L5.MaterialEmissiveConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialEmissiveConstant', L5.MaterialEmissiveConstant.factory);

/**
 * 材质高光系数
 *
 * MaterialDiffuseConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialSpecularConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialSpecularConstant, 'MaterialSpecularConstant');
L5.extendFix(L5.MaterialSpecularConstant, L5.ShaderFloat);


L5.MaterialSpecularConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新材高光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialSpecularConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.specular);
};

L5.MaterialSpecularConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialSpecularConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialSpecularConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialSpecularConstant}
 */
L5.MaterialSpecularConstant.factory = function (inStream) {
    var obj = new L5.MaterialSpecularConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialSpecularConstant', L5.MaterialSpecularConstant.factory);

/**
 * ??? PMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.PMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.PMatrixConstant, 'PMatrixConstant');
L5.extendFix(L5.PMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.PMatrixConstant.prototype.update = function (visual, camera) {
};

/**
 * ??? PVMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.PVMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.PVMatrixConstant, 'PVMatrixConstant');
L5.extendFix(L5.PVMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.PVMatrixConstant.prototype.update = function (visual, camera) {
};

/**
 * 投影-相机-物体 最终矩阵 PVWMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.PVWMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.PVWMatrixConstant, 'PVWMatrixConstant');
L5.extendFix(L5.PVWMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.PVWMatrixConstant.prototype.update = function (visual, camera) {
    var projViewMatrix = camera.projectionViewMatrix;
    var worldMatrix = visual.worldTransform.toMatrix();
    var projViewWorldMatrix = projViewMatrix.mul(worldMatrix);
    this.copy(projViewWorldMatrix.content);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.PVWMatrixConstant}
 */
L5.PVWMatrixConstant.factory = function (inStream) {
    var obj = new L5.PVWMatrixConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.PVWMatrixConstant', L5.PVWMatrixConstant.factory);

/**
 * 透视矩阵 - ProjectorMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.ProjectorMatrixConstant = function () {
    L5.ShaderFloat.call (this, 4);
    this.allowUpdater = true;
};
L5.nameFix (L5.ProjectorMatrixConstant, 'ProjectorMatrixConstant');
L5.extendFix (L5.ProjectorMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ProjectorMatrixConstant.prototype.update = function(visual, camera) {};

/**
 * ??? ProjectorWorldPositionConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.ProjectorWorldPositionConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.ProjectorWorldPositionConstant, 'ProjectorWorldPositionConstant');
L5.extendFix(L5.ProjectorWorldPositionConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ProjectorWorldPositionConstant.prototype.update = function (visual, camera) {
};

/**
 * 视图矩阵 - VMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.VMatrixConstant = function () {
    L5.ShaderFloat.call (this, 4);
    this.allowUpdater = true;
};
L5.nameFix (L5.VMatrixConstant, 'VMatrixConstant');
L5.extendFix (L5.VMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.VMatrixConstant.prototype.update = function(visual, camera) {
};

/**
 * ??? VWMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.VWMatrixConstant = function () {
    L5.ShaderFloat.call (this, 4);
    this.allowUpdater = true;
};
L5.nameFix (L5.VWMatrixConstant, 'VWMatrixConstant');
L5.extendFix (L5.VWMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.VWMatrixConstant.prototype.update = function(visual, camera) {
};

/**
 * 世界坐标系矩 - WMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.WMatrixConstant = function () {
    L5.ShaderFloat.call (this, 4);
    this.allowUpdater = true;
};
L5.nameFix (L5.WMatrixConstant, 'WMatrixConstant');
L5.extendFix (L5.WMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.WMatrixConstant.prototype.update = function(visual, camera) {
    var worldMatrix = visual.worldTransform.toMatrix();
    this.copy(worldMatrix.content);
};

L5.BspNode = function(){};
L5.nameFix(L5.BspNode, 'BspNode');

L5.CRMCuller = function(){};
L5.nameFix(L5.CRMCuller, 'CRMCuller');

L5.ConvexRegion = function(){};
L5.nameFix(L5.ConvexRegion, 'ConvexRegion');

L5.ConvexRegionManager = function(){};
L5.nameFix(L5.ConvexRegionManager, 'ConvexRegionManager');

L5.Portal = function(){};
L5.nameFix(L5.Portal, 'Portal');

L5.Terrain = function(){};

L5.nameFix(L5.Terrain, 'Terrain');

L5.TerrainPage = function(){};
L5.nameFix(L5.TerrainPage, 'TerrainPage');

L5.Binary2D = function () {

};
L5.nameFix(L5.Binary2D, 'Binary2D');

L5.Binary3D = function () {

};
L5.nameFix(L5.Binary3D, 'Binary3D');

L5.ExtractCurveSquares = function () {

};
L5.nameFix(L5.ExtractCurveSquares, 'ExtractCurveSquares');

L5.ExtractCurveTris = function () {

};
L5.nameFix(L5.ExtractCurveTris, 'ExtractCurveTris');

L5.ExtractSurfaceCubes = function () {

};
L5.nameFix(L5.ExtractSurfaceCubes, 'ExtractSurfaceCubes');

L5.ExtractSurfaceTetra = function () {

};
L5.nameFix(L5.ExtractSurfaceTetra, 'ExtractSurfaceTetra');

/**
 * 按键定义
 * @author lonphy
 * @version 1.0
 */
L5.Input = function(){};

L5.Input.KBM_SHIFT = 0x01;
L5.Input.KBM_CTRL = 0x02;
L5.Input.KBM_ALT = 0x03;
L5.Input.KBM_META = 0x04;

L5.Input.KB_BACK = 8;
L5.Input.KB_TAB = 9;
L5.Input.KB_ENTER = 13;
L5.Input.KB_SHIFT = 16;
L5.Input.KB_CTRL = 17;
L5.Input.KB_ALT = 18;
L5.Input.KB_CAPSLK = 20;
L5.Input.KB_META = 91;

L5.Input.KB_DELETE = 46;

L5.Input.KB_ESC = 27;
L5.Input.KB_ESCAPE = 32;
L5.Input.KB_LEFT = 37;
L5.Input.KB_UP = 38;
L5.Input.KB_RIGHT = 39;
L5.Input.KB_DOWN = 40;

L5.Input.KB_0 = 48;
L5.Input.KB_1 = 49;
L5.Input.KB_2 = 50;
L5.Input.KB_3 = 51;
L5.Input.KB_4 = 52;
L5.Input.KB_5 = 53;
L5.Input.KB_6 = 54;
L5.Input.KB_7 = 55;
L5.Input.KB_8 = 56;
L5.Input.KB_9 = 57;

L5.Input.KB_A = 65;
L5.Input.KB_B = 66;
L5.Input.KB_C = 67;
L5.Input.KB_D = 68;
L5.Input.KB_E = 69;
L5.Input.KB_F = 70;
L5.Input.KB_G = 71;
L5.Input.KB_H = 72;
L5.Input.KB_I = 73;
L5.Input.KB_J = 74;
L5.Input.KB_K = 75;
L5.Input.KB_L = 76;
L5.Input.KB_M = 77;
L5.Input.KB_N = 78;
L5.Input.KB_O = 79;
L5.Input.KB_P = 80;
L5.Input.KB_Q = 81;
L5.Input.KB_R = 82;
L5.Input.KB_S = 83;
L5.Input.KB_T = 84;
L5.Input.KB_U = 85;
L5.Input.KB_V = 86;
L5.Input.KB_W = 87;
L5.Input.KB_X = 88;
L5.Input.KB_Y = 89;
L5.Input.KB_Z = 90;

L5.Input.KB_F1 = 112;
L5.Input.KB_F2 = 113;
L5.Input.KB_F3 = 114;
L5.Input.KB_F4 = 115;
L5.Input.KB_F5 = 116;
L5.Input.KB_F6 = 117;
L5.Input.KB_F7 = 118;
L5.Input.KB_F8 = 119;
L5.Input.KB_F9 = 120;
L5.Input.KB_F10 = 121;
L5.Input.KB_F11 = 122;
L5.Input.KB_F12 = 123;

L5.Input.MS_LEFT = 1;
L5.Input.MS_MIDDLE = 2;
L5.Input.MS_RIGHT = 3;







/**
 * xhr加载器 - L5
 *
 * @author lonphy
 * @version 0.1
 */
(function () {
    const APP_PATH = location.pathname.replace (/[^\/]+$/, ''); // 获取应用程序路径
    var cache = new Map ();	// 资源缓存
    var calling = new Map ();	// 请求队列

    /**
     * Ajax加载器
     * @param url {String} 请求资源路径
     * @param type {String} 请求类型
     *    arraybuffer blob document json text
     * @constructor
     * @todo 同地址， 不同请求类型处理
     */
    L5.XhrTask = function (url, type) {
        var fullPath = url[ 0 ] === '/' ? url : (APP_PATH + url);

        // 1. 查看请求队列,有则直接返回承诺对象
        if (calling.has (fullPath)) {
            return calling.get (fullPath);
        }
        // 2. 查看缓存池，有则兼容返回
        if (cache.has (fullPath)) {
            return Promise.resolve (cache.get (fullPath));
        }
        // 3. 否则新建请求
        var task = new Promise (function (resolve, reject) {
            var xhr          = new XMLHttpRequest ();
            xhr.open ('GET', fullPath);
            xhr.responseType = type || 'text';
            xhr.onloadend    = function (e) {
                if (e.target.status === 200) {
                    // 1. 放入缓存
                    cache.set (fullPath, e.target.response);
                    // 2. 从请求队列删除
                    calling.delete (fullPath);
                    resolve (e.target.response);
                } else {
                    reject (new Error ('XhrTaskError' + e.target.status));
                }
            };
            xhr.onerror      = reject;
            xhr.ontimeout    = reject;
            xhr.send ();
        });
        // 4. 加入请求队列
        calling.set (fullPath, task);
        return task;
    };
}) ();

L5.LCPPolyDist = function(){};
L5.nameFix(L5.LCPPolyDist, 'LCPPolyDist');

L5.LCPSolver = function(){};
L5.nameFix(L5.LCPSolver, 'LCPSolver');

L5.BoundTree = function(){};
L5.nameFix(L5.BoundTree, 'BoundTree');

L5.CollisionGroup = function(){};
L5.nameFix(L5.CollisionGroup, 'CollisionGroup');

L5.CollisionRecord = function(){};
L5.nameFix(L5.CollisionRecord, 'CollisionRecord');

L5.Fluid2Da = function(){};
L5.nameFix(L5.Fluid2Da, 'Fluid2Da');

L5.Fluid2Db = function(){};
L5.nameFix(L5.Fluid2Db, 'Fluid2Db');

L5.Fluid3Da = function(){};
L5.nameFix(L5.Fluid3Da, 'Fluid3Da');

L5.Fluid3Db = function(){};
L5.nameFix(L5.Fluid3Db, 'Fluid3Db');

L5.BoxManager = function(){};
L5.nameFix(L5.BoxManager, 'BoxManager');

L5.ExtremalQuery3 = function(){};
L5.nameFix(L5.ExtremalQuery3, 'ExtremalQuery3');

L5.ExtremalQuery3BSP = function(){};
L5.nameFix(L5.ExtremalQuery3BSP, 'ExtremalQuery3BSP');

L5.ExtremalQuery3PRJ = function(){};
L5.nameFix(L5.ExtremalQuery3PRJ, 'ExtremalQuery3PRJ');

L5.IntervalManager = function(){};
L5.nameFix(L5.IntervalManager, 'IntervalManager');

L5.RectangleManager = function(){};
L5.nameFix(L5.RectangleManager, 'RectangleManager');

L5.MassSpringArbitrary = function(){};
L5.nameFix(L5.MassSpringArbitrary, 'MassSpringArbitrary');

L5.MassSpringCurve = function(){};
L5.nameFix(L5.MassSpringCurve, 'MassSpringCurve');

L5.MassSpringSurface = function(){};
L5.nameFix(L5.MassSpringSurface, 'MassSpringSurface');

L5.MassSpringVolume = function(){};
L5.nameFix(L5.MassSpringVolume, 'MassSpringVolume');

L5.ParticleSystem = function(){};
L5.nameFix(L5.ParticleSystem, 'ParticleSystem');

L5.RigidBody = function(){};
L5.nameFix(L5.RigidBody, 'RigidBody');