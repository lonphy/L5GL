/**
 * 灯光 - 漫反射分量 LightDiffuseConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightDiffuseConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightDiffuseConstant, 'LightDiffuseConstant');
L5.extendFix(L5.LightDiffuseConstant, L5.ShaderFloat);

L5.LightDiffuseConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新漫反射分量
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightDiffuseConstant.prototype.update = function (visual, camera) {
    this.copy(this.light.diffuse);
};

L5.LightDiffuseConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightDiffuseConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightDiffuseConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightDiffuseConstant}
 */
L5.LightDiffuseConstant.factory = function (inStream) {
    var obj = new L5.LightDiffuseConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightDiffuseConstant', L5.LightDiffuseConstant.factory);