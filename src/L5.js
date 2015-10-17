(function (global) {
    "use strict";

    var L5 = Object.create(null);
    Object.defineProperty(L5, 'VERSION', {value: 'WM_VERSION_5_1'});

    L5.setDebug = function (flag) {
        if (flag) {
            L5.assert = function (expression, message) {
                console.assert(expression, message);
            };
        }
        else {
            L5.assert = function () {
            };
        }
    };
    L5.setDebug(true);


    const HEX_TABLE = '0123456789abcdef';
    /**
     * 生成UUID
     * @return {String}
     */
    L5.UUID = function () {
        var s = new Array(35);
        for (var i = 0; i < 36; i++) {
            s[i] = i > 7 && ( (i - 8) % 5 === 0 ) ? '-' : HEX_TABLE[(Math.random() * 0x10) | 0];
        }
        s[14] = '4';
        s[19] = HEX_TABLE[(s[19] & 0x3) | 0x8];
        return s.join('');
    };

    /**
     * 修正原型
     * @param sub
     * @param base
     */
    L5.extendFix = function (sub, base) {
        sub.prototype = Object.create(base.prototype);
        sub.prototype.constructor = sub;
    };
    /**
     * 定义构造函数名称
     * @param c {Function}
     * @param name {string}
     */
    L5.nameFix = function(c, name) {
        Object.defineProperty(c, 'name', {value: name});
    };

    L5.runApplication = function (Klass) {
        var i = new Klass();
        window.x = i;
        i.run();
    };

    global.L5 = L5;

})(this);