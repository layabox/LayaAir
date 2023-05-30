import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Browser } from "laya/utils/Browser"
import { BitmapFont } from "laya/display/BitmapFont";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";


export class SkeletonMask {
	private fontName: string = "fontClip"
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		this.loadFont();

		//加载场景
		Scene3D.load("res/threeDimen/LayaScene_MaskModelTest/Conventional/MaskModelTest.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));
			//获取场景中的相机
			var camera: Camera = (<Camera>scene.getChildByName("Camera"));
		}));
	}


	private loadFont(): void {
		Laya.loader.load("res/threeDimen/LayaScene_MaskModelTest/font/fontClip.fnt", Loader.FONT).then((res: BitmapFont) => {
			this.onFontLoaded(res)
		});
	}
	private onFontLoaded(bitmapFont: BitmapFont): void {
		bitmapFont.letterSpacing = 10;
		Text.registerBitmapFont(this.fontName, bitmapFont);
		this.createText(this.fontName);
		this.createText1(this.fontName);
		this.createText2(this.fontName);
	}




	private createText(font: string): void {
		var txt: Text = new Text();
		txt.width = 250;
		txt.wordWrap = true;
		txt.text = "带有骨骼遮罩的动画";
		txt.color = "#FFFFFFFF";
		txt.leading = 5;
		txt.fontSize = 10;
		txt.zOrder = 999999999;
		txt.scale(Browser.pixelRatio, Browser.pixelRatio);
		txt.pos(Laya.stage.width / 2 - 50, Laya.stage.height / 2);
		Laya.stage.on(Event.RESIZE, txt, () => {
			txt.pos(Laya.stage.width / 2 - 50, Laya.stage.height / 2);
		});
		Laya.stage.addChild(txt);
	}
	createText1(font) {
		var txt = new Text();
		txt.width = 250;
		txt.wordWrap = true;
		txt.text = "正常动画一";
		txt.color = "#FFFFFFFF";
		txt.size(200, 300);
		txt.leading = 5;
		txt.fontSize = 15;
		txt.zOrder = 999999999;
		txt.pos(Laya.stage.width / 2 - 240, Laya.stage.height / 2);
		Laya.stage.on(Event.RESIZE, txt, () => {
			txt.pos(Laya.stage.width / 2 - 240, Laya.stage.height / 2);
		});
		Laya.stage.addChild(txt);
	}
	createText2(font) {
		var txt = new Text();
		txt.width = 250;
		txt.wordWrap = true;
		txt.text = "正常动画二";
		txt.color = "#FFFFFFFF";
		txt.leading = 5;
		txt.zOrder = 999999999;
		txt.fontSize = 15;
		txt.pos(Laya.stage.width / 2 + 140, Laya.stage.height / 2);
		Laya.stage.on(Event.RESIZE, txt, () => {
			txt.pos(Laya.stage.width / 2 + 140, Laya.stage.height / 2);
		});
		Laya.stage.addChild(txt);
	}


}



