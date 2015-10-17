/**
 * 点控制器
 *
 * @class
 * @extends {L5.Controller}
 */
L5.PointController = function () {
    L5.Controller.call(this);
    this.systemLinearSpeed = 0.0;
    this.systemAngularSpeed = 0.0;
    this.systemLinearAxis = L5.Vector.UNIT_Z;
    this.systemAngularAxis = L5.Vector.UNIT_Z;

    this.numPoints = 0;
    this.pointLinearSpeed = 0.0;
    this.pointAngularSpeed = 0.0;
    this.pointLinearAxis = L5.Vector.UNIT_Z;
    this.pointAngularAxis = L5.Vector.UNIT_Z;
};
L5.nameFix(L5.PointController, 'PointController');
L5.extendFix(L5.PointController, L5.Controller);

L5.PointController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    var ctrlTime = this.getControlTime(applicationTime);

    this.updateSystemMotion(ctrlTime);
    this.updatePointMotion(ctrlTime);
    return true;
};

//----------------------------------------------------------------------------
L5.PointController.prototype.reallocate = function (numPoints) {
    delete this.pointLinearSpeed;
    delete this.pointAngularSpeed;
    delete this.pointLinearAxis;
    delete this.pointAngularAxis;

    this.numPoints = numPoints;
    if (numPoints > 0) {
        this.pointLinearSpeed = new Array(numPoints);
        this.pointAngularSpeed = new Array(numPoints);
        this.pointLinearAxis = new Array(numPoints);
        this.pointAngularAxis = new Array(numPoints);
        for (var i = 0; i < numPoints; ++i) {
            this.pointLinearSpeed[i] = 0.0;
            this.pointAngularSpeed[i] = 0.0;
            this.pointLinearAxis[i] = L5.Vector.UNIT_Z;
            this.pointAngularAxis[i] = L5.Vector.UNIT_Z;
        }
    }
};

/**
 *
 * @ctldObj {L5.ControlledObject}
 */
L5.PointController.prototype.setObject = function (ctldObj) {

    this.object = ctldObj;

    if (object) {
        L5.assert(!(ctldObj instanceof L5.PolyPoint), 'Invalid class');
        this.reallocate(ctldObj.vertexBuffer.numElements);
    }
    else {
        this.reallocate(0);
    }
};

//----------------------------------------------------------------------------
L5.PointController.prototype.updateSystemMotion = function (ctrlTime) {
    var points = this.object;

    var distance = ctrlTime * this.systemLinearSpeed;
    var deltaTrn = this.systemLinearAxis.scalar(distance);
    points.localTransform.setTranslate(
        points.localTransform.getTranslate().add(deltaTrn)
    );

    var angle = ctrlTime * this.systemAngularSpeed;
    var deltaRot = L5.Matrix.makeRotation(this.systemAngularAxis, angle);

    points.localTransform.setRotate(deltaRot.mul(points.localTransform.getRotate()));
};

//----------------------------------------------------------------------------
L5.PointController.prototype.updatePointMotion = function (ctrlTime) {

    var points = this.object;

    var vba = L5.VertexBufferAccessor.fromVisual(points);

    const numPoints = points.numPoints;
    var i, distance, pos, deltaTrn;
    for (i = 0; i < numPoints; ++i) {
        distance = ctrlTime * this.pointLinearSpeed[i];
        deltaTrn = this.pointLinearAxis[i].scalar(distance);

        pos = vba.getPosition(i);
        pos[0] += deltaTrn.x;
        pos[1] += deltaTrn.y;
        pos[2] += deltaTrn.z;
    }

    var angle, normal, deltaRot;
    if (vba.hasNormal()) {
        for (i = 0; i < numPoints; ++i) {
            angle = ctrlTime * this.pointAngularSpeed[i];
            normal = vba.getNormal(i);
            normal.normalize();
            deltaRot = L5.Matrix.makeRotation(this.pointAngularAxis[i], angle);
            vba.setNormal(i, deltaRot.mulPoint(normal));
        }
    }

    L5.Renderer.updateAll(points.vertexBuffer);
};