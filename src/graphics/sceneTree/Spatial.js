import { ControlledObject } from '../controllers/ControlledObject';
import { DECLARE_ENUM } from '../../util/util';
import { _Math } from '../../math/index';
import { Transform } from '../dataTypes/Transform';
import { Bound } from '../dataTypes/Bound';

class Spatial extends ControlledObject {
    constructor() {
        super();

        this.localTransform = Transform.IDENTITY;
        this.worldTransform = Transform.IDENTITY;

        // 在一些情况下直接更新worldTransform而跳过Spatial.update()
        // 在这种情况下必须将this.worldTransformIsCurrent设置为true
        this.worldTransformIsCurrent = false;

        this.worldBound = new Bound();

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

export { Spatial };