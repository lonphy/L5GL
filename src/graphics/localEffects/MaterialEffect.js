/**
 * 材质效果着色器
 */
import { DECLARE_ENUM } from '../../util/util'
import {
    Shader, VertexShader, FragShader, Program,
    VisualPass, VisualTechnique, VisualEffectInstance, VisualEffect,
    AlphaState, CullState, DepthState, OffsetState, StencilState,
} from '../shaders/namespace'
import { PVWMatrixConstant, MaterialDiffuseConstant } from '../shaderFloat/namespace'

export class MaterialEffect extends VisualEffect {
    constructor() {
        super();

        var vs = new VertexShader('MaterialVS', 1, 1);
        vs.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vs.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vs.setProgram(MaterialEffect.VS);

        var fs = new FragShader('MaterialFS', 0, 1);
        fs.setConstant(0, 'MaterialDiffuse', Shader.VT_VEC4);
        fs.setProgram(MaterialEffect.FS);

        var program = new Program('MaterialProgram', vs, fs);
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
     * @param {Material} material
     * @returns {VisualEffectInstance}
     */
    createInstance(material) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setFragConstant(0, 0, new MaterialDiffuseConstant(material));
        return instance;
    }

    /**
     * @param {Material} material
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(material) {
        var effect = new MaterialEffect();
        return effect.createInstance(material);
    }
}

DECLARE_ENUM(MaterialEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
void main(){
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
}
`,
    FS: `#version 300 es
precision highp float;
uniform vec4 MaterialDiffuse;
out vec4 fragColor;
void main(){
    fragColor = MaterialDiffuse;
}
`
});
