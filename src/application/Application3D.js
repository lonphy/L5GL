import { BaseApplication } from './BaseApplication';
import { _Math, Vector, Matrix } from '../math/index';
import * as Input from '../input/key';
import { Camera } from '../graphics/sceneTree/Camera';

class Application3D extends BaseApplication {
    /**
     * @param {string} title
     * @param {number} width
     * @param {number} height
     * @param {ArrayLike<number>} clearColor
     * @param {string} canvas - canvas's DOM id
     */
    constructor(title, width, height, clearColor, canvas) {
        super(title, width, height, clearColor, canvas);
        this.camera = null;
        this.worldAxis = [Vector.ZERO, Vector.ZERO, Vector.ZERO];

        this.trnSpeed = 0;
        this.trnSpeedFactor = 2;
        this.rotSpeed = 0;
        this.rotSpeedFactor = 2;

        this.UArrowPressed = false;
        this.DArrowPressed = false;
        this.LArrowPressed = false;
        this.RArrowPressed = false;
        this.PgUpPressed = false;
        this.PgDnPressed = false;
        this.HomePressed = false;
        this.EndPressed = false;
        this.InsertPressed = false;
        this.DeletePressed = false;
        this.cameraMoveable = false;

        /** @type {Spatial} */
        this.motionObject = null;
        this.doRoll = 0;
        this.doYaw = 0;
        this.doPitch = 0;
        this.xTrack0 = 0;
        this.xTrack1 = 0;
        this.yTrack0 = 0;
        this.yTrack1 = 0;
        /** @type {Matrix} */
        this.saveRotate = null;
        this.useTrackBall = true;
        this.trackBallDown = false;
    }

    /**
     * @param {Spatial} motionObject
     */
    initializeObjectMotion(motionObject) {
        this.motionObject = motionObject;
    }

    moveObject() {
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
        let motionObject = this.motionObject;

        if (!this.cameraMoveable || !motionObject) {
            return false;
        }

        // Check if the object has been moved by the virtual trackball.
        if (this.trackBallDown) {
            return true;
        }

        // Check if the object has been moved by the function keys.
        let parent = motionObject.parent;
        let axis = Vector.ZERO;
        let angle;
        let rot, incr;
        let rotSpeed = this.rotSpeed;

        if (this.doRoll) {
            rot = motionObject.localTransform.getRotate();

            angle = this.doRoll * rotSpeed;
            if (parent) {
                parent.worldTransform.getRotate().getColumn(0, axis);
            }
            else {
                axis.set(1, 0, 0); // Vector.UNIT_X;
            }

            incr.makeRotation(axis, angle);
            rot = incr * rot;
            rot.orthoNormalize();
            motionObject.localTransform.setRotate(rot);
            return true;
        }

        if (this.doYaw) {
            rot = motionObject.localTransform.getRotate();

            angle = this.doYaw * rotSpeed;
            if (parent) {
                parent.worldTransform.getRotate().getColumn(1, axis);
            }
            else {
                axis.set(0, 1, 0); // Vector.UNIT_Y;
            }

            incr.makeRotation(axis, angle);
            rot = incr * rot;
            rot.orthoNormalize();
            motionObject.localTransform.setRotate(rot);
            return true;
        }

        if (this.doPitch) {
            rot = motionObject.localTransform.getRotate();

            angle = this.doPitch * rotSpeed;
            if (parent) {
                parent.worldTransform.getRotate().getColumn(2, axis);
            }
            else {
                axis.set(0, 0, 1); // Vector.UNIT_Z;
            }

            incr.makeRotation(axis, angle);
            rot = incr * rot;
            rot.orthoNormalize();
            motionObject.localTransform.setRotate(rot);
            return true;
        }

        return false;
    }

    rotateTrackBall(x0, y0, x1, y1) {
        if ((x0 === x1 && y0 === y1) || !this.camera) {
            // Nothing to rotate.
            return;
        }

        // Get the first vector on the sphere.
        let length = _Math.sqrt(x0 * x0 + y0 * y0), invLength, z0, z1;
        if (length > 1) {
            // Outside the unit disk, project onto it.
            invLength = 1 / length;
            x0 *= invLength;
            y0 *= invLength;
            z0 = 0;
        }
        else {
            // Compute point (x0,y0,z0) on negative unit hemisphere.
            z0 = 1 - x0 * x0 - y0 * y0;
            z0 = z0 <= 0 ? 0 : _Math.sqrt(z0);
        }
        z0 = -z0;

        // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
        let vec0 = new Vector(z0, y0, x0);

        // Get the second vector on the sphere.
        length = _Math.sqrt(x1 * x1 + y1 * y1);
        if (length > 1) {
            // Outside unit disk, project onto it.
            invLength = 1 / length;
            x1 *= invLength;
            y1 *= invLength;
            z1 = 0;
        }
        else {
            // Compute point (x1,y1,z1) on negative unit hemisphere.
            z1 = 1 - x1 * x1 - y1 * y1;
            z1 = z1 <= 0 ? 0 : _Math.sqrt(z1);
        }
        z1 = -z1;

        // Use camera world coordinates, order is (D,U,R), so point is (z,y,x).
        let vec1 = new Vector(z1, y1, x1);

        // Create axis and angle for the rotation.
        let axis = vec0.cross(vec1);
        let dot = vec0.dot(vec1);
        let angle;
        if (axis.normalize() > _Math.ZERO_TOLERANCE) {
            angle = _Math.acos(dot);
        }
        else  // Vectors are parallel.
        {
            if (dot < 0) {
                // Rotated pi radians.
                invLength = _Math.invSqrt(x0 * x0 + y0 * y0);
                axis.x = y0 * invLength;
                axis.y = -x0 * invLength;
                axis.z = 0;
                angle = _Math.PI;
            }
            else {
                // Rotation by zero radians.
                axis = Vector.UNIT_X;
                angle = 0;
            }
        }

        // Compute the world rotation matrix implied by trackball motion.  The
        // axis vector was computed in camera coordinates.  It must be converted
        // to world coordinates.  Once again, I use the camera ordering (D,U,R).
        let worldAxis = this.camera.direction.scalar(axis.x).add(
            this.camera.up.scalar(axis.y).add(
                this.camera.right.scalar(axis.z)
            )
        );
        let trackRotate = new Matrix(worldAxis, angle);

        // Compute the new local rotation.  If the object is the root of the
        // scene, the new rotation is simply the *incremental rotation* of the
        // trackball applied *after* the object has been rotated by its old
        // local rotation.  If the object is not the root of the scene, you have
        // to convert the incremental rotation by a change of basis in the
        // parent's coordinate space.
        let parent = this.motionObject.parent;
        let localRot;
        if (parent) {
            let parWorRotate = parent.worldTransform.GetRotate();
            localRot = parWorRotate.transposeTimes(trackRotate) * parWorRotate * this.saveRotate;
        }
        else {
            localRot = trackRotate * this.saveRotate;
        }
        localRot.orthonormalize();
        this.motionObject.localTransform.setRotate(localRot);
    }

    /**
     * @param {number} trnSpeed - move speed
     * @param {number} rotSpeed - rotate speed /rad
     * @param {number} trnSpeedFactor - move speed factor, default = 2
     * @param {number} rotSpeedFactor - rotate speed factor, default = 2
     */
    initializeCameraMotion(trnSpeed, rotSpeed, trnSpeedFactor = 2, rotSpeedFactor = 2) {
        this.cameraMoveable = true;

        this.trnSpeed = trnSpeed;
        this.rotSpeed = rotSpeed;
        this.trnSpeedFactor = trnSpeedFactor;
        this.rotSpeedFactor = rotSpeedFactor;

        this.worldAxis[0] = this.camera.direction;
        this.worldAxis[1] = this.camera.up;
        this.worldAxis[2] = this.camera.right;
    }

    /**
     * if we move camera, then update camera
     */
    moveCamera() {
        if (!this.cameraMoveable) {
            return false;
        }

        let moved = false;

        if (this.UArrowPressed) {
            this.moveForward();
            moved = true;
        }

        if (this.DArrowPressed) {
            this.moveBackward();
            moved = true;
        }

        if (this.HomePressed) {
            this.moveUp();
            moved = true;
        }

        if (this.EndPressed) {
            this.moveDown();
            moved = true;
        }

        if (this.LArrowPressed) {
            this.turnLeft();
            moved = true;
        }

        if (this.RArrowPressed) {
            this.turnRight();
            moved = true;
        }

        if (this.PgUpPressed) {
            this.lookUp();
            moved = true;
        }

        if (this.PgDnPressed) {
            this.lookDown();
            moved = true;
        }

        if (this.InsertPressed) {
            this.moveRight();
            moved = true;
        }

        if (this.DeletePressed) {
            this.moveLeft();
            moved = true;
        }

        return moved;
    }

    moveForward() {
        let pos = this.camera.position;
        let t = this.worldAxis[0].scalar(this.trnSpeed);
        this.camera.setPosition(pos.sub(t));
    }

    moveBackward() {
        let pos = this.camera.position;
        let t = this.worldAxis[0].scalar(this.trnSpeed);
        this.camera.setPosition(pos.add(t));
    }

    moveUp() {
        let pos = this.camera.position;
        let t = this.worldAxis[1].scalar(this.trnSpeed);
        this.camera.setPosition(pos.sub(t));
    }

    moveDown() {
        let pos = this.camera.position;
        let t = this.worldAxis[1].scalar(this.trnSpeed);
        this.camera.setPosition(pos.add(t));
    }

    moveLeft() {
        let pos = this.camera.position;
        let t = this.worldAxis[2].scalar(this.trnSpeed);
        this.camera.setPosition(pos.sub(t));
    }

    moveRight() {
        let pos = this.camera.position;
        let t = this.worldAxis[2].scalar(this.trnSpeed);
        this.camera.setPosition(pos.add(t));
    }

    turnLeft() {
        let incr = Matrix.makeRotation(this.worldAxis[1], -this.rotSpeed);
        this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
        this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
        let camera = this.camera;
        let dir = incr.mulPoint(camera.direction);
        let up = incr.mulPoint(camera.up);
        let right = incr.mulPoint(camera.right);
        this.camera.setAxes(dir, up, right);
    }

    turnRight() {
        let incr = Matrix.makeRotation(this.worldAxis[1], this.rotSpeed);
        this.worldAxis[0] = incr.mulPoint(this.worldAxis[0]);
        this.worldAxis[2] = incr.mulPoint(this.worldAxis[2]);
        let camera = this.camera;
        let dVector = incr.mulPoint(camera.direction);
        let uVector = incr.mulPoint(camera.up);
        let rVector = incr.mulPoint(camera.right);
        this.camera.setAxes(dVector, uVector, rVector);
    }

    lookUp() {
        let incr = Matrix.makeRotation(this.worldAxis[2], -this.rotSpeed);
        let camera = this.camera;
        let dVector = incr.mulPoint(camera.direction);
        let uVector = incr.mulPoint(camera.up);
        let rVector = incr.mulPoint(camera.right);
        this.camera.setAxes(dVector, uVector, rVector);
    }

    lookDown() {
        let incr = Matrix.makeRotation(this.worldAxis[2], this.rotSpeed);
        let camera = this.camera;
        let dVector = incr.mulPoint(camera.direction);
        let uVector = incr.mulPoint(camera.up);
        let rVector = incr.mulPoint(camera.right);
        this.camera.setAxes(dVector, uVector, rVector);
    }

    /**
     *
     * @param {boolean} isPerspective - 透视相机
     * @returns {boolean}
     */
    onInitialize(isPerspective = true) {
        if (!super.onInitialize()) {
            return false;
        }
        this.camera = new Camera(isPerspective);
        this.renderer.camera = this.camera;
        this.motionObject = null;
        return true;
    }

    onKeyDown(key, x, y) {
        if (super.onKeyDown(key, x, y)) {
            return true;
        }
        let cameraMoveable = this.cameraMoveable;

        switch (key) {
            case Input.KB_1:  // Slower camera translation.
                if (cameraMoveable) {
                    this.trnSpeed /= this.trnSpeedFactor;
                }
                return true;
            case Input.KB_2:  // Faster camera translation.
                if (cameraMoveable) {
                    this.trnSpeed *= this.trnSpeedFactor;
                }
                return true;
            case Input.KB_3:  // Slower camera rotation.
                if (cameraMoveable) {
                    this.rotSpeed /= this.rotSpeedFactor;
                }
                return true;
            case Input.KB_4:  // Faster camera rotation.
                if (cameraMoveable) {
                    this.rotSpeed *= this.rotSpeedFactor;
                }
                return true;
        }

        return false;
    }

    onSpecialKeyDown(key, x, y) {
        if (this.cameraMoveable) {
            switch (key) {
                case Input.KB_LEFT:
                    return (this.LArrowPressed = true);
                case Input.KB_RIGHT:
                    return (this.RArrowPressed = true);
                case Input.KB_UP:
                    return (this.UArrowPressed = true);
                case Input.KB_DOWN:
                    return (this.DArrowPressed = true);
            }
        }

        if (this.motionObject) {
            if (key === Input.KB_F1) {
                this.doRoll = -1;
                return true;
            }
            if (key === Input.KB_F2) {
                this.doRoll = 1;
                return true;
            }
            if (key === Input.KB_F3) {
                this.doYaw = -1;
                return true;
            }
            if (key === Input.KB_F4) {
                this.doYaw = 1;
                return true;
            }
            if (key === Input.KB_F5) {
                this.doPitch = -1;
                return true;
            }
            if (key === Input.KB_F6) {
                this.doPitch = 1;
                return true;
            }
        }

        return false;
    }

    onSpecialKeyUp(key, x, y) {
        if (this.cameraMoveable) {
            if (key === Input.KB_LEFT) {
                this.LArrowPressed = false;
                return true;
            }
            if (key === Input.KB_RIGHT) {
                this.RArrowPressed = false;
                return true;
            }
            if (key === Input.KB_UP) {
                this.UArrowPressed = false;
                return true;
            }
            if (key === Input.KB_DOWN) {
                this.DArrowPressed = false;
                return true;
            }
        }

        if (this.motionObject) {
            if (key === Input.KB_F1) {
                this.doRoll = 0;
                return true;
            }
            if (key === Input.KB_F2) {
                this.doRoll = 0;
                return true;
            }
            if (key === Input.KB_F3) {
                this.doYaw = 0;
                return true;
            }
            if (key === Input.KB_F4) {
                this.doYaw = 0;
                return true;
            }
            if (key === Input.KB_F5) {
                this.doPitch = 0;
                return true;
            }
            if (key === Input.KB_F6) {
                this.doPitch = 0;
                return true;
            }
        }

        return false;
    }

    onMouseClick(button, state, x, y, modifiers) {
        let width = this.width;
        let height = this.height;
        if (!this.useTrackBall ||
            button !== Input.MS_LEFT || !this.motionObject
        ) {
            return false;
        }

        let mult = 1 / (width >= height ? height : width);

        if (state === Input.MS_RIGHT) {
            // Get the starting point.
            this.trackBallDown = true;
            this.saveRotate = this.motionObject.localTransform.getRotate();
            this.xTrack0 = (2 * x - width) * mult;
            this.yTrack0 = (2 * (height - 1 - y) - height) * mult;
        }
        else {
            this.trackBallDown = false;
        }

        return true;
    }

    onMotion(button, x, y, modifiers) {
        if (
            !this.useTrackBall ||
            button !== Input.MS_LEFT || !this.trackBallDown || !this.motionObject
        ) {
            return false;
        }
        let width = this.width;
        let height = this.height;

        // Get the ending point.
        let mult = 1 / (width >= height ? height : width);
        this.xTrack1 = (2 * x - width) * mult;
        this.yTrack1 = (2 * (height - 1 - y) - height) * mult;

        // Update the object's local rotation.
        this.rotateTrackBall(this.xTrack0, this.yTrack0, this.xTrack1, this.yTrack1);
        return true;
    }

    onResize(width, height) {
        super.onResize(width, height);
        let params = this.camera.getPerspective();
        this.camera.setPerspective(params[0], this.getAspectRatio(), params[2], params[3]);
    }
}

export { Application3D };
