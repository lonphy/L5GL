/**
 * Renderer 渲染器
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */

L5.Renderer = function (canvas, width, height, clearColor, colorFormat, depthStencilFormat, numMultiSamples) {
    /**
     * @type {WebGLRenderingContext}
     */
    var gl = canvas.getContext('webgl', {
        alpha: true,
        depth: true,
        stencil: false
    });
    this.gl = gl;
    this.clearColor = new Float32Array([0, 0, 0, 1]);
    this.clearColor.set(clearColor);
    this.initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples);

    // The platform-specific data.  It is in public scope to allow the
    // renderer resource classes to access it.
    var data = new L5.GLRenderData();
    this.data = data;

    data.maxVShaderImages = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    data.maxFShaderImages = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    data.maxCombinedImages = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

    // Set the default render states.
    data.currentRS.initialize(gl,
        this.defaultAlphaState,
        this.defaultCullState,
        this.defaultDepthState,
        this.defaultOffsetState,
        this.defaultStencilState
    );
    L5.Renderer.renderers.add(this);
};

L5.nameFix(L5.Renderer, 'Renderer');
L5.Renderer.renderers = new Set();

/**
 *
 * @param width {number}
 * @param height {number}
 * @param colorFormat {number} L5.TEXTURE_FORMAT_XXX
 * @param depthStencilFormat {number} L5.TEXTURE_FORMAT_XXX
 * @param numMultiSamples {number}
 */
L5.Renderer.prototype.initialize = function (width, height, colorFormat, depthStencilFormat, numMultiSamples) {

    this._loadExt();

    this.width = width;
    this.height = height;
    this.colorFormat = colorFormat;
    this.depthStencilFormat = depthStencilFormat;
    this.numMultiSamples = numMultiSamples;

    // 全局状态
    this.alphaState = new L5.AlphaState();
    this.cullState = new L5.CullState();
    this.depthState = new L5.DepthState();
    this.offsetState = new L5.OffsetState();
    this.stencilState = new L5.StencilState();

    this.defaultAlphaState = new L5.AlphaState();
    this.defaultCullState = new L5.CullState();
    this.defaultDepthState = new L5.DepthState();
    this.defaultOffsetState = new L5.OffsetState();
    this.defaultStencilState = new L5.StencilState();


    // 覆盖全局状态
    this.overrideAlphaState = new L5.AlphaState();
    this.overrideCullState = new L5.CullState();
    this.overrideDepthState = new L5.DepthState();
    this.overrideOffsetState = new L5.OffsetState();
    this.overrideStencilState = new L5.StencilState();


    this.reverseCullOrder = false;

    // Geometric transformation pipeline.  The camera stores the view,
    // projection, and postprojection matrices.
    this.camera = null;


    // Access to the current clearing parameters for the color, depth, and
    // stencil buffers.  The color buffer is the back buffer.
    this.clearDepth = 1.0;
    this.clearStencil = 0;

    // Channel masking for the back buffer., allow rgba,
    this._colorMask = (0x1 | 0x2 | 0x4 | 0x8);

    // 框架结构对应到底层结构
    this.vertexFormats = new Map();
    this.vertexBuffers = new Map();
    this.indexBuffers = new Map();
    this.texture2Ds = new Map();
    this.texture3Ds = new Map();
    this.textureCubes = new Map();
    this.renderTargets = new Map();
    this.vertexShaders = new Map();
    this.fragShaders = new Map();
    this.programs = new Map();

    var gl = this.gl;
    var cc = this.clearColor;
    gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
    gl.clearDepth(this.clearDepth);
    gl.clearStencil(this.clearStencil);

};

L5.Renderer.prototype._loadExt = function () {
    L5.GLExtensions.init(this.gl);
};

L5.Renderer.prototype.terminate = function () {
};


// 访问当前摄像机状态
L5.Renderer.prototype.getViewMatrix = function () {
};
L5.Renderer.prototype.getProjectionMatrix = function () {
};
L5.Renderer.prototype.getPostProjectionMatrix = function () {
};

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
L5.Renderer.prototype.getPickRay = function (x, y, origin, direction) {

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
L5.Renderer.prototype.getColorMask = function () {
    return (0x1 | 0x2 | 0x4 | 0x8);
};

// Override the global state.  If overridden, this state is used instead
// of the VisualPass state during a drawing call.  To undo the override,
// pass a null pointer.

Object.defineProperties(L5.Renderer.prototype, {
    overrideAlphaState: {
        get: function () {
            return this._overrideAlphaState;
        },
        set: function (val) {
            this._overrideAlphaState = val;
        }
    },
    overrideCullState: {
        get: function () {
            return this._overrideCullState;
        },
        set: function (val) {
            this._overrideCullState = val;
        }
    },
    overrideDepthState: {
        get: function () {
            return this._overrideDepthState;
        },
        set: function (val) {
            this._overrideDepthState = val;
        }
    },
    overrideOffsetState: {
        get: function () {
            return this._overrideOffsetState;
        },
        set: function (val) {
            this._overrideOffsetState = val;
        }
    },
    overrideStencilState: {
        get: function () {
            return this._overrideStencilState;
        },
        set: function (val) {
            this._overrideStencilState = val;
        }
    }
});

/**
 * The entry point to drawing the visible set of a scene tree.
 * @param visibleSet {L5.VisibleSet}
 * @param globalEffect {*}
 */
L5.Renderer.prototype.drawVisibleSet = function (visibleSet, globalEffect) {
    if (!globalEffect) {
        var numVisible = visibleSet.getNumVisible();
        for (var i = 0; i < numVisible; ++i) {
            var visual = visibleSet.getVisible(i);
            this.drawInstance(visual, visual.effect);
        }
    }
    else {
        globalEffect.draw(this, visibleSet);
    }
};

/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype.drawVisible = function (visual) {
    this.drawInstance(visual, visual.effect);
};

/**
 * 渲染单个对象
 * @param visual {L5.Visual}
 * @param instance {L5.VisualEffectInstance}
 */
L5.Renderer.prototype.drawInstance = function (visual, instance) {
    if (!visual) {
        L5.assert(false, 'The visual object must exist.');
        return;
    }

    if (!instance) {
        L5.assert(false, 'The visual object must have an effect instance.');
        return;
    }

    var vformat = visual.format;
    var vbuffer = visual.vertexBuffer;
    var ibuffer = visual.indexBuffer;

    var numPasses = instance.getNumPasses();
    for (var i = 0; i < numPasses; ++i) {
        var pass = instance.getPass(i);
        var vparams = instance.getVertexParameters(i);
        var fparams = instance.getFragParameters(i);
        var program = pass.program;

        // Update any shader constants that vary during runtime.
        vparams.updateConstants(visual, this.camera);
        fparams.updateConstants(visual, this.camera);

        // Set visual state.
        this.setAlphaState(pass.alphaState);
        this.setCullState(pass.cullState);
        this.setDepthState(pass.depthState);
        this.setOffsetState(pass.offsetState);
        this.setStencilState(pass.stencilState);
        //this.setWireState(pass.wireState);

        // enable data
        this._enableProgram(program, vparams, fparams);
        this._enableVertexBuffer(vbuffer);
        this._enableVertexFormat(vformat, program);
        if (ibuffer) {
            this._enableIndexBuffer(ibuffer);
        }

        // Draw the primitive.
        this.drawPrimitive(visual);

        // disable data
        if (ibuffer) {
            this._disableIndexBuffer(ibuffer);
        }
        this._disableVertexFormat(vformat);
        this._disableVertexBuffer(vbuffer);

        // Disable the shaders.
        this._disableProgram(program, vparams, fparams);
    }
};

// The entry point for drawing 3D objects, called by the single-object
// Draw function.
/**
 * @param visual {L5.Visual}
 */
L5.Renderer.prototype._drawPrimitive = function (visual) {
};

//============================================================================
/**
 * 设置渲染视口
 * @param x {int}
 * @param y {int}
 * @param width {int}
 * @param height {int}
 */
L5.Renderer.prototype.setViewport = function (x, y, width, height) {
    this.gl.viewport(x, y, width, height);
};
/**
 * 获取渲染视口参数
 * @returns {Array<int>}
 */
L5.Renderer.prototype.getViewport = function () {
    var gl = this.gl;
    return gl.getParameter(gl.VIEWPORT);
};
/**
 * 调整渲染视口大小
 * @param width {int}
 * @param height {int}
 */
L5.Renderer.prototype.resize = function (width, height) {
    this.width = width;
    this.height = height;
    var gl = this.gl;
    var p = gl.getParameter(gl.VIEWPORT);
    gl.viewport(p[0], p[1], width, height);
};

/**
 * 设置深度测试范围
 * @param min {float}
 * @param max {float}
 */
L5.Renderer.prototype.setDepthRange = function (min, max) {
    this.gl.depthRange(min, max);
};
/**
 * 获取当前深度测试范围
 * @returns {Array<int>}
 */
L5.Renderer.prototype.getDepthRange = function () {
    var gl = this.gl;
    return gl.getParameter(gl.DEPTH_RANGE);
};


// Support for clearing the color, depth, and stencil buffers.
L5.Renderer.prototype.clearColorBuffer = function () {
};
L5.Renderer.prototype.clearDepthBuffer = function () {
};
L5.Renderer.prototype.clearStencilBuffer = function () {
};
L5.Renderer.prototype.clearColorBuffer = function (x, y, w, h) {
};
L5.Renderer.prototype.clearDepthBuffer = function (x, y, w, h) {
};
L5.Renderer.prototype.clearStencilBuffer = function (x, y, w, h) {
};
L5.Renderer.prototype.displayColorBuffer = function () {
};

// The entry point for drawing 2D text.
L5.Renderer.prototype.draw = function (x, y, color, message) {
};

// For render target access to allow creation of color/depth textures.
L5.Renderer.prototype.inTexture2DMap = function (texture) {
    return true;
};
L5.Renderer.prototype.insertInTexture2DMap = function (texture, platformTexture) {

};

L5.Renderer.updateAll = function (obj /*, params... */) {
    switch (obj.constructor.name) {
        case "Texture2D":
            this._updateAllTexture2D(obj, arguments[1]);
            break;
        case "Texture3D":
            this._updateAllTexture3D(obj, arguments[1], arguments[2]);
            break;
        case "TextureCube":
            this._updateAllTextureCube(obj, arguments[1], arguments[2]);
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