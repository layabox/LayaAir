import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { Transform3D } from "laya/d3/core/Transform3D";
import { BoundBox } from "laya/d3/math/BoundBox";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Keyboard } from "laya/events/Keyboard";
import { Tween } from "laya/utils/Tween";
import { ArcBall } from "./ArcBall";


/**
 * TODO 自己测试用。只要效果，不顾效率
 * 摄像机世界坐标的z轴的反向表示看的方向
 */
export class MouseCtrl1 extends Script3D {
    /** @private */
    protected lastMouseX: number;
    protected lastMouseY: number;
    protected isMouseDown: boolean;
    protected isRot: boolean = false;
    protected camera: Camera;
    protected isWheel: number;
    protected isMove: boolean;

    target: Vector3 = new Vector3();	// 摄像机的目标
    dist: number = 10;				// 到目标的距离
    camWorldMatrix: Matrix4x4 = new Matrix4x4(); // 计算出来的摄像机的世界矩阵。 没有平移。有也会被忽略。
    outMatrix: Matrix4x4 = new Matrix4x4();		// 最终给摄像机的矩阵。主要是加了target的影响

    arcball: ArcBall = new ArcBall();
    private isInitArcball: boolean = false;
    private quatArcBallResult: Quaternion = new Quaternion();

    private movVel: number = 0.5;				// 移动速度，用来计算vMovVel的
    private vMovVel: Vector3 = new Vector3();	// 向量移动速度。实际使用的。
    private ctrlDown: boolean = false;

    rotateEnable: boolean = true;
    moveEnable: boolean = true;
    scaleEnable: boolean = true;

    private xtween: Tween = null;
    private tween: Tween = null;

    private lastGesSize: number = 0; 	// 判断缩放用的
    private startDist: number = 0;	// 手势开始的时候的dist

    private starGes: boolean = false;	// 现在的多点触控事件，可能会落掉down事件，直接move中多了touch，所以保护一下
    private changed: boolean = true;

    private hitGroundX: number = 0;
    private hitGroundY: number = 0;
    private hitGroundZ: number = 0;
    private hitGround: boolean = false;

    hitplaneAsTarget: boolean = true;
    pressL: boolean = false;				// 为了项目做的潜规则
    pressR: boolean = false;
    enableLayout: boolean = false;
    bbxlimit: BoundBox = new BoundBox(new Vector3(-10000, 0, -10000), new Vector3(10000, 0, 10000));// 用一个bbx限制摄像机的位置
    maxDist: number = 500;
    minDist: number = 10;

    private hasGround: boolean = false;

    private mouseScaleX: number = 1;		// 现在用的clientX，需要考虑画布缩放
    private mouseScaleY: number = 1;

    private startDragMatrix: Matrix4x4 = new Matrix4x4();	// 开始旋转的时候的矩阵
    private rotyMatrix: Matrix4x4 = new Matrix4x4();			// arcball水平旋转的矩阵，因为要和x轴旋转的结合

    private lastRotY: number = 0;
    //DEBUG
    private dbg_e_updateges: boolean = true
    //DEBUG

    constructor() {
        //DEBUG
        super();
        //DEBUG
    }

    private handleSprite: Sprite;
		//每次启动后执行
		/*override*/  onEnable(): void {
        this.camera = (<Camera>this.owner);
        //注册事件
        if (!this.owner.scene)
            return;
        this.handleSprite = this.owner.scene._parent._parent;	// ???
        this.handleSprite.on(Event.MOUSE_DOWN, this, this.onMouseDownHandler);
        this.handleSprite.on(Event.MOUSE_MOVE, this, this.onMouseMoveHandler);
        this.handleSprite.on(Event.MOUSE_UP, this, this.onMouseUpHandler);
        //pc兼容 
        this.handleSprite.on(Event.RIGHT_MOUSE_DOWN, this, this.onRightMouseDownHandler);
        this.handleSprite.on(Event.RIGHT_MOUSE_UP, this, this.onRightMouseUpHandler);
        this.handleSprite.on(Event.MOUSE_WHEEL, this, this.onMouseWheelHandler);

        if (!this.isInitArcball && Laya.stage.width > 0) {
            this.arcball.init(Laya.stage.width, Laya.stage.height);
            this.isInitArcball = true;
        }

        this.mouseScaleX = Laya.stage.clientScaleX;
        this.mouseScaleY = Laya.stage.clientScaleY;
        if (Laya.stage._canvasTransform) {
            this.mouseScaleX *= Laya.stage._canvasTransform.a;
            this.mouseScaleY *= Laya.stage._canvasTransform.d;
        }
    }

		//禁用时执行
		/*override*/  onDisable(): void {
        if (!this.owner || !this.owner.scene)
            return;
        this.handleSprite.off(Event.MOUSE_MOVE, this, this.onMouseMoveHandler);
        this.handleSprite.off(Event.MOUSE_DOWN, this, this.onMouseDownHandler);
        this.handleSprite.off(Event.MOUSE_UP, this, this.onMouseUpHandler);
        //pc兼容
        this.handleSprite.off(Event.RIGHT_MOUSE_DOWN, this, this.onRightMouseDownHandler);
        this.handleSprite.off(Event.RIGHT_MOUSE_UP, this, this.onRightMouseUpHandler);
        this.handleSprite.off(Event.MOUSE_WHEEL, this, this.onMouseWheelHandler);

        this.rotateEnable = true;
        this.moveEnable = true;
        this.scaleEnable = true;
    }

    //pc兼容处理
    private onRightMouseDownHandler(e: Event): void {
        this.pressR = true;
        var pt: any = { clientX: e.stageX, clientY: e.stageY, stageX: e.stageX, stageY: e.stageY };
        this.start2ptGesture([pt, pt]);
    }

    private onRightMouseUpHandler(e: Event): void {
        this.pressR = false;
    }

    private onMouseWheelHandler(e: Event): void {
        if (e.delta > 0)
            this.dist /= 1.2;
        else
            this.dist *= 1.2;
        if (this.dist < this.minDist) this.dist = this.minDist;
        if (this.dist > this.maxDist) this.dist = this.maxDist;
        this.changed = true;
        this.updateCam();
    }

    private startRotDrag(x: number, y: number): void {
        this.lastMouseX = x;
        this.lastMouseY = y;
        this.isRot = true;
        this.lastRotY = this.cameraRotate.y;
        this.camWorldMatrix.cloneTo(this.startDragMatrix);
        if (this._isFreeStyle) {
            this.arcball.startDrag(x, y, this.camera.transform.worldMatrix);
        } else {
            // 锁定的情况下就不用arcball了
        }
    }

    //鼠标/手指按下
    private onMouseDownHandler(e: Event): void {
        this.pressL = true;
        var touches: any[] = e.touches;
        this.tween && Tween.clear(this.tween);
        this.starGes = false;
        if (touches) {
            var tnum: number = touches.length;
            if (tnum == 1) {
                // 旋转
                this.startRotDrag(touches[0].clientX / this.mouseScaleX, touches[0].clientY / this.mouseScaleY);
            } else {
                this.isRot = false;
                // 平移和缩放
                this.start2ptGesture(touches);
            }

        } else {// 如果是pc
            this.startRotDrag(e.stageX, e.stageY);
        }
    }

    //鼠标/手指抬起
    private onMouseUpHandler(e: Event): void {
        this.pressL = false;
        this.starGes = false;
        var touches: any[] = e.touches;
        this.isRot = false;
        if (touches) {
            var tnum: number = touches.length;
            if (tnum == 0) {
            } else if (tnum == 1) {
                // 如果中途抬起一个手指，算作切换旋转
                if (!this.isRot) {
                    this.startRotDrag(touches[0].clientX / this.mouseScaleX, touches[0].clientY / this.mouseScaleY);	//TODO stageX 和 screenX的区别。有时候没有stageX是为什么
                    this.isRot = true;
                }
            }

        } else {// 如果是pc
            this.isRot = false;
        }
    }

    private rotYOnMov(mx: number, my: number): void {
        if (!this.rotateEnable)
            return;
        // 这个只是为了计算出角度来
        var dx: number = this.lastMouseX - mx; // 增加表示反向旋转。 正的是从上往下顺时针
        var r: number = dx * 180 / Laya.stage.width;	// 单位是角度
        //console.log('rog=', r );
        this.cameraRotate.y = this.lastRotY + r;
        var trans: Transform3D = this.camera.transform;
        trans.localRotationEuler = this.cameraRotate;
        trans.worldMatrix.cloneTo(this.camWorldMatrix);
        this.updateCam(true);
        this.owner.event("scrollView");
    }

    //鼠标/手指移动
    private onMouseMoveHandler(e: Event): void {
        var touches: any[] = e.touches;
        if (touches) {
            var tnum: number = touches.length;
            if (tnum == 1) {
                if (this.isRot) {
                    var mx: number = touches[0].clientX / this.mouseScaleX;
                    var my: number = touches[0].clientY / this.mouseScaleY
                    // 旋转
                    if (this._isFreeStyle) {
                        this.rotDrag(mx, my);
                    } else {
                        this.rotYOnMov(mx, my);
                    }
                }
            } else if (tnum == 2) {
                if (!this.starGes) {
                    this.start2ptGesture(touches);
                }
                // 平移和缩放
                this.update2ptGesture(touches);
            }

        } else {// 如果是pc
            var mx: number = e.stageX;
            var my: number = e.stageY;
            if (this.pressL) {
                if (this._isFreeStyle) {
                    this.rotDrag(mx, my);
                } else {
                    this.rotYOnMov(mx, my);
                }
            }
            else if (this.pressR) {
                var pt: any = { clientX: mx, clientY: my, stageX: mx, stageY: my };
                this.update2ptGesture([pt, pt]);
            }
        }
    }

    frontView(): void {
        this.camWorldMatrix.identity();
        var mat: Float32Array = this.camWorldMatrix.elements;
        mat[12] = this.target.x;
        mat[13] = this.target.y;
        mat[14] = this.target.z + this.dist;
        this.camera.transform.worldMatrix = this.camWorldMatrix;
        this.owner.event("scrollView");
        this.layaout();
    }

    leftView(): void {
        this.camWorldMatrix.identity();
        var mat: Float32Array = this.camWorldMatrix.elements;
        mat[0] = 0; mat[1] = 0; mat[2] = -1;	//x 轴转到了-z上
        // y不变
        mat[8] = 1; mat[9] = 0; mat[10] = 0;	 	// z轴转到 x上
        mat[12] = this.target.x + this.dist;
        mat[13] = this.target.y;
        mat[14] = this.target.z;
        this.camera.transform.worldMatrix = this.camWorldMatrix;
        this.owner.event("scrollView");
        this.layaout();
    }

    topView(): void {
        this.camWorldMatrix.identity();
        var mat: Float32Array = this.camWorldMatrix.elements;
        mat[4] = 0; mat[5] = 0; mat[6] = -1;
        mat[8] = 0; mat[9] = 1, mat[10] = 0;
        mat[12] = this.target.x;
        mat[13] = this.target.y + this.dist;
        mat[14] = this.target.z;
        this.camera.transform.worldMatrix = this.camWorldMatrix;
        this.owner.event("scrollView");
        this.layaout();
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
        this.dist = l;
        this.changed = true;
    }

    // 更新摄像机的世界矩阵
    updateCam(force: boolean = false): void {
        if (this.changed || force) {
            this.camWorldMatrix.cloneTo(this.outMatrix);
            var camm: Float32Array = this.outMatrix.elements;
            camm[12] = this.target.x + camm[8] * this.dist;
            camm[13] = this.target.y + camm[9] * this.dist;
            camm[14] = this.target.z + camm[10] * this.dist;
            this.camera.transform.worldMatrix = this.outMatrix;
            this.changed = false;
            this.owner.event("scrollView");
            if (this.enableLayout) this.layaout();
        }
    }

		/*override*/  onKeyDown(e: Event): void {
        var mat: Float32Array = this.camera.transform.worldMatrix.elements;
        switch (e.keyCode) {
            case Keyboard.NUMPAD_1:
                this.frontView();
                break;
            case Keyboard.NUMPAD_3:
                this.leftView();
                break;
            case Keyboard.NUMPAD_7:
                this.topView();
                break;
            case Keyboard.A: {
                this.target.x += 0.1;
            }
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

		/*override*/  onKeyUp(e: Event): void {
        switch (e.keyCode) {
            case Keyboard.CONTROL:
                this.ctrlDown = false;
                break;
        }
    }

    protected rotDrag(stagex: number, stagey: number): void {
        if (this.isRot && this.rotateEnable && this.pressL) {
            var dragQuat: Quaternion = this.arcball.dragTo(stagex, stagey);	// 相对值
            //DEBUG
            //arcball.startDrag(Laya.stage.width / 2, Laya.stage.height / 2, camera.transform.worldMatrix);
            //dragQuat = arcball.dragTo(Laya.stage.width / 2+2, Laya.stage.height / 2);
            //DEBUG
            dragQuat.invert(this.quatArcBallResult);	// 取逆表示不转物体，转摄像机对象
            Matrix4x4.createFromQuaternion(this.quatArcBallResult, this.rotyMatrix);
            var cammate: Float32Array = this.camWorldMatrix.elements;
            cammate[12] = cammate[13] = cammate[14] = 0;
            Matrix4x4.multiply(this.rotyMatrix, this.startDragMatrix, this.camWorldMatrix);
            this.updateCam(true);
        }
    }

    start2ptGesture(touches: any[]): void {
        var num: number = touches.length;
        if (num < 2) return;
        this.starGes = true;

        var t0: any = touches[0];
        var t1: any = touches[1];

        this.lastMouseX = (t0.clientX + t1.clientX) / 2;
        this.lastMouseY = (t0.clientY + t1.clientY) / 2;
        var dtx: number = t0.clientX - t1.clientX;
        var dty: number = t0.clientY - t1.clientY;
        this.lastGesSize = Math.sqrt(dtx * dtx + dty * dty);

        // 开始的时候，修正一个合理的dist，避免target在空中，dist很小了以后移动很慢的问题
        var mat: Float32Array = this.camWorldMatrix.elements;
        var zx: number = mat[8];		// z轴朝向
        var zy: number = mat[9];
        var zz: number = mat[10];
        var posx: number = this.outMatrix.elements[12];	// 摄像机位置
        var posy: number = this.outMatrix.elements[13];
        var posz: number = this.outMatrix.elements[14];

        // 如果主要方向是朝向地面，就特殊处理。 这样可以避免相交到一些太远的点
        if (this.hitplaneAsTarget) {
            if ((zy > 0.1 && posy > 0) || (zy < -0.1 && posy < 0)) {	// dot(0,1,0)
                var t: number = posy / zy;	// 距离就是时间
                if (t > 0) {
                    this.hitGround = true;
                    this.hitGroundX = posx - t * zx;
                    //hitGroundY = posy - t * zy;
                    this.hitGroundZ = posz - t * zz;
                    this.dist = t;
                    this.target.x = this.hitGroundX;
                    this.target.y = 0;
                    this.target.z = this.hitGroundZ;
                    //console.log('hitpos:xz',hitGroundX,hitGroundZ, 'curdist=',dist,' t=',t,'pos=',outMatrix.elements[12], outMatrix.elements[13], outMatrix.elements[14]);
                }
            }
        }

        this.startDist = this.dist;	// 上面可能修改了，所以要放到这里。

        //DEBUG
        //updateCam(true);
        //console.log('curpos', outMatrix.elements[12], outMatrix.elements[13], outMatrix.elements[14]);
        //DEBUG
    }

    update2ptGesture(touches: any[]): void {
        //DEBUG
        //if(!dbg_e_updateges) return;
        //DEBUG

        var num: number = touches.length;
        if (num < 2) return;
        var t0: any = touches[0];
        var t1: any = touches[1];
        //console.log('t0.screenX', t0.screenX, t0.stageX);
        var curx: number = (t0.clientX + t1.clientX) / 2;
        var cury: number = (t0.clientY + t1.clientY) / 2;
        var dtx: number = t0.clientX - t1.clientX;
        var dty: number = t0.clientY - t1.clientY;

        if (this.scaleEnable && this.pressL) {
            var cursz: number = Math.sqrt(dtx * dtx + dty * dty);
            if (cursz != this.lastGesSize && cursz > 0) {
                // 如果缩放了，修改dist
                var s: number = cursz / this.lastGesSize;
                //console.log('scale=', s);
                if (s > 0 && s < 10) {
                    this.dist = this.startDist / s;	// 当放大手势的时候，希望靠近，缩小dist
                    if (this.dist < this.minDist) this.dist = this.minDist;
                    if (this.dist > this.maxDist) this.dist = this.maxDist;
                    this.changed = true;
                }
                //lastGesSize = cursz;
            }
        }

        if (this.moveEnable && (this.pressL || this.pressR)) {	//潜规则，pressL 可能被外部控制。 pressR表示pc模拟
            ///  根据摄像机半径移动
            // 要限制包围盒
            var _bbx: BoundBox = null;// ArtEditor.instance._boundBox;
            var hasbbx: boolean = false;
            if (_bbx) {
                _bbx.min.cloneTo(this.bbxlimit.min);
                _bbx.max.cloneTo(this.bbxlimit.max);
                var bbxw: number = this.bbxlimit.max.x - this.bbxlimit.min.x;
                var bbxh: number = this.bbxlimit.max.z - this.bbxlimit.min.z;
                if (bbxw < 200) bbxw = 200;
                if (bbxh < 200) bbxh = 200;
                this.bbxlimit.min.x -= bbxw / 2;
                this.bbxlimit.min.z -= bbxh / 2;
                this.bbxlimit.max.x += bbxw / 2;
                this.bbxlimit.max.z += bbxh / 2;
                hasbbx = true;
            }

            if (true) {
                // 把移动转成+-2之间的
                var mvdx: number = (curx - this.lastMouseX) / Laya.stage.width * 2;			//TODO 可能*2是不对的
                var mvdy: number = -((cury - this.lastMouseY) / Laya.stage.height * 2);
                if (mvdx != 0 || mvdy != 0) {
                    // 如果移动了, 修改target
                    this.lastMouseX = curx;
                    this.lastMouseY = cury;
                    // mvdx,mvdy对应摄像机xy空间，把他转到世界空间，并根据dist缩放
                    var mat: Float32Array = this.camWorldMatrix.elements;
                    var mx: number = (mat[0] * mvdx + mat[4] * mvdy) * this.dist;
                    var my: number = (mat[1] * mvdx + mat[5] * mvdy) * this.dist;
                    var mz: number = (mat[2] * mvdx + mat[6] * mvdy) * this.dist;
                    this.target.x -= mx;
                    this.target.y -= my;
                    this.target.z -= mz;
                    // 限制
                    if (hasbbx) {
                        if (this.target.x < this.bbxlimit.min.x) this.target.x = this.bbxlimit.min.x;
                        if (this.target.z < this.bbxlimit.min.z) this.target.z = this.bbxlimit.min.z;
                        if (this.target.x > this.bbxlimit.max.x) this.target.x = this.bbxlimit.max.x;
                        if (this.target.z > this.bbxlimit.max.z) this.target.z = this.bbxlimit.max.z;
                    }
                    this.changed = true;
                }
            } else {
                // 根据扫过的地面移动
                if (this.hitGround) {

                }
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
        this.dist = dis;
        this.target.x = pos.x;
        this.target.y = pos.y;
        this.target.z = pos.z;

        var trans: Transform3D = this.camera.transform;
        ro.cloneTo(this.cameraRotate);
        // 设置旋转
        trans.localRotationEuler = ro;
        // 获得世界矩阵，其实是为了取得z轴朝向
        trans.worldMatrix.cloneTo(this.camWorldMatrix);
        this.updateCam(true);
    }

    // 序列化参数，让别人保存
    getParams(): any[] {
        var ret: any[] = [];
        var rotm: Float32Array = this.camWorldMatrix.elements;
        ret.push(this.target.x, this.target.y, this.target.z, this.dist, rotm[0], rotm[1], rotm[2], rotm[4], rotm[5], rotm[6], rotm[8], rotm[9], rotm[10]);
        return ret;
    }

    // 恢复保存的参数
    setParams(p: any[]) {
        if (p.length < 13) return;
        this.target.x = p[0]; this.target.y = p[1]; this.target.z = p[2];
        this.dist = p[3];
        var rotm: Float32Array = this.camWorldMatrix.elements;
        rotm[0] = p[4], rotm[1] = p[5], rotm[2] = p[6],
            rotm[4] = p[7], rotm[5] = p[8], rotm[6] = p[9],
            rotm[8] = p[10], rotm[9] = p[11], rotm[10] = p[12];
        this.updateCam(true);
    }

    //惯性移动
    private tweenMoveFunction(): void {
        //console.log('rot', cameraRotate.x,cameraRotate.y);
        this.camera.transform.localRotationEuler = this.cameraRotate;
        this.camera.transform.worldMatrix.cloneTo(this.camWorldMatrix);
        this.updateCam(true);
        this.owner.event("scrollView");
    }

    tweenMoveFX(tweenX: number): void {
        if (!this.rotateEnable) return;
    }

    resetSp2(): void {
    }

    get distance(): number {
        return this.dist;
    }

    set distance(value: number) {
        this.setDist(value);
        this.updateCam();
    }

    get rotate(): Vector3 {
        return this.camera.transform.localRotationEuler
    }
    get position(): Vector3 {
        return this.camera.transform.position;
    }

    resetPosition(): void {
        if (this.tween)
            Tween.clear(this.tween);
        this.initCamera(new Vector3(0, 0, 0), new Vector3(-20, 31, 0), 50);
    }

    private _isFreeStyle: boolean = true;
    private cameraRotate: Vector3 = new Vector3();

    set isFreeStyle(v: boolean) {
        this._isFreeStyle = v;
    }

    get isFreeStyle(): boolean {
        return this._isFreeStyle;
    }

    layaout(): void {
        if (!this.enableLayout) return;
        //drawGround(bbxMin.x, bbxMin.z, bbxMax.x, bbxMax.z, 10);
        //return;
        // 相交点
        var mat: Float32Array = this.outMatrix.elements;
        var zx: number = mat[8];		// z轴朝向
        var zy: number = mat[9];
        var zz: number = mat[10];
        var posx: number = mat[12];	// 摄像机位置
        var posy: number = mat[13];
        var posz: number = mat[14];

        var t: number = posy / zy;
        // 怎么都相交把
        var hitposx: number = posx - t * zx;;
        var hitposy: number = posz - t * zz;;

        var len = Math.round(posy);
        var a: number = Math.max(1, Math.round(len / 2500));

        var size: number = 100 * a;// 5 * a;
    }

}

