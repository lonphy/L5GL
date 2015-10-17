/**
 * Texture2D 底层封装
 * @param renderer
 * @param texture
 * @constructor
 */
L5.GLTexture2D = function (renderer, texture) {
    var gl = renderer.gl;
    var _format = texture.format;
    this.internalFormat = L5.Webgl.TextureFormat[_format];

    this.format = L5.Webgl.TextureFormat[_format];
    this.type = L5.Webgl.TextureType[_format];

    // Create pixel buffer objects to store the texture data.
    var level, levels = texture.numLevels;

    const MAX_MIPMAP_LEVELS = L5.Texture.MAX_MIPMAP_LEVELS;
    this.numLevels = levels;
    this.numLevelBytes = new Array(MAX_MIPMAP_LEVELS);
    this.dimension = [
        new Array(MAX_MIPMAP_LEVELS),
        new Array(MAX_MIPMAP_LEVELS)
    ];

    for (level = 0; level < levels; ++level) {
        this.numLevelBytes[level] = texture.numLevelBytes[level];
        this.dimension[0][level] = texture.getDimension(0, level);
        this.dimension[1][level] = texture.getDimension(1, level);
    }

    // Create a texture structure.
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    var width, height;
    // Create the mipmap level structures.  No image initialization occurs.
    this.isCompressed = texture.isCompressed();
    if (this.isCompressed) {
        for (level = 0; level < levels; ++level) {
            width = this.dimension[0][level];
            height = this.dimension[1][level];

            gl.compressedTexImage2D(
                gl.TEXTURE_2D,
                level,
                this.internalFormat,
                width,
                height,
                0,
                this.numLevelBytes[level],
                0);
        }
    } else {
        for (level = 0; level < levels; ++level) {
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                this.internalFormat,
                this.dimension[0][level],
                this.dimension[1][level],
                0,
                this.format,
                this.type,
                texture.getData(level)
            );
        }
    }
};

/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTexture2D.prototype.enable = function (renderer, textureUnit) {
    var gl = renderer.gl;
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
};
/**
 * @param renderer {L5.Renderer}
 * @param textureUnit {number}
 */
L5.GLTexture2D.prototype.disable = function (renderer, textureUnit) {
};