/**
 * 默认效果着色器
 */
import { DECLARE_ENUM } from '../../util/util'

import {
    VisualEffect, VisualEffectInstance, VisualTechnique, VisualPass,
    Program, Shader, VertexShader, FragShader,
    AlphaState, CullState, DepthState, OffsetState, StencilState
} from '../shaders/namespace'
import { PVWMatrixConstant } from '../shaderFloat/namespace'

export class DefaultEffect extends VisualEffect {
    constructor() {
        super();

        let vs = new VertexShader('DefaultVS', 1, 1, 0);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(DefaultEffect.VS);

        let fs = new FragShader('DefaultFS');
        fs.setProgram(DefaultEffect.FS);

        let program = new Program('DefaultProgram', vs, fs);
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
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        return instance;
    }
}

DECLARE_ENUM(DefaultEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
void main(){
    gl_Position = uPVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
out vec4 fragColor;
void main (void) {
    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`
});
