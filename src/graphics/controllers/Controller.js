import { D3Object } from '../../core/D3Object';

class Controller extends D3Object {
    constructor() {
        super();
        this.repeat = Controller.RT_CLAMP;
        this.minTime = 0;                      // default = 0
        this.maxTime = 0;                      // default = 0
        this.phase = 0;                        // default = 0
        this.frequency = 1;                    // default = 1
        this.active = true;                    // default = true
        this.object = null;                    // ControlledObject.
        this.applicationTime = -1;             // application time, ms
    }

    /**
     * Conversion from application time units to controller time units.
     * Derived classes may use this in their update routines.
     * @param {number} applicationTime
     * @returns {number}
     * @protected
     */
    getControlTime(applicationTime) {
        let controlTime = this.frequency * applicationTime + this.phase;

        if (this.repeat === Controller.RT_CLAMP) {
            // Clamp the time to the [min, max] interval.
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
            let integerTime = Math.floor(multiples);
            let fractionTime = multiples - integerTime;
            if (this.repeat === Controller.RT_WRAP) {
                return this.minTime + fractionTime * timeRange;
            }

            // repeat == RT_CYCLE
            if (integerTime & 1) {
                // Go backward in time.
                return this.maxTime - fractionTime * timeRange;
            }
            else {
                // Go forward in time.
                return this.minTime + fractionTime * timeRange;
            }
        }

        // minTime is equal maxTime
        return this.minTime;
    }

    /**
     * The animation update
     * @param {number} applicationTime - milliseconds
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
        this.applicationTime = -1;
    }

    link(inStream) {
        super.link(inStream);
        this.object = inStream.resolveLink(this.object);
    }
}

// Time management.  A controller may use its own time scale, and it
// specifies how times are to be mapped to application time.
Controller.RT_CLAMP = 0;  // default
Controller.RT_WRAP = 1;
Controller.RT_CYCLE = 2;

export { Controller };