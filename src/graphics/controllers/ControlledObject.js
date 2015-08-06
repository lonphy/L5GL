/**
 * ControlledObject - 控制基类
 * @version 1.0
 * @author lonphy
 */

L5.ControlledObject = function () {
    L5.D3Object.call (this);

    this.numControllers = 0;
    this.controllers    = [];
};

L5.nameFix (L5.ControlledObject, 'ControlledObject');
L5.extendFix (L5.ControlledObject, L5.D3Object);

/**
 * @param i {number}
 * @returns {L5.Controller}
 */
L5.ControlledObject.prototype.getController    = function (i) {
    if (0 <= i && i < this.numControllers) {
        return this.controllers[ i ];
    }

    L5.assert (false, 'Invalid index in getController.');
    return null;
};
/**
 * @param controller {L5.Controller}
 */
L5.ControlledObject.prototype.attachController = function (
    controller
) {
    // By design, controllers may not be controlled.  This avoids arbitrarily
    // complex graphs of controllers.  TODO:  Consider allowing this?
    if (!(controller instanceof L5.Controller)) {
        L5.assert (false, 'Controllers may not be controlled');
        return;
    }

    // The controller must exist.
    if (!controller) {
        L5.assert (false, 'Cannot attach a null controller');
        return;
    }

    // Test whether the controller is already in the array.
    var i, l = this.numControllers;
    for (i = 0; i < l; ++i) {
        if (controller === this.controllers[ i ]) {
            return;
        }
    }

    // Bind the controller to the object.
    controller.object = this;

    this.controllers[ (this.numControllers)++ ] = controller;
};
/**
 * @param controller {L5.Controller}
 */
L5.ControlledObject.prototype.detachController = function (
    controller
) {
    var l = this.numControllersl;
    for (var i = 0; i < l; ++i) {
        if (controller == this.controllers[ i ]) {
            // Unbind the controller from the object.
            controller.object = null;

            // Remove the controller from the array, keeping the array
            // compact.
            for (var j = i + 1; j < l; ++j, ++i) {
                this.controllers[ i ] = this.controllers[ j ];
            }
            this.controllers[ --(this.numControllers) ] = null;
            return;
        }
    }
};
L5.ControlledObject.prototype.detachAllControllers = function () {
    var i, l = this.numControllers;
    for (i = 0; i < l; ++i) {
        // Unbind the controller from the object.
        this.controllers[ i ].object = null;
        this.controllers[ i ]        = null;
    }
    this.numControllers = 0;
};

L5.ControlledObject.prototype.updateControllers = function (
    applicationTime
) {
    var someoneUpdated = false, l= this.numControllers;
    for (var i = 0; i < l; ++i) {
        if (this.controllers[ i ].update (applicationTime)) {
            someoneUpdated = true;
        }
    }
    return someoneUpdated;
};