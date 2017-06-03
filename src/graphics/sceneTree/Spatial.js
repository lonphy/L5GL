/**
 * Spatial - 场景空间
 */
import { ControlledObject } from '../controllers/ControlledObject'
import * as util from '../../util/util'
import { _Math } from '../../math/index'
import { Transform } from '../dataTypes/Transform'
import { Bound } from '../dataTypes/Bound'

export class Spatial extends ControlledObject {
    constructor() {
        super();

        /** @type {Transform} */
        this.localTransform = Transform.IDENTITY;

        /** @type {Transform} */
        this.worldTransform = Transform.IDENTITY;

        // 在一些情况下直接更新worldTransform而跳过Spatial.update()
        // 在这种情况下必须将this.worldTransformIsCurrent设置为true
        this.worldTransformIsCurrent = false;

        /** @type {Bound} */
        this.worldBound = new Bound();
        // 在一些情况下直接更新worldBound而跳过Spatial.update()
        // 在这种情况下必须将this.worldBoundIsCurrent设置为true
        this.worldBoundIsCurrent = false;

        this.culling = Spatial.CULLING_DYNAMIC;

        /** @type {Spatial} */
        this.parent = null;
    }
    /**
     * 在向下遍历场景树或向上遍历世界包围盒时，计算世界变换，
     *
     * 更新几何体的状态和控制器
     *
     * @param {number} applicationTime
     * @param {boolean} initiator
     */
    update(applicationTime = -_Math.MAX_REAL, initiator=false) {
        applicationTime = applicationTime;
        this.updateWorldData(applicationTime);
        this.updateWorldBound();

        if (initiator === undefined || initiator === true) {
            this.propagateBoundToRoot();
        }
    }
    /**
     *
     * @param applicationTime {number}
     */
    updateWorldData(applicationTime) {
        // 更新当前空间的所有控制器
        this.updateControllers(applicationTime);

        // 更新世界变换
        if (!this.worldTransformIsCurrent) {
            if (this.parent) {
                this.worldTransform = this.parent.worldTransform.mul(this.localTransform);
            }
            else {
                this.worldTransform = this.localTransform;
            }
        }
    }

    propagateBoundToRoot() {
        if (this.parent) {
            this.parent.updateWorldBound();
            this.parent.propagateBoundToRoot();
        }
    }

    /**
     * 裁剪支持
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

        var savePlaneState = culler.planeState;
        if (noCull || culler.isVisible(this.worldBound)) {
            this.getVisibleSet(culler, noCull);
        }
        culler.planeState = savePlaneState;
    }

    // 子类实现， 用于更新世界包围盒
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

util.DECLARE_ENUM(Spatial, {
    CULLING_DYNAMIC: 0, // 通过比较世界包围盒裁剪平面确定可见状态
    CULLING_ALWAYS: 1, // 强制裁剪对象, 如果节点被裁剪，那么它的整个子树也被裁剪
    CULLING_NEVER: 2  // 不裁剪对象， 如果一个节点是不裁剪对象，那么它的整个子树也不被裁剪。
});
