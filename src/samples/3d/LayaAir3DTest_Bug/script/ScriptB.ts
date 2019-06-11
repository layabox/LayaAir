import { Script3D } from "laya/d3/component/Script3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { Stat } from "laya/utils/Stat"
	
	/**
	 * ...
	 * @author ...
	 */
	export class ScriptB extends Script3D {
		 spriteA:Sprite3D;
		 spriteB:Sprite3D;
		 spriteC:Sprite3D;
		
		constructor(){super();

		
		}
		
		/*override*/  onEnable():void {
			
			console.log(Stat.loopCount, "onEnable ScriptB");
		}
		
		/*override*/  onDisable():void {
			this.spriteC.active = true;
			console.log(Stat.loopCount, "onDisable ScriptB");
		}
	
	}


