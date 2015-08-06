//----------------------------------------------------------------------------
// Visual state management.
//----------------------------------------------------------------------------

/**
 *
 * @param alphaState {L5.AlphaState}
 */
L5.Renderer.prototype.setAlphaState = function (alphaState) {

    var gl = this.gl;
    if (!this.overrideAlphaState) {
        this.alphaState = alphaState;
    } else {
        this.alphaState = this.overrideAlphaState;
    }
    var as  = this.alphaState;
    var CRS = this.data.currentRS;

    if (as.blendEnabled) {
        if (!CRS.alphaBlendEnabled) {
            CRS.alphaBlendEnabled = true;
            gl.enable (gl.BLEND);
        }

        var srcBlend = L5.Webgl.AlphaBlend[ as.srcBlend ];
        var dstBlend = L5.Webgl.AlphaBlend[ as.dstBlend ];

        if (srcBlend != CRS.alphaSrcBlend || dstBlend != CRS.alphaDstBlend) {
            CRS.alphaSrcBlend = srcBlend;
            CRS.alphaDstBlend = dstBlend;
            gl.blendFunc (srcBlend, dstBlend);
        }

        if (as.constantColor !== CRS.blendColor) {
            CRS.blendColor = as.constantColor;
            gl.blendColor (
                CRS.blendColor[ 0 ],
                CRS.blendColor[ 1 ],
                CRS.blendColor[ 2 ],
                CRS.blendColor[ 3 ]);
        }
    } else {
        if (CRS.alphaBlendEnabled) {
            CRS.alphaBlendEnabled = false;
            gl.disable (gl.BLEND);
        }
    }
};

/**
 * @param cullState {L5.CullState}
 */
L5.Renderer.prototype.setCullState = function (
    cullState
) {
    var cs;
    var gl = this.gl;
    if (!this.overrideCullState) {
        cs = cullState;
    }
    else {
        cs = this.overrideCullState;
    }
    this.cullState = cs;
    var CRS = this.data.currentRS;

    if (cs.enabled) {
        if (!CRS.cullEnabled) {
            CRS.cullEnabled = true;
            gl.enable (gl.CULL_FACE);
            gl.frontFace (gl.CCW);
        }

        var order = cs.CCWOrder;
        if (this.reverseCullOrder) {
            order = !order;
        }

        if (order != CRS.CCWOrder) {
            CRS.CCWOrder = order;
            if (CRS.CCWOrder) {
                gl.cullFace (gl.BACK);
            }
            else {
                gl.cullFace (gl.FRONT);
            }
        }
    }
    else {
        if (CRS.cullEnabled) {
            CRS.cullEnabled = false;
            gl.disable (gl.CULL_FACE);
        }
    }
};

/**
 * @param depthState {L5.DepthState}
 */
L5.Renderer.prototype.setDepthState  = function (
    depthState
) {
    var ds;
    var gl = this.gl;

    if (!this.overrideDepthState) {
        ds = depthState;
    } else {
        ds = this.overrideDepthState;
    }
    this.depthState = ds;
    var CRS         = this.data.currentRS;

    if (ds.enabled) {
        if (!CRS.depthEnabled) {
            CRS.depthEnabled = true;
            gl.enable (gl.DEPTH_TEST);
        }

        var compare = gOGLDepthCompare[ ds.compare ];
        if (compare != CRS.depthCompareFunction) {
            CRS.depthCompareFunction = compare;
            gl.depthFunc (compare);
        }
    }
    else {
        if (CRS.depthEnabled) {
            CRS.depthEnabled = false;
            gl.disable (gl.DEPTH_TEST);
        }
    }

    if (ds.writable) {
        if (!CRS.depthWriteEnabled) {
            CRS.depthWriteEnabled = true;
            gl.depthMask (true);
        }
    }
    else {
        if (CRS.depthWriteEnabled) {
            CRS.depthWriteEnabled = false;
            gl.depthMask (false);
        }
    }
};
/**
 * @param offsetState {L5.OffsetState}
 */
L5.Renderer.prototype.setOffsetState = function (
    offsetState
) {
    var os;
    var gl = this.gl;
    var CRS = this.data.currentRS;
    if (!this.overrideOffsetState) {
        os = offsetState;
    }
    else {
        os = this.overrideOffsetState;
    }

    if (os.fillEnabled) {
        if (!CRS.fillEnabled) {
            CRS.fillEnabled = true;
            gl.enable (gl.POLYGON_OFFSET_FILL);
        }
    }
    else {
        if (CRS.fillEnabled) {
            CRS.fillEnabled = false;
            gl.disable (gl.POLYGON_OFFSET_FILL);
        }
    }

    if (os.lineEnabled) {
        if (!CRS.lineEnabled) {
            CRS.lineEnabled = true;
            gl.enable (gl.POLYGON_OFFSET_LINE);
        }
    }
    else {
        if (CRS.lineEnabled) {
            CRS.lineEnabled = false;
            gl.disable (gl.POLYGON_OFFSET_LINE);
        }
    }

    if (os.pointEnabled) {
        if (!CRS.pointEnabled) {
            CRS.pointEnabled = true;
            gl.enable (gl.POLYGON_OFFSET_POINT);
        }
    }
    else {
        if (CRS.pointEnabled) {
            CRS.pointEnabled = false;
            gl.disable (gl.POLYGON_OFFSET_POINT);
        }
    }

    if (os.scale != CRS.offsetScale || os.bias != CRS.offsetBias) {
        CRS.offsetScale = os.scale;
        CRS.offsetBias  = os.bias;
        gl.polygonOffset (os.scale, os.bias);
    }
};

/**
 * @param stencilState {L5.StencilState}
 */
L5.Renderer.prototype.setStencilState = function (
    stencilState
) {
    var gl = this.gl;
    var ss;
    if (!this.overrideStencilState) {
        ss = stencilState;
    }
    else {
        ss = this.overrideStencilState;
    }
    this.stencilState = ss;
    var CRS = this.data.currentRS;
    if (ss.enabled) {
        if (!CRS.stencilEnabled) {
            CRS.stencilEnabled = true;
            gl.enable (gl.STENCIL_TEST);
        }

        var compare = gOGLStencilCompare[ ss.compare ];
        if (compare != CRS.stencilCompareFunction || ss.reference != CRS.stencilReference || ss.mask != CRS.stencilMask) {
            CRS.stencilCompareFunction = compare;
            CRS.stencilReference       = ss.reference;
            CRS.stencilMask            = ss.mask;
            gl.stencilFunc (compare, ss.reference, ss.mask);
        }

        if (ss.writeMask != CRS.stencilWriteMask) {
            CRS.stencilWriteMask = ss.writeMask;
            gl.stencilMask (ss.writeMask);
        }

        var onFail  = gOGLStencilOperation[ ss.onFail ];
        var onZFail = gOGLStencilOperation[ ss.onZFail ];
        var onZPass = gOGLStencilOperation[ ss.onZPass ];

        if (onFail != CRS.stencilOnFail || onZFail != CRS.stencilOnZFail || onZPass != CRS.stencilOnZPass) {
            CRS.stencilOnFail  = onFail;
            CRS.stencilOnZFail = onZFail;
            CRS.stencilOnZPass = onZPass;
            gl.stencilOp (onFail, onZFail, onZPass);
        }
    }
    else {
        if (CRS.stencilEnabled) {
            CRS.stencilEnabled = false;
            gl.disable (gl.STENCIL_TEST);
        }
    }
};


//----------------------------------------------------------------------------
// Viewport management.
//----------------------------------------------------------------------------
/**
 * @param x {number}
 * @param y {number}
 * @param width {number}
 * @param height {number}
 */
L5.Renderer.prototype.setViewport   = function (
    x, y, width, height
) {
    this.gl.viewport (x, y, width, height);
};
L5.Renderer.prototype.setDepthRange = function (
    min, max
) {
    this.gl.depthRange (min, max);
};
L5.Renderer.prototype.resize        = function (
    width, height
) {
    this.width  = width;
    this.height = height;
    var gl      = this.gl;

    var param = gl.getParameter (gl.VIEWPORT);
    gl.viewport (param[ 0 ], param[ 1 ], width, height);
};

//----------------------------------------------------------------------------
// Support for clearing the color, depth, and stencil buffers.
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearColorBuffer = function () {
    var c  = this.clearColor;
    var gl = this.gl;

    gl.clearColor (c[ 0 ], c[ 1 ], c[ 2 ], c[ 3 ]);

    gl.clear (gl.COLOR_BUFFER_BIT);
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearDepthBuffer = function () {
    var gl = this.gl;
    gl.clearDepth (this.clearDepth);
    gl.clear (gl.DEPTH_BUFFER_BIT);
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearStencilBuffer = function () {
    var gl = this.gl;
    gl.clearStencil (this.clearStencil);
    gl.clear (gl.STENCIL_BUFFER_BIT);
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.clearBuffers       = function () {
    var gl = this.gl;
    var cc = this.clearColor;
    gl.clearColor (cc[ 0 ], cc[ 1 ], cc[ 2 ], cc[ 3 ]);
    gl.clearDepth (this.clearDepth);
    gl.clearStencil (this.clearStencil);
    gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearColorBuffer   = function (
    x, y, w, h
) {
    var gl = this.gl;
    var cc = this.clearColor;
    gl.clearColor (cc[ 0 ], cc[ 1 ], cc[ 2 ], cc[ 3 ]);

    gl.enable (gl.SCISSOR_TEST);
    gl.scissor (x, y, w, h);
    gl.clear (gl.COLOR_BUFFER_BIT);
    gl.disable (gl.SCISSOR_TEST);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearDepthBuffer   = function (
    x, y, w, h
) {
    var gl = this.gl;
    gl.clearDepth (this.clearDepth);
    gl.enable (gl.SCISSOR_TEST);
    gl.scissor (x, y, w, h);
    gl.clear (gl.DEPTH_BUFFER_BIT);
    gl.disable (gl.SCISSOR_TEST);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearStencilBuffer = function (
    x, y, w, h
) {
    var gl = this.gl;
    gl.clearStencil (this.clearStencil);
    gl.enable (gl.SCISSOR_TEST);
    gl.scissor (x, y, w, h);
    gl.clear (gl.STENCIL_BUFFER_BIT);
    gl.disable (gl.SCISSOR_TEST);
};
/**
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 */
L5.Renderer.prototype.clearBuffers       = function (
    x, y, w, h
) {
    var gl = this.gl;
    var cc = this.clearColor;

    gl.clearColor (cc[ 0 ], cc[ 1 ], cc[ 2 ], cc[ 3 ]);
    gl.clearDepth (this.clearDepth);
    gl.clearStencil (this.clearStencil);
    gl.enable (gl.SCISSOR_TEST);
    gl.scissor (x, y, w, h);
    gl.clear (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.disable (gl.SCISSOR_TEST);
};
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// Support for masking color channels.
//----------------------------------------------------------------------------
/**
 *
 * @param allowRed {boolean}
 * @param allowGreen {boolean}
 * @param allowBlue {boolean}
 * @param allowAlpha {boolean}
 */
L5.Renderer.prototype.setColorMask = function (
    allowRed, allowGreen, allowBlue, allowAlpha
) {
    this.allowRed   = allowRed;
    this.allowGreen = allowGreen;
    this.allowBlue  = allowBlue;
    this.allowAlpha = allowAlpha;
    this.gl.colorMask (allowRed, allowGreen, allowBlue, allowBlue);
};
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// Support for predraw and postdraw semantics.
//----------------------------------------------------------------------------
L5.Renderer.prototype.preDraw = function () {
    return true;
};
//----------------------------------------------------------------------------
L5.Renderer.prototype.postDraw = function () {
};
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// Drawing routines.
//----------------------------------------------------------------------------
/**
 * @param screenBuffer {Uint8Array}
 * @param reflectY {boolean}
 */
L5.Renderer.prototype.draw = function (
    screenBuffer, reflectY
) {
    if (!screenBuffer) {
        L5.assert (false, "Incoming screen buffer is null.\n");
        return;
    }

    var gl = this.gl;

    gl.matrixMode (gl.MODELVIEW);
    gl.pushMatrix ();
    gl.loadIdentity ();
    gl.matrixMode (gl.PROJECTION);
    gl.pushMatrix ();
    gl.loadIdentity ();
    gl.ortho (0, this.width, 0, this.height, 0, 1);
    gl.rasterPos3f (0, 0, 0);

    if (!reflectY) {
        // Set raster position to window coord (0,H-1).  The hack here avoids
        // problems with invalid raster positions which would cause
        // glDrawPixels not to execute.  OpenGL uses right-handed screen
        // coordinates, so using (0,H-1) as the raster position followed by
        // glPixelZoom(1,-1) tells OpenGL to draw the screen in left-handed
        // coordinates starting at the top row of the screen and finishing
        // at the bottom row.
        var bitmap = [ 0 ];
        gl.bitmap (0, 0, 0, 0, 0, this.height, bitmap);
    }
    gl.popMatrix ();
    gl.matrixMode (gl.MODELVIEW);
    gl.popMatrix ();

    if (!reflectY) {
        gl.pixelZoom (1, -1);
    }

    gl.drawPixels (this.width, this.height, gl.BGRA, gl.UNSIGNED_BYTE, screenBuffer);

    if (!reflectY) {
        gl.pixelZoom (1, 1);
    }
};

//----------------------------------------------------------------------------
/**
 *
 * @param x {number}
 * @param y {number}
 * @param color {Float32Array}
 * @param message {string}
 */
L5.Renderer.prototype.drawText = function (
    x, y, color, message
) {
    var gl = this.gl;


    // Switch to orthogonal view.
    gl.matrixMode (gl.PROJECTION);
    gl.pushMatrix ();
    gl.loadIdentity ();
    gl.ortho (-0.5, this.width - 0.5, -0.5, this.height - 0.5, -1, 1);
    gl.matrixMode (gl.MODELVIEW);
    gl.pushMatrix ();
    gl.loadIdentity ();

    // Set default render states, except for depth buffering that must be
    // disabled because text is always overlayed.
    this.setAlphaState (this.defaultAlphaState);
    this.setCullState (this.defaultCullState);
    this.setOffsetState (this.defaultOffsetState);
    this.setStencilState (this.defaultStencilState);

    var CRS          = this.data.currentRS;
    CRS.depthEnabled = false;
    gl.disable (gl.DEPTH_TEST);

    // Set the text color.
    gl.color4fv (color[ 0 ], color[ 1 ], color[ 2 ], color[ 3 ]);

    // Draw the text string (use right-handed coordinates).
    gl.rasterPos3i (x, this.height - 1 - y, 0);

    // Restore visual state.  Only depth buffering state varied from the
    // default state.
    CRS.depthEnabled = true;
    gl.enable (gl.DEPTH_TEST);

    // Restore matrices.
    gl.PopMatrix ();
    gl.MatrixMode (gl.PROJECTION);
    gl.PopMatrix ();
    gl.MatrixMode (gl.MODELVIEW);
};

//----------------------------------------------------------------------------
/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype.drawPrimitive = function (
    visual
) {
    var type    = visual.getPrimitiveType ();
    var vbuffer = visual.getVertexBuffer ();
    var ibuffer = visual.getIndexBuffer ();
    var gl      = this.gl;
    var numPixelsDrawn;
    var numSegments;

    switch (type) {
        case L5.Visual.PT_TRIMESH:
        case L5.Visual.PT_TRISTRIP:
        case L5.Visual.PT_TRIFAN:
        {
            var numVertices = vbuffer.getNumElements ();
            var numIndices  = ibuffer.getNumElements ();
            if (numVertices > 0 && numIndices > 0) {
                var indexType;
                var indexData;
                if (ibuffer.getElementSize () == 2) {
                    indexType = gl.UNSIGNED_SHORT;
                    indexData = ibuffer.getOffset ();
                }
                else  // size is 4
                {
                    indexType = gl.UNSIGNED_INT;
                    indexData = ibuffer.getOffset ();
                }
                gl.drawRangeElements (gOGLPrimitiveType[ type ], 0, numVertices - 1, numIndices, indexType, indexData);
            }
            break;
        }
        case L5.Visual.PT_POLYSEGMENTS_CONTIGUOUS:
        {
            numSegments = visual.getNumSegments ();
            if (numSegments > 0) {
                gl.drawArrays (gl.LINE_STRIP, 0, numSegments + 1);
            }
            break;
        }
        case L5.Visual.PT_POLYSEGMENTS_DISJOINT:
        {
            numSegments = visual.getNumSegments ();
            if (numSegments > 0) {
                gl.drawArrays (gl.LINES, 0, 2 * numSegments);
            }
            break;
        }
        case L5.Visual.PT_POLYPOINT:
        {
            var numPoints = visual.getNumPoints ();
            if (numPoints > 0) {
                gl.drawArrays (gl.POINTS, 0, numPoints);
            }
            break;
        }
        default:
            L5.assert (false, 'Invalid type');
    }
};
//----------------------------------------------------------------------------
