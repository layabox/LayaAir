import { Laya } from "Laya";
///////////////////////////////////////////////////////////
//  DisEditor.as
//  Macromedia ActionScript Implementation of the Class DisEditor
//  Created on:      2015-12-24 下午4:20:25
//  Original author: ww
///////////////////////////////////////////////////////////

import { Graphics } from "laya/display/Graphics"
import { Sprite } from "laya/display/Sprite"
import { Rectangle } from "laya/maths/Rectangle"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-24 下午4:20:25
	 */
	export class DisEditor
	{
		constructor(){
		}
		 rec:Sprite=new Sprite();
		 rootContainer:Sprite=new Sprite();
		 tar:Sprite;
		
		 setTarget(target:Sprite):void
		{
			this.tar=target;
			var g:Graphics;
			g=this.rec.graphics;
			g.clear();
			var bounds:Rectangle;
			bounds = this.tar.getSelfBounds();
			//trace("tarRec:",bounds.toString());
			g.drawRect(bounds.x,bounds.y,bounds.width,bounds.height,null,"#00ff00");
			
			this.createSameDisChain();
			Laya.stage.addChild(this.rootContainer);
		}
		 createSameDisChain():void
		{
			var tParent:Sprite;
			var cpParent:Sprite;
			var preTar:Sprite;
			preTar=this.rec;
			tParent=this.tar;
			while(tParent&&tParent!=Laya.stage)
			{
				cpParent=new Sprite();
				cpParent.addChild(preTar);
				cpParent.x=tParent.x;
				cpParent.y=tParent.y;
				cpParent.scaleX=tParent.scaleX;
				cpParent.scaleY=tParent.scaleY;
				cpParent.rotation=tParent.rotation;
				cpParent.scrollRect = tParent.scrollRect;
				preTar = cpParent;
				
				//preTar=tParent;
				tParent=(<Sprite>tParent.parent );
			}
			
			this.rootContainer.removeChildren();
			this.rootContainer.addChild(preTar);
		}
	}

