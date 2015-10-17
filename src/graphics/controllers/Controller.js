/**
 * Controller - 控制基类
 *
 * @version 1.0
 * @author lonphy
 *
 * @extends {L5.D3Object}
 * @class
 */

L5.Controller = function () {
    L5.D3Object.call (this);

    this.repeat = L5.Controller.RT_CLAMP;  // default = RT_CLAMP
    this.minTime = 0;                      // default = 0
    this.maxTime = 0;                      // default = 0
    this.phase = 0;                        // default = 0
    this.frequency = 1;                    // default = 1
    this.active = true;                    // default = true
    this.object = null;                    // ControlledObject.
    this.applicationTime = -L5.Math.MAX_REAL;              // 应用程序时间 毫秒.
};

L5.nameFix (L5.Controller, 'Controller');
L5.extendFix (L5.Controller, L5.D3Object);

// 时间管理。一个控制器可以用自己的时标, 指定如何映射到应用程序时间。
L5.Controller.RT_CLAMP = 0;
L5.Controller.RT_WRAP  = 1;
L5.Controller.RT_CYCLE = 2;

/**
 * 从应用程序时间转换为控制器时间
 * @param applicationTime {number}
 * @returns {number}
 */
L5.Controller.prototype.getControlTime = function (applicationTime) {
    var controlTime = this.frequency * applicationTime + this.phase;

    if (this.repeat == L5.Controller.RT_CLAMP) {
        // Clamp the time to the [min,max] interval.
        if (controlTime < this.minTime) {
            return this.minTime;
        }
        if (controlTime > this.maxTime) {
            return this.maxTime;
        }
        return controlTime;
    }

    var timeRange = this.maxTime - this.minTime;
    if (timeRange > 0) {
        var multiples    = (controlTime - this.minTime) / timeRange;
        var integerTime  = L5.Math.floor (multiples);
        var fractionTime = multiples - integerTime;
        if (this.repeat == L5.Controller.RT_WRAP) {
            return this.minTime + fractionTime * timeRange;
        }

        // Repeat == WM5_RT_CYCLE
        if (integerTime & 1) {
            // Go backward in time.
            return this.maxTime - fractionTime * timeRange;
        }
        else {
            // Go forward in time.
            return this.minTime + fractionTime * timeRange;
        }
    }

    return this.minTime;
};


L5.Controller.prototype.update = function (applicationTime) {
    if (this.active) {
        this.applicationTime = applicationTime;
        return true;
    }
    return false;
};

L5.Controller.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.repeat = inStream.readEnum();
    this.minTime = inStream.readFloat64();
    this.maxTime = inStream.readFloat64();
    this.phase = inStream.readFloat64();
    this.frequency = inStream.readFloat64();
    this.active = inStream.readBool();
    this.object = inStream.readPointer();
    this.applicationTime = -L5.Math.MAX_REAL;
};

L5.Controller.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.object = inStream.resolveLink(this.object);
};