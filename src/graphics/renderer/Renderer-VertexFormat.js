/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._bindVertexFormat = function(
    format
) {
    if (!this.vertexFormats.has(format)) {
        this.vertexFormats.set(format, new L5.GLVertexFormat(this, format));
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
 * @param program {L5.Program}
 * @private
 */
L5.Renderer.prototype._enableVertexFormat = function(format, program) {
    var glFormat = this.vertexFormats.get(format);
    if (!glFormat) {
        glFormat = new L5.GLVertexFormat(this, format, program);
        this.vertexFormats.set(format, glFormat);
    }
    glFormat.enable(this);
};
/**
 * @param format {L5.VertexFormat}
 * @private
 */
L5.Renderer.prototype._disableVertexFormat = function(format, vp, fp) {
    var glFormat = this.vertexFormats.get(format);
    if (glFormat) {
        glFormat.disable(this);
    }
};