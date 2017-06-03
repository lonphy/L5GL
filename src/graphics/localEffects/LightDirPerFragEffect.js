/**
 * Gouraud 光照效果 (片段Blinn光照)
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {LightDirPerFragEffect}
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

export class LightDirPerFragEffect extends VisualEffect {

    constructor() {
        super();

        var vshader = new VertexShader('LightDirPerFragVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(LightDirPerFragEffect.VS);

        var fshader = new FragShader('LightDirPerFragFS', 0, 10);
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
        fshader.setProgram(LightDirPerFragEffect.FS);

        var program = new Program('LightDirPerFragProgram', vshader, fshader);

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

    static createUniqueInstance(light, material) {
        var effect = new LightDirPerFragEffect();
        return effect.createInstance(light, material);
    }

    createInstance(light, material) {
        var instance = new VisualEffectInstance(this, 0);
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
        return instance;
    }


    load(inStream) {
        this.___ = this.techniques;
        super.load(inStream);
    }

    postLink() {
        super.postLink();
        var pass = this.techniques[0].getPass(0);
        pass.program.vertexShader.program = (LightDirPerFragEffect.VS);
        pass.program.fragShader.program = (LightDirPerFragEffect.FS);

        this.techniques = this.___;
    }
};

DECLARE_ENUM(LightDirPerFragEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;
void main(){
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
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
in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;
void main () {
    vec3 normal = normalize(vertexNormal);
    vec3 color = LightAmbient * MaterialAmbient;           // 计算环境光分量
    float t = abs(dot(normal, LightModelDirection));        // 计算入射角cos值
    color = color + t * MaterialDiffuse.rgb * LightDiffuse;   // 计算漫反射分量
    if (t > 0.0) {
        vec3 tmp = normalize(CameraModelPosition - vertexPosition);
        tmp = normalize(tmp - LightModelDirection);
        t = max(dot(normal, tmp), 0.0);
        float weight = pow(t, clamp(MaterialSpecular.w, -128.0, 128.0) );
        color = weight * MaterialSpecular.rgb * LightSpecular + color;
    }
    color = color * LightAttenuation.w + MaterialEmissive;
    fragColor = vec4(color, MaterialDiffuse.a);
}
`
});

D3Object.Register('LightDirPerFragEffect', LightDirPerFragEffect.factory);
