/**
 * 投影-相机-物体 最终矩阵 PVWMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.PVWMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.PVWMatrixConstant, 'PVWMatrixConstant');
L5.extendFix(L5.PVWMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.PVWMatrixConstant.prototype.update = function (visual, camera) {
    var projViewMatrix = camera.projectionViewMatrix;
    var worldMatrix = visual.worldTransform.toMatrix();
    var projViewWorldMatrix = projViewMatrix.mul(worldMatrix);
    this.copy(projViewWorldMatrix.content);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.PVWMatrixConstant}
 */
L5.PVWMatrixConstant.factory = function (inStream) {
    var obj = new L5.PVWMatrixConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.PVWMatrixConstant', L5.PVWMatrixConstant.factory);