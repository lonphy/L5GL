/**
 * 聚光灯 顶点光照效果
 * @class
 * @extends {L5.VisualEffect}
 *
 * @author lonphy
 * @version 1.0
 */
L5.LightSpotPerVertexEffect = function () {
    L5.VisualEffect.call(this);
    var vshader = new L5.VertexShader("L5.LightSpotPerVertex", 2, 2, 14, 0);
    vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
    vshader.setInput(1, "modelNormal", L5.Shader.VT_VEC3, L5.Shader.VS_NORMAL);
    vshader.setOutput(0, "gl_Position", L5.Shader.VT_VEC4, L5.Shader.VS_POSITION);
    vshader.setOutput(1, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(1, "WMatrix", L5.Shader.VT_MAT4);
    vshader.setConstant(2, "CameraModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(3, "MaterialEmissive", L5.Shader.VT_VEC4);
    vshader.setConstant(4, "MaterialAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(5, "MaterialDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(6, "MaterialSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(7, "LightModelPosition", L5.Shader.VT_VEC4);
    vshader.setConstant(8, "LightModelDirection", L5.Shader.VT_VEC4);
    vshader.setConstant(9, "LightAmbient", L5.Shader.VT_VEC4);
    vshader.setConstant(10, "LightDiffuse", L5.Shader.VT_VEC4);
    vshader.setConstant(11, "LightSpecular", L5.Shader.VT_VEC4);
    vshader.setConstant(12, "LightSpotCutoff", L5.Shader.VT_VEC4);
    vshader.setConstant(13, "LightAttenuation", L5.Shader.VT_VEC4);
    vshader.setProgram(L5.LightSpotPerVertexEffect.VertextSource);

    var fshader = new L5.FragShader("L5.LightSpotPerVertex", 1, 1, 0, 0);
    fshader.setInput(0, "vertexColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setOutput(0, "gl_FragColor", L5.Shader.VT_VEC4, L5.Shader.VS_COLOR0);
    fshader.setProgram(L5.LightSpotPerVertexEffect.FragSource);

    var program = new L5.Program("L5.LightSpotPerVertexEffectProgram", vshader, fshader);

    var pass = new L5.VisualPass();
    pass.program = program;
    pass.alphaState = new L5.AlphaState();
    pass.cullState = new L5.CullState();
    pass.depthState = new L5.DepthState();
    pass.offsetState = new L5.OffsetState();
    pass.stencilState = new L5.StencilState();

    var technique = new L5.VisualTechnique();
    technique.insertPass(pass);
    this.insertTechnique(technique);
};
L5.nameFix(L5.LightSpotPerVertexEffect, 'LightSpotPerVertexEffect');
L5.extendFix(L5.LightSpotPerVertexEffect, L5.VisualEffect);

/**
 * 创建点光源顶点光照程序
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightSpotPerVertexEffect.prototype.createInstance = function (light, material) {
    var instance = new L5.VisualEffectInstance(this, 0);
    instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
    instance.setVertexConstant(0, 1, new L5.WMatrixConstant());
    instance.setVertexConstant(0, 2, new L5.CameraModelPositionConstant());
    instance.setVertexConstant(0, 3, new L5.MaterialEmissiveConstant(material));
    instance.setVertexConstant(0, 4, new L5.MaterialAmbientConstant(material));
    instance.setVertexConstant(0, 5, new L5.MaterialDiffuseConstant(material));
    instance.setVertexConstant(0, 6, new L5.MaterialSpecularConstant(material));
    instance.setVertexConstant(0, 7, new L5.LightModelPositionConstant(light));
    instance.setVertexConstant(0, 8, new L5.LightModelDirectionConstant(light));
    instance.setVertexConstant(0, 9, new L5.LightAmbientConstant(light));
    instance.setVertexConstant(0, 10, new L5.LightDiffuseConstant(light));
    instance.setVertexConstant(0, 11, new L5.LightSpecularConstant(light));
    instance.setVertexConstant(0, 12, new L5.LightSpotConstant(light));
    instance.setVertexConstant(0, 13, new L5.LightAttenuationConstant(light));
    return instance;
};

/**
 * 创建唯一点光源顶点光照程序
 *
 * 注意: 应避免使用该函数多次, 因为WebGL的program实例数量有限
 *
 * @param light {L5.Light}
 * @param material {L5.Material}
 * @returns {L5.VisualEffectInstance}
 */
L5.LightSpotPerVertexEffect.createUniqueInstance = function (light, material) {
    var effect = new L5.LightSpotPerVertexEffect();
    return effect.createInstance(light, material);
};

L5.LightSpotPerVertexEffect.VertextSource = [
    'uniform mat4 PVWMatrix;',
    'uniform mat4 WMatrix;',
    'uniform vec4 CameraModelPosition;',
    'uniform vec4 MaterialEmissive;',
    'uniform vec4 MaterialAmbient;',
    'uniform vec4 MaterialDiffuse;',
    'uniform vec4 MaterialSpecular;',
    'uniform vec4 LightModelPosition;',
    'uniform vec4 LightModelDirection;',
    'uniform vec4 LightAmbient;',
    'uniform vec4 LightDiffuse;',
    'uniform vec4 LightSpecular;',
    'uniform vec4 LightSpotCutoff;',
    'uniform vec4 LightAttenuation;',
    'attribute vec3 modelPosition;',
    'attribute vec3 modelNormal;',
    'varying vec4 vertexColor;',
    'void main(){',
    '    vec3 nor = normalize(modelNormal);',
    '    vec3 spotDir = normalize(LightModelDirection.xyz);',
    '    vec3 lightDir = LightModelPosition.xyz - modelPosition;',     // 指向光源的向量
    '    float attr = length(WMatrix * vec4(lightDir, 1.0));',         // 距离, 距离衰减系数
    '    attr = LightAttenuation.w/(LightAttenuation.x + attr *(LightAttenuation.y + attr*LightAttenuation.z));',
    '    lightDir = normalize(lightDir);',
    '    float dWeight = max(dot(nor, lightDir), 0.0);',         // 漫反射权重
    '    vec3 color = MaterialAmbient.rgb*LightAmbient.rgb;',
    '    if (dWeight > 0.0) {',
    '        float spotEffect = dot(spotDir, -lightDir);',          // 聚光轴 与 光线 的夹角cos值
    '        if (spotEffect >= LightSpotCutoff.y) {',
    '            spotEffect = pow(spotEffect, LightSpotCutoff.w);',
    '            vec3 reflectDir = normalize( reflect(-lightDir, nor) );',               // 计算反射方向
    '            vec3 viewVector = normalize(CameraModelPosition.xyz - modelPosition);', // 观察方向
    '            float sWeight = max( dot(reflectDir, viewVector), 0.0);',
    '            sWeight = pow(sWeight, clamp(MaterialSpecular.a, -128.0, 128.0));',
    '            vec3 sColor = dWeight * MaterialDiffuse.rgb * LightDiffuse.rgb;',  // 漫反射分量
    '            sColor = sColor + sWeight * MaterialSpecular.rgb * LightSpecular.rgb;',  // 高光分量
    '            color = color + spotEffect * sColor;',
    '        }',
    '    }',
    '    vertexColor = vec4(MaterialEmissive.rgb + attr*color, MaterialDiffuse.a);',
    '    gl_Position = PVWMatrix * vec4(modelPosition, 1.0);',
    '}'
].join("\n");

L5.LightSpotPerVertexEffect.FragSource = [
    'precision highp float;',
    'varying vec4 vertexColor;',
    'void main (void) {',
    '    gl_FragColor = vertexColor;',
    '}'
].join("\n");


L5.LightSpotPerVertexEffect.prototype.load = function (inStream) {
    this.___ = this.techniques;
    L5.VisualEffect.prototype.load.call(this, inStream);
};

L5.LightSpotPerVertexEffect.prototype.link = function (inStream) {
    L5.VisualEffect.prototype.link.call(this, inStream);
};

L5.LightSpotPerVertexEffect.prototype.postLink = function () {
    L5.VisualEffect.prototype.postLink.call(this);
    var pass = this.techniques[0].getPass(0);
    pass.program.vertexShader.setProgram(L5.LightSpotPerVertexEffect.VertextSource);
    pass.program.fragShader.setProgram(L5.LightSpotPerVertexEffect.FragSource);

    this.techniques = this.___;
};

L5.LightSpotPerVertexEffect.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.LightSpotPerVertexEffect}
 */
L5.LightSpotPerVertexEffect.factory = function (inStream) {
    var obj = new L5.LightSpotPerVertexEffect();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.LightSpotPerVertexEffect', L5.LightSpotPerVertexEffect.factory);