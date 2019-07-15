/*[IF-FLASH]*/
package laya.ani.bone {
	improt laya.ani.bone.Transform;
	improt laya.resource.Texture;
	public class SkinSlotDisplayData {
		public var name:String;
		public var attachmentName:String;
		public var type:Number;
		public var transform:Transform;
		public var width:Number;
		public var height:Number;
		public var texture:Texture;
		public var bones:Array;
		public var uvs:Array;
		public var weights:Array;
		public var triangles:Array;
		public var vertices:Array;
		public var lengths:Array;
		public var verLen:Number;
		public function createTexture(currTexture:Texture):Texture{}
		public function destory():void{}
	}

}
