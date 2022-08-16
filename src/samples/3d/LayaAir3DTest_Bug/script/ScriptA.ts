
import { Script } from "laya/components/Script";
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { Stat } from "laya/utils/Stat"

/**
 * ...
 * @author ...
 */
export class ScriptA extends Script {
	spriteA: Sprite3D;
	spriteB: Sprite3D;
	spriteC: Sprite3D;

	constructor() {
		super();


	}

	onEnable(): void {
		console.log(Stat.loopCount, "onEnable ScriptA");
	}

	onDisable(): void {
		console.log(Stat.loopCount, "onDisable ScriptA");
	}

	onDestroy(): void {
		console.log(Stat.loopCount, "onDestroy ScriptA");
	}

}


