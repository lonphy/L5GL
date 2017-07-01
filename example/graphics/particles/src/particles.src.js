import {
	ParticleController, _Math,
	Application3D,

	Renderer,
	Point, Vector, Matrix,

	Culler, Spatial, Node, Light, Material, Particles,

	Texture2DEffect,

	VertexFormat, VertexBuffer, Buffer, VertexBufferAccessor, Shader, Texture, Texture2D,

	runApplication
} from '../../../../src/L5'

class BloodCellController extends ParticleController {
	updatePointMotion(ctrlTime) {
		let particles = this.object;
		const numParticles = particles.numParticles;
		let posSizes = particles.positionSizes;

		for (let i = 0; i < numParticles; ++i) {

			// 控制坐标
			for (let j = 0; j < 3; ++j) {

				posSizes[i * 4 + j] -= [0.01, 0.1, 0.001][j] * Math.random();
				if (posSizes[i * 4 + j] < -3) {
					posSizes[i * 4 + j] = 3;
				}
			}

			// 控制大小
			posSizes[i * 4 + 3] -= 0.0001
			if (posSizes[i * 4 + 3] < 0) {
				posSizes[i * 4 + 0] = 3 * Math.random();
				posSizes[i * 4 + 1] = 3;
				posSizes[i * 4 + 2] = 3 * Math.random();
				posSizes[i * 4 + 3] = 0.1 * Math.random();
			}

		}

		Renderer.updateAll(particles.vertexBuffer);
	}
}


class ParticleSystems extends Application3D {

	constructor() {

		let canvas = document.querySelector('#ctx');
		let w = canvas.width = window.innerWidth;
		let h = canvas.height = window.innerHeight;
		super('Lights', w, h, [0, 0, 0, 1], 'ctx');

		this.textColor = "#fff";
		this.scene = null;
	}

	onInitialize() {
		if (!super.onInitialize()) return false;
		this.camera.setPerspective(45, this.getAspectRatio(), 0.1, 2000);
		this.camera.setFrame(
			new Point(-4, 0, 0),
			new Vector(-1, 0, 0),
			new Vector(0, 0, 1)
		);
		this.createScene();

		// Initial update of objects.
		this.scene.update();

		// Initial culling of scene.
		this.culler = new Culler(this.camera);
		this.scene.culling = Spatial.CULLING_NEVER;
		this.culler.computeVisibleSet(this.scene);

		this.initializeCameraMotion(0.1, 0.01);
		this.initializeObjectMotion(this.scene);
		return true;
	}
	onIdle() {
		this.measureTime();
		this.moveCamera();
		this.moveObject();
		this.scene.update(this.applicationTime);
		this.culler.computeVisibleSet(this.scene);

		if (this.renderer.preDraw()) {
			this.renderer.clearBuffers();
			this.renderer.drawVisibleSet(this.culler.visibleSet);
			this.drawFrameRate();
			this.renderer.postDraw();
		}

		this.updateFrameCount();
	}
	createScene() {
		this.scene = new Node();

		let vformat = VertexFormat.create(2,
			VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
			VertexFormat.AU_TEXCOORD, VertexFormat.AT_FLOAT2, 0);
		const vstride = vformat.stride;

		const numParticles = 512;
		let vbuffer = new VertexBuffer(4 * numParticles, vstride, Buffer.BU_DYNAMIC);
		let positionSizes = new Float32Array(4 * numParticles);
		for (let i = 0; i < numParticles; ++i) {
			positionSizes[i * 4] = _Math.symmetricRandom();
			positionSizes[i * 4 + 1] = _Math.symmetricRandom();
			positionSizes[i * 4 + 2] = _Math.symmetricRandom();
			positionSizes[i * 4 + 3] = 0.1 * Math.random();
		}


		let particles = new Particles(vformat, vbuffer, 4, positionSizes, 1);

		particles.attachController(new BloodCellController());
		this.scene.attachChild(particles);

		// Create an image with transparency.
		const present = 64;
		const xsize = present, ysize = present;
		let texture = new Texture2D(Texture.TF_A8R8G8B8, xsize, ysize, 1);
		let data = texture.getData();

		let pic = new Image;
		pic.onload = () => {
			let t = document.createElement('canvas').getContext('2d');
			t.canvas.width = t.canvas.height = present;
			t.drawImage(pic, 0, 0);
			let imgData = t.getImageData(0, 0, present, present);
			data.set(imgData.data);
			texture.upload();
		}
		pic.src = "snow.png";
		let effect = new Texture2DEffect(Shader.SF_LINEAR);
		effect.getAlphaState(0, 0).blendEnabled = true;
		effect.getDepthState(0, 0).enabled = false;
		particles.effect = effect.createInstance(texture);
	}
}
runApplication(ParticleSystems);
