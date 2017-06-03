/**
 * Renderer
 * @author lonphy
 * @version 2.0
 */
import { WebGL_VERSION } from '../../util/version'
import {
	webgl,
	GLRenderData,
	GLExtensions,
	GLVertexShader,
	GLFragShader,
	GLProgram,
	GLIndexBuffer,
	GLVertexBuffer,
	GLVertexFormat,
	GLTexture2D,
	GLTextureCube,
	GLRenderTarget
} from './webgl/namespace'
import { AlphaState, CullState, DepthState, OffsetState, StencilState } from '../shaders/namespace'
import { Visual } from '../sceneTree/Visual'

export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} width
     * @param {number} height
     * @param clearColor
     * @param colorFormat
     * @param depthStencilFormat
     * @param {number} numMultiSamples
     */
	constructor(canvas, width, height, clearColor, colorFormat, depthStencilFormat, numMultiSamples) {
        /**
         * @type {WebGLRenderingContext}
         */
		let gl = canvas.getContext(WebGL_VERSION, {
			alpha: true,
			depth: true,
			stencil: true,
			antialias: true
		});
		this.gl = gl;
		this.clearColor = new Float32Array([0, 0, 0, 1]);
		this.clearColor.set(clearColor);
		this.initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples);

		// The platform-specific data.  It is in public scope to allow the
		// renderer resource classes to access it.
		let data = new GLRenderData();
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
		Renderer.renderers.add(this);
	}

    /**
     * @returns {Set<Renderer>}
     */
	static get renderers() {
		return (Renderer._renderers || (Renderer._renderers = new Set()));
	}

    /**
     * @param width {number}
     * @param height {number}
     * @param colorFormat {number} TEXTURE_FORMAT_XXX
     * @param depthStencilFormat {number} TEXTURE_FORMAT_XXX
     * @param numMultiSamples {number}
     */
	initialize(width, height, colorFormat, depthStencilFormat, numMultiSamples) {

		GLExtensions.init(this.gl);

		this.width = width;
		this.height = height;
		this.colorFormat = colorFormat;
		this.depthStencilFormat = depthStencilFormat;
		this.numMultiSamples = numMultiSamples;

		// global render state
		this.alphaState = new AlphaState();
		this.cullState = new CullState();
		this.depthState = new DepthState();
		this.offsetState = new OffsetState();
		this.stencilState = new StencilState();

		this.defaultAlphaState = new AlphaState();
		this.defaultCullState = new CullState();
		this.defaultDepthState = new DepthState();
		this.defaultOffsetState = new OffsetState();
		this.defaultStencilState = new StencilState();


		// override global state
		this.overrideAlphaState = null;
		this.overrideCullState = null;
		this.overrideDepthState = null;
		this.overrideOffsetState = null;
		this.overrideStencilState = null;


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
	}

	terminate() {
	}

    /**
     * Compute a picking ray from the specified left-handed screen
     * coordinates (x,y) and using the current camera.  The output
     * 'origin' is the camera position and the 'direction' is a
     * unit-length vector.  Both are in world coordinates.
     * The return value is 'true' iff (x,y) is in the current viewport.
     *
     * @param x {number} in
     * @param y {number} in
     * @param origin {Point} out
     * @param direction {Vector} out
     */
	getPickRay(x, y, origin, direction) {
	}

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
	getColorMask() {
		return (0x1 | 0x2 | 0x4 | 0x8);
	}

	// Override the global state.  If overridden, this state is used instead
	// of the VisualPass state during a drawing call.  To undo the override,
	// pass a null pointer.
	get overrideAlphaState() {
		return this._overrideAlphaState;
	}

	set overrideAlphaState(val) {
		this._overrideAlphaState = val;
	}

	get overrideCullState() {
		return this._overrideCullState;
	}

	set overrideCullState(val) {
		this._overrideCullState = val;
	}

	get overrideDepthState() {
		return this._overrideDepthState;
	}

	set overrideDepthState(val) {
		this._overrideDepthState = val;
	}

	get overrideOffsetState() {
		return this._overrideOffsetState;
	}

	set overrideOffsetState(val) {
		this._overrideOffsetState = val;
	}

	get overrideStencilState() {
		return this._overrideStencilState;
	}

	set overrideStencilState(val) {
		this._overrideStencilState = val;
	}

    /**
     * The entry point to drawing the visible set of a scene tree.
     * @param visibleSet {VisibleSet}
     * @param globalEffect {*}
     */
	drawVisibleSet(visibleSet, globalEffect = null) {
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
	}

    /**
     * @param visual {Visual}
     */
	drawVisible(visual) {
		this.drawInstance(visual, visual.effect);
	}


    /**
     * 渲染单个对象
     * @param visual {Visual}
     * @param instance {VisualEffectInstance}
     */
	drawInstance(visual, instance) {
		if (!visual) {
			console.assert(false, 'The visual object must exist.');
			return;
		}

		if (!instance) {
			console.assert(false, 'The visual object must have an effect instance.');
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
	}

    /**
     * The entry point for drawing 3D objects, called by the single-object
     * Draw function.
     * @param visual {Visual}
     */
	_drawPrimitive(visual) {
	}

    /**
     * 设置渲染视口
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     */
	setViewport(x, y, width, height) {
		this.gl.viewport(x, y, width, height);
	}

    /**
     * 获取渲染视口参数
     * @returns {Array<number>}
     */
	getViewport() {
		let gl = this.gl;
		return gl.getParameter(gl.VIEWPORT);
	}

    /**
     * 调整渲染视口大小
     * @param width {number}
     * @param height {number}
     */
	resize(width, height) {
		this.width = width;
		this.height = height;
		var gl = this.gl;
		var p = gl.getParameter(gl.VIEWPORT);
		gl.viewport(p[0], p[1], width, height);
	}

    /**
     * 设置深度测试范围
     * @param min {number}
     * @param max {number}
     */
	setDepthRange(min, max) {
		this.gl.depthRange(min, max);
	}

    /**
     * 获取当前深度测试范围
     * @returns {Array<number>}
     */
	getDepthRange() {
		var gl = this.gl;
		return gl.getParameter(gl.DEPTH_RANGE);
	}

	// Support for clearing the color, depth, and stencil buffers.
	clearColorBuffer(x = 0, y = 0, w = 0, h = 0) {
	}

	clearDepthBuffer(x = 0, y = 0, w = 0, h = 0) {
	}

	clearStencilBuffer(x = 0, y = 0, w = 0, h = 0) {
	}

	displayColorBuffer() {
	}

	// For render target access to allow creation of color/depth textures.
	inTexture2DMap(texture) {
		return true;
	}

	insertInTexture2DMap(texture, platformTexture) {
	}


	static updateAll(obj /*, params... */) {
		switch (obj.constructor.name.split('$')[0]) {
			case 'Texture2D':
				this._updateAllTexture2D(obj, arguments[1]);
				break;
			case 'Texture3D':
				this._updateAllTexture3D(obj, arguments[1], arguments[2]);
				break;
			case 'TextureCube':
				this._updateAllTextureCube(obj, arguments[1], arguments[2]);
				break;
			case 'VertexBuffer':
				this._updateAllVertexBuffer(obj);
				break;
			case 'IndexBuffer':
				this._updateAllIndexBuffer(obj);
				break;
			default:
				console.assert(false, `${obj.constructor.name} not support [updateAll] method.`);
		}
	}

	// ------------------- VertexFormat ----------------------------------
    /**
     * @param format {VertexFormat}
     * @private
     */
	_bindVertexFormat(format) {
		if (!this.vertexFormats.has(format)) {
			this.vertexFormats.set(format, new GLVertexFormat(this, format));
		}
	}

    /**
     * @param format {VertexFormat}
     * @private
     */
	static _bindAllVertexFormat(format) { }

    /**
     * @param format {VertexFormat}
     * @private
     */
	_unbindVertexFormat(format) { }

    /**
     * @param format {VertexFormat}
     * @private
     */
	static _unbindAllVertexFormat(format) { }

    /**
     * @param format {VertexFormat}
     * @param program {Program}
     * @private
     */
	_enableVertexFormat(format, program) {
		var glFormat = this.vertexFormats.get(format);
		if (!glFormat) {
			glFormat = new GLVertexFormat(this, format, program);
			this.vertexFormats.set(format, glFormat);
		}
		glFormat.enable(this);
	}

    /**
     * @param format {VertexFormat}
     * @param vp
     * @param fp
     * @private
     */
	_disableVertexFormat(format, vp, fp) {
		var glFormat = this.vertexFormats.get(format);
		if (glFormat) {
			glFormat.disable(this);
		}
	}

	// ------------------- 着色器程序管理 ----------------------------------
    /**
     * @param program {Program}
     * @private
     */
	_bindProgram(program) {
		if (!this.programs.get(program)) {
			this.programs.set(program, new GLProgram(this, program));
		}
	}

    /**
     * @param program {Program}
     * @private
     */
	static _bindAllProgram(program) {
		Renderer.renderers.forEach(function (r) {
			r._bindProgram(program);
		});
	}

    /**
     * @param program {Program}
     * @private
     */
	_unbindProgram(program) {
		var glProgram = this.programs.get(program);
		if (glProgram) {
			glProgram.free(this.gl);
			this.programs.delete(program);
		}
	}
    /**
     * @param program {Program}
     * @private
     */
	static _unbindAllProgram(program) {
		Renderer.renderers.forEach(function (r) {
			r._unbindProgram(program);
		});
	}

    /**
     * @param program {Program}
     * @param vp {ShaderParameters}
     * @param fp {ShaderParameters}
     * @private
     */
	_enableProgram(program, vp, fp) {
		var glProgram = this.programs.get(program);
		if (!glProgram) {
			this._bindVertexShader(program.vertexShader);
			this._bindFragShader(program.fragShader);

			glProgram = new GLProgram(
				this,
				program,
				this.vertexShaders.get(program.vertexShader),
				this.fragShaders.get(program.fragShader)
			);
			this.programs.set(program, glProgram);
		}
		glProgram.enable(this);

		// Enable the shaders.
		this._enableVertexShader(program.vertexShader, program.inputMap, vp);
		this._enableFragShader(program.fragShader, program.inputMap, fp);
	}

    /**
     * @param program {Program}
     * @param vp {ShaderParameters}
     * @param fp {ShaderParameters}
     * @private
     */
	_disableProgram(program, vp, fp) {

		this._disableVertexShader(program.vertexShader, vp);
		this._disableFragShader(program.fragShader, fp);
		var glProgram = this.programs.get(program);
		if (glProgram) {
			glProgram.disable(this);
		}
	}

	//----------------------- vertexBuffer ------------------------
    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	_bindVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	static _bindAllVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	_unbindVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	static _unbindAllVertexBuffer(buffer) { }

    /**
     * @param buffer {VertexBuffer}
     * @param streamIndex {number}
     * @param offset {number}
     * @private
     */
	_enableVertexBuffer(buffer, streamIndex, offset) {

		var glVBuffer = this.vertexBuffers.get(buffer);
		if (!glVBuffer) {
			glVBuffer = new GLVertexBuffer(this, buffer);
			this.vertexBuffers.set(buffer, glVBuffer);
		}

		glVBuffer.enable(this, buffer.elementSize);
	}

    /**
     * @param buffer {VertexBuffer}
     * @param streamIndex {number}
     * @private
     */
	_disableVertexBuffer(buffer, streamIndex) {
		var glVBuffer = this.vertexBuffers.get(buffer);
		if (glVBuffer) {
			glVBuffer.disable(this, streamIndex);
		}
	}

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	_updateVertexBuffer(buffer) {
		var glVBuffer = this.vertexBuffers.get(buffer);
		if (!glVBuffer) {
			glVBuffer = new GLVertexBuffer(this, buffer);
			this.vertexBuffers.set(buffer, glVBuffer);
		}

		glVBuffer.update(this, buffer);
	}

    /**
     * @param buffer {VertexBuffer}
     * @private
     */
	static _updateAllVertexBuffer(buffer) {
		Renderer.renderers.forEach(function (renderer) {
			renderer._updateVertexBuffer(buffer);
		});
	}

	//----------------------- indexBuffer ------------------------
    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_bindIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	static _bindAllIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_unbindIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	static _unbindAllIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_enableIndexBuffer(buffer) {
		var glIBuffer = this.indexBuffers.get(buffer);
		if (!glIBuffer) {
			glIBuffer = new GLIndexBuffer(this, buffer);
			this.indexBuffers.set(buffer, glIBuffer);
		}
		glIBuffer.enable(this);
	}

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_disableIndexBuffer(buffer) {
		var glIBuffer = this.indexBuffers.get(buffer);
		if (glIBuffer) {
			glIBuffer.disable(this);
		}
	}

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	_updateIndexBuffer(buffer) { }

    /**
     * @param buffer {IndexBuffer}
     * @private
     */
	static _updateAllIndexBuffer(buffer) { }

	//----------------------- fragShader ------------------------

    /**
     * @param shader {FragShader}
     * @private
     */
	_bindFragShader(shader) {
		if (!this.fragShaders.get(shader)) {
			this.fragShaders.set(shader, new GLFragShader(this, shader));
		}
	}

    /**
     * @param shader {FragShader}
     * @private
     */
	static _bindAllFragShader(shader) {
		Renderer.renderers.forEach(function (r) {
			r._bindFragShader(shader);
		});
	}

    /**
     * @param shader {FragShader}
     * @private
     */
	_unbindFragShader(shader) {
		var glFShader = this.fragShaders.get(shader);
		if (glFShader) {
			glFShader.free(this.gl);
			this.fragShaders.delete(shader);
		}
	}

    /**
     * @param shader {FragShader}
     * @private
     */
	static _unbindAllFragShader(shader) {
		Renderer.renderers.forEach(function (r) {
			r._unbindFragShader(shader);
		});
	}

    /**
     * @param shader {FragShader}
     * @param mapping {Map}
     * @param parameters {ShaderParameters}
     * @private
     */
	_enableFragShader(shader, mapping, parameters) {
		var glFShader = this.fragShaders.get(shader);
		if (!glFShader) {
			glFShader = new GLFragShader(this, shader);
			this.fragShaders.set(shader, glFShader);
		}
		glFShader.enable(this, mapping, shader, parameters);
	}

    /**
     * @param shader {FragShader}
     * @param parameters {ShaderParameters}
     * @private
     */
	_disableFragShader(shader, parameters) {
		var glFShader = this.fragShaders.get(shader);
		if (glFShader) {
			glFShader.disable(this, shader, parameters);
		}
	}

	//----------------------- vertexShader ------------------------
    /**
     * @param shader {VertexShader}
     * @private
     */
	_bindVertexShader(shader) {
		if (!this.vertexShaders.get(shader)) {
			this.vertexShaders.set(shader, new GLVertexShader(this, shader));
		}
	}

    /**
     * @param shader {VertexShader}
     * @private
     */
	static _bindAllVertexShader(shader) { }
    /**
     * @param shader {VertexShader}
     * @private
     */
	_unbindVertexShader(shader) { }

    /**
     * @param shader {VertexShader}
     * @private
     */
	static _unbindAllVertexShader(shader) { }

    /**
     * @param shader {VertexShader}
     * @param mapping {Map}
     * @param parameters {ShaderParameters}
     * @private
     */
	_enableVertexShader(shader, mapping, parameters) {
		var glVShader = this.vertexShaders.get(shader);
		if (!glVShader) {
			glVShader = new GLVertexShader(this, shader);
			this.vertexShaders.set(shader, glVShader);
		}

		glVShader.enable(this, mapping, shader, parameters);
	}

    /**
     * @param shader {VertexShader}
     * @param parameters {ShaderParameters}
     * @private
     */
	_disableVertexShader(shader, parameters) {
		var glVShader = this.vertexShaders.get(shader);
		if (glVShader) {
			glVShader.disable(this, shader, parameters);
		}
	}

	//----------------------- texture2d ------------------------
    /**
     * @param texture {Texture2D}
     * @private
     */
	_bindTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @private
     */
	static _bindAllTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @private
     */
	_unbindTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @private
     */
	static _unbindAllTexture2D(texture) { }

    /**
     * @param texture {Texture2D}
     * @param textureUnit {number}
     * @private
     */
	_enableTexture2D(texture, textureUnit) {
		var glTexture2D = this.texture2Ds.get(texture);
		if (!glTexture2D) {
			glTexture2D = new GLTexture2D(this, texture);
			this.texture2Ds.set(texture, glTexture2D);
		}
		glTexture2D.enable(this, textureUnit);
	}

    /**
     * @param texture {Texture2D}
     * @param textureUnit {number}
     * @private
     */
	_disableTexture2D(texture, textureUnit) {
		var glTexture2D = this.texture2Ds.get(texture);
		if (glTexture2D) {
			glTexture2D.disable(this, textureUnit);
		}
	}

    /**
     * @param {Texture2D} texture
     * @param {number} level
     * @private
     */
	_updateTexture2D(texture, level=0) {
		let glTexture2D = this.texture2Ds.get(texture);
		if (!glTexture2D) {
			glTexture2D = new GLTexture2D(this, texture);
			this.texture2Ds.set(texture, glTexture2D);
		} else {
			glTexture2D.update(this, level, texture.getData());
		}
	}

    /**
     * @param {Texture2D} texture
     * @param {number} level
     */
	static _updateAllTexture2D(texture, level) {
		Renderer.renderers.forEach(renderer => renderer._updateTexture2D(texture, level));
	}

	//----------------------- textureCube ------------------------
    /**
     * @param texture {TextureCube}
     * @private
     */
	_bindTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @private
     */
	static _bindAllTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @private
     */
	_unbindTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @private
     */
	static _unbindAllTextureCube(texture) { }

    /**
     * @param texture {TextureCube}
     * @param textureUnit {number}
     * @private
     */
	_enableTextureCube(texture, textureUnit) { }

    /**
     * @param texture {TextureCube}
     * @param textureUnit {number}
     * @private
     */
	_disableTextureCube(texture, textureUnit) { }

    /**
     * @param texture {TextureCube}
     * @param face {number}
     * @param level {number}
     * @private
     */
	_updateTextureCube(texture, face, level) { }

    /**
     * @param texture {TextureCube}
     * @param face {number}
     * @param level {number}
     * @private
     */
	static _updateAllTextureCube(texture, face, level) { }

	//----------------------- renderTarget ------------------------

	/**
	 * @param {Visual} visual
	 */
	drawPrimitive(visual) {
		var type = visual.primitiveType;
		var vbuffer = visual.vertexBuffer;
		var ibuffer = visual.indexBuffer;
		var gl = this.gl;
		var numPixelsDrawn;
		var numSegments;

		switch (type) {
			case Visual.PT_TRIMESH:
			case Visual.PT_TRISTRIP:
			case Visual.PT_TRIFAN:
				{
					var numVertices = vbuffer.numElements;
					var numIndices = ibuffer.numElements;
					if (numVertices > 0 && numIndices > 0) {
						var indexType = (ibuffer.elementSize == 2) ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
						var indexData = ibuffer.offset;
						if (visual.wire) {
							gl.drawElements(gl.LINE_STRIP, numIndices, indexType, indexData);
						} else {
							gl.drawElements(webgl.PrimitiveType[type], numIndices, indexType, indexData);
						}
					}
					break;
				}
			case Visual.PT_POLYSEGMENTS_CONTIGUOUS:
				{
					numSegments = visual.getNumSegments();
					if (numSegments > 0) {
						gl.drawArrays(gl.LINE_STRIP, 0, numSegments + 1);
					}
					break;
				}
			case Visual.PT_POLYSEGMENTS_DISJOINT:
				{
					numSegments = visual.getNumSegments();
					if (numSegments > 0) {
						gl.drawArrays(gl.LINES, 0, 2 * numSegments);
					}
					break;
				}
			case Visual.PT_POLYPOINT:
				{
					var numPoints = visual.numPoints;
					if (numPoints > 0) {
						gl.drawArrays(gl.POINTS, 0, numPoints);
					}
					break;
				}
			default:
				console.assert(false, 'Invalid type', type);
		}
	}

	/**
	 * draw text
	 * @param x {number}
	 * @param y {number}
	 * @param color {Float32Array}
	 * @param message {string}
	 */
	drawText(x, y, color, message) {
		var gl = this.gl;

		// Switch to orthogonal view.
		gl.matrixMode(gl.PROJECTION);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.ortho(-0.5, this.width - 0.5, -0.5, this.height - 0.5, -1, 1);
		gl.matrixMode(gl.MODELVIEW);
		gl.pushMatrix();
		gl.loadIdentity();

		// Set default render states, except for depth buffering that must be
		// disabled because text is always overlayed.
		this.setAlphaState(this.defaultAlphaState);
		this.setCullState(this.defaultCullState);
		this.setOffsetState(this.defaultOffsetState);
		this.setStencilState(this.defaultStencilState);

		var CRS = this.data.currentRS;
		CRS.depthEnabled = false;
		gl.disable(gl.DEPTH_TEST);

		// Set the text color.
		gl.color4fv(color[0], color[1], color[2], color[3]);

		// Draw the text string (use right-handed coordinates).
		gl.rasterPos3i(x, this.height - 1 - y, 0);

		// Restore visual state.  Only depth buffering state varied from the
		// default state.
		CRS.depthEnabled = true;
		gl.enable(gl.DEPTH_TEST);

		// Restore matrices.
		gl.PopMatrix();
		gl.MatrixMode(gl.PROJECTION);
		gl.PopMatrix();
		gl.MatrixMode(gl.MODELVIEW);
	}

	/**
	 * @param screenBuffer {Uint8Array}
	 * @param reflectY {boolean}
	 */
	draw(screenBuffer, reflectY) {
		if (!screenBuffer) {
			console.assert(false, "Incoming screen buffer is null.\n");
			return;
		}

		var gl = this.gl;

		gl.matrixMode(gl.MODELVIEW);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.matrixMode(gl.PROJECTION);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.ortho(0, this.width, 0, this.height, 0, 1);
		gl.rasterPos3f(0, 0, 0);

		if (!reflectY) {
			// Set raster position to window coord (0,H-1).  The hack here avoids
			// problems with invalid raster positions which would cause
			// glDrawPixels not to execute.  OpenGL uses right-handed screen
			// coordinates, so using (0,H-1) as the raster position followed by
			// glPixelZoom(1,-1) tells OpenGL to draw the screen in left-handed
			// coordinates starting at the top row of the screen and finishing
			// at the bottom row.
			var bitmap = [0];
			gl.bitmap(0, 0, 0, 0, 0, this.height, bitmap);
		}
		gl.popMatrix();
		gl.matrixMode(gl.MODELVIEW);
		gl.popMatrix();

		if (!reflectY) {
			gl.pixelZoom(1, -1);
		}

		gl.drawPixels(this.width, this.height, gl.BGRA, gl.UNSIGNED_BYTE, screenBuffer);

		if (!reflectY) {
			gl.pixelZoom(1, 1);
		}
	}

	preDraw() { return true; }
	postDraw() { this.gl.flush(); }

	/**
	 * 混合状态设置
	 * @param {AlphaState} alphaState 
	 */
	setAlphaState(alphaState) {
		if (!this.overrideAlphaState) {
			this.alphaState = alphaState;
		}
		else {
			this.alphaState = this.overrideAlphaState;
		}

		var gl = this.gl;
		var as = this.alphaState;
		var CRS = this.data.currentRS;

		if (as.blendEnabled) {
			if (!CRS.alphaBlendEnabled) {
				CRS.alphaBlendEnabled = true;
				gl.enable(gl.BLEND);
			}
			var srcBlend = webgl.AlphaBlend[as.srcBlend];
			var dstBlend = webgl.AlphaBlend[as.dstBlend];
			if (srcBlend != CRS.alphaSrcBlend || dstBlend != CRS.alphaDstBlend) {
				CRS.alphaSrcBlend = srcBlend;
				CRS.alphaDstBlend = dstBlend;
				gl.blendFunc(srcBlend, dstBlend);
			}

			if (as.constantColor !== CRS.blendColor) {
				CRS.blendColor = as.constantColor;
				gl.blendColor(CRS.blendColor[0], CRS.blendColor[1], CRS.blendColor[2], CRS.blendColor[3]);
			}
		}
		else {
			if (CRS.alphaBlendEnabled) {
				CRS.alphaBlendEnabled = false;
				gl.disable(gl.BLEND);
			}
		}
	}

	/**
	 * 剔除状态
	 * @param cullState {CullState}
	 */
	setCullState(cullState) {
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
				gl.enable(gl.CULL_FACE);
				gl.frontFace(gl.CCW);
			}
			var order = cs.CCWOrder;
			if (this.reverseCullOrder) {
				order = !order;
			}
			if (order != CRS.CCWOrder) {
				CRS.CCWOrder = order;
				gl.cullFace(CRS.CCWOrder ? gl.BACK : gl.FRONT);
			}

		}
		else {
			if (CRS.cullEnabled) {
				CRS.cullEnabled = false;
				gl.disable(gl.CULL_FACE);
			}
		}
	}

	/**
	 * 设置深度测试状态
	 * @param depthState {DepthState}
	 */
	setDepthState(depthState) {
		var ds;
		var gl = this.gl;

		if (!this.overrideDepthState) {
			ds = depthState;
		} else {
			ds = this.overrideDepthState;
		}
		this.depthState = ds;
		var CRS = this.data.currentRS;

		if (ds.enabled) {
			if (!CRS.depthEnabled) {
				CRS.depthEnabled = true;
				gl.enable(gl.DEPTH_TEST);
			}

			var compare = webgl.DepthCompare[ds.compare];
			if (compare != CRS.depthCompareFunction) {
				CRS.depthCompareFunction = compare;
				gl.depthFunc(compare);
			}
		}
		else {
			if (CRS.depthEnabled) {
				CRS.depthEnabled = false;
				gl.disable(gl.DEPTH_TEST);
			}
		}

		if (ds.writable) {
			if (!CRS.depthWriteEnabled) {
				CRS.depthWriteEnabled = true;
				gl.depthMask(true);
			}
		}
		else {
			if (CRS.depthWriteEnabled) {
				CRS.depthWriteEnabled = false;
				gl.depthMask(false);
			}
		}
	}

	/**
	 * @param offsetState {OffsetState}
	 */
	setOffsetState(offsetState) {
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
				gl.enable(gl.POLYGON_OFFSET_FILL);
			}
		}
		else {
			if (CRS.fillEnabled) {
				CRS.fillEnabled = false;
				gl.disable(gl.POLYGON_OFFSET_FILL);
			}
		}

		if (os.scale != CRS.offsetScale || os.bias != CRS.offsetBias) {
			CRS.offsetScale = os.scale;
			CRS.offsetBias = os.bias;
			gl.polygonOffset(os.scale, os.bias);
		}
	}

	/**
	 * 设置模板测试状态
	 * @param {StencilState} stencilState
	 */
	setStencilState(stencilState) {
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
				gl.enable(gl.STENCIL_TEST);
			}

			var compare = webgl.StencilCompare[ss.compare];
			if (compare != CRS.stencilCompareFunction || ss.reference != CRS.stencilReference || ss.mask != CRS.stencilMask) {
				CRS.stencilCompareFunction = compare;
				CRS.stencilReference = ss.reference;
				CRS.stencilMask = ss.mask;
				gl.stencilFunc(compare, ss.reference, ss.mask);
			}

			if (ss.writeMask != CRS.stencilWriteMask) {
				CRS.stencilWriteMask = ss.writeMask;
				gl.stencilMask(ss.writeMask);
			}

			var onFail = webgl.StencilOperation[ss.onFail];
			var onZFail = webgl.StencilOperation[ss.onZFail];
			var onZPass = webgl.StencilOperation[ss.onZPass];

			if (onFail != CRS.stencilOnFail || onZFail != CRS.stencilOnZFail || onZPass != CRS.stencilOnZPass) {
				CRS.stencilOnFail = onFail;
				CRS.stencilOnZFail = onZFail;
				CRS.stencilOnZPass = onZPass;
				gl.stencilOp(onFail, onZFail, onZPass);
			}
		}
		else {
			if (CRS.stencilEnabled) {
				CRS.stencilEnabled = false;
				gl.disable(gl.STENCIL_TEST);
			}
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	setViewport(x, y, width, height) {
		this.gl.viewport(x, y, width, height);
	}
	setDepthRange(min, max) {
		this.gl.depthRange(min, max);
	}
	resize(width, height) {
		this.width = width;
		this.height = height;
		var gl = this.gl;

		var param = gl.getParameter(gl.VIEWPORT);
		gl.viewport(param[0], param[1], width, height);
	}

	clearColorBuffer() {
		var c = this.clearColor;
		var gl = this.gl;
		gl.clearColor(c[0], c[1], c[2], c[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
	clearDepthBuffer() {
		var gl = this.gl;
		gl.clearDepth(this.clearDepth);
		gl.clear(gl.DEPTH_BUFFER_BIT);
	}
	clearStencilBuffer() {
		var gl = this.gl;
		gl.clearStencil(this.clearStencil);
		gl.clear(gl.STENCIL_BUFFER_BIT);
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 */
	clearColorBuffer(x, y, w, h) {
		var gl = this.gl;
		var cc = this.clearColor;
		gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 */
	clearDepthBuffer(x, y, w, h) {
		var gl = this.gl;
		gl.clearDepth(this.clearDepth);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, w, h);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param x {number}
	 * @param y {number}
	 * @param w {number}
	 * @param h {number}
	 */
	clearStencilBuffer(x, y, w, h) {
		var gl = this.gl;
		gl.clearStencil(this.clearStencil);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, w, h);
		gl.clear(gl.STENCIL_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	clearBuffers(x, y, width, height) {
		let gl = this.gl;
		if (x) {
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(x, y, width, height);
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
		if (x) {
			gl.disable(gl.SCISSOR_TEST);
		}
	}

	/**
	 * 设置颜色掩码
	 * @param {boolean} allowRed
	 * @param {boolean} allowGreen
	 * @param {boolean} allowBlue
	 * @param {boolean} allowAlpha
	 */
	setColorMask(allowRed, allowGreen, allowBlue, allowAlpha) {
		this.allowRed = allowRed || false;
		this.allowGreen = allowGreen || false;
		this.allowBlue = allowBlue || false;
		this.allowAlpha = allowAlpha || false;
		this.gl.colorMask(allowRed, allowGreen, allowBlue, allowBlue);
	}
}
