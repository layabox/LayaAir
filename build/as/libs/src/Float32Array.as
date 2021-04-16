/*[IF-FLASH]*/package
{
	/**
	 * @private
	 */
	public dynamic class Float32Array extends Array {
		public static const BYTES_PER_ELEMENT:int = 32;
		
		private var vecData : Vector.<Number> = null;
		
		public var buffer:*;
		
		public function Float32Array(...arg) {
			if ( arg.length == 1 ) {
				if ( arg[0] is Vector.<Number> ) {
					vecData = (arg[0] as Vector.<Number>);
				}
				if ( arg[0] is Number ) {			
					this.length = arg[0];
				}
				
				if ( arg[0] is ArrayBuffer ) {
					
				}
			    // 引擎和项目内有这类的应用:
				if ( arg[0] is Array ) {
					var va : Array = (arg[0] as Array);
					vecData = new Vector.<Number>( va.length );
					for ( var ti :int = 0, len :int = va.length; ti < len; ti ++ ) {
						vecData[ti] = va[ti];
					}
				}
			}
		}
		
		public function getVecBuf() : Vector.<Number> {
			if ( vecData == null ) {
				vecData = new Vector.<Number>( this.length );
			}
			if( length > 0 ){
				for ( var ti : int = 0, len : int = this.length; ti < len; ti ++ ) {
					vecData[ti] = this[ti];			
				}
			}
			
			return vecData;
		}
		
		
		
		public function subarray(start:int, end:int = -1):Float32Array { return null; };
		
		public function set(src:*, ofs:int=0):void
		{
			for (var i:int = 0, n:int = src.length; i < n; i++)
			{
				this[i + ofs] = src[i];
			}
		}
		
	}
}