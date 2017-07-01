import { Vector } from './Vector'

/**
 * Plane - 平面
 * 
 * 平面表示为 `Dot(N, X) - c = 0`, 其中：  
 *  - `N = (n0, n1, n2, 0)` 一个单位法向量  
 *  - `X = (x0, x1, x2, 1)` 是任何在该平面上的点  
 *  - `c` 是平面常量
 */
export class Plane extends Float32Array {

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
        return new Plane(
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
        return new Plane(new Vector(n0, n1, n2), constant);
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
        return new Plane(normal, point0.dot(normal));
    }

    get normal() {
        return new Vector(this[0], this[1], this[2]);
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
