(function (exports, Laya) {
    'use strict';

    class GridSprite extends Laya.Sprite {
        constructor() {
            super(...arguments);
            this.relativeX = 0;
            this.relativeY = 0;
            this.isAloneObject = false;
            this.isHaveAnimation = false;
            this.drawImageNum = 0;
            this._map = null;
        }
        initData(map, objectKey = false) {
            this._map = map;
            this.isAloneObject = objectKey;
        }
        addAniSprite(sprite) {
            if (this.aniSpriteArray == null) {
                this.aniSpriteArray = [];
            }
            this.aniSpriteArray.push(sprite);
        }
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

    class TileAniSprite extends Laya.Sprite {
        constructor() {
            super(...arguments);
            this._tileTextureSet = null;
            this._aniName = null;
        }
        setTileTextureSet(aniName, tileTextureSet) {
            this._aniName = aniName;
            this._tileTextureSet = tileTextureSet;
            tileTextureSet.addAniSprite(this._aniName, this);
        }
        show() {
            this._tileTextureSet.addAniSprite(this._aniName, this);
        }
        hide() {
            this._tileTextureSet.removeAniSprite(this._aniName);
        }
        clearAll() {
            this._tileTextureSet.removeAniSprite(this._aniName);
            this.destroy();
            this._tileTextureSet = null;
            this._aniName = null;
        }
    }

    class MapLayer extends Laya.Sprite {
        constructor() {
            super(...arguments);
            this._mapData = null;
            this._tileWidthHalf = 0;
            this._tileHeightHalf = 0;
            this._mapWidthHalf = 0;
            this._mapHeightHalf = 0;
            this._gridSpriteArray = [];
            this._objDic = null;
            this._dataDic = null;
            this._tempMapPos = new Laya.Point();
            this.layerName = null;
        }
        init(layerData, map) {
            this._map = map;
            this._mapData = layerData.data;
            var tHeight = layerData.height;
            var tWidth = layerData.width;
            var tTileW = map.tileWidth;
            var tTileH = map.tileHeight;
            this.layerName = layerData.name;
            this._properties = layerData.properties;
            this.alpha = layerData.opacity;
            this._tileWidthHalf = tTileW / 2;
            this._tileHeightHalf = tTileH / 2;
            this._mapWidthHalf = this._map.width / 2 - this._tileWidthHalf;
            this._mapHeightHalf = this._map.height / 2;
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
                                    case IMap.TiledMap.ORIENTATION_STAGGERED:
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
                                    case IMap.TiledMap.ORIENTATION_HEXAGONAL:
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
        getObjectByName(objName) {
            if (this._objDic) {
                return this._objDic[objName];
            }
            return null;
        }
        getObjectDataByName(objName) {
            if (this._dataDic) {
                return this._dataDic[objName];
            }
            return null;
        }
        getLayerProperties(name) {
            if (this._properties) {
                return this._properties[name];
            }
            return null;
        }
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
                screenPos.x = (screenPos.x + this._map.viewPortX) * this._map.scale;
                screenPos.y = (screenPos.y + this._map.viewPortY) * this._map.scale;
            }
        }
        getTileDataByScreenPos(screenX, screenY) {
            var tData = 0;
            if (this.getTilePositionByScreenPos(screenX, screenY, this._tempMapPos)) {
                tData = this.getTileData(Math.floor(this._tempMapPos.x), Math.floor(this._tempMapPos.y));
            }
            return tData;
        }
        getTilePositionByScreenPos(screenX, screenY, result = null) {
            screenX = screenX / this._map.scale - this._map.viewPortX;
            screenY = screenY / this._map.scale - this._map.viewPortY;
            var tTileW = this._map.tileWidth;
            var tTileH = this._map.tileHeight;
            var tV = 0;
            var tU = 0;
            switch (this._map.orientation) {
                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                    var tDirX = screenX - this._map.width / 2;
                    var tDirY = screenY;
                    tV = -(tDirX / tTileW - tDirY / tTileH);
                    tU = tDirX / tTileW + tDirY / tTileH;
                    if (result) {
                        result.x = tU;
                        result.y = tV;
                    }
                    return true;
                case IMap.TiledMap.ORIENTATION_STAGGERED:
                    if (result) {
                        var cx, cy, rx, ry;
                        cx = Math.floor(screenX / tTileW) * tTileW + tTileW / 2;
                        cy = Math.floor(screenY / tTileH) * tTileH + tTileH / 2;
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
                case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                    tU = screenX / tTileW;
                    tV = screenY / tTileH;
                    if (result) {
                        result.x = tU;
                        result.y = tV;
                    }
                    return true;
                case IMap.TiledMap.ORIENTATION_HEXAGONAL:
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
        getDrawSprite(gridX, gridY) {
            var tSprite = new GridSprite();
            tSprite.relativeX = gridX * this._map.gridWidth;
            tSprite.relativeY = gridY * this._map.gridHeight;
            tSprite.initData(this._map);
            this._gridSpriteArray.push(tSprite);
            return tSprite;
        }
        updateGridPos() {
            var tSprite;
            for (var i = 0; i < this._gridSpriteArray.length; i++) {
                tSprite = this._gridSpriteArray[i];
                if ((tSprite.visible || tSprite.isAloneObject) && tSprite.drawImageNum > 0) {
                    tSprite.updatePos();
                }
            }
        }
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
                                case IMap.TiledMap.ORIENTATION_STAGGERED:
                                    tX = tileX * this._map.tileWidth % this._map.gridWidth + (tileY & 1) * this._tileWidthHalf;
                                    tY = tileY * this._tileHeightHalf % this._map.gridHeight;
                                    break;
                                case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                                    tX = tileX * this._map.tileWidth % this._map.gridWidth;
                                    tY = tileY * this._map.tileHeight % this._map.gridHeight;
                                    break;
                                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                                    tX = (this._mapWidthHalf + (tileX - tileY) * this._tileWidthHalf) % this._map.gridWidth;
                                    tY = ((tileX + tileY) * this._tileHeightHalf) % this._map.gridHeight;
                                    break;
                                case IMap.TiledMap.ORIENTATION_HEXAGONAL:
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
                                gridSprite.graphics.drawImage(tTileTexSet.texture, tX + tTileTexSet.offX, tY + tTileTexSet.offY);
                            }
                            return true;
                        }
                    }
                }
            }
            return false;
        }
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

    class TileTexSet {
        constructor() {
            this.gid = -1;
            this.offX = 0;
            this.offY = 0;
            this.textureArray = null;
            this.durationTimeArray = null;
            this.animationTotalTime = 0;
            this.isAnimation = false;
            this._spriteNum = 0;
            this._aniDic = null;
            this._frameIndex = 0;
            this._time = 0;
            this._interval = 0;
            this._preFrameTime = 0;
        }
        addAniSprite(aniName, sprite) {
            if (this.animationTotalTime == 0) {
                return;
            }
            if (this._aniDic == null) {
                this._aniDic = {};
            }
            if (this._spriteNum == 0) {
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
            sprite.graphics.drawImage(tileTextSet.texture, tileTextSet.offX, tileTextSet.offY);
        }
        removeAniSprite(_name) {
            if (this._aniDic && this._aniDic[_name]) {
                delete this._aniDic[_name];
                this._spriteNum--;
                if (this._spriteNum == 0) {
                    Laya.ILaya.timer.clear(this, this.animate);
                }
            }
        }
        showDebugInfo() {
            var tInfo = null;
            if (this._spriteNum > 0) {
                tInfo = "TileTextureSet::gid:" + this.gid.toString() + " 动画数:" + this._spriteNum.toString();
            }
            return tInfo;
        }
        clearAll() {
            this.gid = -1;
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

    class TiledMap {
        constructor() {
            this._tileTexSetArr = [];
            this._texArray = [];
            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;
            this._mapW = 0;
            this._mapH = 0;
            this._mapTileW = 0;
            this._mapTileH = 0;
            this._rect = new Laya.Rectangle();
            this._paddingRect = new Laya.Rectangle();
            this._mapSprite = null;
            this._layerArray = [];
            this._renderLayerArray = [];
            this._gridArray = [];
            this._showGridKey = false;
            this._totalGridNum = 0;
            this._gridW = 0;
            this._gridH = 0;
            this._gridWidth = 450;
            this._gridHeight = 450;
            this._jsonLoader = null;
            this._loader = null;
            this._tileSetArray = [];
            this._currTileSet = null;
            this._completeHandler = null;
            this._mapRect = new GRect();
            this._mapLastRect = new GRect();
            this._index = 0;
            this._animationDic = {};
            this._tileProperties = {};
            this._tileProperties2 = {};
            this._orientation = "orthogonal";
            this._renderOrder = "right-down";
            this._colorArray = ["FF", "00", "33", "66"];
            this._scale = 1;
            this._pivotScaleX = 0.5;
            this._pivotScaleY = 0.5;
            this._centerX = 0;
            this._centerY = 0;
            this._viewPortX = 0;
            this._viewPortY = 0;
            this._viewPortWidth = 0;
            this._viewPortHeight = 0;
            this._enableLinear = true;
            this._limitRange = false;
            this.autoCache = true;
            this.autoCacheType = "normal";
            this.enableMergeLayer = false;
            this.removeCoveredTile = false;
            this.showGridTextureCount = false;
            this.antiCrack = true;
            this.cacheAllAfterInit = false;
            this._texutreStartDic = {};
        }
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
        onTextureComplete(e) {
            var json = this._jsonData;
            var tTexture = e;
            if (!this._enableLinear) {
                tTexture.bitmap.minFifter = 0x2600;
                tTexture.bitmap.magFifter = 0x2600;
            }
            this._texArray.push(tTexture);
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
            for (var tLayerLoop = 0; tLayerLoop < tLayerArray.length; tLayerLoop++) {
                var tLayerData = tLayerArray[tLayerLoop];
                if (tLayerData.visible == true) {
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
        getTexture(index) {
            if (index < this._tileTexSetArr.length) {
                return this._tileTexSetArr[index];
            }
            return null;
        }
        getMapProperties(name) {
            if (this._properties) {
                return this._properties[name];
            }
            return null;
        }
        getTileProperties(index, id, name) {
            if (this._tileProperties[index] && this._tileProperties[index][id]) {
                return this._tileProperties[index][id][name];
            }
            return null;
        }
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
        setViewPortPivotByScale(scaleX, scaleY) {
            this._pivotScaleX = scaleX;
            this._pivotScaleY = scaleY;
        }
        set scale(scale) {
            if (scale <= 0)
                return;
            this._scale = scale;
            this._viewPortWidth = this._rect.width / scale;
            this._viewPortHeight = this._rect.height / scale;
            this._mapSprite.scale(this._scale, this._scale);
            this.updateViewPort();
        }
        get scale() {
            return this._scale;
        }
        moveViewPort(moveX, moveY) {
            this._x = -moveX;
            this._y = -moveY;
            this._rect.x = moveX;
            this._rect.y = moveY;
            this.updateViewPort();
        }
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
        updateViewPort() {
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
        clipViewPort() {
            var tSub = 0;
            var tAdd = 0;
            var i, j;
            if (this._mapRect.left > this._mapLastRect.left) {
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
                    tx = TiledMap._tempCanvas.getContext('2d');
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
                    case TiledMap.ORIENTATION_ISOMETRIC:
                        tLeft = Math.floor(gridX * tGridWidth);
                        tRight = Math.floor(gridX * tGridWidth + tGridWidth);
                        tTop = Math.floor(gridY * tGridHeight);
                        tBottom = Math.floor(gridY * tGridHeight + tGridHeight);
                        var tLeft1, tRight1, tTop1, tBottom1;
                        break;
                    case TiledMap.ORIENTATION_STAGGERED:
                        tLeft = Math.floor(gridX * tGridWidth / this._mapTileW);
                        tRight = Math.floor((gridX * tGridWidth + tGridWidth) / this._mapTileW);
                        tTop = Math.floor(gridY * tGridHeight / (this._mapTileH / 2));
                        tBottom = Math.floor((gridY * tGridHeight + tGridHeight) / (this._mapTileH / 2));
                        break;
                    case TiledMap.ORIENTATION_ORTHOGONAL:
                        tLeft = Math.floor(gridX * tGridWidth / this._mapTileW);
                        tRight = Math.floor((gridX * tGridWidth + tGridWidth) / this._mapTileW);
                        tTop = Math.floor(gridY * tGridHeight / this._mapTileH);
                        tBottom = Math.floor((gridY * tGridHeight + tGridHeight) / this._mapTileH);
                        break;
                    case TiledMap.ORIENTATION_HEXAGONAL:
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
                        case TiledMap.ORIENTATION_ISOMETRIC:
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
                        case TiledMap.ORIENTATION_STAGGERED:
                            tGridSprite.zOrder = z * this._totalGridNum + gridY * this._gridW + gridX;
                            for (i = tTop; i < tBottom; i++) {
                                for (j = tLeft; j < tRight; j++) {
                                    if (tLayer.drawTileTexture(tGridSprite, j, i)) {
                                        tGridSprite.drawImageNum++;
                                    }
                                }
                            }
                            break;
                        case TiledMap.ORIENTATION_ORTHOGONAL:
                        case TiledMap.ORIENTATION_HEXAGONAL:
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
        destroy() {
            this._orientation = TiledMap.ORIENTATION_ORTHOGONAL;
            this._jsonData = null;
            var i = 0;
            this._gridArray = [];
            var tTileTexSet;
            for (i = 0; i < this._tileTexSetArr.length; i++) {
                tTileTexSet = this._tileTexSetArr[i];
                if (tTileTexSet) {
                    tTileTexSet.clearAll();
                }
            }
            this._tileTexSetArr = [];
            var tTexture;
            for (i = 0; i < this._texArray.length; i++) {
                tTexture = this._texArray[i];
                tTexture.destroy();
            }
            this._texArray = [];
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
            this._jsonLoader = null;
            this._loader = null;
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
            this._resPath = null;
            this._pathArray = null;
        }
        get tileWidth() {
            return this._mapTileW;
        }
        get tileHeight() {
            return this._mapTileH;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get numColumnsTile() {
            return this._mapW;
        }
        get numRowsTile() {
            return this._mapH;
        }
        get viewPortX() {
            return -this._viewPortX;
        }
        get viewPortY() {
            return -this._viewPortY;
        }
        get viewPortWidth() {
            return this._viewPortWidth;
        }
        get viewPortHeight() {
            return this._viewPortHeight;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get gridWidth() {
            return this._gridWidth;
        }
        get gridHeight() {
            return this._gridHeight;
        }
        get numColumnsGrid() {
            return this._gridW;
        }
        get numRowsGrid() {
            return this._gridH;
        }
        get orientation() {
            return this._orientation;
        }
        get renderOrder() {
            return this._renderOrder;
        }
        mapSprite() {
            return this._mapSprite;
        }
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
        getLayerByIndex(index) {
            if (index < this._layerArray.length) {
                return this._layerArray[index];
            }
            return null;
        }
    }
    TiledMap.ORIENTATION_ORTHOGONAL = "orthogonal";
    TiledMap.ORIENTATION_ISOMETRIC = "isometric";
    TiledMap.ORIENTATION_STAGGERED = "staggered";
    TiledMap.ORIENTATION_HEXAGONAL = "hexagonal";
    TiledMap.RENDERORDER_RIGHTDOWN = "right-down";
    TiledMap.RENDERORDER_RIGHTUP = "right-up";
    TiledMap.RENDERORDER_LEFTDOWN = "left-down";
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

}(window.Laya = window.Laya || {}, Laya));
