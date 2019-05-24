package laya.ani.bone 
{
	/**
	 * @private
	 */
	public class DeformSlotDisplayData 
	{
		
		public var boneSlot:BoneSlot;
		public var slotIndex:int = -1;
		public var attachment:String;
		public var timeList:Vector.<Number> = new Vector.<Number>();
		public var vectices:Vector.<Array> = new Vector.<Array>();
		public var tweenKeyList:Vector.<Boolean> = new Vector.<Boolean>();
		
		public var deformData:Array;
		public var frameIndex:int = 0;
		
		//TODO:coverage
		public function DeformSlotDisplayData() 
		{
			
		}
		
		private function binarySearch1 (values:Vector.<Number>, target:Number) : int {
			var low:int = 0;
			var high:int = values.length - 2;
			if (high == 0)
				return 1;
			var current:int = high >>> 1;
			while (true) {
				if (values[Math.floor(current + 1)] <= target)
					low = current + 1;
				else
					high = current;
				if (low == high)
					return low + 1;
				current = (low + high) >>> 1;
			}
			return 0; // Can't happen.
		}
	
		//TODO:coverage
		public function apply(time:Number,boneSlot:BoneSlot,alpha:Number=1):void
		{
			time += 0.05;
			if (timeList.length <= 0)
			{
				return;
			}
			var i:int = 0;
			var n:int = 0;
			var tTime:Number = timeList[0];
			if (time < tTime)
			{
				return;
			}
			
			var tVertexCount:int = vectices[0].length;
			var tVertices:Array = [];
			var tFrameIndex:int = binarySearch1(timeList,time);
			frameIndex = tFrameIndex;
			if (time >= timeList[timeList.length - 1])
			{
				var lastVertices:Array = vectices[vectices.length - 1];
				
				if (alpha < 1)
				{
					for (i = 0; i < tVertexCount; i++)
					{
						tVertices[i] += (lastVertices[i] - tVertices[i]) * alpha;
					}
				}else {
					for (i = 0; i < tVertexCount; i++)
					{
						tVertices[i] = lastVertices[i];
					}
				}
				deformData = tVertices;
				return;
			}
			
			var tTweenKey:Boolean = tweenKeyList[frameIndex];
			var tPrevVertices:Array = vectices[frameIndex - 1];
			var tNextVertices:Array = vectices[frameIndex];
			var tPreFrameTime:Number = timeList[frameIndex - 1];
			var tFrameTime:Number = timeList[frameIndex];
			
			if (tweenKeyList[tFrameIndex - 1])
			{
				alpha = (time - tPreFrameTime) / (tFrameTime - tPreFrameTime);
			}else {
				alpha = 0;
			}

			var tPrev:Number;
			for (i = 0; i < tVertexCount; i++)
			{
				tPrev = tPrevVertices[i];
				tVertices[i] = tPrev + (tNextVertices[i] - tPrev) * alpha;
			}
			deformData = tVertices;
		}
		
	}

}