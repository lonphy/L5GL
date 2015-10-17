/**
 * 灯光 - 高光分量 LightSpecularConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightSpecularConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightSpecularConstant, 'LightSpecularConstant');
L5.extendFix(L5.LightSpecularConstant, L5.ShaderFloat);

L5.LightSpecularConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新高光分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightSpecularConstant.prototype.update = function (visual, camera) {
    this.copy(this.light.specular);
};

L5.LightSpecularConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightSpecularConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightSpecularConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightSpecularConstant}
 */
L5.LightSpecularConstant.factory = function (inStream) {
    var obj = new L5.LightSpecularConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightSpecularConstant', L5.LightSpecularConstant.factory);