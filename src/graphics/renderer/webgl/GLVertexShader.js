import { GLShader } from './GLShader';

class GLVertexShader extends GLShader {

    /**
     * @param {Renderer} renderer 
     * @param {Shader} shader 
     */
    constructor(renderer, shader) {
        super();
        let gl = renderer.gl;
        this.shader = gl.createShader(gl.VERTEX_SHADER);

        let programText = shader.getProgram();

        gl.shaderSource(this.shader, programText);
        gl.compileShader(this.shader);

        console.assert(
            gl.getShaderParameter(this.shader, gl.COMPILE_STATUS),
            gl.getShaderInfoLog(this.shader)
        );
    }
    /**
     * @param {Renderer} renderer
     * @param {Map} mapping
     * @param {VertexShader} shader
     * @param {ShaderParameters} parameters
     */
    enable(renderer, mapping, shader, parameters) {
        let gl = renderer.gl;

        // 更新uniform 变量

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

        this.setSamplerState(renderer, shader, parameters, renderer.data.maxVShaderImages);
    }
    /**
     * @param {VertexShader} shader
     * @param {ShaderParameters} parameters
     * @param {Renderer} renderer
     */
    disable(renderer, shader, parameters) {
        this.disableTexture(renderer, shader, parameters, renderer.data.maxVShaderImages);
    }
}

export { GLVertexShader };
