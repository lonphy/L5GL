import { Point, _Math } from '../../math/index'

/**
 * 包围盒(球体)
 */
export class Bound {
    constructor() {
        this.center = Point.ORIGIN;
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

        this.radius = _Math.sqrt(this.radius);
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
