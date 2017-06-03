/**
 * 颜色缓冲 - 效果
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {VertexColor3Effect}
 * @extends {VisualEffect}
 */
import {DECLARE_ENUM} from '../../util/util'
import {VisualEffect} from '../shaders/VisualEffect'
import {VisualEffectInstance} from '../shaders/VisualEffectInstance'
import {VisualTechnique} from '../shaders/VisualTechnique'
import {VisualPass} from '../shaders/VisualPass'
import {Program} from '../shaders/Program'
import {Shader} from '../shaders/Shader'
import {VertexShader} from '../shaders/VertexShader'
import {FragShader} from '../shaders/FragShader'
import {AlphaState} from '../shaders/AlphaState'
import {CullState} from '../shaders/CullState'
import {DepthState} from '../shaders/DepthState'
import {OffsetState} from '../shaders/OffsetState'
import {StencilState} from '../shaders/StencilState'

import {PVWMatrixConstant} from '../shaderFloat/PVWMatrixConstant'

export class VertexColor3Effect extends VisualEffect {
    constructor() {
        super();
        var vs = new VertexShader('VertexColor3VS', 2, 1);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setInput(0, 'modelColor', Shader.VT_VEC3, Shader.VS_COLOR0);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(VertexColor3Effect.VS);

        var fs = new FragShader('VertexColor3FS');
        fs.setProgram(VertexColor3Effect.FS);

        var program = new Program('VertexColor3Program', vs, fs);

        var pass = new VisualPass();
        pass.program = program;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        var technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    createInstance() {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        return instance;
    }

    static createUniqueInstance() {
        var effect = new VertexColor3Effect();
        return effect.createInstance();
    }
};

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
}
`,
    FS: `#version 300 es
precision highp float;
in vec3 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vec4(vertexColor, 1.0);
}
`
});