/**
 * 材质环境光系数
 *
 * MaterialAmbientConstant
 * @param material {L5.Material} 材质
 * @class
 *
 * @extends {L5.ShaderFloat}
 */
L5.MaterialAmbientConstant = function (material) {
    L5.ShaderFloat.call(this, 1);
    this.allowUpdater = true;
    this.material = material;
};
L5.nameFix(L5.MaterialAmbientConstant, 'MaterialAmbientConstant');
L5.extendFix(L5.MaterialAmbientConstant, L5.ShaderFloat);


L5.MaterialAmbientConstant.prototype.getMaterial = function () {
    return this.material;
};

/**
 * 更新材质环境光系数
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.MaterialAmbientConstant.prototype.update = function (visual, camera) {
    this.copy(this.material.ambient);
};

L5.MaterialAmbientConstant.prototype.load = function (inStream) {
    L5.ShaderFloat.prototype.load.call(this, inStream);
    this.material = inStream.readPointer();
};

L5.MaterialAmbientConstant.prototype.link = function (inStream) {
    L5.ShaderFloat.prototype.link.call(this, inStream);
    this.material = inStream.resolveLink(this.material);
};

L5.MaterialAmbientConstant.prototype.save = function (outStream) {
    L5.ShaderFloat.prototype.save.call(this, outStream);
    outStream.writePointer(this.material);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.MaterialAmbientConstant}
 */
L5.MaterialAmbientConstant.factory = function (inStream) {
    var obj = new L5.MaterialAmbientConstant();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.MaterialAmbientConstant', L5.MaterialAmbientConstant.factory);