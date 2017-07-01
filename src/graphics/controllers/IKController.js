import { Controller } from './Controller';
import { D3Object } from '../../core/D3Object';

/**
 * IKController assumes responsibility for 
 * the input arrays and will delete them.  They should be dynamically allocated.
 */
class IKController extends Controller {

	/**
	 * 
	 * @param {number} numJoints 
	 * @param {Array<IKJoint>} joints 
	 * @param {number} numGoals 
	 * @param {Array<IKGoal>} goals 
	 */
	constructor(numJoints, joints, numGoals, goals) {
		this.iterations = 128;
		this.orderEndToRoot = true;
		this.numJoints = numJoints;
		this.joints = joints;
		this.numGoals = numGoals;
		this.goals = goals;
	}
	
	/**
	 * @param {number} applicationTime - ms
	 */
	update(applicationTime) {
		if (!super.update(applicationTime)) {
			return false;
		}

		// Make sure effectors are all current in world space.  It is assumed
		// that the joints form a chain, so the world transforms of joint I
		// are the parent transforms for the joint I+1.
		let k, numJoints = this.numJoints;
		for (k = 0; k < numJoints; ++k) {
			this.joints[k].updateWorldSRT();
		}

		// Update joints one-at-a-time to meet goals.  As each joint is updated,
		// the nodes occurring in the chain after that joint must be made current
		// in world space.
		let iter, i, j;
		let joint, joints = this.joints;
		if (this.orderEndToRoot) {
			for (iter = 0; iter < this.iterations; ++iter) {
				for (k = 0; k < numJoints; ++k) {
					let r = numJoints - 1 - k;
					joint = joints[r];

					for (i = 0; i < 3; ++i) {
						if (joint.allowTranslation[i]) {
							if (joint.updateLocalT(i)) {
								for (j = r; j < numJoints; ++j) {
									joints[j].updateWorldRT();
								}
							}
						}
					}

					for (i = 0; i < 3; ++i) {
						if (joint.allowRotation[i]) {
							if (joint.updateLocalR(i)) {
								for (j = r; j < numJoints; ++j) {
									joints[j].updateWorldRT();
								}
							}
						}
					}
				}
			}
		}
		else  // order root to end
		{
			for (iter = 0; iter < this.iterations; ++iter) {
				for (k = 0; k < numJoints; ++k) {
					joint = joints[k];

					for (i = 0; i < 3; ++i) {
						if (joint.allowTranslation[i]) {
							if (joint.updateLocalT(i)) {
								for (j = k; j < numJoints; ++j) {
									joints[j].updateWorldRT();
								}
							}
						}
					}

					for (i = 0; i < 3; ++i) {
						if (joint.allowRotation[i]) {
							if (joint.updateLocalR(i)) {
								for (j = k; j < numJoints; ++j) {
									joints[j].updateWorldRT();
								}
							}
						}
					}
				}
			}
		}

		return true;
	}
}

D3Object.Register(IKController.name, IKController.factory.bind(IKController));

export { IKController };