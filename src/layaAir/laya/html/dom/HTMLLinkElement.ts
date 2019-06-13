import { HTMLElement } from "./HTMLElement";
import { Loader } from "laya/net/Loader";
import { Graphics } from "laya/display/Graphics";
import { Event } from "laya/events/Event";
import { HTMLStyle } from "../utils/HTMLStyle";
import { URL } from "laya/net/URL";
import { ILaya } from "ILaya";
	
	/**
	 * @private
	 */
	export class HTMLLinkElement extends HTMLElement {
		
		 static _cuttingStyle:RegExp = new RegExp("((@keyframes[\\s\\t]+|)(.+))[\\t\\n\\r\\\s]*{", "g");
		 type:string;
		private _loader:Loader;
		
		/*override*/ protected _creates():void 
		{
		}
		
		/*override*/  drawToGraphic(graphic:Graphics, gX:number, gY:number, recList:any[]):void 
		{
        }
		/*override*/  reset():HTMLElement {
			if (this._loader) this._loader.off(Event.COMPLETE, this, this._onload);
			this._loader = null;
			return this;
		}
		
		 _onload(data:string):void {
			if (this._loader) this._loader = null;
			switch (this.type) {
			case 'text/css': 
				HTMLStyle.parseCSS(data, this.URI);
				break;
			}
			this.repaint(true);
		}
		
		/*override*/  set href(url:string) {
			if (!url) return;
            url = this.formatURL(url);
			this.URI = new URL(url);
			if (this._loader) this._loader.off(Event.COMPLETE, this, this._onload);
			if (Loader.getRes(url))
			{
				if (this.type == "text/css")
				{
					HTMLStyle.parseCSS(Loader.getRes(url), this.URI);
				}
				return;
			}
			this._loader = new Loader();
			this._loader.once(Event.COMPLETE, this, this._onload);
			this._loader.load(url, Loader.TEXT);
        }
        
        get href(){
            return super.href;
        }
	}

ILaya.regClass(HTMLLinkElement);