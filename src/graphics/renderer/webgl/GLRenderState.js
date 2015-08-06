/**
 * maintain current render states to avoid redundant state changes.
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLRenderState = function () {
    // AlphaState
    this.alphaBlendEnabled = false;
    this.alphaSrcBlend     = 0;
    this.alphaDstBlend     = 0;
    this.blendColor        = new Float32Array ([ 0, 0, 0, 0 ]);

    // CullState
    this.cullEnabled = false;
    this.CCWOrder    = true;

    // DepthState
    this.depthEnabled         = true;
    this.depthWriteEnabled    = true;
    this.depthCompareFunction = true;

    // OffsetState
    this.fillEnabled  = false;
    this.lineEnabled  = false;
    this.pointEnabled = false;
    this.offsetScale  = 0;
    this.offsetBias   = 0;

    // StencilState
    this.stencilEnabled         = false;
    this.stencilCompareFunction = false;
    this.stencilReference       = false;
    this.stencilMask            = false;
    this.stencilWriteMask       = false;
    this.stencilOnFail          = false;
    this.stencilOnZFail         = false;
    this.stencilOnZPass         = false;

    // WireState
    this.wireEnabled = false;
};
L5.nameFix (L5.GLRenderState, 'GLRenderState');

/**
 *
 * @param alphaState {L5.AlphaState}
 * @param cullState {L5.CullState}
 * @param depthState {L5.DepthState}
 * @param offsetState {L5.OffsetState}
 * @param stencilState {L5.StencilState}
 */
L5.GLRenderState.prototype.initialize = function (
    alphaState, cullState, depthState, offsetState, stencilState
) {
    // @fixme
    /**
     * @type {WebGLRenderingContext}
     */
    var gl = null;
    var op = [ 'disable', 'enable' ];

    // AlphaState
    this.alphaBlendEnabled = alphaState.blendEnabled;
    this.alphaSrcBlend     = L5.Webgl.AlphaBlend[ alphaState.srcBlend ];
    this.alphaDstBlend     = L5.Webgl.AlphaBlend[ alphaState.dstBlend ];
    this.blendColor        = alphaState.constantColor;

    gl[ op[ this.alphaBlendEnabled | 0 ] ] (gl.BLEND);
    gl.blendFunc (this.alphaSrcBlend, this.alphaDstBlend);
    gl.blendColor (this.blendColor[ 0 ], this.blendColor[ 1 ], this.blendColor[ 2 ], this.blendColor[ 3 ]);

    // CullState
    this.cullEnabled = cullState.enabled;
    this.CCWOrder    = cullState.CCWOrder;

    gl[ op[ this.cullEnabled | 0 ] ] (gl.CULL_FACE);
    gl.frontFace (gl.CCW);
    gl.cullFace (this.CCWOrder ? gl.BACK : gl.FRONT);

    // DepthState
    this.depthEnabled         = depthState.enabled;
    this.depthWriteEnabled    = depthState.writable;
    this.depthCompareFunction = gOGLDepthCompare[ depthState.compare ];

    gl[ op[ this.depthEnabled | 0 ] ] (gl.DEPTH_TEST);
    gl.depthMask (this.depthWriteEnabled);
    gl.depthFunc (this.depthCompareFunction);

    // OffsetState
    this.fillEnabled  = offsetState.fillEnabled;
    this.lineEnabled  = offsetState.lineEnabled;
    this.pointEnabled = offsetState.pointEnabled;
    this.offsetScale  = offsetState.scale;
    this.offsetBias   = offsetState.bias;

    gl[ op[ this.fillEnabled | 0 ] ] (gl.POLYGON_OFFSET_FILL);
    gl[ op[ this.lineEnabled | 0 ] ] (gl.POLYGON_OFFSET_LINE);
    gl[ op[ this.pointEnabled | 0 ] ] (gl.POLYGON_OFFSET_POINT);
    gl.polygonOffset (this.offsetScale, this.offsetBias);

    // StencilState
    this.stencilEnabled         = stencilState.enabled;
    this.stencilCompareFunction = gOGLStencilCompare[ stencilState.compare ];
    this.stencilReference       = stencilState.reference;
    this.stencilMask            = stencilState.mask;
    this.stencilWriteMask       = stencilState.writeMask;
    this.stencilOnFail          = gOGLStencilOperation[ stencilState.onFail ];
    this.stencilOnZFail         = gOGLStencilOperation[ stencilState.onZFail ];
    this.stencilOnZPass         = gOGLStencilOperation[ stencilState.onZPass ];

    gl[ op[ this.stencilEnabled | 0 ] ] (gl.STENCIL_TEST);
    gl.stencilFunc (this.stencilCompareFunction, this.stencilReference, this.stencilMask);
    gl.stencilMask (this.stencilWriteMask);
    gl.stencilOp (this.stencilOnFail, this.stencilOnZFail, this.stencilOnZPass);
};
