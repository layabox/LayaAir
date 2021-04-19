import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { Camera } from "../../Camera";
import { BlitScreenQuadCMD } from "./BlitScreenQuadCMD";
import { SetRenderTargetCMD } from "./SetRenderTargetCMD";
import { Command } from "./Command";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Vector4 } from "../../../math/Vector4";
import { Mesh } from "../../../resource/models/Mesh";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { Material } from "../../material/Material";
import { SetShaderDataCMD, ShaderDataType } from "./SetShaderDataCMD";
import { Vector3 } from "../../../math/Vector3";
import { Vector2 } from "../../../math/Vector2";
import { DrawMeshCMD } from "./DrawMeshCMD";
import { RenderContext3D } from "../RenderContext3D";
import { ClearRenderTextureCMD } from "./ClearRenderTextureCMD";
import { BaseRender } from "../BaseRender";
import { DrawRenderCMD } from "./DrawRenderCMD";
import { SetGlobalShaderDataCMD } from "./SetGlobalShaderDataCMD";
import { DrawMeshInstancedCMD } from "./DrawMeshInstancedCMD";
import { MaterialInstancePropertyBlock } from "./MaterialInstancePropertyBlock";
import { LayaGL } from "../../../../layagl/LayaGL";

/**
 * <code>CommandBuffer</code> 类用于创建命令流。
 */
export class CommandBuffer {
	/**@internal */
	_camera: Camera = null;
	/**@internal */
	_context:RenderContext3D;
	/**@internal */
	private _commands: Command[] = [];

	/**
	 * 创建一个 <code>CommandBuffer</code> 实例。
	 */
	constructor() {

	}

	/**
	 * 调用所有渲染指令
	 *@internal
	 */
	_apply(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].run();
	}

	/**
	 * 设置shader图片数据
	 * @param shaderData shader数据集合
	 * @param nameID 图片UniformID
	 * @param source 图片源
	 */
	setShaderDataTexture(shaderData: ShaderData, nameID: number, source: BaseTexture): void {
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,source,ShaderDataType.Texture,this));
	}

	/**
	 * 设置全局纹理数据
	 * @param nameID 图片uniformID
	 * @param source 图片源
	 */
	setGlobalTexture(nameID:number,source: BaseTexture){
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Texture,this));
	}

	/**
	 * 设置shader Vector4数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataVector(shaderData:ShaderData,nameID:number,value:Vector4):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataType.Vector4,this));
	}

	/**
	 * 设置全局Vector4数据
	 * @param nameID Vector4数据ID
	 * @param source 数据
	 */
	setGlobalVector(nameID:number,source: Vector4){
		
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Vector4,this));
	}

	/**
	 * 设置shader Vector3数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataVector3(shaderData:ShaderData,nameID:number,value:Vector3):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataType.Vector3,this));
	}

	/**
	 * 设置全局Vector3数据
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalVector3(nameID:number,source:Vector3){
		
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Vector3,this));
	}

	/**
	 * 设置shader Vector2数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataVector2(shaderData:ShaderData,nameID:number,value:Vector2):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataType.Vector2,this));
	}

	/**
	 * 设置全局Vector2数据
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalVector2(nameID:number,source:Vector2){
		
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Vector2,this));
	}

	/**
	 * 设置shader Number属性
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataNumber(shaderData:ShaderData,nameID:number,value:number):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataType.Number,this));
	}

	/**
	 * 设置全局number属性
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalNumber(nameID:number,source:number){
		
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Number,this));
	}

	/**
	 * 设置shader Int属性
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataInt(shaderData:ShaderData,nameID:number,value:number):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataType.Int,this));
	}

	/**
	 * 设置全局int属性
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalInt(nameID:number,source:number){
		
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Int,this));
	}

	/**
	 * 设置shader Matrix属性
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataMatrix(shaderData:ShaderData,nameID:number,value:Matrix4x4):void{
		this._commands.push(SetShaderDataCMD.create(shaderData,nameID,value,ShaderDataType.Matrix4x4,this));
	}

	/**
	 * 设置全局Matrix属性
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalMatrix(nameID:number,source:number){
		
		this._commands.push(SetGlobalShaderDataCMD.create(nameID,source,ShaderDataType.Matrix4x4,this));
	}

	/**
	 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
	 * @param	source 源纹理. 如果为null,前渲染结果为原纹理
	 * @param	dest  目标纹理. 如果为null，直接渲染到最终画布
	 * @param	offsetScale 偏移缩放。
	 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
	 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
	 * @param	subShader subShader索引,默认值为0。
	 */
	blitScreenQuad(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0,definedCanvas:boolean = false): void {
		this._commands.push(BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD,this,definedCanvas));
	}

	/**
	 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
	 * @param source 源纹理 如果为null,前渲染结果为原纹理
	 * @param dest 目标纹理 如果为null，直接渲染到最终画布
	 * @param offsetScale 偏移缩放
	 * @param material 材质
	 * @param subShader shader索引
	 */
	blitScreenQuadByMaterial(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,material:Material = null,subShader: number = 0):void{
		var shader:Shader3D;
		var shaderData:ShaderData;
		if(material){
			shader = material._shader;
			shaderData = material.shaderData
		}
		this._commands.push(BlitScreenQuadCMD.create(source,dest,offsetScale,shader,shaderData,subShader,BlitScreenQuadCMD._SCREENTYPE_QUAD,this));
	}

	/**
	 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
	 * @param	source 源纹理。
	 * @param	dest  目标纹理。
	 * @param	offsetScale 偏移缩放。
	 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
	 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
	 * @param	subShader subShader索引,默认值为0。
	 */
	blitScreenTriangle(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0,defineCanvas:boolean = false): void {
		this._commands.push(BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE,this,defineCanvas));
	}

	/**
	 * 设置指令渲染目标
	 * @param renderTexture RT渲染目标
	 */
	setRenderTarget(renderTexture: RenderTexture): void {
		this._commands.push(SetRenderTargetCMD.create(renderTexture));
	}

	/**
	 * clear渲染纹理
	 * @param clearColor 
	 * @param clearDepth 
	 * @param backgroundColor 
	 * @param depth 
	 */
	clearRenderTarget(clearColor:boolean,clearDepth:boolean,backgroundColor:Vector4,depth:number = 1):void{
		this._commands.push(ClearRenderTextureCMD.create(clearColor,clearDepth,backgroundColor,depth,this));
	}
	
	/**
	 * 渲染一个Mesh
	 * @param mesh 原始网格信息
	 * @param matrix 网格世界矩阵
	 * @param material 材质
	 * @param submeshIndex 子网格索引 如果索引为
	 * @param subShaderIndex 子shader索引 一般为0
	 */
	drawMesh(mesh:Mesh,matrix:Matrix4x4, material:Material ,submeshIndex:number,subShaderIndex:number):void{
		this._commands.push(DrawMeshCMD.create(mesh,matrix,material,submeshIndex,subShaderIndex,this));
	}

	/**
	 * 渲染一个Render
	 * @param render 渲染器
	 * @param material 材质
	 * @param subShaderIndex 子shader索引 一般为0
	 */
	drawRender(render:BaseRender,material:Material,subShaderIndex:number):void{
		this._commands.push(DrawRenderCMD.create(render,material,subShaderIndex,this));
	}


	/**
	 * 使用instance动态合批的方式渲染一个Mesh
	 * @param mesh 原始网格信息
	 * @param subMeshIndex mesh索引
	 * @param matrixs 渲染的世界矩阵数组，用来描述每个Mesh需要渲染的位置,如果为null，将不创建更新世界矩阵Buffer
	 * @param material 渲染材质
	 * @param subShaderIndex 渲染材质shader索引
	 * @param instanceProperty Instance自定义属性
	 * @param drawnums 渲染个数
	 */
	drawMeshInstance(mesh:Mesh,subMeshIndex:number,matrixs:Matrix4x4[],material:Material,subShaderIndex:number,instanceProperty:MaterialInstancePropertyBlock,drawnums:number):any{
		if(!LayaGL.layaGPUInstance.supportInstance())
			return null;
		var drawMeshInstancedCMD = DrawMeshInstancedCMD.create(mesh,subMeshIndex,matrixs,material,subShaderIndex,instanceProperty,drawnums,this);
		this._commands.push(drawMeshInstancedCMD);
		return drawMeshInstancedCMD;
	}

	/**
	 *@internal
	 */
	clear(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].recover();
		this._commands.length = 0;
	}

}


