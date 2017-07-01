import { Controller } from './Controller';
import { Vector, Matrix } from '../../math/index';
import { Particles } from '../sceneTree/namespace';

/**
 * Abstract base class. The object to
 * which this is attached must be Particles.
 */
class ParticleController extends Controller {
	constructor() {
		super()
		// The system motion, in local coordinates.  The velocity vectors should
		// be unit length.
		this.systemLinearSpeed = 0;
		this.systemAngularSpeed = 0;
		this.systemLinearAxis = Vector.UNIT_Z;
		this.systemAngularAxis = Vector.UNIT_Z;
		this.systemSizeChange = 0;

		// Particle motion, in the model space of the system.  The velocity
		// vectors should be unit length.  In applications where the points
		// represent a rigid body, you might choose the origin of the system to
		// be the center of mass of the particles and the coordinate axes to
		// correspond to the principal directions of the inertia tensor.
		this.numParticles = 0;
		this.particleLinearSpeed = null;
		this.particleLinearAxis = null;
		this.particleSizeChange = null;
	}
	/**
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

	/**
	 * For deferred allocation of the particle motion arrays.
	 * @param {number} numParticles
	 */
	reallocate(numParticles) {
		delete this.particleLinearSpeed;
		delete this.particleLinearAxis;
		delete this.particleSizeChange;
		this.numParticles = numParticles;
		if (numParticles > 0) {
			this.particleLinearSpeed = [];
			this.particleLinearAxis = [];
			this.particleSizeChange = [];
			for (let i = 0; i < numParticles; ++i) {
				this.particleLinearSpeed.push(0);
				this.particleLinearAxis.push(Vector.UNIT_Z);
				this.particleSizeChange.push(0);
			}
		}
	}

	/**
	 * @param {Particles} obj 
	 */
	setObject(obj) {
		this.object = obj;
		if (obj) {
			console.assert(obj instanceof Particles, 'Invalid class.');
			this.reallocate(obj.numParticles);
		}
		else {
			this.reallocate(0);
		}
	}

	// This class computes the new positions and orientations from the motion
	// parameters.  Derived classes should update the motion parameters and
	// then either call the base class update methods or provide its own
	// update methods for position and orientation.
	updateSystemMotion(ctrlTime) {
		let particles = this.object;
		let dSize = ctrlTime * this.systemSizeChange;
		particles.sizeAdjust += dSize;
		if (particles.sizeAdjust < 0) {
			particles.sizeAdjust = 0;
		}

		let distance = ctrlTime * this.systemLinearSpeed;
		let deltaTrn = this.systemLinearAxis.scalar(distance);
		particles.localTransform.setTranslate(particles.localTransform.getTranslate().add(deltaTrn));

		let angle = ctrlTime * this.systemAngularSpeed;
		let deltaRot = Matrix.makeRotation(this.systemAngularAxis, angle);
		particles.localTransform.setRotate(deltaRot.mul(particles.localTransform.getRotate()));
	}
	updatePointMotion(ctrlTime) {
		let particles = this.object;
		let posSizes = particles.positionSizes;

		let numActive = particles.numActive;
		for (let i = 0; i < numActive; ++i) {
			let dSize = ctrlTime * this.particleSizeChange[i];
			posSizes[i * 4 + 3] += dSize;
			let distance = ctrlTime * this.particleLinearSpeed[i];
			let deltaTrn = this.particleLinearAxis[i].scalar(distance);
			posSizes[i * 4] += deltaTrn[0];
			posSizes[i * 4 + 1] += deltaTrn[1];
			posSizes[i * 4 + 2] += deltaTrn[2];
		}
	}
}

export { ParticleController };
