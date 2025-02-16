import { Laya } from "../../Laya";
import { FixtureBox2DDef, PhysicsShape, RigidBody2DInfo } from "../physics/IPhysiscs2DFactory";
import { Utils } from "../utils/Utils";
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

    /**
     * 是否启动了物理
     */
    enable:boolean = false;

    _rigidBodys: any[] = [];

    constructor(layer: TileMapLayer) {
        this._layer = layer;
    }
    
    updateState(bool:boolean){
        let result = !!Laya.physics2D && bool;
        if (result != this.enable) {
            if (result) this.enableRigidBodys();
            else this.disableRigidBodys();
            this.enable = result;
        }
    }

    createRigidBody():any {
        let factory = Laya.physics2D;
        var defRigidBodyDef = new RigidBody2DInfo();
        defRigidBodyDef.angle = 0;
        // defRigidBodyDef.allowSleep = false;
        defRigidBodyDef.angularDamping = 0;

        defRigidBodyDef.bullet = false;
        defRigidBodyDef.fixedRotation = false;
        defRigidBodyDef.gravityScale = 1;
        defRigidBodyDef.linearDamping = 0;
        defRigidBodyDef.group = 0;
        defRigidBodyDef.type = "static";
        defRigidBodyDef.angularVelocity = 0;
        defRigidBodyDef.linearVelocity.setValue(0, 0);
        let rigidBody = factory.rigidBodyDef_Create(defRigidBodyDef);

        let trans = this._layer.owner.globalTrans;
        let x = trans.x;
        let y = trans.y;
        let angle = Utils.toRadian(trans.rotation);
        Laya.physics2D.set_RigibBody_Transform(rigidBody, x, y, angle);

        this._rigidBodys.push(rigidBody);
        return rigidBody;
    }

    //激活所有
    enableRigidBodys(){
        for (let i = 0 , len = this._rigidBodys.length ; i < len; i++) 
            this._enableRigidBody(this._rigidBodys[i]);
    }

    //关闭所有
    disableRigidBodys(){
        for (let i = 0 , len = this._rigidBodys.length ; i < len; i++) 
            this._disableRigidBody(this._rigidBodys[i]);
    }

    _enableRigidBody(rigidBody:any){
        Laya.physics2D.set_RigibBody_Enable(rigidBody,true);
    }

    _disableRigidBody(rigidBody:any){
        Laya.physics2D.set_RigibBody_Enable(rigidBody,false);
    }

    destroyRigidBody(rigidBody:any){
        let index = this._rigidBodys.indexOf(rigidBody);
        //!!
        if (index !== -1) {
            this._rigidBodys.splice(index , 1);
        }
        Laya.physics2D.removeBody(rigidBody);
    }

    /** 创建Shape */
    createFixture(rigidBody:any , layer:TileSetPhysicsLayer , data: number[]): any {
        let factory = Laya.physics2D;

        var def: any = TileMapPhysics._tempDef;
        def.density = layer.density;
        def.friction = layer.friction;
        def.isSensor = false;
        def.restitution = layer.restitution;
        def.shape = PhysicsShape.PolygonShape;
        let fixtureDef = factory.createFixtureDef(def);
        factory.set_PolygonShape_data(fixtureDef._shape, 0, 0, data, 1, 1);
        let fixture = factory.createfixture(rigidBody, fixtureDef);
        factory.set_fixtureDef_GroupIndex(fixture, layer.group);
        factory.set_fixtureDef_CategoryBits(fixture, layer.category);
        factory.set_fixtureDef_maskBits(fixture, layer.mask);
        factory.set_fixture_collider(fixture, this);
        return fixture;
    }

    /** @internal */
    _updateTransfrom(){
        let len = this._rigidBodys.length;
        if (!len) return;

        let trans = this._layer.owner.globalTrans;
        let x = trans.x;
        let y = trans.y;
        let angle = Utils.toRadian(trans.rotation);
        for (let i = 0 ; i < len; i++) {
            Laya.physics2D.set_RigibBody_Transform(this._rigidBodys[i], x, y, angle);
        }
    }

    /**
     * 移除物理形状
     */
    destroyFixture( rigidBody:any , fixture:any): void {
        Laya.physics2D.rigidBody_DestroyFixture(rigidBody, fixture);
    }

}