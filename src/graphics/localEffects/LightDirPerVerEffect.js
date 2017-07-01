import { D3Object } from '../../core/D3Object';
import { DECLARE_ENUM } from '../../util/util';
import {
    VisualEffect,
    VisualEffectInstance,
    VisualTechnique,
    VisualPass,
    Program,
    Shader,
    VertexShader,
    FragShader,
    AlphaState,
    CullState,
    DepthState,
    OffsetState,
    StencilState
} from '../shaders/namespace';
import {
    PVWMatrixConstant,
    CameraModelPositionConstant,
    MaterialEmissiveConstant,
    MaterialAmbientConstant,
    MaterialDiffuseConstant,
    MaterialSpecularConstant,
    LightModelDirectionConstant,
    LightAmbientConstant,
    LightDiffuseConstant,
    LightSpecularConstant,
    LightAttenuationConstant
} from '../shaderFloat/namespace';

class LightDirPerVerEffect extends VisualEffect {

    constructor() {
        super();
        let vshader = new VertexShader('LightDirPerVerVS', 2, 11);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
        vshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
        vshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
        vshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        vshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);

        vshader.setConstant(6, 'LightModelDirection', Shader.VT_VEC3);
        vshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
        vshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
        vshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
        vshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
        vshader.setProgram(LightDirPerVerEffect.VS);

        let fshader = new FragShader('LightDirPerVerFS');
        fshader.setProgram(LightDirPerVerEffect.FS);

        let pass = new VisualPass();
        pass.program = new Program('LightDirPerVerProgram', vshader, fshader);
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
        instance.setVertexConstant(0, 1, new CameraModelPositionConstant());
        instance.setVertexConstant(0, 2, new MaterialEmissiveConstant(material));
        instance.setVertexConstant(0, 3, new MaterialAmbientConstant(material));
        instance.setVertexConstant(0, 4, new MaterialDiffuseConstant(material));
        instance.setVertexConstant(0, 5, new MaterialSpecularConstant(material));
        instance.setVertexConstant(0, 6, new LightModelDirectionConstant(light));
        instance.setVertexConstant(0, 7, new LightAmbientConstant(light));
        instance.setVertexConstant(0, 8, new LightDiffuseConstant(light));
        instance.setVertexConstant(0, 9, new LightSpecularConstant(light));
        instance.setVertexConstant(0, 10, new LightAttenuationConstant(light));
        return instance;
    }

    static createUniqueInstance(light, material) {
        let effect = new LightDirPerVerEffect();
        return effect.createInstance(light, material);
    }

    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    postLink() {
        super.postLink();
        let pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.vertexShader = (LightDirPerVerEffect.VertexSource);
        pass.program.fragShader.fragShader = (LightDirPerVerEffect.FragSource);
        this.techniques = this.___;
    }
};

DECLARE_ENUM(LightDirPerVerEffect, {
    VS: `#version 300 es
const float zere = 0.0;
uniform mat4 PVWMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;       // alpha channel store shininess
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec4 vColor;
void main(){
    vec3 nor = normalize( modelNormal );
    vec3 dir = normalize( LightModelDirection );
    float weight = max( dot(nor, -dir), zero );
    vec3 color = LightAmbient * MaterialAmbient + LightDiffuse * MaterialDiffuse.rgb * weight;
    if ( weight > zero) {
        vec3 viewVector = normalize(CameraModelPosition - modelPosition);
        vec3 reflectDir = normalize( reflect(-dir, nor) );
        weight = max( dot(reflectDir, viewVector), zero);
        color += LightSpecular * MaterialSpecular.rgb * pow(weight, MaterialSpecular.w);
    }    
    vColor = vec4(color * LightAttenuation.w + MaterialEmissive, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(){
    fragColor = vColor;
}`});

D3Object.Register('LightDirPerVerEffect', LightDirPerVerEffect.factory);

export { LightDirPerVerEffect };
