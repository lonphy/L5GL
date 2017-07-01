class GLProgram {

    /**
     * @param {Renderer} renderer
     * @param {Program} program 
     * @param {GLVertexShader} vs 
     * @param {GLFragShader} fs 
     */
    constructor(renderer, program, vs, fs) {
        let gl = renderer.gl;
        let p = gl.createProgram();
        gl.attachShader(p, vs.shader);
        gl.attachShader(p, fs.shader);
        gl.linkProgram(p);
        console.assert(
            gl.getProgramParameter(p, gl.LINK_STATUS),
            gl.getProgramInfoLog(p)
        );
        gl.deleteShader(vs.shader);
        gl.deleteShader(fs.shader);

        this.program = p;
        gl.useProgram(p);
        let uniformsLength = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS),
            item, name, i;

        for (i = 0; i < uniformsLength; ++i) {
            item = gl.getActiveUniform(p, i);
            name = item.name;
            program.inputMap.set(name, gl.getUniformLocation(p, name));
        }
    }
    /**
     * @param {Renderer} renderer
     */
    free(renderer) {
        renderer.gl.deleteProgram(this.program);
    }
    /**
     * @param {Renderer} renderer
     */
    enable(renderer) {
        renderer.gl.useProgram(this.program);
    }
    /**
     * @param {Renderer} renderer
     */
    disable(renderer) {
        //renderer.gl.useProgram(null);
    }
}

export { GLProgram };