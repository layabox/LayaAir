import { Laya } from "./Laya";
import { Main } from "./../Main";
import { Stage } from "../laya/display/Stage"
	import { ProgressBar } from "../laya/ui/ProgressBar"
	import { Handler } from "../laya/utils/Handler"
	import { WebGL } from "../laya/webgl/WebGL"
	
	export class UI_ProgressBar
	{
		private progressBar:ProgressBar;
		
		constructor(){
			// 不支持WebGL时自动切换至Canvas
			//Laya.init(800, 600, WebGL);
			Laya.init(800, 600);

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";
			
			Laya.loader.load(["res/ui/progressBar.png", "res/ui/progressBar$bar.png"], Handler.create(this, this.onLoadComplete));
		}
		
		private onLoadComplete(e:any=null):void
		{
			this.progressBar = new ProgressBar("res/ui/progressBar.png");
			
			this.progressBar.width = 400;

			this.progressBar.x = (Laya.stage.width - this.progressBar.width ) / 2;
			this.progressBar.y = Laya.stage.height / 2;
			
			this.progressBar.sizeGrid = "5,5,5,5";
			this.progressBar.changeHandler = new Handler(this, this.onChange);
			Main.box2D.addChild(this.progressBar);
			
			Laya.timer.loop(100, this, this.changeValue);
		}
		
		private changeValue():void
		{
			
			if (this.progressBar.value >= 1)
				this.progressBar.value = 0;
			this.progressBar.value += 0.05;
		}
		
		private onChange(value:number):void
		{
			console.log("进度：" + Math.floor(value * 100) + "%");
		}
	}

