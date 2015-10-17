// === 片元着色器管理

/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer.prototype._bindFragShader = function(
    shader) {
    if (!this.fragShaders.get(shader)) {
        this.fragShaders.set(shader, new L5.GLFragShader(this, shader));
    }
};
/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer._bindAllFragShader = function(
    shader) {
    this.renderers.forEach(function (r) {
        r._bindFragShader(shader);
    });
};
/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer.prototype._unbindFragShader = function(
    shader) {
    var glFShader = this.fragShaders.get(shader);
    if (glFShader) {
        glFShader.free(this.gl);
        this.fragShaders.delete(shader);
    }
};
/**
 * @param shader {L5.FragShader}
 * @private
 */
L5.Renderer._unbindAllFragShader = function(
    shader) {
    this.renderers.forEach(function (r) {
        r._unbindFragShader(shader);
    });
};
/**
 * @param shader {L5.FragShader}
 * @param mapping {Map}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._enableFragShader = function(shader, mapping, parameters) {
    var glFShader = this.fragShaders.get(shader);
    if (!glFShader) {
        glFShader = new L5.GLFragShader(this, shader);
        this.fragShaders.set(shader, glFShader);
    }
    glFShader.enable(this, mapping, shader, parameters);
};
/**
 * @param shader {L5.FragShader}
 * @param parameters {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._disableFragShader = function(
    shader, parameters) {
    var glFShader = this.fragShaders.get(shader);
    if (glFShader) {
        glFShader.disable(this, shader, parameters);
    }
};
