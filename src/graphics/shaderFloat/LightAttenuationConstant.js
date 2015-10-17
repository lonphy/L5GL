/**
 * 灯光 - 衰减系数 LightAttenuationConstant
 * @param light {L5.Light} 灯光
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.LightAttenuationConstant = function (light) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.light = light;
};
L5.nameFix(L5.LightAttenuationConstant, 'LightAttenuationConstant');
L5.extendFix(L5.LightAttenuationConstant, L5.ShaderFloat);

L5.LightAttenuationConstant.prototype.getLight = function () {
    return this.light;
};

/**
 * 更新衰减系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.LightAttenuationConstant.prototype.update = function (visual, camera) {
    this.data[0] = this.light.constant;
    this.data[1] = this.light.linear;
    this.data[2] = this.light.quadratic;
    this.data[3] = this.light.intensity;
};

L5.LightAttenuationConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.light = inStream.readPointer();
};

L5.LightAttenuationConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.light = inStream.resolveLink(this.light);
};

L5.LightAttenuationConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.light);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightAttenuationConstant}
 */
L5.LightAttenuationConstant.factory = function (inStream) {
    var obj = new L5.LightAttenuationConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightAttenuationConstant', L5.LightAttenuationConstant.factory);