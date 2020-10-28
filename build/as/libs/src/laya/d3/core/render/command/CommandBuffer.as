package laya.d3.core.render.command {
	import laya.d3.resource.RenderTexture;
	import laya.d3.shader.Shader3D;
	import laya.d3.shader.ShaderData;
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.resource.models.Mesh;
	import laya.d3.math.Matrix4x4;
	import laya.d3.core.material.Material;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector2;
	import laya.d3.core.render.BaseRender;

	/**
	 * <code>CommandBuffer</code> 类用于创建命令流。
	 */
	public class CommandBuffer {

		/**
		 * 创建一个 <code>CommandBuffer</code> 实例。
		 */

		public function CommandBuffer(){}

		/**
		 * 设置shader图片数据
		 * @param shaderData 
		 * @param nameID 
		 * @param source 
		 */
		public function setShaderDataTexture(shaderData:ShaderData,nameID:Number,source:BaseTexture):void{}

		/**
		 * 设置全局纹理数据
		 * @param nameID 
		 * @param source 
		 */
		public function setGlobalTexture(nameID:Number,source:BaseTexture):void{}

		/**
		 * 设置shader Vector4数据
		 * @param shaderData 
		 * @param nameID 
		 * @param value 
		 */
		public function setShaderDataVector(shaderData:ShaderData,nameID:Number,value:Vector4):void{}

		/**
		 * 设置全局Vector4数据
		 * @param nameID 
		 * @param source 
		 */
		public function setGlobalVector(nameID:Number,source:Vector4):void{}

		/**
		 * 设置shader Vector3数据
		 * @param shaderData 
		 * @param nameID 
		 * @param value 
		 */
		public function setShaderDataVector3(shaderData:ShaderData,nameID:Number,value:Vector3):void{}

		/**
		 * 设置全局Vector3数据
		 * @param nameID 
		 * @param source 
		 */
		public function setGlobalVector3(nameID:Number,source:Vector3):void{}

		/**
		 * 设置shader Vector2数据
		 * @param shaderData 
		 * @param nameID 
		 * @param value 
		 */
		public function setShaderDataVector2(shaderData:ShaderData,nameID:Number,value:Vector2):void{}

		/**
		 * 设置全局Vector2数据
		 * @param nameID Uniform标记
		 * @param source 
		 */
		public function setGlobalVector2(nameID:Number,source:Vector2):void{}

		/**
		 * 设置shader Number属性
		 * @param shaderData 
		 * @param nameID 
		 * @param value 
		 */
		public function setShaderDataNumber(shaderData:ShaderData,nameID:Number,value:Number):void{}

		/**
		 * 设置全局number属性
		 * @param nameID 
		 * @param source 
		 */
		public function setGlobalNumber(nameID:Number,source:Number):void{}

		/**
		 * 设置shader Int属性
		 * @param shaderData 
		 * @param nameID 
		 * @param value 
		 */
		public function setShaderDataInt(shaderData:ShaderData,nameID:Number,value:Number):void{}

		/**
		 * 设置全局int属性
		 * @param nameID 
		 * @param source 
		 */
		public function setGlobalInt(nameID:Number,source:Number):void{}

		/**
		 * 设置shader Matrix属性
		 * @param shaderData 
		 * @param nameID 
		 * @param value 
		 */
		public function setShaderDataMatrix(shaderData:ShaderData,nameID:Number,value:Matrix4x4):void{}

		/**
		 * 设置全局Matrix属性
		 * @param nameID 
		 * @param source 
		 */
		public function setGlobalMatrix(nameID:Number,source:Number):void{}

		/**
		 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
		 * @param source 源纹理。
		 * @param dest 目标纹理。
		 * @param offsetScale 偏移缩放。
		 * @param shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param subShader subShader索引,默认值为0。
		 */
		public function blitScreenQuad(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null):void{}

		/**
		 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
		 * @param source 
		 * @param dest 
		 * @param offsetScale 
		 * @param material 
		 * @param subShader 
		 */
		public function blitScreenQuadByMaterial(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,material:Material = null,subShader:Number = null):void{}

		/**
		 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
		 * @param source 源纹理。
		 * @param dest 目标纹理。
		 * @param offsetScale 偏移缩放。
		 * @param shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param subShader subShader索引,默认值为0。
		 */
		public function blitScreenTriangle(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null,defineCanvas:Boolean = null):void{}

		/**
		 * 设置指令渲染目标
		 */
		public function setRenderTarget(renderTexture:RenderTexture):void{}

		/**
		 * clear渲染纹理
		 * @param clearColor 
		 * @param clearDepth 
		 * @param backgroundColor 
		 * @param depth 
		 */
		public function clearRenderTarget(clearColor:Boolean,clearDepth:Boolean,backgroundColor:Vector4,depth:Number = null):void{}

		/**
		 * 渲染一个Mesh
		 * @param mesh 
		 * @param matrix 
		 * @param material 
		 * @param submeshIndex 
		 * @param shaderPass 
		 */
		public function drawMesh(mesh:Mesh,matrix:Matrix4x4,material:Material,submeshIndex:Number,subShaderIndex:Number):void{}

		/**
		 * 渲染一个Render
		 * @param render 
		 * @param material 
		 * @param subShaderIndex 
		 */
		public function drawRender(render:BaseRender,material:Material,subShaderIndex:Number):void{}
	}

}
