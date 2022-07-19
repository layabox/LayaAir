import { Resource } from "laya/resource/Resource";
import { EffectMaterialDemo } from "./3d/LayaAir3D_Material/EffectMaterialDemo";
import { UnlitMaterialDemo } from "./3d/LayaAir3D_Material/UnlitMaterialDemo";
import { Particle_BurningGround } from "./3d/LayaAir3D_Particle3D/Particle_BurningGround";
import { Particle_EternalLight } from "./3d/LayaAir3D_Particle3D/Particle_EternalLight";
import { PhysicsWorld_Character } from "./3d/LayaAir3D_Physics3D/PhysicsWorld_Character";
import { Main } from "./Main";
// import { DebugMeshTest } from "./self/MeshDebug/DebugMeshTest";
// import { NewMatTest } from "./self/newMaterial/NewMatTest";
// import { PBRStandardTest } from "./self/newMaterial/PBRStandardTest";

Resource.DEBUG = true;

new UnlitMaterialDemo();

// new NewMatTest();
// new DebugMeshTest();
// new PhysicsWorld_Character();

// new PBRStandardTest();