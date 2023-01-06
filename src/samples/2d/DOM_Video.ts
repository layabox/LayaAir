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
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600);
		Laya.stage.bgColor = "#FFFFFF";
		Laya.stage.alignH = Stage.ALIGN_CENTER;
		Laya.stage.alignV = Stage.ALIGN_MIDDLE;

		// 创建Video元素
		var videoElement: any = Browser.createElement("video");
		Browser.document.body.appendChild(videoElement);

		// 设置Video元素地样式和属性
		videoElement.style.zInddex = Render.canvas.style.zIndex + 1;
		videoElement.src = "res/av/mov_bbb.mp4";
		videoElement.controls = true;
		// 阻止IOS视频全屏
		videoElement.setAttribute("webkit-playsinline", true);
		videoElement.setAttribute("playsinline", true);

		// 设置画布上的对齐参照物
		var reference: Sprite = new Sprite();
		this.Main.box2D.addChild(reference);
		reference.pos(100, 100);
		reference.size(600, 400);
		reference.graphics.drawRect(0, 0, reference.width, reference.height, "#CCCCCC");

		// 每次舞台尺寸变更时，都会调用Utils.fitDOMElementInArea设置Video的位置，对齐的位置和refence重合
		Laya.stage.on(Event.RESIZE, this, SpriteUtils.fitDOMElementInArea, [videoElement, reference, 0, 0, reference.width, reference.height]);
	}

}


