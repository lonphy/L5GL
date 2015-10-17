/**
 * 世界坐标系矩 - WMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.WMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.WMatrixConstant, 'WMatrixConstant');
L5.extendFix(L5.WMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.WMatrixConstant.prototype.update = function (visual, camera) {
    var worldMatrix = visual.worldTransform.toMatrix();
    this.copy(worldMatrix.content);
};