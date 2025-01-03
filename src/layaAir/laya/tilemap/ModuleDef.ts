import { ClassUtils } from "../utils/ClassUtils";
import { TileSetCustomDataLayer } from "./layers/TileSetCustomDataLayer";
import { TileMapNavigationLayer } from "./layers/TileSetNavigationLayer";
import { TileSetOcclusionLayer } from "./layers/TileSetOcclusionLayer";
import { TileSetPhysicsLayer } from "./layers/TileSetPhysicsLayer";
import { TileSetTerrainLayer } from "./layers/TileSetTerrainLayer";
import { TileAlternativesData } from "./TileAlternativesData";
import { TileMapChunkData } from "./TileMapChunkData";
import { TileMapLayer } from "./TileMapLayer";
import { TileMapPhysics } from "./TileMapPhysics";
import { TileSet } from "./TileSet";
import { TileSetCellData, TileSetCellNavigationInfo, TileSetCellOcclusionInfo, TileSetCellPhysicsInfo } from "./TileSetCellData";
import { TileSetCellGroup } from "./TileSetCellGroup";

let c = ClassUtils.regClass;

c("TileSet", TileSet);
c("TileSetCellGroup", TileSetCellGroup);
c("TileAlternativesData", TileAlternativesData);
c("TileSetCellData", TileSetCellData);

c("TileMapLayer", TileMapLayer);
c("TileMapChunkData", TileMapChunkData);
c("TileMapPhysics", TileMapPhysics);

c("TileSetPhysicsLayer", TileSetPhysicsLayer);
c("TileSetOcclusionLayer", TileSetOcclusionLayer);
c("TileSetTerrainLayer", TileSetTerrainLayer);
c("TileMapNavigationLayer", TileMapNavigationLayer);
c("TileSetCustomDataLayer", TileSetCustomDataLayer);

c("TileSetCellPhysicsInfo", TileSetCellPhysicsInfo);
//c("TileSetCellCustomDataInfo", TileSetCellCustomDataInfo);
c("TileSetCellNavigationInfo", TileSetCellNavigationInfo);
c("TileSetCellOcclusionInfo", TileSetCellOcclusionInfo);