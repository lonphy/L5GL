/**
 * Gouraud 光照效果 (片段Blinn光照)
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightDirPerFragEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightDirPerFrag", 2, 3, 1, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);

    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(1, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setProgram(L5.LightDirPerFragEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightDirPerFrag", 2, 1, 10, 0);
    fshader.setInput(0, "vertexPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    fshader.setInput(1, "vertexNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    fshader.setConstant(0, "CameraModelPosition", L5.Shader.VT_VEC4);
    fshader.setConstant(1, "MaterialEmissive", L5.Shader.VT_VEC4);
    fshader.setConstant(2, "MaterialAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(3, "MaterialDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(4, "MaterialSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(5, "LightModelDirection", L5.Shader.VT_VEC4);
    fshader.setConstant(6, "LightAmbient", L5.Shader.VT_VEC4);
    fshader.setConstant(7, "LightDiffuse", L5.Shader.VT_VEC4);
    fshader.setConstant(8, "LightSpecular", L5.Shader.VT_VEC4);
    fshader.setConstant(9, "LightAttenuation", L5.Shader.VT_VEC4);
    fshader.setProgram(L5.LightDirPerFragEffect.FragSource);

    var program = new L5.Program("L5.LightDirPerFrag", vshader, fshader);

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
L5.nameFix(L5.LightDirPerFragEffect, 'LightDirPerFragEffect');
L5.extendFix(L5.LightDirPerFragEffect, L5.VisualEffect);

L5.LightDirPerFragEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setFragConstant(0, 0, new L5.CameraModelPositionConstant());
    instance.setFragConstant(0, 1, new L5.MaterialEmissiveConstant(material));
    instance.setFragConstant(0, 2, new L5.MaterialAmbientConstant(material));
    instance.setFragConstant(0, 3, new L5.MaterialDiffuseConstant(material));
    instance.setFragConstant(0, 4, new L5.MaterialSpecularConstant(material));
    instance.setFragConstant(0, 5, new L5.LightModelDirectionConstant(light));
    instance.setFragConstant(0, 6, new L5.LightAmbientConstant(light));
    instance.setFragConstant(0, 7, new L5.LightDiffuseConstant(light));
    instance.setFragConstant(0, 8, new L5.LightSpecularConstant(light));
    instance.setFragConstant(0, 9, new L5.LightAttenuationConstant(light));
    return instance;
};
L5.LightDirPerFragEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightDirPerFragEffect();
    return effect.createInstance(light, material);
};

L5.LightDirPerFragEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main(){',
    '\t vertexPosition = modelPosition;',
    '\t vertexNormal = modelNormal;',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightDirPerFragEffect.FragSource = [
    'precision highp float;',
    'uniform vec4 CameraModelPosition;', // c[0], 物体坐标系中相机的位置
    'uniform vec4 MaterialEmissive;',    // c[1]
    'uniform vec4 MaterialAmbient;',     // c[2]
    'uniform vec4 MaterialDiffuse;',     // c[3]
    'uniform vec4 MaterialSpecular;',    // c[4] [,,,光滑度]
    'uniform vec4 LightModelDirection;', // c[5]
    'uniform vec4 LightAmbient;',        // c[6]
    'uniform vec4 LightDiffuse;',        // c[7]
    'uniform vec4 LightSpecular;',       // c[8]
    'uniform vec4 LightAttenuation;',    // c[9], [constant, linear, quadratic, intensity]
    'varying vec3 vertexPosition;',
    'varying vec3 vertexNormal;',
    'void main (void) {',
    '  vec3 nor = normalize(vertexNormal);',
    '  vec3 color = LightAmbient.rgb * MaterialAmbient.rgb;',           // 计算环境光分量
    '  float t = abs(dot(nor, LightModelDirection.xyz));',        // 计算入射角cos值
    '  color = color + t * MaterialDiffuse.rgb * LightDiffuse.rgb;',   // 计算漫反射分量
    '  if (t > 0.0) {',
    '    vec3 tmp = normalize(CameraModelPosition.xyz - vertexPosition);',
    '    tmp = normalize(tmp - LightModelDirection.xyz);',
    '    t = max(dot(nor, tmp), 0.0);',
    '    float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0) );',
    '    color = weight * MaterialSpecular.rgb * LightSpecular.rgb + color;',
    '  }',
    '  color = color * LightAttenuation.w + MaterialEmissive.rgb;',
    '  gl_FragColor = vec4(color, 1.0);',
    '}'
].join("\n");


L5.LightDirPerFragEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightDirPerFragEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightDirPerFragEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightDirPerFragEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightDirPerFragEffect.FragSource);

    this.techniques = this.___;
};

L5.LightDirPerFragEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightDirPerFragEffect}
 */
L5.LightDirPerFragEffect.factory = function (inStream) {
    var obj = new L5.LightDirPerFragEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightDirPerFragEffect', L5.LightDirPerFragEffect.factory);