
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
import { RenderElement } from "../RenderElement";
import { DrawRenderElementCMD } from "./DrawRenderElemenetCMD";

/**
 * @en The `CommandBuffer` Class used to create command buffer
 * @zh `CommandBuffer` 类用于创建命令缓冲区。
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

	/** @ignore */
	constructor(name: string = null, shadowCaster: boolean = false) {
		this._name = name;
		this._shadow = shadowCaster;
	}

	/**
	 * @en The name of the command buffer.
	 * @zh 命令缓冲区的名称。
	 */
	get name(): string {
		return this._name;
	}

	/**
	 * @en Whether the command buffer casts shadows.
	 * @zh 命令缓冲区是否投射阴影。
	 */
	get casterShadow() {
		return this._shadow;
	}

	/**
	 * @en The rendering context for the command buffer.
	 * @zh 命令缓冲区的渲染上下文。
	 */
	get context() {
		return this._context;
	}

	set context(value: RenderContext3D) {
		this._context = value;
	}


	/**
	 * @en Executes all rendering commands.
	 * @zh 调用所有渲染指令。
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

	/**
	 * @en Executes a single command from the command buffer.
	 * @zh 从命令缓冲区执行单个命令。
	 */
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

	/**
	 * @en Gets the number of commands contained in the command buffer
	 * @zh 获取命令缓冲区包含的命令数量
	 */
	getCommandsSize(): number {
		return this._commands.length;
	}

	/**
	 * @en Sets the texture data for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The Uniform ID for the texture.
	 * @param source The source of the texture.
	 * @zh 设置着色器的纹理数据。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 纹理的 Uniform ID。
	 * @param source 纹理源。
	 */
	setShaderDataTexture(shaderData: ShaderData, nameID: number, source: BaseTexture): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, source, ShaderDataType.Texture2D, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());

	}

	/**
	 * @en Sets the global texture data.
	 * @param nameID The Uniform ID for the texture.
	 * @param source The source of the texture.
	 * @zh 设置全局纹理数据。
	 * @param nameID 纹理的 Uniform ID。
	 * @param source 纹理源。
	 */
	setGlobalTexture(nameID: number, source: BaseTexture) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Texture2D, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the color data for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The color value.
	 * @zh 设置着色器的颜色数据。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据 ID。
	 * @param value 颜色值。
	 */
	setShaderDataColor(shaderData: ShaderData, nameID: number, value: Color): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Color, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global color.
	 * @param nameID The ID of the data.
	 * @param source The color data to be set.
	 * @zh 设置全局颜色。
	 * @param nameID 数据ID。
	 * @param source 要设置的颜色数据。
	 */
	setGlobalColor(nameID: number, source: Color) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Color, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the Vector4 data for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The Vector4 data to be set.
	 * @zh 设置着色器的 Vector4 数据。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据ID
	 * @param value 要设置的Vector4数据。
	 */
	setShaderDataVector(shaderData: ShaderData, nameID: number, value: Vector4): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Vector4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global Vector4 data.
	 * @param nameID The ID of the data.
	 * @param source The Vector4 data to be set.
	 * @zh 设置全局 Vector4 数据。
	 * @param nameID 数据ID
	 * @param source 要设置的Vector4数据。
	 */
	setGlobalVector(nameID: number, source: Vector4) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Vector4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the Vector3 data for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The Vector3 data to be set.
	 * @zh 设置着色器的 Vector3 数据。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据ID
	 * @param value 要设置的Vector3数据。
	 */
	setShaderDataVector3(shaderData: ShaderData, nameID: number, value: Vector3): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Vector3, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global Vector3 data.
	 * @param nameID The ID of the data.
	 * @param source The Vector3 data to be set.
	 * @zh 设置全局 Vector3 数据。
	 * @param nameID 数据ID
	 * @param source 要设置的Vector3数据。
	 */
	setGlobalVector3(nameID: number, source: Vector3) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Vector3, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the Vector2 data for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The Vector2 data to be set.
	 * @zh 设置着色器的 Vector2 数据。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据ID
	 * @param value 要设置的Vector2数据。
	 */
	setShaderDataVector2(shaderData: ShaderData, nameID: number, value: Vector2): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Vector2, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global Vector2 data.
	 * @param nameID The ID of the data.
	 * @param source The Vector2 data to be set.
	 * @zh 设置全局 Vector2 数据。
	 * @param nameID 数据ID
	 * @param source 要设置的Vector2数据。
	 */
	setGlobalVector2(nameID: number, source: Vector2) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Vector2, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the Number property for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The Number data to be set.
	 * @zh 设置着色器的 Number 属性。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据ID
	 * @param value 要设置的Number数据。
	 */
	setShaderDataNumber(shaderData: ShaderData, nameID: number, value: number): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Float, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global Number property.
	 * @param nameID The ID of the data.
	 * @param source The Number data to be set.
	 * @zh 设置全局 Number 属性。
	 * @param nameID 数据ID
	 * @param source 要设置的Number数据。
	 */
	setGlobalNumber(nameID: number, source: number) {

		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Float, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the Int property for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The Int data to be set.
	 * @zh 设置着色器的 Int 属性。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据ID
	 * @param value 要设置的Int数据。
	 */
	setShaderDataInt(shaderData: ShaderData, nameID: number, value: number): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Int, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global integer property.
	 * @param nameID The ID of the data.
	 * @param source The data to be set.
	 * @zh 设置全局的整型属性。
	 * @param nameID 数据ID
	 * @param source 要设置的数据。
	 */
	setGlobalInt(nameID: number, source: number) {

		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Int, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the Matrix property for a shader.
	 * @param shaderData The collection of shader data.
	 * @param nameID The ID of the data.
	 * @param value The Matrix data to be set.
	 * @zh 设置着色器的矩阵属性。
	 * @param shaderData 着色器数据集合。
	 * @param nameID 数据ID。
	 * @param value 要设置的矩阵数据。
	 */
	setShaderDataMatrix(shaderData: ShaderData, nameID: number, value: Matrix4x4): void {
		let cmd = SetShaderDataCMD.create(shaderData, nameID, value, ShaderDataType.Matrix4x4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets a shader define.
	 * @param shaderData The collection of shader data.
	 * @param define The shader define to be set.
	 * @param value A boolean value indicating whether to add (true) or remove (false) the define.
	 * @zh 设置着色器的定义。
	 * @param shaderData 着色器数据集合。
	 * @param define 要设置的着色器定义。
	 * @param value 布尔值，表示是添加（true）还是移除（false）该定义。
	 */
	setShaderDefine(shaderData: ShaderData, define: ShaderDefine, value: boolean): void {
		let cmd = SetDefineCMD.create(shaderData, define, value, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the global Matrix property.
	 * @param nameID The ID of the data.
	 * @param source The Matrix data to be set.
	 * @zh 设置全局的矩阵属性。
	 * @param nameID 数据ID
	 * @param source 要设置的矩阵数据。
	 */
	setGlobalMatrix(nameID: number, source: number) {
		let cmd = SetGlobalShaderDataCMD.create(nameID, source, ShaderDataType.Matrix4x4, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Adds a fullscreen quad rendering command to the command buffer.
	 * @param source The source texture. If null, the previous render result is used as the original texture.
	 * @param dest The destination texture. If null, it renders directly to the final canvas.
	 * @param offsetScale Offset scaling
	 * @param shader The shader. If null, the internal copy shader is used without any processing.
	 * @param shaderData The shader data. If null, only the sourceTexture is accepted.
	 * @param subShader The subShader index, defaults to 0.
	 * @zh 向命令缓冲区添加一条通过全屏四边形渲染命令。
	 * @param source 源纹理。如果为null，则使用之前的渲染结果作为原纹理。
	 * @param dest 目标纹理。如果为null，直接渲染到最终画布。
	 * @param offsetScale 偏移缩放。
	 * @param shader 着色器。如果为null，则使用内部拷贝着色器，不进行任何处理。
	 * @param shaderData 着色器数据。如果为null，只接受sourceTexture。
	 * @param subShader SubShader索引，默认值为0。
	 */
	blitScreenQuad(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		let cmd = BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Add a command to render the source texture to the target texture through a full screen quadrilateral.
	 * @param source The source texture. If null, the previous render result is used as the original texture.
	 * @param dest The destination texture. If null, it renders directly to the final canvas.
	 * @param offsetScale Offset scaling.
	 * @param material The material.
	 * @param subShader The shader index.
	 * @zh 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
	 * @param source 源纹理。如果为null，则使用之前的渲染结果作为原纹理。
	 * @param dest 目标纹理。如果为null，直接渲染到最终画布。
	 * @param offsetScale 偏移缩放。
	 * @param material 材质。
	 * @param subShader Shader索引。
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
	 * @en Add a command to render the source texture to the target texture through full screen triangles.
	 * @param source The source texture.
	 * @param dest The destination texture.
	 * @param offsetScale Offset scaling.
	 * @param shader The shader. If null, the internal copy shader is used without any processing.
	 * @param shaderData The shader data. If null, only the sourceTexture is accepted.
	 * @param subShader The subShader index, defaults to 0.
	 * @zh 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
	 * @param source 源纹理。
	 * @param dest 目标纹理。
	 * @param offsetScale 偏移缩放。
	 * @param shader 着色器。如果为null，则使用内部拷贝着色器，不进行任何处理。
	 * @param shaderData 着色器数据。如果为null，只接受sourceTexture。
	 * @param subShader SubShader索引，默认值为0。
	 */
	blitScreenTriangle(source: BaseTexture, dest: RenderTexture, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null, subShader: number = 0): void {
		let cmd = BlitScreenQuadCMD.create(source, dest, offsetScale, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Sets the render target for the command buffer.
	 * @param renderTexture The render target texture.
	 * @param clearColor Whether to clear the color buffer.
	 * @param clearDepth Whether to clear the depth buffer.
	 * @param backgroundColor The background color when clearing. Defaults to black.
	 * @param depth The depth value when clearing. Defaults to 1.
	 * @zh 设置命令缓冲区的渲染目标。
	 * @param renderTexture 渲染目标纹理。
	 * @param clearColor 是否清除颜色缓冲区。
	 * @param clearDepth 是否清除深度缓冲区。
	 * @param backgroundColor 清除时的背景颜色，默认为黑色。
	 * @param depth 清除时的深度值，默认为1。
	 */
	setRenderTarget(renderTexture: RenderTexture, clearColor: boolean, clearDepth: boolean, backgroundColor: Color = Color.BLACK, depth: number = 1): void {
		let cmd = SetRTCMD.create(renderTexture, clearColor, clearDepth, false, backgroundColor, depth, 0, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Renders a Mesh.
	 * @param mesh The original mesh information.
	 * @param matrix The world matrix of the mesh.
	 * @param material The material applied to the mesh.
	 * @param submeshIndex The index of the submesh.
	 * @param subShaderIndex The index of the sub-shader, generally 0.
	 * @zh 渲染一个网格。
	 * @param mesh 原始网格信息。
	 * @param matrix 网格的世界矩阵。
	 * @param material 应用到网格的材质。
	 * @param submeshIndex 子网格的索引。
	 * @param subShaderIndex 子着色器的索引，默认为0。
	 */
	drawMesh(mesh: Mesh, matrix: Matrix4x4, material: Material, submeshIndex: number, subShaderIndex: number): void {
		let cmd = DrawMeshCMD.create(mesh, matrix, material, submeshIndex, subShaderIndex, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Renders a Render object.
	 * @param render The renderer object to be rendered.
	 * @param material The material applied to the renderer.
	 * @param subMeshIndex The index of the sub-shader, defaults to 0.
	 * @zh 渲染一个渲染对象。
	 * @param render 要渲染的渲染器对象。
	 * @param material 应用到渲染器的材质。
	 * @param subMeshIndex 子着色器的索引，默认为0。
	 */
	drawRender(render: BaseRender, material: Material, subMeshIndex: number = 0): void {
		let cmd = DrawRenderCMD.create(render, material, subMeshIndex, this);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Renders a RenderElement.
	 * @param renderElement The RenderElement to be rendered.
	 * @zh 渲染一个渲染元素。
	 * @param renderElement 要渲染的渲染元素。
	 */
	drawRenderElement(renderElement: RenderElement) {
		let cmd = DrawRenderElementCMD.create(renderElement);
		this._commands.push(cmd);
		cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
	}

	/**
	 * @en Renders a Mesh using instanced rendering for dynamic batching.
	 * @param mesh The original mesh information.
	 * @param subMeshIndex The index of the mesh.
	 * @param matrixs An array of world matrices for rendering, describing the position of each Mesh to be rendered. If null, no world matrix buffer will be created or updated.
	 * @param material The material used for rendering.
	 * @param subShaderIndex The shader index of the rendering material.
	 * @param instanceProperty Custom properties for the instance.
	 * @param drawnums The number of instances to render.
	 * @zh 使用实例化渲染动态合批方式渲染网格。
	 * @param mesh 原始网格信息。
	 * @param subMeshIndex 网格索引。
	 * @param matrixs 渲染的世界矩阵数组，描述每个网格需要渲染的位置。如果为null，则不会创建或更新世界矩阵缓冲区。
	 * @param material 渲染材质。
	 * @param subShaderIndex 渲染材质的着色器索引。
	 * @param instanceProperty 实例的自定义属性。
	 * @param drawnums 要渲染的实例数量。
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
	 * @en Adds a custom render command.
	 * @param command The custom command to add.
	 * @zh 添加一个自定义的渲染命令。
	 * @param command 要添加的自定义命令。
	 */
	addCustomCMD(command: Command) {
		command._commandBuffer = this;
		this._commands.push(command);
		command.getRenderCMD && this._renderCMDs.push(command.getRenderCMD());
	}

	/**
	 * @internal
	 * @en Clears the command buffer.
	 * @zh 清除命令缓冲区。
	 */
	clear(): void {
		for (var i: number = 0, n: number = this._commands.length; i < n; i++)
			this._commands[i].recover();
		this._commands.length = 0;
		this._renderCMDs.length = 0;
	}
}