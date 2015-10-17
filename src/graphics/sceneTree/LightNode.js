/**
 * 光源节点
 * @param light {L5.Light}
 * @constructor
 * @extends {L5.Node}
 */
L5.LightNode = function (light) {
    L5.Node.call(this);
    this.light = light;

    if (light) {
        this.localTransform.setTranslate(light.position);
        var rotate = L5.Matrix.fromVectorAndPoint(light.direction, light.up, light.right, L5.Point.ORIGIN);
        this.localTransform.setRotate(rotate);
    }
};
L5.nameFix(L5.LightNode, 'LightNode');
L5.extendFix(L5.LightNode, L5.Node);

/**
 *
 * @param light {L5.Light}
 */
L5.LightNode.prototype.setLight = function (light) {
    this.light = light;
    if (light) {
        this.localTransform.setTranslate(light.position);
        var rotate = L5.Matrix.fromVectorAndPoint(light.direction, light.up, light.right, L5.Point.ORIGIN);
        this.localTransform.setRotate(rotate);
        this.update();
    }
};
/**
 * @param applicationTime {float}
 */
L5.LightNode.prototype.updateWorldData = function (applicationTime) {
    L5.Node.prototype.updateWorldData.call(this, applicationTime);
    var light = this.light;
    if (light) {
        light.position = this.worldTransform.getTranslate();
        var rotate = this.worldTransform.getRotate();
        rotate.getColumn(0, light.direction);
        rotate.getColumn(1, light.up);
        rotate.getColumn(2, light.right);
    }
};