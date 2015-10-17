/**
 * VertexBuffer 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param buffer {L5.VertexBuffer}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLVertexBuffer = function (
    renderer, buffer
) {
    var gl      = renderer.gl;
    this.buffer = gl.createBuffer ();
    gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData (gl.ARRAY_BUFFER, buffer.getData (), L5.Webgl.BufferUsage[ buffer.usage ]);
    gl.bindBuffer (gl.ARRAY_BUFFER, null);
};
L5.nameFix (L5.GLVertexBuffer, 'GLVertexBuffer');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexBuffer.prototype.enable  = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexBuffer.prototype.disable = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ARRAY_BUFFER, null);
};

/**
 * @param renderer {L5.Renderer}
 * @param buffer {L5.VertexBuffer}
 */
L5.GLVertexBuffer.prototype.update = function (renderer, buffer) {
    var gl = renderer.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer.getData(), L5.Webgl.BufferUsage[buffer.usage]);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};