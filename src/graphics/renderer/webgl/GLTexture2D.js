import { default as webgl } from './GLMapping';

class GLTexture2D {

    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {Texture2D} texture
     */
    constructor(gl, texture) {
        const _format = texture.format;

        this.internalFormat = webgl.TextureInternalFormat[_format];
        this.format = webgl.TextureFormat[_format];
        this.type = webgl.TextureType[_format];

        this.hasMipMap = texture.hasMipmaps;

        this.width = texture.width;
        this.height = texture.height;
        this.isCompressed = texture.isCompressed();

        this.static = texture.static;

        // Create a texture structure.
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // upload pixel with pbo
        let pbo = gl.createBuffer();
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pbo);
        gl.bufferData(gl.PIXEL_UNPACK_BUFFER, texture.getData(), gl.STATIC_DRAW, 0);
        if (this.isCompressed) {
            gl.compressedTexImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, 0);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, /*level*/0, this.internalFormat, this.width, this.height, 0, this.format, this.type, 0);
        }
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
        gl.deleteBuffer(pbo);
        this.hasMipMap && gl.generateMipmap(gl.TEXTURE_2D);
    }

    update(gl, textureUnit, data) {
        if (this.static) {
            return;
        }
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        let pbo = gl.createBuffer();
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, pbo);
        gl.bufferData(gl.PIXEL_UNPACK_BUFFER, data, gl.STATIC_DRAW, 0);
        if (this.isCompressed) {
            gl.compressedTexImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, 0);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, /*level*/0, this.internalFormat, this.width, this.height, 0, this.format, this.type, 0);
        }
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
        gl.deleteBuffer(pbo);
        this.hasMipMap && gl.generateMipmap(gl.TEXTURE_2D);
    }

    enable(gl, textureUnit) {
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    disable(gl, textureUnit) {
        // gl.activeTexture(gl.TEXTURE0 + textureUnit);
        // gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

export { GLTexture2D };
