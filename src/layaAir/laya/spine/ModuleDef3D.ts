import { Laya } from "../../Laya";
import { ClassUtils } from "../utils/ClassUtils";
import { Spine3DRenderer } from "./Spine3DRenderer";
import { Spine3DShaderInit } from "./shader/Spine3DShaderInit";

let c = ClassUtils.regClass;

c("Spine3DRenderer", Spine3DRenderer);

Laya.addAfterInitCallback(() => {
    Spine3DShaderInit.init();
});
