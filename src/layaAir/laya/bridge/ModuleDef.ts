import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { Scene } from "../display/Scene";
import { ClassUtils } from "../utils/ClassUtils";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DSceneHolder } from "./Bridge3DSceneHolder";
import { Bridge3DSprite } from "./Bridge3DSprite";

let c = ClassUtils.regClass;
c('Bridge3DCamera', Bridge3DCamera);
c('Bridge3DScene3D', Bridge3DScene3D);
c('Bridge3DSprite', Bridge3DSprite);


// Bridge3D requires depth buffer for proper 3D depth testing.
// Set Config.isDepth = true at module load time so users who import Bridge3D
// automatically get depth enabled. Users can still override this after importing.
Config.isDepth = true;

Scene.createBridge3DHolder = (scene: Scene) => new Bridge3DSceneHolder(scene);

Laya.addInitCallback(() => {
    Bridge3DCamera.__init__();
});