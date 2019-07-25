
	export class ShaderDefines {
		/**@internal */
		private _counter:number = 0;
		/**@internal [只读]*/
		 defines:any = {};
		
		/**
		 * 
		 */
		constructor(superDefines:ShaderDefines = null){
			if (superDefines) {
				this._counter = superDefines._counter;
				for (var k  in superDefines.defines)
					this.defines[k] = superDefines.defines[k];
			}
		}
		
		
		registerDefine(name:string):number {
			var value:number = Math.pow(2, this._counter++);//TODO:超界处理
			this.defines[value] = name;
			return value;
		}
	}


