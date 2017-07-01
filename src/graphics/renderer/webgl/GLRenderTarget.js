import { Texture2D } from '../../resources/Texture2D';
import { GLTexture2D } from './GLTexture2D';

class GLRenderTarget {
    constructor(renderer, renderTarget) {
        this.numTargets = renderTarget.numTargets;
        console.assert(this.numTargets >= 1, 'Number of render targets must be at least one.');

        this.width = renderTarget.width;
        this.height = renderTarget.height;
        this.format = renderTarget.format;
        this.hasMipmaps = renderTarget.hasMipmaps;
        this.hasDepthStencil = renderTarget.hasDepthStencil;

        this.prevViewport[0] = 0;
        this.prevViewport[1] = 0;
        this.prevViewport[2] = 0;
        this.prevViewport[3] = 0;
        this.prevDepthRange[0] = 0;
        this.prevDepthRange[1] = 0;

        let gl = renderer.gl;

        // Create a framebuffer object.
        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

        let previousBind = gl.getParameter(gl.TEXTURE_BINDING_2D);

        this.colorTextures = new Array(this.numTargets);
        this.drawBuffers = new Array(this.numTargets);
        for (let i = 0; i < this.numTargets; ++i) {
            let colorTexture = renderTarget.getColorTexture(i);
            console.assert(!renderer.inTexture2DMap(colorTexture), 'Texture should not yet exist.');

            let ogColorTexture = new GLTexture2D(renderer, colorTexture);
            renderer.insertInTexture2DMap(colorTexture, ogColorTexture);
            this.colorTextures[i] = ogColorTexture.getTexture();
            this.drawBuffers[i] = gl.COLOR_ATTACHMENT0 + i;

            // Bind the color texture.
            gl.bindTexture(gl.TEXTURE_2D, this.colorTextures[i]);
            if (this.hasMipmaps) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            }

            // Attach the texture to the framebuffer.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, this.drawBuffers[i], gl.TEXTURE_2D, this.colorTextures[i], 0);
        }

        let depthStencilTexture = renderTarget.depthStencilTexture;
        if (depthStencilTexture) {
            console.assert(!renderer.inTexture2DMap(depthStencilTexture), 'Texture should not yet exist.');

            let ogDepthStencilTexture = new GLTexture2D(renderer, depthStencilTexture);
            renderer.insertInTexture2DMap(depthStencilTexture, ogDepthStencilTexture);
            this.depthStencilTexture = ogDepthStencilTexture.getTexture();

            // Bind the depthstencil texture.
            gl.bindTexture(gl.TEXTURE_2D, this.depthStencilTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            // Attach the depth to the framebuffer.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthStencilTexture, 0);

            // Attach the stencil to the framebuffer.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.depthStencilTexture, 0);
        }

        gl.bindTexture(gl.TEXTURE_2D, previousBind);

        switch (gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
            case gl.FRAMEBUFFER_COMPLETE:
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                console.assert(false, 'Framebuffer incomplete attachments');
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                console.assert(false, 'Framebuffer incomplete missing attachment');
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                console.assert(false, 'Framebuffer incomplete dimensions');
                break;
            case gl.FRAMEBUFFER_UNSUPPORTED:
                console.assert(false, 'Framebuffer unsupported');
                break;
            default:
                console.assert(false, 'Framebuffer unknown error');
                break;
        }
    }
    enable(renderer) {
        let gl = renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.drawBuffers(this.numTargets, this.drawBuffers);

        this.prevViewport = gl.getParameter(gl.VIEWPORT);
        this.prevDepthRange = gl.getParameter(gl.DEPTH_RANGE);
        gl.viewport(0, 0, this.width, this.height);
        gl.depthRange(0, 1);
    }

    disable(renderer) {
        let gl = renderer.gl;
        let pv = this.prevViewport;
        let pd = this.prevDepthRange;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        if (this.hasMipmaps) {
            let previousBind = gl.getParameter(gl.TEXTURE_BINDING_2D);
            for (let i = 0; i < this.numTargets; ++i) {
                gl.bindTexture(gl.TEXTURE_2D, this.colorTextures[i]);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.bindTexture(gl.TEXTURE_2D, previousBind);
        }

        gl.viewport(pv[0], pv[1], pv[2], pv[3]);
        gl.depthRange(pd[0], pd[1]);
    }

    readColor(i, renderer, texture) {
        let gl = renderer.gl;
        let format = this.format;
        let width = this.width;
        let height = this.height;

        if (i < 0 || i >= this.numTargets) {
            console.assert(false, 'Invalid target index.');
        }

        this.enable(renderer);

        if (texture) {
            if (texture.format !== format ||
                texture.width !== width ||
                texture.height !== height) {
                console.assert(false, 'Incompatible texture.');
                texture = new Texture2D(format, width, height, 1);
            }
        }
        else {
            texture = new Texture2D(format, width, height, true);
        }

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, texture.getData(0));

        this.disable(renderer);
    }
}

export { GLRenderTarget };
