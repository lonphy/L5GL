/**
 * VertexShader 顶点着色器
 *
 * @param programName {string} 程序名称
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @class
 * @extends {L5.Shader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VertexShader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.Shader.call(this, programName, numInputs, numOutputs, numConstants, numSamplers);
};

L5.nameFix(L5.VertexShader, 'VertexShader');
L5.extendFix(L5.VertexShader, L5.Shader);

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.VertexShader}
 */
L5.VertexShader.factory = function (inStream) {
    var obj = new L5.VertexShader();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VertexShader', L5.VertexShader.factory);