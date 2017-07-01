import {
	Application3D, runApplication,
	Point, Vector, Matrix,
	Texture2DEffect,
	Shader, VertexFormat, Texture2D, CullState,
	Culler, Node, Spatial, StandardMesh,
	XhrTask,
	TransformController,
	Transform
} from '../../../../src/L5';

class MyTransCtrl extends TransformController {
	constructor() {
		super(Transform.IDENTITY);
		this.rotateX = 0;
	}
	update(t) {
		this.rotateX+=10;
		this.rotateX %= 360;
		this.localTransform.setRotate(Matrix.makeRotateX(this.rotateX*Math.PI/180));
		super.update(t);
	}
}


class Texture2DTest extends Application3D {
	constructor() {
		super('Texture2DTest', 640, 480, [0.75, 0.75, 0.75, 1], 'ctx');
		this.textColor = "#fff";
		this.sceneCuller = null;
		this.scene = null;
		this.ground = null;
		this.count = 0;
	}

	onresize() { }

	onInitialize() {
		if (!super.onInitialize()) {
			return false;
		}

		// 设置相机
		this.camera.setPerspective(45.0, this.getAspectRatio(), 0.1, 2000);
		this.camera.lookAt(Point.ORIGIN, Point.ORIGIN, Vector.UNIT_Y);
		this.camera.setPosition(new Point(0, 2, -8));


		// 禁用背面剔除
		this.renderer.overrideCullState = new CullState();
		this.renderer.overrideCullState.enabled = false;

		this.createScene();

		// Initial update of objects.
		this.scene.update();

		// Initial culling of scene,
		this.sceneCuller = new Culler(this.camera);
		this.sceneCuller.computeVisibleSet(this.scene);


		this.initializeCameraMotion(0.1, 0.05);
		this.initializeObjectMotion(this.scene);
		return true;
	}


	onIdle() {
		this.measureTime();
		this.scene.update(this.applicationTime);

		if (this.moveCamera()) {
			this.sceneCuller.computeVisibleSet(this.scene);
		}
		if (this.moveObject()) {
			this.sceneCuller.computeVisibleSet(this.scene);
		}

		if (this.renderer.preDraw()) {
			this.renderer.clearBuffers();
			this.renderer.drawVisibleSet(this.sceneCuller.visibleSet);
			this.drawFrameRate();
			this.renderer.postDraw();
		}
		this.updateFrameCount();
	}

	createScene() {
		this.scene = new Node();
		this.scene.culling = Spatial.CULLING_NEVER;
		this.createGround()
	}

	// 创建地板
	createGround() {
		let format = VertexFormat.create(2,
			VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
			VertexFormat.AU_TEXCOORD, VertexFormat.AT_FLOAT2, 0
		);
		let stdMesh = new StandardMesh(format);

		console.log(stdMesh);

		this.ground = stdMesh.rectangle(2, 2, 2, 2);

		const textureFile = '../../wmtf/grass_1024.l5tf';
		const textureFile1 = 'l5kx.l5tf';
		++this.loadWait;
		XhrTask.load(textureFile).then(Texture2D.unpack).then(texture => {
			texture.hasMipmaps = true;
			this.ground.effect = Texture2DEffect.createUniqueInstance(texture);
			--this.loadWait;
		});
		this.ground.attachController(new MyTransCtrl);
		this.scene.attachChild(this.ground);
	}
}

runApplication(Texture2DTest);