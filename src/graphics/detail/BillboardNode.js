/**
 * 广告牌节点
 */
import { Node } from '../sceneTree/Node'
import { _Math, Matrix } from '../../math/index'

export class BillboardNode extends Node {

    /**
     * @param {Camera} camera
     */
    constructor(camera = null) {
        super();
        /**
         * @private
         */
        this._camera = camera;
    }

    /**
     * The camera to which the billboard is aligned.
     *
     * @param {Camera} camera
     */
    static alignTo(camera) {
        this._camera = camera;
    }

    /**
     * Support for the geometric update
     *
     * @param {number} applicationTime
     */
    updateWorldData(applicationTime) {
        // Compute the billboard's world transforms based on its parent's world
        // transform and its local transforms.  Notice that you should not call
        // Node::UpdateWorldData since that function updates its children.  The
        // children of a BillboardNode cannot be updated until the billboard is
        // aligned with the camera.
        super.updateWorldData(applicationTime);

        if (this._camera) {
            // Inverse-transform the camera to the model space of the billboard.
            let modelPos = this.worldTransform.inverse().mulPoint(this._camera.position);

            // To align the billboard, the projection of the camera to the
            // xz-plane of the billboard's model space determines the angle of
            // rotation about the billboard's model y-axis.  If the projected
            // camera is on the model axis (x = 0 and z = 0), ATan2 returns zero
            // (rather than NaN), so there is no need to trap this degenerate
            // case and handle it separately.
            let angle = _Math.atan2(modelPos[0], modelPos[2]);
            let orient = new Matrix.makeRotateY(angle);
            this.worldTransform.setRotate(this.worldTransform.getRotate().mul(orient));
        }

        // Update the children now that the billboard orientation is known.
        this.childs.forEach(function (c) {
            c.update(applicationTime, false);
        });
    }
}
