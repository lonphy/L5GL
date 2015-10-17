/**
 * 材质效果着色器
 * @constructor
 * @extends {L5.VisualEffect}
 */
L5.MaterialEffect = function () {
    L5.VisualEffect.call(this);

    var vs = new L5.VertexShader("L5.Material", 1, 2, 2, 0);
    vs.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);

    vs.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vs.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);

    vs.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vs.setConstant(1, "MaterialDiffuse", L5.Shader.VT_VEC4);

    vs.setProgram(L5.MaterialEffect.VertextSource);

    var fs = new L5.FragShader("L5.Material", 1, 1, 0, 0);
    fs.setInput(0, "vectexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fs.setProgram(L5.MaterialEffect.FragSource);

    var program = new L5.Program("L5.MaterialProgram", vs, fs);

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

L5.nameFix(L5.MaterialEffect, 'MaterialEffect');
L5.extendFix(L5.MaterialEffect, L5.VisualEffect);

/**
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.MaterialEffect.prototype.createInstance = function (material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.MaterialDiffuseConstant(material));
    return instance;
};

/**
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.MaterialEffect.createUniqueInstance = function (material) {
    var effect = new L5.MaterialEffect();
    return effect.createInstance(material);
};

L5.MaterialEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'uniform mat4 PVWMatrix;',
    'uniform vec4 MaterialDiffuse;',
    'varying vec4 vertexColor;',
    'void main(){',
    '\t gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '\t vertexColor = MaterialDiffuse;',
    '}'
].join("\n");

L5.MaterialEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    '\t gl_FragColor = vertexColor;',
    '}'
].join("\n");
