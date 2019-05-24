package laya.ani.bone {
	/**
	 * @private
	 */
	public class SlotData {
		public var name:String;
		public var displayArr:Array = [];
		
		public function getDisplayByName(name:String):int
		{
			var tDisplay:SkinSlotDisplayData;
			for (var i:int = 0, n:int = displayArr.length; i < n; i++)
			{
				tDisplay = displayArr[i];
				if (tDisplay.attachmentName == name)
				{
					return i;
				}
			}
			return -1;
		}
	}
	
}