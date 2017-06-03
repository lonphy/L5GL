/**
 * CameraNode - 相机节点
 *
 * @param camera {L5.Camera}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
import {Node} from './Node'
import {Vector} from '../../math/Vector'
import {Matrix} from '../../math/Matrix'

export class CameraNode extends Node {
    constructor(camera) {
        super();
        this._camera = camera;
    }

    set camera (val) {
        this._camera = val;
        if (val)
        {
            this.localTransform.setTranslate(val.position);

            var rotate = new Matrix.IPMake(
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

        if (this._camera)
        {
            var pos = this.worldTransform.getTranslate();
            var rotate = this.worldTransform.getRotate();
            var direction = Vector.ZERO;
            var up = Vector.ZERO;
            var right = Vector.ZERO;
            rotate.getColumn(0, direction);
            rotate.getColumn(1, up);
            rotate.getColumn(2, right);
            this._camera.setFrame(pos, direction, up, right);
        }
    }
 }
