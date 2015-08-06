/**
 * FragShader 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param shader {L5.VertexShader}
 * @class
 * @extends {L5.GLShader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLFragShader = function (
    renderer, shader
) {
    L5.GLShader.call(this);
    var gl      = renderer.gl;
    this.shader = gl.createShader(gl.FRAGMENT_SHADER);

    var programText = shader.getProgram(L5.FragShader.profile);

    gl.shaderSource(this.shader, programText);
    gl.compileShader(this.shader);

    L5.assert(
        !gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
        gl.getShaderInfoLog(this.shader)
    );
};
L5.nameFix (L5.GLFragShader, 'GLFragShader');
L5.extendFix(L5.GLFragShader, L5.GLShader);

/**
 * @param shader {L5.FragShader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLFragShader.prototype.enable  = function (
    renderer, shader, parameters
) {
    var gl = renderer.gl;

    // Set the shader constants.
    var profile = L5.FragShader.profile;
    gl.useProgram(this.shader.getProgram(profile));


    this.setSamplerState(renderer, shader, profile, parameters, renderer.data.maxFShaderImages, renderer.data.currentSS);
};
/**
 * @param shader {L5.FragShader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLFragShader.prototype.disable = function (
    renderer, shader, parameters
) {
    var gl = renderer.gl;
    var profile = L5.FragShader.profile;
    this.disableTextures(renderer, shader, profile, parameters, renderer.data.maxFShaderImages);
    gl.useProgram(null);
};