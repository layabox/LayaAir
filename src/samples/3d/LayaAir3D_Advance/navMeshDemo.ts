import { Laya } from "Laya";
import { Script } from "laya/components/Script";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Ray } from "laya/d3/math/Ray";
import { HitResult } from "laya/d3/physics/HitResult";
import { Scene } from "laya/display/Scene";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Component } from "laya/components/Component";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Bounds } from "laya/d3/math/Bounds";
import { Color } from "laya/maths/Color";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { NavAgent } from "laya/navigation/Component/NavAgent";
import { Node } from "laya/display/Node";
import { NavMeshSurface } from "laya/navigation/Component/NavMeshSurface";


export class NavMeshDemo {
    private scene: Scene;
    private scene3D: Scene3D;
    private camera: Camera;
    private navGemo: Sprite3D;
    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            Scene.open("res/navMesh/navMeshScene.ls").then((sce: Scene) => {
                this.scene = sce;
                this.scene3D = sce.scene3D;
                this.addScript();
            });
        });
    }

    addScript(): void {
        this.camera = this.scene3D.getChildByName("Main Camera") as Camera;
        this.camera.addComponent(CameraMoveScript);
        this.camera.addComponent(CameraClick);
        this.navGemo = this.scene3D.getChildByName("Geometry") as Sprite3D;
        this.navGemo.addComponent(NavMeshScript);
    }
}


class NavMeshScript extends Script {
    camera: Camera;

    private _angents: NavAgent[]
    private _scene: Scene3D;
    private _lineSprite: PixelLineSprite3D;

    getAllComplete<T extends Component>(node: Node, outs: T[], componentType: new () => T) {
        let comp = node.getComponent(componentType);
        if (comp != null) outs.unshift(comp);
        for (var i = 0, n = node.numChildren; i < n; i++) {
            this.getAllComplete(node.getChildAt(i) as Node, outs, componentType);
        }
    }

    onStart() {
        this._angents = [];
        this.getAllComplete(this.owner.scene as Node, this._angents, NavAgent);
        this._scene = this.owner.scene as Scene3D;
        this.camera = this._scene.getChildByName("Main Camera") as Camera;
        this._lineSprite = new PixelLineSprite3D(100000);
        let suface = this.owner.getComponent(NavMeshSurface)
        this.showDebugMesh(suface);
        let click = this.camera.getComponent(CameraClick);
        if (click) {
            click.clickHandler = Handler.create(this, this.stageClickHandler, null, false)
        }
        // let link = this.owner.getComponent(Laya.NavNavMeshLink)
        // let index = suface.navMesh.navTileGrid.getTileIndexByPos(link.start.x, link.start.z);
        // console.log(link);
        // this.addMouseEvent()
    }

    private stageClickHandler(pos: Vector3) {
        console.log(pos);
        this._angents.forEach((agent) => {
            agent.destination = pos;
        })
    }

    private showDebugMesh(suface: NavMeshSurface) {
        let navMesh = suface.navMesh;
        var navSprite = this._scene.addChild(new MeshSprite3D(navMesh.buildDebugMesh()));
        let mat = new UnlitMaterial()
        mat.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
        mat.albedoColor = new Color(0, 0.75, 1, 0.3)
        navSprite.meshRenderer.material = mat;
        navSprite.transform.position = suface.bounds.getCenter();
        //@ts-ignore
        let tiles = suface._oriTiles;
        for (var j = 0, n1 = tiles.length; j < n1; j++) {
            this.drawBoundingBox(this._lineSprite, tiles.getNavData(j).bound, Color.RED);
            // this.drawTitleTriangle(this._lineSprite, titles[j], Color.YELLOW);
        }
        this.drawBoundingBox(this._lineSprite, suface.bounds, Color.GREEN);
    }
    private drawBoundingBox(lineSprite3D: PixelLineSprite3D, bound: Bounds, color: Color): void {
        let min: Vector3 = bound.min;
        let max: Vector3 = bound.max;
        let corners: Vector3[] = [];
        corners.push(min.clone())
        let p = min.clone();
        p.z = max.z;
        corners.push(p);

        p = max.clone();
        p.y = min.y;
        corners.push(p);

        p = min.clone();
        p.x = max.x;
        corners.push(p);

        //shang
        p = min.clone();
        p.y = max.y;
        corners.push(p);

        p = min.clone();
        p.z = max.z;
        p.y = max.y;
        corners.push(p);

        p = max.clone();
        corners.push(p);

        p = min.clone();
        p.x = max.x;
        p.y = max.y;
        corners.push(p);

        // bound.getCorners(corners);
        lineSprite3D.addLine(corners[0], corners[1], color, color);
        lineSprite3D.addLine(corners[1], corners[2], color, color);
        lineSprite3D.addLine(corners[2], corners[3], color, color);
        lineSprite3D.addLine(corners[3], corners[0], color, color);
        lineSprite3D.addLine(corners[4], corners[5], color, color);
        lineSprite3D.addLine(corners[5], corners[6], color, color);
        lineSprite3D.addLine(corners[6], corners[7], color, color);
        lineSprite3D.addLine(corners[7], corners[4], color, color);
        lineSprite3D.addLine(corners[0], corners[4], color, color);
        lineSprite3D.addLine(corners[1], corners[5], color, color);
        lineSprite3D.addLine(corners[2], corners[6], color, color);
        lineSprite3D.addLine(corners[3], corners[7], color, color);

    }
}




class CameraClick extends Script {
    private point: Vector2 = new Vector2();
    private _ray: Ray = new Ray(new Vector3(), new Vector3());
    private _outHitResult: HitResult = new HitResult();
    private _camera: Camera;
    private _scene: Scene3D;
    clickHandler: Handler;
    constructor() {
        super();
    }

    onAwake(): void {
        this._camera = this.owner as Camera;
        this._scene = this._camera.scene;
        Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }

    onMouseDown(event: Event): void {
        this.point.x = Laya.stage.mouseX;
        this.point.y = Laya.stage.mouseY;
        //产生射线
        this._camera.viewportPointToRay(this.point, this._ray);
        //拿到射线碰撞的物体
        this._scene.physicsSimulation.rayCast(this._ray, this._outHitResult);
        //如果碰撞到物体
        if (!this._outHitResult.succeeded) {
            //删除碰撞到的物体
            // console.log(this._outHitResult.point)
            return;
        }
        if (this.clickHandler) {
            this.clickHandler.runWith(this._outHitResult.point);
        }

    }
}


