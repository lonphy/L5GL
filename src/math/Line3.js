import { Vector } from './Vector';
import { Point } from './Point';

class Line3 {
	/**
	 * @param {Point} org 
	 * @param {Vector} dir
	 */
	constructor(org, dir) {
		this.org = Point.ORIGIN;
		this.dir = Vector.ZERO;
		if (org) this.org.copy(org);
		if (dir) this.dir.copy(dir);
	}
}

export { Line3 };