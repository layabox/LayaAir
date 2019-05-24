package laya.ani.bone {
	
	/**
	 * @private
	 */
	public class IkConstraintData {
		
		public var name:String;
		public var targetBoneName:String;
		public var boneNames:Vector.<String> = new Vector.<String>();
		public var bendDirection:Number = 1;
		public var mix:Number = 1;
		public var isSpine:Boolean = true;
		public var targetBoneIndex:int = -1;
		public var boneIndexs:Vector.<int> = new Vector.<int>();
		
		//TODO:coverage
		public function IkConstraintData() {
		
		}
	
	}

}