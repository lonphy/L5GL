import {
	Application3D,
	SkinController,
	Renderer, CullState,
	Point, Vector, Matrix, Quaternion,

	VertexColor4Effect, LightPointPerFragEffect, Texture2DLightDirPerFragEffect, Texture2DEffect,

	Culler, Spatial, Node, Light, Material, StandardMesh, PolyPoint,

	VertexFormat, VertexBuffer, Buffer, VertexBufferAccessor,

	runApplication, TransformController, KeyframeController, Controller,

	Texture2D, XhrTask, Shader, SamplerState
} from '../../../src/L5';

class RotateController extends TransformController {
	constructor(ts) {
		super(ts);
		this.xAngle = 0;
		this.xRadSpeed = 40 / 1000; // unit: rad/s
	}
	update(applicationTime) {
		const delta = applicationTime - this.applicationTime;
		this.xAngle += this.xRadSpeed * delta;
		this.xAngle %= 360;

		this.localTransform.setRotate(Matrix.makeRotateY(this.xAngle * Math.PI / 180));
		return super.update(applicationTime);
	}
}
class RotateZController extends TransformController {
	constructor(ts) {
		super(ts);
		this.xAngle = 0;
		this.modelRotate = Matrix.ZERO.copy(this.localTransform.getRotate());
		this.xRadSpeed = 200 / 1000; // unit: rad/s
	}
	update(applicationTime) {
		const delta = applicationTime - this.applicationTime;
		this.xAngle += this.xRadSpeed * delta;
		this.xAngle %= 360;

		this.localTransform.setRotate(this.modelRotate.mul(Matrix.makeRotateZ(this.xAngle * Math.PI / 180)));
		return super.update(applicationTime);
	}
}


class RunController extends TransformController {
	constructor(ts, startAngle = 0) {
		super(ts);
		this.startAngle = startAngle;
		this.xAngle = startAngle;
		this.factor = 1;
		this.xRadSpeed = 200 / 1000; // unit: rad/s
	}
	update(applicationTime) {
		const delta = applicationTime - this.applicationTime;
		this.xAngle += this.xRadSpeed * delta * this.factor;
		if (this.xAngle > 180) {
			this.factor = -1;
		} else if (this.xAngle < 0) {
			this.factor = 1;
		}
		this.localTransform.setTranslate(new Point(0, Math.sin(this.xAngle * Math.PI / 180), Math.cos(this.xAngle * Math.PI / 180)));
		super.update(applicationTime);
	}
}

class MoveController extends TransformController {
	constructor(ts) {
		super(ts);
		this.dir = -1;
		this.maxX = 30;
		this.minX = -30;
		this.x = 0;
		this.xSpeed = 10 * 1 / 1000; // unit: px/ms
	}
	update(applicationTime) {
		const delta = applicationTime - this.applicationTime;
		if (delta > 100) {
			console.log(delta);
		}
		this.x += this.xSpeed * delta * this.dir;

		if (this.x < this.minX) {
			this.dir = 1;
			this.localTransform.setRotate(Matrix.makeRotateY(Math.PI / 2));
		} else if (this.x > this.maxX) {
			this.dir = -1;
			this.localTransform.setRotate(Matrix.makeRotateY(-Math.PI / 2));
		}
		this.localTransform.setTranslate(new Point(this.x, -3, 0));
		return super.update(applicationTime);
	}
}

class Skin extends Application3D {

	constructor() {
		let canvas = document.querySelector('#ctx');
		let w = canvas.width = window.innerWidth;
		let h = canvas.height = window.innerHeight;
		super('Skin', w, h, [0, 0, 0, 1], 'ctx');

		this.textColor = "#fff";
		this.sceneCuller = null;
		this.scene = null;

		this.lights = null;

		this.std = null;
		this.effect = null;
	}

	onInitialize() {
		if (!super.onInitialize()) {
			return false;
		}

		this.renderer.overrideCullState = new CullState;
		this.renderer.overrideCullState.enable = false;

		// Set up the camera.
		this.camera.setPerspective(30.0, this.getAspectRatio(), 1, 2000);

		this.camera.lookAt(Point.ORIGIN, Point.ORIGIN, Vector.UNIT_Y);
		let pos = new Point(-12, 3, -40);
		this.camera.setPosition(pos);

		this.createScene();

		// Initial update of objects.
		this.scene.update(0);
		this.scene.culling = Spatial.CULLING_NEVER;

		// Initial culling of scene,
		this.sceneCuller = new Culler(this.camera);
		this.sceneCuller.computeVisibleSet(this.scene);

		this.initializeCameraMotion(0.2, 0.01);
		this.initializeObjectMotion(this.scene);
		return true;
	}

	onIdle(deltaTime) {
		this.moveCamera();
		this.moveObject();
		this.scene.update(deltaTime);
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
		this.lights = new Light(Light.LT_DIRECTIONAL);
		this.lights.ambient.set([0.2, 0.2, 0.2, 1]);
		this.lights.diffuse.set([0.8, 0.8, 0.8, 1]);
		this.lights.specular.set([1, 1, 1, 1]);
		this.lights.intensity = 2;
		// this.lights.setPosition(new Point(0, 10, 0));
		this.lights.setDirection(new Vector(0, 1, -1));
	}

	createScene() {
		this.scene = new Node();
		let sampler = new SamplerState;
		sampler.wrapS = SamplerState.REPEAT;
		sampler.wrapT = SamplerState.REPEAT;


		this.effect = new Texture2DLightDirPerFragEffect(sampler);
		this.createLights();

		let format = VertexFormat.create(3,
			VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
			VertexFormat.AU_NORMAL, VertexFormat.AT_FLOAT3, 0,
			VertexFormat.AU_TEXCOORD, VertexFormat.AT_FLOAT2, 0)

		let plane = new Node();
		this.std = new StandardMesh(format, true, false);
		let plane0 = this.std.disk(6, 6, 40);
		plane0.localTransform.setTranslate(new Point(0, 0, -10));
		plane0.localTransform.setRotate(Matrix.makeRotateX(Math.PI / 2));

		this.loadWait++;
		XhrTask.load('../wmtf/grass_1024.l5tf').then(Texture2D.unpack).then(texture2d => {
			texture2d.hasMipmaps = true;
			plane0.effect = this.effect.createInstance(texture2d, this.lights, new Material({ ambient: 0x666666, diffuse: 0x999999 }));
			this.loadWait--;
		});
		plane.attachChild(plane0);

		let wall = this.std.rectangle(2, 2, 10, 10);
		wall.localTransform.setTranslate(new Point(0, 5, 20));

		this.loadWait++;
		XhrTask.load('../wmtf/wall.l5tf').then(Texture2D.unpack).then((texture2d) => {
			texture2d.hasMipmaps = true;
			wall.effect = this.effect.createInstance(texture2d, this.lights, new Material({ ambient: 0x666666, diffuse: 0xcccccc }));
			this.loadWait--;
		});
		plane.attachChild(wall);

		this.scene.attachChild(plane);

		this.createLegs();

		this.createCoordinat();
	}

	initBodyKeyframes(body) {

		let ctrl = new KeyframeController(0, 2, 3, 3, body.localTransform);
		// 填充关键帧位移
		ctrl.repeat = Controller.RT_CYCLE;
		ctrl.frequency = .0001;
		ctrl.maxTime = 1;

		ctrl.translations[0] = new Point(-30, 0, 0);
		ctrl.translations[1] = new Point(30, 0, 0);
		ctrl.translationTimes[0] = 0;
		ctrl.translationTimes[1] = 1;

		ctrl.scales[0] = 1;
		ctrl.scales[1] = .6;
		ctrl.scales[2] = 1.2;
		ctrl.scaleTimes[0] = 0;
		ctrl.scaleTimes[1] = 0.3;
		ctrl.scaleTimes[2] = 1;

		ctrl.rotations[0] = Quaternion.fromAxisAngle(Vector.UNIT_Y, 0);
		ctrl.rotations[1] = Quaternion.fromAxisAngle(Vector.UNIT_Y, Math.PI);
		ctrl.rotations[2] = Quaternion.fromAxisAngle(Vector.UNIT_Y, 0);
		ctrl.rotationTimes[0] = 0.1;
		ctrl.rotationTimes[1] = 0.5;
		ctrl.rotationTimes[2] = 0.9;

		body.attachController(ctrl);
	}

	createLegs() {
		let m1 = new Material({ ambient: 0x555555, diffuse: 0x555555 });
		let m3 = new Material({ ambient: 0x555555, diffuse: 0x555555, specular: 0xffffff, exponent: 50 });

		this.std.inside = true;
		const std = this.std;

		let left = std.torus(8, 32, 1, .8);
		left.localTransform.setRotate(Matrix.makeRotateY(Math.PI / 2));
		left.localTransform.setTranslate(new Point(-2, 0, 0));
		left.attachController(new RotateZController(left.localTransform));

		let right = std.torus(8, 32, 1, .8);
		right.localTransform.setRotate(Matrix.makeRotateY(-Math.PI / 2));
		right.localTransform.setTranslate(new Point(2, 0, 0));
		right.attachController(new RotateZController(right.localTransform));

		let body = std.torus(64, 64, 2, .8);
		body.localTransform.setTranslate(new Point(0, 3, 0));


		this.loadWait++;
		XhrTask.load('../wmtf/ruler.l5tf').then(Texture2D.unpack).then((texture2d) => {
			texture2d.hasMipmaps = true;
			body.effect = this.effect.createInstance(texture2d, this.lights, m3);

			let eft1 = this.effect.createInstance(texture2d, this.lights, m1);
			left.effect = eft1;
			right.effect = eft1;
			this.loadWait--;
		});


		let leftLeg = new Node();
		leftLeg.attachController(new RunController(leftLeg.localTransform, 180));
		leftLeg.attachChild(left);

		let rightLeg = new Node();
		rightLeg.attachController(new RunController(rightLeg.localTransform));
		rightLeg.attachChild(right);

		let bodie = new Node();

		bodie.attachChild(body);
		bodie.attachChild(leftLeg);
		bodie.attachChild(rightLeg);
		this.initBodyKeyframes(bodie);
		this.scene.attachChild(bodie);
	}

	createCoordinat() {
		let format = VertexFormat.create(2,
			VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
			VertexFormat.AU_COLOR, VertexFormat.AT_FLOAT4, 0);

		let std = new StandardMesh(format, true, false);

		let i,n;

		let effect = new VertexColor4Effect;
		effect.getAlphaState(0, 0).blendEnabled = true;
		effect.getOffsetState(0, 0).fillEnabled = true;
		effect.getOffsetState(0, 0).scale = -0.1;
		effect.getOffsetState(0, 0).bias = 0.1;
		let iEffect = effect.createInstance();

		let XYPlane = std.rectangle(8, 8, 20, 5);
		let vba = VertexBufferAccessor.fromVisual(XYPlane);
		XYPlane.wire = true;
		for (i= 0, n = vba.numVertices; i < n; ++i) {
			vba.setColor(0, i, [1, 0, 0, 1]);
		}

		let XZPlane = std.rectangle(8, 8, 20, 5);
		XZPlane.wire = true;
		vba = VertexBufferAccessor.fromVisual(XZPlane);
		for (i= 0, n = vba.numVertices; i < n; ++i) {
			vba.setColor(0, i, [1, 1, 0, 1]);
		}
		XZPlane.localTransform.setRotate(Matrix.makeRotateY(Math.PI/2));


		let YZPlane = std.rectangle(32, 32, 20, 20);
		vba = VertexBufferAccessor.fromVisual(YZPlane);
		for (i= 0, n = vba.numVertices; i < n; ++i) {
			vba.setColor(0, i, [0, 0, 1, .3]);
		}
		YZPlane.localTransform.setRotate(Matrix.makeRotateX(Math.PI/2));

		XYPlane.effect = iEffect;
		XZPlane.effect = iEffect;
		YZPlane.effect = iEffect;

		this.scene.attachChild(XYPlane);
		this.scene.attachChild(XZPlane);
		this.scene.attachChild(YZPlane);
	}
}

runApplication(Skin);
