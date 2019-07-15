/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.filters.ColorFilter;
	improt laya.maths.Matrix;
	improt laya.resource.Context;
	improt laya.resource.Texture;
	public class DrawTrianglesCmd {
		public static var ID:String;
		public var texture:Texture;
		public var x:Number;
		public var y:Number;
		public var vertices:Float32Array;
		public var uvs:Float32Array;
		public var indices:Uint16Array;
		public var matrix:Matrix;
		public var alpha:Number;
		public var blendMode:String;
		public var color:ColorFilter;
		public static function create(texture:Texture,x:Number,y:Number,vertices:Float32Array,uvs:Float32Array,indices:Uint16Array,matrix:Matrix,alpha:Number,color:String,blendMode:String):DrawTrianglesCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
