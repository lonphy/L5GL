/**
 * TextureCube 底层封装
 * @author lonphy
 * @version 2.0
 */
import {default as webgl} from './GLMapping'

export class GLTextureCube {
    constructor(renderer, texture) {
        var gl              = renderer.gl;
        var _format         = texture.format;
        this.internalFormat = webgl.TextureFormat[ _format ];

        this.format = webgl.TextureFormat[ _format ];
        this.type   = webgl.TextureType[ _format ];

        // Create pixel buffer objects to store the texture data.
        var level, levels = texture.numLevels;
        this.numLevels    = levels;

        for (level = 0; level < levels; ++level) {
            this.numLevelBytes[ level ]  = texture.numLevelBytes[ level ];
            this.dimension[ 0 ][ level ] = texture.getDimension (0, level);
            this.dimension[ 1 ][ level ] = texture.getDimension (1, level);
        }

        // Create a texture structure.
        this.texture         = gl.createTexture ();
        this.previousTexture = gl.getTexParameter (gl.TEXTURE_BINDING_CUBE_MAP);
        gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.texture);

        var face;
        // Create the mipmap level structures.  No image initialization occurs.
        this.isCompressed = texture.isCompressed ();
        if (this.isCompressed) {
            for (face = 0; face < 6; ++face) {
                for (level = 0; level < levels; ++level) {
                    gl.compressedTexImage2D (
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                        level,
                        this.internalFormat,
                        this.dimension[ 0 ][ level ],
                        this.dimension[ 1 ][ level ],
                        0,
                        this.numLevelBytes[ level ],
                        0);
                }
            }
        } else {
            for (face = 0; face < 6; ++face) {
                for (level = 0; level < mNumLevels; ++level) {
                    gl.texImage2D (
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                        level,
                        this.internalFormat,
                        this.dimension[ 0 ][ level ],
                        this.dimension[ 1 ][ level ],
                        0,
                        this.format,
                        this.type,
                        texture.getData (level)
                    );
                }
            }
        }

        gl.bindTexture (gl.TEXTURE_CUBE_MAP, previousBind);
    }

    enable(renderer, textureUnit) {
        var gl               = renderer.gl;
        gl.activeTexture (gl.TEXTURE0 + textureUnit);
        this.previousTexture = gl.getTexParameter (gl.TEXTURE_BINDING_CUBE_MAP);
        gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.texture);
    }

    disable (renderer, textureUnit) {
        let gl = renderer.gl;
        gl.activeTexture (gl.TEXTURE0 + textureUnit);
        gl.bindTexture (gl.TEXTURE_CUBE_MAP, this.previousTexture);
    }
}