import { ClassUtils } from "../utils/ClassUtils";
import { ExternalSkin } from "./ExternalSkin";
import { ExternalSkinItem } from "./ExternalSkinItem";
import { SpineSkeleton } from "./SpineSkeleton";
import "./SpineTempletLoader";

let c = ClassUtils.regClass;

c("SpineSkeleton", SpineSkeleton);
c("ExternalSkin", ExternalSkin);
c("ExternalSkinItem", ExternalSkinItem);