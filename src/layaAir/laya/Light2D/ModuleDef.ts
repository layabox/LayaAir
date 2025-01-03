import { ClassUtils } from "../utils/ClassUtils";
import { BaseLight2D } from "./BaseLight2D";
import { DirectionLight2D } from "./DirectionLight2D";
import { FreeformLight2D } from "./FreeformLight2D";
import { LightOccluder2D } from "./LightOccluder2D";
import { PolygonPoint2D } from "./PolygonPoint2D";
import { SpotLight2D } from "./SpotLight2D";
import { SpriteLight2D } from "./SpriteLight2D";


let c = ClassUtils.regClass;
c("BaseLight2D", BaseLight2D);
c("DirectionLight2D", DirectionLight2D);
c("SpriteLight2D", SpriteLight2D);
c("FreeformLight2D", FreeformLight2D);
c("SpotLight2D", SpotLight2D);
c("LightOccluder2D", LightOccluder2D);
c("PolygonPoint2D", PolygonPoint2D);