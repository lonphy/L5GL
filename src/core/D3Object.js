/**
 * D3Object - 对象基类
 * @version 1.0
 * @author lonphy
 */


/**
 * 类型构造
 * @param name {string} 对象名称
 * @constructor
 */
L5.D3Object = function (name) {
    this.name = name || '';
};
L5.D3Object.name = "D3Object";

/**
 * @param name {string} 对象名称
 * @returns {L5.D3Object}
 */
L5.D3Object.prototype.getObjectByName = function (name) {
    return name === this.name ? this : null;
};

/**
 * @param name {string} 对象名称
 * @returns {Array<L5.D3Object>}
 */
L5.D3Object.prototype.getAllObjectsByName = function (name) {
    return name === this.name ? this : null;
};

//============================== 文件流支持 ==============================
/**
 * @param inStream {L5.InStream}
 */
L5.D3Object.prototype.load = function (inStream) {
    inStream.readUniqueID(this);
    this.name = inStream.readString();
};
/**
 * @param inStream {L5.InStream}
 */
L5.D3Object.prototype.link = function (inStream) {
};
L5.D3Object.prototype.postLink = function () {
};

/**
 * @param tar {L5.OutStream}
 */
L5.D3Object.prototype.save = function (tar) {
    tar.writeString(this.constructor.name);
    tar.writeUniqueID(this);
    tar.writeString(this.name);
};

// 工厂类注册map, k => string v =>class
L5.D3Object.factories = new Map();

L5.D3Object.find = function (name) {
    return L5.D3Object.factories.get(name);
};