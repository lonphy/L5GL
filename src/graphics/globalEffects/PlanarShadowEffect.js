/**
 * 全局特效 - 平面投影
 * @param numPlanes {int} 投影的平面数量
 * @param shadowCaster {L5.Node} 需要投影的物体
 * @class
 * @extends {L5.D3Object}
 */
L5.PlanarShadowEffect = function (numPlanes, shadowCaster) {
    L5.D3Object.call(this, 'L5.GlobalPlanarShadow');
    this.numPlanes = numPlanes;
    this.planes = new Array(numPlanes);
    this.projectors = new Array(numPlanes);
    this.shadowColors = new Array(numPlanes);

    this.alphaState = new L5.AlphaState();
    this.depthState = new L5.DepthState();
    this.stencilState = new L5.StencilState();

    this.shadowCaster = shadowCaster;

    this.material = new L5.Material();
    this.materialEffect = new L5.MaterialEffect();
    this.materialEffectInstance = this.materialEffect.createInstance(this.material);
};
L5.nameFix(L5.PlanarShadowEffect, 'PlanarShadowEffect');
L5.extendFix(L5.PlanarShadowEffect, L5.D3Object);

/**
 * @param renderer {L5.Renderer}
 * @param visibleSet {L5.VisibleSet}
 */
L5.PlanarShadowEffect.prototype.draw = function (renderer, visibleSet) {
    // Draw the potentially visible portions of the shadow caster.
    const numVisible = visibleSet.getNumVisible();
    var j;
    for (j = 0; j < numVisible; ++j) {
        renderer.drawVisible(visibleSet.getVisible(j));
    }

    // 保存全局覆盖状态
    var saveDState = renderer.overrideDepthState;
    var saveSState = renderer.overrideStencilState;
    var depthState = this.depthState;
    var stencilState = this.stencilState;
    var alphaState = this.alphaState;

    // 渲染系统使用当前特效的状态
    renderer.overrideDepthState = depthState;
    renderer.overrideStencilState = stencilState;

    // Get the camera to store post-world transformations.
    var camera = renderer.camera;

    for (var i = 0; i < this.numPlanes; ++i) {
        // 开启深度测试
        depthState.enabled = true;
        depthState.writable = true;
        depthState.compare = L5.DepthState.COMPARE_MODE_LEQUAL;

        // 开启模板测试, 这样,投影平面可以裁剪阴影
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_ALWAYS;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;      // irrelevant
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;     // invisible to 0
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_REPLACE;  // visible to i+1

        // 绘制平面
        renderer.drawVisible(this.planes[i]);

        // Blend the shadow color with the pixels drawn on the projection
        // plane.  The blending equation is
        //   (rf,gf,bf) = as*(rs,gs,bs) + (1-as)*(rd,gd,bd)
        // where (rf,gf,bf) is the final color to be written to the frame
        // buffer, (rs,gs,bs,as) is the shadow color, and (rd,gd,bd) is the
        // current color of the frame buffer.
        var saveAlphaState = renderer.overrideAlphaState;
        renderer.overrideAlphaState = alphaState;
        alphaState.blendEnabled = true;
        alphaState.srcBlend = L5.AlphaState.BM_SRC_ALPHA;
        alphaState.dstBlend = L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA;

        this.material.diffuse = this.shadowColors[i];

        // Disable the depth buffer reading so that no depth-buffer fighting
        // occurs.  The drawing of pixels is controlled solely by the stencil
        // value.
        depthState.enabled = false;

        // Only draw where the plane has been drawn.
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_EQUAL;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;   // invisible kept 0
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;  // irrelevant
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_ZERO;  // visible set to 0

        // 计算光源的投影矩阵
        var projection = L5.Matrix.ZERO;
        if (!this.getProjectionMatrix(i, projection)) {
            continue;
        }
        camera.setPreViewMatrix(projection);

        // Draw the caster again, but temporarily use a material effect so
        // that the shadow color is blended onto the plane.  TODO:  This
        // drawing pass should use a VisibleSet relative to the projector so
        // that objects that are out of view (i.e. culled relative to the
        // camera and not in the camera's VisibleSet) can cast shadows.
        for (j = 0; j < numVisible; ++j) {
            var visual = visibleSet.getVisible(j);
            var save = visual.effect;
            visual.effect = this.materialEffectInstance;
            renderer.drawVisible(visual);
            visual.effect = save;
        }

        camera.setPreViewMatrix(L5.Matrix.IDENTITY);

        renderer.overrideAlphaState = saveAlphaState;
    }

    // 恢复全局状态
    renderer.overrideStencilState = saveSState;
    renderer.overrideDepthState = saveDState;
};

/**
 *
 * @param i {int}
 * @param projection {L5.Matrix}
 */
L5.PlanarShadowEffect.prototype.getProjectionMatrix = function (i, projection) {
    // 计算投影平面在世界坐标系的方程

    var vertex = new Array(3);
    this.planes[i].getWorldTriangle(0, vertex);
    var worldPlane = L5.Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);

    // This is a conservative test to see whether a shadow should be cast.
    // This can cause incorrect results if the caster is large and intersects
    // the plane, but ordinarily we are not trying to cast shadows in such
    // situations.
    // 计算需要计算阴影的物体在投影平面的哪一边
    if (this.shadowCaster.worldBound.whichSide(worldPlane) < 0) {
        // The shadow caster is on the far side of plane, so it cannot cast
        // a shadow.
        return false;
    }

    // 计算光源的投影矩阵
    var projector = this.projectors[i];
    var normal = worldPlane.normal;
    if (projector.type === L5.Light.LT_DIRECTIONAL) {
        var NdD = normal.dot(projector.direction);
        if (NdD >= 0) {
            // The projection must be onto the "positive side" of the plane.
            return false;
        }

        projection.makeObliqueProjection(vertex[0], normal, projector.direction);
    }

    else if (projector.type === L5.Light.LT_POINT || projector.type === L5.Light.LT_SPOT) {
        var NdE = projector.position.dot(normal);
        if (NdE <= 0) {
            // The projection must be onto the "positive side" of the plane.
            return false;
        }

        projection.makePerspectiveProjection(vertex[0], normal, projector.position);
    }
    else {
        L5.assert(false, 'Light type not supported.');
        return false;
    }

    return true;
};

/**
 * 设置阴影的投影平面
 * @param i {int}
 * @param plane {L5.TriMesh}
 */
L5.PlanarShadowEffect.prototype.setPlane = function (i, plane) {
    // 设置原来的投影平面为不可见, 由该特效实例负责渲染
    plane.culling = L5.Spatial.CULLING_ALWAYS;
    this.planes[i] = plane;
};

/**
 * 获取阴影的投影平面
 * @param i {int}
 * @returns {L5.TriMesh}
 */
L5.PlanarShadowEffect.prototype.getPlane = function (i) {
    return this.planes[i];
};

/**
 * 设置阴影的光源
 * @param i {int}
 * @param projector {L5.Light}
 */
L5.PlanarShadowEffect.prototype.setProjector = function (i, projector) {
    this.projectors[i] = projector;
};

/**
 * 获取阴影的光源
 * @param i {int}
 * @returns {L5.Light}
 */
L5.PlanarShadowEffect.prototype.getProjector = function (i) {
    return this.projectors[i];
};

/**
 * 设置阴影颜色
 * @param i {int}
 * @param shadowColor {Float32Array}
 */
L5.PlanarShadowEffect.prototype.setShadowColor = function (i, shadowColor) {
    if (!this.shadowColors[i]) {
        this.shadowColors[i] = new Float32Array(shadowColor, 0, 4);
    }
    else {
        this.shadowColors[i].set(shadowColor, 0);
    }
};

/**
 * 获取阴影的颜色
 * @param i {int} 索引
 * @returns {Float32Array}
 */
L5.PlanarShadowEffect.prototype.getShadowColor = function (i) {
    return new Float32Array(this.shadowColors[i]);
};