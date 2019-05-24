package laya.ani.bone {
	
	/**
	 * @private
	 */
	public class PathConstraintData {
		
		public var name:String;
		public var bones:Vector.<int> = new Vector.<int>();
		public var target:String;
		public var positionMode:String;
		public var spacingMode:String;
		public var rotateMode:String;
		public var offsetRotation:Number;
		public var position:Number;
		public var spacing:Number;
		public var rotateMix:Number;
		public var translateMix:Number;
		
		public function PathConstraintData() {
		
		}	
	}
}