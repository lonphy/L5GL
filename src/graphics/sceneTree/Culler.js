/**
 * Culler - 裁剪
 *
 * @version 2.0
 * @author lonphy
 */
import * as util from '../../util/util'
import { _Math, Vector, Plane } from '../../math/index'
import { Camera } from './Camera'
import { VisibleSet } from './VisibleSet'

export class Culler {

    /**
     * @param {Camera} camera 
     */
    constructor(camera) {
        // The data members mFrustum, mPlane, and mPlaneState are
        // uninitialized.  They are initialized in the GetVisibleSet call.

        // The input camera has information that might be needed during the
        // culling pass over the scene.
        this._camera = camera || null;

        /**
         * The potentially visible set for a call to GetVisibleSet.
         * @type {VisibleSet}
         * @private
         */
        this._visibleSet = new VisibleSet();

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
        for (var i = 0, l = this._plane.length; i < l; ++i) {
            this._plane[i] = new Plane(Vector.ZERO, 0);
        }
        this._planeState = 0;

        // 传入摄像机的视截体副本
        // 主要用于在裁剪时供各种子系统修改视截体参数, 而不影响摄像机
        // 这些内部状态在渲染器中需要
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
        var invLength = _Math.invSqrt(near2 + bottom2);
        var c0 = bottom * -invLength;
        var c1 = near * invLength;
        var normal = directionVec.scalar(c0).add(upVec.scalar(c1));
        var constant = position.dot(normal);
        this._plane[VF_BOTTOM].normal = normal;
        this._plane[VF_BOTTOM].constant = constant;

        // 更新上平面
        invLength = _Math.invSqrt(near2 + top2);
        c0 = top * invLength;
        c1 = near * -invLength;
        normal = directionVec.scalar(c0).add(upVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_TOP].normal = normal;
        this._plane[VF_TOP].constant = constant;

        // 更新左平面
        invLength = _Math.invSqrt(near2 + left2);
        c0 = left * -invLength;
        c1 = near * invLength;
        normal = directionVec.scalar(c0).add(rightVec.scalar(c1));
        constant = position.dot(normal);
        this._plane[VF_LEFT].normal = normal;
        this._plane[VF_LEFT].constant = constant;

        // 更新右平面
        invLength = _Math.invSqrt(near2 + right2);
        c0 = right * invLength;
        c1 = near * -invLength;
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
     * @param visible {Spatial}
     */
    insert(visible) {
        this._visibleSet.insert(visible);
    }

    /**
     * Compare the object's world bound against the culling planes.
     * Only Spatial calls this function.
     *
     * @param bound {Bound}
     * @returns {boolean}
     */
    isVisible(bound) {
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
     * @param numVertices {number}
     * @param vertices {Array<Point>}
     * @param ignoreNearPlane {boolean}
     */
    isVisible1(numVertices, vertices, ignoreNearPlane) {
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
            if (ignoreNearPlane && index == Camera.VF_NEAR) {
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
    }


    // Support for BspNode::GetVisibleSet.  Determine whether the view frustum
    // is fully on one side of a plane.  The "positive side" of the plane is
    // the half space to which the plane normal points.  The "negative side"
    // is the other half space.  The function returns +1 if the view frustum
    // is fully on the positive side of the plane, -1 if the view frustum is
    // fully on the negative side of the plane, or 0 if the view frustum
    // straddles the plane.  The input plane is in world coordinates and the
    // world camera coordinate system is used for the test.
    /**
     * @param plane {Plane}
     * @returns {number}
     */
    whichSide(plane) {
        // The plane is N*(X-C) = 0 where the * indicates dot product.  The signed
        // distance from the camera location E to the plane is N*(E-C).
        var NdEmC = plane.distanceTo(this._camera.position);

        var normal = plane.normal;
        var NdD = normal.dot(this._camera.direction);
        var NdU = normal.dot(this._camera.up);
        var NdR = normal.dot(this._camera.right);
        var FdN = this._frustum[Camera.VF_FAR] / this._frustum[Camera.VF_NEAR];

        var positive = 0, negative = 0, sgnDist;

        // Check near-plane vertices.
        var PDMin = this._frustum[Camera.VF_NEAR] * NdD;
        var NUMin = this._frustum[Camera.VF_BOTTOM] * NdU;
        var NUMax = this._frustum[Camera.VF_TOP] * NdU;
        var NRMin = this._frustum[Camera.VF_LEFT] * NdR;
        var NRMax = this._frustum[Camera.VF_RIGHT] * NdR;

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
        var PDMax = this._frustum[Camera.VF_FAR] * NdD;
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
    }

    /**
     * 计算裁剪后的可见物体
     * @param scene {Spatial}
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

};

util.DECLARE_ENUM(Culler, {
    MAX_PLANE_QUANTITY: 32
});
