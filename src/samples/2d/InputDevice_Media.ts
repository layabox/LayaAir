import { Media } from "laya/device/media/Media";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";

/**
 * ...
 * @author Survivor
 */
export class InputDevice_Media {
	constructor() {
		if (Media.supported() === false)
			alert("当前浏览器不支持");
		else {
			var options = {
				"audio": false,
				"video":
				{
					"width": Browser.width,
					"height": Browser.height
				}
			};

			Media.getMedia(options, Handler.create(this, this.onSuccess), Handler.create(this, this.onError));
		}
	}

	private onSuccess(url: string): void {
		var video = Browser.document.createElement("video");
		video.width = Browser.clientWidth;
		video.height = Browser.clientHeight;
		video.style.zIndex = 1E5;
		Browser.document.body.appendChild(video);
		video.controls = true;
		video.src = url;
		video.play();
	}

	private onError(error: Error): void {
		alert(error.name + ":" + error.message);
	}
}

