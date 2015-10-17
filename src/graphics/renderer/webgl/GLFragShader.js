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

    var programText = shader.getProgram();

    gl.shaderSource(this.shader, programText);
    gl.compileShader(this.shader);

    L5.assert(
        gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
        gl.getShaderInfoLog(this.shader)
    );
};
L5.nameFix (L5.GLFragShader, 'GLFragShader');
L5.extendFix(L5.GLFragShader, L5.GLShader);

/**
 * 释放持有的GL资源
 *
 * @param gl {WebGLRenderingContext}
 */
L5.GLFragShader.prototype.free = function (gl) {
    gl.deleteShader(this.shader);
    delete this.shader;
};

/**
 * @param shader {L5.FragShader}
 * @param mapping {Map}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 */
L5.GLFragShader.prototype.enable  = function (renderer, mapping, shader, parameters
) {
    var gl = renderer.gl;
    // step1. 遍历顶点着色器常量
    var numConstants = shader.numConstants;
    for (var i = 0; i < numConstants; ++i) {
        var locating = mapping.get(shader.getConstantName(i));
        var funcName = shader.getConstantFuncName(i);
        var data = parameters.getConstant(i).data;
        if (data.length > 4) {
            gl[funcName](locating, false, data);
        } else {
            gl[funcName](locating, data);
        }
    }

    this.setSamplerState(renderer, shader, parameters, renderer.data.maxFShaderImages, renderer.data.currentSS);
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
    this.disableTexture(renderer, shader, parameters, renderer.data.maxFShaderImages);
};