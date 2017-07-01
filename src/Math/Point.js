import { Vector } from './Vector';

class Point extends Float32Array {

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
        return new Vector(
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
        return new Point(
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
        return new Point(
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
        return new Point(
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

            return new Point(
                this[0] * scalar,
                this[1] * scalar,
                this[2] * scalar
            );
        }
        return new Point(MAX_REAL, MAX_REAL, MAX_REAL);
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
        return new Point(
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
        return new Point();
    }
}

export { Point };
