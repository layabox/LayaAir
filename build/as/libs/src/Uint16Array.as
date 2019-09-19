/*[IF-FLASH]*/package
{
	/**
	 * @private
	 */
	public dynamic class Uint16Array  extends Array {
		public static const BYTES_PER_ELEMENT:int = 16;
		
		private var vecData : Vector.<uint> = null;
		
		public var buffer:*;
		
		public function Uint16Array(...arg) {
			if ( arg.length == 1 ) {
			    // 引擎和项目内有这类的应用:
				if ( arg[0] is Array ) {
					var va : Array = (arg[0] as Array);
					vecData = new Vector.<uint>( va.length );
					for ( var ti :int = 0, len :int = va.length; ti < len; ti ++ ) {
						vecData[ti] = va[ti];
					}
				}else if(arg[0] is int)
				{
					vecData = new Vector.<uint>(arg[0]);
				}
			}
		}
		
		public function getVecBuf() : Vector.<uint> {
			return vecData;
		}
		
		/**
		 * 
		 * uint16Array.set(index, value);
         * uint16Array.set(array, offset);
		 * 
		*/
		public function set(array:Object, offset:int):void
		{
			if(array is int)
			{
				this.vecData[array] =offset; 
			}else{
				if ( array is Array ) {
					for(var i:int = 0;i<array.length;i++)
					{
						this.vecData[offset++] = array[i];
					}
				}		
			}
		}
		
	}
}