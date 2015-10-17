/**
 * 灯光 - 聚光灯参数
 *
 * LightSpotConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightSpotConstant = function (light) {
    L5.ShaderFloat.call (this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix (L5.LightSpotConstant, 'LightSpotConstant');
L5.extendFix (L5.LightSpotConstant, L5.ShaderFloat);

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightSpotConstant.prototype.update = function(visual, camera) {
    this.data[0] = this.light.angle;
    this.data[1] = this.light.cosAngle;
    this.data[2] = this.light.sinAngle;
    this.data[3] = this.light.exponent;
};