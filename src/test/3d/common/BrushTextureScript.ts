import { Script3D } from "laya/d3/component/Script3D"
	import { PickTexture } from "../LayaAir3DTest__Experiment/PickTexture"
	
	/**
	 * ...
	 * @author
	 */
	export class BrushTextureScript extends Script3D {
		private static _pick:PickTexture;
		constructor(){super();

			
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  onAwake():void {
			
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  onUpdate():void {
			BrushTextureScript._pick.submitData();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  onDestroy():void {
		}
		 static setPick(pick:PickTexture){
			BrushTextureScript._pick = pick;
		}
	}


