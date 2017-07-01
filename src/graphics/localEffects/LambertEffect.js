import { DECLARE_ENUM } from '../../util/util';

import {
	VisualEffect, VisualEffectInstance, VisualTechnique, VisualPass,
	Program, Shader, VertexShader, FragShader,
	AlphaState, CullState, DepthState, OffsetState, StencilState
} from '../shaders/namespace';



class LambertEffect extends VisualEffect {
	constructor() {
		super();

		let vs = new VertexShader('LambertVS', 1, 1, 0);
		vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
		vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
		vs.setProgram(DefaultEffect.VS);

		let fs = new FragShader('LambertFS');
		fs.setProgram(DefaultEffect.FS);xx

		let pass = new VisualPass();
		pass.program = new Program('LambertProgram', vs, fs);
		pass.alphaState = new AlphaState();
		pass.cullState = new CullState();
		pass.depthState = new DepthState();
		pass.offsetState = new OffsetState();
		pass.stencilState = new StencilState();

		let technique = new VisualTechnique();
		technique.insertPass(pass);
		this.insertTechnique(technique);
	}

	createInstance() {
		let instance = new VisualEffectInstance(this, 0);
		instance.setVertexConstant(0, 0, new PVWMatrixConstant());
		return instance;
	}
}

DECLARE_ENUM(LambertEffect, {
	VS: ``,
	FS: ``
})
export { LambertEffect };