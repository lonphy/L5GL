import {
	webgl,
	GLRenderData,
	GLExtensions,
	GLVertexShader,
	GLFragShader,
	GLProgram,
	GLIndexBuffer,
	GLVertexArray,
	GLVertexFormat,
	GLTexture2D,
	GLTexture2DArray,
	GLTexture3D,
	GLTextureCube,
	GLRenderTarget,
	GLSampler
} from './webgl/namespace';
import { AlphaState, CullState, DepthState, OffsetState, StencilState } from '../shaders/namespace';
import { Visual } from '../sceneTree/Visual';

class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} width
     * @param {number} height
     * @param {ArrayBuffer} clearColor
     * @param {number} colorFormat
     * @param {number} depthStencilFormat
     * @param {number} numMultiSamples
     */
	constructor(canvas, width, height, clearColor, colorFormat, depthStencilFormat, numMultiSamples) {
        /**
         * @type {WebGLRenderingContext}
         */
		let gl = canvas.getContext('webgl2', {
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

		// let c = document.createElement('canvas');
		// c.setAttribute('style', 'width:150px;height:75px');
		// this.textContext = c.getContext('2d');
		// document.body.appendChild(this.textContext.canvas);
	}

    /**
     * @returns {Set<Renderer>}
     */
	static get renderers() {
		return (Renderer._renderers || (Renderer._renderers = new Set()));
	}

    /**
     * @param {number} width
     * @param {number} height
     * @param {number} colorFormat - TEXTURE_FORMAT_XXX
     * @param {number} depthStencilFormat - TEXTURE_FORMAT_XXX
     * @param {number} numMultiSamples
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
		this.vertexArrays = new Map(); // VAOs

		this.vertexFormats = new Map();
		this.vertexBuffers = new Map();
		this.indexBuffers = new Map();
		this.texture2Ds = new Map();
		this.texture3Ds = new Map();
		this.textureCubes = new Map();
		this.renderTargets = new Map();
		this.vertexShaders = new Map();
		this.fragShaders = new Map();
		this.samplerStates = new Map();
		this.programs = new Map();

		let gl = this.gl;
		let cc = this.clearColor;
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
	//    Texture(2d, cube, 3d, 2d array),
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
     * @param {VisibleSet} visibleSet
     * @param {*} globalEffect
     */
	drawVisibleSet(visibleSet, globalEffect = null) {
		if (!globalEffect) {
			let numVisible = visibleSet.getNumVisible();
			for (let i = 0; i < numVisible; ++i) {
				let visual = visibleSet.getVisible(i);
				this.drawInstance(visual, visual.effect);
			}
		}
		else {
			globalEffect.draw(this, visibleSet);
		}
	}

    /**
     * @param {Visual} visual
     */
	drawVisible(visual) {
		this.drawInstance(visual, visual.effect);
	}


    /**
     * @param {Visual} visual
     * @param {VisualEffectInstance} instance
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

		let vformat = visual.format;
		let vbuffer = visual.vertexBuffer;
		let ibuffer = visual.indexBuffer;

		let numPasses = instance.getNumPasses();
		for (let i = 0; i < numPasses; ++i) {
			let pass = instance.getPass(i);
			let vparams = instance.getVertexParameters(i);
			let fparams = instance.getFragParameters(i);
			let program = pass.program;

			// Update any shader constants that lety during runtime.
			vparams.updateConstants(visual, this.camera);
			fparams.updateConstants(visual, this.camera);

			// Set visual state.
			this.setAlphaState(pass.alphaState);
			this.setCullState(pass.cullState);
			this.setDepthState(pass.depthState);
			this.setOffsetState(pass.offsetState);
			this.setStencilState(pass.stencilState);

			this._enableProgram(program, vparams, fparams);
			this._enableVertexBuffer(vbuffer, vformat);
			if (ibuffer) {
				this._enableIndexBuffer(ibuffer);
				// Draw the primitive.
				this.drawPrimitive(visual);
				this._disableIndexBuffer(ibuffer);
			} else {
				this.___drawPrimitiveWithoutIndices(visual);
			}

			this._disableVertexBuffer(vbuffer);

			// Disable the shaders.
			this._disableProgram(program, vparams, fparams);
		}
	}

    /**
     * The entry point for drawing 3D objects, called by the single-object
     * Draw function.
     * @param {Visual} visual
     */
	_drawPrimitive(visual) {
	}

    /**
     * 设置渲染视口
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
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
		let gl = this.gl;
		let p = gl.getParameter(gl.VIEWPORT);
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
		let gl = this.gl;
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
				this._updateAllVertexBuffer(obj, arguments[1]);
				break;
			case 'IndexBuffer':
				this._updateAllIndexBuffer(obj);
				break;
			default:
				console.assert(false, `${obj.constructor.name} not support [updateAll] method.`);
		}
	}
	// ------------------- Sampler ------------------------------
	_bindAllSamplerState(sampler) {
		Renderer._renderers.forEach(r => r._bindSamplerState(sampler));
	}
	_bindSamplerState(sampler) {
		if (!this.samplerStates.has(sampler)) {
			this.samplerStates.set(sampler, new GLSampler(this.gl, sampler));
		}
	}
	_enableSamplerState(sampler, textureUnit) {
		let glSampler = this.samplerStates.get(sampler);
		if (!glSampler) {
			glSampler = new GLSampler(this.gl, sampler);
			this.samplerStates.set(sampler, glSampler);
		}
		glSampler.enable(this.gl, textureUnit);
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
     * @param {Program} program
     * @private
     */
	_unbindProgram(program) {
		let glProgram = this.programs.get(program);
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
		let glProgram = this.programs.get(program);
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
		let glProgram = this.programs.get(program);
		if (glProgram) {
			glProgram.disable(this);
		}
	}

	//----------------------- vertexBuffer ------------------------
    /**
     * @param {VertexBuffer} buffer
     * @param {VertexFormat} format
     * @private
     */
	_enableVertexBuffer(buffer, format) {
		let glVao = this.vertexArrays.get(buffer);
		if (!glVao) {
			let glFormat = this.vertexFormats.get(format);
			if (!glFormat) {
				glFormat = new GLVertexFormat(this.gl, format);
				this.vertexFormats.set(format, glFormat);
			}
			glVao = new GLVertexArray(this.gl, buffer, glFormat);
			this.vertexArrays.set(buffer, glVao);
			return;
		}

		glVao.enable(this.gl);
	}

    /**
     * @param {VertexBuffer} buffer
     * @private
     */
	_disableVertexBuffer(buffer) {
		let glVao = this.vertexArrays.get(buffer);
		if (glVao) {
			glVao.disable(this.gl);
		}
	}

    /**
     * @param {VertexBuffer} buffer
	 * @param {VertexFormat} format
     * @private
     */
	_updateVertexBuffer(buffer, format) {
		let glFormat = this.vertexFormats.get(format);
		if (!glFormat) {
			glFormat = new GLVertexFormat(this.gl, format);
			this.vertexFormats.set(format, glFormat);
		}

		let glVao = this.vertexArrays.get(buffer);
		if (!glVao) {
			glVao = new GLVertexArray(this.gl, buffer, glFormat);
			this.vertexArrays.set(buffer, glVao);
			return;
		}

		glVao.update(this.gl, buffer, glFormat);
	}

    /**
     * @param {VertexBuffer} buffer
	 * @param {VertexFormat} format
     * @private
     */
	static _updateAllVertexBuffer(buffer, format) {
		Renderer.renderers.forEach(renderer => renderer._updateVertexBuffer(buffer, format));
	}

	//----------------------- indexBuffer ------------------------
    /**
     * @param {IndexBuffer} buffer
     * @private
     */
	_enableIndexBuffer(buffer) {
		let glIBuffer = this.indexBuffers.get(buffer);
		if (!glIBuffer) {
			glIBuffer = new GLIndexBuffer(this.gl, buffer);
			this.indexBuffers.set(buffer, glIBuffer);
			return;
		}
		glIBuffer.enable(this.gl);
	}

    /**
     * @param {IndexBuffer} buffer
     * @private
     */
	_disableIndexBuffer(buffer) {
		let glIBuffer = this.indexBuffers.get(buffer);
		if (glIBuffer) {
			glIBuffer.disable(this.gl);
		}
	}

    /**
     * @param {IndexBuffer} buffer
     * @private
     */
	_updateIndexBuffer(buffer) {
		let glIBuffer = this.indexBuffers.get(buffer);
		if (!glIBuffer) {
			glIBuffer = new GLIndexBuffer(this.gl, buffer);
			this.indexBuffers.set(buffer, glIBuffer);
			return;
		}
		glIBuffer.update(this.gl, buffer);
	}

    /**
     * @param {IndexBuffer} buffer
     * @private
     */
	static _updateAllIndexBuffer(buffer) {
		Renderer.renderers.forEach(renderer => renderer._updateIndexBuffer(buffer));
	}

	//----------------------- fragShader ------------------------

    /**
     * @param {FragShader} shader
     * @private
     */
	_bindFragShader(shader) {
		if (!this.fragShaders.get(shader)) {
			let numSamplers = shader.numSamplers;
			if (numSamplers > 0) {
				for (let i = 0; i < numSamplers; ++i) {
					this._bindSamplerState(shader.getSamplerState(i));
				}
			}
			this.fragShaders.set(shader, new GLFragShader(this, shader));
		}
	}

    /**
     * @param {FragShader} shader
     * @private
     */
	static _bindAllFragShader(shader) {
		Renderer.renderers.forEach(r => r._bindFragShader(shader));
	}

    /**
     * @param {FragShader} shader
     * @private
     */
	_unbindFragShader(shader) {
		let glFShader = this.fragShaders.get(shader);
		if (glFShader) {
			glFShader.free(this.gl);
			this.fragShaders.delete(shader);
		}
	}

    /**
     * @param {FragShader} shader
     * @private
     */
	static _unbindAllFragShader(shader) {
		Renderer.renderers.forEach(r => r._unbindFragShader(shader));
	}

    /**
     * @param {FragShader} shader
     * @param {Map} mapping
     * @param {ShaderParameters} parameters
     * @private
     */
	_enableFragShader(shader, mapping, parameters) {
		let glFShader = this.fragShaders.get(shader);
		if (!glFShader) {
			glFShader = new GLFragShader(this, shader);
			this.fragShaders.set(shader, glFShader);
		}
		glFShader.enable(this, mapping, shader, parameters);
	}

    /**
     * @param {FragShader} shader
     * @param {ShaderParameters} parameters
     * @private
     */
	_disableFragShader(shader, parameters) {
		let glFShader = this.fragShaders.get(shader);
		if (glFShader) {
			glFShader.disable(this, shader, parameters);
		}
	}

	//----------------------- vertexShader ------------------------
    /**
     * @param {VertexShader} shader
     * @private
     */
	_bindVertexShader(shader) {
		if (!this.vertexShaders.get(shader)) {
			let numSamplers = shader.numSamplers;
			if (numSamplers > 0) {
				for (let i = 0; i < numSamplers; ++i) {
					this._bindSamplerState(shader.getSamplerState(i));
				}
			}
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
		let glVShader = this.vertexShaders.get(shader);
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
		let glVShader = this.vertexShaders.get(shader);
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
     * @param {Texture2D} texture
     * @param {number} textureUnit
     * @private
     */
	_enableTexture2D(texture, textureUnit) {
		let glTexture2D = this.texture2Ds.get(texture);
		if (!glTexture2D) {
			glTexture2D = new GLTexture2D(this.gl, texture);
			this.texture2Ds.set(texture, glTexture2D);
		}
		glTexture2D.enable(this.gl, textureUnit);
	}

    /**
     * @param {Texture2D} texture
     * @param {number} textureUnit
     * @private
     */
	_disableTexture2D(texture, textureUnit) {
		let glTexture2D = this.texture2Ds.get(texture);
		if (glTexture2D) {
			glTexture2D.disable(this.gl, textureUnit);
		}
	}

    /**
     * @param {Texture2D} texture
     * @param {number} level
     * @private
     */
	_updateTexture2D(texture, level = 0) {
		let glTexture2D = this.texture2Ds.get(texture);
		if (!glTexture2D) {
			glTexture2D = new GLTexture2D(this.gl, texture);
			this.texture2Ds.set(texture, glTexture2D);
		} else {
			glTexture2D.update(this.gl, level, texture.getData());
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
		let type = visual.primitiveType;
		let vbuffer = visual.vertexBuffer;
		let ibuffer = visual.indexBuffer;
		let gl = this.gl;
		let numPixelsDrawn;
		let numSegments;

		switch (type) {
			case Visual.PT_TRIMESH:
			case Visual.PT_TRISTRIP:
			case Visual.PT_TRIFAN:
				{
					let numVertices = vbuffer.numElements;
					let numIndices = ibuffer.numElements;
					if (numVertices > 0 && numIndices > 0) {
						let indexType = (ibuffer.elementSize == 2) ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
						let indexData = ibuffer.offset;
						if (visual.wire) {
							gl.drawElements(gl.LINE_LOOP, numIndices, indexType, indexData);
						} else {
							gl.drawElements(webgl.PrimitiveType[type], numIndices, indexType, indexData);
						}
					}
					break;
				}
			default:
				console.assert(false, 'Invalid type', type);
		}
	}

	___drawPrimitiveWithoutIndices(visual) {
		let type = visual.primitiveType;
		let vbuffer = visual.vertexBuffer;
		let gl = this.gl;
		let numSegments;

		switch (type) {
			case Visual.PT_TRIMESH:
			case Visual.PT_TRISTRIP:
			case Visual.PT_TRIFAN:
				{
					let numVertices = vbuffer.numElements;
					if (numVertices > 0) {
						if (visual.wire) {
							gl.drawArrays(gl.LINE_LOOP, 0, numVertices);
						} else {
							gl.drawArrays(webgl.PrimitiveType[type], 0, numVertices);
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
					let numPoints = visual.numPoints;
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
	 * @param {number} x
	 * @param {number} y
	 * @param {string} color
	 * @param {string} message
	 */
	drawText(x, y, color, message) {
		// let gl = this.gl;
		// let textContext = this.textContext;
		// const h = 14;
		// // let w = textContext.measureText(message);
		// textContext.clearRect(0, 0, textContext.canvas.width, textContext.canvas.height);
		// textContext.textBaseline = 'top';
		// textContext.font = 'lighter 28px Menlo';
		// textContext.fillStyle = color;

		// textContext.fillText(message, x, y);
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

		let gl = this.gl;
		let as = this.alphaState;
		let CRS = this.data.currentRS;

		if (as.blendEnabled) {
			if (!CRS.alphaBlendEnabled) {
				CRS.alphaBlendEnabled = true;
				gl.enable(gl.BLEND);
			}
			let srcBlend = webgl.AlphaBlend[as.srcBlend];
			let dstBlend = webgl.AlphaBlend[as.dstBlend];
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
		let cs;
		let gl = this.gl;
		if (!this.overrideCullState) {
			cs = cullState;
		}
		else {
			cs = this.overrideCullState;
		}
		this.cullState = cs;
		let CRS = this.data.currentRS;

		if (cs.enabled) {
			if (!CRS.cullEnabled) {
				CRS.cullEnabled = true;
				gl.enable(gl.CULL_FACE);
				gl.frontFace(gl.CCW);
			}
			let order = cs.CCWOrder;
			if (this.reverseCullOrder) {
				order = !order;
			}
			if (order !== CRS.CCWOrder) {
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
	 * @param {DepthState} depthState
	 */
	setDepthState(depthState) {
		let ds = (!this.overrideDepthState) ? depthState : this.overrideDepthState;
		let gl = this.gl;

		this.depthState = ds;
		let CRS = this.data.currentRS;

		if (ds.enabled) {
			if (!CRS.depthEnabled) {
				CRS.depthEnabled = true;
				gl.enable(gl.DEPTH_TEST);
			}

			let compare = webgl.DepthCompare[ds.compare];
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
	 * @param {OffsetState} offsetState
	 */
	setOffsetState(offsetState) {
		let os;
		let gl = this.gl;
		let CRS = this.data.currentRS;
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
		let gl = this.gl;
		let ss;
		if (!this.overrideStencilState) {
			ss = stencilState;
		}
		else {
			ss = this.overrideStencilState;
		}
		this.stencilState = ss;
		let CRS = this.data.currentRS;
		if (ss.enabled) {
			if (!CRS.stencilEnabled) {
				CRS.stencilEnabled = true;
				gl.enable(gl.STENCIL_TEST);
			}

			let compare = webgl.StencilCompare[ss.compare];
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

			let onFail = webgl.StencilOperation[ss.onFail];
			let onZFail = webgl.StencilOperation[ss.onZFail];
			let onZPass = webgl.StencilOperation[ss.onZPass];

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
		const gl = this.gl;
		const param = gl.getParameter(gl.VIEWPORT);
		gl.viewport(param[0], param[1], width, height);
	}

	clearColorBuffer() {
		let c = this.clearColor;
		let gl = this.gl;
		gl.clearColor(c[0], c[1], c[2], c[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
	clearDepthBuffer() {
		const gl = this.gl;
		gl.clearDepth(this.clearDepth);
		gl.clear(gl.DEPTH_BUFFER_BIT);
	}
	clearStencilBuffer() {
		let gl = this.gl;
		gl.clearStencil(this.clearStencil);
		gl.clear(gl.STENCIL_BUFFER_BIT);
	}

	clearColorBuffer(x, y, width, height) {
		const gl = this.gl;
		const cc = this.clearColor;
		gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	clearDepthBuffer(x, y, width, height) {
		const gl = this.gl;
		gl.clearDepth(this.clearDepth);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, width, height);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.SCISSOR_TEST);
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	clearStencilBuffer(x, y, width, height) {
		const gl = this.gl;
		gl.clearStencil(this.clearStencil);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(x, y, width, height);
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
	setColorMask(allowRed = false, allowGreen = false, allowBlue = false, allowAlpha = false) {
		this.allowRed = allowRed;
		this.allowGreen = allowGreen;
		this.allowBlue = allowBlue;
		this.allowAlpha = allowAlpha;
		this.gl.colorMask(allowRed, allowGreen, allowBlue, allowBlue);
	}
}

export { Renderer };
