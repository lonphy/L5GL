/**
 * 材质高光系数
 *
 * MaterialDiffuseConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialSpecularConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialSpecularConstant, 'MaterialSpecularConstant');
L5.extendFix(L5.MaterialSpecularConstant, L5.ShaderFloat);


L5.MaterialSpecularConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新材高光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialSpecularConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.specular);
};

L5.MaterialSpecularConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialSpecularConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialSpecularConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialSpecularConstant}
 */
L5.MaterialSpecularConstant.factory = function (inStream) {
    var obj = new L5.MaterialSpecularConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialSpecularConstant', L5.MaterialSpecularConstant.factory);