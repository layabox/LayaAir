import { Sprite } from "../../../../../../core/src/laya/display/Sprite"
	import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	/**
	 * ...
	 * @author ww
	 */
	export class StyleConsts 
	{
		
		constructor(){
			
		}
		 static PanelScale:number = Browser.onPC?1:Browser.pixelRatio;
		 static setViewScale(view:Sprite):void
		{
			view.scaleX = view.scaleY = StyleConsts.PanelScale;
		}
	}


