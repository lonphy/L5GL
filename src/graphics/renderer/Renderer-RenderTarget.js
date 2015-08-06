
// RenderTarget管理.
// The index i in ReadColor is the index of the target in a multiple render target object.
// Set the input texture pointer to null if you want ReadColor to create the
// texture.  If you provide an already existing texture, it must be of the
// correct format and size; otherwise, ReadColor creates an appropriate
// one, destroys yours, and gives you the new one.

/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._bindRenderTarget = function(
    renderTarget
) {};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer._bindAllRenderTarget = function(
    renderTarget
){};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._unbindRenderTarget = function(
    renderTarget
) {};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer._unbindAllRenderTarget = function(
    renderTarget
){};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._enableRenderTarget = function(
    renderTarget
) {};
/**
 * @param renderTarget {L5.RenderTarget}
 * @private
 */
L5.Renderer.prototype._disableRenderTarget = function(
    renderTarget
){};

/**
 * @param i {number}
 * @param renderTarget {L5.RenderTarget}
 * @param texture {L5.Texture2D}
 * @private
 */
L5.Renderer.prototype.readerColor = function(
    i, renderTarget, texture
) {};

