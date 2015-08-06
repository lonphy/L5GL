/**
 * VertexShader 顶点着色器
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
L5.VertexShader = function (
    programName, numInputs, numOutputs, numConstants, numSamplers, profileOwner
) {
    L5.Shader.call (this, programName, numInputs, numOutputs, numConstants, numSamplers, profileOwner);
};

// Vertex shader profile information.
L5.VertexShader.VP_NONE   = 0;
L5.VertexShader.VP_VS_1_1 = 1;
L5.VertexShader.VP_VS_2_0 = 2;
L5.VertexShader.VP_VS_3_0 = 3;
L5.VertexShader.VP_ARBVP1 = 4;

L5.nameFix (L5.VertexShader, 'VertexShader');
L5.extendFix (L5.VertexShader, L5.Shader);

L5.VertexShader.profile = L5.VertexShader.VP_NONE;