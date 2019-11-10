package laya.display {
	import laya.display.cmd.AlphaCmd;
	import laya.display.cmd.ClipRectCmd;
	import laya.display.cmd.DrawCircleCmd;
	import laya.display.cmd.DrawCurvesCmd;
	import laya.display.cmd.DrawImageCmd;
	import laya.display.cmd.DrawLineCmd;
	import laya.display.cmd.DrawLinesCmd;
	import laya.display.cmd.DrawPathCmd;
	import laya.display.cmd.DrawPieCmd;
	import laya.display.cmd.DrawPolyCmd;
	import laya.display.cmd.DrawRectCmd;
	import laya.display.cmd.DrawTextureCmd;
	import laya.display.cmd.DrawTexturesCmd;
	import laya.display.cmd.DrawTrianglesCmd;
	import laya.display.cmd.FillTextCmd;
	import laya.display.cmd.FillTextureCmd;
	import laya.display.cmd.RestoreCmd;
	import laya.display.cmd.RotateCmd;
	import laya.display.cmd.SaveCmd;
	import laya.display.cmd.ScaleCmd;
	import laya.display.cmd.TransformCmd;
	import laya.display.cmd.TranslateCmd;
	import laya.maths.Matrix;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.resource.Texture;

	/**
	 * <code>Graphics</code> 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
	 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
	 * @see laya.display.Sprite#graphics
	 */
	public class Graphics {

		/**
		 * @private 
		 */
		private var _cmds:*;

		/**
		 * @private 
		 */
		protected var _vectorgraphArray:Array;

		/**
		 * @private 
		 */
		private var _graphicBounds:*;

		/**
		 * @private 
		 */
		public var autoDestroy:Boolean;

		public function Graphics(){}

		/**
		 * <p>销毁此对象。</p>
		 */
		public function destroy():void{}

		/**
		 * <p>清空绘制命令。</p>
		 * @param recoverCmds 是否回收绘图指令数组，设置为true，则对指令数组进行回收以节省内存开销，建议设置为true进行回收，但如果手动引用了数组，不建议回收
		 */
		public function clear(recoverCmds:Boolean = null):void{}

		/**
		 * @private 
		 */
		private var _clearBoundsCache:*;

		/**
		 * @private 
		 */
		private var _initGraphicBounds:*;

		/**
		 * @private 命令流。存储了所有绘制命令。
		 */
		public var cmds:Array;

		/**
		 * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
		 * @param realSize （可选）使用图片的真实大小，默认为false
		 * @return 位置与宽高组成的 一个 Rectangle 对象。
		 */
		public function getBounds(realSize:Boolean = null):Rectangle{
			return null;
		}

		/**
		 * @private 
		 * @param realSize （可选）使用图片的真实大小，默认为false获取端点列表。
		 */
		public function getBoundPoints(realSize:Boolean = null):Array{
			return null;
		}

		/**
		 * 绘制单独图片
		 * @param texture 纹理。
		 * @param x （可选）X轴偏移量。
		 * @param y （可选）Y轴偏移量。
		 * @param width （可选）宽度。
		 * @param height （可选）高度。
		 */
		public function drawImage(texture:Texture,x:Number = null,y:Number = null,width:Number = null,height:Number = null):DrawImageCmd{
			return null;
		}

		/**
		 * 绘制纹理，相比drawImage功能更强大，性能会差一些
		 * @param texture 纹理。
		 * @param x （可选）X轴偏移量。
		 * @param y （可选）Y轴偏移量。
		 * @param width （可选）宽度。
		 * @param height （可选）高度。
		 * @param matrix （可选）矩阵信息。
		 * @param alpha （可选）透明度。
		 * @param color （可选）颜色滤镜。
		 * @param blendMode （可选）混合模式。
		 */
		public function drawTexture(texture:Texture,x:Number = null,y:Number = null,width:Number = null,height:Number = null,matrix:Matrix = null,alpha:Number = null,color:String = null,blendMode:String = null,uv:Array = null):DrawTextureCmd{
			return null;
		}

		/**
		 * 批量绘制同样纹理。
		 * @param texture 纹理。
		 * @param pos 绘制次数和坐标。
		 */
		public function drawTextures(texture:Texture,pos:Array):DrawTexturesCmd{
			return null;
		}

		/**
		 * 绘制一组三角形
		 * @param texture 纹理。
		 * @param x X轴偏移量。
		 * @param y Y轴偏移量。
		 * @param vertices 顶点数组。
		 * @param indices 顶点索引。
		 * @param uvData UV数据。
		 * @param matrix 缩放矩阵。
		 * @param alpha alpha
		 * @param color 颜色变换
		 * @param blendMode blend模式
		 */
		public function drawTriangles(texture:Texture,x:Number,y:Number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:Matrix = null,alpha:Number = null,color:String = null,blendMode:String = null,colorNum:Number = null):DrawTrianglesCmd{
			return null;
		}

		/**
		 * 用texture填充。
		 * @param texture 纹理。
		 * @param x X轴偏移量。
		 * @param y Y轴偏移量。
		 * @param width （可选）宽度。
		 * @param height （可选）高度。
		 * @param type （可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
		 * @param offset （可选）贴图纹理偏移
		 */
		public function fillTexture(texture:Texture,x:Number,y:Number,width:Number = null,height:Number = null,type:String = null,offset:Point = null):FillTextureCmd{
			return null;
		}

		/**
		 * 设置剪裁区域，超出剪裁区域的坐标不显示。
		 * @param x X 轴偏移量。
		 * @param y Y 轴偏移量。
		 * @param width 宽度。
		 * @param height 高度。
		 */
		public function clipRect(x:Number,y:Number,width:Number,height:Number):ClipRectCmd{
			return null;
		}

		/**
		 * 在画布上绘制文本。
		 * @param text 在画布上输出的文本。
		 * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
		 * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
		 * @param font 定义字号和字体，比如"20px Arial"。
		 * @param color 定义文本颜色，比如"#ff0000"。
		 * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		public function fillText(text:String,x:Number,y:Number,font:String,color:String,textAlign:String):FillTextCmd{
			return null;
		}

		/**
		 * 在画布上绘制“被填充且镶边的”文本。
		 * @param text 在画布上输出的文本。
		 * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
		 * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
		 * @param font 定义字体和字号，比如"20px Arial"。
		 * @param fillColor 定义文本颜色，比如"#ff0000"。
		 * @param borderColor 定义镶边文本颜色。
		 * @param lineWidth 镶边线条宽度。
		 * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		public function fillBorderText(text:String,x:Number,y:Number,font:String,fillColor:String,textAlign:String,lineWidth:Number,borderColor:String):FillTextCmd{
			return null;
		}

		/**
		 * * @private
		 */
		public function fillWords(words:Array,x:Number,y:Number,font:String,color:String):FillTextCmd{
			return null;
		}

		/**
		 * * @private
		 */
		public function fillBorderWords(words:Array,x:Number,y:Number,font:String,fillColor:String,borderColor:String,lineWidth:Number):FillTextCmd{
			return null;
		}

		/**
		 * 在画布上绘制文本（没有填色）。文本的默认颜色是黑色。
		 * @param text 在画布上输出的文本。
		 * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
		 * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
		 * @param font 定义字体和字号，比如"20px Arial"。
		 * @param color 定义文本颜色，比如"#ff0000"。
		 * @param lineWidth 线条宽度。
		 * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
		 */
		public function strokeText(text:String,x:Number,y:Number,font:String,color:String,lineWidth:Number,textAlign:String):FillTextCmd{
			return null;
		}

		/**
		 * 设置透明度。
		 * @param value 透明度。
		 */
		public function alpha(alpha:Number):AlphaCmd{
			return null;
		}

		/**
		 * 替换绘图的当前转换矩阵。
		 * @param mat 矩阵。
		 * @param pivotX （可选）水平方向轴心点坐标。
		 * @param pivotY （可选）垂直方向轴心点坐标。
		 */
		public function transform(matrix:Matrix,pivotX:Number = null,pivotY:Number = null):TransformCmd{
			return null;
		}

		/**
		 * 旋转当前绘图。(推荐使用transform，性能更高)
		 * @param angle 旋转角度，以弧度计。
		 * @param pivotX （可选）水平方向轴心点坐标。
		 * @param pivotY （可选）垂直方向轴心点坐标。
		 */
		public function rotate(angle:Number,pivotX:Number = null,pivotY:Number = null):RotateCmd{
			return null;
		}

		/**
		 * 缩放当前绘图至更大或更小。(推荐使用transform，性能更高)
		 * @param scaleX 水平方向缩放值。
		 * @param scaleY 垂直方向缩放值。
		 * @param pivotX （可选）水平方向轴心点坐标。
		 * @param pivotY （可选）垂直方向轴心点坐标。
		 */
		public function scale(scaleX:Number,scaleY:Number,pivotX:Number = null,pivotY:Number = null):ScaleCmd{
			return null;
		}

		/**
		 * 重新映射画布上的 (0,0) 位置。
		 * @param x 添加到水平坐标（x）上的值。
		 * @param y 添加到垂直坐标（y）上的值。
		 */
		public function translate(tx:Number,ty:Number):TranslateCmd{
			return null;
		}

		/**
		 * 保存当前环境的状态。
		 */
		public function save():SaveCmd{
			return null;
		}

		/**
		 * 返回之前保存过的路径状态和属性。
		 */
		public function restore():RestoreCmd{
			return null;
		}

		/**
		 * @private 替换文本内容。
		 * @param text 文本内容。
		 * @return 替换成功则值为true，否则值为flase。
		 */
		public function replaceText(text:String):Boolean{
			return null;
		}

		/**
		 * @private 
		 */
		private var _isTextCmd:*;

		/**
		 * @private 替换文本颜色。
		 * @param color 颜色。
		 */
		public function replaceTextColor(color:String):void{}

		/**
		 * @private 
		 */
		private var _setTextCmdColor:*;

		/**
		 * 加载并显示一个图片。
		 * @param url 图片地址。
		 * @param x （可选）显示图片的x位置。
		 * @param y （可选）显示图片的y位置。
		 * @param width （可选）显示图片的宽度，设置为0表示使用图片默认宽度。
		 * @param height （可选）显示图片的高度，设置为0表示使用图片默认高度。
		 * @param complete （可选）加载完成回调。
		 */
		public function loadImage(url:String,x:Number = null,y:Number = null,width:Number = null,height:Number = null,complete:Function = null):void{}

		/**
		 * 绘制一条线。
		 * @param fromX X轴开始位置。
		 * @param fromY Y轴开始位置。
		 * @param toX X轴结束位置。
		 * @param toY Y轴结束位置。
		 * @param lineColor 颜色。
		 * @param lineWidth （可选）线条宽度。
		 */
		public function drawLine(fromX:Number,fromY:Number,toX:Number,toY:Number,lineColor:String,lineWidth:Number = null):DrawLineCmd{
			return null;
		}

		/**
		 * 绘制一系列线段。
		 * @param x 开始绘制的X轴位置。
		 * @param y 开始绘制的Y轴位置。
		 * @param points 线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
		 * @param lineColor 线段颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）线段宽度。
		 */
		public function drawLines(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number = null):DrawLinesCmd{
			return null;
		}

		/**
		 * 绘制一系列曲线。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param points 线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
		 * @param lineColor 线段颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）线段宽度。
		 */
		public function drawCurves(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number = null):DrawCurvesCmd{
			return null;
		}

		/**
		 * 绘制矩形。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param width 矩形宽度。
		 * @param height 矩形高度。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		public function drawRect(x:Number,y:Number,width:Number,height:Number,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawRectCmd{
			return null;
		}

		/**
		 * 绘制圆形。
		 * @param x 圆点X 轴位置。
		 * @param y 圆点Y 轴位置。
		 * @param radius 半径。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		public function drawCircle(x:Number,y:Number,radius:Number,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawCircleCmd{
			return null;
		}

		/**
		 * 绘制扇形。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param radius 扇形半径。
		 * @param startAngle 开始角度。
		 * @param endAngle 结束角度。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		public function drawPie(x:Number,y:Number,radius:Number,startAngle:Number,endAngle:Number,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawPieCmd{
			return null;
		}

		/**
		 * 绘制多边形。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param points 多边形的点集合。
		 * @param fillColor 填充颜色，或者填充绘图的渐变对象。
		 * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
		 * @param lineWidth （可选）边框宽度。
		 */
		public function drawPoly(x:Number,y:Number,points:Array,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawPolyCmd{
			return null;
		}

		/**
		 * 绘制路径。
		 * @param x 开始绘制的 X 轴位置。
		 * @param y 开始绘制的 Y 轴位置。
		 * @param paths 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
		 * @param brush （可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
		 * @param pen （可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
		 */
		public function drawPath(x:Number,y:Number,paths:Array,brush:* = null,pen:* = null):DrawPathCmd{
			return null;
		}

		/**
		 * @private 绘制带九宫格的图片
		 * @param texture 
		 * @param x 
		 * @param y 
		 * @param width 
		 * @param height 
		 * @param sizeGrid 
		 */
		public function draw9Grid(texture:Texture,x:Number = null,y:Number = null,width:Number = null,height:Number = null,sizeGrid:Array = null):void{}
	}

}
