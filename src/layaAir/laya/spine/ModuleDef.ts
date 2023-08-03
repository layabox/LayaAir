import { ClassUtils } from "../utils/ClassUtils";
import { ExternalSkin } from "./ExternalSkin";
import { ExternalskinItem } from "./ExternalSkinItem";
import { SpineSkeleton } from "./SpineSkeleton";
import "./SpineTempletLoader";

let c = ClassUtils.regClass;

c("SpineSkeleton", SpineSkeleton);
c("ExternalSkin", ExternalSkin);
c("ExternalskinItem", ExternalskinItem);