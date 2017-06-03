/**
 * Vector
 */
import { _Math } from './Math';

/**
 * @type {Vector}
 * @extends {Float32Array}
 */
export class Vector extends Float32Array {

    constructor(x = 0, y = 0, z = 0) {
        super(4);
        if (x instanceof Float32Array) {
            this.set(x.slice(0, 3));
        } else {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        // this[3] = 0;
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
     * 求向量长度
     * none side-effect
     * @returns {number}
     */
    get length() {
        let x = this[0];
        let y = this[1];
        let z = this[2];
        return _Math.sqrt(x * x + y * y + z * z);
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
        return new Vector(
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
        let cross = new Vector(
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
        return new Vector(
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
        return new Vector(
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
        return new Vector(
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

            return new Vector(
                this[0] * scalar,
                this[1] * scalar,
                this[2] * scalar
            );
        }
        return Vector.ZERO;
    }

    /**
     * negative Vector  
     * none side-effect
     */
    negative() {
        return new Vector(-this[0], -this[1], -this[2]);
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
        return new Vector();
    }

    static get UNIT_X() {
        return new Vector(1);
    }

    static get UNIT_Y() {
        return new Vector(0, 1);
    }

    static get UNIT_Z() {
        return new Vector(0, 0, 1);
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

        if (_Math.abs(vec2.x) >= _Math.abs(vec2.y)) {
            // vec2.x or vec2.z is the largest magnitude component, swap them
            invLength = 1 / _Math.sqrt(vec2.x * vec2.x + vec2.z * vec2.z);
            vec0.x = -vec2.z * invLength;
            vec0.y = 0;
            vec0.z = +vec2.x * invLength;
            vec1.x = vec2.y * vec0.z;
            vec1.y = vec2.z * vec0.x - vec2.x * vec0.z;
            vec1.z = -vec2.y * vec0.x;
        }
        else {
            // vec2.y or vec2.z is the largest magnitude component, swap them
            invLength = 1 / _Math.sqrt(vec2.y * vec2.y + vec2.z * vec2.z);
            vec0.x = 0;
            vec0.y = +vec2.z * invLength;
            vec0.z = -vec2.y * invLength;
            vec1.x = vec2.y * vec0.z - vec2.z * vec0.y;
            vec1.y = -vec2.x * vec0.z;
            vec1.z = vec2.x * vec0.y;
        }
    }
}
