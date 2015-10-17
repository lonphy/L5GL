/**
 * 全局特效 - 镜像
 *
 * @param numPlanes {int}
 * @class
 * @extends {L5.D3Object}
 */
L5.PlanarReflectionEffect = function (numPlanes) {

    L5.D3Object.call(this, 'L5.GlobalPlanarReflection');
    this.numPlanes = numPlanes;

    this.planes = new Array(numPlanes);
    this.reflectances = new Array(numPlanes);
    this.alphaState = new L5.AlphaState();
    this.depthState = new L5.DepthState();
    this.stencilState = new L5.StencilState();
};
L5.nameFix(L5.PlanarReflectionEffect, 'PlanarReflectionEffect');
L5.extendFix(L5.PlanarReflectionEffect, L5.D3Object);


/**
 * @param renderer {L5.Renderer}
 * @param visibleSet {L5.VisibleSet}
 */
L5.PlanarReflectionEffect.prototype.draw = function (renderer, visibleSet) {
    // 保存全局覆盖状态
    const oldDepthState = renderer.overrideDepthState;
    const oldStencilState = renderer.overrideStencilState;

    var depthState = this.depthState;
    var stencilState = this.stencilState;
    var alphaState = this.alphaState;

    // 使用当前特效的状态
    renderer.overrideDepthState = depthState;
    renderer.overrideStencilState = stencilState;

    // 获取默认深度范围
    var depthRange = renderer.getDepthRange();

    // Get the camera to store post-world transformations.
    var camera = renderer.camera;

    const numVisible = visibleSet.getNumVisible();
    var i, j;
    for (i = 0; i < this.numPlanes; ++i) {
        // Render the mirror into the stencil plane.  All visible mirror
        // pixels will have the stencil value of the mirror.  Make sure that
        // no pixels are written to the depth buffer or color buffer, but use
        // depth buffer testing so that the stencil will not be written where
        // the plane is behind something already in the depth buffer.
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_ALWAYS;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;     // irrelevant
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;    // invisible to 0
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_REPLACE; // visible to i+1

        // 允许从深度缓冲读取,但是禁止写入
        depthState.enabled = true;
        depthState.writable = false;
        depthState.compare = L5.DepthState.COMPARE_MODE_LEQUAL;

        // 禁用颜色缓冲
        renderer.setColorMask(false, false, false, false);

        renderer.drawVisible(this.planes[i]);
        // 恢复
        renderer.setColorMask(true, true, true, true);

        // Render the mirror plane again by only processing pixels where the
        // stencil buffer contains the reference value.  This time there are
        // no changes to the stencil buffer and the depth buffer value is
        // reset to the far clipping plane.  This is done by setting the range
        // of depth values in the viewport volume to be [1,1].  Since the
        // mirror plane cannot also be semi-transparent, we do not care what
        // is behind the mirror plane in the depth buffer.  We need to move
        // the depth buffer values back where the mirror plane will be
        // rendered so that when the reflected object is rendered, it can be
        // depth buffered correctly.  Note that the rendering of the reflected
        // object will cause depth value to be written, which will appear to
        // be behind the mirror plane.  Enable writes to the color buffer.
        // Later when we want to render the reflecting plane and have it blend
        // with the background, which should contain the reflected caster, we
        // want to use the same blending function so that the pixels where the
        // reflected object was not rendered will contain the reflecting plane
        // colors.  In that case, the blending result will have the reflecting
        // plane appear to be opaque when in reality it was blended with
        // blending coefficients adding to one.
        stencilState.enabled = true;
        stencilState.compare = L5.StencilState.COMPARE_MODE_EQUAL;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_KEEP;

        // Set the depth buffer to "infinity" at those pixels for which the
        // stencil buffer is the reference value i+1.
        renderer.setDepthRange(1, 1);
        depthState.enabled = true;
        depthState.writable = true;
        depthState.compare = L5.DepthState.COMPARE_MODE_ALWAYS;

        renderer.drawVisible(this.planes[i]);

        // Restore the depth range and depth testing function.
        depthState.compare = L5.DepthState.COMPARE_MODE_LEQUAL;
        renderer.setDepthRange(depthRange[0], depthRange[1]);

        // Compute the equation for the mirror plane in model coordinates
        // and get the reflection matrix in world coordinates.
        var reflection = L5.Matrix.ZERO;
        var modelPlane = new L5.Plane([], 0);
        this.getReflectionMatrixAndModelPlane(i, reflection, modelPlane);

        // TODO:  Add clip plane support to the renderer.
        // Enable a clip plane so that only objects above the mirror plane
        // are reflected.  This occurs before SetTransformation because it
        // needs the current geometric pipeline matrices to compute the clip
        // plane in the correct coordinate system.
        //pkRenderer->EnableUserClipPlane(0,kPlane);

        // This temporarily modifies the world matrix to apply the reflection
        // after the model-to-world transformation.
        camera.setPreViewMatrix(reflection);

        // Reverse the cull direction.  Allow for models that are not
        // necessarily set up with front or back face culling.
        renderer.reverseCullOrder = true;

        // Render the reflected object.  Only render where the stencil buffer
        // contains the reference value.
        for (j = 0; j < numVisible; ++j) {
            renderer.drawVisible(visibleSet.getVisible(j));
        }

        renderer.reverseCullOrder = false;

        camera.setPreViewMatrix(L5.Matrix.IDENTITY);
        // TODO:  Add clip plane support to the renderer.
        //pkRenderer->DisableUserClipPlane(0);

        // We are about to render the reflecting plane again.  Reset to the
        // global state for the reflecting plane.  We want to blend the
        // reflecting plane with what is already in the color buffer,
        // particularly either the image of the reflected caster or the
        // reflecting plane.  All we want for the reflecting plane at this
        // stage is to force the alpha channel to always be the reflectance
        // value for the reflecting plane.  Render the reflecting plane
        // wherever the stencil buffer is set to the reference value.  This
        // time clear the stencil buffer reference value where it is set.
        // Perform the normal depth buffer testing and writes.  Allow the
        // color buffer to be written to, but this time blend the reflecting
        // plane with the values in the color buffer based on the reflectance
        // value.  Note that where the stencil buffer is set, the color buffer
        // has either color values from the reflecting plane or the reflected
        // object.  Blending will use src=1-alpha (reflecting plane) and
        // dest=alpha background (reflecting plane or reflected object).
        const oldAlphaState = renderer.overrideAlphaState;
        renderer.overrideAlphaState = alphaState;
        alphaState.blendEnabled = true;
        alphaState.srcBlend = L5.AlphaState.BM_ONE_MINUS_CONSTANT_ALPHA;
        alphaState.dstBlend = L5.AlphaState.BM_CONSTANT_ALPHA;
        alphaState.constantColor.set([0, 0, 0, this.reflectances[i]]);

        stencilState.compare = L5.StencilState.COMPARE_MODE_EQUAL;
        stencilState.reference = i + 1;
        stencilState.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
        stencilState.onZPass = L5.StencilState.OPERAETION_TYPE_INVERT;

        renderer.drawVisible(this.planes[i]);
        renderer.overrideAlphaState = oldAlphaState;
    }

    // 恢复全局状态
    renderer.overrideStencilState = oldStencilState;
    renderer.overrideDepthState = oldDepthState;

    // 正常渲染物体
    for (j = 0; j < numVisible; ++j) {
        renderer.drawVisible(visibleSet.getVisible(j));
    }
};

/**
 *
 * @param i {int}
 * @param reflection {L5.Matrix} output
 * @param modelPlane {L5.Plane} output
 *
 */
L5.PlanarReflectionEffect.prototype.getReflectionMatrixAndModelPlane = function (i, reflection, modelPlane) {
    // Compute the equation for the mirror plane in world coordinates.
    var vertex = new Array(3);
    this.planes[i].getWorldTriangle(0, vertex);
    var worldPlane = L5.Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);

    // Compute the reflection matrix.
    reflection.makeReflection(vertex[0], worldPlane.normal);

    this.planes[i].getModelTriangle(0, vertex);
    worldPlane = L5.Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);
    modelPlane.copy(worldPlane);
};


/**
 * 设置镜像平面
 * @param i {int} 索引
 * @param plane {L5.TriMesh}
 */
L5.PlanarReflectionEffect.prototype.setPlane = function (i, plane) {
    plane.culling = L5.Spatial.CULLING_ALWAYS;
    this.planes[i] = plane;
};

/**
 * 获取镜像平面
 * @param i {int} 索引
 * @returns {L5.TriMesh}
 */
L5.PlanarReflectionEffect.prototype.getPlane = function (i) {
    return this.planes[i];
};

/**
 * 设置镜像反射系数
 * @param i {int} 索引
 * @param reflectance {float} 反射系数
 */
L5.PlanarReflectionEffect.prototype.setReflectance = function (i, reflectance) {
    this.reflectances[i] = reflectance;
};

/**
 * 获取镜像反射系数
 * @param i {int} 索引
 * @returns {float}
 */
L5.PlanarReflectionEffect.prototype.getReflectance = function (i) {
    return this.reflectances[i];
};