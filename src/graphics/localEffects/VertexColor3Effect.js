import { DECLARE_ENUM } from '../../util/util';
import {
    VisualEffect, VisualPass, VisualEffectInstance, VisualTechnique,
    Shader, VertexShader, FragShader, Program,
    AlphaState, CullState, DepthState, OffsetState, StencilState
} from '../shaders/namespace';
import { PVWMatrixConstant } from '../shaderFloat/PVWMatrixConstant';

class VertexColor3Effect extends VisualEffect {
    constructor() {
        super();
        let vs = new VertexShader('VertexColor3VS', 2, 1);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setInput(0, 'modelColor', Shader.VT_VEC3, Shader.VS_COLOR0);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(VertexColor3Effect.VS);

        let fs = new FragShader('VertexColor3FS');
        fs.setProgram(VertexColor3Effect.FS);

        let program = new Program('VertexColor3Program', vs, fs);

        let pass = new VisualPass();
        pass.program = program;
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
        let effect = new VertexColor3Effect();
        return effect.createInstance();
    }
}

DECLARE_ENUM(VertexColor3Effect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=3) in vec3 modelColor0;
layout(location=6) in float modelPointSize;
out vec3 vertexColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexColor = modelColor0;
    gl_PointSize = modelPointSize;
}`,
    FS: `#version 300 es
precision highp float;
in vec3 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vec4(vertexColor, 1.0);
}`});

export { VertexColor3Effect };
