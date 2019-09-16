///////////////////////////////////////////////////////////
//  Arrow.as
//  Macromedia ActionScript Implementation of the Class Arrow
//  Created on:      2015-12-30 下午1:59:34
//  Original author: ww
///////////////////////////////////////////////////////////

import { Graphics } from "laya/display/Graphics"
import { Sprite } from "laya/display/Sprite"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-30 下午1:59:34
	 */
	export class Arrow extends Sprite
	{
		constructor(){
			super();
this.drawMe();
		}
		 drawMe():void
		{
			var g:Graphics;
			g=this.graphics;
			g.clear();
			g.drawLine(0,0,-1,-1,"#ff0000");
			g.drawLine(0,0,1,-1,"#ff0000");
		}
	}

