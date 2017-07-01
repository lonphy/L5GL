import { D3Object } from '../../core/D3Object';
import { BinDataView } from '../../core/BinDataView';
import { DECLARE_ENUM } from '../../util/util';

class Texture extends D3Object {

    /**
     * @param {number} format 纹理格式， 参考Texture.TF_XXX
     * @param {number} type 纹理类型, 参考Texture.TT_XXX
     */
    constructor(format, type) {
        super();
        this.format = format;                          // 纹理元素格式
        this.type = type;                              // 纹理类型， 例如 2d, 3d...
        this.hasMipmaps = false;                       // 是否生成MipMaps
        this.numDimensions = Texture.DIMENSIONS[type]; // 纹理拥有的维度
        this.numTotalBytes = 0;
        this.width = 0;
        this.height = 0;
        this.depth = 0;
        this.data = null;
        this.static = true;
    }

    /**
     * 判断是否是压缩格式
     * @returns {boolean}
     */
    isCompressed() {
        return this.format === Texture.TF_DXT1 || this.format === Texture.TF_DXT3 || this.format === Texture.TF_DXT5;
    }

    /**
     * 判断是否可以生成MipMaps纹理
     * @returns {boolean}
     */
    isMipMapsAble() {
        return Texture.MIPMAPABLE[this.format];
    }

    /**
     * 在系统内存中管理纹理的一个拷贝
     *
     * 字节数通过getNumTotalBytes查询
     * 获取到的数据不能修改，因为渲染器并不会知道
     * @returns {Uint8Array}
     * @abstract
     */
    getData() {
    }

    /**
     * 获取数据流大小
     * @returns {number}
     */
    getFileSize() {
        let size = 0;
        size += 1;                // format
        size += 1;                // type
        size += 1;                // hasMipmaps
        size += 1;                // numDimension
        size += 2 * 3;            // width, height, depth
        size += 4;                // numTotalBytes
        size += this.numTotalBytes;
        return size;
    }

    /**
     *
     * @param {ArrayBuffer} buffer
     * @param {Texture} texture
     */
    static unpackTo(buffer, texture) {

        let io = new BinDataView(buffer);
        let format = io.int8();
        let type = io.int8();
        let hasMipMaps = (io.int8() == 1);
        let numDimensions = io.int8();
        let width = io.int16();
        let height = io.int16();
        let depth = io.int16();
        let numTotalBytes = io.int32();
        if (type !== texture.type) {
            return new Error('Invalid type for ' + texture.name);
        }

        texture.format = format;
        texture.hasMipmaps = hasMipMaps;
        texture.numDimensions = numDimensions;
        texture.depth = depth;

        switch (type) {
            case Texture.TT_2D:
                texture.width = width;
                texture.height = height;
                break;
            case Texture.TT_CUBE:
                texture.width = width;
                break;
        }
        texture.enableMipMaps = hasMipMaps;
        texture._update();
        texture.data.set(io.bytes(numTotalBytes));
        io = null;
        return null;
    }

    /**
     * 将纹理对象处理成文件形式
     * @param {Texture} texture
     * @returns {ArrayBuffer}
     */
    static pack(texture) {
        let size = texture.getFileSize();
        let buffer = new ArrayBuffer(size);
        let io = new BinDataView(buffer);

        io.setInt8(texture.format);
        io.setInt8(texture.type);
        io.setInt8(texture.hasMipmaps ? 1 : 0);
        io.setInt8(texture.numDimensions);
        io.setInt16(texture.width);
        io.setInt16(texture.height);
        io.setInt16(texture.depth);
        io.setInt32(texture.numTotalBytes);
        io.setBytes(texture.getData());
        return buffer;
    }
}

// 纹理格式定义
DECLARE_ENUM(Texture, {
    TF_NONE: 0,
    TF_R5G6B5: 1,
    TF_A1R5G5B5: 2,
    TF_A4R4G4B4: 3,
    TF_A8: 4,
    TF_L8: 5,
    TF_A8L8: 6,
    TF_R8G8B8: 7,
    TF_A8R8G8B8: 8,
    TF_A8B8G8R8: 9,
    TF_L16: 10,
    TF_G16R16: 11,
    TF_A16B16G16R16: 12,
    TF_R16F: 13,  // not support
    TF_G16R16F: 14,  // not support
    TF_A16B16G16R16F: 15,  // not support
    TF_R32F: 16,
    TF_G32R32F: 17,
    TF_A32B32G32R32F: 18,
    TF_DXT1: 19,
    TF_DXT3: 20,
    TF_DXT5: 21,
    TF_D24S8: 22,
    TF_QUANTITY: 23
}, false);

// 每种格式纹理是否支持生成MipMaps
DECLARE_ENUM(Texture, {
    TT_2D: 1,
    TT_CUBE: 3,
    MIPMAPABLE: [
        false,  // Texture.TF_NONE
        true,   // Texture.TF_R5G6B5
        true,   // Texture.TF_A1R5G5B5
        true,   // Texture.TF_A4R4G4B4
        true,   // Texture.TF_A8
        true,   // Texture.TF_L8
        true,   // Texture.TF_A8L8
        true,   // Texture.TF_R8G8B8
        true,   // Texture.TF_A8R8G8B8
        true,   // Texture.TF_A8B8G8R8
        true,   // Texture.TF_L16
        true,   // Texture.TF_G16R16
        true,   // Texture.TF_A16B16G16R16
        false,   // Texture.TF_R16F
        false,   // Texture.TF_G16R16F
        false,   // Texture.TF_A16B16G16R16F
        false,  // Texture.TF_R32F
        false,  // Texture.TF_G32R32F
        false,  // Texture.TF_A32B32G32R32F,
        true,   // Texture.TF_DXT1 (special handling)
        true,   // Texture.TF_DXT3 (special handling)
        true,   // Texture.TF_DXT5 (special handling)
        false   // Texture.TF_D24S8
    ],

    /////////////////////////    纹理类型维度    //////////////////////////////////
    DIMENSIONS: [
        2,  // TT_2D
        2  // TT_CUBE
    ]
}, false);

// 每种像素格式单个像素占用的尺寸单位，字节
DECLARE_ENUM(Texture, {
    PIXEL_SIZE: [
        0,              // Texture.TF_NONE
        2,              // Texture.TF_R5G6B5
        2,              // Texture.TF_A1R5G5B5
        2,              // Texture.TF_A4R4G4B4
        1,              // Texture.TF_A8
        1,              // Texture.TF_L8
        2,              // Texture.TF_A8L8
        3,              // Texture.TF_R8G8B8
        4,              // Texture.TF_A8R8G8B8
        4,              // Texture.TF_A8B8G8R8
        2,              // Texture.TF_L16
        4,              // Texture.TF_G16R16
        8,              // Texture.TF_A16B16G16R16
        2,              // Texture.TF_R16F
        4,              // Texture.TF_G16R16F
        8,              // Texture.TF_A16B16G16R16F
        4,              // Texture.TF_R32F
        8,              // Texture.TF_G32R32F
        16,             // Texture.TF_A32B32G32R32F,
        0,              // Texture.TF_DXT1 (special handling)
        0,              // Texture.TF_DXT3 (special handling)
        0,              // Texture.TF_DXT5 (special handling)
        4               // Texture.TF_D24S8
    ]
});

export { Texture };