// @ts-check
/**
 * 对象系统 - 基类
 * @abstract
 */
class D3Object {
    constructor(name = '') {
        /** @type {string} */
        this.name = name;
        if (name === '') {
            this.name = new.target.name;
        }
    }

    getObjectByName(name) {
        if (name === this.name) {
            return this;
        }
        return null;
    }

    getAllObjectsByName(name, objs) {
        if (name === this.name) {
            objs.push(this);
        }
    }

    // streaming.
    load(inStream) {
        inStream.readUniqueID(this);
        this.name = inStream.readString();
    }
    link(inStream) {}
    postLink() {}

    save(tar) {
        tar.writeString(this.constructor.name);
        tar.writeUniqueID(this);
        tar.writeString(this.name);
    }

    static get factories() {
        return D3Object._factories;
    }

    static find(name) {
        return D3Object.factories.get(name);
    }

    static factory(inStream) {
        let obj = new this();
        obj.load(inStream);
        return obj;
    }

    static Register(name, factory) {
        D3Object.factories.set(name, factory);
    }
}

/**
 * @type {Map<string, function(InStream)=>D3Object>}
 */
D3Object._factories = new Map();
export { D3Object }