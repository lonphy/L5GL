/**
 * Math - 通用工具类
 * @version 2.0
 * @author lonphy
 */

const _Math = {
    // 一些通用常量.
    EPSILON: 1e-07,
    ZERO_TOLERANCE: 1e-07,
    MAX_REAL: window.Infinity,
    PI: 3.14159265358979323846,
    TWO_PI: 2 * 3.14159265358979323846,
    HALF_PI: 0.5 * 3.14159265358979323846,
    INV_PI: 1 / 3.14159265358979323846,
    INV_TWO_PI: 1 / (3.14159265358979323846 * 2),
    DEG_TO_RAD: 3.14159265358979323846 / 180,
    RAD_TO_DEG: 180 / 3.14159265358979323846,
    LN_2: Math.log(2),
    LN_10: Math.log(10),
    INV_LN_2: 1 / Math.log(2),
    INV_LN_10: 1 / Math.log(10),
    SQRT_2: Math.sqrt(2),
    INV_SQRT_2: 1 / Math.sqrt(2),
    SQRT_3: Math.sqrt(3),
    INV_SQRT_3: 1 / Math.sqrt(3),

    // native function
    random: Math.random,
    floor: Math.floor,
    ceil: Math.ceil,
    abs: Math.abs,
    atan: Math.atan,
    atan2: Math.atan2,
    exp: Math.exp,
    cos: Math.cos,
    sin: Math.sin,
    tan: Math.tan,

    /**
     * 开平方
     * @param {number} value 
     * @returns {number}
     */
    sqrt(value) {
        if (value >= 0) {
            return Math.sqrt(value);
        }
        console.warn('Negative input to Sqrt');
        return 0;
    },
    /**
     * 是否是2的整次幂
     * @param {number} value 需要判断的整数
     * @returns {boolean}
     */
    isPowerOfTwo(value) {
        return (value > 0) && ((value & (value - 1)) === 0);
    },
    /**
     * 判断2个浮点数是否相等
     * @param a {number}
     * @param b {number}
     * @returns {boolean}
     */
    floatEqual(a, b) {
        if (Math.abs(a - b) < 0.000001) {
            return true;
        }
        return false;
    },

    /**
     * 获取以2为底的对数
     * @param powerOfTwo {number}
     * @returns {number}
     */
    log2OfPowerOfTwo(powerOfTwo) {
        let log2 = (powerOfTwo & 0xaaaaaaaa) !== 0;
        log2 |= ((powerOfTwo & 0xffff0000) !== 0) << 4;
        log2 |= ((powerOfTwo & 0xff00ff00) !== 0) << 3;
        log2 |= ((powerOfTwo & 0xf0f0f0f0) !== 0) << 2;
        log2 |= ((powerOfTwo & 0xcccccccc) !== 0) << 1;
        return log2;
    },

    /**
     * 转换IEEE 32位浮点数value[0,1]到32位整数[0,2^power-1]
     */
    scaledFloatToInt: (function () {
        let da = new Float32Array([0]);
        let dv = new DataView(da.buffer);

        /**
         * @param {number} value 需要转换的浮点数 [0,1]
         * @param power {number}
         * @returns {number}
         */
        return function (value, power) {
            da[0] = value;
            let result = 0;
            let shift = 150 - power - (dv.getUint8(3) << 1) + (dv.getUint8(2) >> 7);
            if (shift < 24) {
                result = ((dv.getUint32(0) & 0x007fffff) | 0x00800000) >> shift;
                if (result === (1 << power)) {
                    --result;
                }
            }
            return result;
        };
    })(),

    /**
     * @param {number} value
     * @returns {number}
     */
    acos(value) {
        if (-1 < value) {
            return value < 1 ? Math.acos(value) : 0;
        }
        return this.PI;
    },


    /**
     * @param {number} value
     * @returns {number}
     */

    asin(value) {
        if (-1 < value) {
            return value < 1 ? Math.asin(value) : this.HALF_PI;
        }
        return -HALF_PI;
    },

    /**
     * @param {number} value
     * @returns {number}
     */
    invSqrt(value) {
        if (value !== 0) {
            return 1 / Math.sqrt(value);
        }
        console.warn('Division by zero in invSqr');
        return 0;
    },
    /**
     * @param {number} value
     * @returns {number}
     */
    log(value) {
        if (value > 0) {
            return Math.log(value);
        }
        console.warn('Nonpositive input to log');
        return 0;
    },

    /**
     * @param {number} value
     * @returns {number}
     */
    log2(value) {
        if (value > 0) {
            return this.INV_LN_2 * Math.log(value);
        }
        console.warn('Nonpositive input to log2');
        return 0;
    },

    /**
     * @param {number} value
     * @returns {number}
     */
    log10(value) {
        if (value > 0) {
            return this.INV_LN_10 * Math.log(value);
        }
        console.warn('Nonpositive input to log10');
        return 0;
    },

    /**
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     */
    pow(base, exponent) {
        if (base >= 0) {
            return Math.pow(base, exponent);
        }
        console.warn('Negative base not allowed in Pow');
        return this.MAX_REAL;
    },

    /**
     * 求平方
     * @param {number} value
     * @returns {number}
     */
    sqr(value) {
        return value * value;
    },

    /**
     * 获取值的符号
     * -1 负 1 正 0 零值
     * @param {number} value
     * @returns {number}
     */
    sign(value) {
        if (value > 0) {
            return 1;
        }
        if (value < 0) {
            return -1;
        }
        return 0;
    },

    /**
     * 生成[-1,1]随机数
     * @returns {number}
     */
    symmetricRandom() {
        return 2 * Math.random() - 1;
    },

    /**
     * 生成[0,1]随机数
     * @returns {number}
     */
    unitRandom() {
        return Math.random();
    },

    /**
     * 生成[min,max]随机数
     * @param {number} min 随机数的最小值
     * @param {number} max 随机数的最大值
     * @returns {number}
     */
    intervalRandom(min, max) {
        return min + (max - min) * Math.random();
    },

    intervalIntRandom(min, max) {
        return Math.floor(min + (max - min) * Math.random());
    },

    /**
     * Clamp the input to the specified interval [min,max].
     * @param {number} value 夹取的值
     * @param {number} min 区间开始
     * @param {number} max 区间结束
     * @returns {number}
     */
    clamp(value, min, max) {
        if (value <= min) {
            return min;
        }
        if (value >= max) {
            return max;
        }
        return value;
    },

    /**
     * Clamp the input to [0,1].
     * @param {number} value
     * @returns {number}
     */
    saturate(value) {
        if (value <= 0) {
            return 0;
        }
        if (value >= 1) {
            return 1;
        }
        return value;
    },

    // ================= 快速版本的三角/反三角函数,使用多项式逼近，提升计算性能 ====================
    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastSin0(angle) {
        const angleSqr = angle * angle;
        let result = 7.61e-03;
        result *= angleSqr;
        result -= 1.6605e-01;
        result *= angleSqr;
        result += 1;
        return result * angle;
    },

    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastSin1(angle) {
        const angleSqr = angle * angle;
        let result = -2.39e-08;
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
    },

    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastCos0(angle) {
        const angleSqr = angle * angle;
        let result = 3.705e-02;
        result *= angleSqr;
        result -= 4.967e-01;
        return result * angleSqr + 1;
    },

    /**
     * @param {number} angle 必须在[0,pi/2]
     * @returns {number}
     */
    fastCos1(angle) {
        const angleSqr = angle * angle;
        let result = -2.605e-07;
        result *= angleSqr;
        result += 2.47609e-05;
        result *= angleSqr;
        result -= 1.3888397e-03;
        result *= angleSqr;
        result += 4.16666418e-02;
        result *= angleSqr;
        result -= 4.999999963e-01;
        return result * angleSqr + 1;
    },

    /**
     * @param {number} angle 必须在[0,pi/4]
     * @returns {number}
     */
    fastTan0(angle) {
        const angleSqr = angle * angle;
        let result = 2.033e-01;
        result *= angleSqr;
        result += 3.1755e-01;
        result *= angleSqr;
        result += 1;
        return result * angle;
    },

    /**
     * @param {number} angle 必须在[0,pi/4]
     * @returns {number}
     */
    fastTan1(angle) {
        const angleSqr = angle * angle;
        let result = 9.5168091e-03;
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
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvSin0(value) {
        let root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0187293;
        result *= value;
        result += 0.0742610;
        result *= value;
        result -= 0.2121144;
        result *= value;
        result += 1.5707288;
        result = this.HALF_PI - root * result;
        return result;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvSin1(value) {
        let root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0012624911;
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
        result = this.HALF_PI - root * result;
        return result;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvCos0(value) {
        const root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0187293;
        result *= value;
        result += 0.0742610;
        result *= value;
        result -= 0.2121144;
        result *= value;
        result += 1.5707288;
        return result * root;
    },

    /**
     * @param {number} value 必须在[0,1]
     * @returns {number}
     */
    fastInvCos1(value) {
        let root = Math.sqrt(Math.abs(1 - value));
        let result = -0.0012624911;
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
    },

    /**
     * @param {number} value 必须在[-1,1]
     * @returns {number}
     */
    fastInvTan0(value) {
        const valueSqr = value * value;
        let result = 0.0208351;
        result *= valueSqr;
        result -= 0.085133;
        result *= valueSqr;
        result += 0.180141;
        result *= valueSqr;
        result -= 0.3302995;
        result *= valueSqr;
        result += 0.999866;
        return result * value;
    },

    /**
     * @param {number} value 必须在[-1,1]
     * @returns {number}
     */
    fastInvTan1(value) {
        const valueSqr = value * value;
        let result = 0.0028662257;
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
    },

    // ============= exp(-x)快速逼近版本 =============================
    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp0(value) {
        let result = 0.0038278;
        result *= value;
        result += 0.0292732;
        result *= value;
        result += 0.2507213;
        result *= value;
        result += 1;
        result *= result;
        result *= result;
        return 1 / result;
    },

    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp1(value) {
        let result = 0.00026695;
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
    },

    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp2(value) {
        let result = 0.000014876;
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
    },

    /**
     * @param {number} value 值必须在[0, Infinity)
     * @returns {number}
     */
    fastNegExp3(value) {
        let result = 0.0000006906;
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
    }
}

export { _Math }
