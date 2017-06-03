/**
 * 渲染对象
 *
 * @param numTargets {number}
 * @param format {number}
 * @param width {number}
 * @param height {number}
 * @param hasMipmaps {boolean}
 * @param hasDepthStencil {boolean}
 * @type {RenderTarget}
 */
export class RenderTarget {

    constructor(numTargets, format, width, height, hasMipmaps, hasDepthStencil) {
        console.assert(numTargets > 0, 'Number of targets must be at least one.');

        this.numTargets = numTargets;
        this.hasMipmaps = hasMipmaps;

        /**
         * @type {L5.Texture2D}
         */
        this.colorTextures = new Array(numTargets);

        var i;
        for (i = 0; i < numTargets; ++i) {
            this.colorTextures[i] = new L5.Texture2D(format, width, height, hasMipmaps, Buffer.BU_RENDER_TARGET);
        }

        if (hasDepthStencil) {
            this.depthStencilTexture = new L5.Texture2D(L5.TEXTURE_FORMAT_D24S8, width, height, 1, Buffer.BU_DEPTH_STENCIL);
        }
        else {
            this.depthStencilTexture = null;
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
