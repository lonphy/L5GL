import { default as webgl } from './GLMapping'

export class GLTexture2D {
    constructor(renderer, texture) {
        let gl = renderer.gl;
        let _format = texture.format;
        this.internalFormat = webgl.TextureFormat[_format];

        this.format = webgl.TextureFormat[_format];
        this.type = webgl.TextureType[_format];
        this.hasMipMap = texture.hasMipmaps;

        this.width = texture.width;
        this.height = texture.height;
        this.depth = texture.depth;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0); // 纹理垂直翻转

        // Create a texture structure.
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        let width, height;
        // Create the mipmap level structures.  No image initialization occurs.
        // this.isCompressed = texture.isCompressed();
        // if (this.isCompressed) {
        // for (level = 0; level < levels; ++level) {
        //     width = this.dimension[0][level];
        //     height = this.dimension[1][level];
        //
        //     gl.compressedTexImage2D(
        //         gl.TEXTURE_2D,
        //         level,
        //         this.internalFormat,
        //         width,
        //         height,
        //         0,
        //         this.numLevelBytes[level],
        //         0);
        // }
        //} else {
        gl.texImage2D(
            gl.TEXTURE_2D,             // target
            0,                         // level
            this.internalFormat,       // internalformat
            this.width,      // width
            this.height,      // height
            0,                         // border
            this.format,               // format
            this.type,                 // type
            texture.getData()         // pixels
        );
        if (this.hasMipMap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        //}
    }

    update(renderer, textureUnit, data) {
        let gl = renderer.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(
            gl.TEXTURE_2D,             // target
            0,                         // level
            this.internalFormat,       // internalformat
            this.width,      // width
            this.height,      // height
            0,                         // border
            this.format,               // format
            this.type,                 // type
            data         // pixels
        );
        if (this.hasMipMap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }
    enable(renderer, textureUnit) {
        let gl = renderer.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    disable(renderer, textureUnit) {
        let gl = renderer.gl;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
