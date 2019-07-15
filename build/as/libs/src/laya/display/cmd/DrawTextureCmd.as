/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.filters.ColorFilter;
	improt laya.maths.Matrix;
	improt laya.resource.Context;
	improt laya.resource.Texture;
	public class DrawTextureCmd {
		public static var ID:String;
		public var texture:Texture;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var matrix:Matrix;
		public var alpha:Number;
		public var color:String;
		public var colorFlt:ColorFilter;
		public var blendMode:String;
		public var uv:Array;
		public static function create(texture:Texture,x:Number,y:Number,width:Number,height:Number,matrix:Matrix,alpha:Number,color:String,blendMode:String,uv:Array = null):DrawTextureCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
