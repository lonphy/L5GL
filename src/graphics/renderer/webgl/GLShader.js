/**
 * Shader 底层包装
 * @author lonphy
 * @version 2.0
 */
import { default as webgl } from './GLMapping'
import { Shader } from '../../shaders/Shader'

export class GLShader {
    /**
     * @param {Shader} shader
     * @param {ShaderParameters} parameters
     * @param {number} maxSamplers
     * @param {Renderer} renderer
     * @param {number} currentSS RendererData::SamplerState
     */
    setSamplerState(renderer, shader, parameters, maxSamplers, currentSS) {
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
            let current = currentSS[textureUnit];
            let wrap0, wrap1;

            switch (type) {
                case Shader.ST_2D:
                    {
                        renderer._enableTexture2D(texture, textureUnit);
                        current.getCurrent(renderer, target);

                        wrap0 = webgl.WrapMode[shader.getCoordinate(i, 0)];
                        if (wrap0 != current.wrap[0]) {
                            current.wrap[0] = wrap0;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap0);
                        }

                        wrap1 = webgl.WrapMode[shader.getCoordinate(i, 1)];
                        if (wrap1 != current.wrap[1]) {
                            current.wrap[1] = wrap1;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap1);
                        }
                        break;
                    }
                case Shader.ST_CUBE:
                    {
                        renderer._enableTextureCube(texture, textureUnit);
                        current.getCurrent(renderer, target);

                        wrap0 = webgl.WrapMode[shader.getCoordinate(i, 0)];
                        if (wrap0 != current.wrap[0]) {
                            current.wrap[0] = wrap0;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap0);
                        }

                        wrap1 = webgl.WrapMode[shader.getCoordinate(i, 1)];
                        if (wrap1 != current.wrap[1]) {
                            current.wrap[1] = wrap1;
                            gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap1);
                        }
                        break;
                    }
                default:
                    console.assert(false, 'Invalid sampler type');
                    break;
            }

            // Set the anisotropic filtering value.
            const maxAnisotropy = Shader.MAX_ANISOTROPY;
            let anisotropy = shader.getAnisotropy(i);
            if (anisotropy < 1 || anisotropy > maxAnisotropy) {
                anisotropy = 1;
            }
            if (anisotropy != current.anisotropy) {
                current.anisotropy = anisotropy;
                gl.texParameterf(target, webgl.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
            }

            // Set the magfilter mode.
            let filter = shader.getFilter(i);
            if (filter === Shader.SF_NEAREST) {
                if (gl.NEAREST !== current.magFilter) {
                    current.magFilter = gl.NEAREST;
                    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                }
            } else {
                if (gl.LINEAR != current.magFilter) {
                    current.magFilter = gl.LINEAR;
                    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }
            }

            // Set the minfilter mode.
            let minFilter = webgl.TextureFilter[filter];
            if (minFilter != current.minFilter) {
                current.minFilter = minFilter;
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);
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
                default:
                    console.assert(false, "Invalid sampler type\n");
                    break;
            }
        }
    }
}
