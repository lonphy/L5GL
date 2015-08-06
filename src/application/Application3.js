/**
 * Application 3D
 * @param title {string}
 * @param width {number}
 * @param height {number}
 * @param clearColor
 * @param canvas
 *
 * @extends {L5.Application}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Application3                                  = function (
    title, width, height, clearColor, canvas
) {
    L5.Application.call (this, title, width, height, clearColor, canvas);

    this.camera         = null;
    this.worldAxis      = [
        L5.Vector.ZERO,
        L5.Vector.ZERO,
        L5.Vector.ZERO
    ];
    this.trnSpeed       = 0;
    this.trnSpeedFactor = 0;
    this.rotSpeed       = 0;
    this.rotSpeedFactor = 0;

    this.UArrowPressed   = false;
    this.DArrowPressed   = false;
    this.LArrowPressed   = false;
    this.RArrowPressed   = false;
    this.PgUpPressed     = false;
    this.PgDnPressed     = false;
    this.HomePressed     = false;
    this.EndPressed      = false;
    this.InsertPressed   = false;
    this.DeletePressed   = false;
    this.CameraMoveable  = false;

    /**
     * @type {L5.Spatial}
     */
    this.motionObject  = null;
    this.doRoll        = 0;
    this.doYaw         = 0;
    this.doPitch       = 0;
    this.xTrack0       = 0;
    this.xTrack1       = 0;
    this.yTrack0       = 0;
    this.yTrack1       = 0;
    /**
     * @type {L5.Matrix}
     */
    this.saveRotate    = null;
    this.useTrackBall  = true;
    this.trackBallDown = false;
};

L5.extendFix(L5.Application3, L5.Application);

/**
 * @param motionObject {L5.Spatial}
 */
L5.Application3.prototype.initializeObjectMotion = function (
    motionObject
) {
    this.motionObject = motionObject;
};
L5.Application3.prototype.moveObject             = function () {
    // The coordinate system in which the rotations are applied is that of
    // the object's parent, if it has one.  The parent's world rotation
    // matrix is R, of which the columns are the coordinate axis directions.
    // Column 0 is "direction", column 1 is "up", and column 2 is "right".
    // If the object does not have a parent, the world coordinate axes are
    // used, in which case the rotation matrix is I, the identity.  Column 0
    // is (1,0,0) and is "direction", column 1 is (0,1,0) and is "up", and
    // column 2 is (0,0,1) and is "right".  This choice is consistent with
    // the use of rotations in the Camera and Light classes to store
    // coordinate axes.
    //
    // Roll is about the "direction" axis, yaw is about the "up" axis, and
    // pitch is about the "right" axis.
    var motionObject = this.motionObject;

    if (!this.cameraMoveable || !motionObject) {
        return false;
    }

    // Check if the object has been moved by the virtual trackball.
    if (this.trackBallDown) {
        return true;
    }

    // Check if the object has been moved by the function keys.
    var parent   = motionObject.parent;
    var axis;
    var angle;
    var rot, incr;
    var rotSpeed = this.rotSpeed;

    if (this.doRoll) {
        rot = motionObject.localTransform.GetRotate ();

        angle = this.doRoll * rotSpeed;
        if (parent) {
            parent.worldTransform.getRotate ().getColumn (0, axis);
        }
        else {
            axis = L5.Vector.UNIT_X;
        }

        incr.makeRotation (axis, angle);
        rot   = incr * rot;
        rot.orthonormalize ();
        motionObject.localTransform.setRotate (rot);
        return true;
    }

    if (this.doYaw) {
        rot = motionObject.localTransform.GetRotate ();

        angle = this.doYaw * rotSpeed;
        if (parent) {
            parent.worldTransform.getRotate ().getColumn (1, axis);
        }
        else {
            axis = L5.Vector.UNIT_Y;
        }

        incr.makeRotation (axis, angle);
        rot   = incr * rot;
        rot.orthonormalize ();
        motionObject.localTransform.setRotate (rot);
        return true;
    }

    if (this.doPitch) {
        rot = motionObject.localTransform.getRotate ();

        angle = this.doPitch * rotSpeed;
        if (parent) {
            parent.worldTransform.getRotate ().getColumn (2, axis);
        }
        else {
            axis = L5.Vector.UNIT_Z;
        }

        incr.makeRotation (axis, angle);
        rot   = incr * rot;
        rot.orthonormalize ();
        motionObject.localTransform.setRotate (rot);
        return true;
    }

    return false;
};

L5.Application3.prototype.rotateTrackBall        = function (
    x0, y0, x1, y1
) {
    if ((x0 == x1 && y0 == y1) || !this.camera) {
        // Nothing to rotate.
        return;
    }

    // Get the first vector on the sphere.
    var length = L5.Math.sqrt (x0 * x0 + y0 * y0), invLength, z0, z1;
    if (length > 1) {
        // Outside the unit disk, project onto it.
        invLength = 1 / length;
        x0 *= invLength;
        y0 *= invLength;
        z0        = 0;
    }
    else {
        // Compute point (x0,y0,z0) on negative unit hemisphere.
        z0 = 1 - x0 * x0 - y0 * y0;
        z0 = z0 <= 0 ? 0 : L5.Mathf.sqrt (z0);
    }
    z0 = -z0;

    // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
    var vec0 = new L5.Vector (z0, y0, x0);

    // Get the second vector on the sphere.
    length = L5.Math.sqrt (x1 * x1 + y1 * y1);
    if (length > 1) {
        // Outside unit disk, project onto it.
        invLength = 1 / length;
        x1 *= invLength;
        y1 *= invLength;
        z1        = 0;
    }
    else {
        // Compute point (x1,y1,z1) on negative unit hemisphere.
        z1 = 1 - x1 * x1 - y1 * y1;
        z1 = z1 <= 0 ? 0 : L5.Math.sqrt (z1);
    }
    z1 = -z1;

    // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
    var vec1 = new L5.Vector (z1, y1, x1);

    // Create axis and angle for the rotation.
    var axis = vec0.cross (vec1);
    var dot  = vec0.dot (vec1);
    var angle;
    if (axis.normalize () > L5.Math.ZERO_TOLERANCE) {
        angle = L5.Math.acos (dot);
    }
    else  // Vectors are parallel.
    {
        if (dot < 0) {
            // Rotated pi radians.
            invLength = L5.Math.invSqrt (x0 * x0 + y0 * y0);
            axis.x    = y0 * invLength;
            axis.y    = -x0 * invLength;
            axis.z    = 0;
            angle     = L5.Math.PI;
        }
        else {
            // Rotation by zero radians.
            axis  = L5.Vector.UNIT_X;
            angle = 0;
        }
    }

    // Compute the world rotation matrix implied by trackball motion.  The
    // axis vector was computed in camera coordinates.  It must be converted
    // to world coordinates.  Once again, I use the camera ordering (D,U,R).
    var worldAxis = this.camera.direction.scalar (axis.x).add (
        this.camera.up.scalar (axis.y).add (
            this.camera.right.scalar (axis.z)
        )
    );


    var trackRotate = new L5.Matrix (worldAxis, angle);

    // Compute the new local rotation.  If the object is the root of the
    // scene, the new rotation is simply the *incremental rotation* of the
    // trackball applied *after* the object has been rotated by its old
    // local rotation.  If the object is not the root of the scene, you have
    // to convert the incremental rotation by a change of basis in the
    // parent's coordinate space.
    var parent = this.motionObject.parent;
    var localRot;
    if (parent) {
        var parWorRotate = parent.worldTransform.GetRotate ();
        localRot         = parWorRotate.transposeTimes (trackRotate) * parWorRotate * this.saveRotate;
    }
    else {
        localRot = trackRotate * this.saveRotate;
    }
    localRot.orthonormalize ();
    this.motionObject.localTransform.setRotate (localRot);
};
/**
 *
 * @param trnSpeed
 * @param rotSpeed
 * @param trnSpeedFactor default is 2
 * @param rotSpeedFactor default is 2
 */
L5.Application3.prototype.initializeCameraMotion = function (
    trnSpeed, rotSpeed, trnSpeedFactor, rotSpeedFactor
) {
    this.cameraMoveable = true;

    this.trnSpeed       = trnSpeed;
    this.rotSpeed       = rotSpeed;
    this.trnSpeedFactor = trnSpeedFactor;
    this.rotSpeedFactor = rotSpeedFactor;

    this.worldAxis[ 0 ] = this.camera.getDVector ();
    this.worldAxis[ 1 ] = this.camera.getUVector ();
    this.worldAxis[ 2 ] = this.camera.getRVector ();
};
L5.Application3.prototype.moveCamera             = function () {
    if (!this.cameraMoveable) {
        return false;
    }

    var moved = false;

    if (this.UArrowPressed) {
        this.moveForward ();
        moved = true;
    }

    if (this.DArrowPressed) {
        this.moveBackward ();
        moved = true;
    }

    if (this.HomePressed) {
        this.moveUp ();
        moved = true;
    }

    if (this.EndPressed) {
        this.moveDown ();
        moved = true;
    }

    if (this.LArrowPressed) {
        this.turnLeft ();
        moved = true;
    }

    if (this.RArrowPressed) {
        this.turnRight ();
        moved = true;
    }

    if (this.PgUpPressed) {
        this.lookUp ();
        moved = true;
    }

    if (this.PgDnPressed) {
        this.lookDown ();
        moved = true;
    }

    if (this.InsertPressed) {
        this.moveRight ();
        moved = true;
    }

    if (this.DeletePressed) {
        this.moveLeft ();
        moved = true;
    }

    return moved;
};

L5.Application3.prototype.MoveForward  = function () {
    var pos              = this.camera.position;
    var t                = this.worldAxis[ 0 ].scalar (this.trnSpeed);
    this.camera.position = pos.add (t);
};
L5.Application3.prototype.MoveBackward = function () {
    var pos              = this.camera.position;
    var t                = this.worldAxis[ 0 ].scalar (this.trnSpeed);
    this.camera.position = pos.sub (t);
};
L5.Application3.prototype.MoveUp       = function () {
    var pos              = this.camera.position;
    var t                = this.worldAxis[ 1 ].scalar (this.trnSpeed);
    this.camera.position = pos.add (t);
};
L5.Application3.prototype.MoveDown     = function () {
    var pos              = this.camera.position;
    var t                = this.worldAxis[ 1 ].scalar (this.trnSpeed);
    this.camera.position = pos.sub (t);
};
L5.Application3.prototype.MoveLeft     = function () {
    var pos              = this.camera.position;
    var t                = this.worldAxis[ 2 ].scalar (this.trnSpeed);
    this.camera.position = pos.sub (t);
};
L5.Application3.prototype.MoveRight    = function () {
    var pos              = this.camera.position;
    var t                = this.worldAxis[ 2 ].scalar (this.trnSpeed);
    this.camera.position = pos.add (t);
};
L5.Application3.prototype.TurnLeft     = function () {
    var incr            = new L5.Matrix.makeRotation (this.worldAxis[ 1 ], this.rotSpeed);
    this.worldAxis[ 0 ] = incr.xIPoint (this.worldAxis[ 0 ]);
    this.worldAxis[ 2 ] = incr.xIPoint (this.worldAxis[ 2 ]);
    var camera          = this.camera;
    var dVector         = camera.direction.xMatrix4 (incr);
    var uVector         = camera.up.xMatrix4 (incr);
    var rVector         = camera.right.xMatrix4 (incr);
    this.camera.setAxes (dVector, uVector, rVector);
};
L5.Application3.prototype.TurnRight    = function () {
    var incr            = new L5.Matrix.makeRotation (this.worldAxis[ 1 ], -this.rotSpeed);
    this.worldAxis[ 0 ] = incr.xIPoint (this.worldAxis[ 0 ]);
    this.worldAxis[ 2 ] = incr.xIPoint (this.worldAxis[ 2 ]);
    var camera          = this.camera;
    var dVector         = camera.direction.xMatrix4 (incr);
    var uVector         = camera.up.xMatrix4 (incr);
    var rVector         = camera.right.xMatrix4 (incr);
    this.camera.setAxes (dVector, uVector, rVector);
};
L5.Application3.prototype.LookUp       = function () {
    var incr    = new L5.Matrix.makeRotation (this.worldAxis[ 2 ], this.rotSpeed);
    var camera  = this.camera;
    var dVector = camera.direction.xMatrix4 (incr);
    var uVector = camera.up.xMatrix4 (incr);
    var rVector = camera.right.xMatrix4 (incr);
    this.camera.setAxes (dVector, uVector, rVector);
};
L5.Application3.prototype.LookDown     = function () {
    var incr    = new L5.Matrix.makeRotation (this.worldAxis[ 2 ], -this.rotSpeed);
    var camera  = this.camera;
    var dVector = camera.direction.xMatrix4 (incr);
    var uVector = camera.up.xMatrix4 (incr);
    var rVector = camera.right.xMatrix4 (incr);
    this.camera.setAxes (dVector, uVector, rVector);
};


L5.Application3.prototype.onInitialize = function () {
    if (!L5.Application.prototype.onInitialize.call(this)) {
        return false;
    }
    this.camera       = new L5.Camera ();
    this.renderer.camera = this.camera;
    this.motionObject = null;
    return true;
};

L5.Application3.prototype.onKeyDown = function (
    key, x, y
) {
    if (L5.Application3.prototype.onKeyDown.call (this, key, x, y)) {
        return true;
    }
    var cameraMoveable = this.cameraMobeable;

    // Standard keys for Wild Magic applications.
    switch (key) {
        case 't':  // Slower camera translation.
            if (cameraMoveable) {
                this.trnSpeed /= this.trnSpeedFactor;
            }
            return true;
        case 'T':  // Faster camera translation.
            if (cameraMoveable) {
                this.trnSpeed *= this.trnSpeedFactor;
            }
            return true;
        case 'r':  // Slower camera rotation.
            if (cameraMoveable) {
                this.rotSpeed /= this.rotSpeedFactor;
            }
            return true;
        case 'R':  // Faster camera rotation.
            if (cameraMoveable) {
                this.rotSpeed *= this.rotSpeedFactor;
            }
            return true;
        case '?':  // Reset the timer.
            this.resetTime ();
            return true;
    }

    return false;
};

L5.Application3.prototype.onSpecialKeyDown = function (
    key, x, y
) {
    if (this.cameraMoveable) {
        if (key === L5.Application.KEY_LEFT_ARROW) {
            this.LArrowPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_RIGHT_ARROW) {
            this.RArrowPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_UP_ARROW) {
            this.UArrowPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_DOWN_ARROW) {
            this.DArrowPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_PAGE_UP) {
            this.PgUpPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_PAGE_DOWN) {
            this.PgDnPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_HOME) {
            this.Hothis.ePressed = true;
            return true;
        }
        if (key === L5.Application.KEY_END) {
            this.EndPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_INSERT) {
            this.InsertPressed = true;
            return true;
        }
        if (key === L5.Application.KEY_DELETE) {
            this.DeletePressed = true;
            return true;
        }
    }

    if (this.motionObject) {
        if (key === L5.Application.KEY_F1) {
            this.doRoll = -1;
            return true;
        }
        if (key === L5.Application.KEY_F2) {
            this.doRoll = 1;
            return true;
        }
        if (key === L5.Application.KEY_F3) {
            this.doYaw = -1;
            return true;
        }
        if (key === L5.Application.KEY_F4) {
            this.doYaw = 1;
            return true;
        }
        if (key === L5.Application.KEY_F5) {
            this.doPitch = -1;
            return true;
        }
        if (key === L5.Application.KEY_F6) {
            this.doPitch = 1;
            return true;
        }
    }

    return false;
};

L5.Application3.prototype.onSpecialKeyUp = function (
    key, x, y
) {
    if (this.cameraMoveable) {
        if (key === L5.Application.KEY_LEFT_ARROW) {
            this.LArrowPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_RIGHT_ARROW) {
            this.RArrowPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_UP_ARROW) {
            this.UArrowPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_DOWN_ARROW) {
            this.DArrowPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_PAGE_UP) {
            this.PgUpPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_PAGE_DOWN) {
            this.PgDnPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_HOME) {
            this.HomePressed = false;
            return true;
        }
        if (key === L5.Application.KEY_END) {
            this.EndPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_INSERT) {
            this.InsertPressed = false;
            return true;
        }
        if (key === L5.Application.KEY_DELETE) {
            this.DeletePressed = false;
            return true;
        }
    }

    if (this.motionObject) {
        if (key === L5.Application.KEY_F1) {
            this.doRoll = 0;
            return true;
        }
        if (key === L5.Application.KEY_F2) {
            this.doRoll = 0;
            return true;
        }
        if (key === L5.Application.KEY_F3) {
            this.doYaw = 0;
            return true;
        }
        if (key === L5.Application.KEY_F4) {
            this.doYaw = 0;
            return true;
        }
        if (key === L5.Application.KEY_F5) {
            this.doPitch = 0;
            return true;
        }
        if (key === L5.Application.KEY_F6) {
            this.doPitch = 0;
            return true;
        }
    }

    return false;
};


L5.Application3.prototype.onMouseClick = function (
    button, state, x, y, modifiers
) {
    var width  = this.width;
    var height = this.height;
    if (!this.useTrackBall ||
        button !== L5.Application.MOUSE_LEFT_BUTTON || !this.motionObject
    ) {
        return false;
    }

    var mult = 1 / (width >= height ? height : width);

    if (state === L5.Application.MOUSE_DOWN) {
        // Get the starting point.
        this.trackBallDown = true;
        this.saveRotate    = this.motionObject.localTransform.getRotate ();
        this.xTrack0       = (2 * x - width) * mult;
        this.yTrack0       = (2 * (height - 1 - y) - height) * mult;
    }
    else {
        this.trackBallDown = false;
    }

    return true;
};

L5.Application3.prototype.onMotion = function (
    button, x, y, modifiers
) {
    if (
        !this.useTrackBall ||
        button !== L5.Application.MOUSE_LEFT_BUTTON || !mTrackBallDown || !mMotionObject
    ) {
        return false;
    }
    var width  = this.width;
    var height = this.height;

    // Get the ending point.
    var mult     = 1 / (width >= height ? height : width);
    this.xTrack1 = (2 * x - width) * mult;
    this.yTrack1 = (2 * (height - 1 - y) - height) * mult;

    // Update the object's local rotation.
    this.rotateTrackBall (this.xTrack0, this.yTrack0, this.xTrack1, this.yTrack1);
    return true;
};