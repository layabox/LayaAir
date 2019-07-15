/*[IF-FLASH]*/
package laya.resource {
	improt laya.display.Sprite;
	improt laya.filters.ColorFilter;
	improt laya.maths.Matrix;
	improt laya.maths.Point;
	improt laya.maths.Rectangle;
	improt laya.webgl.shader.d2.value.Value2D;
	improt laya.webgl.shader.Shader;
	improt laya.webgl.submit.ISubmit;
	improt laya.webgl.utils.IndexBuffer2D;
	improt laya.webgl.utils.VertexBuffer2D;
	improt laya.resource.Texture;
	improt laya.resource.HTMLCanvas;
	improt laya.resource.RenderTexture2D;
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
		public function drawImage(...args):void{}
		public function getImageData(...args):*{}
		public function measureText(text:String):*{}
		public function setTransform(...args):void{}
		public function $transform(a:Number,b:Number,c:Number,d:Number,tx:Number,ty:Number):void{}
		public var lineJoin:String;
		public var lineCap:String;
		public var miterLimit:String;
		public function clearRect(x:Number,y:Number,width:Number,height:Number):void{}
		public function drawTexture2(x:Number,y:Number,pivotX:Number,pivotY:Number,m:Matrix,args2:Array):void{}
		public function transformByMatrix(matrix:Matrix,tx:Number,ty:Number):void{}
		public function saveTransform(matrix:Matrix):void{}
		public function restoreTransform(matrix:Matrix):void{}
		public function drawRect(x:Number,y:Number,width:Number,height:Number,fillColor:*,lineColor:*,lineWidth:Number):void{}
		public function alpha(value:Number):void{}
		public function drawCurves(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number):void{}
		private var _fillAndStroke:*;
		public static var PI2:Number;
		public static function set2DRenderConfig():void{}
		private var _other:*;
		private var _renderNextSubmitIndex:*;
		private var _path:*;
		private var _primitiveValue2D:*;
		private var _width:*;
		private var _height:*;
		private var _renderCount:*;
		private var _isConvexCmd:*;
		public var meshlist:Array;
		private var _transedPoints:*;
		private var _temp4Points:*;
		private var _clipID_Gen:*;
		private var _lastMat_a:*;
		private var _lastMat_b:*;
		private var _lastMat_c:*;
		private var _lastMat_d:*;
		public var sprite:Sprite;
		private static var _textRender:*;
		private var _fillColor:*;
		private var _flushCnt:*;
		private var defTexture:*;
		public var drawTexAlign:Boolean;
		public var isMain:Boolean;

		public function Context(){}
		public function clearBG(r:Number,g:Number,b:Number,a:Number):void{}
		private var _releaseMem:*;
		public function destroy(keepRT:Boolean = null):void{}
		public function clear():void{}
		public function size(w:Number,h:Number):void{}
		public var asBitmap:Boolean;
		public function getMatScaleX():Number{}
		public function getMatScaleY():Number{}
		public function setFillColor(color:Number):void{}
		public function getFillColor():Number{}
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
		public function fillText(txt:String,x:Number,y:Number,fontStr:String,color:String,align:String):void{}
		private var _fillText:*;
		public function fillWords(words:Array,x:Number,y:Number,fontStr:String,color:String):void{}
		public function fillBorderWords(words:Array,x:Number,y:Number,font:String,color:String,borderColor:String,lineWidth:Number):void{}
		public function drawText(text:*,x:Number,y:Number,font:String,color:String,textAlign:String):void{}
		public function strokeWord(text:*,x:Number,y:Number,font:String,color:String,lineWidth:Number,textAlign:String):void{}
		public function fillBorderText(txt:*,x:Number,y:Number,fontStr:String,fillColor:String,borderColor:String,lineWidth:Number,textAlign:String):void{}
		private var _fillBorderText:*;
		private var _fillRect:*;
		public function fillRect(x:Number,y:Number,width:Number,height:Number,fillStyle:*):void{}
		public function fillTexture(texture:Texture,x:Number,y:Number,width:Number,height:Number,type:String,offset:Point,other:*):void{}
		public function setColorFilter(filter:ColorFilter):void{}
		public function drawTexture(tex:Texture,x:Number,y:Number,width:Number,height:Number):void{}
		public function drawTextures(tex:Texture,pos:Array,tx:Number,ty:Number):void{}
		private var _drawTextureAddSubmit:*;
		public function submitDebugger():void{}
		private var isSameClipInfo:*;
		public function drawCallOptimize(enbale:Boolean):Boolean{}
		public function transform4Points(a:Array,m:Matrix,out:Array):void{}
		public function clipedOff(pt:Array):Boolean{}
		public function transformQuad(x:Number,y:Number,w:Number,h:Number,italicDeg:Number,m:Matrix,out:Array):void{}
		public function pushRT():void{}
		public function popRT():void{}
		public function useRT(rt:RenderTexture2D):void{}
		public function RTRestore(rt:RenderTexture2D):void{}
		public function breakNextMerge():void{}
		private var _repaintSprite:*;
		public function drawTextureWithTransform(tex:Texture,x:Number,y:Number,width:Number,height:Number,transform:Matrix,tx:Number,ty:Number,alpha:Number,blendMode:String,colorfilter:ColorFilter = null,uv:Array = null):void{}
		private var _flushToTarget:*;
		public function drawCanvas(canvas:HTMLCanvas,x:Number,y:Number,width:Number,height:Number):void{}
		public function drawTarget(rt:RenderTexture2D,x:Number,y:Number,width:Number,height:Number,m:Matrix,shaderValue:Value2D,uv:Array = null,blend:Number = null):Boolean{}
		public function drawTriangles(tex:Texture,x:Number,y:Number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:Matrix,alpha:Number,color:ColorFilter,blendMode:String):void{}
		public function transform(a:Number,b:Number,c:Number,d:Number,tx:Number,ty:Number):void{}
		public function setTransformByMatrix(value:Matrix):void{}
		public function rotate(angle:Number):void{}
		public function scale(scaleX:Number,scaleY:Number):void{}
		public function clipRect(x:Number,y:Number,width:Number,height:Number):void{}
		public function drawMesh(x:Number,y:Number,ib:IndexBuffer2D,vb:VertexBuffer2D,numElement:Number,mat:Matrix,shader:Shader,shaderValues:Value2D,startIndex:Number = null):void{}
		public function addRenderObject(o:ISubmit):void{}
		public function submitElement(start:Number,end:Number):Number{}
		public function flush():Number{}
		public function beginPath(convex:Boolean = null):void{}
		public function closePath():void{}
		public function addPath(points:Array,close:Boolean,convex:Boolean,dx:Number,dy:Number):void{}
		public function fill():void{}
		private var addVGSubmit:*;
		public function stroke():void{}
		public function moveTo(x:Number,y:Number):void{}
		public function lineTo(x:Number,y:Number):void{}
		public function arcTo(x1:Number,y1:Number,x2:Number,y2:Number,r:Number):void{}
		public function arc(cx:Number,cy:Number,r:Number,startAngle:Number,endAngle:Number,counterclockwise:Boolean = null,b:Boolean = null):void{}
		public function quadraticCurveTo(cpx:Number,cpy:Number,x:Number,y:Number):void{}
		public function mixRGBandAlpha(color:Number):Number{}
		public function strokeRect(x:Number,y:Number,width:Number,height:Number,parameterLineWidth:Number):void{}
		public function clip():void{}
		public function drawParticle(x:Number,y:Number,pt:*):void{}
		private var _getPath:*;
		public function get canvas():HTMLCanvas{};
		private static var tmpuv1:*;
		private var _fillTexture_h:*;
		private var _fillTexture_v:*;
		private static var tmpUV:*;
		private static var tmpUVRect:*;
		public function drawTextureWithSizeGrid(tex:Texture,tx:Number,ty:Number,width:Number,height:Number,sizeGrid:Array,gx:Number,gy:Number):void{}
	}

}
