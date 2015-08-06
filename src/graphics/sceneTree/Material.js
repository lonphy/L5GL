/**
 * Material
 *
 * @extends {L5.D3Object}
 * @class
 */
L5.Material = function(){
    L5.D3Object.call(this);

    this.emissive = new Float32Array([0,0,0,1]);
    this.ambient = new Float32Array([0,0,0,1]);
    this.diffuse = new Float32Array([0,0,0,1]);

    // 光滑度在alpha通道
    this.specular = new Float32Array([0,0,0,0]);
};
L5.nameFix(L5.Material, 'Material');
L5.extendFix(L5.Material, L5.D3Object);