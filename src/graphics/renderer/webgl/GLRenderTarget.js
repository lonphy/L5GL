/**
 *
 * @param renderer {L5.Renderer}
 * @param renderTarget {L5.RenderTarget}
 * @param renderTarget
 * @constructor
 */
L5.GLRenderTarget = function (
    renderer, renderTarget
) {
    this.numTargets = renderTarget.numTargets;
    L5.assert (this.numTargets >= 1, 'Number of render targets must be at least one.');

    this.width           = renderTarget.width;
    this.height          = renderTarget.height;
    this.format          = renderTarget.format;
    this.hasMipmaps      = renderTarget.hasMipmaps;
    this.hasDepthStencil = renderTarget.hasDepthStencil;

    this.prevViewport[ 0 ]   = 0;
    this.prevViewport[ 1 ]   = 0;
    this.prevViewport[ 2 ]   = 0;
    this.prevViewport[ 3 ]   = 0;
    this.prevDepthRange[ 0 ] = 0;
    this.prevDepthRange[ 1 ] = 0;

    var gl = renderer.gl;

    // Create a framebuffer object.
    this.frameBuffer = gl.createFramebuffer ();
    gl.bindFramebuffer (gl.FRAMEBUFFER, this.frameBuffer);

    var previousBind = gl.getParameter (gl.TEXTURE_BINDING_2D);

    this.colorTextures = new Array (this.numTargets);
    this.drawBuffers   = new Array (this.numTargets);
    for (var i = 0; i < this.numTargets; ++i) {
        var colorTexture = renderTarget.getColorTexture (i);
        L5.assert (!renderer.inTexture2DMap (colorTexture), 'Texture should not yet exist.');

        var ogColorTexture      = new L5.GLTexture2D (renderer, colorTexture);
        renderer.insertInTexture2DMap (colorTexture, ogColorTexture);
        this.colorTextures[ i ] = ogColorTexture.getTexture ();
        this.drawBuffers[ i ]   = gl.COLOR_ATTACHMENT0 + i;

        // Bind the color texture.
        gl.bindTexture (gl.TEXTURE_2D, this.colorTextures[ i ]);
        if (this.hasMipmaps) {
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        else {
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }

        // Attach the texture to the framebuffer.
        gl.framebufferTexture2D (gl.FRAMEBUFFER, this.drawBuffers[ i ], gl.TEXTURE_2D, this.colorTextures[ i ], 0);
    }

    var depthStencilTexture = renderTarget.depthStencilTexture;
    if (depthStencilTexture) {
        L5.assert (!renderer.inTexture2DMap (depthStencilTexture), 'Texture should not yet exist.');

        var ogDepthStencilTexture = new L5.GLTexture2D (renderer, depthStencilTexture);
        renderer.insertInTexture2DMap (depthStencilTexture, ogDepthStencilTexture);
        this.depthStencilTexture  = ogDepthStencilTexture.getTexture ();

        // Bind the depthstencil texture.
        gl.bindTexture (gl.TEXTURE_2D, this.depthStencilTexture);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // Attach the depth to the framebuffer.
        gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthStencilTexture, 0);

        // Attach the stencil to the framebuffer.
        gl.framebufferTexture2D (gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.depthStencilTexture, 0);
    }

    gl.bindTexture (gl.TEXTURE_2D, previousBind);

    switch (gl.checkFramebufferStatus (gl.FRAMEBUFFER)) {
        case gl.FRAMEBUFFER_COMPLETE:
            gl.bindFramebuffer (gl.FRAMEBUFFER, null);
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            L5.assert (false, 'Framebuffer incomplete attachments');
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            L5.assert (false, 'Framebuffer incomplete missing attachment');
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            L5.assert (false, 'Framebuffer incomplete dimensions');
            break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            L5.assert (false, 'Framebuffer unsupported');
            break;
        default:
            L5.assert (false, 'Framebuffer unknown error');
            break;
    }
};

/**
 *
 * @param renderer {L5.Renderer}
 */
L5.GLRenderTarget.prototype.enable    = function (renderer) {
    var gl = renderer.gl;

    gl.bindFramebuffer (gl.FRAMEBUFFER, this.frameBuffer);
    gl.drawBuffers (this.numTargets, this.drawBuffers);

    this.prevViewport   = gl.getParameter (gl.VIEWPORT);
    this.prevDepthRange = gl.getParameter (gl.DEPTH_RANGE);
    gl.viewport (0, 0, this.width, this.height);
    gl.depthRange (0, 1);
};
/**
 *
 * @param renderer {L5.Renderer}
 */
L5.GLRenderTarget.prototype.disable   = function (renderer) {
    var gl = renderer.gl;
    var pv = this.prevViewport;
    var pd = this.prevDepthRange;

    gl.bindFramebuffer (gl.FRAMEBUFFER, null);

    if (this.hasMipmaps) {
        var previousBind = gl.getParameter (gl.TEXTURE_BINDING_2D);
        for (var i = 0; i < this.numTargets; ++i) {
            gl.bindTexture (gl.TEXTURE_2D, this.colorTextures[ i ]);
            gl.generateMipmap (gl.TEXTURE_2D);
        }
        gl.bindTexture (gl.TEXTURE_2D, previousBind);
    }

    gl.viewport (pv[ 0 ], pv[ 1 ], pv[ 2 ], pv[ 3 ]);
    gl.depthRange (pd[ 0 ], pd[ 1 ]);
};
/**
 *
 * @param i {number}
 * @param renderer {L5.Renderer}
 * @param texture {L5.Texture2D}
 */
L5.GLRenderTarget.prototype.readColor = function (
    i, renderer, texture
) {
    var gl     = renderer.gl;
    var format = this.format;
    var width  = this.width;
    var height = this.height;

    if (i < 0 || i >= this.numTargets) {
        L5.assert (false, 'Invalid target index.');
    }

    this.enable (renderer);

    if (texture) {
        if (texture.format !== format ||
            texture.width !== width ||
            texture.height !== height) {
            L5.assert (false, 'Incompatible texture.');
            texture = new L5.Texture2D (format, width, height, 1);
        }
    }
    else {
        texture = new L5.Texture2D (format, width, height, 1);
    }

    gl.readPixels (0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, texture.getData (0));

    this.disable (renderer);
};