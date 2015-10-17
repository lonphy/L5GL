/**
 * 平行光 光照效果 (顶点Blinn光照)
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightDirPerVerEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightDirPerVer", 2, 2, 11, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(1, "CameraModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(2, "MaterialEmissive", L5.Shader.VT_VEC4);
    vshader.setConstant(3, "MaterialAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(4, "MaterialDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(5, "MaterialSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(6, "LightModelDirection", L5.Shader.VT_VEC4);
    vshader.setConstant(7, "LightAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(8, "LightDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(9, "LightSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(10, "LightAttenuation", L5.Shader.VT_VEC4);
    vshader.setProgram(L5.LightDirPerVerEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightDirPerVer", 1, 1, 0, 0);
    fshader.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setProgram(L5.LightDirPerVerEffect.FragSource);

    var program = new L5.Program("L5.Program", vshader, fshader);

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
L5.nameFix(L5.LightDirPerVerEffect, 'LightDirPerVerEffect');
L5.extendFix(L5.LightDirPerVerEffect, L5.VisualEffect);

L5.LightDirPerVerEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.CameraModelPositionConstant());
    instance.setVertexConstant(0, 2, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 3, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 4, new L5.MaterialDiffuseConstant(material));
    instance.setVertexConstant(0, 5, new L5.MaterialSpecularConstant(material));
    instance.setVertexConstant(0, 6, new L5.LightModelDirectionConstant(light));
    instance.setVertexConstant(0, 7, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 8, new L5.LightDiffuseConstant(light));
    instance.setVertexConstant(0, 9, new L5.LightSpecularConstant(light));
    instance.setVertexConstant(0, 10, new L5.LightAttenuationConstant(light));
    return instance;
};
L5.LightDirPerVerEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightDirPerVerEffect();
    return effect.createInstance(light, material);
};

L5.LightDirPerVerEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',           // c[1],c[2],c[3],c[4]
    'uniform vec4 CameraModelPosition;', // c[5], 物体坐标系中相机的位置
    'uniform vec4 MaterialEmissive;',    // c[6]
    'uniform vec4 MaterialAmbient;',     // c[7]
    'uniform vec4 MaterialDiffuse;',     // c[8]
    'uniform vec4 MaterialSpecular;',    // c[9] [,,,光滑度]
    'uniform vec4 LightModelDirection;', // c[10]
    'uniform vec4 LightAmbient;',        // c[11]
    'uniform vec4 LightDiffuse;',        // c[12]
    'uniform vec4 LightSpecular;',       // c[13]
    'uniform vec4 LightAttenuation;',    // c[14], [constant, linear, quadratic, intensity]
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec4 vertexColor;',
    'void main(){',
    '  vec3 nor = normalize(modelNormal.xyz);',
    '  vec3 dir = normalize(LightModelDirection.xyz);',
    '  vec3 color = LightAmbient.rgb * MaterialAmbient.rgb;',                      // 环境光分量
    '  float t = max( dot(nor, dir) , 0.0);',                                      // 入射角cos值
    '  if ( t > 0.0) {',
    '    color = color + t * MaterialDiffuse.rgb * LightDiffuse.rgb;',             // 漫反射分量
    '    vec3 viewVector = normalize(CameraModelPosition.xyz - modelPosition);',   // 观察方向
    '    vec3 reflectDir = normalize( reflect(-dir, nor) );',                      // 反射方向
    '    t = max( dot(reflectDir, viewVector), 0.0);',
    '    float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0));',
    '    color = weight * MaterialSpecular.rgb * LightSpecular.rgb + color;',      // 高光分量
    '  }',
    '  color = color * LightAttenuation.w + MaterialEmissive.rgb;',                // 加入总光强系数
    '  vertexColor = vec4(color, MaterialDiffuse.a);',
    '  gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightDirPerVerEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    'gl_FragColor = vertexColor;',
    '}'
].join("\n");


L5.LightDirPerVerEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightDirPerVerEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightDirPerVerEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightDirPerVerEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightDirPerVerEffect.FragSource);

    this.techniques = this.___;
};

L5.LightDirPerVerEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightDirPerVerEffect}
 */
L5.LightDirPerVerEffect.factory = function (inStream) {
    var obj = new L5.LightDirPerVerEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightDirPerVerEffect', L5.LightDirPerVerEffect.factory);