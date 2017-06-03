/**
 * 聚光灯 片元光照效果
 * @class
 * @extends {VisualEffect}
 *
 * @author lonphy
 * @version 2.0
 */
import { D3Object } from '../../core/D3Object'
import { DECLARE_ENUM } from '../../util/util'
import { VisualEffect } from '../shaders/VisualEffect'
import { VisualEffectInstance } from '../shaders/VisualEffectInstance'
import { VisualTechnique } from '../shaders/VisualTechnique'
import { VisualPass } from '../shaders/VisualPass'
import { Program } from '../shaders/Program'
import { Shader } from '../shaders/Shader'
import { VertexShader } from '../shaders/VertexShader'
import { FragShader } from '../shaders/FragShader'
import { AlphaState } from '../shaders/AlphaState'
import { CullState } from '../shaders/CullState'
import { DepthState } from '../shaders/DepthState'
import { OffsetState } from '../shaders/OffsetState'
import { StencilState } from '../shaders/StencilState'

import { PVWMatrixConstant } from '../shaderFloat/PVWMatrixConstant'
import { WMatrixConstant } from '../shaderFloat/WMatrixConstant'
import { CameraModelPositionConstant } from '../shaderFloat/CameraModelPositionConstant'
import { MaterialEmissiveConstant } from '../shaderFloat/MaterialEmissiveConstant'
import { MaterialAmbientConstant } from '../shaderFloat/MaterialAmbientConstant'
import { MaterialDiffuseConstant } from '../shaderFloat/MaterialDiffuseConstant'
import { MaterialSpecularConstant } from '../shaderFloat/MaterialSpecularConstant'
import { LightModelPositionConstant } from '../shaderFloat/LightModelPositionConstant'
import { LightModelDirectionConstant } from '../shaderFloat/LightModelDirectionConstant'
import { LightAmbientConstant } from '../shaderFloat/LightAmbientConstant'
import { LightDiffuseConstant } from '../shaderFloat/LightDiffuseConstant'
import { LightSpecularConstant } from '../shaderFloat/LightSpecularConstant'
import { LightSpotConstant } from '../shaderFloat/LightSpotConstant'
import { LightAttenuationConstant } from '../shaderFloat/LightAttenuationConstant'

export class LightSpotPerFragEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightSpotPerFragVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(LightSpotPerFragEffect.VertexSource);

        var fshader = new FragShader('LightSpotPerFragFS', 2, 13);
        fshader.setInput(0, 'vertexPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        fshader.setInput(1, 'vertexNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC4);
        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC4);
        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC4);
        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC4);
        fshader.setConstant(7, 'LightModelDirection', Shader.VT_VEC4);
        fshader.setConstant(8, 'LightAmbient', Shader.VT_VEC4);
        fshader.setConstant(9, 'LightDiffuse', Shader.VT_VEC4);
        fshader.setConstant(10, 'LightSpecular', Shader.VT_VEC4);
        fshader.setConstant(11, 'LightSpotCutoff', Shader.VT_VEC4);
        fshader.setConstant(12, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(LightSpotPerFragEffect.FragSource);

        var program = new Program('LightSpotPerFragProgram', vshader, fshader);

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

    /**
     * 创建聚光灯片元光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setFragConstant(0, 0, new WMatrixConstant());
        instance.setFragConstant(0, 1, new CameraModelPositionConstant());
        instance.setFragConstant(0, 2, new MaterialEmissiveConstant(material));
        instance.setFragConstant(0, 3, new MaterialAmbientConstant(material));
        instance.setFragConstant(0, 4, new MaterialDiffuseConstant(material));
        instance.setFragConstant(0, 5, new MaterialSpecularConstant(material));
        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
        instance.setFragConstant(0, 7, new LightModelDirectionConstant(light));
        instance.setFragConstant(0, 8, new LightAmbientConstant(light));
        instance.setFragConstant(0, 9, new LightDiffuseConstant(light));
        instance.setFragConstant(0, 10, new LightSpecularConstant(light));
        instance.setFragConstant(0, 11, new LightSpotConstant(light));
        instance.setFragConstant(0, 12, new LightAttenuationConstant(light));
        return instance;
    }


    /**
     * 创建唯一聚光灯光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new LightSpotPerFragEffect();
        return effect.createInstance(light, material);
    }
};

DECLARE_ENUM(LightSpotPerFragEffect, {
    VertexSource: [
        'uniform mat4 PVWMatrix;',
        'attribute vec3 modelPosition;',
        'attribute vec3 modelNormal;',
        'varying vec3 vertexPosition;',
        'varying vec3 vertexNormal;',
        'void main(){',
        '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
        '    vertexPosition = modelPosition;',
        '    vertexNormal = modelNormal;',
        '}'
    ].join('\n'),
    FragSource: [
        'precision highp float;',
        'uniform mat4 WMatrix;',
        'uniform vec4 CameraModelPosition;',
        'uniform vec4 MaterialEmissive;',
        'uniform vec4 MaterialAmbient;',
        'uniform vec4 MaterialDiffuse;',
        'uniform vec4 MaterialSpecular;',
        'uniform vec4 LightModelPosition;',
        'uniform vec4 LightModelDirection;',
        'uniform vec4 LightAmbient;',
        'uniform vec4 LightDiffuse;',
        'uniform vec4 LightSpecular;',
        'uniform vec4 LightSpotCutoff;',
        'uniform vec4 LightAttenuation;',
        'varying vec3 vertexPosition;',
        'varying vec3 vertexNormal;',
        'void main (void) {',
        '    vec3 nor = normalize(vertexNormal);',
        '    vec3 spotDir = normalize(LightModelDirection.xyz);',
        '    vec3 lightDir = LightModelPosition.xyz - vertexPosition;',     // 指向光源的向量
        '    float attr = length(WMatrix * vec4(lightDir, 1.0));',         // 距离, 距离衰减系数
        '    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));',
        '    lightDir = normalize(lightDir);',
        '    float dWeight = max(dot(nor, lightDir), 0.0);',         // 漫反射权重
        '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',
        '    if (dWeight > 0.0) {',
        '        float spotEffect = dot(spotDir, -lightDir);',          // 聚光轴 与 光线 的夹角cos值
        '        if (spotEffect >= LightSpotCutoff.y) {',
        '            spotEffect = pow(spotEffect, LightSpotCutoff.w);',
        '            vec3 reflectDir = normalize( reflect(-lightDir, nor) );',               // 计算反射方向
        '            vec3 viewVector = normalize(CameraModelPosition.xyz - vertexPosition);', // 观察方向
        '            float sWeight = max( dot(reflectDir, viewVector), 0.0);',
        '            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));',
        '            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse.rgb;',  // 漫反射分量
        '            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular.rgb;',  // 高光分量
        '            color = color + spotEffect * sColor;',
        '        }',
        '    }',
        '    gl_FragColor = vec4(MaterialEmissive.rgb + attr*color, MaterialDiffuse.a);',
        '}'
    ].join('\n')
});