/**
 * Program GPU程序
 *
 * @param programName {string} 程序名称
 * @param vertextShader {L5.VertexShader}
 * @param fragShader {L5.FragShader}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Program = function (programName, vertexShader, fragShader) {
    L5.D3Object.call(this, programName);
    this.vertexShader = vertexShader;
    this.fragShader = fragShader;
    this.inputMap = new Map();
};

L5.nameFix(L5.Program, 'Program');
L5.extendFix(L5.Program, L5.D3Object);

