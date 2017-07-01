import { DECLARE_ENUM } from '../../util/util';
import {
    VisualEffect,
	VisualPass,
	VisualEffectInstance,
	VisualTechnique,
    Shader,
	VertexShader,
	FragShader,
	Program,
    AlphaState,
	CullState,
	DepthState,
	OffsetState,
	StencilState
} from '../shaders/namespace';
import { PVWMatrixConstant } from '../shaderFloat/PVWMatrixConstant';

class VertexColor4Effect extends VisualEffect {
    constructor() {
        super();
        let vs = new VertexShader('VertexColor4VS', 2, 1);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setInput(0, 'modelColor', Shader.VT_VEC4, Shader.VS_COLOR0);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(VertexColor4Effect.VS);

        let fs = new FragShader('VertexColor4FS');
        fs.setProgram(VertexColor4Effect.FS);

        let pass = new VisualPass();
        pass.program = new Program('VertexColor4Program', vs, fs);
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

    static createUniqueInstance() {
        let effect = new VertexColor4Effect();
        return effect.createInstance();
    }
}

DECLARE_ENUM(VertexColor4Effect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=3) in vec4 modelColor0;
layout(location=6) in float modelPointSize;
out vec4 vertexColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexColor = modelColor0;
    gl_PointSize = modelPointSize;
}`,
    FS: `#version 300 es
precision highp float;
in vec4 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vertexColor;
}`});

export { VertexColor4Effect };
