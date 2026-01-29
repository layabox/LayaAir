import { PlayerConfig } from "../../Config";
import { Laya } from "../../Laya";
import { ClassUtils } from "../utils/ClassUtils";
import { ExternalSkin } from "./ExternalSkin";
import { ExternalSkinItem } from "./ExternalSkinItem";
import { Spine2DRenderNode } from "./Spine2DRenderNode";
import { Spine3DRenderer } from "./Spine3DRenderer";
import { SpineConst } from "./SpineConst";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTemplet } from "./SpineTemplet";
import "./SpineTempletLoader";

let c = ClassUtils.regClass;

c("SpineSkeleton", SpineSkeleton);
c("ExternalSkin", ExternalSkin);
c("ExternalSkinItem", ExternalSkinItem);
c("Spine2DRenderNode", Spine2DRenderNode);
c("Spine3DRenderer", Spine3DRenderer);

Laya.addBeforeInitCallback(() => {
    if (PlayerConfig.spineVersion)
        SpineConst.VERSION = PlayerConfig.spineVersion;
});