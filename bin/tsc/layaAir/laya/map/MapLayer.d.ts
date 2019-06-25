import { Sprite } from "../display/Sprite";
import { Point } from "../maths/Point";
import { GridSprite } from "./GridSprite";
import { TiledMap } from "./TiledMap";
/**
 * 地图支持多层渲染（例如，地表层，植被层，建筑层等）
 * 本类就是层级类
 * @author ...
 */
export declare class MapLayer extends Sprite {
    private _map;
    _mapData: any[];
    private _tileWidthHalf;
    private _tileHeightHalf;
    private _mapWidthHalf;
    private _mapHeightHalf;
    /**
     * @private
     */
    _gridSpriteArray: any[];
    private _objDic;
    private _dataDic;
    private _tempMapPos;
    private _properties;
    /**被合到的层*/
    tarLayer: MapLayer;
    /**当前Layer的名称*/
    layerName: string;
    /**
     * 解析LAYER数据，以及初始化一些数据
     * @param	layerData 地图数据中，layer数据的引用
     * @param	map 地图的引用
     */
    init(layerData: any, map: TiledMap): void;
    /******************************************对外接口*********************************************/
    /**
     * 通过名字获取控制对象，如果找不到返回为null
     * @param	objName 所要获取对象的名字
     * @return
     */
    getObjectByName(objName: string): GridSprite;
    /**
     * 通过名字获取数据，如果找不到返回为null
     * @param	objName 所要获取对象的名字
     * @return
     */
    getObjectDataByName(objName: string): GridSprite;
    /**
     * 得到地图层的自定义属性
     * @param	name
     * @return
     */
    getLayerProperties(name: string): any;
    /**
     * 得到指定格子的数据
     * @param	tileX 格子坐标X
     * @param	tileY 格子坐标Y
     * @return
     */
    getTileData(tileX: number, tileY: number): number;
    /**
     * 通过地图坐标得到屏幕坐标
     * @param	tileX 格子坐标X
     * @param	tileY 格子坐标Y
     * @param	screenPos 把计算好的屏幕坐标数据，放到此对象中
     */
    getScreenPositionByTilePos(tileX: number, tileY: number, screenPos?: Point): void;
    /**
     * 通过屏幕坐标来获取选中格子的数据
     * @param	screenX 屏幕坐标x
     * @param	screenY 屏幕坐标y
     * @return
     */
    getTileDataByScreenPos(screenX: number, screenY: number): number;
    /**
     * 通过屏幕坐标来获取选中格子的索引
     * @param	screenX 屏幕坐标x
     * @param	screenY 屏幕坐标y
     * @param	result 把计算好的格子坐标，放到此对象中
     * @return
     */
    getTilePositionByScreenPos(screenX: number, screenY: number, result?: Point): boolean;
    /***********************************************************************************************/
    /**
     * 得到一个GridSprite
     * @param	gridX 当前Grid的X轴索引
     * @param	gridY 当前Grid的Y轴索引
     * @return  一个GridSprite对象
     */
    getDrawSprite(gridX: number, gridY: number): GridSprite;
    /**
     * 更新此层中块的坐标
     * 手动刷新的目的是，保持层级的宽和高保持最小，加快渲染
     */
    updateGridPos(): void;
    /**
     * @private
     * 把tile画到指定的显示对象上
     * @param	gridSprite 被指定显示的目标
     * @param	tileX 格子的X轴坐标
     * @param	tileY 格子的Y轴坐标
     * @return
     */
    drawTileTexture(gridSprite: GridSprite, tileX: number, tileY: number): boolean;
    /**
     * @private
     * 清理当前对象
     */
    clearAll(): void;
}
