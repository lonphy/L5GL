import { default as webgl } from './GLMapping';

class GLSampler {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {SamplerState} sampler
     */
    constructor(gl, sampler) {
        this.minFilter = sampler.minFilter;
		this.magFilter = sampler.magFilter;

		this.wrapS = sampler.wrapS;
		this.wrapT = sampler.wrapT;
		this.wrapR = sampler.wrapR;
		
        this.compare = sampler.compare;
		this.mode = sampler.mode;

		this.maxAnisotropy = sampler.maxAnisotropy;
		this.minLod = sampler.minLod;
		this.maxLod = sampler.maxLod;

        this.sampler = gl.createSampler();
        if (this.minFilter !== gl.NEAREST_MIPMAP_LINEAR) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_FILTER, this.minFilter);
        }
        if (this.magFilter !== gl.LINEAR) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_MAG_FILTER, this.magFilter);
        }

        if (this.wrapS !== gl.REPEAT) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_S, this.wrapS);
        }
        if (this.wrapT !== gl.REPEAT) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_T, this.wrapT);
        }
        if (this.wrapR !== gl.REPEAT) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_R, this.wrapR);
        }

        if (this.compare !== gl.LEQUAL) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_COMPARE_FUNC, this.compare);
        }
        if (this.mode !== gl.NONE) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_COMPARE_MODE, this.mode);
        }
        
        if (this.minLod !== gl.getSamplerParameter(this.sampler, gl.TEXTURE_MIN_LOD)) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_LOD, this.minLod);
        }
        if (this.maxLod !== gl.getSamplerParameter(this.sampler, gl.TEXTURE_MAX_LOD)) {
            gl.samplerParameteri(this.sampler, gl.TEXTURE_MAX_LOD, this.maxLod);
        }
    }

    enable(gl, textureUnit) {
        gl.bindSampler(textureUnit, this.sampler);
    }
    
    /**
     * Get the state of the currently enabled texture.  This state appears
     * to be associated with the OpenGL texture object.  How does this
     * relate to the sampler state?  In my opinion, OpenGL needs to have
     * the sampler state separate from the texture object state.
     *
     * @param {Renderer} renderer
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
        this.wrap[2] = gl.getTexParameter(target, gl.TEXTURE_WRAP_R);
    }
}

export { GLSampler };
