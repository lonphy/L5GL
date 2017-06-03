'use strict';

class MoveController extends L5.TransformController {

    /**
     * @param transform {L5.Transform}
     */
    constructor(transform) {
        super(transform);
        this.angle = 0;
    }

    update(applicationTime) {
        this.angle += 1;
        let angle = this.angle * Math.PI / 180;

        this.object.localTransform
            .setRotate(L5.Matrix.makeRotateX(angle))
            .setTranslate(new L5.Point(Math.sin(angle) * 3, 2, Math.cos(angle) * 3));

        return super.update(applicationTime);
    }
}


class ReflectionsAndShadows extends L5.Application3D {
    constructor() {
        super('ReflectionsAndShadows', 600, 600, [0.1, 0.2, 0.3, 1], 'ctx');

        this.textColor = "#fff";
        this.updateTime = 0;


        this.scene = null;
        this.shadowGroup = null; // 阴影组
        this.floor = null;

        this.wall = null;
        this.shadowEffect = null;
        this.reflectEffect = null;


        this.shadowGroupCuller = null;
    }

    onInitialize() {
        if (!super.onInitialize()) {
            return false;
        }

        // Set up the camera.
        this.camera.setPerspective(60.0, this.getAspectRatio(), 0.1, 5000);
        this.camera.lookAt(L5.Point.ORIGIN, L5.Point.ORIGIN, L5.Vector.UNIT_Y);
        this.camera.setPosition([0, 5, -20]);

        this.effect = new L5.Texture2DEffect(L5.Shader.SF_LINEAR_LINEAR, L5.Shader.SC_REPEAT, L5.Shader.SC_REPEAT);

        // 禁用背面剔除
        this.renderer.overrideCullState.enabled = false;

        this.createScene();

        this.scene.update();

        // 由于场景内的物体都属于特效组, 顾无需进行场景裁剪
        // this.sceneCuller = new L5.Culler(this.camera);
        // this.sceneCuller.computeVisibleSet(this.scene);

        this.shadowGroupCuller = new L5.Culler(this.camera);
        this.shadowGroupCuller.computeVisibleSet(this.shadowGroup);

        this.initializeCameraMotion(0.1, 0.05);
        this.initializeObjectMotion(this.scene);
        return true;
    }

    onIdle() {
        this.measureTime();
        this.scene.update(this.applicationTime);

        if (this.moveCamera()) {
            // this.sceneCuller.computeVisibleSet(this.scene);
            this.shadowGroupCuller.computeVisibleSet(this.shadowGroup);
        }
        if (this.moveObject()) {
            // this.sceneCuller.computeVisibleSet(this.scene);
            this.shadowGroupCuller.computeVisibleSet(this.shadowGroup);
        }
        this.camera.debug();

        // Draw the scene.
        if (this.renderer.preDraw()) {
            this.renderer.clearBuffers();
            // this.renderer.drawVisibleSet(this.sceneCuller.visibleSet);

            this.renderer.drawVisibleSet(this.shadowGroupCuller.visibleSet, this.reflectEffect);

            this.renderer.drawVisibleSet(this.shadowGroupCuller.visibleSet, this.shadowEffect);

            this.drawFrameRate();
            this.renderer.postDraw();
        }
        this.updateFrameCount();
    }

    createScene() {
        this.scene = new L5.Node();
        this.scene.name = '场景';
        // this.scene.culling = L5.Spatial.CULLING_NEVER;

        this.shadowGroup = new L5.Node();
        this.shadowGroup.name = '阴影组';
        this.shadowGroup.culling = L5.Spatial.CULLING_NEVER;

        this.scene.attachChild(this.shadowGroup);

        // 创建场景光源
        let l = new L5.Light(L5.Light.LT_POINT);
        l.ambient.set([0.2, 0.2, 0.2]);
        l.diffuse.set([0.5, 0.5, 0.5]);
        l.specular.set([0.8, 0.8, 0.8]);
        l.setPosition(new L5.Point(0, 10, 0));
        this.light = l;

        let effectCst = new L5.LightPointPerFragEffect();

        this.createCube(effectCst);
        this.createFloor(effectCst);
        this.createWall(effectCst);
        this.createPlanarShadow();
        this.createPlanarReflection();
    }

    /**
     * 创建地板
     */
    createFloor(cst) {
        const format = L5.VertexFormat.create(2,
            L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_NORMAL, L5.VertexFormat.AT_FLOAT3, 0);

        let stdMesh = new L5.StandardMesh(format);

        this.floor = stdMesh.rectangle(32, 32, 16, 16);
        this.floor.localTransform.setRotate(L5.Matrix.makeRotateX(-Math.PI / 2));
        this.floor.name = 'floor';
        //this.floor.wire = true;

        this.floor.effect = cst.createInstance(this.light, new L5.Material({
            ambient:  [0.2, 0.2, 0.2],
            diffuse:  [0.82, 0.7, 0.54],
            specular: [1, 1, 1],
            exponent: 1
        }));
        this.scene.attachChild(this.floor);
    }

    /**
     * 创建物体
     */
    createCube(cst) {
        let format = L5.VertexFormat.create(2,
            L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_NORMAL, L5.VertexFormat.AT_FLOAT3, 0);

        let stdMesh = new L5.StandardMesh(format);
        let cube = stdMesh.torus(32, 32, 1, 0.4); // 圆环
        // let cube = stdMesh.sphere(3, 4, 1); // 四面体
        cube.name = 'torus';
        cube.culling = L5.Spatial.CULLING_NEVER;

        let m = new L5.Material({
            ambient:  [0.2, 0.2, 0.3],
            diffuse:  [0.2, 0.2, 0.7],
            specular: [0.8, 0.8, 0.8]
        });
        // m.emissive.set([0.1, 0.3, 0.5, 1]);

        cube.effect = cst.createInstance(this.light, m);
        cube.attachController(new MoveController(cube.localTransform));     // 添加运动控制器

        this.shadowGroup.attachChild(cube);
    }

    /**
     * 创建镜面
     */
    createWall(cst) {
        const format = L5.VertexFormat.create(2,
            L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_NORMAL, L5.VertexFormat.AT_FLOAT3, 0);

        // Create the wall mesh.
        const stdMesh = new L5.StandardMesh(format);

        this.wall = stdMesh.rectangle(16, 16, 8, 6);
        this.wall.name = 'wall';
        this.wall.culling = L5.Spatial.CULLING_NEVER;

        let r1 = L5.Matrix.makeRotateY(-Math.PI);
        this.wall.localTransform.setRotate(r1);
        this.wall.localTransform.setTranslate(new L5.Point(0, 6, 6));

        let m = new L5.Material({
            ambient:  [0.2, 0.2, 0.2],
            diffuse:  [0.7, 0.8, 1],
            specular: [0.7, 0.7, 0.7],
            exponent: 8
        });

        this.wall.effect = cst.createInstance(this.light, m);
        this.shadowGroup.attachChild(this.wall);
    }

    // 阴影
    createPlanarShadow() {
        let ln = new L5.LightNode(this.light);
        ln.culling = L5.Spatial.CULLING_NEVER;
        this.scene.attachChild(ln);

        this.shadowEffect = new L5.PlanarShadowEffect(1, this.shadowGroup);
        this.shadowEffect.setPlane(0, this.floor);
        this.shadowEffect.setProjector(0, this.light);
        this.shadowEffect.setShadowColor(0, new Float32Array([0, 0, 0, 0.4]));
    }

    // 创建平面反射
    createPlanarReflection() {
        let projector = new L5.Light(L5.Light.LT_DIRECTIONAL);
        projector.setDirection(L5.Vector.UNIT_Z.negative());
        let projectorNode = new L5.LightNode(projector);
        this.scene.attachChild(projectorNode);

        this.reflectEffect = new L5.PlanarReflectionEffect(1);
        this.reflectEffect.setPlane(0, this.wall);
        this.reflectEffect.setReflectance(0, 0.6);
    }
}

L5.runApplication(ReflectionsAndShadows);

