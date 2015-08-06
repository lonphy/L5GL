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
L5.FragShader = function (
    programName, numInputs, numOutputs, numConstants, numSamplers, profileOwner
) {
    L5.Shader.call (this, programName, numInputs, numOutputs, numConstants, numSamplers, profileOwner);
};

// Frag shader profile information.
L5.FragShader.VP_NONE   = 0;
L5.FragShader.VP_FS_1_1 = 1;
L5.FragShader.VP_FS_2_0 = 2;
L5.FragShader.VP_FS_3_0 = 3;
L5.FragShader.VP_ARBFP1 = 4;

L5.FragShader.profile = L5.FragShader.VP_NONE;

L5.nameFix (L5.FragShader, 'FragShader');
L5.extendFix (L5.FragShader, L5.Shader);

