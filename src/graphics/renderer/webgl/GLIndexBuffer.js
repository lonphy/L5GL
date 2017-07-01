import { default as webgl } from './GLMapping';

class GLIndexBuffer {

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Buffer} buffer 
     */
    constructor(gl, buffer) {
        this.buffer = gl.createBuffer();
        let dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), webgl.BufferUsage[buffer.usage]);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    enable(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    update(gl, buffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        let dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), webgl.BufferUsage[buffer.usage]);
    }
    /**
     * @param {WebGL2RenderingContext} gl
     */
    disable(renderer) {
        /*gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);*/
    }
}

export { GLIndexBuffer };