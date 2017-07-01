import { default as webgl } from './GLMapping';
import { AlphaState } from '../../shaders/AlphaState';
import { CullState } from '../../shaders/CullState';
import { DepthState } from '../../shaders/DepthState';
import { OffsetState } from '../../shaders/OffsetState';
import { StencilState } from '../../shaders/StencilState';

class GLRenderState {
	constructor() {
		// AlphaState
		this.alphaBlendEnabled = false;
		this.alphaSrcBlend = 0;
		this.alphaDstBlend = 0;
		this.blendColor = new Float32Array([0, 0, 0, 0]);

		// CullState
		this.cullEnabled = false;
		this.CCWOrder = true;

		// DepthState
		this.depthEnabled = true;
		this.depthWriteEnabled = true;
		this.depthCompareFunction = true;

		// OffsetState
		this.fillEnabled = false;
		this.offsetScale = 0;
		this.offsetBias = 0;

		// StencilState
		this.stencilEnabled = false;
		this.stencilCompareFunction = false;
		this.stencilReference = false;
		this.stencilMask = false;
		this.stencilWriteMask = false;
		this.stencilOnFail = false;
		this.stencilOnZFail = false;
		this.stencilOnZPass = false;
	}

    /**
	 * @param {WebGL2RenderingContext} gl
	 * @param {AlphaState} alphaState
	 * @param {CullState} cullState
	 * @param {DepthState} depthState
	 * @param {OffsetState} offsetState
	 * @param {StencilState} stencilState
 	*/
	initialize(gl, alphaState, cullState, depthState, offsetState, stencilState) {
		let op = ['disable', 'enable'];



		// CullState
		this.cullEnabled = cullState.enabled;
		this.CCWOrder = cullState.CCWOrder;

		gl[op[this.cullEnabled | 0]](gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		gl.cullFace(this.CCWOrder ? gl.BACK : gl.FRONT);

		// DepthState
		this.depthEnabled = depthState.enabled;
		this.depthWriteEnabled = depthState.writable;
		this.depthCompareFunction = webgl.DepthCompare[depthState.compare];

		gl[op[this.depthEnabled | 0]](gl.DEPTH_TEST);
		gl.depthMask(this.depthWriteEnabled);
		gl.depthFunc(this.depthCompareFunction);

		// AlphaState
		this.alphaBlendEnabled = alphaState.blendEnabled;
		this.alphaSrcBlend = webgl.AlphaBlend[alphaState.srcBlend];
		this.alphaDstBlend = webgl.AlphaBlend[alphaState.dstBlend];
		this.blendColor = alphaState.constantColor;
		gl[op[this.alphaBlendEnabled | 0]](gl.BLEND);
		gl.blendFunc(this.alphaSrcBlend, this.alphaDstBlend);
		gl.blendColor(this.blendColor[0], this.blendColor[1], this.blendColor[2], this.blendColor[3]);
		
		// OffsetState
		this.fillEnabled = offsetState.fillEnabled;
		this.offsetScale = offsetState.scale;
		this.offsetBias = offsetState.bias;

		gl[op[this.fillEnabled | 0]](gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(this.offsetScale, this.offsetBias);

		// StencilState
		this.stencilEnabled = stencilState.enabled;
		this.stencilCompareFunction = webgl.StencilCompare[stencilState.compare];
		this.stencilReference = stencilState.reference;
		this.stencilMask = stencilState.mask;
		this.stencilWriteMask = stencilState.writeMask;
		this.stencilOnFail = webgl.StencilOperation[stencilState.onFail];
		this.stencilOnZFail = webgl.StencilOperation[stencilState.onZFail];
		this.stencilOnZPass = webgl.StencilOperation[stencilState.onZPass];

		gl[op[this.stencilEnabled | 0]](gl.STENCIL_TEST);
		gl.stencilFunc(this.stencilCompareFunction, this.stencilReference, this.stencilMask);
		gl.stencilMask(this.stencilWriteMask);
		gl.stencilOp(this.stencilOnFail, this.stencilOnZFail, this.stencilOnZPass);
	}
}

export { GLRenderState };