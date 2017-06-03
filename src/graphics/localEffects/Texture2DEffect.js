import { DECLARE_ENUM } from '../../util/util'
import {
    VisualEffect, VisualEffectInstance, VisualTechnique, VisualPass,
    Program, Shader, VertexShader, FragShader,
    AlphaState, CullState, DepthState, OffsetState, StencilState
} from '../shaders/namespace'
import { PVWMatrixConstant } from '../shaderFloat/namespace'

export class Texture2DEffect extends VisualEffect {
    /**
     * @param {number} filter 纹理格式， 参考Shader.SF_XXX
     * @param {number} coordinate0 相当于宽度 参考Shader.SC_XXX
     * @param {number} coordinate1 相当于高度 参考Shader.SC_XXX
     */
    constructor(filter, coordinate0, coordinate1) {
        super();
        if (!filter) {
            filter = Shader.SF_NEAREST;
        }
        if (!coordinate0) {
            coordinate0 = Shader.SC_CLAMP_EDGE;
        }
        if (!coordinate1) {
            coordinate1 = Shader.SC_CLAMP_EDGE;
        }

        var vshader = new VertexShader('Texture2DVS', 2, 1, 0);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(Texture2DEffect.VS);

        var fshader = new FragShader('Texture2DFS', 0, 0, 1);
        fshader.setSampler(0, 'BaseSampler', Shader.ST_2D);
        fshader.setFilter(0, filter);
        fshader.setCoordinate(0, 0, coordinate0);
        fshader.setCoordinate(0, 1, coordinate1);
        fshader.setTextureUnit(0, Texture2DEffect.FragTextureUnit);
        fshader.setProgram(Texture2DEffect.FS);

        var program = new Program('Texture2DProgram', vshader, fshader);

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
     * Any change in sampler state is made via the frag shader.
     * @returns {FragShader}
     */
    getFragShader() {
        return super.getFragShader(0, 0);
    }

    /**
     * Create an instance of the effect with unique parameters.
     * If the sampler filter mode is set to a value corresponding to mipmapping,
     * then the mipmaps will be generated if necessary.
     *
     * @param {Texture2D} texture
     * @return {VisualEffectInstance}
     */
    createInstance(texture) {
        var instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setFragTexture(0, 0, texture);

        var filter = this.getFragShader().getFilter(0);
        if (filter !== Shader.SF_NEAREST && filter != Shader.SF_LINEAR && !texture.hasMipmaps) {
            texture.upload();
        }

        return instance;
    }

    /**
     * Convenience for creating an instance.  The application does not have to
     * create the effect explicitly in order to create an instance from it.
     * @param texture {Texture2D}
     * @param filter {number}
     * @param coordinate0 {number}
     * @param coordinate1 {number}
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(texture, filter, coordinate0, coordinate1) {
        var effect = new Texture2DEffect();
        var fshader = effect.getFragShader();
        fshader.setFilter(0, filter);
        fshader.setCoordinate(0, 0, coordinate0);
        fshader.setCoordinate(0, 1, coordinate1);
        return effect.createInstance(texture);
    }
};

DECLARE_ENUM(Texture2DEffect, {
    FragTextureUnit: 0,
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=8) in vec2 modelTCoord0;
out vec2 vTCoord;
void main () {
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    vTCoord = modelTCoord0;
}
`,
    FS: `#version 300 es
precision highp float;
uniform sampler2D BaseSampler;
in vec2 vTCoord;
out vec4 fragColor;
void main (void) {
    fragColor = texture(BaseSampler, vTCoord);
}
`});
