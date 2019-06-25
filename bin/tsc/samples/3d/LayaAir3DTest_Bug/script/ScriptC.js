import { Script3D } from "laya/d3/component/Script3D";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author ...
 */
export class ScriptC extends Script3D {
    constructor() {
        super();
    }
    /*override*/ onEnable() {
        console.log(Stat.loopCount, "onEnable ScriptC");
    }
    /*override*/ onDisable() {
        console.log(Stat.loopCount, "onDisable ScriptC");
    }
}
