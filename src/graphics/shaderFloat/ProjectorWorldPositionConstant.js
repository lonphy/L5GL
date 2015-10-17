/**
 * ??? ProjectorWorldPositionConstant
 * @constructor
 *
 * @extends {L5.ShaderFloat}
 */
L5.ProjectorWorldPositionConstant = function () {
    L5.ShaderFloat.call(this, 4);
    this.allowUpdater = true;
};
L5.nameFix(L5.ProjectorWorldPositionConstant, 'ProjectorWorldPositionConstant');
L5.extendFix(L5.ProjectorWorldPositionConstant, L5.ShaderFloat);
/**
 *
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ProjectorWorldPositionConstant.prototype.update = function (visual, camera) {
};