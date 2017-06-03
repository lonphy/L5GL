/**
 * SamplerState 采样器状态
 * 
 * @author lonphy
 * @version 2.0
 */
import {default as webgl} from './GLMapping'

export class GLSamplerState {
    constructor() {
        this.anisotropy = 1;
        this.magFilter = webgl.LINEAR;
        this.minFilter = webgl.NEAREST_MIPMAP_LINEAR;
        this.wrap = [webgl.REPEAT,webgl.REPEAT,webgl.REPEAT];
    }
    /**
     * Get the state of the currently enabled texture.  This state appears
     * to be associated with the OpenGL texture object.  How does this
     * relate to the sampler state?  In my opinion, OpenGL needs to have
     * the sampler state separate from the texture object state.
     *
     * @param renderer {L5.Renderer}
     * @param target
     */
    getCurrent(renderer, target) {
        let gl = renderer.gl;

        // EXT_Texture_Filter_Anisotropic
        this.anisotropy = gl.getTexParameter(target, webgl.TEXTURE_MAX_ANISOTROPY_EXT);

        this.magFilter = gl.getTexParameter(target, gl.TEXTURE_MAG_FILTER);
        this.minFilter = gl.getTexParameter(target, gl.TEXTURE_MIN_FILTER);
        this.wrap[0] = gl.getTexParameter(target, gl.TEXTURE_WRAP_S);
        this.wrap[1] = gl.getTexParameter(target, gl.TEXTURE_WRAP_T);

        // WebGL 2.0
        // this.wrap[2] = gl.getTexParameter(target, gl.TEXTURE_WRAP_R);
    }
}
