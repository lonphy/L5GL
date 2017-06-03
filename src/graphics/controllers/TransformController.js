/**
 * TransformController - 变换控制基类
 *
 * @version 2.0
 * @author lonphy
 */

import {Controller} from './Controller'

export class TransformController extends Controller {

    /**
     * @param {Transform} localTransform
     */
    constructor(localTransform) {
        super();
        this.localTransform = localTransform;
    }

    /**
     * @param {number} applicationTime 毫秒
     */
    update(applicationTime) {
        if (super.update(applicationTime)) {
            this.object.localTransform = this.localTransform;
            return true;
        }
        return false;
    }

    /**
     * 文件载入支持
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        this.localTransform = inStream.readTransform();
    }
}