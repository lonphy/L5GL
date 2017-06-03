'use strict';

class ObjShow extends L5.Application3D {

    constructor() {
        super('ObjShow', 640, 480, [1, 1, 1, 1], 'ctx');

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
        this.camera.setPosition(new L5.Point(0, 2, -8));

        this.createScene().then(()=> {
            this.scene.update();

            this.culler = new L5.Culler(this.camera);
            this.culler.enable = false;
            this.culler.computeVisibleSet(this.scene);

            // 移动速度1, 旋转速度0.01
            this.initializeCameraMotion(0.1, 0.01);


            this.initializeObjectMotion(this.scene);
        });
        return true;
    }


    createScene() {
        var $this = this;
        this.scene = new L5.Node();
        this.cullState = new L5.CullState();
        this.cullState.enabled = false;
        this.renderer.overrideCullState.enabled = false;
        this.scene.culling = L5.Spatial.CULLING_NEVER;


        // 公共顶点格式
        let fmt = L5.VertexFormat.create(3,
            L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_TEXCOORD, L5.VertexFormat.AT_FLOAT2, 0,
            L5.VertexFormat.AU_NORMAL, L5.VertexFormat.AT_FLOAT3, 0
        );
        fmt.debug();
        ++this.loadWait;

        let q1 = L5.XhrTask('wmof/fish.mesh', 'arraybuffer').then(L5.BinMeshPlugin);
        let q2 = L5.Texture2D.loadFile('stone.l5tf');
        return Promise.all([q1, q2]).then((args)=> {
            let mesh = args[0];
            console.log(mesh);
            this.ground = mesh;
            this.ground.culling = L5.Spatial.CULLING_NEVER;
            let texture = args[1];
            var groundEffect = new L5.Texture2DEffect(L5.Shader.SF_LINEAR);
            $this.ground.effect = groundEffect.createInstance(texture);
            $this.scene.attachChild($this.ground);
            --$this.loadWait;
            return Promise.resolve(true);
        }).catch(console.error);
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
L5.runApplication(ObjShow);
