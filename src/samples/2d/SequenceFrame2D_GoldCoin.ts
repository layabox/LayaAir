import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { SequenceFrame2DRender } from "laya/display/Scene2DSpecial/SequenceFrame2D/SequenceFrame2DRender";
import { Color } from "laya/maths/Color";
import { Vector2 } from "laya/maths/Vector2";
import { Loader } from "laya/net/Loader";
import { Texture } from "laya/resource/Texture";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";

export class SequenceFrame2D_GoldCoin {
    private static readonly TextureUrl = "res/sequenceFrame/gold_coin_sequence.jpg";
    private static readonly Tiles = new Vector2(8, 4);
    private static readonly LifeTime = 4;
    private static readonly UnitPixels = 50;
    private static readonly StartFrame = 0;
    private static readonly Cycles = 4;
    private static readonly Count = 10000;
    private static readonly SpawnBucketCount = 240;
    private static readonly ReplayInterval = SequenceFrame2D_GoldCoin.LifeTime * 1000 / SequenceFrame2D_GoldCoin.SpawnBucketCount;

    private _main: typeof Main;
    private _box: Sprite;
    private _texture: Texture;
    private _coins: Sprite[] = [];
    private _sequences: SequenceFrame2DRender[] = [];
    private _replayBuckets: SequenceFrame2DRender[][] = [];
    private _replayBucketIndex: number = 0;
    private _columns: number = 1;
    private _rows: number = 1;
    private _cellWidth: number = 1;
    private _cellHeight: number = 1;
    private _coinScale: number = 1;

    constructor(maincls: typeof Main) {
        this._main = maincls;

        Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
        Laya.stage.bgColor = "#20232a";
        Stat.show();

        Laya.loader.load(SequenceFrame2D_GoldCoin.TextureUrl, Loader.IMAGE).then(() => {
            this.createScene();
        });
    }

    private createScene(): void {
        const texture = Laya.loader.getRes(SequenceFrame2D_GoldCoin.TextureUrl) as Texture;
        const box = this._main.box2D;
        box.removeChildren();
        Laya.timer.clearAll(this);

        this._box = box;
        this._texture = texture;
        this._coins.length = 0;
        this._sequences.length = 0;
        this._replayBuckets.length = 0;
        for (let i = 0; i < SequenceFrame2D_GoldCoin.SpawnBucketCount; i++) {
            this._replayBuckets[i] = [];
        }

        this._replayBucketIndex = 0;

        this.prepareGrid(texture);
        for (let i = 0; i < SequenceFrame2D_GoldCoin.Count; i++) {
            this.createCoin(i);
        }

        Laya.stage.off("resize", this, this.layoutCoins);
        Laya.stage.on("resize", this, this.layoutCoins);
        this.startReplayLoop();
    }

    private prepareGrid(texture: Texture): void {
        const width = Math.max(1, Laya.stage.width);
        const height = Math.max(1, Laya.stage.height);

        this._columns = Math.ceil(Math.sqrt(SequenceFrame2D_GoldCoin.Count * width / height));
        this._rows = Math.ceil(SequenceFrame2D_GoldCoin.Count / this._columns);
        this._cellWidth = width / this._columns;
        this._cellHeight = height / this._rows;

        const sourceFrameWidth = texture.width / SequenceFrame2D_GoldCoin.Tiles.x;
        const sourceFrameHeight = texture.height / SequenceFrame2D_GoldCoin.Tiles.y;
        const maxFrameSize = Math.max(sourceFrameWidth, sourceFrameHeight, 0.0001);
        const displayWidth = sourceFrameWidth / maxFrameSize * SequenceFrame2D_GoldCoin.UnitPixels;
        const displayHeight = sourceFrameHeight / maxFrameSize * SequenceFrame2D_GoldCoin.UnitPixels;
        this._coinScale = Math.min(this._cellWidth / displayWidth, this._cellHeight / displayHeight) * 0.88;
    }

    private layoutCoins(): void {
        if (!this._texture) {
            return;
        }

        this.prepareGrid(this._texture);
        for (let i = 0, n = this._coins.length; i < n; i++) {
            this.layoutCoin(i, this._coins[i]);
        }
    }

    private layoutCoin(index: number, coin: Sprite): void {
        const col = index % this._columns;
        const row = Math.floor(index / this._columns);
        coin.pos((col + 0.5) * this._cellWidth, (row + 0.5) * this._cellHeight);
        coin.scale(this._coinScale, this._coinScale);
    }

    private createCoin(index: number): void {
        const bucketIndex = Math.min(
            SequenceFrame2D_GoldCoin.SpawnBucketCount - 1,
            Math.floor(index * SequenceFrame2D_GoldCoin.SpawnBucketCount / SequenceFrame2D_GoldCoin.Count)
        );
        const coin = new Sprite();
        this.layoutCoin(index, coin);

        const sequence = coin.addComponent(SequenceFrame2DRender);
        sequence.playOnAwake = false;
        sequence.texture = this._texture;
        sequence.lifeTime = SequenceFrame2D_GoldCoin.LifeTime;
        sequence.unitPixels = SequenceFrame2D_GoldCoin.UnitPixels;
        sequence.startFrame = SequenceFrame2D_GoldCoin.StartFrame;
        sequence.tiles = SequenceFrame2D_GoldCoin.Tiles;
        sequence.cycles = SequenceFrame2D_GoldCoin.Cycles;
        sequence.color = Color.WHITE;

        this._box.addChild(coin);
        this._coins.push(coin);
        this._sequences.push(sequence);
        this._replayBuckets[bucketIndex].push(sequence);
    }

    private startReplayLoop(): void {
        Laya.timer.clear(this, this.replayNextBucket);
        Laya.timer.loop(SequenceFrame2D_GoldCoin.ReplayInterval, this, this.replayNextBucket);
        this.replayNextBucket();
    }

    private replayNextBucket(): void {
        const bucket = this._replayBuckets[this._replayBucketIndex];
        for (let i = 0, n = bucket.length; i < n; i++) {
            const sequence = bucket[i];
            if (sequence.owner && !sequence.owner.destroyed) {
                sequence.play(true);
            }
        }
        this._replayBucketIndex = (this._replayBucketIndex + 1) % SequenceFrame2D_GoldCoin.SpawnBucketCount;
    }
}
