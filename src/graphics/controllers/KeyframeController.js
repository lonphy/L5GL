/**
 * 关键帧控制器
 *
 * @param numCommonTimes {number}
 * @param numTranslations {number}
 * @param numRotations {number}
 * @param numScales {number}
 * @param localTransform {L5.Transform}
 *
 * @constructor
 * @extends {L5.TransformController}
 *
 * @version 1.0
 * @author lonphy
 */
L5.KeyframeController = function (numCommonTimes,
                                  numTranslations,
                                  numRotations,
                                  numScales,
                                  localTransform) {
    L5.TransformController.call(this, localTransform);

    if (numCommonTimes > 0) {
        this.numCommonTimes = numCommonTimes;
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
            mNumScales = 0;
            mScaleTimes = null;
            mScales = null;
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

    this.tLastIndex = 0;
    this.rLastIndex = 0;
    this.sLastIndex = 0;
    this.cLastIndex = 0;

};

L5.nameFix(L5.KeyframeController, 'KeyframeController');
L5.extendFix(L5.KeyframeController, L5.TransformController);

L5.KeyframeController.prototype.getNumCommonTimes = function () {
    return this.numCommonTimes;
};
L5.KeyframeController.prototype.getCommonTimes = function () {
    return this.commonTimes;
};

L5.KeyframeController.prototype.getNumTranslations = function () {
    return this.numTranslations;
};
L5.KeyframeController.prototype.getTranslationTimes = function () {
    return this.translationTimes;
};
L5.KeyframeController.prototype.getTranslations = function () {
    return this.translations;
};

L5.KeyframeController.prototype.getNumRotations = function () {
    return this.numRotations;
};
L5.KeyframeController.prototype.getRotationTimes = function () {
    return this.rotationTimes;
};
L5.KeyframeController.prototype.getRotations = function () {
    return this.rotations;
};

L5.KeyframeController.prototype.getNumScales = function () {
    return this.numScales;
};
L5.KeyframeController.prototype.getScaleTimes = function () {
    return this.scaleTimes;
};
L5.KeyframeController.prototype.getScales = function () {
    return this.scales;
};

/**
 * 动画更新
 * @param applicationTime {number}
 */
L5.KeyframeController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    var ctrlTime = this.getControlTime(applicationTime);
    var trn = new L5.Point();
    var rot = new L5.Matrix();
    var scale = 0;
    var t;

    // The logic here checks for equal-time arrays to minimize the number of
    // times GetKeyInfo is called.
    if (this.numCommonTimes > 0) {
        t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numCommonTimes, this.commonTimes, this.cLastIndex);
        this.cLastIndex = t[0];
        var normTime = t[1], i0 = t[2], i1 = t[3];
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
            t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numTranslations, this.translationTimes, this.tLastIndex);
            this.tLastIndex = t[0];
            trn = this.getTranslate(t[1], t[2], t[3]);
            this.localTransform.setTranslate(trn);
        }

        if (this.numRotations > 0) {
            t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numRotations, this.rotationTimes, this.rLastIndex);
            this.rLastIndex = t[0];
            rot = this.getRotate(t[1], t[2], t[3]);
            this.localTransform.setRotate(rot);
        }

        if (this.numScales > 0) {
            t = L5.KeyframeController.getKeyInfo(ctrlTime, this.numScales, this.scaleTimes, this.sLastIndex);
            this.sLastIndex = t[0];
            scale = this.getScale(t[1], t[2], t[3]);
            this.localTransform.setUniformScale(scale);
        }
    }

    this.object.localTransform = this.localTransform;
    return true;
};


// Support for looking up keyframes given the specified time.
L5.KeyframeController.getKeyInfo = function (ctrlTime, numTimes, times, lIndex) {
    if (ctrlTime <= times[0]) {
        return [0, 0, 0, 0];
    }

    if (ctrlTime >= times[numTimes - 1]) {
        var l = numTimes - 1;
        return [0, l, l, l];
    }

    var nextIndex;
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
};
/**
 *
 * @param normTime
 * @param i0
 * @param i1
 * @returns {L5.Point}
 */
L5.KeyframeController.prototype.getTranslate = function (normTime, i0, i1) {
    var t0 = this.translations[i0];
    var t1 = this.translations[i1];
    return t0.add(t1.sub(t0).scalar(normTime));
};
/**
 *
 * @param normTime
 * @param i0
 * @param i1
 * @returns {L5.Matrix}
 */
L5.KeyframeController.prototype.getRotate = function (normTime, i0, i1) {
    var q = new L5.Quaternion();
    q.slerp(normTime, this.rotations[i0], this.rotations[i1]);
    return q.toRotateMatrix();
};
/**
 *
 * @param normTime
 * @param i0
 * @param i1
 * @returns {number}
 */
L5.KeyframeController.prototype.getScale = function (normTime, i0, i1) {
    return this.scales[i0] + normTime * (this.scales[i1] - this.scales[i0]);
};

/**
 * @param inStream {L5.InStream}
 */
L5.KeyframeController.prototype.load = function (inStream) {

    L5.TransformController.prototype.load.call(this, inStream);
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
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.KeyframeController}
 */
L5.KeyframeController.factory = function (inStream) {
    var obj = new L5.KeyframeController(0, 0, 0, 0, 0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.KeyframeController', L5.KeyframeController.factory);