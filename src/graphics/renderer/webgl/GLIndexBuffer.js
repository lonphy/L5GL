/**
 * IndexBuffer 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param buffer {L5.IndexBuffer}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLIndexBuffer = function (
    renderer, buffer
) {
    var gl      = renderer.gl;
    this.buffer = gl.createBuffer ();
    var dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), L5.Webgl.BufferUsage[buffer.usage]);
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, null);
};
L5.nameFix (L5.GLIndexBuffer, 'GLIndexBuffer');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLIndexBuffer.prototype.enable  = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, this.buffer);
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLIndexBuffer.prototype.disable = function (
    renderer
) {
    var gl = renderer.gl;
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, null);
};