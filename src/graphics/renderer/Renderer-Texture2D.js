/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer.prototype._bindTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer._bindAllTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer.prototype._unbindTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer._unbindAllTexture2D = function (texture) {
};
/**
 * @param texture {L5.Texture2D}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._enableTexture2D = function (texture, textureUnit) {
    var glTexture2D = this.texture2Ds.get(texture);
    if (!glTexture2D) {
        glTexture2D = new L5.GLTexture2D(this, texture);
        this.texture2Ds.set(texture, glTexture2D);
    }
    glTexture2D.enable(this, textureUnit);
};
/**
 * @param texture {L5.Texture2D}
 * @param textureUnit {number}
 * @private
 */
L5.Renderer.prototype._disableTexture2D = function (texture, textureUnit) {
    var glTexture2D = this.texture2Ds.get(texture);
    if (glTexture2D) {
        glTexture2D.disable(this, textureUnit);
    }
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockTexture2D = function (texture, level, mode) {
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._unlockTexture2D = function (texture, level) {
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @private
 */
L5.Renderer.prototype._updateTexture2D = function (texture, level) {
};
/**
 * @param texture {L5.Texture2D}
 * @param level {number}
 * @private
 */
L5.Renderer._updateAllTexture2D = function (texture, level) {
};
