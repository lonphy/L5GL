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
