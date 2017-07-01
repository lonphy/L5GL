import { GLShader } from './GLShader';

class GLFragShader extends GLShader {

    /**
     * @param {Renderer} renderer 
     * @param {VertexShader} shader 
     */
    constructor(renderer, shader) {
        super();
        let gl = renderer.gl;
        this.shader = gl.createShader(gl.FRAGMENT_SHADER);

        let programText = shader.getProgram();

        gl.shaderSource(this.shader, programText);
        gl.compileShader(this.shader);

        console.assert(
            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
            gl.getShaderInfoLog(this.shader)
        );
    }

    /**
     * 释放持有的GL资源
     * @param {WebGL2RenderingContext} gl
     */
    free(gl) {
        gl.deleteShader(this.shader);
        delete this.shader;
    }

    /**
     * @param {Renderer} renderer
     * @param {Map} mapping
     * @param {FragShader} shader
     * @param {ShaderParameters} parameters
     */
    enable(renderer, mapping, shader, parameters) {
        let gl = renderer.gl;
        // step1. 遍历顶点着色器常量
        let numConstants = shader.numConstants;
        for (let i = 0; i < numConstants; ++i) {
            let locating = mapping.get(shader.getConstantName(i));
            let funcName = shader.getConstantFuncName(i);
            let size = shader.getConstantSize(i);
            let data = parameters.getConstant(i).data;
            if (size > 4) {
                gl[funcName](locating, false, data);
            } else {
                gl[funcName](locating, data.subarray(0, size));
            }
        }

        this.setSamplerState(renderer, shader, parameters, renderer.data.maxFShaderImages);
    }

    /**
     * @param {Renderer} renderer
     * @param {FragShader} shader
     * @param {ShaderParameters} parameters
     */
    disable(renderer, shader, parameters) {
        let gl = renderer.gl;
        this.disableTexture(renderer, shader, parameters, renderer.data.maxFShaderImages);
    }
}

export { GLFragShader };