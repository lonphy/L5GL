/**
 * 相机位置
 *
 * CameraModelPositionConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.CameraModelPositionConstant = function () {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
};
L5.nameFix(L5.CameraModelPositionConstant, 'CameraModelPositionConstant');
L5.extendFix(L5.CameraModelPositionConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.CameraModelPositionConstant.prototype.update = function (visual, camera) {

    var worldPosition = camera.position;
    var worldInvMatrix = visual.worldTransform.inverse();
    var modelPosition = worldInvMatrix.mulPoint(worldPosition);
    this.copy(modelPosition._content);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.CameraModelPositionConstant}
 */
L5.CameraModelPositionConstant.factory = function (inStream) {
    var obj = new L5.CameraModelPositionConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.CameraModelPositionConstant', L5.CameraModelPositionConstant.factory);