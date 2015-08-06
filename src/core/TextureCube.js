/**
 * TextureCube 立方纹理构造
 * @param format {number} 纹理格式， 参考L5.Texture.TT_XXX
 * @param dimension {number} 相当于宽度、高度， 宽=高
 * @param numLevels {number} 纹理级数 0 为最大值
 * @param usage {number} 用途, 参考L5.BU_XXX
 * @class
 * @extends {L5.Texture}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TextureCube                   = function (
    format, dimension, numLevels, usage
) {
    L5.assert (dimension > 0, 'Dimension0 must be positive');

    usage = usage === undefined ? L5.Buffer.BU_TEXTURE : usage;

    L5.Texture.call (this, format, L5.Texture.TT_CUBE, usage, numLevels);

    this.dimension[ 0 ][ 0 ] = dimension;
    this.dimension[ 1 ][ 0 ] = dimension;

    var maxLevels = 1 + L5.Math.log2OfPowerOfTwo (dimension | 0);

    if (numLevels === 0) {
        this.numLevels = maxLevels;
    }
    else if (numLevels <= maxLevels) {
        this.numLevels = numLevels;
    }
    else {
        L5.assert (false, "Invalid number of levels\n");
    }

    this.computeNumLevelBytes ();
    this.data     = new Uint8Array (this.numTotalBytes);
};

L5.nameFix (L5.TextureCube, 'TextureCube');
L5.extendFix (L5.TextureCube, L5.Texture);

Object.defineProperties
(
    L5.TextureCube.prototype,
    {
        width     : {
            get: function () {
                return this.getDimension (0, 0);
            }
        },
        height    : {
            get: function () {
                return this.getDimension (1, 0);
            }
        },
        hasMipmaps: {
            get: function () {
                var logDim = L5.Math.log2OfPowerOfTwo (this.dimension[ 0 ][ 0 ]);
                return this.numLevels === (logDim + 1);
            }
        }
    }
);
/**
 * 获取纹理数据
 *  返回指定纹理级别以下的所有mipmaps
 * @param face {number} 纹理级别，
 * @param level {number} 纹理级别，
 * @returns {ArrayBuffer}
 */
L5.TextureCube.prototype.getData = function (face, level) {
    if (0 <= level && level < this.numLevels) {
        var faceOffset = face * this.numTotalBytes / 6;
        var start      = faceOffset + this.levelOffsets[ level ];
        var end        = start + this.numLevelBytes[ level ];
        return this.data.subarray (start, end);
    }

    L5.assert (false, "[ L5.TextureCube.getData ] 's param level invalid \n");
    return null;
};

L5.TextureCube.prototype.generateMipmaps = function () {

    var dim                                               = this.dimension[ 0 ][ 0 ],
        maxLevels                                         = L5.Math.log2OfPowerOfTwo (dim) + 1,
        face, faceOffset, faceSize, level, retainBindings = true;

    if (this.numLevels != maxLevels) {
        retainBindings = false;
        //Renderer.UnbindAll(this);
        this.numLevels       = maxLevels;
        var oldNumTotalBytes = this.numTotalBytes / 6;
        this.computeNumLevelBytes ();

        var newData = new Uint8Array (this.numTotalBytes);
        faceSize    = this.numTotalBytes / 6;
        for (face = 0; face < 6; ++face) {
            var oldFaceOffset = face * oldNumTotalBytes;
            faceOffset        = face * faceSize;
            newData.set (this.data.subarray (oldFaceOffset, this.numLevelBytes[ 0 ]), faceOffset);
        }
        delete this.data;
        this.data = newData;
    }

    // 临时存储生成的mipmaps.
    var rgba   = new Float32Array (dim * dim * 4),
        levels = this.numLevels,
        texels, texelsNext, dimNext;
    faceSize   = this.numTotalBytes / 6;

    for (face = 0; face < 6; ++face) {
        faceOffset = face * faceSize;
        texels     = faceOffset;

        for (level = 1; level < levels; ++level) {
            texelsNext = faceOffset + this.levelOffsets[ level ];
            dimNext    = this.dimension[ 0 ][ level ];
            this.generateNextMipmap (dim, texels, dimNext, texelsNext, rgba);
            dim        = dimNext;
            texels     = texelsNext;
        }
    }

    if (retainBindings) {
        for (face = 0; face < 6; ++face) {
            for (level = 0; level < levels; ++level) {
                L5.Renderer.updateAll (this, face, level);
            }
        }
    }
};

/**
 * 计算各级纹理需要的字节数
 * @protected
 */
L5.TextureCube.prototype.computeNumLevelBytes = function () {

    var format = this.format;

    switch (format) {
        case L5.Texture.TT_R32F:
        case L5.Texture.TT_G32R32F:
        case L5.Texture.TT_A32B32G32R32F:
            if (this.numLevels > 1) {
                L5.assert (false, 'No mipmaps for 32-bit float textures');
                this.numLevels = 1;
            }
            break;
        case L5.Texture.TT_D24S8:
            if (this.numLevels > 1) {
                L5.assert (false, 'No mipmaps for 2D depth textures');
                this.numLevels = 1;
            }
    }
    this.numTotalBytes = 0;

    var dim = this.dimension[ 0 ][ 0 ],
        m   = this.numLevels,
        level, max;


    if (format === L5.Texture.TT_DXT1) {
        for (level = 0; level < m; ++level) {
            max = dim / 4;
            if (max < 1) {
                max = 1;
            }

            this.numLevelBytes[ level ]  = 8 * max * max;
            this.numTotalBytes += this.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = dim;
            this.dimension[ 1 ][ level ] = dim;

            if (dim > 1) {
                dim >>= 1;
            }
        }
    }
    else if (format === L5.Texture.TT_DXT3 || format === L5.Texture.TT_DXT5) {
        for (level = 0; level < m; ++level) {
            max = dim / 4;
            if (max < 1) {
                max = 1;
            }

            this.numLevelBytes[ level ]  = 16 * max * max;
            this.numTotalBytes += this.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = dim;
            this.dimension[ 1 ][ level ] = dim;

            if (dim > 1) {
                dim >>= 1;
            }
        }
    }
    else {
        var pixelSize = L5.Texture.PIXEL_SIZE[ format ];
        for (level = 0; level < m; ++level) {
            this.numLevelBytes[ level ]  = pixelSize * dim * dim;
            this.numTotalBytes += this.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = dim;
            this.dimension[ 1 ][ level ] = dim;

            if (dim > 1) {
                dim >>= 1;
            }
        }
    }

    this.numTotalBytes *= 6;

    this.levelOffsets[ 0 ] = 0;
    for (level = 0, --m; level < m; ++level) {
        this.levelOffsets[ level + 1 ] = this.levelOffsets[ level ] + this.numLevelBytes[ level ];
    }
};

/**
 *
 * @param dim {number}
 * @param texels {ArrayBuffer}
 * @param dimNext {number}
 * @param texelsNext {number}
 * @param rgba {ArrayBuffer}
 * @protected
 */
L5.TextureCube.prototype.generateNextMipmap = function (
    dim, texels,
    dimNext, texelsNext,
    rgba
) {
    var numTexels = dim * dim,
        format    = this.format;
    var pixelSize = L5.Texture.PIXEL_SIZE[ format ];
    // 转换纹理元素到32bitRGBA
    L5.Texture.COLOR_FROM_FUNC[ format ] (numTexels, this.data.subarray (texels, texels + numTexels * pixelSize), rgba);

    var i1, i0, j, c, base;
    // Create the next miplevel in-place.
    for (i1 = 0; i1 < dimNext; ++i1) {
        for (i0 = 0; i0 < dimNext; ++i0) {
            j    = i0 + dimNext * i1;
            base = 2 * (i0 + dim * i1);
            for (c = 0; c < 4; ++c) {
                rgba[ j * 4 + c ] = 0.25 * (
                        rgba[ base * 4 + c ] +
                        rgba[ (base + 1) * 4 + c ] +
                        rgba[ (base + dim) * 4 + c ] +
                        rgba[ (base + dim + 1) * 4 + c ]
                    );
            }
        }
    }

    var numTexelsNext = dimNext * dimNext;
    // 从32bit-RGBA转换成原始格式, subArray使用的是指针
    L5.Texture.COLOR_TO_FUNC[ format ] (numTexelsNext, rgba,
        this.data.subarray (texelsNext, (texelsNext + numTexelsNext * pixelSize)));
};