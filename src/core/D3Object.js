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
L5.D3Object = function(
    name
) {
    this.name = name;
};
L5.D3Object.name = "D3Object";

/**
 * @param name {string} 对象名称
 * @returns {L5.D3Object}
 */
L5.D3Object.prototype.getObjectByName = function(
    name
) {
    return name===this.name?this:null;
};

/**
 * @param name {string} 对象名称
 * @returns {Array<L5.D3Object>}
 */
L5.D3Object.prototype.getAllObjectsByName = function(
    name
) {
    return name===this.name?this:null;
};