import { Renderer } from '../graphics/renderer/Renderer';
import { Texture } from '../graphics/resources/Texture';
import { Input } from '../input/index';

class BaseApplication {
    /**
     * @param {string} title - 应用名称
     * @param {number} width - 绘制区域宽度
     * @param {number} height - 绘制区域高度
     * @param {Float32Array} clearColor - 背景颜色
     * @param {string} canvas - 需要渲染的CanvasID
     */
    constructor(title, width, height, clearColor, canvas) {
        BaseApplication._instance = this;
        let renderDOM = document.getElementById(canvas);
        renderDOM = renderDOM || document.createElement('canvas');

        renderDOM.width = width;
        renderDOM.height = height;

        this.title = title;
        this.width = width;
        this.height = height;
        this.clearColor = clearColor;

        this.colorFormat = Texture.TF_A8R8G8B8;
        this.depthStencilFormat = Texture.TF_D24S8;

        this.numMultisamples = 0;

        this.renderer = new Renderer(renderDOM, width, height, clearColor, this.colorFormat, this.depthStencilFormat, this.numMultisamples);
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
    }

    resetTime() {
        this.lastTime = -1;
    }

    run() {
        if (!this.onPreCreate()) return;

        if (!this.fpsOutput) {
            this.fpsOutput = document.createElement('div');
            this.fpsOutput.setAttribute('style', 'position:absolute;top:8px;left:8px;color:' + this.textColor);
            this.renderDOM.parentNode.appendChild(this.fpsOutput);
        }

        // Create the renderer.
        this.renderer.initialize(this.title, this.width, this.height,
            this.colorFormat, this.depthStencilFormat, this.numMultisamples);


        let handles = BaseApplication.handles;
        // TODO : 事件回调定义
        window.addEventListener('resize', handles.ResizeHandler, false);
        window.addEventListener('keydown', handles.KeyDownHandler, false);
        window.addEventListener('keyup', handles.KeyUpHandler, false);
        window.addEventListener('mousemove', handles.MouseMoveHandler, false);

        if (!this.onInitialize()) return -4;

        // The default OnPreidle() clears the buffers.  Allow the application to
        // fill them before the window is shown and before the event loop starts.
        this.onPreIdle();

        this.applicationRun = true;
        let $this = this;
        let loopFunc = function (deltaTime) {
            if (!$this.applicationRun) {
                $this.onTerminate();
                delete $this.renderer;
                delete $this.renderDOM;
                return;
            }
            $this.updateFrameCount();
            $this.measureTime();

            if ($this.loadWait === 0) {
                $this.onIdle.call($this, deltaTime);
            }
            requestAnimationFrame(loopFunc);
        };
        requestAnimationFrame(loopFunc);
    }

    measureTime() {
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
            let currentTime = Date.now();
            let dDelta = currentTime - this.lastTime;
            this.lastTime = currentTime;
            this.accumulatedTime += dDelta;
            this.accumulatedFrameCount += this.frameCount;
            this.frameCount = 0;
            this.timer = this.maxTimer;
        }
    }

    updateFrameCount() {
        ++this.frameCount;
    }

    /**
     * 更新FPS显示
     */
    drawFrameRate() {
        if (this.accumulatedTime > 0) {
            this.frameRate = (this.accumulatedFrameCount / this.accumulatedTime) * 1000;
        }
        else {
            this.frameRate = 0;
        }
        this.renderer.drawText(8, 8, '#666', `fps: ${this.frameRate.toFixed(1)}`);
    }

    getAspectRatio() {
        return this.width / this.height;
    }

    onInitialize() {
        this.renderer.clearColor = this.clearColor;
        return true;
    }

    onTerminate() {
        this.applicationRun = false;
    }

    // 预创建,添加输入事件监听
    onPreCreate() {
        return true;
    }

    onPreIdle() {
        this.renderer.clearBuffers();
    }

    onIdle(t) {
    }

    onKeyDown(key, x, y) {
        if (key === Input.KB_F2) {
            this.resetTime();
            return true;
        }
        return false;
    }

    onKeyUp(key, x, y) {
    }

    onMouseClick(button, state, x, y, modifiers) {
    }

    onMotion(button, x, y, modifiers) {
    }

    onPassiveMotion(x, y) {
    }

    onMouseWheel(delta, x, y, modifiers) {
    }

    onResize(w, h) {
        if (w > 0 && h > 0) {
            if (this.renderer) {
                this.renderer.resize(w, h);
                this.renderDOM.width = w;
                this.renderDOM.height = h;
            }
            this.width = w;
            this.height = h;
        }
    }

    getMousePosition() {
    }

    /**
     * @returns {BaseApplication}
     */
    static get instance() {
        return BaseApplication._instance || null;
    }

    /**
     * @param val {BaseApplication}
     */
    static set instance(val) {
        BaseApplication._instance = val;
    }

    static get gButton() {
        return BaseApplication._gButton || -1;
    }

    static set gButton(val) {
        BaseApplication._gButton = val;
    }

    static get gModifyButton() {
        return BaseApplication._gModifyButton || -1;
    }

    static set gModifyButton(val) {
        BaseApplication._gModifyButton = val;
    }

    static get mX() {
        return BaseApplication._mX || 0;
    }

    static set mX(val) {
        BaseApplication._mX = val;
    }

    static get mY() {
        return BaseApplication._mY || 0;
    }

    static set mY(val) {
        BaseApplication._mY = val;
    }

    static get handles() {

        return this._handles || (this._handles = {
            /**
             * 窗口大小调整事件
             * @param evt {Event}
             */
            ResizeHandler: evt => {
                let ins = this.instance;
                if (ins) {
                    ins.onResize(window.innerWidth, window.innerHeight);
                }
            },

            KeyDownHandler: evt => {
                let key = evt.keyCode;
                let ins = this.instance;
                if (ins) {
                    if (key === Input.KB_ESC && evt.ctrlKey) {
                        ins.onTerminate();
                        return;
                    }
                    ins.onKeyDown(key, this.mX, this.mY);
                    ins.onSpecialKeyDown(key, this.mX, this.mY);
                }
            },
            KeyUpHandler: evt => {
                let key = evt.keyCode;
                let ins = this.instance;
                if (ins) {
                    ins.onKeyUp(key, this.mX, this.mY);
                    ins.onSpecialKeyUp(key, this.mX, this.mY);

                }
            },
            MouseMoveHandler: evt => {
                this.mX = evt.x;
                this.mY = evt.y;
            },
            MouseHandler: evt => {
                let ins = this.instance;
                if (ins) {
                    this.gModifyButton = evt.ctrlKey;
                    if (evt.state === 'down') {
                        this.gButton = evt.button;
                    } else {
                        this.gButton = -1;
                    }
                    ins.onMouseClick(evt.button, evt.state, x, y, this.gModifyButton);
                }
            },
            MotionHandler: (x, y) => {
                let ins = this.instance;
                if (ins) {
                    ins.onMotion(this.gButton, x, y, this.gModifyButton);
                }
            },
            PassiveMotionHandler: (x, y) => {
                let ins = this.instance;
                if (ins) {
                    ins.onPassiveMotion(x, y);
                }
            }
        });
    }
}

export { BaseApplication };
