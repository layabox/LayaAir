import { Script } from "laya/components/Script";
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { Stat } from "laya/utils/Stat"

/**
 * ...
 * @author ...
 */
export class ScriptB extends Script {
	spriteA: Sprite3D;
	spriteB: Sprite3D;
	spriteC: Sprite3D;

	constructor() {
		super();


	}

	onAwake(): void {
		console.log(Stat.loopCount, "onAwake ScriptB");
	}


	onStart(): void {
		console.log(Stat.loopCount, "onStart ScriptB");
	}

	onEnable(): void {

		console.log(Stat.loopCount, "onEnable ScriptB");

	}

	onDisable(): void {
		this.spriteC.active = true;
		console.log(Stat.loopCount, "onDisable ScriptB");
	}

	onDestroy(): void {
		console.log(Stat.loopCount, "onDestroy ScriptB");
	}

}


