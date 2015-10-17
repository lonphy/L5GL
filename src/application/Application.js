/**
 * 默认应用核心类
 *
 * @version 1.0
 * @author lonphy
 */
// 事件处理器
var handles = {
    /**
     * 窗口大小调整事件
     * @param evt {Event}
     */
    ResizeHandler: function (evt) {
        var ins = L5.Application.instance;
        if (ins) {
            var r = evt.target.document.documentElement;
            ins.onResize(r.clientWidth, r.clientHeight);
        }
    },

    KeyDownHandler: function (evt) {
        var key = evt.keyCode;
        var ins = L5.Application.instance;
        if (ins) {
            if (key === L5.Input.KB_ESC && evt.ctrlKey) {
                ins.onTerminate();
                return;
            }
            ins.onKeyDown(key, L5.Application.mX, L5.Application.mY);
            ins.onSpecialKeyDown(key, L5.Application.mX, L5.Application.mY);
        }
    },
    KeyUpHandler: function (evt) {
        var key = evt.keyCode;
        var ins = L5.Application.instance;
        if (ins) {
            ins.onKeyUp(key, L5.Application.mX, L5.Application.mY);
            ins.onSpecialKeyUp(key, L5.Application.mX, L5.Application.mY);

        }
    },
    MouseMoveHandler: function (evt) {
        L5.Application.mX = evt.x;
        L5.Application.mY = evt.y;
    },
    MouseHandler: function (evt) {
        var ins = L5.Application.instance;
        if (ins) {
            L5.Application.gModifyButton = evt.ctrlKey;
            if (evt.state === 'down') {
                L5.Application.gButton = evt.button;
            } else {
                L5.Application.gButton = -1;
            }
            ins.onMouseClick(evt.button, evt.state, x, y, L5.Application.gModifyButton);
        }
    },
    MotionHandler: function (x, y) {
        var ins = L5.Application.instance;
        if (ins) {
            ins.onMotion(L5.Application.gButton, x, y, L5.Application.gModifyButton);
        }
    },
    PassiveMotionHandler: function (x, y) {
        var ins = L5.Application.instance;
        if (ins) {
            ins.onPassiveMotion(x, y);
        }
    }
};

/**
 * 应用基类
 * @param title
 * @param width
 * @param height
 * @param clearColor
 * @param canvas
 *
 * @class
 */
L5.Application = function (title, width, height, clearColor, canvas) {
    L5.Application.instance = this;

    var renderDOM = document.getElementById(canvas);
    renderDOM = renderDOM || document.createElement('canvas');

    renderDOM.width = width;
    renderDOM.height = height;

    this.title = title; // 实例名称
    this.width = width;
    this.height = height;
    this.clearColor = clearColor;

    this.colorFormat = L5.Texture.TF_A8R8G8B8;
    this.depthStencilFormat = L5.Texture.TF_D24S8;

    this.numMultisamples = 0;

    this.renderer = new L5.Renderer(renderDOM, width, height, clearColor, this.colorFormat, this.depthStencilFormat, this.numMultisamples);
    this.renderDOM = renderDOM;

    this.lastTime = -1;
    this.accumulatedTime = 0;
    this.frameRate = 0;

    this.frameCount = 0;
    this.accumulatedFrameCount = 0;
    this.timer = 30;
    this.maxTimer = 30;

    this.textColor = '#000';

    this.loadWait = 0;

    this.applicationRun = false;
};

L5.Application.prototype.resetTime = function () {
    this.lastTime = -1;
};

L5.Application.prototype.run = function () {

    if (!this.onPreCreate()) {
        return -2;
    }

    if (!this.fpsOutput) {

        this.fpsOutput = document.createElement('div');
        this.fpsOutput.setAttribute('style', 'position:absolute;top:8px;left:8px;color:' + this.textColor);
        this.renderDOM.parentNode.appendChild(this.fpsOutput);
    }

    // Create the renderer.
    this.renderer.initialize(this.title, this.width, this.height,
        this.colorFormat, this.depthStencilFormat, this.numMultisamples);


    // TODO : 事件回调定义
    window.addEventListener('resize', handles.ResizeHandler, false);
    window.addEventListener('keydown', handles.KeyDownHandler, false);
    window.addEventListener('keyup', handles.KeyUpHandler, false);
    window.addEventListener('mousemove', handles.MouseMoveHandler, false);
    //glutSpecialFunc(SpecialKeyDownCallback);
    //glutSpecialUpFunc(SpecialKeyUpCallback);
    //glutMouseFunc(MouseClickCallback);
    //glutMotionFunc(MotionCallback);
    //glutPassiveMotionFunc(PassiveMotionCallback);

    if (!this.onInitialize()) {
        return -4;
    }

    // The default OnPreidle() clears the buffers.  Allow the application to
    // fill them before the window is shown and before the event loop starts.
    this.onPreIdle();

    // Run event loop.
    this.applicationRun = true;
    var $this = this;
    var loopFunc = function () {
        if (!$this.applicationRun) {
            $this.onTerminate();
            delete $this.renderer;
            delete $this.renderDOM;
            return;
        }
        $this.updateFrameCount();
        requestAnimationFrame(loopFunc);
        if ($this.loadWait === 0) {
            $this.onIdle.call($this);
        }
    };
    requestAnimationFrame(loopFunc);

    return 0;
};
L5.Application.prototype.measureTime = function () {
    // start performance measurements
    if (this.lastTime === -1.0) {
        this.lastTime = Date.now();
        this.accumulatedTime = 0;
        this.frameRate = 0;
        this.frameCount = 0;
        this.accumulatedFrameCount = 0;
        this.timer = this.maxTimer;
    }

    // accumulate the time only when the miniature time allows it
    if (--this.timer === 0) {
        var currentTime = Date.now();
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
 */
L5.Application.prototype.drawFrameRate = function () {
    if (this.accumulatedTime > 0) {
        this.frameRate = (this.accumulatedFrameCount / this.accumulatedTime) * 1000;
    }
    else {
        this.frameRate = 0;
    }
    this.fpsOutput.textContent = 'fps: ' + this.frameRate.toFixed(1);
};
L5.Application.prototype.getAspectRatio = function () {
    return this.width / this.height;
};


L5.Application.prototype.onInitialize = function () {
    this.renderer.clearColor = this.clearColor;
    return true;
};
L5.Application.prototype.onTerminate = function () {
    this.applicationRun = false;
};

// 预创建,添加输入事件监听
L5.Application.prototype.onPreCreate = function () {
    return true;
};

L5.Application.prototype.onPreIdle = function () {
    this.renderer.clearBuffers();
};
L5.Application.prototype.onIdle = function () {
};
L5.Application.prototype.onKeyDown = function (key, x, y) {
    if (key === L5.Input.KB_F2) {
        this.resetTime();
        return true;
    }
    return false;
};
L5.Application.prototype.onKeyUp = function (key, x, y) {
};
L5.Application.prototype.onMouseClick = function (button, state, x, y, modifiers) {
};
L5.Application.prototype.onMotion = function (button, x, y, modifiers) {
};
L5.Application.prototype.onPassiveMotion = function (x, y) {
};
L5.Application.prototype.onMouseWheel = function (delta, x, y, modifiers) {
};

L5.Application.prototype.onResize = function (w, h) {
    if (w > 0 && h > 0) {
        if (this.renderer) {
            this.renderer.resize(w, h);
            this.renderDOM.width = w;
            this.renderDOM.height = h;
        }
        this.width = w;
        this.height = h;
    }
};
L5.Application.prototype.getMousePosition = function () {
};


/**
 * 应用实例
 * @type {L5.Application}
 */
L5.Application.instance = null;
L5.Application.gButton = -1;
L5.Application.gModifyButton = -1;
L5.Application.mX = 0;
L5.Application.mY = 0;