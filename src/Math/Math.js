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
L5.Math.floatEqual = function (a, b) {
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