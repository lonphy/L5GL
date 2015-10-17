/**
 * Material 材质
 *
 * @extends {L5.D3Object}
 * @class
 */
L5.Material = function(){
    L5.D3Object.call(this);

    this.emissive = new Float32Array([0, 0, 0, 0]);
    this.ambient = new Float32Array([0,0,0,1]);
    this.diffuse = new Float32Array([0,0,0,1]);

    // 光滑度在alpha通道
    this.specular = new Float32Array([0,0,0,0]);
};
L5.nameFix(L5.Material, 'Material');
L5.extendFix(L5.Material, L5.D3Object);

L5.Material.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.emissive.set(inStream.readFloat32Range(4));
    this.ambient.set(inStream.readFloat32Range(4));
    this.diffuse.set(inStream.readFloat32Range(4));
    this.specular.set(inStream.readFloat32Range(4));
};

L5.Material.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeFloat32Array(4, this.emissive);
    outStream.writeFloat32Array(4, this.ambient);
    outStream.writeFloat32Array(4, this.diffuse);
    outStream.writeFloat32Array(4, this.specular);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.Material}
 */
L5.Material.factory = function (inStream) {
    var obj = new L5.Material();
    obj.emissive[3] = 0;
    obj.ambient[3] = 0;
    obj.diffuse[3] = 0;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.Material', L5.Material.factory);