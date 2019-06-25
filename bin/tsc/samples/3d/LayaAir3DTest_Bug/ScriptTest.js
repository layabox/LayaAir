import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { ScriptA } from "./script/ScriptA";
import { ScriptB } from "./script/ScriptB";
import { ScriptC } from "./script/ScriptC";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
export class ScriptTest {
    constructor() {
        Laya3D.init(0, 0);
        Stat.show();
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        var scene = new Scene3D();
        var spriteA = new Sprite3D();
        var spriteB = new Sprite3D();
        var spriteC = new Sprite3D();
        Laya.stage.addChild(scene);
        spriteA.addChild(spriteB);
        spriteB.addChild(spriteC);
        //----------------------------------------------------
        scene.addChild(spriteA);
        var scriptA = spriteA.addComponent(ScriptA);
        var scriptB = spriteB.addComponent(ScriptB);
        var scriptC = spriteC.addComponent(ScriptC);
        scriptA.spriteA = spriteA;
        scriptA.spriteB = spriteB;
        scriptA.spriteC = spriteC;
        scriptB.spriteA = spriteA;
        scriptB.spriteB = spriteB;
        scriptB.spriteC = spriteC;
        scriptC.spriteA = spriteA;
        scriptC.spriteB = spriteB;
        scriptC.spriteC = spriteC;
        //spriteA.active = false;
    }
}
