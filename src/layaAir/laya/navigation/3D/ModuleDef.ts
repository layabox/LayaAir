import { ClassUtils } from "../../utils/ClassUtils";

import { BaseNav3DModifle } from "./component/BaseNav3DModifle";
import { NavMeshSurface } from "./component/NavMeshSurface";

import { NavMeshModifileSurface } from "./component/NavMeshModifileSurface";
import { NavMeshLink } from "./component/NavMeshLink";
import { NavMeshModifierVolume } from "./component/NavMeshModifierVolume";
import { NavMeshObstacles } from "./component/NavMeshObstacles";

import { NavAgent } from "./component/NavAgent";
import { NavigationManager } from "./NavigationManager";
import { NavMesh } from "./NavMesh";

let c = ClassUtils.regClass;

c("BaseNav3DModifle", BaseNav3DModifle);
c("NavAgent", NavAgent);
c("NavMeshSurface", NavMeshSurface);
c("NavigationManager", NavigationManager);
c("NavMesh", NavMesh);
c("NavMeshModifileSurface", NavMeshModifileSurface);
c("NavMeshLink", NavMeshLink);
c("NavMeshObstacles", NavMeshObstacles);
c("NavMeshModifierVolume", NavMeshModifierVolume);
