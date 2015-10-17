/**
 * 透视矩阵 - ProjectorMatrixConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.ProjectorMatrixConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.ProjectorMatrixConstant, 'ProjectorMatrixConstant');
L5.extendFix(L5.ProjectorMatrixConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ProjectorMatrixConstant.prototype.update = function (visual, camera) {
};