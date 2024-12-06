import { ClassUtils } from "../../../utils/ClassUtils";
import { TileSetPhysicsLayer } from "./layers/TileSetPhysicsLayer";
import { TileAlternativesData } from "./TileAlternativesData";
import { TileMapChunkData } from "./TileMapChunkData";
import { TileMapLayer } from "./TileMapLayer";
import { TileMapPhysics } from "./TileMapPhysics";
import { TileSet } from "./TileSet";
import { TileSetCellData, TileSetCellPhysicsInfo,TileSetCellCustomDataInfo,TileSetCellNavigationInfo, TileSetCellOcclusionInfo } from "./TileSetCellData";
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
c("TileSetCellPhysicsInfo", TileSetCellPhysicsInfo);
c("TileSetCellCustomDataInfo", TileSetCellCustomDataInfo);
c("TileSetCellNavigationInfo", TileSetCellNavigationInfo);
c("TileSetCellOcclusionInfo", TileSetCellOcclusionInfo);