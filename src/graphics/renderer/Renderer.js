/**
 * Renderer 渲染器
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */

L5.Renderer = function(
    canvas
) {
    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = canvas.getContext('webgl');


};

L5.nameFix(L5.Renderer, 'Renderer');

/**
 *
 * @param width {number}
 * @param height {number}
 * @param colorFormat {number} L5.TEXTURE_FORMAT_XXX
 * @param depthStencilFormat {number} L5.TEXTURE_FORMAT_XXX
 * @param numMultiSamples {number}
 */
L5.Renderer.prototype.initialize = function(
    width, height, colorFormat, depthStencilFormat, numMultiSamples
){

    this._loadExt();

    this.width = width;
    this.height = height;
    this.colorFormat = colorFormat;
    this.depthStencilFormat = depthStencilFormat;
    this.numMultiSamples = numMultiSamples;

    // 全局状态
    this.alphaState   = new L5.AlphaState();
    this.cullState    = new L5.CullState();
    this.depthState   = new L5.DepthState();
    this.offsetState  = new L5.OffsetState();
    this.stencilState = new L5.StencilState();
    //this.wireState    = new L5.WireState();

    this.defaultAlphaState   = new L5.AlphaState();
    this.defaultCullState    = new L5.CullState();
    this.defaultDepthState   = new L5.DepthState();
    this.defaultOffsetState  = new L5.OffsetState();
    this.defaultStencilState = new L5.StencilState();
    //this.defaultWireState    = new L5.WireState();


    // 覆盖全局状态
    this.overrideAlphaState   = new L5.AlphaState();
    this.overrideCullState    = new L5.CullState();
    this.overrideDepthState   = new L5.DepthState();
    this.overrideOffsetState  = new L5.OffsetState();
    this.overrideStencilState = new L5.StencilState();
    //this.overrideWireState    = new L5.WireState();


    this.reverseCullOrder = false;

    // Geometric transformation pipeline.  The camera stores the view,
    // projection, and postprojection matrices.
    this.camera = null;


    // Access to the current clearing parameters for the color, depth, and
    // stencil buffers.  The color buffer is the back buffer.
    this.clearColor = new Float32Array(4);
    this.clearDepth = 1.0;
    this.clearStencil = 0;

    // Channel masking for the back buffer., allow rgba,
    this._colorMask = (0x1 | 0x2 |0x4 | 0x8);

    // 框架结构对应到底层结构
    this.vertexFormats = new Map();
    this.vertexBuffers = new Map();
    this.indexBuffers  = new Map();
    this.texture2Ds    = new Map();
    this.texture3Ds    = new Map();
    this.textureCubes  = new Map();
    this.renderTargets = new Map();
    this.vertexShaders = new Map();
    this.fragShaders   = new Map();

    this.renderers = new Set();

    // The platform-specific data.  It is in public scope to allow the
    // renderer resource classes to access it.
    this.data = null;

};

L5.Renderer.prototype._loadExt = function() {
    var gl = this.gl;
    var c;

    var ext = gl.getExtension('EXT_texture_filter_anisotropic');
    for (c in ext) {
        if (ext.hasOwnProperty(c)) {
            gl[c] = ext[c];
        }
    }
};

L5.Renderer.prototype.terminate = function(){};


// 访问当前摄像机状态
L5.Renderer.prototype.getViewMatrix = function(){};
L5.Renderer.prototype.getProjectionMatrix = function(){};
L5.Renderer.prototype.getPostProjectionMatrix = function(){};

// Compute a picking ray from the specified left-handed screen
// coordinates (x,y) and using the current camera.  The output
// 'origin' is the camera position and the 'direction' is a
// unit-length vector.  Both are in world coordinates.  The return
// value is 'true' iff (x,y) is in the current viewport.
/**
 *
 * @param x {number} in
 * @param y {number} in
 * @param origin {L5.Point} out
 * @param direction {L5.Vector} out
 */
L5.Renderer.prototype.getPickRay = function(
    x, y, origin, direction
){

};


// === 资源管理
// 资源对象是已定义的
//    VertexFormat
//    VertexBuffer
//    IndexBuffer
//    Texture(2d, cube),
//    RenderTarget
//    VertexShader
//    FragmentShader
//
// bind:  创建对象对应的资源
//    渲染器维护对象和资源之间的映射，大多数情况下，显存中会分配一个资源对应对象在系统内存对应的副本
//    如果在bind之前调用了 enable 或 lock, 渲染器会创建一个资源而不是抛出异常
//
// bindAll:  为所有的渲染器对象创建对应的资源
//
// unbind:  销毁对象对应的资源
//    渲染器会移除对象-资源映射，和资源，但不会移除对象，所以对象可以重新绑定
//
// unbindAll:  销毁所有渲染器对象创建的资源和对象本身
//
// enable: 在drawPrimitive之前调用，激活资源，以便在本次渲染中使用
//
// disable: 在drawPrimitive之后调用, 取消激活资源，以便下次渲染中不使用
//
// lock:  获取一个显存资源位置
//    使用这个方法更新显存, 如果要这么干，请注意更新失败的情况，因为内存和显存复制不同步;
//    也可以锁定后只读，在这种情况下显存内容是保留的;
//    尽可能让资源锁定状态保持最少的时间
//
// unlock:  释放一个显存资源位置
//
// update:  锁定资源占用的显存，并复制内存数据到显存。渲染器会自动调用
//
// updateAll:  和update类似，但它更新所有渲染器共享的资源
//
// readColor:  只能由RenderTarget调用, 在调用时, RenderTarget必须是未激活状态
//    方法返回一个2D纹理对象，包含renderTarget在显存中的颜色值
// === 资源管理


/**
 * Access to the current color channel masks.
 * allowRed : 0x1
 * allowGreen: 0x2
 * allowBlue: 0x4
 * allowAlpha: 0x8
 * return
 */
L5.Renderer.prototype.getColorMask = function(){
    return (0x1 | 0x2 |0x4 | 0x8);
};

// Override the global state.  If overridden, this state is used instead
// of the VisualPass state during a drawing call.  To undo the override,
// pass a null pointer.

Object.defineProperties(L5.Renderer.prototype, {
    overrideAlphaState: {
        get : function(){},
        set : function(val) {
            this._overrideAlphaState = val;
            if (val) {

            }
        }
    },
    overrideCullState: {
        get : function(){},
        set : function(val) {this._overrideCullState = val;}
    },
    overrideDepthState: {
        get : function(){},
        set : function(val) {this._overrideDepthState = val;}
    },
    overrideOffsetState: {
        get : function(){},
        set : function(val) {this._overrideOffsetState = val;}
    },
    overrideStencilState: {
        get : function(){},
        set : function(val) {this._overrideStencilState = val;}
    },
    overrideWireState: {
        get : function(){},
        set : function(val) {this._overrideWireState = val;}
    }
});

// The entry point to drawing the visible set of a scene tree.
/**
 * @param visibleSet {L5.VisibleSet}
 * @param globalEffect {*}
 */
L5.Renderer.prototype.draw = function(
    visibleSet, globalEffect
) {

};

/**
 * 渲染单个对象
 * @param visual {L5.Visual}
 * @param instance {L5.VisualEffectInstance}
 */
L5.Renderer.prototype.draw = function(
    visual, instance
) {

};

// The entry point for drawing 3D objects, called by the single-object
// Draw function.
/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype._drawPrimitive = function (
    visual
) {};

//============================================================================


// Viewport management.  The viewport is specified in right-handed screen
// coordinates.  The origin is the lower-left corner of the screen, the
// y-axis points upward, and the x-axis points rightward.
L5.Renderer.prototype.setViewport = function (
    x, y, width, height
) {};
L5.Renderer.prototype.getViewport = function(){
    return {x:0,y:0,width:300,height:150};
};

L5.Renderer.prototype.setDepthRange = function (
    min, max
) {};
L5.Renderer.prototype.getDepthRange = function () {
    return {min:0,max:1};
};
L5.Renderer.prototype.resize = function (
    width, height
) {};

// Support for clearing the color, depth, and stencil buffers.
L5.Renderer.prototype.clearColorBuffer = function(){};
L5.Renderer.prototype.clearDepthBuffer = function(){};
L5.Renderer.prototype.clearStencilBuffer = function(){};
L5.Renderer.prototype.clearBuffers = function(){};
L5.Renderer.prototype.clearColorBuffer = function(x,y,w,h){};
L5.Renderer.prototype.clearDepthBuffer = function(x,y,w,h){};
L5.Renderer.prototype.clearStencilBuffer = function(x,y,w,h){};
L5.Renderer.prototype.clearBuffers = function(x,y,w,h){};
L5.Renderer.prototype.displayColorBuffer = function(){};

// Support for masking color channels during drawing.
L5.Renderer.prototype.setColorMask = function(
    allowRed, allowGreen, allowBlue, allowAlpha
){};

// Support for predraw and postdraw semantics.  All Renderer abstract
// interface functions and drawing functions must occur within a block of
// code bounded by PreDraw() and PostDraw().  The general format is
//   if (renderer->PreDraw())
//   {
//       <abstract-interface renderer calls and draw calls>;
//       renderer->PostDraw();
//   }
L5.Renderer.prototype.preDraw = function () {
    return true;
};

L5.Renderer.prototype.postDraw = function () {};

// The entry point for drawing 2D buffers (for 2D applications).
L5.Renderer.prototype.draw = function(
    screenBuffer, reflectY
) {};

// The entry point for drawing 2D text.
L5.Renderer.prototype.draw = function(
    x,y, color,message
){};

// For render target access to allow creation of color/depth textures.
L5.Renderer.prototype.inTexture2DMap = function(
    texture
) {
    return true;
};
L5.Renderer.prototype.insertInTexture2DMap = function (
    texture, platformTexture
) {

};

L5.Renderer.updateAll = function(
    obj /*, params... */
) {
    switch(obj.constructor.name)
    {
        case "Texture2D":
            this._updateAllTexture2D(obj, arguments[1]);
            break;
        case "Texture3D":
            this._updateAllTexture3D(obj, arguments[1], arguments[2]);
            break;
        case "TextureCube":
            this._updateAllTextureCube(obj, arguments[1],arguments[2]);
            break;
        case "VertexBuffer":
            this._updateAllVertexBuffer(obj);
            break;
        case "IndexBuffer":
            this._updateAllIndexBuffer(obj);
            break;
        default :
            L5.assert(false, obj.constructor.name + 'not support [updateAll] method.');
    }
};