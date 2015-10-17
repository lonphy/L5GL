/**
 * ??? PVMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.PVMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.PVMatrixConstant, 'PVMatrixConstant');
L5.extendFix(L5.PVMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.PVMatrixConstant.prototype.update = function (visual, camera) {
};