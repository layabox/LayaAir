/*[IF-FLASH]*/
package laya.display {
	improt laya.display.cmd.AlphaCmd;
	improt laya.display.cmd.ClipRectCmd;
	improt laya.display.cmd.DrawCircleCmd;
	improt laya.display.cmd.DrawCurvesCmd;
	improt laya.display.cmd.DrawImageCmd;
	improt laya.display.cmd.DrawLineCmd;
	improt laya.display.cmd.DrawLinesCmd;
	improt laya.display.cmd.DrawPathCmd;
	improt laya.display.cmd.DrawPieCmd;
	improt laya.display.cmd.DrawPolyCmd;
	improt laya.display.cmd.DrawRectCmd;
	improt laya.display.cmd.DrawTextureCmd;
	improt laya.display.cmd.DrawTexturesCmd;
	improt laya.display.cmd.DrawTrianglesCmd;
	improt laya.display.cmd.FillBorderTextCmd;
	improt laya.display.cmd.FillBorderWordsCmd;
	improt laya.display.cmd.FillTextCmd;
	improt laya.display.cmd.FillTextureCmd;
	improt laya.display.cmd.FillWordsCmd;
	improt laya.display.cmd.RestoreCmd;
	improt laya.display.cmd.RotateCmd;
	improt laya.display.cmd.SaveCmd;
	improt laya.display.cmd.ScaleCmd;
	improt laya.display.cmd.StrokeTextCmd;
	improt laya.display.cmd.TransformCmd;
	improt laya.display.cmd.TranslateCmd;
	improt laya.maths.Matrix;
	improt laya.maths.Point;
	improt laya.maths.Rectangle;
	improt laya.resource.Texture;
	public class Graphics {
		private var _cmds:*;
		protected var _vectorgraphArray:Array;
		private var _graphicBounds:*;
		public var autoDestroy:Boolean;

		public function Graphics(){}
		public function destroy():void{}
		public function clear(recoverCmds:Boolean = null):void{}
		private var _clearBoundsCache:*;
		private var _initGraphicBounds:*;
		public var cmds:Array;
		public function getBounds(realSize:Boolean = null):Rectangle{}
		public function getBoundPoints(realSize:Boolean = null):Array{}
		public function drawImage(texture:Texture,x:Number = null,y:Number = null,width:Number = null,height:Number = null):DrawImageCmd{}
		public function drawTexture(texture:Texture,x:Number = null,y:Number = null,width:Number = null,height:Number = null,matrix:Matrix = null,alpha:Number = null,color:String = null,blendMode:String = null,uv:Array = null):DrawTextureCmd{}
		public function drawTextures(texture:Texture,pos:Array):DrawTexturesCmd{}
		public function drawTriangles(texture:Texture,x:Number,y:Number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:Matrix = null,alpha:Number = null,color:String = null,blendMode:String = null):DrawTrianglesCmd{}
		public function fillTexture(texture:Texture,x:Number,y:Number,width:Number = null,height:Number = null,type:String = null,offset:Point = null):FillTextureCmd{}
		public function clipRect(x:Number,y:Number,width:Number,height:Number):ClipRectCmd{}
		public function fillText(text:String,x:Number,y:Number,font:String,color:String,textAlign:String):FillTextCmd{}
		public function fillBorderText(text:String,x:Number,y:Number,font:String,fillColor:String,borderColor:String,lineWidth:Number,textAlign:String):FillBorderTextCmd{}
		public function fillWords(words:Array,x:Number,y:Number,font:String,color:String):FillWordsCmd{}
		public function fillBorderWords(words:Array,x:Number,y:Number,font:String,fillColor:String,borderColor:String,lineWidth:Number):FillBorderWordsCmd{}
		public function strokeText(text:String,x:Number,y:Number,font:String,color:String,lineWidth:Number,textAlign:String):StrokeTextCmd{}
		public function alpha(alpha:Number):AlphaCmd{}
		public function transform(matrix:Matrix,pivotX:Number = null,pivotY:Number = null):TransformCmd{}
		public function rotate(angle:Number,pivotX:Number = null,pivotY:Number = null):RotateCmd{}
		public function scale(scaleX:Number,scaleY:Number,pivotX:Number = null,pivotY:Number = null):ScaleCmd{}
		public function translate(tx:Number,ty:Number):TranslateCmd{}
		public function save():SaveCmd{}
		public function restore():RestoreCmd{}
		public function replaceText(text:String):Boolean{}
		private var _isTextCmd:*;
		public function replaceTextColor(color:String):void{}
		private var _setTextCmdColor:*;
		public function loadImage(url:String,x:Number = null,y:Number = null,width:Number = null,height:Number = null,complete:Function = null):void{}
		public function drawLine(fromX:Number,fromY:Number,toX:Number,toY:Number,lineColor:String,lineWidth:Number = null):DrawLineCmd{}
		public function drawLines(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number = null):DrawLinesCmd{}
		public function drawCurves(x:Number,y:Number,points:Array,lineColor:*,lineWidth:Number = null):DrawCurvesCmd{}
		public function drawRect(x:Number,y:Number,width:Number,height:Number,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawRectCmd{}
		public function drawCircle(x:Number,y:Number,radius:Number,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawCircleCmd{}
		public function drawPie(x:Number,y:Number,radius:Number,startAngle:Number,endAngle:Number,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawPieCmd{}
		public function drawPoly(x:Number,y:Number,points:Array,fillColor:*,lineColor:* = null,lineWidth:Number = null):DrawPolyCmd{}
		public function drawPath(x:Number,y:Number,paths:Array,brush:* = null,pen:* = null):DrawPathCmd{}
		public function draw9Grid(texture:Texture,x:Number = null,y:Number = null,width:Number = null,height:Number = null,sizeGrid:Array = null):void{}
	}

}
