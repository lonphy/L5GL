/**
 * VertexShader 底层包装
 *
 * @author lonphy
 * @version 2.0
 */
import {GLShader} from './GLShader'

export class GLVertexShader extends GLShader {

    /**
     * @param {Renderer} renderer 
     * @param {Shader} shader 
     */
    constructor(renderer, shader) {
        super();
        var gl = renderer.gl;
        this.shader = gl.createShader(gl.VERTEX_SHADER);

        var programText = shader.getProgram();

        gl.shaderSource(this.shader, programText);
        gl.compileShader(this.shader);

        console.assert(
            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
            gl.getShaderInfoLog(this.shader)
        );
    }
    /**
     * @param shader {VertexShader}
     * @param mapping {Map}
     * @param parameters {ShaderParameters}
     * @param renderer {Renderer}
     */
    enable (renderer, mapping, shader, parameters) {
        var gl = renderer.gl;

        // 更新uniform 变量

        // step1. 遍历顶点着色器常量
        var numConstants = shader.numConstants;
        for (var i = 0; i < numConstants; ++i) {
            var locating = mapping.get(shader.getConstantName(i));
            var funcName = shader.getConstantFuncName(i);
            var size = shader.getConstantSize(i);
            var data = parameters.getConstant(i).data;
            if (size > 4) {
                gl[funcName](locating, false, data);
            } else {
                gl[funcName](locating, data.subarray(0, size));
            }
        }

        this.setSamplerState(renderer, shader, parameters, renderer.data.maxVShaderImages, renderer.data.currentSS);
    }
    /**
     * @param shader {VertexShader}
     * @param parameters {ShaderParameters}
     * @param renderer {Renderer}
     */
    disable (renderer, shader, parameters) {
        this.disableTexture(renderer, shader, parameters, renderer.data.maxVShaderImages);
    }
}
