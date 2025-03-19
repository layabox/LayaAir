import { LayaEnv } from "../../../LayaEnv";
import { Sprite } from "../../display/Sprite";
import { IClone } from "../../utils/IClone";
import { ColliderBase } from "../Collider2D/ColliderBase";
import { Box2DShapeDef, FilterData } from "../Factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DWorldManager } from "../Physics2DWorldManager";

export class Physics2DShapeBase implements IClone {
    protected _shapeDef: Box2DShapeDef = new Box2DShapeDef();
    private _filterData: FilterData = new FilterData();
    protected _box2DFilter: any;

    private _isSensor: boolean = false;

    private _density: number = 1;
    private _friction: number = 0.2;

    private _restitution: number = 0;

    protected _box2DBody: any;
    protected _body: ColliderBase;

    private _restitutionThreshold: number;

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

    public get filterData(): FilterData {
        return this._filterData;
    }
    public set filterData(value: FilterData) {
        this._filterData = value;
        this._updateFilterData();
    }

    public get density(): number {
        return this._density;
    }
    public set density(value: number) {
        this._density = value;
        this._shapeDef.density = value;
        this._box2DShape && Physics2D.I._factory.set_shape_density(this._box2DShape, value);
    }

    public get restitution(): number {
        return this._restitution;
    }
    public set restitution(value: number) {
        this._restitution = value;
        this._shapeDef.restitution = value;
        this._box2DShape && Physics2D.I._factory.set_shape_restitution(this._box2DShape, value);
    }

    public get restitutionThreshold(): number {
        return this._restitutionThreshold;
    }
    public set restitutionThreshold(value: number) {
        this._restitutionThreshold = value;
        this._shapeDef.restitutionThreshold = value;
        this._box2DShape && Physics2D.I._factory.set_shape_restitutionThreshold(this._box2DShape, value);
    }

    public get friction(): number {
        return this._friction;
    }
    public set friction(value: number) {
        this._friction = value;
        this._shapeDef.friction = value;
        this._box2DShape && Physics2D.I._factory.set_shape_friction(this._box2DShape, value);
    }
    public get isSensor(): boolean {
        return this._isSensor;
    }
    public set isSensor(value: boolean) {
        this._isSensor = value;
        this._shapeDef.isSensor = value;
        this._box2DShape && Physics2D.I._factory.set_shape_sensor(this._box2DShape, value);
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

    constructor() {
        this._box2DFilter = Physics2D.I._factory.createFilter();
    }

    _updateFilterData(): void {
        if (!this._box2DShape || !this._box2DFilter) return;
        this._box2DFilter.groupIndex = this._filterData.group;
        this._box2DFilter.categoryBits = this._filterData.catagory;
        this._box2DFilter.maskBits = this._filterData.mask;
        this._shapeDef.filter = this._filterData;
        Physics2D.I._factory.setfilterData(this._box2DShape, this._box2DFilter);
        Physics2D.I._factory.set_shape_reFilter(this._box2DShape);
    }

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
    protected _updateShapeData() {
    }

    getAABB(): any {
        return Physics2D.I._factory.get_shape_AABB(this._box2DShape);
    }

    /**
     * @zh 检测射线是否与形状相交
     * @param index index通常用于ChainShape与PolygonShape等多形状的对象，CircleShape、EdgeShape等默认为0
     * @returns 
     */
    rayCast(index: number = 0): boolean {
        return Physics2D.I._factory.shape_rayCast(this._box2DShape, null, null, index)
    }

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