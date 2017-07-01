import { DECLARE_ENUM } from '../../util/util';
import { PVWMatrixConstant } from '../shaderFloat/namespace';
import {
    VisualEffect,
    VisualEffectInstance,
    VisualTechnique,
    VisualPass,

    Program,
    Shader,
    VertexShader,
    FragShader,
    SamplerState,

    AlphaState,
    CullState,
    DepthState,
    OffsetState,
    StencilState
} from '../shaders/namespace';

class Texture2DEffect extends VisualEffect {
    /**
     * @param {SamplerState} filter
     */
    constructor(sampler = null) {
        super();

        let vshader = new VertexShader('Texture2DVS', 2, 1, 0);
        vshader.setInput(0, 'modelPosition', Shader.VT_VEC3, Shader.VS_POSITION);
        vshader.setInput(1, 'modelTCoord0', Shader.VT_VEC2, Shader.VS_TEXCOORD0);
        vshader.setConstant(0, 'PVWMatrix', Shader.VT_MAT4);
        vshader.setProgram(Texture2DEffect.VS);

        let fshader = new FragShader('Texture2DFS', 0, 0, 1);
        fshader.setSampler(0, 'BaseSampler', Shader.ST_2D);
        fshader.setSamplerState(0, sampler || SamplerState.defaultSampler);
        fshader.setTextureUnit(0, Texture2DEffect.FragTextureUnit);
        fshader.setProgram(Texture2DEffect.FS);

        let pass = new VisualPass();
        pass.program = new Program('Texture2DProgram', vshader, fshader);
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
        let instance = new VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new PVWMatrixConstant());
        instance.setFragTexture(0, 0, texture);
        texture.upload();
        return instance;
    }

    /**
     * Convenience for creating an instance.  The application does not have to
     * create the effect explicitly in order to create an instance from it.
     * @param {Texture2D} texture
     * @param {SamplerState} sampler
     * @returns {VisualEffectInstance}
     */
    static createUniqueInstance(texture, sampler = null) {
        let effect = new Texture2DEffect();
        let fshader = effect.getFragShader();
        if (sampler !== null) {
            fshader.setSampler(0, sampler);
        }
        return effect.createInstance(texture);
    }
}

DECLARE_ENUM(Texture2DEffect, {
    FragTextureUnit: 0,
    VS: `#version 300 es
uniform mat4 PVWMatrix;
layout(location=0) in vec3 modelPosition;
layout(location=8) in vec2 modelTCoord0;
out vec2 tcoord;
void main () {
    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);
    tcoord = modelTCoord0;
}`,
    FS: `#version 300 es
precision highp float;
uniform sampler2D BaseSampler;
in vec2 tcoord;
out vec4 fragColor;
void main (void) {
    fragColor = texture(BaseSampler, tcoord);
}`});

export { Texture2DEffect };
