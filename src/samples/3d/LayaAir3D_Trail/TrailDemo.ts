import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Sprite3D } from "laya/d3/core/Sprite3D";

/**
 * ...
 * @author ...
 */
export class TrailDemo {

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			//加载拖尾示例效果
			Scene3D.load("res/threeDimen/TrailTest/Trail.ls", Handler.create(this, function (scene: Scene3D): void {
				(<Scene3D>Laya.stage.addChild(scene));
				var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
				camera.addComponent(CameraMoveScript);
				let directlightSprite = new Sprite3D();
				let dircom= directlightSprite.addComponent(DirectionLightCom);
				scene.addChild(directlightSprite);
				dircom.color = new Color(1, 1, 1, 1);
				directlightSprite.transform.rotate(new Vector3(-Math.PI / 3, 0, 0));
			}));
		});

	}

}


