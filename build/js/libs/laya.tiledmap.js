(function (exports, Laya) {
	'use strict';

	/**
	 * 地图的每层都会分块渲染处理
	 * 本类就是地图的块数据
	 * @author ...
	 */
	class GridSprite extends Laya.Sprite {
	    constructor() {
	        super(...arguments);
	        /**相对于地图X轴的坐标*/
	        this.relativeX = 0;
	        /**相对于地图Y轴的坐标*/
	        this.relativeY = 0;
	        /**是否用于对象层的独立物件*/
	        this.isAloneObject = false;
	        /**当前GRID中是否有动画*/
	        this.isHaveAnimation = false;
	        /**当前GRID包含多少个TILE(包含动画)*/
	        this.drawImageNum = 0;
	        this._map = null; //当前地图对象的引用
	    }
	    /**
	     * 传入必要的参数，用于裁剪，跟确认此对象类型
	     * @param	map	把地图的引用传进来，参与一些裁剪计算
	     * @param	objectKey true:表示当前GridSprite是个活动对象，可以控制，false:地图层的组成块
	     */
	    initData(map, objectKey = false) {
	        this._map = map;
	        this.isAloneObject = objectKey;
	    }
	    /**
	     * 把一个动画对象绑定到当前GridSprite
	     * @param	sprite 动画的显示对象
	     */
	    addAniSprite(sprite) {
	        if (this.aniSpriteArray == null) {
	            this.aniSpriteArray = [];
	        }
	        this.aniSpriteArray.push(sprite);
	    }
	    /**
	     * 显示当前GridSprite，并把上面的动画全部显示
	     */
	    show() {
	        if (!this.visible) {
	            this.visible = true;
	            if (this.aniSpriteArray == null) {
	                return;
	            }
	            var tAniSprite;
	            for (var i = 0; i < this.aniSpriteArray.length; i++) {
	                tAniSprite = this.aniSpriteArray[i];
	                tAniSprite.show();
	            }
	        }
	    }
	    /**
	     * 隐藏当前GridSprite，并把上面绑定的动画全部移除
	     */
	    hide() {
	        if (this.visible) {
	            this.visible = false;
	            if (this.aniSpriteArray == null) {
	                return;
	            }
	            var tAniSprite;
	            for (var i = 0; i < this.aniSpriteArray.length; i++) {
	                tAniSprite = this.aniSpriteArray[i];
	                tAniSprite.hide();
	            }
	        }
	    }
	    /**
	     * 刷新坐标，当我们自己控制一个GridSprite移动时，需要调用此函数，手动刷新
	     */
	    updatePos() {
	        if (this.isAloneObject) {
	            if (this._map) {
	                this.x = this.relativeX - this._map._viewPortX;
	                this.y = this.relativeY - this._map._viewPortY;
	            }
	            if (this.x < 0 || this.x > this._map.viewPortWidth || this.y < 0 || this.y > this._map.viewPortHeight) {
	                this.hide();
	            }
	            else {
	                this.show();
	            }
	        }
	        else {
	            if (this._map) {
	                this.x = this.relativeX - this._map._viewPortX;
	                this.y = this.relativeY - this._map._viewPortY;
	            }
	        }
	    }
	    /**
	     * 重置当前对象的所有属性
	     */
	    clearAll() {
	        if (this._map) {
	            this._map = null;
	        }
	        this.visible = false;
	        var tAniSprite;
	        if (this.aniSpriteArray != null) {
	            for (var i = 0; i < this.aniSpriteArray.length; i++) {
	                tAniSprite = this.aniSpriteArray[i];
	                tAniSprite.clearAll();
	            }
	        }
	        this.destroy();
	        this.relativeX = 0;
	        this.relativeY = 0;
	        this.isHaveAnimation = false;
	        this.aniSpriteArray = null;
	        this.drawImageNum = 0;
	    }
	}

	class IMap {
	}
	IMap.TiledMap = null;

	/**
	 * TildMap的动画显示对象（一个动画（TileTexSet），可以绑定多个动画显示对象（TileAniSprite））
	 * @author ...
	 */
	class TileAniSprite extends Laya.Sprite {
	    constructor() {
	        super(...arguments);
	        this._tileTextureSet = null; //动画的引用
	        this._aniName = null; //当前动画显示对象的名字，名字唯一
	    }
	    /**
	     * 确定当前显示对象的名称以及属于哪个动画
	     * @param	aniName	当前动画显示对象的名字，名字唯一
	     * @param	tileTextureSet 当前显示对象属于哪个动画（一个动画，可以绑定多个同类显示对象）
	     */
	    setTileTextureSet(aniName, tileTextureSet) {
	        this._aniName = aniName;
	        this._tileTextureSet = tileTextureSet;
	        tileTextureSet.addAniSprite(this._aniName, this);
	    }
	    /**
	     * 把当前动画加入到对应的动画刷新列表中
	     */
	    show() {
	        this._tileTextureSet.addAniSprite(this._aniName, this);
	    }
	    /**
	     * 把当前动画从对应的动画刷新列表中移除
	     */
	    hide() {
	        this._tileTextureSet.removeAniSprite(this._aniName);
	    }
	    /**
	     * 清理
	     */
	    clearAll() {
	        this._tileTextureSet.removeAniSprite(this._aniName);
	        this.destroy();
	        this._tileTextureSet = null;
	        this._aniName = null;
	    }
	}

	/**
	 * 地图支持多层渲染（例如，地表层，植被层，建筑层等）
	 * 本类就是层级类
	 * @author ...
	 */
	class MapLayer extends Laya.Sprite {
	    constructor() {
	        super(...arguments);
	        /**@internal */
	        this._mapData = null;
	        this._tileWidthHalf = 0;
	        this._tileHeightHalf = 0;
	        this._mapWidthHalf = 0;
	        this._mapHeightHalf = 0;
	        /**
	         * @internal
	         */
	        this._gridSpriteArray = [];
	        this._objDic = null; //用来做字典，方便查询
	        this._dataDic = null;
	        this._tempMapPos = new Laya.Point(); //临时变量
	        /**当前Layer的名称*/
	        this.layerName = null;
	    }
	    /**
	     * 解析LAYER数据，以及初始化一些数据
	     * @param	layerData 地图数据中，layer数据的引用
	     * @param	map 地图的引用
	     */
	    init(layerData, map) {
	        this._map = map;
	        this._mapData = layerData.data;
	        //地图宽和高（单位:格子）
	        var tHeight = layerData.height;
	        var tWidth = layerData.width;
	        var tTileW = map.tileWidth;
	        var tTileH = map.tileHeight;
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
	                var tArray = layerData.objects;
	                if (tArray.length > 0) {
	                    this._objDic = {};
	                    this._dataDic = {};
	                }
	                var tObjectData;
	                var tObjWidth;
	                var tObjHeight;
	                for (var i = 0; i < tArray.length; i++) {
	                    tObjectData = tArray[i];
	                    this._dataDic[tObjectData.name] = tObjectData;
	                    //这里要看具体需求，看是不是要开放
	                    if (tObjectData.visible == true) {
	                        tObjWidth = tObjectData.width;
	                        tObjHeight = tObjectData.height;
	                        var tSprite = map.getSprite(tObjectData.gid, tObjWidth, tObjHeight);
	                        if (tSprite != null) {
	                            switch (this._map.orientation) {
	                                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
	                                    this.getScreenPositionByTilePos(tObjectData.x / tTileH, tObjectData.y / tTileH, Laya.Point.TEMP);
	                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
	                                    tSprite.rotation = tObjectData.rotation;
	                                    tSprite.x = tSprite.relativeX = Laya.Point.TEMP.x + this._map.viewPortX;
	                                    tSprite.y = tSprite.relativeY = Laya.Point.TEMP.y + this._map.viewPortY - tObjHeight / 2;
	                                    break;
	                                case IMap.TiledMap.ORIENTATION_STAGGERED: //对象旋转后坐标计算的不对。。
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
	                                case IMap.TiledMap.ORIENTATION_HEXAGONAL: //待测试
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
	    getObjectByName(objName) {
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
	    getObjectDataByName(objName) {
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
	    getLayerProperties(name) {
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
	    getTileData(tileX, tileY) {
	        if (tileY >= 0 && tileY < this._map.numRowsTile && tileX >= 0 && tileX < this._map.numColumnsTile) {
	            var tIndex = tileY * this._map.numColumnsTile + tileX;
	            var tMapData = this._mapData;
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
	    getScreenPositionByTilePos(tileX, tileY, screenPos = null) {
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
	                    var tTileHeight = this._map.tileHeight * 2 / 3;
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
	    getTileDataByScreenPos(screenX, screenY) {
	        var tData = 0;
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
	    getTilePositionByScreenPos(screenX, screenY, result = null) {
	        //转换成地图坐标
	        screenX = screenX / this._map.scale - this._map.viewPortX;
	        screenY = screenY / this._map.scale - this._map.viewPortY;
	        var tTileW = this._map.tileWidth;
	        var tTileH = this._map.tileHeight;
	        var tV = 0;
	        var tU = 0;
	        switch (this._map.orientation) {
	            case IMap.TiledMap.ORIENTATION_ISOMETRIC: //45度角
	                var tDirX = screenX - this._map.width / 2;
	                var tDirY = screenY;
	                tV = -(tDirX / tTileW - tDirY / tTileH);
	                tU = tDirX / tTileW + tDirY / tTileH;
	                if (result) {
	                    result.x = tU;
	                    result.y = tV;
	                }
	                return true;
	                break;
	            case IMap.TiledMap.ORIENTATION_STAGGERED: //45度交错地图
	                if (result) {
	                    var cx, cy, rx, ry;
	                    cx = Math.floor(screenX / tTileW) * tTileW + tTileW / 2; //计算出当前X所在的以tileWidth为宽的矩形的中心的X坐标
	                    cy = Math.floor(screenY / tTileH) * tTileH + tTileH / 2; //计算出当前Y所在的以tileHeight为高的矩形的中心的Y坐标
	                    rx = (screenX - cx) * tTileH / 2;
	                    ry = (screenY - cy) * tTileW / 2;
	                    if (Math.abs(rx) + Math.abs(ry) <= tTileW * tTileH / 4) {
	                        tU = Math.floor(screenX / tTileW);
	                        tV = Math.floor(screenY / tTileH) * 2;
	                    }
	                    else {
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
	            case IMap.TiledMap.ORIENTATION_ORTHOGONAL: //直角
	                tU = screenX / tTileW;
	                tV = screenY / tTileH;
	                if (result) {
	                    result.x = tU;
	                    result.y = tV;
	                }
	                return true;
	                break;
	            case IMap.TiledMap.ORIENTATION_HEXAGONAL: //六边形
	                var tTileHeight = tTileH * 2 / 3;
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
	    getDrawSprite(gridX, gridY) {
	        var tSprite = new GridSprite();
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
	    updateGridPos() {
	        var tSprite;
	        for (var i = 0; i < this._gridSpriteArray.length; i++) {
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
	    drawTileTexture(gridSprite, tileX, tileY) {
	        if (tileY >= 0 && tileY < this._map.numRowsTile && tileX >= 0 && tileX < this._map.numColumnsTile) {
	            var tIndex = tileY * this._map.numColumnsTile + tileX;
	            var tMapData = this._mapData;
	            if (tMapData != null && tIndex < tMapData.length) {
	                if (tMapData[tIndex] != 0) {
	                    var tTileTexSet = this._map.getTexture(tMapData[tIndex]);
	                    if (tTileTexSet) {
	                        var tX = 0;
	                        var tY = 0;
	                        var tTexture = tTileTexSet.texture;
	                        switch (this._map.orientation) {
	                            case IMap.TiledMap.ORIENTATION_STAGGERED: //45度交错地图
	                                tX = tileX * this._map.tileWidth % this._map.gridWidth + (tileY & 1) * this._tileWidthHalf;
	                                tY = tileY * this._tileHeightHalf % this._map.gridHeight;
	                                break;
	                            case IMap.TiledMap.ORIENTATION_ORTHOGONAL: //直角
	                                tX = tileX * this._map.tileWidth % this._map.gridWidth;
	                                tY = tileY * this._map.tileHeight % this._map.gridHeight;
	                                break;
	                            case IMap.TiledMap.ORIENTATION_ISOMETRIC: //45度角
	                                tX = (this._mapWidthHalf + (tileX - tileY) * this._tileWidthHalf) % this._map.gridWidth;
	                                tY = ((tileX + tileY) * this._tileHeightHalf) % this._map.gridHeight;
	                                break;
	                            case IMap.TiledMap.ORIENTATION_HEXAGONAL: //六边形
	                                var tTileHeight = this._map.tileHeight * 2 / 3;
	                                tX = (tileX * this._map.tileWidth + tileY % 2 * this._tileWidthHalf) % this._map.gridWidth;
	                                tY = (tileY * tTileHeight) % this._map.gridHeight;
	                                break;
	                        }
	                        if (tTileTexSet.isAnimation) {
	                            var tAnimationSprite = new TileAniSprite();
	                            tAnimationSprite.x = tX;
	                            tAnimationSprite.y = tY;
	                            tAnimationSprite.setTileTextureSet(tIndex.toString(), tTileTexSet);
	                            gridSprite.addAniSprite(tAnimationSprite);
	                            gridSprite.addChild(tAnimationSprite);
	                            gridSprite.isHaveAnimation = true;
	                        }
	                        else {
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
	    clearAll() {
	        this._map = null;
	        this._mapData = null;
	        this._tileWidthHalf = 0;
	        this._tileHeightHalf = 0;
	        this._mapWidthHalf = 0;
	        this._mapHeightHalf = 0;
	        this.layerName = null;
	        var i = 0;
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
	        var tGridSprite;
	        for (i = 0; i < this._gridSpriteArray.length; i++) {
	            tGridSprite = this._gridSpriteArray[i];
	            tGridSprite.clearAll();
	        }
	        this._properties = null;
	        this._tempMapPos = null;
	        this.tarLayer = null;
	    }
	}

	/**
	 * 此类是子纹理类，也包括同类动画的管理
	 * TiledMap会把纹理分割成无数子纹理，也可以把其中的某块子纹理替换成一个动画序列
	 * 本类的实现就是如果发现子纹理被替换成一个动画序列，animationKey会被设为true
	 * 即animationKey为true,就使用TileAniSprite来做显示，把动画序列根据时间画到TileAniSprite上
	 * @author ...
	 */
	class TileTexSet {
	    constructor() {
	        /**唯一标识*/
	        this.gid = -1;
	        /**纹理显示时的坐标偏移X*/
	        this.offX = 0;
	        /**纹理显示时的坐标偏移Y*/
	        this.offY = 0;
	        //下面是动画支持需要的
	        /**当前要播放动画的纹理序列*/
	        this.textureArray = null;
	        /** 当前动画每帧的时间间隔*/
	        this.durationTimeArray = null;
	        /** 动画播放的总时间 */
	        this.animationTotalTime = 0;
	        /**true表示当前纹理，是一组动画，false表示当前只有一个纹理*/
	        this.isAnimation = false;
	        this._spriteNum = 0; //当前动画有多少个显示对象
	        this._aniDic = null; //通过显示对象的唯一名字，去保存显示显示对象
	        this._frameIndex = 0; //当前动画播放到第几帧
	        this._time = 0; //距离上次动画刷新，过了多少长时间
	        this._interval = 0; //每帧刷新的时间间隔
	        this._preFrameTime = 0; //上一帧刷新的时间戳
	    }
	    /**
	     * 加入一个动画显示对象到此动画中
	     * @param	aniName	//显示对象的名字
	     * @param	sprite	//显示对象
	     */
	    addAniSprite(aniName, sprite) {
	        if (this.animationTotalTime == 0) {
	            return;
	        }
	        if (this._aniDic == null) {
	            this._aniDic = {};
	        }
	        if (this._spriteNum == 0) {
	            //每3帧刷新一下吧，每帧刷新可能太耗了
	            Laya.ILaya.timer.frameLoop(3, this, this.animate);
	            this._preFrameTime = Laya.ILaya.Browser.now();
	            this._frameIndex = 0;
	            this._time = 0;
	            this._interval = 0;
	        }
	        this._spriteNum++;
	        this._aniDic[aniName] = sprite;
	        if (this.textureArray && this._frameIndex < this.textureArray.length) {
	            var tTileTextureSet = this.textureArray[this._frameIndex];
	            this.drawTexture(sprite, tTileTextureSet);
	        }
	    }
	    /**
	     * 把动画画到所有注册的SPRITE上
	     */
	    animate() {
	        if (this.textureArray && this.textureArray.length > 0 && this.durationTimeArray && this.durationTimeArray.length > 0) {
	            var tNow = Laya.ILaya.Browser.now();
	            this._interval = tNow - this._preFrameTime;
	            this._preFrameTime = tNow;
	            if (this._interval > this.animationTotalTime) {
	                this._interval = this._interval % this.animationTotalTime;
	            }
	            this._time += this._interval;
	            var tTime = this.durationTimeArray[this._frameIndex];
	            while (this._time > tTime) {
	                this._time -= tTime;
	                this._frameIndex++;
	                if (this._frameIndex >= this.durationTimeArray.length || this._frameIndex >= this.textureArray.length) {
	                    this._frameIndex = 0;
	                }
	                var tTileTextureSet = this.textureArray[this._frameIndex];
	                var tSprite;
	                for (var p in this._aniDic) {
	                    tSprite = this._aniDic[p];
	                    this.drawTexture(tSprite, tTileTextureSet);
	                }
	                tTime = this.durationTimeArray[this._frameIndex];
	            }
	        }
	    }
	    drawTexture(sprite, tileTextSet) {
	        sprite.graphics.clear(true);
	        //sprite.graphics.drawImage(tileTextSet.texture, tileTextSet.offX, tileTextSet.offY, tileTextSet.texture.width, tileTextSet.texture.height);
	        sprite.graphics.drawImage(tileTextSet.texture, tileTextSet.offX, tileTextSet.offY);
	    }
	    /**
	     * 移除不需要更新的SPRITE
	     * @param	_name
	     */
	    removeAniSprite(_name) {
	        if (this._aniDic && this._aniDic[_name]) {
	            delete this._aniDic[_name];
	            this._spriteNum--;
	            if (this._spriteNum == 0) {
	                Laya.ILaya.timer.clear(this, this.animate);
	            }
	        }
	    }
	    /**
	     * 显示当前动画的使用情况
	     */
	    showDebugInfo() {
	        var tInfo = null;
	        if (this._spriteNum > 0) {
	            tInfo = "TileTextureSet::gid:" + this.gid.toString() + " 动画数:" + this._spriteNum.toString();
	        }
	        return tInfo;
	    }
	    /**
	     * 清理
	     */
	    clearAll() {
	        this.gid = -1; //唯一标识
	        if (this.texture) {
	            this.texture.destroy();
	            this.texture = null;
	        }
	        this.offX = 0;
	        this.offY = 0;
	        this.textureArray = null;
	        this.durationTimeArray = null;
	        this.isAnimation = false;
	        this._spriteNum = 0;
	        this._aniDic = null;
	        this._frameIndex = 0;
	        this._preFrameTime = 0;
	        this._time = 0;
	        this._interval = 0;
	    }
	}

	/**
	 * tiledMap是整个地图的核心
	 * 地图以层级来划分地图（例如：地表层，植被层，建筑层）
	 * 每层又以分块（GridSprite)来处理显示对象，只显示在视口区域的区
	 * 每块又包括N*N个格子（tile)
	 * 格子类型又分为动画格子跟图片格子两种
	 * @author ...
	 */
	class TiledMap {
	    constructor() {
	        //存放地图中用到的所有子纹理数据
	        this._tileTexSetArr = [];
	        //主纹理数据，主要在释放纹理资源时使用
	        this._texArray = [];
	        //地图信息中的一些基本数据
	        this._x = 0; //地图的坐标
	        this._y = 0;
	        //_width = _mapTileW * _mapW
	        //_height = _mapTileH * _mapH
	        this._width = 0; //地图的宽度
	        this._height = 0; //地图的高度
	        this._mapW = 0; //地图的横向格子数
	        this._mapH = 0; //地图的竖向格子数
	        this._mapTileW = 0; //tile的宽度
	        this._mapTileH = 0; //tile的高度
	        //用来存放地图的视口信息
	        this._rect = new Laya.Rectangle();
	        //用来存放地图的视口扩充区域
	        this._paddingRect = new Laya.Rectangle();
	        //地图的显示对象
	        this._mapSprite = null; //地图的显示对象
	        this._layerArray = []; //这里保存所有的MapLayer对象
	        this._renderLayerArray = []; //这里保存需要渲染的MapLayer对象
	        this._gridArray = []; //保存所有的块数据
	        //地图块相关的
	        this._showGridKey = false; //是否显示块边界线（用来调试用）
	        this._totalGridNum = 0; //一层中的GridSprite的总数
	        this._gridW = 0; //地图的横向块数
	        this._gridH = 0; //地图的坚向块数
	        this._gridWidth = 450; //块的默认宽度
	        this._gridHeight = 450; //块的默认高度
	        this._jsonLoader = null; //用来加载JSON文件用的LOADER
	        this._loader = null; //用来加载纹理数据用的LOADER
	        this._tileSetArray = []; //用来存放还需要哪些儿纹理等待加载
	        this._currTileSet = null; //正在加载的纹理需要的数据源
	        this._completeHandler = null; //地图创建完成的回调函数
	        //用来裁剪块的区域（有当前视口和上次视口显示多少的块，就能哪些儿块需要显示或隐藏
	        this._mapRect = new GRect(); //当前视口显示的块范围
	        this._mapLastRect = new GRect(); //上次视口显示的块范围
	        this._index = 0;
	        this._animationDic = {}; //需要创建的动画数据
	        this._tileProperties = {}; //图块属性
	        this._tileProperties2 = {};
	        //默认的地图类型（具体要看JSON文件）
	        this._orientation = "orthogonal";
	        //默认的tile渲染顺序（具体要看JSON文件）
	        this._renderOrder = "right-down";
	        //调试用的颜色组合
	        this._colorArray = ["FF", "00", "33", "66"];
	        //缩放相关的操作
	        this._scale = 1;
	        this._pivotScaleX = 0.5;
	        this._pivotScaleY = 0.5;
	        this._centerX = 0;
	        this._centerY = 0;
	        /**@internal */
	        this._viewPortX = 0;
	        /**@internal */
	        this._viewPortY = 0;
	        this._viewPortWidth = 0;
	        this._viewPortHeight = 0;
	        //是否开启线性取样
	        this._enableLinear = true;
	        //把地图限制在显示区域
	        this._limitRange = false;
	        /**
	         * 是否自动缓存没有动画的地块
	         */
	        this.autoCache = true;
	        /**
	         * 自动缓存类型,地图较大时建议使用normal
	         */
	        this.autoCacheType = "normal";
	        /**
	         * 是否合并图层,开启合并图层时，图层属性内可添加layer属性，运行时将会将相邻的layer属性相同的图层进行合并以提高性能
	         */
	        this.enableMergeLayer = false;
	        /**
	         * 是否移除被覆盖的格子,地块可添加type属性，type不为0时表示不透明，被不透明地块遮挡的地块将会被剔除以提高性能
	         */
	        this.removeCoveredTile = false;
	        /**
	         * 是否显示大格子里显示的贴图数量
	         */
	        this.showGridTextureCount = false;
	        /**
	         * 是否调整地块边缘消除缩放导致的缝隙
	         */
	        this.antiCrack = true;
	        /**
	         * 是否在加载完成之后cache所有大格子
	         */
	        this.cacheAllAfterInit = false;
	        this._texutreStartDic = {};
	    }
	    /**
	     * 创建地图
	     * @param	mapName 		JSON文件名字
	     * @param	viewRect 		视口区域
	     * @param	completeHandler 地图创建完成的回调函数
	     * @param	viewRectPadding 视口扩充区域，把视口区域上、下、左、右扩充一下，防止视口移动时的穿帮
	     * @param	gridSize 		grid大小
	     * @param	enableLinear 	是否开启线性取样（为false时，可以解决地图黑线的问题，但画质会锐化）
	     * @param	limitRange		把地图限制在显示区域
	     */
	    createMap(mapName, viewRect, completeHandler, viewRectPadding = null, gridSize = null, enableLinear = true, limitRange = false) {
	        this._enableLinear = enableLinear;
	        this._limitRange = limitRange;
	        this._rect.x = viewRect.x;
	        this._rect.y = viewRect.y;
	        this._rect.width = viewRect.width;
	        this._rect.height = viewRect.height;
	        this._viewPortWidth = viewRect.width / this._scale;
	        this._viewPortHeight = viewRect.height / this._scale;
	        this._completeHandler = completeHandler;
	        if (viewRectPadding) {
	            this._paddingRect.copyFrom(viewRectPadding);
	        }
	        else {
	            this._paddingRect.setTo(0, 0, 0, 0);
	        }
	        if (gridSize) {
	            this._gridWidth = gridSize.x;
	            this._gridHeight = gridSize.y;
	        }
	        var tIndex = mapName.lastIndexOf("/");
	        if (tIndex > -1) {
	            this._resPath = mapName.substr(0, tIndex);
	            this._pathArray = this._resPath.split("/");
	        }
	        else {
	            this._resPath = "";
	            this._pathArray = [];
	        }
	        this._jsonLoader = new Laya.Loader();
	        this._jsonLoader.once("complete", this, this.onJsonComplete);
	        this._jsonLoader.load(mapName, Laya.Loader.JSON, false);
	    }
	    /**
	     * json文件读取成功后，解析里面的纹理数据，进行加载
	     * @param	e JSON数据
	     */
	    onJsonComplete(e) {
	        this._mapSprite = new Laya.Sprite();
	        Laya.ILaya.stage.addChild(this._mapSprite);
	        var tJsonData = this._jsonData = e;
	        this._properties = tJsonData.properties;
	        this._orientation = tJsonData.orientation;
	        this._renderOrder = tJsonData.renderorder;
	        this._mapW = tJsonData.width;
	        this._mapH = tJsonData.height;
	        this._mapTileW = tJsonData.tilewidth;
	        this._mapTileH = tJsonData.tileheight;
	        this._width = this._mapTileW * this._mapW;
	        this._height = this._mapTileH * this._mapH;
	        if (this._orientation == TiledMap.ORIENTATION_STAGGERED) {
	            this._height = (0.5 + this._mapH * 0.5) * this._mapTileH;
	        }
	        this._mapLastRect.top = this._mapLastRect.bottom = this._mapLastRect.left = this._mapLastRect.right = -1;
	        var tArray = tJsonData.tilesets;
	        var tileset;
	        var tTileSet;
	        var i = 0;
	        for (i = 0; i < tArray.length; i++) {
	            tileset = tArray[i];
	            tTileSet = new TileSet();
	            tTileSet.init(tileset);
	            if (tTileSet.properties && tTileSet.properties.ignore)
	                continue;
	            this._tileProperties[i] = tTileSet.tileproperties;
	            this.addTileProperties(tTileSet.tileproperties);
	            this._tileSetArray.push(tTileSet);
	            //动画数据
	            var tTiles = tileset.tiles;
	            if (tTiles) {
	                for (var p in tTiles) {
	                    var tAnimation = tTiles[p].animation;
	                    if (tAnimation) {
	                        var tAniData = new TileMapAniData();
	                        this._animationDic[p] = tAniData;
	                        tAniData.image = tileset.image;
	                        for (var j = 0; j < tAnimation.length; j++) {
	                            var tAnimationItem = tAnimation[j];
	                            tAniData.mAniIdArray.push(tAnimationItem.tileid);
	                            tAniData.mDurationTimeArray.push(tAnimationItem.duration);
	                        }
	                    }
	                }
	            }
	        }
	        this._tileTexSetArr.push(null);
	        if (this._tileSetArray.length > 0) {
	            tTileSet = this._currTileSet = this._tileSetArray.shift();
	            this._loader = new Laya.Loader();
	            this._loader.once("complete", this, this.onTextureComplete);
	            var tPath = this.mergePath(this._resPath, tTileSet.image);
	            this._loader.load(tPath, Laya.Loader.IMAGE, false);
	        }
	    }
	    /**
	     * 合并路径
	     * @param	resPath
	     * @param	relativePath
	     * @return
	     */
	    mergePath(resPath, relativePath) {
	        var tResultPath = "";
	        var tImageArray = relativePath.split("/");
	        var tParentPathNum = 0;
	        var i = 0;
	        for (i = tImageArray.length - 1; i >= 0; i--) {
	            if (tImageArray[i] == "..") {
	                tParentPathNum++;
	            }
	        }
	        if (tParentPathNum == 0) {
	            if (this._pathArray.length > 0) {
	                tResultPath = resPath + "/" + relativePath;
	            }
	            else {
	                tResultPath = relativePath;
	            }
	            return tResultPath;
	        }
	        var tSrcNum = this._pathArray.length - tParentPathNum;
	        if (tSrcNum < 0) {
	            console.log("[error]path does not exist", this._pathArray, tImageArray, resPath, relativePath);
	        }
	        for (i = 0; i < tSrcNum; i++) {
	            if (i == 0) {
	                tResultPath += this._pathArray[i];
	            }
	            else {
	                tResultPath = tResultPath + "/" + this._pathArray[i];
	            }
	        }
	        for (i = tParentPathNum; i < tImageArray.length; i++) {
	            tResultPath = tResultPath + "/" + tImageArray[i];
	        }
	        return tResultPath;
	    }
	    /**
	     * 纹理加载完成，如果所有的纹理加载，开始初始化地图
	     * @param	e 纹理数据
	     */
	    onTextureComplete(e) {
	        var json = this._jsonData;
	        var tTexture = e;
	        if (!this._enableLinear) {
	            tTexture.bitmap.minFifter = 0x2600; //TODO any
	            tTexture.bitmap.magFifter = 0x2600; // TODO any
	        }
	        this._texArray.push(tTexture);
	        //var tVersion:int = json.viersion;
	        var tTileSet = this._currTileSet;
	        var tTileTextureW = tTileSet.tilewidth;
	        var tTileTextureH = tTileSet.tileheight;
	        var tImageWidth = tTileSet.imagewidth;
	        var tImageHeight = tTileSet.imageheight;
	        var tFirstgid = tTileSet.firstgid;
	        var tTileWNum = Math.floor((tImageWidth - tTileSet.margin - tTileTextureW) / (tTileTextureW + tTileSet.spacing)) + 1;
	        var tTileHNum = Math.floor((tImageHeight - tTileSet.margin - tTileTextureH) / (tTileTextureH + tTileSet.spacing)) + 1;
	        var tTileTexSet = null;
	        this._texutreStartDic[tTileSet.image] = this._tileTexSetArr.length;
	        for (var i = 0; i < tTileHNum; i++) {
	            for (var j = 0; j < tTileWNum; j++) {
	                tTileTexSet = new TileTexSet();
	                tTileTexSet.offX = tTileSet.titleoffsetX;
	                tTileTexSet.offY = tTileSet.titleoffsetY - (tTileTextureH - this._mapTileH);
	                //tTileTexSet.texture = Texture.create(tTexture, tTileSet.margin + (tTileTextureW + tTileSet.spacing) * j, tTileSet.margin + (tTileTextureH + tTileSet.spacing) * i, tTileTextureW, tTileTextureH);
	                tTileTexSet.texture = Laya.Texture.createFromTexture(tTexture, tTileSet.margin + (tTileTextureW + tTileSet.spacing) * j, tTileSet.margin + (tTileTextureH + tTileSet.spacing) * i, tTileTextureW, tTileTextureH);
	                if (this.antiCrack)
	                    this.adptTexture(tTileTexSet.texture);
	                this._tileTexSetArr.push(tTileTexSet);
	                tTileTexSet.gid = this._tileTexSetArr.length;
	            }
	        }
	        if (this._tileSetArray.length > 0) {
	            tTileSet = this._currTileSet = this._tileSetArray.shift();
	            this._loader.once("complete", this, this.onTextureComplete);
	            var tPath = this.mergePath(this._resPath, tTileSet.image);
	            this._loader.load(tPath, Laya.Loader.IMAGE, false);
	        }
	        else {
	            this._currTileSet = null;
	            this.initMap();
	        }
	    }
	    adptTexture(tex) {
	        if (!tex)
	            return;
	        var pX = tex.uv[0];
	        var pX1 = tex.uv[2];
	        var pY = tex.uv[1];
	        var pY1 = tex.uv[7];
	        var dW = 1 / tex.bitmap.width;
	        var dH = 1 / tex.bitmap.height;
	        var Tex = tex;
	        Tex.uv[0] = Tex.uv[6] = pX + dW;
	        Tex.uv[2] = Tex.uv[4] = pX1 - dW;
	        Tex.uv[1] = Tex.uv[3] = pY + dH;
	        Tex.uv[5] = Tex.uv[7] = pY1 - dH;
	    }
	    /**
	     * 初始化地图
	     */
	    initMap() {
	        var i, n;
	        for (var p in this._animationDic) {
	            var tAniData = this._animationDic[p];
	            var gStart;
	            gStart = this._texutreStartDic[tAniData.image];
	            var tTileTexSet = this.getTexture(parseInt(p) + gStart);
	            if (tAniData.mAniIdArray.length > 0) {
	                tTileTexSet.textureArray = [];
	                tTileTexSet.durationTimeArray = tAniData.mDurationTimeArray;
	                tTileTexSet.isAnimation = true;
	                tTileTexSet.animationTotalTime = 0;
	                for (i = 0, n = tTileTexSet.durationTimeArray.length; i < n; i++) {
	                    tTileTexSet.animationTotalTime += tTileTexSet.durationTimeArray[i];
	                }
	                for (i = 0, n = tAniData.mAniIdArray.length; i < n; i++) {
	                    var tTexture = this.getTexture(tAniData.mAniIdArray[i] + gStart);
	                    tTileTexSet.textureArray.push(tTexture);
	                }
	            }
	        }
	        this._gridWidth = Math.floor(this._gridWidth / this._mapTileW) * this._mapTileW;
	        this._gridHeight = Math.floor(this._gridHeight / this._mapTileH) * this._mapTileH;
	        if (this._gridWidth < this._mapTileW) {
	            this._gridWidth = this._mapTileW;
	        }
	        if (this._gridHeight < this._mapTileH) {
	            this._gridHeight = this._mapTileH;
	        }
	        this._gridW = Math.ceil(this._width / this._gridWidth);
	        this._gridH = Math.ceil(this._height / this._gridHeight);
	        this._totalGridNum = this._gridW * this._gridH;
	        for (i = 0; i < this._gridH; i++) {
	            var tGridArray = [];
	            this._gridArray.push(tGridArray);
	            for (var j = 0; j < this._gridW; j++) {
	                tGridArray.push(null);
	            }
	        }
	        var tLayerArray = this._jsonData.layers;
	        var isFirst = true;
	        var tLayerTarLayerName;
	        var preLayerTarName;
	        var preLayer;
	        //创建地图层级
	        for (var tLayerLoop = 0; tLayerLoop < tLayerArray.length; tLayerLoop++) {
	            var tLayerData = tLayerArray[tLayerLoop];
	            if (tLayerData.visible == true) //如果不显示，那么也没必要创建
	             {
	                var tMapLayer = new MapLayer();
	                tMapLayer.init(tLayerData, this);
	                if (!this.enableMergeLayer) {
	                    this._mapSprite.addChild(tMapLayer);
	                    this._renderLayerArray.push(tMapLayer);
	                }
	                else {
	                    tLayerTarLayerName = tMapLayer.getLayerProperties("layer");
	                    isFirst = isFirst || (!preLayer) || (tLayerTarLayerName != preLayerTarName);
	                    if (isFirst) {
	                        isFirst = false;
	                        tMapLayer.tarLayer = tMapLayer;
	                        preLayer = tMapLayer;
	                        this._mapSprite.addChild(tMapLayer);
	                        this._renderLayerArray.push(tMapLayer);
	                    }
	                    else {
	                        tMapLayer.tarLayer = preLayer;
	                    }
	                    preLayerTarName = tLayerTarLayerName;
	                }
	                this._layerArray.push(tMapLayer);
	            }
	        }
	        if (this.removeCoveredTile) {
	            this.adptTiledMapData();
	        }
	        if (this.cacheAllAfterInit) {
	            this.cacheAllGrid();
	        }
	        this.moveViewPort(this._rect.x, this._rect.y);
	        if (this._completeHandler != null) {
	            this._completeHandler.run();
	        }
	        //这里应该发送消息，通知上层，地图创建完成
	    }
	    addTileProperties(tileDataDic) {
	        var key;
	        for (key in tileDataDic) {
	            this._tileProperties2[key] = tileDataDic[key];
	        }
	    }
	    getTileUserData(id, sign, defaultV = null) {
	        if (!this._tileProperties2 || !this._tileProperties2[id] || !(sign in this._tileProperties2[id]))
	            return defaultV;
	        return this._tileProperties2[id][sign];
	    }
	    adptTiledMapData() {
	        var i, len;
	        len = this._layerArray.length;
	        var tLayer;
	        var noNeeds = {};
	        var tDatas;
	        for (i = len - 1; i >= 0; i--) {
	            tLayer = this._layerArray[i];
	            tDatas = tLayer._mapData;
	            if (!tDatas)
	                continue;
	            this.removeCoverd(tDatas, noNeeds);
	            this.collectCovers(tDatas, noNeeds, i);
	        }
	    }
	    removeCoverd(datas, noNeeds) {
	        var i, len;
	        len = datas.length;
	        for (i = 0; i < len; i++) {
	            if (noNeeds[i]) {
	                datas[i] = 0;
	            }
	        }
	    }
	    collectCovers(datas, noNeeds, layer) {
	        var i, len;
	        len = datas.length;
	        var tTileData;
	        var isCover;
	        for (i = 0; i < len; i++) {
	            tTileData = datas[i];
	            if (tTileData > 0) {
	                isCover = this.getTileUserData(tTileData - 1, "type", 0);
	                if (isCover > 0) {
	                    noNeeds[i] = tTileData;
	                }
	            }
	        }
	    }
	    /**
	     * 得到一块指定的地图纹理
	     * @param	index 纹理的索引值，默认从1开始
	     * @return
	     */
	    getTexture(index) {
	        if (index < this._tileTexSetArr.length) {
	            return this._tileTexSetArr[index];
	        }
	        return null;
	    }
	    /**
	     * 得到地图的自定义属性
	     * @param	name		属性名称
	     * @return
	     */
	    getMapProperties(name) {
	        if (this._properties) {
	            return this._properties[name];
	        }
	        return null;
	    }
	    /**
	     * 得到tile自定义属性
	     * @param	index		地图块索引
	     * @param	id			具体的TileSetID
	     * @param	name		属性名称
	     * @return
	     */
	    getTileProperties(index, id, name) {
	        if (this._tileProperties[index] && this._tileProperties[index][id]) {
	            return this._tileProperties[index][id][name];
	        }
	        return null;
	    }
	    /**
	     * 通过纹理索引，生成一个可控制物件
	     * @param	index 纹理的索引值，默认从1开始
	     * @return
	     */
	    getSprite(index, width, height) {
	        if (0 < this._tileTexSetArr.length) {
	            var tGridSprite = new GridSprite();
	            tGridSprite.initData(this, true);
	            tGridSprite.size(width, height);
	            var tTileTexSet = this._tileTexSetArr[index];
	            if (tTileTexSet != null && tTileTexSet.texture != null) {
	                if (tTileTexSet.isAnimation) {
	                    var tAnimationSprite = new TileAniSprite();
	                    this._index++;
	                    tAnimationSprite.setTileTextureSet(this._index.toString(), tTileTexSet);
	                    tGridSprite.addAniSprite(tAnimationSprite);
	                    tGridSprite.addChild(tAnimationSprite);
	                }
	                else {
	                    tGridSprite.graphics.drawImage(tTileTexSet.texture, 0, 0, width, height);
	                }
	                tGridSprite.drawImageNum++;
	            }
	            return tGridSprite;
	        }
	        return null;
	    }
	    /**
	     * 设置视口的缩放中心点（例如：scaleX= scaleY= 0.5,就是以视口中心缩放）
	     * @param	scaleX
	     * @param	scaleY
	     */
	    setViewPortPivotByScale(scaleX, scaleY) {
	        this._pivotScaleX = scaleX;
	        this._pivotScaleY = scaleY;
	    }
	    /**
	     * 设置地图缩放
	     * @param	scale
	     */
	    set scale(scale) {
	        if (scale <= 0)
	            return;
	        this._scale = scale;
	        this._viewPortWidth = this._rect.width / scale;
	        this._viewPortHeight = this._rect.height / scale;
	        this._mapSprite.scale(this._scale, this._scale);
	        this.updateViewPort();
	    }
	    /**
	     * 得到当前地图的缩放
	     */
	    get scale() {
	        return this._scale;
	    }
	    /**
	     * 移动视口
	     * @param	moveX 视口的坐标x
	     * @param	moveY 视口的坐标y
	     */
	    moveViewPort(moveX, moveY) {
	        this._x = -moveX;
	        this._y = -moveY;
	        this._rect.x = moveX;
	        this._rect.y = moveY;
	        this.updateViewPort();
	    }
	    /**
	     * 改变视口大小
	     * @param	moveX	视口的坐标x
	     * @param	moveY	视口的坐标y
	     * @param	width	视口的宽
	     * @param	height	视口的高
	     */
	    changeViewPort(moveX, moveY, width, height) {
	        if (moveX == this._rect.x && moveY == this._rect.y && width == this._rect.width && height == this._rect.height)
	            return;
	        this._x = -moveX;
	        this._y = -moveY;
	        this._rect.x = moveX;
	        this._rect.y = moveY;
	        this._rect.width = width;
	        this._rect.height = height;
	        this._viewPortWidth = width / this._scale;
	        this._viewPortHeight = height / this._scale;
	        this.updateViewPort();
	    }
	    /**
	     * 在锚点的基础上计算，通过宽和高，重新计算视口
	     * @param	width		新视口宽
	     * @param	height		新视口高
	     * @param	rect		返回的结果
	     * @return
	     */
	    changeViewPortBySize(width, height, rect = null) {
	        if (rect == null) {
	            rect = new Laya.Rectangle();
	        }
	        this._centerX = this._rect.x + this._rect.width * this._pivotScaleX;
	        this._centerY = this._rect.y + this._rect.height * this._pivotScaleY;
	        rect.x = this._centerX - width * this._pivotScaleX;
	        rect.y = this._centerY - height * this._pivotScaleY;
	        rect.width = width;
	        rect.height = height;
	        this.changeViewPort(rect.x, rect.y, rect.width, rect.height);
	        return rect;
	    }
	    /**
	     * 刷新视口
	     */
	    updateViewPort() {
	        //_rect.x和rect.y是内部坐标，会自动叠加缩放
	        this._centerX = this._rect.x + this._rect.width * this._pivotScaleX;
	        this._centerY = this._rect.y + this._rect.height * this._pivotScaleY;
	        var posChanged = false;
	        var preValue = this._viewPortX;
	        this._viewPortX = this._centerX - this._rect.width * this._pivotScaleX / this._scale;
	        if (preValue != this._viewPortX) {
	            posChanged = true;
	        }
	        else {
	            preValue = this._viewPortY;
	        }
	        this._viewPortY = this._centerY - this._rect.height * this._pivotScaleY / this._scale;
	        if (!posChanged && preValue != this._viewPortY) {
	            posChanged = true;
	        }
	        if (this._limitRange) {
	            var tRight = this._viewPortX + this._viewPortWidth;
	            if (tRight > this._width) {
	                this._viewPortX = this._width - this._viewPortWidth;
	            }
	            var tBottom = this._viewPortY + this._viewPortHeight;
	            if (tBottom > this._height) {
	                this._viewPortY = this._height - this._viewPortHeight;
	            }
	            if (this._viewPortX < 0) {
	                this._viewPortX = 0;
	            }
	            if (this._viewPortY < 0) {
	                this._viewPortY = 0;
	            }
	        }
	        var tPaddingRect = this._paddingRect;
	        this._mapRect.top = Math.floor((this._viewPortY - tPaddingRect.y) / this._gridHeight);
	        this._mapRect.bottom = Math.floor((this._viewPortY + this._viewPortHeight + tPaddingRect.height + tPaddingRect.y) / this._gridHeight);
	        this._mapRect.left = Math.floor((this._viewPortX - tPaddingRect.x) / this._gridWidth);
	        this._mapRect.right = Math.floor((this._viewPortX + this._viewPortWidth + tPaddingRect.width + tPaddingRect.x) / this._gridWidth);
	        if (this._mapRect.top != this._mapLastRect.top || this._mapRect.bottom != this._mapLastRect.bottom || this._mapRect.left != this._mapLastRect.left || this._mapRect.right != this._mapLastRect.right) {
	            this.clipViewPort();
	            this._mapLastRect.top = this._mapRect.top;
	            this._mapLastRect.bottom = this._mapRect.bottom;
	            this._mapLastRect.left = this._mapRect.left;
	            this._mapLastRect.right = this._mapRect.right;
	            posChanged = true;
	        }
	        if (!posChanged)
	            return;
	        var tMapLayer;
	        var len = this._renderLayerArray.length;
	        for (var i = 0; i < len; i++) {
	            tMapLayer = this._renderLayerArray[i];
	            if (tMapLayer._gridSpriteArray.length > 0)
	                tMapLayer.updateGridPos();
	        }
	    }
	    /**
	     * GRID裁剪
	     */
	    clipViewPort() {
	        var tSub = 0;
	        var tAdd = 0;
	        var i, j;
	        if (this._mapRect.left > this._mapLastRect.left) {
	            //裁剪
	            tSub = this._mapRect.left - this._mapLastRect.left;
	            if (tSub > 0) {
	                for (j = this._mapLastRect.left; j < this._mapLastRect.left + tSub; j++) {
	                    for (i = this._mapLastRect.top; i <= this._mapLastRect.bottom; i++) {
	                        this.hideGrid(j, i);
	                    }
	                }
	            }
	        }
	        else {
	            //增加
	            tAdd = Math.min(this._mapLastRect.left, this._mapRect.right + 1) - this._mapRect.left;
	            if (tAdd > 0) {
	                for (j = this._mapRect.left; j < this._mapRect.left + tAdd; j++) {
	                    for (i = this._mapRect.top; i <= this._mapRect.bottom; i++) {
	                        this.showGrid(j, i);
	                    }
	                }
	            }
	        }
	        if (this._mapRect.right > this._mapLastRect.right) {
	            //增加
	            tAdd = this._mapRect.right - this._mapLastRect.right;
	            if (tAdd > 0) {
	                for (j = Math.max(this._mapLastRect.right + 1, this._mapRect.left); j <= this._mapLastRect.right + tAdd; j++) {
	                    for (i = this._mapRect.top; i <= this._mapRect.bottom; i++) {
	                        this.showGrid(j, i);
	                    }
	                }
	            }
	        }
	        else {
	            //裁剪
	            tSub = this._mapLastRect.right - this._mapRect.right;
	            if (tSub > 0) {
	                for (j = this._mapRect.right + 1; j <= this._mapRect.right + tSub; j++) {
	                    for (i = this._mapLastRect.top; i <= this._mapLastRect.bottom; i++) {
	                        this.hideGrid(j, i);
	                    }
	                }
	            }
	        }
	        if (this._mapRect.top > this._mapLastRect.top) {
	            //裁剪
	            tSub = this._mapRect.top - this._mapLastRect.top;
	            if (tSub > 0) {
	                for (i = this._mapLastRect.top; i < this._mapLastRect.top + tSub; i++) {
	                    for (j = this._mapLastRect.left; j <= this._mapLastRect.right; j++) {
	                        this.hideGrid(j, i);
	                    }
	                }
	            }
	        }
	        else {
	            //增加
	            tAdd = Math.min(this._mapLastRect.top, this._mapRect.bottom + 1) - this._mapRect.top;
	            if (tAdd > 0) {
	                for (i = this._mapRect.top; i < this._mapRect.top + tAdd; i++) {
	                    for (j = this._mapRect.left; j <= this._mapRect.right; j++) {
	                        this.showGrid(j, i);
	                    }
	                }
	            }
	        }
	        if (this._mapRect.bottom > this._mapLastRect.bottom) {
	            //增加
	            tAdd = this._mapRect.bottom - this._mapLastRect.bottom;
	            if (tAdd > 0) {
	                for (i = Math.max(this._mapLastRect.bottom + 1, this._mapRect.top); i <= this._mapLastRect.bottom + tAdd; i++) {
	                    for (j = this._mapRect.left; j <= this._mapRect.right; j++) {
	                        this.showGrid(j, i);
	                    }
	                }
	            }
	        }
	        else {
	            //裁剪
	            tSub = this._mapLastRect.bottom - this._mapRect.bottom;
	            if (tSub > 0) {
	                for (i = this._mapRect.bottom + 1; i <= this._mapRect.bottom + tSub; i++) {
	                    for (j = this._mapLastRect.left; j <= this._mapLastRect.right; j++) {
	                        this.hideGrid(j, i);
	                    }
	                }
	            }
	        }
	    }
	    /**
	     * 显示指定的GRID
	     * @param	gridX
	     * @param	gridY
	     */
	    showGrid(gridX, gridY) {
	        if (gridX < 0 || gridX >= this._gridW || gridY < 0 || gridY >= this._gridH) {
	            return;
	        }
	        var i;
	        var tGridSprite;
	        var tTempArray = this._gridArray[gridY][gridX];
	        if (tTempArray == null) {
	            tTempArray = this.getGridArray(gridX, gridY);
	        }
	        else {
	            for (i = 0; i < tTempArray.length && i < this._layerArray.length; i++) {
	                var tLayerSprite = this._layerArray[i];
	                if (tLayerSprite && tTempArray[i]) {
	                    tGridSprite = tTempArray[i];
	                    if (tGridSprite.visible == false && tGridSprite.drawImageNum > 0) {
	                        tGridSprite.show();
	                    }
	                }
	            }
	        }
	    }
	    cacheAllGrid() {
	        var i, j;
	        var tempArr;
	        for (i = 0; i < this._gridW; i++) {
	            for (j = 0; j < this._gridH; j++) {
	                tempArr = this.getGridArray(i, j);
	                this.cacheGridsArray(tempArr);
	            }
	        }
	    }
	    cacheGridsArray(arr) {
	        var canvas;
	        if (!TiledMap._tempCanvas) {
	            TiledMap._tempCanvas = new Laya.HTMLCanvas();
	            var tx = TiledMap._tempCanvas.context;
	            if (!tx) {
	                tx = TiledMap._tempCanvas.getContext('2d'); //如果是webGL的话，这个会返回WebGLContext2D
	                //tx.__tx = 0;
	                //tx.__ty = 0;
	            }
	        }
	        canvas = TiledMap._tempCanvas;
	        canvas.context.asBitmap = false;
	        var i, len;
	        len = arr.length;
	        var tGrid;
	        for (i = 0; i < len; i++) {
	            tGrid = arr[i];
	            canvas.clear();
	            canvas.size(1, 1);
	            tGrid.render(canvas.context, 0, 0);
	            tGrid.hide();
	        }
	        canvas.clear();
	        canvas.size(1, 1);
	    }
	    getGridArray(gridX, gridY) {
	        var i, j;
	        var tGridSprite;
	        var tTempArray = this._gridArray[gridY][gridX];
	        if (tTempArray == null) {
	            tTempArray = this._gridArray[gridY][gridX] = [];
	            var tLeft = 0;
	            var tRight = 0;
	            var tTop = 0;
	            var tBottom = 0;
	            var tGridWidth = this._gridWidth;
	            var tGridHeight = this._gridHeight;
	            switch (this.orientation) {
	                case TiledMap.ORIENTATION_ISOMETRIC: //45度角
	                    tLeft = Math.floor(gridX * tGridWidth);
	                    tRight = Math.floor(gridX * tGridWidth + tGridWidth);
	                    tTop = Math.floor(gridY * tGridHeight);
	                    tBottom = Math.floor(gridY * tGridHeight + tGridHeight);
	                    var tLeft1, tRight1, tTop1, tBottom1;
	                    break;
	                case TiledMap.ORIENTATION_STAGGERED: //45度交错地图
	                    tLeft = Math.floor(gridX * tGridWidth / this._mapTileW);
	                    tRight = Math.floor((gridX * tGridWidth + tGridWidth) / this._mapTileW);
	                    tTop = Math.floor(gridY * tGridHeight / (this._mapTileH / 2));
	                    tBottom = Math.floor((gridY * tGridHeight + tGridHeight) / (this._mapTileH / 2));
	                    break;
	                case TiledMap.ORIENTATION_ORTHOGONAL: //直角
	                    tLeft = Math.floor(gridX * tGridWidth / this._mapTileW);
	                    tRight = Math.floor((gridX * tGridWidth + tGridWidth) / this._mapTileW);
	                    tTop = Math.floor(gridY * tGridHeight / this._mapTileH);
	                    tBottom = Math.floor((gridY * tGridHeight + tGridHeight) / this._mapTileH);
	                    break;
	                case TiledMap.ORIENTATION_HEXAGONAL: //六边形
	                    var tHeight = this._mapTileH * 2 / 3;
	                    tLeft = Math.floor(gridX * tGridWidth / this._mapTileW);
	                    tRight = Math.ceil((gridX * tGridWidth + tGridWidth) / this._mapTileW);
	                    tTop = Math.floor(gridY * tGridHeight / tHeight);
	                    tBottom = Math.ceil((gridY * tGridHeight + tGridHeight) / tHeight);
	                    break;
	            }
	            var tLayer = null;
	            var tTGridSprite;
	            var tDrawMapLayer;
	            for (var z = 0; z < this._layerArray.length; z++) {
	                tLayer = this._layerArray[z];
	                if (this.enableMergeLayer) {
	                    if (tLayer.tarLayer != tDrawMapLayer) {
	                        tTGridSprite = null;
	                        tDrawMapLayer = tLayer.tarLayer;
	                    }
	                    if (!tTGridSprite) {
	                        tTGridSprite = tDrawMapLayer.getDrawSprite(gridX, gridY);
	                        tTempArray.push(tTGridSprite);
	                        //tDrawMapLayer.addChild(tTGridSprite);
	                    }
	                    tGridSprite = tTGridSprite;
	                }
	                else {
	                    tGridSprite = tLayer.getDrawSprite(gridX, gridY);
	                    tTempArray.push(tGridSprite);
	                }
	                var tColorStr;
	                if (this._showGridKey) {
	                    tColorStr = "#";
	                    tColorStr += this._colorArray[Math.floor(Math.random() * this._colorArray.length)];
	                    tColorStr += this._colorArray[Math.floor(Math.random() * this._colorArray.length)];
	                    tColorStr += this._colorArray[Math.floor(Math.random() * this._colorArray.length)];
	                }
	                switch (this.orientation) {
	                    case TiledMap.ORIENTATION_ISOMETRIC: //45度角
	                        var tHalfTileHeight = this.tileHeight / 2;
	                        var tHalfTileWidth = this.tileWidth / 2;
	                        var tHalfMapWidth = this._width / 2;
	                        tTop1 = Math.floor(tTop / tHalfTileHeight);
	                        tBottom1 = Math.floor(tBottom / tHalfTileHeight);
	                        tLeft1 = this._mapW + Math.floor((tLeft - tHalfMapWidth) / tHalfTileWidth);
	                        tRight1 = this._mapW + Math.floor((tRight - tHalfMapWidth) / tHalfTileWidth);
	                        var tMapW = this._mapW * 2;
	                        var tMapH = this._mapH * 2;
	                        if (tTop1 < 0) {
	                            tTop1 = 0;
	                        }
	                        if (tTop1 >= tMapH) {
	                            tTop1 = tMapH - 1;
	                        }
	                        if (tBottom1 < 0) {
	                            tBottom = 0;
	                        }
	                        if (tBottom1 >= tMapH) {
	                            tBottom1 = tMapH - 1;
	                        }
	                        tGridSprite.zOrder = this._totalGridNum * z + gridY * this._gridW + gridX;
	                        for (i = tTop1; i < tBottom1; i++) {
	                            for (j = 0; j <= i; j++) {
	                                var tIndexX = i - j;
	                                var tIndexY = j;
	                                var tIndexValue = (tIndexX - tIndexY) + this._mapW;
	                                if (tIndexValue > tLeft1 && tIndexValue <= tRight1) {
	                                    if (tLayer.drawTileTexture(tGridSprite, tIndexX, tIndexY)) {
	                                        tGridSprite.drawImageNum++;
	                                    }
	                                }
	                            }
	                        }
	                        break;
	                    case TiledMap.ORIENTATION_STAGGERED: //45度交错地图
	                        tGridSprite.zOrder = z * this._totalGridNum + gridY * this._gridW + gridX;
	                        for (i = tTop; i < tBottom; i++) {
	                            for (j = tLeft; j < tRight; j++) {
	                                if (tLayer.drawTileTexture(tGridSprite, j, i)) {
	                                    tGridSprite.drawImageNum++;
	                                }
	                            }
	                        }
	                        break;
	                    case TiledMap.ORIENTATION_ORTHOGONAL: //直角
	                    case TiledMap.ORIENTATION_HEXAGONAL: //六边形
	                        switch (this._renderOrder) {
	                            case TiledMap.RENDERORDER_RIGHTDOWN:
	                                tGridSprite.zOrder = z * this._totalGridNum + gridY * this._gridW + gridX;
	                                for (i = tTop; i < tBottom; i++) {
	                                    for (j = tLeft; j < tRight; j++) {
	                                        if (tLayer.drawTileTexture(tGridSprite, j, i)) {
	                                            tGridSprite.drawImageNum++;
	                                        }
	                                    }
	                                }
	                                break;
	                            case TiledMap.RENDERORDER_RIGHTUP:
	                                tGridSprite.zOrder = z * this._totalGridNum + (this._gridH - 1 - gridY) * this._gridW + gridX;
	                                for (i = tBottom - 1; i >= tTop; i--) {
	                                    for (j = tLeft; j < tRight; j++) {
	                                        if (tLayer.drawTileTexture(tGridSprite, j, i)) {
	                                            tGridSprite.drawImageNum++;
	                                        }
	                                    }
	                                }
	                                break;
	                            case TiledMap.RENDERORDER_LEFTDOWN:
	                                tGridSprite.zOrder = z * this._totalGridNum + gridY * this._gridW + (this._gridW - 1 - gridX);
	                                for (i = tTop; i < tBottom; i++) {
	                                    for (j = tRight - 1; j >= tLeft; j--) {
	                                        if (tLayer.drawTileTexture(tGridSprite, j, i)) {
	                                            tGridSprite.drawImageNum++;
	                                        }
	                                    }
	                                }
	                                break;
	                            case TiledMap.RENDERORDER_LEFTUP:
	                                tGridSprite.zOrder = z * this._totalGridNum + (this._gridH - 1 - gridY) * this._gridW + (this._gridW - 1 - gridX);
	                                for (i = tBottom - 1; i >= tTop; i--) {
	                                    for (j = tRight - 1; j >= tLeft; j--) {
	                                        if (tLayer.drawTileTexture(tGridSprite, j, i)) {
	                                            tGridSprite.drawImageNum++;
	                                        }
	                                    }
	                                }
	                                break;
	                        }
	                        break;
	                }
	                //没动画了GRID，保存为图片
	                if (!tGridSprite.isHaveAnimation) {
	                    tGridSprite.autoSize = true;
	                    if (this.autoCache)
	                        tGridSprite.cacheAs = this.autoCacheType;
	                    tGridSprite.autoSize = false;
	                }
	                if (!this.enableMergeLayer) {
	                    if (tGridSprite.drawImageNum > 0) {
	                        tLayer.addChild(tGridSprite);
	                    }
	                    if (this._showGridKey) {
	                        tGridSprite.graphics.drawRect(0, 0, tGridWidth, tGridHeight, null, tColorStr);
	                    }
	                }
	                else {
	                    if (tTGridSprite && tTGridSprite.drawImageNum > 0 && tDrawMapLayer) {
	                        tDrawMapLayer.addChild(tTGridSprite);
	                    }
	                }
	            }
	            if (this.enableMergeLayer && this.showGridTextureCount) {
	                if (tTGridSprite) {
	                    tTGridSprite.graphics.fillText(tTGridSprite.drawImageNum + "", 20, 20, null, "#ff0000", "left");
	                }
	            }
	        }
	        return tTempArray;
	    }
	    /**
	     * 隐藏指定的GRID
	     * @param	gridX
	     * @param	gridY
	     */
	    hideGrid(gridX, gridY) {
	        if (gridX < 0 || gridX >= this._gridW || gridY < 0 || gridY >= this._gridH) {
	            return;
	        }
	        var tTempArray = this._gridArray[gridY][gridX];
	        if (tTempArray) {
	            var tGridSprite;
	            for (var i = 0; i < tTempArray.length; i++) {
	                tGridSprite = tTempArray[i];
	                if (tGridSprite.drawImageNum > 0) {
	                    if (tGridSprite != null) {
	                        tGridSprite.hide();
	                    }
	                }
	            }
	        }
	    }
	    /**
	     * 得到对象层上的某一个物品
	     * @param	layerName   层的名称
	     * @param	objectName	所找物品的名称
	     * @return
	     */
	    getLayerObject(layerName, objectName) {
	        var tLayer = null;
	        for (var i = 0; i < this._layerArray.length; i++) {
	            tLayer = this._layerArray[i];
	            if (tLayer.layerName == layerName) {
	                break;
	            }
	        }
	        if (tLayer) {
	            return tLayer.getObjectByName(objectName);
	        }
	        return null;
	    }
	    /**
	     * 销毁地图
	     */
	    destroy() {
	        this._orientation = TiledMap.ORIENTATION_ORTHOGONAL;
	        //json数据
	        this._jsonData = null;
	        var i = 0;
	        this._gridArray = []; //??这里因为跟LAYER中的数据重复，所以不做处理
	        //清除子纹理
	        var tTileTexSet;
	        for (i = 0; i < this._tileTexSetArr.length; i++) {
	            tTileTexSet = this._tileTexSetArr[i];
	            if (tTileTexSet) {
	                tTileTexSet.clearAll();
	            }
	        }
	        this._tileTexSetArr = [];
	        //清除主纹理
	        var tTexture;
	        for (i = 0; i < this._texArray.length; i++) {
	            tTexture = this._texArray[i];
	            tTexture.destroy();
	        }
	        this._texArray = [];
	        //地图信息中的一些基本数据
	        this._width = 0;
	        this._height = 0;
	        this._mapW = 0;
	        this._mapH = 0;
	        this._mapTileW = 0;
	        this._mapTileH = 0;
	        this._rect.setTo(0, 0, 0, 0);
	        var tLayer;
	        for (i = 0; i < this._layerArray.length; i++) {
	            tLayer = this._layerArray[i];
	            tLayer.clearAll();
	        }
	        this._layerArray = [];
	        this._renderLayerArray = [];
	        if (this._mapSprite) {
	            this._mapSprite.destroy();
	            this._mapSprite = null;
	        }
	        this._jsonLoader = null; //??
	        this._loader = null; //??
	        //
	        var tDic = this._animationDic;
	        for (var p in tDic) {
	            delete tDic[p];
	        }
	        this._properties = null;
	        tDic = this._tileProperties;
	        for (p in tDic) {
	            delete tDic[p];
	        }
	        this._currTileSet = null;
	        this._completeHandler = null;
	        this._mapRect.clearAll();
	        this._mapLastRect.clearAll();
	        this._tileSetArray = [];
	        this._gridWidth = 450;
	        this._gridHeight = 450;
	        this._gridW = 0;
	        this._gridH = 0;
	        this._x = 0;
	        this._y = 0;
	        this._index = 0;
	        this._enableLinear = true;
	        //资源的相对路径
	        this._resPath = null;
	        this._pathArray = null;
	    }
	    /****************************地图的基本数据***************************/ /**
	     * 格子的宽度
	     */
	    get tileWidth() {
	        return this._mapTileW;
	    }
	    /**
	     * 格子的高度
	     */
	    get tileHeight() {
	        return this._mapTileH;
	    }
	    /**
	     * 地图的宽度
	     */
	    get width() {
	        return this._width;
	    }
	    /**
	     * 地图的高度
	     */
	    get height() {
	        return this._height;
	    }
	    /**
	     * 地图横向的格子数
	     */
	    get numColumnsTile() {
	        return this._mapW;
	    }
	    /**
	     * 地图竖向的格子数
	     */
	    get numRowsTile() {
	        return this._mapH;
	    }
	    /**
	     * @private
	     * 视口x坐标
	     */
	    get viewPortX() {
	        return -this._viewPortX;
	    }
	    /**
	     * @private
	     * 视口的y坐标
	     */
	    get viewPortY() {
	        return -this._viewPortY;
	    }
	    /**
	     * @private
	     * 视口的宽度
	     */
	    get viewPortWidth() {
	        return this._viewPortWidth;
	    }
	    /**
	     * @private
	     * 视口的高度
	     */
	    get viewPortHeight() {
	        return this._viewPortHeight;
	    }
	    /**
	     * 地图的x坐标
	     */
	    get x() {
	        return this._x;
	    }
	    /**
	     * 地图的y坐标
	     */
	    get y() {
	        return this._y;
	    }
	    /**
	     * 块的宽度
	     */
	    get gridWidth() {
	        return this._gridWidth;
	    }
	    /**
	     * 块的高度
	     */
	    get gridHeight() {
	        return this._gridHeight;
	    }
	    /**
	     * 地图的横向块数
	     */
	    get numColumnsGrid() {
	        return this._gridW;
	    }
	    /**
	     * 地图的坚向块数
	     */
	    get numRowsGrid() {
	        return this._gridH;
	    }
	    /**
	     * 当前地图类型
	     */
	    get orientation() {
	        return this._orientation;
	    }
	    /**
	     * tile渲染顺序
	     */
	    get renderOrder() {
	        return this._renderOrder;
	    }
	    /*****************************************对外接口**********************************************/
	    /**
	     * 整个地图的显示容器
	     * @return 地图的显示容器
	     */
	    mapSprite() {
	        return this._mapSprite;
	    }
	    /**
	     * 得到指定的MapLayer
	     * @param layerName 要找的层名称
	     * @return
	     */
	    getLayerByName(layerName) {
	        var tMapLayer;
	        for (var i = 0; i < this._layerArray.length; i++) {
	            tMapLayer = this._layerArray[i];
	            if (layerName == tMapLayer.layerName) {
	                return tMapLayer;
	            }
	        }
	        return null;
	    }
	    /**
	     * 通过索引得MapLayer
	     * @param	index 要找的层索引
	     * @return
	     */
	    getLayerByIndex(index) {
	        if (index < this._layerArray.length) {
	            return this._layerArray[index];
	        }
	        return null;
	    }
	}
	//地图支持的类型(目前支持四边形地图，菱形地图，六边形地图)
	/**四边形地图*/
	TiledMap.ORIENTATION_ORTHOGONAL = "orthogonal";
	/**菱形地图*/
	TiledMap.ORIENTATION_ISOMETRIC = "isometric";
	/**45度交错地图*/
	TiledMap.ORIENTATION_STAGGERED = "staggered";
	/**六边形地图*/
	TiledMap.ORIENTATION_HEXAGONAL = "hexagonal";
	//地图格子（tile）的渲染顺序
	/**地图格子从左上角开始渲染*/
	TiledMap.RENDERORDER_RIGHTDOWN = "right-down";
	/**地图格子从左下角开始渲染*/
	TiledMap.RENDERORDER_RIGHTUP = "right-up";
	/**地图格子从右上角开始渲染*/
	TiledMap.RENDERORDER_LEFTDOWN = "left-down";
	/**地图格子右下角开始渲染*/
	TiledMap.RENDERORDER_LEFTUP = "left-up";
	class GRect {
	    clearAll() {
	        this.left = this.top = this.right = this.bottom = 0;
	    }
	}
	class TileMapAniData {
	    constructor() {
	        this.mAniIdArray = [];
	        this.mDurationTimeArray = [];
	        this.mTileTexSetArr = [];
	    }
	}
	class TileSet {
	    constructor() {
	        this.firstgid = 0;
	        this.image = "";
	        this.imageheight = 0;
	        this.imagewidth = 0;
	        this.margin = 0;
	        this.name = 0;
	        this.spacing = 0;
	        this.tileheight = 0;
	        this.tilewidth = 0;
	        this.titleoffsetX = 0;
	        this.titleoffsetY = 0;
	    }
	    init(data) {
	        this.firstgid = data.firstgid;
	        this.image = data.image;
	        this.imageheight = data.imageheight;
	        this.imagewidth = data.imagewidth;
	        this.margin = data.margin;
	        this.name = data.name;
	        this.properties = data.properties;
	        this.spacing = data.spacing;
	        this.tileheight = data.tileheight;
	        this.tilewidth = data.tilewidth;
	        //自定义属性
	        this.tileproperties = data.tileproperties;
	        var tTileoffset = data.tileoffset;
	        if (tTileoffset) {
	            this.titleoffsetX = tTileoffset.x;
	            this.titleoffsetY = tTileoffset.y;
	        }
	    }
	}
	IMap.TiledMap = TiledMap;

	exports.GridSprite = GridSprite;
	exports.IMap = IMap;
	exports.MapLayer = MapLayer;
	exports.TileAniSprite = TileAniSprite;
	exports.TileTexSet = TileTexSet;
	exports.TiledMap = TiledMap;

}(window.Laya = window.Laya|| {}, Laya));
