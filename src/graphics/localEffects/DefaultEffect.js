/**
 * 默认效果着色器
 * @constructor
 * @extends {L5.VisualEffect}
 */
L5.DefaultEffect = function () {
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.Default", 1, 1, 1, 0, false);
    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setProgram(L5.DefaultEffect.VertextSource);

    var fs = new L5.FragShader("L5.Default", 0, 1, 0, 0, false);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.DefaultEffect.FragSource);

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

L5.nameFix(L5.DefaultEffect, 'DefaultEffect');
L5.extendFix(L5.DefaultEffect, L5.VisualEffect);

L5.DefaultEffect.prototype.createInstance = function () {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    return instance;
};

L5.DefaultEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'uniform mat4 PVWMatrix;',
    'void main(){',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.DefaultEffect.FragSource = [
    'precision highp float;',
    'void main (void) {',
    '\t gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);',
    '}'
].join("\n");
