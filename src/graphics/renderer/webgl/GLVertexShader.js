/**
 * VertexShader 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param shader {L5.VertexShader}
 * @class
 * @extends {L5.GLShader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLVertexShader = function (
    renderer, shader
) {
    L5.GLShader.call(this);
    var gl      = renderer.gl;
    this.shader = gl.createShader(gl.VERTEX_SHADER);

    var programText = shader.getProgram(L5.VertexShader.profile);

    gl.shaderSource(this.shader, programText);
    gl.compileShader(this.shader);

    L5.assert(
        !gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
        gl.getShaderInfoLog(this.shader)
    );
};
L5.nameFix (L5.GLVertexShader, 'GLVertexShader');
L5.extendFix(L5.GLVertexShader, L5.GLShader);

/**
 * @param shader {L5.VertexShader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLVertexShader.prototype.enable  = function (
    renderer, shader, parameters
) {
    var gl = renderer.gl;

    // Set the shader constants.
    var profile = L5.VertexShader.profile;
    gl.useProgram(this.shader.getProgram(profile));


    this.setSamplerState(renderer, shader, profile, parameters, renderer.data.maxVShaderImages, renderer.data.currentSS);
};
/**
 * @param shader {L5.VertexShader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLVertexShader.prototype.disable = function (
    renderer, shader, parameters
) {
    var gl = renderer.gl;
    var profile = L5.VertexShader.profile;
    this.disableTextures(renderer, shader, profile, parameters, renderer.data.maxVShaderImages);
    gl.useProgram(null);
};