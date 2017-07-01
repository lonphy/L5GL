import { D3Object } from '../../core/D3Object';
import { Point, Matrix, Quaternion } from '../../math/index';
import { TransformController } from './TransformController';

/**
 * construction. If the translations, rotations, and
 * scales all share the same keyframe times, then numCommonTimes is
 * set to a positive number.  Each remaining number is numCommonTimes
 * when the channel exists or zero when it does not.  If the keyframe
 * times are not shared, then numCommonTimes must be set to zero and
 * the remaining numbers set to the appropriate values--positive when
 * the channel exists or zero otherwise.
 * 
 * The Transform input initializes the controlled object's local
 * transform.  The previous behavior of this class was to fill in only
 * those transformation channels represented by the key frames, which
 * relied implicitly on the Spatial object to have its other channels
 * set appropriately by the application.  Now KeyframeController sets
 * *all* the channels.
 */
class KeyframeController extends TransformController {

    /**
     * @param {number} numCommonTimes
     * @param {number} numTranslations
     * @param {number} numRotations
     * @param {number} numScales
     * @param {Transform} localTransform
     */
    constructor(numCommonTimes, numTranslations, numRotations, numScales, localTransform) {
        super(localTransform);
        if (numCommonTimes > 0) {
            this.numCommonTimes = numCommonTimes;

            // This array is used only when times are shared by translations, rotations, and scales.
            this.commonTimes = new Array(numCommonTimes);

            if (numTranslations > 0) {
                this.numTranslations = numTranslations;
                this.translationTimes = this.commonTimes;
                this.translations = new Array(numTranslations);
            }
            else {
                this.numTranslations = 0;
                this.translationTimes = null;
                this.translations = null;
            }

            if (numRotations > 0) {
                this.numRotations = numRotations;
                this.rotationTimes = this.commonTimes;
                this.rotations = new Array(numRotations);
            }
            else {
                this.numRotations = 0;
                this.rotationTimes = null;
                this.rotations = null;
            }

            if (numScales > 0) {
                this.numScales = numScales;
                this.scaleTimes = this.commonTimes;
                this.scales = new Array(numScales);
            }
            else {
                this.numScales = 0;
                this.scaleTimes = null;
                this.scales = null;
            }
        }
        else {
            this.numCommonTimes = 0;
            this.commonTimes = null;

            if (numTranslations > 0) {
                this.numTranslations = numTranslations;
                this.translationTimes = new Array(numTranslations);
                this.translations = new Array(numTranslations);
            }
            else {
                this.numTranslations = 0;
                this.translationTimes = null;
                this.translations = null;
            }

            if (numRotations > 0) {
                this.numRotations = numRotations;
                this.rotationTimes = new Array(numRotations);
                this.rotations = new Array(numRotations);
            }
            else {
                this.numRotations = 0;
                this.rotationTimes = null;
                this.rotations = null;
            }

            if (numScales > 0) {
                this.numScales = numScales;
                this.scaleTimes = new Array(numScales);
                this.scales = new Array(numScales);
            }
            else {
                this.numScales = 0;
                this.scaleTimes = null;
                this.scales = null;
            }
        }

        // Cached indices for the last found pair of keys used for interpolation.
        // For a sequence of times, this guarantees an O(1) lookup.
        this.tLastIndex = 0;
        this.rLastIndex = 0;
        this.sLastIndex = 0;
        this.cLastIndex = 0;
    }

    /**
     * @param {number} applicationTime - ms
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        let ctrlTime = this.getControlTime(applicationTime);
        let trn = Point.ORIGIN;
        let rot = Matrix.IDENTITY;
        let scale = 0;
        let t;

        // The logic here checks for equal-time arrays to minimize the number of
        // times GetKeyInfo is called.
        if (this.numCommonTimes > 0) {
            t = KeyframeController.getKeyInfo(ctrlTime, this.numCommonTimes, this.commonTimes, this.cLastIndex);
            this.cLastIndex = t[0];
            let normTime = t[1], i0 = t[2], i1 = t[3];
            t = null;

            if (this.numTranslations > 0) {
                trn = this.getTranslate(normTime, i0, i1);
                this.localTransform.setTranslate(trn);
            }

            if (this.numRotations > 0) {
                rot = this.getRotate(normTime, i0, i1);
                this.localTransform.setRotate(rot);
            }

            if (this.numScales > 0) {
                scale = this.getScale(normTime, i0, i1);
                this.localTransform.setUniformScale(scale);
            }
        }
        else {
            if (this.numTranslations > 0) {
                t = KeyframeController.getKeyInfo(ctrlTime, this.numTranslations, this.translationTimes, this.tLastIndex);
                this.tLastIndex = t[0];
                trn = this.getTranslate(t[1], t[2], t[3]);
                this.localTransform.setTranslate(trn);
            }

            if (this.numRotations > 0) {
                t = KeyframeController.getKeyInfo(ctrlTime, this.numRotations, this.rotationTimes, this.rLastIndex);
                this.rLastIndex = t[0];
                rot = this.getRotate(t[1], t[2], t[3]);
                this.localTransform.setRotate(rot);
            }

            if (this.numScales > 0) {
                t = KeyframeController.getKeyInfo(ctrlTime, this.numScales, this.scaleTimes, this.sLastIndex);
                this.sLastIndex = t[0];
                scale = this.getScale(t[1], t[2], t[3]);
                this.localTransform.setUniformScale(scale);
            }
        }

        this.object.localTransform.copy(this.localTransform);
        return true;
    }

    // Support for looking up keyframes given the specified time.

    /**
     * @param {number} ctrlTime 
     * @param {number} numTimes 
     * @param {Array<number>} times 
     * @param {number} lIndex
     * @protected
     */
    static getKeyInfo(ctrlTime, numTimes, times, lIndex) {
        if (ctrlTime <= times[0]) {
            return [0, 0, 0, 0];
        }

        if (ctrlTime >= times[numTimes - 1]) {
            let l = numTimes - 1;
            return [0, l, l, l];
        }

        let nextIndex;
        if (ctrlTime > times[lIndex]) {
            nextIndex = lIndex + 1;
            while (ctrlTime >= times[nextIndex]) {
                lIndex = nextIndex;
                ++nextIndex;
            }

            return [
                lIndex,
                (ctrlTime - times[lIndex]) / (times[nextIndex] - times[lIndex]),
                lIndex,
                nextIndex
            ];
        }
        else if (ctrlTime < times[lIndex]) {
            nextIndex = lIndex - 1;
            while (ctrlTime <= times[nextIndex]) {
                lIndex = nextIndex;
                --nextIndex;
            }
            return [
                lIndex,
                (ctrlTime - times[nextIndex]) / (times[lIndex] - times[nextIndex]),
                nextIndex,
                lIndex
            ];
        }

        return [lIndex, 0, lIndex, lIndex];
    }

    /**
     * @param {number} normTime
     * @param {number} i0
     * @param {number} i1
     * @returns {Point}
     * @protected
     */
    getTranslate(normTime, i0, i1) {
        const t0 = this.translations[i0];
        const t1 = this.translations[i1];
        return t0.add(t1.sub(t0).scalar(normTime));  // t0 + (t1 - t0) * normalTime
    }

    /**
     *
     * @param {number} normTime
     * @param {number} i0
     * @param {number} i1
     * @returns {Matrix}
     * @protected
     */
    getRotate(normTime, i0, i1) {
        let q = new Quaternion();
        q.slerp(normTime, this.rotations[i0], this.rotations[i1]);
        return q.toRotateMatrix();
    }

    /**
     * @param {number} normTime
     * @param {number} i0
     * @param {number} i1
     * @returns {number}
     * @protected
     */
    getScale(normTime, i0, i1) {
        return this.scales[i0] + normTime * (this.scales[i1] - this.scales[i0]);
    }

    load(inStream) {

        super.load(inStream);
        this.numCommonTimes = inStream.readUint32();
        if (this.numCommonTimes > 0) {
            this.commonTimes = inStream.readArray(this.numCommonTimes);

            this.translations = inStream.readPointArray();
            this.numTranslations = this.translations.length;

            this.rotations = inStream.readQuaternionArray();
            this.numRotations = this.rotations.length;

            this.scales = inStream.readFloatArray();
            this.numScales = this.scales.length;
        }
        else {
            this.translationTimes = inStream.readFloatArray();
            this.numTranslations = this.translationTimes.length;
            this.translations = inStream.readSizedPointArray(this.numTranslations);

            this.rotationTimes = inStream.readFloatArray();
            this.numRotations = this.rotationTimes.length;
            this.rotations = inStream.readSizedQuaternionArray(this.numRotations);

            this.scaleTimes = inStream.readFloatArray();
            this.numScales = this.scaleTimes.length;
            this.scales = inStream.readArray(this.numScales);
        }
    }

    static factory(inStream) {
        let obj = new KeyframeController(0, 0, 0, 0, 0);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('KeyframeController', KeyframeController.factory);

export { KeyframeController };
