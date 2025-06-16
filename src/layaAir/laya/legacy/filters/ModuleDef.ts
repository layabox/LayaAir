import { ClassUtils } from "../../utils/ClassUtils";
import { BlurFilter } from "./BlurFilter";
import { ColorFilter } from "./ColorFilter";
import { GlowFilter } from "./GlowFilter";

let c = ClassUtils.regClass;
c("BlurFilter", BlurFilter);
c("ColorFilter", ColorFilter);
c("GlowFilter", GlowFilter);    