/**
 * Texture 纹理基类构造
 *
 * @param format {number} 纹理格式， 参考L5.Texture.TF_XXX
 * @param type {number} 纹理类型, 参考L5.Texture.TT_XXX
 * @param usage {number} 用途, 参考L5.Buffer.BU_XXX
 * @param numLevels {number} 纹理级数
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Texture = function (
    format, type, usage, numLevels
) {
    L5.D3Object.call (this);
    this.data = null;

    this.format = format;       // 纹理元素格式
    this.type = type;           // 纹理类型， 例如 2d, 3d...
    this.usage = usage;         // 纹理用途
    this.numLevels = numLevels; // MipMaps级数
    this.numDimensions = L5.Texture.DIMENSIONS[ type ];

    const max_levels = L5.Texture.MAX_MIPMAP_LEVELS;

    this.dimension   = [
        new Array (max_levels),
        new Array (max_levels),
        new Array (max_levels)
    ];

    this.numLevelBytes = new Array (max_levels);
    this.numTotalBytes = 0;
    this.levelOffsets  = new Array (max_levels);
    for (var level = 0; level < max_levels; ++level) {
        this.dimension[ 0 ][ level ] = 0;
        this.dimension[ 1 ][ level ] = 0;
        this.dimension[ 2 ][ level ] = 0;
        this.numLevelBytes[ level ]  = 0;
        this.levelOffsets[ level ]   = 0;
    }

    // 用户字段, 用于存储特定于APP的未知结构数据
    const maxUserFields = L5.Texture.MAX_USER_FIELDS;
    this.userField = new Array (maxUserFields);
    for (var i = 0; i < maxUserFields; ++i) {
        this.userField[ i ] = 0;
    }
};

L5.nameFix (L5.Texture, 'Texture');
L5.extendFix (L5.Texture, L5.D3Object);

///////////////////////// 纹理通用常量定义 /////////////////////////////////////
L5.Texture.MAX_MIPMAP_LEVELS = 16; // MipMap纹理最大级数0-15
L5.Texture.MAX_USER_FIELDS   = 8;  // 用户特定纹理 最大数量

////////////////////////////////  纹理类型 ////////////////////////////////////
L5.Texture.TT_2D       = 0;
L5.Texture.TT_CUBE     = 2;

//////////////////////////////// 纹理格式定义 /////////////////////////////////
L5.Texture.TF_NONE          = 0;
L5.Texture.TF_R5G6B5        = 1;
L5.Texture.TF_A1R5G5B5      = 2;
L5.Texture.TF_A4R4G4B4      = 3;
L5.Texture.TF_A8            = 4;
L5.Texture.TF_L8            = 5;
L5.Texture.TF_A8L8          = 6;
L5.Texture.TF_R8G8B8        = 7;
L5.Texture.TF_A8R8G8B8      = 8;
L5.Texture.TF_A8B8G8R8      = 9;
L5.Texture.TF_L16           = 10;
L5.Texture.TF_G16R16        = 11;
L5.Texture.TF_A16B16G16R16  = 12;
L5.Texture.TF_R16F          = 13;  // not support
L5.Texture.TF_G16R16F       = 14;  // not support
L5.Texture.TF_A16B16G16R16F = 15;  // not support
L5.Texture.TF_R32F          = 16;
L5.Texture.TF_G32R32F       = 17;
L5.Texture.TF_A32B32G32R32F = 18;
L5.Texture.TF_DXT1          = 19;
L5.Texture.TF_DXT3          = 20;
L5.Texture.TF_DXT5          = 21;
L5.Texture.TF_D24S8         = 22;
L5.Texture.TF_QUANTITY      = 23;

////////////////////////// 每种格式纹理是否支持生成MipMaps /////////////////////
L5.Texture.MIPMAPABLE = [
    false,  // L5.Texture.TF_NONE
    true,   // L5.Texture.TF_R5G6B5
    true,   // L5.Texture.TF_A1R5G5B5
    true,   // L5.Texture.TF_A4R4G4B4
    true,   // L5.Texture.TF_A8
    true,   // L5.Texture.TF_L8
    true,   // L5.Texture.TF_A8L8
    true,   // L5.Texture.TF_R8G8B8
    true,   // L5.Texture.TF_A8R8G8B8
    true,   // L5.Texture.TF_A8B8G8R8
    true,   // L5.Texture.TF_L16
    true,   // L5.Texture.TF_G16R16
    true,   // L5.Texture.TF_A16B16G16R16
    false,   // L5.Texture.TF_R16F
    false,   // L5.Texture.TF_G16R16F
    false,   // L5.Texture.TF_A16B16G16R16F
    false,  // L5.Texture.TF_R32F
    false,  // L5.Texture.TF_G32R32F
    false,  // L5.Texture.TF_A32B32G32R32F,
    true,   // L5.Texture.TF_DXT1 (special handling)
    true,   // L5.Texture.TF_DXT3 (special handling)
    true,   // L5.Texture.TF_DXT5 (special handling)
    false   // L5.Texture.TF_D24S8
];

/////////////////////////    纹理类型维度    //////////////////////////////////
L5.Texture.DIMENSIONS = [
    2,  // TT_2D
    2  // TT_CUBE
];

////////////////// 每种像素格式单个像素占用的尺寸单位，字节  //////////////////////
L5.Texture.PIXEL_SIZE         = [
    0,              // L5.Texture.TF_NONE
    2,              // L5.Texture.TF_R5G6B5
    2,              // L5.Texture.TF_A1R5G5B5
    2,              // L5.Texture.TF_A4R4G4B4
    1,              // L5.Texture.TF_A8
    1,              // L5.Texture.TF_L8
    2,              // L5.Texture.TF_A8L8
    3,              // L5.Texture.TF_R8G8B8
    4,              // L5.Texture.TF_A8R8G8B8
    4,              // L5.Texture.TF_A8B8G8R8
    2,              // L5.Texture.TF_L16
    4,              // L5.Texture.TF_G16R16
    8,              // L5.Texture.TF_A16B16G16R16
    2,              // L5.Texture.TF_R16F
    4,              // L5.Texture.TF_G16R16F
    8,              // L5.Texture.TF_A16B16G16R16F
    4,              // L5.Texture.TF_R32F
    8,              // L5.Texture.TF_G32R32F
    16,             // L5.Texture.TF_A32B32G32R32F,
    0,              // L5.Texture.TF_DXT1 (special handling)
    0,              // L5.Texture.TF_DXT3 (special handling)
    0,              // L5.Texture.TF_DXT5 (special handling)
    4               // L5.Texture.TF_D24S8
];

/////////////////////////    纹理格式转换函数   //////////////////////////////////
L5.Texture.COLOR_FROM_FUNC = [
    null,
    L5.Color.convertFromR5G6B5,
    L5.Color.convertFromA1R5G5B5,
    L5.Color.convertFromA4R4G4B4,
    L5.Color.convertFromA8,
    L5.Color.convertFromL8,
    L5.Color.convertFromA8L8,
    L5.Color.convertFromR8G8B8,
    L5.Color.convertFromA8R8G8B8,
    L5.Color.convertFromA8B8G8R8,
    L5.Color.convertFromL16,
    L5.Color.convertFromG16R16,
    L5.Color.convertFromA16B16G16R16,
    L5.Color.convertFromR16F,
    L5.Color.convertFromG16R16F,
    L5.Color.convertFromA16B16G16R16F,
    L5.Color.convertFromR32F,
    L5.Color.convertFromG32R32F,
    L5.Color.convertFromA32B32G32R32F,
    null,
    null,
    null,
    null
];
L5.Texture.COLOR_TO_FUNC = [
    null,
    L5.Color.convertToR5G6B5,
    L5.Color.convertToA1R5G5B5,
    L5.Color.convertToA4R4G4B4,
    L5.Color.convertToA8,
    L5.Color.convertToL8,
    L5.Color.convertToA8L8,
    L5.Color.convertToR8G8B8,
    L5.Color.convertToA8R8G8B8,
    L5.Color.convertToA8B8G8R8,
    L5.Color.convertToL16,
    L5.Color.convertToG16R16,
    L5.Color.convertToA16B16G16R16,
    L5.Color.convertToR16F,
    L5.Color.convertToG16R16F,
    L5.Color.convertToA16B16G16R16F,
    L5.Color.convertToR32F,
    L5.Color.convertToG32R32F,
    L5.Color.convertToA32B32G32R32F,
    null,
    null,
    null,
    null
];

/////////////////////////////   方法定义   ///////////////////////////////////
L5.Texture.prototype.isCompressed = function () {
    return this.format === L5.Texture.TF_DXT1 ||
        this.format === L5.Texture.TF_DXT3 ||
        this.format === L5.Texture.TF_DXT5;
};

/**
 * 获取纹理级数数据
 * @param i {number}
 * @param level {number}
 */
L5.Texture.prototype.getDimension = function (
    i, level
) {
    return this.dimension[ i ][ level ];
};

/**
 * 判断是否可以生成MipMaps纹理
 * @returns {boolean}
 */
L5.Texture.prototype.isMipMapsAble = function () {
    return L5.Texture.MIPMAPABLE[ this.format ];
};

/**
 * 在系统内存中管理纹理的一个拷贝
 *
 * 字节数通过getNumTotalBytes查询
 * 获取到的数据不能修改，因为渲染器并不会知道
 * @returns {ArrayBuffer}
 */
L5.Texture.prototype.getData = function () {};