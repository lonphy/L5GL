import { D3Object } from '../../core/D3Object';
import { DECLARE_ENUM } from '../../util/util';

class Material extends D3Object {

    constructor(opts = {}) {
        super();

        this.type = Material.ANY;

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

    get alpha() {
        return this.diffuse[3];
    }

    static get defaultOptions() {
        return {
            alpha: 1,
            exponent: 32,
            ambient: new Float32Array(4),
            emissive: new Float32Array(4),
            diffuse: new Float32Array(4),
            specular: new Float32Array(4)
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
            if (typeof opts.ambient === 'number') {
                defOption.ambient[0] = ((opts.ambient >> 16) & 0xff) / 255;
                defOption.ambient[1] = ((opts.ambient >> 8) & 0xff) / 255;
                defOption.ambient[2] = (opts.ambient & 0xff) / 255;
            } else {
                defOption.ambient.set(opts.ambient);
            }
        }
        if (opts.emissive) {
            if (typeof opts.emissive === 'number') {
                defOption.emissive[0] = ((opts.emissive >> 16) & 0xff) / 255;
                defOption.emissive[1] = ((opts.emissive >> 8) & 0xff) / 255;
                defOption.emissive[2] = (opts.emissive & 0xff) / 255;
            } else {
                defOption.emissive.set(opts.emissive);
            }
        }
        if (opts.diffuse) {
            if (typeof opts.diffuse === 'number') {
                defOption.diffuse[0] = ((opts.diffuse >> 16) & 0xff) / 255;
                defOption.diffuse[1] = ((opts.diffuse >> 8) & 0xff) / 255;
                defOption.diffuse[2] = (opts.diffuse & 0xff) / 255;
            } else {
                defOption.diffuse.set(opts.diffuse);
            }
        }
        if (opts.specular) {
            if (typeof opts.specular === 'number') {
                defOption.specular[0] = ((opts.specular >> 16) & 0xff) / 255;
                defOption.specular[1] = ((opts.specular >> 8) & 0xff) / 255;
                defOption.specular[2] = (opts.specular & 0xff) / 255;
            } else {
                defOption.specular.set(opts.specular);
            }
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

D3Object.Register('Material', Material.factory);

DECLARE_ENUM(Material, {
    ANY: 0,
    LAMBERT: 1,
    PHONG: 2,
    BLINN: 3,
    CONTANT: 4
});

export { Material };