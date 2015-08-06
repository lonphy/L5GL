/**
 * ShaderParameters 着色器参数
 *
 * @param shader {L5.Shader}
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.ShaderParameters = function(
    shader
) {
    L5.assert(shader !== null, 'Shader must be specified.');
    L5.D3Object.call (this);
    /**
     * @type {L5.Shader}
     */
    this.shader = shader;

    var nc = shader.numConstants;
    this.numConstants = nc;

    if (nc > 0 ) {
        /**
         * @type {Array<L5.ShaderFloat>}
         */
        this.constants = new Array (nc);
    } else {
        this.constants = null;
    }

    var ns = shader.numSamplers;
    this.numTextures = ns;
    if (ns > 0 ) {
        this.textures = new Array (ns);
    }else{
        this.textures = null;
    }
};

L5.nameFix(L5.ShaderParameters, 'ShaderParameters');
L5.extendFix(L5.ShaderParameters, L5.D3Object);


// These functions set the constants/textures.  If successful, the return
// value is nonnegative and is the index into the appropriate array.  This
// index may passed to the Set* functions that have the paremeter
// 'handle'.  The mechanism allows you to set directly by index and avoid
// the name comparisons that occur with the Set* functions that have the
// parameter 'const std::string& name'.
/**
 * @param name {string}
 * @param sfloat {Array}
 * @return {number}
 */
L5.ShaderParameters.prototype.setConstantByName = function(
    name, sfloat
){
    var i, m = this.numConstants, shader = this.shader;

    for (i = 0; i < m; ++i) {
        if (shader.getConstantName(i) === name)
        {
            this.constants[i] = sfloat;
            return i;
        }
    }

    L5.assert(false, 'Cannot find constant.');
    return -1;
};
/**
 * @param handle {number}
 * @param sfloat {Array}
 * @return {number}
 */
L5.ShaderParameters.prototype.setConstant = function(
    handle, sfloat
){
    if (0<= handle && handle < this.numConstants) {
        this.constants[handle] = sfloat;
        return handle;
    }
    L5.assert(false, 'Invalid constant handle.');
    return -1;
};
/**
 * @param name {string}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.ShaderParameters.prototype.setTextureByName = function(
    name, texture
){
    var i, m = this.numTextures, shader = this.shader;

    for (i = 0; i < m; ++i) {
        if (shader.getSamplerName(i) === name)
        {
            this.textures[i] = texture;
            return i;
        }
    }

    L5.assert(false, 'Cannot find texture.');
    return -1;
};
/**
 * @param handle {number}
 * @param texture {L5.Texture}
 * @returns {number}
 */
L5.ShaderParameters.prototype.setTexture = function(
    handle, texture
){
    if (0<= handle && handle < this.numTextures) {
        this.textures[handle] = texture;
        return handle;
    }
    L5.assert(false, 'Invalid texture handle.');
    return -1;
};
/**
 * @param name {string}
 * @returns {ArrayBuffer}
 */
L5.ShaderParameters.prototype.getConstantByName = function(
    name
){
    var i, m = this.numConstants, shader = this.shader;
    for (i = 0; i < m; ++i)
    {
        if (shader.getConstantName(i) === name)
        {
            return this.constants[i];
        }
    }

    L5.assert(false, 'Cannot find constant.');
    return null;
};
/**
 * @param name {string}
 * @returns {L5.Texture}
 */
L5.ShaderParameters.prototype.getTextureByName = function(
    name
){
    var i, m = this.numTextures, shader = this.shader;
    for (i = 0; i < m; ++i)
    {
        if (shader.getSamplerName(i) === name)
        {
            return this.textures[i];
        }
    }

    L5.assert(false, 'Cannot find texture.');
    return null;
};

/**
 * @param index {number}
 * @returns {ArrayBuffer}
 */
L5.ShaderParameters.prototype.getConstant = function(
    index
){
    if (0 <= index && index < this.numConstants)
    {
        return this.constants[index];
    }

    L5.assert(false, 'Invalid constant handle.');
    return null;
};

/**
 * @param index {number}
 * @returns {L5.Texture}
 */
L5.ShaderParameters.prototype.getTexture = function(
    index
){
    if (0 <= index && index < this.numTextures)
    {
        return this.textures[index];
    }

    L5.assert(false, 'Invalid texture handle.');
    return null;
};
/**
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ShaderParameters.prototype.updateConstants = function(
    visual, camera
){
    var constants = this.constants,
        i, m = this.numConstants;
    for (i = 0; i < m; ++i, ++constants)
    {
        var constant = constants[i];
        if (constant.allowUpdater)
        {
            constant.update(visual, camera);
        }
    }
};