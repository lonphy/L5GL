/**
 * VertexBuffer 底层包装
 *
 * @author lonphy
 * @version 2.0
 */
import {default as webgl} from './GLMapping'

export class GLVertexBuffer {

    /**
     * @param {Renderer} renderer 
     * @param {VertexBuffer} buffer
     */
    constructor(renderer, buffer) {
        let gl      = renderer.gl;
        this.buffer = gl.createBuffer ();
        gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData (gl.ARRAY_BUFFER, buffer.getData (), webgl.BufferUsage[ buffer.usage ]);
        gl.bindBuffer (gl.ARRAY_BUFFER, null);
    }

    /**
     * @param {Renderer} renderer 
     */
    enable (renderer) {
        let gl = renderer.gl;
        gl.bindBuffer (gl.ARRAY_BUFFER, this.buffer);
    }

    /**
     * @param {Renderer} renderer 
     */
    disable (renderer) {
        let gl = renderer.gl;
        gl.bindBuffer (gl.ARRAY_BUFFER, null);
    }

    /**
     * @param {Renderer} renderer 
     * @param {VertexBuffer} buffer 
     */
    update (renderer, buffer) {
        let gl = renderer.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.getData(), webgl.BufferUsage[buffer.usage]);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
