/**
 * 平行光 光照效果 (顶点Blinn光照)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightDirPerVerEffect}
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
import {CameraModelPositionConstant} from '../shaderFloat/CameraModelPositionConstant'
import {MaterialEmissiveConstant} from '../shaderFloat/MaterialEmissiveConstant'
import {MaterialAmbientConstant} from '../shaderFloat/MaterialAmbientConstant'
import {MaterialDiffuseConstant} from '../shaderFloat/MaterialDiffuseConstant'
import {MaterialSpecularConstant} from '../shaderFloat/MaterialSpecularConstant'
import {LightModelDirectionConstant} from '../shaderFloat/LightModelDirectionConstant'
import {LightAmbientConstant} from '../shaderFloat/LightAmbientConstant'
import {LightDiffuseConstant} from '../shaderFloat/LightDiffuseConstant'
import {LightSpecularConstant} from '../shaderFloat/LightSpecularConstant'
import {LightAttenuationConstant} from '../shaderFloat/LightAttenuationConstant'

export class LightDirPerVerEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('LightDirPerVerVS', 2, 11);
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

        var fshader = new FragShader('LightDirPerVerFS');
        fshader.setProgram(LightDirPerVerEffect.FS);

        var program = new Program('LightDirPerVerProgram', vshader, fshader);

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
        var effect = new LightDirPerVerEffect();
        return effect.createInstance(light, material);
    }

    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    postLink() {
        super.postLink();
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.vertexShader = (LightDirPerVerEffect.VertexSource);
        pass.program.fragShader.fragShader = (LightDirPerVerEffect.FragSource);
        this.techniques = this.___;
    }
};

DECLARE_ENUM(LightDirPerVerEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform vec3 CameraModelPosition;
uniform vec3 MaterialEmissive;
uniform vec3 MaterialAmbient;
uniform vec4 MaterialDiffuse;
uniform vec4 MaterialSpecular;       // alpha通道存储光滑度
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
    vec3 color = LightAmbient * MaterialAmbient;                      // 环境光分量
    float t = max( dot(nor, dir) , 0.0);                                      // 入射角cos值
    if ( t > 0.0) {
        color = color + t * MaterialDiffuse.rgb * LightDiffuse;             // 漫反射分量
        vec3 viewVector = normalize(CameraModelPosition - modelPosition);   // 观察方向
        vec3 reflectDir = normalize( reflect(-dir, nor) );                      // 反射方向
        t = max( dot(reflectDir, viewVector), 0.0);
        float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0));
        color = weight * MaterialSpecular.rgb * LightSpecular + color;      // 高光分量
    }
    color = color * LightAttenuation.w + MaterialEmissive;                // 加入总光强系数
    vColor = vec4(color, MaterialDiffuse.a);
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}`,
    FS: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(){
    fragColor = vColor;
}
`
});

D3Object.Register('L5.LightDirPerVerEffect', LightDirPerVerEffect.factory);
