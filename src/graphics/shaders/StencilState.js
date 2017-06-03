/**
 * StencilState - 模板状态
 *
 * @author lonphy
 * @version 1.0
 *
 * @extends {L5.D3Object}
 * @type {L5.StencilState}
 */
import {D3Object} from '../../core/D3Object'
import * as util from '../../util/util'

export class StencilState extends D3Object {

    constructor() {
        super();
        this.mask = 0xffffffff;       // default: unsigned int max
        this.writeMask = 0xffffffff;  // default: unsigned int max
        this.onFail = StencilState.OP_KEEP;
        this.onZFail = StencilState.OP_KEEP;
        this.onZPass = StencilState.OP_KEEP;

        this.enabled = false;
        this.compare = StencilState.NEVER;
        this.reference = 0;     // [0,1]
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.compare = inStream.readEnum();
        this.reference = inStream.readUint32();
        this.mask = inStream.readUint32();
        this.writeMask = inStream.readUint32();
        this.onFail = inStream.readEnum();
        this.onZFail = inStream.readEnum();
        this.onZPass = inStream.readEnum();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeEnum(this.compare);
        outStream.writeUint32(this.reference);
        outStream.writeUint32(this.mask);
        outStream.writeUint32(this.writeMask);
        outStream.writeEnum(this.onFail);
        outStream.writeEnum(this.onZFail);
        outStream.writeEnum(this.onZPass);
    }

    static factory(inStream) {
        var obj = new StencilState();
        obj.mask = 0;
        obj.writeMask = 0;
        obj.load(inStream);
        return obj;
    }
};

// 操作类型
util.DECLARE_ENUM(StencilState, {
    OP_KEEP:      0,
    OP_ZERO:      1,
    OP_REPLACE:   2,
    OP_INCREMENT: 3,
    OP_DECREMENT: 4,
    OP_INVERT:    5
}, false);

// 比较模式
util.DECLARE_ENUM(StencilState, {
    NEVER:    0,
    LESS:     1,
    EQUAL:    2,
    LEQUAL:   3,
    GREATER:  4,
    NOTEQUAL: 5,
    GEQUAL:   6,
    ALWAYS:   7
});

D3Object.Register('L5.StencilState', StencilState.factory);
