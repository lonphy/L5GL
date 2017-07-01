import { Node } from './Node';
import { Vector, Matrix } from '../../math/index';

class CameraNode extends Node {
    constructor(camera) {
        super();
        this._camera = camera;
    }

    set camera(val) {
        this._camera = val;
        if (val) {
            this.localTransform.setTranslate(val.position);

            let rotate = new Matrix.IPMake(
                val.direction,
                val.up,
                val.right,
                L5.Point.ORIGIN
            );
            this.localTransform.setRotate(rotate);
            this.update();
        }
    }

    updateWorldData(applicationTime) {
        super.updateWorldData(applicationTime);

        if (this._camera) {
            let pos = this.worldTransform.getTranslate();
            let rotate = this.worldTransform.getRotate();
            let direction = Vector.ZERO;
            let up = Vector.ZERO;
            let right = Vector.ZERO;
            rotate.getColumn(0, direction);
            rotate.getColumn(1, up);
            rotate.getColumn(2, right);
            this._camera.setFrame(pos, direction, up, right);
        }
    }
}
export { CameraNode };