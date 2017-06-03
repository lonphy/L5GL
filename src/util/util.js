export { uuid } from './uuid';

export * from './endian';
export * from './version';

export function def(obj, key, value) {
    Object.defineProperty(obj, key, { value: value });
}

export function runApplication(Klass) {
    if (!document.querySelector('.l5-nodes-info')) {
        let nodesInfo = document.createElement('div');
        nodesInfo.className = 'l5-nodes-info';
        document.body.appendChild(nodesInfo);
    }
    let l5Instance = new Klass();
    l5Instance.run();
    window.x = l5Instance;
}

/**
 * 类枚举定义
 * @param {Object} tar    枚举承载体
 * @param {Object<String, *>} val 枚举变量键值
 * @param {boolean} lock 是否锁定类
 */
export function DECLARE_ENUM(tar, val, lock = true) {
    for (let k in val) {
        if (val.hasOwnProperty(k)) {
            Object.defineProperty(tar, k, { value: val[k] });
        }
    }
    if (lock) Object.seal(tar);
}
