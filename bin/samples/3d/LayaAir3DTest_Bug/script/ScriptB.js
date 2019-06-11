import { Script3D } from "laya/d3/component/Script3D";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author ...
 */
export class ScriptB extends Script3D {
    constructor() {
        super();
    }
    /*override*/ onEnable() {
        console.log(Stat.loopCount, "onEnable ScriptB");
    }
    /*override*/ onDisable() {
        this.spriteC.active = true;
        console.log(Stat.loopCount, "onDisable ScriptB");
    }
}
