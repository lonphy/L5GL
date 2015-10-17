/**
 * 灯光 - 入射方向向量
 *
 * LightModelDirectionConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightModelDirectionConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightModelDirectionConstant, 'LightModelDirectionConstant');
L5.extendFix(L5.LightModelDirectionConstant, L5.ShaderFloat);

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightModelDirectionConstant.prototype.update = function (visual, camera) {
    var worldInvMatrix = visual.worldTransform.inverse();
    var modelDir = worldInvMatrix.mulPoint(this.light.direction);
    this.copy(modelDir._content);
};


L5.LightModelDirectionConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightModelDirectionConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightModelDirectionConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};
/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightModelDirectionConstant}
 */
L5.LightModelDirectionConstant.factory = function (inStream) {
    var obj = new L5.LightModelDirectionConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightModelDirectionConstant', L5.LightModelDirectionConstant.factory);
