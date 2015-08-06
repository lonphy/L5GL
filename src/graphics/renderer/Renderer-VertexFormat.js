/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._bindVertexFormat = function(
    format
) {
    if (!this.vertexFormats.has(format)) {
        this.vertexFormats[format] = new PdrVertexFormat(this, format);
    }
};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer._bindAllVertexFormat = function(
    format
){};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._unbindVertexFormat = function(
    format
) {};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer._unbindAllVertexFormat = function(
    format
){};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._enableVertexFormat = function(
    format
) {};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._disableVertexFormat = function(
    format
){};