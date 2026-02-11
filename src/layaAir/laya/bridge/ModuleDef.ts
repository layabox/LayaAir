import { Laya } from "../../Laya";
import { Scene } from "../display/Scene";
import { ClassUtils } from "../utils/ClassUtils";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DSprite } from "./Bridge3DSprite";

let c = ClassUtils.regClass;
c('Bridge3DCamera', Bridge3DCamera);
c('Bridge3DScene3D', Bridge3DScene3D);
c('Bridge3DSprite', Bridge3DSprite);

Scene.createBridge3DScene = function () {
    return new Bridge3DScene3D();
}

Laya.addInitCallback(() => {
    Bridge3DCamera.__init__();
});