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
    WMatrixConstant,
    CameraModelPositionConstant,

    MaterialEmissiveConstant,
    MaterialAmbientConstant,
    MaterialDiffuseConstant,
    MaterialSpecularConstant,

    LightModelPositionConstant,
    LightModelDirectionConstant,

    LightAmbientConstant,
    LightDiffuseConstant,
    LightSpecularConstant,

    LightSpotConstant,
    LightAttenuationConstant
} from '../shaderFloat/namespace';

class LightSpotPerVertexEffect extends VisualEffect {
    constructor() {
        super();
        let vshader = new VertexShader('LightSpotPerVertexVS', 2, 14);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setConstant(1, 'WMatrix', Shader.VT_MAT4);
        vshader.setConstant(2, 'CameraModelPosition', Shader.VT_VEC3);
        vshader.setConstant(3, 'MaterialEmissive', Shader.VT_VEC3);
        vshader.setConstant(4, 'MaterialAmbient', Shader.VT_VEC3);
        vshader.setConstant(5, 'MaterialDiffuse', Shader.VT_VEC4);
        vshader.setConstant(6, 'MaterialSpecular', Shader.VT_VEC4);
        vshader.setConstant(7, 'LightModelPosition', Shader.VT_VEC3);
        vshader.setConstant(8, 'LightModelDirection', Shader.VT_VEC3);
        vshader.setConstant(9, 'LightAmbient', Shader.VT_VEC3);
        vshader.setConstant(10, 'LightDiffuse', Shader.VT_VEC3);
        vshader.setConstant(11, 'LightSpecular', Shader.VT_VEC3);
        vshader.setConstant(12, 'LightSpotCutoff', Shader.VT_VEC4);
        vshader.setConstant(13, 'LightAttenuation', Shader.VT_VEC4);
        vshader.setProgram(LightSpotPerVertexEffect.VS);

        let fshader = new FragShader('LightSpotPerVertexFS');
        fshader.setProgram(LightSpotPerVertexEffect.FS);

        let pass = new VisualPass();
        pass.program = new Program('LightSpotPerVertexProgram', vshader, fshader);
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
     * 创建点光源顶点光照程序
     *
     * @param {Light} light
     * @param {Material} material
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        let instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setVertexConstant(0, 1, new WMatrixConstant());
        instance.setVertexConstant(0, 2, new CameraModelPositionConstant());
        instance.setVertexConstant(0, 3, new MaterialEmissiveConstant(material));
        instance.setVertexConstant(0, 4, new MaterialAmbientConstant(material));
        instance.setVertexConstant(0, 5, new MaterialDiffuseConstant(material));
        instance.setVertexConstant(0, 6, new MaterialSpecularConstant(material));
        instance.setVertexConstant(0, 7, new LightModelPositionConstant(light));
        instance.setVertexConstant(0, 8, new LightModelDirectionConstant(light));
        instance.setVertexConstant(0, 9, new LightAmbientConstant(light));
        instance.setVertexConstant(0, 10, new LightDiffuseConstant(light));
        instance.setVertexConstant(0, 11, new LightSpecularConstant(light));
        instance.setVertexConstant(0, 12, new LightSpotConstant(light));
        instance.setVertexConstant(0, 13, new LightAttenuationConstant(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param {Light} light
     * @param {Material} material
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        let effect = new LightSpotPerVertexEffect();
        return effect.createInstance(light, material);
    }
}

DECLARE_ENUM(LightSpotPerVertexEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightModelDirection;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightSpotCutoff;
uniform vec4 LightAttenuation;

layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec4 vColor;

void main(){
    vec3 nor = normalize(modelNormal);
    vec3 spotDir = normalize( LightModelDirection );
    vec3 lightDir = LightModelPosition - modelPosition;     // 指向光源的向量
    float attr = length(WMatrix * vec4(lightDir, 1.0));     // 距离, 距离衰减系数
    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));
    lightDir = normalize(lightDir);
    float dWeight = max(dot(nor, lightDir), 0.0);           // 漫反射权重
    vec3 color = MaterialAmbient * LightAmbient;
    if (dWeight > 0.0) {
        float spotEffect = dot(spotDir, -lightDir);         // 聚光轴 与 光线 的夹角cos值
        if (spotEffect >= LightSpotCutoff.y) {
            spotEffect = pow(spotEffect, LightSpotCutoff.w);
            vec3 reflectDir = normalize( reflect(-lightDir, nor) );            // 计算反射方向
            vec3 viewVector = normalize(CameraModelPosition - modelPosition);  // 观察方向
            float sWeight = max( dot(reflectDir, viewVector), 0.0);
            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));
            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse;        // 漫反射分量
            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular;  // 高光分量
            color = color + spotEffect * sColor;
        }
    }
    vColor = vec4(MaterialEmissive + attr*color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main() {
    fragColor = vColor;
}`});

export { LightSpotPerVertexEffect };