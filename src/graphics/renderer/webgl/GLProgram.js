/**
 * Program 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param program {L5.Program}
 * @param vs {L5.GLVertexShader}
 * @param fs {L5.GLFragShader}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLProgram = function (renderer, program, vs, fs) {
    var gl = renderer.gl;
    var p = gl.createProgram();
    gl.attachShader(p, vs.shader);
    gl.attachShader(p, fs.shader);
    gl.linkProgram(p);
    L5.assert(
        gl.getProgramParameter(p, gl.LINK_STATUS),
        gl.getProgramInfoLog(p)
    );
    this.program = p;
    gl.useProgram(p);
    var attributesLength = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES),
        uniformsLength = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS),
        item, name, i;

    for (i = 0; i < attributesLength; ++i) {
        item = gl.getActiveAttrib(p, i);
        name = item.name;
        program.inputMap.set(name, gl.getAttribLocation(p, name));
    }

    for (i = 0; i < uniformsLength; ++i) {
        item = gl.getActiveUniform(p, i);
        name = item.name;
        program.inputMap.set(name, gl.getUniformLocation(p, name));
    }
};
L5.nameFix(L5.GLProgram, 'GLProgram');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLProgram.prototype.free = function (renderer) {
    renderer.gl.deleteProgram(this.program);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLProgram.prototype.enable = function (renderer) {
    renderer.gl.useProgram(this.program);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLProgram.prototype.disable = function (renderer) {
    //renderer.gl.useProgram(null);
};