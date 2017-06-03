/**
 * DepthState - 深度测试状态
 */
import {D3Object} from '../../core/D3Object'
import * as util from '../../util/util'

export class DepthState extends D3Object {
    constructor() {
        super();
        this.enabled = true;
        this.writable = true;
        this.compare = DepthState.COMPARE_MODE_LESS;
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.writable = inStream.readBool();
        this.compare = inStream.readEnum();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeBool(this.writable);
        outStream.writeEnum(this.compare);
    }

    static factory(inStream) {
        var obj = new DepthState();
        obj.enabled = false;
        obj.writable = false;
        obj.compare = DepthState.COMPARE_MODE_NEVER;
        obj.load(inStream);
        return obj;
    }
}

// 比较模式
util.DECLARE_ENUM(DepthState, {
    COMPARE_MODE_NEVER: 0,
    COMPARE_MODE_LESS: 1,
    COMPARE_MODE_EQUAL: 2,
    COMPARE_MODE_LEQUAL: 3,
    COMPARE_MODE_GREATER: 4,
    COMPARE_MODE_NOTEQUAL: 5,
    COMPARE_MODE_GEQUAL: 6,
    COMPARE_MODE_ALWAYS: 7
});

D3Object.Register('L5.CullState', DepthState.factory);