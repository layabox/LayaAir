import { Config3D } from "../../../Config3D";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataItem, ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine";
import { UniformBufferParamsType, UnifromBufferData } from "../../RenderEngine/UniformBufferData";
import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { ShaderPass } from "./ShaderPass";

// todo 初始化 uniformMap 提取出来 供 Scene, Camera, Sprite3D 生成 uniform shader代码 ?
// export type UniformItem = { [uniformName: string]: ShaderDataType } | { type: ShaderDataType, value?: ShaderDataItem };

export type UniformMapType = { [blockName: string]: { [uniformName: string]: ShaderDataType } | ShaderDataType };

export type AttributeMapType = { [name: string]: [number, ShaderDataType] };

/**
 * <code>SubShader</code> 类用于创建SubShader。
 */
export class SubShader {
	public static DefaultShaderStateMap: any = {
		's_Cull': Shader3D.RENDER_STATE_CULL,
		's_Blend': Shader3D.RENDER_STATE_BLEND,
		's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
		's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
		's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
		's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE,
		's_StencilTest': Shader3D.RENDER_STATE_STENCIL_TEST,
		's_StencilWrite': Shader3D.RENDER_STATE_STENCIL_WRITE,
		's_StencilRef': Shader3D.RENDER_STATE_STENCIL_REF,
		's_StencilOp': Shader3D.RENDER_STATE_STENCIL_OP
	}

	public static readonly DefaultAttributeMap: { [name: string]: [number, ShaderDataType] } = {
		'a_Position': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
		'a_Normal': [VertexMesh.MESH_NORMAL0, ShaderDataType.Vector3],
		'a_Tangent0': [VertexMesh.MESH_TANGENT0, ShaderDataType.Vector4],
		'a_Texcoord0': [VertexMesh.MESH_TEXTURECOORDINATE0, ShaderDataType.Vector2],
		'a_Texcoord1': [VertexMesh.MESH_TEXTURECOORDINATE1, ShaderDataType.Vector2],
		'a_Color': [VertexMesh.MESH_COLOR0, ShaderDataType.Vector4],
		'a_BoneWeights': [VertexMesh.MESH_BLENDWEIGHT0, ShaderDataType.Vector4],
		'a_BoneIndices': [VertexMesh.MESH_BLENDINDICES0, ShaderDataType.Vector4],
		'a_WorldMat': [VertexMesh.MESH_WORLDMATRIX_ROW0, ShaderDataType.Matrix4x4],
		'a_SimpleTextureParams': [VertexMesh.MESH_SIMPLEANIMATOR, ShaderDataType.Vector2]
	}

	/**@internal */
	_attributeMap: AttributeMapType;

	/**@internal */
	_uniformMap: UniformMapType;

	// todo uniform 相关信息统一用结构体存储？ 合并 value type map
	/**
	 * @internal
	 * uniform 默认值
	 */
	readonly _uniformDefaultValue: { [name: string]: ShaderDataItem };
	/**
	 * @internal
	 * uniform 数据类型
	 */
	readonly _uniformTypeMap: Map<string, ShaderDataType>;

	/**@internal */
	readonly _uniformBufferDataMap: Map<string, UnifromBufferData> = new Map();

	/**@internal */
	_owner: Shader3D;
	/**@internal */
	_flags: any = {};
	/**@internal */
	_passes: ShaderPass[] = [];

	/**
	 * 创建一个 <code>SubShader</code> 实例。
	 * @param	attributeMap  顶点属性表。
	 * @param	uniformMap  uniform属性表。
	 */
	constructor(attributeMap: { [name: string]: [number, ShaderDataType] } = SubShader.DefaultAttributeMap, uniformMap: UniformMapType = {}, uniformDefaultValue: { [name: string]: ShaderDataItem } = null) {
		this._attributeMap = attributeMap;
		this._uniformMap = uniformMap;
		this._uniformDefaultValue = uniformDefaultValue;
		this._uniformTypeMap = new Map();
		for (const key in uniformMap) {
			if (typeof uniformMap[key] == "object") {
				let block = <{ [uniformName: string]: ShaderDataType }>(uniformMap[key]);
				let blockUniformMap = new Map<string, UniformBufferParamsType>();
				for (const uniformName in block) {
					let uniformType = ShaderDataTypeToUniformBufferType(block[uniformName]);
					blockUniformMap.set(uniformName, uniformType);

					this._uniformTypeMap.set(uniformName, block[uniformName]);
				}

				let blockUniformIndexMap = new Map<number, UniformBufferParamsType>();
				blockUniformMap.forEach((value, key) => {
					blockUniformIndexMap.set(Shader3D.propertyNameToID(key), value);
				});

				let blockData = new UnifromBufferData(blockUniformIndexMap);
				this._uniformBufferDataMap.set(key, blockData);
			}
			else {
				let unifromType = <ShaderDataType>uniformMap[key];
				this._uniformTypeMap.set(key, unifromType);

				if (unifromType == ShaderDataType.Texture2D || unifromType == ShaderDataType.TextureCube) {
					let textureGammaDefine = Shader3D.getDefineByName(`Gamma_${key}`);
					let uniformIndex = Shader3D.propertyNameToID(key);
					ShaderDefine._texGammaDefine[uniformIndex] = textureGammaDefine;
				}
			}
		}
	}

	/**
	 * 添加标记。
	 * @param key 标记键。
	 * @param value 标记值。
	 */
	setFlag(key: string, value: string): void {
		if (value)
			this._flags[key] = value;
		else
			delete this._flags[key];
	}

	/**
	 * 获取标记值。
	 * @return key 标记键。
	 */
	getFlag(key: string): string {
		return this._flags[key];
	}

	/**
	 * 添加着色器Pass
	 * @param vs 
	 * @param ps 
	 * @param stateMap 
	 * @param pipelineMode 渲染管线模式。 
	 */
	addShaderPass(vs: string, ps: string, pipelineMode: string = "Forward", stateMap: { [key: string]: number } = SubShader.DefaultShaderStateMap): ShaderPass {
		var shaderPass: ShaderPass = new ShaderPass(this, vs, ps, stateMap);
		shaderPass._pipelineMode = pipelineMode;
		this._passes.push(shaderPass);
		return shaderPass;
	}

}

function ShaderDataTypeToUniformBufferType(shaderDataType: ShaderDataType) {

	switch (shaderDataType) {
		case ShaderDataType.Float:
			return UniformBufferParamsType.Number;
		case ShaderDataType.Vector2:
			return UniformBufferParamsType.Vector2;
		case ShaderDataType.Vector3:
			return UniformBufferParamsType.Vector3;
		case ShaderDataType.Vector4:
		case ShaderDataType.Color:
			return UniformBufferParamsType.Vector4;
		case ShaderDataType.Matrix4x4:
			return UniformBufferParamsType.Matrix4x4;
		default:
			throw "ShaderDataType can not be in UniformBuffer.";
	}

}

