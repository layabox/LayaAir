///////////////////////////////////////////////////////////
//  CommonTools.as
//  Macromedia ActionScript Implementation of the Class CommonTools
//  Created on:      2015-9-29 下午12:53:31
//  Original author: ww
///////////////////////////////////////////////////////////

import { Sprite } from "laya/display/Sprite"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-29 下午12:53:31
	 */
	export class CommonTools
	{
		constructor(){
		}
		 static bind(fun:Function,scope:any):Function
		{
			var rst:Function;
			rst=fun.bind(scope);
			return rst;
		}
		private  static count:number = 0;
		  static insertP(tar:Sprite,x:number,y:number,scaleX:number,scaleY:number,rotation:number):void
		{
			var nSp:Sprite;
			nSp=new Sprite();
			tar.parent.addChild(nSp);
			nSp.x=x;
			nSp.y=y;
			nSp.scaleX=scaleX;
			nSp.scaleY=scaleY;
			nSp.rotation=rotation;
			nSp.addChild(tar);
			CommonTools.count++;
			nSp.name = "insertP:" + CommonTools.count;
		}
		  static insertChild(tar:Sprite,x:number,y:number,scaleX:number,scaleY:number,rotation:number,color:string="#ff00ff"):Sprite
		{
			var nSp:Sprite;
			nSp=new Sprite();
			tar.addChild(nSp);
			nSp.x=x;
			nSp.y=y;
			nSp.scaleX=scaleX;
			nSp.scaleY=scaleY;
			nSp.rotation = rotation;
//			nSp.graphics.fillRect(0, 0, 20, 10,color);
			nSp.graphics.drawRect(0,0,20,20,color);
			nSp.name = "child:" + tar.numChildren;
			return nSp;
		}
		 static createSprite(width:number, height:number, color:string = "#ff0000"):Sprite
		{
			var sp:Sprite;
			sp = new Sprite();
			sp.graphics.drawRect(0, 0, width, height, color);
			sp.size(width, height);
			return sp;
		}
		 static createBtn(txt:string,width:number=100,height:number=40):Sprite
		{
			var sp:Sprite;
			sp = new Sprite();
			sp.size(width, height);
			sp.graphics.drawRect(0, 0, sp.width, sp.height, "#ff0000");
			sp.graphics.fillText(txt, sp.width * 0.5, sp.height * 0.5, null, "#ffff00", "center");
			return sp;
		}
	}

