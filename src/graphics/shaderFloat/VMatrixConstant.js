/**
 * 视图矩阵 - VMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.VMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.VMatrixConstant, 'VMatrixConstant');
L5.extendFix(L5.VMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.VMatrixConstant.prototype.update = function (visual, camera) {
};