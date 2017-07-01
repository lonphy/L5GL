(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.L5 = global.L5 || {})));
}(this, (function (exports) { 'use strict';

	const HEX_TABLE = '0123456789abcdef';

	/**
	 * 生成UUID
	 * @return {String}
	 */
	function uuid() {
	    let s = new Array(35);
	    for (let i = 0; i < 36; i++) {
	        s[i] = i > 7 && ( (i - 8) % 5 === 0 ) ? '-' : HEX_TABLE[(Math.random() * 0x10) | 0];
	    }
	    s[14] = '4';
	    s[19] = HEX_TABLE[(s[19] & 0x3) | 0x8];
	    return s.join('');
	}

	let buf = new Uint32Array(1);
	let dv = new DataView(buf.buffer);
	dv.setUint32(0, 0x12345678, true); // little endian

	const BigEndian = (buf[0] === 0x12345678);

	const VERSION = 'L5_VERSION_2_0';

	function def(obj, key, value) {
	    Object.defineProperty(obj, key, { value: value });
	}

	function runApplication(Klass) {
	    if (!document.querySelector('.l5-nodes-info')) {
	        let nodesInfo = document.createElement('div');
	        nodesInfo.className = 'l5-nodes-info';
	        document.body.appendChild(nodesInfo);
	    }
	    let l5Instance = new Klass();
	    l5Instance.run();
	    window.x = l5Instance;
	}

	/**
	 * 类枚举定义
	 * @param {Object} tar    枚举承载体
	 * @param {Object<String, *>} val 枚举变量键值
	 * @param {boolean} lock 是否锁定类
	 */
	function DECLARE_ENUM(tar, val, lock = true) {
	    for (let k in val) {
	        if (val.hasOwnProperty(k)) {
	            Object.defineProperty(tar, k, { value: val[k] });
	        }
	    }
	    if (lock) Object.seal(tar);
	}

	const _Math = {
	    // 一些通用常量.
	    EPSILON: Number.EPSILON,
	    ZERO_TOLERANCE: Number.EPSILON,
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
	    sign: Math.sign,

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
	};

	class Vector$1 extends Float32Array {

	    constructor(x = 0, y = 0, z = 0) {
	        super(4);
	        if (x instanceof Float32Array) {
	            this.set(x.slice(0, 3));
	        } else {
	            this[0] = x;
	            this[1] = y;
	            this[2] = z;
	        }
	        this[3] = 0;
	    }

	    get x() {
	        return this[0];
	    }

	    get y() {
	        return this[1];
	    }

	    get z() {
	        return this[2];
	    }

	    get w() {
	        return this[3];
	    }

	    set x(n) {
	        this[0] = n;
	    }

	    set y(n) {
	        this[1] = n;
	    }

	    set z(n) {
	        this[2] = n;
	    }

	    set w(n) {
	        this[3] = n;
	    }

	    /**
	     * 复制
	     * @param {Vector} vec
	     * @returns {Vector}
	     */
	    copy(vec) {
	        this.set(vec);
	        return this;
	    }

	    /**
	     * 赋值
	     * @param {number} x
	     * @param {number} y
	     * @param {number} z
	     */
	    assign(x, y, z) {
	        this[0] = x;
	        this[1] = y;
	        this[2] = z;
	    }

	    /**
	     * 求向量长度
	     */
	    get length() {
	        return Math.hypot(this[0], this[1], this[2]);
	    }

	    /**
	     * 长度平方
	     * none side-effect
	     * @returns {number}
	     */
	    squaredLength() {
	        let x = this[0];
	        let y = this[1];
	        let z = this[2];
	        return x * x + y * y + z * z;
	    }

	    /**
	     * 是否相等
	     * @param {Vector} v
	     */
	    equals(v) {
	        return this[0] === v[0] && this[1] === v[1] && this[2] === v[2];
	    }

	    /**
	     * 规格化向量
	     */
	    normalize() {
	        let length = this.length;
	        if (length === 1) {
	            return length;
	        } else if (length > 0) {
	            let invLength = 1 / length;
	            this[0] *= invLength;
	            this[1] *= invLength;
	            this[2] *= invLength;
	        } else {
	            length = 0;
	            this[0] = 0;
	            this[1] = 0;
	            this[2] = 0;
	        }
	        return length;
	    }

	    /**
	     * calc cross to vec
	     * 
	     * none side-effect
	     * @param {Vector} vec
	     */
	    cross(vec) {
	        return new Vector$1(
	            this[1] * vec[2] - this[2] * vec[1],
	            this[2] * vec[0] - this[0] * vec[2],
	            this[0] * vec[1] - this[1] * vec[0]
	        );
	    }

	    /**
	     * calc unitCross to vec
	     * 
	     * none side-effect
	     * @param {Vector} vec
	     */
	    unitCross(vec) {
	        let x = this[0], y = this[1], z = this[2],
	            bx = vec[0], by = vec[1], bz = vec[2];
	        let cross = new Vector$1(
	            y * bz - z * by,
	            z * bx - x * bz,
	            x * by - y * bx
	        );
	        cross.normalize();
	        return cross;
	    }

	    /**
	     * add two Vector
	     * 
	     * none side-effect
	     * @param {Vector} v
	     */
	    add(v) {
	        return new Vector$1(
	            this[0] + v[0],
	            this[1] + v[1],
	            this[2] + v[2]
	        );
	    }

	    /**
	     * sub two Vector
	     * 
	     * none side-effect
	     * @param {Vector} v
	     */
	    sub(v) {
	        return new Vector$1(
	            this[0] - v[0],
	            this[1] - v[1],
	            this[2] - v[2]
	        );
	    }

	    /**
	     * scalar Vector
	     * 
	     * none side-effect
	     * @param {number} scalar
	     */
	    scalar(scalar) {
	        return new Vector$1(
	            this[0] * scalar,
	            this[1] * scalar,
	            this[2] * scalar
	        );
	    }

	    /**
	     * div Vector
	     * 
	     * none side-effect
	     * @param {number} scalar
	     */
	    div(scalar) {
	        if (scalar !== 0) {
	            scalar = 1 / scalar;

	            return new Vector$1(
	                this[0] * scalar,
	                this[1] * scalar,
	                this[2] * scalar
	            );
	        }
	        return Vector$1.ZERO;
	    }

	    /**
	     * negative Vector  
	     * none side-effect
	     */
	    negative() {
	        return new Vector$1(-this[0], -this[1], -this[2]);
	    }

	    /**
	     * dot two Vector  
	     * none side-effect
	     * @param v {Vector}
	     */
	    dot(v) {
	        return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
	    }

	    static get ZERO() {
	        return new Vector$1();
	    }

	    static get UNIT_X() {
	        return new Vector$1(1);
	    }

	    static get UNIT_Y() {
	        return new Vector$1(0, 1);
	    }

	    static get UNIT_Z() {
	        return new Vector$1(0, 0, 1);
	    }

	    /**
	     * 正交化给定的3个向量
	     *
	     * u0 = normalize(v0)  
	     * u1 = normalize(v1 - dot(u0,v1)u0)  
	     * u2 = normalize(v2 - dot(u0,v2)u0 - dot(u1,v2)u1)  
	     *
	     * @param {Vector} vec0
	     * @param {Vector} vec1
	     * @param {Vector} vec2
	     */
	    static orthoNormalize(vec0, vec1, vec2) {
	        vec0.normalize();

	        let dot0 = vec0.dot(vec1);
	        let t = vec0.scalar(dot0);
	        vec1.copy(vec1.sub(t));
	        vec1.normalize();

	        let dot1 = vec1.dot(vec2);
	        dot0 = vec0.dot(vec2);
	        t = vec0.scalar(dot0);
	        let t1 = vec1.scalar(dot1);
	        vec2.copy(vec2.sub(t.add(t1)));
	        vec2.normalize();
	    }


	    /**
	     * Input vec2 must be a nonzero vector. The output is an orthonormal
	     * basis {vec0,vec1,vec2}.  The input vec2 is normalized by this function.
	     * If you know that vec2 is already unit length, use the function
	     * generateComplementBasis to compute vec0 and vec1.
	     * Input vec0 must be a unit-length vector.  The output vectors
	     * {vec0,vec1} are unit length and mutually perpendicular, and
	     * {vec0,vec1,vec2} is an orthonormal basis.
	     *
	     * @param {Vector} vec0
	     * @param {Vector} vec1
	     * @param {Vector} vec2
	     */
	    static generateComplementBasis(vec0, vec1, vec2) {
	        vec2.normalize();
	        let invLength;

	        if (Math.abs(vec2.x) >= Math.abs(vec2.y)) {
	            // vec2.x or vec2.z is the largest magnitude component, swap them
	            invLength = 1 / Math.hypot(vec2.x, vec2.z);
	            vec0.x = -vec2.z * invLength;
	            vec0.y = 0;
	            vec0.z = +vec2.x * invLength;
	            vec1.x = vec2.y * vec0.z;
	            vec1.y = vec2.z * vec0.x - vec2.x * vec0.z;
	            vec1.z = -vec2.y * vec0.x;
	        }
	        else {
	            // vec2.y or vec2.z is the largest magnitude component, swap them
	            invLength = 1 / Math.hypot(vec2.y, vec2.z);
	            vec0.x = 0;
	            vec0.y = +vec2.z * invLength;
	            vec0.z = -vec2.y * invLength;
	            vec1.x = vec2.y * vec0.z - vec2.z * vec0.y;
	            vec1.y = -vec2.x * vec0.z;
	            vec1.z = vec2.x * vec0.y;
	        }
	    }
	}

	class Point$1 extends Float32Array {

	    constructor(x = 0, y = 0, z = 0) {
	        super(4);
	        if (x instanceof Float32Array) {
	            this.set(x.slice(0, 3));
	        } else {
	            this[0] = x;
	            this[1] = y;
	            this[2] = z;
	        }
	        this[3] = 1;
	    }

	    //////////////////// 辅助读写器 ////////////////////////////////////////////
	    get x() {
	        return this[0];
	    }

	    get y() {
	        return this[1];
	    }

	    get z() {
	        return this[2];
	    }

	    get w() {
	        return this[3];
	    }

	    set x(n) {
	        this[0] = n;
	    }

	    set y(n) {
	        this[1] = n;
	    }

	    set z(n) {
	        this[2] = n;
	    }

	    set w(n) {
	        this[3] = n;
	    }

	    /**
	     * 判断是否为同一点
	     * @param {Point} p
	     * @returns {boolean}
	     */
	    equals(p) {
	        return this[0] === p[0] && this[1] === p[1] && this[2] === p[2] && this[3] === p[3];
	    }

	    /**
	     * 复制
	     * @param {Point} p
	     * @returns {Point}
	     */
	    copy(p) {
	        this.set(p);
	        return this;
	    }

	    /**
	     * 赋值
	     * @param {float} x
	     * @param {float} y
	     * @param {float} z
	     */
	    assign(x, y, z) {
	        this[0] = x;
	        this[1] = y;
	        this[2] = z;
	    }

	    /**
	     * 2个点相减，结果为向量
	     * @param {Point} p
	     * @returns {Vector}
	     */
	    subAsVector(p) {
	        return new Vector$1(
	            this[0] - p[0],
	            this[1] - p[1],
	            this[2] - p[2]
	        );
	    }

	    /**
	     * 点减向量，结果为点
	     * @param {Vector} v
	     */
	    sub(v) {
	        return new Point$1(
	            this[0] - v.x,
	            this[1] - v.y,
	            this[2] - v.z
	        );
	    }


	    /**
	     * 点加向量，结果为点
	     * @param {Vector} v
	     */
	    add(v) {
	        return new Point$1(
	            this[0] + v.x,
	            this[1] + v.y,
	            this[2] + v.z
	        );
	    }

	    /**
	     * 点乘标量
	     * @param {number} scalar
	     */
	    scalar(scalar) {
	        return new Point$1(
	            scalar * this[0],
	            scalar * this[1],
	            scalar * this[2]
	        );
	    }

	    /**
	     * 标量除
	     * @param {number} scalar
	     */
	    div(scalar) {
	        if (scalar !== 0) {
	            scalar = 1 / scalar;

	            return new Point$1(
	                this[0] * scalar,
	                this[1] * scalar,
	                this[2] * scalar
	            );
	        }
	        return new Point$1(MAX_REAL, MAX_REAL, MAX_REAL);
	    }

	    /**
	     * 填充固定值
	     * @param {number} val
	     */
	    fill(val) {
	        super.fill(val, 0, 3);
	    }

	    /**
	     * 求中心对称点
	     */
	    negative() {
	        return new Point$1(
	            -this[0],
	            -this[1],
	            -this[2]
	        );
	    }

	    /**
	     * 点与向量求点积
	     * @param {Vector} vec
	     * @returns {number}
	     */
	    dot(vec) {
	        return this[0] * vec.x + this[1] * vec.y + this[2] * vec.z;
	    }

	    static get ORIGIN() {
	        return new Point$1();
	    }
	}

	/**
	 * Plane - 平面
	 * 
	 * 平面表示为 `Dot(N, X) - c = 0`, 其中：  
	 *  - `N = (n0, n1, n2, 0)` 一个单位法向量  
	 *  - `X = (x0, x1, x2, 1)` 是任何在该平面上的点  
	 *  - `c` 是平面常量
	 */
	class Plane$1 extends Float32Array {

	    /**
	     * @param {Vector} normal 平面单位法向量
	     * @param {number} constant 平面常量
	     */
	    constructor(normal, constant) {
	        super(4);
	        this.set(normal, 0, 3);
	        this[3] = -constant;
	    }

	    /**
	     *  `c = dot(normal, point)`
	     * @param {Vector} normal specified
	     * @param {Point} point 平面上的点
	     */
	    static fromPoint1(normal, point) {
	        return new Plane$1(
	            normal,
	            point.dot(normal)
	        );
	    }

	    /**
	     * @param {number} n0
	     * @param {number} n1
	     * @param {number} n2
	     * @param {number} constant
	     */
	    static fromNumber(n0, n1, n2, constant) {
	        return new Plane$1(new Vector$1(n0, n1, n2), constant);
	    }

	    /**
	     * 通过3个点创建一个平面
	     *
	     * - `normal = normalize( cross(point1-point0, point2-point0) )`
	     * - `c = dot(normal, point0)`
	     *
	     * @param {Point} point0
	     * @param {Point} point1
	     * @param {Point} point2
	     */
	    static fromPoint3(point0, point1, point2) {
	        let edge1 = point1.subAsVector(point0);
	        let edge2 = point2.subAsVector(point0);
	        let normal = edge1.unitCross(edge2);
	        return new Plane$1(normal, point0.dot(normal));
	    }

	    get normal() {
	        return new Vector$1(this[0], this[1], this[2]);
	    }

	    set normal(n) {
	        this.set(n, 0, 3);
	    }

	    get constant() {
	        return -this[3];
	    }

	    set constant(c) {
	        this[3] = -c;
	    }

	    /**
	     * 复制
	     * @param {Plane} plane
	     * @return {Plane}
	     */
	    copy(plane) {
	        this[0] = plane[0];
	        this[1] = plane[1];
	        this[2] = plane[2];
	        this[3] = plane[3];
	        return this;
	    }

	    /**
	     * 计算平面法向量的长度，并返回，同时规格化法向量和平面常量
	     * @returns {number}
	     */
	    normalize() {
	        let length = Math.hypot(this[0], this[1], this[2]);

	        if (length > 0) {
	            let invLength = 1 / length;
	            this[0] *= invLength;
	            this[1] *= invLength;
	            this[2] *= invLength;
	            this[3] *= invLength;
	        }

	        return length;
	    }


	    /**
	     * 计算点到平面的距离[有符号]  
	     * > `d = dot(normal, point) - c`
	     *  - normal 是平面的法向量
	     *  - c 是平面常量  
	     * 结果说明
	     *  - 如果返回值是正值则点在平面的正坐标一边，
	     *  - 如果是负值，则在负坐标一边
	     *  - 否则在平面上
	     * @param {Point} p
	     * @returns {number}
	     */
	    distanceTo(p) {
	        return this[0] * p.x + this[1] * p.y + this[2] * p.z + this[3];
	    }

	    /**
	     * @param {Point} p
	     */
	    whichSide(p) {
	        let distance = this.distanceTo(p);

	        if (distance < 0) {
	            return -1;
	        }
	        else if (distance > 0) {
	            return +1;
	        }

	        return 0;
	    }
	}

	/**
	 * 4阶矩阵
	 */
	class Matrix$1 extends Float32Array {
	    constructor(m00, m01, m02, m03,
	        m10, m11, m12, m13,
	        m20, m21, m22, m23,
	        m30, m31, m32, m33) {
	        super(16);
	        this[0] = m00;
	        this[1] = m01;
	        this[2] = m02;
	        this[3] = m03;

	        this[4] = m10;
	        this[5] = m11;
	        this[6] = m12;
	        this[7] = m13;

	        this[8] = m20;
	        this[9] = m21;
	        this[10] = m22;
	        this[11] = m23;

	        this[12] = m30;
	        this[13] = m31;
	        this[14] = m32;
	        this[15] = m33;
	    }

	    /**
	     * 复制
	     * @param {Matrix} m
	     * @returns {Matrix}
	     */
	    copy(m) {
	        this[0] = m[0];
	        this[1] = m[1];
	        this[2] = m[2];
	        this[3] = m[3];
	        this[4] = m[4];
	        this[5] = m[5];
	        this[6] = m[6];
	        this[7] = m[7];
	        this[8] = m[8];
	        this[9] = m[9];
	        this[10] = m[10];
	        this[11] = m[11];
	        this[12] = m[12];
	        this[13] = m[13];
	        this[14] = m[14];
	        this[15] = m[15];
	        return this;
	    }

	    /**
	     * 判断2个矩阵是否相等
	     * @param {Matrix} m
	     * @returns {boolean}
	     */
	    equals(m) {
	        let floatEqual = _Math.floatEqual;
	        for (let i = 0; i < 16; ++i) {
	            if (!floatEqual(this[i], m[i])) {
	                return false;
	            }
	        }
	        return true;
	    }

	    /**
	     * 判断2个矩阵是否不等
	     * @param {Matrix} m
	     * @returns {boolean}
	     */
	    notEquals(m) {
	        let floatEqual = _Math.floatEqual;
	        for (let i = 0; i < 16; ++i) {
	            if (!floatEqual(this[i], m[i])) {
	                return true;
	            }
	        }
	        return false;
	    }

	    /**
	     * 置零矩阵
	     * @returns {Matrix}
	     */
	    zero() {
	        return this.fill(0);
	    }

	    /**
	     * 置单位矩阵
	     * @returns {Matrix}
	     */
	    identity() {
	        this.fill(0);
	        this[0] = this[5] = this[10] = this[15] = 1;
	        return this;
	    }

	    /**
	     * 转置
	     */
	    transpose() {
	        let m = this;
	        return new Matrix$1(
	            m[0], m[4], m[8], m[12],
	            m[1], m[5], m[9], m[13],
	            m[2], m[6], m[10], m[14],
	            m[3], m[7], m[11], m[15]
	        );
	    }

	    /**
	     * 计算逆矩阵
	     * @returns {Matrix}
	     */
	    inverse() {
	        let m = this;
	        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
	        let a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
	        let a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
	        let a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

	        let b00 = a00 * a11 - a01 * a10;
	        let b01 = a00 * a12 - a02 * a10;
	        let b02 = a00 * a13 - a03 * a10;
	        let b03 = a01 * a12 - a02 * a11;
	        let b04 = a01 * a13 - a03 * a11;
	        let b05 = a02 * a13 - a03 * a12;
	        let b06 = a20 * a31 - a21 * a30;
	        let b07 = a20 * a32 - a22 * a30;
	        let b08 = a20 * a33 - a23 * a30;
	        let b09 = a21 * a32 - a22 * a31;
	        let b10 = a21 * a33 - a23 * a31;
	        let b11 = a22 * a33 - a23 * a32;

	        let invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
	        return new Matrix$1(
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
	    }


	    /**
	     * 伴随矩阵
	     */
	    adjoint() {
	        let m00 = this[0], m01 = this[1], m02 = this[2], m03 = this[3];
	        let m10 = this[4], m11 = this[5], m12 = this[6], m13 = this[7];
	        let m20 = this[8], m21 = this[9], m22 = this[10], m23 = this[11];
	        let m30 = this[12], m31 = this[13], m32 = this[14], m33 = this[15];


	        let a0 = m00 * m11 - m01 * m10;
	        let a1 = m00 * m12 - m02 * m10;
	        let a2 = m00 * m13 - m03 * m10;
	        let a3 = m01 * m12 - m02 * m11;
	        let a4 = m01 * m13 - m03 * m11;
	        let a5 = m02 * m13 - m03 * m12;
	        let b0 = m20 * m31 - m21 * m30;
	        let b1 = m20 * m32 - m22 * m30;
	        let b2 = m20 * m33 - m23 * m30;
	        let b3 = m21 * m32 - m22 * m31;
	        let b4 = m21 * m33 - m23 * m31;
	        let b5 = m22 * m33 - m23 * m32;

	        return Matrix$1(
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
	    }

	    /**
	     * 计算行列式
	     * @returns {number}
	     */
	    det() {
	        let m = this;
	        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
	        let a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
	        let a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
	        let a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

	        return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
	            a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
	            a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
	            a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
	            a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
	            a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
	    }

	    /**
	     * 对点或向量应用矩阵
	     * @param {Point|Vector} p
	     * @return {Point|Vector}
	     */
	    mulPoint(p) {
	        let c = this,
	            x = p[0], y = p[1], z = p[2], w = p[3];

	        return new p.constructor(
	            c[0] * x + c[4] * y + c[8] * z + c[12] * w,
	            c[1] * x + c[5] * y + c[9] * z + c[13] * w,
	            c[2] * x + c[6] * y + c[10] * z + c[14] * w,
	            c[3] * x + c[7] * y + c[11] * z + c[15] * w
	        );
	    }

	    /**
	     * 矩阵相乘
	     * @param {Matrix} b
	     */
	    mul(b) {
	        let a = this,

	            a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	            b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3],
	            b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7],
	            b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11],
	            b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

	        return new Matrix$1(
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
	    }

	    /**
	     * @param {number} s 
	     * @return {Matrix}
	     */
	    scalar(s) {
	        for (let i = 0; i < 16; ++i)
	            this[i] *= s;
	        return this;
	    }

	    /**
	     * @param {Matrix} m
	     * @return {Matrix}
	     */
	    add(m) {
	        for (let i = 0; i < 16; ++i)
	            this[i] += m[i];
	        return this;
	    }

	    /**
	     * 对点数组应用矩阵
	     * @param {number} num
	     * @param {Array<Point>} points
	     * @return {Array<Point>}
	     */
	    batchMul(num, points) {
	        let ret = new Array(points.length);
	        for (let i = 0; i < num; ++i) {
	            ret[i] = this.mulPoint(points[i]);
	        }
	        return ret;
	    }

	    /**
	     * 正交化矩阵旋转部分
	     * @return {Matrix}
	     */
	    orthoNormalize() {
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
	        let invLength = Math.hypot(this[0], this[4], this[8]);

	        this[0] *= invLength;
	        this[4] *= invLength;
	        this[8] *= invLength;

	        // Compute q1.
	        let dot0 = this[0] * this[1] + this[4] * this[5] + this[8] * this[9];

	        this[1] -= dot0 * this[0];
	        this[5] -= dot0 * this[4];
	        this[9] -= dot0 * this[8];

	        invLength = Math.hypot(this[1], this[5], this[9]);

	        this[1] *= invLength;
	        this[5] *= invLength;
	        this[9] *= invLength;

	        // Compute q2.
	        let dot1 = this[1] * this[2] + this[5] * this[6] + this[9] * this[10];

	        dot0 = this[0] * this[2] + this[4] * this[6] + this[8] * this[10];

	        this[2] -= dot0 * this[0] + dot1 * this[1];
	        this[6] -= dot0 * this[4] + dot1 * this[5];
	        this[10] -= dot0 * this[8] + dot1 * this[9];

	        invLength = Math.hypot(this[2], this[6], this[10]);

	        this[2] *= invLength;
	        this[6] *= invLength;
	        this[10] *= invLength;
	        return this;
	    }

	    /**
	     * 获取矩阵R行N列的值
	     * @param {number} r  行
	     * @param {number} c  列
	     */
	    item(r, c) {
	        return this[r + 4 * c];
	    }

	    /**
	     * 设置矩阵R行N列的值
	     * @param {number} r 行
	     * @param {number} c 列
	     * @param {number} value 值
	     */
	    setItem(r, c, value) {
	        this[r + 4 * c] = value;
	    }

	    /**
	     * @param {Point} p
	     */
	    timesDiagonal(p) {
	        let c = this;
	        return new Matrix$1(
	            c[0] * p[0], c[1] * p[1], c[2] * p[2], c[3],
	            c[4] * p[0], c[5] * p[1], c[6] * p[2], c[7],
	            c[8] * p[0], c[9] * p[1], c[10] * p[2], c[11],
	            c[12] * p[0], c[13] * p[1], c[14] * p[2], c[15]
	        );
	    }

	    /**
	     * @param {number} row
	     * @param {Point} p
	     */
	    setRow(row, p) {
	        let i = 4 * row;
	        this[i] = p[0];
	        this[i + 1] = p[1];
	        this[i + 2] = p[2];
	        this[i + 3] = p[3];
	    }

	    /**
	     * @param {number} row
	     */
	    getRow(row) {
	        let i = 4 * row;
	        let ret = new Point$1(this[i], this[i + 1], this[i + 2]);
	        ret[3] = this[i + 3];
	        return ret;
	    }

	    /**
	     * @param {number} col
	     * @param {Vector} p
	     */
	    setColumn(col, p) {
	        let s = col * 4;
	        this[s] = p[0];
	        this[s + 1] = p[1];
	        this[s + 2] = p[2];
	        this[s + 3] = p[3];
	    }

	    /**
	     * @param {number} col in
	     * @param {Vector} v out
	     */
	    getColumn(col, v) {
	        let s = col * 4;
	        v[0] = this[s];
	        v[1] = this[s + 1];
	        v[2] = this[s + 2];
	        v[3] = this[s + 3];
	    }

	    static get IDENTITY() {
	        return (new Matrix$1()).identity();
	    }

	    static get ZERO() {
	        return (new Matrix$1()).zero();
	    }

	    /**
	     * @param {Vector} p0
	     * @param {Vector} p1
	     * @param {Vector} p2
	     * @param {Point} p3
	     * @returns {Matrix}
	     */
	    static IPMake(p0, p1, p2, p3) {
	        return new Matrix$1(
	            p0.x, p1.x, p2.x, p3.x,
	            p0.y, p1.y, p2.y, p3.y,
	            p0.z, p1.z, p2.z, p3.z,
	            p0.w, p1.w, p2.w, p3.w
	        );
	    }

	    /**
	     * Set the transformation to a perspective projection matrix onto a specified plane.
	     *
	     * @param {Point} origin - plane's origin
	     * @param {Vector} normal - unit-length normal for plane
	     * @param {Point} eye - the origin of projection
	     */
	    makePerspectiveProjection(origin, normal, eye) {
	        //     +-                                                 -+
	        // M = | Dot(N,E-P)*I - E*N^T    -(Dot(N,E-P)*I - E*N^T)*E |
	        //     |        -N^t                      Dot(N,E)         |
	        //     +-                                                 -+
	        //
	        // where E is the eye point, P is a point on the plane, and N is a
	        // unit-length plane normal.

	        let dotND = normal.dot(eye.sub(origin)); // normal * (eye -origin)

	        let nx = normal.x, ny = normal.y, nz = normal.z;
	        let ex = eye.x, ey = eye.y, ez = eye.z;
	        let t = this;

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
	    }


	    /**
	     * 设置为在一个有效平面上的斜投影矩阵
	     *
	     * @param {Point} origin 平面上任意一点
	     * @param {Vector} normal 平面法向量
	     * @param {Vector} dir 光源方向
	     */
	    makeObliqueProjection(origin, normal, dir) {
	        // 平面方程 origin * normal + d = 0
	        // n = (nx, ny, nz)  平面法向量
	        // l = (lx, ly, lz) 光源方向(单位向量)
	        //
	        // | nl-nx*lx    -nx*ly   -nx*lz  -nx  |
	        // |   -ny*lx  nl-ny*ly   -ny*lz  -ny  |
	        // |   -nz*lx    -nz*ly nl-nz*lz  -nz  |
	        // |    -d*lx     -d*ly    -d*lz   nl  |

	        let nl = normal.dot(dir);
	        let c = origin.dot(normal);

	        let m = this;
	        let lx = dir.x, ly = dir.y, lz = dir.z,
	            nx = normal.x, ny = normal.y, nz = normal.z;

	        m[0] = lx * nx - nl;
	        m[1] = ly * nx;
	        m[2] = lz * nx;
	        m[3] = 0;
	        m[4] = lx * ny;
	        m[5] = ly * ny - nl;
	        m[6] = lz * ny;
	        m[7] = 0;
	        m[8] = lx * nz;
	        m[9] = ly * nz;
	        m[10] = lz * nz - nl;
	        m[11] = 0;
	        m[12] = -c * lx;
	        m[13] = -c * ly;
	        m[14] = -c * lz;
	        m[15] = -nl;
	    }

	    /**
	     * Set the transformation to a reflection matrix through a specified plane.
	     *
	     * @param {Point} origin plane's origin
	     * @param {Vector} normal unit-length normal for plane
	     */
	    makeReflection(origin, normal) {
	        let d = 2 * origin.dot(normal);
	        let x = normal.x, y = normal.y, z = normal.z;
	        let xy = x * y, xz = x * z, yz = y * z;
	        this.fill(0);
	        this[0] = 1 - 2 * x * x;
	        this[1] = -2 * xy;
	        this[2] = -2 * xz;

	        this[4] = -2 * xy;
	        this[5] = 1 - 2 * y * y;
	        this[6] = -2 * yz;

	        this[8] = -2 * xz;
	        this[9] = -2 * yz;
	        this[10] = 1 - 2 * z * z;


	        this[12] = d * x;
	        this[13] = d * y;
	        this[14] = d * z;
	        this[15] = 1;
	    }

	    /**
	     * @param {Vector} v0
	     * @param {Vector} v1
	     * @param {Vector} v2
	     * @param {Point} p
	     */
	    static fromVectorAndPoint(v0, v1, v2, p) {
	        return new Matrix$1(
	            v0.x, v0.y, v0.z, v0.w,
	            v1.x, v1.y, v1.z, v1.w,
	            v2.x, v2.y, v2.z, v2.w,
	            p.x, p.y, p.z, p.w
	        );
	    }

	    /**
	     * 生成旋转矩阵
	     * @param {Vector} axis 旋转轴
	     * @param {number} angle 旋转角度
	     */
	    static makeRotation(axis, angle) {
	        let c = Math.cos(angle),
	            s = Math.sin(angle),
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

	        return new Matrix$1(
	            oc * xx + c, xym + zs, xzm - ys, 0,
	            xym - zs, yy * oc + c, yzm + xs, 0,
	            xzm + ys, yzm - xs, zz * oc + c, 0,
	            0, 0, 0, 1
	        );
	    }

	    /**
	     * 从数组创建矩阵
	     * @param  {ArrayBuffer|Array<number>} arr
	     */
	    static fromArray(arr) {
	        console.assert(arr.length >= 16, 'invalid array for Matrix.fromArray');

	        return new Matrix$1(
	            arr[0], arr[1], arr[2], arr[3],
	            arr[4], arr[5], arr[6], arr[7],
	            arr[8], arr[9], arr[10], arr[11],
	            arr[12], arr[13], arr[14], arr[15]
	        );
	    }

	    /**
	     * 绕X轴旋转指定角度
	     * @param {number} angle
	     */
	    static makeRotateX(angle) {
	        let c = Math.cos(angle), s = Math.sin(angle);
	        return new Matrix$1(
	            1, 0, 0, 0,
	            0, c, s, 0,
	            0, -s, c, 0,
	            0, 0, 0, 1
	        );
	    }

	    /**
	     * @param {number} angle
	     */
	    static makeRotateY(angle) {
	        let c = Math.cos(angle), s = Math.sin(angle);
	        return new Matrix$1(
	            c, 0, -s, 0,
	            0, 1, 0, 0,
	            s, 0, c, 0,
	            0, 0, 0, 1
	        );
	    }

	    static makeRotateZ(angle) {
	        let c = Math.cos(angle), s = Math.sin(angle);
	        return new Matrix$1(
	            c, s, 0, 0,
	            -s, c, 0, 0,
	            0, 0, 1, 0,
	            0, 0, 0, 1
	        );
	    }


	    /**
	     * 生成缩放矩阵
	     * @param {number} scaleX
	     * @param {number} scaleY
	     * @param {number} scaleZ
	     */
	    static makeScale(scaleX, scaleY, scaleZ) {
	        return new Matrix$1(
	            scaleX, 0, 0, 0,
	            0, scaleY, 0, 0,
	            0, 0, scaleZ, 0,
	            0, 0, 0, 1
	        );
	    }

	    /**
	     * 平移快捷函数
	     * @param {number} x 
	     * @param {number} y 
	     * @param {number} z 
	     */
	    static makeTranslate(x, y, z) {
	        return new Matrix$1(
	            1, 0, 0, 0,
	            0, 1, 0, 0,
	            0, 0, 1, 0,
	            x, y, z, 1
	        );
	    }

	    /**
	     * 是否是单位矩阵
	     * @param {Matrix} dst
	     * @returns {boolean}
	     */
	    static isIdentity(dst) {
	        for (let i = 0, l = 16; i < l; ++i) {
	            if (i % 5) {
	                if (dst[i] !== 0) return false;
	            } else {
	                if (dst[i] !== 1) return false;
	            }
	        }
	        return true;
	    }
	}

	// The solution is unique.
	const EA_UNIQUE = 0;
	// The solution is not unique.  A sum of angles is constant.
	const EA_NOT_UNIQUE_SUM = 1;
	// The solution is not unique.  A difference of angles is constant.
	const EA_NOT_UNIQUE_DIF = 2;

	class Matrix3 extends Float32Array {
		constructor(
			m00 = 1, m01 = 0, m02 = 0,
			m10 = 0, m11 = 1, m12 = 0,
			m20 = 0, m21 = 0, m22 = 1
		) {
			super(9);
			this.set([m00, m01, m02, m10, m11, m12, m20, m21, m22]);
		}

		/**
		 * @param {Matrix3} mat3 
		 */
		copy(mat3) {
			this.set(mat3);
			return this;
		}

		makeZero() {
			this.fill(0);
			return this;
		}

		makeIdentity() {
			this.fill(0);
			this[0] = this[4] = this[8] = 1;
			return this;
		}

		/**
		 * 
		 * @param {Vector} vector 
		 * @return {number}
		 */
		extractEulerZYX(vec) {
			// +-           -+   +-                                      -+
			// | r00 r01 r02 |   |  cy*cz  cz*sx*sy-cx*sz  cx*cz*sy+sx*sz |
			// | r10 r11 r12 | = |  cy*sz  cx*cz+sx*sy*sz -cz*sx+cx*sy*sz |
			// | r20 r21 r22 |   | -sy     cy*sx           cx*cy          |
			// +-           -+   +-                                      -+

			if (this[6] < 1) {
				if (this[6] > -1) {
					// y_angle = asin(-r20)
					// z_angle = atan2(r10,r00)
					// x_angle = atan2(r21,r22)
					vec.y = _Math.asin(-this[6]);
					vec.z = Math.atan2(this[3], this[0]);
					vec.x = Math.atan2(this[7], this[8]);
					return EA_UNIQUE;
				}
				else {
					// y_angle = +pi/2
					// x_angle - z_angle = atan2(r01,r02)
					// WARNING.  The solution is not unique.  Choosing x_angle = 0.
					vec.y = _Math.HALF_PI;
					vec.z = -Math.atan2(this[1], this[2]);
					vec.x = 0;
					return EA_NOT_UNIQUE_DIF;
				}
			}
			else {
				// y_angle = -pi/2
				// x_angle + z_angle = atan2(-r01,-r02)
				// WARNING.  The solution is not unique.  Choosing x_angle = 0;
				vec.y = -_Math.HALF_PI;
				vec.z = Math.atan2(-this[1], -this[2]);
				vec.x = 0;
				return EA_NOT_UNIQUE_SUM;
			}
		}

		/**
		 * @param {Matrix3} mat3
		 */
		mul(mat3) {
			return new Matrix3(
				this[0] * mat3[0] + this[1] * mat3[3] + this[2] * mat3[6],
				this[0] * mat3[1] + this[1] * mat3[4] + this[2] * mat3[7],
				this[0] * mat3[2] + this[1] * mat3[5] + this[2] * mat3[8],

				this[3] * mat3[0] + this[4] * mat3[3] + this[5] * mat3[6],
				this[3] * mat3[1] + this[4] * mat3[4] + this[5] * mat3[7],
				this[3] * mat3[2] + this[4] * mat3[5] + this[5] * mat3[8],

				this[6] * mat3[0] + this[7] * mat3[3] + this[8] * mat3[6],
				this[6] * mat3[1] + this[7] * mat3[4] + this[8] * mat3[7],
				this[6] * mat3[2] + this[7] * mat3[5] + this[8] * mat3[8]
			);
		}

		makeEulerZYX(vec) {
			let cs, sn;
			cs = Math.cos(vec.z);
			sn = Math.sin(vec.z);
			let zMat = new Matrix3(
				cs, -sn, 0,
				sn, cs, 0,
				0, 0, 1
			);

			cs = Math.cos(vec.y);
			sn = Math.sin(vec.y);
			let yMat = new Matrix3(
				cs, 0, sn,
				0, 1, 0,
				-sn, 0, cs);

			cs = Math.cos(vec.x);
			sn = Math.sin(vec.x);
			let xMat = new Matrix3(
				1, 0, 0,
				0, cs, -sn,
				0, sn, cs);
			this.copy(zMat.mul(yMat.mul(xMat)));
		}

		static get ZERO() { return new Matrix3().makeZero(); }
		static get IDENTITY() { return new Matrix3().makeIdentity(); }
	}

	/**
	 * Quaternion 四元数
	 * 
	 * 四元数表示为  
	 * `q = w + x*i + y*j + z*k`  
	 * 但(w, x, y, z) 在4D空间不一定是单位向量
	 */
	class Quaternion$1 extends Float32Array {

	    constructor(w = 0, x = 0, y = 0, z = 0) {
	        super(4);
	        this[0] = w;
	        this[1] = x;
	        this[2] = y;
	        this[3] = z;
	    }

	    get w() {
	        return this[0];
	    }

	    get x() {
	        return this[1];
	    }

	    get y() {
	        return this[2];
	    }

	    get z() {
	        return this[3];
	    }

	    set w(n) {
	        this[0] = n;
	    }

	    set x(n) {
	        this[1] = n;
	    }

	    set y(n) {
	        this[2] = n;
	    }

	    set z(n) {
	        this[3] = n;
	    }

	    /**
	     * 复制
	     * @param {Quaternion} q
	     * @returns {Quaternion}
	     */
	    copy(q) {
	        this.set(q);
	        return this;
	    }

	    /**
	     * 克隆四元素
	     */
	    clone() {
	        return new Quaternion$1(this[0], this[1], this[2], this[3]);
	    }

	    /**
	     * 判断是否相等
	     * @param {Quaternion} q
	     */
	    equals(q) {
	        return this[0] === q[0] && this[1] === q[1] && this[2] === q[2] && this[3] === q[3];
	    }

	    /**
	     * 加法
	     * @param {Quaternion} q
	     */
	    add(q) {
	        return new Quaternion$1(this[0] + q[0], this[1] + q[1], this[2] + q[2], this[3] + q[3]);
	    }

	    /**
	     * 减法
	     * @param {Quaternion} q
	     */
	    sub(q) {
	        return new Quaternion$1(this[0] - q[0], this[1] - q[1], this[2] - q[2], this[3] - q[3]);
	    }

	    /**
	     * 乘标量
	     * @param {number} scalar
	     */
	    scalar(scalar) {
	        return new Quaternion$1(this[0] * scalar, this[1] * scalar, this[2] * scalar, this[3] * scalar);
	    }

	    /**
	     * 除标量
	     * @param {Quaternion} scalar
	     */
	    div(scalar) {
	        if (q !== 0) {
	            let invScalar = 1 / scalar;
	            return new Quaternion$1(this[0] * invScalar, this[1] * invScalar, this[2] * invScalar, this[3] * invScalar);
	        }
	        return new Quaternion$1(_Math.MAX_REAL, _Math.MAX_REAL, _Math.MAX_REAL, _Math.MAX_REAL);
	    }

	    /**
	     * 乘四元数
	     * @param {Quaternion} q
	     */
	    mul(q) {
	        let tw = this[0], tx = this[1], ty = this[2], tz = this[3];
	        let qw = q[0], qx = q[1], qy = q[2], qz = q[3];

	        return new Quaternion$1(
	            tw * qw - tx * qx - ty * qy - tz * qz,
	            tw * qx + tx * qw + ty * qz - tz * qy,
	            tw * qy + ty * qw + tz * qx - tx * qz,
	            tw * qz + tz * qw + tx * qy - ty * qx
	        );
	    }

	    /**
	     * 求负
	     */
	    negative() {
	        return new Quaternion$1(-this[0], -this[1], -this[2], -this[3]);
	    }

	    /**
	     * 提取旋转矩阵
	     */
	    toRotateMatrix() {
	        let w = this[0], x = this[1], y = this[2], z = this[3],
	            x2 = 2 * x, y2 = 2 * y, z2 = 2 * z,
	            wx2 = x2 * w, wy2 = y2 * w, wz2 = z2 * w,
	            xx2 = x2 * x, xy2 = y2 * x, xz2 = z2 * x,
	            yy2 = y2 * y, yz2 = z2 * y, zz2 = z2 * z;

	        return new Matrix$1(
	            1 - yy2 - zz2, xy2 - wz2, xz2 + wy2, 0,
	            xy2 + wz2, 1 - xx2 - zz2, yz2 - wx2, 0,
	            xz2 - wy2, yz2 + wx2, 1 - xx2 - yy2, 0,
	            0, 0, 0, 1
	        );
	    }

	    /**
	     * 提取旋转矩阵
	     * - 0: axis
	     * - 1: angle
	     * @returns {Array<number|Vector>}
	     */
	    toAxisAngle() {
	        // The quaternion representing the rotation is
	        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

	        let ret = [];
	        let sqrLength = this[1] * this[1] + this[2] * this[2] + this[3] * this[3];

	        if (sqrLength > 0) {
	            ret[1] = 2 * _Math.acos(this[0]);
	            let invLength = 1 / Math.sqrt(sqrLength);
	            ret[0] = new Vector(this[1] * invLength, this[2] * invLength, this[3] * invLength);
	        }
	        else {
	            // Angle is 0 (mod 2*pi), so any axis will do.
	            ret[1] = 0;
	            ret[0] = new Vector(1);
	        }
	        return ret;
	    }

	    /**
	     * 求当前四元数的模
	     */
	    get length() {
	        return Math.hypot(this[0], this[1], this[2], this[3]);
	    }

	    /**
	     * 模的平方
	     */
	    squaredLength() {
	        return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3];
	    }

	    /**
	     * 规格化
	     */
	    normalize() {
	        let length = this.length;

	        if (length > 0) {
	            let invLength = 1 / length;
	            this[0] *= invLength;
	            this[1] *= invLength;
	            this[2] *= invLength;
	            this[3] *= invLength;
	        }
	        else {
	            length = 0;
	            super.fill(0);
	        }

	        return length;
	    }

	    /**
	     * apply to non-zero quaternion
	     * @returns {Quaternion}
	     */
	    inverse() {
	        let norm = this.squaredLength();
	        if (norm > 0) {
	            let invNorm = 1 / norm;
	            return new Quaternion$1(this[0] * invNorm, -this[1] * invNorm, -this[2] * invNorm, -this[3] * invNorm);
	        }
	        return Quaternion$1.ZERO;
	    }

	    /**
	     * negate x, y, and z terms
	     * @returns {Quaternion}
	     */
	    conjugate() {
	        return new Quaternion$1(this[0], -this[1], -this[2], -this[3]);
	    }

	    /**
	     * apply to quaternion with w = 0
	     */
	    exp() {
	        // If q = A*(x*i+y*j+z*k) where (x,y,z) is unit length, then
	        // exp(q) = cos(A)+sin(A)*(x*i+y*j+z*k).  If sin(A) is near zero,
	        // use exp(q) = cos(A)+A*(x*i+y*j+z*k) since A/sin(A) has limit 1.

	        let angle = Math.hypot(this[1], this[2], this[3]);
	        let sn = Math.sin(angle);
	        let w = Math.cos(angle);
	        if (Math.abs(sn) > 0) {
	            let coeff = sn / angle;
	            return new Quaternion$1(w, coeff * this[1], coeff * this[2], coeff * this[3]);
	        }
	        return new Quaternion$1(w, this[1], this[2], this[3]);
	    }

	    /**
	     * apply to unit-length quaternion
	     */
	    log() {
	        // If q = cos(A)+sin(A)*(x*i+y*j+z*k) where (x,y,z) is unit length, then
	        // log(q) = A*(x*i+y*j+z*k).  If sin(A) is near zero, use log(q) =
	        // sin(A)*(x*i+y*j+z*k) since sin(A)/A has limit 1.

	        if (Math.abs(this[0]) < 1) {
	            let angle = _Math.acos(this[0]);
	            let sn = Math.sin(angle);
	            if (Math.abs(sn) > 0) {
	                let coeff = angle / sn;
	                return new Quaternion$1(0, coeff * this[1], coeff * this[2], coeff * this[3]);
	            }
	        }
	        return new Quaternion$1(0, this[1], this[2], this[3]);
	    }

	    /**
	     * 使用四元数旋转向量
	     * >内部转为矩阵后旋转
	     * @param {Vector} vec
	     * @returns {Vector}
	     */
	    rotate(vec) {
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
	    }

	    /**
	     * 球面插值
	     * @param {number} t
	     * @param {Quaternion} p
	     * @param {Quaternion} q
	     * @returns {Quaternion}
	     */
	    slerp(t, p, q) {
	        let cs = p.dot(q);
	        let angle = _Math.acos(cs);

	        if (Math.abs(angle) > 0) {
	            let sn = Math.sin(angle);
	            let invSn = 1 / sn;
	            let tAngle = t * angle;
	            let coeff0 = Math.sin(angle - tAngle) * invSn;
	            let coeff1 = Math.sin(tAngle) * invSn;

	            this[0] = coeff0 * p[0] + coeff1 * q[0];
	            this[1] = coeff0 * p[1] + coeff1 * q[1];
	            this[2] = coeff0 * p[2] + coeff1 * q[2];
	            this[3] = coeff0 * p[3] + coeff1 * q[3];
	        }
	        else {
	            this.copy(p);
	        }
	        return this;
	    }

	    /**
	     * 球面插值
	     * @param {number} t
	     * @param {Quaternion} p
	     * @param {Quaternion} q
	     * @param {number} extraSpins
	     * @returns {Quaternion}
	     */
	    slerpExtraSpins(t, p, q, extraSpins) {
	        let cs = p.dot(q);
	        let angle = _Math.acos(cs);

	        if (Math.abs(angle) >= _Math.ZERO_TOLERANCE) {
	            let sn = Math.sin(angle);
	            let phase = Math.PI * extraSpins * t;
	            let invSin = 1 / sn;
	            let coeff0 = Math.sin((1 - t) * angle - phase) * invSin;
	            let coeff1 = Math.sin(t * angle + phase) * invSin;

	            this[0] = coeff0 * p[0] + coeff1 * q[0];
	            this[1] = coeff0 * p[1] + coeff1 * q[1];
	            this[2] = coeff0 * p[2] + coeff1 * q[2];
	            this[3] = coeff0 * p[3] + coeff1 * q[3];
	        }
	        else {
	            this.copy(p);
	        }

	        return this;
	    }

	    /**
	     * 球面2次插值中间项
	     * @param {Quaternion} q0
	     * @param {Quaternion} q1
	     * @param {Quaternion} q2
	     * @returns {Quaternion}
	     */
	    intermediate(q0, q1, q2) {
	        let q1Inv = q1.conjugate();
	        let p0 = q1Inv.mul(q0).log();
	        let p2 = q1Inv.mul(q2).log();
	        let arg = p0.add(p2).scalar(-0.25).exp();
	        this.copy(q1.mul(arg));

	        return this;
	    }

	    /**
	     * 球面2次插值
	     * @param {number} t
	     * @param {Quaternion} q0
	     * @param {Quaternion} a0
	     * @param {Quaternion} a1
	     * @param {Quaternion} q1
	     * @returns {Quaternion}
	     */
	    squad(t, q0, a0, a1, q1) {
	        let slerpT = 2 * t * (1 - t);

	        let slerpP = this.slerp(t, q0, q1);
	        let slerpQ = this.slerp(t, a0, a1);
	        return this.slerp(slerpT, slerpP, slerpQ);
	    }

	    static get ZERO() {
	        return new Quaternion$1();
	    }

	    static get IDENTIRY() {
	        return new Quaternion$1(1);
	    }

	    /**
	     * 从矩阵的旋转部分创建四元数
	     * @param {Matrix} rot
	     */
	    static fromRotateMatrix(rot) {
	        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	        // article "Quaternion Calculus and Fast Animation".

	        let trace = rot[0] + rot[5] + rot[10];
	        let root;

	        if (trace > 0) {
	            // |w| > 1/2, may as well choose w > 1/2
	            root = Math.sqrt(trace + 1);  // 2w
	            let root1 = 0.5 / root;  // 1/(4w)

	            return new Quaternion$1(
	                0.5 * root,
	                (rot[9] - rot[6]) * root1,
	                (rot[2] - rot[8]) * root1,
	                (rot[4] - rot[1]) * root1
	            );
	        }

	        let next = [1, 2, 0];

	        // |w| <= 1/2
	        let i = 0;
	        if (rot[5] > rot[0]) {
	            i = 1;
	        }
	        if (rot[10] > rot.item(i, i)) {
	            i = 2;
	        }

	        let j = next[i];
	        let k = next[j];
	        root = Math.sqrt(rot.item(i, i) - rot.item(j, j) - rot.item(k, k) + 1);
	        let ret = new Array(4);
	        ret[i + 1] = 0.5 * root;
	        root = 0.5 / root;
	        ret[0] = (rot.item(k, j) - rot.item(j, k)) * root;
	        ret[j] = (rot.item(j, i) + rot.item(i, j)) * root;
	        ret[k] = (rot.item(k, i) + rot.item(i, k)) * root;

	        return new Quaternion$1(ret[0], ret[1], ret[2], ret[3]);
	    }

	    /**
	     * 使用旋转轴和旋转角度创建四元数
	     * @param {Vector} axis
	     * @param {number} angle
	     */
	    static fromAxisAngle(axis, angle) {
	        // assert:  axis[] is unit length
	        //
	        // The quaternion representing the rotation is
	        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

	        let halfAngle = 0.5 * angle;
	        let sn = Math.sin(halfAngle);
	        return new Quaternion$1(Math.cos(halfAngle), sn * axis.x, sn * axis.y, sn * axis.z);
	    }


	    /**
	     * 计算V1 到 V2 的旋转四元数， 旋转轴同时垂直于V1&V1
	     * @param {Vector} v1 单位向量
	     * @param {Vector} v2 单位向量
	     */
	    static align(v1, v2) {
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

	        let bisector = v1.add(v2).normalize();
	        let cosHalfAngle = v1.dot(bisector);
	        let w, x, y, z;

	        w = cosHalfAngle;

	        if (cosHalfAngle !== 0) {
	            let cross = v1.cross(bisector);
	            x = cross.x;
	            y = cross.y;
	            z = cross.z;
	        }
	        else {
	            let invLength;
	            if (Math.abs(v1.x) >= Math.abs(v1.y)) {
	                // V1.x or V1.z is the largest magnitude component.
	                invLength = Math.hypot(v1.x, v1.z);
	                x = -v1.z * invLength;
	                y = 0;
	                z = +v1.x * invLength;
	            }
	            else {
	                // V1.y or V1.z is the largest magnitude component.
	                invLength = Math.hypot(v1.y, v1.z);
	                x = 0;
	                y = +v1.z * invLength;
	                z = -v1.y * invLength;
	            }
	        }

	        return new Quaternion$1(w, x, y, z);
	    }

	    /**
	     * @param {Quaternion} q 
	     */
	    dot(q) {
	        return this[0] * q[0] + this[1] * q[1] + this[2] * q[2] + this[3] * q[3];
	    }
	}

	/**
	 * Polynomial1
	 */
	class Polynomial1 {}

	class Triangle3 {
		/**
		 * @param {Vector} v0 
		 * @param {Vector} v1 
		 * @param {Vector} v2 
		 */
		constructor(v0 = undefined, v1 = undefined, v2 = undefined) {
			this.V = [Vector$1.ZERO, Vector$1.ZERO, Vector$1.ZERO];
			if (v0 !== undefined) {
				this.V[0].copy(v0);
				this.V[1].copy(v1);
				this.V[2].copy(v2);
			}
		}

		/**
		 * @param {Vector} v 
		 */
		distanceTo(v) {
			let diff = this.V[0].sub(v);
			let edge0 = this.V[1].sub(this.V[0]);
			let edge1 = this.V[2].sub(this.V[0]);
			let a00 = edge0.squaredLength();
			let a01 = edge0.dot(edge1);
			let a11 = edge1.squaredLength();
			let b0 = diff.dot(edge0);
			let b1 = diff.dot(edge1);
			let c = diff.squaredLength();
			let det = Math.abs(a00 * a11 - a01 * a01);
			let s = a01 * b1 - a11 * b0;
			let t = a01 * b0 - a00 * b1;
			let sqrDistance;

			if (s + t <= det) {
				if (s < 0) {
					if (t < 0)  // region 4
					{
						if (b0 < 0) {
							if (-b0 >= a00) {
								sqrDistance = a00 + (2) * b0 + c;
							}
							else {
								sqrDistance = c - b0 * b0 / a00;
							}
						}
						else {
							if (b1 >= 0) {
								sqrDistance = c;
							}
							else if (-b1 >= a11) {
								sqrDistance = a11 + 2 * b1 + c;
							}
							else {
								sqrDistance = c - b1 * b1 / a11;
							}
						}
					}
					else  // region 3
					{
						if (b1 >= 0) {
							sqrDistance = c;
						}
						else if (-b1 >= a11) {
							sqrDistance = a11 + 2 * b1 + c;
						}
						else {
							sqrDistance = c - b1 * b1 / a11;
						}
					}
				}
				else if (t < 0)  // region 5
				{
					if (b0 >= 0) {
						sqrDistance = c;
					}
					else if (-b0 >= a00) {
						sqrDistance = a00 + 2 * b0 + c;
					}
					else {
						sqrDistance = b0 * s + c - b0 * b0 / a00;
					}
				}
				else  // region 0
				{
					// The minimum is at an interior point of the triangle.
					let invDet = 1 / det;
					s *= invDet;
					t *= invDet;
					sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
				}
			}
			else {
				let tmp0, tmp1, numer, denom;

				if (s < 0)  // region 2
				{
					tmp0 = a01 + b0;
					tmp1 = a11 + b1;
					if (tmp1 > tmp0) {
						numer = tmp1 - tmp0;
						denom = a00 - 2 * a01 + a11;
						if (numer >= denom) {
							sqrDistance = a00 + 2 * b0 + c;
						}
						else {
							s = numer / denom;
							t = 1 - s;
							sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
						}
					}
					else {
						if (tmp1 <= 0) {
							sqrDistance = a11 + 2 * b1 + c;
						}
						else if (b1 >= 0) {
							sqrDistance = c;
						}
						else {
							sqrDistance = c - b1 * b1 / a11;
						}
					}
				}
				else if (t < 0)  // region 6
				{
					tmp0 = a01 + b1;
					tmp1 = a00 + b0;
					if (tmp1 > tmp0) {
						numer = tmp1 - tmp0;
						denom = a00 - 2 * a01 + a11;
						if (numer >= denom) {
							t = 1;
							s = 0;
							sqrDistance = a11 + 2 * b1 + c;
						}
						else {
							t = numer / denom;
							s = 1 - t;
							sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
						}
					}
					else {
						if (tmp1 <= 0) {
							sqrDistance = a00 + 2 * b0 + c;
						}
						else if (b0 >= 0) {
							sqrDistance = c;
						}
						else {
							sqrDistance = c - b0 * b0 / a00;
						}
					}
				}
				else  // region 1
				{
					numer = a11 + b1 - a01 - b0;
					if (numer <= 0) {
						sqrDistance = a11 + 2 * b1 + c;
					}
					else {
						denom = a00 - 2 * a01 + a11;
						if (numer >= denom) {
							sqrDistance = a00 + 2 * b0 + c;
						}
						else {
							s = numer / denom;
							t = 1 - s;
							sqrDistance = s * (a00 * s + a01 * t + 2 * b0) + t * (a01 * s + a11 * t + 2 * b1) + c;
						}
					}
				}
			}

			return Math.sqrt(Math.abs(sqrDistance));
		}
	}

	class Line3 {
		/**
		 * @param {Point} org 
		 * @param {Vector} dir
		 */
		constructor(org, dir) {
			this.org = Point$1.ORIGIN;
			this.dir = Vector$1.ZERO;
			if (org) this.org.copy(org);
			if (dir) this.dir.copy(dir);
		}
	}

	class D3Object {
	    constructor(name = '') {
	        this.name = name || new.target.name;
	    }

	    getObjectByName(name) {
	        if (name === this.name) {
	            return this;
	        }
	        return null;
	    }

	    getAllObjectsByName(name, objs) {
	        if (name === this.name) {
	            objs.push(this);
	        }
	    }

	    // streaming.
	    load(inStream) {
	        inStream.readUniqueID(this);
	        this.name = inStream.readString();
	    }
	    link(inStream) { }
	    postLink() { }

	    save(tar) {
	        tar.writeString(this.constructor.name);
	        tar.writeUniqueID(this);
	        tar.writeString(this.name);
	    }

	    static get factories() {
	        return D3Object._factories;
	    }

	    static find(name) {
	        return D3Object.factories.get(name);
	    }

	    static factory(inStream) {
	        let obj = new this();
	        obj.load(inStream);
	        return obj;
	    }

	    /**
	     * @param {string} name 
	     * @param {function(InStream):D3Object} factory 
	     */
	    static Register(name, factory) {
	        D3Object.factories.set(name, factory);
	    }
	}

	/**
	 * @type {Map<string, function(InStream):D3Object>}
	 */
	D3Object._factories = new Map();

	class InStream {
	    constructor(file) {
	        this.filePath = file;
	        this.fileLength = 0;
	        this.fileOffset = 0;
	        this.source = null;  // 文件内容
	        this.onerror = (...str) => console.error(...str);
	        this.topLevel = [];
	        this.linked = new Map();
	        this.ordered = [];
	    }
	    /**
	     * 读取文件
	     * @returns {Promise<InStream>}
	     */
	    read() {
	        return new Promise((resolve, reject) => {
	            let file = new XhrTask(this.filePath, 'arraybuffer');
	            file.then(buffer => {
	                this.fileLength = buffer.byteLength;
	                this.source = new DataView(buffer);
	                this.parse();
	                resolve(this);
	            }).catch(reject);
	        });
	    }
	    /**
	     * 检查文件版本
	     * @return {boolean}
	     */
	    checkVersion() {
	        let len = VERSION.length;
	        if (this.fileLength < len) {
	            delete this.source;
	            return false;
	        }

	        let fileVersion = '';
	        for (let i = 0; i < len; ++i) {
	            fileVersion += String.fromCharCode(this.source.getUint8(i));
	        }
	        if (fileVersion !== VERSION) {
	            delete this.source;
	            return false;
	        }

	        this.fileOffset += len;
	        return true;
	    }

	    /**
	     * 读取字符串
	     * @returns {string}
	     */
	    readString() {
	        let length = this.source.getUint32(this.fileOffset, true);
	        this.fileOffset += 4;
	        if (length <= 0) {
	            return '';
	        }
	        let padding = (length % 4);
	        if (padding > 0) {
	            padding = 4 - padding;
	        }

	        let str = '', i = this.fileOffset, len = this.fileOffset + length;
	        for (; i < len; ++i) {
	            str += String.fromCharCode(this.source.getUint8(i));
	        }
	        this.fileOffset += length + padding;
	        return str;
	    }

	    /**
	     * 读取字符串数组
	     * @returns {Array<String>}
	     */
	    readStringArray() {
	        let numElements = this.readUint32();
	        if (numElements === undefined || numElements <= 0) {
	            return [];
	        }

	        let ret = [], i;
	        for (i = 0; i < numElements; ++i) {
	            ret[i] = this.readString();
	            if (ret[i] === '') {
	                return [];
	            }
	        }
	        return ret;
	    }

	    /**
	     * 读取字符串数组
	     * @param {number} numElements 需要读取的字符串数组大小
	     * @returns {Array<String>}
	     */
	    readSizedStringArray(numElements) {
	        if (numElements <= 0) {
	            return [];
	        }
	        let ret = [], i, str;
	        for (i = 0; i < numElements; ++i) {
	            ret[i] = this.readString();
	            if (!ret[i]) {
	                return [];
	            }
	        }
	        return ret;
	    }

	    // 解析文件
	    parse() {
	        if (!this.checkVersion()) {
	            return this.onerror(this.filePath, ', invalid version, can not parse.');
	        }
	        let topLevel = 'Top Level',
	            totalSize = this.fileLength,
	            name, isTopLevel, factory;
	        while (this.fileOffset < totalSize) {
	            name = this.readString();
	            isTopLevel = (name === topLevel);
	            if (isTopLevel) {
	                name = this.readString();
	            }
	            factory = D3Object.find(name);
	            if (!factory) {
	                this.onerror(`${this.filePath}, Cannot find factory for ${name}`);
	                return;
	            }
	            let obj = factory(this);
	            if (isTopLevel) {
	                this.topLevel.push(obj);
	            }
	        }
	        this.ordered.forEach(obj => obj.link(this));
	        this.ordered.forEach(obj => obj.postLink(this));
	        this.linked.clear();
	        this.ordered.length = 0;
	        this.source = null;
	    }

	    getObjectAt(i) {
	        if (0 <= i && i < this.topLevel.length) {
	            return this.topLevel[i];
	        }
	        return null;
	    }

	    /**
	     * @param {D3Object} obj
	     */
	    readUniqueID(obj) {
	        let uniqueID = this.source.getUint32(this.fileOffset, true);
	        this.fileOffset += 4;
	        if (uniqueID) {
	            this.linked.set(uniqueID, obj);
	            this.ordered.push(obj);
	        }
	    }

	    readUint32() {
	        let limit = this.fileOffset + 4;
	        if (limit <= this.fileLength) {
	            let ret = this.source.getUint32(this.fileOffset, true);
	            this.fileOffset = limit;
	            return ret;
	        }
	        return undefined;
	    }

	    readSizedInt32Array(numElements) {
	        if (numElements <= 0) {
	            return [];
	        }
	        let limit = this.fileOffset + 4 * numElements;
	        if (limit >= this.fileLength) {
	            return [];
	        }

	        let ret = [], i;
	        for (i = this.fileOffset; i < limit; i += 4) {
	            ret[i] = this.source.getInt32(i, true);
	        }
	        this.fileOffset = limit;
	        return ret;
	    }

	    readFloat32Range(num) {
	        let limit = this.fileOffset + 4 * num;
	        if (limit <= this.fileLength) {
	            let ret = [], i;
	            for (i = this.fileOffset; i < limit; i += 4) {
	                ret.push(this.source.getFloat32(i, true));
	            }
	            this.fileOffset = limit;
	            return ret;
	        }
	        return undefined;
	    }

	    readFloat32() {
	        let limit = this.fileOffset + 4;
	        if (limit <= this.fileLength) {
	            let ret = this.source.getFloat32(this.fileOffset, true);
	            this.fileOffset = limit;
	            return ret;
	        }
	        return undefined;
	    }

	    readFloat64() {
	        let limit = this.fileOffset + 8;
	        if (limit <= this.fileLength) {
	            let ret = this.source.getFloat64(this.fileOffset, true);
	            this.fileOffset = limit;
	            return ret;
	        }
	        return undefined;
	    }

	    readEnum() {
	        let value = this.readUint32();
	        if (value === undefined) {
	            return false;
	        }
	        return value;
	    }

	    readSizedEnumArray(numElements) {
	        if (numElements > 0) {
	            let ret = [], i, e;
	            for (i = 0; i < numElements; ++i) {
	                ret[i] = this.readEnum();
	                if (ret[i] === undefined) {
	                    return [];
	                }
	            }
	            return ret;
	        }
	        return [];
	    }

	    readBool() {
	        let val = this.readUint32();
	        if (val === undefined) {
	            return false;
	        }
	        return val !== 0;
	    }

	    readSizedPointerArray(numElements) {
	        if (numElements > 0) {
	            let ret = new Array(numElements), v;
	            for (let i = 0; i < numElements; ++i) {
	                v = this.readPointer();
	                if (v === undefined) {
	                    return false;
	                }
	                ret[i] = v;
	            }
	            return ret;
	        }
	        return false;
	    }

	    readPointerArray() {
	        let numElements = this.readUint32();
	        if (numElements === undefined) {
	            return false;
	        }

	        if (numElements > 0) {
	            let ret = new Array(numElements);
	            for (let i = 0; i < numElements; ++i) {
	                ret[i] = this.readPointer();
	                if (ret[i] === undefined) {
	                    return false;
	                }
	            }
	            return ret;
	        }
	        return false;
	    }

	    readPointer() {
	        return this.readUint32();
	    }


	    readArray(num) {
	        return this.readFloat32Range(num);
	    }

	    readSizedFFloatArray(numElements) {
	        if (numElements <= 0) {
	            return [];
	        }
	        let ret = [], i;
	        for (i = 0; i < numElements; ++i) {
	            ret[i] = this.readFloat32Range(4);
	        }
	        return ret;
	    }

	    /**
	     * 获取浮点数数组
	     * @returns {Array<number>}
	     */
	    readFloatArray() {
	        let num = this.readUint32();
	        if (num > 0) {
	            let ret = new Array(num);
	            for (let i = 0; i < num; ++i) {
	                ret[i] = this.readFloat32();
	            }
	            return ret;
	        }
	        return [];
	    }

	    /**
	     * @returns {Transform}
	     */
	    readTransform() {
	        let tf = new L5.Transform();
	        tf.__matrix.copy(this.readMatrix());
	        tf._invMatrix.copy(this.readMatrix());
	        tf._matrix.copy(this.readMatrix());
	        tf._translate.copy(this.readPoint());
	        tf._scale.copy(this.readPoint());
	        tf._isIdentity = this.readBool();
	        tf._isRSMatrix = this.readBool();
	        tf._isUniformScale = this.readBool();
	        tf._inverseNeedsUpdate = this.readBool();
	        return tf;
	    }

	    readTransformArray() {
	        let num = this.readUint32();
	        if (num > 0) {
	            let ret = new Array(num);
	            for (let i = 0; i < num; ++i) {
	                ret[i] = this.readTransform();
	            }
	            return ret;
	        }
	        return [];
	    }

	    readMatrix() {
	        let d = this.readFloat32Range(16);
	        if (d === undefined) {
	            return false;
	        }
	        return L5.Matrix.fromArray(d);
	    }

	    readPoint() {
	        let d = this.readFloat32Range(4);
	        if (d === undefined) {
	            return false;
	        }
	        return new Point(d[0], d[1], d[2], d[3]);
	    }

	    readPointArray() {
	        let num = this.readUint32();
	        if (num > 0) {
	            let ret = new Array(num);
	            for (let i = 0; i < num; ++i) {
	                ret[i] = this.readPoint();
	            }
	            return ret;
	        }
	        return [];
	    }

	    readSizedPointArray(size) {
	        if (size > 0) {
	            let ret = new Array(size);
	            for (let i = 0; i < size; ++i) {
	                ret[i] = this.readPoint();
	            }
	            return ret;
	        }
	        return [];
	    }

	    /**
	     * 读取四元素
	     * @returns {Quaternion|boolean}
	     */
	    readQuaternion() {
	        let d = this.readFloat32Range(4);
	        if (d === undefined) {
	            return false;
	        }
	        return new Quaternion(d[0], d[1], d[2], d[3]);
	    }

	    /**
	     * 读取四元素数组
	     * @returns {Array<Quaternion>}
	     */
	    readQuaternionArray() {
	        let num = this.readUint32();
	        if (num > 0) {
	            let ret = new Array(num);
	            for (let i = 0; i < num; ++i) {
	                ret[i] = this.readQuaternion();
	            }
	            return ret;
	        }
	        return [];
	    }

	    /**
	     * 读取四元素数组
	     * @param {number} size 数组大小
	     * @returns {Array<Quaternion>}
	     */
	    readSizedQuaternionArray(size) {
	        if (size > 0) {
	            let ret = new Array(size);
	            for (let i = 0; i < size; ++i) {
	                ret[i] = this.readQuaternion();
	            }
	            return ret;
	        }
	        return [];
	    }

	    readBound() {
	        let b = new Bound();
	        let t1 = this.readPoint();
	        let t2 = this.readFloat32();
	        if (t1 === false || t2 === undefined) {
	            return false;
	        }
	        b.center.copy(t1);
	        b.radius = t2;
	        return b;
	    }

	    /**
	     * 读取2进制
	     * @returns {ArrayBuffer}
	     */
	    readBinary() {
	        let byteSize = this.readUint32();
	        if (byteSize > 0) {
	            let limit = this.fileOffset + byteSize;
	            if (limit <= this.fileLength) {
	                let ret = this.source.buffer.slice(this.fileOffset, limit);
	                this.fileOffset = limit;
	                return ret;
	            }
	        }
	        return new ArrayBuffer(0);
	    }

	    resolveLink(obj) {
	        if (obj) {
	            let t = this.linked.get(obj);
	            if (t !== undefined) {
	                return t;
	            }
	            else {
	                console.assert(false, "Unexpected link failure");
	                return null;
	            }
	        }
	    }
	    resolveArrayLink(numElements, objs) {
	        let ret = [];
	        for (let i = 0; i < numElements; ++i) {
	            ret[i] = this.resolveLink(objs[i]);
	        }
	        return ret;
	    }
	}

	class BinDataView {

	    /**
	     * @param {ArrayBuffer} buf
	     * @param {number} offset
	     * @param {number} size
	     */
	    constructor(buf, offset = 0, size = 0) {
	        if (size === 0) {
	            size = buf.byteLength - offset;
	        }
	        this.dv = new DataView(buf, offset, size);
	        this.offset = 0;
	    }

	    int8() {
	        return this.dv.getInt8(this.offset++);
	    }
	    setInt8(val) {
	        this.dv.setInt8(this.offset++, val);
	    }

	    uint8() {
	        return this.dv.getUint8(this.offset++);
	    }
	    setUint8(val) {
	        this.dv.setUint8(this.offset++, val);
	    }

	    uint16() {
	        let val = this.dv.getUint16(this.offset, true);
	        this.offset += 2;
	        return val;
	    }

	    setUint16(val) {
	        this.dv.setUint16(this.offset, val, true);
	        this.offset += 2;
	    }

	    int16() {
	        let val = this.dv.getInt16(this.offset, true);
	        this.offset += 2;
	        return val;
	    }
	    setInt16(val) {
	        this.dv.setInt16(this.offset, val, true);
	        this.offset += 2;
	    }

	    int32() {
	        let val = this.dv.getInt32(this.offset, true);
	        this.offset += 4;
	        return val;
	    }
	    setInt32(val) {
	        this.dv.setInt32(this.offset, val, true);
	        this.offset += 4;
	    }

	    uint32() {
	        let val = this.dv.getUint32(this.offset, true);
	        this.offset += 4;
	        return val;
	    }

	    setUint32(val) {
	        this.dv.setUint32(this.offset, val, true);
	        this.offset += 4;
	    }

	    float32() {
	        let val = this.dv.getFloat32(this.offset, true);
	        this.offset += 4;
	        return val;
	    }

	    setFloat32(val) {
	        this.dv.setFloat32(this.offset, val, true);
	        this.offset += 4;
	    }

	    float64() {
	        let val = this.dv.getFloat64(this.offset, true);
	        this.offset += 8;
	        return val;
	    }

	    setFloat64(val) {
	        this.dv.setFloat64(this.offset, val, true);
	        this.offset += 8;
	    }

	    string() {
	        let size = this.uint16(), ret = '';
	        for (let i = 0; i < size; ++i) {
	            ret += String.fromCharCode(this.uint8());
	        }
	        return ret;
	    }
	    setString(val) {
	        let size = val.length;
	        this.setUint16(size);
	        for (let i = 0; i < size; ++i) {
	            this.setUint8(val[i].charCodeAt(i));
	        }
	        this.offset += size;
	    }

	    bytes(size) {
	        let val = this.dv.buffer.slice(this.offset, size);
	        this.offset += size;
	        return new Uint8Array(val);
	    }

	    setBytes(val) {
	        (new Uint8Array(this.dv.buffer, this.offset)).set(val);
	        this.offset += val.byteLength;
	    }
	}

	class Controller extends D3Object {
	    constructor() {
	        super();
	        this.repeat = Controller.RT_CLAMP;
	        this.minTime = 0;                      // default = 0
	        this.maxTime = 0;                      // default = 0
	        this.phase = 0;                        // default = 0
	        this.frequency = 1;                    // default = 1
	        this.active = true;                    // default = true
	        this.object = null;                    // ControlledObject.
	        this.applicationTime = -1;             // application time, ms
	    }

	    /**
	     * Conversion from application time units to controller time units.
	     * Derived classes may use this in their update routines.
	     * @param {number} applicationTime
	     * @returns {number}
	     * @protected
	     */
	    getControlTime(applicationTime) {
	        let controlTime = this.frequency * applicationTime + this.phase;

	        if (this.repeat === Controller.RT_CLAMP) {
	            // Clamp the time to the [min, max] interval.
	            if (controlTime < this.minTime) {
	                return this.minTime;
	            }
	            if (controlTime > this.maxTime) {
	                return this.maxTime;
	            }
	            return controlTime;
	        }

	        const timeRange = this.maxTime - this.minTime;
	        if (timeRange > 0) {
	            let multiples = (controlTime - this.minTime) / timeRange;
	            let integerTime = Math.floor(multiples);
	            let fractionTime = multiples - integerTime;
	            if (this.repeat === Controller.RT_WRAP) {
	                return this.minTime + fractionTime * timeRange;
	            }

	            // repeat == RT_CYCLE
	            if (integerTime & 1) {
	                // Go backward in time.
	                return this.maxTime - fractionTime * timeRange;
	            }
	            else {
	                // Go forward in time.
	                return this.minTime + fractionTime * timeRange;
	            }
	        }

	        // minTime is equal maxTime
	        return this.minTime;
	    }

	    /**
	     * The animation update
	     * @param {number} applicationTime - milliseconds
	     */
	    update(applicationTime) {
	        if (this.active) {
	            this.applicationTime = applicationTime;
	            return true;
	        }
	        return false;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.repeat = inStream.readEnum();
	        this.minTime = inStream.readFloat64();
	        this.maxTime = inStream.readFloat64();
	        this.phase = inStream.readFloat64();
	        this.frequency = inStream.readFloat64();
	        this.active = inStream.readBool();
	        this.object = inStream.readPointer();
	        this.applicationTime = -1;
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.object = inStream.resolveLink(this.object);
	    }
	}

	// Time management.  A controller may use its own time scale, and it
	// specifies how times are to be mapped to application time.
	Controller.RT_CLAMP = 0;  // default
	Controller.RT_WRAP = 1;
	Controller.RT_CYCLE = 2;

	/**
	 * 变换用公式 Y= M*X+T 表示:  
	 * - M  3\*3 Matrix, 大部分情况下为
	 *  - 旋转矩阵
	 *  - 或者 `M = R*S`:
	 *   - R = 旋转矩阵
	 *   - S = 正缩放对角矩阵  
	 *     为支持模型包,允许普通仿射变换  
	 *      M可以是任意可逆3*3矩阵
	 * - T 平移向量
	 * - X 前方向为Y轴的向量  
	 * 从Y翻转至X, 一般情况下记做: `X = M^{-1}*(Y-T)`
	 *
	 * 在 M = R*S 的特殊情况下:
	 * `X = S^{-1}*R^t*(Y-T)`
	 * - `S^{-1}` S的逆
	 * - `R^t` R的转置矩阵
	 *
	 * 构造默认是个单位变换
	 */
	class Transform$1 {
	    constructor() {
	        // The full 4x4 homogeneous matrix H = {{M,T},{0,1}} and its inverse
	        // H^{-1} = {M^{-1},-M^{-1}*T},{0,1}}.  The inverse is computed only
	        // on demand.

	        // 变换矩阵
	        this.__matrix = Matrix$1.IDENTITY;
	        // 变换矩阵的逆矩阵
	        this._invMatrix = Matrix$1.IDENTITY;

	        this._matrix = Matrix$1.IDENTITY;     // M (general) or R (rotation)


	        this._scale = new Point$1(1, 1, 1);        // S
	        this._translate = Point$1.ORIGIN;          // T

	        this._isIdentity = true;
	        this._isRSMatrix = true;
	        this._isUniformScale = true;
	        this._inverseNeedsUpdate = false;
	    }

	    /**
	     * depth copy a Transform
	     * @param {Transform} transform 
	     */
	    copy(transform) {
	        this.__matrix.copy(transform.__matrix);
	        this._invMatrix.copy(transform._invMatrix);
	        this._matrix.copy(transform._matrix);
	        this._scale.copy(transform._scale);
	        this._translate.copy(transform._translate);
	        this._isIdentity = transform._isIdentity;
	        this._isRSMatrix = transform._isRSMatrix;
	        this._isUniformScale = transform._isUniformScale;
	        this._inverseNeedsUpdate = transform._inverseNeedsUpdate;
	    }

	    /**
	     * 置单位变换
	     */
	    makeIdentity() {
	        this._matrix = Matrix$1.IDENTITY;
	        this._translate.fill(0);
	        this._scale.fill(1);
	        this._isIdentity = true;
	        this._isRSMatrix = true;
	        this._isUniformScale = true;
	        this._updateMatrix();
	        return this;
	    }

	    /**
	     * 缩放置1
	     */
	    makeUnitScale() {
	        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
	        this._scale.fill(1);
	        this._isUniformScale = true;
	        this._updateMatrix();
	        return this;
	    }

	    /**
	     * @returns {boolean}
	     */
	    isIdentity() {
	        return this._isIdentity;
	    }

	    /**
	     * R*S
	     * @returns {boolean}
	     */
	    isRSMatrix() {
	        return this._isRSMatrix;
	    }

	    /**
	     * R*S, S = c*I
	     * @returns {boolean}
	     */
	    isUniformScale() {
	        return this._isRSMatrix && this._isUniformScale;
	    }


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
	     * @param {Matrix} rotate
	     */
	    setRotate(rotate) {
	        this._matrix.copy(rotate);
	        this._isIdentity = false;
	        this._isRSMatrix = true;
	        this._updateMatrix();
	        return this;
	    }

	    /**
	     * @param {Matrix} matrix
	     */
	    setMatrix(matrix) {
	        this._matrix.copy(matrix);
	        this._isIdentity = false;
	        this._isRSMatrix = false;
	        this._isUniformScale = false;
	        this._inverseNeedsUpdate = true;
	        this._translate.copy([matrix[12], matrix[13], matrix[14]]);
	        this.__matrix.copy(matrix);
	        return this;
	    }

	    /**
	     * @param {Point} translate
	     */
	    setTranslate(translate) {
	        this._translate.copy(translate);
	        this._isIdentity = false;
	        this._updateMatrix();
	        return this;
	    }

	    /**
	     * @param {Point} scale
	     */
	    setScale(scale) {
	        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
	        console.assert(!this._scale.equals(Point$1.ORIGIN), 'Scales must be nonzero');
	        this._scale.copy(scale);
	        this._isIdentity = false;
	        this._isUniformScale = false;
	        this._updateMatrix();
	        return this;
	    }

	    /**
	     * @param {number} scale
	     */
	    setUniformScale(scale) {
	        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
	        console.assert(scale !== 0, 'Scale must be nonzero');

	        this._scale.fill(scale);
	        this._isIdentity = false;
	        this._isUniformScale = true;
	        this._updateMatrix();
	        return this;
	    }

	    /**
	     * @returns {Matrix}
	     */
	    getRotate() {
	        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
	        return this._matrix;
	    }

	    /**
	     * @returns {Matrix}
	     */
	    getMatrix() {
	        return this._matrix;
	    }

	    /**
	     * @returns {Point}
	     */
	    getTranslate() {
	        return this._translate;
	    }

	    /**
	     * @returns {Point}
	     */
	    getScale() {
	        console.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
	        return this._scale;
	    }

	    /**
	     * @returns {number}
	     */
	    getUniformScale() {
	        console.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
	        console.assert(this._isUniformScale, 'Matrix is not uniform scale');
	        return this._scale[0];
	    }


	    /**
	     * For M = R*S, the largest value of S in absolute value is returned.
	     * For general M, the max-row-sum norm is returned, which is a reasonable
	     * measure of maximum scale of the transformation.
	     * @returns {number}
	     */
	    getNorm() {
	        const abs = Math.abs;
	        if (this._isRSMatrix) {
	            let maxValue = abs(this._scale[0]);
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
	        let m = this._matrix;
	        let maxRowSum = abs(m[0]) + abs(m[4]) + abs(m[8]);
	        let rowSum = abs(m[1]) + abs(m[5]) + abs(m[9]);

	        if (rowSum > maxRowSum) {
	            maxRowSum = rowSum;
	        }
	        rowSum = abs(m[2]) + abs(m[6]) + abs(m[10]);
	        if (rowSum > maxRowSum) {
	            maxRowSum = rowSum;
	        }

	        return maxRowSum;
	    }

	    /**
	     * @param {Point|Vector} p
	     * Matrix-point/vector 乘法, M*p.
	     */
	    mulPoint(p) {
	        return this.__matrix.mulPoint(p);
	    }

	    /**
	     * Matrix-matrix multiplication.
	     * @param {Transform} transform
	     * @returns {Transform}
	     */
	    mul(transform) {
	        if (this._isIdentity) {
	            return transform;
	        }

	        if (transform.isIdentity()) {
	            return this;
	        }
	        const IsRS = this._isRSMatrix;
	        let product = new Transform$1();

	        if (IsRS && transform.isRSMatrix()) {
	            if (this._isUniformScale) {
	                let scale0 = this._scale[0];
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
	        let matMA = (IsRS ? this._matrix.timesDiagonal(this._scale) : this._matrix);
	        let matMB = (
	            transform.isRSMatrix() ?
	                transform.getMatrix().timesDiagonal(transform.getScale()) :
	                transform.getMatrix()
	        );

	        product.setMatrix(matMA.mul(matMB));
	        product.setTranslate(matMA.mulPoint(transform.getTranslate()).add(this._translate));
	        return product;
	    }

	    /**
	     * Get the homogeneous matrix.
	     */
	    toMatrix() {
	        return this.__matrix;
	    }


	    /**
	     * Get the inverse homogeneous matrix, recomputing it when necessary.
	     * If H = {{M,T},{0,1}}, then H^{-1} = {{M^{-1},-M^{-1}*T},{0,1}}.
	     * @returns {Matrix}
	     */
	    inverse() {
	        if (!this._inverseNeedsUpdate) {
	            return this._invMatrix;
	        }
	        if (this._isIdentity) {
	            this._invMatrix.copy(Matrix$1.IDENTITY);
	            this._inverseNeedsUpdate = false;
	            return this._invMatrix;
	        }

	        let im = this._invMatrix,
	            m = this._matrix;

	        if (this._isRSMatrix) {
	            let [s0, s1, s2] = this._scale;
	            if (this._isUniformScale) {
	                let invScale = 1 / s0;
	                im[0] = invScale * m[0];
	                im[4] = invScale * m[1];
	                im[8] = invScale * m[2];
	                im[1] = invScale * m[4];
	                im[5] = invScale * m[5];
	                im[9] = invScale * m[6];
	                im[2] = invScale * m[8];
	                im[6] = invScale * m[9];
	                im[10] = invScale * m[10];
	            } else {
	                // Replace 3 reciprocals by 6 multiplies and 1 reciprocal.
	                let s01 = s0 * s1;
	                let s02 = s0 * s2;
	                let s12 = s1 * s2;
	                let invs012 = 1 / (s01 * s2);
	                let invS0 = s12 * invs012;
	                let invS1 = s02 * invs012;
	                let invS2 = s01 * invs012;
	                im[0] = invS0 * m[0];
	                im[4] = invS0 * m[1];
	                im[8] = invS0 * m[2];
	                im[1] = invS1 * m[4];
	                im[5] = invS1 * m[5];
	                im[9] = invS1 * m[6];
	                im[2] = invS2 * m[8];
	                im[6] = invS2 * m[9];
	                im[10] = invS2 * m[10];
	            }
	        } else {
	            Transform$1.invert3x3(this.__matrix, im);
	        }

	        let [t0, t1, t2] = this._translate;
	        im[12] = -(im[0] * t0 + im[4] * t1 + im[8] * t2);
	        im[13] = -(im[1] * t0 + im[5] * t1 + im[9] * t2);
	        im[14] = -(im[2] * t0 + im[6] * t1 + im[10] * t2);

	        this._inverseNeedsUpdate = false;
	        return this._invMatrix;
	    }


	    /**
	     * Get the inversion transform.  No test is performed to determine whether
	     * the caller transform is invertible.
	     * @returns {Transform}
	     */
	    inverseTransform() {
	        if (this._isIdentity) {
	            return Transform$1.IDENTITY;
	        }

	        let inverse = new Transform$1();
	        let invTrn = Point$1.ORIGIN;

	        if (this._isRSMatrix) {
	            let invRot = this._matrix.transpose();
	            let invScale;
	            inverse.setRotate(invRot);
	            if (this._isUniformScale) {
	                invScale = 1 / this._scale[0];
	                inverse.setUniformScale(invScale);
	                invTrn.copy(invRot.mulPoint(this._translate).scalar(-invScale));
	            }
	            else {
	                invScale = new Point$1(1 / this._scale[0], 1 / this._scale[1], 1 / this._scale[2]);
	                inverse.setScale(invScale);
	                invTrn = invRot.mulPoint(this._translate);
	                invTrn[0] *= -invScale[0];
	                invTrn[1] *= -invScale[1];
	                invTrn[2] *= -invScale[2];
	            }
	        }
	        else {
	            let invMat = new Matrix$1();
	            Transform$1.invert3x3(this._matrix, invMat);
	            inverse.setMatrix(invMat);
	            invTrn.copy(invMat.mulPoint(this._translate).negative());
	        }
	        inverse.setTranslate(invTrn);

	        return inverse;
	    }

	    /**
	     * Fill in the entries of mm whenever one of the components
	     * m, mTranslate, or mScale changes.
	     * @private
	     */
	    _updateMatrix() {
	        if (this._isIdentity) {
	            this.__matrix.identity();
	        } else {
	            let mm = this.__matrix;
	            const m = this._matrix;
	            if (this._isRSMatrix) {
	                let [s0, s1, s2] = this._scale;
	                mm[0] = m[0] * s0;
	                mm[4] = m[4] * s1;
	                mm[8] = m[8] * s2;
	                mm[1] = m[1] * s0;
	                mm[5] = m[5] * s1;
	                mm[9] = m[9] * s2;
	                mm[2] = m[2] * s0;
	                mm[6] = m[6] * s1;
	                mm[10] = m[10] * s2;
	            }
	            else {
	                mm[0] = m[0];
	                mm[1] = m[1];
	                mm[2] = m[2];
	                mm[4] = m[4];
	                mm[5] = m[5];
	                mm[6] = m[6];
	                mm[8] = m[8];
	                mm[9] = m[9];
	                mm[10] = m[10];
	            }
	            [mm[12], mm[13], mm[14]] = this._translate;

	            // The last row of mm is always (0,0,0,1) for an affine
	            // transformation, so it is set once in the constructor.  It is not
	            // necessary to reset it here.
	        }

	        this._inverseNeedsUpdate = true;
	    }

	    /**
	     * Invert the 3x3 upper-left block of the input matrix.
	     * @param {Matrix} mat
	     * @param {Matrix} invMat
	     * @private
	     */
	    static invert3x3(mat, invMat) {
	        // Compute the adjoint of M (3x3).
	        invMat[0] = mat[5] * mat[10] - mat[9] * mat[6];
	        invMat[4] = mat[8] * mat[6] - mat[4] * mat[10];
	        invMat[8] = mat[4] * mat[9] - mat[8] * mat[5];
	        invMat[1] = mat[9] * mat[2] - mat[1] * mat[10];
	        invMat[5] = mat[0] * mat[10] - mat[8] * mat[2];
	        invMat[9] = mat[8] * mat[1] - mat[0] * mat[9];
	        invMat[2] = mat[1] * mat[6] - mat[5] * mat[2];
	        invMat[6] = mat[4] * mat[2] - mat[0] * mat[6];
	        invMat[10] = mat[0] * mat[5] - mat[4] * mat[1];

	        // Compute the reciprocal of the determinant of M.
	        let invDet = 1 / (mat[0] * invMat[0] + mat[4] * invMat[1] + mat[8] * invMat[2]);

	        // inverse(M) = adjoint(M)/determinant(M).
	        invMat[0] = invMat[0] * invDet;
	        invMat[4] = invMat[4] * invDet;
	        invMat[8] = invMat[8] * invDet;
	        invMat[1] = invMat[1] * invDet;
	        invMat[5] = invMat[5] * invDet;
	        invMat[9] = invMat[9] * invDet;
	        invMat[2] = invMat[2] * invDet;
	        invMat[6] = invMat[6] * invDet;
	        invMat[10] = invMat[10] * invDet;
	    }

	    static get IDENTITY() {
	        return new Transform$1().makeIdentity();
	    }
	}

	class TransformController extends Controller {

	    /**
	     * @param {Transform} localTransform
	     */
	    constructor(localTransform) {
	        super();
	        this.localTransform = Transform$1.IDENTITY;
	        this.localTransform.copy(localTransform);
	    }

	    /**
	     * @param {number} applicationTime - ms
	     */
	    update(applicationTime) {
	        if (super.update(applicationTime)) {
	            this.object.localTransform.copy(this.localTransform);
	            return true;
	        }
	        return false;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.localTransform = inStream.readTransform();
	    }
	}

	class BlendTransformController extends TransformController {

	    /**
	     *  #### Construction
	     *  
	     *  Set 'rsMatrices' to 'true' when theinput controllers manage
	     *  transformations of the form Y = R*S*X + T, where R is a rotation, S is
	     *  a diagonal scale matrix of positive scales, and T is a translation;
	     *  that is, each transform has mIsRSMatrix equal to 'true'.  In this case,
	     *  the rotation and scale blending is either geometric or arithmetic, as
	     *  specified in the other constructor inputs.  Translation blending is
	     *  always arithmetic.  Let {R0,S0,T0} and {R1,S1,T1} be the transformation
	     *  channels, and let weight w be in [0,1].  Let {R,S,T} be the blended
	     *  result.  Let q0, q1, and q be quaternions corresponding to R0, R1, and
	     *  R with Dot(q0,q1) >= 0 and A = angle(q0,q1) = acos(Dot(q0,q1)).
	     *  
	     *  Translation:  `T = (1-w)*T0 + w*T1`
	     *  
	     *  Arithmetic rotation:  `q = Normalize((1-w)*q0 + w*q1)`  
	     *  Geometric rotation:
	     *  q = `Slerp(w, q0, q1)`
	     *    = `(sin((1-w)*A)*q0 + sin(w*A)*q1)/sin(A)`
	     *
	     * Arithmetic scale:  s = `(1-w)*s0 + w*s1` for each channel s0, s1, s  
	     * Geometric scale:  s = `sign(s0)*sign(s1)*pow(|s0|,1-w)*pow(|s1|,w)`  
	     * If either of s0 or s1 is zero, then s is zero.
	     *
	     * Set 'rsMatrices' to 'false' when mIsRMatrix is 'false' for either
	     * transformation.  In this case, a weighted average of the full
	     * transforms is computed.  This is not recommended, because the visual
	     * results are difficult to predict.
	     * @param {TransformController} controller0
	     * @param {TransformController} controller1
	     * @param {boolean} rsMatrices
	     * @param {boolean} geometricRotation
	     * @param {boolean} geometricScale
	     */
	    constructor(controller0, controller1, rsMatrices, geometricRotation = false, geometricScale = false) {
	        super(Transform.IDENTITY);

	        this.controller0 = controller0;
	        this.controller1 = controller1;

	        this.weight = 0.0;
	        this.rsMatrices = rsMatrices;
	        this.geometricRotation = geometricRotation;
	        this.geometricScale = geometricScale;
	    }

	    /**
	     * @param {ControlledObject} obj
	     */
	    setObject(obj) {
	        this.object = obj;
	        this.controller0.object = obj;
	        this.controller1.object = obj;
	    }

	    /**
	     * 动画更新
	     * @param {number} applicationTime  毫秒
	     */
	    update(applicationTime) {
	        if (!super.update(applicationTime)) {
	            return false;
	        }

	        this.controller0.update(applicationTime);
	        this.controller1.update(applicationTime);

	        let weight = this.weight;
	        let oneMinusWeight = 1 - weight;
	        const xfrm0 = this.controller0.localTransform;
	        const xfrm1 = this.controller1.localTransform;

	        // Arithmetic blend of translations.
	        const trn0 = xfrm0.getTranslate();
	        const trn1 = xfrm1.getTranslate();

	        this.localTransform.setTranslate(trn0.scalar(oneMinusWeight).add(trn1.scalar(weight)));

	        if (this.rsMatrices) {
	            const rot0 = xfrm0.getRotate();
	            const rot1 = xfrm1.getRotate();

	            let quat0 = Quaternion$1.fromRotateMatrix(rot0);
	            let quat1 = Quaternion$1.fromRotateMatrix(rot1);
	            if (quat0.dot(quat1) < 0) {
	                quat1.copy(quat1.negative());
	            }

	            let sca0 = xfrm0.getScale();
	            let sca1 = xfrm1.getScale();
	            let blendQuat = Quaternion$1.ZERO.clone();

	            if (this.geometricRotation) {
	                blendQuat.slerp(weight, quat0, quat1);
	            }
	            else {
	                blendQuat = quat0.scalar(oneMinusWeight).add(quat1.scalar(weight));
	                blendQuat.normalize();
	            }
	            this.localTransform.setRotate(blendQuat.toRotateMatrix());

	            let pow = Math.pow;
	            let sign = Math.sign;
	            let abs = Math.abs;
	            let blendSca;

	            if (this.geometricScale) {
	                let s0, s1;
	                blendSca = Point.ORIGIN;
	                for (let i = 0; i < 3; ++i) {
	                    s0 = sca0[i];
	                    s1 = sca1[i];
	                    if (s0 !== 0 && s1 !== 0) {
	                        let sign0 = sign(s0);
	                        let sign1 = sign(s1);
	                        let pow0 = pow(abs(s0), oneMinusWeight);
	                        let pow1 = pow(abs(s1), weight);
	                        blendSca[i] = sign0 * sign1 * pow0 * pow1;
	                    }
	                    // else
	                    // {
	                    //    blendSca[i] = 0;
	                    // }
	                }
	            }
	            else {
	                blendSca = sca0.scalar(oneMinusWeight).add(sca1.scalar(weight));
	            }
	            this.localTransform.setScale(blendSca);
	        }
	        else {
	            let m0 = xfrm0.getMatrix();
	            let m1 = xfrm1.getMatrix();
	            let blendMat = m0.scalar(oneMinusWeight).add(m1.scalar(weight));

	            this.localTransform.setMatrix(blendMat);
	        }
	        this.object.localTransform.copy(this.localTransform);
	        return true;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.controller0 = inStream.readPointer();
	        this.controller1 = inStream.readPointer();
	        this.weight = inStream.readFloat32();
	        this.rsMatrices = inStream.readBool();
	        this.geometricRotation = inStream.readBool();
	        this.geometricScale = inStream.readBool();
	    }
	    link(inStream) {
	        super.link(inStream);
	        this.controller0 = inStream.resolveLink(this.controller0);
	        this.controller1 = inStream.resolveLink(this.controller1);
	    }
	}

	D3Object.Register('BlendTransformController', BlendTransformController.factory);

	/**
	 * Abstract base class
	 */
	class ControlledObject extends D3Object {
	    /** @protected */
	    constructor() {
	        super();
	        this.numControllers = 0;
	        this.controllers = [];
	    }

	    /**
	     * @param {number} i
	     * @returns {Controller|null}
	     */
	    getController(i) {
	        return this.controllers[i] || null;
	    }

	    /**
	     * @param {Controller} controller
	     */
	    attachController(controller) {
	        // By design, controllers may not be controlled.  This avoids arbitrarily
	        // complex graphs of controllers.  TODO:  Consider allowing this?
	        if (!(controller instanceof Controller)) {
	            console.assert(false, 'Controllers may not be controlled');
	            return;
	        }

	        // Test whether the controller is already in the array.
	        let i, l = this.numControllers;
	        for (i = 0; i < l; ++i) {
	            if (controller === this.controllers[i]) {
	                return;
	            }
	        }

	        // Bind the controller to the object.
	        controller.object = this;

	        this.controllers[(this.numControllers)++] = controller;
	    }

	    /**
	     * @param {Controller} controller
	     */
	    detachController(controller) {
	        let l = this.numControllersl;
	        for (let i = 0; i < l; ++i) {
	            if (controller === this.controllers[i]) {
	                // Unbind the controller from the object.
	                controller.object = null;

	                // Remove the controller from the array, keeping the array
	                // compact.
	                for (let j = i + 1; j < l; ++j, ++i) {
	                    this.controllers[i] = this.controllers[j];
	                }
	                this.controllers[--(this.numControllers)] = null;
	                return;
	            }
	        }
	    }

	    detachAllControllers() {
	        let i, l = this.numControllers;
	        for (i = 0; i < l; ++i) {
	            // Unbind the controller from the object.
	            this.controllers[i].object = null;
	            this.controllers[i] = null;
	        }
	        this.numControllers = 0;
	    }

	    /**
	     * @param {number} applicationTime
	     */
	    updateControllers(applicationTime) {
	        let someoneUpdated = false, l = this.numControllers;
	        for (let i = 0; i < l; ++i) {
	            if (this.controllers[i].update(applicationTime)) {
	                someoneUpdated = true;
	            }
	        }
	        return someoneUpdated;
	    }

	    /**
	     * @param {InStream} inStream
	     */
	    load(inStream) {
	        super.load(inStream);
	        let r = inStream.readPointerArray();
	        if (r !== false) {
	            this.numControllers = r.length;
	            this.controllers = r.slice();
	        }
	        this.capacity = this.numControllers;
	    }

	    /**
	     * @param {InStream} inStream
	     */
	    link(inStream) {
	        super.link(inStream);
	        this.controllers = inStream.resolveArrayLink(this.numControllers, this.controllers);
	    }
	}

	/**
	 * IKController assumes responsibility for 
	 * the input arrays and will delete them.  They should be dynamically allocated.
	 */
	class IKController extends Controller {

		/**
		 * 
		 * @param {number} numJoints 
		 * @param {Array<IKJoint>} joints 
		 * @param {number} numGoals 
		 * @param {Array<IKGoal>} goals 
		 */
		constructor(numJoints, joints, numGoals, goals) {
			this.iterations = 128;
			this.orderEndToRoot = true;
			this.numJoints = numJoints;
			this.joints = joints;
			this.numGoals = numGoals;
			this.goals = goals;
		}
		
		/**
		 * @param {number} applicationTime - ms
		 */
		update(applicationTime) {
			if (!super.update(applicationTime)) {
				return false;
			}

			// Make sure effectors are all current in world space.  It is assumed
			// that the joints form a chain, so the world transforms of joint I
			// are the parent transforms for the joint I+1.
			let k, numJoints = this.numJoints;
			for (k = 0; k < numJoints; ++k) {
				this.joints[k].updateWorldSRT();
			}

			// Update joints one-at-a-time to meet goals.  As each joint is updated,
			// the nodes occurring in the chain after that joint must be made current
			// in world space.
			let iter, i, j;
			let joint, joints = this.joints;
			if (this.orderEndToRoot) {
				for (iter = 0; iter < this.iterations; ++iter) {
					for (k = 0; k < numJoints; ++k) {
						let r = numJoints - 1 - k;
						joint = joints[r];

						for (i = 0; i < 3; ++i) {
							if (joint.allowTranslation[i]) {
								if (joint.updateLocalT(i)) {
									for (j = r; j < numJoints; ++j) {
										joints[j].updateWorldRT();
									}
								}
							}
						}

						for (i = 0; i < 3; ++i) {
							if (joint.allowRotation[i]) {
								if (joint.updateLocalR(i)) {
									for (j = r; j < numJoints; ++j) {
										joints[j].updateWorldRT();
									}
								}
							}
						}
					}
				}
			}
			else  // order root to end
			{
				for (iter = 0; iter < this.iterations; ++iter) {
					for (k = 0; k < numJoints; ++k) {
						joint = joints[k];

						for (i = 0; i < 3; ++i) {
							if (joint.allowTranslation[i]) {
								if (joint.updateLocalT(i)) {
									for (j = k; j < numJoints; ++j) {
										joints[j].updateWorldRT();
									}
								}
							}
						}

						for (i = 0; i < 3; ++i) {
							if (joint.allowRotation[i]) {
								if (joint.updateLocalR(i)) {
									for (j = k; j < numJoints; ++j) {
										joints[j].updateWorldRT();
									}
								}
							}
						}
					}
				}
			}

			return true;
		}
	}

	D3Object.Register(IKController.name, IKController.factory.bind(IKController));

	class IKGoal extends D3Object {

		/**
		 * @param {Spatial} target 
		 * @param {Spatial} effector 
		 * @param {number} weight 
		 */
		constructor(target, effector, weight = 1) {
			super();
			this.target = target;
			this.effector = effector;
			this.weight = weight;
		}
		/**
		 * @return {Point}
		 */
		getTargetPosition() {
			return this.target.worldTransform.getTranslate();
		}
		/**
		 * @return {Point}
		 */
		getEffectorPosition() {
			return this.effector.worldTransform.getTranslate();
		}
	}

	class IKJoint extends D3Object {

		/**
		 * @param {Spatial} object 
		 * @param {number} numGoals 
		 * @param {IKGoal} goals
		 */
		constructor(object, numGoals, goals) {
			super();
			this.object = object;
			this.numGoals = numGoals;
			this.goals = goals;
			// Index i is for the joint's parent's world axis[i].
			for (let i = 0; i < 3; ++i) {
				this.allowTranslation.push(false);
				this.minTranslation.push(-_Math.MAX_REAL);
				this.maxTranslation.push(_Math.MAX_REAL);
				this.allowRotation.push(false);
				this.minRotation.push(-Math.PI);
				this.maxRotation.push(Math.PI);
			}
		}
		/**
		 * @param {number} i 
		 * @return {Vector}
		 */
		getAxis(i) {
			const parent = this.object.parent;
			if (parent) {
				let axis = new Vector$1;
				parent.worldTransform.getRotate().getColumn(i, axis);
				return axis;
			}
			switch (i) {
				case 0: return Vector$1.UNIT_X;
				case 1: return Vector$1.UNIT_Y;
			}
			return Vector$1.UNIT_Z;
		}
		updateWorldSRT() {
			const parent = this.object.parent;
			if (parent) {
				this.object.worldTransform = parent.worldTransform.mul(this.object.localTransform);
			}
			else {
				this.object.worldTransform = this.object.localTransform;
			}
		}
		updateWorldRT() {
			const parent = this.objec.parent;
			if (parent) {
				let rot = parent.worldTransform.getRotate().mul(this.object.localTransform.GetRotate());
				this.object.worldTransform.setRotate(rot);
				let trn = parent.worldTransform.mulPoint(this.object.localTransform.getTranslate());
				this.object.worldTransform.setTranslate(trn);
			}
			else {
				this.object.worldTransform.setRotate(this.object.localTransform.getRotate());
				this.object.worldTransform.setTranslate(this.object.localTransform.getTranslate());
			}
		}
		/**
		 * @param {number} i 
		 */
		bupdateLocalT(i) {
			let U = this.getAxis(i);
			let numer = 0;
			let denom = 0;
			let oldNorm = 0;
			let goal, g;
			for (g = 0; g < this.numGoals; ++g) {
				goal = this.goals[g];
				let GmE = goal.getTargetPosition().subAsVector(goal.getEffectorPosition());
				oldNorm += GmE.squaredLength();
				numer += goal.weight * U.dot(GmE);
				denom += goal.weight;
			}

			if (_Math.abs(denom) <= _Math.ZERO_TOLERANCE) {
				// weights were too small, no translation.
				return false;
			}

			// Desired distance to translate along axis(i).
			let t = numer / denom;

			// Clamp to range.
			let trn = this.object.localTransform.getTranslate();
			let desired = trn[i] + t;
			if (desired > this.minTranslation[i]) {
				if (desired < this.maxTranslation[i]) {
					trn[i] = desired;
				}
				else {
					t = this.maxTranslation[i] - trn[i];
					trn[i] = this.maxTranslation[i];
				}
			}
			else {
				t = this.minTranslation[i] - trn[i];
				trn[i] = this.minTranslation[i];
			}

			// Test whether step should be taken.
			let newNorm = 0;
			let step = U.scalar(t);
			for (g = 0; g < this.numGoals; ++g) {
				goal = this.goals[g];
				let newE = goal.getEffectorPosition().add(step);
				let diff = goal.getTargetPosition().subAsVector(newE);
				newNorm += diff.squaredLength();
			}
			if (newNorm >= oldNorm) {
				// Translation does not get effector closer to goal.
				return false;
			}

			// Update the local translation.
			this.object.localTransform.setTranslate(trn);
			return true;
		}
		/**
		 * @param {number} i 
		 */
		updateLocalR(i) {
			let U = this.getAxis(i);
			let numer = 0;
			let denom = 0;

			let oldNorm = 0;
			let g, gobal;
			for (g = 0; g < this.numGoals; ++g) {
				goal = this.goals[g];
				let EmP = goal.getEffectorPosition().subAsVector(this.object.worldTransform.getTranslate());
				let GmP = goal.getTargetPosition().subAsVector(this.object.worldTransform.getTranslate());
				let GmE = goal.getTargetPosition().subAsVector(goal.getEffectorPosition());
				oldNorm += GmE.squaredLength();
				let UxEmP = U.cross(EmP);
				let UxUxEmP = U.cross(UxEmP);
				numer += goal.weight * GmP.dot(UxEmP);
				denom -= goal.weight * GmP.dot(UxUxEmP);
			}

			if (numer * numer + denom * denom <= _Math.ZERO_TOLERANCE) {
				// Undefined atan2, no rotation.
				return false;
			}

			// Desired angle to rotate about axis(i).
			let theta = _Math.atan2(numer, denom);

			// Factor local rotation into Euler angles.
			let rotate = this.object.localTransform.getRotate();

			let rot = new Matrix3(
				rotate[0], rotate[1], rotate[2],
				rotate[4], rotate[5], rotate[6],
				rotate[8], rotate[9], rotate[10]
			);

			let euler = VECTOR.ZERO;
			rot.extractEulerZYX(euler);

			// Clamp to range.
			let desired = euler[i] + theta;
			if (desired > MinRotation[i]) {
				if (desired < MaxRotation[i]) {
					euler[i] = desired;
				}
				else {
					theta = MaxRotation[i] - euler[i];
					euler[i] = MaxRotation[i];
				}
			}
			else {
				theta = MinRotation[i] - euler[i];
				euler[i] = MinRotation[i];
			}

			// Test whether step should be taken.
			let newNorm = 0;
			rotate = Matrix$1.makeRotation(U, theta);
			for (g = 0; g < this.numGoals; ++g) {
				goal = this.goals[g];
				let EmP = goal.getEffectorPosition().subAsVector(this.object.worldTransform.getTranslate());
				let newE = this.object.worldTransform.getTranslate().add(rotate.mulPoint(Emp));
				let GmE = goal.getTargetPosition().subAsVector(newE);
				newNorm += GmE.squaredLength();
			}

			if (newNorm >= oldNorm) {
				// Rotation does not get effector closer to goal.
				return false;
			}

			// Update the local rotation.
			rot.makeEulerZYX(euler);

			rotate = new Matrix$1(
				rot[0], rot[1], rot[2], 0,
				rot[3], rot[4], rot[5], 0,
				rot[6], rot[7], rot[8], 0,
				0, 0, 0, 1);

			this.object.localTransform.setRotate(rotate);
			return true;
		}
	}

	/**
	 * construction. If the translations, rotations, and
	 * scales all share the same keyframe times, then numCommonTimes is
	 * set to a positive number.  Each remaining number is numCommonTimes
	 * when the channel exists or zero when it does not.  If the keyframe
	 * times are not shared, then numCommonTimes must be set to zero and
	 * the remaining numbers set to the appropriate values--positive when
	 * the channel exists or zero otherwise.
	 * 
	 * The Transform input initializes the controlled object's local
	 * transform.  The previous behavior of this class was to fill in only
	 * those transformation channels represented by the key frames, which
	 * relied implicitly on the Spatial object to have its other channels
	 * set appropriately by the application.  Now KeyframeController sets
	 * *all* the channels.
	 */
	class KeyframeController extends TransformController {

	    /**
	     * @param {number} numCommonTimes
	     * @param {number} numTranslations
	     * @param {number} numRotations
	     * @param {number} numScales
	     * @param {Transform} localTransform
	     */
	    constructor(numCommonTimes, numTranslations, numRotations, numScales, localTransform) {
	        super(localTransform);
	        if (numCommonTimes > 0) {
	            this.numCommonTimes = numCommonTimes;

	            // This array is used only when times are shared by translations, rotations, and scales.
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
	                this.numScales = 0;
	                this.scaleTimes = null;
	                this.scales = null;
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

	        // Cached indices for the last found pair of keys used for interpolation.
	        // For a sequence of times, this guarantees an O(1) lookup.
	        this.tLastIndex = 0;
	        this.rLastIndex = 0;
	        this.sLastIndex = 0;
	        this.cLastIndex = 0;
	    }

	    /**
	     * @param {number} applicationTime - ms
	     */
	    update(applicationTime) {
	        if (!super.update(applicationTime)) {
	            return false;
	        }

	        let ctrlTime = this.getControlTime(applicationTime);
	        let trn = Point$1.ORIGIN;
	        let rot = Matrix$1.IDENTITY;
	        let scale = 0;
	        let t;

	        // The logic here checks for equal-time arrays to minimize the number of
	        // times GetKeyInfo is called.
	        if (this.numCommonTimes > 0) {
	            t = KeyframeController.getKeyInfo(ctrlTime, this.numCommonTimes, this.commonTimes, this.cLastIndex);
	            this.cLastIndex = t[0];
	            let normTime = t[1], i0 = t[2], i1 = t[3];
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
	                t = KeyframeController.getKeyInfo(ctrlTime, this.numTranslations, this.translationTimes, this.tLastIndex);
	                this.tLastIndex = t[0];
	                trn = this.getTranslate(t[1], t[2], t[3]);
	                this.localTransform.setTranslate(trn);
	            }

	            if (this.numRotations > 0) {
	                t = KeyframeController.getKeyInfo(ctrlTime, this.numRotations, this.rotationTimes, this.rLastIndex);
	                this.rLastIndex = t[0];
	                rot = this.getRotate(t[1], t[2], t[3]);
	                this.localTransform.setRotate(rot);
	            }

	            if (this.numScales > 0) {
	                t = KeyframeController.getKeyInfo(ctrlTime, this.numScales, this.scaleTimes, this.sLastIndex);
	                this.sLastIndex = t[0];
	                scale = this.getScale(t[1], t[2], t[3]);
	                this.localTransform.setUniformScale(scale);
	            }
	        }

	        this.object.localTransform.copy(this.localTransform);
	        return true;
	    }

	    // Support for looking up keyframes given the specified time.

	    /**
	     * @param {number} ctrlTime 
	     * @param {number} numTimes 
	     * @param {Array<number>} times 
	     * @param {number} lIndex
	     * @protected
	     */
	    static getKeyInfo(ctrlTime, numTimes, times, lIndex) {
	        if (ctrlTime <= times[0]) {
	            return [0, 0, 0, 0];
	        }

	        if (ctrlTime >= times[numTimes - 1]) {
	            let l = numTimes - 1;
	            return [0, l, l, l];
	        }

	        let nextIndex;
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
	    }

	    /**
	     * @param {number} normTime
	     * @param {number} i0
	     * @param {number} i1
	     * @returns {Point}
	     * @protected
	     */
	    getTranslate(normTime, i0, i1) {
	        const t0 = this.translations[i0];
	        const t1 = this.translations[i1];
	        return t0.add(t1.sub(t0).scalar(normTime));  // t0 + (t1 - t0) * normalTime
	    }

	    /**
	     *
	     * @param {number} normTime
	     * @param {number} i0
	     * @param {number} i1
	     * @returns {Matrix}
	     * @protected
	     */
	    getRotate(normTime, i0, i1) {
	        let q = new Quaternion$1();
	        q.slerp(normTime, this.rotations[i0], this.rotations[i1]);
	        return q.toRotateMatrix();
	    }

	    /**
	     * @param {number} normTime
	     * @param {number} i0
	     * @param {number} i1
	     * @returns {number}
	     * @protected
	     */
	    getScale(normTime, i0, i1) {
	        return this.scales[i0] + normTime * (this.scales[i1] - this.scales[i0]);
	    }

	    load(inStream) {

	        super.load(inStream);
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
	    }

	    static factory(inStream) {
	        let obj = new KeyframeController(0, 0, 0, 0, 0);
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('KeyframeController', KeyframeController.factory);

	/**
	 * Buffer - 缓冲基础类
	 * @abstract
	 */
	class Buffer extends D3Object {
	    /**
	     * @param {number} numElements - 元素数量
	     * @param {number} elementSize - 一个元素的尺寸，单位比特
	     * @param {number} usage - 缓冲用途， 参照Buffer.BU_XXX
	     */
	    constructor(numElements, elementSize, usage) {
	        super();
	        this.numElements = numElements;
	        this.elementSize = elementSize;
	        this.usage = usage;
	        this.numBytes = numElements * elementSize;
	        if (this.numBytes > 0) {
	            this._data = new Uint8Array(this.numBytes);
	        }
	    }
	    /**
	     * @returns {(Uint8Array|null)}
	     */
	    getData() {
	        return this._data;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.numElements = inStream.readUint32();
	        this.elementSize = inStream.readUint32();
	        this.usage = inStream.readEnum();
	        this._data = new Uint8Array(inStream.readBinary(this.numBytes));
	        this.numBytes = this._data.length;
	    }
	}

	DECLARE_ENUM(Buffer, {
	    BU_STATIC: 0,
	    BU_DYNAMIC: 1,
	    BU_RENDER_TARGET: 2,
	    BU_DEPTH_STENCIL: 3
	});

	class IndexBuffer$1 extends Buffer {

	    /**
	     * @param {number} numElements
	     * @param {number} elementSize
	     * @param {number} usage - 缓冲用途， 参照Buffer.BU_XXX
	     */
	    constructor(numElements = 0, elementSize = 0, usage = Buffer.BU_STATIC) {
	        super(numElements, elementSize, usage);
	        this.offset = 0;
	    }

	    /**
	     * @param {InStream} inStream
	     */
	    load(inStream) {
	        super.load(inStream);
	        this.offset = inStream.readUint32();
	    }
	}
	D3Object.Register('IndexBuffer', IndexBuffer$1.factory);

	class VertexBuffer extends Buffer {

	    /**
	     * @param numElements
	     * @param elementSize
	     * @param usage {number} 缓冲用途， 参照Buffer.BU_XXX
	     */
	    constructor(numElements, elementSize, usage = Buffer.BU_STATIC) {
	        super(numElements, elementSize, usage);
	    }

	    static factory(inStream) {
	        var obj = new VertexBuffer(0, 0);
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('VertexBuffer', VertexBuffer.factory);

	class Texture extends D3Object {

	    /**
	     * @param {number} format 纹理格式， 参考Texture.TF_XXX
	     * @param {number} type 纹理类型, 参考Texture.TT_XXX
	     */
	    constructor(format, type) {
	        super();
	        this.format = format;                          // 纹理元素格式
	        this.type = type;                              // 纹理类型， 例如 2d, 3d...
	        this.hasMipmaps = false;                       // 是否生成MipMaps
	        this.numDimensions = Texture.DIMENSIONS[type]; // 纹理拥有的维度
	        this.numTotalBytes = 0;
	        this.width = 0;
	        this.height = 0;
	        this.depth = 0;
	        this.data = null;
	        this.static = true;
	    }

	    /**
	     * 判断是否是压缩格式
	     * @returns {boolean}
	     */
	    isCompressed() {
	        return this.format === Texture.TF_DXT1 || this.format === Texture.TF_DXT3 || this.format === Texture.TF_DXT5;
	    }

	    /**
	     * 判断是否可以生成MipMaps纹理
	     * @returns {boolean}
	     */
	    isMipMapsAble() {
	        return Texture.MIPMAPABLE[this.format];
	    }

	    /**
	     * 在系统内存中管理纹理的一个拷贝
	     *
	     * 字节数通过getNumTotalBytes查询
	     * 获取到的数据不能修改，因为渲染器并不会知道
	     * @returns {Uint8Array}
	     * @abstract
	     */
	    getData() {
	    }

	    /**
	     * 获取数据流大小
	     * @returns {number}
	     */
	    getFileSize() {
	        let size = 0;
	        size += 1;                // format
	        size += 1;                // type
	        size += 1;                // hasMipmaps
	        size += 1;                // numDimension
	        size += 2 * 3;            // width, height, depth
	        size += 4;                // numTotalBytes
	        size += this.numTotalBytes;
	        return size;
	    }

	    /**
	     *
	     * @param {ArrayBuffer} buffer
	     * @param {Texture} texture
	     */
	    static unpackTo(buffer, texture) {

	        let io = new BinDataView(buffer);
	        let format = io.int8();
	        let type = io.int8();
	        let hasMipMaps = (io.int8() == 1);
	        let numDimensions = io.int8();
	        let width = io.int16();
	        let height = io.int16();
	        let depth = io.int16();
	        let numTotalBytes = io.int32();
	        if (type !== texture.type) {
	            return new Error('Invalid type for ' + texture.name);
	        }

	        texture.format = format;
	        texture.hasMipmaps = hasMipMaps;
	        texture.numDimensions = numDimensions;
	        texture.depth = depth;

	        switch (type) {
	            case Texture.TT_2D:
	                texture.width = width;
	                texture.height = height;
	                break;
	            case Texture.TT_CUBE:
	                texture.width = width;
	                break;
	        }
	        texture.enableMipMaps = hasMipMaps;
	        texture._update();
	        texture.data.set(io.bytes(numTotalBytes));
	        io = null;
	        return null;
	    }

	    /**
	     * 将纹理对象处理成文件形式
	     * @param {Texture} texture
	     * @returns {ArrayBuffer}
	     */
	    static pack(texture) {
	        let size = texture.getFileSize();
	        let buffer = new ArrayBuffer(size);
	        let io = new BinDataView(buffer);

	        io.setInt8(texture.format);
	        io.setInt8(texture.type);
	        io.setInt8(texture.hasMipmaps ? 1 : 0);
	        io.setInt8(texture.numDimensions);
	        io.setInt16(texture.width);
	        io.setInt16(texture.height);
	        io.setInt16(texture.depth);
	        io.setInt32(texture.numTotalBytes);
	        io.setBytes(texture.getData());
	        return buffer;
	    }
	}

	// 纹理格式定义
	DECLARE_ENUM(Texture, {
	    TF_NONE: 0,
	    TF_R5G6B5: 1,
	    TF_A1R5G5B5: 2,
	    TF_A4R4G4B4: 3,
	    TF_A8: 4,
	    TF_L8: 5,
	    TF_A8L8: 6,
	    TF_R8G8B8: 7,
	    TF_A8R8G8B8: 8,
	    TF_A8B8G8R8: 9,
	    TF_L16: 10,
	    TF_G16R16: 11,
	    TF_A16B16G16R16: 12,
	    TF_R16F: 13,  // not support
	    TF_G16R16F: 14,  // not support
	    TF_A16B16G16R16F: 15,  // not support
	    TF_R32F: 16,
	    TF_G32R32F: 17,
	    TF_A32B32G32R32F: 18,
	    TF_DXT1: 19,
	    TF_DXT3: 20,
	    TF_DXT5: 21,
	    TF_D24S8: 22,
	    TF_QUANTITY: 23
	}, false);

	// 每种格式纹理是否支持生成MipMaps
	DECLARE_ENUM(Texture, {
	    TT_2D: 1,
	    TT_CUBE: 3,
	    MIPMAPABLE: [
	        false,  // Texture.TF_NONE
	        true,   // Texture.TF_R5G6B5
	        true,   // Texture.TF_A1R5G5B5
	        true,   // Texture.TF_A4R4G4B4
	        true,   // Texture.TF_A8
	        true,   // Texture.TF_L8
	        true,   // Texture.TF_A8L8
	        true,   // Texture.TF_R8G8B8
	        true,   // Texture.TF_A8R8G8B8
	        true,   // Texture.TF_A8B8G8R8
	        true,   // Texture.TF_L16
	        true,   // Texture.TF_G16R16
	        true,   // Texture.TF_A16B16G16R16
	        false,   // Texture.TF_R16F
	        false,   // Texture.TF_G16R16F
	        false,   // Texture.TF_A16B16G16R16F
	        false,  // Texture.TF_R32F
	        false,  // Texture.TF_G32R32F
	        false,  // Texture.TF_A32B32G32R32F,
	        true,   // Texture.TF_DXT1 (special handling)
	        true,   // Texture.TF_DXT3 (special handling)
	        true,   // Texture.TF_DXT5 (special handling)
	        false   // Texture.TF_D24S8
	    ],

	    /////////////////////////    纹理类型维度    //////////////////////////////////
	    DIMENSIONS: [
	        2,  // TT_2D
	        2  // TT_CUBE
	    ]
	}, false);

	// 每种像素格式单个像素占用的尺寸单位，字节
	DECLARE_ENUM(Texture, {
	    PIXEL_SIZE: [
	        0,              // Texture.TF_NONE
	        2,              // Texture.TF_R5G6B5
	        2,              // Texture.TF_A1R5G5B5
	        2,              // Texture.TF_A4R4G4B4
	        1,              // Texture.TF_A8
	        1,              // Texture.TF_L8
	        2,              // Texture.TF_A8L8
	        3,              // Texture.TF_R8G8B8
	        4,              // Texture.TF_A8R8G8B8
	        4,              // Texture.TF_A8B8G8R8
	        2,              // Texture.TF_L16
	        4,              // Texture.TF_G16R16
	        8,              // Texture.TF_A16B16G16R16
	        2,              // Texture.TF_R16F
	        4,              // Texture.TF_G16R16F
	        8,              // Texture.TF_A16B16G16R16F
	        4,              // Texture.TF_R32F
	        8,              // Texture.TF_G32R32F
	        16,             // Texture.TF_A32B32G32R32F,
	        0,              // Texture.TF_DXT1 (special handling)
	        0,              // Texture.TF_DXT3 (special handling)
	        0,              // Texture.TF_DXT5 (special handling)
	        4               // Texture.TF_D24S8
	    ]
	});

	let mapping = {};

	/* ClearBufferMask */
	mapping.DEPTH_BUFFER_BIT = 0x00000100;
	mapping.STENCIL_BUFFER_BIT = 0x00000400;
	mapping.COLOR_BUFFER_BIT = 0x00004000;

	/* BeginMode */
	mapping.POINTS = 0x0000;
	mapping.LINES = 0x0001;
	mapping.LINE_LOOP = 0x0002;
	mapping.LINE_STRIP = 0x0003;
	mapping.TRIANGLES = 0x0004;
	mapping.TRIANGLE_STRIP = 0x0005;
	mapping.TRIANGLE_FAN = 0x0006;

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
	mapping.ZERO = 0;
	mapping.ONE = 1;
	mapping.SRC_COLOR = 0x0300;
	mapping.ONE_MINUS_SRC_COLOR = 0x0301;
	mapping.SRC_ALPHA = 0x0302;
	mapping.ONE_MINUS_SRC_ALPHA = 0x0303;
	mapping.DST_ALPHA = 0x0304;
	mapping.ONE_MINUS_DST_ALPHA = 0x0305;

	/* BlendingFactorSrc */
	/*      ZERO */
	/*      ONE */
	mapping.DST_COLOR = 0x0306;
	mapping.ONE_MINUS_DST_COLOR = 0x0307;
	mapping.SRC_ALPHA_SATURATE = 0x0308;
	/*      SRC_ALPHA */
	/*      ONE_MINUS_SRC_ALPHA */
	/*      DST_ALPHA */
	/*      ONE_MINUS_DST_ALPHA */

	/* BlendEquationSeparate */
	mapping.FUNC_ADD = 0x8006;
	mapping.BLEND_EQUATION = 0x8009;
	mapping.BLEND_EQUATION_RGB = 0x8009;
	/* same as BLEND_EQUATION */
	mapping.BLEND_EQUATION_ALPHA = 0x883D;

	/* BlendSubtract */
	mapping.FUNC_SUBTRACT = 0x800A;
	mapping.FUNC_REVERSE_SUBTRACT = 0x800B;

	/* Separate Blend Functions */
	mapping.BLEND_DST_RGB = 0x80C8;
	mapping.BLEND_SRC_RGB = 0x80C9;
	mapping.BLEND_DST_ALPHA = 0x80CA;
	mapping.BLEND_SRC_ALPHA = 0x80CB;
	mapping.CONSTANT_COLOR = 0x8001;
	mapping.ONE_MINUS_CONSTANT_COLOR = 0x8002;
	mapping.CONSTANT_ALPHA = 0x8003;
	mapping.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
	mapping.BLEND_COLOR = 0x8005;

	/* Buffer Objects */
	mapping.ARRAY_BUFFER = 0x8892;
	mapping.ELEMENT_ARRAY_BUFFER = 0x8893;
	mapping.ARRAY_BUFFER_BINDING = 0x8894;
	mapping.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

	mapping.STREAM_DRAW = 0x88E0;
	mapping.STATIC_DRAW = 0x88E4;
	mapping.DYNAMIC_DRAW = 0x88E8;

	mapping.BUFFER_SIZE = 0x8764;
	mapping.BUFFER_USAGE = 0x8765;

	mapping.CURRENT_VERTEX_ATTRIB = 0x8626;

	/* CullFaceMode */
	mapping.FRONT = 0x0404;
	mapping.BACK = 0x0405;
	mapping.FRONT_AND_BACK = 0x0408;

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
	mapping.CULL_FACE = 0x0B44;
	mapping.BLEND = 0x0BE2;
	mapping.DITHER = 0x0BD0;
	mapping.STENCIL_TEST = 0x0B90;
	mapping.DEPTH_TEST = 0x0B71;
	mapping.SCISSOR_TEST = 0x0C11;
	mapping.POLYGON_OFFSET_FILL = 0x8037;
	mapping.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
	mapping.SAMPLE_COVERAGE = 0x80A0;

	/* ErrorCode */
	mapping.NO_ERROR = 0;
	mapping.INVALID_ENUM = 0x0500;
	mapping.INVALID_VALUE = 0x0501;
	mapping.INVALID_OPERATION = 0x0502;
	mapping.OUT_OF_MEMORY = 0x0505;

	/* FrontFaceDirection */
	mapping.CW = 0x0900;
	mapping.CCW = 0x0901;

	/* GetPName */
	mapping.LINE_WIDTH = 0x0B21;
	mapping.ALIASED_POINT_SIZE_RANGE = 0x846D;
	mapping.ALIASED_LINE_WIDTH_RANGE = 0x846E;
	mapping.CULL_FACE_MODE = 0x0B45;
	mapping.FRONT_FACE = 0x0B46;
	mapping.DEPTH_RANGE = 0x0B70;
	mapping.DEPTH_WRITEMASK = 0x0B72;
	mapping.DEPTH_CLEAR_VALUE = 0x0B73;
	mapping.DEPTH_FUNC = 0x0B74;
	mapping.STENCIL_CLEAR_VALUE = 0x0B91;
	mapping.STENCIL_FUNC = 0x0B92;
	mapping.STENCIL_FAIL = 0x0B94;
	mapping.STENCIL_PASS_DEPTH_FAIL = 0x0B95;
	mapping.STENCIL_PASS_DEPTH_PASS = 0x0B96;
	mapping.STENCIL_REF = 0x0B97;
	mapping.STENCIL_VALUE_MASK = 0x0B93;
	mapping.STENCIL_WRITEMASK = 0x0B98;
	mapping.STENCIL_BACK_FUNC = 0x8800;
	mapping.STENCIL_BACK_FAIL = 0x8801;
	mapping.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
	mapping.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
	mapping.STENCIL_BACK_REF = 0x8CA3;
	mapping.STENCIL_BACK_VALUE_MASK = 0x8CA4;
	mapping.STENCIL_BACK_WRITEMASK = 0x8CA5;
	mapping.VIEWPORT = 0x0BA2;
	mapping.SCISSOR_BOX = 0x0C10;
	/*      SCISSOR_TEST */
	mapping.COLOR_CLEAR_VALUE = 0x0C22;
	mapping.COLOR_WRITEMASK = 0x0C23;
	mapping.UNPACK_ALIGNMENT = 0x0CF5;
	mapping.PACK_ALIGNMENT = 0x0D05;
	mapping.MAX_TEXTURE_SIZE = 0x0D33;
	mapping.MAX_VIEWPORT_DIMS = 0x0D3A;
	mapping.SUBPIXEL_BITS = 0x0D50;
	mapping.RED_BITS = 0x0D52;
	mapping.GREEN_BITS = 0x0D53;
	mapping.BLUE_BITS = 0x0D54;
	mapping.ALPHA_BITS = 0x0D55;
	mapping.DEPTH_BITS = 0x0D56;
	mapping.STENCIL_BITS = 0x0D57;
	mapping.POLYGON_OFFSET_UNITS = 0x2A00;
	/*      POLYGON_OFFSET_FILL */
	mapping.POLYGON_OFFSET_FACTOR = 0x8038;
	mapping.TEXTURE_BINDING_2D = 0x8069;
	mapping.SAMPLE_BUFFERS = 0x80A8;
	mapping.SAMPLES = 0x80A9;
	mapping.SAMPLE_COVERAGE_VALUE = 0x80AA;
	mapping.SAMPLE_COVERAGE_INVERT = 0x80AB;

	/* GetTextureParameter */
	/*      TEXTURE_MAG_FILTER */
	/*      TEXTURE_MIN_FILTER */
	/*      TEXTURE_WRAP_S */
	/*      TEXTURE_WRAP_T */

	mapping.COMPRESSED_TEXTURE_FORMATS = 0x86A3;

	/* HintMode */
	mapping.DONT_CARE = 0x1100;
	mapping.FASTEST = 0x1101;
	mapping.NICEST = 0x1102;

	/* HintTarget */
	mapping.GENERATE_MIPMAP_HINT = 0x8192;

	/* DataType */
	mapping.BYTE = 0x1400;
	mapping.UNSIGNED_BYTE = 0x1401;
	mapping.SHORT = 0x1402;
	mapping.UNSIGNED_SHORT = 0x1403;
	mapping.INT = 0x1404;
	mapping.UNSIGNED_INT = 0x1405;
	mapping.FLOAT = 0x1406;

	/* PixelFormat */
	mapping.DEPTH_COMPONENT = 0x1902;
	mapping.ALPHA = 0x1906;
	mapping.RGB = 0x1907;
	mapping.RGBA = 0x1908;
	mapping.LUMINANCE = 0x1909;
	mapping.LUMINANCE_ALPHA = 0x190A;

	/* PixelType */
	/*      UNSIGNED_BYTE */
	mapping.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
	mapping.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
	mapping.UNSIGNED_SHORT_5_6_5 = 0x8363;

	/* Shaders */
	mapping.FRAGMENT_SHADER = 0x8B30;
	mapping.VERTEX_SHADER = 0x8B31;
	mapping.MAX_VERTEX_ATTRIBS = 0x8869;
	mapping.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
	mapping.MAX_VARYING_VECTORS = 0x8DFC;
	mapping.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
	mapping.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
	mapping.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
	mapping.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
	mapping.SHADER_TYPE = 0x8B4F;
	mapping.DELETE_STATUS = 0x8B80;
	mapping.LINK_STATUS = 0x8B82;
	mapping.VALIDATE_STATUS = 0x8B83;
	mapping.ATTACHED_SHADERS = 0x8B85;
	mapping.ACTIVE_UNIFORMS = 0x8B86;
	mapping.ACTIVE_ATTRIBUTES = 0x8B89;
	mapping.SHADING_LANGUAGE_VERSION = 0x8B8C;
	mapping.CURRENT_PROGRAM = 0x8B8D;

	/* StencilFunction */
	mapping.NEVER = 0x0200;
	mapping.LESS = 0x0201;
	mapping.EQUAL = 0x0202;
	mapping.LEQUAL = 0x0203;
	mapping.GREATER = 0x0204;
	mapping.NOTEQUAL = 0x0205;
	mapping.GEQUAL = 0x0206;
	mapping.ALWAYS = 0x0207;

	/* StencilOp */
	/*      ZERO */
	mapping.KEEP = 0x1E00;
	mapping.REPLACE = 0x1E01;
	mapping.INCR = 0x1E02;
	mapping.DECR = 0x1E03;
	mapping.INVERT = 0x150A;
	mapping.INCR_WRAP = 0x8507;
	mapping.DECR_WRAP = 0x8508;

	/* StringName */
	mapping.VENDOR = 0x1F00;
	mapping.RENDERER = 0x1F01;
	mapping.VERSION = 0x1F02;

	/* TextureMagFilter */
	mapping.NEAREST = 0x2600;
	mapping.LINEAR = 0x2601;

	/* TextureMinFilter */
	/*      NEAREST */
	/*      LINEAR */
	mapping.NEAREST_MIPMAP_NEAREST = 0x2700;
	mapping.LINEAR_MIPMAP_NEAREST = 0x2701;
	mapping.NEAREST_MIPMAP_LINEAR = 0x2702;
	mapping.LINEAR_MIPMAP_LINEAR = 0x2703;

	/* TextureParameterName */
	mapping.TEXTURE_MAG_FILTER = 0x2800;
	mapping.TEXTURE_MIN_FILTER = 0x2801;
	mapping.TEXTURE_WRAP_S = 0x2802;
	mapping.TEXTURE_WRAP_T = 0x2803;

	/* TextureTarget */
	mapping.TEXTURE_2D = 0x0DE1;
	mapping.TEXTURE = 0x1702;
	mapping.TEXTURE_CUBE_MAP = 0x8513;
	mapping.TEXTURE_BINDING_CUBE_MAP = 0x8514;
	mapping.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
	mapping.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
	mapping.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
	mapping.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
	mapping.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
	mapping.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
	mapping.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;

	/* TextureUnit */
	mapping.TEXTURE0 = 0x84C0;
	mapping.TEXTURE1 = 0x84C1;
	mapping.TEXTURE2 = 0x84C2;
	mapping.TEXTURE3 = 0x84C3;
	mapping.TEXTURE4 = 0x84C4;
	mapping.TEXTURE5 = 0x84C5;
	mapping.TEXTURE6 = 0x84C6;
	mapping.TEXTURE7 = 0x84C7;
	mapping.TEXTURE8 = 0x84C8;
	mapping.TEXTURE9 = 0x84C9;
	mapping.TEXTURE10 = 0x84CA;
	mapping.TEXTURE11 = 0x84CB;
	mapping.TEXTURE12 = 0x84CC;
	mapping.TEXTURE13 = 0x84CD;
	mapping.TEXTURE14 = 0x84CE;
	mapping.TEXTURE15 = 0x84CF;
	mapping.TEXTURE16 = 0x84D0;
	mapping.TEXTURE17 = 0x84D1;
	mapping.TEXTURE18 = 0x84D2;
	mapping.TEXTURE19 = 0x84D3;
	mapping.TEXTURE20 = 0x84D4;
	mapping.TEXTURE21 = 0x84D5;
	mapping.TEXTURE22 = 0x84D6;
	mapping.TEXTURE23 = 0x84D7;
	mapping.TEXTURE24 = 0x84D8;
	mapping.TEXTURE25 = 0x84D9;
	mapping.TEXTURE26 = 0x84DA;
	mapping.TEXTURE27 = 0x84DB;
	mapping.TEXTURE28 = 0x84DC;
	mapping.TEXTURE29 = 0x84DD;
	mapping.TEXTURE30 = 0x84DE;
	mapping.TEXTURE31 = 0x84DF;
	mapping.ACTIVE_TEXTURE = 0x84E0;

	/* TextureWrapMode */
	mapping.REPEAT = 0x2901;
	mapping.CLAMP_TO_EDGE = 0x812F;
	mapping.MIRRORED_REPEAT = 0x8370;

	/* Uniform Types */
	mapping.FLOAT_VEC2 = 0x8B50;
	mapping.FLOAT_VEC3 = 0x8B51;
	mapping.FLOAT_VEC4 = 0x8B52;
	mapping.INT_VEC2 = 0x8B53;
	mapping.INT_VEC3 = 0x8B54;
	mapping.INT_VEC4 = 0x8B55;
	mapping.BOOL = 0x8B56;
	mapping.BOOL_VEC2 = 0x8B57;
	mapping.BOOL_VEC3 = 0x8B58;
	mapping.BOOL_VEC4 = 0x8B59;
	mapping.FLOAT_MAT2 = 0x8B5A;
	mapping.FLOAT_MAT3 = 0x8B5B;
	mapping.FLOAT_MAT4 = 0x8B5C;
	mapping.SAMPLER_2D = 0x8B5E;
	mapping.SAMPLER_CUBE = 0x8B60;

	/* Vertex Arrays */
	mapping.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
	mapping.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
	mapping.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
	mapping.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
	mapping.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
	mapping.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
	mapping.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

	/* Read Format */
	mapping.IMPLEMENTATION_COLOR_READ_TYPE = 0x8B9A;
	mapping.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

	/* Shader Source */
	mapping.COMPILE_STATUS = 0x8B81;

	/* Shader Precision-Specified Types */
	mapping.LOW_FLOAT = 0x8DF0;
	mapping.MEDIUM_FLOAT = 0x8DF1;
	mapping.HIGH_FLOAT = 0x8DF2;
	mapping.LOW_INT = 0x8DF3;
	mapping.MEDIUM_INT = 0x8DF4;
	mapping.HIGH_INT = 0x8DF5;

	/* Framebuffer Object. */
	mapping.FRAMEBUFFER = 0x8D40;
	mapping.RENDERBUFFER = 0x8D41;

	mapping.RGBA4 = 0x8056;
	mapping.RGB5_A1 = 0x8057;
	mapping.RGB565 = 0x8D62;
	mapping.DEPTH_COMPONENT16 = 0x81A5;
	mapping.STENCIL_INDEX = 0x1901;
	mapping.STENCIL_INDEX8 = 0x8D48;
	mapping.DEPTH_STENCIL = 0x84F9;

	mapping.RENDERBUFFER_WIDTH = 0x8D42;
	mapping.RENDERBUFFER_HEIGHT = 0x8D43;
	mapping.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
	mapping.RENDERBUFFER_RED_SIZE = 0x8D50;
	mapping.RENDERBUFFER_GREEN_SIZE = 0x8D51;
	mapping.RENDERBUFFER_BLUE_SIZE = 0x8D52;
	mapping.RENDERBUFFER_ALPHA_SIZE = 0x8D53;
	mapping.RENDERBUFFER_DEPTH_SIZE = 0x8D54;
	mapping.RENDERBUFFER_STENCIL_SIZE = 0x8D55;

	mapping.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
	mapping.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
	mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
	mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

	mapping.COLOR_ATTACHMENT0 = 0x8CE0;
	mapping.DEPTH_ATTACHMENT = 0x8D00;
	mapping.STENCIL_ATTACHMENT = 0x8D20;
	mapping.DEPTH_STENCIL_ATTACHMENT = 0x821A;

	mapping.NONE = 0;

	mapping.FRAMEBUFFER_COMPLETE = 0x8CD5;
	mapping.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
	mapping.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
	mapping.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
	mapping.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;
	mapping.FRAMEBUFFER_BINDING = 0x8CA6;
	mapping.RENDERBUFFER_BINDING = 0x8CA7;
	mapping.MAX_RENDERBUFFER_SIZE = 0x84E8;

	mapping.INVALID_FRAMEBUFFER_OPERATION = 0x0506;

	/* WebGL-specific enums */
	mapping.UNPACK_FLIP_Y_WEBGL = 0x9240;
	mapping.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
	mapping.CONTEXT_LOST_WEBGL = 0x9242;
	mapping.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
	mapping.BROWSER_DEFAULT_WEBGL = 0x9244;

	/* webgl2 add */
	mapping.READ_BUFFER = 0x0C02;
	mapping.UNPACK_ROW_LENGTH = 0x0CF2;
	mapping.UNPACK_SKIP_ROWS = 0x0CF3;
	mapping.UNPACK_SKIP_PIXELS = 0x0CF4;
	mapping.PACK_ROW_LENGTH = 0x0D02;
	mapping.PACK_SKIP_ROWS = 0x0D03;
	mapping.PACK_SKIP_PIXELS = 0x0D04;
	mapping.COLOR = 0x1800;
	mapping.DEPTH = 0x1801;
	mapping.STENCIL = 0x1802;
	mapping.RED = 0x1903;
	mapping.RGB8 = 0x8051;
	mapping.RGBA8 = 0x8058;
	mapping.RGB10_A2 = 0x8059;
	mapping.TEXTURE_BINDING_3D = 0x806A;
	mapping.UNPACK_SKIP_IMAGES = 0x806D;
	mapping.UNPACK_IMAGE_HEIGHT = 0x806E;
	mapping.TEXTURE_3D = 0x806F;
	mapping.TEXTURE_WRAP_R = 0x8072;
	mapping.MAX_3D_TEXTURE_SIZE = 0x8073;
	mapping.UNSIGNED_INT_2_10_10_10_REV = 0x8368;
	mapping.MAX_ELEMENTS_VERTICES = 0x80E8;
	mapping.MAX_ELEMENTS_INDICES = 0x80E9;
	mapping.TEXTURE_MIN_LOD = 0x813A;
	mapping.TEXTURE_MAX_LOD = 0x813B;
	mapping.TEXTURE_BASE_LEVEL = 0x813C;
	mapping.TEXTURE_MAX_LEVEL = 0x813D;
	mapping.MIN = 0x8007;
	mapping.MAX = 0x8008;
	mapping.DEPTH_COMPONENT24 = 0x81A6;
	mapping.MAX_TEXTURE_LOD_BIAS = 0x84FD;
	mapping.TEXTURE_COMPARE_MODE = 0x884C;
	mapping.TEXTURE_COMPARE_FUNC = 0x884D;
	mapping.CURRENT_QUERY = 0x8865;
	mapping.QUERY_RESULT = 0x8866;
	mapping.QUERY_RESULT_AVAILABLE = 0x8867;
	mapping.STREAM_READ = 0x88E1;
	mapping.STREAM_COPY = 0x88E2;
	mapping.STATIC_READ = 0x88E5;
	mapping.STATIC_COPY = 0x88E6;
	mapping.DYNAMIC_READ = 0x88E9;
	mapping.DYNAMIC_COPY = 0x88EA;
	mapping.MAX_DRAW_BUFFERS = 0x8824;
	mapping.DRAW_BUFFER0 = 0x8825;
	mapping.DRAW_BUFFER1 = 0x8826;
	mapping.DRAW_BUFFER2 = 0x8827;
	mapping.DRAW_BUFFER3 = 0x8828;
	mapping.DRAW_BUFFER4 = 0x8829;
	mapping.DRAW_BUFFER5 = 0x882A;
	mapping.DRAW_BUFFER6 = 0x882B;
	mapping.DRAW_BUFFER7 = 0x882C;
	mapping.DRAW_BUFFER8 = 0x882D;
	mapping.DRAW_BUFFER9 = 0x882E;
	mapping.DRAW_BUFFER10 = 0x882F;
	mapping.DRAW_BUFFER11 = 0x8830;
	mapping.DRAW_BUFFER12 = 0x8831;
	mapping.DRAW_BUFFER13 = 0x8832;
	mapping.DRAW_BUFFER14 = 0x8833;
	mapping.DRAW_BUFFER15 = 0x8834;
	mapping.MAX_FRAGMENT_UNIFORM_COMPONENTS = 0x8B49;
	mapping.MAX_VERTEX_UNIFORM_COMPONENTS = 0x8B4A;
	mapping.SAMPLER_3D = 0x8B5F;
	mapping.SAMPLER_2D_SHADOW = 0x8B62;
	mapping.FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8B8B;
	mapping.PIXEL_PACK_BUFFER = 0x88EB;
	mapping.PIXEL_UNPACK_BUFFER = 0x88EC;
	mapping.PIXEL_PACK_BUFFER_BINDING = 0x88ED;
	mapping.PIXEL_UNPACK_BUFFER_BINDING = 0x88EF;
	mapping.FLOAT_MAT2x3 = 0x8B65;
	mapping.FLOAT_MAT2x4 = 0x8B66;
	mapping.FLOAT_MAT3x2 = 0x8B67;
	mapping.FLOAT_MAT3x4 = 0x8B68;
	mapping.FLOAT_MAT4x2 = 0x8B69;
	mapping.FLOAT_MAT4x3 = 0x8B6A;
	mapping.SRGB = 0x8C40;
	mapping.SRGB8 = 0x8C41;
	mapping.SRGB8_ALPHA8 = 0x8C43;
	mapping.COMPARE_REF_TO_TEXTURE = 0x884E;
	mapping.RGBA32F = 0x8814;
	mapping.RGB32F = 0x8815;
	mapping.RGBA16F = 0x881A;
	mapping.RGB16F = 0x881B;
	mapping.VERTEX_ATTRIB_ARRAY_INTEGER = 0x88FD;
	mapping.MAX_ARRAY_TEXTURE_LAYERS = 0x88FF;
	mapping.MIN_PROGRAM_TEXEL_OFFSET = 0x8904;
	mapping.MAX_PROGRAM_TEXEL_OFFSET = 0x8905;
	mapping.MAX_VARYING_COMPONENTS = 0x8B4B;
	mapping.TEXTURE_2D_ARRAY = 0x8C1A;
	mapping.TEXTURE_BINDING_2D_ARRAY = 0x8C1D;
	mapping.R11F_G11F_B10F = 0x8C3A;
	mapping.UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
	mapping.RGB9_E5 = 0x8C3D;
	mapping.UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
	mapping.TRANSFORM_FEEDBACK_BUFFER_MODE = 0x8C7F;
	mapping.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = 0x8C80;
	mapping.TRANSFORM_FEEDBACK_VARYINGS = 0x8C83;
	mapping.TRANSFORM_FEEDBACK_BUFFER_START = 0x8C84;
	mapping.TRANSFORM_FEEDBACK_BUFFER_SIZE = 0x8C85;
	mapping.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8C88;
	mapping.RASTERIZER_DISCARD = 0x8C89;
	mapping.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = 0x8C8A;
	mapping.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = 0x8C8B;
	mapping.INTERLEAVED_ATTRIBS = 0x8C8C;
	mapping.SEPARATE_ATTRIBS = 0x8C8D;
	mapping.TRANSFORM_FEEDBACK_BUFFER = 0x8C8E;
	mapping.TRANSFORM_FEEDBACK_BUFFER_BINDING = 0x8C8F;
	mapping.RGBA32UI = 0x8D70;
	mapping.RGB32UI = 0x8D71;
	mapping.RGBA16UI = 0x8D76;
	mapping.RGB16UI = 0x8D77;
	mapping.RGBA8UI = 0x8D7C;
	mapping.RGB8UI = 0x8D7D;
	mapping.RGBA32I = 0x8D82;
	mapping.RGB32I = 0x8D83;
	mapping.RGBA16I = 0x8D88;
	mapping.RGB16I = 0x8D89;
	mapping.RGBA8I = 0x8D8E;
	mapping.RGB8I = 0x8D8F;
	mapping.RED_INTEGER = 0x8D94;
	mapping.RGB_INTEGER = 0x8D98;
	mapping.RGBA_INTEGER = 0x8D99;
	mapping.SAMPLER_2D_ARRAY = 0x8DC1;
	mapping.SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
	mapping.SAMPLER_CUBE_SHADOW = 0x8DC5;
	mapping.UNSIGNED_INT_VEC2 = 0x8DC6;
	mapping.UNSIGNED_INT_VEC3 = 0x8DC7;
	mapping.UNSIGNED_INT_VEC4 = 0x8DC8;
	mapping.INT_SAMPLER_2D = 0x8DCA;
	mapping.INT_SAMPLER_3D = 0x8DCB;
	mapping.INT_SAMPLER_CUBE = 0x8DCC;
	mapping.INT_SAMPLER_2D_ARRAY = 0x8DCF;
	mapping.UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
	mapping.UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
	mapping.UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
	mapping.UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;
	mapping.DEPTH_COMPONENT32F = 0x8CAC;
	mapping.DEPTH32F_STENCIL8 = 0x8CAD;
	mapping.FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
	mapping.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 0x8210;
	mapping.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE = 0x8211;
	mapping.FRAMEBUFFER_ATTACHMENT_RED_SIZE = 0x8212;
	mapping.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE = 0x8213;
	mapping.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE = 0x8214;
	mapping.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE = 0x8215;
	mapping.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE = 0x8216;
	mapping.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE = 0x8217;
	mapping.FRAMEBUFFER_DEFAULT = 0x8218;
	mapping.DEPTH_STENCIL_ATTACHMENT = 0x821A;
	mapping.DEPTH_STENCIL = 0x84F9;
	mapping.UNSIGNED_INT_24_8 = 0x84FA;
	mapping.DEPTH24_STENCIL8 = 0x88F0;

	mapping.UNSIGNED_NORMALIZED = 0x8C17;
	mapping.DRAW_FRAMEBUFFER_BINDING = 0x8CA6; /* Same as FRAMEBUFFER_BINDING */
	mapping.READ_FRAMEBUFFER = 0x8CA8;
	mapping.DRAW_FRAMEBUFFER = 0x8CA9;
	mapping.READ_FRAMEBUFFER_BINDING = 0x8CAA;
	mapping.RENDERBUFFER_SAMPLES = 0x8CAB;
	mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER = 0x8CD4;
	mapping.MAX_COLOR_ATTACHMENTS = 0x8CDF;
	mapping.COLOR_ATTACHMENT1 = 0x8CE1;
	mapping.COLOR_ATTACHMENT2 = 0x8CE2;
	mapping.COLOR_ATTACHMENT3 = 0x8CE3;
	mapping.COLOR_ATTACHMENT4 = 0x8CE4;
	mapping.COLOR_ATTACHMENT5 = 0x8CE5;
	mapping.COLOR_ATTACHMENT6 = 0x8CE6;
	mapping.COLOR_ATTACHMENT7 = 0x8CE7;
	mapping.COLOR_ATTACHMENT8 = 0x8CE8;
	mapping.COLOR_ATTACHMENT9 = 0x8CE9;
	mapping.COLOR_ATTACHMENT10 = 0x8CEA;
	mapping.COLOR_ATTACHMENT11 = 0x8CEB;
	mapping.COLOR_ATTACHMENT12 = 0x8CEC;
	mapping.COLOR_ATTACHMENT13 = 0x8CED;
	mapping.COLOR_ATTACHMENT14 = 0x8CEE;
	mapping.COLOR_ATTACHMENT15 = 0x8CEF;
	mapping.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE = 0x8D56;
	mapping.MAX_SAMPLES = 0x8D57;
	mapping.HALF_FLOAT = 0x140B;
	mapping.RG = 0x8227;
	mapping.RG_INTEGER = 0x8228;
	mapping.R8 = 0x8229;
	mapping.RG8 = 0x822B;
	mapping.R16F = 0x822D;
	mapping.R32F = 0x822E;
	mapping.RG16F = 0x822F;
	mapping.RG32F = 0x8230;
	mapping.R8I = 0x8231;
	mapping.R8UI = 0x8232;
	mapping.R16I = 0x8233;
	mapping.R16UI = 0x8234;
	mapping.R32I = 0x8235;
	mapping.R32UI = 0x8236;
	mapping.RG8I = 0x8237;
	mapping.RG8UI = 0x8238;
	mapping.RG16I = 0x8239;
	mapping.RG16UI = 0x823A;
	mapping.RG32I = 0x823B;
	mapping.RG32UI = 0x823C;
	mapping.VERTEX_ARRAY_BINDING = 0x85B5;
	mapping.R8_SNORM = 0x8F94;
	mapping.RG8_SNORM = 0x8F95;
	mapping.RGB8_SNORM = 0x8F96;
	mapping.RGBA8_SNORM = 0x8F97;
	mapping.SIGNED_NORMALIZED = 0x8F9C;
	mapping.COPY_READ_BUFFER = 0x8F36;
	mapping.COPY_WRITE_BUFFER = 0x8F37;
	mapping.COPY_READ_BUFFER_BINDING = 0x8F36; /* Same as COPY_READ_BUFFER */
	mapping.COPY_WRITE_BUFFER_BINDING = 0x8F37; /* Same as COPY_WRITE_BUFFER */
	mapping.UNIFORM_BUFFER = 0x8A11;
	mapping.UNIFORM_BUFFER_BINDING = 0x8A28;
	mapping.UNIFORM_BUFFER_START = 0x8A29;
	mapping.UNIFORM_BUFFER_SIZE = 0x8A2A;
	mapping.MAX_VERTEX_UNIFORM_BLOCKS = 0x8A2B;
	mapping.MAX_FRAGMENT_UNIFORM_BLOCKS = 0x8A2D;
	mapping.MAX_COMBINED_UNIFORM_BLOCKS = 0x8A2E;
	mapping.MAX_UNIFORM_BUFFER_BINDINGS = 0x8A2F;
	mapping.MAX_UNIFORM_BLOCK_SIZE = 0x8A30;
	mapping.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = 0x8A31;
	mapping.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = 0x8A33;
	mapping.UNIFORM_BUFFER_OFFSET_ALIGNMENT = 0x8A34;
	mapping.ACTIVE_UNIFORM_BLOCKS = 0x8A36;
	mapping.UNIFORM_TYPE = 0x8A37;
	mapping.UNIFORM_SIZE = 0x8A38;
	mapping.UNIFORM_BLOCK_INDEX = 0x8A3A;
	mapping.UNIFORM_OFFSET = 0x8A3B;
	mapping.UNIFORM_ARRAY_STRIDE = 0x8A3C;
	mapping.UNIFORM_MATRIX_STRIDE = 0x8A3D;
	mapping.UNIFORM_IS_ROW_MAJOR = 0x8A3E;
	mapping.UNIFORM_BLOCK_BINDING = 0x8A3F;
	mapping.UNIFORM_BLOCK_DATA_SIZE = 0x8A40;
	mapping.UNIFORM_BLOCK_ACTIVE_UNIFORMS = 0x8A42;
	mapping.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 0x8A43;
	mapping.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 0x8A44;
	mapping.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8A46;
	mapping.INVALID_INDEX = 0xFFFFFFFF;
	mapping.MAX_VERTEX_OUTPUT_COMPONENTS = 0x9122;
	mapping.MAX_FRAGMENT_INPUT_COMPONENTS = 0x9125;
	mapping.MAX_SERVER_WAIT_TIMEOUT = 0x9111;
	mapping.OBJECT_TYPE = 0x9112;
	mapping.SYNC_CONDITION = 0x9113;
	mapping.SYNC_STATUS = 0x9114;
	mapping.SYNC_FLAGS = 0x9115;
	mapping.SYNC_FENCE = 0x9116;
	mapping.SYNC_GPU_COMMANDS_COMPLETE = 0x9117;
	mapping.UNSIGNALED = 0x9118;
	mapping.SIGNALED = 0x9119;
	mapping.ALREADY_SIGNALED = 0x911A;
	mapping.TIMEOUT_EXPIRED = 0x911B;
	mapping.CONDITION_SATISFIED = 0x911C;
	mapping.WAIT_FAILED = 0x911D;
	mapping.SYNC_FLUSH_COMMANDS_BIT = 0x00000001;
	mapping.VERTEX_ATTRIB_ARRAY_DIVISOR = 0x88FE;
	mapping.ANY_SAMPLES_PASSED = 0x8C2F;
	mapping.ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8D6A;
	mapping.SAMPLER_BINDING = 0x8919;
	mapping.RGB10_A2UI = 0x906F;
	mapping.INT_2_10_10_10_REV = 0x8D9F;
	mapping.TRANSFORM_FEEDBACK = 0x8E22;
	mapping.TRANSFORM_FEEDBACK_PAUSED = 0x8E23;
	mapping.TRANSFORM_FEEDBACK_ACTIVE = 0x8E24;
	mapping.TRANSFORM_FEEDBACK_BINDING = 0x8E25;
	mapping.TEXTURE_IMMUTABLE_FORMAT = 0x912F;
	mapping.MAX_ELEMENT_INDEX = 0x8D6B;
	mapping.TEXTURE_IMMUTABLE_LEVELS = 0x82DF;
	mapping.TIMEOUT_IGNORED = -1;
	mapping.MAX_CLIENT_WAIT_TIMEOUT_WEBGL = 0x9247;

	// ext ENUM for WEBGL_compressed_texture_s3tc
	mapping.COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
	mapping.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
	mapping.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
	mapping.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

	// ext ENUM for WEBGL_compressed_texture_s3tc_srgb
	mapping.COMPRESSED_SRGB_S3TC_DXT1_EXT = 0x8C4C;
	mapping.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 0x8C4D;
	mapping.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 0x8C4E;
	mapping.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 0x8C4F;

	// ext ENUM for EXT_texture_filter_anisotropic
	mapping.TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;
	mapping.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;

	let NS = mapping;

	// 属性数据类型
	mapping.AttributeType = [
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
	mapping.AttributeChannels = [
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
	mapping.BufferUsage = [
	    NS.STATIC_DRAW,     // BU_STATIC
	    NS.DYNAMIC_DRAW,    // BU_DYNAMIC
	    NS.DYNAMIC_DRAW,    // BU_RENDERTARGET
	    NS.DYNAMIC_DRAW,    // BU_DEPTHSTENCIL
	    NS.DYNAMIC_DRAW     // BU_TEXTURE
	];

	// 纹理目标
	mapping.TextureTarget = [
	    0,                   // ST_NONE
	    NS.TEXTURE_2D,       // ST_2D
	    NS.TEXTURE_3D,       // ST_3D
	    NS.TEXTURE_CUBE_MAP, // ST_CUBE
	    NS.TEXTURE_2D_ARRAY  // ST_2D_ARRAY
	];

	// 纹理包装方式
	mapping.SamplerWrapMode = [
	    NS.REPEAT,          // SamplerState.REPEAT
	    NS.MIRRORED_REPEAT, // SamplerState.MIRRORED_REPEAT
	    NS.CLAMP_TO_EDGE    // SamplerState.CLAMP_EDGE
	];

	mapping.DepthCompare = [
	    NS.NEVER,       // CM_NEVER
	    NS.LESS,        // CM_LESS
	    NS.EQUAL,       // CM_EQUAL
	    NS.LEQUAL,      // CM_LEQUAL
	    NS.GREATER,     // CM_GREATER
	    NS.NOTEQUAL,    // CM_NOTEQUAL
	    NS.GEQUAL,      // CM_GEQUAL
	    NS.ALWAYS       // CM_ALWAYS
	];

	mapping.StencilCompare = [
	    NS.NEVER,       // CM_NEVER
	    NS.LESS,        // CM_LESS
	    NS.EQUAL,       // CM_EQUAL
	    NS.LEQUAL,      // CM_LEQUAL
	    NS.GREATER,     // CM_GREATER
	    NS.NOTEQUAL,    // CM_NOTEQUAL
	    NS.GEQUAL,      // CM_GEQUAL
	    NS.ALWAYS       // CM_ALWAYS
	];

	mapping.StencilOperation = [
	    NS.KEEP,    // OT_KEEP
	    NS.ZERO,    // OT_ZERO
	    NS.REPLACE, // OT_REPLACE
	    NS.INCR,    // OT_INCREMENT
	    NS.DECR,    // OT_DECREMENT
	    NS.INVERT   // OT_INVERT
	];

	// 透明通道混合
	mapping.AlphaBlend = [
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

	mapping.SamplerFilter = [
	    NS.NEAREST,                 // SamplerState.NEAREST
	    NS.LINEAR,                  // SamplerState.LINEAR
	    NS.NEAREST_MIPMAP_NEAREST,  // SamplerState.NEAREST_MIPMAP_NEAREST
	    NS.NEAREST_MIPMAP_LINEAR,   // SamplerState.NEAREST_MIPMAP_LINEAR
	    NS.LINEAR_MIPMAP_NEAREST,   // SamplerState.LINEAR_MIPMAP_NEAREST
	    NS.LINEAR_MIPMAP_LINEAR     // SamplerState.LINEAR_MIPMAP_LINEAR
	];

	mapping.TextureInternalFormat = [
	    0,                                  // TF_NONE
	    NS.RGB,                             // TF_R5G6B5
	    NS.RGB5_A1,                         // TF_A1R5G5B5
	    NS.RGBA4,                           // TF_A4R4G4B4
	    NS.ALPHA,                           // TF_A8
	    NS.LUMINANCE,                      // TF_L8
	    NS.LUMINANCE_ALPHA,                 // TF_A8L8
	    NS.RGB8,                            // TF_R8G8B8
	    NS.RGBA,                            // TF_A8R8G8B8
	    NS.RGBA,                            // TF_A8B8G8R8
	    NS.LUMINANCE,                       // TF_L16
	    NS.RG16I,                           // TF_G16R16
	    NS.RGBA,                            // TF_A16B16G16R16
	    NS.R16F,                            // TF_R16F
	    NS.RG16F,                           // TF_G16R16F
	    NS.RGBA16F_ARB,                     // TF_A16B16G16R16F
	    NS.R32F,                            // TF_R32F
	    NS.RG32F,                           // TF_G32R32F
	    NS.RGBA32F_ARB,                     // TF_A32B32G32R32F
	    NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
	    NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
	    NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
	    NS.DEPTH24_STENCIL8                 // TF_D24S8
	];

	mapping.TextureFormat = [
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
	    NS.RG,                              // TF_G16R16
	    NS.RGBA,                            // TF_A16B16G16R16
	    NS.RED,                             // TF_R16F
	    NS.RG,                              // TF_G16R16F
	    NS.RGBA,                            // TF_A16B16G16R16F
	    NS.RED,                             // TF_R32F
	    NS.RG,                              // TF_G32R32F
	    NS.RGBA,                            // TF_A32B32G32R32F
	    NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
	    NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
	    NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
	    NS.UNSIGNED_INT_24_8_WEBGL          // TF_D24S8
	];

	mapping.TextureType = [
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

	mapping.PrimitiveType = [
	    0,                  // PT_NONE (not used)
	    NS.POINTS,          // PT_POLYPOINT
	    NS.LINES,           // PT_POLYSEGMENTS_DISJOINT
	    NS.LINE_STRIP,      // PT_POLYSEGMENTS_CONTIGUOUS
	    0,                  // PT_TRIANGLES (not used)
	    NS.TRIANGLES,       // PT_TRIMESH
	    NS.TRIANGLE_STRIP,  // PT_TRISTRIP
	    NS.TRIANGLE_FAN     // PT_TRIFAN
	];

	class SamplerState extends D3Object {
		constructor() {
			super();
			this.minFilter = SamplerState.LINEAR_MIPMAP_LINEAR;
			this.magFilter = SamplerState.LINEAR;

			this.maxAnisotropy = 1;

			this.wrapS = SamplerState.CLAMP_TO_EDGE;
			this.wrapT = SamplerState.CLAMP_TO_EDGE;
			this.wrapR = SamplerState.CLAMP_TO_EDGE;

			this.minLod = 0;
			this.maxLod = 0;

			this.compare = SamplerState.LEQUAL;
			this.mode = SamplerState.NONE;
		}
	}



	// filter (value from gl context)
	SamplerState.NEAREST = 0x2600;
	SamplerState.LINEAR = 0x2601;
	SamplerState.NEAREST_MIPMAP_NEAREST = 0x2700;
	SamplerState.LINEAR_MIPMAP_NEAREST = 0x2701;
	SamplerState.NEAREST_MIPMAP_LINEAR = 0x2702;
	SamplerState.LINEAR_MIPMAP_LINEAR = 0x2703;

	// compare function (value from gl context)
	SamplerState.NEVER = 0x0200;
	SamplerState.LESS = 0x0201;
	SamplerState.EQUAL = 0x0202;
	SamplerState.LEQUAL = 0x0203;
	SamplerState.GREATER = 0x0204;
	SamplerState.NOTEQUAL = 0x0205;
	SamplerState.GEQUAL = 0x0206;
	SamplerState.ALWAYS = 0x0207;

	// compare mode (value from gl context)
	SamplerState.NONE = 0;
	SamplerState.COMPARE_REF_TO_TEXTURE = 0x884E;

	// wrap mode (value from gl context)
	SamplerState.REPEAT = 0x2901;
	SamplerState.CLAMP_TO_EDGE = 0x812F;
	SamplerState.MIRRORED_REPEAT = 0x8370;

	// default sampler
	SamplerState.defaultSampler = new SamplerState;

	/**
	 * Abstract base class. The class is the base for VertexShader and FragShader.
	 * The class data defines the shader but does not contain instances of shader 
	 * constants and shader textures.  Each instance of Shader may therefore be a 
	 * singleton, identified by 'shaderName'.  The drawing of geometry involves a 
	 * Shader (the abstraction) and a ShaderParameters (the instance of constants 
	 * and textures).
	 * 
	 * The constructor arrays must be dynamically allocated.  Shader assumes
	 * responsibility for deleting them.  The construction of a Shader is not
	 * complete until all programs (for the letious profiles) are provided
	 * via the setProgram function.
	 */
	class Shader extends D3Object {

	    /**
	     * @param {string} name - The name of Shader for identified
	     * @param {number} numInputs - number of input attributers
	     * @param {number} numConstants - number of input uniforms
	     * @param {number} numSamplers - number of input samplers
	     */
	    constructor(name, numInputs = 0, numConstants = 0, numSamplers = 0) {
	        super(name);

	        if (numInputs > 0) {
	            this.inputName = new Array(numInputs);
	            this.inputType = new Array(numInputs);
	            this.inputSemantic = new Array(numInputs);
	        } else {
	            this.inputName = null;
	            this.inputType = null;
	            this.inputSemantic = null;
	        }

	        this.numInputs = numInputs;
	        let i, dim;
	        this.numConstants = numConstants;
	        if (numConstants > 0) {
	            this.constantName = new Array(numConstants);
	            this.constantType = new Array(numConstants);
	            this.constantFuncName = new Array(numConstants);
	            this.constantSize = new Array(numConstants);
	        } else {
	            this.constantName = null;
	            this.constantType = null;
	            this.constantFuncName = null;
	            this.constantSize = null;
	        }

	        this.numSamplers = numSamplers;
	        this.textureUnit = [];
	        if (numSamplers > 0) {
	            this.samplerName = new Array(numSamplers);
	            this.samplerType = new Array(numSamplers);
	            this.samplers = new Array(numSamplers);
	            for (i = 0; i < numSamplers; ++i) {
	                this.samplers[i] = null;
	            }
	            this.textureUnit = new Array(numSamplers);
	        } else {
	            this.samplerName = null;
	            this.samplerType = null;
	            this.samplers = null;
	            this.textureUnit = null;
	        }

	        this.program = '';
	    }

	    /**
	     * Declear a attribute at position i
	     * @param {number} i index
	     * @param {string} name
	     * @param {number} type - Shader.VT_XXX
	     * @param {number} semantic - Shader.VS_XXX
	     */
	    setInput(index, name, type, semantic) {
	        if (0 <= index && index < this.numInputs) {
	            this.inputName[index] = name;
	            this.inputType[index] = type;
	            this.inputSemantic[index] = semantic;
	            return;
	        }
	        console.assert(false, 'Invalid index.');
	    }

	    /**
	     * @param {number} i
	     * @param {string} name
	     * @param {number} type - Shader.VT_XXX(uniform)
	     */
	    setConstant(i, name, type) {
	        if (0 <= i && i < this.numConstants) {
	            this.constantName[i] = name;
	            this.constantType[i] = type;
	            let f = '', s = 0;
	            switch (type) {
	                case Shader.VT_MAT4:
	                    f = 'uniformMatrix4fv';
	                    s = 16;
	                    break;
	                case Shader.VT_BOOL:
	                case Shader.VT_INT:
	                    f = 'uniform1i';
	                    s = 1;
	                    break;
	                case Shader.VT_BVEC2:
	                case Shader.VT_IVEC2:
	                    f = 'uniform2iv';
	                    s = 2;
	                    break;
	                case Shader.VT_BVEC3:
	                case Shader.VT_IVEC3:
	                    f = 'uniform3iv';
	                    s = 3;
	                    break;
	                case Shader.VT_BVEC4:
	                case Shader.VT_IVEC4:
	                    f = 'uniform4iv';
	                    s = 4;
	                    break;
	                case Shader.VT_FLOAT:
	                    f = 'uniform1f';
	                    s = 1;
	                    break;
	                case Shader.VT_VEC2:
	                    f = 'uniform2fv';
	                    s = 2;
	                    break;
	                case Shader.VT_VEC3:
	                    f = 'uniform3fv';
	                    s = 3;
	                    break;
	                case Shader.VT_VEC4:
	                    f = 'uniform4fv';
	                    s = 4;
	                    break;
	                case Shader.VT_MAT2:
	                    f = 'uniformMatrix2fv';
	                    s = 4;
	                    break;
	                case Shader.VT_MAT3:
	                    f = 'uniformMatrix3fv';
	                    s = 9;
	                    break;
	            }
	            this.constantSize[i] = s;
	            this.constantFuncName[i] = f;
	            return;
	        }
	        console.assert(false, 'Invalid index.');
	    }

	    /**
	     * @param {number} i
	     * @param {string} name
	     * @param {number} type - Shader.ST_XXX(sampler)
	     */
	    setSampler(i, name, type) {
	        if (0 <= i && i < this.numSamplers) {
	            this.samplerName[i] = name;
	            this.samplerType[i] = type;
	            return;
	        }
	        console.assert(false, 'Invalid index.');
	    }

	    /**
	     * @param {number} i 
	     * @param {SamplerState} sampler 
	     */
	    setSamplerState(i, sampler) {
	        if (0 <= i && i < this.numSamplers) {
	            this.samplers[i] = sampler;
	            return;
	        }
	        console.assert(false, 'Invalid index.');
	    }

	    setTextureUnit(i, textureUnit) {
	        if (0 <= i && i < this.numSamplers) {
	            this.textureUnit[i] = textureUnit;
	            return;
	        }
	        console.assert(false, 'Invalid index.');
	    }

	    setProgram(program) {
	        this.program = program;
	    }

	    setTextureUnits(textureUnits) {
	        this.textureUnit = textureUnits.slice();
	    }

	    getInputName(i) {
	        if (0 <= i && i < this.numInputs) {
	            return this.inputName[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return '';
	    }

	    getInputType(i) {
	        if (0 <= i && i < this.numInputs) {
	            return this.inputType[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return Shader.VT_NONE;
	    }

	    getInputSemantic(i) {
	        if (0 <= i && i < this.numInputs) {
	            return this.inputSemantic[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return Shader.VS_NONE;
	    }

	    getConstantFuncName(i) {
	        if (0 <= i && i < this.numConstants) {
	            return this.constantFuncName[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return '';
	    }

	    getConstantName(i) {
	        if (0 <= i && i < this.numConstants) {
	            return this.constantName[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return '';
	    }

	    getConstantType(i) {
	        if (0 <= i && i < this.numConstants) {
	            return this.constantType[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return 0;
	    }

	    getConstantSize(i) {
	        if (0 <= i && i < this.numConstants) {
	            return this.constantSize[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return 0;
	    }

	    getSamplerName(i) {
	        if (0 <= i && i < this.numSamplers) {
	            return this.samplerName[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return '';
	    }

	    getSamplerType(i) {
	        if (0 <= i && i < this.numSamplers) {
	            return this.samplerType[i];
	        }

	        console.assert(false, 'Invalid index.');
	        return Shader.ST_NONE;
	    }

	    getSamplerState(i) {
	        if (0 <= i && i < this.numSamplers) {
	            return this.samplers[i];
	        }
	        console.assert(false, 'Invalid index.');
	        return 0;
	    }

	    getTextureUnit(i) {
	        if (0 <= i && i < this.numSamplers) {
	            return this.textureUnit[i];
	        }
	        console.assert(false, 'Invalid index.');
	        return 0;
	    }

	    getProgram() {
	        return this.program;
	    }

	    load(inStream) {
	        super.load(inStream);

	        this.inputName = inStream.readStringArray();
	        this.numInputs = this.inputName.length;
	        this.inputType = inStream.readSizedEnumArray(this.numInputs);
	        this.inputSemantic = inStream.readSizedEnumArray(this.numInputs);
	        this.constantName = inStream.readStringArray();
	        this.numConstants = this.constantName.length;
	        this.numRegistersUsed = inStream.readSizedInt32Array(this.numConstants);

	        this.samplerName = inStream.readStringArray();
	        this.numSamplers = this.samplerName.length;
	        this.samplerType = inStream.readSizedEnumArray(this.numSamplers);
	        let maxProfiles = inStream.readUint32();

	        this.profileOwner = inStream.readBool();
	    }

	    static factory(inStream) {
	        let obj = new this();
	        obj.load(inStream);
	        return obj;
	    }
	}

	// Maximum value for anisotropic filtering.
	DECLARE_ENUM(Shader, { MAX_ANISOTROPY: 16 }, false);

	// Types for the input and output variables of the shader program.
	DECLARE_ENUM(Shader, {
	    VT_NONE: 0,
	    VT_BOOL: 1,
	    VT_BVEC2: 2,
	    VT_BVEC3: 3,
	    VT_BVEC4: 4,
	    VT_FLOAT: 5,
	    VT_VEC2: 6,
	    VT_VEC3: 7,
	    VT_VEC4: 8,
	    VT_MAT2: 9,
	    VT_MAT3: 10,
	    VT_MAT4: 11,
	    VT_INT: 12,
	    VT_IVEC2: 13,
	    VT_IVEC3: 14,
	    VT_IVEC4: 15
	}, false);

	// Semantics for the input letiables of the shader program.
	DECLARE_ENUM(Shader, {
	    VS_NONE: 0,
	    VS_POSITION: 1,       // ATTR0
	    VS_BLENDWEIGHT: 2,    // ATTR1
	    VS_NORMAL: 3,         // ATTR2
	    VS_COLOR0: 4,         // ATTR3 (and for render targets)
	    VS_COLOR1: 5,         // ATTR4 (and for render targets)
	    VS_FOGCOORD: 6,       // ATTR5
	    VS_PSIZE: 7,          // ATTR6
	    VS_BLENDINDICES: 8,   // ATTR7
	    VS_TEXCOORD0: 9,      // ATTR8
	    VS_TEXCOORD1: 10,     // ATTR9
	    VS_TEXCOORD2: 11,     // ATTR10
	    VS_TEXCOORD3: 12,     // ATTR11
	    VS_TEXCOORD4: 13,     // ATTR12
	    VS_TEXCOORD5: 14,     // ATTR13
	    VS_TEXCOORD6: 15,     // ATTR14
	    VS_TEXCOORD7: 16,     // ATTR15
	    VS_FOG: 17,           // same as L5.Shader.VS_FOGCOORD (ATTR5)
	    VS_TANGENT: 18,       // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
	    VS_BINORMAL: 19,      // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
	    VS_COLOR2: 20,        // support for multiple render targets
	    VS_COLOR3: 21,        // support for multiple render targets
	    VS_DEPTH0: 22        // support for multiple render targets
	}, false);

	// The sampler type for interpreting the texture assigned to the sampler.
	DECLARE_ENUM(Shader, {
	    ST_NONE: 0,
	    ST_2D: 1,
	    ST_3D: 2,
	    ST_CUBE: 3,
	    ST_2D_ARRAY: 4
	}, false);

	class GLShader {
	    /**
	     * @param {Renderer} renderer
	     * @param {Shader} shader
	     * @param {ShaderParameters} parameters
	     * @param {number} maxSamplers
	     */
	    setSamplerState(renderer, shader, parameters, maxSamplers) {
	        let gl = renderer.gl;

	        let numSamplers = shader.numSamplers;
	        if (numSamplers > maxSamplers) {
	            numSamplers = maxSamplers;
	        }

	        for (let i = 0; i < numSamplers; ++i) {
	            let type = shader.getSamplerType(i);
	            let target = mapping.TextureTarget[type];
	            let textureUnit = shader.getTextureUnit(i);
	            const texture = parameters.getTexture(i);
	            let wrap0, wrap1;

	            let samplerState = shader.getSamplerState(i);

	            switch (type) {
	                case Shader.ST_2D:
	                    {
	                        renderer._enableTexture2D(texture, textureUnit);
	                        renderer._enableSamplerState(samplerState, textureUnit);
	                        if (samplerState.maxAnisotropy !== gl.getTexParameter(gl.TEXTURE_2D, mapping.TEXTURE_MAX_ANISOTROPY_EXT)) {
	                            gl.texParameterf(gl.TEXTURE_2D, mapping.TEXTURE_MAX_ANISOTROPY_EXT, samplerState.maxAnisotropy);
	                        }
	                        break;
	                    }
	                case Shader.ST_CUBE:
	                    {
	                        renderer._enableTextureCube(texture, textureUnit);
	                        renderer._enableSamplerState(samplerState, textureUnit);
	                        if (samplerState.maxAnisotropy !== gl.getTexParameter(gl.TEXTURE_CUBE_MAP, mapping.TEXTURE_MAX_ANISOTROPY_EXT)) {
	                            gl.texParameterf(gl.TEXTURE_CUBE_MAP, mapping.TEXTURE_MAX_ANISOTROPY_EXT, samplerState.maxAnisotropy);
	                        }
	                        break;
	                    }
	                case Shader.ST_3D:
	                    break;
	                case Shader.ST_2D_ARRAY:
	                    break;
	                default:
	                    console.assert(false, 'Invalid sampler type');
	                    break;
	            }
	        }
	    }

	    /**
	     * @param {Shader} shader
	     * @param {ShaderParameters} parameters
	     * @param {Renderer} renderer
	     * @param {number} maxSamplers
	     */
	    disableTexture(renderer, shader, parameters, maxSamplers) {
	        let numSamplers = shader.numSamplers;
	        if (numSamplers > maxSamplers) {
	            numSamplers = maxSamplers;
	        }

	        let type, textureUnit, texture;

	        for (let i = 0; i < numSamplers; ++i) {
	            type = shader.getSamplerType(i);
	            textureUnit = shader.getTextureUnit(i);
	            texture = parameters.getTexture(i);

	            switch (type) {
	                case Shader.ST_2D:
	                    {
	                        renderer._disableTexture2D(texture, textureUnit);
	                        break;
	                    }
	                case Shader.ST_CUBE:
	                    {
	                        renderer._disableTextureCube(texture, textureUnit);
	                        break;
	                    }
	                case Shader.ST_3D:
	                    break;
	                case Shader.ST_2D_ARRAY:
	                    break;
	                default:
	                    console.assert(false, 'Invalid sampler type');
	                    break;
	            }
	        }
	    }
	}

	class GLVertexShader extends GLShader {

	    /**
	     * @param {Renderer} renderer 
	     * @param {Shader} shader 
	     */
	    constructor(renderer, shader) {
	        super();
	        let gl = renderer.gl;
	        this.shader = gl.createShader(gl.VERTEX_SHADER);

	        let programText = shader.getProgram();

	        gl.shaderSource(this.shader, programText);
	        gl.compileShader(this.shader);

	        console.assert(
	            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
	            gl.getShaderInfoLog(this.shader)
	        );
	    }
	    /**
	     * @param {Renderer} renderer
	     * @param {Map} mapping
	     * @param {VertexShader} shader
	     * @param {ShaderParameters} parameters
	     */
	    enable(renderer, mapping, shader, parameters) {
	        let gl = renderer.gl;

	        // 更新uniform 变量

	        // step1. 遍历顶点着色器常量
	        let numConstants = shader.numConstants;
	        for (let i = 0; i < numConstants; ++i) {
	            let locating = mapping.get(shader.getConstantName(i));
	            let funcName = shader.getConstantFuncName(i);
	            let size = shader.getConstantSize(i);
	            let data = parameters.getConstant(i).data;
	            if (size > 4) {
	                gl[funcName](locating, false, data);
	            } else {
	                gl[funcName](locating, data.subarray(0, size));
	            }
	        }

	        this.setSamplerState(renderer, shader, parameters, renderer.data.maxVShaderImages);
	    }
	    /**
	     * @param {VertexShader} shader
	     * @param {ShaderParameters} parameters
	     * @param {Renderer} renderer
	     */
	    disable(renderer, shader, parameters) {
	        this.disableTexture(renderer, shader, parameters, renderer.data.maxVShaderImages);
	    }
	}

	class GLFragShader extends GLShader {

	    /**
	     * @param {Renderer} renderer 
	     * @param {VertexShader} shader 
	     */
	    constructor(renderer, shader) {
	        super();
	        let gl = renderer.gl;
	        this.shader = gl.createShader(gl.FRAGMENT_SHADER);

	        let programText = shader.getProgram();

	        gl.shaderSource(this.shader, programText);
	        gl.compileShader(this.shader);

	        console.assert(
	            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
	            gl.getShaderInfoLog(this.shader)
	        );
	    }

	    /**
	     * 释放持有的GL资源
	     * @param {WebGL2RenderingContext} gl
	     */
	    free(gl) {
	        gl.deleteShader(this.shader);
	        delete this.shader;
	    }

	    /**
	     * @param {Renderer} renderer
	     * @param {Map} mapping
	     * @param {FragShader} shader
	     * @param {ShaderParameters} parameters
	     */
	    enable(renderer, mapping, shader, parameters) {
	        let gl = renderer.gl;
	        // step1. 遍历顶点着色器常量
	        let numConstants = shader.numConstants;
	        for (let i = 0; i < numConstants; ++i) {
	            let locating = mapping.get(shader.getConstantName(i));
	            let funcName = shader.getConstantFuncName(i);
	            let size = shader.getConstantSize(i);
	            let data = parameters.getConstant(i).data;
	            if (size > 4) {
	                gl[funcName](locating, false, data);
	            } else {
	                gl[funcName](locating, data.subarray(0, size));
	            }
	        }

	        this.setSamplerState(renderer, shader, parameters, renderer.data.maxFShaderImages);
	    }

	    /**
	     * @param {Renderer} renderer
	     * @param {FragShader} shader
	     * @param {ShaderParameters} parameters
	     */
	    disable(renderer, shader, parameters) {
	        let gl = renderer.gl;
	        this.disableTexture(renderer, shader, parameters, renderer.data.maxFShaderImages);
	    }
	}

	class VertexFormat$1 extends D3Object {

	    /**
	     * @param {number} numAttributes
	     */
	    constructor(numAttributes) {
	        console.assert(numAttributes >= 0, 'Number of attributes must be positive');
	        super();

	        const MAX_ATTRIBUTES = VertexFormat$1.MAX_ATTRIBUTES;

	        this.numAttributes = numAttributes;
	        this.stride = 0;

	        this.elements = new Array(MAX_ATTRIBUTES);
	        for (let i = 0; i < MAX_ATTRIBUTES; ++i) {
	            this.elements[i] = new VertexFormat$1.Element(0, 0, VertexFormat$1.AT_NONE, VertexFormat$1.AU_NONE, 0);
	        }
	    }


	    /**
	     * 创建顶点格式快捷函数
	     * @param {number} numAttributes - 顶点元素数量
	     * @param {Array} args
	     *
	     * @returns {VertexFormat}
	     */
	    static create(numAttributes, ...args/*, usage1, type1, usageIndex1, usage2,...*/) {
	        let vf = new VertexFormat$1(numAttributes);

	        let offset = 0;
	        let start = 0;
	        const TYPE_SIZE = VertexFormat$1.TYPE_SIZE;

	        for (let i = 0; i < numAttributes; ++i, start += 3) {
	            let usage = args[start];
	            let type = args[start + 1];
	            let usageIndex = args[start + 2];
	            vf.setAttribute(i, 0, offset, type, usage, usageIndex);

	            offset += TYPE_SIZE[type];
	        }
	        vf.setStride(offset);

	        return vf;
	    }

	    /**
	     * 设置指定位置顶点元素
	     * @param {number} attribute
	     * @param {number} streamIndex
	     * @param {number} offset
	     * @param {number} type - AttributeType
	     * @param {number} usage - AttributeUsage
	     * @param {number} usageIndex
	     */
	    setAttribute(attribute, streamIndex, offset, type, usage, usageIndex) {
	        console.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in SetAttribute');

	        let element = this.elements[attribute];
	        element.streamIndex = streamIndex;
	        element.offset = offset;
	        element.type = type;
	        element.usage = usage;
	        element.usageIndex = usageIndex;
	    }

	    /**
	     * 获取指定位置顶点元素
	     * @param {number} attribute - 顶点元素索引
	     * @returns {VertexFormat.Element}
	     */
	    getAttribute(attribute) {
	        console.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in GetAttribute');
	        return this.elements[attribute].clone();
	    }

	    /**
	     * 获取指定位置顶点元素
	     * @param {number} stride
	     */
	    setStride(stride) {
	        console.assert(0 < stride, 'Stride must be positive');
	        this.stride = stride;
	    }

	    /**
	     * 根据用途获取顶点元素位置
	     * @param {number} usage - 用途，参考VertexFormat.AU_XXX
	     * @param {number} usageIndex
	     * @returns {number}
	     */
	    getIndex(usage, usageIndex = 0) {
	        usageIndex = usageIndex || 0;

	        for (let i = 0; i < this.numAttributes; ++i) {
	            if (this.elements[i].usage === usage &&
	                this.elements[i].usageIndex === usageIndex
	            ) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    /**
	     * @param {number} attribute
	     * @returns {number}
	     */
	    getStreamIndex(attribute) {
	        if (0 <= attribute && attribute < this.numAttributes) {
	            return this.elements[attribute].streamIndex;
	        }
	        console.assert(false, 'Invalid index in getStreamIndex');
	        return 0;
	    }

	    /**
	     * 获取顶点元素偏移
	     * @param {number} attribute - 用途，参考VertexFormat.AU_XXX
	     * @returns {number}
	     */
	    getOffset(attribute) {
	        if (0 <= attribute && attribute < this.numAttributes) {
	            return this.elements[attribute].offset;
	        }
	        console.assert(false, 'Invalid index in getOffset');
	        return 0;
	    }

	    /**
	     * 获取顶点元素数据类型
	     * @param {number} attribute 顶点索引
	     * @returns {number} VertexFormat.AT_XXX
	     */
	    getAttributeType(attribute) {
	        if (0 <= attribute && attribute < this.numAttributes) {
	            return this.elements[attribute].type;
	        }
	        console.assert(false, 'Invalid index in GetAttributeType');
	        return VertexFormat$1.AT_NONE;
	    }

	    /**
	     * 填充VBA 属性
	     * @param {number} usage - 用途, 参考 VertexFormat.AU_XXX
	     * @param {VBAAttr} attr
	     * @param {number} usageIndex
	     */
	    fillVBAttr(usage, attr, usageIndex = 0) {
	        let index = this.getIndex(usage);
	        if (index >= 0) {
	            let type = this.getAttributeType(index, usageIndex);
	            attr.offset = this.getOffset(index);
	            attr.eType = VertexFormat$1.TYPE_CST[type];
	            attr.eNum = VertexFormat$1.NUM_COMPONENTS[type];
	            attr.cSize = VertexFormat$1.TYPE_SIZE[type];
	            attr.wFn = 'set' + attr.eType.name.replace('Array', '');
	            attr.rFn = 'get' + attr.eType.name.replace('Array', '');
	        }
	    }

	    getAttributeUsage(attribute) {
	        if (0 <= attribute && attribute < this.numAttributes) {
	            return this.elements[attribute].usage;
	        }
	        console.assert(false, 'Invalid index in GetAttributeUsage');
	        return VertexFormat$1.AU_NONE;
	    }

	    getUsageIndex(attribute) {
	        if (0 <= attribute && attribute < this.numAttributes) {
	            return this.elements[attribute].usageIndex;
	        }
	        console.assert(false, 'Invalid index in getUsageIndex');
	        return 0;
	    }

	    /**
	     * 获取顶点元素类型单位字节
	     * @param {number} type - 参考AT_XXX
	     * @returns {number}
	     */
	    static getComponentSize(type) {
	        return VertexFormat$1.COMPONENTS_SIZE[type];
	    }

	    /**
	     * 获取顶点元素类型单位个数
	     * @param {number} type - 参考AT_XXX
	     * @returns {number}
	     */
	    static getNumComponents(type) {
	        return VertexFormat$1.NUM_COMPONENTS[type];
	    }

	    /**
	     * 获取顶点元素类型所占字节
	     * @param {number} type - 参考AT_XXX
	     * @returns {number}
	     */
	    static getTypeSize(type) {
	        return VertexFormat$1.TYPE_SIZE[type];
	    }

	    static getUsageString(u) {
	        return ['未使用', '顶点坐标', '法线', '切线', '双切线', '纹理坐标', '颜色', '混合索引', '混合权重', '雾坐标', '点尺寸'][(u >= 0 && u <= 10) ? u : 0];
	    }

	    static getTypeString(t) {
	        return ['NONE', 'FLOAT1', 'FLOAT2', 'FLOAT3', 'FLOAT4', 'UBYTE4', 'SHORT1', 'SHORT2', 'SHORT4'][(t >= 0 && t <= 8) ? t : 0];
	    }

	    debug() {
	        console.log('================ VertexFormat 类型 ===============');
	        console.log('  属性个数:', this.numAttributes, '步幅:', this.stride, '字节');
	        for (let i = 0, l = this.numAttributes; i < l; ++i) {
	            this.elements[i].debug();
	        }
	        console.log('================ VertexFormat 类型 ===============');
	    }

	    /**
	     * @param {InStream} inStream
	     */
	    load(inStream) {
	        super.load(inStream);

	        this.numAttributes = inStream.readUint32();
	        const MAX_ATTRIBUTES = VertexFormat$1.MAX_ATTRIBUTES;

	        for (let i = 0; i < MAX_ATTRIBUTES; ++i) {
	            this.elements[i].streamIndex = inStream.readUint32();
	            this.elements[i].offset = inStream.readUint32();
	            this.elements[i].type = inStream.readEnum();
	            this.elements[i].usage = inStream.readEnum();
	            this.elements[i].usageIndex = inStream.readUint32();
	        }

	        this.stride = inStream.readUint32();
	    }

	    /**
	     * 文件解析工厂方法
	     * @param {InStream} inStream
	     * @returns {VertexFormat}
	     */
	    static factory(inStream) {
	        let obj = new VertexFormat$1(0);
	        obj.load(inStream);
	        return obj;
	    }
	}


	D3Object.Register('VertexFormat', VertexFormat$1.factory);

	/**
	 * 顶点元素构造
	 */
	class Element {
	    constructor(streamIndex, offset, type, usage, usageIndex) {
	        this.streamIndex = streamIndex || 0;
	        this.offset = offset || 0;
	        this.type = type || VertexFormat$1.AT_NONE;
	        this.usage = usage || VertexFormat$1.AU_NONE;
	        this.usageIndex = usageIndex || 0;
	    }

	    clone() {
	        return new Element
	            (
	            this.streamIndex,
	            this.offset,
	            this.type,
	            this.usage,
	            this.usageIndex
	            );
	    }

	    debug() {
	        console.log('------------ VertexFormat.Element 偏移:', this.offset, '字节 ---------------');
	        console.log('  用途:', VertexFormat$1.getUsageString(this.usage));
	        console.log('  类型:', VertexFormat$1.getTypeString(this.type));
	    }
	}
	VertexFormat$1.Element = Element;

	// 顶点属性最大个数
	DECLARE_ENUM(VertexFormat$1, {
	    MAX_ATTRIBUTES: 16,
	    MAX_TCOORD_UNITS: 8,
	    MAX_COLOR_UNITS: 2
	}, false);

	// 顶点属性数据类型
	DECLARE_ENUM(VertexFormat$1, {
	    AT_NONE: 0x00,
	    AT_FLOAT1: 0x01,
	    AT_FLOAT2: 0x02,
	    AT_FLOAT3: 0x03,
	    AT_FLOAT4: 0x04,
	    AT_HALF1: 0x05,
	    AT_HALF2: 0x06,
	    AT_HALF3: 0x07,
	    AT_HALF4: 0x08,
	    AT_UBYTE4: 0x09,
	    AT_SHORT1: 0x0a,
	    AT_SHORT2: 0x0b,
	    AT_SHORT4: 0x0c
	}, false);

	// 属性用途
	DECLARE_ENUM(VertexFormat$1, {
	    AU_NONE: 0,
	    AU_POSITION: 1,   // 顶点     -> shader location 0
	    AU_NORMAL: 2,   // 法线     -> shader location 2
	    AU_TANGENT: 3,   // 切线     -> shader location 14
	    AU_BINORMAL: 4,   // 双切线   -> shader location 15
	    AU_TEXCOORD: 5,   // 纹理坐标  -> shader location 8-15
	    AU_COLOR: 6,   // 颜色     -> shader location 3-4
	    AU_BLENDINDICES: 7,   // 混合索引  -> shader location 7
	    AU_BLENDWEIGHT: 8,   // 混合权重  -> shader location 1
	    AU_FOGCOORD: 9,   // 雾坐标    -> shader location 5
	    AU_PSIZE: 10   // 点大小    -> shader location 6
	}, false);

	// 属性类型的 构造, 尺寸 字节
	DECLARE_ENUM(VertexFormat$1, {
	    TYPE_CST: [
	        null,          // AT_NONE
	        Float32Array,  // AT_FLOAT1
	        Float32Array,  // AT_FLOAT2
	        Float32Array,  // AT_FLOAT3
	        Float32Array,  // AT_FLOAT4
	        Uint8Array,    // AT_UBYTE4
	        Uint16Array,   // AT_SHORT1
	        Uint16Array,   // AT_SHORT2
	        Uint16Array    // AT_SHORT4
	    ],
	    TYPE_SIZE: [
	        0,  // AT_NONE
	        4,  // AT_FLOAT1
	        8,  // AT_FLOAT2
	        12, // AT_FLOAT3
	        16, // AT_FLOAT4
	        4,  // AT_UBYTE4
	        2,  // AT_SHORT1
	        4,  // AT_SHORT2
	        8   // AT_SHORT4
	    ],
	    NUM_COMPONENTS: [
	        0,  // AT_NONE
	        1,  // AT_FLOAT1
	        2,  // AT_FLOAT2
	        3,  // AT_FLOAT3
	        4,  // AT_FLOAT4
	        4,  // AT_UBYTE4
	        1,  // AT_SHORT1
	        2,  // AT_SHORT2
	        4   // AT_SHORT4
	    ]
	});

	class GLVertexFormat {
	    /**
	     * @param {WebGL2RenderingContext} gl
	     * @param {VertexFormat} format
	     */
	    constructor(gl, format) {
	        this.stride = format.stride;

	        let type;

	        let i = format.getIndex(VertexFormat$1.AU_POSITION);
	        if (i >= 0) {
	            this.hasPosition = 1;
	            type = format.getAttributeType(i);
	            this.positionType = mapping.AttributeType[type]; // 属性元素类型
	            this.positionChannels = mapping.AttributeChannels[type]; // 属性元素数量
	            this.positionOffset = format.getOffset(i);
	        } else {
	            this.hasPosition = 0;
	            this.positionChannels = 0;  // 属性元素数量
	            this.positionType = 0;  // 属性类型
	            this.positionOffset = 0;  // 属性偏移量
	        }

	        i = format.getIndex(VertexFormat$1.AU_NORMAL);
	        if (i >= 0) {
	            this.hasNormal = 1;
	            type = format.getAttributeType(i);
	            this.normalType = mapping.AttributeType[type];
	            this.normalChannels = mapping.AttributeChannels[type];
	            this.normalOffset = format.getOffset(i);
	        } else {
	            this.hasNormal = 0;
	            this.normalChannels = 0;
	            this.normalType = 0;
	            this.normalOffset = 0;
	        }

	        i = format.getIndex(VertexFormat$1.AU_TANGENT);
	        if (i >= 0) {
	            this.hasTangent = 1;
	            type = format.getAttributeType(i);
	            this.tangentType = mapping.AttributeType[type];
	            this.tangentChannels = mapping.AttributeChannels[type];
	            this.tangentOffset = format.getOffset(i);
	        } else {
	            this.hasTangent = 0;
	            this.tangentChannels = 0;
	            this.tangentType = 0;
	            this.tangentOffset = 0;
	        }

	        i = format.getIndex(VertexFormat$1.AU_BINORMAL);
	        if (i >= 0) {
	            this.hasBinormal = 1;
	            type = format.getAttributeType(i);
	            this.binormalType = mapping.AttributeType[type];
	            this.binormalChannels = mapping.AttributeChannels[type];
	            this.binormalOffset = format.getOffset(i);
	        }
	        else {
	            this.hasBinormal = 0;
	            this.binormalType = 0;
	            this.binormalChannels = 0;
	            this.binormalOffset = 0;
	        }

	        let unit;
	        const AM_MAX_TCOORD_UNITS = VertexFormat$1.MAX_TCOORD_UNITS;

	        this.hasTCoord = new Array(AM_MAX_TCOORD_UNITS);
	        this.tCoordChannels = new Array(AM_MAX_TCOORD_UNITS);
	        this.tCoordType = new Array(AM_MAX_TCOORD_UNITS);
	        this.tCoordOffset = new Array(AM_MAX_TCOORD_UNITS);

	        for (unit = 0; unit < AM_MAX_TCOORD_UNITS; ++unit) {
	            i = format.getIndex(VertexFormat$1.AU_TEXCOORD, unit);
	            if (i >= 0) {
	                this.hasTCoord[unit] = 1;
	                type = format.getAttributeType(i);
	                this.tCoordType[unit] = mapping.AttributeType[type];
	                this.tCoordChannels[unit] = mapping.AttributeChannels[type];
	                this.tCoordOffset[unit] = format.getOffset(i);
	            } else {
	                this.hasTCoord[unit] = 0;
	                this.tCoordType[unit] = 0;
	                this.tCoordChannels[unit] = 0;
	                this.tCoordOffset[unit] = 0;
	            }
	        }

	        const AM_MAX_COLOR_UNITS = VertexFormat$1.MAX_COLOR_UNITS;
	        this.hasColor = new Array(AM_MAX_COLOR_UNITS);
	        this.colorChannels = new Array(AM_MAX_COLOR_UNITS);
	        this.colorType = new Array(AM_MAX_COLOR_UNITS);
	        this.colorOffset = new Array(AM_MAX_COLOR_UNITS);
	        for (unit = 0; unit < AM_MAX_COLOR_UNITS; ++unit) {
	            i = format.getIndex(VertexFormat$1.AU_COLOR, unit);
	            if (i >= 0) {
	                this.hasColor[unit] = 1;
	                type = format.getAttributeType(i);
	                this.colorType[unit] = mapping.AttributeType[type];
	                this.colorChannels[unit] = mapping.AttributeChannels[type];
	                this.colorOffset[unit] = format.getOffset(i);
	            } else {
	                this.hasColor[unit] = 0;
	                this.colorType[unit] = 0;
	                this.colorChannels[unit] = 0;
	                this.colorOffset[unit] = 0;
	            }
	        }

	        i = format.getIndex(VertexFormat$1.AU_BLENDINDICES);
	        if (i >= 0) {
	            this.hasBlendIndices = 1;
	            type = format.getAttributeType(i);
	            this.blendIndicesChannels = mapping.AttributeChannels[type];
	            this.blendIndicesType = mapping.AttributeType[type];
	            this.blendIndicesOffset = format.getOffset(i);
	        }
	        else {
	            this.hasBlendIndices = 0;
	            this.blendIndicesType = 0;
	            this.blendIndicesChannels = 0;
	            this.blendIndicesOffset = 0;
	        }

	        i = format.getIndex(VertexFormat$1.AU_BLENDWEIGHT);
	        if (i >= 0) {
	            this.hasBlendWeight = 1;
	            type = format.getAttributeType(i);
	            this.blendWeightType = mapping.AttributeType[type];
	            this.blendWeightChannels = mapping.AttributeChannels[type];
	            this.blendWeightOffset = format.getOffset(i);
	        }
	        else {
	            this.hasBlendWeight = 0;
	            this.blendWeightType = 0;
	            this.blendWeightChannels = 0;
	            this.blendWeightOffset = 0;
	        }

	        i = format.getIndex(VertexFormat$1.AU_FOGCOORD);
	        if (i >= 0) {
	            this.hasFogCoord = 1;
	            type = format.getAttributeType(i);
	            this.fogCoordType = mapping.AttributeType[type];
	            this.fogCoordChannels = mapping.AttributeChannels[type];
	            this.fogCoordOffset = format.getOffset(i);
	        } else {
	            this.hasFogCoord = 0;
	            this.fogCoordChannels = 0;
	            this.fogCoordType = 0;
	            this.fogCoordOffset = 0;
	        }

	        i = format.getIndex(VertexFormat$1.AU_PSIZE);
	        if (i >= 0) {
	            this.hasPSize = 1;
	            type = format.getAttributeType(i);
	            this.pSizeType = mapping.AttributeType[type];
	            this.pSizeChannels = mapping.AttributeChannels[type];
	            this.pSizeOffset = format.getOffset(i);
	        } else {
	            this.hasPSize = 0;
	            this.pSizeType = 0;
	            this.pSizeChannels = 0;
	            this.pSizeOffset = 0;
	        }
	    }

	    /**
	     * @param {WebGL2RenderingContext} gl
	     */
	    enable(gl) {
	        // Use the enabled vertex buffer for data pointers.

	        const stride = this.stride;
	        if (this.hasPosition) {
	            gl.enableVertexAttribArray(0);
	            gl.vertexAttribPointer(0, this.positionChannels, this.positionType, false, stride, this.positionOffset);
	        }

	        if (this.hasNormal) {
	            gl.enableVertexAttribArray(2);
	            gl.vertexAttribPointer(2, this.normalChannels, this.normalType, false, stride, this.normalOffset);
	        }

	        if (this.hasTangent) {
	            gl.enableVertexAttribArray(14);
	            gl.vertexAttribPointer(14, this.tangentChannels, this.tangentType, false, stride, this.tangentOffset);
	        }

	        if (this.hasBinormal) {
	            gl.enableVertexAttribArray(15);
	            gl.vertexAttribPointer(15, this.binormalChannels, this.binormalType, false, stride, this.normalOffset);
	        }

	        let unit;
	        for (unit = 0; unit < VertexFormat$1.MAX_TCOORD_UNITS; ++unit) {
	            if (this.hasTCoord[unit]) {
	                gl.activeTexture(gl.TEXTURE0 + unit);
	                gl.enableVertexAttribArray(8 + unit);
	                gl.vertexAttribPointer(8 + unit, this.tCoordChannels[unit], this.tCoordType[unit], false, stride, this.tCoordOffset[unit]);
	            }
	        }

	        if (this.hasColor[0]) {
	            gl.enableVertexAttribArray(3);
	            gl.vertexAttribPointer(3, this.colorChannels[0], this.colorType[0], false, stride, this.colorOffset[0]);
	        }

	        if (this.hasColor[1]) {
	            gl.enableVertexAttribArray(4);
	            gl.vertexAttribPointer(4, this.colorChannels[1], this.colorType[1], false, stride, this.colorOffset[1]);
	        }

	        if (this.hasBlendIndices) {
	            gl.enableVertexAttribArray(7);
	            gl.vertexAttribPointer(7, this.blendIndicesChannels, this.blendIndicesType, false, stride, this.blendIndicesOffset);
	        }

	        if (this.hasBlendWeight) {
	            gl.enableVertexAttribArray(1);
	            gl.vertexAttribPointer(1, this.blendWeightChannels, this.blendWeightType, false, stride, this.blendWeightOffset);
	        }

	        if (this.hasFogCoord) {
	            gl.enableVertexAttribArray(5);
	            gl.vertexAttribPointer(5, this.fogCoordChannels, this.fogCoordType, false, stride, this.fogCoordOffset);
	        }

	        if (this.hasPSize) {
	            gl.enableVertexAttribArray(6);
	            gl.vertexAttribPointer(6, this.pSizeChannels, this.pSizeType, false, stride, this.pSizeOffset);
	        }
	    }
	}

	class GLVertexArray {

	    /**
	     * @param {WebGL2RenderingContext} gl 
	     * @param {VertexBuffer} buffer
	     * @param {GLVertexFormat} format
	     */
	    constructor(gl, buffer, format) {
	        this.vao = gl.createVertexArray();
	        this.buffer = gl.createBuffer();

	        gl.bindVertexArray(this.vao);
	        this._upload(gl, buffer, format);
	        /*gl.bindVertexArray(null);*/
	    }

	    _upload(gl, buffer, format) {
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	        gl.bufferData(gl.ARRAY_BUFFER, buffer.getData(), mapping.BufferUsage[buffer.usage]);
	        format.enable(gl);
	    }

	    enable(gl) { gl.bindVertexArray(this.vao); }

	    disable(gl) { /*gl.bindVertexArray(null);*/ }

	    /**
	     * @param {WebGL2RenderingContext} gl
	     * @param {VertexBuffer} buffer
	     * @param {GLVertexFormat} format
	     */
	    update(gl, buffer, format) {
	        gl.bindVertexArray(this.vao);
	        this._upload(gl, buffer, format);
	        gl.bindVertexArray(0);
	    }

	    destructor() {
	        gl.deleteVertexArray(this.vao);
	    }
	}

	class GLIndexBuffer {

	    /**
	     * @param {WebGL2RenderingContext} gl 
	     * @param {Buffer} buffer 
	     */
	    constructor(gl, buffer) {
	        this.buffer = gl.createBuffer();
	        let dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), mapping.BufferUsage[buffer.usage]);
	    }

	    /**
	     * @param {WebGL2RenderingContext} gl
	     */
	    enable(gl) {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
	    }

	    update(gl, buffer) {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
	        let dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), mapping.BufferUsage[buffer.usage]);
	    }
	    /**
	     * @param {WebGL2RenderingContext} gl
	     */
	    disable(renderer) {
	        /*gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);*/
	    }
	}

	class GLTexture2D {

	    /**
	     * @param {WebGL2RenderingContext} gl 
	     * @param {Texture2D} texture
	     */
	    constructor(gl, texture) {
	        const _format = texture.format;

	        this.internalFormat = mapping.TextureInternalFormat[_format];
	        this.format = mapping.TextureFormat[_format];
	        this.type = mapping.TextureType[_format];

	        this.hasMipMap = texture.hasMipmaps;

	        this.width = texture.width;
	        this.height = texture.height;
	        this.isCompressed = texture.isCompressed();

	        this.static = texture.static;

	        // Create a texture structure.
	        this.texture = gl.createTexture();
	        gl.bindTexture(gl.TEXTURE_2D, this.texture);

	        // upload pixel with pbo
	        let pbo = gl.createBuffer();
	        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pbo);
	        gl.bufferData(gl.PIXEL_UNPACK_BUFFER, texture.getData(), gl.STATIC_DRAW, 0);
	        if (this.isCompressed) {
	            gl.compressedTexImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, 0);
	        } else {
	            gl.texImage2D(gl.TEXTURE_2D, /*level*/0, this.internalFormat, this.width, this.height, 0, this.format, this.type, 0);
	        }
	        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
	        gl.deleteBuffer(pbo);
	        this.hasMipMap && gl.generateMipmap(gl.TEXTURE_2D);
	    }

	    update(gl, textureUnit, data) {
	        if (this.static) {
	            return;
	        }
	        gl.activeTexture(gl.TEXTURE0 + textureUnit);
	        gl.bindTexture(gl.TEXTURE_2D, this.texture);

	        let pbo = gl.createBuffer();
	        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pbo);
	        gl.bufferData(gl.PIXEL_UNPACK_BUFFER, data, gl.STATIC_DRAW, 0);
	        if (this.isCompressed) {
	            gl.compressedTexImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, 0);
	        } else {
	            gl.texImage2D(gl.TEXTURE_2D, /*level*/0, this.internalFormat, this.width, this.height, 0, this.format, this.type, 0);
	        }
	        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
	        gl.deleteBuffer(pbo);
	        this.hasMipMap && gl.generateMipmap(gl.TEXTURE_2D);
	    }

	    enable(gl, textureUnit) {
	        gl.activeTexture(gl.TEXTURE0 + textureUnit);
	        gl.bindTexture(gl.TEXTURE_2D, this.texture);
	    }

	    disable(gl, textureUnit) {
	        // gl.activeTexture(gl.TEXTURE0 + textureUnit);
	        // gl.bindTexture(gl.TEXTURE_2D, null);
	    }
	}

	class AlphaState extends D3Object {

	    constructor() {
	        super();
	        this.blendEnabled = false;
	        this.srcBlend = AlphaState.BM_SRC_ALPHA;
	        this.dstBlend = AlphaState.BM_ONE_MINUS_SRC_ALPHA;
	        this.constantColor = new Float32Array([0, 0, 0, 0]);
	    }

	    load(inStream) {
	        super.load(inStream);
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
	        else if (this.dstBlend >= 4) {
	            this.dstBlend += 2;
	        }
	        this.constantColor = new Float32Array(inStream.readFloat32Range(4));
	    }

	    static factory(inStream) {
	        let obj = new AlphaState();
	        obj.load(inStream);
	        return obj;
	    }

	}

	/* blend mode */
	DECLARE_ENUM(AlphaState, {
	    BM_ZERO: 0,
	    BM_ONE: 1,
	    BM_SRC_COLOR: 2, // can be assign to AlphaState.dstBlend only
	    BM_ONE_MINUS_SRC_COLOR: 3, // can be assign to AlphaState.dstBlend only
	    BM_DST_COLOR: 4, // can be assign to AlphaState.srcBlend only
	    BM_ONE_MINUS_DST_COLOR: 5, // can be assign to AlphaState.srcBlend only
	    BM_SRC_ALPHA: 6,
	    BM_ONE_MINUS_SRC_ALPHA: 7,
	    BM_DST_ALPHA: 8,
	    BM_ONE_MINUS_DST_ALPHA: 9,
	    BM_SRC_ALPHA_SATURATE: 10, // can be assign to AlphaState.srcBlend only
	    BM_CONSTANT_COLOR: 11,
	    BM_ONE_MINUS_CONSTANT_COLOR: 12,
	    BM_CONSTANT_ALPHA: 13,
	    BM_ONE_MINUS_CONSTANT_ALPHA: 14
	});

	D3Object.Register('AlphaState', AlphaState.factory);

	class CullState extends D3Object {

	    constructor() {
	        super();
	        this.enabled = true;
	        this.CCWOrder = true;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.enabled = inStream.readBool();
	        this.CCWOrder = inStream.readBool();
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writeBool(this.enabled);
	        outStream.writeBool(this.CCWOrder);
	    }

	    static factory(inStream) {
	        let obj = new CullState();
	        obj.enabled = false;
	        obj.CCWOrder = false;
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('CullState', CullState.factory);

	class DepthState extends D3Object {
	    constructor() {
	        super();
	        this.enabled = true;
	        this.writable = true;
	        this.compare = DepthState.COMPARE_MODE_LESS;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.enabled = inStream.readBool();
	        this.writable = inStream.readBool();
	        this.compare = inStream.readEnum();
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writeBool(this.enabled);
	        outStream.writeBool(this.writable);
	        outStream.writeEnum(this.compare);
	    }

	    static factory(inStream) {
	        var obj = new DepthState();
	        obj.enabled = false;
	        obj.writable = false;
	        obj.compare = DepthState.COMPARE_MODE_NEVER;
	        obj.load(inStream);
	        return obj;
	    }
	}

	// 比较模式
	DECLARE_ENUM(DepthState, {
	    COMPARE_MODE_NEVER: 0,
	    COMPARE_MODE_LESS: 1,
	    COMPARE_MODE_EQUAL: 2,
	    COMPARE_MODE_LEQUAL: 3,
	    COMPARE_MODE_GREATER: 4,
	    COMPARE_MODE_NOTEQUAL: 5,
	    COMPARE_MODE_GEQUAL: 6,
	    COMPARE_MODE_ALWAYS: 7
	});

	D3Object.Register('CullState', DepthState.factory);

	class OffsetState extends D3Object {

	    constructor() {
	        super();
	        this.fillEnabled = false;
	        // The offset is Scale*dZ + Bias*r where dZ is the change in depth
	        // relative to the screen space area of the poly, and r is the smallest
	        // resolvable depth difference.  Negative values move polygons closer to
	        // the eye.
	        this.scale = 0;
	        this.bias = 0;
	    }

	    load(inStream) {
	        super.load(inStream);

	        this.fillEnabled = inStream.readBool();
	        this.scale = inStream.readFloat32();
	        this.bias = inStream.readFloat32();
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writeBool(this.fillEnabled);
	        outStream.writeFloat32(this.scale);
	        outStream.writeFloat32(this.bias);
	    }

	    static factory(inStream) {
	        let obj = new OffsetState();
	        obj.load(inStream);
	        return obj;
	    }

	}

	D3Object.Register('OffsetState', OffsetState.factory);

	class StencilState extends D3Object {

	    constructor() {
	        super();
	        this.mask = 0xffffffff;       // default: unsigned int max
	        this.writeMask = 0xffffffff;  // default: unsigned int max
	        this.onFail = StencilState.OP_KEEP;
	        this.onZFail = StencilState.OP_KEEP;
	        this.onZPass = StencilState.OP_KEEP;

	        this.enabled = false;
	        this.compare = StencilState.NEVER;
	        this.reference = 0;     // [0,1]
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.enabled = inStream.readBool();
	        this.compare = inStream.readEnum();
	        this.reference = inStream.readUint32();
	        this.mask = inStream.readUint32();
	        this.writeMask = inStream.readUint32();
	        this.onFail = inStream.readEnum();
	        this.onZFail = inStream.readEnum();
	        this.onZPass = inStream.readEnum();
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writeBool(this.enabled);
	        outStream.writeEnum(this.compare);
	        outStream.writeUint32(this.reference);
	        outStream.writeUint32(this.mask);
	        outStream.writeUint32(this.writeMask);
	        outStream.writeEnum(this.onFail);
	        outStream.writeEnum(this.onZFail);
	        outStream.writeEnum(this.onZPass);
	    }

	    static factory(inStream) {
	        let obj = new StencilState();
	        obj.mask = 0;
	        obj.writeMask = 0;
	        obj.load(inStream);
	        return obj;
	    }
	}

	// 操作类型
	DECLARE_ENUM(StencilState, {
	    OP_KEEP: 0,
	    OP_ZERO: 1,
	    OP_REPLACE: 2,
	    OP_INCREMENT: 3,
	    OP_DECREMENT: 4,
	    OP_INVERT: 5
	}, false);

	// 比较模式
	DECLARE_ENUM(StencilState, {
	    NEVER: 0,
	    LESS: 1,
	    EQUAL: 2,
	    LEQUAL: 3,
	    GREATER: 4,
	    NOTEQUAL: 5,
	    GEQUAL: 6,
	    ALWAYS: 7
	});

	D3Object.Register('StencilState', StencilState.factory);

	class GLRenderState {
		constructor() {
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
		}

	    /**
		 * @param {WebGL2RenderingContext} gl
		 * @param {AlphaState} alphaState
		 * @param {CullState} cullState
		 * @param {DepthState} depthState
		 * @param {OffsetState} offsetState
		 * @param {StencilState} stencilState
	 	*/
		initialize(gl, alphaState, cullState, depthState, offsetState, stencilState) {
			let op = ['disable', 'enable'];



			// CullState
			this.cullEnabled = cullState.enabled;
			this.CCWOrder = cullState.CCWOrder;

			gl[op[this.cullEnabled | 0]](gl.CULL_FACE);
			gl.frontFace(gl.CCW);
			gl.cullFace(this.CCWOrder ? gl.BACK : gl.FRONT);

			// DepthState
			this.depthEnabled = depthState.enabled;
			this.depthWriteEnabled = depthState.writable;
			this.depthCompareFunction = mapping.DepthCompare[depthState.compare];

			gl[op[this.depthEnabled | 0]](gl.DEPTH_TEST);
			gl.depthMask(this.depthWriteEnabled);
			gl.depthFunc(this.depthCompareFunction);

			// AlphaState
			this.alphaBlendEnabled = alphaState.blendEnabled;
			this.alphaSrcBlend = mapping.AlphaBlend[alphaState.srcBlend];
			this.alphaDstBlend = mapping.AlphaBlend[alphaState.dstBlend];
			this.blendColor = alphaState.constantColor;
			gl[op[this.alphaBlendEnabled | 0]](gl.BLEND);
			gl.blendFunc(this.alphaSrcBlend, this.alphaDstBlend);
			gl.blendColor(this.blendColor[0], this.blendColor[1], this.blendColor[2], this.blendColor[3]);
			
			// OffsetState
			this.fillEnabled = offsetState.fillEnabled;
			this.offsetScale = offsetState.scale;
			this.offsetBias = offsetState.bias;

			gl[op[this.fillEnabled | 0]](gl.POLYGON_OFFSET_FILL);
			gl.polygonOffset(this.offsetScale, this.offsetBias);

			// StencilState
			this.stencilEnabled = stencilState.enabled;
			this.stencilCompareFunction = mapping.StencilCompare[stencilState.compare];
			this.stencilReference = stencilState.reference;
			this.stencilMask = stencilState.mask;
			this.stencilWriteMask = stencilState.writeMask;
			this.stencilOnFail = mapping.StencilOperation[stencilState.onFail];
			this.stencilOnZFail = mapping.StencilOperation[stencilState.onZFail];
			this.stencilOnZPass = mapping.StencilOperation[stencilState.onZPass];

			gl[op[this.stencilEnabled | 0]](gl.STENCIL_TEST);
			gl.stencilFunc(this.stencilCompareFunction, this.stencilReference, this.stencilMask);
			gl.stencilMask(this.stencilWriteMask);
			gl.stencilOp(this.stencilOnFail, this.stencilOnZFail, this.stencilOnZPass);
		}
	}

	// import { GLSamplerState } from './GLSamplerState';

	/**
	 * Display list base indices for fonts/characters.
	 */
	// class DisplayListInfo {
	//     constructor() {
	//         this.quantity = 1;  // number of display lists, input to glGenLists
	//         this.start = 0;     // start index, output from glGenLists
	//         this.base = 0;      // base index for glListBase
	//     }
	// }

	class GLRenderData {
	    constructor() {
	        /**
	         * @type {GLRenderState}
	         */
	        this.currentRS = new GLRenderState();

	        const m = GLRenderData.MAX_NUM_PSAMPLERS;
	        // /**
	        //  * @type {Array<GLSamplerState>}
	        //  */
	        // this.currentSS = new Array(m);
	        // for (let i = 0; i < m; ++i) {
	        //     this.currentSS[i] = new GLSamplerState();
	        // }

	        // Capabilities (queried at run time).
	        this.maxVShaderImages = 0;
	        this.maxFShaderImages = 0;
	        this.maxCombinedImages = 0;

	        /**
	         * @type {DisplayListInfo}
	         */
	        // this.font = new DisplayListInfo();
	    }

	    drawCharacter(font, c) {
	    }
	}

	GLRenderData.MAX_NUM_VSAMPLERS = 4;  // VSModel 3 has 4, VSModel 2 has 0.
	GLRenderData.MAX_NUM_PSAMPLERS = 16;  // PSModel 2 and PSModel 3 have 16.

	class GLSampler {
	    /**
	     * 
	     * @param {WebGL2RenderingContext} gl 
	     * @param {SamplerState} sampler
	     */
	    constructor(gl, sampler) {
	        this.minFilter = sampler.minFilter;
			this.magFilter = sampler.magFilter;

			this.wrapS = sampler.wrapS;
			this.wrapT = sampler.wrapT;
			this.wrapR = sampler.wrapR;
			
	        this.compare = sampler.compare;
			this.mode = sampler.mode;

			this.maxAnisotropy = sampler.maxAnisotropy;
			this.minLod = sampler.minLod;
			this.maxLod = sampler.maxLod;

	        this.sampler = gl.createSampler();
	        if (this.minFilter !== gl.NEAREST_MIPMAP_LINEAR) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_FILTER, this.minFilter);
	        }
	        if (this.magFilter !== gl.LINEAR) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_MAG_FILTER, this.magFilter);
	        }

	        if (this.wrapS !== gl.REPEAT) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_S, this.wrapS);
	        }
	        if (this.wrapT !== gl.REPEAT) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_T, this.wrapT);
	        }
	        if (this.wrapR !== gl.REPEAT) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_R, this.wrapR);
	        }

	        if (this.compare !== gl.LEQUAL) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_COMPARE_FUNC, this.compare);
	        }
	        if (this.mode !== gl.NONE) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_COMPARE_MODE, this.mode);
	        }
	        
	        if (this.minLod !== gl.getSamplerParameter(this.sampler, gl.TEXTURE_MIN_LOD)) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_LOD, this.minLod);
	        }
	        if (this.maxLod !== gl.getSamplerParameter(this.sampler, gl.TEXTURE_MAX_LOD)) {
	            gl.samplerParameteri(this.sampler, gl.TEXTURE_MAX_LOD, this.maxLod);
	        }
	    }

	    enable(gl, textureUnit) {
	        gl.bindSampler(textureUnit, this.sampler);
	    }
	    
	    /**
	     * Get the state of the currently enabled texture.  This state appears
	     * to be associated with the OpenGL texture object.  How does this
	     * relate to the sampler state?  In my opinion, OpenGL needs to have
	     * the sampler state separate from the texture object state.
	     *
	     * @param {Renderer} renderer
	     * @param target
	     */
	    getCurrent(renderer, target) {
	        let gl = renderer.gl;

	        // EXT_Texture_Filter_Anisotropic
	        this.anisotropy = gl.getTexParameter(target, mapping.TEXTURE_MAX_ANISOTROPY_EXT);

	        this.magFilter = gl.getTexParameter(target, gl.TEXTURE_MAG_FILTER);
	        this.minFilter = gl.getTexParameter(target, gl.TEXTURE_MIN_FILTER);
	        this.wrap[0] = gl.getTexParameter(target, gl.TEXTURE_WRAP_S);
	        this.wrap[1] = gl.getTexParameter(target, gl.TEXTURE_WRAP_T);
	        this.wrap[2] = gl.getTexParameter(target, gl.TEXTURE_WRAP_R);
	    }
	}

	class GLProgram {

	    /**
	     * @param {Renderer} renderer
	     * @param {Program} program 
	     * @param {GLVertexShader} vs 
	     * @param {GLFragShader} fs 
	     */
	    constructor(renderer, program, vs, fs) {
	        let gl = renderer.gl;
	        let p = gl.createProgram();
	        gl.attachShader(p, vs.shader);
	        gl.attachShader(p, fs.shader);
	        gl.linkProgram(p);
	        console.assert(
	            gl.getProgramParameter(p, gl.LINK_STATUS),
	            gl.getProgramInfoLog(p)
	        );
	        gl.deleteShader(vs.shader);
	        gl.deleteShader(fs.shader);

	        this.program = p;
	        gl.useProgram(p);
	        let uniformsLength = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS),
	            item, name, i;

	        for (i = 0; i < uniformsLength; ++i) {
	            item = gl.getActiveUniform(p, i);
	            name = item.name;
	            program.inputMap.set(name, gl.getUniformLocation(p, name));
	        }
	    }
	    /**
	     * @param {Renderer} renderer
	     */
	    free(renderer) {
	        renderer.gl.deleteProgram(this.program);
	    }
	    /**
	     * @param {Renderer} renderer
	     */
	    enable(renderer) {
	        renderer.gl.useProgram(this.program);
	    }
	    /**
	     * @param {Renderer} renderer
	     */
	    disable(renderer) {
	        //renderer.gl.useProgram(null);
	    }
	}

	class GLExtensions {
	    static init(gl) {
	        gl.getSupportedExtensions().forEach(function (name) {
	            if (name.match(/^(?:WEBKIT_)|(?:MOZ_)/)) {
	                return;
	            }
	            gl.getExtension(name);
	        });
	    }
	}

	class Program extends D3Object {

	    /**
	     * @param {string} name
	     * @param {VertexShader} vs
	     * @param {FragShader} fs
	     */
	    constructor(name, vs, fs) {
	        super(name);
	        this.vertexShader = vs;
	        this.fragShader = fs;
	        this.inputMap = new Map();
	    }
	}

	class FragShader extends Shader { }
	D3Object.Register('FragShader', FragShader.factory.bind(FragShader));

	class VertexShader extends Shader { }
	D3Object.Register('VertexShader', VertexShader.factory.bind(VertexShader));

	class ShaderParameters extends D3Object {

	    /**
	     * @param {Shader} shader
	     * @param {boolean} [__privateCreate] 
	     */
	    constructor(shader, __privateCreate = false) {
	        super();
	        if (!__privateCreate) {
	            console.assert(shader !== null, 'Shader must be specified.');

	            /**
	             * @type {L5.Shader}
	             */
	            this.shader = shader;

	            let nc = shader.numConstants;
	            this.numConstants = nc;

	            if (nc > 0) {
	                /**
	                 * @type {Array<ShaderFloat>}
	                 */
	                this.constants = new Array(nc);
	            } else {
	                this.constants = null;
	            }

	            let ns = shader.numSamplers;
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
	    }



	    // These functions set the constants/textures.  If successful, the return
	    // value is nonnegative and is the index into the appropriate array.  This
	    // index may passed to the Set* functions that have the paremeter
	    // 'handle'.  The mechanism allows you to set directly by index and avoid
	    // the name comparisons that occur with the Set* functions that have the
	    // parameter 'const std::string& name'.
	    /**
	     * @param {string} name
	     * @param {Array} sfloat
	     * @return {number}
	     */
	    setConstantByName(name, sfloat) {
	        let i, m = this.numConstants, shader = this.shader;

	        for (i = 0; i < m; ++i) {
	            if (shader.getConstantName(i) === name) {
	                this.constants[i] = sfloat;
	                return i;
	            }
	        }

	        console.assert(false, 'Cannot find constant.');
	        return -1;
	    }

	    /**
	     * @param {number} handle
	     * @param {Array} sfloat
	     * @return {number}
	     */
	    setConstant(handle, sfloat) {
	        if (0 <= handle && handle < this.numConstants) {
	            this.constants[handle] = sfloat;
	            return handle;
	        }
	        console.assert(false, 'Invalid constant handle.');
	        return -1;
	    }

	    /**
	     * @param {string} name
	     * @param {Texture} texture
	     * @returns {number}
	     */
	    setTextureByName(name, texture) {
	        let i, m = this.numTextures, shader = this.shader;

	        for (i = 0; i < m; ++i) {
	            if (shader.getSamplerName(i) === name) {
	                this.textures[i] = texture;
	                return i;
	            }
	        }

	        console.assert(false, 'Cannot find texture.');
	        return -1;
	    }

	    /**
	     * @param {number} handle
	     * @param {Texture} texture
	     * @returns {number}
	     */
	    setTexture(handle, texture) {
	        if (0 <= handle && handle < this.numTextures) {
	            this.textures[handle] = texture;
	            return handle;
	        }
	        console.assert(false, 'Invalid texture handle.');
	        return -1;
	    }

	    /**
	     * @param {string} name
	     * @returns {ArrayBuffer}
	     */
	    getConstantByName(name) {
	        let i, m = this.numConstants, shader = this.shader;
	        for (i = 0; i < m; ++i) {
	            if (shader.getConstantName(i) === name) {
	                return this.constants[i];
	            }
	        }

	        console.assert(false, 'Cannot find constant.');
	        return null;
	    }

	    /**
	     * @param {string} name
	     * @returns {Texture}
	     */
	    getTextureByName(name) {
	        let i, m = this.numTextures, shader = this.shader;
	        for (i = 0; i < m; ++i) {
	            if (shader.getSamplerName(i) === name) {
	                return this.textures[i];
	            }
	        }

	        console.assert(false, 'Cannot find texture.');
	        return null;
	    }

	    /**
	     * @param {number} index
	     * @returns {ArrayBuffer}
	     */
	    getConstant(index) {
	        if (0 <= index && index < this.numConstants) {
	            return this.constants[index];
	        }

	        console.assert(false, 'Invalid constant handle.');
	        return null;
	    }

	    /**
	     * @param {number} index
	     * @returns {Texture}
	     */
	    getTexture(index) {
	        if (0 <= index && index < this.numTextures) {
	            return this.textures[index];
	        }

	        console.assert(false, 'Invalid texture handle.');
	        return null;
	    }

	    /**
	     * @param {Visual} visual
	     * @param {Camera} camera
	     */
	    updateConstants(visual, camera) {
	        let constants = this.constants,
	            i, m = this.numConstants;
	        for (i = 0; i < m; ++i) {
	            let constant = constants[i];
	            if (constant.allowUpdater) {
	                constant.update(visual, camera);
	            }
	        }
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.shader = inStream.readPointer();
	        this.constants = inStream.readPointerArray();
	        this.numConstants = this.constants.length;
	        this.textures = inStream.readPointerArray();
	        this.numTextures = this.textures.length;
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.shader = inStream.resolveLink(this.shader);
	        this.constants = inStream.resolveArrayLink(this.numConstants, this.constants);
	        this.textures = inStream.resolveArrayLink(this.numTextures, this.textures);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.shader);
	        outStream.writePointerArray(this.numConstants, this.constants);
	        outStream.writePointerArray(this.numTextures, this.textures);
	    }

	    static factory(inStream) {
	        let obj = new ShaderParameters(null, true);
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('ShaderParameters', ShaderParameters.factory.bind(ShaderParameters));

	class VisualEffect extends D3Object {

	    constructor() {
	        super('VisualEffect');
	        this.techniques = [];
	    }

	    /**
	     * @param {VisualTechnique} technique
	     */
	    insertTechnique(technique) {
	        if (technique) {
	            this.techniques.push(technique);
	        }
	        else {
	            console.warn('Input to insertTechnique must be nonnull.');
	        }
	    }

	    /**
	     * @returns {number}
	     */
	    getNumTechniques() {
	        return this.techniques.length;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @returns {number}
	     */
	    getNumPasses(techniqueIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getNumPass();
	        }
	        console.warn('Invalid index in getNumPasses.');
	        return 0;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @returns {VisualTechnique}
	     */
	    getTechnique(techniqueIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex];
	        }
	        console.warn('Invalid index in getTechnique.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {VisualPass}
	     */
	    getPass(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getPass(passIndex);
	        }
	        console.warn('Invalid index in GetPass.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {VertexShader}
	     */
	    getVertexShader(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getVertexShader(passIndex);
	        }

	        console.warn('Invalid index in getVertexShader.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {FragShader}
	     */
	    getFragShader(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getFragShader(passIndex);
	        }

	        console.warn('Invalid index in getFragShader.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {AlphaState}
	     */
	    getAlphaState(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getAlphaState(passIndex);
	        }

	        console.warn('Invalid index in getAlphaState.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {CullState}
	     */
	    getCullState(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getCullState(passIndex);
	        }

	        console.warn('Invalid index in getCullState.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {DepthState}
	     */
	    getDepthState(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getDepthState(passIndex);
	        }

	        console.warn('Invalid index in getDepthState.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {OffsetState}
	     */
	    getOffsetState(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getOffsetState(passIndex);
	        }

	        console.warn('Invalid index in getOffsetState.');
	        return null;
	    }

	    /**
	     * @param {number} techniqueIndex
	     * @param {number} passIndex
	     * @returns {StencilState}
	     */
	    getStencilState(techniqueIndex, passIndex) {
	        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
	            return this.techniques[techniqueIndex].getStencilState(passIndex);
	        }

	        console.warn('Invalid index in getStencilState.');
	        return null;
	    }

	    load(inStream) {
	        super.load(inStream);

	        var numTechniques = inStream.readUint32();
	        this.techniques.length = numTechniques;
	        this.techniques = inStream.readSizedPointerArray(numTechniques);
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.techniques.forEach(function (t, i) {
	            this.techniques[i] = inStream.resolveLink(t);
	        }, this);
	    }
	}

	class VisualEffectInstance extends D3Object {
	    /**
	     * @param {VisualEffect} effect
	     * @param {number} techniqueIndex
	     * @param {boolean} _privateCreate
	     */
	    constructor(effect, techniqueIndex, _privateCreate = false) {
	        super();
	        if (!_privateCreate) {
	            console.assert(effect !== null, 'effect must be specified.');
	            console.assert(0 <= techniqueIndex && techniqueIndex < effect.getNumTechniques(),
	                'Invalid technique index.');

	            /**
	             * @type {VisualEffect}
	             */
	            this.effect = effect;
	            this.techniqueIndex = techniqueIndex;

	            let technique = effect.getTechnique(techniqueIndex);
	            let numPasses = technique.getNumPasses();

	            this.numPasses = numPasses;
	            this.vertexParameters = new Array(numPasses);
	            this.fragParameters = new Array(numPasses);

	            for (let p = 0; p < numPasses; ++p) {
	                let pass = technique.getPass(p);
	                this.vertexParameters[p] = new ShaderParameters(pass.getVertexShader());
	                this.fragParameters[p] = new ShaderParameters(pass.getFragShader());
	            }
	        }
	        else {
	            this.effect = null;
	            this.techniqueIndex = 0;
	            this.numPasses = 0;
	            this.vertexParameters = null;
	            this.fragParameters = null;
	        }
	    }

	    getNumPasses() {
	        return this.effect.getTechnique(this.techniqueIndex).getNumPasses();
	    }

	    /**
	     * @param {number} pass
	     * @returns {VisualPass}
	     */
	    getPass(pass) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.effect.getTechnique(this.techniqueIndex).getPass(pass);
	        }

	        console.assert(false, 'Invalid pass index.');
	        return null;
	    }

	    /**
	     * @param {number} pass
	     * @returns {ShaderParameters}
	     */
	    getVertexParameters(pass) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass];
	        }
	        console.assert(false, 'Invalid pass index.');
	        return null;
	    }

	    /**
	     * @param {number} pass
	     * @returns {ShaderParameters}
	     */
	    getFragParameters(pass) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass];
	        }
	        console.assert(false, 'Invalid pass index.');
	        return null;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @param {ShaderFloat} sfloat
	     * @returns {number}
	     */
	    setVertexConstantByName(pass, name, sfloat) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].setConstantByName(name, sfloat);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return -1;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @param {ShaderFloat} sfloat
	     * @returns {number}
	     */
	    setFragConstantByName(pass, name, sfloat) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].setConstantByName(name, sfloat);
	        }

	        console.assert(false, 'Invalid pass index.');
	        return -1;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @param {Texture} texture
	     * @returns {number}
	     */
	    setVertexTextureByName(pass, name, texture) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].setTextureByName(name, texture);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return -1;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @param {Texture} texture
	     * @returns {number}
	     */
	    setFragTextureByName(pass, name, texture) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].setTextureByName(name, texture);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return -1;
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @param {ShaderFloat} sfloat
	     */
	    setVertexConstant(pass, handle, sfloat) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].setConstant(handle, sfloat);
	        }
	        console.assert(false, 'Invalid pass index.');
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @param {ShaderFloat} sfloat
	     */
	    setFragConstant(pass, handle, sfloat) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].setConstant(handle, sfloat);
	        }
	        console.assert(false, 'Invalid pass index.');
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @param {Texture} texture
	     */
	    setVertexTexture(pass, handle, texture) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].setTexture(handle, texture);
	        }
	        console.assert(false, 'Invalid pass index.');
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @param {Texture} texture
	     */
	    setFragTexture(pass, handle, texture) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].setTexture(handle, texture);
	        }
	        console.assert(false, 'Invalid pass index.');
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @returns {ShaderFloat}
	     */
	    getVertexConstantByName(pass, name) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].getConstantByName(name);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return null;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @returns {ShaderFloat}
	     */
	    getFragConstantByName(pass, name) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].getConstantByName(name);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @returns {Texture}
	     */
	    getVertexTextureByName(pass, name) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].getTextureByName(name);
	        }

	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    /**
	     * @param {number} pass
	     * @param {string} name
	     * @returns {Texture}
	     */
	    getFragTextureByName(pass, name) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].getTextureByName(name);
	        }

	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @returns {ShaderFloat}
	     */
	    getVertexConstant(pass, handle) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].getConstant(handle);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @returns {ShaderFloat}
	     */
	    getFragConstant(pass, handle) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].getConstant(handle);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @returns {Texture}
	     */
	    getVertexTexture(pass, handle) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.vertexParameters[pass].getTexture(handle);
	        }
	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    /**
	     * @param {number} pass
	     * @param {number} handle
	     * @returns {Texture}
	     */
	    getFragTexture(pass, handle) {
	        if (0 <= pass && pass < this.numPasses) {
	            return this.fragParameters[pass].getTexture(handle);
	        }

	        console.assert(false, 'Invalid pass index.');
	        return 0;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.techniqueIndex = inStream.readUint32();
	        this.effect = inStream.readPointer();
	        this.vertexParameters = inStream.readPointerArray();
	        this.numPasses = this.vertexParameters.length;
	        this.fragParameters = inStream.readSizedPointerArray(this.numPasses);
	    }
	    link(inStream) {
	        super.link(inStream);
	        this.effect = inStream.resolveLink(this.effect);
	        this.vertexParameters = inStream.resolveArrayLink(this.numPasses, this.vertexParameters);
	        this.fragParameters = inStream.resolveArrayLink(this.numPasses, this.fragParameters);
	    }

	    save(inStream) {
	        super.save(inStream);
	        // todo: implement
	    }

	    static factory(inStream) {
	        let obj = new VisualEffectInstance(0, 0, true);
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('VisualEffectInstance', VisualEffectInstance.factory);

	class VisualPass extends D3Object {
	    constructor() {
	        super('VisualPass');
	        /**
	         * @type {Program}
	         */
	        this.program = null;
	        /**
	         * @type {AlphaState}
	         */
	        this.alphaState = null;
	        /**
	         * @type {CullState}
	         */
	        this.cullState = null;
	        /**
	         * @type {DepthState}
	         */
	        this.depthState = null;
	        /**
	         * @type {OffsetState}
	         */
	        this.offsetState = null;
	        /**
	         * @type {StencilState}
	         */
	        this.stencilState = null;
	    }

	    /**
	     * @returns {FragShader}
	     */
	    getFragShader() {
	        return this.program.fragShader;
	    }

	    /**
	     * @returns {VertexShader}
	     */
	    getVertexShader() {
	        return this.program.vertexShader;
	    }


	    load(inStream) {
	        super.load(inStream);
	        let vertexShader = inStream.readPointer();
	        let fragShader = inStream.readPointer();
	        this.program = new Program('Program', vertexShader, fragShader);
	        this.alphaState = inStream.readPointer();
	        this.cullState = inStream.readPointer();
	        this.depthState = inStream.readPointer();
	        this.offsetState = inStream.readPointer();
	        this.stencilState = inStream.readPointer();
	        this.wireState = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);

	        this.program.vertexShader = inStream.resolveLink(this.program.vertexShader);
	        this.program.fragShader = inStream.resolveLink(this.program.fragShader);

	        this.alphaState = inStream.resolveLink(this.alphaState);
	        this.cullState = inStream.resolveLink(this.cullState);
	        this.depthState = inStream.resolveLink(this.depthState);
	        this.offsetState = inStream.resolveLink(this.offsetState);
	        this.stencilState = inStream.resolveLink(this.stencilState);
	        this.wireState = inStream.resolveLink(this.wireState);
	    }

	    save(inStream) {
	        super.save(inStream);
	        // todo: implement
	    }

	    static factory(inStream) {
	        let obj = new VisualPass();
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('VisualPass', VisualPass.factory);

	class VisualTechnique extends D3Object {

	    constructor() {
	        super();

	        /**
	         * @type {Array<VisualPass>}
	         */
	        this.passes = [];
	    }

	    /**
	     * @param {VisualPass} pass
	     */
	    insertPass(pass) {
	        if (pass) {
	            this.passes.push(pass);
	        } else {
	            console.assert(false, 'Input to insertPass must be nonnull.');
	        }
	    }

	    /**
	     * @returns {number}
	     */
	    getNumPasses() {
	        return this.passes.length;
	    }

	    /**
	     * @returns {number|null}
	     */
	    getPass(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex];
	        }
	        console.warn("Invalid index in GetPass.");
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {VertexShader}
	     */
	    getVertexShader(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].getVertexShader();
	        }
	        console.warn('Invalid index in getVertexShader.');
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {FragShader}
	     */
	    getFragShader(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].getFragShader();
	        }
	        console.warn('Invalid index in getFragShader.');
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {AlphaState}
	     */
	    getAlphaState(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].alphaState;
	        }
	        console.warn('Invalid index in getAlphaState.');
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {CullState}
	     */
	    getCullState(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].cullState;
	        }
	        console.warn('Invalid index in getCullState.');
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {DepthState}
	     */
	    getDepthState(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].depthState;
	        }
	        console.warn('Invalid index in getDepthState.');
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {OffsetState}
	     */
	    getOffsetState(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].offsetState;
	        }
	        console.warn('Invalid index in getOffsetState.');
	        return null;
	    }

	    /**
	     * @param {number} passIndex
	     * @returns {StencilState}
	     */
	    getStencilState(passIndex) {
	        if (0 <= passIndex && passIndex < this.passes.length) {
	            return this.passes[passIndex].stencilState;
	        }
	        console.warn('Invalid index in getStencilState.');
	        return null;
	    }

	    load(inStream) {
	        super.load(inStream);
	        var numPasses = inStream.readUint32();
	        this.passes.length = numPasses;
	        this.passes = inStream.readSizedPointerArray(numPasses);
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.passes.forEach(function (p, i) {
	            this.passes[i] = inStream.resolveLink(p);
	        }, this);
	    }

	    save(inStream) {
	        super.save(inStream);
	        // todo: implement
	    }
	}

	D3Object.Register('VisualTechnique', VisualTechnique.factory.bind(VisualTechnique));

	class Bound$1 {
	    constructor() {
	        this.center = Point$1.ORIGIN;
	        this.radius = 0;
	    }
	    /**
	     * 复制
	     * @param {Bound} bound
	     * @returns {Bound}
	     */
	    copy(bound) {
	        this.center.copy(bound.center);
	        this.radius = bound.radius;
	        return this;
	    }
	    /**
	     * @param {Plane} plane
	     */
	    whichSide(plane) {
	        let signedDistance = plane.distanceTo(this.center);
	        if (signedDistance <= -this.radius) return -1;
	        if (signedDistance >= this.radius) return +1;
	        return 0;
	    }
	    /**
	     * @param {Bound} bound
	     */
	    growToContain(bound) {
	        if (bound.radius === 0) {
	            // The incoming bound is invalid and cannot affect growth.
	            return;
	        }

	        if (this.radius === 0) {
	            // The current bound is invalid, so just assign the incoming bound.
	            this.copy(bound);
	            return;
	        }

	        let centerDiff = bound.center.subAsVector(this.center);
	        let lengthSqr = centerDiff.squaredLength();
	        let radiusDiff = bound.radius - this.radius;
	        let radiusDiffSqr = radiusDiff * radiusDiff;

	        if (radiusDiffSqr >= lengthSqr) {
	            if (radiusDiff >= 0) {
	                this.center = bound.center;
	                this.radius = bound.radius;
	            }
	            return;
	        }

	        let length = _Math.sqrt(lengthSqr);
	        if (length > _Math.ZERO_TOLERANCE) {
	            let coeff = (length + radiusDiff) / (2 * length);
	            this.center = this.center.add(centerDiff.scalar(coeff));
	        }
	        this.radius = 0.5 * (length + this.radius + bound.radius);
	    }

	    /**
	     * @param {Transform} transform
	     * @param {Bound} bound
	     */
	    transformBy(transform, bound) {
	        bound.center = transform.mulPoint(this.center);
	        bound.radius = transform.getNorm() * this.radius;
	    }

	    /**
	     * 计算物体的球形包围盒
	     *
	     * @param {number} numElements 顶点数量
	     * @param {number} stride 坐标偏移
	     * @param {ArrayBuffer} data 顶点数据
	     */
	    computeFromData(numElements, stride, data) {

	        let pos = new Float32Array(3);
	        let t = 0, cx, cy, cz;
	        let i, radiusSqr, dv = new DataView(data);

	        // 包围盒的中心是所有坐标的平均值
	        for (i = 0; i < numElements; ++i) {
	            t = i * stride;
	            pos[0] += dv.getFloat32(t, true);
	            pos[1] += dv.getFloat32(t + 4, true);
	            pos[2] += dv.getFloat32(t + 8, true);
	        }
	        t = 1 / numElements;
	        cx = pos[0] * t;
	        cy = pos[1] * t;
	        cz = pos[2] * t;
	        this.center.assign(cx, cy, cz);

	        // 半径是到中心点距离最大的物体坐标
	        this.radius = 0;
	        for (i = 0; i < numElements; ++i) {
	            t = i * stride;
	            pos[0] = dv.getFloat32(t, true) - cx;
	            pos[1] = dv.getFloat32(t + 4, true) - cy;
	            pos[2] = dv.getFloat32(t + 8, true) - cz;

	            radiusSqr = pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2];
	            if (radiusSqr > this.radius) {
	                this.radius = radiusSqr;
	            }
	        }

	        this.radius = Math.sqrt(this.radius);
	    }

	    /**
	     * Test for intersection of linear component and bound (points of
	     * intersection not computed).   
	     * > The linear component is parameterized by
	     *  `P + t*D`
	     * -  P is a point on the component (the origin)
	     * -  D is a unit-length direction vector
	     * 
	     * > The interval `[tmin,tmax]` is
	     *   - line      tmin = -MAX_REAL, tmax = MAX_REAL
	     *   - ray:      tmin = 0.0, tmax = MAX_REAL
	     *   - segment:  tmin >= 0.0, tmax > tmin
	     *
	     * @param {Point} origin
	     * @param {Vector} direction
	     * @param {number} tmin
	     * @param {number} tmax
	     * @returns {boolean}
	     */
	    testIntersection(origin, direction, tmin, tmax) {
	        // 无效的包围盒, 不能计算相交
	        if (this.radius === 0) {
	            return false;
	        }

	        let diff;
	        let a0, a1, discr;

	        if (tmin === -_Math.MAX_REAL) {
	            console.assert(tmax === _Math.MAX_REAL, 'tmax must be infinity for a line.');

	            // Test for sphere-line intersection.
	            diff = origin.sub(this.center);
	            a0 = diff.dot(diff) - this.radius * this.radius;
	            a1 = direction.dot(diff);
	            discr = a1 * a1 - a0;
	            return discr >= 0;
	        }

	        if (tmax === _Math.MAX_REAL) {
	            console.assert(tmin === 0, 'tmin must be zero for a ray.');

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

	        console.assert(tmax > tmin, 'tmin < tmax is required for a segment.');

	        // Test for sphere-segment intersection.
	        let segExtent = 0.5 * (tmin + tmax);
	        let segOrigin = origin.add(segExtent * direction);

	        diff = segOrigin.sub(this.center);
	        a0 = diff.dot(diff) - this.radius * this.radius;
	        a1 = direction.dot(diff);
	        discr = a1 * a1 - a0;
	        if (discr < 0) {
	            return false;
	        }

	        let tmp0 = segExtent * segExtent + a0;
	        let tmp1 = 2 * a1 * segExtent;
	        let qm = tmp0 - tmp1;
	        let qp = tmp0 + tmp1;
	        if (qm * qp <= 0) {
	            return true;
	        }
	        return qm > 0 && _Math.abs(a1) < segExtent;
	    }
	    /**
	     * Test for intersection of the two stationary bounds.
	     * @param {Bound} bound
	     * @returns {boolean}
	     */
	    testIntersection1(bound) {
	        // 无效的包围盒, 不能计算相交
	        if (bound.radius === 0 || this.radius === 0) {
	            return false;
	        }

	        // Test for staticSphere-staticSphere intersection.
	        let diff = this.center.subAsVector(bound.center);
	        let rSum = this.radius + bound.radius;
	        return diff.squaredLength() <= rSum * rSum;
	    }

	    /**
	     * Test for intersection of the two moving bounds.
	     * - Velocity0 is that of the calling Bound
	     * - velocity1 is that of the input bound.
	     *
	     * @param {Bound} bound
	     * @param {number} tmax
	     * @param {Vector} velocity0
	     * @param {Vector} velocity1
	     * @returns {boolean}
	     */
	    testIntersection2(bound, tmax, velocity0, velocity1) {
	        // 无效的包围盒, 不能计算相交
	        if (bound.radius === 0 || this.radius === 0) {
	            return false;
	        }

	        // Test for movingSphere-movingSphere intersection.
	        let relVelocity = velocity1.sub(velocity0);
	        let cenDiff = bound.center.subAsVector(this.center);
	        let a = relVelocity.squaredLength();
	        let c = cenDiff.squaredLength();
	        let rSum = bound.radius + this.radius;
	        let rSumSqr = rSum * rSum;

	        if (a > 0) {
	            let b = cenDiff.dot(relVelocity);
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
	    }
	}

	class Spatial extends ControlledObject {
	    constructor() {
	        super();

	        this.localTransform = Transform$1.IDENTITY;
	        this.worldTransform = Transform$1.IDENTITY;

	        // 在一些情况下直接更新worldTransform而跳过Spatial.update()
	        // 在这种情况下必须将this.worldTransformIsCurrent设置为true
	        this.worldTransformIsCurrent = false;

	        this.worldBound = new Bound$1();

	        // 在一些情况下直接更新worldBound而跳过Spatial.update()
	        // 在这种情况下必须将this.worldBoundIsCurrent设置为true
	        this.worldBoundIsCurrent = false;

	        this.culling = Spatial.CULLING_DYNAMIC;

	        /** @type {Spatial} */
	        this.parent = null;
	    }

	    /**
	     * update of geometric state and controllers.  The function computes world
	     * transformations on the downward pass of the scene tree traversal and
	     * world bounding volumes on the upward pass of the traversal.
	     * 
	     * @param {number} applicationTime
	     * @param {boolean} initiator
	     */
	    update(applicationTime = -_Math.MAX_REAL, initiator = true) {
	        this.updateWorldData(applicationTime);
	        this.updateWorldBound();
	        if (initiator) {
	            this.propagateBoundToRoot();
	        }
	    }

	    /**
	     * @param {number} applicationTime
	     */
	    updateWorldData(applicationTime) {
	        // update any controllers associated with this object.
	        this.updateControllers(applicationTime);

	        if (this.worldTransformIsCurrent) {
	            return;
	        }

	        if (this.parent) {
	            this.worldTransform.copy(this.parent.worldTransform.mul(this.localTransform));
	        }
	        else {
	            this.worldTransform.copy(this.localTransform);
	        }
	    }

	    propagateBoundToRoot() {
	        if (this.parent) {
	            this.parent.updateWorldBound();
	            this.parent.propagateBoundToRoot();
	        }
	    }

	    /**
	     * culling support
	     * @param {Culler} culler
	     * @param {boolean} noCull
	     */
	    onGetVisibleSet(culler, noCull) {
	        if (this.culling === Spatial.CULLING_ALWAYS) {
	            return;
	        }

	        if (this.culling == Spatial.CULLING_NEVER) {
	            noCull = true;
	        }

	        let savePlaneState = culler.planeState;
	        if (noCull || culler.isVisible(this.worldBound)) {
	            this.getVisibleSet(culler, noCull);
	        }
	        culler.planeState = savePlaneState;
	    }

	    // abstract, update world Bound
	    updateWorldBound() {
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.localTransform = inStream.readTransform();
	        this.worldTransform = inStream.readTransform();
	        this.worldTransformIsCurrent = inStream.readBool();
	        this.worldBound = inStream.readBound();
	        this.worldBoundIsCurrent = inStream.readBool();
	        this.culling = inStream.readEnum();
	    }
	}

	DECLARE_ENUM(Spatial, {
	    CULLING_DYNAMIC: 0, // 通过比较世界包围盒裁剪平面确定可见状态
	    CULLING_ALWAYS: 1, // 强制裁剪对象, 如果节点被裁剪，那么它的整个子树也被裁剪
	    CULLING_NEVER: 2  // 不裁剪对象， 如果一个节点是不裁剪对象，那么它的整个子树也不被裁剪。
	});

	class Visual$1 extends Spatial {

	    /**
	     * @param {number} type - primitiveType
	     * @param {VertexFormat} format
	     * @param {VertexBuffer} vertexBuffer
	     * @param {IndexBuffer} indexBuffer
	     */
	    constructor(type, format, vertexBuffer, indexBuffer) {
	        super();
	        this.primitiveType = type || Visual$1.PT_NONE;

	        /**
	         * @type {VertexFormat}
	         */
	        this.format = format;

	        /**
	         * @type {VertexBuffer}
	         */
	        this.vertexBuffer = vertexBuffer;

	        /**
	         * @type {IndexBuffer}
	         */
	        this.indexBuffer = indexBuffer;
	        this.modelBound = new Bound$1();

	        /**
	         * Shader effect used to draw the Visual.
	         * @type {VisualEffectInstance}
	         * @private
	         */
	        this.effect = null;

	        this.wire = false;

	        this.userData = null;

	        if (format && vertexBuffer && indexBuffer) {
	            this.updateModelSpace(Visual$1.GU_MODEL_BOUND_ONLY);
	        }
	    }

	    updateModelSpace(type) {
	        this.updateModelBound();
	    }

	    updateWorldBound() {
	        this.modelBound.transformBy(this.worldTransform, this.worldBound);
	    }

	    updateModelBound() {
	        const numVertices = this.vertexBuffer.numElements;
	        const format = this.format;
	        const stride = format.stride;

	        let posIndex = format.getIndex(VertexFormat$1.AU_POSITION);
	        if (posIndex === -1) {
	            console.assert(false, 'update requires vertex positions');
	            return;
	        }

	        let posType = format.getAttributeType(posIndex);
	        if (posType !== VertexFormat$1.AT_FLOAT3 && posType !== VertexFormat$1.AT_FLOAT4) {
	            console.assert(false, 'Positions must be 3-tuples or 4-tuples');
	            return;
	        }

	        let data = this.vertexBuffer.getData();
	        let posOffset = format.getOffset(posIndex);
	        this.modelBound.computeFromData(numVertices, stride, data.slice(posOffset).buffer);
	    }

	    /**
	     * Support for hierarchical culling.
	     * @param {Culler} culler
	     * @param {boolean} noCull
	     */
	    getVisibleSet(culler, noCull) {
	        culler.insert(this);
	    }

	    /**
	     * @param {string} fileName - 文件名
	     */
	    static loadWMVF(fileName) {
	        return new Promise(function (resolve, reject) {
	            let load = new L5.XhrTask(fileName, 'arraybuffer');
	            load.then(function (data) {
	                let inFile = new DataView(data);
	                let ret = {};
	                inFile.offset = 0;
	                ret.primitiveType = inFile.getInt32(inFile.offset, true);
	                inFile.offset += 4;

	                ret.format = Visual$1.loadVertexFormat(inFile); // ok
	                ret.vertexBuffer = Visual$1.loadVertexBuffer(inFile, ret.format);
	                ret.indexBuffer = Visual$1.loadIndexBuffer(inFile);

	                console.log(data.byteLength);
	                console.log(inFile.offset);

	                resolve(ret);
	            }).catch(function (err) {
	                console.log(err);
	                reject(err);
	            });
	        }).catch(function (err) {
	            console.assert(false, "Failed to open file :" + fileName);
	        });
	    }

	    /**
	     * 解析顶点格式
	     * @param {BinDataView} inFile
	     * @returns {VertexFormat}
	     */
	    static loadVertexFormat(inFile) {
	        let numAttributes = inFile.getInt32(inFile.offset, true);
	        inFile.offset += 4;

	        let format = new VertexFormat$1(numAttributes);
	        let streamIndex, offset, usageIndex, type, usage;

	        for (let i = 0; i < numAttributes; ++i) {
	            streamIndex = inFile.getUint32(inFile.offset, true);
	            inFile.offset += 4;

	            offset = inFile.getUint32(inFile.offset, true);
	            inFile.offset += 4;

	            type = inFile.getInt32(inFile.offset, true);
	            inFile.offset += 4;

	            usage = inFile.getInt32(inFile.offset, true);
	            inFile.offset += 4;

	            usageIndex = inFile.getUint32(inFile.offset, true);
	            inFile.offset += 4;

	            format.setAttribute(i, streamIndex, offset, type, usage, usageIndex);
	        }

	        format.stride = inFile.getInt32(inFile.offset, true);
	        inFile.offset += 4;

	        return format;
	    }

	    /**
	     * 解析顶点缓冲对象
	     * @param {BinDataView} inFile
	     * @param {VertexFormat} format
	     * @returns {VertexBuffer}
	     */
	    static loadVertexBuffer(inFile, format) {
	        let numElements = inFile.getInt32(inFile.offset, true);
	        inFile.offset += 4;

	        let elementSize = inFile.getInt32(inFile.offset, true);
	        inFile.offset += 4;

	        let usage = inFile.getInt32(inFile.offset, true);
	        inFile.offset += 4;

	        let buffer = new VertexBuffer(numElements, elementSize, usage);
	        let vba = new VertexBufferAccessor(format, buffer);
	        // end ok

	        vba.read(inFile);

	        return buffer;
	    }

	    /**
	     * @param {BinDataView} inFile
	     * @returns {IndexBuffer}
	     */
	    static loadIndexBuffer(inFile) {
	        let numElements = inFile.getInt32(inFile.offset, true);
	        inFile.offset += 4;

	        if (numElements > 0) {
	            let elementSize = inFile.getInt32(inFile.offset, true);
	            inFile.offset += 4;
	            let usage = inFile.getInt32(inFile.offset, true);
	            inFile.offset += 4;
	            let offset = inFile.getInt32(inFile.offset, true);
	            inFile.offset += 4;

	            let buffer = new IndexBuffer(numElements, elementSize, usage);
	            buffer.offset = offset;
	            //let start = inFile.offset;
	            // let end = start + buffer.numBytes;
	            buffer.getData().set(new Uint8Array(inFile.buffer, inFile.offset, buffer.numBytes));

	            inFile.offset += buffer.numBytes;

	            return buffer;
	        }

	        return null;
	    }

	    /**
	     * @param {InStream} inStream
	     */
	    load(inStream) {
	        super.load(inStream);
	        this.type = inStream.readEnum();
	        this.modelBound = inStream.readBound();
	        this.format = inStream.readPointer();
	        this.vertexBuffer = inStream.readPointer();
	        this.indexBuffer = inStream.readPointer();
	        this.effect = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.format = inStream.resolveLink(this.format);
	        this.vertexBuffer = inStream.resolveLink(this.vertexBuffer);
	        this.indexBuffer = inStream.resolveLink(this.indexBuffer);
	        this.effect = inStream.resolveLink(this.effect);
	    }
	}

	/////////////////// 绘制类型 //////////////////////////////
	DECLARE_ENUM(Visual$1, {
	    PT_NONE: 0,  // 默认
	    PT_POLYPOINT: 1,   // 点
	    PT_POLYSEGMENTS_DISJOINT: 2,
	    PT_POLYSEGMENTS_CONTIGUOUS: 3,
	    PT_TRIANGLES: 4,  // abstract
	    PT_TRIMESH: 5,
	    PT_TRISTRIP: 6,
	    PT_TRIFAN: 7,
	    PT_MAX_QUANTITY: 8
	}, false);

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
	DECLARE_ENUM(Visual$1, {
	    GU_MODEL_BOUND_ONLY: -3,
	    GU_NORMALS: -2,
	    GU_USE_GEOMETRY: -1,
	    GU_USE_TCOORD_CHANNEL: 0
	});

	class Renderer$1 {
	    /**
	     * @param {HTMLCanvasElement} canvas
	     * @param {number} width
	     * @param {number} height
	     * @param {ArrayBuffer} clearColor
	     * @param {number} colorFormat
	     * @param {number} depthStencilFormat
	     * @param {number} numMultiSamples
	     */
		constructor(canvas, width, height, clearColor, colorFormat, depthStencilFormat, numMultiSamples) {
	        /**
	         * @type {WebGLRenderingContext}
	         */
			let gl = canvas.getContext('webgl2', {
				alpha: true,
				depth: true,
				stencil: true,
				antialias: true
			});
			this.gl = gl;
			this.clearColor = new Float32Array([0, 0, 0, 1]);
			this.clearColor.set(clearColor);
			this.initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples);

			// The platform-specific data.  It is in public scope to allow the
			// renderer resource classes to access it.
			let data = new GLRenderData();
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
			Renderer$1.renderers.add(this);

			// let c = document.createElement('canvas');
			// c.setAttribute('style', 'width:150px;height:75px');
			// this.textContext = c.getContext('2d');
			// document.body.appendChild(this.textContext.canvas);
		}

	    /**
	     * @returns {Set<Renderer>}
	     */
		static get renderers() {
			return (Renderer$1._renderers || (Renderer$1._renderers = new Set()));
		}

	    /**
	     * @param {number} width
	     * @param {number} height
	     * @param {number} colorFormat - TEXTURE_FORMAT_XXX
	     * @param {number} depthStencilFormat - TEXTURE_FORMAT_XXX
	     * @param {number} numMultiSamples
	     */
		initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples) {

			GLExtensions.init(this.gl);

			this.width = width;
			this.height = height;
			this.colorFormat = colorFormat;
			this.depthStencilFormat = depthStencilFormat;
			this.numMultiSamples = numMultiSamples;

			// global render state
			this.alphaState = new AlphaState();
			this.cullState = new CullState();
			this.depthState = new DepthState();
			this.offsetState = new OffsetState();
			this.stencilState = new StencilState();

			this.defaultAlphaState = new AlphaState();
			this.defaultCullState = new CullState();
			this.defaultDepthState = new DepthState();
			this.defaultOffsetState = new OffsetState();
			this.defaultStencilState = new StencilState();


			// override global state
			this.overrideAlphaState = null;
			this.overrideCullState = null;
			this.overrideDepthState = null;
			this.overrideOffsetState = null;
			this.overrideStencilState = null;


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
			this.vertexArrays = new Map(); // VAOs

			this.vertexFormats = new Map();
			this.vertexBuffers = new Map();
			this.indexBuffers = new Map();
			this.texture2Ds = new Map();
			this.texture3Ds = new Map();
			this.textureCubes = new Map();
			this.renderTargets = new Map();
			this.vertexShaders = new Map();
			this.fragShaders = new Map();
			this.samplerStates = new Map();
			this.programs = new Map();

			let gl = this.gl;
			let cc = this.clearColor;
			gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
			gl.clearDepth(this.clearDepth);
			gl.clearStencil(this.clearStencil);
		}

		terminate() {
		}

	    /**
	     * Compute a picking ray from the specified left-handed screen
	     * coordinates (x,y) and using the current camera.  The output
	     * 'origin' is the camera position and the 'direction' is a
	     * unit-length vector.  Both are in world coordinates.
	     * The return value is 'true' iff (x,y) is in the current viewport.
	     *
	     * @param x {number} in
	     * @param y {number} in
	     * @param origin {Point} out
	     * @param direction {Vector} out
	     */
		getPickRay(x, y, origin, direction) {
		}

		// === 资源管理
		// 资源对象是已定义的
		//    VertexFormat
		//    VertexBuffer
		//    IndexBuffer
		//    Texture(2d, cube, 3d, 2d array),
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
		getColorMask() {
			return (0x1 | 0x2 | 0x4 | 0x8);
		}

		// Override the global state.  If overridden, this state is used instead
		// of the VisualPass state during a drawing call.  To undo the override,
		// pass a null pointer.
		get overrideAlphaState() {
			return this._overrideAlphaState;
		}

		set overrideAlphaState(val) {
			this._overrideAlphaState = val;
		}

		get overrideCullState() {
			return this._overrideCullState;
		}

		set overrideCullState(val) {
			this._overrideCullState = val;
		}

		get overrideDepthState() {
			return this._overrideDepthState;
		}

		set overrideDepthState(val) {
			this._overrideDepthState = val;
		}

		get overrideOffsetState() {
			return this._overrideOffsetState;
		}

		set overrideOffsetState(val) {
			this._overrideOffsetState = val;
		}

		get overrideStencilState() {
			return this._overrideStencilState;
		}

		set overrideStencilState(val) {
			this._overrideStencilState = val;
		}

	    /**
	     * The entry point to drawing the visible set of a scene tree.
	     * @param {VisibleSet} visibleSet
	     * @param {*} globalEffect
	     */
		drawVisibleSet(visibleSet, globalEffect = null) {
			if (!globalEffect) {
				let numVisible = visibleSet.getNumVisible();
				for (let i = 0; i < numVisible; ++i) {
					let visual = visibleSet.getVisible(i);
					this.drawInstance(visual, visual.effect);
				}
			}
			else {
				globalEffect.draw(this, visibleSet);
			}
		}

	    /**
	     * @param {Visual} visual
	     */
		drawVisible(visual) {
			this.drawInstance(visual, visual.effect);
		}


	    /**
	     * @param {Visual} visual
	     * @param {VisualEffectInstance} instance
	     */
		drawInstance(visual, instance) {
			if (!visual) {
				console.assert(false, 'The visual object must exist.');
				return;
			}

			if (!instance) {
				console.assert(false, 'The visual object must have an effect instance.');
				return;
			}

			let vformat = visual.format;
			let vbuffer = visual.vertexBuffer;
			let ibuffer = visual.indexBuffer;

			let numPasses = instance.getNumPasses();
			for (let i = 0; i < numPasses; ++i) {
				let pass = instance.getPass(i);
				let vparams = instance.getVertexParameters(i);
				let fparams = instance.getFragParameters(i);
				let program = pass.program;

				// Update any shader constants that lety during runtime.
				vparams.updateConstants(visual, this.camera);
				fparams.updateConstants(visual, this.camera);

				// Set visual state.
				this.setAlphaState(pass.alphaState);
				this.setCullState(pass.cullState);
				this.setDepthState(pass.depthState);
				this.setOffsetState(pass.offsetState);
				this.setStencilState(pass.stencilState);

				this._enableProgram(program, vparams, fparams);
				this._enableVertexBuffer(vbuffer, vformat);
				if (ibuffer) {
					this._enableIndexBuffer(ibuffer);
					// Draw the primitive.
					this.drawPrimitive(visual);
					this._disableIndexBuffer(ibuffer);
				} else {
					this.___drawPrimitiveWithoutIndices(visual);
				}

				this._disableVertexBuffer(vbuffer);

				// Disable the shaders.
				this._disableProgram(program, vparams, fparams);
			}
		}

	    /**
	     * The entry point for drawing 3D objects, called by the single-object
	     * Draw function.
	     * @param {Visual} visual
	     */
		_drawPrimitive(visual) {
		}

	    /**
	     * 设置渲染视口
	     * @param {number} x
	     * @param {number} y
	     * @param {number} width
	     * @param {number} height
	     */
		setViewport(x, y, width, height) {
			this.gl.viewport(x, y, width, height);
		}

	    /**
	     * 获取渲染视口参数
	     * @returns {Array<number>}
	     */
		getViewport() {
			let gl = this.gl;
			return gl.getParameter(gl.VIEWPORT);
		}

	    /**
	     * 调整渲染视口大小
	     * @param width {number}
	     * @param height {number}
	     */
		resize(width, height) {
			this.width = width;
			this.height = height;
			let gl = this.gl;
			let p = gl.getParameter(gl.VIEWPORT);
			gl.viewport(p[0], p[1], width, height);
		}

	    /**
	     * 设置深度测试范围
	     * @param min {number}
	     * @param max {number}
	     */
		setDepthRange(min, max) {
			this.gl.depthRange(min, max);
		}

	    /**
	     * 获取当前深度测试范围
	     * @returns {Array<number>}
	     */
		getDepthRange() {
			let gl = this.gl;
			return gl.getParameter(gl.DEPTH_RANGE);
		}

		// Support for clearing the color, depth, and stencil buffers.
		clearColorBuffer(x = 0, y = 0, w = 0, h = 0) {
		}

		clearDepthBuffer(x = 0, y = 0, w = 0, h = 0) {
		}

		clearStencilBuffer(x = 0, y = 0, w = 0, h = 0) {
		}

		displayColorBuffer() {
		}

		// For render target access to allow creation of color/depth textures.
		inTexture2DMap(texture) {
			return true;
		}

		insertInTexture2DMap(texture, platformTexture) {
		}


		static updateAll(obj /*, params... */) {
			switch (obj.constructor.name.split('$')[0]) {
				case 'Texture2D':
					this._updateAllTexture2D(obj, arguments[1]);
					break;
				case 'Texture3D':
					this._updateAllTexture3D(obj, arguments[1], arguments[2]);
					break;
				case 'TextureCube':
					this._updateAllTextureCube(obj, arguments[1], arguments[2]);
					break;
				case 'VertexBuffer':
					this._updateAllVertexBuffer(obj, arguments[1]);
					break;
				case 'IndexBuffer':
					this._updateAllIndexBuffer(obj);
					break;
				default:
					console.assert(false, `${obj.constructor.name} not support [updateAll] method.`);
			}
		}
		// ------------------- Sampler ------------------------------
		_bindAllSamplerState(sampler) {
			Renderer$1._renderers.forEach(r => r._bindSamplerState(sampler));
		}
		_bindSamplerState(sampler) {
			if (!this.samplerStates.has(sampler)) {
				this.samplerStates.set(sampler, new GLSampler(this.gl, sampler));
			}
		}
		_enableSamplerState(sampler, textureUnit) {
			let glSampler = this.samplerStates.get(sampler);
			if (!glSampler) {
				glSampler = new GLSampler(this.gl, sampler);
				this.samplerStates.set(sampler, glSampler);
			}
			glSampler.enable(this.gl, textureUnit);
		}

		// ------------------- 着色器程序管理 ----------------------------------
	    /**
	     * @param program {Program}
	     * @private
	     */
		_bindProgram(program) {
			if (!this.programs.get(program)) {
				this.programs.set(program, new GLProgram(this, program));
			}
		}

	    /**
	     * @param program {Program}
	     * @private
	     */
		static _bindAllProgram(program) {
			Renderer$1.renderers.forEach(function (r) {
				r._bindProgram(program);
			});
		}

	    /**
	     * @param {Program} program
	     * @private
	     */
		_unbindProgram(program) {
			let glProgram = this.programs.get(program);
			if (glProgram) {
				glProgram.free(this.gl);
				this.programs.delete(program);
			}
		}
	    /**
	     * @param program {Program}
	     * @private
	     */
		static _unbindAllProgram(program) {
			Renderer$1.renderers.forEach(function (r) {
				r._unbindProgram(program);
			});
		}

	    /**
	     * @param program {Program}
	     * @param vp {ShaderParameters}
	     * @param fp {ShaderParameters}
	     * @private
	     */
		_enableProgram(program, vp, fp) {
			let glProgram = this.programs.get(program);
			if (!glProgram) {
				this._bindVertexShader(program.vertexShader);
				this._bindFragShader(program.fragShader);

				glProgram = new GLProgram(
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
			this._enableFragShader(program.fragShader, program.inputMap, fp);
		}

	    /**
	     * @param program {Program}
	     * @param vp {ShaderParameters}
	     * @param fp {ShaderParameters}
	     * @private
	     */
		_disableProgram(program, vp, fp) {

			this._disableVertexShader(program.vertexShader, vp);
			this._disableFragShader(program.fragShader, fp);
			let glProgram = this.programs.get(program);
			if (glProgram) {
				glProgram.disable(this);
			}
		}

		//----------------------- vertexBuffer ------------------------
	    /**
	     * @param {VertexBuffer} buffer
	     * @param {VertexFormat} format
	     * @private
	     */
		_enableVertexBuffer(buffer, format) {
			let glVao = this.vertexArrays.get(buffer);
			if (!glVao) {
				let glFormat = this.vertexFormats.get(format);
				if (!glFormat) {
					glFormat = new GLVertexFormat(this.gl, format);
					this.vertexFormats.set(format, glFormat);
				}
				glVao = new GLVertexArray(this.gl, buffer, glFormat);
				this.vertexArrays.set(buffer, glVao);
				return;
			}

			glVao.enable(this.gl);
		}

	    /**
	     * @param {VertexBuffer} buffer
	     * @private
	     */
		_disableVertexBuffer(buffer) {
			let glVao = this.vertexArrays.get(buffer);
			if (glVao) {
				glVao.disable(this.gl);
			}
		}

	    /**
	     * @param {VertexBuffer} buffer
		 * @param {VertexFormat} format
	     * @private
	     */
		_updateVertexBuffer(buffer, format) {
			let glFormat = this.vertexFormats.get(format);
			if (!glFormat) {
				glFormat = new GLVertexFormat(this.gl, format);
				this.vertexFormats.set(format, glFormat);
			}

			let glVao = this.vertexArrays.get(buffer);
			if (!glVao) {
				glVao = new GLVertexArray(this.gl, buffer, glFormat);
				this.vertexArrays.set(buffer, glVao);
				return;
			}

			glVao.update(this.gl, buffer, glFormat);
		}

	    /**
	     * @param {VertexBuffer} buffer
		 * @param {VertexFormat} format
	     * @private
	     */
		static _updateAllVertexBuffer(buffer, format) {
			Renderer$1.renderers.forEach(renderer => renderer._updateVertexBuffer(buffer, format));
		}

		//----------------------- indexBuffer ------------------------
	    /**
	     * @param {IndexBuffer} buffer
	     * @private
	     */
		_enableIndexBuffer(buffer) {
			let glIBuffer = this.indexBuffers.get(buffer);
			if (!glIBuffer) {
				glIBuffer = new GLIndexBuffer(this.gl, buffer);
				this.indexBuffers.set(buffer, glIBuffer);
				return;
			}
			glIBuffer.enable(this.gl);
		}

	    /**
	     * @param {IndexBuffer} buffer
	     * @private
	     */
		_disableIndexBuffer(buffer) {
			let glIBuffer = this.indexBuffers.get(buffer);
			if (glIBuffer) {
				glIBuffer.disable(this.gl);
			}
		}

	    /**
	     * @param {IndexBuffer} buffer
	     * @private
	     */
		_updateIndexBuffer(buffer) {
			let glIBuffer = this.indexBuffers.get(buffer);
			if (!glIBuffer) {
				glIBuffer = new GLIndexBuffer(this.gl, buffer);
				this.indexBuffers.set(buffer, glIBuffer);
				return;
			}
			glIBuffer.update(this.gl, buffer);
		}

	    /**
	     * @param {IndexBuffer} buffer
	     * @private
	     */
		static _updateAllIndexBuffer(buffer) {
			Renderer$1.renderers.forEach(renderer => renderer._updateIndexBuffer(buffer));
		}

		//----------------------- fragShader ------------------------

	    /**
	     * @param {FragShader} shader
	     * @private
	     */
		_bindFragShader(shader) {
			if (!this.fragShaders.get(shader)) {
				let numSamplers = shader.numSamplers;
				if (numSamplers > 0) {
					for (let i = 0; i < numSamplers; ++i) {
						this._bindSamplerState(shader.getSamplerState(i));
					}
				}
				this.fragShaders.set(shader, new GLFragShader(this, shader));
			}
		}

	    /**
	     * @param {FragShader} shader
	     * @private
	     */
		static _bindAllFragShader(shader) {
			Renderer$1.renderers.forEach(r => r._bindFragShader(shader));
		}

	    /**
	     * @param {FragShader} shader
	     * @private
	     */
		_unbindFragShader(shader) {
			let glFShader = this.fragShaders.get(shader);
			if (glFShader) {
				glFShader.free(this.gl);
				this.fragShaders.delete(shader);
			}
		}

	    /**
	     * @param {FragShader} shader
	     * @private
	     */
		static _unbindAllFragShader(shader) {
			Renderer$1.renderers.forEach(r => r._unbindFragShader(shader));
		}

	    /**
	     * @param {FragShader} shader
	     * @param {Map} mapping
	     * @param {ShaderParameters} parameters
	     * @private
	     */
		_enableFragShader(shader, mapping$$1, parameters) {
			let glFShader = this.fragShaders.get(shader);
			if (!glFShader) {
				glFShader = new GLFragShader(this, shader);
				this.fragShaders.set(shader, glFShader);
			}
			glFShader.enable(this, mapping$$1, shader, parameters);
		}

	    /**
	     * @param {FragShader} shader
	     * @param {ShaderParameters} parameters
	     * @private
	     */
		_disableFragShader(shader, parameters) {
			let glFShader = this.fragShaders.get(shader);
			if (glFShader) {
				glFShader.disable(this, shader, parameters);
			}
		}

		//----------------------- vertexShader ------------------------
	    /**
	     * @param {VertexShader} shader
	     * @private
	     */
		_bindVertexShader(shader) {
			if (!this.vertexShaders.get(shader)) {
				let numSamplers = shader.numSamplers;
				if (numSamplers > 0) {
					for (let i = 0; i < numSamplers; ++i) {
						this._bindSamplerState(shader.getSamplerState(i));
					}
				}
				this.vertexShaders.set(shader, new GLVertexShader(this, shader));
			}
		}

	    /**
	     * @param shader {VertexShader}
	     * @private
	     */
		static _bindAllVertexShader(shader) { }
	    /**
	     * @param shader {VertexShader}
	     * @private
	     */
		_unbindVertexShader(shader) { }

	    /**
	     * @param shader {VertexShader}
	     * @private
	     */
		static _unbindAllVertexShader(shader) { }

	    /**
	     * @param shader {VertexShader}
	     * @param mapping {Map}
	     * @param parameters {ShaderParameters}
	     * @private
	     */
		_enableVertexShader(shader, mapping$$1, parameters) {
			let glVShader = this.vertexShaders.get(shader);
			if (!glVShader) {
				glVShader = new GLVertexShader(this, shader);
				this.vertexShaders.set(shader, glVShader);
			}

			glVShader.enable(this, mapping$$1, shader, parameters);
		}

	    /**
	     * @param shader {VertexShader}
	     * @param parameters {ShaderParameters}
	     * @private
	     */
		_disableVertexShader(shader, parameters) {
			let glVShader = this.vertexShaders.get(shader);
			if (glVShader) {
				glVShader.disable(this, shader, parameters);
			}
		}

		//----------------------- texture2d ------------------------
	    /**
	     * @param texture {Texture2D}
	     * @private
	     */
		_bindTexture2D(texture) { }

	    /**
	     * @param texture {Texture2D}
	     * @private
	     */
		static _bindAllTexture2D(texture) { }

	    /**
	     * @param texture {Texture2D}
	     * @private
	     */
		_unbindTexture2D(texture) { }

	    /**
	     * @param texture {Texture2D}
	     * @private
	     */
		static _unbindAllTexture2D(texture) { }

	    /**
	     * @param {Texture2D} texture
	     * @param {number} textureUnit
	     * @private
	     */
		_enableTexture2D(texture, textureUnit) {
			let glTexture2D = this.texture2Ds.get(texture);
			if (!glTexture2D) {
				glTexture2D = new GLTexture2D(this.gl, texture);
				this.texture2Ds.set(texture, glTexture2D);
			}
			glTexture2D.enable(this.gl, textureUnit);
		}

	    /**
	     * @param {Texture2D} texture
	     * @param {number} textureUnit
	     * @private
	     */
		_disableTexture2D(texture, textureUnit) {
			let glTexture2D = this.texture2Ds.get(texture);
			if (glTexture2D) {
				glTexture2D.disable(this.gl, textureUnit);
			}
		}

	    /**
	     * @param {Texture2D} texture
	     * @param {number} level
	     * @private
	     */
		_updateTexture2D(texture, level = 0) {
			let glTexture2D = this.texture2Ds.get(texture);
			if (!glTexture2D) {
				glTexture2D = new GLTexture2D(this.gl, texture);
				this.texture2Ds.set(texture, glTexture2D);
			} else {
				glTexture2D.update(this.gl, level, texture.getData());
			}
		}

	    /**
	     * @param {Texture2D} texture
	     * @param {number} level
	     */
		static _updateAllTexture2D(texture, level) {
			Renderer$1.renderers.forEach(renderer => renderer._updateTexture2D(texture, level));
		}

		//----------------------- textureCube ------------------------
	    /**
	     * @param texture {TextureCube}
	     * @private
	     */
		_bindTextureCube(texture) { }

	    /**
	     * @param texture {TextureCube}
	     * @private
	     */
		static _bindAllTextureCube(texture) { }

	    /**
	     * @param texture {TextureCube}
	     * @private
	     */
		_unbindTextureCube(texture) { }

	    /**
	     * @param texture {TextureCube}
	     * @private
	     */
		static _unbindAllTextureCube(texture) { }

	    /**
	     * @param texture {TextureCube}
	     * @param textureUnit {number}
	     * @private
	     */
		_enableTextureCube(texture, textureUnit) { }

	    /**
	     * @param texture {TextureCube}
	     * @param textureUnit {number}
	     * @private
	     */
		_disableTextureCube(texture, textureUnit) { }

	    /**
	     * @param texture {TextureCube}
	     * @param face {number}
	     * @param level {number}
	     * @private
	     */
		_updateTextureCube(texture, face, level) { }

	    /**
	     * @param texture {TextureCube}
	     * @param face {number}
	     * @param level {number}
	     * @private
	     */
		static _updateAllTextureCube(texture, face, level) { }

		//----------------------- renderTarget ------------------------

		/**
		 * @param {Visual} visual
		 */
		drawPrimitive(visual) {
			let type = visual.primitiveType;
			let vbuffer = visual.vertexBuffer;
			let ibuffer = visual.indexBuffer;
			let gl = this.gl;
			let numPixelsDrawn;
			let numSegments;

			switch (type) {
				case Visual$1.PT_TRIMESH:
				case Visual$1.PT_TRISTRIP:
				case Visual$1.PT_TRIFAN:
					{
						let numVertices = vbuffer.numElements;
						let numIndices = ibuffer.numElements;
						if (numVertices > 0 && numIndices > 0) {
							let indexType = (ibuffer.elementSize == 2) ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
							let indexData = ibuffer.offset;
							if (visual.wire) {
								gl.drawElements(gl.LINE_LOOP, numIndices, indexType, indexData);
							} else {
								gl.drawElements(mapping.PrimitiveType[type], numIndices, indexType, indexData);
							}
						}
						break;
					}
				default:
					console.assert(false, 'Invalid type', type);
			}
		}

		___drawPrimitiveWithoutIndices(visual) {
			let type = visual.primitiveType;
			let vbuffer = visual.vertexBuffer;
			let gl = this.gl;
			let numSegments;

			switch (type) {
				case Visual$1.PT_TRIMESH:
				case Visual$1.PT_TRISTRIP:
				case Visual$1.PT_TRIFAN:
					{
						let numVertices = vbuffer.numElements;
						if (numVertices > 0) {
							if (visual.wire) {
								gl.drawArrays(gl.LINE_LOOP, 0, numVertices);
							} else {
								gl.drawArrays(mapping.PrimitiveType[type], 0, numVertices);
							}
						}
						break;
					}
				case Visual$1.PT_POLYSEGMENTS_CONTIGUOUS:
					{
						numSegments = visual.getNumSegments();
						if (numSegments > 0) {
							gl.drawArrays(gl.LINE_STRIP, 0, numSegments + 1);
						}
						break;
					}
				case Visual$1.PT_POLYSEGMENTS_DISJOINT:
					{
						numSegments = visual.getNumSegments();
						if (numSegments > 0) {
							gl.drawArrays(gl.LINES, 0, 2 * numSegments);
						}
						break;
					}
				case Visual$1.PT_POLYPOINT:
					{
						let numPoints = visual.numPoints;
						if (numPoints > 0) {
							gl.drawArrays(gl.POINTS, 0, numPoints);
						}
						break;
					}
				default:
					console.assert(false, 'Invalid type', type);
			}
		}

		/**
		 * draw text
		 * @param {number} x
		 * @param {number} y
		 * @param {string} color
		 * @param {string} message
		 */
		drawText(x, y, color, message) {
			// let gl = this.gl;
			// let textContext = this.textContext;
			// const h = 14;
			// // let w = textContext.measureText(message);
			// textContext.clearRect(0, 0, textContext.canvas.width, textContext.canvas.height);
			// textContext.textBaseline = 'top';
			// textContext.font = 'lighter 28px Menlo';
			// textContext.fillStyle = color;

			// textContext.fillText(message, x, y);
		}

		preDraw() { return true; }
		postDraw() { this.gl.flush(); }

		/**
		 * 混合状态设置
		 * @param {AlphaState} alphaState 
		 */
		setAlphaState(alphaState) {
			if (!this.overrideAlphaState) {
				this.alphaState = alphaState;
			}
			else {
				this.alphaState = this.overrideAlphaState;
			}

			let gl = this.gl;
			let as = this.alphaState;
			let CRS = this.data.currentRS;

			if (as.blendEnabled) {
				if (!CRS.alphaBlendEnabled) {
					CRS.alphaBlendEnabled = true;
					gl.enable(gl.BLEND);
				}
				let srcBlend = mapping.AlphaBlend[as.srcBlend];
				let dstBlend = mapping.AlphaBlend[as.dstBlend];
				if (srcBlend != CRS.alphaSrcBlend || dstBlend != CRS.alphaDstBlend) {
					CRS.alphaSrcBlend = srcBlend;
					CRS.alphaDstBlend = dstBlend;
					gl.blendFunc(srcBlend, dstBlend);
				}

				if (as.constantColor !== CRS.blendColor) {
					CRS.blendColor = as.constantColor;
					gl.blendColor(CRS.blendColor[0], CRS.blendColor[1], CRS.blendColor[2], CRS.blendColor[3]);
				}
			}
			else {
				if (CRS.alphaBlendEnabled) {
					CRS.alphaBlendEnabled = false;
					gl.disable(gl.BLEND);
				}
			}
		}

		/**
		 * 剔除状态
		 * @param cullState {CullState}
		 */
		setCullState(cullState) {
			let cs;
			let gl = this.gl;
			if (!this.overrideCullState) {
				cs = cullState;
			}
			else {
				cs = this.overrideCullState;
			}
			this.cullState = cs;
			let CRS = this.data.currentRS;

			if (cs.enabled) {
				if (!CRS.cullEnabled) {
					CRS.cullEnabled = true;
					gl.enable(gl.CULL_FACE);
					gl.frontFace(gl.CCW);
				}
				let order = cs.CCWOrder;
				if (this.reverseCullOrder) {
					order = !order;
				}
				if (order !== CRS.CCWOrder) {
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
		}

		/**
		 * 设置深度测试状态
		 * @param {DepthState} depthState
		 */
		setDepthState(depthState) {
			let ds = (!this.overrideDepthState) ? depthState : this.overrideDepthState;
			let gl = this.gl;

			this.depthState = ds;
			let CRS = this.data.currentRS;

			if (ds.enabled) {
				if (!CRS.depthEnabled) {
					CRS.depthEnabled = true;
					gl.enable(gl.DEPTH_TEST);
				}

				let compare = mapping.DepthCompare[ds.compare];
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
		}

		/**
		 * @param {OffsetState} offsetState
		 */
		setOffsetState(offsetState) {
			let os;
			let gl = this.gl;
			let CRS = this.data.currentRS;
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
		}

		/**
		 * 设置模板测试状态
		 * @param {StencilState} stencilState
		 */
		setStencilState(stencilState) {
			let gl = this.gl;
			let ss;
			if (!this.overrideStencilState) {
				ss = stencilState;
			}
			else {
				ss = this.overrideStencilState;
			}
			this.stencilState = ss;
			let CRS = this.data.currentRS;
			if (ss.enabled) {
				if (!CRS.stencilEnabled) {
					CRS.stencilEnabled = true;
					gl.enable(gl.STENCIL_TEST);
				}

				let compare = mapping.StencilCompare[ss.compare];
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

				let onFail = mapping.StencilOperation[ss.onFail];
				let onZFail = mapping.StencilOperation[ss.onZFail];
				let onZPass = mapping.StencilOperation[ss.onZPass];

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
		}

		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} width
		 * @param {number} height
		 */
		setViewport(x, y, width, height) {
			this.gl.viewport(x, y, width, height);
		}
		setDepthRange(min, max) {
			this.gl.depthRange(min, max);
		}
		resize(width, height) {
			this.width = width;
			this.height = height;
			const gl = this.gl;
			const param = gl.getParameter(gl.VIEWPORT);
			gl.viewport(param[0], param[1], width, height);
		}

		clearColorBuffer() {
			let c = this.clearColor;
			let gl = this.gl;
			gl.clearColor(c[0], c[1], c[2], c[3]);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
		clearDepthBuffer() {
			const gl = this.gl;
			gl.clearDepth(this.clearDepth);
			gl.clear(gl.DEPTH_BUFFER_BIT);
		}
		clearStencilBuffer() {
			let gl = this.gl;
			gl.clearStencil(this.clearStencil);
			gl.clear(gl.STENCIL_BUFFER_BIT);
		}

		clearColorBuffer(x, y, width, height) {
			const gl = this.gl;
			const cc = this.clearColor;
			gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(x, y, width, height);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} width
		 * @param {number} height
		 */
		clearDepthBuffer(x, y, width, height) {
			const gl = this.gl;
			gl.clearDepth(this.clearDepth);
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(x, y, width, height);
			gl.clear(gl.DEPTH_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} width
		 * @param {number} height
		 */
		clearStencilBuffer(x, y, width, height) {
			const gl = this.gl;
			gl.clearStencil(this.clearStencil);
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(x, y, width, height);
			gl.clear(gl.STENCIL_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}
		/**
		 * @param {number} x
		 * @param {number} y
		 * @param {number} width
		 * @param {number} height
		 */
		clearBuffers(x, y, width, height) {
			let gl = this.gl;
			if (x) {
				gl.enable(gl.SCISSOR_TEST);
				gl.scissor(x, y, width, height);
			}
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
			if (x) {
				gl.disable(gl.SCISSOR_TEST);
			}
		}

		/**
		 * 设置颜色掩码
		 * @param {boolean} allowRed
		 * @param {boolean} allowGreen
		 * @param {boolean} allowBlue
		 * @param {boolean} allowAlpha
		 */
		setColorMask(allowRed = false, allowGreen = false, allowBlue = false, allowAlpha = false) {
			this.allowRed = allowRed;
			this.allowGreen = allowGreen;
			this.allowBlue = allowBlue;
			this.allowAlpha = allowAlpha;
			this.gl.colorMask(allowRed, allowGreen, allowBlue, allowBlue);
		}
	}

	class Texture2D extends Texture {
	    /**
	     * @param {number} format - 纹理格式， 参考Texture.TT_XXX
	     * @param {number} width
	     * @param {number} height
	     * @param {boolean} mipmaps - 是否生成mipmaps
	     */
	    constructor(format, width, height, mipmaps = false) {
	        console.assert(width >= 0, 'width must be positive');
	        console.assert(height >= 0, 'height must be positive');
	        let canMipMaps = false;
	        if (mipmaps) {
	            let w = _Math.log2OfPowerOfTwo(width);
	            let h = _Math.log2OfPowerOfTwo(height);
	            canMipMaps = (Math.pow(2, w) === width && Math.pow(2, h) === height);
	            console.assert(canMipMaps, 'width or height is not pow of 2, can\'t generate Mipmaps');
	        }
	        super(format, Texture.TT_2D);
	        this.width = width;
	        this.height = height;
	        this.hasMipmaps = canMipMaps;
	        this._update();
	    }

	    set enableMipMaps(val) {
	        if (val) {
	            let w = _Math.log2OfPowerOfTwo(this.width);
	            let h = _Math.log2OfPowerOfTwo(this.height);
	            let canMipMaps = (Math.pow(2, w) === this.width && Math.pow(2, h) === this.height);
	            console.assert(canMipMaps, 'width or height is not pow of 2, can\'t generate Mipmaps');
	            this.hasMipmaps = canMipMaps;
	            return;
	        }
	        this.hasMipmaps = false;
	    }

	    _update() {
	        this.computeNumLevelBytes();
	        this.data = new Uint8Array(this.numTotalBytes);
	    }

	    getData() { return this.data; }

	    upload() { 
	        console.time(`${this.constructor.name} - ${this.name}`);
	        Renderer$1.updateAll(this);
	        console.timeEnd(`${this.constructor.name} - ${this.name}`);        
	    }

	    /**
	     * @param {ArrayBuffer} buffer
	     * @returns {Promise}
	     */
	    static unpack(buffer) {
	        let texture = new Texture2D(Texture.TT_NONE,0,0);
	        let err = Texture.unpackTo(buffer, texture);
	        if (err !== null) {
	            return Promise.reject(err);
	        }
	        return Promise.resolve(texture);
	    }

	    computeNumLevelBytes() {
	        this.numTotalBytes = 0;
	        const format = this.format;
	        let dim0 = this.width,
	            dim1 = this.height,
	            max0, max1;
	        switch (format) {
	            case Texture.TT_DXT1:
	                max0 = Math.max(dim0 / 4, 1);
	                max1 = Math.max(dim1 / 4, 1);
	                this.numTotalBytes = 8 * max0 * max1;
	                break;
	            case Texture.TT_DXT3:
	            case Texture.TT_DXT5:
	                max0 = Math.max(dim0 / 4, 1);
	                max1 = Math.max(dim1 / 4, 1);
	                this.numTotalBytes = 16 * max0 * max1;
	                break;
	            default:
	                this.numTotalBytes = Texture.PIXEL_SIZE[format] * dim0 * dim1;
	        }
	    }
	}

	class RenderTarget {

	    /**
	     * @param {number} numTargets 
	     * @param {number} format 
	     * @param {number} width 
	     * @param {number} height 
	     * @param {boolean} hasMipmaps 
	     * @param {boolean} hasDepthStencil 
	     */
	    constructor(numTargets, format, width, height, hasMipmaps, hasDepthStencil) {
	        console.assert(numTargets > 0, 'Number of targets must be at least one.');

	        this.numTargets = numTargets;
	        this.hasMipmaps = hasMipmaps;
	        this.depthStencilTexture = null;

	        /**
	         * @type {Array<Texture2D>}
	         */
	        this.colorTextures = new Array(numTargets);

	        let i;
	        for (i = 0; i < numTargets; ++i) {
	            this.colorTextures[i] = new Texture2D(format, width, height, hasMipmaps);
	        }

	        if (hasDepthStencil) {
	            this.depthStencilTexture = new Texture2D(Texture.TF_D24S8, width, height, false);
	        }
	    }

	    get width() {
	        return this.colorTextures[0].width;
	    }

	    get height() {
	        return this.colorTextures[0].height;
	    }

	    get format() {
	        return this.colorTextures[0].format;
	    }

	    getColorTexture(index) {
	        return this.colorTextures[index];
	    }

	    hasDepthStencil() {
	        return this.depthStencilTexture !== null;
	    }
	}

	class TextureCube extends Texture {
	    constructor(format, dimension, numLevels) {
	        console.assert(dimension > 0, 'Dimension0 must be positive');
	        super(format, Texture.TT_CUBE, numLevels);
	        this.dimension[0][0] = dimension;
	        this.dimension[1][0] = dimension;

	        let maxLevels = 1 + _Math.log2OfPowerOfTwo(dimension | 0);

	        if (numLevels === 0) {
	            this.numLevels = maxLevels;
	        }
	        else if (numLevels <= maxLevels) {
	            this.numLevels = numLevels;
	        }
	        else {
	            console.assert(false, "Invalid number of levels\n");
	        }

	        this.computeNumLevelBytes();
	        this.data = new Uint8Array(this.numTotalBytes);
	    }

	    get width() {
	        return this.getDimension(0, 0);
	    }

	    get height() {
	        return this.getDimension(1, 0);
	    }

	    get hasMipmaps() {
	        let logDim = _Math.log2OfPowerOfTwo(this.dimension[0][0]);
	        return this.numLevels === (logDim + 1);
	    }


	    /**
	     * 获取纹理数据
	     *  返回指定纹理级别以下的所有mipmaps
	     * @param face {number} 纹理级别，
	     * @param level {number} 纹理级别，
	     * @returns {Uint8Array}
	     */
	    getData(face, level) {
	        if (0 <= level && level < this.numLevels) {
	            let faceOffset = face * this.numTotalBytes / 6;
	            let start = faceOffset + this.levelOffsets[level];
	            let end = start + this.numLevelBytes[level];
	            return this.data.subarray(start, end);
	        }

	        console.assert(false, "[ TextureCube.getData ] 's param level invalid \n");
	        return null;
	    }

	    generateMipmaps() {

	        let dim = this.dimension[0][0],
	            maxLevels = _Math.log2OfPowerOfTwo(dim) + 1,
	            face, faceOffset, faceSize, level, retainBindings = true;

	        if (this.numLevels != maxLevels) {
	            retainBindings = false;
	            //Renderer.UnbindAll(this);
	            this.numLevels = maxLevels;
	            let oldNumTotalBytes = this.numTotalBytes / 6;
	            this.computeNumLevelBytes();

	            let newData = new Uint8Array(this.numTotalBytes);
	            faceSize = this.numTotalBytes / 6;
	            for (face = 0; face < 6; ++face) {
	                let oldFaceOffset = face * oldNumTotalBytes;
	                faceOffset = face * faceSize;
	                newData.set(this.data.subarray(oldFaceOffset, this.numLevelBytes[0]), faceOffset);
	            }
	            delete this.data;
	            this.data = newData;
	        }

	        // 临时存储生成的mipmaps.
	        let rgba = new Float32Array(dim * dim * 4),
	            levels = this.numLevels,
	            texels, texelsNext, dimNext;
	        faceSize = this.numTotalBytes / 6;

	        for (face = 0; face < 6; ++face) {
	            faceOffset = face * faceSize;
	            texels = faceOffset;

	            for (level = 1; level < levels; ++level) {
	                texelsNext = faceOffset + this.levelOffsets[level];
	                dimNext = this.dimension[0][level];
	                this.generateNextMipmap(dim, texels, dimNext, texelsNext, rgba);
	                dim = dimNext;
	                texels = texelsNext;
	            }
	        }

	        if (retainBindings) {
	            for (face = 0; face < 6; ++face) {
	                for (level = 0; level < levels; ++level) {
	                    Renderer.updateAll(this, face, level);
	                }
	            }
	        }
	    }

	    /**
	     * 计算各级纹理需要的字节数
	     * @protected
	     */
	    computeNumLevelBytes() {

	        let format = this.format;

	        switch (format) {
	            case Texture.TT_R32F:
	            case Texture.TT_G32R32F:
	            case Texture.TT_A32B32G32R32F:
	                if (this.numLevels > 1) {
	                    console.assert(false, 'No mipmaps for 32-bit float textures');
	                    this.numLevels = 1;
	                }
	                break;
	            case Texture.TT_D24S8:
	                if (this.numLevels > 1) {
	                    console.assert(false, 'No mipmaps for 2D depth textures');
	                    this.numLevels = 1;
	                }
	        }
	        this.numTotalBytes = 0;

	        let dim = this.dimension[0][0],
	            m = this.numLevels,
	            level, max;


	        if (format === Texture.TT_DXT1) {
	            for (level = 0; level < m; ++level) {
	                max = dim / 4;
	                if (max < 1) {
	                    max = 1;
	                }

	                this.numLevelBytes[level] = 8 * max * max;
	                this.numTotalBytes += this.numLevelBytes[level];
	                this.dimension[0][level] = dim;
	                this.dimension[1][level] = dim;

	                if (dim > 1) {
	                    dim >>= 1;
	                }
	            }
	        }
	        else if (format === Texture.TT_DXT3 || format === Texture.TT_DXT5) {
	            for (level = 0; level < m; ++level) {
	                max = dim / 4;
	                if (max < 1) {
	                    max = 1;
	                }

	                this.numLevelBytes[level] = 16 * max * max;
	                this.numTotalBytes += this.numLevelBytes[level];
	                this.dimension[0][level] = dim;
	                this.dimension[1][level] = dim;

	                if (dim > 1) {
	                    dim >>= 1;
	                }
	            }
	        }
	        else {
	            let pixelSize = Texture.PIXEL_SIZE[format];
	            for (level = 0; level < m; ++level) {
	                this.numLevelBytes[level] = pixelSize * dim * dim;
	                this.numTotalBytes += this.numLevelBytes[level];
	                this.dimension[0][level] = dim;
	                this.dimension[1][level] = dim;

	                if (dim > 1) {
	                    dim >>= 1;
	                }
	            }
	        }

	        this.numTotalBytes *= 6;

	        this.levelOffsets[0] = 0;
	        for (level = 0, --m; level < m; ++level) {
	            this.levelOffsets[level + 1] = this.levelOffsets[level] + this.numLevelBytes[level];
	        }
	    }

	    /**
	     *
	     * @param {number} dim
	     * @param {ArrayBuffer} texels
	     * @param dimNext {number}
	     * @param texelsNext {number}
	     * @param rgba {ArrayBuffer}
	     * @protected
	     */
	    generateNextMipmap(dim, texels,
	        dimNext, texelsNext,
	        rgba) {
	        let numTexels = dim * dim,
	            format = this.format;
	        let pixelSize = Texture.PIXEL_SIZE[format];
	        // 转换纹理元素到32bitRGBA
	        Texture.COLOR_FROM_FUNC[format](numTexels, this.data.subarray(texels, texels + numTexels * pixelSize), rgba);

	        let i1, i0, j, c, base;
	        // Create the next miplevel in-place.
	        for (i1 = 0; i1 < dimNext; ++i1) {
	            for (i0 = 0; i0 < dimNext; ++i0) {
	                j = i0 + dimNext * i1;
	                base = 2 * (i0 + dim * i1);
	                for (c = 0; c < 4; ++c) {
	                    rgba[j * 4 + c] = 0.25 * (
	                        rgba[base * 4 + c] +
	                        rgba[(base + 1) * 4 + c] +
	                        rgba[(base + dim) * 4 + c] +
	                        rgba[(base + dim + 1) * 4 + c]
	                    );
	                }
	            }
	        }

	        let numTexelsNext = dimNext * dimNext;
	        // 从32bit-RGBA转换成原始格式, subArray使用的是指针
	        Texture.COLOR_TO_FUNC[format](numTexelsNext, rgba,
	            this.data.subarray(texelsNext, (texelsNext + numTexelsNext * pixelSize)));
	    }
	}

	let VBAAttr = {
	    offset: -1, // 偏移
	    eType: 0,  // 元素类型构造
	    wFn: 0,  // DataView 写函数名
	    rFn: 0,  // DataView 读函数名
	    eNum: 0,  // 元素类型数量
	    cSize: 0   // 单元大小, 字节, 缓存值
	};


	/**
	 * VertexBufferAccessor 顶点缓冲访问器
	 */
	class VertexBufferAccessor {

	    /**
	     * @param {VertexFormat} format
	     * @param {VertexBuffer} buffer
	     * @param {Boolean} endian 字节序, 默认为小端
	     */
	    constructor(format, buffer, endian = true) {
	        /**
	         * @type {VertexFormat}
	         */
	        this.format = format;
	        /**
	         * @type {VertexBuffer}
	         */
	        this.vertexBuffer = buffer;

	        this.stride = format.stride;
	        this.endian = endian;

	        /**
	         * @type {ArrayBuffer}
	         */
	        this.data = buffer.getData();
	        this.rw = new DataView(this.data.buffer);

	        var i;
	        const MAX_TCOORD_UNITS = VertexFormat$1.MAX_TCOORD_UNITS;
	        const MAX_COLOR_UNITS = VertexFormat$1.MAX_COLOR_UNITS;

	        this.position = Object.create(VBAAttr);
	        this.normal = Object.create(VBAAttr);
	        this.tangent = Object.create(VBAAttr);
	        this.binormal = Object.create(VBAAttr);
	        this.pointSize = Object.create(VBAAttr);
	        this.tCoord = new Array(MAX_TCOORD_UNITS);
	        this.color = new Array(MAX_COLOR_UNITS);
	        this.blendIndices = Object.create(VBAAttr);
	        this.blendWeight = Object.create(VBAAttr);


	        for (i = 0; i < MAX_TCOORD_UNITS; ++i) {
	            this.tCoord[i] = Object.create(VBAAttr);
	        }
	        for (i = 0; i < MAX_COLOR_UNITS; ++i) {
	            this.color[i] = Object.create(VBAAttr);
	        }

	        this._initialize();
	    }

	    /**
	     * @private
	     */
	    _initialize() {
	        let fmt = this.format;
	        let unit, units;

	        // 顶点坐标
	        fmt.fillVBAttr(VertexFormat$1.AU_POSITION, this.position);
	        // 法线
	        fmt.fillVBAttr(VertexFormat$1.AU_NORMAL, this.normal);
	        // 切线
	        fmt.fillVBAttr(VertexFormat$1.AU_TANGENT, this.tangent);
	        // 双切线
	        fmt.fillVBAttr(VertexFormat$1.AU_BINORMAL, this.binormal);
	        // 点大小
	        fmt.fillVBAttr(VertexFormat$1.AU_PSIZE, this.pointSize);
	        // 纹理坐标
	        units = VertexFormat$1.MAX_TCOORD_UNITS;
	        for (unit = 0; unit < units; ++unit) {
	            fmt.fillVBAttr(VertexFormat$1.AU_TEXCOORD, this.tCoord[unit], unit);
	        }

	        // 颜色
	        units = VertexFormat$1.MAX_COLOR_UNITS;
	        for (unit = 0; unit < units; ++unit) {
	            fmt.fillVBAttr(VertexFormat$1.AU_COLOR, this.color[unit], unit);
	        }

	        fmt.fillVBAttr(VertexFormat$1.AU_BLENDINDICES, this.blendIndices);
	        fmt.fillVBAttr(VertexFormat$1.AU_BLENDWEIGHT, this.blendWeight);
	    }

	    /**
	     * @param {Visual} visual
	     * @returns {VertexBufferAccessor}
	     */
	    static fromVisual(visual) {
	        return new VertexBufferAccessor(visual.format, visual.vertexBuffer);
	    }

	    /**
	     * 获取顶点数量
	     * @returns {number}
	     */
	    get numVertices() {
	        return this.vertexBuffer.numElements;
	    }

	    getData() {
	        return this.data;
	    }

	    /**
	     * @param {number} index
	     * @return {ArrayBufferView}
	     */
	    getPosition(index) {
	        let t = this.position;
	        let startOffset = t.offset + index * this.stride;
	        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
	    }

	    /**
	     * @param {number} index 
	     * @param {ArrayBuffer} dataArr 
	     */
	    setPosition(index, dataArr) {
	        let t = this.position;
	        let startOffset = t.offset + index * this.stride;

	        for (let i = 0, l = t.eNum; i < l; ++i) {
	            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
	        }
	    }

	    hasPosition() {
	        return this.position.offset !== -1;
	    }

	    ////////////////// 法线 ///////////////////////////////
	    getNormal(index) {
	        let t = this.normal;
	        let startOffset = t.offset + index * this.stride;
	        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
	    }

	    setNormal(index, dataArr) {
	        let t = this.normal;
	        let startOffset = t.offset + index * this.stride;

	        for (let i = 0, l = t.eNum; i < l; ++i) {
	            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
	        }
	    }

	    hasNormal() {
	        return this.normal.offset !== -1;
	    }

	    //////////////////////////////////////////////////////
	    getTangent(index) {
	        let t = this.tangent;
	        let startOffset = t.offset + index * this.stride;
	        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
	    }

	    setTangent(index, dataArr) {
	        let t = this.tangent;
	        let startOffset = t.offset + index * this.stride;

	        for (let i = 0, l = t.eNum; i < l; ++i) {
	            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
	        }
	    }

	    hasTangent() {
	        return this.tangent.offset !== -1;
	    }

	    //////////////////////////////////////////////////////
	    getBinormal(index) {
	        let t = this.binormal;
	        let startOffset = t.offset + index * this.stride;
	        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
	    }

	    setBinormal(index, dataArr) {
	        let t = this.binormal;
	        let startOffset = t.offset + index * this.stride;

	        for (let i = 0, l = t.eNum; i < l; ++i) {
	            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
	        }
	    }

	    hasBinormal() {
	        return this.binormal.offset !== -1;
	    }

	    //////////////////////////////////////////////////////
	    getPointSize(index) {
	        let t = this.pointSize;
	        let startOffset = t.offset + index * this.stride;
	        return this.rw[t.rFn](startOffset, this.endian);
	    }

	    setPointSize(index, val) {
	        let t = this.pointSize;
	        let startOffset = t.offset + index * this.stride;
	        this.rw[t.wFn](startOffset, val, this.endian);
	    }

	    hasPointSize() {
	        return this.pointSize.offset !== -1;
	    }

	    ///////////////////////////////////////////////////////////
	    getTCoord(unit, index) {
	        let t = this.tCoord[unit];
	        let startOffset = t.offset + index * this.stride;
	        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
	    }

	    /**
	     * @param {number} unit 
	     * @param {number} index 
	     * @param {Array<number>|DataView} dataArr 
	     */
	    setTCoord(unit, index, dataArr) {
	        let t = this.tCoord[unit];
	        let startOffset = t.offset + index * this.stride;

	        for (let i = 0, l = t.eNum; i < l; ++i) {
	            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
	        }
	    }

	    hasTCoord(unit) {
	        return this.tCoord[unit].offset !== -1;
	    }

	    ///////////////////////////////////////////////////////////
	    getColor(unit, index) {
	        let t = this.color[unit];
	        let startOffset = t.offset + index * this.stride;
	        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
	    }

	    setColor(unit, index, dataArr) {
	        let t = this.color[unit];
	        let startOffset = t.offset + index * this.stride;

	        for (let i = 0, l = t.eNum; i < l; ++i) {
	            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
	        }
	    }

	    hasColor(unit) {
	        return this.color[unit].offset !== -1;
	    }

	    //////////////////////////////////////////////////////
	    getBlendIndices(index) {
	        let t = this.blendIndices;
	        let startOffset = t.offset + index * this.stride;
	        return this.rw[t.rFn](startOffset, this.endian);
	    }

	    setBlendIndices(index, val) {
	        let t = this.blendIndices;
	        let startOffset = t.offset + index * this.stride;
	        this.rw[t.wFn](startOffset, val, this.endian);
	    }

	    hasBlendIndices() {
	        return this.blendIndices.offset !== -1;
	    }

	    //////////////////////////////////////////////////////
	    getBlendWeight(index) {
	        let t = this.blendWeight;
	        let startOffset = t.offset + index * this.stride;
	        return this.rw[t.rFn](startOffset, this.endian);
	    }

	    setBlendWeight(index, val) {
	        let t = this.blendWeight;
	        let startOffset = t.offset + index * this.stride;
	        this.rw[t.wFn](startOffset, val, this.endian);
	    }

	    hasBlendWeight() {
	        return this.blendWeight.offset !== -1;
	    }
	}

	class MorphController extends Controller {
		/**
		 * The numbers of vertices, morph targets, and the keys are fixed 
		 * for the lifetime of the object.  The constructor does some of 
		 * the work of creating the controller.  The vertices per target, 
		 * the times, and the weights must all be assigned by the
		 * appropriate member accessors.
		 * 
		 *  numVertices:  The number of vertices per target.  All targets have the
		 *                same number of vertices.
		 * 
		 *  numTargets:  The number of targets to morph.
		 * 
		 * numKeys:  The number of keys, each key occurring at a specific time.
		 * 
		 * @param {number} numVertices 
		 * @param {number} numTargets
		 * @param {number} numKeys 
		 */
		constructor(numVertices, numTargets, numKeys) {
			super();

			// For O(1) lookup on bounding keys.
			this._lastIndex = 0;

			// Target geometry.  The number of vertices per target must match the
			// number of vertices in the managed geometry object.  The array of
			// vertices at location 0 are those of one of the targets.  Based on the
			// comments about "Morph keys" (below), the array at location i >= 1 is
			// computed as the difference between the i-th target and the 0-th target.
			this.numVertices = numVertices;
			this.numTargets = numTargets;
			this.vertices = new Array(numTargets);
			this.vertices.map(v => new Array(numVertices));

			// Morph keys.  The morphed object is a combination of N targets by
			// weights w[0] through w[N-1] with w[i] in [0,1] and sum_i w[i] = 1.
			// Each combination is sum_{i=0}^{N-1} w[i]*X[i] where X[i] is a vertex
			// of the i-th target.  This can be rewritten as a combination
			// X[0] + sum_{i=0}^{N-2} w'[i] Y[i] where w'[i] = w[i+1] and
			// Y[i] = X[i+1] - X[0].  The weights stored in this class are the
			// w'[i] (to reduce storage).  This also reduces computation time by a
			// small amount (coefficient of X[0] is 1, so no multiplication must
			// occur).
			this.numKeys = numKeys;
			this.times = new Float32Array(numKeys);
			this.weights = new Array(numKeys);
			this.weights.map(v => new Float32Array(numTargets - 1)); // [numKeys][numTargets-1]
		}

		/**
		 * Lookup on bounding keys.
		 * @param {number} ctrlTime
		 * @return {Array<number>} - [normTime, i0, i1]
		 */
		getKeyInfo(ctrlTime, normTime, i0, i1) {
			const times = this.times;
			const numKeys = this.numKeys;

			if (ctrlTime <= times[0]) {
				this._lastIndex = 0;
				return [0, 0, 0];
			}

			if (ctrlTime >= times[numKeys - 1]) {
				this._lastIndex = numKeys - 1;
				return [0, this._lastIndex, this._lastIndex];
			}

			let nextIndex;
			if (ctrlTime > times[this._lastIndex]) {
				nextIndex = this._lastIndex + 1;
				while (ctrlTime >= times[nextIndex]) {
					this._lastIndex = nextIndex;
					++nextIndex;
				}
				return [
					(ctrlTime - times[i0]) / (times[i1] - times[i0]),
					this._lastIndex,
					nextIndex
				];
			}
			else if (ctrlTime < times[this._lastIndex]) {
				nextIndex = this._lastIndex - 1;
				while (ctrlTime <= times[nextIndex]) {
					this._lastIndex = nextIndex;
					--nextIndex;
				}
				return [
					(ctrlTime - times[i0]) / (times[i1] - times[i0]),
					nextIndex,
					this._lastIndex
				]
			}
			return [0, this._lastIndex, this._lastIndex];
		}

		/**
		 * The animation update.  The application time is in milliseconds.
		 * @param {number} applicationTime
		 */
		update(applicationTime) {
			// The key interpolation uses linear interpolation.  To get higher-order
			// interpolation, you need to provide a more sophisticated key (Bezier
			// cubic or TCB spline, for example).

			if (!super.update(applicationTime)) {
				return false;
			}

			// Get access to the vertex buffer to store the blended targets.
			let visual = this.object;
			console.assert(visual.vertexBuffer.numElements === this.numVertices, 'Mismatch in number of vertices.');

			let vba = VertexBufferAccessor.fromVisual(visual);

			// Set vertices to target[0].
			let baseTarget = this.vertices[0];
			let i;
			for (i = 0; i < this.numVertices; ++i) {
				vba.setPosition(i, baseTarget[i]);
			}

			// Look up the bounding keys.
			let ctrlTime = this.getControlTime(applicationTime);
			let [normTime, i0, i1] = this.getKeyInfo(ctrlTime, normTime, i0, i1);

			// Add the remaining components in the convex composition.
			let weights0 = this.weights[i0];
			let weights1 = this.weights[i1];
			for (i = 1; i < this.numTargets; ++i) {
				// Add in the delta-vertices of target[i].
				let coeff = (1 - normTime) * weights0[i - 1] + normTime * weights1[i - 1];
				let target = this.vertices[i];
				for (let j = 0; j < this.numVertices; ++j) {
					vba.setPosition(j, target[j].scalar(coeff).add(vba.getPosition(j)));
				}
			}

			visual.updateModelSpace(Visual.GU_NORMALS);
			Renderer.updateAll(visual.vertexBuffer);
			return true;
		}
	}

	class Camera extends D3Object {

	    /**
	     * @param {boolean} isPerspective - 是否是透视相机, true-透视, false-正交
	     */
	    constructor(isPerspective = false) {
	        super();

	        this.isPerspective = isPerspective;

	        this.position = Point$1.ORIGIN;
	        this.direction = Vector$1.UNIT_Z.negative(); //-z
	        this.up = Vector$1.UNIT_Y;
	        this.right = Vector$1.UNIT_X;

	        // 摄像机视图矩阵
	        this.viewMatrix = Matrix$1.IDENTITY;

	        // 视截体存储结构, 存储顺序 NEAR-FAR-BOTTOM-TOP-LEFT-RIGHT
	        this.frustum = new Float32Array(6);

	        // 摄像机投影矩阵
	        this.projectionMatrix = Matrix$1.IDENTITY;

	        // 投影视图矩阵， 即投影矩阵和视图矩阵的乘积
	        // 当视图前置/后置矩阵不为空时会包含它们
	        this.projectionViewMatrix = Matrix$1.IDENTITY;

	        // 视图前置矩阵，位置在模型矩阵之后，但在视图矩阵之前
	        // 用于对物体的变换， 例如反射等，默认为单位矩阵
	        this.preViewMatrix = Matrix$1.IDENTITY;
	        this.preViewIsIdentity = true;

	        // 视图后置矩阵，用于屏幕空间转换，例如反射渲染后的图像等，默认为单位矩阵
	        this.postProjectionMatrix = Matrix$1.IDENTITY;
	        this.postProjectionIsIdentity = true;

	        // 初始化
	        this.setFrame(this.position, this.direction, this.up, this.right);
	        this.setPerspective(90, 1, 1, 1000);
	    }


	    /**
	     * 所有参数均为世界坐标系
	     *
	     * @param eye {Point} 相机位置
	     * @param center {Point} 场景中心
	     * @param up {Vector} 相机上方向
	     */
	    lookAt(eye, center, up) {

	        if (eye.equals(center)) {
	            this.position.copy(Point$1.ORIGIN);
	            this.up.copy(up);
	            this.direction.copy(Vector$1.UNIT_Z.negative());
	            this.right.copy(Vector$1.UNIT_X);
	            return;
	        }

	        this.position.copy(eye);

	        // 这里可直接计算正-Z方向, 上面已经做过判断
	        let z = eye.subAsVector(center);
	        z.normalize();

	        // 计算右方向
	        let x = up.cross(z);
	        x.normalize();

	        // 计算右方向
	        let y = z.cross(x);
	        y.normalize();

	        this.direction.copy(z);
	        this.up.copy(y);
	        this.right.copy(x);

	        this.onFrameChange();
	    }

	    /**
	     * 摄像机的向量使用世界坐标系.
	     *
	     * @param position  {Point } 位置 default (0, 0,  0; 1)
	     * @param direction {Vector} 观察方向 default (0, 0, -1; 0)
	     * @param up        {Vector} 上方向 default default (0, 1, 0; 0)
	     * @returns {void}
	     */
	    setFrame(position, direction, up) {
	        this.position.copy(position);
	        let right = direction.cross(up);
	        this.setAxes(direction, up, right);
	    }

	    /**
	     * 设置摄像机位置
	     * @param position {Point}
	     * @returns {void}
	     */
	    setPosition(position) {
	        this.position.copy(position);
	        this.onFrameChange();
	    }

	    /**
	     * 设置摄像机坐标系的3个轴
	     *
	     * @param direction {Vector} 观察方向
	     * @param up        {Vector} 上方向
	     * @param right     {Vector} 右方向
	     * @returns {void}
	     */
	    setAxes(direction, up, right) {
	        this.direction.copy(direction);
	        this.up.copy(up);
	        this.right.copy(right);

	        // 判断3个轴是否正交, 否则需要校正
	        let det = direction.dot(up.cross(right));
	        if (_Math.abs(1 - det) > 0.00001) {
	            Vector$1.orthoNormalize(this.direction, this.up, this.right);
	        }
	        this.onFrameChange();
	    }

	    /**
	     * 设置透视矩阵参数
	     * @param fov {float} 垂直视角, 单位: 度
	     * @param aspect {float} 高宽比
	     * @param near {float} 近平面
	     * @param far {float} 远平面
	     */
	    setPerspective(fov, aspect, near, far) {
	        let top = near * _Math.tan(fov * _Math.PI / 360);
	        let right = top * aspect;

	        this.frustum[Camera.VF_TOP] = top;
	        this.frustum[Camera.VF_BOTTOM] = -top;
	        this.frustum[Camera.VF_RIGHT] = right;
	        this.frustum[Camera.VF_LEFT] = -right;
	        this.frustum[Camera.VF_NEAR] = near;
	        this.frustum[Camera.VF_FAR] = far;

	        this.onFrustumChange();
	    }

	    /**
	     * 返回透视图的4个参数
	     * returns {Float32Array} [fov, aspect, near, far]
	     */
	    getPerspective() {
	        let ret = new Float32Array(4);

	        if (
	            this.frustum[Camera.VF_LEFT] == -this.frustum[Camera.VF_RIGHT] &&
	            this.frustum[Camera.VF_BOTTOM] == -this.frustum[Camera.VF_TOP]
	        ) {
	            let tmp = this.frustum[Camera.VF_TOP] / this.frustum[Camera.VF_NEAR];
	            ret[0] = _Math.atan(tmp) * 360 / _Math.PI;
	            ret[1] = this.frustum[Camera.VF_RIGHT] / this.frustum[Camera.VF_TOP];
	            ret[2] = this.frustum[Camera.VF_NEAR];
	            ret[3] = this.frustum[Camera.VF_FAR];
	        }
	        return ret;
	    }

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
	    setFrustum(near, far, bottom, top, left, right) {
	        this.frustum[Camera.VF_NEAR] = near;
	        this.frustum[Camera.VF_FAR] = far;
	        this.frustum[Camera.VF_BOTTOM] = bottom;
	        this.frustum[Camera.VF_TOP] = top;
	        this.frustum[Camera.VF_LEFT] = left;
	        this.frustum[Camera.VF_RIGHT] = right;

	        this.onFrustumChange();
	    }

	    /**
	     * p00 {Point}
	     * p10 {Point}
	     * p11 {Point}
	     * p01 {Point}
	     * nearExtrude {number}
	     * farExtrude {number}
	     *
	     */
	    setProjectionMatrix(p00, p10, p11, p01,
	        nearExtrude, farExtrude) {

	        let // 计算近平面
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
	        let u0 = q100.sub(q000),
	            u1 = q010.sub(q000),
	            u2 = q001.sub(q000);

	        let m = Matrix$1.IPMake(u0, u1, u2, q000);
	        let invM = m.inverse(0.001);
	        let a = invM.mulPoint(q111);

	        // Compute the coeffients in the fractional linear transformation.
	        //   y[i] = n[i]*x[i]/(d[0]*x[0] + d[1]*x[1] + d[2]*x[2] + d[3])
	        let n0 = 2 * a.x;
	        let n1 = 2 * a.y;
	        let n2 = 2 * a.z;
	        let d0 = +a.x - a.y - a.z + 1;
	        let d1 = -a.x + a.y - a.z + 1;
	        let d2 = -a.x - a.y + a.z + 1;
	        let d3 = +a.x + a.y + a.z - 1;

	        // 从规范正方体[-1,1]^2 x [0,1]计算透视投影
	        let n20 = n2 / n0,
	            n21 = n2 / n1,
	            n20d0 = n20 * d0,
	            n21d1 = n21 * d1,
	            d32 = 2 * d3,
	            project = new Matrix$1(
	                n20 * d32 + n20d0, n21d1, d2, -n2,
	                n20d0, n21 * d32 + n21d1, d2, -n2,
	                n20d0, n21d1, d2, -n2,
	                -n20d0, -n21d1, -d2, n2
	            );

	        this.postProjectionMatrix.copy(project.mul(invM));
	        this.postProjectionIsIdentity = Matrix$1.isIdentity(this.postProjectionMatrix);
	        this.updatePVMatrix();
	    }

	    /**
	     * 设置视图前置矩阵
	     *
	     * @param mat {Matrix}
	     * @returns {void}
	     */
	    setPreViewMatrix(mat) {
	        this.preViewMatrix.copy(mat);
	        this.preViewIsIdentity = Matrix$1.isIdentity(mat);
	        this.updatePVMatrix();
	    }

	    /**
	     * 设置视图后置矩阵
	     *
	     * @param mat {Matrix}
	     * @returns {void}
	     */
	    setPostProjectionMatrix(mat) {
	        this.postProjectionMatrix.copy(mat);
	        this.postProjectionIsIdentity = Matrix$1.isIdentity(mat);
	        this.updatePVMatrix();
	    }

	    /**
	     * 在归一化后的显示空间[-1,1]x[-1,1]计算物体轴对齐包围盒
	     *
	     * @param numVertices  {number}       顶点数量
	     * @param vertices     {Float32Array} 顶点数组
	     * @param stride       {number}       步幅
	     * @param worldMatrix  {Matrix}   物体变换矩阵
	     * @returns {object}
	     */
	    computeBoundingAABB(numVertices, vertices, stride, worldMatrix) {
	        // 计算当前物体，世界视图投影矩阵.
	        let vpMatrix = this.projectionMatrix.mul(this.viewMatrix);
	        if (!this.postProjectionIsIdentity) {
	            vpMatrix.copy(this.postProjectionMatrix.mul(vpMatrix));
	        }
	        let wvpMatrix = vpMatrix.mul(worldMatrix);
	        let xmin, xmax, ymin, ymax;
	        // 计算规范化后的显示坐标包围盒
	        xmin = ymin = Infinity;
	        xmax = ymax = -Infinity;

	        for (let i = 0; i < numVertices; ++i) {
	            let pos = new Point$1(vertices[i + stride], vertices[i + stride + 1], vertices[i + stride + 2]);
	            let hpos = wvpMatrix.mulPoint(pos);
	            let invW = 1 / hpos.w;
	            let xNDC = hpos.x * invW;
	            let yNDC = hpos.y * invW;
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
	        return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
	    }

	    /**
	     * 计算变更后的视图矩阵
	     * @returns {void}
	     */
	    onFrameChange() {
	        let nPos = this.position;
	        let x = this.right, y = this.up, z = this.direction;

	        this.viewMatrix[0] = x[0];
	        this.viewMatrix[1] = y[0];
	        this.viewMatrix[2] = z[0];
	        this.viewMatrix[3] = 0;

	        this.viewMatrix[4] = x[1];
	        this.viewMatrix[5] = y[1];
	        this.viewMatrix[6] = z[1];
	        this.viewMatrix[7] = 0;

	        this.viewMatrix[8] = x[2];
	        this.viewMatrix[9] = y[2];
	        this.viewMatrix[10] = z[2];
	        this.viewMatrix[11] = 0;

	        this.viewMatrix[12] = -nPos.dot(x);
	        this.viewMatrix[13] = -nPos.dot(y);
	        this.viewMatrix[14] = -nPos.dot(z);
	        this.viewMatrix[15] = 1;

	        this.updatePVMatrix();
	    }

	    /**
	     * 视截体变化后计算投影矩阵
	     * @returns {void}
	     */
	    onFrustumChange() {
	        let f = this.frustum;
	        let near = f[Camera.VF_NEAR],
	            far = f[Camera.VF_FAR],
	            bottom = f[Camera.VF_BOTTOM],
	            top = f[Camera.VF_TOP],
	            left = f[Camera.VF_LEFT],
	            right = f[Camera.VF_RIGHT],

	            rl = right - left,
	            tb = top - bottom,
	            fn = far - near;

	        this.projectionMatrix.zero();

	        if (this.isPerspective) {
	            let near2 = 2 * near;
	            this.projectionMatrix[0] = near2 / rl;
	            this.projectionMatrix[5] = near2 / tb;
	            this.projectionMatrix[8] = (right + left) / rl;
	            this.projectionMatrix[9] = (top + bottom) / tb;
	            this.projectionMatrix[10] = -(far + near) / fn;
	            this.projectionMatrix[11] = -1;
	            this.projectionMatrix[14] = -(far * near2) / fn;
	        }
	        else {
	            this.projectionMatrix[0] = 2 / rl;
	            this.projectionMatrix[5] = 2 / tb;
	            this.projectionMatrix[10] = -2 / fn;
	            this.projectionMatrix[12] = -(left + right) / rl;
	            this.projectionMatrix[13] = -(top + bottom) / tb;
	            this.projectionMatrix[14] = -(far + near) / fn;
	            this.projectionMatrix[15] = 1;
	        }

	        this.updatePVMatrix();
	    }

	    /**
	     * 计算postproj-proj-view-preview的乘积
	     */
	    updatePVMatrix() {
	        this.projectionViewMatrix.copy(this.projectionMatrix.mul(this.viewMatrix));
	        if (!this.postProjectionIsIdentity) {
	            this.projectionViewMatrix.copy(this.postProjectionMatrix.mul(this.projectionViewMatrix));
	        }
	        if (!this.preViewIsIdentity) {
	            this.projectionViewMatrix.copy(this.projectionViewMatrix.mul(this.preViewMatrix));
	        }
	    }

	    debug() {
	        let pos = this.position;
	        let dir = this.direction;
	        console.log(`pos:[${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}]
dir:[${dir.x.toFixed(4)}, ${dir.y.toFixed(4)}, ${dir.z.toFixed(4)}]`);
	    }
	}

	DECLARE_ENUM(Camera, {
	    VF_NEAR: 0,
	    VF_FAR: 1,
	    VF_BOTTOM: 2,
	    VF_TOP: 3,
	    VF_LEFT: 4,
	    VF_RIGHT: 5,
	    VF_QUANTITY: 6
	});

	class Node extends Spatial {
	    constructor() {
	        super();
	        this.childs = [];
	    }

	    /**
	     * 获取子节点数量
	     * @returns {number}
	     */
	    getChildsNumber() {
	        return this.childs.length;
	    }

	    /**
	     * 加载子节点.
	     * 如果执行成功，则返回子节点存储的索引i, 0 <= i < getNumChildren()
	     * 数组中第一个空槽将被用来存储子节点. 如果所有的槽都不为空，则添加到数组末尾[js底层可能需要重新分配空间]
	     *
	     * 以下情况会失败,并返回-1
	     * child === null or child.parent !== null
	     *
	     * @param {Spatial} child
	     * @returns {number}
	     */
	    attachChild(child) {
	        if (child === null) {
	            console.assert(false, 'You cannot attach null children to a node.');
	            return -1;
	        }
	        if (child.parent !== null) {
	            console.assert(false, 'The child already has a parent.');
	            return -1;
	        }

	        child.parent = this;

	        let nodes = this.childs.slice(),
	            max = nodes.length;
	        for (let idx = 0; idx < max; ++idx) {
	            if (nodes[idx] === null) {
	                this.childs[idx] = child;
	                return idx;
	            }
	        }
	        this.childs[max] = child;
	        return max;
	    }

	    /**
	     * 从当前节点卸载子节点
	     * 如果child不为null且在数组中， 则返回存储的索引， 否则返回-1
	     * @param {Spatial} child
	     * @returns {number}
	     */
	    detachChild(child) {
	        if (child !== null) {
	            let nodes = this.childs.slice(),
	                max = nodes.length;
	            for (let idx = 0; idx < max; ++idx) {
	                if (nodes[idx] === child) {
	                    this.childs[idx] = null;
	                    child.parent = null;
	                    return idx;
	                }
	            }
	        }
	        return -1;
	    }

	    /**
	     * 从当前节点卸载子节点
	     * 如果 0 <= index < getNumChildren(), 则返回存储在index位置的子节点，否则返回null
	     *
	     * @param {number} index
	     * @returns {Spatial|null}
	     */
	    detachChildAt(index) {
	        let child = null;
	        if (index >= 0 && index < this.childs.length) {
	            child = this.childs[index];
	            if (child !== null) {
	                child.parent = null;
	                this.childs[index] = null;
	            }
	        }
	        return child;
	    }

	    /**
	     * 在index位置放入child,并返回被替换的元素
	     * @param {number} index
	     * @param {Spatial} child
	     * @returns {Spatial|null}
	     */
	    setChild(index, child) {
	        if (child && child.parent !== null) return null;

	        if (index >= 0 && index < this.childs.length) {
	            let prev = this.childs[index];
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
	    }

	    /**
	     * 通过索引获取子节点
	     * @param {number} index
	     * @returns {Spatial|null}
	     */
	    getChild(index) {
	        let child = null;
	        if (index >= 0 && index < this.childs.length) {
	            child = this.childs[index];
	        }
	        return child;
	    }

	    /**
	     * @param {number} applicationTime
	     */
	    updateWorldData(applicationTime) {
	        super.updateWorldData(applicationTime);
	        let nodes = this.childs.slice(),
	            max = nodes.length;
	        for (let idx = 0; idx < max; ++idx) {
	            if (nodes[idx]) {
	                nodes[idx].update(applicationTime, false);
	            }
	        }
	    }

	    updateWorldBound() {
	        if (!this.worldBoundIsCurrent) {
	            // Start with an invalid bound.
	            this.worldBound.center = Point$1.ORIGIN;
	            this.worldBound.radius = 0;
	            let nodes = this.childs.slice(),
	                max = nodes.length;
	            for (let idx = 0; idx < max; ++idx) {
	                if (nodes[idx]) {
	                    this.worldBound.growToContain(nodes[idx].worldBound);
	                }
	            }
	        }
	    }

	    /**
	     * @param {Culler} culler
	     * @param {boolean} noCull
	     */
	    getVisibleSet(culler, noCull) {
	        let nodes = this.childs.slice(),
	            max = nodes.length;
	        for (let idx = 0; idx < max; ++idx) {
	            if (nodes[idx]) {
	                nodes[idx].onGetVisibleSet(culler, noCull);
	            }
	        }
	    }
	    /**
	     * @param {InStream} inStream
	     */
	    load(inStream) {
	        super.load(inStream);
	        let numChildren = inStream.readUint32();
	        if (numChildren > 0) {
	            this.childs = inStream.readSizedPointerArray(numChildren);
	        }
	    }
	    /**
	     * @param {InStream} inStream
	     */
	    link(inStream) {
	        super.link(inStream);
	        this.childs.forEach(function (c, i) {
	            this.childs[i] = inStream.resolveLink(c);
	            this.setChild(i, this.childs[i]);
	        }, this);
	    }
	}

	D3Object.Register('Node', Node.factory);

	class CameraNode extends Node {
	    constructor(camera) {
	        super();
	        this._camera = camera;
	    }

	    set camera(val) {
	        this._camera = val;
	        if (val) {
	            this.localTransform.setTranslate(val.position);

	            let rotate = new Matrix$1.IPMake(
	                val.direction,
	                val.up,
	                val.right,
	                L5.Point.ORIGIN
	            );
	            this.localTransform.setRotate(rotate);
	            this.update();
	        }
	    }

	    updateWorldData(applicationTime) {
	        super.updateWorldData(applicationTime);

	        if (this._camera) {
	            let pos = this.worldTransform.getTranslate();
	            let rotate = this.worldTransform.getRotate();
	            let direction = Vector$1.ZERO;
	            let up = Vector$1.ZERO;
	            let right = Vector$1.ZERO;
	            rotate.getColumn(0, direction);
	            rotate.getColumn(1, up);
	            rotate.getColumn(2, right);
	            this._camera.setFrame(pos, direction, up, right);
	        }
	    }
	}

	class Projector extends Camera {
		constructor(isPerspective = true) {
			super(isPerspective);
		}
	}

	DECLARE_ENUM(Projector, {
		biasScaleMatrix: [new Matrix$1(
			0.5, 0.0, 0.0, 0.5,
			0.0, -0.5, 0.0, 0.5,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		), new Matrix$1(
			0.5, 0.0, 0.0, 0.5,
			0.0, -0.5, 0.0, 0.5,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		)]
	});

	class VisibleSet {
	    constructor() {
	        this.numVisible = 0;
	        this.visibles = [];
	    }

	    getNumVisible() {
	        return this.numVisible;
	    }

	    getAllVisible() {
	        return this.visibles;
	    }

	    getVisible(index) {
	        console.assert(0 <= index && index < this.numVisible, 'Invalid index to getVisible');
	        return this.visibles[index];
	    }

	    insert(visible) {
	        const size = this.visibles.length;
	        if (this.numVisible < size) {
	            this.visibles[this.numVisible] = visible;
	        }
	        else {
	            this.visibles.push(visible);
	        }
	        ++this.numVisible;
	    }

	    clear() {
	        this.numVisible = 0;
	    }
	}

	class Culler {

	    /**
	     * construction.  Culling requires a camera model.  If the camera is 
	     * not passed to the constructor, you should set it using camera setter
	     *  before calling ComputeVisibleSet.
	     * @param {Camera|null} camera 
	     */
	    constructor(camera = null) {
	        // The input camera has information that might be needed during the
	        // culling pass over the scene.
	        this._camera = camera;

	        /**
	         * The potentially visible set for a call to getVisibleSet.
	         * @type {VisibleSet}
	         * @private
	         */
	        this._visibleSet = new VisibleSet();

	        // The data members _frustum, _plane, and _planeState are
	        // uninitialized.  They are initialized in the getVisibleSet call.

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
	        this._plane = new Array(Culler.MAX_PLANE_QUANTITY);
	        for (let i = 0, l = this._plane.length; i < l; ++i) {
	            this._plane[i] = new Plane$1(Vector$1.ZERO, 0);
	        }
	        this._planeState = 0;

	        // 传入摄像机的视截体副本
	        // 主要用于在裁剪时供各种子系统修改视截体参数, 而不影响摄像机
	        // 渲染器需要这些内部状态
	        this._frustum = new Array(Camera.VF_QUANTITY);
	    }
	    get camera() {
	        return this._camera;
	    }
	    set camera(camera) {
	        this._camera = camera;
	    }

	    set frustum(frustum) {
	        if (!this._camera) {
	            console.assert(false, 'set frustum requires the existence of a camera');
	            return;
	        }

	        const VF_NEAR = Camera.VF_NEAR,
	            VF_FAR = Camera.VF_FAR,
	            VF_BOTTOM = Camera.VF_BOTTOM,
	            VF_TOP = Camera.VF_TOP,
	            VF_LEFT = Camera.VF_LEFT,
	            VF_RIGHT = Camera.VF_RIGHT;

	        let near, far, bottom, top, left, right;

	        // 赋值到当前实例.
	        this._frustum[VF_NEAR] = near = frustum[VF_NEAR];
	        this._frustum[VF_FAR] = far = frustum[VF_FAR];
	        this._frustum[VF_BOTTOM] = bottom = frustum[VF_BOTTOM];
	        this._frustum[VF_TOP] = top = frustum[VF_TOP];
	        this._frustum[VF_LEFT] = left = frustum[VF_LEFT];
	        this._frustum[VF_RIGHT] = right = frustum[VF_RIGHT];

	        let near2 = near * near;
	        let bottom2 = bottom * bottom;
	        let top2 = top * top;
	        let left2 = left * left;
	        let right2 = right * right;

	        // 获取相机坐标结构
	        let position = this._camera.position;
	        let directionVec = this._camera.direction;
	        let upVec = this._camera.up;
	        let rightVec = this._camera.right;
	        let dirDotEye = position.dot(directionVec);

	        // 更新近平面
	        this._plane[VF_NEAR].normal = Vector$1.ZERO.copy(directionVec);
	        this._plane[VF_NEAR].constant = dirDotEye + near;

	        // 更新远平面
	        this._plane[VF_FAR].normal = directionVec.negative();
	        this._plane[VF_FAR].constant = -(dirDotEye + far);

	        // 更新下平面
	        let invLength = _Math.invSqrt(near2 + bottom2);
	        let c0 = -bottom * invLength;
	        let c1 = near * invLength;
	        let normal = directionVec.scalar(c0).add(upVec.scalar(c1));
	        let constant = position.dot(normal);
	        this._plane[VF_BOTTOM].normal = normal;
	        this._plane[VF_BOTTOM].constant = constant;

	        // 更新上平面
	        invLength = _Math.invSqrt(near2 + top2);
	        c0 = top * invLength;
	        c1 = -near * invLength;
	        normal = directionVec.scalar(c0).add(upVec.scalar(c1));
	        constant = position.dot(normal);
	        this._plane[VF_TOP].normal = normal;
	        this._plane[VF_TOP].constant = constant;

	        // 更新左平面
	        invLength = _Math.invSqrt(near2 + left2);
	        c0 = -left * invLength;
	        c1 = near * invLength;
	        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
	        constant = position.dot(normal);
	        this._plane[VF_LEFT].normal = normal;
	        this._plane[VF_LEFT].constant = constant;

	        // 更新右平面
	        invLength = _Math.invSqrt(near2 + right2);
	        c0 = right * invLength;
	        c1 = -near * invLength;
	        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
	        constant = position.dot(normal);
	        this._plane[VF_RIGHT].normal = normal;
	        this._plane[VF_RIGHT].constant = constant;

	        // 所有的平面已经初始化
	        this._planeState = 0xFFFFFFFF;
	    }

	    get frustum() {
	        return this._frustum;
	    }

	    get visibleSet() {
	        return this._visibleSet;
	    }

	    get planeState() {
	        return this._planeState;
	    }

	    set planeState(val) {
	        this._planeState = val;
	    }

	    get planes() {
	        return this._plane;
	    }

	    get planeQuantity() {
	        return this._planeQuantity;
	    }

	    pushPlan(plane) {
	        if (this._planeQuantity < Culler.MAX_PLANE_QUANTITY) {
	            // The number of user-defined planes is limited.
	            this._plane[this._planeQuantity] = plane;
	            ++this._planeQuantity;
	        }
	    }

	    popPlane() {
	        if (this._planeQuantity > Camera.VF_QUANTITY) {
	            // Frustum planes may not be removed from the stack.
	            --this._planeQuantity;
	        }
	    }

	    /**
	     * The base class behavior is to append the visible object to the end of
	     * the visible set (stored as an array).  Derived classes may override
	     * this behavior; for example, the array might be maintained as a sorted
	     * array for minimizing render state changes or it might be/ maintained
	     * as a unique list of objects for a portal system.
	     * @param {Spatial} visible
	     */
	    insert(visible) {
	        this._visibleSet.insert(visible);
	    }

	    /**
	     * Compare the object's world bound against the culling planes.
	     * Only Spatial calls this function.
	     *
	     * @param {Bound} bound
	     * @returns {boolean}
	     */
	    isVisible(bound) {
	        if (bound.radius === 0) {
	            // 该节点是虚拟节点，不可见
	            return false;
	        }

	        // Start with the last pushed plane, which is potentially the most
	        // restrictive plane.
	        let index = this._planeQuantity - 1;
	        let mask = (1 << index);

	        for (let i = 0; i < this._planeQuantity; ++i, --index, mask >>= 1) {
	            if (this._planeState & mask) {
	                let side = bound.whichSide(this._plane[index]);

	                if (side < 0) {
	                    // 对象在平面的反面, 剔除掉
	                    return false;
	                }

	                if (side > 0) {
	                    // 对象在平面的正面
	                    // There is no need to compare subobjects against this plane
	                    // so mark it as inactive.
	                    this._planeState &= ~mask;
	                }
	            }
	        }

	        return true;
	    }

	    /**
	     * Support for Portal.getVisibleSet.
	     * @param {number} numVertices
	     * @param {Array<Point>} vertices
	     * @param {boolean} ignoreNearPlane
	     */
	    isVisible1(numVertices, vertices, ignoreNearPlane) {
	        // The Boolean letiable ignoreNearPlane should be set to 'true' when
	        // the test polygon is a portal.  This avoids the situation when the
	        // portal is in the view pyramid (eye+left/right/top/bottom), but is
	        // between the eye and near plane.  In such a situation you do not want
	        // the portal system to cull the portal.  This situation typically occurs
	        // when the camera moves through the portal from current region to
	        // adjacent region.

	        // Start with the last pushed plane, which is potentially the most
	        // restrictive plane.
	        let index = this._planeQuantity - 1;
	        for (let i = 0; i < this._planeQuantity; ++i, --index) {
	            let plane = this._plane[index];
	            if (ignoreNearPlane && (index === Camera.VF_NEAR)) {
	                continue;
	            }

	            let j;
	            for (j = 0; j < numVertices; ++j) {
	                let side = plane.whichSide(vertices[j]);
	                if (side >= 0) {
	                    // The polygon is not totally outside this plane.
	                    break;
	                }
	            }

	            if (j === numVertices) {
	                // The polygon is totally outside this plane.
	                return false;
	            }
	        }

	        return true;
	    }

	    // Support for BspNode.getVisibleSet.  Determine whether the view frustum
	    // is fully on one side of a plane.  The "positive side" of the plane is
	    // the half space to which the plane normal points.  The "negative side"
	    // is the other half space.  The function returns +1 if the view frustum
	    // is fully on the positive side of the plane, -1 if the view frustum is
	    // fully on the negative side of the plane, or 0 if the view frustum
	    // straddles the plane.  The input plane is in world coordinates and the
	    // world camera coordinate system is used for the test.
	    /**
	     * @param {Plane} plane
	     * @returns {number}
	     */
	    whichSide(plane) {
	        // The plane is N*(X-C) = 0 where the * indicates dot product.  The signed
	        // distance from the camera location E to the plane is N*(E-C).
	        let NdEmC = plane.distanceTo(this._camera.position);

	        let normal = plane.normal;
	        let NdD = normal.dot(this._camera.direction);
	        let NdU = normal.dot(this._camera.up);
	        let NdR = normal.dot(this._camera.right);
	        let FdN = this._frustum[Camera.VF_FAR] / this._frustum[Camera.VF_NEAR];

	        let positive = 0, negative = 0, sgnDist;

	        // Check near-plane vertices.
	        let PDMin = this._frustum[Camera.VF_NEAR] * NdD;
	        let NUMin = this._frustum[Camera.VF_BOTTOM] * NdU;
	        let NUMax = this._frustum[Camera.VF_TOP] * NdU;
	        let NRMin = this._frustum[Camera.VF_LEFT] * NdR;
	        let NRMax = this._frustum[Camera.VF_RIGHT] * NdR;

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
	        let PDMax = this._frustum[Camera.VF_FAR] * NdD;
	        let FUMin = FdN * NUMin;
	        let FUMax = FdN * NUMax;
	        let FRMin = FdN * NRMin;
	        let FRMax = FdN * NRMax;

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
	    }

	    /**
	     * 计算裁剪后的可见物体
	     * @param {Spatial} scene
	     */
	    computeVisibleSet(scene) {
	        if (this._camera && scene) {
	            this.frustum = this.camera.frustum;
	            this._visibleSet.clear();
	            scene.onGetVisibleSet(this, false);
	            return;
	        }
	        console.assert(false, 'A camera and a scene are required for culling');
	    }

	}

	DECLARE_ENUM(Culler, { MAX_PLANE_QUANTITY: 32 });

	class Light extends D3Object {
	    constructor(type) {
	        super();
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
	        this.angle = Math.PI;
	        this.cosAngle = -1.0;
	        this.sinAngle = 0.0;
	        this.exponent = 1.0;

	        this.position = Point$1.ORIGIN;
	        this.direction = Vector$1.UNIT_Z.negative();
	        this.up = Vector$1.UNIT_Y;
	        this.right = Vector$1.UNIT_X;
	    }

	    /**
	     * 设置光源[聚光灯]角度
	     * @param {number} angle - 弧度有效值 0< angle <= PI
	     */
	    setAngle(angle) {
	        console.assert(0 < angle && angle <= Math.PI, 'Angle out of range in SetAngle');
	        this.angle = angle;
	        this.cosAngle = Math.cos(angle);
	        this.sinAngle = Math.sin(angle);
	    }

	    /**
	     * 设置光源方向
	     * @param {Vector} dir - 方向向量
	     */
	    setDirection(dir) {
	        dir.normalize();
	        this.direction.copy(dir);
	        Vector$1.generateComplementBasis(this.up, this.right, this.direction);
	    }

	    /**
	     * 设置光源位置
	     *
	     * 只对点光源以及聚光灯有效
	     * @param {Point} pos - 位置
	     */
	    setPosition(pos) {
	        this.position.copy(pos);
	    }

	    load(inStream) {
	        super.load(inStream);
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
	    }

	    save(outStream) {
	        super.save(outStream);
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
	    }

	    /**
	     * 文件解析工厂方法
	     * @param {InStream} inStream
	     * @returns {Light}
	     */
	    static factory(inStream) {
	        var l = new Light(Light.LT_INVALID);
	        l.load(inStream);
	        return l;
	    }
	}

	DECLARE_ENUM(Light, {
	    LT_AMBIENT: 0,  // 环境光
	    LT_DIRECTIONAL: 1, // 方向光
	    LT_POINT: 2, // 点光源
	    LT_SPOT: 3, // 聚光等
	    LT_INVALID: 4 // 无效光源
	});

	D3Object.Register('Light', Light.factory);

	/**
	 * 光源节点
	 *
	 * 该节点的worldTransform平移,使用光源position(位置)
	 * 该节点的worldTransform旋转,使用光源的坐标系(up, right, direction)
	 */
	class LightNode extends Node {

	    /**
	     * @param {Light} light
	     */
	    constructor(light = null) {
	        super();
	        this.light = light;

	        if (light) {
	            this.localTransform.setTranslate(light.position);
	            let rotate = Matrix$1.fromVectorAndPoint(light.direction, light.up, light.right, Point$1.ORIGIN);
	            this.localTransform.setRotate(rotate);
	        }
	    }
	    /**
	     * 设置灯光
	     * @param {Light} light 
	     */
	    setLight(light) {
	        this.light = light;
	        if (light) {
	            this.localTransform.setTranslate(light.position);
	            let rotate = Matrix$1.fromVectorAndPoint(light.direction, light.up, light.right, Point$1.ORIGIN);
	            this.localTransform.setRotate(rotate);
	            this.update();
	        }
	    }

	    /**
	     * @param {number} applicationTime
	     */
	    updateWorldData(applicationTime) {
	        super.updateWorldData(applicationTime);
	        let light = this.light;
	        if (light) {
	            light.position.copy(this.worldTransform.getTranslate());
	            let rotate = this.worldTransform.getRotate();
	            rotate.getColumn(0, light.direction);
	            rotate.getColumn(1, light.up);
	            rotate.getColumn(2, light.right);
	        }
	    }
	}

	class Material extends D3Object {

	    constructor(opts = {}) {
	        super();

	        this.type = Material.ANY;

	        opts = Material.parseOption(opts);

	        let val = opts.emissive;
	        this.emissive = new Float32Array([val[0], val[1], val[2], 1]);
	        val = opts.ambient;
	        this.ambient = new Float32Array([val[0], val[1], val[2], 1]);

	        val = opts.diffuse;
	        // 材质透明度在反射颜色的alpha通道
	        this.diffuse = new Float32Array([val[0], val[1], val[2], opts.alpha]);

	        val = opts.specular;
	        // 镜面高光指数存储在alpha通道
	        this.specular = new Float32Array([val[0], val[1], val[2], opts.exponent]);
	    }

	    get alpha() {
	        return this.diffuse[3];
	    }

	    static get defaultOptions() {
	        return {
	            alpha: 1,
	            exponent: 32,
	            ambient: new Float32Array(4),
	            emissive: new Float32Array(4),
	            diffuse: new Float32Array(4),
	            specular: new Float32Array(4)
	        };
	    }

	    static parseOption(opts) {
	        let defOption = Object.assign({}, Material.defaultOptions);
	        if (opts.alpha && opts.alpha >= 0 && opts.alpha <= 1) {
	            defOption.alpha = opts.alpha;
	        }
	        if (opts.exponent) {
	            defOption.exponent = opts.exponent;
	        }
	        if (opts.ambient) {
	            if (typeof opts.ambient === 'number') {
	                defOption.ambient[0] = ((opts.ambient >> 16) & 0xff) / 255;
	                defOption.ambient[1] = ((opts.ambient >> 8) & 0xff) / 255;
	                defOption.ambient[2] = (opts.ambient & 0xff) / 255;
	            } else {
	                defOption.ambient.set(opts.ambient);
	            }
	        }
	        if (opts.emissive) {
	            if (typeof opts.emissive === 'number') {
	                defOption.emissive[0] = ((opts.emissive >> 16) & 0xff) / 255;
	                defOption.emissive[1] = ((opts.emissive >> 8) & 0xff) / 255;
	                defOption.emissive[2] = (opts.emissive & 0xff) / 255;
	            } else {
	                defOption.emissive.set(opts.emissive);
	            }
	        }
	        if (opts.diffuse) {
	            if (typeof opts.diffuse === 'number') {
	                defOption.diffuse[0] = ((opts.diffuse >> 16) & 0xff) / 255;
	                defOption.diffuse[1] = ((opts.diffuse >> 8) & 0xff) / 255;
	                defOption.diffuse[2] = (opts.diffuse & 0xff) / 255;
	            } else {
	                defOption.diffuse.set(opts.diffuse);
	            }
	        }
	        if (opts.specular) {
	            if (typeof opts.specular === 'number') {
	                defOption.specular[0] = ((opts.specular >> 16) & 0xff) / 255;
	                defOption.specular[1] = ((opts.specular >> 8) & 0xff) / 255;
	                defOption.specular[2] = (opts.specular & 0xff) / 255;
	            } else {
	                defOption.specular.set(opts.specular);
	            }
	        }
	        return defOption;
	    }

	    static factory(inStream) {
	        var obj = new Material();
	        obj.emissive[3] = 0;
	        obj.ambient[3] = 0;
	        obj.diffuse[3] = 0;
	        obj.load(inStream);
	        return obj;
	    }
	}

	D3Object.Register('Material', Material.factory);

	DECLARE_ENUM(Material, {
	    ANY: 0,
	    LAMBERT: 1,
	    PHONG: 2,
	    BLINN: 3,
	    CONTANT: 4
	});

	class Triangles extends Visual$1 {

	    /**
	     * @abstract
	     */
	    getNumTriangles() {
	        throw new Error('Method:' + this.constructor.name + '.getNumTriangles not defined.');
	    }

	    /**
	     * @param {number} index
	     * @param {Array<number>} output
	     * @return {boolean}
	     * @abstract
	     */
	    getTriangle(index, output) {
	        throw new Error('Method:' + this.constructor.name + '.getTriangle not defined.');
	    }

	    /**
	     * @return {number}
	     */
	    getNumVertices() {
	        return this.vertexBuffer.numElements;
	    }

	    /**
	     * 获取物体坐标系的三角形顶点数组
	     * @param {number} i
	     * @param {Array<Point>} modelTriangle
	     */
	    getModelTriangle(i, modelTriangle) {
	        let v = new Array(3);
	        if (this.getTriangle(i, v)) {
	            let vba = new VertexBufferAccessor(this.format, this.vertexBuffer);
	            let p = vba.getPosition(v[0]);
	            modelTriangle[0] = new Point$1(p[0], p[1], p[2]);

	            p = vba.getPosition(v[1]);
	            modelTriangle[1] = new Point$1(p[0], p[1], p[2]);

	            p = vba.getPosition(v[2]);
	            modelTriangle[2] = new Point$1(p[0], p[1], p[2]);
	            return true;
	        }
	        return false;
	    }

	    /**
	     * 获取世界坐标系的三角形顶点数组
	     * @param {number} i
	     * @param {Point} worldTriangle
	     */
	    getWorldTriangle(i, worldTriangle) {
	        let pos = new Array(3);
	        if (this.getModelTriangle(i, pos)) {
	            worldTriangle[0] = this.worldTransform.mulPoint(pos[0]);
	            worldTriangle[1] = this.worldTransform.mulPoint(pos[1]);
	            worldTriangle[2] = this.worldTransform.mulPoint(pos[2]);
	            return true;
	        }
	        return false;
	    }

	    /**
	     * @param {number} v
	     * @returns {Point}
	     */
	    getPosition(v) {
	        let index = this.format.getIndex(VertexFormat.AU_POSITION);
	        if (index >= 0) {
	            let offset = this.format.getOffset(index);
	            let stride = this.format.stride;
	            let start = offset + v * stride;
	            return new Point$1(
	                new Float32Array(this.vertexBuffer.getData(), start, 3)
	            );
	        }

	        console.assert(false, 'GetPosition failed.');
	        return new Point$1(0, 0, 0);
	    }

	    updateModelSpace(type) {
	        this.updateModelBound();
	        if (type === Visual$1.GU_MODEL_BOUND_ONLY) {
	            return;
	        }

	        let vba = VertexBufferAccessor.fromVisual(this);
	        if (vba.hasNormal()) {
	            this.updateModelNormals(vba);
	        }

	        if (type !== Visual$1.GU_NORMALS) {
	            if (vba.hasTangent() || vba.hasBinormal()) {
	                if (type === Visual$1.GU_USE_GEOMETRY) {
	                    this.updateModelTangentsUseGeometry(vba);
	                }
	                else {
	                    this.updateModelTangentsUseTCoords(vba);
	                }
	            }
	        }

	        Renderer$1.updateAll(this.vertexBuffer, this.format);
	    }

	    /**
	     * @param {VertexBufferAccessor} vba
	     */
	    updateModelNormals(vba) {
	        const numTriangles = this.getNumTriangles();

	        let i, t, pos0, pos1, pos2, tv0, tv1, tNormal,
	            v = new Uint32Array(3);

	        for (i = 0; i < numTriangles; ++i) {
	            // Get the vertex indices for the triangle.
	            if (!this.getTriangle(i, v)) {
	                continue;
	            }
	            pos0 = new Point$1(vba.getPosition(v[0]));
	            pos1 = new Point$1(vba.getPosition(v[1]));
	            pos2 = new Point$1(vba.getPosition(v[2]));

	            tv0 = pos1.subAsVector(pos0); // pos1 - pos0
	            tv1 = pos2.subAsVector(pos0); // pos2 - pos0
	            tNormal = tv0.cross(tv1);
	            vba.setNormal(v[0], tNormal.add(vba.getNormal(v[0])));
	            vba.setNormal(v[1], tNormal.add(vba.getNormal(v[1])));
	            vba.setNormal(v[2], tNormal.add(vba.getNormal(v[2])));
	        }

	        const numVertices = this.getNumVertices();
	        tNormal = Vector$1.ZERO;
	        for (i = 0; i < numVertices; ++i) {
	            tNormal.copy(vba.getNormal(i)).normalize();
	            vba.setNormal(i, tNormal);
	        }
	    }

	    /**
	     * 更新物体模型空间切线
	     * @param {VertexBufferAccessor} vba
	     */
	    updateModelTangentsUseGeometry(vba) {
	        // Compute the matrix of normal derivatives.
	        const numVertices = vba.getNumVertices();
	        let dNormal = new Array(numVertices);
	        let wwTrn = new Array(numVertices);
	        let dwTrn = new Array(numVertices);
	        let i, j, row, col;

	        for (i = 0; i < numTriangles; ++i) {
	            wwTrn[i] = new Matrix().zero();
	            dwTrn[i] = new Matrix().zero();
	            dNormal[i] = new Matrix().zero();

	            // 获取三角形的3个顶点索引.
	            let v = new Array(3);
	            if (!this.getTriangle(i, v)) {
	                continue;
	            }

	            for (j = 0; j < 3; j++) {
	                // 获取顶点坐标和法线.
	                let v0 = v[j];
	                let v1 = v[(j + 1) % 3];
	                let v2 = v[(j + 2) % 3];
	                let pos0 = new Point$1(vba.getPosition(v0));
	                let pos1 = new Point$1(vba.getPosition(v1));
	                let pos2 = new Point$1(vba.getPosition(v2));
	                let nor0 = new Vector$1(vba.getNormal(v0));
	                let nor1 = new Vector$1(vba.getNormal(v1));
	                let nor2 = new Vector$1(vba.getNormal(v2));

	                // 计算从pos0到pos1的边,使其射向顶点切面，然后计算相邻法线的差
	                let edge = pos1.subAsVector(pos0);
	                let proj = edge.sub(nor0.scalar(edge.dot(nor0)));
	                let diff = nor1.sub(nor0);
	                for (row = 0; row < 3; ++row) {
	                    for (col = 0; col < 3; ++col) {
	                        wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
	                        dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
	                    }
	                }

	                // 计算从pos0到pos2的边,使其射向顶点切面，然后计算相邻法线的差
	                edge = pos2.subAsVector(pos0);
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
	            let nor = vba.getNormal(i);
	            for (row = 0; row < 3; ++row) {
	                for (col = 0; col < 3; ++col) {
	                    wwTrn[i].setItem(row, col, 0.5 * wwTrn[i].item(row, col) + nor[row] * nor[col]);
	                    dwTrn[i].setItem(row, col, dwTrn[i].item(row, col) * 0.5);
	                }
	            }

	            wwTrn[i].setColumn(3, Point$1.ORIGIN);
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
	            let norvec = new Vector$1(vba.getNormal(i));
	            let uvec = new Vector$1(),
	                vvec = new Vector$1();

	            Vector$1.generateComplementBasis(uvec, vvec, norvec);

	            // Compute S = J^T * dN/dX * J.  In theory S is symmetric, but
	            // because we have estimated dN/dX, we must slightly adjust our
	            // calculations to make sure S is symmetric.
	            let s01 = uvec.dot(dNormal[i].mulPoint(vvec));
	            let s10 = vvec.dot(dNormal[i].mulPoint(uvec));
	            let sAvr = 0.5 * (s01 + s10);
	            let smat = [
	                [uvec.dot(dNormal[i].mulPoint(uvec)), sAvr],
	                [sAvr, vvec.dot(dNormal[i].mulPoint(vvec))]
	            ];

	            // Compute the eigenvalues of S (min and max curvatures).
	            let trace = smat[0][0] + smat[1][1];
	            let det = smat[0][0] * smat[1][1] - smat[0][1] * smat[1][0];
	            let discr = trace * trace - 4.0 * det;
	            let rootDiscr = Math.sqrt(Math.abs(discr));
	            let minCurvature = 0.5 * (trace - rootDiscr);
	            // float maxCurvature = 0.5f*(trace + rootDiscr);

	            // Compute the eigenvectors of S.
	            let evec0 = new Vector$1(smat[0][1], minCurvature - smat[0][0], 0);
	            let evec1 = new Vector$1(minCurvature - smat[1][1], smat[1][0], 0);

	            let tanvec, binvec;
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
	                let t = vba.getTangent(i);
	                t[0] = tanvec.x;
	                t[1] = tanvec.y;
	                t[2] = tanvec.z;
	            }

	            if (vba.hasBinormal()) {
	                let b = vba.getBinormal(i);
	                b[0] = binvec.x;
	                b[1] = binvec.y;
	                b[2] = binvec.z;
	            }
	        }
	        dNormal = null;
	    }

	    /**
	     * @param {VertexBufferAccessor} vba
	     */
	    updateModelTangentsUseTCoords(vba) {
	        // Each vertex can be visited multiple times, so compute the tangent
	        // space only on the first visit.  Use the zero vector as a flag for the
	        // tangent vector not being computed.
	        const numVertices = vba.getNumVertices();
	        let hasTangent = vba.hasTangent();
	        let zero = Vector$1.ZERO;
	        let i, t;
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
	            let v = [0, 0, 0];
	            if (!this.getTriangle(i, v)) {
	                continue;
	            }

	            let locPosition = new Array(3);
	            let locNormal = new Array(3);
	            let locTangent = new Array(3);
	            let locTCoord = new Array(2);
	            let curr, k;
	            for (curr = 0; curr < 3; ++curr) {
	                k = v[curr];
	                locPosition[curr] = new Point$1(vba.getPosition(k));
	                locNormal[curr] = new Vector$1(vba.getNormal(k));
	                locTangent[curr] = new Vector$1((hasTangent ? vba.getTangent(k) : vba.getBinormal(k)));
	                locTCoord[curr] = vba.getTCoord(0, k);
	            }

	            for (curr = 0; curr < 3; ++curr) {
	                let currLocTangent = locTangent[curr];
	                if (!currLocTangent.equals(zero)) {
	                    // 该顶点已被计算过
	                    continue;
	                }

	                // 计算顶点切线空间
	                let norvec = locNormal[curr];
	                let prev = ((curr + 2) % 3);
	                let next = ((curr + 1) % 3);
	                let tanvec = Triangles.computeTangent(
	                    locPosition[curr], locTCoord[curr],
	                    locPosition[next], locTCoord[next],
	                    locPosition[prev], locTCoord[prev]
	                );

	                // Project T into the tangent plane by projecting out the surface
	                // normal N, and then making it unit length.
	                tanvec -= norvec.dot(tanvec) * norvec;
	                tanvec.normalize();

	                // Compute the bitangent B, another tangent perpendicular to T.
	                let binvec = norvec.unitCross(tanvec);

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
	    }

	    /**
	     * 计算切线
	     *
	     * @param {Point} position0
	     * @param {Array<number>} tcoord0
	     * @param {Point} position1
	     * @param {Array<number>} tcoord1
	     * @param {Point} position2
	     * @param {Array<number>} tcoord2
	     * @returns {Vector}
	     */
	    static computeTangent(position0, tcoord0,
	        position1, tcoord1,
	        position2, tcoord2) {
	        // Compute the change in positions at the vertex P0.
	        let v10 = position1.subAsVector(position0);
	        let v20 = position2.subAsVector(position0);

	        const ZERO_TOLERANCE = Math.ZERO_TOLERANCE;
	        const abs = Math.abs;

	        if (abs(v10.length()) < ZERO_TOLERANCE ||
	            abs(v20.length()) < ZERO_TOLERANCE) {
	            // The triangle is very small, call it degenerate.
	            return Vector$1.ZERO;
	        }

	        // Compute the change in texture coordinates at the vertex P0 in the
	        // direction of edge P1-P0.
	        let d1 = tcoord1[0] - tcoord0[0];
	        let d2 = tcoord1[1] - tcoord0[1];
	        if (abs(d2) < ZERO_TOLERANCE) {
	            // The triangle effectively has no letiation in the v texture
	            // coordinate.
	            if (abs(d1) < ZERO_TOLERANCE) {
	                // The triangle effectively has no letiation in the u coordinate.
	                // Since the texture coordinates do not lety on this triangle,
	                // treat it as a degenerate parametric surface.
	                return Vector$1.ZERO;
	            }

	            // The letiation is effectively all in u, so set the tangent vector
	            // to be T = dP/du.
	            return v10.div(d1);
	        }

	        // Compute the change in texture coordinates at the vertex P0 in the
	        // direction of edge P2-P0.
	        let d3 = tcoord2[0] - tcoord0[0];
	        let d4 = tcoord2[1] - tcoord0[1];
	        let det = d2 * d3 - d4 * d1;
	        if (abs(det) < ZERO_TOLERANCE) {
	            // The triangle vertices are collinear in parameter space, so treat
	            // this as a degenerate parametric surface.
	            return Vector$1.ZERO;
	        }

	        // The triangle vertices are not collinear in parameter space, so choose
	        // the tangent to be dP/du = (dv1*dP2-dv2*dP1)/(dv1*du2-dv2*du1)
	        return v20.scalar(d2).sub(v10.scalar(d4)).div(det);
	    }
	}

	class TriMesh extends Triangles {

	    /**
	     * @param {VertexFormat} format
	     * @param {VertexBuffer} vertexBuffer
	     * @param {IndexBuffer} indexBuffer
	     */
	    constructor(format, vertexBuffer, indexBuffer) {
	        super(Visual$1.PT_TRIMESH, format, vertexBuffer, indexBuffer);
	    }

	    /**
	     * @returns {number}
	     */
	    getNumTriangles() {
	        return this.indexBuffer.numElements / 3;
	    }

	    /**
	     * 获取位置I处的三角形索引
	     * @param {number} i
	     * @param {Array<number>} output 3 elements
	     * @returns {boolean}
	     */
	    getTriangle(i, output) {
	        if (0 <= i && i < this.getNumTriangles()) {
	            let data = this.indexBuffer.getData();
	            data = new Uint32Array(data.subarray(3 * i * 4, 3 * (i + 1) * 4).buffer);
	            output[0] = data[0];
	            output[1] = data[1];
	            output[2] = data[2];
	            return true;
	        }
	        return false;
	    }
	}

	D3Object.Register('TriMesh', TriMesh.factory);

	/**
	 * The VertexFormat object must have 3-tuple positions. 
	 * It must also have 2-tuple texture coordinates in channel zero;
	 * these are set to the standard ones (unit square per quadrilateral).
	 * The number of elements of vbuffer must be a multiple of 4.
	 * The number of elements of particles is 1/4 of the number of elements of vbuffer.
	 * The index buffer is automatically generated.
	 * The 'positionSizes' contain position in the first three components and size in the fourth component.
	 */
	class Particles extends TriMesh {

	    /**
	     * @param {VertexFormat} vformat
	     * @param {VertexBuffer} vbuffer
	     * @param {number} indexSize 
	     * @param {Float32Array} positionSizes
	     * @param {number} sizeAdjust 
	     */
	    constructor(vformat, vbuffer, indexSize, positionSizes, sizeAdjust) {
	        super(vformat, vbuffer, null);
	        console.assert(indexSize === 2 || indexSize === 4, 'Invalid index size.');

	        this.positionSizes = positionSizes;
	        let numVertices = this.vertexBuffer.numElements;
	        console.assert((numVertices % 4) == 0, 'Number of vertices must be a multiple of 4');

	        this.numParticles = numVertices / 4;
	        this._numActive = this.numParticles;

	        this.sizeAdjust = sizeAdjust;

	        // Get access to the texture coordinates.
	        let vba = new VertexBufferAccessor(vformat, this.vertexBuffer);
	        console.assert(vba.hasTCoord(0), 'Texture coordinates must exist and use channel 0');

	        // Set the texture coordinates to the standard ones.
	        let i, j;
	        for (i = 0, j = 0; i < this.numParticles; ++i) {
	            vba.setTCoord(0, j++, [0, 0]);
	            vba.setTCoord(0, j++, [1, 0]);
	            vba.setTCoord(0, j++, [1, 1]);
	            vba.setTCoord(0, j++, [0, 1]);
	        }

	        // Generate the indices for the quadrilaterals.
	        this.indexBuffer = new IndexBuffer$1(6 * this.numParticles, indexSize);

	        let iFI = 0, iFIp1 = 0, iFIp2 = 0, iFIp3 = 0;

	        if (indexSize === 2) {
	            let indices = new Uint16Array(this.indexBuffer.getData().buffer);
	            for (i = 0; i < this.numParticles; ++i) {
	                iFI = 4 * i;
	                iFIp1 = iFI + 1;
	                iFIp2 = iFI + 2;
	                iFIp3 = iFI + 3;
	                indices[i * 6] = iFI;
	                indices[i * 6 + 1] = iFIp1;
	                indices[i * 6 + 2] = iFIp2;
	                indices[i * 6 + 3] = iFI;
	                indices[i * 6 + 4] = iFIp2;
	                indices[i * 6 + 5] = iFIp3;
	            }
	        } else {
	            // indexSize == 4
	            let indices = new Uint32Array(this.indexBuffer.getData().buffer);
	            for (i = 0; i < this.numParticles; ++i) {
	                iFI = 4 * i;
	                iFIp1 = iFI + 1;
	                iFIp2 = iFI + 2;
	                iFIp3 = iFI + 3;
	                indices[i * 6] = iFI;
	                indices[i * 6 + 1] = iFIp1;
	                indices[i * 6 + 2] = iFIp2;
	                indices[i * 6 + 3] = iFI;
	                indices[i * 6 + 4] = iFIp2;
	                indices[i * 6 + 5] = iFIp3;
	            }
	        }

	        // Compute a bounding sphere based only on the particle locations.
	        this.modelBound.computeFromData(this.numParticles, 16/* sizeof(float*4) */, positionSizes.buffer);
	    }

	    set sizeAdjust(sizeAdjust) {
	        if (sizeAdjust > 0) {
	            this._sizeAdjust = sizeAdjust;
	        } else {
	            console.assert(false, 'Invalid size-adjust parameter');
	            this._sizeAdjust = 1;
	        }
	    }
	    get sizeAdjust() { return this._sizeAdjust; }

	    set numActive(numActive) {
	        if (0 <= numActive && numActive <= this.numParticles) {
	            this._numActive = numActive;
	        }
	        else {
	            this._numActive = this.numParticles;
	        }

	        this.indexBuffer.numElements = 6 * this._numActive;
	        this.vertexBuffer.numElements = 4 * this._numActive;
	    }
	    get numActive() { return this._numActive; }


	    /**
	     * The particles are billboards that always face the camera.
	     * @param {Camera} camera
	     */
	    generateParticles(camera) {
	        // Get access to the positions.
	        let vba = new VertexBufferAccessor(this.format, this.vertexBuffer);
	        console.assert(vba.hasPosition(), 'Positions must exist');

	        // Get camera axis directions in model space of particles.
	        let UpR = this.worldTransform.inverse().mulPoint(camera.up.add(camera.right));
	        let UmR = this.worldTransform.inverse().mulPoint(camera.up.sub(camera.right));
	        let posSize = this.positionSizes;

	        let offset, position, trueSize, scaledUpR, scaledUmR;
	        // Generate quadrilaterals as pairs of triangles.
	        for (let i = 0, j = 0; i < this._numActive; ++i) {
	            offset = i * 4;
	            position = new Point$1(posSize[offset], posSize[offset + 1], posSize[offset + 2]);
	            trueSize = this._sizeAdjust * posSize[offset + 3];
	            scaledUpR = UpR.scalar(trueSize);
	            scaledUmR = UmR.scalar(trueSize);
	            vba.setPosition(j++, position.sub(scaledUpR));
	            vba.setPosition(j++, position.sub(scaledUmR));
	            vba.setPosition(j++, position.add(scaledUpR));
	            vba.setPosition(j++, position.add(scaledUmR));
	        }
	        this.updateModelSpace(Visual$1.GU_NORMALS);
	        Renderer$1.updateAll(this.vertexBuffer);
	    }

	    /**
	     * Support for hierarchical culling.
	     * @param {Culler} culler  
	     * @param {boolean} noCull
	     */
	    getVisibleSet(culler, noCull) {
	        this.generateParticles(culler.camera);
	        super.getVisibleSet(culler, noCull);
	    }
	}

	class SwitchNode extends Node {
	    constructor() {
	        this.activeChild = SwitchNode.SN_INVALID_CHILD;
	    }

		/**
		 * @param {number} activeChild 
		 */
	    setActiveChild(activeChild) {
	        console.assert(activeChild === SwitchNode.SN_INVALID_CHILD || activeChild < this.childs.length, 'Invalid active child specified');
	        this.activeChild = activeChild;
	    }
	    getActiveChild() {
	        return this.activeChild;
	    }
	    disableAllChildren() {
	        this.activeChild = SwitchNode.SN_INVALID_CHILD;
	    }

	    // Support for hierarchical culling.
	    getVisibleSet(culler, noCull) {
	        if (this.activeChild === SwitchNode.SN_INVALID_CHILD) {
	            return;
	        }

	        // All Visual objects in the active subtree are added to the visible set.
	        let child = this.childs[thia.activeChild];
	        if (child) {
	            child.onGetVisibleSet(culler, noCull);
	        }
	    }
	}

	DECLARE_ENUM(SwitchNode, { SN_INVALID_CHILD: -1 });

	class PickRecord {
		constructor() {
			/**
			 * The intersected object.
			 * @type {Spatial}
			 */
			this.intersected = null;

			// The linear component is parameterized by P + t*D.  The T member is
			// the value of parameter t at the intersection point.
			this.T = 0;

			// The index of the triangle that is intersected by the ray.
			this.triangle = 0;

			// The barycentric coordinates of the point of intersection.  All of the
			// coordinates are in [0,1] and b0 + b1 + b2 = 1.
			this.bary = new Array(3);
		}
	}

	class Picker {

		constructor() {
			this._origin = Point$1.ORIGIN;
			this._direction = Vector$1.ZERO;
			this._tmin = 0;
			this._tmax = 0;
			/**
			 * @type {Array<PickRecord>}
			 */
			this.records = [];
		}

		/**
		 * The linear component is parameterized by P + t*D, where P is a point on
		 * the component (P is the origin), D is a unit-length direction, and t is
		 * a scalar in the interval [tmin,tmax] with tmin < tmax.  The P and D
		 * values must be in world coordinates.  The choices for tmin and tmax are
		 *    line:     tmin = -Math.MAX_REAL, tmax = Math.MAX_REAL
		 *    ray:      tmin = 0, tmax = Math.MAX_REAL
		 *    segment:  tmin = 0, tmax > 0;
		 * 
		 * A call to this function will automatically clear the Records array.
		 * If you need any information from this array obtained by a previous
		 * call to execute, you must save it first.
		 * 
		 * @param {Spatial} scene
		 * @param {Point} origin
		 * @param {Vector} direction
		 * @param {number} tmin
		 * @param {number} tmax
		 */
		execute(scene, origin, direction, tmin, tmax) {
			this._origin.copy(origin);
			this._direction.copy(direction);
			this._tmin = tmin;
			this._tmax = tmax;
			this.records.length = 0;
			this._executeRecursive(scene);
		}

	    /**
		 * Locate the record whose T value is smallest in absolute value.
		 * @return {PickRecord}
		 */
		getClosestToZero() {
			if (this.records.length == 0) {
				return msInvalid;
			}

			let closest = _Math.abs(this.records[0].T);
			let index = 0;
			const numRecords = this.records.length;
			for (let i = 1; i < numRecords; ++i) {
				let tmp = _Math.abs(this.records[i].T);
				if (tmp < closest) {
					closest = tmp;
					index = i;
				}
			}
			return this.records[index];
		}

		/**
		 * Locate the record with nonnegative T value closest to zero.
		 * @return {PickRecord}
		 */
		getClosestNonnegative() {
			if (this.records.length === 0) {
				return Picker.invalid;
			}

			// Get first nonnegative value.
			let closest = _Math.MAX_REAL;
			let index;
			const numRecords = this.records.length;
			for (index = 0; index < numRecords; ++index) {
				if (this.records[index].T >= 0) {
					closest = this.records[index].T;
					break;
				}
			}
			if (index == numRecords) {
				return Picker.invalid;
			}

			for (let i = index + 1; i < numRecords; ++i) {
				if (0 <= this.records[i].T && this.records[i].T < closest) {
					closest = this.records[i].T;
					index = i;
				}
			}
			return this.records[index];
		}

		/**
		 * Locate the record with nonpositive T value closest to zero
		 * @return {PickRecord}
		 */
		getClosestNonpositive() {
			if (this.records.length === 0) {
				return Picker.invalid;
			}

			// Get first nonpositive value.
			let closest = -_Math.MAX_REAL;
			let index;
			const numRecords = this.records.length;
			for (index = 0; index < numRecords; ++index) {
				if (this.records[index].T <= 0) {
					closest = this.records[index].T;
					break;
				}
			}
			if (index === numRecords) {
				return Picker.invalid; // All values are positive.
			}

			for (let i = index + 1; i < numRecords; ++i) {
				if (closest < this.records[i].T && this.records[i].T <= 0) {
					closest = this.records[i].T;
					index = i;
				}
			}
			return this.records[index];
		}

		/**
		 * The picking occurs recursively by traversing the input scene
		 * @param {Spatial} obj
		 */
		_executeRecursive(obj) {
			let mesh = obj;
			if (mesh instanceof Triangles) {
				if (mesh.worldBound.testIntersection(this._origin, this._direction, this._tmin, this._tmax)) {
					// Convert the linear component to model-space coordinates.
					let ptmp = mesh.worldTransform.inverse().mulPoint(this._origin);
					let modelOrg = new Vector$1(ptmp.x, ptmp.y, ptmp.z);

					let vtmp = mesh.worldTransform.inverse.mulPoint(this._direction);
					let modelDirection = new Vector$1(vtmp.x, vtmp.y, vtmp.z);

					let line = new Line3(modelOrg, modelDirection);

					// Get the position data.
					let vba = VertexBufferAccessor.fromVisual(mesh);

					// Compute intersections with the model-space triangles.
					let numTriangles = mesh.getNumTriangles();
					for (let i = 0; i < numTriangles; ++i) {
						let vs = [0, 0, 0];
						if (!mesh.getTriangle(i, v0, v1, v2)) {
							continue;
						}
						let v0 = vba.getPosition(vs[0]);
						let v1 = vba.getPosition(vs[1]);
						let v2 = vba.getPosition(vs[2]);
						let triangle = new Triangle3(v0, v1, v2);
						let calc = new IntrLineTriangle(line, triangle);
						if (calc.find() && this._tmin <= calc.getLineParameter() && calc.getLineParameter() <= this._tmax) {
							let record = new PickRecord;
							record.intersected = mesh;
							record.T = calc.getLineParameter();
							record.Triangle = i;
							record.bary[0] = calc.getTriBary0();
							record.bary[1] = calc.getTriBary1();
							record.bary[2] = calc.getTriBary2();
							this.records.push(record);
						}
					}
				}
				return;
			}

			if (mesh instanceof SwitchNode) {
				let activeChild = mesh.getActiveChild();
				if (activeChild != SwitchNode.SN_INVALID_CHILD) {
					if (mesh.worldBound.testIntersection(this._origin, this._direction, this._tmin, this._tmax)) {
						let child = mesh.getChild(activeChild);
						if (child) {
							this._executeRecursive(child);
						}
					}
				}
				return;
			}

			if (mesh instanceof Node) {
				if (mesh.worldBound.testIntersection(this._origin, this._direction, this._tmin, this._tmax)) {
					for (let i = 0, t = mesh.getChildsNumber(); i < t; ++i) {
						let child = mesh.getChild(i);
						if (child) {
							this._executeRecursive(child);
						}
					}
				}
			}
		}
	}

	DECLARE_ENUM(Picker, { invalid: new PickRecord });

	class PolyPoint extends Visual$1 {

	    /**
	     * @param {VertexFormat} format
	     * @param {VertexBuffer} vertexBuffer
	     */
	    constructor(format, vertexBuffer) {
	        super(Visual$1.PT_POLYPOINT, format, vertexBuffer, null);
	        this.numPoints = vertexBuffer.numElements;
	    }

	    getMaxNumPoints() {
	        return this.vertexBuffer.numElements;
	    }

	    setNumPoints(num) {
	        let numVertices = this.vertexBuffer.numElements;
	        if (0 <= num && num <= numVertices) {
	            this.numPoints = num;
	        }
	        else {
	            this.numPoints = numVertices;
	        }
	    }
	}

	class Polysegment extends Visual$1 {

		/**
		 * If 'contiguous' is 'true', then the vertices form a true 
		 * polysegment in the sense that each pair of consecutive vertices 
		 * are connected by a line segment.  For example,
		 * {V0,V1,V2,V3} form segments <V0,V1>, <V1,V2>, and <V2,V3>.  If you
		 * want a closed polysegment, the input vertex buffer's last element must
		 * be a duplicate of the first element.  For example, {V0,V1,V2,V3=V0}
		 * forms the triangle with segments <V0,V1>, <V1,V2>, and <V2,V0>.
		 * If 'contiguous' is 'false', the vertices form a set of disconnected
		 * line segments.  For example, {V0,V1,V2,V3} form segments <V0,V1>
		 * and <V2,V3>.  In this case, the input vertex buffer must have an
		 * even number of elements.
		 * @param {VertexFormat} vformat 
		 * @param {VertexBuffer} vbuffer 
		 * @param {boolean} contiguous 
		 */
		constructor(vformat, vbuffer, contiguous) {
			super(contiguous ? Visual$1.PT_POLYSEGMENTS_CONTIGUOUS : Visual$1.PT_POLYSEGMENTS_DISJOINT, vformat, vbuffer, null);
			// The polyline has contiguous or disjoint segments.
			this.contiguous = contiguous;

			let numVertices = vbuffer.numElements;
			console.assert(numVertices >= 2, 'Polysegments must have at least two points.');

			// The number of segments currently active.

			if (contiguous) {
				this.numSegments = numVertices - 1;
			}
			else {
				console.assert((numVertices & 1) == 0, 'Disconnected segments require an even number of vertices.');
				this.numSegments = numVertices / 2;
			}
		}

		getMaxNumSegments() {
			let numVertices = this.vertexBuffer.numElements;
			return this.contiguous ? numVertices - 1 : numVertices / 2;
		}

		SetNumSegments(numSegments) {
			let numVertices = this.vertexBuffer.numElements;
			if (this.contiguous) {
				let numVerticesM1 = numVertices - 1;
				if (0 <= numSegments && numSegments <= numVerticesM1) {
					this.numSegments = numSegments;
				}
				else {
					this.numSegments = numVerticesM1;
				}
			}
			else {
				let numVerticesD2 = numVertices / 2;
				if (0 <= numSegments && numSegments <= numVerticesD2) {
					this.numSegments = numSegments;
				}
				else {
					this.numSegments = numVerticesD2;
				}
			}
		}

	}

	class ScreenTarget {

		/** 
		 * Create a screen-space camera for use with render targets.
		 * @return {Camera}
		 */
		static createCamera() {
			// The screen camera maps (x,y,z) in [0,1]^3 to (x',y,'z') in
			// [-1,1]^2 x [0,1].
			let camera = new Camera(false);
			camera.setFrustum(0, 1, 0, 1, 0, 1);
			camera.setFrame(Point$1.ORIGIN, Vector$1.UNIT_Z, Vector$1.UNIT_Y);
			return camera;
		}

		/**
		 * Create a screen-space rectangle for a render target of the specified
		 * dimensions.  The vertex format must have 3-tuple positions and 2-tuple
		 * texture coordinates in unit 0.  These attributes are filled in by the
		 * function.  Any other attributes are not processed.  The rectangle
		 * [xmin,xmax]x[ymin,ymax] must be contained in [0,1]x[0,1].
		 * @param {VertexFromat} vformat
		 * @param {number} width
		 * @param {number} height
		 * @param {number} xmin
		 * @param {number} xmax
		 * @param {number} ymin
		 * @param {number} ymax
		 * @param {number} zValue
		 */
		static createRectangle(vformat, width, height, xmin, xmax, ymin, ymax, zValue) {
			if (ScreenTarget._validFormat(vformat) && ScreenTarget._validSizes(width, height)) {
				let vbuffer = new VertexBuffer(4, vformat.stride);
				let vba = new VertexBufferAccessor(vformat, vbuffer);
				vba.setPosition(0, [xmin, ymin, zValue]);
				vba.setPosition(1, [xmax, ymin, zValue]);
				vba.setPosition(2, [xmax, ymax, zValue]);
				vba.setPosition(3, [xmin, ymax, zValue]);

				vba.setTCoord(0, 0, [0, 0]);
				vba.setTCoord(0, 1, [1, 0]);
				vba.setTCoord(0, 2, [1, 1]);
				vba.setTCoord(0, 3, [0, 1]);

				// Create the index buffer for the square.
				let ibuffer = new IndexBuffer$1(6, Uint32Array.BYTES_PER_ELEMENT);
				let indices = new Uint32Array(ibuffer.getData().buffer);
				indices[0] = 0; indices[1] = 1; indices[2] = 2;
				indices[3] = 0; indices[4] = 2; indices[5] = 3;

				return new TriMesh(vformat, vbuffer, ibuffer);
			}

			return null;
		}

		/**
		 * Copy the screen-space rectangle positions to the input array.
		 * @param {number} width
		 * @param {number} height
		 * @param {number} xmin
		 * @param {number} xmax
		 * @param {number} ymin
		 * @param {number} ymax
		 * @param {number} zValue
		 * @param {Array<Point>} positions
		 */
		static createPositions(width, height, xmin, xmax, ymin, ymax, zValue, positions) {
			if (ScreenTarget._validSizes(width, height)) {
				xmin = 0;
				xmax = 1;
				ymin = 0;
				ymax = 1;
				positions[0].assign(xmin, ymin, zValue);
				positions[1].assign(xmax, ymin, zValue);
				positions[2].assign(xmax, ymax, zValue);
				positions[3].assign(xmin, ymax, zValue);
				return true;
			}

			return false;
		}

	    /**
		 * Copy the screen-space rectangle texture coordinates to the input array.
		 */
		static createTCoords(tcoords) {
			tcoords[0] = [0, 0];
			tcoords[1] = [1, 0];
			tcoords[2] = [1, 1];
			tcoords[3] = [0, 1];
		}

		/**
		 * @param {number} width 
		 * @param {number} height
		 */
		static _validSizes(width, height) {
			if (width > 0 && height > 0) {
				return true;
			}

			console.assert(false, 'Invalid dimensions');
			return false;
		}

		/**
		 * @param {VertexFormat} vformat 
		 */
		static _validFormat(vformat) {
			let index = vformat.getIndex(VertexFormat$1.AU_POSITION, 0);
			if (index < 0) {
				console.assert(false, 'Format must have positions.');
				return false;
			}

			if (vformat.getAttributeType(index) != VertexFormat$1.AT_FLOAT3) {
				console.assert(false, 'Positions must be 3-tuples.');
				return false;
			}

			index = vformat.getIndex(VertexFormat$1.AU_TEXCOORD, 0);
			if (index < 0) {
				console.assert(false, 'Format must have texture coordinates in unit 0.');
				return false;
			}

			if (vformat.getAttributeType(index) !== VertexFormat$1.AT_FLOAT2) {
				console.assert(false, 'Texture coordinates in unit 0 must be 2-tuples.');
				return false;
			}

			return true;
		}
	}

	class StandardMesh {
	    /**
	     * 标准网格 - StandardMesh
	     *
	     * @param {VertexFormat} format - 网格顶点格式
	     * @param {boolean} isStatic - 是否使用静态缓冲, 默认true;
	     * @param {boolean} inside - 是否反向卷绕, 默认false
	     * @param {Transform} transform - 默认为单位变换
	     */
	    constructor(format, isStatic = true, inside = false, transform = Transform$1.IDENTITY) {
	        this.format = format;
	        this.transform = transform;
	        this.isStatic = isStatic;
	        this.inside = inside;
	        this.hasNormals = false;

	        this.usage = isStatic ? Buffer.BU_STATIC : Buffer.BU_DYNAMIC;

	        // 检查顶点坐标
	        let posIndex = format.getIndex(VertexFormat$1.AU_POSITION);
	        console.assert(posIndex >= 0, 'Vertex format must have positions');
	        let posType = format.getAttributeType(posIndex);
	        console.assert(posType === VertexFormat$1.AT_FLOAT3, 'Positions must be 3-element of floats');

	        // 检查法线
	        let norIndex = format.getIndex(VertexFormat$1.AU_NORMAL);
	        if (norIndex >= 0) {
	            let norType = format.getAttributeType(norIndex);
	            this.hasNormals = (norType === VertexFormat$1.AT_FLOAT3);
	        }

	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const AU_TEXCOORD = VertexFormat$1.AU_TEXCOORD;
	        const AT_FLOAT2 = VertexFormat$1.AT_FLOAT2;

	        this.hasTCoords = new Array(MAX_UNITS);
	        for (let unit = 0; unit < MAX_UNITS; ++unit) {
	            this.hasTCoords[unit] = false;
	            let tcdIndex = format.getIndex(AU_TEXCOORD, unit);
	            if (tcdIndex >= 0) {
	                let tcdType = format.getAttributeType(tcdIndex);
	                if (tcdType === AT_FLOAT2) {
	                    this.hasTCoords[unit] = true;
	                }
	            }
	        }
	    }

	    /**
	     * 更改三角形卷绕顺序
	     * @param {number} numTriangles - 三角形数量
	     * @param {Uint32Array} indices - 顶点索引数组
	     */
	    reverseTriangleOrder(numTriangles, indices) {
	        let i, j1, j2, tmp;
	        for (i = 0; i < numTriangles; ++i) {
	            j1 = 3 * i + 1;
	            j2 = j1 + 1;
	            tmp = indices[j1];
	            indices[j1] = indices[j2];
	            indices[j2] = tmp;
	        }
	    }
	    /**
	     *
	     * @param {VertexBufferAccessor} vba
	     */
	    createPlatonicNormals(vba) {
	        if (this.hasNormals) {
	            const numVertices = vba.numVertices;
	            for (let i = 0; i < numVertices; ++i) {
	                vba.setNormal(i, vba.getPosition(i));
	            }
	        }
	    }
	    /**
	     *
	     * @param vba {VertexBufferAccessor}
	     */
	    createPlatonicUVs(vba) {
	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const numVertices = vba.numVertices;
	        const INV_PI = _Math.INV_PI;
	        let unit, i, pos, t;
	        for (unit = 0; unit < MAX_UNITS; ++unit) {
	            if (this.hasTCoords[unit]) {
	                for (i = 0; i < numVertices; ++i) {
	                    pos = vba.getPosition(i);
	                    t = 0.5;
	                    if (Math.abs(pos[2]) < 1) {
	                        t *= 1 + _Math.atan2(pos[1], pos[0]) * INV_PI;
	                    }
	                    vba.setTCoord(unit, i, [t, _Math.acos(pos[2]) * INV_PI]);
	                }
	            }
	        }
	    }

	    /**
	     * @param {VertexBufferAccessor} vba
	     */
	    transformData(vba) {
	        if (this.transform.isIdentity()) {
	            return;
	        }

	        const numVertices = vba.numVertices;
	        let i, f3, t;
	        for (i = 0; i < numVertices; ++i) {
	            f3 = new Point$1(vba.getPosition(i));
	            vba.setPosition(i, this.transform.mulPoint(f3));
	        }

	        if (this.hasNormals) {
	            for (i = 0; i < numVertices; ++i) {
	                f3 = (new Vector$1(vba.getNormal(i))).normalize();
	                vba.setNormal(i, f3);
	            }
	        }
	    }

	    /**
	     * 长方形
	     * @param {number} xSamples - x方向点数量
	     * @param {number} ySamples - z方向点数量
	     * @param {number} width - x 方向长度
	     * @param {number} height - z 方向长度
	     * @returns {TriMesh}
	     */
	    rectangle(xSamples, ySamples, width, height) {
	        const format = this.format;
	        const hasNormals = this.hasNormals;
	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const numVertices = xSamples * ySamples;
	        const numTriangles = 2 * (xSamples - 1) * (ySamples - 1);
	        const numIndices = 3 * numTriangles;
	        const stepX = 1 / (xSamples - 1);
	        const stepY = 1 / (ySamples - 1);

	        let vertexBuffer = new VertexBuffer(numVertices, format.stride, this.usage);
	        let vba = new VertexBufferAccessor(format, vertexBuffer);
	        let u, v, x, y, i, i0, i1, unit;
	        for (i1 = 0, i = 0; i1 < ySamples; ++i1) {
	            v = i1 * stepY;
	            y = (2 * v - 1) * height;
	            for (i0 = 0; i0 < xSamples; ++i0, ++i) {
	                u = i0 * stepX;
	                x = (2 * u - 1) * width;
	                vba.setPosition(i, [x, y, 0]);
	                if (hasNormals) {
	                    vba.setNormal(i, Vector$1.UNIT_Z);
	                }

	                for (unit = 0; unit < MAX_UNITS; ++unit) {
	                    if (this.hasTCoords[unit]) {
	                        vba.setTCoord(unit, i, [u, v]);
	                    }
	                }
	            }
	        }
	        this.transformData(vba);

	        let indexBuffer = new IndexBuffer$1(numIndices, 4, this.usage);
	        let indices = new Uint32Array(indexBuffer.getData().buffer);
	        let v0, v1, v2, v3, idx = 0;
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
	        return new TriMesh(format, vertexBuffer, indexBuffer);
	    }

	    /**
	     * 圆盘
	     * todo error
	     * @param {number} shellSamples
	     * @param {number} radialSamples
	     * @param {number} radius
	     * @returns {TriMesh}
	     */
	    disk(shellSamples, radialSamples, radius) {
	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const usage = this.usage;
	        const format = this.format;
	        const hasNormals = this.hasNormals;
	        const cos = Math.cos;
	        const sin = Math.sin;

	        let rsm1 = radialSamples - 1,
	            ssm1 = shellSamples - 1;
	        let numVertices = 1 + radialSamples * ssm1;
	        let numTriangles = radialSamples * (2 * ssm1 - 1);
	        let numIndices = 3 * numTriangles;

	        let vertexBuffer = new VertexBuffer(numVertices, format.stride, usage);
	        let vba = new VertexBufferAccessor(format, vertexBuffer);

	        let t;

	        // Center of disk.
	        vba.setPosition(0, [0, 0, 0]);

	        if (hasNormals) {
	            vba.setNormal(0, [0, 0, 1]);
	        }

	        let unit;
	        for (unit = 0; unit < MAX_UNITS; ++unit) {
	            if (this.hasTCoords[unit]) {
	                vba.setTCoord(unit, 0, [0.5, 0.5]);
	            }
	        }

	        let invSSm1 = 1 / ssm1;
	        let invRS = 1 / radialSamples;
	        let rsPI = _Math.TWO_PI * invRS;
	        let tcoord = [0.5, 0.5];

	        let angle, cs, sn, s, fraction, fracRadial, fracRadial1, i;

	        for (let r = 0; r < radialSamples; ++r) {
	            angle = rsPI * r;
	            cs = cos(angle);
	            sn = sin(angle);

	            let radial = new Vector$1(cs, sn, 0);

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
	        let indexBuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(indexBuffer.getData().buffer);
	        let r0, r1;
	        for (r0 = rsm1, r1 = 0, t = 0, i=0; r1 < radialSamples; r0 = r1++) {
	            indices[i] = 0;
	            indices[i+1] = 1 + ssm1 * r0;
	            indices[i+2] = 1 + ssm1 * r1;
	            i += 3;
	            ++t;
	            for (s = 1; s < ssm1; ++s, i+=6) {
	                let i00 = s + ssm1 * r0;
	                let i01 = s + ssm1 * r1;
	                let i10 = i00 + 1;
	                let i11 = i01 + 1;
	                indices[i] = i00;
	                indices[i+1] = i10;
	                indices[i+2] = i11;
	                indices[i+3] = i00;
	                indices[i+4] = i11;
	                indices[i+5] = i01;
	                t += 2;
	            }
	        }

	        return new TriMesh(format, vertexBuffer, indexBuffer);
	    }

	    /**
	     * 长方体, 面朝内(默认为1x1x1)
	     * 中心点 [0,0,0]
	     * @param {number} width
	     * @param {number} height
	     * @param {number} depth
	     * @returns {TriMesh}
	     */
	    box(width = 1, height = 1, depth = 1) {
	        const format = this.format;
	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const numVertices = 8;
	        const numTriangles = 12;
	        const numIndices = 3 * numTriangles;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, format.stride, this.usage);
	        let vba = new VertexBufferAccessor(format, vbuffer);

	        // Generate geometry.
	        vba.setPosition(0, [-width, -height, -depth]);
	        vba.setPosition(1, [+width, -height, -depth]);
	        vba.setPosition(2, [+width, +height, -depth]);
	        vba.setPosition(3, [-width, +height, -depth]);
	        vba.setPosition(4, [-width, -height, +depth]);
	        vba.setPosition(5, [+width, -height, +depth]);
	        vba.setPosition(6, [+width, +height, +depth]);
	        vba.setPosition(7, [-width, +height, +depth]);

	        for (let unit = 0; unit < MAX_UNITS; ++unit) {
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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, this.usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
	        indices[0] = 0; indices[1] = 2; indices[2] = 1;
	        indices[3] = 0; indices[4] = 3; indices[5] = 2;

	        indices[6] = 0; indices[7] = 1; indices[8] = 5;
	        indices[9] = 0; indices[10] = 5; indices[11] = 4;
	        indices[12] = 0; indices[13] = 4; indices[14] = 7;
	        indices[15] = 0; indices[16] = 7; indices[17] = 3;
	        indices[18] = 6; indices[19] = 4; indices[20] = 5;
	        indices[21] = 6; indices[22] = 7; indices[23] = 4;
	        indices[24] = 6; indices[25] = 5; indices[26] = 1;
	        indices[27] = 6; indices[28] = 1; indices[29] = 2;
	        indices[30] = 6; indices[31] = 2; indices[32] = 3;
	        indices[33] = 6; indices[34] = 3; indices[35] = 7;

	        if (this.inside) {
	            this.reverseTriangleOrder(numTriangles, indices);
	        }

	        let mesh = new TriMesh(format, vbuffer, ibuffer);
	        if (this.hasNormals) {
	            mesh.updateModelSpace(Visual$1.GU_NORMALS);
	        }
	        return mesh;
	    }

	    /**
	     * 圆柱体
	     *
	     * 中心(0,0,0)
	     * @param {number} axisSamples - 轴细分
	     * @param {number} radialSamples - 半径细分
	     * @param {number} radius - 圆柱体圆面半径
	     * @param {number} height - 圆柱体高度
	     * @param {boolean} open - 是否上下开口的
	     * @returns {TriMesh}
	     */
	    cylinder(axisSamples, radialSamples, radius, height, open = false) {
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;
	        const TWO_PI = _Math.TWO_PI;
	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const cos = _Math.cos;
	        const sin = _Math.sin;
	        const hasNormals = this.hasNormals;
	        const inside = this.inside;

	        let unit, numVertices, vba;
	        let tcoord;
	        let t, i;
	        let vertexBuffer, ibuffer;
	        let mesh;

	        if (open) {
	            numVertices = axisSamples * (radialSamples + 1);
	            let numTriangles = 2 * (axisSamples - 1) * radialSamples;
	            let numIndices = 3 * numTriangles;

	            // Create a vertex buffer.
	            vertexBuffer = new VertexBuffer(numVertices, stride, usage);
	            vba = new VertexBufferAccessor(format, vertexBuffer);

	            // Generate geometry.
	            let invRS = 1 / radialSamples;
	            let invASm1 = 1 / (axisSamples - 1);
	            let halfHeight = 0.5 * height;
	            let r, a, aStart, angle;

	            // Generate points on the unit circle to be used in computing the
	            // mesh points on a cylinder slice.
	            let cs = new Float32Array(radialSamples + 1);
	            let sn = new Float32Array(radialSamples + 1);
	            for (r = 0; r < radialSamples; ++r) {
	                angle = TWO_PI * invRS * r;
	                cs[r] = cos(angle);
	                sn[r] = sin(angle);
	            }
	            cs[radialSamples] = cs[0];
	            sn[radialSamples] = sn[0];

	            // Generate the cylinder itself.
	            for (a = 0, i = 0; a < axisSamples; ++a) {
	                let axisFraction = a * invASm1;  // in [0,1]
	                let z = -halfHeight + height * axisFraction;

	                // Compute center of slice.
	                let sliceCenter = new Point$1(0, 0, z);

	                // Compute slice vertices with duplication at endpoint.
	                let save = i;
	                for (r = 0; r < radialSamples; ++r) {
	                    let radialFraction = r * invRS;  // in [0,1)
	                    let normal = new Vector$1(cs[r], sn[r], 0);
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
	            ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	            let indices = new Uint32Array(ibuffer.getData().buffer);
	            let j = 0;
	            for (a = 0, aStart = 0; a < axisSamples - 1; ++a) {
	                let i0 = aStart;
	                let i1 = i0 + 1;
	                aStart += radialSamples + 1;
	                let i2 = aStart;
	                let i3 = i2 + 1;
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
	            mesh = new TriMesh(format, vertexBuffer, ibuffer);
	        }
	        else {
	            mesh = this.sphere(axisSamples, radialSamples, radius);
	            vertexBuffer = mesh.vertexBuffer;
	            numVertices = vertexBuffer.numElements;
	            vba = new VertexBufferAccessor(format, vertexBuffer);

	            // Flatten sphere at poles.
	            let hDiv2 = 0.5 * height;
	            vba.getPosition(numVertices - 2)[2] = -hDiv2;  // south pole
	            vba.getPosition(numVertices - 1)[2] = +hDiv2;  // north pole

	            // Remap z-values to [-h/2,h/2].
	            let zFactor = 2 / (axisSamples - 1);
	            let tmp0 = radius * (-1 + zFactor);
	            let tmp1 = 1 / (radius * (1 - zFactor));
	            for (i = 0; i < numVertices - 2; ++i) {
	                let pos = vba.getPosition(i);
	                pos[2] = hDiv2 * (-1 + tmp1 * (pos[2] - tmp0));
	                let adjust = radius / Math.hypot(pos[0], pos[1]);
	                pos[0] *= adjust;
	                pos[1] *= adjust;
	            }
	            this.transformData(vba);

	            if (hasNormals) {
	                mesh.updateModelSpace(Visual$1.GU_NORMALS);
	            }
	        }

	        mesh.modelBound.center = Point$1.ORIGIN;
	        mesh.modelBound.radius = Math.hypot(radius, height);
	        return mesh;
	    }
	    /**
	     * 球体
	     * 物体中心:(0,0,0), 半径: radius, 北极点(0,0,radius), 南极点(0,0,-radius)
	     *
	     * @param radius {float} 球体半径
	     * @param zSamples {int}
	     * @param radialSamples {int}
	     */
	    sphere(zSamples, radialSamples, radius) {
	        const MAX_UNITS = StandardMesh.MAX_UNITS;
	        const TWO_PI = _Math.TWO_PI;
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;
	        const hasNormal = this.hasNormals;
	        const inside = this.inside;

	        let zsm1 = zSamples - 1,
	            zsm2 = zSamples - 2,
	            zsm3 = zSamples - 3;
	        let rsp1 = radialSamples + 1;
	        let numVertices = zsm2 * rsp1 + 2;
	        let numTriangles = 2 * zsm2 * radialSamples;
	        let numIndices = 3 * numTriangles;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, usage);
	        let vba = new VertexBufferAccessor(format, vbuffer);

	        // Generate geometry.
	        let invRS = 1 / radialSamples;
	        let zFactor = 2 / zsm1;
	        let r, z, zStart, i, unit, tcoord, angle;

	        // Generate points on the unit circle to be used in computing the mesh
	        // points on a cylinder slice.
	        let sn = new Float32Array(rsp1);
	        let cs = new Float32Array(rsp1);
	        for (r = 0; r < radialSamples; ++r) {
	            angle = TWO_PI * invRS * r;
	            cs[r] = _Math.cos(angle);
	            sn[r] = _Math.sin(angle);
	        }
	        sn[radialSamples] = sn[0];
	        cs[radialSamples] = cs[0];

	        let t;

	        // Generate the cylinder itself.
	        for (z = 1, i = 0; z < zsm1; ++z) {
	            let zFraction = zFactor * z - 1;  // in (-1,1)
	            let zValue = radius * zFraction;

	            // Compute center of slice.
	            let sliceCenter = new Point$1(0, 0, zValue);

	            // Compute radius of slice.
	            let sliceRadius = _Math.sqrt(_Math.abs(radius * radius - zValue * zValue));

	            // Compute slice vertices with duplication at endpoint.
	            let save = i;
	            for (r = 0; r < radialSamples; ++r) {
	                let radialFraction = r * invRS;  // in [0,1)
	                let radial = new Vector$1(cs[r], sn[r], 0);
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
	        let nor = [0, 0, inside ? 1 : -1];
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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
	        let j;
	        for (z = 0, j = 0, zStart = 0; z < zsm3; ++z) {
	            let i0 = zStart;
	            let i1 = i0 + 1;
	            zStart += rsp1;
	            let i2 = zStart;
	            let i3 = i2 + 1;
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
	        let numVerticesM2 = numVertices - 2;
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
	        let numVerticesM1 = numVertices - 1,
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
	        let mesh = new TriMesh(this.format, vbuffer, ibuffer);
	        mesh.modelBound.center = Point$1.ORIGIN;
	        mesh.modelBound.radius = radius;
	        return mesh;
	    }
	    /**
	     * 圆环
	     * @param circleSamples {int} 大圆细分
	     * @param radialSamples {int} 小圆细分
	     * @param outerRadius {float} 大圆半径
	     * @param innerRadius {float} 小圆半径
	     * @returns {TriMesh}
	     */
	    torus(circleSamples, radialSamples, outerRadius, innerRadius) {
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;
	        const hasNormals = this.hasNormals;
	        const inside = this.inside;
	        const MAX_UNITS = StandardMesh.MAX_UNITS;

	        const TWO_PI = _Math.TWO_PI;
	        const cos = _Math.cos;
	        const sin = _Math.sin;

	        let numVertices = (circleSamples + 1) * (radialSamples + 1);
	        let numTriangles = 2 * circleSamples * radialSamples;
	        let numIndices = 3 * numTriangles;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, usage);
	        let vba = new VertexBufferAccessor(format, vbuffer);

	        // Generate geometry.
	        let invCS = 1 / circleSamples;
	        let invRS = 1 / radialSamples;
	        let c, r, i, save, unit, tcoord;
	        let circleFraction, theta, cosTheta, sinTheta;
	        let radialFraction, phi, cosPhi, sinPhi;
	        let radial = Vector$1.ZERO;
	        let torusMiddle = Vector$1.ZERO;
	        let normal = Vector$1.ZERO;

	        // Generate the cylinder itself.
	        for (c = 0, i = 0; c < circleSamples; ++c) {
	            // Compute center point on torus circle at specified angle.
	            circleFraction = c * invCS;  // in [0,1)
	            theta = TWO_PI * circleFraction;
	            cosTheta = cos(theta);
	            sinTheta = sin(theta);
	            radial.assign(cosTheta, sinTheta, 0);
	            torusMiddle.assign(cosTheta * outerRadius, sinTheta * outerRadius, 0);

	            // Compute slice vertices with duplication at endpoint.
	            save = i;
	            for (r = 0; r < radialSamples; ++r) {
	                radialFraction = r * invRS;  // in [0,1)
	                phi = TWO_PI * radialFraction;
	                cosPhi = cos(phi);
	                sinPhi = sin(phi);

	                normal.assign(innerRadius * cosTheta * cosPhi, innerRadius * sinTheta * cosPhi, innerRadius * sinPhi);
	                vba.setPosition(i, torusMiddle.add(normal));
	                if (hasNormals) {
	                    if (inside) {
	                        normal.assign(-normal.x, -normal.y, -normal.z);
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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
	        let i0, i1, i2, i3, offset = 0;
	        let cStart = 0;
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
	        let mesh = new TriMesh(format, vbuffer, ibuffer);
	        mesh.modelBound.center.assign(0, 0, 0);
	        mesh.modelBound.radius = outerRadius;
	        return mesh;
	    }

	    /**
	     * 四面体
	     */
	    tetrahedron() {
	        const fSqrt2Div3 = _Math.sqrt(2) / 3;
	        const fSqrt6Div3 = _Math.sqrt(6) / 3;
	        const fOneThird = 1 / 3;

	        const numVertices = 4;
	        const numTriangles = 4;
	        const numIndices = 12;
	        const stride = this.format.stride;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, this.usage);
	        let vba = new VertexBufferAccessor(this.format, vbuffer);

	        // Generate geometry.
	        vba.setPosition(0, [0, 0, 1]);
	        vba.setPosition(1, [2 * fSqrt2Div3, 0, -fOneThird]);
	        vba.setPosition(2, [-fSqrt2Div3, fSqrt6Div3, -fOneThird]);
	        vba.setPosition(3, [-fSqrt2Div3, -fSqrt6Div3, -fOneThird]);
	        this.createPlatonicNormals(vba);
	        this.createPlatonicUVs(vba);
	        this.transformData(vba);

	        // Generate indices.
	        let ibuffer = new IndexBuffer$1(numIndices, 4, this.usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
	        indices[0] = 0; indices[1] = 1; indices[2] = 2;
	        indices[3] = 0; indices[4] = 2; indices[5] = 3;
	        indices[6] = 0; indices[7] = 3; indices[8] = 1;
	        indices[9] = 1; indices[10] = 3; indices[11] = 2;

	        if (this.inside) {
	            this.reverseTriangleOrder(numTriangles, indices);
	        }

	        return new TriMesh(this.format, vbuffer, ibuffer);
	    }

	    hexahedron() {
	        const fSqrtThird = _Math.sqrt(1 / 3);

	        const numVertices = 8;
	        const numTriangles = 12;
	        const numIndices = 36;
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, usage);
	        let vba = new VertexBufferAccessor(format, vbuffer);

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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
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

	        return new TriMesh(this.format, vbuffer, ibuffer);
	    }
	    octahedron() {
	        const numVertices = 6;
	        const numTriangles = 8;
	        const numIndices = 24;
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, usage);
	        let vba = new VertexBufferAccessor(format, vbuffer);

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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
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

	        return new TriMesh(this.format, vbuffer, ibuffer);
	    }

	    dodecahedron() {
	        const a = 1 / _Math.sqrt(3);
	        const b = _Math.sqrt((3 - _Math.sqrt(5)) / 6);
	        const c = _Math.sqrt((3 + _Math.sqrt(5)) / 6);

	        const numVertices = 20;
	        const numTriangles = 36;
	        const numIndices = 108;
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, usage);
	        let vba = new VertexBufferAccessor(this.format, vbuffer);

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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
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

	        return new TriMesh(format, vbuffer, ibuffer);
	    }

	    icosahedron() {
	        const goldenRatio = 0.5 * (1 + _Math.sqrt(5));
	        const invRoot = 1 / _Math.sqrt(1 + goldenRatio * goldenRatio);
	        const u = goldenRatio * invRoot;
	        const v = invRoot;

	        const numVertices = 12;
	        const numTriangles = 20;
	        const numIndices = 60;
	        const format = this.format;
	        const stride = format.stride;
	        const usage = this.usage;

	        // Create a vertex buffer.
	        let vbuffer = new VertexBuffer(numVertices, stride, usage);
	        let vba = new VertexBufferAccessor(this.format, vbuffer);

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
	        let ibuffer = new IndexBuffer$1(numIndices, 4, usage);
	        let indices = new Uint32Array(ibuffer.getData().buffer);
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

	        return new TriMesh(format, vbuffer, ibuffer);
	    }
	}

	def(StandardMesh, 'MAX_UNITS', VertexFormat$1.MAX_TCOORD_UNITS);

	class TriFan extends Triangles {
	    /**
	     * @param {VertexFormat} format
	     * @param {VertexBuffer} vertexBuffer
	     * @param {number} indexSize
	     */
	    constructor(format, vertexBuffer, indexSize) {
	        super(Visual.PT_TRIFAN, format, vertexBuffer, null);
	        console.assert(indexSize === 2 || indexSize === 4, 'Invalid index size.');

	        var numVertices = this.vertexBuffer.numElements;
	        this.indexBuffer = new IndexBuffer(numVertices, indexSize);
	        var i, indices;

	        if (indexSize == 2) {
	            indices = new Uint16Array(this.indexBuffer.getData());
	        }
	        else // indexSize == 4
	        {
	            indices = new Uint32Array(this.indexBuffer.getData());
	        }
	        for (i = 0; i < numVertices; ++i) {
	            indices[i] = i;
	        }
	    }

	    /**
	     * 获取网格中的三角形数量
	     * @returns {number}
	     */
	    getNumTriangles() {
	        return this.indexBuffer.numElements - 2;
	    }
	    
	    /**
	     * 获取位置I处的三角形索引
	     * @param {number} i
	     * @param {Array<number>} output - 3 elements
	     * @returns {boolean}
	     */
	    getTriangle(i, output) {
	        if (0 <= i && i < this.getNumTriangles()) {
	            var data = new Uint32Array(this.indexBuffer.getData());
	            output[0] = data[0];
	            output[1] = data[i + 1];
	            output[2] = data[i + 2];
	            return true;
	        }
	        return false;
	    }
	}

	class TriStrip extends Triangles {

	    /**
	     * @param {VertexFormat} format
	     * @param {VertexBuffer} vertexBuffer
	     * @param {number} indexSize
	     */
	    constructor(format, vertexBuffer, indexSize) {
	        super(Visual.PT_TRISTRIP, format, vertexBuffer, null);
	        console.assert(indexSize === 2 || indexSize === 4, 'Invalid index size.');

	        const numVertices = this.vertexBuffer.numElements;
	        this.indexBuffer = new IndexBuffer(numVertices, indexSize);
	        let i, indices;

	        if (indexSize == 2) {
	            indices = new Uint16Array(this.indexBuffer.getData());
	        }
	        else // indexSize == 4
	        {
	            indices = new Uint32Array(this.indexBuffer.getData());
	        }
	        for (i = 0; i < numVertices; ++i) {
	            indices[i] = i;
	        }
	    }

	    /**
	     * 获取网格中的三角形数量
	     * @returns {number}
	     */
	    getNumTriangles() {
	        return this.indexBuffer.numElements - 2;
	    }

	    /**
	     * 获取位置I处的三角形索引
	     * @param {number} i
	     * @param {Array<number>} output - 3 elements
	     * @returns {boolean}
	     */
	    getTriangle(i, output) {
	        if (0 <= i && i < this.getNumTriangles()) {
	            let data = new Uint32Array(this.indexBuffer.getData());
	            output[0] = data[i];
	            if (i & 1) {
	                output[1] = data[i + 2];
	                output[2] = data[i + 1];
	            }
	            else {
	                output[1] = data[i + 1];
	                output[2] = data[i + 2];
	            }
	            return output[0] !== output[1] &&
	                output[0] !== output[2] &&
	                output[1] !== output[2];
	        }
	        return false;
	    }
	}

	D3Object.Register('TriStrip', TriStrip.factory);

	/**
	 * Abstract base class. The object to
	 * which this is attached must be Particles.
	 */
	class ParticleController extends Controller {
		constructor() {
			super();
			// The system motion, in local coordinates.  The velocity vectors should
			// be unit length.
			this.systemLinearSpeed = 0;
			this.systemAngularSpeed = 0;
			this.systemLinearAxis = Vector$1.UNIT_Z;
			this.systemAngularAxis = Vector$1.UNIT_Z;
			this.systemSizeChange = 0;

			// Particle motion, in the model space of the system.  The velocity
			// vectors should be unit length.  In applications where the points
			// represent a rigid body, you might choose the origin of the system to
			// be the center of mass of the particles and the coordinate axes to
			// correspond to the principal directions of the inertia tensor.
			this.numParticles = 0;
			this.particleLinearSpeed = null;
			this.particleLinearAxis = null;
			this.particleSizeChange = null;
		}
		/**
		 * @param {number} applicationTime
		 */
		update(applicationTime) {
			if (!super.update(applicationTime)) {
				return false;
			}
			let ctrlTime = this.getControlTime(applicationTime);
			this.updateSystemMotion(ctrlTime);
			this.updatePointMotion(ctrlTime);
			return true;
		}

		/**
		 * For deferred allocation of the particle motion arrays.
		 * @param {number} numParticles
		 */
		reallocate(numParticles) {
			delete this.particleLinearSpeed;
			delete this.particleLinearAxis;
			delete this.particleSizeChange;
			this.numParticles = numParticles;
			if (numParticles > 0) {
				this.particleLinearSpeed = [];
				this.particleLinearAxis = [];
				this.particleSizeChange = [];
				for (let i = 0; i < numParticles; ++i) {
					this.particleLinearSpeed.push(0);
					this.particleLinearAxis.push(Vector$1.UNIT_Z);
					this.particleSizeChange.push(0);
				}
			}
		}

		/**
		 * @param {Particles} obj 
		 */
		setObject(obj) {
			this.object = obj;
			if (obj) {
				console.assert(obj instanceof Particles, 'Invalid class.');
				this.reallocate(obj.numParticles);
			}
			else {
				this.reallocate(0);
			}
		}

		// This class computes the new positions and orientations from the motion
		// parameters.  Derived classes should update the motion parameters and
		// then either call the base class update methods or provide its own
		// update methods for position and orientation.
		updateSystemMotion(ctrlTime) {
			let particles = this.object;
			let dSize = ctrlTime * this.systemSizeChange;
			particles.sizeAdjust += dSize;
			if (particles.sizeAdjust < 0) {
				particles.sizeAdjust = 0;
			}

			let distance = ctrlTime * this.systemLinearSpeed;
			let deltaTrn = this.systemLinearAxis.scalar(distance);
			particles.localTransform.setTranslate(particles.localTransform.getTranslate().add(deltaTrn));

			let angle = ctrlTime * this.systemAngularSpeed;
			let deltaRot = Matrix$1.makeRotation(this.systemAngularAxis, angle);
			particles.localTransform.setRotate(deltaRot.mul(particles.localTransform.getRotate()));
		}
		updatePointMotion(ctrlTime) {
			let particles = this.object;
			let posSizes = particles.positionSizes;

			let numActive = particles.numActive;
			for (let i = 0; i < numActive; ++i) {
				let dSize = ctrlTime * this.particleSizeChange[i];
				posSizes[i * 4 + 3] += dSize;
				let distance = ctrlTime * this.particleLinearSpeed[i];
				let deltaTrn = this.particleLinearAxis[i].scalar(distance);
				posSizes[i * 4] += deltaTrn[0];
				posSizes[i * 4 + 1] += deltaTrn[1];
				posSizes[i * 4 + 2] += deltaTrn[2];
			}
		}
	}

	/**
	 * The object to which this is attached must be Polypoint or a class derived fromPolypoint.
	 * 
	 * Point motion, in the model space of the system. 
	 * The velocity vectors should be unit length.
	 * In applications where the points represent a rigid body, you might choose the origin of
	 * the system to be the center of mass of the points and the coordinate axes to correspond
	 * to the principal directions of the inertia tensor.
	 * 
	 * @abstract
	 */
	class PointController extends Controller {
	    constructor() {
	        super();

	        this.systemLinearSpeed = 0.0;
	        this.systemAngularSpeed = 0.0;
	        this.systemLinearAxis = Vector$1.UNIT_Z;
	        this.systemAngularAxis = Vector$1.UNIT_Z;

	        this.numPoints = 0;
	        this.pointLinearSpeed = 0.0;
	        this.pointAngularSpeed = 0.0;
	        this.pointLinearAxis = Vector$1.UNIT_Z;
	        this.pointAngularAxis = Vector$1.UNIT_Z;
	    }
	    /**
	     * The animation update.  The application time is in milliseconds.
	     * @param {number} applicationTime
	     */
	    update(applicationTime) {
	        if (!super.update(applicationTime)) {
	            return false;
	        }
	        let ctrlTime = this.getControlTime(applicationTime);
	        this.updateSystemMotion(ctrlTime);
	        this.updatePointMotion(ctrlTime);
	        return true;
	    }

	    reallocate(numPoints) {
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
	            for (let i = 0; i < numPoints; ++i) {
	                this.pointLinearSpeed[i] = 0.0;
	                this.pointAngularSpeed[i] = 0.0;
	                this.pointLinearAxis[i] = Vector$1.UNIT_Z;
	                this.pointAngularAxis[i] = Vector$1.UNIT_Z;
	            }
	        }
	    }

	    /**
	     * @param {ControlledObject} ctldObj
	     */
	    setObject(ctldObj) {
	        this.object = ctldObj;
	        if (this.object) {
	            console.assert(!(ctldObj instanceof PolyPoint), 'Invalid class');
	            this.reallocate(ctldObj.vertexBuffer.numElements);
	        }
	        else {
	            this.reallocate(0);
	        }
	    }

	    /**
	     * This class computes the new positions and orientations from the motion
	     * parameters.  Derived classes should update the motion parameters and
	     * then either call the base class update methods or provide its own
	     * update methods for position and orientation.
	     * @param {number} ctrlTime 
	     */
	    updateSystemMotion(ctrlTime) {
	        let points = this.object;
	        let distance = ctrlTime * this.systemLinearSpeed;
	        let deltaTrn = this.systemLinearAxis.scalar(distance);
	        points.localTransform.setTranslate(
	            points.localTransform.getTranslate().add(deltaTrn)
	        );

	        let angle = ctrlTime * this.systemAngularSpeed;
	        let deltaRot = Matrix$1.makeRotation(this.systemAngularAxis, angle);

	        points.localTransform.setRotate(deltaRot.mul(points.localTransform.getRotate()));
	    }

	    updatePointMotion(ctrlTime) {
	        let points = this.object;
	        let vba = VertexBufferAccessor.fromVisual(points);

	        const numPoints = points.numPoints;
	        let i, distance, pos, deltaTrn;
	        for (i = 0; i < numPoints; ++i) {
	            distance = ctrlTime * this.pointLinearSpeed[i];
	            deltaTrn = this.pointLinearAxis[i].scalar(distance);

	            pos = vba.getPosition(i);
	            pos[0] += deltaTrn.x;
	            pos[1] += deltaTrn.y;
	            pos[2] += deltaTrn.z;
	        }

	        let angle, normal, deltaRot;
	        if (vba.hasNormal()) {
	            for (i = 0; i < numPoints; ++i) {
	                angle = ctrlTime * this.pointAngularSpeed[i];
	                normal = vba.getNormal(i);
	                normal.normalize();
	                deltaRot = Matrix$1.makeRotation(this.pointAngularAxis[i], angle);
	                vba.setNormal(i, deltaRot.mulPoint(normal));
	            }
	        }

	        Renderer$1.updateAll(points.vertexBuffer);
	    }
	}

	class SkinController extends Controller {

	    /**
	     * The numbers of vertices and bones are fixed for the lifetime of the object.
	     * @param {number} numVertices - numbers of vertices
	     * @param {number} numBones - numbers of bones
	     */
	    constructor(numVertices = 0, numBones = 0) {
	        super();
	        this.numVertices = numVertices;
	        this.numBones = numBones;
	        this.__init();
	    }

	    /**
	     * @private
	     */
	    __init() {
	        const { numBones, numVertices } = this;
	        if (numVertices > 0) {
	            this.bones = new Array(numBones);         // bones[numBones]                -> Node
	            this.weights = new Array(numVertices);    // weights[numVertices][numBones] -> number
	            this.offsets = new Array(numVertices);    // offsets[numVertices][numBones] -> Point

	            for(let i=0;i<numVertices;++i) {
	                this.weights[i] = new Array(numBones);
	                this.offsets[i] = new Array(numBones);
	            }
	        }
	    }

	    /**
	     * @param {number} applicationTime - milliseconds
	     * @returns {boolean}
	     */
	    update(applicationTime) {
	        if (!super.update(applicationTime)) {
	            return false;
	        }

	        let visual = this.object;
	        console.assert(
	            this.numVertices === visual.vertexBuffer.numElements,
	            'SkinController must have the same number of vertices as the vertex buffer.'
	        );

	        let vba = VertexBufferAccessor.fromVisual(visual);

	        // The skin vertices are calculated in the bone world coordinate system,
	        // so the visual's world transform must be the identity.
	        visual.worldTransform = Transform$1.IDENTITY;
	        visual.worldTransformIsCurrent = true;

	        // Compute the skin vertex locations.
	        const { numBones, numVertices } = this;
	        let i, j, weight, offset, worldOffset, position;
	        for (i = 0; i < numVertices; ++i) {
	            position = Point$1.ORIGIN;
	            for (j = 0; j < numBones; ++j) {
	                weight = this.weights[i][j];
	                if (weight !== 0) {
	                    offset = this.offsets[i][j];
	                    worldOffset = this.bones[j].worldTransform.mulPoint(offset);  // bones[j].worldTransform * offset
	                    position.copy(position.add(worldOffset.scalar(weight)));      // position += worldOffset * weight
	                }
	            }
	            vba.setPosition(i, position);
	        }

	        visual.updateModelSpace(Visual$1.GU_NORMALS);
	        Renderer$1.updateAll(visual.vertexBuffer);
	        return true;
	    }

	    load(inStream) {
	        super.load(inStream);
	        let numVertices = inStream.readUint32();
	        let numBones = inStream.readUint32();

	        this.numVertices = numVertices;
	        this.numBones = numBones;
	        this.__init();
	        let total = this.numVertices * this.numBones, i;
	        let t = inStream.readArray(total);
	        let t1 = inStream.readSizedPointArray(total);
	        for (i = 0; i < numVertices; ++i) {
	            this.weights[i] = t.slice(i * numBones, (i + 1) * numBones);
	            this.offsets[i] = t1.slice(i * numBones, (i + 1) * numBones);
	        }
	        this.bones = inStream.readSizedPointerArray(numBones);
	    }

	    link(inStream) {
	        super.link(inStream);
	        inStream.resolveArrayLink(this.numBones, this.bones);
	    }
	}

	D3Object.Register('SkinController', SkinController.factory.bind(SkinController));

	class Color {
	    /**
	     * Make a 32-bit RGB color from 8-bit channels.
	     * The alpha channel is set to 255.
	     * @param {number} red
	     * @param {number} green
	     * @param {number} blue
	     */
	    static makeR8G8B8(red, green, blue) {
	        this.dv.setUint8(0, red);
	        this.dv.setUint8(1, green);
	        this.dv.setUint8(2, blue);
	        this.dv.setUint8(3, 255);
	        return this.dv.getUint32(0);
	    }

	    /**
	     * Make a 32-bit RGB color from 8-bit channels.
	     * @param {number} red
	     * @param {number} green
	     * @param {number} blue
	     * @param {number} alpha
	     */
	    static makeR8G8B8A8(red, green, blue, alpha) {
	        this.dv.setUint8(0, red);
	        this.dv.setUint8(1, green);
	        this.dv.setUint8(2, blue);
	        this.dv.setUint8(3, alpha);
	        return this.dv.getUint32(0);
	    }
	    /**
	     * Extract 8-bit channels from a 32bit-RGBA color.
	     * @param {Uint32Array} color
	     * @returns {Array<number>} [r,g,b]
	     */
	    //
	    static extractR8G8B8(color) {
	        this.dv.setUint32(0, color);
	        return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2)];
	    }

	    /**
	     * Extract 8-bit channels from a 32bit-RGBA color.
	     * @param {Uint32Array} color
	     * @returns {Array<number>} [r,g,b,a]
	     */
	    //
	    static extractR8G8B8A8(color) {
	        this.dv.setUint32(0, color);
	        return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2), this.dv.getUint8(3)];
	    }

	    /**
	     * 从 R5G6B5 转换到 32bit-RGBA
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - R5G6B5
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromR5G6B5(numTexels, inTexels, outTexels) {
	        let len = 4 * numTexels, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j += 2) {
	            outTexels[i] = inTexels[j] >> 3; // r
	            outTexels[i + 1] = ((inTexels[j] & 0x07) << 3) | (inTexels[j + 1] >> 5); // g
	            outTexels[i + 2] = inTexels[j + 1] & 0x1f; //b
	            outTexels[i + 3] = 0;      //a
	        }
	    }

	    /**
	     * 从 A1R5G5B5 转换到 32bit-RGBA
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - A1R5G5B5
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA1R5G5B5(numTexels, inTexels, outTexels) {
	        let len = 4 * numTexels, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j += 2) {
	            outTexels[i] = inTexels[j] & 0x80 >> 2; // r
	            outTexels[i + 1] = ((inTexels[j] & 0x03) << 3) | (inTexels[j + 1] >> 5); // g
	            outTexels[i + 2] = inTexels[j + 1] & 0x1f; //b
	            outTexels[i + 3] = inTexels[j] >> 7;      //a
	        }
	    }

	    /**
	     * 从 4bit-ARGB 转换到 32bit-RGBA
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 4bit-ARGB
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA4R4G4B4(numTexels, inTexels, outTexels) {
	        let len = 4 * numTexels, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j += 2) {
	            outTexels[i] = outTexels[j] & 0x0f;
	            outTexels[i + 1] = outTexels[j + 1] & 0xf0 >> 4;
	            outTexels[i + 2] = outTexels[j + 1] & 0x0f;
	            outTexels[i + 3] = outTexels[j] & 0xf0 >> 4;
	        }
	    }

	    /**
	     * 从 8bit-A 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 8bit-A
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j++) {
	            outTexels[i] = 0;
	            outTexels[i + 1] = 0;
	            outTexels[i + 2] = 0;
	            outTexels[i + 3] = inTexels[j];
	        }
	    }

	    /**
	     * 从 8bit-L 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 8bit-L
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromL8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j++) {
	            outTexels[i] = inTexels[j];
	            outTexels[i + 1] = inTexels[j];
	            outTexels[i + 2] = inTexels[j];
	            outTexels[i + 3] = 255;
	        }
	    }

	    /**
	     * 从 8bit-AL 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 8bit-AL
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA8L8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j += 2) {
	            outTexels[i] = inTexels[j + 1];
	            outTexels[i + 1] = inTexels[j + 1];
	            outTexels[i + 2] = inTexels[j + 1];
	            outTexels[i + 3] = inTexels[j];
	        }
	    }

	    /**
	     * 从 8bit-RGB 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 8bit-RGB
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromR8G8B8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j;
	        for (i = 0, j = 0; i < len; i += 4, j += 3) {
	            outTexels[i] = inTexels[j];
	            outTexels[i + 1] = inTexels[j + 1];
	            outTexels[i + 2] = inTexels[j + 2];
	            outTexels[i + 3] = 0;
	        }
	    }

	    /**
	     * 从 8bit-ARGB 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 8bit-ARGB
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA8R8G8B8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i;
	        for (i = 0; i < len; i += 4) {
	            outTexels[i] = inTexels[i + 1];
	            outTexels[i + 1] = inTexels[i + 2];
	            outTexels[i + 2] = inTexels[i + 3];
	            outTexels[i + 3] = inTexels[i];
	        }
	    }

	    /**
	     * 从 8bit-ABGR 转换到 32bit-RGBA.
	     * @param {number} numTexels 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels 8bit-ABGR
	     * @param {Float32Array} outTexels 32bit-RGBA
	     */
	    static convertFromA8B8G8R8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i;
	        for (i = 0; i < len; i += 4) {
	            outTexels[i] = inTexels[i + 3];
	            outTexels[i + 1] = inTexels[i + 2];
	            outTexels[i + 2] = inTexels[i + 1];
	            outTexels[i + 3] = inTexels[i];
	        }
	    }

	    /**
	     * 从 16bit-L 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 16bit-L
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromL16(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j,
	            dv = new Uint16Array(inTexels);
	        for (i = 0, j = 0; i < len; i += 4, j++) {
	            outTexels[i] = dv[j];
	            outTexels[i + 1] = dv[j];
	            outTexels[i + 2] = dv[j];
	            outTexels[i + 3] = 65535;
	        }
	    }

	    /**
	     * 从 16bit-GR 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 16bit-GR
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromG16R16(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j,
	            dv = new Uint16Array(inTexels);
	        for (i = 0, j = 0; i < len; i += 4, j += 2) {
	            outTexels[i] = dv[j + 1];
	            outTexels[i + 1] = dv[j];
	            outTexels[i + 2] = 0;
	            outTexels[i + 3] = 0;
	        }
	    }

	    /**
	     * 从 16bit-ABGR 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 16bit-ABGR
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA16B16G16R16(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i,
	            dv = new Uint16Array(inTexels);
	        for (i = 0; i < len; i += 4) {
	            outTexels[i] = dv[i + 3];
	            outTexels[i + 1] = dv[i + 2];
	            outTexels[i + 2] = dv[i + 1];
	            outTexels[i + 3] = dv[i];
	        }
	    }

	    /**
	     * 从 16-bit RF 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 16-bit RF
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     * @todo: implement
	     */
	    static convertFromR16F(numTexels, inTexels, outTexels) { }

	    /**
	     * 从 16-bit GRF 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 16-bit GRF
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     * @todo: implement
	     */
	    static convertFromG16R16F(numTexels, inTexels, outTexels) { }

	    /**
	     * 从 16-bit ABGRF 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 16-bit ABGRF
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     * @todo: implement
	     */
	    static convertFromA16B16G16R16F(numTexels, inTexels, outTexels) { }

	    /**
	     * 从 32-bit RF 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 32-bit RF
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromR32F(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j,
	            dv = new Float32Array(inTexels);
	        for (i = 0, j = 0; i < len; i += 4, j++) {
	            outTexels[i] = dv[j];
	            outTexels[i + 1] = 0;
	            outTexels[i + 2] = 0;
	            outTexels[i + 3] = 0;
	        }
	    }

	    /**
	     * 从 32-bit GRF 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit GRF
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromG32R32F(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j,
	            dv = new Float32Array(inTexels);
	        for (i = 0, j = 0; i < len; i += 4, j += 2) {
	            outTexels[i] = dv[j + 1];
	            outTexels[i + 1] = dv[j];
	            outTexels[i + 2] = 0;
	            outTexels[i + 3] = 0;
	        }
	    }

	    /**
	     * 从 32-bit ABGRF 转换到 32bit-RGBA.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {ArrayBuffer} inTexels - 32-bit ABGRF
	     * @param {Float32Array} outTexels - 32bit-RGBA
	     */
	    static convertFromA32B32G32R32F(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i,
	            dv = new Float32Array(inTexels);
	        for (i = 0; i < len; i += 4) {
	            outTexels[i] = dv[i + 3];
	            outTexels[i + 1] = dv[i + 2];
	            outTexels[i + 2] = dv[i + 1];
	            outTexels[i + 3] = dv[i];
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 R5G6B5.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - R5G6B5
	     */
	    static convertToR5G6B5(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = (inTexels[i] << 3) | (inTexels[i + 1] >> 3);           // r<<3 | g>>3
	            outTexels[j++] = ((inTexels[i + 1] & 0x07) << 5) | inTexels[i + 2]; // g&0x7 << 5 | b
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 A1R5G6B5.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - A1R5G6B5
	     */
	    static convertToA1R5G5B5(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = (inTexels[i + 3] << 7) | (inTexels[i] << 2) | (inTexels[i + 1] >> 3);           // a<<7 | r<<2 | g>>3
	            outTexels[j++] = ((inTexels[i + 1] & 0x07) << 5) | inTexels[i + 2]; // (g&0x7 << 5) | b
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 4-bit ARGB.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 4-bit ARGB
	     */
	    static convertToA4R4G4B4(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = (inTexels[i + 3] << 4) | inTexels[i];           // a<<4 | r
	            outTexels[j++] = (inTexels[i + 1] << 4) | inTexels[i + 2];         // g<<4 | b
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 8-bit Alpha.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 8-bit Alpha
	     */
	    static convertToA8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = inTexels[i + 3];
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 8-bit Luminance.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 8-bit Luminance
	     */
	    static convertToL8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = inTexels[i];
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 8-bit Alpha-Luminance
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 8-bit Alpha-Luminance
	     */
	    static convertToA8L8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = inTexels[i + 3];
	            outTexels[j++] = inTexels[i];
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 8-bit RGB
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 8-bit RGB
	     */
	    static convertToR8G8B8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = inTexels[i];
	            outTexels[j++] = inTexels[i + 1];
	            outTexels[j++] = inTexels[i + 2];
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 8-bit ARGB
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 8-bit ARGB
	     */
	    static convertToA8R8G8B8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = inTexels[i + 3];
	            outTexels[j++] = inTexels[i];
	            outTexels[j++] = inTexels[i + 1];
	            outTexels[j++] = inTexels[i + 2];
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 8-bit ABGR
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 8-bit ABGR
	     */
	    static convertToA8B8G8R8(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        for (i = 0; i < len; i += 4) {
	            outTexels[j++] = inTexels[i + 3];
	            outTexels[j++] = inTexels[i + 2];
	            outTexels[j++] = inTexels[i + 1];
	            outTexels[j++] = inTexels[i];
	        }
	    }
	    /**
	     * 从 32-bit RGBA 转换到 16-bit Luminance.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 16-bit Luminance
	     */
	    static convertToL16(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        let dv = new DataView(outTexels.buffer);
	        for (i = 0; i < len; i += 4, j += 2) {
	            dv.setUint16(j, inTexels[i]);
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 16-bit GR.
	     * @param {number} numTexels -  需要转换的纹理数量
	     * @param inTexels {Float32Array} 32-bit RGBA
	     * @param outTexels {ArrayBuffer} 16-bit GR
	     */
	    static convertToG16R16(
	        numTexels, inTexels, outTexels
	    ) {
	        let len = numTexels * 4, i, j = 0;
	        let dv = new DataView(outTexels.buffer);
	        for (i = 0; i < len; i += 4, j += 4) {
	            dv.setUint16(j, inTexels[i + 1]);
	            dv.setUint16(j + 2, inTexels[i]);
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 16-bit ABGR.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels -16-bit ABGR
	     */
	    static convertToA16B16G16R16(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        let dv = new DataView(outTexels.buffer);
	        for (i = 0; i < len; i += 4, j += 8) {
	            dv.setUint16(j, inTexels[i + 3]);
	            dv.setUint16(j + 2, inTexels[i + 2]);
	            dv.setUint16(j + 4, inTexels[i + 1]);
	            dv.setUint16(j + 6, inTexels[i]);
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 16-bit RF.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels 32-bit RGBA
	     * @param {ArrayBuffer} outTexels 16-bit RF
	     * @todo: implement
	     */
	    static convertToR16F(numTexels, inTexels, outTexels) { }

	    /**
	     * 从 32-bit RGBA 转换到 16-bit GRF.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 16-bit GRF
	     * @todo: implement
	     */
	    static convertToG16R16F(numTexels, inTexels, outTexels) { }

	    /**
	     * 从 32-bit RGBA 转换到 16-bit ABGRF.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 16-bit ABGRF
	     * @todo: implement
	     */
	    static convertToA16B16G16R16F(numTexels, inTexels, outTexels) { }

	    /**
	     * 从 32-bit RGBA 转换到 32-bit RF.
	     * @param {number} numTexels -  需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 32-bit RF
	     */
	    static convertToR32F(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i;
	        let dv = new DataView(outTexels.buffer);
	        for (i = 0; i < len; i += 4) {
	            dv.setFloat32(i, inTexels[i]);
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 32-bit GRF.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {ArrayBuffer} outTexels - 32-bit GRF
	     */
	    static convertToG32R32F(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        let dv = new DataView(outTexels.buffer);
	        for (i = 0; i < len; i += 4, j += 8) {
	            dv.setFloat32(j, inTexels[i]);
	            dv.setFloat32(j + 4, inTexels[i + 1]);
	        }
	    }

	    /**
	     * 从 32-bit RGBA 转换到 32-bit ABGRF.
	     * @param {number} numTexels - 需要转换的纹理数量
	     * @param {Float32Array} inTexels - 32-bit RGBA
	     * @param {Float32Array} outTexels - 32-bit ABGRF
	     */
	    static convertToA32B32G32R32F(numTexels, inTexels, outTexels) {
	        let len = numTexels * 4, i, j = 0;
	        let dv = new DataView(outTexels.buffer);
	        for (i = 0; i < len; i += 4, j += 16) {
	            dv.setFloat32(j, inTexels[i + 3]);
	            dv.setFloat32(j + 4, inTexels[i + 2]);
	            dv.setFloat32(j + 8, inTexels[i + 1]);
	            dv.setFloat32(j + 12, inTexels[i]);
	        }
	    }
	}
	// Same as EXTURE_FORMAT_QUANTITY
	Color.COLOR_FORMAT_QUANTITY = 23;
	/**
	 * @type {DataView}
	 * @private
	 */
	Color.dv = new DataView(new Uint32Array(4).buffer);

	/**
	 * 广告牌节点
	 */
	class BillboardNode extends Node {

	    /**
	     * @param {Camera} camera
	     */
	    constructor(camera = null) {
	        super();
	        /**
	         * @private
	         */
	        this._camera = camera;
	    }

	    /**
	     * The camera to which the billboard is aligned.
	     *
	     * @param {Camera} camera
	     */
	    static alignTo(camera) {
	        this._camera = camera;
	    }

	    /**
	     * Support for the geometric update
	     *
	     * @param {number} applicationTime
	     */
	    updateWorldData(applicationTime) {
	        // Compute the billboard's world transforms based on its parent's world
	        // transform and its local transforms.  Notice that you should not call
	        // Node::UpdateWorldData since that function updates its children.  The
	        // children of a BillboardNode cannot be updated until the billboard is
	        // aligned with the camera.
	        super.updateWorldData(applicationTime);

	        if (this._camera) {
	            // Inverse-transform the camera to the model space of the billboard.
	            let modelPos = this.worldTransform.inverse().mulPoint(this._camera.position);

	            // To align the billboard, the projection of the camera to the
	            // xz-plane of the billboard's model space determines the angle of
	            // rotation about the billboard's model y-axis.  If the projected
	            // camera is on the model axis (x = 0 and z = 0), ATan2 returns zero
	            // (rather than NaN), so there is no need to trap this degenerate
	            // case and handle it separately.
	            let angle = _Math.atan2(modelPos[0], modelPos[2]);
	            let orient = new Matrix$1.makeRotateY(angle);
	            this.worldTransform.setRotate(this.worldTransform.getRotate().mul(orient));
	        }

	        // Update the children now that the billboard orientation is known.
	        this.childs.forEach(c => c.update(applicationTime, false));
	    }
	}

	class PlanarReflectionEffect extends D3Object {

	    /**
	     * @param {number} numPlanes 镜像平面数量
	     */
	    constructor(numPlanes) {
	        super();
	        this.numPlanes = numPlanes;

	        this.planes = new Array(numPlanes);
	        this.reflectances = new Array(numPlanes);
	        this.alphaState = new AlphaState();
	        this.depthState = new DepthState();
	        this.stencilState = new StencilState();
	    }

	    /**
	     * @param {Renderer} renderer
	     * @param {VisibleSet} visibleSet
	     */
	    draw(renderer, visibleSet) {
	        // save global overrideDepthState
	        const oldDepthState = renderer.overrideDepthState;
	        const oldStencilState = renderer.overrideStencilState;

	        let depthState = this.depthState;
	        let stencilState = this.stencilState;
	        let alphaState = this.alphaState;

	        // 使用当前特效的状态
	        renderer.overrideDepthState = depthState;
	        renderer.overrideStencilState = stencilState;

	        // 获取默认深度范围
	        let depthRange = renderer.getDepthRange();

	        // 存储摄像机的后世界变换
	        let camera = renderer.camera;

	        const numVisible = visibleSet.getNumVisible();
	        let i, j;
	        for (i = 0; i < this.numPlanes; ++i) {
	            // 在模板平面渲染镜像.
	            // 所有可见镜像像素都持有模板值,确保没有其他任何像素写入深度缓冲或颜色缓冲
	            // 但会使用深度缓冲来深度测试, 所以模板值不会写入
	            // Render the mirror into the stencil plane.  All visible mirror
	            // pixels will have the stencil value of the mirror.  Make sure that
	            // no pixels are written to the depth buffer or color buffer, but use
	            // depth buffer testing so that the stencil will not be written where
	            // the plane is behind something already in the depth buffer.
	            stencilState.enabled = true;
	            stencilState.compare = StencilState.ALWAYS;
	            stencilState.reference = i + 1;
	            stencilState.onFail = StencilState.OP_KEEP;     // irrelevant
	            stencilState.onZFail = StencilState.OP_KEEP;    // invisible to 0
	            stencilState.onZPass = StencilState.OP_REPLACE; // visible to i+1

	            // 允许从深度缓冲读取,但是禁止写入
	            depthState.enabled = true;
	            depthState.writable = false;
	            depthState.compare = DepthState.COMPARE_MODE_LEQUAL;

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
	            stencilState.compare = StencilState.EQUAL;
	            stencilState.reference = i + 1;
	            stencilState.onFail = StencilState.OP_KEEP;
	            stencilState.onZFail = StencilState.OP_KEEP;
	            stencilState.onZPass = StencilState.OP_KEEP;

	            // Set the depth buffer to "infinity" at those pixels for which the
	            // stencil buffer is the reference value i+1.
	            renderer.setDepthRange(1, 1);
	            depthState.enabled = true;
	            depthState.writable = true;
	            depthState.compare = DepthState.COMPARE_MODE_ALWAYS;

	            renderer.drawVisible(this.planes[i]);

	            // Restore the depth range and depth testing function.
	            depthState.compare = DepthState.COMPARE_MODE_LEQUAL;
	            renderer.setDepthRange(depthRange[0], depthRange[1]);

	            // Compute the equation for the mirror plane in model coordinates
	            // and get the reflection matrix in world coordinates.
	            let reflection = Matrix.ZERO;
	            let modelPlane = new Plane([], 0);
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
	                let m = visibleSet.getVisible(j);
	                if (m != this.planes[i]) {
	                    renderer.drawVisible(visibleSet.getVisible(j));
	                }
	            }

	            renderer.reverseCullOrder = false;

	            camera.setPreViewMatrix(Matrix.IDENTITY);
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
	            alphaState.srcBlend = AlphaState.BM_ONE_MINUS_CONSTANT_ALPHA;
	            alphaState.dstBlend = AlphaState.BM_CONSTANT_ALPHA;
	            alphaState.constantColor.set([0, 0, 0, this.reflectances[i]]);

	            stencilState.compare = StencilState.EQUAL;
	            stencilState.reference = i + 1;
	            stencilState.onFail = StencilState.OP_KEEP;
	            stencilState.onZFail = StencilState.OP_KEEP;
	            stencilState.onZPass = StencilState.OP_INVERT;

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
	    }

	    /**
	     * 计算镜像矩阵以及物体平面
	     * @param {int} i - 镜像平面索引
	     * @param {Matrix} reflection - 反射矩阵输出
	     * @param {Plane} modelPlane - 物体平面
	     */
	    getReflectionMatrixAndModelPlane(i, reflection, modelPlane) {
	        // 在世界坐标系计算镜像反射平面方程
	        let vertex = new Array(3);
	        this.planes[i].getWorldTriangle(0, vertex);
	        let worldPlane = Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);

	        // 计算镜像矩阵
	        reflection.makeReflection(vertex[0], worldPlane.normal);

	        this.planes[i].getModelTriangle(0, vertex);
	        worldPlane = Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);
	        modelPlane.copy(worldPlane);
	    }


	    /**
	     * 设置镜像平面
	     * @param {number} i - 索引
	     * @param {TriMesh} plane
	     */
	    setPlane(i, plane) {
	        // plane.culling = Spatial.CULLING_ALWAYS;
	        this.planes[i] = plane;
	    }

	    /**
	     * 获取镜像平面
	     * @param {number} i - 索引
	     * @returns {TriMesh}
	     */
	    getPlane(i) {
	        return this.planes[i];
	    }

	    /**
	     * 设置镜像反射系数
	     * @param {number} i - 索引
	     * @param {number} reflectance - 反射系数
	     */
	    setReflectance(i, reflectance) {
	        this.reflectances[i] = reflectance;
	    }

	    /**
	     * 获取镜像反射系数
	     * @param {number} i - 索引
	     * @returns {float}
	     */
	    getReflectance(i) {
	        return this.reflectances[i];
	    }
	}

	class ShaderFloat extends D3Object {
	    /**
	     * @param {number} numRegisters
	     */
	    constructor(numRegisters) {
	        super();
	        this.numElements = 0;
	        this.data = null;
	        this.allowUpdater = false;
	        this.setNumRegisters(numRegisters);
	    }

	    /**
	     * @param {number} numRegisters
	     */
	    setNumRegisters(numRegisters) {
	        console.assert(numRegisters > 0, 'Number of registers must be positive');
	        this.numElements = 4 * numRegisters;
	        this.data = new Float32Array(this.numElements);
	    }

	    getNumRegisters() {
	        return this.numElements / 4;
	    }

	    item(index, val) {
	        console.assert(0 <= index && index < this.numElements, 'Invalid index');
	        if (val === undefined) {
	            return this.data[index];
	        }
	        this.data[index] = val;
	    }

	    /**
	     * @param {number} i - location of elements
	     * @param {Float32Array} data 4-tuple float
	     */
	    setOneRegister(i, data) {
	        console.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
	        this.data.set(data.subarray(0, 4), 4 * i);
	    }

	    /**
	     * @param {Float32Array} data
	     */
	    setRegister(data) {
	        this.data.set(data.subarray(0, this.numElements));
	    }

	    /**
	     * @param {number} i
	     * @returns {Float32Array}
	     */
	    getOneRegister(i) {
	        console.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
	        return new Float32Array(this.data.subarray(4 * i, 4 * i + 4));
	    }

	    getRegisters() {
	        return new Float32Array(this.data.buffer);
	    }

	    /**
	     * @param {Float32Array} data
	     */
	    copy(data) {
	        this.data.set(data);
	        return this;
	    }

	    /**
	     * @param {Visual} visual
	     * @param {Camera} camera
	     * @abstract
	     */
	    update(visual, camera) { }

	    /**
	     * @param {Instream} inStream 
	     */
	    load(inStream) {
	        super.load(inStream);
	        this.data = new Float32Array(inStream.readFloatArray());
	        this.numElements = this.data.length;
	        this.allowUpdater = inStream.readBool();
	    }
	    
	    save(outStream) {
	        super.save(outStream);
	        outStream.writeFloat32Array(this.numElements, this.data);
	        outStream.writeBool(this.allowUpdater);
	    }
	}

	class LightAmbientConstant extends ShaderFloat {
	    /**
	     * @param {Light} light
	     */
	    constructor(light) {
	        super(1);

	        this.light = light;
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        this.copy(this.light.ambient);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightAmbientConstant', LightAmbientConstant.factory);

	class LightDiffuseConstant extends ShaderFloat {

	    /**
	     * @param {Light} light
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        this.copy(this.light.diffuse);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightDiffuseConstant', LightDiffuseConstant.factory);

	class LightSpecularConstant extends ShaderFloat {

	    /**
	     * @param light {Light}
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        this.copy(this.light.specular);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightSpecularConstant', LightSpecularConstant.factory);

	class LightAttenuationConstant extends ShaderFloat {

	    /**
	     * @param {Light} light
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        this.data[0] = this.light.constant;
	        this.data[1] = this.light.linear;
	        this.data[2] = this.light.quadratic;
	        this.data[3] = this.light.intensity;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightAttenuationConstant', LightAttenuationConstant.factory);

	class LightSpotConstant extends ShaderFloat {

	    /**
	     * @param {Light} light
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        this.data[0] = this.light.angle;
	        this.data[1] = this.light.cosAngle;
	        this.data[2] = this.light.sinAngle;
	        this.data[3] = this.light.exponent;
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightSpotConstant', LightSpotConstant.factory);

	class LightModelDirectionConstant extends ShaderFloat {

	    /**
	     * @param {Light} light
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        const worldInvMatrix = visual.worldTransform.inverse();
	        this.copy(worldInvMatrix.mulPoint(this.light.direction));
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightModelDirectionConstant', LightModelDirectionConstant.factory);

	class LightModelPositionConstant extends ShaderFloat {

	    /**
	     * @param {Light} light
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        const worldInvMatrix = visual.worldTransform.inverse();
	        this.copy(worldInvMatrix.mulPoint(this.light.position));
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightModelPositionConstant', LightModelPositionConstant.factory);

	class LightWorldDirectionConstant extends ShaderFloat {

	    /**
	     * @param light {Light}
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        this.copy(this.light.direction);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightWorldDirectionConstant', LightWorldDirectionConstant.factory);

	class LightWorldPositionConstant extends ShaderFloat {

	    /**
	     * @param light {Light}
	     */
	    constructor(light) {
	        super(1);
	        this.allowUpdater = true;
	        this.light = light;
	    }

	    update(visual, camera) {
	        this.copy(this.light.position);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.light = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.light = inStream.resolveLink(this.light);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.light);
	    }
	}

	D3Object.Register('LightWorldPositionConstant', LightWorldPositionConstant.factory);

	class MaterialAmbientConstant extends ShaderFloat {

	    /**
	     * @param {Material} material
	     */
	    constructor(material) {
	        super(1);
	        this.allowUpdater = true;
	        this.material = material;
	    }

	    update(visual, camera) {
	        this.copy(this.material.ambient);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.material = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.material = inStream.resolveLink(this.material);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.material);
	    }
	}

	D3Object.Register('MaterialAmbientConstant', MaterialAmbientConstant.factory);

	class MaterialDiffuseConstant extends ShaderFloat {

	    /**
	     * @param material {Material} 材质
	     */
	    constructor(material) {
	        super(1);
	        this.allowUpdater = true;
	        this.material = material;
	    }

	    update(visual, camera) {
	        this.copy(this.material.diffuse);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.material = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.material = inStream.resolveLink(this.material);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.material);
	    }
	}

	D3Object.Register('MaterialDiffuseConstant', MaterialDiffuseConstant.factory);

	class MaterialEmissiveConstant extends ShaderFloat {

	    /**
	     * @param {Material} material
	     */
	    constructor(material) {
	        super(1);
	        this.allowUpdater = true;
	        this.material = material;
	    }

	    update(visual, camera) {
	        this.copy(this.material.emissive);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.material = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.material = inStream.resolveLink(this.material);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.material);
	    }
	}

	D3Object.Register('MaterialEmissiveConstant', MaterialEmissiveConstant.factory);

	class MaterialSpecularConstant extends ShaderFloat {

	    /**
	     * @param {Material} material
	     */
	    constructor(material) {
	        super(1);
	        this.allowUpdater = true;
	        this.material = material;
	    }

	    /**
	     * @param {Visual} visual
	     * @param {Camera} camera
	     */
	    update(visual, camera) {
	        this.copy(this.material.specular);
	    }

	    load(inStream) {
	        super.load(inStream);
	        this.material = inStream.readPointer();
	    }

	    link(inStream) {
	        super.link(inStream);
	        this.material = inStream.resolveLink(this.material);
	    }

	    save(outStream) {
	        super.save(outStream);
	        outStream.writePointer(this.material);
	    }
	}

	D3Object.Register('MaterialSpecularConstant', MaterialSpecularConstant.factory);

	class VMatrixConstant extends ShaderFloat {

	    constructor() {
	        super(4);
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        const viewMatrix = camera.viewMatrix;
	        this.copy(viewMatrix);
	    }
	}

	class VWMatrixConstant extends ShaderFloat {

	    constructor() {
	        super(4);
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        const view = camera.viewMatrix;
	        const worldMatrix = visual.worldTransform.toMatrix();
	        this.copy(view.mul(worldMatrix));
	    }
	}

	class WMatrixConstant extends ShaderFloat {

	    constructor() {
	        super(4);
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        const worldMatrix = visual.worldTransform.toMatrix();
	        this.copy(worldMatrix);
	    }
	}

	D3Object.Register('WMatrixContant', WMatrixConstant.factory.bind(WMatrixConstant));

	class PVMatrixConstant extends ShaderFloat {

	    constructor() {
	        super(4);
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        const projViewMatrix = camera.projectionViewMatrix;
	        this.copy(projViewMatrix);
	    }
	}

	class PVWMatrixConstant extends ShaderFloat {
	    constructor() {
	        super(4);
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        const projViewMatrix = camera.projectionViewMatrix;
	        const worldMatrix = visual.worldTransform.toMatrix();
	        this.copy(projViewMatrix.mul(worldMatrix));
	    }
	}

	D3Object.Register('PVWMatrixConstant', PVWMatrixConstant.factory);

	class CameraModelPositionConstant extends ShaderFloat {
	    constructor() {
	        super(1);
	        this.allowUpdater = true;
	    }

	    update(visual, camera) {
	        const worldPosition = camera.position;
	        const worldInvMatrix = visual.worldTransform.inverse();
	        this.copy(worldInvMatrix.mulPoint(worldPosition));
	    }
	}

	D3Object.Register('CameraModelPositionConstant', CameraModelPositionConstant.factory);

	class DefaultEffect extends VisualEffect {
	    constructor() {
	        super();

	        let vs = new VertexShader('DefaultVS', 1, 1, 0);
	        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vs.setProgram(DefaultEffect.VS);

	        let fs = new FragShader('DefaultFS');
	        fs.setProgram(DefaultEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('DefaultProgram', vs, fs);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    createInstance() {
	        var instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        return instance;
	    }
	}

	DECLARE_ENUM(DefaultEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
	    FS: `#version 300 es
precision highp float;
out vec4 fragColor;
void main (void) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`});

	class LightAmbEffect extends VisualEffect {

	    constructor() {
	        super();
	        let vs = new VertexShader('LightAmbEffectVS', 1, 5);
	        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vs.setConstant(1, 'MaterialEmissive', Shader.VT_VEC4);
	        vs.setConstant(2, 'MaterialAmbient', Shader.VT_VEC4);
	        vs.setConstant(3, 'LightAmbient', Shader.VT_VEC4);
	        vs.setConstant(4, 'LightAttenuation', Shader.VT_VEC4);
	        vs.setProgram(LightAmbEffect.VS);

	        let fs = new FragShader('LightAmbEffectFS', 1);
	        fs.setProgram(LightAmbEffect.FS);

	        let program = new Program('LightAmbProgram', vs, fs);

	        let pass = new VisualPass();
	        pass.program = program;
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    createInstance(light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setVertexConstant(0, 1, new MaterialEmissiveConstant(material));
	        instance.setVertexConstant(0, 2, new MaterialAmbientConstant(material));
	        instance.setVertexConstant(0, 3, new LightAmbientConstant(light));
	        instance.setVertexConstant(0, 4, new LightAttenuationConstant(light));
	        return instance;
	    }

	    static createUniqueInstance(light, material) {
	        let effect = new LightAmbEffect();
	        return effect.createInstance(light, material);
	    }
	}

	DECLARE_ENUM(LightAmbEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec3 LightAmbient;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
layout(location=0) in vec3 modelPosition;
out vec3 vColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vec3 ambient = LightAttenuation.w * LightAmbient;
    vColor = MaterialEmissive + MaterialAmbient * ambient;
}`,
	    FS: `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;
void main(){
    fragColor = vec4(vColor, 1.0);
}`});

	class LightDirPerFragEffect extends VisualEffect {

	    constructor() {
	        super();

	        let vshader = new VertexShader('LightDirPerFragVS', 2, 1);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setProgram(LightDirPerFragEffect.VS);

	        let fshader = new FragShader('LightDirPerFragFS', 0, 10);
	        fshader.setConstant(0, 'CameraModelPosition', Shader.VT_VEC3);
	        fshader.setConstant(1, 'MaterialEmissive', Shader.VT_VEC3);
	        fshader.setConstant(2, 'MaterialAmbient', Shader.VT_VEC3);
	        fshader.setConstant(3, 'MaterialDiffuse', Shader.VT_VEC4);
	        fshader.setConstant(4, 'MaterialSpecular', Shader.VT_VEC4);
	        fshader.setConstant(5, 'LightModelDirection', Shader.VT_VEC3);
	        fshader.setConstant(6, 'LightAmbient', Shader.VT_VEC3);
	        fshader.setConstant(7, 'LightDiffuse', Shader.VT_VEC3);
	        fshader.setConstant(8, 'LightSpecular', Shader.VT_VEC3);
	        fshader.setConstant(9, 'LightAttenuation', Shader.VT_VEC4);
	        fshader.setProgram(LightDirPerFragEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('LightDirPerFragProgram', vshader, fshader);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    static createUniqueInstance(light, material) {
	        let effect = new LightDirPerFragEffect();
	        return effect.createInstance(light, material);
	    }

	    createInstance(light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setFragConstant(0, 0, new CameraModelPositionConstant());

	        instance.setFragConstant(0, 1, new MaterialEmissiveConstant(material));
	        instance.setFragConstant(0, 2, new MaterialAmbientConstant(material));
	        instance.setFragConstant(0, 3, new MaterialDiffuseConstant(material));
	        instance.setFragConstant(0, 4, new MaterialSpecularConstant(material));

	        instance.setFragConstant(0, 5, new LightModelDirectionConstant(light));

	        instance.setFragConstant(0, 6, new LightAmbientConstant(light));
	        instance.setFragConstant(0, 7, new LightDiffuseConstant(light));
	        instance.setFragConstant(0, 8, new LightSpecularConstant(light));
	        instance.setFragConstant(0, 9, new LightAttenuationConstant(light));
	        return instance;
	    }


	    load(inStream) {
	        this.___ = this.techniques;
	        super.load(inStream);
	    }

	    postLink() {
	        super.postLink();
	        let pass = this.techniques[0].getPass(0);
	        pass.program.vertexShader.program = (LightDirPerFragEffect.VS);
	        pass.program.fragShader.program = (LightDirPerFragEffect.FS);

	        this.techniques = this.___;
	    }
	}

	DECLARE_ENUM(LightDirPerFragEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;
void main(){
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
	    FS: `#version 300 es
precision highp float;
uniform vec3 CameraModelPosition;

uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;    // alpha通道存储光滑度

uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]

in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main () {
    vec3 normal = normalize(vertexNormal);
    float diffuseWeight = max( dot(normal, -LightModelDirection), 0.0 );
    vec3 color = LightAmbient * MaterialAmbient + LightDiffuse * MaterialDiffuse.rgb * diffuseWeight;
    if (diffuseWeight > 0.0) {
        vec3 viewVector = normalize( CameraModelPosition - vertexPosition);
        vec3 reflectVector = normalize( reflect(-LightModelDirection, normal ) );
        float rdotv = max( dot(reflectVector, viewVector), 0.0);
        float weight = pow(rdotv, MaterialSpecular.w);
        color += LightSpecular * MaterialSpecular.rgb * weight;
    }
    fragColor = vec4(color * LightAttenuation.w + MaterialEmissive, MaterialDiffuse.a);
}`});

	D3Object.Register('LightDirPerFragEffect', LightDirPerFragEffect.factory);

	class LightDirPerVerEffect extends VisualEffect {

	    constructor() {
	        super();
	        let vshader = new VertexShader('LightDirPerVerVS', 2, 11);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
	        vshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
	        vshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
	        vshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
	        vshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);

	        vshader.setConstant(6, 'LightModelDirection', Shader.VT_VEC3);
	        vshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
	        vshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
	        vshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
	        vshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
	        vshader.setProgram(LightDirPerVerEffect.VS);

	        let fshader = new FragShader('LightDirPerVerFS');
	        fshader.setProgram(LightDirPerVerEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('LightDirPerVerProgram', vshader, fshader);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    createInstance(light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setVertexConstant(0, 1, new CameraModelPositionConstant());
	        instance.setVertexConstant(0, 2, new MaterialEmissiveConstant(material));
	        instance.setVertexConstant(0, 3, new MaterialAmbientConstant(material));
	        instance.setVertexConstant(0, 4, new MaterialDiffuseConstant(material));
	        instance.setVertexConstant(0, 5, new MaterialSpecularConstant(material));
	        instance.setVertexConstant(0, 6, new LightModelDirectionConstant(light));
	        instance.setVertexConstant(0, 7, new LightAmbientConstant(light));
	        instance.setVertexConstant(0, 8, new LightDiffuseConstant(light));
	        instance.setVertexConstant(0, 9, new LightSpecularConstant(light));
	        instance.setVertexConstant(0, 10, new LightAttenuationConstant(light));
	        return instance;
	    }

	    static createUniqueInstance(light, material) {
	        let effect = new LightDirPerVerEffect();
	        return effect.createInstance(light, material);
	    }

	    load(inStream) {
	        this.___ = this.techniques;
	        super.load(inStream);
	    }

	    postLink() {
	        super.postLink();
	        let pass = this.techniques[0].getPass(0);
	        pass.program.vertexShader.vertexShader = (LightDirPerVerEffect.VertexSource);
	        pass.program.fragShader.fragShader = (LightDirPerVerEffect.FragSource);
	        this.techniques = this.___;
	    }
	}

	DECLARE_ENUM(LightDirPerVerEffect, {
	    VS: `#version 300 es
const float zere = 0.0;
uniform mat4 PVWMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;       // alpha channel store shininess
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec4 vColor;
void main(){
    vec3 nor = normalize( modelNormal );
    vec3 dir = normalize( LightModelDirection );
    float weight = max( dot(nor, -dir), zero );
    vec3 color = LightAmbient * MaterialAmbient + LightDiffuse * MaterialDiffuse.rgb * weight;
    if ( weight > zero) {
        vec3 viewVector = normalize(CameraModelPosition - modelPosition);
        vec3 reflectDir = normalize( reflect(-dir, nor) );
        weight = max( dot(reflectDir, viewVector), zero);
        color += LightSpecular * MaterialSpecular.rgb * pow(weight, MaterialSpecular.w);
    }    
    vColor = vec4(color * LightAttenuation.w + MaterialEmissive, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
	    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(){
    fragColor = vColor;
}`});

	D3Object.Register('LightDirPerVerEffect', LightDirPerVerEffect.factory);

	class LightPointPerFragEffect extends VisualEffect {

	    constructor() {
	        super();
	        let vshader = new VertexShader('LightPointPerFragVS', 2, 1);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setProgram(LightPointPerFragEffect.VS);

	        let fshader = new FragShader('LightPointPerFragFS', 0, 11);
	        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
	        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
	        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
	        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
	        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
	        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
	        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC3);
	        fshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
	        fshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
	        fshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
	        fshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
	        fshader.setProgram(LightPointPerFragEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('LightPointPerFragProgram', vshader, fshader);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    /**
	     * 创建点光源顶点光照程序
	     *
	     * @param {Light} light
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    createInstance(light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setFragConstant(0, 0, new WMatrixConstant());
	        instance.setFragConstant(0, 1, new CameraModelPositionConstant());
	        instance.setFragConstant(0, 2, new MaterialEmissiveConstant(material));
	        instance.setFragConstant(0, 3, new MaterialAmbientConstant(material));
	        instance.setFragConstant(0, 4, new MaterialDiffuseConstant(material));
	        instance.setFragConstant(0, 5, new MaterialSpecularConstant(material));
	        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
	        instance.setFragConstant(0, 7, new LightAmbientConstant(light));
	        instance.setFragConstant(0, 8, new LightDiffuseConstant(light));
	        instance.setFragConstant(0, 9, new LightSpecularConstant(light));
	        instance.setFragConstant(0, 10, new LightAttenuationConstant(light));
	        return instance;
	    }

	    /**
	     * 创建唯一点光源顶点光照程序
	     *
	     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
	     *
	     * @param {Light} light
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    static createUniqueInstance(light, material) {
	        let effect = new LightPointPerFragEffect();
	        return effect.createInstance(light, material);
	    }

	    load(inStream) {
	        this.___ = this.techniques;
	        super.load(inStream);
	    }

	    link(inStream) {
	        super.link(inStream);
	    }

	    postLink() {
	        super.postLink();
	        let pass = this.techniques[0].getPass(0);
	        pass.program.vertexShader.setProgram(LightPointPerFragEffect.VertexSource);
	        pass.program.fragShader.setProgram(LightPointPerFragEffect.FragSource);
	        this.techniques = this.___;
	    }

	    save(inStream) {
	        super.save(inStream);
	        // todo: implement
	    }
	}

	DECLARE_ENUM(LightPointPerFragEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;

void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
}`,
	    FS: `#version 300 es
precision highp float;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main(){
    vec3 nor = normalize(vertexNormal);
    vec3 vertexLightDiff = LightModelPosition - vertexPosition;
    vec3 dir = normalize(vertexLightDiff);
    float t = length(mat3(WMatrix) * dir);

    // t = intensity / (constant + d * linear + d*d* quadratic);
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 color = MaterialAmbient * LightAmbient;

    float d = max(dot(nor, dir), 0.0);
    color = color + d * MaterialDiffuse.rgb * LightDiffuse;

    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - vertexPosition);
        vec3 reflectDir = normalize( reflect(-dir, nor) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    fragColor = vec4(MaterialEmissive + t * color, MaterialDiffuse.a);
}`});

	D3Object.Register('LightPointPerFragEffect', LightPointPerFragEffect.factory.bind(LightPointPerFragEffect));

	class LightPointPerVertexEffect extends VisualEffect {

	    constructor() {
	        super();
	        let vshader = new VertexShader('LightPointPerVertexVS', 2, 12);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setConstant(1, 'WMatrix', Shader.VT_MAT4);
	        vshader.setConstant(2, 'CameraModelPosition', Shader.VT_VEC3);
	        vshader.setConstant(3, 'MaterialEmissive', Shader.VT_VEC3);
	        vshader.setConstant(4, 'MaterialAmbient', Shader.VT_VEC3);
	        vshader.setConstant(5, 'MaterialDiffuse', Shader.VT_VEC4);
	        vshader.setConstant(6, 'MaterialSpecular', Shader.VT_VEC4);
	        vshader.setConstant(7, 'LightModelPosition', Shader.VT_VEC3);
	        vshader.setConstant(8, 'LightAmbient', Shader.VT_VEC3);
	        vshader.setConstant(9, 'LightDiffuse', Shader.VT_VEC3);
	        vshader.setConstant(10, 'LightSpecular', Shader.VT_VEC3);
	        vshader.setConstant(11, 'LightAttenuation', Shader.VT_VEC4);
	        vshader.setProgram(LightPointPerVertexEffect.VS);

	        let fshader = new FragShader('LightPointPerVertexFS');
	        fshader.setProgram(LightPointPerVertexEffect.FS);

	        let program = new Program('LightPointPerVertexProgram', vshader, fshader);

	        let pass = new VisualPass();
	        pass.program = program;
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    /**
	     * 创建点光源顶点光照程序
	     *
	     * @param {Light} light
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    createInstance(light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setVertexConstant(0, 1, new WMatrixConstant());
	        instance.setVertexConstant(0, 2, new CameraModelPositionConstant());
	        instance.setVertexConstant(0, 3, new MaterialEmissiveConstant(material));
	        instance.setVertexConstant(0, 4, new MaterialAmbientConstant(material));
	        instance.setVertexConstant(0, 5, new MaterialDiffuseConstant(material));
	        instance.setVertexConstant(0, 6, new MaterialSpecularConstant(material));
	        instance.setVertexConstant(0, 7, new LightModelPositionConstant(light));
	        instance.setVertexConstant(0, 8, new LightAmbientConstant(light));
	        instance.setVertexConstant(0, 9, new LightDiffuseConstant(light));
	        instance.setVertexConstant(0, 10, new LightSpecularConstant(light));
	        instance.setVertexConstant(0, 11, new LightAttenuationConstant(light));
	        return instance;
	    }

	    /**
	     * 创建唯一点光源顶点光照程序
	     *
	     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
	     *
	     * @param {Light} light
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    static createUniqueInstance(light, material) {
	        let effect = new LightPointPerVertexEffect();
	        return effect.createInstance(light, material);
	    }

	    load(inStream) {
	        this.___ = this.techniques;
	        super.load(inStream);
	    }

	    link(inStream) {
	        super.link(inStream);
	    }

	    postLink() {
	        super.postLink.call(this);
	        let pass = this.techniques[0].getPass(0);
	        pass.program.vertexShader.setProgram(LightPointPerVertexEffect.VertexSource);
	        pass.program.fragShader.setProgram(LightPointPerVertexEffect.FragSource);
	        this.techniques = this.___;
	    }

	    save(inStream) {
	        super.save(inStream);
	        // todo: implement
	    }
	}

	DECLARE_ENUM(LightPointPerVertexEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;

out vec4 vColor;
void main(){
    vec3 nor = normalize(modelNormal);
    vec3 v1 = LightModelPosition - modelPosition;  // 指向光源的方向
    float t = length(WMatrix * vec4(v1, 0.0));
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 dir = normalize(v1);                              // 光源方向
    float d = max( dot(nor, dir), 0.0);                    // 计算漫反射权重
    vec3 color = MaterialAmbient * LightAmbient;        // 环境光分量
    color = d * MaterialDiffuse.rgb*LightDiffuse + color; // 漫反射分量
    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - modelPosition); // 观察方向
        vec3 reflectDir = normalize( reflect(-dir, nor) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    vColor = vec4(MaterialEmissive + t*color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
	    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main() {
    fragColor = vColor;
}`});

	D3Object.Register('LightPointPerVertexEffect', LightPointPerVertexEffect.factory);

	class LightSpotPerFragEffect extends VisualEffect {

	    constructor() {
	        super();
	        var vshader = new VertexShader('LightSpotPerFragVS', 2, 1);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setProgram(LightSpotPerFragEffect.VertexSource);

	        var fshader = new FragShader('LightSpotPerFragFS', 2, 13);
	        fshader.setInput(0, 'vertexPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        fshader.setInput(1, 'vertexNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
	        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC4);
	        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC4);
	        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC4);
	        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
	        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
	        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC4);
	        fshader.setConstant(7, 'LightModelDirection', Shader.VT_VEC4);
	        fshader.setConstant(8, 'LightAmbient', Shader.VT_VEC4);
	        fshader.setConstant(9, 'LightDiffuse', Shader.VT_VEC4);
	        fshader.setConstant(10, 'LightSpecular', Shader.VT_VEC4);
	        fshader.setConstant(11, 'LightSpotCutoff', Shader.VT_VEC4);
	        fshader.setConstant(12, 'LightAttenuation', Shader.VT_VEC4);
	        fshader.setProgram(LightSpotPerFragEffect.FragSource);

	        var program = new Program('LightSpotPerFragProgram', vshader, fshader);

	        var pass = new VisualPass();
	        pass.program = program;
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        var technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    /**
	     * 创建聚光灯片元光照程序
	     *
	     * @param light {Light}
	     * @param material {Material}
	     * @returns {VisualEffectInstance}
	     */
	    createInstance(light, material) {
	        var instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setFragConstant(0, 0, new WMatrixConstant());
	        instance.setFragConstant(0, 1, new CameraModelPositionConstant());
	        instance.setFragConstant(0, 2, new MaterialEmissiveConstant(material));
	        instance.setFragConstant(0, 3, new MaterialAmbientConstant(material));
	        instance.setFragConstant(0, 4, new MaterialDiffuseConstant(material));
	        instance.setFragConstant(0, 5, new MaterialSpecularConstant(material));
	        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
	        instance.setFragConstant(0, 7, new LightModelDirectionConstant(light));
	        instance.setFragConstant(0, 8, new LightAmbientConstant(light));
	        instance.setFragConstant(0, 9, new LightDiffuseConstant(light));
	        instance.setFragConstant(0, 10, new LightSpecularConstant(light));
	        instance.setFragConstant(0, 11, new LightSpotConstant(light));
	        instance.setFragConstant(0, 12, new LightAttenuationConstant(light));
	        return instance;
	    }


	    /**
	     * 创建唯一聚光灯光照程序
	     *
	     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
	     *
	     * @param light {Light}
	     * @param material {Material}
	     * @returns {VisualEffectInstance}
	     */
	    static createUniqueInstance(light, material) {
	        var effect = new LightSpotPerFragEffect();
	        return effect.createInstance(light, material);
	    }
	}

	DECLARE_ENUM(LightSpotPerFragEffect, {
	    VertexSource: [
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
	    ].join('\n'),
	    FragSource: [
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
	    ].join('\n')
	});

	class LightSpotPerVertexEffect extends VisualEffect {
	    constructor() {
	        super();
	        let vshader = new VertexShader('LightSpotPerVertexVS', 2, 14);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setConstant(1, 'WMatrix', Shader.VT_MAT4);
	        vshader.setConstant(2, 'CameraModelPosition', Shader.VT_VEC3);
	        vshader.setConstant(3, 'MaterialEmissive', Shader.VT_VEC3);
	        vshader.setConstant(4, 'MaterialAmbient', Shader.VT_VEC3);
	        vshader.setConstant(5, 'MaterialDiffuse', Shader.VT_VEC4);
	        vshader.setConstant(6, 'MaterialSpecular', Shader.VT_VEC4);
	        vshader.setConstant(7, 'LightModelPosition', Shader.VT_VEC3);
	        vshader.setConstant(8, 'LightModelDirection', Shader.VT_VEC3);
	        vshader.setConstant(9, 'LightAmbient', Shader.VT_VEC3);
	        vshader.setConstant(10, 'LightDiffuse', Shader.VT_VEC3);
	        vshader.setConstant(11, 'LightSpecular', Shader.VT_VEC3);
	        vshader.setConstant(12, 'LightSpotCutoff', Shader.VT_VEC4);
	        vshader.setConstant(13, 'LightAttenuation', Shader.VT_VEC4);
	        vshader.setProgram(LightSpotPerVertexEffect.VS);

	        let fshader = new FragShader('LightSpotPerVertexFS');
	        fshader.setProgram(LightSpotPerVertexEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('LightSpotPerVertexProgram', vshader, fshader);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    /**
	     * 创建点光源顶点光照程序
	     *
	     * @param {Light} light
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    createInstance(light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setVertexConstant(0, 1, new WMatrixConstant());
	        instance.setVertexConstant(0, 2, new CameraModelPositionConstant());
	        instance.setVertexConstant(0, 3, new MaterialEmissiveConstant(material));
	        instance.setVertexConstant(0, 4, new MaterialAmbientConstant(material));
	        instance.setVertexConstant(0, 5, new MaterialDiffuseConstant(material));
	        instance.setVertexConstant(0, 6, new MaterialSpecularConstant(material));
	        instance.setVertexConstant(0, 7, new LightModelPositionConstant(light));
	        instance.setVertexConstant(0, 8, new LightModelDirectionConstant(light));
	        instance.setVertexConstant(0, 9, new LightAmbientConstant(light));
	        instance.setVertexConstant(0, 10, new LightDiffuseConstant(light));
	        instance.setVertexConstant(0, 11, new LightSpecularConstant(light));
	        instance.setVertexConstant(0, 12, new LightSpotConstant(light));
	        instance.setVertexConstant(0, 13, new LightAttenuationConstant(light));
	        return instance;
	    }

	    /**
	     * 创建唯一点光源顶点光照程序
	     *
	     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
	     *
	     * @param {Light} light
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    static createUniqueInstance(light, material) {
	        let effect = new LightSpotPerVertexEffect();
	        return effect.createInstance(light, material);
	    }
	}

	DECLARE_ENUM(LightSpotPerVertexEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightSpotCutoff;
uniform vec4 LightAttenuation;

layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec4 vColor;

void main(){
    vec3 nor = normalize(modelNormal);
    vec3 spotDir = normalize( LightModelDirection );
    vec3 lightDir = LightModelPosition - modelPosition;     // 指向光源的向量
    float attr = length(WMatrix * vec4(lightDir, 1.0));     // 距离, 距离衰减系数
    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));
    lightDir = normalize(lightDir);
    float dWeight = max(dot(nor, lightDir), 0.0);           // 漫反射权重
    vec3 color = MaterialAmbient * LightAmbient;
    if (dWeight > 0.0) {
        float spotEffect = dot(spotDir, -lightDir);         // 聚光轴 与 光线 的夹角cos值
        if (spotEffect >= LightSpotCutoff.y) {
            spotEffect = pow(spotEffect, LightSpotCutoff.w);
            vec3 reflectDir = normalize( reflect(-lightDir, nor) );            // 计算反射方向
            vec3 viewVector = normalize(CameraModelPosition - modelPosition);  // 观察方向
            float sWeight = max( dot(reflectDir, viewVector), 0.0);
            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));
            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse;        // 漫反射分量
            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular;  // 高光分量
            color = color + spotEffect * sColor;
        }
    }
    vColor = vec4(MaterialEmissive + attr*color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
	    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main() {
    fragColor = vColor;
}`});

	class MaterialEffect extends VisualEffect {
	    constructor() {
	        super();

	        var vs = new VertexShader('MaterialVS', 1, 1);
	        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vs.setProgram(MaterialEffect.VS);

	        var fs = new FragShader('MaterialFS', 0, 1);
	        fs.setConstant(0, 'MaterialDiffuse', Shader.VT_VEC4);
	        fs.setProgram(MaterialEffect.FS);

	        var program = new Program('MaterialProgram', vs, fs);
	        var pass = new VisualPass();
	        pass.program = program;
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        var technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }
	    /**
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    createInstance(material) {
	        var instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setFragConstant(0, 0, new MaterialDiffuseConstant(material));
	        return instance;
	    }

	    /**
	     * @param {Material} material
	     * @returns {VisualEffectInstance}
	     */
	    static createUniqueInstance(material) {
	        var effect = new MaterialEffect();
	        return effect.createInstance(material);
	    }
	}

	DECLARE_ENUM(MaterialEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
	    FS: `#version 300 es
precision highp float;
uniform vec4 MaterialDiffuse;
out vec4 fragColor;
void main(){
    fragColor = MaterialDiffuse;
}`});

	// import { PVWMatrixConstant, MaterialDiffuseConstant } from '../shaderFloat/namespace'

	class MaterialTextureEffect extends VisualEffect {

	}

	class Texture2DEffect extends VisualEffect {
	    /**
	     * @param {SamplerState} filter
	     */
	    constructor(sampler = null) {
	        super();

	        let vshader = new VertexShader('Texture2DVS', 2, 1, 0);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setProgram(Texture2DEffect.VS);

	        let fshader = new FragShader('Texture2DFS', 0, 0, 1);
	        fshader.setSampler(0, 'BaseSampler', Shader.ST_2D);
	        fshader.setSamplerState(0, sampler || SamplerState.defaultSampler);
	        fshader.setTextureUnit(0, Texture2DEffect.FragTextureUnit);
	        fshader.setProgram(Texture2DEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('Texture2DProgram', vshader, fshader);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    /**
	     * Any change in sampler state is made via the frag shader.
	     * @returns {FragShader}
	     */
	    getFragShader() {
	        return super.getFragShader(0, 0);
	    }

	    /**
	     * Create an instance of the effect with unique parameters.
	     * If the sampler filter mode is set to a value corresponding to mipmapping,
	     * then the mipmaps will be generated if necessary.
	     *
	     * @param {Texture2D} texture
	     * @return {VisualEffectInstance}
	     */
	    createInstance(texture) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setFragTexture(0, 0, texture);
	        texture.upload();
	        return instance;
	    }

	    /**
	     * Convenience for creating an instance.  The application does not have to
	     * create the effect explicitly in order to create an instance from it.
	     * @param {Texture2D} texture
	     * @param {SamplerState} sampler
	     * @returns {VisualEffectInstance}
	     */
	    static createUniqueInstance(texture, sampler = null) {
	        let effect = new Texture2DEffect();
	        let fshader = effect.getFragShader();
	        if (sampler !== null) {
	            fshader.setSampler(0, sampler);
	        }
	        return effect.createInstance(texture);
	    }
	}

	DECLARE_ENUM(Texture2DEffect, {
	    FragTextureUnit: 0,
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=8) in vec2 modelTCoord0;
out vec2 tcoord;
void main () {
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    tcoord = modelTCoord0;
}`,
	    FS: `#version 300 es
precision highp float;
uniform sampler2D BaseSampler;
in vec2 tcoord;
out vec4 fragColor;
void main (void) {
    fragColor = texture(BaseSampler, tcoord);
}`});

	class VertexColor3Effect extends VisualEffect {
	    constructor() {
	        super();
	        let vs = new VertexShader('VertexColor3VS', 2, 1);
	        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vs.setInput(0, 'modelColor', Shader.VT_VEC3, Shader.VS_COLOR0);
	        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vs.setProgram(VertexColor3Effect.VS);

	        let fs = new FragShader('VertexColor3FS');
	        fs.setProgram(VertexColor3Effect.FS);

	        let program = new Program('VertexColor3Program', vs, fs);

	        let pass = new VisualPass();
	        pass.program = program;
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    createInstance() {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        return instance;
	    }

	    static createUniqueInstance() {
	        let effect = new VertexColor3Effect();
	        return effect.createInstance();
	    }
	}

	DECLARE_ENUM(VertexColor3Effect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=3) in vec3 modelColor0;
layout(location=6) in float modelPointSize;
out vec3 vertexColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexColor = modelColor0;
    gl_PointSize = modelPointSize;
}`,
	    FS: `#version 300 es
precision highp float;
in vec3 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vec4(vertexColor, 1.0);
}`});

	class VertexColor4Effect extends VisualEffect {
	    constructor() {
	        super();
	        let vs = new VertexShader('VertexColor4VS', 2, 1);
	        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vs.setInput(0, 'modelColor', Shader.VT_VEC4, Shader.VS_COLOR0);
	        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vs.setProgram(VertexColor4Effect.VS);

	        let fs = new FragShader('VertexColor4FS');
	        fs.setProgram(VertexColor4Effect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('VertexColor4Program', vs, fs);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    createInstance() {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        return instance;
	    }

	    static createUniqueInstance() {
	        let effect = new VertexColor4Effect();
	        return effect.createInstance();
	    }
	}

	DECLARE_ENUM(VertexColor4Effect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=3) in vec4 modelColor0;
layout(location=6) in float modelPointSize;
out vec4 vertexColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexColor = modelColor0;
    gl_PointSize = modelPointSize;
}`,
	    FS: `#version 300 es
precision highp float;
in vec4 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vertexColor;
}`});

	class Texture2DLightDirPerFragEffect extends VisualEffect {

	    /**
	     * @param {SamplerState} sampler
	     */
	    constructor(sampler = null) {
	        super();

	        let vshader = new VertexShader('Texture2DLightDirPerFragVS', 3, 1);
	        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
	        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
	        vshader.setInput(2, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
	        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
	        vshader.setProgram(Texture2DLightDirPerFragEffect.VS);

	        let fshader = new FragShader('Texture2DLightDirPerFragFS', 0, 10, 1);
	        fshader.setConstant(0, 'CameraModelPosition', Shader.VT_VEC3);
	        fshader.setConstant(1, 'MaterialEmissive', Shader.VT_VEC3);
	        fshader.setConstant(2, 'MaterialAmbient', Shader.VT_VEC3);
	        fshader.setConstant(3, 'MaterialDiffuse', Shader.VT_VEC4);
	        fshader.setConstant(4, 'MaterialSpecular', Shader.VT_VEC4);
	        fshader.setConstant(5, 'LightModelDirection', Shader.VT_VEC3);
	        fshader.setConstant(6, 'LightAmbient', Shader.VT_VEC3);
	        fshader.setConstant(7, 'LightDiffuse', Shader.VT_VEC3);
	        fshader.setConstant(8, 'LightSpecular', Shader.VT_VEC3);
	        fshader.setConstant(9, 'LightAttenuation', Shader.VT_VEC4);

	        fshader.setSampler(0, 'DiffuseSampler', Shader.ST_2D);
	        fshader.setSamplerState(0, sampler || SamplerState.defaultSampler);
	        fshader.setTextureUnit(0, 0);

	        fshader.setProgram(Texture2DLightDirPerFragEffect.FS);

	        let pass = new VisualPass();
	        pass.program = new Program('TextureLightDirPerFragProgram', vshader, fshader);
	        pass.alphaState = new AlphaState();
	        pass.cullState = new CullState();
	        pass.depthState = new DepthState();
	        pass.offsetState = new OffsetState();
	        pass.stencilState = new StencilState();

	        let technique = new VisualTechnique();
	        technique.insertPass(pass);
	        this.insertTechnique(technique);
	    }

	    /**
	     * @param {Texture2D} texture 
	     * @param {Light} light 
	     * @param {Material} material 
	     * @param {SamplerState} sampler
	     */
	    static createUniqueInstance(texture, light, material, sampler = null) {
	        let effect = new Texture2DLightDirPerFragEffect();
	        let fshader = effect.getFragShader();
	        if (sampler !== null) {
	            fshader.setSampler(0, sampler);
	        }
	        return effect.createInstance(texture, light, material);
	    }

	    createInstance(texture, light, material) {
	        let instance = new VisualEffectInstance(this, 0);
	        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
	        instance.setFragConstant(0, 0, new CameraModelPositionConstant());
	        instance.setFragConstant(0, 1, new MaterialEmissiveConstant(material));
	        instance.setFragConstant(0, 2, new MaterialAmbientConstant(material));
	        instance.setFragConstant(0, 3, new MaterialDiffuseConstant(material));
	        instance.setFragConstant(0, 4, new MaterialSpecularConstant(material));
	        instance.setFragConstant(0, 5, new LightModelDirectionConstant(light));
	        instance.setFragConstant(0, 6, new LightAmbientConstant(light));
	        instance.setFragConstant(0, 7, new LightDiffuseConstant(light));
	        instance.setFragConstant(0, 8, new LightSpecularConstant(light));
	        instance.setFragConstant(0, 9, new LightAttenuationConstant(light));

	        instance.setFragTexture(0, 0, texture);
	        texture.upload();
	        return instance;
	    }
	}

	DECLARE_ENUM(Texture2DLightDirPerFragEffect, {
	    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
layout(location=8) in vec2 modelTCoord0;
out vec3 vertexPosition;
out vec3 vertexNormal;
out vec2 vTCoord0;

void main(){
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
    vTCoord0 = modelTCoord0;
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
	    FS: `#version 300 es
precision highp float;
uniform vec3 CameraModelPosition;

uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;    // alpha通道存储光滑度

uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]

uniform sampler2D DiffuseSampler;

in vec2 vTCoord0;
in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main () {
    vec3 normal = normalize( vertexNormal );
    float diffuseWeight = max( dot(normal, -LightModelDirection), 0.0);
    vec3 color = LightAmbient * MaterialAmbient + LightDiffuse * MaterialDiffuse.rgb * diffuseWeight;
    
    if (diffuseWeight > 0.0) {
        vec3 reflectVector = normalize( reflect(-LightModelDirection, normal) );
        vec3 viewVector = normalize( CameraModelPosition - vertexPosition);
        float rdv = max( dot(reflectVector, viewVector), 0.0);
        float weight = pow(rdv, MaterialSpecular.w);
        color += weight * MaterialSpecular.rgb * LightSpecular;
    }

    vec3 tColor = texture( DiffuseSampler, vTCoord0 ).rgb;
    fragColor = vec4(color * tColor * LightAttenuation.w + MaterialEmissive, MaterialDiffuse.a);
}`});

	class PlanarShadowEffect extends D3Object {

	    /**
	     * @param {number} numPlanes - 投影的平面数量
	     * @param {Node} shadowCaster - 需要投影的物体
	     */
	    constructor(numPlanes, shadowCaster) {
	        super();
	        this.numPlanes = numPlanes;
	        this.planes = new Array(numPlanes);
	        this.projectors = new Array(numPlanes);
	        this.shadowColors = new Array(numPlanes);

	        this.alphaState = new AlphaState();
	        this.depthState = new DepthState();
	        this.stencilState = new StencilState();

	        this.shadowCaster = shadowCaster;

	        this.material = new Material();
	        this.materialEffect = new MaterialEffect();
	        this.materialEffectInstance = this.materialEffect.createInstance(this.material);
	    }

	    /**
	     * @param {Renderer} renderer
	     * @param {VisibleSet} visibleSet
	     */
	    draw(renderer, visibleSet) {
	        // 正常绘制可见物体
	        const numVisible = visibleSet.getNumVisible();
	        const numPlanes = this.numPlanes;
	        let i, j;
	        //for (j = 0; j < numVisible; ++j) {
	        //    renderer.drawVisible(visibleSet.getVisible(j));
	        //}

	        // 保存全局覆盖状态
	        let saveDState = renderer.overrideDepthState;
	        let saveSState = renderer.overrideStencilState;
	        let depthState = this.depthState;
	        let stencilState = this.stencilState;
	        let alphaState = this.alphaState;

	        // 渲染系统使用当前特效的状态
	        renderer.overrideDepthState = depthState;
	        renderer.overrideStencilState = stencilState;

	        // Get the camera to store post-world transformations.
	        let camera = renderer.camera;
	        for (i = 0; i < numPlanes; ++i) {
	            // 开启深度测试
	            depthState.enabled = true;
	            depthState.writable = true;
	            depthState.compare = DepthState.COMPARE_MODE_LEQUAL;

	            // 开启模板测试, 这样,投影平面可以裁剪阴影
	            stencilState.enabled = true;
	            stencilState.compare = StencilState.ALWAYS;
	            stencilState.reference = i + 1;
	            stencilState.onFail = StencilState.OP_KEEP;      // irrelevant
	            stencilState.onZFail = StencilState.OP_KEEP;     // invisible to 0
	            stencilState.onZPass = StencilState.OP_REPLACE;  // visible to i+1

	            // 绘制平面
	            renderer.drawVisible(this.planes[i]);

	            // 在投影平面上混合阴影颜色 The blending equation is
	            //   (rf,gf,bf) = as*(rs,gs,bs) + (1-as)*(rd,gd,bd)
	            // where (rf,gf,bf) is the final color to be written to the frame
	            // buffer, (rs,gs,bs,as) is the shadow color, and (rd,gd,bd) is the
	            // current color of the frame buffer.
	            let saveAlphaState = renderer.overrideAlphaState;
	            renderer.overrideAlphaState = alphaState;
	            alphaState.blendEnabled = true;
	            alphaState.srcBlend = AlphaState.BM_SRC_ALPHA;
	            //alphaState.dstBlend = AlphaState.BM_ONE_MINUS_SRC_ALPHA;
	            alphaState.dstBlend = AlphaState.BM_SRC_ALPHA; // 效果还可以

	            this.material.diffuse.set(this.shadowColors[i]);

	            // 禁用深度缓冲 so that no depth-buffer fighting
	            // occurs.  The drawing of pixels is controlled solely by the stencil
	            // value.
	            depthState.enabled = false;

	            // Only draw where the plane has been drawn.
	            stencilState.enabled = true;
	            stencilState.compare = StencilState.EQUAL;
	            stencilState.reference = i + 1;
	            stencilState.onFail = StencilState.OP_KEEP;   // invisible kept 0
	            stencilState.onZFail = StencilState.OP_KEEP;  // irrelevant
	            stencilState.onZPass = StencilState.OP_ZERO;  // visible set to 0

	            // 计算光源的投影矩阵
	            let projection = Matrix$1.ZERO;
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
	                let visual = visibleSet.getVisible(j);
	                let save = visual.effect;
	                visual.effect = this.materialEffectInstance;
	                renderer.drawVisible(visual);
	                visual.effect = save;
	            }

	            camera.setPreViewMatrix(Matrix$1.IDENTITY);

	            renderer.overrideAlphaState = saveAlphaState;
	        }

	        // 恢复全局状态
	        renderer.overrideStencilState = saveSState;
	        renderer.overrideDepthState = saveDState;
	    }

	    /**
	     * 获取投影矩阵
	     * @param {number} i
	     * @param {Matrix} projection
	     */
	    getProjectionMatrix(i, projection) {
	        // 计算世界坐标系的投影平面
	        let vertex = new Array(3);
	        this.planes[i].getWorldTriangle(0, vertex);
	        let worldPlane = Plane$1.fromPoint3(vertex[0], vertex[1], vertex[2]);

	        // 计算需要计算阴影的物体在投影平面的哪一边
	        if (this.shadowCaster.worldBound.whichSide(worldPlane) < 0) {
	            // 物体在投影平面的背面, 不能生成阴影
	            return false;
	        }

	        // 计算光源的投影矩阵
	        let projector = this.projectors[i];
	        let normal = worldPlane.normal;
	        if (projector.type === Light.LT_DIRECTIONAL) {
	            let NdD = normal.dot(projector.direction);
	            if (NdD >= 0) {
	                // 投影必须在投影平面的正面
	                return false;
	            }

	            // 生成斜投影
	            projection.makeObliqueProjection(vertex[0], normal, projector.direction);
	        }

	        else if (projector.type === Light.LT_POINT || projector.type === Light.LT_SPOT) {
	            let NdE = projector.position.dot(normal);
	            if (NdE <= 0) {
	                // 投影必须在投影平面的正面
	                return false;
	            }
	            // 生成透视投影
	            projection.makePerspectiveProjection(vertex[0], normal, projector.position);
	        }
	        else {
	            console.assert(false, 'Light type not supported.');
	            return false;
	        }

	        return true;
	    }

	    /**
	     * 设置阴影的投影平面
	     *
	     * 设置原来的投影平面为不可见, 由该特效实例负责渲染
	     *
	     * @param {number} i
	     * @param {TriMesh} plane
	     */
	    setPlane(i, plane) {
	        plane.culling = Spatial.CULLING_ALWAYS;
	        this.planes[i] = plane;
	    }

	    /**
	     * 获取阴影的投影平面
	     * @param {number} i
	     * @returns {TriMesh}
	     */
	    getPlane(i) {
	        return this.planes[i];
	    }

	    /**
	     * 设置阴影的光源
	     * @param {number} i
	     * @param {Light} projector
	     */
	    setProjector(i, projector) {
	        this.projectors[i] = projector;
	    }

	    /**
	     * 获取阴影的光源
	     * @param {number} i
	     * @returns {Light}
	     */
	    getProjector(i) {
	        return this.projectors[i];
	    }

	    /**
	     * 设置阴影颜色
	     * @param  {number} i
	     * @param {Float32Array} shadowColor
	     */
	    setShadowColor(i, shadowColor) {
	        if (!this.shadowColors[i]) {
	            this.shadowColors[i] = new Float32Array(shadowColor, 0, 4);
	        }
	        else {
	            this.shadowColors[i].set(shadowColor, 0);
	        }
	    }

	    /**
	     * 获取阴影的颜色
	     * @param {number} i - 索引
	     * @returns {Float32Array}
	     */
	    getShadowColor(i) {
	        return new Float32Array(this.shadowColors[i]);
	    }
	}

	/**
	 * 按键定义
	 * @author lonphy
	 * @version 1.0
	 */
	const KBM_SHIFT = 0x01;
	const KBM_CTRL = 0x02;
	const KBM_ALT = 0x03;
	const KBM_META = 0x04;

	const KB_BACK = 8;
	const KB_TAB = 9;
	const KB_ENTER = 13;
	const KB_SHIFT = 16;
	const KB_CTRL = 17;
	const KB_ALT = 18;
	const KB_CAPSLK = 20;
	const KB_META = 91;

	const KB_DELETE = 46;

	const KB_ESC = 27;
	const KB_ESCAPE = 32;
	const KB_LEFT = 37;
	const KB_UP = 38;
	const KB_RIGHT = 39;
	const KB_DOWN = 40;

	const KB_0 = 48;
	const KB_1 = 49;
	const KB_2 = 50;
	const KB_3 = 51;
	const KB_4 = 52;
	const KB_5 = 53;
	const KB_6 = 54;
	const KB_7 = 55;
	const KB_8 = 56;
	const KB_9 = 57;

	const KB_A = 65;
	const KB_B = 66;
	const KB_C = 67;
	const KB_D = 68;
	const KB_E = 69;
	const KB_F = 70;
	const KB_G = 71;
	const KB_H = 72;
	const KB_I = 73;
	const KB_J = 74;
	const KB_K = 75;
	const KB_L = 76;
	const KB_M = 77;
	const KB_N = 78;
	const KB_O = 79;
	const KB_P = 80;
	const KB_Q = 81;
	const KB_R = 82;
	const KB_S = 83;
	const KB_T = 84;
	const KB_U = 85;
	const KB_V = 86;
	const KB_W = 87;
	const KB_X = 88;
	const KB_Y = 89;
	const KB_Z = 90;

	const KB_F1 = 112;
	const KB_F2 = 113;
	const KB_F3 = 114;
	const KB_F4 = 115;
	const KB_F5 = 116;
	const KB_F6 = 117;
	const KB_F7 = 118;
	const KB_F8 = 119;
	const KB_F9 = 120;
	const KB_F10 = 121;
	const KB_F11 = 122;
	const KB_F12 = 123;

	const MS_LEFT = 1;
	const MS_MIDDLE = 2;
	const MS_RIGHT = 3;



	var key = Object.freeze({
		KBM_SHIFT: KBM_SHIFT,
		KBM_CTRL: KBM_CTRL,
		KBM_ALT: KBM_ALT,
		KBM_META: KBM_META,
		KB_BACK: KB_BACK,
		KB_TAB: KB_TAB,
		KB_ENTER: KB_ENTER,
		KB_SHIFT: KB_SHIFT,
		KB_CTRL: KB_CTRL,
		KB_ALT: KB_ALT,
		KB_CAPSLK: KB_CAPSLK,
		KB_META: KB_META,
		KB_DELETE: KB_DELETE,
		KB_ESC: KB_ESC,
		KB_ESCAPE: KB_ESCAPE,
		KB_LEFT: KB_LEFT,
		KB_UP: KB_UP,
		KB_RIGHT: KB_RIGHT,
		KB_DOWN: KB_DOWN,
		KB_0: KB_0,
		KB_1: KB_1,
		KB_2: KB_2,
		KB_3: KB_3,
		KB_4: KB_4,
		KB_5: KB_5,
		KB_6: KB_6,
		KB_7: KB_7,
		KB_8: KB_8,
		KB_9: KB_9,
		KB_A: KB_A,
		KB_B: KB_B,
		KB_C: KB_C,
		KB_D: KB_D,
		KB_E: KB_E,
		KB_F: KB_F,
		KB_G: KB_G,
		KB_H: KB_H,
		KB_I: KB_I,
		KB_J: KB_J,
		KB_K: KB_K,
		KB_L: KB_L,
		KB_M: KB_M,
		KB_N: KB_N,
		KB_O: KB_O,
		KB_P: KB_P,
		KB_Q: KB_Q,
		KB_R: KB_R,
		KB_S: KB_S,
		KB_T: KB_T,
		KB_U: KB_U,
		KB_V: KB_V,
		KB_W: KB_W,
		KB_X: KB_X,
		KB_Y: KB_Y,
		KB_Z: KB_Z,
		KB_F1: KB_F1,
		KB_F2: KB_F2,
		KB_F3: KB_F3,
		KB_F4: KB_F4,
		KB_F5: KB_F5,
		KB_F6: KB_F6,
		KB_F7: KB_F7,
		KB_F8: KB_F8,
		KB_F9: KB_F9,
		KB_F10: KB_F10,
		KB_F11: KB_F11,
		KB_F12: KB_F12,
		MS_LEFT: MS_LEFT,
		MS_MIDDLE: MS_MIDDLE,
		MS_RIGHT: MS_RIGHT
	});

	class BaseApplication {
	    /**
	     * @param {string} title - 应用名称
	     * @param {number} width - 绘制区域宽度
	     * @param {number} height - 绘制区域高度
	     * @param {Float32Array} clearColor - 背景颜色
	     * @param {string} canvas - 需要渲染的CanvasID
	     */
	    constructor(title, width, height, clearColor, canvas) {
	        BaseApplication._instance = this;
	        let renderDOM = document.getElementById(canvas);
	        renderDOM = renderDOM || document.createElement('canvas');

	        renderDOM.width = width;
	        renderDOM.height = height;

	        this.title = title;
	        this.width = width;
	        this.height = height;
	        this.clearColor = clearColor;

	        this.colorFormat = Texture.TF_A8R8G8B8;
	        this.depthStencilFormat = Texture.TF_D24S8;

	        this.numMultisamples = 0;

	        this.renderer = new Renderer$1(renderDOM, width, height, clearColor, this.colorFormat, this.depthStencilFormat, this.numMultisamples);
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
	    }

	    resetTime() {
	        this.lastTime = -1;
	    }

	    run() {
	        if (!this.onPreCreate()) return;

	        if (!this.fpsOutput) {
	            this.fpsOutput = document.createElement('div');
	            this.fpsOutput.setAttribute('style', 'position:absolute;top:8px;left:8px;color:' + this.textColor);
	            this.renderDOM.parentNode.appendChild(this.fpsOutput);
	        }

	        // Create the renderer.
	        this.renderer.initialize(this.title, this.width, this.height,
	            this.colorFormat, this.depthStencilFormat, this.numMultisamples);


	        let handles = BaseApplication.handles;
	        // TODO : 事件回调定义
	        window.addEventListener('resize', handles.ResizeHandler, false);
	        window.addEventListener('keydown', handles.KeyDownHandler, false);
	        window.addEventListener('keyup', handles.KeyUpHandler, false);
	        window.addEventListener('mousemove', handles.MouseMoveHandler, false);

	        if (!this.onInitialize()) return -4;

	        // The default OnPreidle() clears the buffers.  Allow the application to
	        // fill them before the window is shown and before the event loop starts.
	        this.onPreIdle();

	        this.applicationRun = true;
	        let $this = this;
	        let loopFunc = function (deltaTime) {
	            if (!$this.applicationRun) {
	                $this.onTerminate();
	                delete $this.renderer;
	                delete $this.renderDOM;
	                return;
	            }
	            $this.updateFrameCount();
	            $this.measureTime();

	            if ($this.loadWait === 0) {
	                $this.onIdle.call($this, deltaTime);
	            }
	            requestAnimationFrame(loopFunc);
	        };
	        requestAnimationFrame(loopFunc);
	    }

	    measureTime() {
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
	            let currentTime = Date.now();
	            let dDelta = currentTime - this.lastTime;
	            this.lastTime = currentTime;
	            this.accumulatedTime += dDelta;
	            this.accumulatedFrameCount += this.frameCount;
	            this.frameCount = 0;
	            this.timer = this.maxTimer;
	        }
	    }

	    updateFrameCount() {
	        ++this.frameCount;
	    }

	    /**
	     * 更新FPS显示
	     */
	    drawFrameRate() {
	        if (this.accumulatedTime > 0) {
	            this.frameRate = (this.accumulatedFrameCount / this.accumulatedTime) * 1000;
	        }
	        else {
	            this.frameRate = 0;
	        }
	        this.renderer.drawText(8, 8, '#666', `fps: ${this.frameRate.toFixed(1)}`);
	    }

	    getAspectRatio() {
	        return this.width / this.height;
	    }

	    onInitialize() {
	        this.renderer.clearColor = this.clearColor;
	        return true;
	    }

	    onTerminate() {
	        this.applicationRun = false;
	    }

	    // 预创建,添加输入事件监听
	    onPreCreate() {
	        return true;
	    }

	    onPreIdle() {
	        this.renderer.clearBuffers();
	    }

	    onIdle(t) {
	    }

	    onKeyDown(key$$1, x, y) {
	        if (key$$1 === KB_F2) {
	            this.resetTime();
	            return true;
	        }
	        return false;
	    }

	    onKeyUp(key$$1, x, y) {
	    }

	    onMouseClick(button, state, x, y, modifiers) {
	    }

	    onMotion(button, x, y, modifiers) {
	    }

	    onPassiveMotion(x, y) {
	    }

	    onMouseWheel(delta, x, y, modifiers) {
	    }

	    onResize(w, h) {
	        if (w > 0 && h > 0) {
	            if (this.renderer) {
	                this.renderer.resize(w, h);
	                this.renderDOM.width = w;
	                this.renderDOM.height = h;
	            }
	            this.width = w;
	            this.height = h;
	        }
	    }

	    getMousePosition() {
	    }

	    /**
	     * @returns {BaseApplication}
	     */
	    static get instance() {
	        return BaseApplication._instance || null;
	    }

	    /**
	     * @param val {BaseApplication}
	     */
	    static set instance(val) {
	        BaseApplication._instance = val;
	    }

	    static get gButton() {
	        return BaseApplication._gButton || -1;
	    }

	    static set gButton(val) {
	        BaseApplication._gButton = val;
	    }

	    static get gModifyButton() {
	        return BaseApplication._gModifyButton || -1;
	    }

	    static set gModifyButton(val) {
	        BaseApplication._gModifyButton = val;
	    }

	    static get mX() {
	        return BaseApplication._mX || 0;
	    }

	    static set mX(val) {
	        BaseApplication._mX = val;
	    }

	    static get mY() {
	        return BaseApplication._mY || 0;
	    }

	    static set mY(val) {
	        BaseApplication._mY = val;
	    }

	    static get handles() {

	        return this._handles || (this._handles = {
	            /**
	             * 窗口大小调整事件
	             * @param evt {Event}
	             */
	            ResizeHandler: evt => {
	                let ins = this.instance;
	                if (ins) {
	                    ins.onResize(window.innerWidth, window.innerHeight);
	                }
	            },

	            KeyDownHandler: evt => {
	                let key$$1 = evt.keyCode;
	                let ins = this.instance;
	                if (ins) {
	                    if (key$$1 === KB_ESC && evt.ctrlKey) {
	                        ins.onTerminate();
	                        return;
	                    }
	                    ins.onKeyDown(key$$1, this.mX, this.mY);
	                    ins.onSpecialKeyDown(key$$1, this.mX, this.mY);
	                }
	            },
	            KeyUpHandler: evt => {
	                let key$$1 = evt.keyCode;
	                let ins = this.instance;
	                if (ins) {
	                    ins.onKeyUp(key$$1, this.mX, this.mY);
	                    ins.onSpecialKeyUp(key$$1, this.mX, this.mY);

	                }
	            },
	            MouseMoveHandler: evt => {
	                this.mX = evt.x;
	                this.mY = evt.y;
	            },
	            MouseHandler: evt => {
	                let ins = this.instance;
	                if (ins) {
	                    this.gModifyButton = evt.ctrlKey;
	                    if (evt.state === 'down') {
	                        this.gButton = evt.button;
	                    } else {
	                        this.gButton = -1;
	                    }
	                    ins.onMouseClick(evt.button, evt.state, x, y, this.gModifyButton);
	                }
	            },
	            MotionHandler: (x, y) => {
	                let ins = this.instance;
	                if (ins) {
	                    ins.onMotion(this.gButton, x, y, this.gModifyButton);
	                }
	            },
	            PassiveMotionHandler: (x, y) => {
	                let ins = this.instance;
	                if (ins) {
	                    ins.onPassiveMotion(x, y);
	                }
	            }
	        });
	    }
	}

	class Application3D extends BaseApplication {
	    /**
	     * @param {string} title
	     * @param {number} width
	     * @param {number} height
	     * @param {ArrayLike<number>} clearColor
	     * @param {string} canvas - canvas's DOM id
	     */
	    constructor(title, width, height, clearColor, canvas) {
	        super(title, width, height, clearColor, canvas);
	        this.camera = null;
	        this.worldAxis = [Vector$1.ZERO, Vector$1.ZERO, Vector$1.ZERO];

	        this.trnSpeed = 0;
	        this.trnSpeedFactor = 2;
	        this.rotSpeed = 0;
	        this.rotSpeedFactor = 2;

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

	        /** @type {Spatial} */
	        this.motionObject = null;
	        this.doRoll = 0;
	        this.doYaw = 0;
	        this.doPitch = 0;
	        this.xTrack0 = 0;
	        this.xTrack1 = 0;
	        this.yTrack0 = 0;
	        this.yTrack1 = 0;
	        /** @type {Matrix} */
	        this.saveRotate = null;
	        this.useTrackBall = true;
	        this.trackBallDown = false;
	    }

	    /**
	     * @param {Spatial} motionObject
	     */
	    initializeObjectMotion(motionObject) {
	        this.motionObject = motionObject;
	    }

	    moveObject() {
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
	        let motionObject = this.motionObject;

	        if (!this.cameraMoveable || !motionObject) {
	            return false;
	        }

	        // Check if the object has been moved by the virtual trackball.
	        if (this.trackBallDown) {
	            return true;
	        }

	        // Check if the object has been moved by the function keys.
	        let parent = motionObject.parent;
	        let axis = Vector$1.ZERO;
	        let angle;
	        let rot, incr;
	        let rotSpeed = this.rotSpeed;

	        if (this.doRoll) {
	            rot = motionObject.localTransform.getRotate();

	            angle = this.doRoll * rotSpeed;
	            if (parent) {
	                parent.worldTransform.getRotate().getColumn(0, axis);
	            }
	            else {
	                axis.set(1, 0, 0); // Vector.UNIT_X;
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
	                axis.set(0, 1, 0); // Vector.UNIT_Y;
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
	                axis.set(0, 0, 1); // Vector.UNIT_Z;
	            }

	            incr.makeRotation(axis, angle);
	            rot = incr * rot;
	            rot.orthoNormalize();
	            motionObject.localTransform.setRotate(rot);
	            return true;
	        }

	        return false;
	    }

	    rotateTrackBall(x0, y0, x1, y1) {
	        if ((x0 === x1 && y0 === y1) || !this.camera) {
	            // Nothing to rotate.
	            return;
	        }

	        // Get the first vector on the sphere.
	        let length = _Math.sqrt(x0 * x0 + y0 * y0), invLength, z0, z1;
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
	            z0 = z0 <= 0 ? 0 : _Math.sqrt(z0);
	        }
	        z0 = -z0;

	        // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
	        let vec0 = new Vector$1(z0, y0, x0);

	        // Get the second vector on the sphere.
	        length = _Math.sqrt(x1 * x1 + y1 * y1);
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
	            z1 = z1 <= 0 ? 0 : _Math.sqrt(z1);
	        }
	        z1 = -z1;

	        // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
	        let vec1 = new Vector$1(z1, y1, x1);

	        // Create axis and angle for the rotation.
	        let axis = vec0.cross(vec1);
	        let dot = vec0.dot(vec1);
	        let angle;
	        if (axis.normalize() > _Math.ZERO_TOLERANCE) {
	            angle = _Math.acos(dot);
	        }
	        else  // Vectors are parallel.
	        {
	            if (dot < 0) {
	                // Rotated pi radians.
	                invLength = _Math.invSqrt(x0 * x0 + y0 * y0);
	                axis.x = y0 * invLength;
	                axis.y = -x0 * invLength;
	                axis.z = 0;
	                angle = _Math.PI;
	            }
	            else {
	                // Rotation by zero radians.
	                axis = Vector$1.UNIT_X;
	                angle = 0;
	            }
	        }

	        // Compute the world rotation matrix implied by trackball motion.  The
	        // axis vector was computed in camera coordinates.  It must be converted
	        // to world coordinates.  Once again, I use the camera ordering (D,U,R).
	        let worldAxis = this.camera.direction.scalar(axis.x).add(
	            this.camera.up.scalar(axis.y).add(
	                this.camera.right.scalar(axis.z)
	            )
	        );
	        let trackRotate = new Matrix$1(worldAxis, angle);

	        // Compute the new local rotation.  If the object is the root of the
	        // scene, the new rotation is simply the *incremental rotation* of the
	        // trackball applied *after* the object has been rotated by its old
	        // local rotation.  If the object is not the root of the scene, you have
	        // to convert the incremental rotation by a change of basis in the
	        // parent's coordinate space.
	        let parent = this.motionObject.parent;
	        let localRot;
	        if (parent) {
	            let parWorRotate = parent.worldTransform.GetRotate();
	            localRot = parWorRotate.transposeTimes(trackRotate) * parWorRotate * this.saveRotate;
	        }
	        else {
	            localRot = trackRotate * this.saveRotate;
	        }
	        localRot.orthonormalize();
	        this.motionObject.localTransform.setRotate(localRot);
	    }

	    /**
	     * @param {number} trnSpeed - move speed
	     * @param {number} rotSpeed - rotate speed /rad
	     * @param {number} trnSpeedFactor - move speed factor, default = 2
	     * @param {number} rotSpeedFactor - rotate speed factor, default = 2
	     */
	    initializeCameraMotion(trnSpeed, rotSpeed, trnSpeedFactor = 2, rotSpeedFactor = 2) {
	        this.cameraMoveable = true;

	        this.trnSpeed = trnSpeed;
	        this.rotSpeed = rotSpeed;
	        this.trnSpeedFactor = trnSpeedFactor;
	        this.rotSpeedFactor = rotSpeedFactor;

	        this.worldAxis[0] = this.camera.direction;
	        this.worldAxis[1] = this.camera.up;
	        this.worldAxis[2] = this.camera.right;
	    }

	    /**
	     * if we move camera, then update camera
	     */
	    moveCamera() {
	        if (!this.cameraMoveable) {
	            return false;
	        }

	        let moved = false;

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
	    }

	    moveForward() {
	        let pos = this.camera.position;
	        let t = this.worldAxis[0].scalar(this.trnSpeed);
	        this.camera.setPosition(pos.sub(t));
	    }

	    moveBackward() {
	        let pos = this.camera.position;
	        let t = this.worldAxis[0].scalar(this.trnSpeed);
	        this.camera.setPosition(pos.add(t));
	    }

	    moveUp() {
	        let pos = this.camera.position;
	        let t = this.worldAxis[1].scalar(this.trnSpeed);
	        this.camera.setPosition(pos.sub(t));
	    }

	    moveDown() {
	        let pos = this.camera.position;
	        let t = this.worldAxis[1].scalar(this.trnSpeed);
	        this.camera.setPosition(pos.add(t));
	    }

	    moveLeft() {
	        let pos = this.camera.position;
	        let t = this.worldAxis[2].scalar(this.trnSpeed);
	        this.camera.setPosition(pos.sub(t));
	    }

	    moveRight() {
	        let pos = this.camera.position;
	        let t = this.worldAxis[2].scalar(this.trnSpeed);
	        this.camera.setPosition(pos.add(t));
	    }

	    turnLeft() {
	        let incr = Matrix$1.makeRotation(this.worldAxis[1], -this.rotSpeed);
	        this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
	        this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
	        let camera = this.camera;
	        let dir = incr.mulPoint(camera.direction);
	        let up = incr.mulPoint(camera.up);
	        let right = incr.mulPoint(camera.right);
	        this.camera.setAxes(dir, up, right);
	    }

	    turnRight() {
	        let incr = Matrix$1.makeRotation(this.worldAxis[1], this.rotSpeed);
	        this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
	        this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
	        let camera = this.camera;
	        let dVector = incr.mulPoint(camera.direction);
	        let uVector = incr.mulPoint(camera.up);
	        let rVector = incr.mulPoint(camera.right);
	        this.camera.setAxes(dVector, uVector, rVector);
	    }

	    lookUp() {
	        let incr = Matrix$1.makeRotation(this.worldAxis[2], -this.rotSpeed);
	        let camera = this.camera;
	        let dVector = incr.mulPoint(camera.direction);
	        let uVector = incr.mulPoint(camera.up);
	        let rVector = incr.mulPoint(camera.right);
	        this.camera.setAxes(dVector, uVector, rVector);
	    }

	    lookDown() {
	        let incr = Matrix$1.makeRotation(this.worldAxis[2], this.rotSpeed);
	        let camera = this.camera;
	        let dVector = incr.mulPoint(camera.direction);
	        let uVector = incr.mulPoint(camera.up);
	        let rVector = incr.mulPoint(camera.right);
	        this.camera.setAxes(dVector, uVector, rVector);
	    }

	    /**
	     *
	     * @param {boolean} isPerspective - 透视相机
	     * @returns {boolean}
	     */
	    onInitialize(isPerspective = true) {
	        if (!super.onInitialize()) {
	            return false;
	        }
	        this.camera = new Camera(isPerspective);
	        this.renderer.camera = this.camera;
	        this.motionObject = null;
	        return true;
	    }

	    onKeyDown(key, x, y) {
	        if (super.onKeyDown(key, x, y)) {
	            return true;
	        }
	        let cameraMoveable = this.cameraMoveable;

	        switch (key) {
	            case KB_1:  // Slower camera translation.
	                if (cameraMoveable) {
	                    this.trnSpeed /= this.trnSpeedFactor;
	                }
	                return true;
	            case KB_2:  // Faster camera translation.
	                if (cameraMoveable) {
	                    this.trnSpeed *= this.trnSpeedFactor;
	                }
	                return true;
	            case KB_3:  // Slower camera rotation.
	                if (cameraMoveable) {
	                    this.rotSpeed /= this.rotSpeedFactor;
	                }
	                return true;
	            case KB_4:  // Faster camera rotation.
	                if (cameraMoveable) {
	                    this.rotSpeed *= this.rotSpeedFactor;
	                }
	                return true;
	        }

	        return false;
	    }

	    onSpecialKeyDown(key, x, y) {
	        if (this.cameraMoveable) {
	            switch (key) {
	                case KB_LEFT:
	                    return (this.LArrowPressed = true);
	                case KB_RIGHT:
	                    return (this.RArrowPressed = true);
	                case KB_UP:
	                    return (this.UArrowPressed = true);
	                case KB_DOWN:
	                    return (this.DArrowPressed = true);
	            }
	        }

	        if (this.motionObject) {
	            if (key === KB_F1) {
	                this.doRoll = -1;
	                return true;
	            }
	            if (key === KB_F2) {
	                this.doRoll = 1;
	                return true;
	            }
	            if (key === KB_F3) {
	                this.doYaw = -1;
	                return true;
	            }
	            if (key === KB_F4) {
	                this.doYaw = 1;
	                return true;
	            }
	            if (key === KB_F5) {
	                this.doPitch = -1;
	                return true;
	            }
	            if (key === KB_F6) {
	                this.doPitch = 1;
	                return true;
	            }
	        }

	        return false;
	    }

	    onSpecialKeyUp(key, x, y) {
	        if (this.cameraMoveable) {
	            if (key === KB_LEFT) {
	                this.LArrowPressed = false;
	                return true;
	            }
	            if (key === KB_RIGHT) {
	                this.RArrowPressed = false;
	                return true;
	            }
	            if (key === KB_UP) {
	                this.UArrowPressed = false;
	                return true;
	            }
	            if (key === KB_DOWN) {
	                this.DArrowPressed = false;
	                return true;
	            }
	        }

	        if (this.motionObject) {
	            if (key === KB_F1) {
	                this.doRoll = 0;
	                return true;
	            }
	            if (key === KB_F2) {
	                this.doRoll = 0;
	                return true;
	            }
	            if (key === KB_F3) {
	                this.doYaw = 0;
	                return true;
	            }
	            if (key === KB_F4) {
	                this.doYaw = 0;
	                return true;
	            }
	            if (key === KB_F5) {
	                this.doPitch = 0;
	                return true;
	            }
	            if (key === KB_F6) {
	                this.doPitch = 0;
	                return true;
	            }
	        }

	        return false;
	    }

	    onMouseClick(button, state, x, y, modifiers) {
	        let width = this.width;
	        let height = this.height;
	        if (!this.useTrackBall ||
	            button !== MS_LEFT || !this.motionObject
	        ) {
	            return false;
	        }

	        let mult = 1 / (width >= height ? height : width);

	        if (state === MS_RIGHT) {
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
	    }

	    onMotion(button, x, y, modifiers) {
	        if (
	            !this.useTrackBall ||
	            button !== MS_LEFT || !this.trackBallDown || !this.motionObject
	        ) {
	            return false;
	        }
	        let width = this.width;
	        let height = this.height;

	        // Get the ending point.
	        let mult = 1 / (width >= height ? height : width);
	        this.xTrack1 = (2 * x - width) * mult;
	        this.yTrack1 = (2 * (height - 1 - y) - height) * mult;

	        // Update the object's local rotation.
	        this.rotateTrackBall(this.xTrack0, this.yTrack0, this.xTrack1, this.yTrack1);
	        return true;
	    }

	    onResize(width, height) {
	        super.onResize(width, height);
	        let params = this.camera.getPerspective();
	        this.camera.setPerspective(params[0], this.getAspectRatio(), params[2], params[3]);
	    }
	}

	const APP_PATH = location.pathname.replace(/[^\/]+$/, ''); // 获取应用程序路径
	let cache = new Map();	// 资源缓存
	let calling = new Map();	// 请求队列

	let XhrTask$1 = Object.create(null);

	/**
	 * Ajax加载器
	 * 
	 * type must one of [arraybuffer blob document json text]
	 * @param {string} url - 请求资源路径
	 * @param {String} type - 请求类型
	 * @todo 同地址， 不同请求类型处理
	 */
	XhrTask$1.load = function (url, type = 'arraybuffer') {
	    let fullPath = url[0] === '/' ? url : (APP_PATH + url);

	    // 1. 查看请求队列,有则直接返回承诺对象
	    if (calling.has(fullPath)) {
	        return calling.get(fullPath);
	    }
	    // 2. 查看缓存池，有则兼容返回
	    if (cache.has(fullPath)) {
	        return Promise.resolve(cache.get(fullPath));
	    }
	    // 3. 否则新建请求
	    let task = new Promise(function (resolve, reject) {
	        let xhr = new XMLHttpRequest();
	        xhr.open('GET', fullPath);
	        xhr.responseType = type;
	        xhr.onloadend = function (e) {
	            if (e.target.status === 200) {
	                // 1. 放入缓存
	                cache.set(fullPath, e.target.response);
	                // 2. 从请求队列删除
	                calling.delete(fullPath);
	                resolve(e.target.response);
	            } else {
	                reject(new Error('XhrTask Load Error' + e.target.status));
	            }
	        };
	        xhr.onerror = reject;
	        xhr.ontimeout = reject;
	        xhr.send();
	    });
	    // 4. 加入请求队列
	    calling.set(fullPath, task);
	    return task;
	};

	let __parsePlugins = new Map();



	XhrTask$1.plugin = function (name, fn) {
	    if (!fn) {
	        return __parsePlugins.get(name);
	    }
	    __parsePlugins.set(name, fn);
	};

	exports.D3Object = D3Object;
	exports.InStream = InStream;
	exports.BinDataView = BinDataView;
	exports.Bound = Bound$1;
	exports.Color = Color;
	exports.Transform = Transform$1;
	exports.BillboardNode = BillboardNode;
	exports.PlanarReflectionEffect = PlanarReflectionEffect;
	exports.PlanarShadowEffect = PlanarShadowEffect;
	exports.Renderer = Renderer$1;
	exports.Input = key;
	exports.BaseApplication = BaseApplication;
	exports.Application3D = Application3D;
	exports.XhrTask = XhrTask$1;
	exports.def = def;
	exports.runApplication = runApplication;
	exports.DECLARE_ENUM = DECLARE_ENUM;
	exports.uuid = uuid;
	exports.BigEndian = BigEndian;
	exports.VERSION = VERSION;
	exports._Math = _Math;
	exports.Point = Point$1;
	exports.Vector = Vector$1;
	exports.Plane = Plane$1;
	exports.Matrix = Matrix$1;
	exports.Matrix3 = Matrix3;
	exports.Quaternion = Quaternion$1;
	exports.Polynomial1 = Polynomial1;
	exports.Triangle3 = Triangle3;
	exports.Line3 = Line3;
	exports.BlendTransformController = BlendTransformController;
	exports.ControlledObject = ControlledObject;
	exports.Controller = Controller;
	exports.IKController = IKController;
	exports.IKGoal = IKGoal;
	exports.IKJoint = IKJoint;
	exports.KeyframeController = KeyframeController;
	exports.MorphController = MorphController;
	exports.ParticleController = ParticleController;
	exports.PointController = PointController;
	exports.SkinController = SkinController;
	exports.TransformController = TransformController;
	exports.DefaultEffect = DefaultEffect;
	exports.LightAmbEffect = LightAmbEffect;
	exports.LightDirPerFragEffect = LightDirPerFragEffect;
	exports.LightDirPerVerEffect = LightDirPerVerEffect;
	exports.LightPointPerFragEffect = LightPointPerFragEffect;
	exports.LightPointPerVertexEffect = LightPointPerVertexEffect;
	exports.LightSpotPerFragEffect = LightSpotPerFragEffect;
	exports.LightSpotPerVertexEffect = LightSpotPerVertexEffect;
	exports.MaterialEffect = MaterialEffect;
	exports.MaterialTextureEffect = MaterialTextureEffect;
	exports.Texture2DEffect = Texture2DEffect;
	exports.VertexColor3Effect = VertexColor3Effect;
	exports.VertexColor4Effect = VertexColor4Effect;
	exports.Texture2DLightDirPerFragEffect = Texture2DLightDirPerFragEffect;
	exports.Buffer = Buffer;
	exports.IndexBuffer = IndexBuffer$1;
	exports.VertexBuffer = VertexBuffer;
	exports.RenderTarget = RenderTarget;
	exports.Texture = Texture;
	exports.Texture2D = Texture2D;
	exports.TextureCube = TextureCube;
	exports.VertexFormat = VertexFormat$1;
	exports.VertexBufferAccessor = VertexBufferAccessor;
	exports.Camera = Camera;
	exports.CameraNode = CameraNode;
	exports.Projector = Projector;
	exports.Culler = Culler;
	exports.Light = Light;
	exports.LightNode = LightNode;
	exports.Material = Material;
	exports.Node = Node;
	exports.Particles = Particles;
	exports.Picker = Picker;
	exports.PickRecord = PickRecord;
	exports.PolyPoint = PolyPoint;
	exports.Polysegment = Polysegment;
	exports.ScreenTarget = ScreenTarget;
	exports.Spatial = Spatial;
	exports.StandardMesh = StandardMesh;
	exports.Triangles = Triangles;
	exports.TriFan = TriFan;
	exports.TriMesh = TriMesh;
	exports.TriStrip = TriStrip;
	exports.VisibleSet = VisibleSet;
	exports.Visual = Visual$1;
	exports.ShaderFloat = ShaderFloat;
	exports.LightAmbientConstant = LightAmbientConstant;
	exports.LightDiffuseConstant = LightDiffuseConstant;
	exports.LightSpecularConstant = LightSpecularConstant;
	exports.LightAttenuationConstant = LightAttenuationConstant;
	exports.LightSpotConstant = LightSpotConstant;
	exports.LightModelDirectionConstant = LightModelDirectionConstant;
	exports.LightModelPositionConstant = LightModelPositionConstant;
	exports.LightWorldDirectionConstant = LightWorldDirectionConstant;
	exports.LightWorldPositionConstant = LightWorldPositionConstant;
	exports.MaterialAmbientConstant = MaterialAmbientConstant;
	exports.MaterialDiffuseConstant = MaterialDiffuseConstant;
	exports.MaterialEmissiveConstant = MaterialEmissiveConstant;
	exports.MaterialSpecularConstant = MaterialSpecularConstant;
	exports.VMatrixConstant = VMatrixConstant;
	exports.VWMatrixConstant = VWMatrixConstant;
	exports.WMatrixConstant = WMatrixConstant;
	exports.PVMatrixConstant = PVMatrixConstant;
	exports.PVWMatrixConstant = PVWMatrixConstant;
	exports.CameraModelPositionConstant = CameraModelPositionConstant;
	exports.AlphaState = AlphaState;
	exports.CullState = CullState;
	exports.DepthState = DepthState;
	exports.OffsetState = OffsetState;
	exports.StencilState = StencilState;
	exports.Program = Program;
	exports.Shader = Shader;
	exports.FragShader = FragShader;
	exports.VertexShader = VertexShader;
	exports.SamplerState = SamplerState;
	exports.ShaderParameters = ShaderParameters;
	exports.VisualEffect = VisualEffect;
	exports.VisualEffectInstance = VisualEffectInstance;
	exports.VisualPass = VisualPass;
	exports.VisualTechnique = VisualTechnique;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=l5gl.js.map
