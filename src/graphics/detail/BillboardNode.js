/**
 * BillboardNode
 *
 * @param camera {L5.Camera} default is null
 */
L5.BillboardNode = function (camera) {

    this._camera = camera || null;
    L5.Node.call(this);

};
L5.nameFix(L5.BillboardNode, 'BillboardNode');
L5.extendFix(L5.BillboardNode, L5.Node);


/**
 * The camera to which the billboard is aligned.
 *
 * @param camera {L5.Camera}
 */
L5.BillboardNode.alignTo = function (camera) {
    this._camera = camera;
};

/**
 * Support for the geometric update
 *
 * @param applicationTime {number}
 */
L5.BillboardNode.prototype.updateWorldData = function (applicationTime) {
    // Compute the billboard's world transforms based on its parent's world
    // transform and its local transforms.  Notice that you should not call
    // Node::UpdateWorldData since that function updates its children.  The
    // children of a BillboardNode cannot be updated until the billboard is
    // aligned with the camera.
    L5.Spatial.prototype.updateWorldData.call(this, applicationTime);

    if (this._camera) {
        // Inverse-transform the camera to the model space of the billboard.
        var modelPos = this.worldTransform.inverse().mulPoint(this._camera.position);

        // To align the billboard, the projection of the camera to the
        // xz-plane of the billboard's model space determines the angle of
        // rotation about the billboard's model y-axis.  If the projected
        // camera is on the model axis (x = 0 and z = 0), ATan2 returns zero
        // (rather than NaN), so there is no need to trap this degenerate
        // case and handle it separately.
        var angle = L5.Math.atan2(modelPos[0], modelPos[2]);
        console.log(angle * (180 / Math.PI));
        var orient = new L5.Matrix.makeRotateY(angle);
        this.worldTransform.setRotate(this.worldTransform.getRotate().mul(orient));
    }

    // Update the children now that the billboard orientation is known.
    this.childs.forEach(function (c) {
        c.update(applicationTime, false);
    });
};