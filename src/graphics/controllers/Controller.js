/**
 * Controller - 控制基类
 * 
 * @author lonphy
 * @version 2.0
 */
import {D3Object} from '../../core/D3Object'
import {DECLARE_ENUM} from '../../util/util'
import {_Math} from '../../math/Math';

export class Controller extends D3Object {

    constructor() {
        super();
        this.repeat = Controller.RT_CLAMP;
        this.minTime = 0;                      // default = 0
        this.maxTime = 0;                      // default = 0
        this.phase = 0;                        // default = 0
        this.frequency = 1;                    // default = 1
        this.active = true;                    // default = true
        this.object = null;                    // ControlledObject.
        this.applicationTime = -_Math.MAX_REAL;              // 应用程序时间 毫秒.
    }
    /**
     * 从应用程序时间转换为控制器时间
     * @param {number} applicationTime
     * @returns {number}
     */
    getControlTime(applicationTime) {
        let controlTime = this.frequency * applicationTime + this.phase;

        if (this.repeat === Controller.RT_CLAMP) {
            // Clamp the time to the [min,max] interval.
            if (controlTime < this.minTime) {
                return this.minTime;
            }
            if (controlTime > this.maxTime) {
                return this.maxTime;
            }
            return controlTime;
        }

        const timeRange = this.maxTime - this.minTime;
        if (timeRange > 0) {
            let multiples = (controlTime - this.minTime) / timeRange;
            let integerTime = _Math.floor(multiples);
            let fractionTime = multiples - integerTime;
            if (this.repeat === Controller.RT_WRAP) {
                return this.minTime + fractionTime * timeRange;
            }

            // Repeat == RT_CYCLE
            if (integerTime & 1) {
                // Go backward in time.
                return this.maxTime - fractionTime * timeRange;
            }
            else {
                // Go forward in time.
                return this.minTime + fractionTime * timeRange;
            }
        }

        // minTime, maxTime 是一样的
        return this.minTime;
    }

    /**
     * 动画更新
     * @param {number} applicationTime 毫秒
     * @returns {boolean}
     */
    update(applicationTime) {
        if (this.active) {
            this.applicationTime = applicationTime;
            return true;
        }
        return false;
    }

    load(inStream) {
        super.load(inStream);
        this.repeat = inStream.readEnum();
        this.minTime = inStream.readFloat64();
        this.maxTime = inStream.readFloat64();
        this.phase = inStream.readFloat64();
        this.frequency = inStream.readFloat64();
        this.active = inStream.readBool();
        this.object = inStream.readPointer();
        this.applicationTime = -_Math.MAX_REAL;
    }

    link(inStream) {
        super.link(inStream);
        this.object = inStream.resolveLink(this.object);
    }
}

DECLARE_ENUM(Controller, {
    RT_CLAMP: 0,
    RT_WRAP:  1,
    RT_CYCLE: 2
});
