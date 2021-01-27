import { TileTexSet } from "./TileTexSet";
import { TileAniSprite } from "./TileAniSprite";
import { GridSprite } from "./GridSprite";
import { IMap } from "./IMap";
import { TiledMap } from "./TiledMap";
import { Sprite } from "../display/Sprite";
import { Point } from "../maths/Point";
import { Texture } from "../resource/Texture";


/**
 * 地图支持多层渲染（例如，地表层，植被层，建筑层等）
 * 本类就是层级类
 * @author ...
 */
export class MapLayer extends Sprite {

    private _map: TiledMap;
    /**@internal */
    _mapData: any[] = null;

    private _tileWidthHalf: number = 0;
    private _tileHeightHalf: number = 0;

    private _mapWidthHalf: number = 0;
    private _mapHeightHalf: number = 0;

    /**
     * @internal
     */
    _gridSpriteArray: any[] = [];
    private _objDic: any = null;//用来做字典，方便查询
    private _dataDic: any = null;

    private _tempMapPos: Point = new Point();//临时变量
    private _properties: any;

    /**被合到的层*/
    tarLayer: MapLayer;

    /**当前Layer的名称*/
    layerName: string = null;

    /**
     * 解析LAYER数据，以及初始化一些数据
     * @param	layerData 地图数据中，layer数据的引用
     * @param	map 地图的引用
     */
    init(layerData: any, map: TiledMap): void {
        this._map = map;
        this._mapData = layerData.data;
        //地图宽和高（单位:格子）
        var tHeight: number = layerData.height;
        var tWidth: number = layerData.width;

        var tTileW: number = map.tileWidth;
        var tTileH: number = map.tileHeight;

        this.layerName = layerData.name;
        this._properties = layerData.properties;
        this.alpha = layerData.opacity;

        this._tileWidthHalf = tTileW / 2;
        this._tileHeightHalf = tTileH / 2;

        //减一半的格子，加到这，是因为，下面计算坐标的时候，可以减少计算量
        this._mapWidthHalf = this._map.width / 2 - this._tileWidthHalf;
        this._mapHeightHalf = this._map.height / 2;
        //这里要特别注意，有时间去查查JS源代码支持的所有类型
        switch (layerData.type) {
            case "tilelayer":
                break;
            case "objectgroup":
                //这里的东西必需要一开始就创建，所以要用物品的动态管理做下
                var tObjectGid: number = 0;
                var tArray: any[] = layerData.objects;
                if (tArray.length > 0) {
                    this._objDic = {};
                    this._dataDic = {};
                }
                var tObjectData: any;
                var tObjWidth: number;
                var tObjHeight: number;
                for (var i: number = 0; i < tArray.length; i++) {
                    tObjectData = tArray[i];
                    this._dataDic[tObjectData.name] = tObjectData;
                    //这里要看具体需求，看是不是要开放
                    if (tObjectData.visible == true) {
                        tObjWidth = tObjectData.width;
                        tObjHeight = tObjectData.height;
                        var tSprite: GridSprite = map.getSprite(tObjectData.gid, tObjWidth, tObjHeight);
                        if (tSprite != null) {
                            switch (this._map.orientation) {
                                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                                    this.getScreenPositionByTilePos(tObjectData.x / tTileH, tObjectData.y / tTileH, Point.TEMP);
                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
                                    tSprite.rotation = tObjectData.rotation;
                                    tSprite.x = tSprite.relativeX = Point.TEMP.x + this._map.viewPortX;
                                    tSprite.y = tSprite.relativeY = Point.TEMP.y + this._map.viewPortY - tObjHeight / 2;
                                    break;
                                case IMap.TiledMap.ORIENTATION_STAGGERED://对象旋转后坐标计算的不对。。
                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
                                    tSprite.rotation = tObjectData.rotation;
                                    tSprite.x = tSprite.relativeX = tObjectData.x + tObjWidth / 2;
                                    tSprite.y = tSprite.relativeY = tObjectData.y - tObjHeight / 2;
                                    break;
                                case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
                                    tSprite.rotation = tObjectData.rotation;
                                    tSprite.x = tSprite.relativeX = tObjectData.x + tObjWidth / 2;
                                    tSprite.y = tSprite.relativeY = tObjectData.y - tObjHeight / 2;
                                    break;
                                case IMap.TiledMap.ORIENTATION_HEXAGONAL://待测试
                                    tSprite.x = tSprite.relativeX = tObjectData.x;
                                    tSprite.y = tSprite.relativeY = tObjectData.y;
                                    break;
                            }
                            this.addChild(tSprite);
                            this._gridSpriteArray.push(tSprite);
                            this._objDic[tObjectData.name] = tSprite;
                        }
                    }
                }
                break;
        }
    }

    /******************************************对外接口*********************************************/
    /**
     * 通过名字获取控制对象，如果找不到返回为null
     * @param	objName 所要获取对象的名字
     * @return
     */
    getObjectByName(objName: string): GridSprite {
        if (this._objDic) {
            return this._objDic[objName];
        }
        return null;
    }


    /**
     * 通过名字获取数据，如果找不到返回为null
     * @param	objName 所要获取对象的名字
     * @return
     */
    getObjectDataByName(objName: string): any {
        if (this._dataDic) {
            return this._dataDic[objName];
        }
        return null;
    }

    /**
     * 得到地图层的自定义属性
     * @param	name
     * @return
     */
    getLayerProperties(name: string): any {
        if (this._properties) {
            return this._properties[name];
        }
        return null;
    }

    /**
     * 得到指定格子的数据
     * @param	tileX 格子坐标X
     * @param	tileY 格子坐标Y
     * @return
     */
    getTileData(tileX: number, tileY: number): number {
        if (tileY >= 0 && tileY < this._map.numRowsTile && tileX >= 0 && tileX < this._map.numColumnsTile) {
            var tIndex: number = tileY * this._map.numColumnsTile + tileX;
            var tMapData: any[] = this._mapData;
            if (tMapData != null && tIndex < tMapData.length) {
                return tMapData[tIndex];
            }
        }
        return 0;
    }

    /**
     * 通过地图坐标得到屏幕坐标
     * @param	tileX 格子坐标X
     * @param	tileY 格子坐标Y
     * @param	screenPos 把计算好的屏幕坐标数据，放到此对象中
     */
    getScreenPositionByTilePos(tileX: number, tileY: number, screenPos: Point = null): void {
        if (screenPos) {
            switch (this._map.orientation) {
                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                    screenPos.x = this._map.width / 2 - (tileY - tileX) * this._tileWidthHalf;
                    screenPos.y = (tileY + tileX) * this._tileHeightHalf;
                    break;
                case IMap.TiledMap.ORIENTATION_STAGGERED:
                    tileX = Math.floor(tileX);
                    tileY = Math.floor(tileY);
                    screenPos.x = tileX * this._map.tileWidth + (tileY & 1) * this._tileWidthHalf;
                    screenPos.y = tileY * this._tileHeightHalf;
                    break;
                case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                    screenPos.x = tileX * this._map.tileWidth;
                    screenPos.y = tileY * this._map.tileHeight;
                    break;
                case IMap.TiledMap.ORIENTATION_HEXAGONAL:
                    tileX = Math.floor(tileX);
                    tileY = Math.floor(tileY);
                    var tTileHeight: number = this._map.tileHeight * 2 / 3;
                    screenPos.x = (tileX * this._map.tileWidth + tileY % 2 * this._tileWidthHalf) % this._map.gridWidth;
                    screenPos.y = (tileY * tTileHeight) % this._map.gridHeight;
                    break;
            }
            //地图坐标转换成屏幕坐标
            screenPos.x = (screenPos.x + this._map.viewPortX) * this._map.scale;
            screenPos.y = (screenPos.y + this._map.viewPortY) * this._map.scale;
        }
    }

    /**
     * 通过屏幕坐标来获取选中格子的数据
     * @param	screenX 屏幕坐标x
     * @param	screenY 屏幕坐标y
     * @return
     */
    getTileDataByScreenPos(screenX: number, screenY: number): number {
        var tData: number = 0;
        if (this.getTilePositionByScreenPos(screenX, screenY, this._tempMapPos)) {
            tData = this.getTileData(Math.floor(this._tempMapPos.x), Math.floor(this._tempMapPos.y));
        }
        return tData;
    }

    /**
     * 通过屏幕坐标来获取选中格子的索引
     * @param	screenX 屏幕坐标x
     * @param	screenY 屏幕坐标y
     * @param	result 把计算好的格子坐标，放到此对象中
     * @return
     */
    getTilePositionByScreenPos(screenX: number, screenY: number, result: Point = null): boolean {
        //转换成地图坐标
        screenX = screenX / this._map.scale - this._map.viewPortX;
        screenY = screenY / this._map.scale - this._map.viewPortY;
        var tTileW: number = this._map.tileWidth;
        var tTileH: number = this._map.tileHeight;

        var tV: number = 0;
        var tU: number = 0;
        switch (this._map.orientation) {
            case IMap.TiledMap.ORIENTATION_ISOMETRIC://45度角
                var tDirX: number = screenX - this._map.width / 2;
                var tDirY: number = screenY;
                tV = -(tDirX / tTileW - tDirY / tTileH);
                tU = tDirX / tTileW + tDirY / tTileH;
                if (result) {
                    result.x = tU;
                    result.y = tV;
                }
                return true;
                break;
            case IMap.TiledMap.ORIENTATION_STAGGERED://45度交错地图
                if (result) {
                    var cx: number, cy: number, rx: number, ry: number;
                    cx = Math.floor(screenX / tTileW) * tTileW + tTileW / 2;        //计算出当前X所在的以tileWidth为宽的矩形的中心的X坐标
                    cy = Math.floor(screenY / tTileH) * tTileH + tTileH / 2;//计算出当前Y所在的以tileHeight为高的矩形的中心的Y坐标

                    rx = (screenX - cx) * tTileH / 2;
                    ry = (screenY - cy) * tTileW / 2;

                    if (Math.abs(rx) + Math.abs(ry) <= tTileW * tTileH / 4) {
                        tU = Math.floor(screenX / tTileW);
                        tV = Math.floor(screenY / tTileH) * 2;
                    } else {
                        screenX = screenX - tTileW / 2;
                        tU = Math.floor(screenX / tTileW) + 1;
                        screenY = screenY - tTileH / 2;
                        tV = Math.floor(screenY / tTileH) * 2 + 1;
                    }
                    result.x = tU - (tV & 1);
                    result.y = tV;
                }
                return true;
                break;
            case IMap.TiledMap.ORIENTATION_ORTHOGONAL://直角
                tU = screenX / tTileW;
                tV = screenY / tTileH;
                if (result) {
                    result.x = tU;
                    result.y = tV;
                }
                return true;
                break;
            case IMap.TiledMap.ORIENTATION_HEXAGONAL://六边形
                var tTileHeight: number = tTileH * 2 / 3;
                tV = screenY / tTileHeight;
                tU = (screenX - tV % 2 * this._tileWidthHalf) / tTileW;
                if (result) {
                    result.x = tU;
                    result.y = tV;
                }
                break;
        }
        return false;
    }

    /***********************************************************************************************/
    /**
     * 得到一个GridSprite
     * @param	gridX 当前Grid的X轴索引
     * @param	gridY 当前Grid的Y轴索引
     * @return  一个GridSprite对象
     */
    getDrawSprite(gridX: number, gridY: number): GridSprite {
        var tSprite: GridSprite = new GridSprite();
        tSprite.relativeX = gridX * this._map.gridWidth;
        tSprite.relativeY = gridY * this._map.gridHeight;
        tSprite.initData(this._map);
        this._gridSpriteArray.push(tSprite);
        return tSprite;
    }

    /**
     * 更新此层中块的坐标
     * 手动刷新的目的是，保持层级的宽和高保持最小，加快渲染
     */
    updateGridPos(): void {
        var tSprite: GridSprite;
        for (var i: number = 0; i < this._gridSpriteArray.length; i++) {
            tSprite = this._gridSpriteArray[i];
            if ((tSprite.visible || tSprite.isAloneObject) && tSprite.drawImageNum > 0) {
                tSprite.updatePos();
            }
        }
    }

    /**
     * @private
     * 把tile画到指定的显示对象上
     * @param	gridSprite 被指定显示的目标
     * @param	tileX 格子的X轴坐标
     * @param	tileY 格子的Y轴坐标
     * @return
     */
    drawTileTexture(gridSprite: GridSprite, tileX: number, tileY: number): boolean {
        if (tileY >= 0 && tileY < this._map.numRowsTile && tileX >= 0 && tileX < this._map.numColumnsTile) {
            var tIndex: number = tileY * this._map.numColumnsTile + tileX;
            var tMapData: any[] = this._mapData;
            if (tMapData != null && tIndex < tMapData.length) {
                if (tMapData[tIndex] != 0) {
                    var tTileTexSet: TileTexSet = this._map.getTexture(tMapData[tIndex]);
                    if (tTileTexSet) {
                        var tX: number = 0;
                        var tY: number = 0;
                        var tTexture: Texture = tTileTexSet.texture;
                        switch (this._map.orientation) {
                            case IMap.TiledMap.ORIENTATION_STAGGERED://45度交错地图
                                tX = tileX * this._map.tileWidth % this._map.gridWidth + (tileY & 1) * this._tileWidthHalf;
                                tY = tileY * this._tileHeightHalf % this._map.gridHeight;
                                break;
                            case IMap.TiledMap.ORIENTATION_ORTHOGONAL://直角
                                tX = tileX * this._map.tileWidth % this._map.gridWidth;
                                tY = tileY * this._map.tileHeight % this._map.gridHeight;
                                break;
                            case IMap.TiledMap.ORIENTATION_ISOMETRIC://45度角
                                tX = (this._mapWidthHalf + (tileX - tileY) * this._tileWidthHalf) % this._map.gridWidth;
                                tY = ((tileX + tileY) * this._tileHeightHalf) % this._map.gridHeight;
                                break;
                            case IMap.TiledMap.ORIENTATION_HEXAGONAL://六边形
                                var tTileHeight: number = this._map.tileHeight * 2 / 3;
                                tX = (tileX * this._map.tileWidth + tileY % 2 * this._tileWidthHalf) % this._map.gridWidth;
                                tY = (tileY * tTileHeight) % this._map.gridHeight;
                                break;
                        }
                        if (tTileTexSet.isAnimation) {
                            var tAnimationSprite: TileAniSprite = new TileAniSprite();
                            tAnimationSprite.x = tX;
                            tAnimationSprite.y = tY;
                            tAnimationSprite.setTileTextureSet(tIndex.toString(), tTileTexSet);
                            gridSprite.addAniSprite(tAnimationSprite);
                            gridSprite.addChild(tAnimationSprite);
                            gridSprite.isHaveAnimation = true;
                        } else {
                            //gridSprite.graphics.drawImage(tTileTexSet.texture, tX + tTileTexSet.offX, tY + tTileTexSet.offY, tTexture.width, tTexture.height);
                            gridSprite.graphics.drawImage(tTileTexSet.texture, tX + tTileTexSet.offX, tY + tTileTexSet.offY);
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * @private
     * 清理当前对象
     */
    clearAll(): void {
        this._map = null;
        this._mapData = null;
        this._tileWidthHalf = 0;
        this._tileHeightHalf = 0;
        this._mapWidthHalf = 0;
        this._mapHeightHalf = 0;
        this.layerName = null;
        var i: number = 0;
        if (this._objDic) {
            for (var p in this._objDic) {
                delete this._objDic[p];
            }
            this._objDic = null;
        }
        if (this._dataDic) {
            for (p in this._dataDic) {
                delete this._dataDic[p];
            }
            this._dataDic = null;
        }
        var tGridSprite: GridSprite;
        for (i = 0; i < this._gridSpriteArray.length; i++) {
            tGridSprite = this._gridSpriteArray[i];
            tGridSprite.clearAll();
        }
        this._properties = null;
        this._tempMapPos = null;
        this.tarLayer = null;
    }
}

