'use strict';

class RandomController extends L5.PointController {
    updatePointMotion() {
        let points = this.object;

        let vba = L5.VertexBufferAccessor.fromVisual(points);
        const numPoints = vba.numVertices;
        const random = L5._Math.unitRandom;
        const irandom = L5._Math.intervalRandom;
        const fn = 0.01;
        let pos, i, sz;
        for (i = 0; i < numPoints; ++i) {
            pos = vba.getPosition(i);
            pos[0] += fn * random();
            if (pos[0] >1) pos[0] = -1;
            else if (pos[0] <-1) pos[0] = 1;
            pos[1] += fn * random();
            if (pos[1] >1) pos[1] = -1;
            else if (pos[1] <-1) pos[1] = 1;
            pos[2] += fn * random();
            if (pos[2] >1) pos[2] = -1;
            else if (pos[2] <-1) pos[2] = 1;

            if (pos[1] > 0.8) {
                vba.setColor(0, i, [1,0,0]);
            } else if (pos[1] > 0.4) {
                vba.setColor(0, i, [0, 1, 0]);
            } else if (pos[1] > 0) {
                vba.setColor(0, i, [0, 0, 1]);

            } else if (pos[1] > -0.4) {
                vba.setColor(0, i, [1, 0, 1]);
            } else if (pos[1] > -0.8) {
                vba.setColor(0, i, [0, 1, 1]);
            } else {
                vba.setColor(0, i, [1, 1, 0]);
            }
            vba.setPosition(i, pos);

            sz = vba.getPointSize(i);
            sz += irandom(-1, 1);
            if (sz < 0.1) {
                sz = 0.1;
            } else if ( sz > 2) {
                sz = 5;
            }
            vba.setPointSize(i, sz);
        }

        L5.Renderer.updateAll(points.vertexBuffer);
    }
}

class PointSystem extends L5.Application3D{
    constructor() {
        super('PointSystem',  640, 480, [0, 0, 0, 1], 'ctx');

        this.textColor = "#fff";
        this.updateTime = 0;
        this.sceneCuller = null;
        this.scene = null;
        this.floor = null;
        this.wall = null;
        this.psEffect = null;
        this.prEffect = null;

        this.points = null;

        this.pointsAngle = 0;
    }

    onInitialize () {
        if (!super.onInitialize()) {
            return false;
        }

        // Set up the camera.
        this.camera.setPerspective(60.0, this.getAspectRatio(), 0.1, 1000);
        this.camera.lookAt(L5.Point.ORIGIN, L5.Point.ORIGIN, L5.Vector.UNIT_Y);
        let pos = new L5.Point(0, 0, -3);
        this.camera.setPosition(pos);

        // 禁用背面剔除
        this.renderer.overrideCullState = new L5.CullState;
        this.renderer.overrideCullState.enabled = false;

        this.createScene();

        // Initial update of objects.
        this.scene.update();

        // Initial culling of scene,
        this.scene.culling = L5.Spatial.CULLING_NEVER;
        this.sceneCuller = new L5.Culler(this.camera);
        this.sceneCuller.computeVisibleSet(this.scene);
        //

        this.initializeCameraMotion(0.01, 0.05);
        this.initializeObjectMotion(this.scene);
        return true;
    };

    onIdle () {
        this.measureTime();
        this.pointsAngle += 0.5;
        this.points.localTransform.setRotate(L5.Matrix.makeRotateY(L5._Math.PI/180 * this.pointsAngle));
        this.moveCamera();
        this.moveObject();
        this.scene.update(this.applicationTime);
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

    createScene () {
        this.scene = new L5.Node();

        const format = L5.VertexFormat.create(3,
            L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_COLOR, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_PSIZE, L5.VertexFormat.AT_FLOAT1, 0);

        const stride = format.stride;
        const random = L5._Math.symmetricRandom;
        const uRandom = L5._Math.unitRandom;
        const intervalRandom = L5._Math.intervalRandom;

        let vbo = new L5.VertexBuffer(2048, stride, L5.Buffer.BU_DYNAMIC);
        let vba = new L5.VertexBufferAccessor(format, vbo);
        let i, l = vba.numVertices;

        for (i = 0; i < l; ++i) {
            vba.setPosition(i, [random(), random(), random()]);
            vba.setColor(0, i, [uRandom(), uRandom(), uRandom()]);
            vba.setPointSize(i, intervalRandom(0.1, 5));
        }

        let points = new L5.PolyPoint(format, vbo);
        points.attachController(new RandomController());
        points.effect = L5.VertexColor3Effect.createUniqueInstance();
        points.culling = L5.Spatial.CULLING_NEVER;
        this.points = points;

        this.scene.attachChild(points);
    }
}

L5.runApplication(PointSystem);