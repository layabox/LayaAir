/**
	 * @private
	 */
	export class ShaderDefines {
		/**@private */
		private _counter:number = 0;
		/**@private [只读]*/
		 defines:any = {};
		
		/**
		 * @private
		 */
		constructor(superDefines:ShaderDefines = null){
			if (superDefines) {
				this._counter = superDefines._counter;
				for (var k  in superDefines.defines)
					this.defines[k] = superDefines.defines[k];
			}
		}
		
		/**
		 * @private
		 */
		 registerDefine(name:string):number {
			var value:number = Math.pow(2, this._counter++);//TODO:超界处理
			this.defines[value] = name;
			return value;
		}
	}


