import { DECLARE_ENUM } from '../../util/util';

import {
    VisualEffect, VisualEffectInstance, VisualTechnique, VisualPass,
    Program, Shader, VertexShader, FragShader,
    AlphaState, CullState, DepthState, OffsetState, StencilState
} from '../shaders/namespace';
import { PVWMatrixConstant, MaterialEmissiveConstant, MaterialAmbientConstant, LightAmbientConstant, LightAttenuationConstant } from '../shaderFloat/namespace';

class LightAmbEffect extends VisualEffect {

    constructor() {
        super();
        let vs = new VertexShader('LightAmbEffectVS', 1, 5);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setConstant(1, 'MaterialEmissive', Shader.VT_VEC4);
        vs.setConstant(2, 'MaterialAmbient', Shader.VT_VEC4);
        vs.setConstant(3, 'LightAmbient', Shader.VT_VEC4);
        vs.setConstant(4, 'LightAttenuation', Shader.VT_VEC4);
        vs.setProgram(LightAmbEffect.VS);

        let fs = new FragShader('LightAmbEffectFS', 1);
        fs.setProgram(LightAmbEffect.FS);

        let program = new Program('LightAmbProgram', vs, fs);

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

    createInstance(light, material) {
        let instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setVertexConstant(0, 1, new MaterialEmissiveConstant(material));
        instance.setVertexConstant(0, 2, new MaterialAmbientConstant(material));
        instance.setVertexConstant(0, 3, new LightAmbientConstant(light));
        instance.setVertexConstant(0, 4, new LightAttenuationConstant(light));
        return instance;
    }

    static createUniqueInstance(light, material) {
        let effect = new LightAmbEffect();
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
}`,
    FS: `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;
void main(){
    fragColor = vec4(vColor, 1.0);
}`});

export { LightAmbEffect };