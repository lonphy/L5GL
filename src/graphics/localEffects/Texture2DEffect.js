/**
 * Texture2DEffect 2D纹理效果
 * @param filter {number} 纹理格式， 参考L5.Shader.SF_XXX
 * @param coordinate0 {number} 相当于宽度 参考L5.Shader.SC_XXX
 * @param coordinate1 {number} 相当于高度 参考L5.Shader.SC_XXX
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Texture2DEffect = function (filter, coordinate0, coordinate1) {

    if (!filter) {
        filter = L5.Shader.SF_NEAREST;
    }
    if (!coordinate0) {
        coordinate0 = L5.Shader.SC_CLAMP_EDGE;
    }
    if (!coordinate1) {
        coordinate1 = L5.Shader.SC_CLAMP_EDGE;
    }

    L5.VisualEffect.call(this);

    var vshader = new L5.VertexShader("L5.Texture2D", 2, 2, 1, 0, false);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelTCoord0", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexTCoord", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setProgram(L5.Texture2DEffect.VertextSource);

    var fshader = new L5.FragShader("L5.Texture2D", 1, 1, 0, 1, false);
    fshader.setInput(0, "vertexTCoord", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setSampler(0, "BaseSampler", L5.Shader.ST_2D);
    fshader.setFilter(0, filter);
    fshader.setCoordinate(0, 0, coordinate0);
    fshader.setCoordinate(0, 1, coordinate1);
    fshader.setTextureUnit(0, L5.Texture2DEffect.FragTextureUnit);
    fshader.setProgram(L5.Texture2DEffect.FragSource);

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

L5.nameFix(L5.Texture2DEffect, 'Texture2DEffect');
L5.extendFix(L5.Texture2DEffect, L5.VisualEffect);

/**
 * Any change in sampler state is made via the frag shader.
 * @returns {L5.FragShader}
 */
L5.Texture2DEffect.prototype.getFragShader = function () {
    return L5.VisualEffect.prototype.getFragShader.call(this, 0, 0);
};

/**
 * Create an instance of the effect with unique parameters.
 * If the sampler filter mode is set to a value corresponding to mipmapping,
 * then the mipmaps will be generated if necessary.
 *
 * @params texture {L5.Texture2D}
 * @returns {L5.VisualEffectInstance}
 */
L5.Texture2DEffect.prototype.createInstance = function (texture) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setFragTexture(0, 0, texture);

    var filter = this.getFragShader().getFilter(0);
    if (filter !== L5.Shader.SF_NEAREST && filter != L5.Shader.SF_LINEAR && !texture.hasMipmaps) {
        texture.generateMipmaps();
    }

    return instance;
};

/**
 * Convenience for creating an instance.  The application does not have to
 * create the effect explicitly in order to create an instance from it.
 * @param texture {L5.Texture2D}
 * @param filter {number}
 * @param coordinate0 {number}
 * @param coordinate1 {number}
 * @returns {L5.VisualEffectInstance}
 */
L5.Texture2DEffect.createUniqueInstance = function (texture, filter, coordinate0, coordinate1) {
    var effect = new L5.Texture2DEffect();
    var fshader = effect.getFragShader();
    fshader.setFilter(0, filter);
    fshader.setCoordinate(0, 0, coordinate0);
    fshader.setCoordinate(0, 1, coordinate1);
    return effect.createInstance(texture);
};

L5.Texture2DEffect.VertextSource = [
    'attribute vec3 modelPosition;',
    'attribute vec2 modelTCoord0;',
    'uniform mat4 PVWMatrix;',
    'varying vec2 vertexTCoord;',
    'void main (void) {',
    'gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    'vertexTCoord = modelTCoord0;',
    '}'
].join("\n");
L5.Texture2DEffect.FragTextureUnit = 0;
L5.Texture2DEffect.FragSource = [
    'precision highp float;',
    'uniform sampler2D BaseSampler;',
    'varying vec2 vertexTCoord;',
    'void main (void) {',
    'gl_FragColor = texture2D(BaseSampler, vertexTCoord);',
    '}'
].join("\n");