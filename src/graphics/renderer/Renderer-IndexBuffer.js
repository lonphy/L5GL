/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._bindIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer._bindAllIndexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._unbindIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer._unbindAllIndexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._enableIndexBuffer = function(
    buffer) {
    var glIBuffer = this.indexBuffers.get(buffer);
    if (!glIBuffer) {
        glIBuffer = new L5.GLIndexBuffer(this, buffer);
        this.indexBuffers.set(buffer, glIBuffer);
    }
    glIBuffer.enable(this);
};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._disableIndexBuffer = function(
    buffer) {
    var glIBuffer = this.indexBuffers.get(buffer);
    if (glIBuffer) {
        glIBuffer.disable(this);
    }
};
/**
 * @param buffer {L5.IndexBuffer}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockIndexBuffer = function(
    buffer, mode
){};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._unlockIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer.prototype._updateIndexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.IndexBuffer}
 * @private
 */
L5.Renderer._updateAllIndexBuffer = function(
    buffer
) {};
