/**
 * 灯光 - 世界坐标
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightWorldPositionConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightWorldPositionConstant, 'LightWorldPositionConstant');
L5.extendFix(L5.LightWorldPositionConstant, L5.ShaderFloat);

L5.LightWorldPositionConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新高光分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightWorldPositionConstant.prototype.update = function (visual, camera) {
};