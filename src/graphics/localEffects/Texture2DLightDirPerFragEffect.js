import { DECLARE_ENUM } from '../../util/util';
import {
    Shader, VertexShader, FragShader, Program, SamplerState,
    VisualPass, VisualTechnique, VisualEffectInstance, VisualEffect,
    AlphaState, CullState, DepthState, OffsetState, StencilState,
} from '../shaders/namespace';
import {
    PVWMatrixConstant, CameraModelPositionConstant, MaterialEmissiveConstant,
    MaterialAmbientConstant, MaterialDiffuseConstant, MaterialSpecularConstant,
    LightModelDirectionConstant, LightAmbientConstant, LightDiffuseConstant,
    LightSpecularConstant, LightAttenuationConstant
} from '../shaderFloat/namespace';

class Texture2DLightDirPerFragEffect extends VisualEffect {

    /**
     * @param {SamplerState} sampler
     */
    constructor(sampler = null) {
        super();

        let vshader = new VertexShader('Texture2DLightDirPerFragVS', 3, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setInput(2, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(Texture2DLightDirPerFragEffect.VS);

        let fshader = new FragShader('Texture2DLightDirPerFragFS', 0, 10, 1);
        fshader.setConstant(0, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(1, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(4, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(5, 'LightModelDirection', Shader.VT_VEC3);
        fshader.setConstant(6, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightAttenuation', Shader.VT_VEC4);

        fshader.setSampler(0, 'DiffuseSampler', Shader.ST_2D);
        fshader.setSamplerState(0, sampler || SamplerState.defaultSampler);
        fshader.setTextureUnit(0, 0);

        fshader.setProgram(Texture2DLightDirPerFragEffect.FS);

        let pass = new VisualPass();
        pass.program = new Program('TextureLightDirPerFragProgram', vshader, fshader);;
        pass.alphaState = new AlphaState();
        pass.cullState = new CullState();
        pass.depthState = new DepthState();
        pass.offsetState = new OffsetState();
        pass.stencilState = new StencilState();

        let technique = new VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    /**
     * @param {Texture2D} texture 
     * @param {Light} light 
     * @param {Material} material 
     * @param {SamplerState} sampler
     */
    static createUniqueInstance(texture, light, material, sampler = null) {
        let effect = new Texture2DLightDirPerFragEffect();
        let fshader = effect.getFragShader();
        if (sampler !== null) {
            fshader.setSampler(0, sampler);
        }
        return effect.createInstance(texture, light, material);
    }

    createInstance(texture, light, material) {
        let instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setFragConstant(0, 0, new CameraModelPositionConstant());
        instance.setFragConstant(0, 1, new MaterialEmissiveConstant(material));
        instance.setFragConstant(0, 2, new MaterialAmbientConstant(material));
        instance.setFragConstant(0, 3, new MaterialDiffuseConstant(material));
        instance.setFragConstant(0, 4, new MaterialSpecularConstant(material));
        instance.setFragConstant(0, 5, new LightModelDirectionConstant(light));
        instance.setFragConstant(0, 6, new LightAmbientConstant(light));
        instance.setFragConstant(0, 7, new LightDiffuseConstant(light));
        instance.setFragConstant(0, 8, new LightSpecularConstant(light));
        instance.setFragConstant(0, 9, new LightAttenuationConstant(light));

        instance.setFragTexture(0, 0, texture);
        texture.upload();
        return instance;
    }
}

DECLARE_ENUM(Texture2DLightDirPerFragEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
layout(location=8) in vec2 modelTCoord0;
out vec3 vertexPosition;
out vec3 vertexNormal;
out vec2 vTCoord0;

void main(){
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
    vTCoord0 = modelTCoord0;
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
    FS: `#version 300 es
precision highp float;
uniform vec3 CameraModelPosition;

uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;    // alpha通道存储光滑度

uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;    // [constant, linear, quadratic, intensity]

uniform sampler2D DiffuseSampler;

in vec2 vTCoord0;
in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main () {
    vec3 normal = normalize( vertexNormal );
    float diffuseWeight = max( dot(normal, -LightModelDirection), 0.0);
    vec3 color = LightAmbient * MaterialAmbient + LightDiffuse * MaterialDiffuse.rgb * diffuseWeight;
    
    if (diffuseWeight > 0.0) {
        vec3 reflectVector = normalize( reflect(-LightModelDirection, normal) );
        vec3 viewVector = normalize( CameraModelPosition - vertexPosition);
        float rdv = max( dot(reflectVector, viewVector), 0.0);
        float weight = pow(rdv, MaterialSpecular.w);
        color += weight * MaterialSpecular.rgb * LightSpecular;
    }

    vec3 tColor = texture( DiffuseSampler, vTCoord0 ).rgb;
    fragColor = vec4(color * tColor * LightAttenuation.w + MaterialEmissive, MaterialDiffuse.a);
}`});

export { Texture2DLightDirPerFragEffect };