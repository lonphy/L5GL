/**
 *
 * @param title
 * @param width
 * @param height
 * @param clearColor
 * @param canvas
 * @class
 */
L5.Application = function (
    title, width, height, clearColor, canvas
) {
    var renderDOM = document.getElementById(canvas);
    renderDOM = renderDOM || document.createElement('canvas');

    renderDOM.width = width;
    renderDOM.height = height;

    this.title      = title; // 实例名称
    this.width      = width;
    this.height     = height;
    this.clearColor = clearColor;

    this.colorFormat        = L5.Texture.TF_A8R8G8B8;
    this.depthStencilFormat = L5.Texture.TF_D24S8;

    this.numMultisamples = 0;

    this.renderer = new L5.Renderer(renderDOM);
    this.renderDOM = renderDOM;

    this.lastTime        = -1;
    this.accumulatedTime = 0;
    this.frameRate       = 0;

    this.frameCount            = 0;
    this.accumulatedFrameCount = 0;
    this.timer                 = 30;
    this.maxTimer              = 30;
};

L5.Application.prototype.resetTime        = function () {
    this.lastTime = -1;
};

L5.Application.prototype.run = function () {

    if (!this.onPrecreate())
    {
        return -2;
    }

    // Create the renderer.
    this.renderer.initialize(this.title, this.width, this.height,
        this.colorFormat, this.depthStencilFormat, this.numMultisamples);


    if (!this.onInitialize())
    {
        return -4;
    }

    // The default OnPreidle() clears the buffers.  Allow the application to
    // fill them before the window is shown and before the event loop starts.
    this.onPreidle();

    // Run event loop.
    // RunApplicationEventLoop();


    this.onTerminate();
    delete this.renderer;
    delete this.renderDOM;

    return 0;
};
L5.Application.prototype.measureTime      = function () {
    // start performance measurements
    if (this.lastTime === -1.0) {
        this.lastTime = Data.now();
        this.accumulatedTime = 0;
        this.frameRate = 0;
        this.frameCount = 0;
        this.accumulatedFrameCount = 0;
        this.timer = this.maxTimer;
    }

    // accumulate the time only when the miniature time allows it
    if (--mTimer === 0)
    {
        var currentTime = Data.now();
        var dDelta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulatedTime += dDelta;
        this.accumulatedFrameCount += this.frameCount;
        this.frameCount = 0;
        this.timer = this.maxTimer;
    }
};
L5.Application.prototype.updateFrameCount = function () {
    ++this.frameCount;
};
/**
 * 更新FPS显示
 * @param x
 * @param y
 * @param color
 */
L5.Application.prototype.drawFrameRate    = function (
    x, y, color
) {
    if (this.accumulatedTime > 0)
    {
        this.frameRate = this.accumulatedFrameCount/this.accumulatedTime;
    }
    else
    {
        this.frameRate = 0;
    }
    this.renderer.draw(x, y, color, 'fps: '+this.frameRate.toFixed(1));
};
L5.Application.prototype.getAspectRatio = function () {
    return this.width / this.height;
};


L5.Application.prototype.onInitialize     = function () {
    this.renderer.clearColor = this.clearColor;
    return true;
};
L5.Application.prototype.onTerminate      = function () {};
L5.Application.prototype.onPrecreate      = function () {
    return true;
};
L5.Application.prototype.onPreidle        = function () {
    this.renderer.clearBuffers ();
};
L5.Application.prototype.onDisplay        = function () {};
L5.Application.prototype.onIdle           = function () {};
L5.Application.prototype.onKeyDown        = function (key, x, y) {
    if (key == '?') {
        this.resetTime ();
        return true;
    }
    return false;
};
L5.Application.prototype.onKeyUp          = function (key, x, y) {};
L5.Application.prototype.onSpecialKeyDown = function (key, x, y) {};
L5.Application.prototype.onSpecialKeyUp   = function (key, x, y) {};
L5.Application.prototype.onMouseClick     = function (button, state, x, y, modifiers) {};
L5.Application.prototype.onMotion         = function (button, x, y, modifiers) {};
L5.Application.prototype.onPassiveMotion  = function (x, y) {};
L5.Application.prototype.onMouseWheel     = function (delta, x, y, modifiers) {};

L5.Application.prototype.getMousePosition = function () {};