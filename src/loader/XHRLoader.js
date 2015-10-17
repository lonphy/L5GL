/**
 * xhr加载器 - L5
 *
 * @author lonphy
 * @version 0.1
 */
(function () {
    const APP_PATH = location.pathname.replace(/[^\/]+$/, ''); // 获取应用程序路径
    var cache = new Map();	// 资源缓存
    var calling = new Map();	// 请求队列

    /**
     * Ajax加载器
     * @param url {String} 请求资源路径
     * @param type {String} 请求类型
     *    arraybuffer blob document json text
     * @constructor
     * @todo 同地址， 不同请求类型处理
     */
    L5.XhrTask = function (url, type) {
        var fullPath = url[0] === '/' ? url : (APP_PATH + url);

        // 1. 查看请求队列,有则直接返回承诺对象
        if (calling.has(fullPath)) {
            return calling.get(fullPath);
        }
        // 2. 查看缓存池，有则兼容返回
        if (cache.has(fullPath)) {
            return Promise.resolve(cache.get(fullPath));
        }
        // 3. 否则新建请求
        var task = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', fullPath);
            xhr.responseType = type || 'text';
            xhr.onloadend = function (e) {
                if (e.target.status === 200) {
                    // 1. 放入缓存
                    cache.set(fullPath, e.target.response);
                    // 2. 从请求队列删除
                    calling.delete(fullPath);
                    resolve(e.target.response);
                } else {
                    reject(new Error('XhrTaskError' + e.target.status));
                }
            };
            xhr.onerror = reject;
            xhr.ontimeout = reject;
            xhr.send();
        });
        // 4. 加入请求队列
        calling.set(fullPath, task);
        return task;
    };
})();