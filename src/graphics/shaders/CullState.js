/**
 * 剔除表面 状态
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {CullState}
 * @extends {D3Object}
 */
import {D3Object} from '../../core/D3Object'
import {InStream} from '../../core/InStream'
import * as util from '../../util/util'

export class CullState extends D3Object{

    constructor(){
        super();
        this.enabled = true;
        this.CCWOrder = true;
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.CCWOrder = inStream.readBool();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeBool(this.CCWOrder);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {CullState}
     */
    static factory(inStream) {
        var obj = new CullState();
        obj.enabled = false;
        obj.CCWOrder = false;
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('L5.CullState', CullState.factory);
