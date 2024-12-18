import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { BoundBox } from "laya/d3/math/BoundBox";
import { Event } from "laya/events/Event";
import { Keyboard } from "laya/events/Keyboard";
import { ArcBall } from "./ArcBall";
import { Vector3 } from "laya/maths/Vector3";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Tween } from "laya/tween/Tween";

/**
 * 测试摄像机
 * 
 */
export class CameraController1 extends Script3D {
    protected lastMouseX: number;
    protected lastMouseY: number;
    protected isMouseDown: boolean;
    protected isRot = false;
    camera: Camera;
    protected isWheel: boolean;
    protected isMove: boolean;

    target = new Vector3();	// 摄像机的目标
    _dist = 10;				// 到目标的距离
    camWorldMatrix = new Matrix4x4(); // 计算出来的摄像机的世界矩阵。 没有平移。有也会被忽略。
    outMatrix = new Matrix4x4();		// 最终给摄像机的矩阵。主要是加了target的影响

    arcball = new ArcBall();
    private isInitArcball = false;
    private quatArcBallResult = new Quaternion();

    //private movVel: number = 0.5;				// 移动速度，用来计算vMovVel的
    //private vMovVel: Vector3 = new Vector3();	// 向量移动速度。实际使用的。
    private ctrlDown = false;

    private tween: Tween;

    private lastGesSize: number = 0; 	// 判断缩放用的
    private startDist: number = 0;	// 手势开始的时候的dist

    private changed: boolean = true;

    hitplaneAsTarget = true;
    pressL = false;				// 为了项目做的潜规则
    pressR = false;
    bbxlimit = new BoundBox(new Vector3(-10000, 0, -10000), new Vector3(10000, 0, 10000));// 用一个bbx限制摄像机的位置
    maxDist: number = 1500;
    minDist: number = 0.1;

    private mouseScaleX: number = 1;		// 现在用的clientX，需要考虑画布缩放
    private mouseScaleY: number = 1;

    private startDragMatrix = new Matrix4x4();	// 开始旋转的时候的矩阵
    private rotyMatrix = new Matrix4x4();			// arcball水平旋转的矩阵，因为要和x轴旋转的结合


    constructor() {
        super();
    }

    onEnable() {
        this.camera = (<Camera>this.owner);
        //注册事件
        if (!this.owner.scene)
            return;
        let handleSprite = Laya.stage;
        handleSprite.on(Event.MOUSE_DOWN, this, this.onMouseDownHandler);
        handleSprite.on(Event.MOUSE_MOVE, this, this.onMouseMoveHandler);
        handleSprite.on(Event.MOUSE_UP, this, this.onMouseUpHandler);
        //pc兼容 
        handleSprite.on(Event.RIGHT_MOUSE_DOWN, this, this.onRightMouseDownHandler);
        handleSprite.on(Event.RIGHT_MOUSE_UP, this, this.onRightMouseUpHandler);
        handleSprite.on(Event.MOUSE_WHEEL, this, this.onMouseWheelHandler);

        handleSprite.on(Event.KEY_DOWN, this, this.onKeyDown);
        handleSprite.on(Event.KEY_UP, this, this.onKeyUp);

        if (!this.isInitArcball && Laya.stage.width > 0) {
            this.arcball.init(Laya.stage.width, Laya.stage.height);
            this.isInitArcball = true;
        }

        this.mouseScaleX = Laya.stage.clientScaleX;
        this.mouseScaleY = Laya.stage.clientScaleY;
        if (Laya.stage._canvasTransform) {
            this.mouseScaleX *= Laya.stage._canvasTransform.a;
            this.mouseScaleY *= Laya.stage._canvasTransform.d;
            console.log('canvas scale', this.mouseScaleX, this.mouseScaleY);
        }

    }

    onAwake() {

    }

    onUpdate() {

    }

    onDestroy() {

    }


    //禁用时执行
    onDisable(): void {
        if (!this.owner || !this.owner.scene)
            return;
        let handleSprite = Laya.stage;
        handleSprite.off(Event.MOUSE_MOVE, this, this.onMouseMoveHandler);
        handleSprite.off(Event.MOUSE_DOWN, this, this.onMouseDownHandler);
        handleSprite.off(Event.MOUSE_UP, this, this.onMouseUpHandler);
        //pc兼容
        handleSprite.off(Event.RIGHT_MOUSE_DOWN, this, this.onRightMouseDownHandler);
        handleSprite.off(Event.RIGHT_MOUSE_UP, this, this.onRightMouseUpHandler);
        handleSprite.off(Event.MOUSE_WHEEL, this, this.onMouseWheelHandler);

        handleSprite.off(Event.KEY_DOWN, this, this.onKeyDown);
        handleSprite.off(Event.KEY_UP, this, this.onKeyUp);

    }

    //pc兼容处理
    private onRightMouseDownHandler(e: Event): void {
        this.pressR = true;
        var pt = { clientX: e.stageX, clientY: e.stageY, stageX: e.stageX, stageY: e.stageY };
        this.start2ptGesture([pt, pt]);
    }

    private onRightMouseUpHandler(e: Event): void {
        this.pressR = false;
    }

    private onMouseWheelHandler(e: Event): void {
        if (e.delta > 0) {
            this._dist *= 1.2;
            this.camera.orthographicVerticalSize *= 1.2;
        }
        else {
            this._dist /= 1.2;
            this.camera.orthographicVerticalSize /= 1.2;
        }
        if (this._dist < this.minDist) this._dist = this.minDist;
        if (this._dist > this.maxDist) this._dist = this.maxDist;
        this.changed = true;
        this.updateCam();
    }

    private startRotDrag(x: number, y: number): void {
        this.lastMouseX = x;
        this.lastMouseY = y;
        this.isRot = true;
        this.camWorldMatrix.cloneTo(this.startDragMatrix);
        this.arcball.startDrag(x, y, this.camera.transform.worldMatrix);
    }

    //鼠标/手指按下
    private onMouseDownHandler(e: Event): void {
        this.pressL = true;
        this.tween && Tween.clear(this.tween);
        this.startRotDrag(e.stageX, e.stageY);
    }

    //鼠标/手指抬起
    private onMouseUpHandler(e: Event): void {
        this.pressL = false;
        this.isRot = false;
        this.isRot = false;
    }

    //鼠标/手指移动
    private onMouseMoveHandler(e: Event): void {
        var mx = e.stageX;
        var my = e.stageY;
        if (this.pressL) {
            this.rotDrag(mx, my);
        }
        else if (this.pressR) {
            var pt = { clientX: mx, clientY: my, stageX: mx, stageY: my };
            this.update2ptGesture([pt, pt]);
        }
    }

    frontView(): void {
        this.camWorldMatrix.identity();
        var mat = this.camWorldMatrix.elements;
        mat[12] = this.target.x;
        mat[13] = this.target.y;
        mat[14] = this.target.z + this._dist;
        this.camera.transform.worldMatrix = this.camWorldMatrix;
        this.owner.event("scrollView");
    }

    leftView(): void {
        this.camWorldMatrix.identity();
        var mat = this.camWorldMatrix.elements;
        mat[0] = 0; mat[1] = 0; mat[2] = -1;	//x 轴转到了-z上
        // y不变
        mat[8] = 1; mat[9] = 0; mat[10] = 0;	 	// z轴转到 x上
        mat[12] = this.target.x + this._dist;
        mat[13] = this.target.y;
        mat[14] = this.target.z;
        this.camera.transform.worldMatrix = this.camWorldMatrix;
        this.owner.event("scrollView");
    }

    toggleOrth() {
        if (this.camera.orthographic) {
            this.camera.orthographic = false;
        } else {
            this.camera.orthographic = true;
            //this.camera.orthographicVerticalSize=30;        
        }
    }

    topView(): void {
        this.camWorldMatrix.identity();
        var mat = this.camWorldMatrix.elements;
        mat[4] = 0; mat[5] = 0; mat[6] = -1;
        mat[8] = 0; mat[9] = 1, mat[10] = 0;
        mat[12] = this.target.x;
        mat[13] = this.target.y + this._dist;
        mat[14] = this.target.z;
        this.camera.transform.worldMatrix = this.camWorldMatrix;
        this.owner.event("scrollView");
    }

    /**
     * 看向这个目标，但是不改变距离
     * @param	px
     * @param	py
     * @param	pz
     */
    setTarget(px: number, py: number, pz: number): void {
        this.target.x = px;
        this.target.y = py;
        this.target.z = pz;
        this.changed = true;
    }

    setDist(l: number): void {
        this._dist = l;
        this.changed = true;
        this.updateCam();
    }

    set dist(l: number) {
        this.setDist(l);
    }

    get dist(): number {
        return this._dist;
    }

    // 更新摄像机的世界矩阵
    updateCam(force = false): void {
        if (this.changed || force) {
            let dist = this._dist;
            let target = this.target;
            let outMatrix = this.outMatrix;
            this.camWorldMatrix.cloneTo(outMatrix);
            var camm = outMatrix.elements;
            camm[12] = target.x + camm[8] * dist;
            camm[13] = target.y + camm[9] * dist;
            camm[14] = target.z + camm[10] * dist;
            this.camera.transform.worldMatrix = outMatrix;
            this.changed = false;
            this.owner.event("scrollView");
        }
    }

    onKeyDown(e: Event): void {
        switch (e.keyCode) {
            case Keyboard.NUMPAD_1:
                this.frontView();
                break;
            case Keyboard.NUMPAD_3:
                this.leftView();
                break;
            case Keyboard.NUMPAD_5:
                this.toggleOrth();
                break;
            case Keyboard.NUMPAD_7:
                this.topView();
                break;
            case Keyboard.A:
                this.target.x += 0.1;
                break;
            case Keyboard.S:
                break;
            case Keyboard.D: {
                this.target.x -= 0.1;
            }
                break;
            case Keyboard.W:
                break;

            case Keyboard.CONTROL:
                this.ctrlDown = true;
                break;
            default:
                break;
        }
    }

    onKeyUp(e: Event): void {
        switch (e.keyCode) {
            case Keyboard.CONTROL:
                this.ctrlDown = false;
                break;
        }
    }

    protected rotDrag(stagex: number, stagey: number): void {
        if (this.ctrlDown) {

        }
        if (this.isRot) {
            var dragQuat = this.arcball.dragTo(stagex, stagey);	// 相对值
            dragQuat.invert(this.quatArcBallResult);	// 取逆表示不转物体，转摄像机对象
            Matrix4x4.createFromQuaternion(this.quatArcBallResult, this.rotyMatrix);
            var cammate = this.camWorldMatrix.elements;
            cammate[12] = cammate[13] = cammate[14] = 0;
            Matrix4x4.multiply(this.rotyMatrix, this.startDragMatrix, this.camWorldMatrix);
            this.updateCam(true);
        }
    }

    start2ptGesture(touches: any[]): void {
        var num = touches.length;
        if (num < 2) return;

        var t0 = touches[0];
        var t1 = touches[1];

        this.lastMouseX = (t0.clientX + t1.clientX) / 2;
        this.lastMouseY = (t0.clientY + t1.clientY) / 2;
        var dtx = t0.clientX - t1.clientX;
        var dty = t0.clientY - t1.clientY;
        this.lastGesSize = Math.sqrt(dtx * dtx + dty * dty);

        // 开始的时候，修正一个合理的dist，避免target在空中，dist很小了以后移动很慢的问题
        var mat = this.camWorldMatrix.elements;
        var zx = mat[8];		// z轴朝向
        var zy = mat[9];
        var zz = mat[10];
        var posx = this.outMatrix.elements[12];	// 摄像机位置
        var posy = this.outMatrix.elements[13];
        var posz = this.outMatrix.elements[14];

        // 如果主要方向是朝向地面，就特殊处理。 这样可以避免相交到一些太远的点
        if (this.hitplaneAsTarget) {
            /*
            if ((zy > 0.1 && posy > 0) || (zy < -0.1 && posy < 0)) {	// dot(0,1,0)
                var t = posy / zy;	// 距离就是时间
                if (t > 0) {
                    //this.hitGround = true;
                    this.hitGroundX = posx - t * zx;
                    this.hitGroundZ = posz - t * zz;
                    this._dist = t;
                    this.target.x = this.hitGroundX;
                    this.target.y = 0;
                    this.target.z = this.hitGroundZ;
                }
            }
            */
        }
        this.startDist = this._dist;	// 上面可能修改了，所以要放到这里。
    }

    update2ptGesture(touches: any[]): void {
        var num = touches.length;
        if (num < 2) return;
        var t0 = touches[0];
        var t1 = touches[1];
        var curx = (t0.clientX + t1.clientX) / 2;
        var cury = (t0.clientY + t1.clientY) / 2;
        var dtx = t0.clientX - t1.clientX;
        var dty = t0.clientY - t1.clientY;

        if (this.pressL) {
            var cursz = Math.sqrt(dtx * dtx + dty * dty);
            if (cursz != this.lastGesSize && cursz > 0) {
                // 如果缩放了，修改dist
                var s = cursz / this.lastGesSize;
                //console.log('scale=', s);
                if (s > 0 && s < 10) {
                    this._dist = this.startDist / s;	// 当放大手势的时候，希望靠近，缩小dist
                    if (this._dist < this.minDist) this._dist = this.minDist;
                    if (this._dist > this.maxDist) this._dist = this.maxDist;
                    this.changed = true;
                }
                //lastGesSize = cursz;
            }
        }

        // 平移
        if (this.pressR) {
            ///  根据摄像机半径移动
            // 把移动转成+-2之间的
            var mvdx = (curx - this.lastMouseX) / Laya.stage.width * 2;			//TODO 可能*2是不对的
            var mvdy = -((cury - this.lastMouseY) / Laya.stage.height * 2);
            if (mvdx != 0 || mvdy != 0) {
                // 如果移动了, 修改target
                this.lastMouseX = curx;
                this.lastMouseY = cury;
                // mvdx,mvdy对应摄像机xy空间，把他转到世界空间，并根据dist缩放
                var mat = this.camWorldMatrix.elements;
                var mx = (mat[0] * mvdx + mat[4] * mvdy) * this._dist;
                var my = (mat[1] * mvdx + mat[5] * mvdy) * this._dist;
                var mz = (mat[2] * mvdx + mat[6] * mvdy) * this._dist;
                this.target.x -= mx;
                this.target.y -= my;
                this.target.z -= mz;
                this.changed = true;
            }
        }
        this.updateCam(false);
    }

    /**
     * 根据位置朝向，距离设置参数
     * @param	pos		相机的目标点
     * @param	ro		相机本身的旋转
     * @param	dis		到目标点的距离
     */
    initCamera(pos: Vector3, ro: Vector3, dis: number = 4): void {
        this._dist = dis;
        this.target.x = pos.x;
        this.target.y = pos.y;
        this.target.z = pos.z;

        var trans = this.camera.transform;
        // 设置旋转
        trans.localRotationEuler = ro;
        // 获得世界矩阵，其实是为了取得z轴朝向
        trans.worldMatrix.cloneTo(this.camWorldMatrix);
        this.updateCam(true);
    }

    get distance(): number {
        return this._dist;
    }

    set distance(value: number) {
        this.setDist(value);
        this.updateCam();
    }

    resetPosition(): void {
        if (this.tween)
            Tween.clear(this.tween);
        this.initCamera(new Vector3(0, 0, 0), new Vector3(-20, 31, 0), 50);
    }

    public static calByIcoXYZ(targetVec: Vector3, currentPosition: Vector3, radius: number, currentRotate: Vector3, camera: BaseCamera) {
    }

}