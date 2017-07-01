class Color {
    /**
     * Make a 32-bit RGB color from 8-bit channels.
     * The alpha channel is set to 255.
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     */
    static makeR8G8B8(red, green, blue) {
        this.dv.setUint8(0, red);
        this.dv.setUint8(1, green);
        this.dv.setUint8(2, blue);
        this.dv.setUint8(3, 255);
        return this.dv.getUint32(0);
    }

    /**
     * Make a 32-bit RGB color from 8-bit channels.
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @param {number} alpha
     */
    static makeR8G8B8A8(red, green, blue, alpha) {
        this.dv.setUint8(0, red);
        this.dv.setUint8(1, green);
        this.dv.setUint8(2, blue);
        this.dv.setUint8(3, alpha);
        return this.dv.getUint32(0);
    }
    /**
     * Extract 8-bit channels from a 32bit-RGBA color.
     * @param {Uint32Array} color
     * @returns {Array<number>} [r,g,b]
     */
    //
    static extractR8G8B8(color) {
        this.dv.setUint32(0, color);
        return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2)];
    }

    /**
     * Extract 8-bit channels from a 32bit-RGBA color.
     * @param {Uint32Array} color
     * @returns {Array<number>} [r,g,b,a]
     */
    //
    static extractR8G8B8A8(color) {
        this.dv.setUint32(0, color);
        return [this.dv.getUint8(0), this.dv.getUint8(1), this.dv.getUint8(2), this.dv.getUint8(3)];
    }

    /**
     * 从 R5G6B5 转换到 32bit-RGBA
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - R5G6B5
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromR5G6B5(numTexels, inTexels, outTexels) {
        let len = 4 * numTexels, i, j;
        for (i = 0, j = 0; i < len; i += 4, j += 2) {
            outTexels[i] = inTexels[j] >> 3; // r
            outTexels[i + 1] = ((inTexels[j] & 0x07) << 3) | (inTexels[j + 1] >> 5); // g
            outTexels[i + 2] = inTexels[j + 1] & 0x1f; //b
            outTexels[i + 3] = 0;      //a
        }
    }

    /**
     * 从 A1R5G5B5 转换到 32bit-RGBA
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - A1R5G5B5
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA1R5G5B5(numTexels, inTexels, outTexels) {
        let len = 4 * numTexels, i, j;
        for (i = 0, j = 0; i < len; i += 4, j += 2) {
            outTexels[i] = inTexels[j] & 0x80 >> 2; // r
            outTexels[i + 1] = ((inTexels[j] & 0x03) << 3) | (inTexels[j + 1] >> 5); // g
            outTexels[i + 2] = inTexels[j + 1] & 0x1f; //b
            outTexels[i + 3] = inTexels[j] >> 7;      //a
        }
    }

    /**
     * 从 4bit-ARGB 转换到 32bit-RGBA
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 4bit-ARGB
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA4R4G4B4(numTexels, inTexels, outTexels) {
        let len = 4 * numTexels, i, j;
        for (i = 0, j = 0; i < len; i += 4, j += 2) {
            outTexels[i] = outTexels[j] & 0x0f;
            outTexels[i + 1] = outTexels[j + 1] & 0xf0 >> 4;
            outTexels[i + 2] = outTexels[j + 1] & 0x0f;
            outTexels[i + 3] = outTexels[j] & 0xf0 >> 4;
        }
    }

    /**
     * 从 8bit-A 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 8bit-A
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j;
        for (i = 0, j = 0; i < len; i += 4, j++) {
            outTexels[i] = 0;
            outTexels[i + 1] = 0;
            outTexels[i + 2] = 0;
            outTexels[i + 3] = inTexels[j];
        }
    }

    /**
     * 从 8bit-L 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 8bit-L
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromL8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j;
        for (i = 0, j = 0; i < len; i += 4, j++) {
            outTexels[i] = inTexels[j];
            outTexels[i + 1] = inTexels[j];
            outTexels[i + 2] = inTexels[j];
            outTexels[i + 3] = 255;
        }
    }

    /**
     * 从 8bit-AL 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 8bit-AL
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA8L8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j;
        for (i = 0, j = 0; i < len; i += 4, j += 2) {
            outTexels[i] = inTexels[j + 1];
            outTexels[i + 1] = inTexels[j + 1];
            outTexels[i + 2] = inTexels[j + 1];
            outTexels[i + 3] = inTexels[j];
        }
    }

    /**
     * 从 8bit-RGB 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 8bit-RGB
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromR8G8B8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j;
        for (i = 0, j = 0; i < len; i += 4, j += 3) {
            outTexels[i] = inTexels[j];
            outTexels[i + 1] = inTexels[j + 1];
            outTexels[i + 2] = inTexels[j + 2];
            outTexels[i + 3] = 0;
        }
    }

    /**
     * 从 8bit-ARGB 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 8bit-ARGB
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA8R8G8B8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i;
        for (i = 0; i < len; i += 4) {
            outTexels[i] = inTexels[i + 1];
            outTexels[i + 1] = inTexels[i + 2];
            outTexels[i + 2] = inTexels[i + 3];
            outTexels[i + 3] = inTexels[i];
        }
    }

    /**
     * 从 8bit-ABGR 转换到 32bit-RGBA.
     * @param {number} numTexels 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels 8bit-ABGR
     * @param {Float32Array} outTexels 32bit-RGBA
     */
    static convertFromA8B8G8R8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i;
        for (i = 0; i < len; i += 4) {
            outTexels[i] = inTexels[i + 3];
            outTexels[i + 1] = inTexels[i + 2];
            outTexels[i + 2] = inTexels[i + 1];
            outTexels[i + 3] = inTexels[i];
        }
    }

    /**
     * 从 16bit-L 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 16bit-L
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromL16(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j,
            dv = new Uint16Array(inTexels);
        for (i = 0, j = 0; i < len; i += 4, j++) {
            outTexels[i] = dv[j];
            outTexels[i + 1] = dv[j];
            outTexels[i + 2] = dv[j];
            outTexels[i + 3] = 65535;
        }
    }

    /**
     * 从 16bit-GR 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 16bit-GR
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromG16R16(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j,
            dv = new Uint16Array(inTexels);
        for (i = 0, j = 0; i < len; i += 4, j += 2) {
            outTexels[i] = dv[j + 1];
            outTexels[i + 1] = dv[j];
            outTexels[i + 2] = 0;
            outTexels[i + 3] = 0;
        }
    }

    /**
     * 从 16bit-ABGR 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 16bit-ABGR
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA16B16G16R16(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i,
            dv = new Uint16Array(inTexels);
        for (i = 0; i < len; i += 4) {
            outTexels[i] = dv[i + 3];
            outTexels[i + 1] = dv[i + 2];
            outTexels[i + 2] = dv[i + 1];
            outTexels[i + 3] = dv[i];
        }
    }

    /**
     * 从 16-bit RF 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 16-bit RF
     * @param {Float32Array} outTexels - 32bit-RGBA
     * @todo: implement
     */
    static convertFromR16F(numTexels, inTexels, outTexels) { }

    /**
     * 从 16-bit GRF 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 16-bit GRF
     * @param {Float32Array} outTexels - 32bit-RGBA
     * @todo: implement
     */
    static convertFromG16R16F(numTexels, inTexels, outTexels) { }

    /**
     * 从 16-bit ABGRF 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 16-bit ABGRF
     * @param {Float32Array} outTexels - 32bit-RGBA
     * @todo: implement
     */
    static convertFromA16B16G16R16F(numTexels, inTexels, outTexels) { }

    /**
     * 从 32-bit RF 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 32-bit RF
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromR32F(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j,
            dv = new Float32Array(inTexels);
        for (i = 0, j = 0; i < len; i += 4, j++) {
            outTexels[i] = dv[j];
            outTexels[i + 1] = 0;
            outTexels[i + 2] = 0;
            outTexels[i + 3] = 0;
        }
    }

    /**
     * 从 32-bit GRF 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit GRF
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromG32R32F(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j,
            dv = new Float32Array(inTexels);
        for (i = 0, j = 0; i < len; i += 4, j += 2) {
            outTexels[i] = dv[j + 1];
            outTexels[i + 1] = dv[j];
            outTexels[i + 2] = 0;
            outTexels[i + 3] = 0;
        }
    }

    /**
     * 从 32-bit ABGRF 转换到 32bit-RGBA.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {ArrayBuffer} inTexels - 32-bit ABGRF
     * @param {Float32Array} outTexels - 32bit-RGBA
     */
    static convertFromA32B32G32R32F(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i,
            dv = new Float32Array(inTexels);
        for (i = 0; i < len; i += 4) {
            outTexels[i] = dv[i + 3];
            outTexels[i + 1] = dv[i + 2];
            outTexels[i + 2] = dv[i + 1];
            outTexels[i + 3] = dv[i];
        }
    }

    /**
     * 从 32-bit RGBA 转换到 R5G6B5.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - R5G6B5
     */
    static convertToR5G6B5(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = (inTexels[i] << 3) | (inTexels[i + 1] >> 3);           // r<<3 | g>>3
            outTexels[j++] = ((inTexels[i + 1] & 0x07) << 5) | inTexels[i + 2]; // g&0x7 << 5 | b
        }
    }

    /**
     * 从 32-bit RGBA 转换到 A1R5G6B5.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - A1R5G6B5
     */
    static convertToA1R5G5B5(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = (inTexels[i + 3] << 7) | (inTexels[i] << 2) | (inTexels[i + 1] >> 3);           // a<<7 | r<<2 | g>>3
            outTexels[j++] = ((inTexels[i + 1] & 0x07) << 5) | inTexels[i + 2]; // (g&0x7 << 5) | b
        }
    }

    /**
     * 从 32-bit RGBA 转换到 4-bit ARGB.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 4-bit ARGB
     */
    static convertToA4R4G4B4(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = (inTexels[i + 3] << 4) | inTexels[i];           // a<<4 | r
            outTexels[j++] = (inTexels[i + 1] << 4) | inTexels[i + 2];         // g<<4 | b
        }
    }

    /**
     * 从 32-bit RGBA 转换到 8-bit Alpha.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 8-bit Alpha
     */
    static convertToA8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = inTexels[i + 3];
        }
    }

    /**
     * 从 32-bit RGBA 转换到 8-bit Luminance.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 8-bit Luminance
     */
    static convertToL8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = inTexels[i];
        }
    }

    /**
     * 从 32-bit RGBA 转换到 8-bit Alpha-Luminance
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 8-bit Alpha-Luminance
     */
    static convertToA8L8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = inTexels[i + 3];
            outTexels[j++] = inTexels[i];
        }
    }

    /**
     * 从 32-bit RGBA 转换到 8-bit RGB
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 8-bit RGB
     */
    static convertToR8G8B8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = inTexels[i];
            outTexels[j++] = inTexels[i + 1];
            outTexels[j++] = inTexels[i + 2];
        }
    }

    /**
     * 从 32-bit RGBA 转换到 8-bit ARGB
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 8-bit ARGB
     */
    static convertToA8R8G8B8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = inTexels[i + 3];
            outTexels[j++] = inTexels[i];
            outTexels[j++] = inTexels[i + 1];
            outTexels[j++] = inTexels[i + 2];
        }
    }

    /**
     * 从 32-bit RGBA 转换到 8-bit ABGR
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 8-bit ABGR
     */
    static convertToA8B8G8R8(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        for (i = 0; i < len; i += 4) {
            outTexels[j++] = inTexels[i + 3];
            outTexels[j++] = inTexels[i + 2];
            outTexels[j++] = inTexels[i + 1];
            outTexels[j++] = inTexels[i];
        }
    }
    /**
     * 从 32-bit RGBA 转换到 16-bit Luminance.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 16-bit Luminance
     */
    static convertToL16(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        let dv = new DataView(outTexels.buffer);
        for (i = 0; i < len; i += 4, j += 2) {
            dv.setUint16(j, inTexels[i]);
        }
    }

    /**
     * 从 32-bit RGBA 转换到 16-bit GR.
     * @param {number} numTexels -  需要转换的纹理数量
     * @param inTexels {Float32Array} 32-bit RGBA
     * @param outTexels {ArrayBuffer} 16-bit GR
     */
    static convertToG16R16(
        numTexels, inTexels, outTexels
    ) {
        let len = numTexels * 4, i, j = 0;
        let dv = new DataView(outTexels.buffer);
        for (i = 0; i < len; i += 4, j += 4) {
            dv.setUint16(j, inTexels[i + 1]);
            dv.setUint16(j + 2, inTexels[i]);
        }
    }

    /**
     * 从 32-bit RGBA 转换到 16-bit ABGR.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels -16-bit ABGR
     */
    static convertToA16B16G16R16(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        let dv = new DataView(outTexels.buffer);
        for (i = 0; i < len; i += 4, j += 8) {
            dv.setUint16(j, inTexels[i + 3]);
            dv.setUint16(j + 2, inTexels[i + 2]);
            dv.setUint16(j + 4, inTexels[i + 1]);
            dv.setUint16(j + 6, inTexels[i]);
        }
    }

    /**
     * 从 32-bit RGBA 转换到 16-bit RF.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels 32-bit RGBA
     * @param {ArrayBuffer} outTexels 16-bit RF
     * @todo: implement
     */
    static convertToR16F(numTexels, inTexels, outTexels) { }

    /**
     * 从 32-bit RGBA 转换到 16-bit GRF.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 16-bit GRF
     * @todo: implement
     */
    static convertToG16R16F(numTexels, inTexels, outTexels) { }

    /**
     * 从 32-bit RGBA 转换到 16-bit ABGRF.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 16-bit ABGRF
     * @todo: implement
     */
    static convertToA16B16G16R16F(numTexels, inTexels, outTexels) { }

    /**
     * 从 32-bit RGBA 转换到 32-bit RF.
     * @param {number} numTexels -  需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 32-bit RF
     */
    static convertToR32F(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i;
        let dv = new DataView(outTexels.buffer);
        for (i = 0; i < len; i += 4) {
            dv.setFloat32(i, inTexels[i]);
        }
    }

    /**
     * 从 32-bit RGBA 转换到 32-bit GRF.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {ArrayBuffer} outTexels - 32-bit GRF
     */
    static convertToG32R32F(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        let dv = new DataView(outTexels.buffer);
        for (i = 0; i < len; i += 4, j += 8) {
            dv.setFloat32(j, inTexels[i]);
            dv.setFloat32(j + 4, inTexels[i + 1]);
        }
    }

    /**
     * 从 32-bit RGBA 转换到 32-bit ABGRF.
     * @param {number} numTexels - 需要转换的纹理数量
     * @param {Float32Array} inTexels - 32-bit RGBA
     * @param {Float32Array} outTexels - 32-bit ABGRF
     */
    static convertToA32B32G32R32F(numTexels, inTexels, outTexels) {
        let len = numTexels * 4, i, j = 0;
        let dv = new DataView(outTexels.buffer);
        for (i = 0; i < len; i += 4, j += 16) {
            dv.setFloat32(j, inTexels[i + 3]);
            dv.setFloat32(j + 4, inTexels[i + 2]);
            dv.setFloat32(j + 8, inTexels[i + 1]);
            dv.setFloat32(j + 12, inTexels[i]);
        }
    }
}
// Same as EXTURE_FORMAT_QUANTITY
Color.COLOR_FORMAT_QUANTITY = 23;
/**
 * @type {DataView}
 * @private
 */
Color.dv = new DataView(new Uint32Array(4).buffer);

export { Color };
