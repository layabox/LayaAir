import { ClassUtils } from "../utils/ClassUtils";
import { VFXAsset } from "./VFXAsset";
import { VFXRenderer } from "./VFXRenderer";
import { VisualEffect } from "./VisualEffect";

let c = ClassUtils.regClass;
c("VFXAsset", VFXAsset);
c("VFXRenderer", VFXRenderer);
c("VisualEffect", VisualEffect);
