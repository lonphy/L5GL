/**
 * 全局特效 - 平面投影
 *
 * @type {PlanarShadowEffect}
 * @extends {D3Object}
 *
 * @author lonphy
 * @version 2.0
 */
import {D3Object} from '../../core/D3Object'
import {AlphaState} from '../shaders/AlphaState'
import {DepthState} from '../shaders/DepthState'
import {StencilState} from '../shaders/StencilState'


export class PlanarShadowEffect extends D3Object {

    /**
     * @param numPlanes {int} 投影的平面数量
     * @param shadowCaster {Node} 需要投影的物体
     */
    constructor(numPlanes, shadowCaster) {
        super();
        this.numPlanes = numPlanes;
        this.planes = new Array(numPlanes);
        this.projectors = new Array(numPlanes);
        this.shadowColors = new Array(numPlanes);

        this.alphaState = new AlphaState();
        this.depthState = new DepthState();
        this.stencilState = new StencilState();

        this.shadowCaster = shadowCaster;

        this.material = new Material();
        this.materialEffect = new MaterialEffect();
        this.materialEffectInstance = this.materialEffect.createInstance(this.material);
    }

    /**
     * @param renderer {Renderer}
     * @param visibleSet {VisibleSet}
     */
    draw(renderer, visibleSet) {
        // 正常绘制可见物体
        const numVisible = visibleSet.getNumVisible();
        const numPlanes = this.numPlanes;
        let i, j;
        //for (j = 0; j < numVisible; ++j) {
        //    renderer.drawVisible(visibleSet.getVisible(j));
        //}

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
        for (i = 0; i < numPlanes; ++i) {
            // 开启深度测试
            depthState.enabled = true;
            depthState.writable = true;
            depthState.compare = DepthState.COMPARE_MODE_LEQUAL;

            // 开启模板测试, 这样,投影平面可以裁剪阴影
            stencilState.enabled = true;
            stencilState.compare = StencilState.ALWAYS;
            stencilState.reference = i + 1;
            stencilState.onFail = StencilState.OP_KEEP;      // irrelevant
            stencilState.onZFail = StencilState.OP_KEEP;     // invisible to 0
            stencilState.onZPass = StencilState.OP_REPLACE;  // visible to i+1

            // 绘制平面
            renderer.drawVisible(this.planes[i]);

            // 在投影平面上混合阴影颜色 The blending equation is
            //   (rf,gf,bf) = as*(rs,gs,bs) + (1-as)*(rd,gd,bd)
            // where (rf,gf,bf) is the final color to be written to the frame
            // buffer, (rs,gs,bs,as) is the shadow color, and (rd,gd,bd) is the
            // current color of the frame buffer.
            var saveAlphaState = renderer.overrideAlphaState;
            renderer.overrideAlphaState = alphaState;
            alphaState.blendEnabled = true;
            alphaState.srcBlend = AlphaState.BM_SRC_ALPHA;
            //alphaState.dstBlend = AlphaState.BM_ONE_MINUS_SRC_ALPHA;
            alphaState.dstBlend = AlphaState.BM_SRC_ALPHA; // 效果还可以

            this.material.diffuse.set(this.shadowColors[i]);

            // 禁用深度缓冲 so that no depth-buffer fighting
            // occurs.  The drawing of pixels is controlled solely by the stencil
            // value.
            depthState.enabled = false;

            // Only draw where the plane has been drawn.
            stencilState.enabled = true;
            stencilState.compare = StencilState.EQUAL;
            stencilState.reference = i + 1;
            stencilState.onFail = StencilState.OP_KEEP;   // invisible kept 0
            stencilState.onZFail = StencilState.OP_KEEP;  // irrelevant
            stencilState.onZPass = StencilState.OP_ZERO;  // visible set to 0

            // 计算光源的投影矩阵
            var projection = Matrix.ZERO;
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

            camera.setPreViewMatrix(Matrix.IDENTITY);

            renderer.overrideAlphaState = saveAlphaState;
        }

        // 恢复全局状态
        renderer.overrideStencilState = saveSState;
        renderer.overrideDepthState = saveDState;
    }

    /**
     * 获取投影矩阵
     * @param i {int}
     * @param projection {Matrix}
     */
    getProjectionMatrix(i, projection) {
        // 计算世界坐标系的投影平面
        var vertex = new Array(3);
        this.planes[i].getWorldTriangle(0, vertex);
        var worldPlane = Plane.fromPoint3(vertex[0], vertex[1], vertex[2]);

        // 计算需要计算阴影的物体在投影平面的哪一边
        if (this.shadowCaster.worldBound.whichSide(worldPlane) < 0) {
            // 物体在投影平面的背面, 不能生成阴影
            return false;
        }

        // 计算光源的投影矩阵
        var projector = this.projectors[i];
        var normal = worldPlane.normal;
        if (projector.type === Light.LT_DIRECTIONAL) {
            var NdD = normal.dot(projector.direction);
            if (NdD >= 0) {
                // 投影必须在投影平面的正面
                return false;
            }

            // 生成斜投影
            projection.makeObliqueProjection(vertex[0], normal, projector.direction);
        }

        else if (projector.type === Light.LT_POINT || projector.type === Light.LT_SPOT) {
            var NdE = projector.position.dot(normal);
            if (NdE <= 0) {
                // 投影必须在投影平面的正面
                return false;
            }
            // 生成透视投影
            projection.makePerspectiveProjection(vertex[0], normal, projector.position);
        }
        else {
            console.assert(false, 'Light type not supported.');
            return false;
        }

        return true;
    }

    /**
     * 设置阴影的投影平面
     *
     * 设置原来的投影平面为不可见, 由该特效实例负责渲染
     *
     * @param i {int}
     * @param plane {TriMesh}
     */
    setPlane(i, plane) {
        plane.culling = Spatial.CULLING_ALWAYS;
        this.planes[i] = plane;
    }

    /**
     * 获取阴影的投影平面
     * @param i {int}
     * @returns {TriMesh}
     */
    getPlane(i) {
        return this.planes[i];
    }

    /**
     * 设置阴影的光源
     * @param i {int}
     * @param projector {Light}
     */
    setProjector(i, projector) {
        this.projectors[i] = projector;
    }

    /**
     * 获取阴影的光源
     * @param i {int}
     * @returns {Light}
     */
    getProjector(i) {
        return this.projectors[i];
    }

    /**
     * 设置阴影颜色
     * @param i {int}
     * @param shadowColor {Float32Array}
     */
    setShadowColor(i, shadowColor) {
        if (!this.shadowColors[i]) {
            this.shadowColors[i] = new Float32Array(shadowColor, 0, 4);
        }
        else {
            this.shadowColors[i].set(shadowColor, 0);
        }
    }

    /**
     * 获取阴影的颜色
     * @param i {int} 索引
     * @returns {Float32Array}
     */
    getShadowColor(i) {
        return new Float32Array(this.shadowColors[i]);
    }
}
