///////////////////////////////////////////////////////////
//  Rect.as
//  Macromedia ActionScript Implementation of the Class Rect
//  Created on:      2015-12-30 下午3:23:06
//  Original author: ww
///////////////////////////////////////////////////////////

import { Graphics } from "laya/display/Graphics"
import { Sprite } from "laya/display/Sprite"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-30 下午3:23:06
	 */
	export class Rect extends Sprite
	{
		constructor(){
			super();
this.drawMe();
		}
		 recWidth:number=10;
		 drawMe():void
		{
			var g:Graphics;
			g=this.graphics;
			g.clear();
			g.drawRect(0,0,this.recWidth,this.recWidth,"#22ff22");
			this.size(this.recWidth,this.recWidth);
		}
		 posTo(x:number,y:number):void
		{
			this.x=x-this.recWidth*0.5;
			this.y=y-this.recWidth*0.5;
		}
	}

