import { Sprite } from "laya/display/Sprite"
import { Browser } from "laya/utils/Browser"
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


