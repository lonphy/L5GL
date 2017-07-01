import { D3Object } from '../../core/D3Object';

class Program extends D3Object {

    /**
     * @param {string} name
     * @param {VertexShader} vs
     * @param {FragShader} fs
     */
    constructor(name, vs, fs) {
        super(name);
        this.vertexShader = vs;
        this.fragShader = fs;
        this.inputMap = new Map();
    }
}

export { Program };
