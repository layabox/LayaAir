import { ClassUtils } from "../../../utils/ClassUtils";
import { TrailFilter } from "./TrailFilter";
import { TrailMaterial } from "./TrailMaterial";
import { TrailRenderer } from "./TrailRenderer";

let c = ClassUtils.regClass;

c("TrailFilter", TrailFilter);
c("TrailRenderer", TrailRenderer);
c("TrailMaterial", TrailMaterial);
