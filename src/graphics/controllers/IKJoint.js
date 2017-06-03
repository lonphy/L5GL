import { D3Object } from '../../core/D3Object'
import { _Math, Vector, Matrix } from '../../math/index'

export class IKJoint extends D3Object {

	/**
	 * @param {Spatial} object 
	 * @param {number} numGoals 
	 * @param {IKGoal} goals
	 */
	constructor(object, numGoals, goals) {
		super();
		this.object = object;
		this.numGoals = numGoals;
		this.goals = goals;
		// Index i is for the joint's parent's world axis[i].
		for (let i = 0; i < 3; ++i) {
			this.allowTranslation.push(false);
			this.minTranslation.push(-_Math.MAX_REAL);
			this.maxTranslation.push(_Math.MAX_REAL);
			this.allowRotation.push(false);
			this.minRotation.push(-_Math.PI);
			this.maxRotation.push(_Math.PI);
		}
	}
	/**
	 * @param {number} i 
	 * @return {Vector}
	 */
	getAxis(i) {
		const parent = this.object.parent;
		if (parent) {
			let axis = new Vector;
			parent.worldTransform.getRotate().getColumn(i, axis);
			return axis;
		}
		switch (i) {
			case 0: return Vector.UNIT_X;
			case 1: return Vector.UNIT_Y;
		}
		return Vector.UNIT_Z;
	}
	updateWorldSRT() {
		const parent = this.object.parent;
		if (parent) {
			this.object.worldTransform = parent.worldTransform.mul(this.object.localTransform);
		}
		else {
			this.object.worldTransform = this.object.localTransform;
		}
	}
	updateWorldRT() {
		const parent = this.objec.parent;
		if (parent) {
			let rot = parent.worldTransform.getRotate().mul(this.object.localTransform.GetRotate());
			this.object.worldTransform.setRotate(rot);
			let trn = parent.worldTransform.mulPoint(this.object.localTransform.getTranslate());
			this.object.worldTransform.setTranslate(trn);
		}
		else {
			this.object.worldTransform.setRotate(this.object.localTransform.getRotate());
			this.object.worldTransform.setTranslate(this.object.localTransform.getTranslate());
		}
	}
	/**
	 * @param {number} i 
	 */
	bupdateLocalT(i) {
		let U = this.getAxis(i);
		let numer = 0;
		let denom = 0;
		let oldNorm = 0;
		let goal, g;
		for (g = 0; g < this.numGoals; ++g) {
			goal = this.goals[g];
			let GmE = goal.getTargetPosition().subAsVector(goal.getEffectorPosition());
			oldNorm += GmE.squaredLength();
			numer += goal.weight * U.dot(GmE);
			denom += goal.weight;
		}

		if (_Math.abs(denom) <= _Math.ZERO_TOLERANCE) {
			// weights were too small, no translation.
			return false;
		}

		// Desired distance to translate along axis(i).
		let t = numer / denom;

		// Clamp to range.
		let trn = this.object.localTransform.getTranslate();
		let desired = trn[i] + t;
		if (desired > this.minTranslation[i]) {
			if (desired < this.maxTranslation[i]) {
				trn[i] = desired;
			}
			else {
				t = this.maxTranslation[i] - trn[i];
				trn[i] = this.maxTranslation[i];
			}
		}
		else {
			t = this.minTranslation[i] - trn[i];
			trn[i] = this.minTranslation[i];
		}

		// Test whether step should be taken.
		let newNorm = 0;
		let step = U.scalar(t);
		for (g = 0; g < this.numGoals; ++g) {
			goal = this.goals[g];
			let newE = goal.getEffectorPosition().add(step);
			let diff = goal.getTargetPosition().subAsVector(newE);
			newNorm += diff.squaredLength();
		}
		if (newNorm >= oldNorm) {
			// Translation does not get effector closer to goal.
			return false;
		}

		// Update the local translation.
		this.object.localTransform.setTranslate(trn);
		return true;
	}
	/**
	 * @param {number} i 
	 */
	updateLocalR(i) {
		let U = this.getAxis(i);
		let numer = 0;
		let denom = 0;

		let oldNorm = 0;
		let g, gobal;
		for (g = 0; g < this.numGoals; ++g) {
			goal = this.goals[g];
			let EmP = goal.getEffectorPosition().subAsVector(this.object.worldTransform.getTranslate());
			let GmP = goal.getTargetPosition().subAsVector(this.object.worldTransform.getTranslate());
			let GmE = goal.getTargetPosition().subAsVector(goal.getEffectorPosition());
			oldNorm += GmE.squaredLength();
			let UxEmP = U.cross(EmP);
			let UxUxEmP = U.cross(UxEmP);
			numer += goal.weight * GmP.dot(UxEmP);
			denom -= goal.weight * GmP.dot(UxUxEmP);
		}

		if (numer * numer + denom * denom <= _Math.ZERO_TOLERANCE) {
			// Undefined atan2, no rotation.
			return false;
		}

		// Desired angle to rotate about axis(i).
		let theta = _Math.atan2(numer, denom);

		// Factor local rotation into Euler angles.
		// let euler[3];
		let rotate = this.object.localTransform.getRotate();

		// Matrix3f rot(
		//     rotate[0][0], rotate[0][1], rotate[0][2],
		//     rotate[1][0], rotate[1][1], rotate[1][2],
		//     rotate[2][0], rotate[2][1], rotate[2][2]);

		rot.ExtractEulerZYX(euler[2], euler[1], euler[0]);

		// Clamp to range.
		let desired = euler[i] + theta;
		if (desired > MinRotation[i]) {
			if (desired < MaxRotation[i]) {
				euler[i] = desired;
			}
			else {
				theta = MaxRotation[i] - euler[i];
				euler[i] = MaxRotation[i];
			}
		}
		else {
			theta = MinRotation[i] - euler[i];
			euler[i] = MinRotation[i];
		}

		// Test whether step should be taken.
		let newNorm = 0;
		rotate.MakeRotation(U, theta);
		for (g = 0; g < this.numGoals; ++g) {
			goal = this.goals[g];
			let EmP = goal.getEffectorPosition().subAsVector(this.object.worldTransform.getTranslate());
			let newE = this.object.worldTransform.getTranslate() + rotate * EmP;
			let GmE = goal.getTargetPosition().subAsVector(newE);
			newNorm += GmE.squaredLength();
		}

		if (newNorm >= oldNorm) {
			// Rotation does not get effector closer to goal.
			return false;
		}

		// Update the local rotation.
		rot.MakeEulerZYX(euler[2], euler[1], euler[0]);

		rotate = new Matrix(
			rot[0][0], rot[0][1], rot[0][2], 0,
			rot[1][0], rot[1][1], rot[1][2], 0,
			rot[2][0], rot[2][1], rot[2][2], 0,
			0, 0, 0, 1);

		this.object.LocalTransform.setRotate(rotate);
		return true;
	}
}