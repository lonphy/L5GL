import { D3Object } from '../../core/D3Object'
import { InStream } from '../../core/InStream'
import * as util from '../../util/util'

export class AlphaState extends D3Object {

    constructor() {
        super();
        this.blendEnabled = false;
        this.srcBlend = AlphaState.BM_SRC_ALPHA;
        this.dstBlend = AlphaState.BM_ONE_MINUS_SRC_ALPHA;
        this.constantColor = new Float32Array([0, 0, 0, 0]);
    }

    load(inStream) {
        super.load(inStream);
        this.blendEnabled = inStream.readBool();
        this.srcBlend = inStream.readEnum();
        // todo: remove unused code.
        if (this.srcBlend > 1) {
            this.srcBlend += 2;
        }

        this.dstBlend = inStream.readEnum();
        // todo: remove unused code.
        if (this.dstBlend >= 8) {
            this.dstBlend += 3;
        }
        else if (this.dstBlend >= 4) {
            this.dstBlend += 2;
        }
        this.constantColor = new Float32Array(inStream.readFloat32Range(4));
    }

    /**
     * 文件解析工厂方法
     * @param {InStream} inStream
     * @returns {AlphaState}
     */
    static factory(inStream) {
        var obj = new AlphaState();
        obj.load(inStream);
        return obj;
    }

}

/* 混合模式 */
util.DECLARE_ENUM(AlphaState, {
    BM_ZERO: 0,
    BM_ONE: 1,
    BM_SRC_COLOR: 2, // can be assign to AlphaState.dstBlend only
    BM_ONE_MINUS_SRC_COLOR: 3, // can be assign to AlphaState.dstBlend only
    BM_DST_COLOR: 4, // can be assign to AlphaState.srcBlend only
    BM_ONE_MINUS_DST_COLOR: 5, // can be assign to AlphaState.srcBlend only
    BM_SRC_ALPHA: 6,
    BM_ONE_MINUS_SRC_ALPHA: 7,
    BM_DST_ALPHA: 8,
    BM_ONE_MINUS_DST_ALPHA: 9,
    BM_SRC_ALPHA_SATURATE: 10, // can be assign to AlphaState.srcBlend only
    BM_CONSTANT_COLOR: 11,
    BM_ONE_MINUS_CONSTANT_COLOR: 12,
    BM_CONSTANT_ALPHA: 13,
    BM_ONE_MINUS_CONSTANT_ALPHA: 14
});

D3Object.Register('L5.AlphaState', AlphaState.factory);

