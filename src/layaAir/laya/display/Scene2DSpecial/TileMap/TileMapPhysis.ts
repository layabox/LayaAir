import { Laya } from "../../../../Laya";
import { Vector2 } from "../../../maths/Vector2";
import { FixtureBox2DDef, IPhysiscs2DFactory, PhysicsShape, RigidBody2DInfo } from "../../../physics/IPhysiscs2DFactory";
import { TileMapLayer } from "./TileMapLayer";
import { TileMapUtils } from "./TileMapUtils";
import { TileSetCellData } from "./TileSetCellData";

/**
 * @internal
 * 瓦片地图物理
 */
export class TileMapPhysis {
    private static _tempDef: any;
    static __init__(): void {
        TileMapPhysis._tempDef = new FixtureBox2DDef();

    }
    private _physisShapeMaps: Map<string, any[]>;
    private _layer: TileMapLayer;

    constructor(layer: TileMapLayer) {
        this._layer = layer;
        this._physisShapeMaps = new Map();
    }

    private _physicBody: any;
    /**@internal 密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
    private _density: number = 10;

    /**@internal 摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
    private _friction: number = 0.2;

    /**@internal 弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
    private _restitution: number = 0;

    /**
    * @en [Read-only] Specifies the collision group to which the body belongs, default is 0, the collision rules are as follows:
    * 1. If the group values of two objects are equal:
    *    - If the group value is greater than zero, they will always collide.
    *    - If the group value is less than zero, they will never collide.
    *    - If the group value is equal to 0, then rule 3 is used.
    * 2. If the group values are not equal, then rule 3 is used.
    * 3. Each rigidbody has a category, this property receives a bit field, the range is the power of 2 in the range of [1,2^31].
    * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
    * @zh [只读] 指定了该主体所属的碰撞组，默认为0，碰撞规则如下：
    * 1. 如果两个对象 group 相等：
    *    - group 值大于零，它们将始终发生碰撞。
    *    - group 值小于零，它们将永远不会发生碰撞。
    *    - group 值等于0，则使用规则3。
    * 2. 如果 group 值不相等，则使用规则3。
    * 3. 每个刚体都有一个 category 类别，此属性接收位字段，范围为 [1,2^31] 范围内的2的幂。
    * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
    */
    group: number = 0;

    /**
     * @en [Read-only] Collision category, specified using powers of 2, with 32 different collision categories available.
     * @zh [只读] 碰撞类别，使用2的幂次方值指定，有32种不同的碰撞类别可用。
     */
    category: number = 1;

    /**
     * @en [Read-only] Specifies the category of collision bit mask, the result of category bitwise operation.
     * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
     * @zh [只读] 指定冲突位掩码碰撞的类别，category 位操作的结果。
     * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
     */
    mask: number = -1;

    /**
     * @en The density value. The value can be zero or a positive number. It is recommended to use similar densities to improve stacking stability. The default value is 10.
     * @zh 密度值。值可以为零或者是正数，建议使用相似的密度以改善堆叠稳定性。默认值为 10。
     */
    get density(): number {
        return this._density;
    }

    set density(value: number) {
        if (this._density == value) return;
        this._density = value;
    }

    /**
   * @en The friction coefficient. The value ranges from 0 to 1, the larger the value, the greater the friction. The default value is 0.2.
   * @zh 摩擦力。取值范围0-1，值越大，摩擦越大。默认值为0.2。
   */
    get friction(): number {
        return this._friction;
    }

    set friction(value: number) {
        if (this._friction == value) return;
        this._friction = value;
    }

    /**
    * @en The restitution coefficient. The value ranges from 0 to 1, the larger the value, the greater the elasticity. The default value is 0.
    * @zh 弹性系数。取值范围0-1，值越大，弹性越大。默认值为0。
    */
    get restitution(): number {
        return this._restitution;
    }

    set restitution(value: number) {
        if (this._restitution == value) return;
        this._restitution = value;
    }


    private _getfactor(): IPhysiscs2DFactory {
        return Laya.physics2D;
    }

    private _enablePhysics(): boolean {
        if (Laya.physics2D == null) return false;
        return this._layer.physicsEnable;
    }
    _createPhysics(): void {
        if (!this._enablePhysics()) return;
        let factory = this._getfactor();
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

        this._physicBody = factory.rigidBodyDef_Create(defRigidBodyDef);
    }



    /**@protected 创建Shape*/
    protected _createfixture(data: number[]): any {
        if (!this._physicBody) return null;
        let factory = Laya.physics2D;

        var def: any = TileMapPhysis._tempDef;
        def.density = this.density;
        def.friction = this.friction;
        def.isSensor = false;
        def.restitution = this.restitution;
        def.shape = PhysicsShape.PolygonShape;
        let fixtureDef = factory.createFixtureDef(def);
        factory.set_PolygonShape_data(fixtureDef._shape, 0, 0, data, 1, 1);
        let fixture = factory.createfixture(this._physicBody, fixtureDef);
        factory.set_fixtureDef_GroupIndex(fixture, this.group);
        factory.set_fixtureDef_CategoryBits(fixture, this.category);
        factory.set_fixtureDef_maskBits(fixture, this.mask);
        factory.set_fixture_collider(fixture, this);
        return fixture;
    }

    private _getCellKey(cellRow: number, cellCol: number): string {
        return cellRow + "_" + cellCol;
    }

    /**
     * 移除物理形状
     */
    removePhysisShape(cellRow: number, cellCol: number): void {
        if (!this._enablePhysics()) return;
        let key = this._getCellKey(cellRow, cellCol);
        let fixtures = this._physisShapeMaps.get(key);
        if (fixtures) {
            if (fixtures && this._physicBody) {
                let factory = Laya.physics2D;
                for (let i = 0, len = fixtures.length; i < len; i++)
                    factory.rigidBody_DestroyFixture(this._physicBody, fixtures[i]);
            }
            this._physisShapeMaps.delete(key);
        }
    }

    /**
     * 添加物理形状
     */
    addPhysisShape(cellRow: number, cellCol: number, cell: TileSetCellData): void {
        if (!this._enablePhysics()) return;

        let physicsDatas = cell.physicsDatas;
        if (!physicsDatas) return;

        let key = this._getCellKey(cellRow, cellCol);
        let fixtures = this._physisShapeMaps.get(key);
        if (fixtures) {
            return;
        }

        const temp = Vector2.TempVector2;
        this._layer._grid._gridToPixel(cellRow, cellCol, temp);
        let offx = temp.x;
        let offy = temp.y;
        let mat = this._layer._globalTramsfrom();

        fixtures = [];
        for (let i = 0, l = physicsDatas.length; i < l; i++) {
            let data = physicsDatas[i];
            if (!data) continue

            let shape = data.shape;
            let shapeLength = shape.length;
            let datas: Array<number> = new Array(shapeLength);
            for (let j = 0; j < shapeLength; j++) {
                let x = shape[j];
                let y = shape[j + 1];
                TileMapUtils.transfromPointByValue(mat, x + offx, y + offy, temp);
                datas[j] = temp.x;
                datas[j + 1] = temp.y;
            }
            fixtures.push(this._createfixture(datas));
        }
        this._physisShapeMaps.set(key, fixtures);
    }

    hasPhysisShape(cellRow: number, cellCol: number): boolean {
        return this._physisShapeMaps.has(this._getCellKey(cellRow, cellCol));
    }
}