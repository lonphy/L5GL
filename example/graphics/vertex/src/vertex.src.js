import {
    PointController,
    Application3D,

    Renderer,
    Point, Vector, Matrix,VertexColor3Effect,LightPointPerFragEffect,

    Culler, Spatial, Node, Light, Material, StandardMesh, PolyPoint,

    VertexFormat, VertexBuffer, Buffer, VertexBufferAccessor,

    runApplication
} from '../../../../dist/l5gl.module'

import { VSShaderEffect } from './vsShaderEffect'
import { FRShaderEffect } from './frShaderEffect'

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

        this.lights = null;

        this.effects = {
            plane: null
        };
        this.ptc = null;
    }

    onInitialize() {
        if (!super.onInitialize()) {
            return false;
        }

        // Set up the camera.
        this.camera.setPerspective(45.0, this.getAspectRatio(), 0.001, 100);

        this.camera.lookAt(Point.ORIGIN, Point.ORIGIN, Vector.UNIT_Y);
        let pos = new Point(0, 5, -30);
        this.camera.setPosition(pos);

        this.createScene();

        // Initial update of objects.
        this.scene.update();
        this.scene.culling = Spatial.CULLING_NEVER;

        // Initial culling of scene,
        this.sceneCuller = new Culler(this.camera);
        this.sceneCuller.computeVisibleSet(this.scene);

        this.initializeCameraMotion(1, 0.05);
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
        this.lights.setPosition(pos);
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
        this.lights = new Light(Light.LT_POINT);
        this.lights.ambient.set([0.2, 0.2, 0.2, 1]);
        this.lights.diffuse.set([0.8, 0.8, 0.5, 1]);
        this.lights.specular.set([1, 1, 1, 1]);
        this.lights.setPosition(new Point(0, 10, 20));
    }

    createScene() {
        this.scene = new Node();
        this.createLights();
        this.createLightsController();

        //  地板材质
        let m1 = new Material();
        m1.emissive.set([0, 0, 0, 1]);
        m1.ambient.set([0.3, 0.1, 0.3, 1]);
        m1.diffuse.set([0.7, 0, 0.07, 1]);
        m1.specular.set([0.8, 0.8, 0.8, 8]);

        // 地板 三种光特效
        let effect0 = (new FRShaderEffect()).createInstance(this.lights, m1);

        let effect1 = (new LightPointPerFragEffect).createInstance(this.lights, m1);

        let format = VertexFormat.create(2,
            VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
            VertexFormat.AU_NORMAL, VertexFormat.AT_FLOAT3, 0);

        let std = new StandardMesh(format);

        this.plane0 = std.rectangle(64, 64, 16, 16);
        this.plane0.effect = effect0;

        this.scene.attachChild(this.plane0);
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
        vba.setPosition(0, this.lights.position);
        vba.setColor(0, 0, this.lights.diffuse);
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
