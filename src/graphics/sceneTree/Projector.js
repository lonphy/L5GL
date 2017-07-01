import { Camera } from './Camera';
import { DECLARE_ENUM } from '../../util/util';
import { Matrix } from '../../math/index';

class Projector extends Camera {
	constructor(isPerspective = true) {
		super(isPerspective);
	}
}

DECLARE_ENUM(Projector, {
	biasScaleMatrix: [new Matrix(
		0.5, 0.0, 0.0, 0.5,
		0.0, -0.5, 0.0, 0.5,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	), new Matrix(
		0.5, 0.0, 0.0, 0.5,
		0.0, -0.5, 0.0, 0.5,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	)]
});

export { Projector };