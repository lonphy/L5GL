import { default as webgl } from './GLMapping';

class GLTexture2DArray {

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Texture2DArray} texture
     */
    constructor(gl, texture) {
    }

    update(gl, textureUnit, data) {
    }

    enable(gl, textureUnit) {
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
    }

    disable(gl, textureUnit) {
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    }
}

export { GLTexture2DArray };
