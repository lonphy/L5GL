/**
 * CameraNode - 相机节点
 *
 * @param camera {L5.Camera}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.CameraNode = function(camera) {
    L5.Node.call(this);

    this.camera = camera;
};

L5.nameFix(L5.CameraNode, 'CameraNode');
L5.extendFix(L5.CameraNode, L5.Node);

L5.CameraNode.prototype = {
    constructor: L5.CameraNode,

    set camera (val) {
        this._camera = val;
        if (val)
        {
            this.localTransform.setTranslate(val.position);

            var rotate = new L5.Matrix.IPMake(
                val.direction,
                val.up,
                val.right,
                L5.Point.ORIGIN
            );
            this.localTransform.setRotate(rotate);
            this.update();
        }
    },
    get camera () {
        return this._camera;
    },

    updateWorldData: function(applicationTime) {
        L5.Node.prototype.updateWorldData(applicationTime);

        if (this._camera)
        {
            var pos = this.worldTransform.getTranslate();
            var rotate = this.worldTransform.getRotate();
            var direction = L5.Vector.ZERO;
            var up = L5.Vector.ZERO;
            var right = L5.Vector.ZERO;
            rotate.getColumn(0, direction);
            rotate.getColumn(1, up);
            rotate.getColumn(2, right);
            this._camera.setFrame(pos, direction, up, right);
        }
    }
};
