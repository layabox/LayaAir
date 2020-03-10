package laya.resource {
	import laya.display.Sprite;
	import laya.filters.ColorFilter;
	import laya.maths.Matrix;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.utils.HTMLChar;
	import laya.utils.WordText;
	import laya.webgl.shader.d2.value.Value2D;
	import laya.webgl.shader.Shader;
	import laya.webgl.submit.ISubmit;
	import laya.webgl.utils.IndexBuffer2D;
	import laya.webgl.utils.VertexBuffer2D;
	import laya.resource.HTMLCanvas;
	import laya.resource.RenderTexture2D;
	import laya.resource.Texture;

	/**
	 * @private Context扩展类
	 */
	public class Context {
		public static var ENUM_TEXTALIGN_DEFAULT:Number;
		public static var ENUM_TEXTALIGN_CENTER:Number;
		public static var ENUM_TEXTALIGN_RIGHT:Number;
		public static var _SUBMITVBSIZE:Number;
		public static var _MAXSIZE:Number;
		private static var _MAXVERTNUM:*;
		public static var MAXCLIPRECT:Rectangle;
		public static var _COUNT:Number;
		private static var SEGNUM:*;
		private static var _contextcount:*;
		private var _drawTexToDrawTri_Vert:*;
		private var _drawTexToDrawTri_Index:*;
		private var _tempUV:*;
		private var _drawTriUseAbsMatrix:*;
		public static function __init__():void{}

		/**
		 * @private 
		 */
		public function drawImage(...args):void{}

		/**
		 * @private 
		 */
		public function getImageData(...args):*{}

		/**
		 * @private 
		 */
		public function measureText(text:String):*{}

		/**
		 * @private 
		 */
		public function setTransform(...args):void{}

		/**
		 * @private 
		 */
		public function $transform(a:Number,b:Number,c:Number,d:Number,tx:Number,ty:Number):void{}

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */
		public var lineJoin:String;

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */
		public var lineCap:String;

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */
		public var miterLimit:String;

		/**
		 * @private 
		 */
		public function clearRect(x:Number,y:Number,width:Number,height:Number):void{}

		/**
		 * @private 
		 */

		/**
		 * @private 
		 */
		public function drawTexture2(x:Number,y:Number,pivotX:Number,pivotY:Number,m:Matrix,args2:Array):void{}
		public function transformByMatrix(matrix:Matrix,tx:Number,ty:Number):void{}
		public function saveTransform(matrix:Matrix):void{}
		public function restoreTransform(matrix:Matrix):void{}
		public function drawRect(x:Number,y:Number,width:Number,height:Number,fillColor:*,lineColor:*,lineWidth:Number):void{}
		public function alpha(value:Number):void{}
		public function drawCurves(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number):void{}
		private var _fillAndStroke:*;

		/**
		 * Math.PI*2的结果缓存
		 */
		public static var PI2:Number;
		public static function set2DRenderConfig():void{}
		private var _other:*;
		private var _renderNextSubmitIndex:*;
		private var _path:*;
		private var _width:*;
		private var _height:*;
		private var _renderCount:*;
		public var meshlist:Array;
		private var _transedPoints:*;
		private var _temp4Points:*;
		private var _clipID_Gen:*;
		private var _lastMat_a:*;
		private var _lastMat_b:*;
		private var _lastMat_c:*;
		private var _lastMat_d:*;

		/**
		 * 所cacheAs精灵
		 * 对于cacheas bitmap的情况，如果图片还没准备好，需要有机会重画，所以要保存sprite。例如在图片
		 * 加载完成后，调用repaint
		 */
		public var sprite:Sprite;
		private var _fillColor:*;
		private var _flushCnt:*;
		private var defTexture:*;
		public var drawTexAlign:Boolean;
		public var isMain:Boolean;

		public function Context(){}
		public function clearBG(r:Number,g:Number,b:Number,a:Number):void{}

		/**
		 * 释放占用内存
		 * @param keepRT 是否保留rendertarget
		 */
		private var _releaseMem:*;

		/**
		 * 释放所有资源
		 * @param keepRT 是否保留rendertarget
		 */
		public function destroy(keepRT:Boolean = null):void{}
		public function clear():void{}

		/**
		 * 设置ctx的size，这个不允许直接设置，必须是canvas调过来的。所以这个函数里也不用考虑canvas相关的东西
		 * @param w 
		 * @param h 
		 */
		public function size(w:Number,h:Number):void{}

		/**
		 * 当前canvas请求保存渲染结果。
		 * 实现：
		 * 如果value==true，就要给_target赋值
		 * @param value 
		 */
		public var asBitmap:Boolean;

		/**
		 * 获得当前矩阵的缩放值
		 * 避免每次都计算getScaleX
		 * @return 
		 */
		public function getMatScaleX():Number{
			return null;
		}
		public function getMatScaleY():Number{
			return null;
		}
		public function setFillColor(color:Number):void{}
		public function getFillColor():Number{
			return null;
		}
		public var fillStyle:*;
		public var globalAlpha:Number;
		public var textAlign:String;
		public var textBaseline:String;
		public var globalCompositeOperation:String;
		public var strokeStyle:*;
		public function translate(x:Number,y:Number):void{}
		public var lineWidth:Number;
		public function save():void{}
		public function restore():void{}
		public var font:String;
		public function fillText(txt:*,x:Number,y:Number,fontStr:String,color:String,align:String,lineWidth:Number = null,borderColor:String = null):void{}
		public function drawText(text:*,x:Number,y:Number,font:String,color:String,textAlign:String):void{}
		public function fillWords(words:Array,x:Number,y:Number,fontStr:String,color:String):void{}
		public function strokeWord(text:*,x:Number,y:Number,font:String,color:String,lineWidth:Number,textAlign:String):void{}
		public function fillBorderText(txt:*,x:Number,y:Number,font:String,color:String,borderColor:String,lineWidth:Number,textAlign:String):void{}
		public function fillBorderWords(words:Array,x:Number,y:Number,font:String,color:String,borderColor:String,lineWidth:Number):void{}
		private var _fillRect:*;
		public function fillRect(x:Number,y:Number,width:Number,height:Number,fillStyle:*):void{}
		public function fillTexture(texture:Texture,x:Number,y:Number,width:Number,height:Number,type:String,offset:Point,other:*):void{}

		/**
		 * 反正只支持一种filter，就不要叫setFilter了，直接叫setColorFilter
		 * @param value 
		 */
		public function setColorFilter(filter:ColorFilter):void{}
		public function drawTexture(tex:Texture,x:Number,y:Number,width:Number,height:Number):void{}
		public function drawTextures(tex:Texture,pos:Array,tx:Number,ty:Number):void{}

		/**
		 * 为drawTexture添加一个新的submit。类型是 SubmitTexture
		 * @param vbSize 
		 * @param alpha 
		 * @param webGLImg 
		 * @param tex 
		 */
		private var _drawTextureAddSubmit:*;
		public function submitDebugger():void{}
		private var isSameClipInfo:*;
		public function drawCallOptimize(enable:Boolean):Boolean{
			return null;
		}

		/**
		 * 转换4个顶点。为了效率这个不做任何检查。需要调用者的配合。
		 * @param a 输入。8个元素表示4个点
		 * @param out 输出
		 */
		public function transform4Points(a:Array,m:Matrix,out:Array):void{}

		/**
		 * pt所描述的多边形完全在clip外边，整个被裁掉了
		 * @param pt 
		 * @return 
		 */
		public function clipedOff(pt:Array):Boolean{
			return null;
		}

		/**
		 * 应用当前矩阵。把转换后的位置放到输出数组中。
		 * @param x 
		 * @param y 
		 * @param w 
		 * @param h 
		 * @param italicDeg 倾斜角度，单位是度。0度无，目前是下面不动。以后要做成可调的
		 */
		public function transformQuad(x:Number,y:Number,w:Number,h:Number,italicDeg:Number,m:Matrix,out:Array):void{}
		public function pushRT():void{}
		public function popRT():void{}
		public function useRT(rt:RenderTexture2D):void{}

		/**
		 * 异步执行rt的restore函数
		 * @param rt 
		 */
		public function RTRestore(rt:RenderTexture2D):void{}

		/**
		 * 强制拒绝submit合并
		 * 例如切换rt的时候
		 */
		public function breakNextMerge():void{}
		private var _repaintSprite:*;

		/**
		 * @param tex 
		 * @param x 
		 * @param y 
		 * @param width 
		 * @param height 
		 * @param transform 图片本身希望的矩阵
		 * @param tx 节点的位置
		 * @param ty 
		 * @param alpha 
		 */
		public function drawTextureWithTransform(tex:Texture,x:Number,y:Number,width:Number,height:Number,transform:Matrix,tx:Number,ty:Number,alpha:Number,blendMode:String,colorfilter:ColorFilter = null,uv:Array = null):void{}

		/**
		 * * 把ctx中的submits提交。结果渲染到target上
		 * @param ctx 
		 * @param target 
		 */
		private var _flushToTarget:*;
		public function drawCanvas(canvas:HTMLCanvas,x:Number,y:Number,width:Number,height:Number):void{}
		public function drawTarget(rt:RenderTexture2D,x:Number,y:Number,width:Number,height:Number,m:Matrix,shaderValue:Value2D,uv:Array = null,blend:Number = null):Boolean{
			return null;
		}
		public function drawTriangles(tex:Texture,x:Number,y:Number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:Matrix,alpha:Number,color:ColorFilter,blendMode:String,colorNum:Number = null):void{}
		public function transform(a:Number,b:Number,c:Number,d:Number,tx:Number,ty:Number):void{}
		public function setTransformByMatrix(value:Matrix):void{}
		public function rotate(angle:Number):void{}
		public function scale(scaleX:Number,scaleY:Number):void{}
		public function clipRect(x:Number,y:Number,width:Number,height:Number):void{}

		/**
		 * 从setIBVB改为drawMesh
		 * type 参数不知道是干什么的，先删掉。offset好像跟attribute有关，删掉
		 * @param x 
		 * @param y 
		 * @param ib 
		 * @param vb 
		 * @param numElement 
		 * @param mat 
		 * @param shader 
		 * @param shaderValues 
		 * @param startIndex 
		 * @param offset 
		 */
		public function drawMesh(x:Number,y:Number,ib:IndexBuffer2D,vb:VertexBuffer2D,numElement:Number,mat:Matrix,shader:Shader,shaderValues:Value2D,startIndex:Number = null):void{}
		public function addRenderObject(o:ISubmit):void{}

		/**
		 * @param start 
		 * @param end 
		 */
		public function submitElement(start:Number,end:Number):Number{
			return null;
		}
		public function flush():Number{
			return null;
		}

		/**
		 * *****************************************start矢量绘制**************************************************
		 */
		public function beginPath(convex:Boolean = null):void{}
		public function closePath():void{}

		/**
		 * 添加一个path。
		 * @param points [x,y,x,y....]	这个会被保存下来，所以调用者需要注意复制。
		 * @param close 是否闭合
		 * @param convex 是否是凸多边形。convex的优先级是这个最大。fill的时候的次之。其实fill的时候不应该指定convex，因为可以多个path
		 * @param dx 需要添加的平移。这个需要在应用矩阵之前应用。
		 * @param dy 
		 */
		public function addPath(points:Array,close:Boolean,convex:Boolean,dx:Number,dy:Number):void{}
		public function fill():void{}
		private var addVGSubmit:*;
		public function stroke():void{}
		public function moveTo(x:Number,y:Number):void{}

		/**
		 * @param x 
		 * @param y 
		 * @param b 是否应用矩阵
		 */
		public function lineTo(x:Number,y:Number):void{}
		public function arcTo(x1:Number,y1:Number,x2:Number,y2:Number,r:Number):void{}
		public function arc(cx:Number,cy:Number,r:Number,startAngle:Number,endAngle:Number,counterclockwise:Boolean = null,b:Boolean = null):void{}
		public function quadraticCurveTo(cpx:Number,cpy:Number,x:Number,y:Number):void{}

		/**
		 * 把颜色跟当前设置的alpha混合
		 * @return 
		 */
		public function mixRGBandAlpha(color:Number):Number{
			return null;
		}
		public function strokeRect(x:Number,y:Number,width:Number,height:Number,parameterLineWidth:Number):void{}
		public function clip():void{}

		/**
		 * *****************************************end矢量绘制**************************************************
		 */
		public function drawParticle(x:Number,y:Number,pt:*):void{}
		private var _getPath:*;

		/**
		 * 获取canvas
		 */
		public function get canvas():HTMLCanvas{
				return null;
		}
		private static var tmpuv1:*;

		/**
		 * 专用函数。通过循环创建来水平填充
		 * @param tex 
		 * @param bmpid 
		 * @param uv 希望循环的部分的uv
		 * @param oriw 
		 * @param orih 
		 * @param x 
		 * @param y 
		 * @param w 
		 */
		private var _fillTexture_h:*;

		/**
		 * 专用函数。通过循环创建来垂直填充
		 * @param tex 
		 * @param imgid 
		 * @param uv 
		 * @param oriw 
		 * @param orih 
		 * @param x 
		 * @param y 
		 * @param h 
		 */
		private var _fillTexture_v:*;
		private static var tmpUV:*;
		private static var tmpUVRect:*;
		public function drawTextureWithSizeGrid(tex:Texture,tx:Number,ty:Number,width:Number,height:Number,sizeGrid:Array,gx:Number,gy:Number):void{}
	}

}
