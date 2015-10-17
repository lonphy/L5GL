/**
 * 灯光 - 光源位置
 *
 * LightModelPositionConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightModelPositionConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightModelPositionConstant, 'LightModelPositionConstant');
L5.extendFix(L5.LightModelPositionConstant, L5.ShaderFloat);

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightModelPositionConstant.prototype.update = function (visual, camera) {
    var worldInvMatrix = visual.worldTransform.inverse();
    var modelPosition = worldInvMatrix.mulPoint(this.light.position);
    this.copy(modelPosition._content);
};