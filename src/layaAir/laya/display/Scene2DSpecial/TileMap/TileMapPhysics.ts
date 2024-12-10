import { Laya } from "../../../../Laya";
import { FixtureBox2DDef, PhysicsShape, RigidBody2DInfo } from "../../../physics/IPhysiscs2DFactory";
import { TileSetPhysicsLayer } from "./layers/TileSetPhysicsLayer";
import { TileMapLayer } from "./TileMapLayer";

/**
 * @internal
 * 瓦片地图物理
 */
export class TileMapPhysics {
    private static _tempDef: any;

    static __init__(): void {
        TileMapPhysics._tempDef = new FixtureBox2DDef();
    }

    private _layer: TileMapLayer;

    constructor(layer: TileMapLayer) {
        this._layer = layer;
    }

    private _physicsBody: any;

    private _enablePhysics(): boolean {
        if (Laya.physics2D == null) return false;
        return this._layer.physicsEnable;
    }

    _createPhysics(): void {
        if (!this._enablePhysics()) return;
        let factory = Laya.physics2D;
        var defRigidBodyDef = new RigidBody2DInfo();
        defRigidBodyDef.angle = 0;
        defRigidBodyDef.allowSleep = false;
        defRigidBodyDef.angularDamping = 0;

        defRigidBodyDef.bullet = false;
        defRigidBodyDef.fixedRotation = false;
        defRigidBodyDef.gravityScale = 1;
        defRigidBodyDef.linearDamping = 0;
        defRigidBodyDef.group = 0;
        defRigidBodyDef.type = "static";
        defRigidBodyDef.angularVelocity = 0;
        defRigidBodyDef.linearVelocity.setValue(0, 0);

        this._physicsBody = factory.rigidBodyDef_Create(defRigidBodyDef);
    }

    /** 创建Shape */
    _createFixture(layer: TileSetPhysicsLayer, data: number[]): any {
        if (!this._physicsBody) return null;
        let factory = Laya.physics2D;

        var def: any = TileMapPhysics._tempDef;
        def.density = layer.density;
        def.friction = layer.friction;
        def.isSensor = false;
        def.restitution = layer.restitution;
        def.shape = PhysicsShape.PolygonShape;
        let fixtureDef = factory.createFixtureDef(def);
        factory.set_PolygonShape_data(fixtureDef._shape, 0, 0, data, 1, 1);
        let fixture = factory.createfixture(this._physicsBody, fixtureDef);
        factory.set_fixtureDef_GroupIndex(fixture, layer.group);
        factory.set_fixtureDef_CategoryBits(fixture, layer.category);
        factory.set_fixtureDef_maskBits(fixture, layer.mask);
        factory.set_fixture_collider(fixture, this);
        return fixture;
    }


    /**
     * 移除物理形状
     */
    _destroyFixture(fixture: any): void {
        if (!this._physicsBody) return;
        Laya.physics2D.rigidBody_DestroyFixture(this._physicsBody, fixture);
    }

    /**
     * 添加物理形状
     */
    // addPhysicsShape(cellRow: number, cellCol: number, cell: TileSetCellData): void {
    //     if (!this._enablePhysics()) return;

    //     let physicsDatas = cell.physicsDatas;
    //     if (!physicsDatas) return;

    //     let key = this._getCellKey(cellRow, cellCol);
    //     let fixtures = this._physicsShapeMaps.get(key);
    //     if (fixtures) {
    //         return;
    //     }

    //     const temp = Vector2.TempVector2;
    //     this._layer._grid._gridToPixel(cellRow, cellCol, temp);
    //     let offx = temp.x;
    //     let offy = temp.y;
    //     let mat = this._layer._globalTramsfrom();

    //     fixtures = [];
    //     for (let i = 0, l = physicsDatas.length; i < l; i++) {
    //         let data = physicsDatas[i];
    //         if (!data) continue

    //         let shape = data.shape;
    //         let shapeLength = shape.length;
    //         let datas: Array<number> = new Array(shapeLength);
    //         for (let j = 0; j < shapeLength; j++) {
    //             let x = shape[j];
    //             let y = shape[j + 1];
    //             TileMapUtils.transfromPointByValue(mat, x + offx, y + offy, temp);
    //             datas[j] = temp.x;
    //             datas[j + 1] = temp.y;
    //         }
    //         fixtures.push(this._createfixture(datas));
    //     }
    //     this._physicsShapeMaps.set(key, fixtures);
    // }
}