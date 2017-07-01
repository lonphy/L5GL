import { Controller } from './Controller';
import { Vector, Matrix } from '../../math/index';
import { Renderer } from '../renderer/Renderer';
import { VertexBufferAccessor } from '../resources/namespace';
import { PolyPoint } from '../sceneTree/namespace';

/**
 * The object to which this is attached must be Polypoint or a class derived fromPolypoint.
 * 
 * Point motion, in the model space of the system. 
 * The velocity vectors should be unit length.
 * In applications where the points represent a rigid body, you might choose the origin of
 * the system to be the center of mass of the points and the coordinate axes to correspond
 * to the principal directions of the inertia tensor.
 * 
 * @abstract
 */
class PointController extends Controller {
    constructor() {
        super();

        this.systemLinearSpeed = 0.0;
        this.systemAngularSpeed = 0.0;
        this.systemLinearAxis = Vector.UNIT_Z;
        this.systemAngularAxis = Vector.UNIT_Z;

        this.numPoints = 0;
        this.pointLinearSpeed = 0.0;
        this.pointAngularSpeed = 0.0;
        this.pointLinearAxis = Vector.UNIT_Z;
        this.pointAngularAxis = Vector.UNIT_Z;
    }
    /**
     * The animation update.  The application time is in milliseconds.
     * @param {number} applicationTime
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }
        let ctrlTime = this.getControlTime(applicationTime);
        this.updateSystemMotion(ctrlTime);
        this.updatePointMotion(ctrlTime);
        return true;
    }

    reallocate(numPoints) {
        delete this.pointLinearSpeed;
        delete this.pointAngularSpeed;
        delete this.pointLinearAxis;
        delete this.pointAngularAxis;

        this.numPoints = numPoints;
        if (numPoints > 0) {
            this.pointLinearSpeed = new Array(numPoints);
            this.pointAngularSpeed = new Array(numPoints);
            this.pointLinearAxis = new Array(numPoints);
            this.pointAngularAxis = new Array(numPoints);
            for (let i = 0; i < numPoints; ++i) {
                this.pointLinearSpeed[i] = 0.0;
                this.pointAngularSpeed[i] = 0.0;
                this.pointLinearAxis[i] = Vector.UNIT_Z;
                this.pointAngularAxis[i] = Vector.UNIT_Z;
            }
        }
    }

    /**
     * @param {ControlledObject} ctldObj
     */
    setObject(ctldObj) {
        this.object = ctldObj;
        if (this.object) {
            console.assert(!(ctldObj instanceof PolyPoint), 'Invalid class');
            this.reallocate(ctldObj.vertexBuffer.numElements);
        }
        else {
            this.reallocate(0);
        }
    }

    /**
     * This class computes the new positions and orientations from the motion
     * parameters.  Derived classes should update the motion parameters and
     * then either call the base class update methods or provide its own
     * update methods for position and orientation.
     * @param {number} ctrlTime 
     */
    updateSystemMotion(ctrlTime) {
        let points = this.object;
        let distance = ctrlTime * this.systemLinearSpeed;
        let deltaTrn = this.systemLinearAxis.scalar(distance);
        points.localTransform.setTranslate(
            points.localTransform.getTranslate().add(deltaTrn)
        );

        let angle = ctrlTime * this.systemAngularSpeed;
        let deltaRot = Matrix.makeRotation(this.systemAngularAxis, angle);

        points.localTransform.setRotate(deltaRot.mul(points.localTransform.getRotate()));
    }

    updatePointMotion(ctrlTime) {
        let points = this.object;
        let vba = VertexBufferAccessor.fromVisual(points);

        const numPoints = points.numPoints;
        let i, distance, pos, deltaTrn;
        for (i = 0; i < numPoints; ++i) {
            distance = ctrlTime * this.pointLinearSpeed[i];
            deltaTrn = this.pointLinearAxis[i].scalar(distance);

            pos = vba.getPosition(i);
            pos[0] += deltaTrn.x;
            pos[1] += deltaTrn.y;
            pos[2] += deltaTrn.z;
        }

        let angle, normal, deltaRot;
        if (vba.hasNormal()) {
            for (i = 0; i < numPoints; ++i) {
                angle = ctrlTime * this.pointAngularSpeed[i];
                normal = vba.getNormal(i);
                normal.normalize();
                deltaRot = Matrix.makeRotation(this.pointAngularAxis[i], angle);
                vba.setNormal(i, deltaRot.mulPoint(normal));
            }
        }

        Renderer.updateAll(points.vertexBuffer);
    }
}

export { PointController };
