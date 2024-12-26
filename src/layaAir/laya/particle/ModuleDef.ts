import { ClassUtils } from "../utils/ClassUtils";
import { ColorOverLifetimeModule } from "./common/module/ColorOverLifetimeModule";
import { EmissionBurst, EmissionModule } from "./common/module/EmissionModule";
import { TextureSheetAnimationModule } from "./common/module/TextureSheetAnimationModule";
import { ParticleMinMaxCurve } from "./common/ParticleMinMaxCurve";
import { ParticleMinMaxGradient } from "./common/ParticleMinMaxGradient";
import { Main2DModule } from "./d2/module/Main2DModule";
import { Rotation2DOverLifetimeModule } from "./d2/module/Rotation2DOverLifetimeModule";
import { Shape2DModule } from "./d2/module/Shape2DModule";
import { Base2DShape } from "./d2/module/shapes/Base2DShape";
import { Box2DShap } from "./d2/module/shapes/Box2DShap";
import { CircleShape } from "./d2/module/shapes/CircleShape";
import { FanShape } from "./d2/module/shapes/FanShape";
import { SemicircleShap } from "./d2/module/shapes/SemicircleShap";
import { Size2DOverLifetimeModule } from "./d2/module/Size2DOverLifetimeModule";
import { Velocity2DOverLifetimeModule } from "./d2/module/Velocity2DOverLifetimeModule";


ClassUtils.regClass("ParticleMinMaxGradient", ParticleMinMaxGradient);

ClassUtils.regClass("ParticleMinMaxCurve", ParticleMinMaxCurve);

ClassUtils.regClass("ColorOverLifetimeModule", ColorOverLifetimeModule);

ClassUtils.regClass("EmissionModule", EmissionModule);
ClassUtils.regClass("EmissionBurst", EmissionBurst);

ClassUtils.regClass("TextureSheetAnimationModule", TextureSheetAnimationModule);

ClassUtils.regClass("Base2DShape", Base2DShape);

ClassUtils.regClass("Box2DShap", Box2DShap);
ClassUtils.regClass("CircleShape", CircleShape);

ClassUtils.regClass("FanShape", FanShape);
ClassUtils.regClass("SemicircleShap", SemicircleShap);

ClassUtils.regClass("Main2DModule", Main2DModule);

ClassUtils.regClass("Rotation2DOverLifetimeModule", Rotation2DOverLifetimeModule);

ClassUtils.regClass("Shape2DModule", Shape2DModule);

ClassUtils.regClass("Size2DOverLifetimeModule", Size2DOverLifetimeModule);

ClassUtils.regClass("Velocity2DOverLifetimeModule", Velocity2DOverLifetimeModule);