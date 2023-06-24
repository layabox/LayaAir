import { Laya } from "Laya";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

/**
 * ...
 * @author ...
 */
export class MemoryTest {
	count: number = 200000;
	static array: any[] = new Array();

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			Laya.stage.on(Event.MOUSE_DOWN, null, function (): void {
				for (var i: number = 0; i < this.count; i++)
					//array.push(new Vector3Test());
					//array.push(new Vector3TestFloatArray());
					//array.push(new Float32Array(16));
					//array.push(new  Transform3D());
					//array.push(new  AnimationTransform3D());
					MemoryTest.array.push(new Sprite3D());
			});	
		});

	}

}


