/**
 * ??? VWMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.VWMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.VWMatrixConstant, 'VWMatrixConstant');
L5.extendFix(L5.VWMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.VWMatrixConstant.prototype.update = function (visual, camera) {
};