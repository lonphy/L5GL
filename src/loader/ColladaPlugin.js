import { XhrTask } from './XHRLoader';
import { Material, TriMesh } from '../graphics/sceneTree/namespace';
import { VertexFormat, VertexBuffer, IndexBuffer, VertexBufferAccessor } from '../graphics/resources/namespace';
import { Matrix } from '../math/index';

const ID_SCENE = 'scene';
const ID_VISUAL_SCENES = 'library_visual_scenes visual_scene';
const ID_GEOMETRIES = 'library_geometries geometry';
const ID_IMAGES = 'library_images';
const ID_EFFECTS = 'library_effects effect';
const ID_MATERIALS = 'library_materials material';
const ID_CONTROLLERS = 'library_controllers controller';
const ID_ANIMATIONS = 'library_animations';


const NSCENE_INSTANCE_VISUAL_SCENE = 'instance_visual_scene';
const CTRL_MATRIX = 'bind_shape_matrix';

class ColladaParser {
	constructor(xmlTree) {
		this.xmlTree = xmlTree;
		this.effects = {};
		this.visualScenes = null;

		this.geometries = {};
		this.controllers = {};
		this.scene = null;
		this.materials = {};
	}

	static floats(v) {
		v = ColladaParser.strings(v);
		let result = [];
		for (let i = 0; i < v.length; ++i) {
			result.push(parseFloat(v[i]));
		}
		return result;
	}

	static ints(v) {
		return v.trim().split(/\s+/).map(v => parseInt(v, 10));
	}

	static strings(v) {
		return v.trim().split(/\s+/);
	}

	parseColorOrTexture(el) {
		if (el.nodeName === 'transparent') {
			// A_ONE: 1.0, RGB_ZERO: 0.0
			return el.getAttribute('opaque') === 'A_ONE' ? 1.0 : 0.0;
		}
		const els = el.children,
			total = els.length;
		let child;
		for (let i = 0; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'color':
					return new Float32Array(ColladaParser.floats(child.textContent));
				case 'texture':
				case 'param':
			}
		}
	}

	// parse <lambert>...</lambert>
	// Produces a diffuse sharded surface that is independent of lighting.
	parseLambert(el) {
		const els = el.children,
			total = els.length;
		let child, opts = {};
		for (let i = 0; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'emission':
				case 'ambient':
				case 'diffuse':
				case 'reflective':
					opts[child.nodeName] = this.parseColorOrTexture(child);
					break;
				case 'transparency':
					opts.alpha = parseFloat(child.textContent.trim());
					break;
				case 'transparent':
				case 'reflectivity':
				case 'index_of_refraction':
					console.log(child);
			}
		}

		let material = new Material(opts);
		material.type = Material.LAMBERT;
		return material;
	}
	// parse <blinn>...</blinn>
	parseBlinn(el) {
		const els = el.children,
			total = els.length;
		let child, opts = {};
		for (let i = 0; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'emission':
				case 'ambient':
				case 'diffuse':
				case 'specular':
				case 'shininess':
				case 'reflective':
					opts[child.nodeName] = this.parseColorOrTexture(child);
					break;
				case 'transparency':
					opts.alpha = parseFloat(child.textContent.trim());
					break;
				case 'transparent':
				case 'reflectivity':
				case 'index_of_refraction':
					console.log(child);
			}
		}

		let material = new Material(opts);
		material.type = Material.BLINN;
		return material;
	}

	// parse <phong>...</phong>
	// Produces a specularly shaded surface where the specular reflection is shaded according the Phong BRDF approximation.
	parsePhong(el) {
		const els = el.children,
			total = els.length;
		let child, opts = {};
		for (let i = 0; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'emission':
				case 'ambient':
				case 'diffuse':
				case 'specular':
				case 'reflective':
					opts[child.nodeName] = this.parseColorOrTexture(child);
					break;
				case 'shininess':
					opts.exponent = parseFloat(child.textContent);
					break;
				case 'transparency':
					opts.alpha = parseFloat(child.textContent);
					break;
				case 'transparent':
				case 'reflectivity':
				case 'index_of_refraction':
					console.log(child);
			}
		}

		let material = new Material(opts);
		material.type = Material.PHONG;
		return material;
	}

	// parse <technique id="..." sid="...">...</technique>
	parseTechnique(el) {
		const els = el.children,
			total = els.length;

		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'blinn':
					return this.parseBlinn(child);
				case 'lambert':
					return this.parseLambert(child);
				case 'phong':
					return this.parsePhong(child);
				case 'pass':
					break;
				case 'contant':
					break;
				case 'asset':
				case 'extra':
				case 'annotate':
				// not support
			}
		}
	}

	// parse <profile_common id="...">...</profile_common>
	parseProfileCommon(el) {
		let technique;
		const els = el.children,
			total = els.length;
		let child;

		for (let i = 0; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'technique':
					technique = this.parseTechnique(child);
					break;
				case 'newparam':
				case 'asset':
				case 'extra':
			}
		}
		return technique;
	}

	// parse <effect id="..." name="...">...</effect>
	parseEffect(el) {
		const children = el.children,
			total = children.length,
			name = el.getAttribute('name');

		let nChild, effect;
		for (let i = 0; i < total; ++i) {
			nChild = children[i];
			switch (nChild.nodeName) {
				case 'profile_COMMON':
					effect = this.parseProfileCommon(nChild);
					break;
				case 'profile_BRIDGE':
				case 'profile_GLES':
				case 'profile_GLES2':
				case 'profile_GLSL':
				case 'profile_CG':
				case 'annotate':
				case 'asset':
				case 'newparam':
				case 'extra':
					break;
			}
		}

		return effect;
	}

	// parse <library_effects>...</library_effects>
	parseEffects() {
		const els = this.xmlTree.querySelectorAll(ID_EFFECTS),
			total = els.length;
		let child;
		for (let i = 0; i < total; ++i) {
			child = els[i];
			this.effects[child.id] = this.parseEffect(child);
		}
	}

	// parse <instance_effect url="#..."></instance_effect>
	parseInstanceEffect(el) {
		return this.effects[el.getAttribute('url').substr(1)];
	}

	// parse <material id="..." name="...">...</material>
	parseMaterial(el) {
		let effect = this.parseInstanceEffect(el.children[0]);
		if (effect) {
			effect.name = el.getAttribute('name');
		}
		return effect;
	}

	// 解析材质
	parseMaterials() {
		const els = this.xmlTree.querySelectorAll(ID_MATERIALS),
			total = els.length;

		let child;

		for (let i = 0; i < total; ++i) {
			child = els[i];
			this.materials[child.id] = this.parseMaterial(child);
		}
	}

	// parse <triangles count="..." material="..."></triangles>
	parseTriangles(el) {
		const els = el.children,
			total = els.length;
		let triangles = {
			name: el.getAttribute('name'),
			count: parseInt(el.getAttribute('count'), 10),
			material: el.getAttribute('material').trim(),
			inputs: []
		};

		for (let i = 0, input, child; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'input':
					triangles.inputs.push(this.parseInput(child));
					break;
				case 'p':
					triangles.indices = ColladaParser.ints(child.textContent);
					break;
				case 'extra':
					console.log(child);
			}
		}
		return triangles;
	}

	// parse <vertices id="...">...</vertices>
	parseVertices(el) {
		let result = { id: el.id, name: el.getAttribute('name'), inputs: [] };
		const els = el.querySelectorAll('input'),
			total = els.length;
		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			result.inputs.push(this.parseInput(child));
		}
		return result;
	}

	mapBasicType(t) {
		switch (t) {
			case 'float': return 'FLOAT';
		}
	}

	mapSemantic(input, sources) {
		let accessor = sources[input.source].accessor,
			_type = this.mapBasicType(accessor.params[0].type),
			num = accessor.params.length,
			_usage;

		_type = VertexFormat[`AT_${_type}${num}`];

		switch (input.semantic) {
			case 'POSITION':
			case 'NORMAL':
			case 'TEXCOORD':
			case 'BINORMAL':
			case 'COLOR':
			case 'TANGENT':
				_usage = VertexFormat[`AU_${input.semantic}`];
				break;
			case 'WEIGHT':
			case 'MORPH_WEIGHT':
				_usage = VertexFormat.AU_BLENDWEIGHT;
				break;
			case 'MORPH_TARGET':
			case 'JOINT':
				_usage = VertexFormat.AU_BLENDINDICES;
				break;
			default:
				console.log(input);
		}
		return [_usage, _type, 0];
	}

	wrapTriangles(sources, vertices, primitives) {
		let vfArgs = [0], vOffset,
			normalData, nOffset,
			texcoordData, tOffset, i, j, input, input1, n, m, offset, data, stride, k,
			vertexUsages = {/*<semantic, data>*/ };

		const inputs = primitives.inputs;
		const idxStride = inputs.length;

		for (i = 0; i < idxStride; ++i) {
			input = inputs[i];
			switch (input.semantic) {
				case 'VERTEX':
					m = vertices.inputs.length;
					vfArgs[0] += m;
					for (j = 0; j < m; ++j) {
						input1 = vertices.inputs[j];
						vertexUsages[input1.semantic] = sources[input1.source];
						vfArgs.push(...this.mapSemantic(input1, sources));
					}
					break;
				default:
					vertexUsages[input.semantic] = sources[input.source];
					vfArgs.push(...this.mapSemantic(input, sources));
					++vfArgs[0];
			}
		}

		const fmt = VertexFormat.create(...vfArgs);
		const numVertices = primitives.count * 3;
		let vertexBuffer = new VertexBuffer(numVertices, fmt.stride);
		const vba = new VertexBufferAccessor(fmt, vertexBuffer);
		for (i = 0; i < numVertices; ++i) {
			n = i * idxStride; // vertex start at.
			for (j = 0; j < idxStride; ++j) {
				input = inputs[j];
				m = primitives.indices[n + input.offset];   // vertex attribute index in indices.
				if (input.semantic === 'VERTEX') {
					for (k = 0; k < vertices.inputs.length; ++k) {
						input = vertices.inputs[k];
						data = vertexUsages[input.semantic];
						stride = data.accessor.stride;
						switch (input.semantic) {
							case 'POSITION':
								offset = m * stride;
								vba.setPosition(i, data.data.slice(offset, offset + stride));
								break;
							case 'NORMAL':
								offset = m * stride;
								vba.setNormal(i, data.data.slice(offset, offset + stride));
								break;
						}
					}
				} else {
					data = vertexUsages[input.semantic];
					stride = data.accessor.stride;
					switch (input.semantic) {
						case 'NORMAL':
							offset = m * stride;
							vba.setNormal(i, data.data.slice(offset, offset + stride));
							break;
						case 'TEXCOORD':
							offset = m * stride;
							vba.setNormal(input.set, i, data.data.slice(offset, offset + stride));
							break;
					}
				}
			}
		}
		let mesh = new TriMesh(fmt, vertexBuffer);
		mesh.userData = { material: primitives.material };
		return mesh;
	}

	// parse <mesh>...</mesh>
	parseMesh(el) {
		const els = el.children,
			total = els.length;

		let sources = {}, vertices, primitives, primitiveType;

		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'source':
					sources[child.id] = this.parseSource(child);
					break;
				case 'vertices':
					vertices = this.parseVertices(child);
					break;
				case 'triangles':
					primitiveType = 'triangles';
					primitives = this.parseTriangles(child);
					break;
				case 'lines':
					primitiveType = 'lines';
					break;
				case 'linestrips':
					primitiveType = 'linestrips';
					break;
				case 'polygons':
					primitiveType = 'polygons';
					break;
				case 'polylist':
					primitiveType = 'polylist';
					break;
				case 'trifans':
					primitiveType = 'trifans';
					break;
				case 'tristrips':
					primitiveType = 'tristrips';
					break;
				case 'extra':
					console.log(child);
			}
		}

		switch (primitiveType) {
			case 'triangles':
				return this.wrapTriangles(sources, vertices, primitives);
			case 'lines':
			case 'linestrips':
			case 'polygons':
			case 'polylist':
			case 'trifans':
			case 'tristrips':
				console.error('unsupport primitive type', primitiveType)
				return null;
		}
	}

	// parse <geometry id="..." name="...">...</geometry>
	parseGeometry(el) {
		const children = el.children,
			total = children.length,
			geometryName = el.getAttribute('name');

		let nChild;
		for (let i = 0; i < total; ++i) {
			nChild = children[i];
			switch (nChild.nodeName) {
				case 'mesh':
					return Object.assign(this.parseMesh(nChild), { name: geometryName });
				case 'extra':
			}
		}
		return null;
	}

	// parse <library_geometries>...</library_geometries>
	parseGeometries() {
		const els = this.xmlTree.querySelectorAll(ID_GEOMETRIES),
			total = els.length;

		let child;
		for (let i = 0; i < total; ++i) {
			child = els[i];
			this.geometries[child.id] = this.parseGeometry(child);
		}
	}

	// parse <accessor source="..." count=".." offset=".." stride="..">...</accessor>
	parseAccessor(el) {
		let accessor = {
			source: el.getAttribute('source').substr(1),
			count: parseInt(el.getAttribute('count'), 10) || 0,
			stride: parseInt(el.getAttribute('stride'), 10) || 1,
			offset: parseInt(el.getAttribute('offset', 10)) || 0,
			params: []
		}, child;

		const els = el.querySelectorAll('param'),
			total = els.length;
		for (let i = 0; i < total; i++) {
			child = els[i];
			accessor.params.push({
				name: child.getAttribute('name'),
				type: child.getAttribute('type')
			});
		}
		return accessor;
	}

	// parse <input semantic="..." source="#..." offset="..." set="..."></input>
	parseInput(el) {
		return {
			semantic: el.getAttribute('semantic'),
			source: el.getAttribute('source').substr(1),
			offset: parseInt(el.getAttribute('offset'), 10) || 0,
			set: parseInt(el.getAttribute('set'), 10) || 0
		};
	}

	// parse <source id="...">...</source>
	parseSource(el) {
		const els = el.children,
			total = els.length;

		let child, accessor, data, sources = {};
		for (let i = 0; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'IDREF_array':
				case 'Name_array':
					sources[child.id] = ColladaParser.strings(child.textContent);
					break;
				case 'float_array':
					sources[child.id] = new Float32Array(ColladaParser.floats(child.textContent));
					break;
				case 'int_array':
					sources[child.id] = ColladaParser.ints(child.textContent);
					break;
				case 'technique_common':
					accessor = this.parseAccessor(child.querySelector('accessor'));
					break;
				case 'technique':
				case 'bool_array':
				case 'asset':
				default:
					console.warn(child);
				// todo
			}
		}

		data = sources[accessor.source];
		switch (accessor.params[0].type) {
			case 'float':
			case 'IDREF':
			case 'name':
				return { accessor, data };
			case 'float4x4':
				let result = [];
				for (let i = 0; i < accessor.count; ++i) {
					result.push(new Matrix(...data.slice(i * 16, (i + 1) * 16)));
				}
				return { accessor, data: result };
			default:
				console.warn(accessor.params[0].type);
		}
	}

	// parse <joints>...</joints>
	parseJoints(el) {
		const children = el.querySelectorAll('input'),
			total = children.length;
		let nChild, result = {};
		for (let i = 0; i < total; ++i) {
			nChild = children[i];
			result[nChild.getAttribute('semantic')] = this.parseInput(nChild);
		}
		return result;
	}

	// parse <vertex_weights count="...">...</vertex_weights>
	parseWeights(el) {
		const children = el.children,
			total = children.length;

		let nChild, result = { count: parseInt(el.getAttribute('count'), 10) };
		for (let i = 0; i < total; ++i) {
			nChild = children[i];
			switch (nChild.nodeName) {
				case 'input':
					result[nChild.getAttribute('semantic')] = this.parseInput(nChild);
					break;
				case 'v':
					result.v = ColladaParser.ints(nChild.textContent);
					break;
				case 'vcount':
					result.vcount = ColladaParser.ints(nChild.textContent);
					break;
			}
		}
		return result;
	}

	// parse <skin source="...">...</skin>
	parseSkin(el) {
		let skin = {}, nChild, sources = {}, joints, weights;
		skin.source = el.getAttribute('source').substr(1);

		const children = el.children,
			total = children.length;
		for (let i = 0; i < total; ++i) {
			nChild = children[i];
			switch (nChild.nodeName) {
				case 'bind_shape_matrix':
					skin.bindMatrix = new Matrix(...ColladaParser.floats(nChild.textContent));
					break;
				case 'source':
					sources[nChild.id] = this.parseSource(nChild);
					break;
				case 'joints':
					joints = this.parseJoints(nChild);
					break;
				case 'vertex_weights':
					weights = this.parseWeights(nChild);
					break;
			}
		}

		// todo: sources fixed

		// joints link
		skin.jointNames = sources[joints.JOINT.source];
		skin.invBindMatrix = sources[joints.INV_BIND_MATRIX.source];

		// weights link
		skin.weights = [];
		const weightsData = sources[weights.WEIGHT.source];
		const preVertexWeightSize = 2; // weights.JOINT + weights.WEIGHT
		let numJoints, idxJoint, idxWeight, t;
		for (let i = 0; i < weights.count; ++i) {
			numJoints = weights.vcount[i];
			for (let j = 0; j < numJoints; ++j) {
				t = i * j * preVertexWeightSize;

				idxJoint = weights.v[t];
				if (!skin.weights[idxJoint]) {
					skin.weights[idxJoint] = [];
				}

				idxWeight = weights.v[t + 1];
				skin.weights[idxJoint].push(weightsData[idxWeight]);
			}
		}

		return skin;
	}

	// parse <controller id="...">...</controller>
	parseController(el) {
		const children = el.children,
			total = children.length;
		let nChild, ctrl = {};
		for (let i = 0; i < total; ++i) {
			nChild = children[i];
			switch (nChild.nodeName) {
				case 'skin':
					ctrl.type = 'skin';
					Object.assign(ctrl, this.parseSkin(nChild));
					break;
				case 'morph':
					break;
				case 'asset':
				case 'extra':
				default:
				// todo
			}
		}

		// 创建controller实例

		return ctrl;
	}

	// parse <library_controllers>...</library_controllers>
	parseControllers() {
		const els = this.xmlTree.querySelectorAll(ID_CONTROLLERS);
		const total = els.length;

		for (let i = 0; i < total; ++i) {
			this.controllers[els[i].id] = this.parseController(els[i]);
		}
	}

	parseTransform(el) {
		let result;
		switch (el.nodeName) {
			case 'matrix':
				result = new Matrix(...ColladaParser.floats(el.textContent)).transpose();
				result[14] = result[14];
				return result;
			default:
				console.log(el);
		}
	}

	parseNode(el) {
		const els = el.children;
		const total = els.length;

		let target, material, transforms = [];

		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'node':
					break;
				case 'instance_geometry':
					target = this.geometries[child.getAttribute('url').substr(1)];
					child = child.querySelector('instance_material');
					target.userData.material = child.getAttribute('target').substr(1);
					break;
				case 'instance_controller':
					break;
				case 'instance_node':
					break;
				case 'lookat':
				case 'matrix':
				case 'rotate':
				case 'scale':
				case 'skew':
				case 'translate':
					transforms.push(this.parseTransform(child));
					break;
				case 'instance_camera':
					break;
				case 'instance_light':
					break;
			}
		}
		if (target) {
			if (transforms.length > 1) {
				let finalTransform = Matrix.IDENTITY;
				transforms.reduce((f, c) => f.copy(c.mul(f)), finalTransform);
				target.localTransform.setMatrix(finalTransform);
			} else if (transforms.length === 1) {
				target.localTransform.setMatrix(transforms[0]);
			}
		}

		return target;
	}

	parseVisualScene(el) {
		console.group('parseVisualScene' + el.id);

		const els = el.children;
		const total = els.length;

		let nodes = {};
		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'node':
					nodes[child.id] = this.parseNode(child);
					break;
				case 'evaluate_scene':
				case 'extra':
				// console.log(child);
			}
		}
		console.groupEnd();
		return nodes;
	}

	parseVisualScenes() {
		const els = this.xmlTree.querySelectorAll(ID_VISUAL_SCENES);
		const total = els.length;
		this.visualScenes = {};
		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			this.visualScenes[child.id] = this.parseVisualScene(child);
		}
	}

	parseScene() {
		const els = this.xmlTree.querySelector(ID_SCENE).children;
		const total = els.length;
		for (let i = 0, child; i < total; ++i) {
			child = els[i];
			switch (child.nodeName) {
				case 'instance_visual_scene':
					this.scene = this.visualScenes[child.getAttribute('url').substr(1)];
					break;
				case 'instance_physics_scene':
				case 'extra':
					console.log(child);
			}
		}
	}

	parse() {
		this.parseEffects();
		this.parseMaterials();
		this.parseGeometries(); // 解析skin
		this.parseControllers();
		this.parseVisualScenes();
		this.parseScene();

		const { geometries, materials, scene, effects } = this;
		return Promise.resolve({ geometries, materials, scene, effects });
	}
}

function ColladaPlugin(xmlData) {
	let doc = new DOMParser().parseFromString(xmlData, 'text/xml');
	let parser = new ColladaParser(doc.children[0]);
	console.log(doc);
	return parser.parse();
}

XhrTask.plugin('ColladaPlugin', ColladaPlugin);