import { ClassUtils } from "../../utils/ClassUtils";
import { AreaMask } from "./AreaMask";
import { NavigationUtils } from "./NavigationUtils";
import { NavMeshGrid } from "./NavMeshGrid";
import { RecastConfig } from "./RecastConfig";

let c = ClassUtils.regClass;

c("NavMeshGrid", NavMeshGrid);
c("RecastConfig", RecastConfig);
c("NavigationUtils", NavigationUtils);
c("AreaMask", AreaMask);