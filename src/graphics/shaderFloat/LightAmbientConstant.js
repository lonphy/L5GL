/**
 * 灯光 - 环境光分量
 *
 * LightAmbientConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightAmbientConstant = function (light) {
    L5.ShaderFloat.call (this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix (L5.LightAmbientConstant, 'LightAmbientConstant');
L5.extendFix (L5.LightAmbientConstant, L5.ShaderFloat);

L5.LightAmbientConstant.prototype.getLight = function() {
    return this.light;
};

/**
 * 更新环境光分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightAmbientConstant.prototype.update = function(visual, camera) {
    this.copy(this.light.ambient);
};

L5.LightAmbientConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightAmbientConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightAmbientConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightAmbientConstant}
 */
L5.LightAmbientConstant.factory = function (inStream) {
    var obj = new L5.LightAmbientConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightAmbientConstant', L5.LightAmbientConstant.factory);