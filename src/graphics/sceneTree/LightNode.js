// @ts-check
import { Node } from './Node'
import { Matrix, Point } from '../../math/index'

/**
 * 光源节点
 *
 * 该节点的worldTransform(世界变换)平移,使用光源position(位置)
 * 该节点的worldTransform(世界变换)旋转,使用光源的坐标系(up, right, direction)
 */
export class LightNode extends Node {

    /**
     * @param {Light} light
     */
    constructor(light) {
        super();
        this.light = light;

        if (light) {
            this.localTransform.setTranslate(light.position);
            var rotate = Matrix.fromVectorAndPoint(light.direction, light.up, light.right, Point.ORIGIN);
            this.localTransform.setRotate(rotate);
        }
    }
    /**
     * 设置灯光
     * @param {Light} light 
     */
    setLight(light) {
        this.light = light;
        if (light) {
            this.localTransform.setTranslate(light.position);
            var rotate = Matrix.fromVectorAndPoint(light.direction, light.up, light.right, Point.ORIGIN);
            this.localTransform.setRotate(rotate);
            this.update();
        }
    }

    /**
     * @param {number} applicationTime
     */
    updateWorldData(applicationTime) {
        super.updateWorldData(applicationTime);
        var light = this.light;
        if (light) {
            light.position = this.worldTransform.getTranslate();
            var rotate = this.worldTransform.getRotate();
            rotate.getColumn(0, light.direction);
            rotate.getColumn(1, light.up);
            rotate.getColumn(2, light.right);
        }
    }
}
