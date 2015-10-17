/**
 * Color 颜色
 * @author lonphy
 * @version 1.0
 */

L5.Color = {
    /**
     * @type {DataView}
     * @private
     */
    dv: new DataView(new Uint32Array(4).buffer)
};

/**
 * Make a 32-bit RGB color from 8-bit channels.
 * The alpha channel is set to 255.
 * @param red {number}
 * @param green {number}
 * @param blue {number}
 * @static
 */
L5.Color.makeR8G8B8 = function(red, green, blue) {
    this.dv.setUint8(0, red);
    this.dv.setUint8(1, green);
    this.dv.setUint8(2, blue);
    this.dv.setUint8(3, 255);
    return this.dv.getUint32(0);
};

/**
 * Make a 32-bit RGB color from 8-bit channels.
 * @param red {number}
 * @param green {number}
 * @param blue {number}
 * @param alpha {number}
 * @static
 */
L5.Color.makeR8G8B8A8 = function(red, green, blue, alpha) {
    this.dv.setUint8(0, red);
    this.dv.setUint8(1, green);
    this.dv.setUint8(2, blue);
    this.dv.setUint8(3, alpha);
    return this.dv.getUint32(0);
};
/**
 * Extract 8-bit channels from a 32bit-RGBA color.
 * 透明通道将被丢弃
 * @param color {Uint32Array}
 * @returns {Array} [r,g,b]
 */
//
L5.Color.extractR8G8B8 = function(color){
    this.dv.setUint32(0,color);
    return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2)];
};

/**
 * Extract 8-bit channels from a 32bit-RGBA color.
 * @param color {Uint32Array}
 * @returns {Array} [r,g,b,a]
 */
//
L5.Color.extractR8G8B8A8 = function(color){
    this.dv.setUint32(0,color);
    return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2), this.dv.getUint8(3)];
};

// Same as L5.TEXTURE_FORMAT_QUANTITY
L5.COLOR_FORMAT_QUANTITY = 23;

/**
 * 从 R5G6B5 转换到 32bit-RGBA
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} R5G6B5
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromR5G6B5 = function(
    numTexels, inTexels, outTexels
) {
    var len = 4*numTexels, i,j;

    for (i=0,j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = inTexels[j] >> 3; // r
        outTexels[i+1] = ( (inTexels[j] & 0x07) << 3 ) | (inTexels[j+1] >> 5); // g
        outTexels[i+2] = inTexels[j+1] & 0x1f; //b
        outTexels[i+3] = 0;      //a
    }
};
/**
 * 从 A1R5G5B5 转换到 32bit-RGBA
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} A1R5G5B5
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA1R5G5B5 = function (
    numTexels, inTexels, outTexels
){
    var len = 4*numTexels, i,j;
    for (i=0,j=0; i<len; i+=4,j+=2)
    {
        outTexels[i  ] = inTexels[j] & 0x80 >> 2; // r
        outTexels[i+1] = ( (inTexels[j] & 0x03) << 3) | (inTexels[j+1] >> 5); // g
        outTexels[i+2] = inTexels[j+1] & 0x1f; //b
        outTexels[i+3] = inTexels[j] >> 7;      //a
    }
};

/**
 * 从 4bit-ARGB 转换到 32bit-RGBA
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 4bit-ARGB
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA4R4G4B4 = function (
    numTexels, inTexels, outTexels
){
    var len = 4*numTexels, i,j;
    for (i=0,j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = outTexels[j  ] & 0x0f;
        outTexels[i+1] = outTexels[j+1] & 0xf0 >> 4;
        outTexels[i+2] = outTexels[j+1] & 0x0f;
        outTexels[i+3] = outTexels[j  ] & 0xf0 >> 4;
    }
};

/**
 * 从 8bit-A 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-A
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j;
    for (i=0,j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = 0;
        outTexels[i+1] = 0;
        outTexels[i+2] = 0;
        outTexels[i+3] = inTexels[j];
    }
};

/**
 * 从 8bit-L 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-L
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromL8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j;
    for (i=0,j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = inTexels[j];
        outTexels[i+1] = inTexels[j];
        outTexels[i+2] = inTexels[j];
        outTexels[i+3] = 255;
    }
};

/**
 * 从 8bit-AL 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-AL
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8L8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j;
    for (i=0, j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = inTexels[j+1];
        outTexels[i+1] = inTexels[j+1];
        outTexels[i+2] = inTexels[j+1];
        outTexels[i+3] = inTexels[j];
    }
};

/**
 * 从 8bit-RGB 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-RGB
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromR8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j;
    for (i=0, j=0; i < len; i+=4,j+=3)
    {
        outTexels[i  ] = inTexels[j];
        outTexels[i+1] = inTexels[j+1];
        outTexels[i+2] = inTexels[j+2];
        outTexels[i+3] = 0;
    }
};

/**
 * 从 8bit-ARGB 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-ARGB
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8R8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i;
    for (i=0; i < len; i+=4)
    {
        outTexels[i  ] = inTexels[i+1];
        outTexels[i+1] = inTexels[i+2];
        outTexels[i+2] = inTexels[i+3];
        outTexels[i+3] = inTexels[i  ];
    }
};

/**
 * 从 8bit-ABGR 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 8bit-ABGR
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA8B8G8R8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i;
    for (i=0; i < len; i+=4)
    {
        outTexels[i  ] = inTexels[i+3];
        outTexels[i+1] = inTexels[i+2];
        outTexels[i+2] = inTexels[i+1];
        outTexels[i+3] = inTexels[i  ];
    }
};

/**
 * 从 16bit-L 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16bit-L
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromL16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j,
        dv = new Uint16Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = dv[j];
        outTexels[i+1] = dv[j];
        outTexels[i+2] = dv[j];
        outTexels[i+3] = 65535;
    }
};

/**
 * 从 16bit-GR 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16bit-GR
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromG16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j,
        dv = new Uint16Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = dv[j+1];
        outTexels[i+1] = dv[j];
        outTexels[i+2] = 0;
        outTexels[i+3] = 0;
    }
};

/**
 * 从 16bit-ABGR 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16bit-ABGR
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA16B16G16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,
        dv = new Uint16Array(inTexels);
    for (i = 0; i < len; i+=4)
    {
        outTexels[i  ] = dv[i+3];
        outTexels[i+1] = dv[i+2];
        outTexels[i+2] = dv[i+1];
        outTexels[i+3] = dv[i];
    }
};

/**
 * 从 16-bit RF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16-bit RF
 * @param outTexels {Float32Array} 32bit-RGBA
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertFromR16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 16-bit GRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16-bit GRF
 * @param outTexels {Float32Array} 32bit-RGBA
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertFromG16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 16-bit ABGRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 16-bit ABGRF
 * @param outTexels {Float32Array} 32bit-RGBA
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertFromA16B16G16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 32-bit RF
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromR32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i,j,
        dv = new Float32Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j++)
    {
        outTexels[i  ] = dv[j];
        outTexels[i+1] = 0;
        outTexels[i+2] = 0;
        outTexels[i+3] = 0;
    }
};

/**
 * 从 32-bit GRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit GRF
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromG32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4,i, j,
        dv = new Float32Array(inTexels);
    for (i=0, j=0; i < len; i+=4,j+=2)
    {
        outTexels[i  ] = dv[j+1];
        outTexels[i+1] = dv[j  ];
        outTexels[i+2] = 0;
        outTexels[i+3] = 0;
    }
};

/**
 * 从 32-bit ABGRF 转换到 32bit-RGBA.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {ArrayBuffer} 32-bit ABGRF
 * @param outTexels {Float32Array} 32bit-RGBA
 */
L5.Color.convertFromA32B32G32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,
        dv = new Float32Array(inTexels);
    for (i=0; i < len; i+=4)
    {
        outTexels[i  ] = dv[i+3];
        outTexels[i+1] = dv[i+2];
        outTexels[i+2] = dv[i+1];
        outTexels[i+3] = dv[i];
    }
};

/**
 * 从 32-bit RGBA 转换到 R5G6B5.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} R5G6B5
 */
L5.Color.convertToR5G6B5 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = (inTexels[i]<<3) | (inTexels[i+1]>>3);           // r<<3 | g>>3
        outTexels[j++] = ( (inTexels[i+1] & 0x07) << 5 ) | inTexels[i+2]; // g&0x7 << 5 | b
    }
};

/**
 * 从 32-bit RGBA 转换到 A1R5G6B5.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} A1R5G6B5
 */
L5.Color.convertToA1R5G5B5 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = (inTexels[i+3] << 7) | (inTexels[i]<<2) | (inTexels[i+1]>>3);           // a<<7 | r<<2 | g>>3
        outTexels[j++] = ( (inTexels[i+1] & 0x07) << 5 ) | inTexels[i+2]; // (g&0x7 << 5) | b
    }
};

/**
 * 从 32-bit RGBA 转换到 4-bit ARGB.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 4-bit ARGB
 */
L5.Color.convertToA4R4G4B4 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = (inTexels[i+3] << 4) | inTexels[i];           // a<<4 | r
        outTexels[j++] = (inTexels[i+1] << 4) | inTexels[i+2];         // g<<4 | b
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit Alpha.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit Alpha
 */
L5.Color.convertToA8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit Luminance.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit Luminance
 */
L5.Color.convertToL8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit Alpha-Luminance
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit Alpha-Luminance
 */
L5.Color.convertToA8L8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
        outTexels[j++] = inTexels[i];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit RGB
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit RGB
 */
L5.Color.convertToR8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i  ];
        outTexels[j++] = inTexels[i+1];
        outTexels[j++] = inTexels[i+2];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit ARGB
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit ARGB
 */
L5.Color.convertToA8R8G8B8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
        outTexels[j++] = inTexels[i  ];
        outTexels[j++] = inTexels[i+1];
        outTexels[j++] = inTexels[i+2];
    }
};

/**
 * 从 32-bit RGBA 转换到 8-bit ABGR
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 8-bit ABGR
 */
L5.Color.convertToA8B8G8R8 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    for (i=0; i < len; i+=4)
    {
        outTexels[j++] = inTexels[i+3];
        outTexels[j++] = inTexels[i+2];
        outTexels[j++] = inTexels[i+1];
        outTexels[j++] = inTexels[i  ];
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit Luminance.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit Luminance
 */
L5.Color.convertToL16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=2)
    {
        dv.setUint16(j, inTexels[i]);
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit GR.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit GR
 */
L5.Color.convertToG16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=4)
    {
        dv.setUint16(j,   inTexels[i+1]);
        dv.setUint16(j+2, inTexels[i  ]);
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit ABGR.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit ABGR
 */
L5.Color.convertToA16B16G16R16 = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i, j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=8)
    {
        dv.setUint16(j,   inTexels[i+3]);
        dv.setUint16(j+2, inTexels[i+2]);
        dv.setUint16(j+4, inTexels[i+1]);
        dv.setUint16(j+6, inTexels[i  ]);
    }
};

/**
 * 从 32-bit RGBA 转换到 16-bit RF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit RF
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertToR16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RGBA 转换到 16-bit GRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit GRF
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertToG16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RGBA 转换到 16-bit ABGRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 16-bit ABGRF
 *
 * @deprecated not support for 1.0
 */
L5.Color.convertToA16B16G16R16F = function (
    numTexels, inTexels, outTexels
){};

/**
 * 从 32-bit RGBA 转换到 32-bit RF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 32-bit RF
 */
L5.Color.convertToR32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4)
    {
        dv.setFloat32(i, inTexels[i]);
    }
};

/**
 * 从 32-bit RGBA 转换到 32-bit GRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 32-bit GRF
 */
L5.Color.convertToG32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=8)
    {
        dv.setFloat32(j  , inTexels[i]);
        dv.setFloat32(j+4, inTexels[i+1]);
    }
};

/**
 * 从 32-bit RGBA 转换到 32-bit ABGRF.
 * @param numTexels {number} 需要转换的纹理数量
 * @param inTexels {Float32Array} 32-bit RGBA
 * @param outTexels {ArrayBuffer} 32-bit ABGRF
 */
L5.Color.convertToA32B32G32R32F = function (
    numTexels, inTexels, outTexels
){
    var len = numTexels* 4, i,j=0;
    var dv = new DataView(outTexels.buffer);
    for (i=0; i < len; i+=4,j+=16)
    {
        dv.setFloat32(j,    inTexels[i+3]);
        dv.setFloat32(j+4,  inTexels[i+2]);
        dv.setFloat32(j+8,  inTexels[i+1]);
        dv.setFloat32(j+12, inTexels[i]);
    }
};