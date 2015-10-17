/**
 * 材质漫反射系数
 *
 * MaterialDiffuseConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialDiffuseConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialDiffuseConstant, 'MaterialDiffuseConstant');
L5.extendFix(L5.MaterialDiffuseConstant, L5.ShaderFloat);


L5.MaterialDiffuseConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新材质漫反射系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialDiffuseConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.diffuse);
};

L5.MaterialDiffuseConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialDiffuseConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialDiffuseConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialDiffuseConstant}
 */
L5.MaterialDiffuseConstant.factory = function (inStream) {
    var obj = new L5.MaterialDiffuseConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialDiffuseConstant', L5.MaterialDiffuseConstant.factory);