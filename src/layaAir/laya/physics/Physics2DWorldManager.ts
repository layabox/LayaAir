import { Scene } from "../display/Scene";
import { Sprite } from "../display/Sprite";
import { Vector2 } from "../maths/Vector2";
import { EPhycis2DBlit, Ebox2DType, Physics2DHitResult, box2DWorldDef } from "./factory/IPhysics2DFactory";
import { Physics2D } from "./Physics2D";
import { Physics2DDebugDraw } from "./Physics2DDebugDraw";
import { Browser } from "../utils/Browser";
import { IElementComponentManager } from "../components/IScenceComponentManager";
import { Physics2DOption } from "./Physics2DOption";
import { Laya } from "../../Laya";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { LayaEnv } from "../../LayaEnv";

/**
 * @en 2D physics world manager class for the scene
 * @zh 场景对应的2D物理管理类
 */
export class Physics2DWorldManager implements IElementComponentManager {
    /**
     * @en 2Dphysics manager class name
     * @zh 2D物理管理类类名
     */
    static __managerName: string = "Physics2DWorldManager";

    private _box2DWorld: any;
    private _pixelRatio: number = 50;
    private _RePixelRatio: number = 1 / this._pixelRatio;
    private _scene: Scene | Sprite;
    private _subStep: number = 1;
    private _velocityIterations: number = 8;
    private _positionIterations: number = 8;
    private _gravity: Vector2 = new Vector2(0, -9.8);
    private _worldDef: box2DWorldDef = new box2DWorldDef();
    private _eventList: any[] = [];
    private _enableDraw: boolean = false;
    private _debugDraw: Physics2DDebugDraw;
    private _jsDraw: any;
    private _contactListener: any;
    private _JSQuerycallback: any;
    private _JSRayCastcallback: any;
    private _allowWorldSleep: boolean = false;

    /**
     * @en Get the box2D world corresponding to the current scene
     * @zh 获取当前场景对应的box2D世界
     */
    get box2DWorld(): any {
        return this._box2DWorld;
    }

    /**
     * @en Get the current gravity value of the physical world
     * @zh 获取当前物理世界的重力值
     */
    get gravity(): Vector2 {
        return this._gravity;
    }

    Init(data: any): void {
        this.setRootSprite(this._scene);
    }

    /**
     * @en constructor method
     * @zh 构造方法
     * @param scene 
     */
    constructor(scene: Scene | Sprite) {
        this._worldDef.pixelRatio = this._pixelRatio = Physics2DOption.pixelRatio;
        this._RePixelRatio = 1 / this._pixelRatio;
        this._worldDef.subStep = this._subStep = Physics2DOption.subStep;
        this._worldDef.velocityIterations = this._velocityIterations = Physics2DOption.velocityIterations;
        this._worldDef.positionIterations = this._positionIterations = Physics2DOption.positionIterations;
        this._worldDef.gravity = this._gravity.setValue(Physics2DOption.gravity.x, Physics2DOption.gravity.y);
        this._allowWorldSleep = Physics2DOption.allowSleeping;
        this._scene = scene;
        this.setRootSprite(this._scene);
    }
    name: string;

    update(dt: number): void {

    }

    /**
     * @zh 设置物理世界绑定的场景或根节点
     * @en Set the physics world bound to the scene or root node
     * @param scene 场景
     * @param scene scene 
     */
    setRootSprite(scene: Scene | Sprite): void {
        this._scene = scene;
        this._box2DWorld = Physics2D.I._factory.createWorld(this._worldDef);
        Physics2D.I._factory.allowWorldSleep(this._box2DWorld, this._allowWorldSleep);
        this._box2DWorld._pixelRatio = this._pixelRatio;
        this._box2DWorld._indexInMap = Physics2D.I._factory.worldCount;
        Physics2D.I._factory.worldMap.set(Physics2D.I._factory.worldCount, this);
        Physics2D.I._factory.worldCount++;
        this._contactListener = Physics2D.I._factory.createContactListener();
        this._contactListener = this._worldContactCallback(this._contactListener);
        Physics2D.I._factory.setContactListener(this._box2DWorld, this._contactListener);
        this._JSRayCastcallback = Physics2D.I._factory.createJSRayCastCallback();
        this._JSQuerycallback = Physics2D.I._factory.createJSQueryCallback();
        //debug draw
        if (Physics2DOption.debugDraw && LayaEnv.isPlaying) {
            this.enableDebugDraw(Physics2DOption.drawShape, EPhycis2DBlit.Shape);
            this.enableDebugDraw(Physics2DOption.drawJoint, EPhycis2DBlit.Joint);
            this.enableDebugDraw(Physics2DOption.drawAABB, EPhycis2DBlit.AABB);
            this.enableDebugDraw(Physics2DOption.drawCenterOfMass, EPhycis2DBlit.CenterOfMass);
        }

    }

    /**
     * @zh 设置重力向量
     * @param gravity 重力
     * @en Set the gravity vector
     * @param gravity gravity
     */
    setGravity(gravity: Vector2): void {
        this._gravity = gravity;
    }

    /**
     * @zh 获取物理世界绑定的场景或根节点
     * @returns 场景或根节点
     * @en Get the physics world bound to the scene or root node
     * @returns Scene | Sprite
     */
    getRootSprite(): Scene | Sprite {
        return this._scene;
    }

    /**
     * @zh 平移整个物理世界的远点
     * @en Shift the far point of the entire physics world
     * @param newOrigin 新的物理世界原点
     * @en New physics world origin
     */
    shiftOrigin(newOrigin: Vector2): void {
        Physics2D.I._factory.shiftOrigin(this._box2DWorld, newOrigin);
    }

    /**
     * @zh 设置是否开启物理世界的Debug绘制
     * @param enable 是否开启
     * @param bli 绘制模式
     * @en Set whether to enable the debug drawing of the physics world
     * @param enable enable
     * @param bli blit mode
     */
    enableDebugDraw(enable: boolean, bli: EPhycis2DBlit): void {
        if (!this._debugDraw) {
            this._debugDraw = new Physics2DDebugDraw();
            this._debugDraw.physics2DWorld = this;
            this._scene.addChild(this._debugDraw);
            this._debugDraw.zOrder = 1000;
        }
        this._enableDraw = enable;
        this._enableBox2DDraw(bli);
    }


    /**
     * @zh 设置物理世界像素对照单位
     * @param pixelRatio 设置像素比例
     * @en Set the pixel ratio of the physics world
     * @param pixelRatio The pixel ratio of the physics world
     */
    setPixel_Ratio(pixelRatio: number): void {
        this._pixelRatio = pixelRatio;
    }

    /**
     * @zh 获取物理世界像素对照单位
     * @en Get the pixel ratio of the physics world
     * @returns The pixel ratio of the physics world
     * @returns 获取物理世界像素对照单位
     */
    getPixel_Ratio(): number {
        return this._pixelRatio;
    }

    /**
     * @zh 设置物理世界子步迭代次数
     * @param subStep 设置物理世界子步迭代次数 
     * @en Set the number of substeps in the physics world
     * @param subStep The number of substeps in the physics world
     */
    setSubStep(subStep: number): void {
        this._subStep = subStep;
    }

    /**
     * @zh 获取物理世界子步迭代次数
     * @returns 获取物理世界子步迭代次数 
     * @en Get the number of substeps in the physics world
     * @returns The number of substeps in the physics world
     */
    getSubStep(): number {
        return this._subStep;
    }

    /**
     * @zh 派发物理世界的事件
     * @en dispath the events of the physics2d world
     */
    sendEvent(): void {
        let length: number = this._eventList.length;
        if (length > 0) {
            for (let i = 0; i < length; i += 2) {
                this._dispatchEvent(this._eventList[i], this._eventList[i + 1]);
            }
            this._eventList.length = 0;
        }
    }

    /**
     * @zh 设置物理世界模拟中速度的迭代次数，迭代次数越多越精确，性能越差.
     * @param velocityIterations 速度迭代次数
     * @en Set the number of iterations of the physics world simulation, the more iterations, the more accurate, but the more performance.
     * @param velocityIterations velocityIterations
     */
    setVelocityIterations(velocityIterations: number): void {
        this._velocityIterations = velocityIterations;
    }

    /**
     * @zh 获取物理世界模拟中速度的迭代次数.
     * @returns 速度迭代次数
     * @en Get the number of iterations of the physics world simulation.
     * @returns velocityIterations
     */
    getVelocityIterations(): number {
        return this._velocityIterations;
    }

    /**
     * @zh 设置物理世界模拟中位置的迭代次数.
     * @en Set the number of iterations of the physics world simulation.
     * @param positionIterations 位置迭代次数
     * @param positionIterations positionIterations
     */
    setPositionIterations(positionIterations: number): void {
        this._positionIterations = positionIterations;
    }

    /**
     * @zh 获取物理世界模拟中位置的迭代次数.
     * @returns 位置迭代次数.
     * @en Get the number of iterations of the physics world simulation.
     * @returns positionIterations.
     */
    getPositionIterations(): number {
        return this._positionIterations;
    }

    /**
     * @zh 获取物理世界中刚体的数量.
     * @returns 刚体的数量.
     * @en Get the number of bodies in the physics world.
     * @returns bodyCount.
     */
    getBodyCount(): number {
        return Physics2D.I._factory.getBodyCount(this._box2DWorld);
    }

    /**
     * @zh 获取物理世界中关节的数量.
     * @returns 关节的数量.
     * @en Get the number of joints in the physics world.
     * @returns jointCount.
     */
    getJointCount(): number {
        return Physics2D.I._factory.getJointCount(this._box2DWorld);
    }

    /**
     * @zh 获取物理世界中碰撞的数量.
     * @returns 碰撞的数量.
     * @en Get the number of collisions in the physics world.
     * @returns contactCount.
     */
    getContactCount(): number {
        return Physics2D.I._factory.getContactCount(this._box2DWorld);
    }

    /**
     * @zh 将Laya坐标转换到物理坐标系.
     * @param value Laya坐标. 
     * @returns Physics2D坐标.
     * @en Convert Laya coordinates to physics coordinates.
     * @param value Laya coordinates.
     * @returns Physics2D coordinates.
     */
    layaToPhysics2D(value: number): number {
        return value * this._RePixelRatio;
    }

    /**
     * @zh 将物理坐标系转换到Laya坐标.
     * @param value Physics2D坐标.
     * @returns Laya坐标.
     * @en Convert physics coordinates to Laya coordinates.
     * @param value Physics2D coordinates.
     * @returns Laya coordinates.
     */
    physics2DToLaya(value: number): number {
        return value * this._pixelRatio;
    }

    /**
     * @zh 清除场景中所有的力
     * @en Clear all forces in the scene
     */
    clearAllForces(): void {
        this._box2DWorld && Physics2D.I._factory.clearForces(this._box2DWorld);
    }

    /**
     * @zh 查询物理世界中所有可能与提供的AABB重叠的内容
     * @param res 返回的ColliderBase数组
     * @param bounds 要查询的AABB包围盒
     * @en Query the physical world for all possible overlaps with the provided AABB
     * @param res Returned ColliderBase array
     * @param bounds The AABB bounding box to query
     */
    QueryAABB(res: ColliderBase[], bounds: any): void {
        this._JSQuerycallback.ReportFixture = function _callback(warp: any) {
            let fixture = Physics2D.I._factory.warpPoint(warp, Ebox2DType.b2Fixture);
            if (fixture) {
                let collider = fixture.collider;
                collider && res.push(collider);
                return true;
            } else {
                return false;
            }
        }
        Physics2D.I._factory.QueryAABB(this._box2DWorld, this._JSQuerycallback, bounds);
    }

    /**
     * @zh 查询物理世界中对射线路径上的所有形状，可以获取最近点、任意点、还是 n 点。射线投射会忽略包含起点的形状。
     * @param 
     * @param startPos 射线开始位置
     * @param endPos 射线结束位置
     * @en Query the physical world for all shapes on a ray path, either the closest point, any point, or n points. Ray casting ignores shapes that contain the starting point.
     * @param 
     * @param startPos ray start position
     * @param endPos ray end position
     */
    RayCast(res: Physics2DHitResult[], startPos: Vector2, endPos: Vector2): void {
        let callback = (warp: any, point: any, normal: any, fraction: number) => {
            let fixture = Physics2D.I._factory.warpPoint(warp, Ebox2DType.b2Fixture);
            point = Physics2D.I._factory.warpPoint(point, Ebox2DType.b2Vec2);
            normal = Physics2D.I._factory.warpPoint(normal, Ebox2DType.b2Vec2);
            if (!fixture) return 1;
            let hitRes = new Physics2DHitResult();
            let collider = fixture.collider;
            hitRes.collider = collider;
            hitRes.hitPoint.x = this.physics2DToLaya(point.x);
            hitRes.hitPoint.y = this.physics2DToLaya(point.y);
            hitRes.hitNormal.x = this.physics2DToLaya(normal.x);
            hitRes.hitNormal.y = this.physics2DToLaya(normal.y);
            hitRes.fraction = fraction;
            res.push(hitRes);

            if (collider) {
                return 1;
            } else {
                return 0;
            }
        };
        this._JSRayCastcallback.ReportFixture = callback.bind(this);
        Physics2D.I._factory.RayCast(this._box2DWorld, this._JSRayCastcallback, startPos, endPos);
    }

    /**
     * @zh 销毁物理世界。
     * @en Destroy the physics world.
     */
    destroy(): void {
        Physics2D.I._factory.removeBody(this._box2DWorld, Physics2D.I._emptyBody);
        Physics2D.I._emptyBody = null;
        Laya.timer.callLater(this, () => {
            Physics2D.I._factory.destroyWorld(this._box2DWorld);
        })
        if (this._enableDraw || this._debugDraw) {
            this._debugDraw.removeSelf();
            this._debugDraw.destroy();
            this._debugDraw = null;
        }
        Physics2D.I._factory.worldMap.delete(this._box2DWorld._indexInMap);
        this._box2DWorld = null;
        this._eventList = null;
    }

    private _worldBeginContactCallback(contact: any) {
        let contactInfo = Physics2D.I._factory.warpPoint(contact, Ebox2DType.b2Contact);
        this._eventList.push("triggerenter", contactInfo);
    }

    private _worldEndContactCallback(contact: any) {
        let contactInfo = Physics2D.I._factory.warpPoint(contact, Ebox2DType.b2Contact);
        this._eventList.push("triggerexit", contactInfo);
    }

    private _worldPreSolveCallback(contact: any, oldManifold: any) {
        let contactInfo = Physics2D.I._factory.warpPoint(contact, Ebox2DType.b2Contact);
        this._eventList.push("triggerstay", contactInfo);
    }

    private _worldPostSolveCallback(contact: any, impulse: any) {
        //TODO
    }

    private _worldBeginTriggerCallback(contact: any) {
        //TODO
    }

    private _worldEndTriggerCallback(contact: any) {
        //TODO
    }

    private _worldPreTriggerCallback(contact: any, oldManifold: any) {
        //TODO
    }

    private _worldPostTriggerCallback(contact: any, impulse: any) {
        //TODO
    }

    private _worldContactCallback(contactListener: any): any {
        contactListener.BeginContact = this._worldBeginContactCallback.bind(this);
        contactListener.EndContact = this._worldEndContactCallback.bind(this);
        contactListener.PreSolve = this._worldPreSolveCallback.bind(this);
        contactListener.PostSolve = this._worldPostSolveCallback.bind(this);
        return contactListener;
    }

    private _makeStyleString(color: any, alpha: number = -1): any {
        let colorData = Physics2D.I._factory.warpPoint(color, Ebox2DType.b2Color);
        let r = (colorData.r * 255).toFixed(1);
        let g = (colorData.g * 255).toFixed(1);
        let b = (colorData.b * 255).toFixed(1);

        let cv: string;
        if (alpha > 0) {
            cv = `rgba(${r},${g},${b},${alpha})`;
        }
        else {
            cv = `rgb(${r},${g},${b})`;
        }
        return cv;
    }

    private _enableBox2DDraw(flag: EPhycis2DBlit): void {
        if (!this._jsDraw) {
            this._jsDraw = Physics2D.I._factory.createBox2DDraw(this._box2DWorld, flag);
            this._jsDraw.DrawSegment = this._debugDrawSegment.bind(this);
            this._jsDraw.DrawPolygon = this._debugDrawPolygon.bind(this);
            this._jsDraw.DrawSolidPolygon = this._debugDrawSolidPolygon.bind(this);
            this._jsDraw.DrawCircle = this._debugDrawCircle.bind(this);
            this._jsDraw.DrawSolidCircle = this._debugDrawSolidCircle.bind(this);
            this._jsDraw.DrawTransform = this._debugDrawTransform.bind(this);
            this._jsDraw.DrawPoint = this._debugDrawPoint.bind(this);
            this._jsDraw.DrawAABB = this._debugDrawAABB.bind(this);
        }
        if (this._enableDraw) {
            Physics2D.I._factory.appendFlags(this._jsDraw, flag);
        } else {
            Physics2D.I._factory.clearFlags(this._jsDraw, flag);
        }
    }

    private _debugDrawSegment(p1: any, p2: any, color: any): void {
        p1 = Physics2D.I._factory.warpPoint(p1, Ebox2DType.b2Vec2);
        p2 = Physics2D.I._factory.warpPoint(p2, Ebox2DType.b2Vec2);
        this._debugDraw.mG.drawLine(p1.x, p1.y, p2.x, p2.y, this._makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    private _debugDrawPolygon(vertices: any, vertexCount: any, color: any): void {
        let points: any[] = [];
        for (let i = 0; i < vertexCount; i++) {
            let vert = Physics2D.I._factory.warpPoint(vertices + (i * 8), Ebox2DType.b2Vec2);
            points.push(vert.x, vert.y);
        }
        this._debugDraw.mG.drawPoly(0, 0, points, null, this._makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    private _debugDrawSolidPolygon(vertices: any, vertexCount: any, color: any): void {
        let points: any[] = [];
        for (let i = 0; i < vertexCount; i++) {
            let vert = Physics2D.I._factory.warpPoint(vertices + (i * 8), Ebox2DType.b2Vec2);
            points.push(vert.x, vert.y);
        }
        this._debugDraw.mG.drawPoly(0, 0, points, this._makeStyleString(color, 0.5), this._makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    private _debugDrawCircle(center: any, radius: any, color: any): void {
        let centerV = Physics2D.I._factory.warpPoint(center, Ebox2DType.b2Vec2);
        this._debugDraw.mG.drawCircle(centerV.x, centerV.y, radius, null, this._makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    private _debugDrawSolidCircle(center: any, radius: any, axis: any, color: any): void {
        center = Physics2D.I._factory.warpPoint(center, Ebox2DType.b2Vec2);
        axis = Physics2D.I._factory.warpPoint(axis, Ebox2DType.b2Vec2);
        let cx: any = center.x;
        let cy: any = center.y;
        this._debugDraw.mG.drawCircle(cx, cy, radius, this._makeStyleString(color, 0.5), this._makeStyleString(color, 1), this._debugDraw.lineWidth);
        this._debugDraw.mG.drawLine(cx, cy, (cx + axis.x * radius), (cy + axis.y * radius), this._makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    private _debugDrawTransform(xf: any): void {
        xf = Physics2D.I._factory.warpPoint(xf, Ebox2DType.b2Transform);
        this._debugDraw.PushTransform(xf.x, xf.y, xf.angle);
        const length = 1 / Browser.pixelRatio;
        this._debugDraw.mG.drawLine(0, 0, length, 0, this._debugDraw.Red, this._debugDraw.lineWidth);
        this._debugDraw.mG.drawLine(0, 0, 0, length, this._debugDraw.Green, this._debugDraw.lineWidth);
        this._debugDraw.PopTransform();
    }

    private _debugDrawPoint(p: any, size: any, color: any): void {
        p = Physics2D.I._factory.warpPoint(p, Ebox2DType.b2Vec2);
        size *= this._debugDraw.camera.m_zoom;
        size /= this._debugDraw.camera.m_extent;
        var hsize: any = size / 2;
        this._debugDraw.mG.drawRect(p.x - hsize, p.y - hsize, size, size, this._makeStyleString(color, 1), null);
    }

    private _debugDrawAABB(min: any, max: any, color: any): void {
        min = Physics2D.I._factory.warpPoint(min, Ebox2DType.b2Vec2);
        max = Physics2D.I._factory.warpPoint(max, Ebox2DType.b2Vec2);
        var cx: number = (max.x + min.x) * 0.5;
        var cy: number = (max.y + min.y) * 0.5;
        var hw: number = (max.x - min.x) * 0.5;
        var hh: number = (max.y - min.y) * 0.5;
        const cs: string = this._makeStyleString(color, 1);
        const linew: number = this._debugDraw.lineWidth;
        this._debugDraw.mG.drawLine(cx - hw, cy - hh, cx + hw, cy - hh, cs, linew);
        this._debugDraw.mG.drawLine(cx - hw, cy + hh, cx + hw, cy + hh, cs, linew);
        this._debugDraw.mG.drawLine(cx - hw, cy - hh, cx - hw, cy + hh, cs, linew);
        this._debugDraw.mG.drawLine(cx + hw, cy - hh, cx + hw, cy + hh, cs, linew);
    }


    private _dispatchEvent(type: string, contact: any): void {
        let contactShapeA: any = Physics2D.I._factory.getContactShapeA(contact);
        let contactShapeB: any = Physics2D.I._factory.getContactShapeB(contact);
        if (contactShapeA == null || contactShapeB == null) {
            return;
        }
        let colliderA: any = contactShapeA.collider;
        let colliderB: any = contactShapeB.collider;
        if (colliderA == null || colliderB == null) {
            return;
        }
        if (colliderA.destroyed || colliderB.destroyed) {
            return;
        }
        let ownerA: any = colliderA.owner;
        let ownerB: any = colliderB.owner;
        let __this = this;
        contact.getHitInfo = function (): any {
            // TODO
            // var manifold: any = __this._tempWorldManifold;
            // this.GetWorldManifold(manifold);
            // //第一点？
            // let p: any = manifold.points;
            // p.x = __this.phyToLayaValue(p.x);
            // p.y = __this.phyToLayaValue(p.y);
            // return manifold;
        }
        if (ownerA) {
            var args: any[] = [colliderB, colliderA, contact];
            ownerA.event(type, args);
        }
        if (ownerB) {
            args = [colliderA, colliderB, contact];
            ownerB.event(type, args);
        }
    }


}

Scene.regManager(Physics2DWorldManager.__managerName, Physics2DWorldManager);