import "./engine";
import {WasmAdapter} from "laya/utils/WasmAdapter";
import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { Laya3D } from "Laya3D";
import { btPhysicsCreateUtil } from "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Physics2D } from "laya/physics/Physics2D";
import { physics2DwasmFactory } from "laya/physics/factory/physics2DwasmFactory"
import { TextureDemo } from "./3d/LayaAir3D_Texture/TextureDemo";
import { WebGPU_Bundle_Culling } from "./3d/LayaAir3DTest_Bug/WebGPU_Bundle_Culling";
Main.useWebGPU = true;
Resource.DEBUG = true;
Physics2D.I._factory = new physics2DwasmFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
new Main(true, false, TextureDemo);