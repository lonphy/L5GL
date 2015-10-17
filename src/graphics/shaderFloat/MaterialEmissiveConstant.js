/**
 * 材质自发光系数
 *
 * MaterialEmissiveConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialEmissiveConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialEmissiveConstant, 'MaterialEmissiveConstant');
L5.extendFix(L5.MaterialEmissiveConstant, L5.ShaderFloat);


L5.MaterialEmissiveConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新自发光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialEmissiveConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.emissive);
};

L5.MaterialEmissiveConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialEmissiveConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialEmissiveConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialEmissiveConstant}
 */
L5.MaterialEmissiveConstant.factory = function (inStream) {
    var obj = new L5.MaterialEmissiveConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialEmissiveConstant', L5.MaterialEmissiveConstant.factory);