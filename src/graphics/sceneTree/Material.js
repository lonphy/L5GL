/**
 * Material 材质
 */
import { D3Object } from '../../core/D3Object'
import * as util from '../../util/util'

export class Material extends D3Object {

    constructor(opts = {}) {
        super();
        opts = Material.parseOption(opts);

        let val = opts.emissive;
        this.emissive = new Float32Array([val[0], val[1], val[2], 1]);
        val = opts.ambient;
        this.ambient = new Float32Array([val[0], val[1], val[2], 1]);

        val = opts.diffuse;
        // 材质透明度在反射颜色的alpha通道
        this.diffuse = new Float32Array([val[0], val[1], val[2], opts.alpha]);

        val = opts.specular;
        // 镜面高光指数存储在alpha通道
        this.specular = new Float32Array([val[0], val[1], val[2], opts.exponent]);
    }

    static get defaultOptions() {
        return {
            alpha: 1,
            exponent: 32,
            ambient: new Float32Array([0, 0, 0]),
            emissive: new Float32Array([0, 0, 0]),
            diffuse: new Float32Array([0, 0, 0]),
            specular: new Float32Array([0, 0, 0])
        };
    }

    static parseOption(opts) {
        let defOption = Object.assign({}, Material.defaultOptions);
        if (opts.alpha && opts.alpha >= 0 && opts.alpha <= 1) {
            defOption.alpha = opts.alpha;
        }
        if (opts.exponent) {
            defOption.exponent = opts.exponent;
        }
        if (opts.ambient) {
            defOption.ambient.set(opts.ambient);
        }
        if (opts.emissive) {
            defOption.emissive.set(opts.emissive);
        }
        if (opts.diffuse) {
            defOption.diffuse.set(opts.diffuse);
        }
        if (opts.specular) {
            defOption.specular.set(opts.specular);
        }
        return defOption;
    }

    static factory(inStream) {
        var obj = new Material();
        obj.emissive[3] = 0;
        obj.ambient[3] = 0;
        obj.diffuse[3] = 0;
        obj.load(inStream);
        return obj;
    }
};

D3Object.Register('L5.Material', Material.factory);
