import { Sprite3D } from "./core/Sprite3D"
	import { ISingletonElement } from "laya/resource/ISingletonElement"
	
	/**
	 * @private
	 */
	export class MouseTouch {
		/**@private */
		 _pressedSprite:Sprite3D = null;
		/**@private */
		 _pressedLoopCount:number = -1;
		/**@private */
		 sprite:Sprite3D = null;
		/**@private */
		 mousePositionX:number = 0;
		/**@private */
		 mousePositionY:number = 0;
		
		constructor(){
		
		}
	}


