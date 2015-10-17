/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._bindVertexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer._bindAllVertexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._unbindVertexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer._unbindAllVertexBuffer = function(
    buffer
){};
/**
 * @param buffer {L5.VertexBuffer}
 * @param streamIndex {number}
 * @param offset {number}
 * @private
 */
L5.Renderer.prototype._enableVertexBuffer = function(
    buffer, streamIndex, offset) {
    // TODO:  Renderer::Draw calls Enable, but using the default values
    // of 0 for streamIndex and offset.  This means that the DX9 renderer can
    // never set a streamIndex different from 1.  The DX9 and OpenGL renderers
    // always enabled the buffer starting at offset 0.  Minimally, the
    // streamIndex handling needs to be different.

    var glVBuffer = this.vertexBuffers.get(buffer);
    if (!glVBuffer) {
        glVBuffer = new L5.GLVertexBuffer(this, buffer);
        this.vertexBuffers.set(buffer, glVBuffer);
    }

    glVBuffer.enable(this, buffer.elementSize);
};
/**
 * @param buffer {L5.VertexBuffer}
 * @param streamIndex {number}
 * @private
 */
L5.Renderer.prototype._disableVertexBuffer = function(
    buffer, streamIndex) {
    var glVBuffer = this.vertexBuffers.get(buffer);
    if (glVBuffer) {
        glVBuffer.disable(this, streamIndex);
    }
};
/**
 * @param buffer {L5.VertexBuffer}
 * @param mode {number} L5.BUFFER_LOCK_XXX
 * @private
 */
L5.Renderer.prototype._lockVertexBuffer = function(
    buffer, mode
){};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._unlockVertexBuffer = function(
    buffer
) {};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer.prototype._updateVertexBuffer = function(
    buffer) {
    var glVBuffer = this.vertexBuffers.get(buffer);
    if (!glVBuffer) {
        glVBuffer = new L5.GLVertexBuffer(this, buffer);
        this.vertexBuffers.set(buffer, glVBuffer);
    }

    glVBuffer.update(this, buffer);
};
/**
 * @param buffer {L5.VertexBuffer}
 * @private
 */
L5.Renderer._updateAllVertexBuffer = function(
    buffer) {
    L5.Renderer.renderers.forEach(function (renderer) {
        renderer._updateVertexBuffer(buffer);
    });
};