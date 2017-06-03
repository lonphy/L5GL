/**
 * Program GPU程序
 *
 * @author lonphy
 * @version 2.0
 */
import { D3Object } from '../../core/D3Object'

export class Program extends D3Object {

    /**
     * @param name {string} 程序名称
     * @param vs {L5.VertexShader}
     * @param fs {L5.FragShader}
     */
    constructor(name, vs, fs) {
        super(name);
        this.vertexShader = vs;
        this.fragShader = fs;
        this.inputMap = new Map();
    }
}

