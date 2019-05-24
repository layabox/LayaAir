import { Laya } from "Laya"
	import { Sprite } from "laya/display/Sprite"
	import { Stage } from "laya/display/Stage"
	import { Loader } from "laya/net/Loader"
	import { URL } from "laya/net/URL"
	import { IndexView2D } from "./view/IndexView2D"
	//import laya.qg.mini.QGMiniAdapter;
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"

	export class Main
	{
		//public static var box3D:Sprite;
		 static box2D:Sprite;
		 static _indexView:any;
		//false 2d；true 3d
		private _isType:boolean = false;
		 static isWXAPP:boolean = false;
		private _isReadNetWorkRes:boolean = false;
		constructor(){
			//QGMiniAdapter.init();
			//false为2D true为3D
			this._isType =  false;// __JS__('window.isType') || true;
			if(!this._isType)
			{
				Laya.init(1280,720);
				Laya.stage.scaleMode =  Stage.SCALE_FIXED_AUTO;
			}else
			{
				//Laya3D.init(0, 0);
				Laya.stage.scaleMode = Stage.SCALE_FULL;
				Laya.stage.screenMode = Stage.SCREEN_NONE;
			}
			Laya.stage.bgColor = "#c1c1c1c";
			Stat.show();
			
			//这里改成true就会从外部加载资源
			this._isReadNetWorkRes = (window as any).isReadNetWorkRes || false;
			if(this._isReadNetWorkRes)
			{
				URL.rootPath = URL.basePath = "https://layaair.ldc.layabox.com/demo2/h5/";
			}
			//加载引擎需要的资源
			Laya.loader.load([{url:"res/atlas/comp.json", type: Loader.ATLAS}], Handler.create(this, this.onLoaded));
		}
		
		private onLoaded():void
		{

			if(!this._isType)
			{
				//Layaair1.0-2d
				Main.box2D = new Sprite();
				Laya.stage.addChild(Main.box2D);
				Main._indexView = new IndexView2D();
			}else
			{
				//Layaair1.0-3d
				//box3D = new Sprite();
				//Laya.stage.addChild(box3D);
				//Main._indexView = new IndexView3D();
			}
			
			var sp:Sprite = new Sprite();
			var dx=0 ;
			(sp.graphics as any).runfunc=function(){
			for (var i = 0; i < 100; i++)
			{
				this.ctx.drawRect(0, i+dx, 100, 100, 'red', 'red', 1);
			}
			}
			
			Laya.stage.addChild(Main._indexView);
			Main._indexView.left = 20;
			Main._indexView.top = (window as any).viewtop || 350;
			Main._indexView.mouseEnabled = Main._indexView.mouseThrough = true;
			Main._indexView.switchFunc(0,0);//切换到指定case
		}
	}

//import { Laya } from "Laya"
//new Laya();