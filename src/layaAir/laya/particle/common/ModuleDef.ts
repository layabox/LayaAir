import { ClassUtils } from "../../utils/ClassUtils";
import { GradientDataNumber } from "./GradientDataNumber";
import { ColorOverLifetimeModule } from "./module/ColorOverLifetimeModule";
import { EmissionModule, EmissionBurst } from "./module/EmissionModule";
import { TextureSheetAnimationModule } from "./module/TextureSheetAnimationModule";
import { ParticleMinMaxCurve } from "./ParticleMinMaxCurve";
import { ParticleMinMaxGradient } from "./ParticleMinMaxGradient";

ClassUtils.regClass("GradientDataNumber", GradientDataNumber);
ClassUtils.regClass("ParticleMinMaxGradient", ParticleMinMaxGradient);
ClassUtils.regClass("ParticleMinMaxCurve", ParticleMinMaxCurve);
ClassUtils.regClass("ColorOverLifetimeModule", ColorOverLifetimeModule);
ClassUtils.regClass("EmissionModule", EmissionModule);
ClassUtils.regClass("EmissionBurst", EmissionBurst);
ClassUtils.regClass("TextureSheetAnimationModule", TextureSheetAnimationModule);