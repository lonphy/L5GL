// === 着色器程序管理

/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer.prototype._bindProgram = function (program) {
    if (!this.programs.get(program)) {
        this.programs.set(program, new L5.GLProgram(this, program));
    }
};

/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer._bindAllProgram = function (program) {
    this.renderers.forEach(function (r) {
        r._bindProgram(program);
    });
};

/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer.prototype._unbindProgram = function (program) {
    var glProgram = this.programs.get(program);
    if (glProgram) {
        glProgram.free(this.gl);
        this.programs.delete(program);
    }
};
/**
 * @param program {L5.Program}
 * @private
 */
L5.Renderer._unbindAllProgram = function (program) {
    this.renderers.forEach(function (r) {
        r._unbindProgram(program);
    });
};
/**
 * @param program {L5.Program}
 * @param vp {L5.ShaderParameters}
 * @param fp {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._enableProgram = function (program, vp, fp) {
    var glProgram = this.programs.get(program);
    if (!glProgram) {
        this._bindVertexShader(program.vertexShader);
        this._bindFragShader(program.fragShader);

        glProgram = new L5.GLProgram(
            this,
            program,
            this.vertexShaders.get(program.vertexShader),
            this.fragShaders.get(program.fragShader)
        );
        this.programs.set(program, glProgram);
    }
    glProgram.enable(this);

    // Enable the shaders.
    this._enableVertexShader(program.vertexShader, program.inputMap, vp);
    this._enableFragShader(program.fragShader, program.inputMap, fp);
};
/**
 * @param program {L5.Program}
 * @param vp {L5.ShaderParameters}
 * @param fp {L5.ShaderParameters}
 * @private
 */
L5.Renderer.prototype._disableProgram = function (program, vp, fp) {

    this._disableVertexShader(program.vertexShader, vp);
    this._disableFragShader(program.fragShader, fp);
    var glProgram = this.programs.get(program);
    if (glProgram) {
        glProgram.disable(this);
    }
};
