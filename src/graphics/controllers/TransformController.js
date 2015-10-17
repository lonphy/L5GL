/**
 * TransformControlledObject - 控制基类
 * @version 1.0
 * @author lonphy
 */
/**
 *
 * @param localTransform {L5.Transform}
 * @constructor
 */
L5.TransformController = function (localTransform) {
    L5.Controller.call(this);
    this.localTransform = localTransform;
};

L5.TransformController.name = "TransformController";
L5.extendFix(L5.TransformController, L5.Controller);

L5.TransformController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    this.object.localTransform = localTransform;
    return true;
};

/**
 *
 * @param inStream {L5.InStream}
 */
L5.TransformController.prototype.load = function (inStream) {
    L5.Controller.prototype.load.call(this, inStream);
    this.localTransform = inStream.readAggregate();
};