/**
 * ShaderFloat - 着色器浮点数
 * @param numRegisters {number}
 * @constructor
 *
 * @extends {L5.D3Object}
 */
L5.ShaderFloat = function (numRegisters) {
    L5.D3Object.call (this);
    this.numElements  = 0;
    this.data         = null;
    this.allowUpdater = true;
};
L5.nameFix (L5.ShaderFloat, 'ShaderFloat');
L5.extendFix (L5.ShaderFloat, L5.D3Object);


/**
 * @param numRegisters {number}
 */
L5.ShaderFloat.prototype.setNumRegisters = function (
    numRegisters
) {
    L5.assert (numRegisters > 0, 'Number of registers must be positive');
    this.numElements = 4 * numRegisters;
    this.data        = new Float32Array (this.numElements);
}
;
L5.ShaderFloat.prototype.getNumRegisters = function () {
    return this.numElements / 4;
};

L5.ShaderFloat.prototype.item = function (index, val) {
    L5.assert (0 <= index && index < this.numElements, 'Invalid index');
    if (val === undefined) {
        return this.data[ index ];
    }
    this.data[ index ] = val;
};

/**
 * @param i {number} location of elements
 * @param data {Float32Array} 4-tuple float
 */
L5.ShaderFloat.prototype.setOneRegister = function (
    i, data
) {
    L5.assert (0 <= i && i < this.numElements / 4, 'Invalid register');
    this.data.set (data.subarray (0, 4), 4 * i);
};
/**
 * @param data {Float32Array}
 */
L5.ShaderFloat.prototype.setRegister    = function (
    data
) {
    this.data.set (data.subarray (0, this.numElements));
};
/**
 * @param i {number}
 * @returns data {Float32Array}
 */
L5.ShaderFloat.prototype.getOneRegister = function (
    i
) {
    L5.assert (0 <= i && i < this.numElements / 4, 'Invalid register');
    return new Float32Array (this.data.subarray (4 * i, 4 * i + 4));
};
/**
 * @returns data {Float32Array}
 */
L5.ShaderFloat.prototype.getRegisters   = function () {
    return new Float32Array (this.data);
};

/**
 * @param data {Float32Array}
 */
L5.ShaderFloat.prototype.copy = function (
    data
) {
    this.data.set (data.subarray (0, this.numElements));
    return this;
};
/**
 * @param visual {L5.Visual}
 * @param camera {L5.Camera}
 */
L5.ShaderFloat.prototype.update = function (
    visual, camera
) {};