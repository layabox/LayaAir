package laya.ani {
	
	/**
	 * @private
	 * @author ...
	 */
	public class AnimationNodeContent {
		public var name:String;
		public var parentIndex:int;
		public var parent:AnimationNodeContent;
		public var keyframeWidth:int;
		public var lerpType:int;
		public var interpolationMethod:Array;
		public var childs:Array;
		public var keyFrame:Vector.<KeyFramesContent>;// = new Vector.<KeyFramesContent>;
		public var playTime:Number;
		public var extenData:ArrayBuffer;
		public var dataOffset:int;
	}
}