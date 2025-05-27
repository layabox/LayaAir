import "./engine";

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { Laya3D } from "Laya3D";
import { btPhysicsCreateUtil } from "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Physics2D } from "laya/physics/Physics2D";
import { physics2DwasmFactory } from "laya/physics/factory/physics2DwasmFactory"
import Sprite_ScreenShot from "./2d/Sprite_ScreenShot";
import { Physics_Tumbler } from "./2d/Physics_Tumbler";
import { Filters_Color } from "./2d/Filters_Color";
import { Sprite_Cache } from "./2d/Sprite_Cache";
import { Loader_ClearTextureRes } from "./2d/Loader_ClearTextureRes";
import { PerformanceTest_Maggots } from "./2d/PerformanceTest_Maggots";
import { Sprite_DisplayImage } from "./2d/Sprite_DisplayImage";
import { Sprite_MagnifyingGlass } from "./2d/Sprite_MagnifyingGlass";
import { Camera2DDemo } from "./2d/Camera2DDemo";
import { Camera2D_Layer } from "./2d/Camera2D_Layer";
import { Animation_SWF } from "./2d/Animation_SWF";
import { Sprite_DrawPath } from "./2d/Sprite_DrawPath";
import { TileMapLayerDemo } from "./2d/TileMapLayerDemo";

Resource.DEBUG = true;
Physics2D.I._factory = new physics2DwasmFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
// private _comboBoxPhysicsClsArr: any[] = [Physics_Tumbler, Physics_Tumbler_Shapes, Physics_CollisionFiltering, Physics_CollisionFiltering_Shapes, Physics_CollisionEvent, Physics_CollisionEvent_Shapes, Physics_Bridge, Physics_Bridge_Shapes, Physics_Strandbeests, Physics_Strandbeests_Shapes];

new Main(false, false );

// /RenderCMD2DDemo