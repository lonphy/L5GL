/**
 *
 * @param numTargets {number}
 * @param format {number}
 * @param width {number}
 * @param height {number}
 * @param hasMipmaps {boolean}
 * @param hasDepthStencil {boolean}
 * @constructor
 */
L5.RenderTarget = function(
    numTargets, format, width, height, hasMipmaps, hasDepthStencil
) {
    L5.assert(numTargets > 0, "Number of targets must be at least one.\n");

    this.numTargets = numTargets;
    this.hasMipmaps = hasMipmaps;

    /**
     * @type {L5.Texture2D}
     */
    this.colorTextures = new Array(numTargets);

    var i;
    for (i = 0; i < numTargets; ++i)
    {
        this.colorTextures[i] = new L5.Texture2D(format, width, height, hasMipmaps, L5.Buffer.BU_RENDERTARGET);
    }

    if (hasDepthStencil)
    {
        this.depthStencilTexture = new L5.Texture2D(L5.TEXTURE_FORMAT_D24S8, width, height, 1, L5.Buffer.BU_DEPTHSTENCIL);
    }
    else
    {
        this.depthStencilTexture = null;
    }
};
L5.RenderTarget.name = "RenderTarget";

L5.RenderTarget.prototype = {
    constructor: L5.RenderTarget,

    get width() {
        return this.colorTextures[0].width;
    },
    get height() {
        return this.colorTextures[0].height;
    },
    get format() {
        return this.colorTextures[0].format;
    },

    getColorTexture: function(index) {
        return this.colorTextures[index];
    },

    hasDepthStencil: function() {
        return this.depthStencilTexture !== null;
    }
};