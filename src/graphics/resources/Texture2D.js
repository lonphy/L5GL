import { Texture } from './Texture';
import { _Math } from '../../math/index';
import { Renderer } from '../renderer/Renderer';

class Texture2D extends Texture {
    /**
     * @param {number} format - 纹理格式， 参考Texture.TT_XXX
     * @param {number} width
     * @param {number} height
     * @param {boolean} mipmaps - 是否生成mipmaps
     */
    constructor(format, width, height, mipmaps = false) {
        console.assert(width >= 0, 'width must be positive');
        console.assert(height >= 0, 'height must be positive');
        let canMipMaps = false;
        if (mipmaps) {
            let w = _Math.log2OfPowerOfTwo(width);
            let h = _Math.log2OfPowerOfTwo(height);
            canMipMaps = (Math.pow(2, w) === width && Math.pow(2, h) === height);
            console.assert(canMipMaps, 'width or height is not pow of 2, can\'t generate Mipmaps');
        }
        super(format, Texture.TT_2D);
        this.width = width;
        this.height = height;
        this.hasMipmaps = canMipMaps;
        this._update();
    }

    set enableMipMaps(val) {
        if (val) {
            let w = _Math.log2OfPowerOfTwo(this.width);
            let h = _Math.log2OfPowerOfTwo(this.height);
            let canMipMaps = (Math.pow(2, w) === this.width && Math.pow(2, h) === this.height);
            console.assert(canMipMaps, 'width or height is not pow of 2, can\'t generate Mipmaps');
            this.hasMipmaps = canMipMaps;
            return;
        }
        this.hasMipmaps = false;
    }

    _update() {
        this.computeNumLevelBytes();
        this.data = new Uint8Array(this.numTotalBytes);
    }

    getData() { return this.data; }

    upload() { 
        console.time(`${this.constructor.name} - ${this.name}`);
        Renderer.updateAll(this);
        console.timeEnd(`${this.constructor.name} - ${this.name}`);        
    }

    /**
     * @param {ArrayBuffer} buffer
     * @returns {Promise}
     */
    static unpack(buffer) {
        let texture = new Texture2D(Texture.TT_NONE,0,0);
        let err = Texture.unpackTo(buffer, texture);
        if (err !== null) {
            return Promise.reject(err);
        }
        return Promise.resolve(texture);
    }

    computeNumLevelBytes() {
        this.numTotalBytes = 0;
        const format = this.format;
        let dim0 = this.width,
            dim1 = this.height,
            max0, max1;
        switch (format) {
            case Texture.TT_DXT1:
                max0 = Math.max(dim0 / 4, 1);
                max1 = Math.max(dim1 / 4, 1);
                this.numTotalBytes = 8 * max0 * max1;
                break;
            case Texture.TT_DXT3:
            case Texture.TT_DXT5:
                max0 = Math.max(dim0 / 4, 1);
                max1 = Math.max(dim1 / 4, 1);
                this.numTotalBytes = 16 * max0 * max1;
                break;
            default:
                this.numTotalBytes = Texture.PIXEL_SIZE[format] * dim0 * dim1;
        }
    }
}

export { Texture2D };