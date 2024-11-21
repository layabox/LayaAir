import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { Sprite } from "laya/display/Sprite";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Scene } from "laya/display/Scene";
import { Vector2 } from "laya/maths/Vector2";
import { Texture2D } from "laya/resource/Texture2D";
import { TileSet } from "laya/display/Scene2DSpecial/TileMap/TileSet";
import { TileShape } from "laya/display/Scene2DSpecial/TileMap/TileMapEnum";
import { TileAnimationMode } from "laya/display/Scene2DSpecial/TileMap/TileAlternativesData";
import { TileMapLayer } from "laya/display/Scene2DSpecial/TileMap/TileMapLayer";
import { TileSetCellData } from "laya/display/Scene2DSpecial/TileMap/TileSetCellData";
import { TileSetCellGroup } from "laya/display/Scene2DSpecial/TileMap/TileSetCellGroup";
import { Color } from "laya/maths/Color";

export class TileMapLayerDemo {
    Main: any;
    constructor(mainClass: typeof Main) {
        this.Main = mainClass;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.bgColor = "#232628";
            Stat.show();
            this.PreloadingRes(); //创建场景
        });
    }

    //批量预加载方式
    PreloadingRes() {
        //预加载所有资源
        var resource: any[] = [
            "res/tilemapResource/TilesetVillageAbandoned.png",
            "res/tilemapResource/TilesetTowers.png",
        ];
        Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
    }

    private onPreLoadFinish(): void {
        // 方法1：使用loadImage
        var scene = new Scene();
        this.Main.box2D.addChild(scene);
        var bg: Sprite = new Sprite();
        scene.addChild(bg);
        this.createTileMapLayer(bg);
    }

    private collectCellData: Map<string, TileSetCellData> = new Map();

    private createTileMapLayer(bg: Sprite) {
        let layer = bg.addComponent(TileMapLayer);
        let tileset = this.createTileSet();
        layer.tileSet = tileset;

        {//测试渲染批次和changeCellData

            for (var x = 0; x <= 5; x++) {
                for (var y = 0; y <= 5; y++) {
                    layer.setCellData(x, y, this.collectCellData.get("paota2"), false);
                }
            }

            for (var x = 5; x <= 10; x++) {
                for (var y = 0; y <= 5; y++) {
                    layer.setCellData(x, y, this.collectCellData.get("paota3"), false);
                }
            }
        }

        {//测试 不同CellData
            layer.setCellData(5, 5, this.collectCellData.get("paota1"), false);
            layer.setCellData(5, 6, this.collectCellData.get("paota1_1"), false);
        }

        {//测试动画
            layer.setCellData(7, 5, this.collectCellData.get("Ani_chengbao"), false);
            layer.setCellData(7, 6, this.collectCellData.get("Ani_shuijin"), false);
        }

        {//测试第二个setGroup
            layer.setCellData(10, 5, this.collectCellData.get("pofangzi"), false);
            layer.setCellData(10, 8, this.collectCellData.get("pofangzi2"), false);
            layer.setCellData(10, 10, this.collectCellData.get("shu1"), false);
            layer.setCellData(10, 12, this.collectCellData.get("liangtin"), false);
        }

    }

    private createTileSet() {
        let tileSet = new TileSet();
        tileSet.tileShape = TileShape.TILE_SHAPE_SQUARE;
        tileSet.tileSize = new Vector2(64, 64);

        let textuer1 = Loader.getTexture2D("res/tilemapResource/TilesetTowers.png");
        let texture2 = Loader.getTexture2D("res/tilemapResource/TilesetVillageAbandoned.png");

        let group0 = this.createTileSetGroup("resource1", 0, textuer1, new Vector2(32, 32));
        let group1 = this.createTileSetGroup("resource2", 1, texture2, new Vector2(16, 16));

        tileSet.addTileSetCellGroup(group0);
        tileSet.addTileSetCellGroup(group1);


        this.collectCellDataToMap(group0, new Vector2(0, 0), new Vector2(1, 1), 0, "paota1");
        let cellData = this.collectCellDataToMap(group0, new Vector2(0, 0), new Vector2(1, 1), 1, "paota1_1");
        cellData.texture_origin = new Vector2(10, 0);
        cellData.colorModulate = new Color(1.0, 0.0, 0.0, 1.0);
        this.collectCellDataToMap(group0, new Vector2(0, 1), new Vector2(1, 1), 0, "paota2ori");
        cellData = this.collectCellDataToMap(group0, new Vector2(0, 1), new Vector2(1, 1), 1, "paota2");
        this.collectCellDataToMap(group0, new Vector2(0, 2), new Vector2(1, 1), 0, "paota3");

        {
            let cellData = this.collectCellDataToMap(group0, new Vector2(6, 2), new Vector2(1, 1), 1, "Ani_chengbao");
            let alternative = cellData.cellowner;
            alternative.animationMode = TileAnimationMode.DEFAULT;
            alternative.animation_columns = 0;
            alternative.animation_separation = new Vector2(0, 0);
            alternative.animation_speed = 1;
            alternative.animationFrams = [1, 1, 1];
        }

        {
            let cellData = this.collectCellDataToMap(group0, new Vector2(9, 2), new Vector2(1, 1), 1, "Ani_shuijin");
            let alternative = cellData.cellowner;
            alternative.animationMode = TileAnimationMode.DEFAULT;
            alternative.animation_columns = 0;
            alternative.animation_separation = new Vector2(0, 0);
            alternative.animation_speed = 1;
            alternative.animationFrams = [1, 1, 1];
        }

        {
            let cellData = this.collectCellDataToMap(group1, new Vector2(0, 0), new Vector2(4, 3), 0, "pofangzi");
            cellData = this.collectCellDataToMap(group1, new Vector2(0, 0), new Vector2(4, 3), 1, "pofangzi2");
            cellData.colorModulate = new Color(1, 0, 0, 1);
        }
        {
            let cellData = this.collectCellDataToMap(group1, new Vector2(0, 6), new Vector2(4, 3), 0, "shu1");
            cellData.cellowner.animation_columns = 1;
            cellData.cellowner.animationFrams = [1, 1];
        }

        {
            let cellData = this.collectCellDataToMap(group1, new Vector2(17, 0), new Vector2(3, 3), 0, "liangtin");
        }




        return tileSet;
    }

    private createTileSetGroup(name: string, id: number, texture: Texture2D, textureRegion: Vector2) {
        let setgroup = new TileSetCellGroup();
        setgroup.id = id;
        setgroup.name = name;
        setgroup.atlas = texture;
        setgroup.textureRegionSize = textureRegion;
        return setgroup;
    }

    private collectCellDataToMap(tileSetGroup: TileSetCellGroup, groupLocalPos: Vector2, cellSize: Vector2, cellDataIndex: number, cellDataKey: string) {
        let alternative = tileSetGroup.addAlternaltive(groupLocalPos.x, groupLocalPos.y, cellSize);
        let cellData = alternative.addCellData(cellDataIndex);
        this.collectCellData.set(cellDataKey, cellData);
        return cellData;
    }
}