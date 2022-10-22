import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/particle/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { IDEMain } from "./IDEMain";
import { TextureDemo } from "./3d/LayaAir3D_Texture/TextureDemo";
import { Sprite_DisplayImage } from "./2d/Sprite_DisplayImage";
import { Sprite3DLoad } from "./3d/LayaAir3D_Sprite3D/Sprite3DLoad";
import { Sky_Procedural } from "./3d/LayaAir3D_Sky/Sky_Procedural";
import { PBRMaterialDemo } from "./3d/LayaAir3D_Material/PBRMaterialDemo";
import { Sky_SkyBox } from "./3d/LayaAir3D_Sky/Sky_SkyBox";
import { Secne3DPlayer2D } from "./3d/LayaAir3D_Advance/Secne3DPlayer2D";
import { Scene2DPlayer3D } from "./3d/LayaAir3D_Advance/Scene2DPlayer3D";
import { PhysicsWorld_Character } from "./3d/LayaAir3D_Physics3D/PhysicsWorld_Character";
import { LoadResourceDemo } from "./3d/LayaAir3D_Resource/LoadResourceDemo";

Resource.DEBUG = true;

//new IDEMain();

new PhysicsWorld_Character();
