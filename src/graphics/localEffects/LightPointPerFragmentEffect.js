/**
 * 点光源 片元光照效果
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightPointPerFragmentEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightPointPerFragment", 2, 3, 1, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setOutput(2, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);

    vshader.setProgram(L5.LightPointPerFragmentEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightPointPerFragment", 2, 1, 11, 0);
    fshader.setInput(0, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    fshader.setInput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);

    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    fshader.setConstant(0, "WMatrix", L5.Shader.VT_MAT4);
    fshader.setConstant(1, "CameraModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(2, "MaterialEmissive", L5.Shader.VT_VEC4);
    fshader.setConstant(3, "MaterialAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(4, "MaterialDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(5, "MaterialSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(6, "LightModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(7, "LightAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(8, "LightDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(9, "LightSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(10, "LightAttenuation", L5.Shader.VT_VEC4);

    fshader.setProgram(L5.LightPointPerFragmentEffect.FragSource);

    var program = new L5.Program("L5.LightPointPerFragmentEffectProgram", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightPointPerFragmentEffect, 'LightPointPerFragmentEffect');
L5.extendFix(L5.LightPointPerFragmentEffect, L5.VisualEffect);

/**
 * 创建点光源顶点光照程序
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightPointPerFragmentEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());

    instance.setFragConstant(0, 0, new L5.WMatrixConstant());
    instance.setFragConstant(0, 1, new L5.CameraModelPositionConstant());
    instance.setFragConstant(0, 2, new L5.MaterialEmissiveConstant(material));
    instance.setFragConstant(0, 3, new L5.MaterialAmbientConstant(material));
    instance.setFragConstant(0, 4, new L5.MaterialDiffuseConstant(material));
    instance.setFragConstant(0, 5, new L5.MaterialSpecularConstant(material));
    instance.setFragConstant(0, 6, new L5.LightModelPositionConstant(light));
    instance.setFragConstant(0, 7, new L5.LightAmbientConstant(light));
    instance.setFragConstant(0, 8, new L5.LightDiffuseConstant(light));
    instance.setFragConstant(0, 9, new L5.LightSpecularConstant(light));
    instance.setFragConstant(0, 10, new L5.LightAttenuationConstant(light));
    return instance;
};

/**
 * 创建唯一点光源顶点光照程序
 *
 * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightPointPerFragmentEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightPointPerFragmentEffect();
    return effect.createInstance(light, material);
};

L5.LightPointPerFragmentEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
    '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '    vertexPosition = modelPosition;',
    '    vertexNormal = modelNormal;',
    '}'
].join("\n");

L5.LightPointPerFragmentEffect.FragSource = [
    'precision highp float;',
    'uniform mat4 WMatrix;',
    'uniform vec4 CameraModelPosition;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 MaterialDiffuse;',
    'uniform vec4 MaterialSpecular;',
    'uniform vec4 LightModelPosition;',
    'uniform vec4 LightAmbient;',
    'uniform vec4 LightDiffuse;',
    'uniform vec4 LightSpecular;',
    'uniform vec4 LightAttenuation;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
    '    vec3 nor = normalize(vertexNormal);',
    '    vec3 dir = LightModelPosition.xyz - vertexPosition;',
    '    float t = length(WMatrix * vec4(dir, 0.0));',
    // t = intensity / (constant + d * linear + d*d* quadratic);
    '    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));',
    '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',

    '    dir = normalize(dir);',
    '    float d = max(dot(nor, dir), 0.0);',
    '    color = color + d * MaterialDiffuse.rgb*LightDiffuse.rgb;',


    '    if (d > 0.0) {',
    '        vec3 viewVector = normalize(CameraModelPosition.xyz - vertexPosition);',
    '        vec3 reflectDir = normalize( reflect(-dir, nor) );',               // 计算反射方向
    '        d = max(dot(reflectDir, viewVector), 0.0);',
    '        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));',
    '        color = color + d * MaterialSpecular.rgb*LightSpecular.rgb;',
    '    }',
    '    gl_FragColor.rgb = MaterialEmissive.rgb + t*color;',
    '    gl_FragColor.a = MaterialDiffuse.a;',
    '}'
].join("\n");


L5.LightPointPerFragmentEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightPointPerFragmentEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightPointPerFragmentEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightPointPerFragmentEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightPointPerFragmentEffect.FragSource);

    this.techniques = this.___;
};

L5.LightPointPerFragmentEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightPointPerFragmentEffect}
 */
L5.LightPointPerFragmentEffect.factory = function (inStream) {
    var obj = new L5.LightPointPerFragmentEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightPointPerFragmentEffect', L5.LightPointPerFragmentEffect.factory);