class VolumeFogEffect extends L5.VisualEffect {

    constructor() {
        super();

        var vshader = new L5.VertexShader("VolumeFogVS", 2, 1, 1);
        vshader.setInput(0, "modelPosition", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
        vshader.setInput(0, "modelColor", L5.Shader.VT_VEC3, L5.Shader.VS_POSITION);
        vshader.setInput(1, "modelTCoord0", L5.Shader.VT_VEC2, L5.Shader.VS_TEXCOORD0);
        vshader.setConstant(0, "PVWMatrix", L5.Shader.VT_MAT4);
        vshader.setSampler(0, "BaseSampler", L5.Shader.ST_2D);
        vshader.setFilter(0, L5.Shader.SF_LINEAR);
        vshader.setCoordinate(0, 0, L5.Shader.SC_CLAMP_EDGE);
        vshader.setCoordinate(0, 1, L5.Shader.SC_CLAMP_EDGE);
        vshader.setTextureUnit(0, 0);
        vshader.setProgram(VolumeFogEffect.VS);

        var fshader = new L5.FragShader("VolumeFogFS", 0, 0, 0);
        fshader.setProgram(VolumeFogEffect.FS);

        var program = new L5.Program("VolumeFogProgram", vshader, fshader);

        var pass = new L5.VisualPass();
        pass.program = program;
        pass.alphaState = new L5.AlphaState();
        pass.cullState = new L5.CullState();
        pass.depthState = new L5.DepthState();
        pass.offsetState = new L5.OffsetState();
        pass.stencilState = new L5.StencilState();

        var technique = new L5.VisualTechnique();
        technique.insertPass(pass);
        this.insertTechnique(technique);
    }

    createInstance(texture) {
        var instance = new L5.VisualEffectInstance(this, 0);
        instance.setVertexConstant(0, 0, new L5.PVWMatrixConstant());
        instance.setVertexTexture(0, 0, texture);
        return instance;
    }
}

L5.DECLARE_ENUM(VolumeFogEffect, {
    VS: `#version 300 es
uniform mat4 PVWMatrix;
uniform sampler2D BaseSampler;

layout(location=0) in vec3 modelPosition;
layout(location=3) in vec3 modelColor0;
layout(location=8) in vec2 modelTCoord0;
out vec3 vertexColor;
void main () {
    vec4 pos;
    pos.xz = modelPosition.xy;
    pos.y = texture(BaseSampler, modelTCoord0).r * 5.0;
    pos.w = 1.0;
    gl_Position = PVWMatrix * pos;
    vertexColor = modelColor0;
}`,
    FS: `#version 300 es
precision highp float;
in vec3 vertexColor;
out vec4 fragColor;
void main () {
    fragColor = vec4(vertexColor, 1.0);
}`
});

class VolumeFog extends L5.Application3D {

    constructor() {
        super('VolumeFog', 640, 480, [0, 0.5, 0.75, 1], 'ctx');

        this.textColor = "#fff";
        this.sceneCuller = null;
        this.scene = null;
    }


    onInitialize() {
        if (!super.onInitialize(this)) {
            return false;
        }

        // 设置相机
        this.camera.setPerspective(60.0, this.getAspectRatio(), 0.1, 10000);
        this.camera.lookAt(L5.Point.ORIGIN, L5.Point.ORIGIN, L5.Vector.UNIT_Y);
        this.camera.setPosition(new L5.Point(0, 8, -30));

        this.effect = new L5.Texture2DEffect(
            L5.Shader.SF_LINEAR_MIPMAP_LINEAR,
            L5.Shader.SC_REPEAT,
            L5.Shader.SC_REPEAT);

        // 禁用背面剔除
        this.renderer.overrideCullState.enabled = false;

        this.createScene();

        // Initial update of objects.
        this.scene.update();

        // Initial culling of scene,
        this.sceneCuller = new L5.Culler(this.camera);
        this.sceneCuller.computeVisibleSet(this.scene);

        this.initializeCameraMotion(0.1, 0.05);
        this.initializeObjectMotion(this.scene);
        return true;
    }

    onIdle() {
        this.measureTime();

        if (this.moveCamera()) {
            this.sceneCuller.computeVisibleSet(this.scene);
        }
        if (this.moveObject()) {
            this.scene.update(this.applicationTime);
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
        this.scene = new L5.Node();

        //// Create a screen-space camera for the background image.
        //this.screenCamera = L5.ScreenTarget.createCamera();
        //
        //// Create a screen polygon for the background image.
        //var format = L5.VertexFormat.create(2,
        //    L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
        //    L5.VertexFormat.AU_TEXCOORD, L5.VertexFormat.AT_FLOAT2, 0);
        //
        //this.screenPolygon = L5.ScreenTarget.createRectangle(vformat, this.width, this.height, 0, 1, 0, 1, 1);
        var $this = this;
        //this.loadWait++;
        //L5.Texture2D.loadWMTF('BlueSky.wmft').then(function (skyTexture) {
        //    var skyEffect = new L5.Texture2DEffect();
        //    $this.screenPolygon.effect = skyEffect.createInstance(skyTexture);
        //    --$this.loadWait;
        //});

        // Begin with a flat height field.
        var format = L5.VertexFormat.create(3,
            L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_COLOR, L5.VertexFormat.AT_FLOAT3, 0,
            L5.VertexFormat.AU_TEXCOORD, L5.VertexFormat.AT_FLOAT2, 0);

        this.mesh = new L5.StandardMesh(format).rectangle(512, 512, 16, 16);
        this.scene.attachChild(this.mesh);


        L5.Texture2D.loadFile('hill.l5tf').then(function (texture) {
            var data = texture.getData(0);
            var vba = new L5.VertexBufferAccessor(format, $this.mesh.vertexBuffer);
            var color = [0,0,0];
            var i, j, l = vba.numVertices;
            for (i = 0, j = 0; i < l; ++i, j += 4) {
                var value = data[j];
                // var height = 3 * value / 255 + 0.25 * L5.Math.symmetricRandom();
                // data[j] = L5.Math.intervalRandom(32, 255);
                // data[j + 1] = 3 * (128 - value / 2) / 4;
                // data[j + 2] = 255;
                // var pos = vba.getPosition(i);
                // pos[2] = height;
                // vba.setPosition(i, pos);
                if (value > 150) {
                    vba.setColor(0, i, [1, 1, 1]);
                } else if (value > 120) {
                    vba.setColor(0, i, [0x66/255, 1, 1]);
                } else if (value > 60 ) {
                    vba.setColor(0, i, [0x33/255, 0xcc/255, 0/255]);
                } else if (value > 20 ) {
                    vba.setColor(0, i, [0x33/255, 0x66/255, 0/255]);
                }else {
                    vba.setColor(0, i, [0x8b/255, 0x86/255, 0x82/255]);
                }
            }
            var effect = new VolumeFogEffect();
            $this.mesh.effect = effect.createInstance(texture);
        });
    }
}


L5.runApplication(VolumeFog);