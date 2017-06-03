/**
 * IndexBuffer 底层包装
 *
 * @author lonphy
 * @version 2.0
 */
import {default as webgl} from './GLMapping'

export class GLIndexBuffer {

    /**
     * @param {Renderer} renderer 
     * @param {Buffer} buffer 
     */
    constructor(renderer, buffer) {
        let gl = renderer.gl;
        this.buffer = gl.createBuffer();
        let dataType = buffer.elementSize == 2 ? Uint16Array : Uint32Array;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new dataType(buffer.getData().buffer), webgl.BufferUsage[buffer.usage]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * @param {Renderer} renderer
     */
    enable(renderer) {
        let gl = renderer.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
    /**
     * @param {Renderer} renderer
     */
    disable(renderer) {
        let gl = renderer.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}
