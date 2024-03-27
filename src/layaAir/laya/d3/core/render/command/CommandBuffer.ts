
import { Camera } from "../../Camera";
import { BlitScreenQuadCMD } from "./BlitScreenQuadCMD";
import { Command } from "./Command";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Mesh } from "../../../resource/models/Mesh";
import { Material } from "../../../../resource/Material";
import { SetDefineCMD, SetShaderDataCMD } from "./SetShaderDataCMD";
import { DrawMeshCMD } from "./DrawMeshCMD";
import { RenderContext3D } from "../RenderContext3D";
import { BaseRender } from "../BaseRender";
import { DrawRenderCMD } from "./DrawRenderCMD";
import { SetGlobalShaderDataCMD } from "./SetGlobalShaderDataCMD";
import { DrawMeshInstancedCMD } from "./DrawMeshInstancedCMD";
import { MaterialInstancePropertyBlock } from "./MaterialInstancePropertyBlock";
import { RenderCapable } from "../../../../RenderEngine/RenderEnum/RenderCapable";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { Stat } from "../../../../utils/Stat";
import { Color } from "../../../../maths/Color";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderData, ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { SetRTCMD } from "./SetRenderTargetCMD";
import { IRenderCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRendderCMD";

/**
 * <code>CommandBuffer</code> 类用于创建命令流。
 */
export class CommandBuffer {
	static instance: CommandBuffer;
	/**@internal */
	_name: string
	/**@internal */
	private _shadow: boolean = false;
	/**@internal */
	_camera: Camera = null;
	/**@internal */
	_context: RenderContext3D;
	/**@internal */
	private _commands: Command[] = [];
	/**@internal */
	_renderCMDs: any[] = [];

	/**
	 * 创建一个 <code>CommandBuffer</code> 实例。
	 */
	constructor(name: string = null, shadowCaster: boolean = false) {
		this._name = name;
		this._shadow = shadowCaster;
	}

	get name(): string {
		return this._name;
	}

	get casterShadow() {
		return this._shadow;
	}

	set context(value: RenderContext3D) {
		this._context = value;
	}

	get context() {
		return this._context;
	}

	/**
	 * 调用所有渲染指令
	 * 
	 */
	_apply(render: boolean = false): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++) {
			let cmd = this._commands[i];
			cmd.run && cmd.run();
			//render && cmd.getRenderCMD && rendertype.push(cmd.getRenderCMD());
		}
		render && this.context._contextOBJ.runCMDList(this._renderCMDs);
		//draw array
		Stat.cmdDrawCall += this._renderCMDs.length;
	}

	_applyOne(): boolean {
		if (this._commands.length) {
			var cmd = this._commands.shift();
			cmd.run && cmd.run();
			//render
			cmd.getRenderCMD && this.context._contextOBJ.runOneCMD(this._renderCMDs.shift());
			cmd.recover();
		}
		return this._commands.length > 0;
	}

	getCommandsSize(): number {
		return this._commands.length;
	}

	/**
	 * 设置shader图片数据
	 * @param shaderData shader数据集合
	 * @param nameID 图片UniformID
	 * @param source 图片源
	 */
	setShaderDataTexture(shaderData: ShaderData, nameID: number, source: BaseTexture): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, source, ShaderDataType.Texture2D, this);
		this._commands.push(cmd);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());

	}

	/**
	 * 设置全局纹理数据
	 * @param nameID 图片uniformID
	 * @param source 图片源
	 */
	setGlobalTexture(nameID: number, source: BaseTexture) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Texture2D, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Vector4数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataColor(shaderData: ShaderData, nameID: number, value: Color): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Color, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局Vector4数据
	 * @param nameID Vector4数据ID
	 * @param source 数据
	 */
	setGlobalColor(nameID: number, source: Color) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Color, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Vector4数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataVector(shaderData: ShaderData, nameID: number, value: Vector4): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Vector4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局Vector4数据
	 * @param nameID Vector4数据ID
	 * @param source 数据
	 */
	setGlobalVector(nameID: number, source: Vector4) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Vector4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Vector3数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataVector3(shaderData: ShaderData, nameID: number, value: Vector3): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Vector3, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局Vector3数据
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalVector3(nameID: number, source: Vector3) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Vector3, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Vector2数据
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataVector2(shaderData: ShaderData, nameID: number, value: Vector2): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Vector2, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局Vector2数据
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalVector2(nameID: number, source: Vector2) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Vector2, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Number属性
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataNumber(shaderData: ShaderData, nameID: number, value: number): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Float, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局number属性
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalNumber(nameID: number, source: number) {

		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Float, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Int属性
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataInt(shaderData: ShaderData, nameID: number, value: number): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Int, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局int属性
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalInt(nameID: number, source: number) {

		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Int, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置shader Matrix属性
	 * @param shaderData shader数据集合
	 * @param nameID 数据ID
	 * @param value 数据
	 */
	setShaderDataMatrix(shaderData: ShaderData, nameID: number, value: Matrix4x4): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Matrix4x4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	setShaderDefine(shaderData: ShaderData, define: ShaderDefine, value: boolean): void {
		let cmd = SetDefineCMD.create(shaderData, define, value, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置全局Matrix属性
	 * @param nameID 数据ID
	 * @param source 数据
	 */
	setGlobalMatrix(nameID: number, source: number) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Matrix4x4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
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
	blitScreenQuad(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		let cmd = BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
	 * @param source 源纹理 如果为null,前渲染结果为原纹理
	 * @param dest 目标纹理 如果为null，直接渲染到最终画布
	 * @param offsetScale 偏移缩放
	 * @param material 材质
	 * @param subShader shader索引
	 */
	blitScreenQuadByMaterial(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, material: Material = null, subShader: number = 0): void {
		var shader: Shader3D;
		var shaderData: ShaderData;
		if (material) {
			shader = material._shader;
			shaderData = material.shaderData
		}
		let cmd = BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
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
	blitScreenTriangle(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		let cmd = BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 设置指令渲染目标
	 * @param renderTexture RT渲染目标
	 */
	setRenderTarget(renderTexture: RenderTexture, clearColor: boolean, clearDepth: boolean, backgroundColor: Color = Color.BLACK, depth: number = 1): void {
		let cmd = SetRTCMD.create(renderTexture, clearColor, clearDepth, false, backgroundColor, depth, 0, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 渲染一个Mesh
	 * @param mesh 原始网格信息
	 * @param matrix 网格世界矩阵
	 * @param material 材质
	 * @param submeshIndex 子网格索引 如果索引为
	 * @param subShaderIndex 子shader索引 一般为0
	 */
	drawMesh(mesh: Mesh, matrix: Matrix4x4, material: Material, submeshIndex: number, subShaderIndex: number): void {
		let cmd = DrawMeshCMD.create(mesh, matrix, material, submeshIndex, subShaderIndex, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * 渲染一个Render
	 * @param render 渲染器
	 * @param material 材质
	 * @param subShaderIndex 子shader索引 一般为0
	 */
	drawRender(render: BaseRender, material: Material, subMeshIndex: number = 0): void {
		let cmd = DrawRenderCMD.create(render, material, subMeshIndex, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
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
	drawMeshInstance(mesh: Mesh, subMeshIndex: number = 0, matrixs: Matrix4x4[], material: Material, subShaderIndex: number = 0, instanceProperty: MaterialInstancePropertyBlock, drawnums: number): any {
		if (!LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance))
			return null;
		var drawMeshInstancedCMD = DrawMeshInstancedCMD.create(mesh, subMeshIndex, matrixs, material, subShaderIndex, instanceProperty, drawnums, this);
		this._commands.push(drawMeshInstancedCMD);
		drawMeshInstancedCMD.getRenderCMD && this._renderCMDs.push(drawMeshInstancedCMD.getRenderCMD());
		return drawMeshInstancedCMD;
	}

	/**
	 * add 自定义的渲染命令
	 * @param command 
	 */
	addCustomCMD(command: Command) {
		command._commandBuffer = this;
		this._commands.push(command);
		command.getRenderCMD && this._renderCMDs.push(command.getRenderCMD());
	}

	/**
	 *@internal
	 */
	clear(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].recover();
		this._commands.length = 0;
		this._renderCMDs.length = 0;
	}
}