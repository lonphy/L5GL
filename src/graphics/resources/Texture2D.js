/**
 * Texture2D 2D纹理构造
 * @param format {number} 纹理格式， 参考L5.Texture.TT_XXX
 * @param dimension0 {number} 相当于宽度
 * @param dimension1 {number} 相当于高度
 * @param numLevels {number} 纹理级数 0 为最大值
 * @param usage {number} 用途, 参考L5.Buffer.BU_XXX
 * @class
 * @extends {L5.Texture}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Texture2D = function (format, dimension0, dimension1, numLevels, usage) {
    L5.assert(dimension0 > 0, 'Dimension0 must be positive');
    L5.assert(dimension1 > 0, 'Dimension1 must be positive');

    usage = usage === undefined ? L5.Buffer.BU_TEXTURE : usage;

    L5.Texture.call(this, format, L5.Texture.TT_2D, usage, numLevels);

    this.dimension[0][0] = dimension0;
    this.dimension[1][0] = dimension1;

    var logDim0 = L5.Math.log2OfPowerOfTwo(dimension0 | 0);
    var logDim1 = L5.Math.log2OfPowerOfTwo(dimension1 | 0);
    var maxLevels = (logDim0 >= logDim1 ? logDim0 : logDim1) + 1;

    if (numLevels === 0) {
        this.numLevels = maxLevels;
    } else if (numLevels <= maxLevels) {
        this.numLevels = numLevels;
    } else {
        L5.assert(false, 'Invalid number of levels');
    }

    this.computeNumLevelBytes();
    this.data = new Uint8Array(this.numTotalBytes);
};
L5.nameFix(L5.Texture2D, 'Texture2D');
L5.extendFix(L5.Texture2D, L5.Texture);

Object.defineProperties
(
    L5.Texture2D.prototype,
    {
        // Get the width of the 0 level MipMaps.
        width: {
            get: function () {
                return this.getDimension(0, 0);
            }
        },
        // Get the height of the 0 level MipMaps.
        height: {
            get: function () {
                return this.getDimension(1, 0);
            }
        },
        hasMipmaps: {
            get: function () {
                var logDim0 = L5.Math.log2OfPowerOfTwo(this.dimension[0][0]);
                var logDim1 = L5.Math.log2OfPowerOfTwo(this.dimension[1][0]);
                var maxLevels = (logDim0 >= logDim1 ? logDim0 : logDim1) + 1;

                return this.numLevels === maxLevels;
            }
        }
    }
);
/**
 * 获取纹理数据
 *  返回指定纹理级别以下的所有mipmaps
 * @param level {number} 纹理级别，
 * @returns {ArrayBufferView}
 */
L5.Texture2D.prototype.getData = function (level) {
    if (0 <= level && level < this.numLevels) {
        return this.data.subarray(this.levelOffsets[level],
            this.levelOffsets[level] + this.numLevelBytes[level]);
    }

    L5.assert(false, '[ L5.Texture2D.getData ] \'s param level invalid');
    return null;
};

L5.Texture2D.prototype.generateMipmaps = function () {
    var width = this.dimension[0][0];
    var height = this.dimension[1][0];
    var logDim0 = L5.Math.log2OfPowerOfTwo(width);
    var logDim1 = L5.Math.log2OfPowerOfTwo(height);

    var maxLevels = (logDim0 >= logDim1 ? logDim0 : logDim1) + 1;

    var retainBindings = true;
    if (this.numLevels != maxLevels) {
        retainBindings = false;
        //Renderer.UnbindAll(this);
        this.numLevels = maxLevels;
        this.computeNumLevelBytes();

        var newData = new Uint8Array(this.numTotalBytes);
        newData.set(this.data.slice(0, this.numLevelBytes[0]), 0);
        delete this.data;
        this.data = newData;
    }

    // 临时存储生成的mipmaps.
    var rgba = new Float32Array(width * height * 4),
        levels = this.numLevels;

    var texels = 0;
    var level, widthNext, heightNext, texelsNext;
    for (level = 1; level < levels; ++level) {
        texelsNext = this.levelOffsets[level];
        widthNext = this.dimension[0][level];
        heightNext = this.dimension[1][level];

        this.generateNextMipmap(width, height, texels, widthNext, heightNext, texelsNext, rgba);

        width = widthNext;
        height = heightNext;
        texels = texelsNext;
    }

    if (retainBindings) {
        for (level = 0; level < levels; ++level) {
            L5.Renderer.updateAll(this, level);
        }
    }
};

/**
 * 计算各级纹理需要的字节数
 * @protected
 */
L5.Texture2D.prototype.computeNumLevelBytes = function () {

    var format = this.format;

    switch (format) {
        case L5.Texture.TT_R32F:
        case L5.Texture.TT_G32R32F:
        case L5.Texture.TT_A32B32G32R32F:
            if (this.numLevels > 1) {
                L5.assert(false, 'No mipmaps for 32-bit float textures');
                this.numLevels = 1;
            }
            break;
        case L5.Texture.TT_D24S8:
            if (this.numLevels > 1) {
                L5.assert(false, 'No mipmaps for 2D depth textures');
                this.numLevels = 1;
            }
    }

    this.numTotalBytes = 0;

    var dim0 = this.dimension[0][0],
        dim1 = this.dimension[1][0],
        m = this.numLevels,
        level, max0, max1;


    if (format === L5.Texture.TT_DXT1) {
        for (level = 0; level < m; ++level) {
            max0 = dim0 / 4;
            if (max0 < 1) {
                max0 = 1;
            }
            max1 = dim1 / 4;
            if (max1 < 1) {
                max1 = 1;
            }

            this.numLevelBytes[level] = 8 * max0 * max1;
            this.numTotalBytes += this.numLevelBytes[level];
            this.dimension[0][level] = dim0;
            this.dimension[1][level] = dim1;
            this.dimension[2][level] = 1;

            if (dim0 > 1) {
                dim0 >>= 1;
            }
            if (dim1 > 1) {
                dim1 >>= 1;
            }
        }
    }
    else if (format === L5.Texture.TT_DXT3 || format === L5.Texture.TT_DXT5) {
        for (level = 0; level < m; ++level) {
            max0 = dim0 / 4;
            if (max0 < 1) {
                max0 = 1;
            }
            max1 = dim1 / 4;
            if (max1 < 1) {
                max1 = 1;
            }

            this.numLevelBytes[level] = 16 * max0 * max1;
            this.numTotalBytes += this.numLevelBytes[level];
            this.dimension[0][level] = dim0;
            this.dimension[1][level] = dim1;
            this.dimension[2][level] = 1;

            if (dim0 > 1) {
                dim0 >>= 1;
            }
            if (dim1 > 1) {
                dim1 >>= 1;
            }
        }
    }
    else {
        var pixelSize = L5.Texture.PIXEL_SIZE[format];
        for (level = 0; level < m; ++level) {
            this.numLevelBytes[level] = pixelSize * dim0 * dim1;
            this.numTotalBytes += this.numLevelBytes[level];
            this.dimension[0][level] = dim0;
            this.dimension[1][level] = dim1;
            this.dimension[2][level] = 1;

            if (dim0 > 1) {
                dim0 >>= 1;
            }
            if (dim1 > 1) {
                dim1 >>= 1;
            }
        }
    }

    this.levelOffsets[0] = 0;
    for (level = 0, --m; level < m; ++level) {
        this.levelOffsets[level + 1] = this.levelOffsets[level] + this.numLevelBytes[level];
    }
};

/**
 *
 * @param width {number}
 * @param height {number}
 * @param texels {ArrayBuffer}
 * @param widthNext {number}
 * @param heightNext {number}
 * @param texelsNext {number}
 * @param rgba {Array<number>}
 * @protected
 */
L5.Texture2D.prototype.generateNextMipmap = function (width, height, texels,
                                                      widthNext, heightNext, texelsNext,
                                                      rgba) {
    var numTexels = width * height;
    var pixelSize = L5.Texture.PIXEL_SIZE[this.format];
    // 转换纹理元素到32bitRGBA
    L5.Texture.COLOR_FROM_FUNC[this.format](numTexels, this.data.subarray(texels, texels + numTexels * pixelSize),
        rgba);

    var i1, i0, j, c, base;
    // Create the next miplevel in-place.
    for (i1 = 0; i1 < heightNext; ++i1) {
        for (i0 = 0; i0 < widthNext; ++i0) {
            j = i0 + widthNext * i1;
            base = 2 * (i0 + width * i1);
            for (c = 0; c < 4; ++c) {
                rgba[j * 4 + c] = 0.25 * (
                        rgba[base * 4 + c] +
                        rgba[(base + 1) * 4 + c] +
                        rgba[(base + width) * 4 + c] +
                        rgba[(base + width + 1) * 4 + c]
                    );
            }
        }
    }

    var numTexelsNext = widthNext * heightNext;
    // 从32bit-RGBA转换成原始格式, subArray使用的是指针
    L5.Texture.COLOR_TO_FUNC[this.format](numTexelsNext, rgba,
        this.data.subarray(texelsNext, (texelsNext + numTexelsNext * pixelSize)));
};

L5.Texture2D.loadWMTF = function (name, mode) {
    return L5.Texture.loadWMTF(name, mode).then(function (texture) {
        if (texture && texture instanceof L5.Texture2D) {
            return texture;
        }
        return null;
    });
};