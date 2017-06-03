/**
 * FragShader 底层包装
 * 
 * @author lonphy
 * @version 2.0
 */
import { GLShader } from './GLShader'

export class GLFragShader extends GLShader {

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
     * @param {WebGLRenderingContext} gl
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

        this.setSamplerState(renderer, shader, parameters, renderer.data.maxFShaderImages, renderer.data.currentSS);
    }

    /**
     * @param renderer {Renderer}
     * @param shader {FragShader}
     * @param parameters {ShaderParameters}
     */
    disable(renderer, shader, parameters) {
        let gl = renderer.gl;
        this.disableTexture(renderer, shader, parameters, renderer.data.maxFShaderImages);
    }
}
