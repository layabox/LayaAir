import { Command } from "./Command";
import { Mesh } from "../../../resource/models/Mesh";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { Material } from "../../material/Material";
import { ShaderData } from "../../../shader/ShaderData";
import { DefineDatas } from "../../../shader/DefineDatas";
import { CommandBuffer } from "./CommandBuffer";
import { MaterialInstancePropertyBlock } from "./MaterialInstancePropertyBlock";
import { BufferState } from "../../BufferState";
import { SubMeshInstanceBatch } from "../../../graphics/SubMeshInstanceBatch";
import { VertexBuffer3D } from "../../../graphics/VertexBuffer3D";
import { ShaderPass } from "../../../shader/ShaderPass";
import { ShaderInstance } from "../../../shader/ShaderInstance";
import { MeshSprite3DShaderDeclaration } from "../../MeshSprite3DShaderDeclaration";
import { SubMesh } from "../../../resource/models/SubMesh";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Stat } from "../../../../utils/Stat";
import { VertexMesh } from "../../../graphics/Vertex/VertexMesh";


/**
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawMeshInstancedCMD extends Command {
	/**@internal */
	private static _pool: DrawMeshInstancedCMD[] = [];
	/**@internal */
	private static _compileDefine:DefineDatas = new DefineDatas();

	/**设置最大DrawInstance数 */
	static maxInstanceCount = 1024;

	/**
	 * 创建一个命令流
	 * @internal
	 */
	static create(mesh:Mesh,subMeshIndex:number,matrixs:Matrix4x4[],material:Material,subShaderIndex:number,instanceProperty:MaterialInstancePropertyBlock,drawnums:number,commandBuffer:CommandBuffer):DrawMeshInstancedCMD {
		var cmd: DrawMeshInstancedCMD;
		if((matrixs&&matrixs.length>1024)||drawnums>DrawMeshInstancedCMD.maxInstanceCount){
			throw "the number of renderings exceeds the maximum number of merges";
		}
		cmd = DrawMeshInstancedCMD._pool.length > 0 ? DrawMeshInstancedCMD._pool.pop():new DrawMeshInstancedCMD();
		cmd._mesh = mesh;
		cmd._matrixs = matrixs;
		cmd._material = material;
		cmd._subMeshIndex = subMeshIndex;
		cmd._subShaderIndex = subShaderIndex;
		cmd._commandBuffer = commandBuffer;
		cmd._instanceProperty = instanceProperty;
		cmd._drawnums = drawnums;
		matrixs||cmd._updateWorldMatrixBuffer();
		cmd._setInstanceBuffer();
		return cmd;
	}


	/**@internal */
	private _material:Material;
	/**@internal */
	private _matrixs:Matrix4x4[];
	/**@internal */
	private _subMeshIndex:number;
	/**@internal */
	private _subShaderIndex:number;
	/**@internal */
	private _mesh:Mesh;
	/**@internal */
	private _instanceProperty:MaterialInstancePropertyBlock;
	/** @internal */
	private _instanceBufferState: BufferState;
	/** @internal */
	private _drawnums:number;
	
	/**@internal */
	private _renderShaderValue:ShaderData;
	/**@internal 世界矩阵数据*/
	private _instanceWorldMatrixData:Float32Array;
	/**@internal 世界矩阵buffer*/
	private _instanceWorldMatrixBuffer:VertexBuffer3D;

	
	constructor(){
		super();
		this._renderShaderValue = new ShaderData(null);
		let gl = LayaGL.instance;
		this._instanceWorldMatrixData = new Float32Array( DrawMeshInstancedCMD.maxInstanceCount*16);
		this._instanceWorldMatrixBuffer = new VertexBuffer3D(this._instanceWorldMatrixData.length*4,gl.DYNAMIC_DRAW);
		this._instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
	}

	/**
	 * @internal
	 */
	private _setInstanceBuffer():void{
		let instanceBufferState = this._instanceBufferState = new BufferState();
		instanceBufferState.bind();
		instanceBufferState.applyVertexBuffer(this._mesh._vertexBuffer);
		instanceBufferState.applyInstanceVertexBuffer(this._instanceWorldMatrixBuffer);
		let propertyMap = this._instanceProperty._propertyMap;
		for(let i in propertyMap){
			instanceBufferState.applyInstanceVertexBuffer(propertyMap[i]._vertexBuffer);
		}
		instanceBufferState.applyIndexBuffer(this._mesh._indexBuffer);
		instanceBufferState.unBind();
	}

	/**
	 * 更新世界矩阵buffer
	 * @internal
	 */
	private _updateWorldMatrixBuffer(){
		let worldMatrixData:Float32Array = this._instanceWorldMatrixData;
		let count:number = this._drawnums;
		for (let i = 0; i < count; i++) {
			worldMatrixData.set(this._matrixs[i].elements,i*16);
		}
		let worldBuffer: VertexBuffer3D = this._instanceWorldMatrixBuffer;
		worldBuffer.orphanStorage();
		worldBuffer.setData(worldMatrixData.buffer,0,0,count*64);
	}

	/**
	 * @internal
	 * @param subMesh 
	 */
	private _render(subMesh:SubMesh){
		let gl = LayaGL.instance;
		var count = this._drawnums;
		var indexCount:number = subMesh._indexCount;
		this._instanceBufferState.bind();
		LayaGL.layaGPUInstance.drawElementsInstanced(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, subMesh._indexStart * 2, count);
		Stat.renderBatches++;
		Stat.trianglesFaces += indexCount * count / 3;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		let renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
		this.setContext(this._commandBuffer._context);
		let context = this._context;
		let forceInvertFace = context.invertY;
		let scene = context.scene;
		let cameraShaderValue = context.cameraShaderValue;
		let currentPipelineMode: string = context.pipelineMode;
		this._renderShaderValue.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
		let passes:ShaderPass[] = renderSubShader._passes;
		for (let j: number = 0, m: number = passes.length; j < m; j++) {
			let pass:ShaderPass = passes[j];
			if (pass._pipelineMode !== currentPipelineMode)
				continue;
			let comDef:DefineDatas = DrawMeshInstancedCMD._compileDefine;
			scene._shaderValues._defineDatas.cloneTo(comDef);
			comDef.addDefineDatas(this._renderShaderValue._defineDatas);
			comDef.addDefineDatas(this._material._shaderValues._defineDatas);
			let shaderIns: ShaderInstance = context.shader = pass.withCompile(comDef);
			shaderIns.bind();
			//scene
			shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, scene._shaderValues,true);
			//sprite
			shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this._renderShaderValue,true);
			//camera
			shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderValue, true);
			//material
			let matValues = this._material._shaderValues;
			shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap,matValues,true);
			shaderIns.uploadRenderStateBlendDepth(matValues);
			//默认Matrix里面没有scale为负数的worldMatrix
			shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace,false);
		}

		//update blockData
		let propertyMap = this._instanceProperty._propertyMap;
		for(let i in propertyMap){
			//更新自定义Instancebuffer
			propertyMap[i].updateVertexBufferData(this._drawnums);
		}

		//drawInstanceElement
		let subGeometryElement = this._mesh._subMeshes;
		let subMeshRender;
		if(this._subMeshIndex == -1){
			for(let i = 0,n = subGeometryElement.length;i<n;i++){
				subMeshRender = subGeometryElement[i];
				if(subMeshRender._prepareRender(context)){
					this._render(subMeshRender);
				}
			}
		}
		else{
			let subGeometryElement= this._mesh._subMeshes;
			subMeshRender = subGeometryElement[this._subMeshIndex];
			if(subMeshRender._prepareRender(context)){
				this._render(subMeshRender);
			}
		}
	}

	/**
	 * 重置DrawInstance的世界矩阵数组
	 * @param worldMatrixArray 
	 */
	setWorldMatrix(worldMatrixArray:Matrix4x4[]):void{
		if(worldMatrixArray.length<this._drawnums)
			throw "worldMatrixArray length is less then drawnums";
		this._matrixs = worldMatrixArray;
		this._matrixs&&this._updateWorldMatrixBuffer();
	}

	/**
	 * 重置渲染个数
	 * @param drawNums 
	 */
	setDrawNums(drawNums:number):void{
		if(this._matrixs&&this._matrixs.length<drawNums)
			throw "worldMatrixArray length is less then drawnums";
		this._drawnums = drawNums;
		this._matrixs&&this._updateWorldMatrixBuffer();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		DrawMeshInstancedCMD._pool.push(this);
		this._renderShaderValue.clearDefine();
		this._renderShaderValue._initData();
		this._instanceBufferState.destroy();
		this._instanceBufferState = null;
	}
}


