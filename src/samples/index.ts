import { Resource } from "laya/resource/Resource";
import { PhysicsWorld_Character } from "./3d/LayaAir3D_Physics3D/PhysicsWorld_Character";
import { Main } from "./Main";
import { DebugMeshTest } from "./self/MeshDebug/DebugMeshTest";
import { NewMatTest } from "./self/newMaterial/NewMatTest";

Resource.DEBUG = true;

// new Main(true, false);

new NewMatTest();
// new DebugMeshTest();

// new PhysicsWorld_Character();