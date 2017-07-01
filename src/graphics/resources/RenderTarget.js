import { Texture2D } from './Texture2D';
import { Buffer } from './Buffer';
import { Texture } from './Texture';

class RenderTarget {

    /**
     * @param {number} numTargets 
     * @param {number} format 
     * @param {number} width 
     * @param {number} height 
     * @param {boolean} hasMipmaps 
     * @param {boolean} hasDepthStencil 
     */
    constructor(numTargets, format, width, height, hasMipmaps, hasDepthStencil) {
        console.assert(numTargets > 0, 'Number of targets must be at least one.');

        this.numTargets = numTargets;
        this.hasMipmaps = hasMipmaps;
        this.depthStencilTexture = null;

        /**
         * @type {Array<Texture2D>}
         */
        this.colorTextures = new Array(numTargets);

        let i;
        for (i = 0; i < numTargets; ++i) {
            this.colorTextures[i] = new Texture2D(format, width, height, hasMipmaps);
        }

        if (hasDepthStencil) {
            this.depthStencilTexture = new Texture2D(Texture.TF_D24S8, width, height, false);
        }
    }

    get width() {
        return this.colorTextures[0].width;
    }

    get height() {
        return this.colorTextures[0].height;
    }

    get format() {
        return this.colorTextures[0].format;
    }

    getColorTexture(index) {
        return this.colorTextures[index];
    }

    hasDepthStencil() {
        return this.depthStencilTexture !== null;
    }
}

export { RenderTarget };