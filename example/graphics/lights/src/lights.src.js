import {
    PointController,
    Application3D,

    Renderer, CullState,
    Point, Vector, Matrix,

    Culler, Spatial, Node, Light, Material, StandardMesh, PolyPoint,

    LightPointPerFragEffect, VertexColor3Effect,

    VertexFormat, VertexBuffer, Buffer, VertexBufferAccessor,

    runApplication
} from '../../../../src/L5'

class PointLightController extends PointController {
    constructor() {
        super();
        this.angle = 0;
        this.position = new Point(0, 10, 20);
    }

    updatePointMotion() {
        let vba = VertexBufferAccessor.fromVisual(this.object);
        let pos = vba.getPosition(0);

        this.angle++;
        let angle = this.angle * Math.PI / 180;

        let s = Math.sin(angle) * 15;
        let c = Math.cos(angle) * 20;

        pos.set([s, 10, c]);
        this.position.copy(pos);
        vba.setPosition(0, pos);

        Renderer.updateAll(this.object.vertexBuffer);
        this.angle %= 360;
    }

    getPosition() {
        return this.position;
    }
}

/**
 * @extends {Application3D}
 */
class Lights extends Application3D {

    constructor() {
        let canvas = document.querySelector('#ctx');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        super('Lights', w, h, [0, 0, 0, 1], 'ctx');

        this.textColor = "#fff";
        this.sceneCuller = null;
        this.scene = null;

        this.lights = [];

        this.effects = {
            left: [],
            right: [],
            plane: []
        };
        this.ptc = null;
    }

    onInitialize() {
        if (!super.onInitialize()) {
            return false;
        }

        // Set up the camera.
        this.camera.setPerspective(60.0, this.getAspectRatio(), 0.1, 100);

        this.camera.lookAt(Point.ORIGIN, Point.ORIGIN, Vector.UNIT_Y);
        let pos = new Point(0, 5, -30);
        this.camera.setPosition(pos);

        this.createScene();

        let domCullStateEnable = document.createElement('div');
        domCullStateEnable.innerHTML = '<label><input type="checkbox">Enable Cull Face</label>';
        domCullStateEnable.setAttribute('style', 'position:absolute;top:30px; left:8px;color:#fff;user-select:none');
        domCullStateEnable.querySelector('input').addEventListener('change', evt => {
            this.renderer.overrideCullState.enabled = evt.target.checked;
        }, false)
        document.body.appendChild(domCullStateEnable);

        this.renderer.overrideCullState = new CullState();
        this.renderer.overrideCullState.enabled = false;

        // Initial update of objects.
        this.scene.update();
        this.scene.culling = Spatial.CULLING_NEVER;

        // Initial culling of scene,
        this.sceneCuller = new Culler(this.camera);
        this.sceneCuller.computeVisibleSet(this.scene);

        this.initializeCameraMotion(0.1, 0.05);
        this.initializeObjectMotion(this.scene);
        this.initializeObjectMotion(this.points);
        return true;
    }

    onIdle() {
        this.measureTime();

        this.moveCamera();
        this.moveObject();
        this.scene.update(this.applicationTime);
        let pos = this.ptc.getPosition();
        this.lights[1].setPosition(pos);
        this.sceneCuller.computeVisibleSet(this.scene);
        // Draw the scene.
        if (this.renderer.preDraw()) {
            this.renderer.clearBuffers();
            this.renderer.drawVisibleSet(this.sceneCuller.visibleSet);
            this.drawFrameRate();
            this.renderer.postDraw();
        }
        this.updateFrameCount();
    }

    createLights() {
        let l;

        // 平行光
        // l = new Light(Light.LT_DIRECTIONAL);
        // l.ambient.set([0.2, 0.2, 0.2, 1]);
        // l.diffuse.set([1, 1, 1, 1]);
        // l.specular.set([1, 1, 1, 1]);
        // l.setDirection(new Vector(-1, 1, -1));
        // this.lights[0] = l;

        // 点光源
        l = new Light(Light.LT_POINT);
        l.ambient.set([0.2, 0.2, 0.2, 1]);
        l.diffuse.set([0.8, 0.8, 0.8, 1]);
        l.specular.set([1, 1, 1, 1]);
        l.setPosition(new Point(0, 10, 20));
        this.lights[1] = l;

        // 聚光灯
        // l = new Light(Light.LT_SPOT);
        // l.ambient.set([0.1, 0.1, 0.1, 1]);
        // l.diffuse.set([1, 1, 1, 1]);
        // l.specular.set([1, 1, 1, 1]);
        // l.setPosition(this.pointLightPosition);
        // l.setDirection(new Vector(0, -1, 0));
        // l.setAngle(30 * _Math.PI / 180);    // 45/2度
        // l.exponent = 1;
        // this.lights[2] = l;
    }

    createScene() {
        this.scene = new Node();
        this.createLights();
        this.createLightsController();

        //  地板材质
        let m1 = new Material({
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.4, 0.3, 0.4]
        });

        // 球体材质
        let m2 = new Material({
            emissive: [0, 0.08, 0.05],
            ambient: [0.24725, 0.2245, 0.2645],
            diffuse: [0.2, 0.8, 0.8]
        });
        let m3 = new Material({
            ambient: [0.3, 0.1, 0.1],
            diffuse: [0.8, 0.3, 0.4],
            specular: [0.9, 0.6, 0.7],
            exponent: 100
        });

        // Create the effects.
        // let effectDV = new LightDirPerVerEffect();               // 平行光, 顶点光照
        // let effectDF = new LightDirPerFragEffect();              // 平行光, 片元光照
        // let effectPV = new LightPointPerVertexEffect();          // 点光源, 顶点光照
        let effectPF = new LightPointPerFragEffect();        // 点光源, 片元光照
        // let effectSV = new LightSpotPerVertexEffect();           // 聚光灯, 顶点光照
        // let effectSF = new LightSpotPerFragEffect();         // 聚光灯, 片段光照

        // 左边球体 三种光特效
        // this.effects.left[0] = effectDV.createInstance(this.lights[0], m2);
        // this.effects.left[1] = effectPV.createInstance(this.lights[1], m2);
        // this.effects.left[2] = effectSV.createInstance(this.lights[2], m2);

        // 右边球体 三种光特效
        // this.effects.right[0] = effectDV.createInstance(this.lights[0], m2);
        this.effects.right[1] = effectPF.createInstance(this.lights[1], m2);
        this.effects.right[2] = effectPF.createInstance(this.lights[1], m3);

        // 地板 三种光特效
        // this.effects.plane[0] = effectDF.createInstance(this.lights[0], m1);
        this.effects.plane[1] = effectPF.createInstance(this.lights[1], m1);
        // this.effects.plane[2] = effectSF.createInstance(this.lights[2], m1);

        let format = VertexFormat.create(2,
            VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
            VertexFormat.AU_NORMAL, VertexFormat.AT_FLOAT3, 0);

        let std = new StandardMesh(format);

        this.plane0 = std.rectangle(2, 2, 16, 8);
        this.plane0.effect = this.effects.plane[1];
        this.scene.attachChild(this.plane0);

        this.sphere0 = std.sphere(48, 48, 4);
        this.sphere0.localTransform.setTranslate(new Point(-8, 4, 0));
        this.sphere0.effect = this.effects.right[1];
        this.scene.attachChild(this.sphere0);

        this.sphere1 = std.torus(48, 32, 3, 1);
        this.sphere1.localTransform.setTranslate(new Point(6, 4, 0));
        this.sphere1.effect = this.effects.right[2];
        this.sphere1.culling = Spatial.CULLING_NEVER;
        this.scene.attachChild(this.sphere1);
    }

    // create point light's point and controller
    createLightsController() {
        let format = VertexFormat.create(3,
            VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
            VertexFormat.AU_COLOR, VertexFormat.AT_FLOAT3, 0,
            VertexFormat.AU_PSIZE, VertexFormat.AT_FLOAT1, 0);

        const stride = format.stride;
        const usage = format.usage;

        let vbo = new VertexBuffer(1, stride, Buffer.BU_DYNAMIC);
        let vba = new VertexBufferAccessor(format, vbo);
        vba.setPosition(0, this.lights[1].position);
        vba.setColor(0, 0, this.lights[1].diffuse);
        vba.setPointSize(0, 3);

        this.points = new PolyPoint(format, vbo);
        this.ptc = new PointLightController();
        this.points.attachController(this.ptc);
        this.points.effect = VertexColor3Effect.createUniqueInstance();
        this.points.culling = Spatial.CULLING_NEVER;
        this.scene.attachChild(this.points);
    }
}

window.onload = () => runApplication(Lights);
