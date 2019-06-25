import { Script3D } from "laya/d3/component/Script3D";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author ...
 */
export class ScriptA extends Script3D {
    constructor() {
        super();
    }
    /*override*/ onEnable() {
        console.log(Stat.loopCount, "onEnable ScriptA");
    }
    /*override*/ onDisable() {
        console.log(Stat.loopCount, "onDisable ScriptA");
    }
}
