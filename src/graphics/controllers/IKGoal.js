import { D3Object } from '../../core/D3Object'

export class IKGoal extends D3Object {

	/**
	 * @param {Spatial} target 
	 * @param {Spatial} effector 
	 * @param {number} weight 
	 */
	constructor(target, effector, weight = 1) {
		super();
		this.target = target;
		this.effector = effector;
		this.weight = weight;
	}
	/**
	 * @return {Point}
	 */
	getTargetPosition() {
		return this.target.worldTransform.getTranslate();
	}
	/**
	 * @return {Point}
	 */
	getEffectorPosition() {
		return this.effector.worldTransform.getTranslate();
	}
}