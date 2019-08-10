package laya.d3.shader {
	import laya.d3.shader.SubShader;

	/*
	 * <code>Shader3D</code> 类用于创建Shader3D。
	 */
	public class Shader3D {

		/*
		 * 渲染状态_剔除。
		 */
		public static var RENDER_STATE_CULL:Number;

		/*
		 * 渲染状态_混合。
		 */
		public static var RENDER_STATE_BLEND:Number;

		/*
		 * 渲染状态_混合源。
		 */
		public static var RENDER_STATE_BLEND_SRC:Number;

		/*
		 * 渲染状态_混合目标。
		 */
		public static var RENDER_STATE_BLEND_DST:Number;

		/*
		 * 渲染状态_混合源RGB。
		 */
		public static var RENDER_STATE_BLEND_SRC_RGB:Number;

		/*
		 * 渲染状态_混合目标RGB。
		 */
		public static var RENDER_STATE_BLEND_DST_RGB:Number;

		/*
		 * 渲染状态_混合源ALPHA。
		 */
		public static var RENDER_STATE_BLEND_SRC_ALPHA:Number;

		/*
		 * 渲染状态_混合目标ALPHA。
		 */
		public static var RENDER_STATE_BLEND_DST_ALPHA:Number;

		/*
		 * 渲染状态_混合常量颜色。
		 */
		public static var RENDER_STATE_BLEND_CONST_COLOR:Number;

		/*
		 * 渲染状态_混合方程。
		 */
		public static var RENDER_STATE_BLEND_EQUATION:Number;

		/*
		 * 渲染状态_RGB混合方程。
		 */
		public static var RENDER_STATE_BLEND_EQUATION_RGB:Number;

		/*
		 * 渲染状态_ALPHA混合方程。
		 */
		public static var RENDER_STATE_BLEND_EQUATION_ALPHA:Number;

		/*
		 * 渲染状态_深度测试。
		 */
		public static var RENDER_STATE_DEPTH_TEST:Number;

		/*
		 * 渲染状态_深度写入。
		 */
		public static var RENDER_STATE_DEPTH_WRITE:Number;

		/*
		 * shader变量提交周期，自定义。
		 */
		public static var PERIOD_CUSTOM:Number;

		/*
		 * shader变量提交周期，逐材质。
		 */
		public static var PERIOD_MATERIAL:Number;

		/*
		 * shader变量提交周期，逐精灵和相机，注：因为精灵包含MVP矩阵，为复合属性，所以摄像机发生变化时也应提交。
		 */
		public static var PERIOD_SPRITE:Number;

		/*
		 * shader变量提交周期，逐相机。
		 */
		public static var PERIOD_CAMERA:Number;

		/*
		 * shader变量提交周期，逐场景。
		 */
		public static var PERIOD_SCENE:Number;

		/*
		 * 是否开启调试模式。
		 */
		public static var debugMode:Boolean;

		/*
		 * 通过Shader属性名称获得唯一ID。
		 * @param name Shader属性名称。
		 * @return 唯一ID。
		 */
		public static function propertyNameToID(name:String):Number{
			return null;
		}

		/*
		 * 添加函数库引用。
		 * @param fileName 文件名字。
		 * @param txt 文件内容
		 */
		public static function addInclude(fileName:String,txt:String):void{}

		/*
		 * 编译shader。
		 * @param name Shader名称。
		 * @param subShaderIndex 子着色器索引。
		 * @param passIndex 通道索引。
		 * @param publicDefine 公共宏定义值。
		 * @param spriteDefine 精灵宏定义值。
		 * @param materialDefine 材质宏定义值。
		 */
		public static function compileShader(name:String,subShaderIndex:Number,passIndex:Number,publicDefine:Number,spriteDefine:Number,materialDefine:Number):void{}

		/*
		 * 添加预编译shader文件，主要是处理宏定义
		 */
		public static function add(name:String,attributeMap:* = null,uniformMap:* = null,enableInstancing:Boolean = null):Shader3D{
			return null;
		}

		/*
		 * 获取ShaderCompile3D。
		 * @param name 
		 * @return ShaderCompile3D。
		 */
		public static function find(name:String):Shader3D{
			return null;
		}

		/*
		 * 创建一个 <code>Shader3D</code> 实例。
		 */

		public function Shader3D(name:String = undefined,attributeMap:* = undefined,uniformMap:* = undefined,enableInstancing:Boolean = undefined){}

		/*
		 * 添加子着色器。
		 * @param 子着色器 。
		 */
		public function addSubShader(subShader:SubShader):void{}

		/*
		 * 在特定索引获取子着色器。
		 * @param index 索引。
		 * @return 子着色器。
		 */
		public function getSubShaderAt(index:Number):SubShader{
			return null;
		}
	}

}
