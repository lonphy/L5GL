
const APP_PATH = location.pathname.replace(/[^\/]+$/, ''); // 获取应用程序路径
let cache = new Map();	// 资源缓存
let calling = new Map();	// 请求队列

let XhrTask = Object.create(null);

/**
 * Ajax加载器
 * 
 * type must one of [arraybuffer blob document json text]
 * @param {string} url - 请求资源路径
 * @param {String} type - 请求类型
 * @todo 同地址， 不同请求类型处理
 */
XhrTask.load = function (url, type = 'arraybuffer') {
    let fullPath = url[0] === '/' ? url : (APP_PATH + url);

    // 1. 查看请求队列,有则直接返回承诺对象
    if (calling.has(fullPath)) {
        return calling.get(fullPath);
    }
    // 2. 查看缓存池，有则兼容返回
    if (cache.has(fullPath)) {
        return Promise.resolve(cache.get(fullPath));
    }
    // 3. 否则新建请求
    let task = new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', fullPath);
        xhr.responseType = type;
        xhr.onloadend = function (e) {
            if (e.target.status === 200) {
                // 1. 放入缓存
                cache.set(fullPath, e.target.response);
                // 2. 从请求队列删除
                calling.delete(fullPath);
                resolve(e.target.response);
            } else {
                reject(new Error('XhrTask Load Error' + e.target.status));
            }
        };
        xhr.onerror = reject;
        xhr.ontimeout = reject;
        xhr.send();
    });
    // 4. 加入请求队列
    calling.set(fullPath, task);
    return task;
}

let __parsePlugins = new Map();



XhrTask.plugin = function (name, fn) {
    if (!fn) {
        return __parsePlugins.get(name);
    }
    __parsePlugins.set(name, fn);
};

export { XhrTask };