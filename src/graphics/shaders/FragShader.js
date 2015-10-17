/**
 * FragShader 片元着色器
 *
 * @param programName {string} 程序名称
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @param profileOwner {boolean}
 * @class
 * @extends {L5.Shader}
 *
 * @author lonphy
 * @version 1.0
 */
L5.FragShader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.Shader.call(this, programName, numInputs, numOutputs, numConstants, numSamplers);
};

L5.nameFix(L5.FragShader, 'FragShader');
L5.extendFix(L5.FragShader, L5.Shader);

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.FragShader}
 */
L5.FragShader.factory = function (inStream) {
    var obj = new L5.FragShader();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.PixelShader', L5.FragShader.factory);

