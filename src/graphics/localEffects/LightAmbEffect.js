/**
 * 只有环境光和发射光的着色器
 * @constructor
 * @extends {L5.VisualEffect}
 */
L5.LightAmbEffect = function () {
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.Default", 1, 2, 5, 0, false);
    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setConstant(1, "MaterialEmissive", L5.Shader.VT_VEC4);
    vs.setConstant(2, "MaterialAmbient", L5.Shader.VT_VEC4);
    vs.setConstant(3, "LightAmbient", L5.Shader.VT_VEC4);
    vs.setConstant(4, "LightAttenuation", L5.Shader.VT_VEC4);
    vs.setProgram(L5.LightAmbEffect.VertextSource);

    var fs = new L5.FragShader("L5.Default", 1, 1, 0, 0, false);
    fs.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.LightAmbEffect.FragSource);

    var program = new L5.Program("L5.DefaultProgram", vs, fs);

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

L5.nameFix(L5.LightAmbEffect, 'LightAmbEffect');
L5.extendFix(L5.LightAmbEffect, L5.VisualEffect);

L5.LightAmbEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 2, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 3, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 4, new L5.LightAttenuationConstant(light));
    return instance;
};
L5.LightAmbEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightAmbEffect();
    return effect.createInstance(light, material);
};

L5.LightAmbEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'uniform mat4 PVWMatrix;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 LightAmbient;',        // c[7]
    'uniform vec4 LightAttenuation;',    // c[8], [constant, linear, quadratic, intensity]
    'varying vec4 vertexColor;',
    'void main(){',
    '\t vec3 la = LightAmbient.rgb * LightAttenuation.w;',
    '\t la = la * MaterialAmbient.rgb + MaterialEmissive.rgb;',
    '\t vertexColor = vec4(la, 1.0);',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightAmbEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    '\t gl_FragColor = vertexColor;',
    '}'
].join("\n");
