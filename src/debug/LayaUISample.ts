import { TestView } from "./view/TestView"
import { Laya } from "../laya/core/Laya";
import { Handler } from "../laya/core/laya/utils/Handler";
import { UILib } from "../laya/core/laya/ui/UILib";
	
	export class LayaUISample {
		
		constructor(){
			//初始化引擎
            Laya.init(1024, 768);
            UILib.__init__();
			Laya.stage.scaleMode = "fixedwidth";
			
			Laya.loader.load("res/atlas/comp.atlas", Handler.create(this, this.onLoaded));
		}
		
		private onLoaded():void {
			//实例UI界面
			var testView = new TestView();
			//stage.addChild(testView);
			Laya.stage.addChild(testView);
			
			//AutoTest.start();
			
			//AutoTest2.startRecord(Render.canvas);
		}
	}

new LayaUISample();