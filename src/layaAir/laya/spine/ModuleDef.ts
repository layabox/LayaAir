import { PlayerConfig } from "../../Config";
import { Laya } from "../../Laya";
import { ClassUtils } from "../utils/ClassUtils";
import { ExternalSkin } from "./ExternalSkin";
import { ExternalSkinItem } from "./ExternalSkinItem";
import { SpineConst } from "./SpineConst";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTemplet } from "./SpineTemplet";
import "./SpineTempletLoader";

let c = ClassUtils.regClass;

c("SpineSkeleton", SpineSkeleton);
c("ExternalSkin", ExternalSkin);
c("ExternalSkinItem", ExternalSkinItem);

Laya.addBeforeInitCallback(() => {
    if (PlayerConfig.spineVersion)
        SpineConst.VERSION = PlayerConfig.spineVersion;
});