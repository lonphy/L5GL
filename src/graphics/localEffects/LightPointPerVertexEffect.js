/**
 * 点光源 顶点光照效果 (顶点Blinn光照)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightPointPerVertexEffect}
 * @extends {VisualEffect}
 */
import {D3Object} from '../../core/D3Object'
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
import {WMatrixConstant} from '../shaderFloat/WMatrixConstant'
import {CameraModelPositionConstant} from '../shaderFloat/CameraModelPositionConstant'

import {MaterialEmissiveConstant} from '../shaderFloat/MaterialEmissiveConstant'
import {MaterialAmbientConstant} from '../shaderFloat/MaterialAmbientConstant'
import {MaterialDiffuseConstant} from '../shaderFloat/MaterialDiffuseConstant'
import {MaterialSpecularConstant} from '../shaderFloat/MaterialSpecularConstant'

import {LightModelPositionConstant} from '../shaderFloat/LightModelPositionConstant'

import {LightAmbientConstant} from '../shaderFloat/LightAmbientConstant'
import {LightDiffuseConstant} from '../shaderFloat/LightDiffuseConstant'
import {LightSpecularConstant} from '../shaderFloat/LightSpecularConstant'
import {LightAttenuationConstant} from '../shaderFloat/LightAttenuationConstant'

export class LightPointPerVertexEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightPointPerVertexVS', 2, 12);
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
        vshader.setConstant(8, 'LightAmbient', Shader.VT_VEC3);
        vshader.setConstant(9, 'LightDiffuse', Shader.VT_VEC3);
        vshader.setConstant(10, 'LightSpecular', Shader.VT_VEC3);
        vshader.setConstant(11, 'LightAttenuation', Shader.VT_VEC4);
        vshader.setProgram(LightPointPerVertexEffect.VertexSource);

        var fshader = new FragShader('LightPointPerVertexFS');
        fshader.setProgram(LightPointPerVertexEffect.FragSource);

        var program = new Program('LightPointPerVertexProgram', vshader, fshader);

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
     * 创建点光源顶点光照程序
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setVertexConstant(0, 1, new WMatrixConstant());
        instance.setVertexConstant(0, 2, new CameraModelPositionConstant());
        instance.setVertexConstant(0, 3, new MaterialEmissiveConstant(material));
        instance.setVertexConstant(0, 4, new MaterialAmbientConstant(material));
        instance.setVertexConstant(0, 5, new MaterialDiffuseConstant(material));
        instance.setVertexConstant(0, 6, new MaterialSpecularConstant(material));
        instance.setVertexConstant(0, 7, new LightModelPositionConstant(light));
        instance.setVertexConstant(0, 8, new LightAmbientConstant(light));
        instance.setVertexConstant(0, 9, new LightDiffuseConstant(light));
        instance.setVertexConstant(0, 10, new LightSpecularConstant(light));
        instance.setVertexConstant(0, 11, new LightAttenuationConstant(light));
        return instance;
    }

    /**
     * 创建唯一点光源顶点光照程序
     *
     * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
     *
     * @param light {Light}
     * @param material {Material}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(light, material) {
        var effect = new LightPointPerVertexEffect();
        return effect.createInstance(light, material);
    }

    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    link(inStream) {
        super.link(inStream);
    }

    postLink() {
        super.postLink.call(this);
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.setProgram(LightPointPerVertexEffect.VertexSource);
        pass.program.fragShader.setProgram(LightPointPerVertexEffect.FragSource);
        this.techniques = this.___;
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }
};

DECLARE_ENUM(LightPointPerVertexEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform mat4 WMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;
uniform vec3 LightModelPosition;
uniform vec3 LightAmbient;
uniform vec3 LightDiffuse;
uniform vec3 LightSpecular;
uniform vec4 LightAttenuation;

layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;

out vec4 vColor;
void main(){
    vec3 nor = normalize(modelNormal);
    vec3 v1 = LightModelPosition - modelPosition;  // 指向光源的方向
    float t = length(WMatrix * vec4(v1, 0.0));
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 dir = normalize(v1);                              // 光源方向
    float d = max( dot(nor, dir), 0.0);                    // 计算漫反射权重
    vec3 color = MaterialAmbient * LightAmbient;        // 环境光分量
    color = d * MaterialDiffuse.rgb*LightDiffuse + color; // 漫反射分量
    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - modelPosition); // 观察方向
        vec3 reflectDir = normalize( reflect(-dir, nor) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    vColor = vec4(MaterialEmissive + t*color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main() {
    fragColor = vColor;
}
`
});

D3Object.Register('L5.LightPointPerVertexEffect', LightPointPerVertexEffect.factory);