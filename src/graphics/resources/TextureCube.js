/**
 * TextureCube 立方纹理构造
 * @param format {number} 纹理格式， 参考L5.Texture.TT_XXX
 * @param dimension {number} 相当于宽度、高度， 宽=高
 * @param numLevels {number} 纹理级数 0 为最大值
 *
 * @author lonphy
 * @version 1.0
 */
import {Texture} from './Texture'
import {_Math} from '../../math/index'

export class TextureCube extends Texture {
    constructor(format, dimension, numLevels) {
        console.assert(dimension > 0, 'Dimension0 must be positive');
        super(format, Texture.TT_CUBE, numLevels);
        this.dimension[0][0] = dimension;
        this.dimension[1][0] = dimension;

        let maxLevels = 1 + _Math.log2OfPowerOfTwo(dimension | 0);

        if (numLevels === 0) {
            this.numLevels = maxLevels;
        }
        else if (numLevels <= maxLevels) {
            this.numLevels = numLevels;
        }
        else {
            console.assert(false, "Invalid number of levels\n");
        }

        this.computeNumLevelBytes();
        this.data = new Uint8Array(this.numTotalBytes);
    }

    get width() {
        return this.getDimension(0, 0);
    }

    get height() {
        return this.getDimension(1, 0);
    }

    get hasMipmaps() {
        let logDim = _Math.log2OfPowerOfTwo(this.dimension[0][0]);
        return this.numLevels === (logDim + 1);
    }


    /**
     * 获取纹理数据
     *  返回指定纹理级别以下的所有mipmaps
     * @param face {number} 纹理级别，
     * @param level {number} 纹理级别，
     * @returns {Uint8Array}
     */
    getData(face, level) {
        if (0 <= level && level < this.numLevels) {
            let faceOffset = face * this.numTotalBytes / 6;
            let start = faceOffset + this.levelOffsets[level];
            let end = start + this.numLevelBytes[level];
            return this.data.subarray(start, end);
        }

        console.assert(false, "[ TextureCube.getData ] 's param level invalid \n");
        return null;
    }

    generateMipmaps() {

        let dim = this.dimension[0][0],
            maxLevels = _Math.log2OfPowerOfTwo(dim) + 1,
            face, faceOffset, faceSize, level, retainBindings = true;

        if (this.numLevels != maxLevels) {
            retainBindings = false;
            //Renderer.UnbindAll(this);
            this.numLevels = maxLevels;
            let oldNumTotalBytes = this.numTotalBytes / 6;
            this.computeNumLevelBytes();

            let newData = new Uint8Array(this.numTotalBytes);
            faceSize = this.numTotalBytes / 6;
            for (face = 0; face < 6; ++face) {
                let oldFaceOffset = face * oldNumTotalBytes;
                faceOffset = face * faceSize;
                newData.set(this.data.subarray(oldFaceOffset, this.numLevelBytes[0]), faceOffset);
            }
            delete this.data;
            this.data = newData;
        }

        // 临时存储生成的mipmaps.
        let rgba = new Float32Array(dim * dim * 4),
            levels = this.numLevels,
            texels, texelsNext, dimNext;
        faceSize = this.numTotalBytes / 6;

        for (face = 0; face < 6; ++face) {
            faceOffset = face * faceSize;
            texels = faceOffset;

            for (level = 1; level < levels; ++level) {
                texelsNext = faceOffset + this.levelOffsets[level];
                dimNext = this.dimension[0][level];
                this.generateNextMipmap(dim, texels, dimNext, texelsNext, rgba);
                dim = dimNext;
                texels = texelsNext;
            }
        }

        if (retainBindings) {
            for (face = 0; face < 6; ++face) {
                for (level = 0; level < levels; ++level) {
                    Renderer.updateAll(this, face, level);
                }
            }
        }
    }

    /**
     * 计算各级纹理需要的字节数
     * @protected
     */
    computeNumLevelBytes() {

        let format = this.format;

        switch (format) {
            case Texture.TT_R32F:
            case Texture.TT_G32R32F:
            case Texture.TT_A32B32G32R32F:
                if (this.numLevels > 1) {
                    console.assert(false, 'No mipmaps for 32-bit float textures');
                    this.numLevels = 1;
                }
                break;
            case Texture.TT_D24S8:
                if (this.numLevels > 1) {
                    console.assert(false, 'No mipmaps for 2D depth textures');
                    this.numLevels = 1;
                }
        }
        this.numTotalBytes = 0;

        let dim = this.dimension[0][0],
            m = this.numLevels,
            level, max;


        if (format === Texture.TT_DXT1) {
            for (level = 0; level < m; ++level) {
                max = dim / 4;
                if (max < 1) {
                    max = 1;
                }

                this.numLevelBytes[level] = 8 * max * max;
                this.numTotalBytes += this.numLevelBytes[level];
                this.dimension[0][level] = dim;
                this.dimension[1][level] = dim;

                if (dim > 1) {
                    dim >>= 1;
                }
            }
        }
        else if (format === Texture.TT_DXT3 || format === Texture.TT_DXT5) {
            for (level = 0; level < m; ++level) {
                max = dim / 4;
                if (max < 1) {
                    max = 1;
                }

                this.numLevelBytes[level] = 16 * max * max;
                this.numTotalBytes += this.numLevelBytes[level];
                this.dimension[0][level] = dim;
                this.dimension[1][level] = dim;

                if (dim > 1) {
                    dim >>= 1;
                }
            }
        }
        else {
            let pixelSize = Texture.PIXEL_SIZE[format];
            for (level = 0; level < m; ++level) {
                this.numLevelBytes[level] = pixelSize * dim * dim;
                this.numTotalBytes += this.numLevelBytes[level];
                this.dimension[0][level] = dim;
                this.dimension[1][level] = dim;

                if (dim > 1) {
                    dim >>= 1;
                }
            }
        }

        this.numTotalBytes *= 6;

        this.levelOffsets[0] = 0;
        for (level = 0, --m; level < m; ++level) {
            this.levelOffsets[level + 1] = this.levelOffsets[level] + this.numLevelBytes[level];
        }
    }

    /**
     *
     * @param dim {number}
     * @param texels {ArrayBuffer}
     * @param dimNext {number}
     * @param texelsNext {number}
     * @param rgba {ArrayBuffer}
     * @protected
     */
    generateNextMipmap(dim, texels,
                       dimNext, texelsNext,
                       rgba) {
        let numTexels = dim * dim,
            format = this.format;
        let pixelSize = Texture.PIXEL_SIZE[format];
        // 转换纹理元素到32bitRGBA
        Texture.COLOR_FROM_FUNC[format](numTexels, this.data.subarray(texels, texels + numTexels * pixelSize), rgba);

        let i1, i0, j, c, base;
        // Create the next miplevel in-place.
        for (i1 = 0; i1 < dimNext; ++i1) {
            for (i0 = 0; i0 < dimNext; ++i0) {
                j = i0 + dimNext * i1;
                base = 2 * (i0 + dim * i1);
                for (c = 0; c < 4; ++c) {
                    rgba[j * 4 + c] = 0.25 * (
                            rgba[base * 4 + c] +
                            rgba[(base + 1) * 4 + c] +
                            rgba[(base + dim) * 4 + c] +
                            rgba[(base + dim + 1) * 4 + c]
                        );
                }
            }
        }

        let numTexelsNext = dimNext * dimNext;
        // 从32bit-RGBA转换成原始格式, subArray使用的是指针
        Texture.COLOR_TO_FUNC[format](numTexelsNext, rgba,
            this.data.subarray(texelsNext, (texelsNext + numTexelsNext * pixelSize)));
    }
}
