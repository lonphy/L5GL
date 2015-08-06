/**
 * Shader 底层包装
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLShader = function () {};
L5.nameFix (L5.GLShader, 'GLShader');

/**
 * @param shader {L5.Shader}
 * @param parameters {L5.ShaderParameters}
 * @param profile {number}
 * @param maxSamplers {number}
 * @param renderer {L5.Renderer}
 * @param currentSS {number} RendererData::SamplerState
 */
L5.GLShader.prototype.setSamplerState = function (
    renderer, shader, profile, parameters, maxSamplers, currentSS
) {
    var gl = renderer.gl;

    var numSamplers = shader.numSamplers;
    if (numSamplers > maxSamplers) {
        numSamplers = maxSamplers;
    }

    for (var i = 0; i < numSamplers; ++i) {
        var type        = shader.getSamplerType (i);
        var target      = L5.Webgl.TextureTarget[ type ];
        var textureUnit = shader.getTextureUnit (profile, i);
        const texture   = parameters.getTexture (i);
        var current     = currentSS[ textureUnit ];
        var wrap0, wrap1;

        switch (type) {
            case L5.Shader.ST_2D:
            {
                renderer.enable (texture, textureUnit);
                current.getCurrent (target);

                wrap0 = L5.Webgl.WrapMode[ shader.getCoordinate (i, 0) ];
                if (wrap0 != current.wrap[ 0 ]) {
                    current.wrap[ 0 ] = wrap0;
                    gl.texParameteri (target, gl.TEXTURE_WRAP_S, wrap0);
                }

                wrap1 = L5.Webgl.WrapMode[ shader.getCoordinate (i, 1) ];
                if (wrap1 != current.wrap[ 1 ]) {
                    current.wrap[ 1 ] = wrap1;
                    gl.texParameteri (target, gl.TEXTURE_WRAP_T, wrap1);
                }
                break;
            }
            case L5.Shader.ST_CUBE:
            {
                renderer.enable (texture, textureUnit);
                current.getCurrent (target);

                wrap0 = L5.Webgl.WrapMode[ shader.getCoordinate (i, 0) ];
                if (wrap0 != current.wrap[ 0 ]) {
                    current.wrap[ 0 ] = wrap0;
                    gl.texParameteri (target, gl.TEXTURE_WRAP_S, wrap0);
                }

                wrap1 = L5.Webgl.WrapMode[ shader.getCoordinate (i, 1) ];
                if (wrap1 != current.wrap[ 1 ]) {
                    current.wrap[ 1 ] = wrap1;
                    gl.texParameteri (target, gl.TEXTURE_WRAP_T, wrap1);
                }
                break;
            }
            default:
                L5.assert (false, 'Invalid sampler type');
                break;
        }

        // Set the anisotropic filtering value.
        const maxAnisotropy = L5.Shader.MAX_ANISOTROPY;
        var anisotropy      = shader.getAnisotropy (i);
        if (anisotropy < 1 || anisotropy > maxAnisotropy) {
            anisotropy = 1;
        }
        if (anisotropy != current.anisotropy) {
            current.anisotropy = anisotropy;
            gl.texParameterf (target, L5.Webgl.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
        }

        // Set the magfilter mode.
        var filter = shader.getFilter (i);
        if (filter === L5.Shader.SF_NEAREST) {
            if (gl.NEAREST !== current.magFilter) {
                current.magFilter = gl.NEAREST;
                gl.texParameteri (target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
        } else {
            if (gl.LINEAR != current.magFilter) {
                current.magFilter = gl.LINEAR;
                gl.texParameteri (target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        }

        // Set the minfilter mode.
        var minFilter = L5.Webgl.TextureFilter[ filter ];
        if (minFilter != current.minFilter) {
            current.minFilter = minFilter;
            gl.texParameteri (target, gl.TEXTURE_MIN_FILTER, minFilter);
        }
    }
};
/**
 * @param shader {L5.Shader}
 * @param parameters {L5.ShaderParameters}
 * @param renderer {L5.Renderer}
 * @param maxSamplers {number}
 * @param profile {number}
 */
L5.GLShader.prototype.disableTexture         = function (
    renderer, shader, profile, parameters, maxSamplers
) {
    var numSamplers = shader.numSamplers;
    if (numSamplers > maxSamplers) {
        numSamplers = maxSamplers;
    }

    var type, textureUnit, texture;

    for (var i = 0; i < numSamplers; ++i) {
        type = shader.getSamplerType(i);
        textureUnit = shader.getTextureUnit(profile, i);
        texture = parameters.getTexture(i);

        switch (type)
        {
            case L5.Shader.ST_2D:
            {
                renderer.disable(texture, textureUnit);
                break;
            }
            case L5.Shader.ST_CUBE:
            {
                renderer.disable(texture, textureUnit);
                break;
            }
            default:
                assertion(false, "Invalid sampler type\n");
                break;
        }
    }
};