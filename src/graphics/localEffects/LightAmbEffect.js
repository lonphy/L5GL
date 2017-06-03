/**
 * 只有环境光和发射光的着色器
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightAmbEffect}
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
import {MaterialEmissiveConstant} from '../shaderFloat/MaterialEmissiveConstant'
import {MaterialAmbientConstant} from '../shaderFloat/MaterialAmbientConstant'
import {LightAmbientConstant} from '../shaderFloat/LightAmbientConstant'
import {LightAttenuationConstant} from '../shaderFloat/LightAttenuationConstant'

export class LightAmbEffect extends VisualEffect {

    constructor() {
        super();
        var vs = new VertexShader('LightAmbEffectVS', 1, 5);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setConstant(1, 'MaterialEmissive', Shader.VT_VEC4);
        vs.setConstant(2, 'MaterialAmbient', Shader.VT_VEC4);
        vs.setConstant(3, 'LightAmbient', Shader.VT_VEC4);
        vs.setConstant(4, 'LightAttenuation', Shader.VT_VEC4);
        vs.setProgram(LightAmbEffect.VS);

        var fs = new FragShader('LightAmbEffectFS', 1);
        fs.setProgram(LightAmbEffect.FS);

        var program = new Program('LightAmbProgram', vs, fs);

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

    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setVertexConstant(0, 1, new MaterialEmissiveConstant(material));
        instance.setVertexConstant(0, 2, new MaterialAmbientConstant(material));
        instance.setVertexConstant(0, 3, new LightAmbientConstant(light));
        instance.setVertexConstant(0, 4, new LightAttenuationConstant(light));
        return instance;
    }

    static createUniqueInstance(light, material) {
        var effect = new LightAmbEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(LightAmbEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec3 LightAmbient;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
layout(location=0) in vec3 modelPosition;
out vec3 vColor;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vec3 ambient = LightAttenuation.w * LightAmbient;
    vColor = MaterialEmissive + MaterialAmbient * ambient;
}
`,
    FS: `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;
void main(){
    fragColor = vec4(vColor, 1.0);
}
`
});
