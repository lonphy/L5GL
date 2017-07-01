import { default as webgl } from './GLMapping';
import { Shader } from '../../shaders/Shader';

class GLShader {
    /**
     * @param {Renderer} renderer
     * @param {Shader} shader
     * @param {ShaderParameters} parameters
     * @param {number} maxSamplers
     */
    setSamplerState(renderer, shader, parameters, maxSamplers) {
        let gl = renderer.gl;

        let numSamplers = shader.numSamplers;
        if (numSamplers > maxSamplers) {
            numSamplers = maxSamplers;
        }

        for (let i = 0; i < numSamplers; ++i) {
            let type = shader.getSamplerType(i);
            let target = webgl.TextureTarget[type];
            let textureUnit = shader.getTextureUnit(i);
            const texture = parameters.getTexture(i);
            let wrap0, wrap1;

            let samplerState = shader.getSamplerState(i);

            switch (type) {
                case Shader.ST_2D:
                    {
                        renderer._enableTexture2D(texture, textureUnit);
                        renderer._enableSamplerState(samplerState, textureUnit);
                        if (samplerState.maxAnisotropy !== gl.getTexParameter(gl.TEXTURE_2D, webgl.TEXTURE_MAX_ANISOTROPY_EXT)) {
                            gl.texParameterf(gl.TEXTURE_2D, webgl.TEXTURE_MAX_ANISOTROPY_EXT, samplerState.maxAnisotropy);
                        }
                        break;
                    }
                case Shader.ST_CUBE:
                    {
                        renderer._enableTextureCube(texture, textureUnit);
                        renderer._enableSamplerState(samplerState, textureUnit);
                        if (samplerState.maxAnisotropy !== gl.getTexParameter(gl.TEXTURE_CUBE_MAP, webgl.TEXTURE_MAX_ANISOTROPY_EXT)) {
                            gl.texParameterf(gl.TEXTURE_CUBE_MAP, webgl.TEXTURE_MAX_ANISOTROPY_EXT, samplerState.maxAnisotropy);
                        }
                        break;
                    }
                case Shader.ST_3D:
                    break;
                case Shader.ST_2D_ARRAY:
                    break;
                default:
                    console.assert(false, 'Invalid sampler type');
                    break;
            }
        }
    }

    /**
     * @param {Shader} shader
     * @param {ShaderParameters} parameters
     * @param {Renderer} renderer
     * @param {number} maxSamplers
     */
    disableTexture(renderer, shader, parameters, maxSamplers) {
        let numSamplers = shader.numSamplers;
        if (numSamplers > maxSamplers) {
            numSamplers = maxSamplers;
        }

        let type, textureUnit, texture;

        for (let i = 0; i < numSamplers; ++i) {
            type = shader.getSamplerType(i);
            textureUnit = shader.getTextureUnit(i);
            texture = parameters.getTexture(i);

            switch (type) {
                case Shader.ST_2D:
                    {
                        renderer._disableTexture2D(texture, textureUnit);
                        break;
                    }
                case Shader.ST_CUBE:
                    {
                        renderer._disableTextureCube(texture, textureUnit);
                        break;
                    }
                case Shader.ST_3D:
                    break;
                case Shader.ST_2D_ARRAY:
                    break;
                default:
                    console.assert(false, 'Invalid sampler type');
                    break;
            }
        }
    }
}

export { GLShader };