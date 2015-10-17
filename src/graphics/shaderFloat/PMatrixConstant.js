/**
 * ??? PMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.PMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.PMatrixConstant, 'PMatrixConstant');
L5.extendFix(L5.PMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.PMatrixConstant.prototype.update = function (visual, camera) {
};