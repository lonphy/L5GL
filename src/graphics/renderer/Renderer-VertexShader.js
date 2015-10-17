// TODO.
// ShaderParameters should be another resource, mapped to
// "constant buffers".  Add these to the renderer.  When ready, remove the
// ShaderParameters inputs to Enable/Disable of shaders and set up a block
// of Bind/Unbind/Enable/Disable functions.

// === 顶点着色器管理

/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer.prototype._bindVertexShader = function(
    shader) {
    if (!this.vertexShaders.get(shader)) {
        this.vertexShaders.set(shader, new L5.GLVertexShader(this, shader));
    }
};
/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer._bindAllVertexShader = function(
    shader
){};
/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer.prototype._unbindVertexShader = function(
    shader
) {};
/**
 * @param shader {L5.VertexShader}
 * @private
 */
L5.Renderer._unbindAllVertexShader = function(
    shader
){};
/**
 * @param shader {L5.VertexShader}
 * @param program {Map}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._enableVertexShader = function(shader, mapping, parameters) {
    var glVShader = this.vertexShaders.get(shader);
    if (!glVShader) {
        glVShader = new L5.GLVertexShader(this, shader);
        this.vertexShaders.set(shader, glVShader);
    }

    glVShader.enable(this, mapping, shader, parameters);
};
/**
 * @param shader {L5.VertexShader}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._disableVertexShader = function(
    shader, parameters) {
    var glVShader = this.vertexShaders.get(shader);
    if (glVShader) {
        glVShader.disable(this, shader, parameters);
    }
};
