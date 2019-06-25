/**
	 * <code>HalfFloatUtils</code> 类用于创建HalfFloat工具。
	 */
	export class HalfFloatUtils {
		/**@internal */
		private static _buffer:ArrayBuffer = new ArrayBuffer(4);
		/**@internal */
		private static _floatView:Float32Array = new Float32Array(HalfFloatUtils._buffer);
		/**@internal */
		private static _uint32View:Uint32Array = new Uint32Array(HalfFloatUtils._buffer);
		
		/**@internal */
		private static _baseTable:Uint32Array = new Uint32Array(512);
		/**@internal */
		private static _shiftTable:Uint32Array = new Uint32Array(512);
		
		/**@internal */
		private static _mantissaTable:Uint32Array = new Uint32Array(2048);
		/**@internal */
		private static _exponentTable:Uint32Array = new Uint32Array(64);
		/**@internal */
		private static _offsetTable:Uint32Array = new Uint32Array(64);
		
		/**
		 * @internal
		 */
		 static __init__():void {
			for (var i:number = 0; i < 256; ++i) {
				var e:number = i - 127;
				// very small number (0, -0)
				if (e < -27) {
					HalfFloatUtils._baseTable[i | 0x000] = 0x0000;
					HalfFloatUtils._baseTable[i | 0x100] = 0x8000;
					HalfFloatUtils._shiftTable[i | 0x000] = 24;
					HalfFloatUtils._shiftTable[i | 0x100] = 24;
					
						// small number (denorm)
				} else if (e < -14) {
					HalfFloatUtils._baseTable[i | 0x000] = 0x0400 >> (-e - 14);
					HalfFloatUtils._baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
					HalfFloatUtils._shiftTable[i | 0x000] = -e - 1;
					HalfFloatUtils._shiftTable[i | 0x100] = -e - 1;
					
						// normal number
				} else if (e <= 15) {
					HalfFloatUtils._baseTable[i | 0x000] = (e + 15) << 10;
					HalfFloatUtils._baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
					HalfFloatUtils._shiftTable[i | 0x000] = 13;
					HalfFloatUtils._shiftTable[i | 0x100] = 13;
					
						// large number (Infinity, -Infinity)
				} else if (e < 128) {
					HalfFloatUtils._baseTable[i | 0x000] = 0x7c00;
					HalfFloatUtils._baseTable[i | 0x100] = 0xfc00;
					HalfFloatUtils._shiftTable[i | 0x000] = 24;
					HalfFloatUtils._shiftTable[i | 0x100] = 24;
					
						// stay (NaN, Infinity, -Infinity)
				} else {
					HalfFloatUtils._baseTable[i | 0x000] = 0x7c00;
					HalfFloatUtils._baseTable[i | 0x100] = 0xfc00;
					HalfFloatUtils._shiftTable[i | 0x000] = 13;
					HalfFloatUtils._shiftTable[i | 0x100] = 13;
				}
			}
			
			HalfFloatUtils._mantissaTable[0] = 0;
			for (i = 1; i < 1024; ++i) {
				var m:number = i << 13;    // zero pad mantissa bits
				e = 0;          // zero exponent
				
				// normalized
				while ((m & 0x00800000) === 0) {
					e -= 0x00800000;    // decrement exponent
					m <<= 1;
				}
				
				m &= ~0x00800000;   // clear leading 1 bit
				e += 0x38800000;    // adjust bias
				
				HalfFloatUtils._mantissaTable[i] = m | e;
			}
			for (i = 1024; i < 2048; ++i) {
				HalfFloatUtils._mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
			}
			
			HalfFloatUtils._exponentTable[0] = 0;
			for (i = 1; i < 31; ++i) {
				HalfFloatUtils._exponentTable[i] = i << 23;
			}
			HalfFloatUtils._exponentTable[31] = 0x47800000;
			HalfFloatUtils._exponentTable[32] = 0x80000000;
			for (i = 33; i < 63; ++i) {
				HalfFloatUtils._exponentTable[i] = 0x80000000 + ((i - 32) << 23);
			}
			HalfFloatUtils._exponentTable[63] = 0xc7800000;
			
			HalfFloatUtils._offsetTable[0] = 0;
			for (i = 1; i < 64; ++i) {
				if (i === 32) {
					HalfFloatUtils._offsetTable[i] = 0;
				} else {
					HalfFloatUtils._offsetTable[i] = 1024;
				}
			}
		}
		
		/**
		 * round a number to a half float number bits.
		 * @param {number} num
		 */
		 static roundToFloat16Bits(num:number):number {
			HalfFloatUtils._floatView[0] = num;
			var f:number = HalfFloatUtils._uint32View[0];
			var e:number = (f >> 23) & 0x1ff;
			return HalfFloatUtils._baseTable[e] + ((f & 0x007fffff) >> HalfFloatUtils._shiftTable[e]);
		}
		
		/**
		 * convert a half float number bits to a number.
		 * @param {number} float16bits - half float number bits
		 */
		 static convertToNumber(float16bits:number):number {
			var m:number = float16bits >> 10;
			HalfFloatUtils._uint32View[0] = HalfFloatUtils._mantissaTable[HalfFloatUtils._offsetTable[m] + (float16bits & 0x3ff)] + HalfFloatUtils._exponentTable[m];
			return HalfFloatUtils._floatView[0];
		}
	
	}


