import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { ClassUtils } from "../utils/ClassUtils";
import { Bridge3DCamera } from "./Bridge3DCamera";
import { Bridge3DScene3D } from "./Bridge3DScene3D";
import { Bridge3DData } from "./Bridge3DData";
import { Bridge3DSprite } from "./Bridge3DSprite";
import { Bridge3DSceneInternal } from "./Bridge3DSceneInternal";
import { Scene } from "../display/Scene";

let c = ClassUtils.regClass;
c('Bridge3DCamera', Bridge3DCamera);
c('Bridge3DScene3D', Bridge3DScene3D);
c('Bridge3DSprite', Bridge3DSprite);
c('Bridge3DData', Bridge3DData);

Scene.bridge3DInternalHandler = (scene) => new Bridge3DSceneInternal(scene);


// Bridge3D requires depth buffer for proper 3D depth testing.
// Set Config.isDepth = true at module load time so users who import Bridge3D
// automatically get depth enabled. Users can still override this after importing.
Config.isDepth = true;

Laya.addInitCallback(() => {
    Bridge3DCamera.__init__();
});