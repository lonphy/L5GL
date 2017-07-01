import { default as webgl } from './GLMapping';

class GLVertexArray {

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {VertexBuffer} buffer
     * @param {GLVertexFormat} format
     */
    constructor(gl, buffer, format) {
        this.vao = gl.createVertexArray();
        this.buffer = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        this._upload(gl, buffer, format);
        /*gl.bindVertexArray(null);*/
    }

    _upload(gl, buffer, format) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.getData(), webgl.BufferUsage[buffer.usage]);
        format.enable(gl);
    }

    enable(gl) { gl.bindVertexArray(this.vao); }

    disable(gl) { /*gl.bindVertexArray(null);*/ }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {VertexBuffer} buffer
     * @param {GLVertexFormat} format
     */
    update(gl, buffer, format) {
        gl.bindVertexArray(this.vao);
        this._upload(gl, buffer, format);
        gl.bindVertexArray(0);
    }

    destructor() {
        gl.deleteVertexArray(this.vao);
    }
}

export { GLVertexArray };