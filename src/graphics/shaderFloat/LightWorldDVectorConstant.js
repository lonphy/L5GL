/**
 * 灯光 - 世界坐标系方向
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightWorldDVectorConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightWorldDVectorConstant, 'LightWorldDVectorConstant');
L5.extendFix(L5.LightWorldDVectorConstant, L5.ShaderFloat);

L5.LightWorldDVectorConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新光源世界坐标系的方向
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightWorldDVectorConstant.prototype.update = function (visual, camera) {
};