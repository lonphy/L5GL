/**
 * Spatial - 场景空间
 *
 * @extends {L5.ControlledObject}
 *
 * @version 1.0
 * @author lonphy
 */

L5.Spatial = function() {
    L5.ControlledObject.call(this);
    /**
     * @type {L5.Transform}
     */
    this.localTransform = null;
    /**
     * @type {L5.Transform}
     */
    this.worldTransform = null;
    // 在一些情况下直接更新worldTransform而跳过Spatial.update()
    // 在这种情况下必须将this.worldTransformIsCurrent设置为true
    this.worldTransformIsCurrent = false;

    /**
     * @type {L5.Bound}
     */
    this.worldBound = null;
    // 在一些情况下直接更新worldBound而跳过Spatial.update()
    // 在这种情况下必须将this.worldBoundIsCurrent设置为true
    this.worldBoundIsCurrent = false;

    this.culling = L5.Spatial.CULLING_DYNAMIC;
    /**
     * @type {L5.Spatial}
     */
    this.parent = null;
};

L5.nameFix(L5.Spatial, 'Spatial');
L5.extendFix(L5.Spatial, L5.ControlledObject);

/////////////////// const CULLING_MODE /////////////////////////////////

// 通过比较世界包围盒裁剪平面确定可见状态
L5.Spatial.CULLING_DYNAMIC = 0;
// 强制裁剪对象, 如果节点被裁剪，那么它的整个子树也被裁剪
L5.Spatial.CULLING_ALWAYS  = 1;
// 不裁剪对象， 如果一个节点是不裁剪对象，那么它的整个子树也不被裁剪。
L5.Spatial.CULLING_NEVER = 2;

/**
 * 在向下遍历场景树或向上遍历世界包围盒时，计算世界变换，
 *
 * 更新几何体的状态和控制器
 *
 * @param applicationTime {number}
 * @param initiator {boolean}
 */
L5.Spatial.prototype.update = function(
    applicationTime, initiator
) {
    applicationTime = applicationTime || -L5.Math.MAX_REAL;
    this.updateWorldData(applicationTime);
    this.updateWorldBound();

    if (initiator === undefined || initiator === true)
    {
        this.propagateBoundToRoot();
    }
};

/**
 *
 * @param applicationTime {number}
 */
L5.Spatial.prototype.updateWorldData = function(
    applicationTime
){
    // 更新当前空间的所有控制器
    this.updateControllers(applicationTime);

    // 更新世界变换
    if (!this.worldTransformIsCurrent)
    {
        if (this.parent)
        {
            this.worldTransform = this.parent.worldTransform.mul(this.localTransform);
        }
        else
        {
            this.worldTransform = this.localTransform;
        }
    }
};

L5.Spatial.prototype.propagateBoundToRoot = function (){
    if (this.parent)
    {
        this.parent.updateWorldBound();
        this.parent.propagateBoundToRoot();
    }
};

/**
 * 裁剪支持
 * @param culler {L5.Culler}
 * @param noCull {boolean}
 */
L5.Spatial.prototype.onGetVisibleSet = function (
        culler, noCull
) {
    if (this.culling === L5.Spatial.CULLING_ALWAYS)
    {
        return;
    }

    if (this.culling == L5.Spatial.CULLING_NEVER)
    {
        noCull = true;
    }

    var savePlaneState = culler.getPlaneState();
    if (noCull || culler.isVisible(this.worldBound))
    {
        this.getVisibleSet(culler, noCull);
    }
    culler.planeState = savePlaneState;
};

// 子类实现， 用于更新世界包围盒
L5.Spatial.prototype.updateWorldBound = function() {
    throw new Error('updateWorldBound not defined.');
};