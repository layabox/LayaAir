import { HttpRequest } from "././HttpRequest";
import { Loader } from "././Loader";
import { Laya } from "./../../Laya";
import { Event } from "../events/Event"
	import { Render } from "../renders/Render"
	import { Browser } from "../utils/Browser"
	import { Handler } from "../utils/Handler"
	import { RunDriver } from "../utils/RunDriver"
	
	/**
	 * @private
	 */
	export class TTFLoader {
		private static _testString:string = "LayaTTFFont";
		 fontName:string;
		 complete:Handler;
		 err:Handler;
		private _fontTxt:string;
		private _url:string;
		private _div:any;
		private _txtWidth:number;
		private _http:HttpRequest;
		
		//TODO:coverage
		 load(fontPath:string):void {
			this._url = fontPath;
			var tArr:any[] = fontPath.split(".ttf")[0].split("/");
			this.fontName = tArr[tArr.length - 1];
			if (Render.isConchApp)
			{
				this._loadConch();
			}else
			if (Browser.window.FontFace) {
				this._loadWithFontFace()
			}
			else {
				this._loadWithCSS();
			}
		}
		
		//TODO:coverage
		private _loadConch():void
		{
			this._http = new HttpRequest();
			this._http.on(Event.ERROR, this, this._onErr);
			this._http.on(Event.COMPLETE, this, this._onHttpLoaded);
			this._http.send(this._url, null, "get", Loader.BUFFER);
		}
		
		//TODO:coverage
		private _onHttpLoaded(data:any = null):void
		{
			Browser.window["conchTextCanvas"].setFontFaceFromBuffer(this.fontName, data);
			this._clearHttp();
			this._complete();
		}
		
		//TODO:coverage
		private _clearHttp():void
		{
			if (this._http)
			{
				this._http.off(Event.ERROR, this, this._onErr);
				this._http.off(Event.COMPLETE, this, this._onHttpLoaded);
				this._http = null;
			}
		}
		
		//TODO:coverage
		private _onErr():void
		{
			this._clearHttp();
			if (this.err)
			{
				this.err.runWith("fail:" + this._url);
				this.err = null;
			}
		}
		
		//TODO:coverage
		private _complete():void {
			Laya.systemTimer.clear(this, this._complete);
			Laya.systemTimer.clear(this, this._checkComplete);
			if (this._div && this._div.parentNode) {
				
				this._div.parentNode.removeChild(this._div);
				this._div = null;
			}
			if (this.complete) {
				this.complete.runWith(this);
				this.complete = null;
			}
		}
		
		//TODO:coverage
		private _checkComplete():void {
			if (RunDriver.measureText(TTFLoader._testString, this._fontTxt).width != this._txtWidth) {
				this._complete();
			}
		}
		
		//TODO:coverage
		private _loadWithFontFace():void {
				
			var fontFace:any = new Browser.window.FontFace(this.fontName, "url('" + this._url + "')");
			Browser.window.document.fonts.add(fontFace);
			var self:TTFLoader = this;
			fontFace.loaded.then((function():void {
					self._complete()
				}));
			//_createDiv();
			fontFace.load();
		
		}
		
		//TODO:coverage
		private _createDiv():void {
			this._div = Browser.createElement("div");
			this._div.innerHTML = "laya";
			var _style:any = this._div.style;
			_style.fontFamily = this.fontName;
			_style.position = "absolute";
			_style.left = "-100px";
			_style.top = "-100px";
			Browser.document.body.appendChild(this._div);
		}
		
		//TODO:coverage
		private _loadWithCSS():void {
			
			var fontStyle:any = Browser.createElement("style");
			fontStyle.type = "text/css";
			Browser.document.body.appendChild(fontStyle);
			fontStyle.textContent = "@font-face { font-family:'" + this.fontName + "'; src:url('" + this._url + "');}";	
			this._fontTxt = "40px " + this.fontName;
			this._txtWidth = RunDriver.measureText(TTFLoader._testString, this._fontTxt).width;
			
			var self:TTFLoader = this;
			fontStyle.onload = function():void {
				Laya.systemTimer.once(10000, self, this._complete);
			};
			Laya.systemTimer.loop(20, this, this._checkComplete);
			
			this._createDiv();
		
		}
	
	}


