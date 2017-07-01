(function (scope, plugin) {

    scope.PMDPaser = plugin();
})(window, function () {
    let encoder = new CharsetEncoder();


    class BufferReader {
        constructor(array_buffer) {
            this.dv = new DataView(array_buffer);
            this.offset = 0;
        }

        int8() {
            return this.dv.getInt8(this.offset++);
        }

        uint8() {
            return this.dv.getUint8(this.offset++);
        }


        int16() {
            let val = this.dv.getInt16(this.offset, true);
            this.offset += 2;
            return val;
        }

        uint16() {
            let val = this.dv.getUint16(this.offset, true);
            this.offset += 2;
            return val;
        }

        uint16Array(len) {
            var a = new Uint16Array(len);
            for (let i = 0; i < len; ++i) {
                a[i] = this.uint16();
            }
            return a;
        }

        uint32() {
            let val = this.dv.getUint32(this.offset, true);
            this.offset += 4;
            return val;
        }

        float32() {
            let val = this.dv.getFloat32(this.offset, true);
            this.offset += 4;
            return val;
        }

        float32Array(len) {
            var a = new Float32Array(len);
            for (var i = 0; i < len; ++i) {
                a[i] = this.float32();
            }
            return a;
        }

        string(len) {
            let ret = '', val;
            while (len-- > 0) {
                val = this.uint8();
                if (val === 0) {
                    break;
                }
                ret += String.fromCharCode(val);
            }
            this.offset += len + 1;
            return ret;
        }

        unicodeString(len) {
            let a = [], val;

            while (len-- > 0) {
                val = this.uint8();
                if (val === 0) {
                    break;
                }
                a.push(val);
            }

            this.offset += len;
            return encoder.s2u(new Uint8Array(a));
        }
    }


    class helper {
        static l2rVector3(v) {
            v[2] = -v[2];
        }

        static l2rIndexOrder(p) {
            let tmp = p[2];
            p[2] = p[0];
            p[0] = tmp;
        }

        static l2rEuler(r) {
            r[0] = -r[0];
            r[1] = -r[1];
        }

        static leftToRightVector3Range(v1, v2) {
            let tmp = -v2[2];
            v2[2] = -v1[2];
            v1[2] = tmp;
        }

        static leftToRightEulerRange(r1, r2) {
            let tmp1 = -r2[0];
            let tmp2 = -r2[1];
            r2[0] = -r1[0];
            r2[1] = -r1[1];
            r1[0] = tmp1;
            r1[1] = tmp2;
        }

        static toCharStrings(s) {
            let str = '';
            for (let i = 0; i < s.length; i++) {
                str += '0x' + ('0000' + s[i].charCodeAt().toString(16)).substr(-4);
            }
            return str;
        }

        static l2rModel(model) {

            if (model.meta.coordinateSystem === 'right') {
                return;
            }

            model.meta.coordinateSystem = 'right';

            // var helper = new THREE.MMDLoader.DataCreationHelper();
            let i, j, m;
            for (i = 0; i < model.meta.numVertices; ++i) {
                helper.l2rVector3(model.vertices[i].position);
                helper.l2rVector3(model.vertices[i].normal);
            }
            for (i = 0; i < model.meta.numFace; ++i) {
                helper.l2rIndexOrder(model.faces[i].indices);
            }
            for (i = 0; i < model.meta.numBone; i++) {
                helper.l2rVector3(model.bones[i].position);
            }

            // TODO: support other morph for PMX
            for (i = 0; i < model.meta.numMorph; i++) {
                m = model.morphs[i];
                if (model.meta.format === 'pmx') {
                    if (m.type === 1) {
                        m = m.elements;
                    } else {
                        continue;
                    }
                }
                for (j = 0; j < m.numElement; j++) {
                    helper.l2rVector3(m.elements[j].position);
                }
            }

            for (i = 0; i < model.meta.numRigidBody; i++) {
                helper.l2rVector3(model.rigidBodies[i].position);
                helper.l2rEuler(model.rigidBodies[i].rotation);
            }

            for (i = 0; i < model.meta.numConstraint; i++) {
                helper.l2rVector3(model.constraints[i].position);
                helper.l2rEuler(model.constraints[i].rotation);
                helper.leftToRightVector3Range(model.constraints[i].translationLimitation1, model.constraints[i].translationLimitation2);
                helper.leftToRightEulerRange(model.constraints[i].rotationLimitation1, model.constraints[i].rotationLimitation2);
            }
        }
    }

    function parsePmd(buf) {
        let b = new BufferReader(buf);
        let pmd = Object.create(null);
        pmd.meta = {
            coordinateSystem: 'left',
            format: 'pmd'
        };

        // 头部解析
        pmd.meta.magic = b.string(3);
        if (pmd.meta.magic !== 'Pmd') {
            throw 'PMD file magic is want Pmd, got ' + pmd.meta.magic;
        }
        pmd.meta.version = b.float32();
        pmd.meta.modelName = b.unicodeString(20);
        pmd.meta.comment = b.unicodeString(256);

        // 顶点数据解析
        var parseVertex = function () {
            var p = {};
            p.position = b.float32Array(3);
            p.normal = b.float32Array(3);
            p.uv = b.float32Array(2);
            p.skinIndices = b.uint16Array(2);
            p.skinWeights = [b.uint8() / 100];
            p.skinWeights.push(1.0 - p.skinWeights[0]);
            p.edgeFlag = b.uint8();
            return p;
        };
        pmd.meta.numVertices = b.uint32();
        pmd.vertices = new Array(pmd.meta.numVertices);
        for (let i = 0, count = pmd.meta.numVertices; i < count; ++i) {
            pmd.vertices[i] = parseVertex();
        }


        // 解析面
        pmd.meta.numFace = b.uint32() / 3;
        pmd.faces = new Array(pmd.meta.numFace);
        for (let i = 0, count = pmd.meta.numFace; i < count; ++i) {
            pmd.faces[i] = { indices: b.uint16Array(3) };
        }

        // 解析材质
        pmd.meta.numMaterial = b.uint32();
        pmd.materials = new Array(pmd.meta.numMaterial);
        for (let i = 0, count = pmd.meta.numMaterial; i < count; ++i) {
            pmd.materials[i] = {
                diffuse: b.float32Array(4),
                shininess: b.float32(),
                specular: b.float32Array(3),
                emissive: b.float32Array(3),
                toonIndex: b.int8(),
                edgeFlag: b.uint8(),
                numFace: b.uint32() / 3,
                file: b.unicodeString(20)
            };
        }


        // 解析骨骼

        var parseBone = function () {

            var p = {};
            // Skinning animation doesn't work when bone name is Japanese Unicode in r73.
            // So using charcode strings as workaround and keep original strings in .originalName.
            p.originalName = b.unicodeString(20);
            p.name = helper.toCharStrings(p.originalName);
            p.parentIndex = b.int16();
            p.tailIndex = b.int16();
            p.type = b.uint8();
            p.ikIndex = b.int16();
            p.position = b.float32Array(3);
            return p;
        };

        pmd.meta.numBone = b.uint16();
        pmd.bones = new Array(pmd.meta.numBone);
        for (let i = 0, count = pmd.meta.numBone; i < count; ++i) {
            pmd.bones[i] = parseBone();
        }


        // IK
        var parseIk = function () {
            var p = {};
            p.target = b.uint16();
            p.effector = b.uint16();
            p.numLink = b.uint8();
            p.iteration = b.uint16();
            p.maxAngle = b.float32();
            p.links = new Array(p.numLink);
            for (let i = 0, count = p.numLink; i < count; ++i) {
                p.links[i] = { index: b.uint16() };
            }
            return p;
        };

        pmd.meta.numIK = b.uint16();
        pmd.iks = [];
        for (let i = 0, count = pmd.meta.numIK; i < count; ++i) {
            pmd.iks[i] = parseIk();
        }

        // 变体
        var parseMorph = function () {
            var p = {};
            p.name = b.unicodeString(20);
            p.numElement = b.uint32();
            p.type = b.uint8();
            p.elements = [];
            for (let i = 0, count = p.numElement; i < count; ++i) {
                p.elements[i] = {
                    index: b.uint32(),
                    position: b.float32Array(3)
                };
            }
            return p;
        };
        pmd.meta.numMorph = b.uint16();
        pmd.morphs = new Array(pmd.meta.numMorph);
        for (let i = 0, count = pmd.meta.numMorph; i < count; ++i) {
            pmd.morphs[i] = parseMorph();
        }

        // 变体帧
        pmd.meta.numMorphFrame = b.uint8();
        pmd.morphFrames = new Array(pmd.meta.numMorphFrame);
        for (let i = 0, count = pmd.meta.numMorphFrame; i < count; ++i) {
            pmd.morphFrames[i] = { index: b.uint16() };
        }

        // 骨骼帧名称
        pmd.meta.numBoneFrameName = b.uint8();
        pmd.boneFrameNames = new Array(pmd.meta.numBoneFrameName);
        for (let i = 0, count = pmd.meta.numBoneFrameName; i < count; ++i) {
            pmd.boneFrameNames[i] = { name: b.unicodeString(50) };
        }

        // 骨骼帧
        pmd.meta.numBoneFrame = b.uint32();
        pmd.boneFrames = new Array(pmd.meta.numBoneFrame);
        for (let i = 0, count = pmd.meta.numBoneFrame; i < count; ++i) {
            pmd.boneFrames[i] = { boneIndex: b.int16(), frameIndex: b.uint8() };
        }

        // 英文兼容
        pmd.meta.englishCompatibility = b.uint8();
        if (pmd.meta.englishCompatibility > 0) {
            pmd.meta.englishModelName = b.unicodeString(20);
            pmd.meta.englishComment = b.unicodeString(256);

            // 英文骨骼名
            pmd.englishBoneNames = new Array(pmd.meta.numBone);
            for (let i = 0, count = pmd.meta.numBone; i < count; ++i) {
                pmd.englishBoneNames[i] = { name: b.unicodeString(20) }
            }

            // 英文变体名
            pmd.englishMorphNames = new Array(pmd.meta.numMorph);
            for (let i = 0, count = pmd.meta.numMorph; i < count - 1; ++i) {
                pmd.englishMorphNames[i] = { name: b.unicodeString(20) };
            }

            // 英文骨骼帧名
            pmd.englishBoneFrameNames = new Array(pmd.meta.numBoneFrameName);
            for (let i = 0, count = pmd.meta.numBoneFrameName; i < count; ++i) {
                pmd.englishBoneFrameNames[i] = { name: b.unicodeString(50) };
            }
        }

        // 卡通纹理
        pmd.toonTextures = new Array(10);
        for (let i = 0; i < 10; ++i) {
            pmd.toonTextures[i] = { file: b.unicodeString(100) };
        }

        // 刚体
        pmd.meta.numRigidBody = b.uint32();
        pmd.rigidBodies = new Array(pmd.meta.numRigidBody);
        for (let i = 0, count = pmd.meta.numRigidBody; i < count; ++i) {
            pmd.rigidBodies[i] = {
                name: b.unicodeString(20),
                boneIndex: b.int16(),
                groupIndex: b.uint8(),
                groupTarget: b.uint16(),
                shapeType: b.uint8(),
                width: b.float32(),
                height: b.float32(),
                depth: b.float32(),
                position: b.float32Array(3),
                rotation: b.float32Array(3),
                weight: b.float32(),
                positionDamping: b.float32(),
                rotationDamping: b.float32(),
                restriction: b.float32(),
                friction: b.float32(),
                type: b.uint8()
            }
        }

        // 一些常量定义
        pmd.meta.numConstraint = b.uint32();
        pmd.constraints = new Array(pmd.meta.numConstraint);
        for (let i = 0, count = pmd.meta.numConstraint; i < count; ++i) {
            pmd.constraints[i] = {
                name: b.unicodeString(20),
                rigidBodyIndex1: b.uint32(),
                rigidBodyIndex2: b.uint32(),
                position: b.float32Array(3),
                rotation: b.float32Array(3),
                translationLimitation1: b.float32Array(3),
                translationLimitation2: b.float32Array(3),
                rotationLimitation1: b.float32Array(3),
                rotationLimitation2: b.float32Array(3),
                springPosition: b.float32Array(3),
                springRotation: b.float32Array(3)
            };
        }

        b = null;
        return pmd;
    }

    let fmt = L5.VertexFormat.create(3,
        L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
        L5.VertexFormat.AU_TEXCOORD, L5.VertexFormat.AT_FLOAT2, 0,
        L5.VertexFormat.AU_NORMAL, L5.VertexFormat.AT_FLOAT3, 0
    );


    function loadMatrial(model) {

        var textures = [];
        // var textureLoader = new THREE.TextureLoader(this.manager);
        // var tgaLoader = new THREE.TGALoader(this.manager);
        // var materialLoader = new THREE.MaterialLoader(this.manager);
        var color = [0, 0, 0];
        var offset = 0;
        var materialParams = [];

        function loadTexture(filePath, params) {
            if (params === undefined) {
                params = {};
            }

            var directoryPath = (params.defaultTexturePath === true) ? scope.defaultTexturePath : texturePath;
            var fullPath = directoryPath + filePath;

            var loader = THREE.Loader.Handlers.get(fullPath);

            if (loader === null) {
                loader = (filePath.indexOf('.tga') >= 0) ? tgaLoader : textureLoader;
            }

            var texture = loader.load(fullPath, function (t) {
                t.flipY = false;
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                if (params.sphericalReflectionMapping === true) {
                    t.mapping = THREE.SphericalReflectionMapping;
                }

                for (var i = 0; i < texture.readyCallbacks.length; i++) {
                    texture.readyCallbacks[i](texture);
                }
            });

            texture.readyCallbacks = [];
            var uuid = THREE.Math.generateUUID();
            textures[uuid] = texture;
            return uuid;
        }

        for (let i = 0; i < model.meta.numMaterial; ++i) {
            geometry.faceVertexUvs.push([]);
        }

        for (let i = 0; i < model.meta.numMaterial; ++i) {

            let m = model.materials[i];
            let params = {
                type: 'MMDMaterial',
                faceOffset: offset,
                faceNum: m.numFace
            };

            for (let j = 0; j < m.numFace; j++) {
                // 设置面的材质索引
                geometry.faces[offset].materialIndex = i;

                // 设置面的UV坐标
                let uvs = [];
                for (let k = 0; k < 3; k++) {
                    let v = model.vertices[model.faces[offset].indices[k]];
                    uvs.push(new THREE.Vector2(v.uv[0], v.uv[1]));
                }
                geometry.faceVertexUvs[0].push(uvs);
                offset++;
            }

            params.name = m.name;
            params.color = color.fromArray([m.diffuse[0], m.diffuse[1], m.diffuse[2]]).getHex();
            params.opacity = m.diffuse[3];
            params.specular = color.fromArray([m.specular[0], m.specular[1], m.specular[2]]).getHex();
            params.shininess = m.shininess;

            if (params.opacity === 1.0) {
                params.side = THREE.FrontSide;
                params.transparent = false;
            } else {
                params.side = THREE.DoubleSide;
                params.transparent = true;
            }

            if (model.metadata.format === 'pmd') {

                if (m.file) {

                    var fileName = m.file;
                    var fileNames = [];

                    var index = fileName.lastIndexOf('*');

                    if (index >= 0) {

                        fileNames.push(fileName.slice(0, index));
                        fileNames.push(fileName.slice(index + 1));

                    } else {

                        fileNames.push(fileName);

                    }

                    for (var j = 0; j < fileNames.length; j++) {

                        var n = fileNames[j];

                        if (n.indexOf('.sph') >= 0 || n.indexOf('.spa') >= 0) {

                            params.envMap = loadTexture(n, { sphericalReflectionMapping: true });

                            if (n.indexOf('.sph') >= 0) {

                                params.envMapType = THREE.MultiplyOperation;

                            } else {

                                params.envMapType = THREE.AddOperation;

                            }

                        } else {

                            params.map = loadTexture(n);

                        }

                    }

                }

            }

            // TODO: check if this logic is right
            if (params.map === undefined /* && params.envMap === undefined */) {

                params.emissive = color.fromArray([m.emissive[0], m.emissive[1], m.emissive[2]]).getHex();

            }

            var shader = THREE.ShaderLib['mmd'];
            params.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
            params.vertexShader = shader.vertexShader;
            params.fragmentShader = shader.fragmentShader;

            materialParams.push(params);

        }

        materialLoader.setTextures(textures);

        for (var i = 0; i < materialParams.length; i++) {

            var p = materialParams[i];
            var p2 = model.materials[i];
            var m = materialLoader.parse(p);

            m.faceOffset = p.faceOffset;
            m.faceNum = p.faceNum;

            m.skinning = geometry.bones.length > 0 ? true : false;
            m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
            m.lights = true;

            m.blending = THREE.CustomBlending;
            m.blendSrc = THREE.SrcAlphaFactor;
            m.blendDst = THREE.OneMinusSrcAlphaFactor;
            m.blendSrcAlpha = THREE.SrcAlphaFactor;
            m.blendDstAlpha = THREE.DstAlphaFactor;

            if (m.map !== null) {

                // Check if this part of the texture image the material uses requires transparency
                function checkTextureTransparency(m) {

                    m.map.readyCallbacks.push(function (t) {

                        // Is there any efficient ways?
                        function createImageData(image) {
                            var c = document.createElement('canvas');
                            c.width = image.width;
                            c.height = image.height;
                            var ctx = c.getContext('2d');
                            ctx.drawImage(image, 0, 0);
                            return ctx.getImageData(0, 0, c.width, c.height);
                        }

                        function detectTextureTransparency(image, uvs) {

                            var width = image.width;
                            var height = image.height;
                            var data = image.data;
                            var threshold = 253;
                            if (data.length / (width * height) !== 4) {
                                return false;
                            }

                            for (var i = 0; i < uvs.length; i++) {
                                var centerUV = { x: 0.0, y: 0.0 };
                                for (var j = 0; j < 3; j++) {
                                    var uv = uvs[i][j];
                                    if (getAlphaByUv(image, uv) < threshold) {
                                        return true;
                                    }
                                    centerUV.x += uv.x;
                                    centerUV.y += uv.y;
                                }
                                centerUV.x /= 3;
                                centerUV.y /= 3;

                                if (getAlphaByUv(image, centerUV) < threshold) {
                                    return true;
                                }
                            }
                            return false;
                        }

                        /*
                         * This method expects
                         *   t.flipY = false
                         *   t.wrapS = THREE.RepeatWrapping
                         *   t.wrapT = THREE.RepeatWrapping
                         * TODO: more precise
                         */
                        function getAlphaByUv(image, uv) {

                            var width = image.width;
                            var height = image.height;

                            var x = Math.round(uv.x * width) % width;
                            var y = Math.round(uv.y * height) % height;

                            if (x < 0) {
                                x += width;
                            }

                            if (y < 0) {
                                y += height;
                            }
                            var index = y * width + x;
                            return image.data[index * 4 + 3];

                        };

                        var imageData = t.image.data !== undefined ? t.image : createImageData(t.image);
                        var uvs = geometry.faceVertexUvs[0].slice(m.faceOffset, m.faceOffset + m.faceNum);
                        m.textureTransparency = detectTextureTransparency(imageData, uvs);
                    });

                }
                checkTextureTransparency(m);
            }

            if (m.envMap !== null) {

                // TODO: WebGLRenderer should automatically update?
                function updateMaterialWhenTextureIsReady(m) {
                    m.envMap.readyCallbacks.push(function (t) { m.needsUpdate = true; });
                }
                m.combine = p.envMapType;
                updateMaterialWhenTextureIsReady(m);
            }

            m.uniforms.opacity.value = m.opacity;
            m.uniforms.diffuse.value = m.color;

            if (m.emissive) {
                m.uniforms.emissive.value = m.emissive;
            }

            m.uniforms.map.value = m.map;
            m.uniforms.envMap.value = m.envMap;
            m.uniforms.specular.value = m.specular;
            m.uniforms.shininess.value = Math.max(m.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )

            if (model.metadata.format === 'pmd') {

                function isDefaultToonTexture(n) {
                    if (n.length !== 10) {
                        return false;
                    }
                    return n.match(/toon(10|0\d).bmp/) !== null;
                }

                m.uniforms.outlineThickness.value = p2.edgeFlag === 1 ? 0.003 : 0.0;
                m.uniforms.outlineColor.value = new THREE.Color(0.0, 0.0, 0.0);
                m.uniforms.outlineAlpha.value = 1.0;
                m.uniforms.toonMap.value = textures[p2.toonIndex];
                m.uniforms.celShading.value = 1;

                if (p2.toonIndex === -1) {

                    m.uniforms.hasToonTexture.value = 0;

                } else {

                    var n = model.toonTextures[p2.toonIndex].file;
                    var uuid = loadTexture(n, { defaultTexturePath: isDefaultToonTexture(n) });
                    m.uniforms.toonMap.value = textures[uuid];
                    m.uniforms.hasToonTexture.value = 1;
                }

            }
            else {

                m.uniforms.outlineThickness.value = p2.edgeSize / 300;
                m.uniforms.outlineColor.value = new THREE.Color(p2.edgeColor[0], p2.edgeColor[1], p2.edgeColor[2]);
                m.uniforms.outlineAlpha.value = p2.edgeColor[3];
                m.uniforms.celShading.value = 1;

                if (p2.toonIndex === -1) {

                    m.uniforms.hasToonTexture.value = 0;

                } else {

                    if (p2.toonFlag === 0) {

                        var n = model.textures[p2.toonIndex];
                        var uuid = loadTexture(n);
                        m.uniforms.toonMap.value = textures[uuid];

                    } else {

                        var num = p2.toonIndex + 1;
                        var fileName = 'toon' + (num < 10 ? '0' + num : num) + '.bmp';
                        var uuid = loadTexture(fileName, { defaultTexturePath: true });
                        m.uniforms.toonMap.value = textures[uuid];

                    }

                    m.uniforms.hasToonTexture.value = 1;

                }

            }

            material.materials.push(m);

        }
    }


    return function (buf) {

        let obj = parsePmd(buf);
        console.trace('parsed pmd model:', obj);

        helper.l2rModel(obj);

        // TODO: 蒙皮权重 蒙皮指数填充
        let vertexBuffer = new L5.VertexBuffer(obj.meta.numVertices, fmt.stride);
        let vba = new L5.VertexBufferAccessor(fmt, vertexBuffer);
        let v;
        for (let i = 0; i < obj.meta.numVertices; ++i) {
            v = obj.vertices[i];
            vba.setPosition(i, v.position);
            vba.setNormal(i, v.normal);
            vba.setTCoord(0, i, v.uv);
        }

        let indexBuffer = new L5.IndexBuffer(obj.meta.numFace * 3, 4);
        let p = new Uint32Array(indexBuffer.getData().buffer);
        for (let i = 0; i < obj.meta.numFace; ++i) {
            v = obj.faces[i].indices;
            p[3 * i] = v[0];
            p[3 * i + 1] = v[1];
            p[3 * i + 2] = v[2];
        }


        let node = new L5.Node();
        node.name = obj.meta.modelName;

        let mesh = new L5.TriMesh(fmt, vertexBuffer, indexBuffer);
        mesh.name = obj.meta.modelName;

        let metarials = new Array(obj.meta.numMaterial);


        return Promise.resolve(mesh);
    };
});