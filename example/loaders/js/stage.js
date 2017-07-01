'use strict';

class StateLoader extends L5.Application3D {

    constructor() {
        super('StateLoader', 640, 480, [1, 1, 1, 1], 'ctx');

        /**
         * @type {L5.Node}
         */
        this.scene = null;

        /**
         * @type {L5.Culler}
         */
        this.culler = null;

        // Override of shader cull and wireframe state.
        /**
         * @type {L5.CullState}
         */
        this.cullState = null;

        /**
         * @type {L5.TriMesh}
         */
        this.ground = null;

        // billboard0 (rectangle attached)
        /**
         * @type {L5.BillboardNode}
         */
        this.billboard0 = null;
        /**
         * @type {L5.TriMesh}
         */
        this.rectangle = null;

        /**
         * @type {L5.TriMesh}
         */
        this.torus = null;

        this.textColor = '#666';
    }

    onInitialize() {
        super.onInitialize();

        // setup the camera.
        this.camera.setPerspective(45.0, this.getAspectRatio(), 0.1, 2000);
        this.camera.lookAt(L5.Point.ORIGIN, L5.Point.ORIGIN, L5.Vector.UNIT_Y);
        this.camera.setPosition(new L5.Point(0, 10, -50));

        this.createScene().then(()=> {
            this.scene.update();

            this.culler = new L5.Culler(this.camera);
            this.culler.enable = false;
            this.culler.computeVisibleSet(this.scene);

            // 移动速度1, 旋转速度0.01
            this.initializeCameraMotion(0.5, 0.01);


            this.initializeObjectMotion(this.scene);
        });
        return true;
    }


    createScene() {
        this.scene = new L5.Node();
        this.cullState = new L5.CullState();
        this.cullState.enabled = false;
        this.renderer.overrideCullState.enabled = false;
        this.scene.culling = L5.Spatial.CULLING_NEVER;

        var light = new L5.Light(L5.Light.LT_DIRECTIONAL);
        light.diffuse.set([1,1,1,1]);
        light.setDirection(L5.Vector.UNIT_Z);

        ++this.loadWait;

        return L5.XhrTask('data/miku_v2.pmd', 'arraybuffer').then(PMDPaser).then(mesh=>{
            console.log(mesh);
            this.ground = mesh;
            this.ground.culling = L5.Spatial.CULLING_NEVER;

            var groundEffect = new L5.LightDirPerFragEffect();
            let m = new L5.Material({diffuse: [0.8, 0.8, 0.8]});

            this.ground.effect = groundEffect.createInstance(light, m);

            this.scene.attachChild(this.ground);

            --this.loadWait;
            return Promise.resolve(true);
        });
    }

    onIdle() {
        this.measureTime();

        if (this.moveCamera()) {
            this.scene.update();
            this.culler.computeVisibleSet(this.scene);
        }
        if (this.moveObject()) {
            this.scene.update();
            this.culler.computeVisibleSet(this.scene);
        }

        // Draw the scene.
        if (this.renderer.preDraw()) {
            this.renderer.clearBuffers();
            this.renderer.drawVisibleSet(this.culler.visibleSet);

            this.drawFrameRate();

            this.renderer.postDraw();
            this.renderer.displayColorBuffer();
        }
        this.updateFrameCount();
    }
}
L5.runApplication(StateLoader);
