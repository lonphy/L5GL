/**
 * 颜色缓冲 - 效果
 *
 * @class
 * @extends {L5.VisualEffect}
 */
L5.VertexColor3Effect = function () {
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.VertexColor3", 2, 2, 1, 0, false);

    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vs.setInput(0, "modelColor", L5.Shader.VT_VEC3, L5.Shader.VS_COLOR0);
    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setProgram(L5.VertexColor3Effect.VertextSource);

    var fs = new L5.FragShader("L5.VertexColor3", 1, 1, 0, 0, false);
    fs.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.VertexColor3Effect.FragSource);

    var program = new L5.Program("L5.VertexColor3Program", vs, fs);

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

L5.nameFix(L5.VertexColor3Effect, 'VertexColor3Effect');
L5.extendFix(L5.VertexColor3Effect, L5.VisualEffect);

L5.VertexColor3Effect.prototype.createInstance = function () {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    return instance;
};

L5.VertexColor3Effect.createUniqueInstance = function () {
    var effect = new L5.VertexColor3Effect();
    return effect.createInstance();
};

L5.VertexColor3Effect.VertextSource = [
    'attribute vec3 modelPosition;',
    'attribute vec3 modelColor;',
    'uniform mat4 PVWMatrix;',
    'varying vec3 vertexColor;',
    'void main(){',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '\t vertexColor = modelColor;',
    '\t gl_PointSize = 1.0;',
    '}'
].join("\n");

L5.VertexColor3Effect.FragSource = [
    'precision highp float;',
    'varying vec3 vertexColor;',
    'void main (void) {',
    '\t gl_FragColor = vec4(vertexColor, 1.0);',
    '}'
].join("\n");