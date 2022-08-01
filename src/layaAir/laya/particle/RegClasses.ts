import { ClassUtils } from "../utils/ClassUtils";
import { Particle2D } from "./Particle2D";

import "./ParticleTemplate2DLoader";

let c = ClassUtils.regClass;

c("Laya.Particle2D", Particle2D);