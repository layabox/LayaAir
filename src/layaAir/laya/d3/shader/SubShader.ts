import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { UnifromBufferData } from "../../RenderEngine/UniformBufferData";
import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { ShaderPass } from "./ShaderPass";

/**
 * <code>SubShader</code> 类用于创建SubShader。
 */
export class SubShader {
	private static DefaultShaderStateMap: any = {
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

	private static DefaultAttributeMap: any = {
		'a_Position': VertexMesh.MESH_POSITION0,
		'a_Normal': VertexMesh.MESH_NORMAL0,
		'a_Tangent0': VertexMesh.MESH_TANGENT0,
		'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
		'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
		'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
		'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
		'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0,
		'a_SimpleTextureParams': VertexMesh.MESH_SIMPLEANIMATOR
	}
	/**@internal */
	_attributeMap: any;

	/**@internal */
	_uniformBufferData:Map<string,UnifromBufferData> = new Map();

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
	constructor(attributeMap: any = SubShader.DefaultAttributeMap) {
		this._attributeMap = attributeMap;
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



