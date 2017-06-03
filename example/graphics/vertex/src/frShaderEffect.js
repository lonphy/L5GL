/**
 * 点光源 顶点变形 + 片元光照效果
 */
import {
    DECLARE_ENUM,
    VisualEffect, VisualEffectInstance, VisualTechnique, VisualPass,
    Program, Shader, VertexShader, FragShader,
    AlphaState, CullState, DepthState, OffsetState, StencilState,
    PVWMatrixConstant, WMatrixConstant, CameraModelPositionConstant, MaterialEmissiveConstant, MaterialAmbientConstant, MaterialDiffuseConstant,
    MaterialSpecularConstant, LightModelPositionConstant, LightAmbientConstant, LightDiffuseConstant, LightSpecularConstant, LightAttenuationConstant
} from '../../../../dist/l5gl.module'

export class FRShaderEffect extends VisualEffect {

    constructor() {
        super();
        var vshader = new VertexShader('FRShaderEffectVS', 2, 1);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelNormal', Shader.VT_VEC3, Shader.VS_NORMAL);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(FRShaderEffect.VS);

        var fshader = new FragShader('FRShaderEffectFS', 0, 11);
        fshader.setConstant(0, 'WMatrix', Shader.VT_MAT4);
        fshader.setConstant(1, 'CameraModelPosition', Shader.VT_VEC3);
        fshader.setConstant(2, 'MaterialEmissive', Shader.VT_VEC3);
        fshader.setConstant(3, 'MaterialAmbient', Shader.VT_VEC3);
        fshader.setConstant(4, 'MaterialDiffuse', Shader.VT_VEC4);
        fshader.setConstant(5, 'MaterialSpecular', Shader.VT_VEC4);
        fshader.setConstant(6, 'LightModelPosition', Shader.VT_VEC3);
        fshader.setConstant(7, 'LightAmbient', Shader.VT_VEC3);
        fshader.setConstant(8, 'LightDiffuse', Shader.VT_VEC3);
        fshader.setConstant(9, 'LightSpecular', Shader.VT_VEC3);
        fshader.setConstant(10, 'LightAttenuation', Shader.VT_VEC4);
        fshader.setProgram(FRShaderEffect.FS);

        var program = new Program('FRShaderEffectProgram', vshader, fshader);

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
        instance.setFragConstant(0, 0, new WMatrixConstant());

        instance.setFragConstant(0, 1, new CameraModelPositionConstant());
        instance.setFragConstant(0, 2, new MaterialEmissiveConstant(material));
        instance.setFragConstant(0, 3, new MaterialAmbientConstant(material));
        instance.setFragConstant(0, 4, new MaterialDiffuseConstant(material));
        instance.setFragConstant(0, 5, new MaterialSpecularConstant(material));
        instance.setFragConstant(0, 6, new LightModelPositionConstant(light));
        instance.setFragConstant(0, 7, new LightAmbientConstant(light));
        instance.setFragConstant(0, 8, new LightDiffuseConstant(light));
        instance.setFragConstant(0, 9, new LightSpecularConstant(light));
        instance.setFragConstant(0, 10, new LightAttenuationConstant(light));
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
        var effect = new FRShaderEffect();
        return effect.createInstance(light, material);
    }
};

DECLARE_ENUM(FRShaderEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=2) in vec3 modelNormal;
out vec3 vertexPosition;
out vec3 vertexNormal;

void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vertexPosition = modelPosition;
    vertexNormal = modelNormal;
}
`,
    FS: `#version 300 es
#pragma debug(on)

precision highp float;
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

in vec3 vertexPosition;
in vec3 vertexNormal;
out vec4 fragColor;

void main(){
    vec3 normal = normalize(vertexNormal);
    vec3 vertexLightDiff = LightModelPosition - vertexPosition;
    vec3 vertexDirection = normalize(vertexLightDiff);
    float t = length(mat3(WMatrix) * vertexDirection);

    // t = intensity / (constant + d * linear + d*d* quadratic);
    t = LightAttenuation.w/(LightAttenuation.x + t * (LightAttenuation.y + t*LightAttenuation.z));
    vec3 color = MaterialAmbient * LightAmbient;

    float d = max(dot(normal, vertexDirection), 0.0);
    color = color + d * MaterialDiffuse.rgb * LightDiffuse;

    if (d > 0.0) {
        vec3 viewVector = normalize(CameraModelPosition - vertexPosition);
        vec3 reflectDir = normalize( -reflect(vertexDirection, normal) );               // 计算反射方向
        d = max(dot(reflectDir, viewVector), 0.0);
        d = pow(d, clamp(MaterialSpecular.a, -128.0, 128.0));
        color = color + d * MaterialSpecular.rgb * LightSpecular;
    }
    fragColor.rgb = MaterialEmissive + t * color;
    fragColor.a = MaterialDiffuse.a;
}
`
});