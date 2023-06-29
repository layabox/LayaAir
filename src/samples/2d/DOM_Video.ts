import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Render } from "laya/renders/Render";
import { Browser } from "laya/utils/Browser";
import { SpriteUtils } from "laya/utils/SpriteUtils";
import { Main } from "./../Main";
/**
 * ...
 * @author 
 */
export class DOM_Video {

	Main: typeof Main = null;
	videoElement: any;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;

			// 创建Video元素
			this.videoElement = Browser.createElement("video");
			Browser.document.body.appendChild(this.videoElement);

			// 设置Video元素地样式和属性
			this.videoElement.style.zInddex = Render.canvas.style.zIndex + 1;
			this.videoElement.src = "sample-resource/res/av/mov_bbb.mp4";
			this.videoElement.controls = true;
			// 阻止IOS视频全屏
			this.videoElement.setAttribute("webkit-playsinline", true);
			this.videoElement.setAttribute("playsinline", true);

			// 设置画布上的对齐参照物
			var reference: Sprite = new Sprite();
			this.Main.box2D.addChild(reference);
			reference.pos(100, 100);
			reference.size(600, 400);
			reference.graphics.drawRect(0, 0, reference.width, reference.height, "#CCCCCC");

			// 每次舞台尺寸变更时，都会调用Utils.fitDOMElementInArea设置Video的位置，对齐的位置和refence重合
			Laya.stage.on(Event.RESIZE, this, SpriteUtils.fitDOMElementInArea, [this.videoElement, reference, 0, 0, reference.width, reference.height]);
			SpriteUtils.fitDOMElementInArea(this.videoElement, reference, 0, 0, reference.width, reference.height)
		});
	}

	dispose(){
		Browser.document.body.removeChild(this.videoElement);
		this.videoElement = null;
	}

}


