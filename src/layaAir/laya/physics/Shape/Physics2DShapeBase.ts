import { LayaEnv } from "../../../LayaEnv";
import { Sprite } from "../../display/Sprite";
import { IClone } from "../../utils/IClone";
import { ColliderBase } from "../Collider2D/ColliderBase";
import { Box2DShapeDef, FilterData } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DWorldManager } from "../Physics2DWorldManager";

/**
 * @zh 2D物理碰撞形状基类
 * @en Base class of 2D physics collision shapes
 */
export class Physics2DShapeBase implements IClone {
    protected _shapeDef: Box2DShapeDef = new Box2DShapeDef();
    private _filterData: FilterData = new FilterData();
    protected _box2DFilter: any;

    private _isSensor: boolean = false;

    private _density: number = 10;
    private _friction: number = 0.2;

    private _restitution: number = 0;

    protected _box2DBody: any;
    protected _body: ColliderBase;

    private _restitutionThreshold: number = 1.0;

    protected _box2DShapeDef: any;
    protected _box2DShape: any;

    protected _physics2DManager: Physics2DWorldManager;

    /**@internal 相对节点的x轴偏移*/
    private _x: number = 0;

    /**@internal 相对节点的y轴偏移*/
    private _y: number = 0;

    /**
     * @en The x-axis offset relative to the node.
     * @zh 相对于节点的 x 轴偏移。
     */
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (this._x == value) return;
        this._x = value;
        this._updateShapeData();
    }

    /**
     * @en The y-axis offset relative to the node.
     * @zh 相对于节点的 y 轴偏移。
     */
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (this._y == value) return;
        this._y = value;
        this._updateShapeData();
    }

    /**
     * @zh 碰撞分组数据，用来设置当前形状碰撞时候的分组数据
     * @en Collision grouping data, used to set the grouping data when the current shape collides
     */
    public get filterData(): FilterData {
        return this._filterData;
    }
    public set filterData(value: FilterData) {
        this._filterData = value;
        this._updateFilterData();
    }

    /**
     * @en The density value. The value can be zero or a positive number. It is recommended to use similar densities to improve stacking stability. The default value is 10.
     * @zh 密度值。值可以为零或者是正数，建议使用相似的密度以改善堆叠稳定性。默认值为 10。
     */
    public get density(): number {
        return this._density;
    }
    public set density(value: number) {
        this._density = value;
        this._shapeDef.density = value;
        this._box2DShape && Physics2D.I._factory.set_shape_density(this._box2DShape, value);
    }

    /**
     * @en The restitution coefficient. The value ranges from 0 to 1, the larger the value, the greater the elasticity. The default value is 0.
     * @zh 弹性系数。取值范围0-1，值越大，弹性越大。默认值为0。
     */
    public get restitution(): number {
        return this._restitution;
    }
    public set restitution(value: number) {
        this._restitution = value;
        this._shapeDef.restitution = value;
        this._box2DShape && Physics2D.I._factory.set_shape_restitution(this._box2DShape, value);
    }

    /**
     * @en Restitution velocity threshold, usually in meters per second. Collisions above this velocity will have restitution applied (will bounce).
     * @zh 恢复速度阈值，通常以米/秒为单位。高于此速度的碰撞将应用恢复（将反弹）。
     */
    public get restitutionThreshold(): number {
        return this._restitutionThreshold;
    }
    public set restitutionThreshold(value: number) {
        this._restitutionThreshold = value;
        this._shapeDef.restitutionThreshold = value;
        this._box2DShape && Physics2D.I._factory.set_shape_restitutionThreshold(this._box2DShape, value);
    }

    /**
     * @en The friction coefficient. The value ranges from 0 to 1, the larger the value, the greater the friction. The default value is 0.2.
     * @zh 摩擦力。取值范围0-1，值越大，摩擦越大。默认值为0.2。
     */
    public get friction(): number {
        return this._friction;
    }
    public set friction(value: number) {
        this._friction = value;
        this._shapeDef.friction = value;
        this._box2DShape && Physics2D.I._factory.set_shape_friction(this._box2DShape, value);
    }

    /**
     * @en Whether the object is a sensor. A sensor can trigger collision events but does not produce collision responses.
     * @zh 是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应
     */
    public get isSensor(): boolean {
        return this._isSensor;
    }
    public set isSensor(value: boolean) {
        this._isSensor = value;
        this._shapeDef.isSensor = value;
        this._box2DShape && Physics2D.I._factory.set_shape_isSensor(this._box2DShape, value);
    }

    /**
     * @internal
     * 获得节点的全局缩放X
     */
    protected get scaleX(): number {
        return (<Sprite>this._body.owner).globalScaleX;
    }

    /**
     * @internal
     * 获得节点的全局缩放Y
     */
    protected get scaleY(): number {
        return (<Sprite>this._body.owner).globalScaleY;
    }

    /**@internal 创建获得相对于描点x的偏移 */
    protected get pivotoffx(): number {
        return this._x - (<Sprite>this._body.owner).pivotX;
    }

    /**@internal 创建获得相对于描点y的偏移 */
    protected get pivotoffy(): number {
        return this._y - (<Sprite>this._body.owner).pivotY;
    }

    /**
     * @en constructor method
     * @zh 构造方法
     */
    constructor() {
        this._box2DFilter = Physics2D.I._factory.createFilter();
    }

    /**
     * @zh 更新碰撞分组数据
     * @en Update collision group data
     */
    private _updateFilterData(): void {
        if (!this._box2DShape || !this._box2DFilter) return;
        this._box2DFilter.groupIndex = this._filterData.group;
        this._box2DFilter.categoryBits = this._filterData.category;
        this._box2DFilter.maskBits = this._filterData.mask;
        this._shapeDef.filter = this._filterData;
        Physics2D.I._factory.setfilterData(this._box2DShape, this._box2DFilter);
        Physics2D.I._factory.set_shape_reFilter(this._box2DShape);
    }

    /**
     * @internal
     * @en Set the collision volume to which the shape belongs and initialize the content 
     * @param body The collision body
     * @zh 设置形状所属的碰撞体并初始化内容
     * @param body 所属的碰撞体  
     */
    setCollider(body: ColliderBase): void {
        this._body = body;
        this._box2DBody = body.getBox2DBody();
        if (!this._box2DBody) return;
        this._physics2DManager = this._body.owner?.scene?.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        this.filterData = this._filterData;
        this._box2DShapeDef = Physics2D.I._factory.createShapeDef(this._physics2DManager.box2DWorld, this._shapeDef, this._box2DFilter);
        Physics2D.I._factory.set_shape_collider(this._box2DShapeDef, this._body);
        this._updateShapeData();
        this._initShape();
    }

    private _initShape(): void {
        if (!LayaEnv.isPlaying) return;
        this._createShape();
        Physics2D.I._factory.set_shape_collider(this._box2DShape, this._body);
        this._updateFilterData();
        this.x = this._x;
        this.y = this._y;
        this.density = this._density;
        this.friction = this._friction;
        this.isSensor = this._isSensor;
        this.restitution = this._restitution;
        this.restitutionThreshold = this._restitutionThreshold;
    }

    /**
     * @override
     */
    protected _createShape() {
    }

    /**
     * @override
     */
    protected _updateShapeData(): void {
    }

    /**
     * @en Get the axis-aligned bounding box corresponding to the shape
     * @returns box2D's AABB bounding box
     * @zh 获取形状对应的轴对齐包围盒
     * @returns box2D的AABB包围盒
     */
    getAABB(): any {
        return Physics2D.I._factory.get_shape_AABB(this._box2DShape);
    }

    /**
     * @zh 检测射线是否与形状相交
     * @param index index通常用于ChainShape与PolygonShape等多形状的对象，CircleShape、EdgeShape等默认为0
     * @returns 是否相交
     * @en Check if a ray intersects a shape
     * @param index Index is usually used for objects with multiple shapes such as ChainShape and PolygonShape. The default value for CircleShape, EdgeShape, etc. is 0.
     * @returns Whether it intersects
     */
    rayCast(index: number = 0): boolean {
        return Physics2D.I._factory.shape_rayCast(this._box2DShape, null, null, index)
    }

    /**
     * @en Destroy shape
     * @zh 销毁形状
     */
    destroy(): void {
        Physics2D.I._factory.destroyShape(this._physics2DManager.box2DWorld, this._box2DBody, this._box2DShape);
        Physics2D.I._factory.destroyData(this._box2DFilter);
        Physics2D.I._factory.destroyData(this._box2DShapeDef);
        this._box2DShape = null;
        this._box2DFilter = null;
        this._box2DShapeDef = null;
    }

    clone() {
    }

    cloneTo(destObject: Physics2DShapeBase): void {
        destObject.density = this.density;
        destObject.filterData = this.filterData;
        destObject.friction = this.friction;
        destObject.isSensor = this.isSensor;
        destObject.restitution = this.restitution;
        destObject.restitutionThreshold = this.restitutionThreshold;
        destObject.x = this.x;
        destObject.y = this.y;
    }
}