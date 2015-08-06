/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer.prototype._bindTextureCube = function(
    texture
) {};
/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer._bindAllTextureCube = function(
    texture
){};
/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer.prototype._unbindTextureCube = function(
    texture
) {};
/**
 * @param texture {L5.TextureCube}
 * @private
 */
L5.Renderer._unbindAllTextureCube = function(
    texture
){};
/**
 * @param texture {L5.TextureCube}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._enableTextureCube = function(
    texture, textureUnit
) {};
/**
 * @param texture {L5.TextureCube}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._disableTextureCube = function(
    texture, textureUnit
){};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockTextureCube = function(
    texture, face, level, mode
){};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._unlockTextureCube = function(
    texture, face, level
) {};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._updateTextureCube = function(
    texture, face, level
) {};
/**
 * @param texture {L5.TextureCube}
 * @param face {number}
 * @param level {number}
 * @private
 */
L5.Renderer._updateAllTextureCube = function(
    texture, face, level
) {};
