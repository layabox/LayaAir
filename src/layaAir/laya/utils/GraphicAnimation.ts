import { FrameAnimation } from "../display/FrameAnimation"
import { Graphics } from "../display/Graphics"
import { Matrix } from "../maths/Matrix"
import { Loader } from "../net/Loader"
import { Texture } from "../resource/Texture"

/**
 * Graphics动画解析器
 * @private
 */
export class GraphicAnimation extends FrameAnimation {
    /**@private */
    animationList: any[];
    /**@private */
    animationDic: any;
    /**@private */
    protected _nodeList: any[];
    /**@private */
    protected _nodeDefaultProps: any;
    /**@private */
    protected _gList: any[];
    /**@private */
    protected _nodeIDAniDic: any = {};

    /**@private */
    protected static _drawTextureCmd: any[] = [["skin", null], ["x", 0], ["y", 0], ["width", -1], ["height", -1], ["pivotX", 0], ["pivotY", 0], ["scaleX", 1], ["scaleY", 1], ["rotation", 0], ["alpha", 1], ["skewX", 0], ["skewY", 0], ["anchorX", 0], ["anchorY", 0]];
    /**@private */
    protected static _temParam: any[] = [];
    /**@private */
    private static _I: GraphicAnimation;
    /**@private */
    private static _rootMatrix: Matrix;
    /**@private */
    private _rootNode: any;
    /**@private */
    protected _nodeGDic: any;

    /**@private */
    private _parseNodeList(uiView: any): void {
        if (!this._nodeList) this._nodeList = [];
        this._nodeDefaultProps[uiView.compId] = uiView.props;
        if (uiView.compId) this._nodeList.push(uiView.compId);
        var childs: any[] = uiView.child;
        if (childs) {
            var i: number, len: number = childs.length;
            for (i = 0; i < len; i++) {
                this._parseNodeList(childs[i]);
            }
        }
    }

    /**@private */
    private _calGraphicData(aniData: any): void {
        this._setUp(null, aniData);
        this._createGraphicData();
        if (this._nodeIDAniDic) {
            var key: string;
            for (key in this._nodeIDAniDic) {
                this._nodeIDAniDic[key] = null;
            }
        }
    }

    /**@private */
    private _createGraphicData(): void {
        var gList: any[] = [];
        var i: number, len: number = this.count;
        var animationDataNew: any[] = this._usedFrames;
        if (!animationDataNew) animationDataNew = [];
        var preGraphic: Graphics;
        for (i = 0; i < len; i++) {
            if (animationDataNew[i] || !preGraphic) {
                preGraphic = this._createFrameGraphic(i);
            }
            gList.push(preGraphic);
        }
        this._gList = gList;
    }

    /**@private */
    protected _createFrameGraphic(frame: number): any {
        var g: Graphics = new Graphics();
        if (!GraphicAnimation._rootMatrix) GraphicAnimation._rootMatrix = new Matrix();
        this._updateNodeGraphic(this._rootNode, frame, GraphicAnimation._rootMatrix, g);
        //_updateNodeGraphic2(_rootNode, frame, g);
        return g;
    }

    protected _updateNodeGraphic(node: any, frame: number, parentTransfrom: Matrix, g: Graphics, alpha: number = 1): void {
        var tNodeG: GraphicNode;
        tNodeG = this._nodeGDic[node.compId] = this._getNodeGraphicData(node.compId, frame, this._nodeGDic[node.compId]);
        if (!tNodeG.resultTransform)
            tNodeG.resultTransform = new Matrix();
        var tResultTransform: Matrix;
        tResultTransform = tNodeG.resultTransform;
        Matrix.mul(tNodeG.transform, parentTransfrom, tResultTransform);
        var tTex: Texture;
        var tGraphicAlpha: number = tNodeG.alpha * alpha;
        if (tGraphicAlpha < 0.01) return;
        if (tNodeG.skin) {
            tTex = this._getTextureByUrl(tNodeG.skin);
            if (tTex) {
                if (tResultTransform._checkTransform()) {
                    g.drawTexture(tTex, 0, 0, tNodeG.width, tNodeG.height, tResultTransform, tGraphicAlpha);
                    tNodeG.resultTransform = null;
                } else {
                    g.drawTexture(tTex, tResultTransform.tx, tResultTransform.ty, tNodeG.width, tNodeG.height, null, tGraphicAlpha);
                }
            }
        }
        var childs: any[] = node.child;
        if (!childs) return;
        var i: number, len: number;
        len = childs.length;
        for (i = 0; i < len; i++) {
            this._updateNodeGraphic(childs[i], frame, tResultTransform, g, tGraphicAlpha);
        }
    }
    /**
     * @internal
     * @param tNodeG 
     * @param g 
     */
    protected _updateNoChilds(tNodeG: GraphicNode, g: Graphics): void {
        if (!tNodeG.skin) return;
        var tTex: Texture = this._getTextureByUrl(tNodeG.skin);
        if (!tTex) return;
        var tTransform: Matrix = tNodeG.transform;
        tTransform._checkTransform();
        var onlyTranslate: boolean;
        onlyTranslate = !tTransform._bTransform;
        if (!onlyTranslate) {
            g.drawTexture(tTex, 0, 0, tNodeG.width, tNodeG.height, tTransform.clone(), tNodeG.alpha);
        } else {
            g.drawTexture(tTex, tTransform.tx, tTransform.ty, tNodeG.width, tNodeG.height, null, tNodeG.alpha);
        }
    }

    protected _updateNodeGraphic2(node: any, frame: number, g: Graphics): void {
        var tNodeG: GraphicNode;
        tNodeG = this._nodeGDic[node.compId] = this._getNodeGraphicData(node.compId, frame, this._nodeGDic[node.compId]);
        if (!node.child) {
            this._updateNoChilds(tNodeG, g);
            return;
        }
        var tTransform: Matrix = tNodeG.transform;
        tTransform._checkTransform();
        var onlyTranslate: boolean;
        onlyTranslate = !tTransform._bTransform;
        var hasTrans: boolean;
        hasTrans = onlyTranslate && (tTransform.tx != 0 || tTransform.ty != 0);
        var ifSave: boolean;
        ifSave = (tTransform._bTransform) || tNodeG.alpha != 1;
        if (ifSave) g.save();
        if (tNodeG.alpha != 1) g.alpha(tNodeG.alpha);
        if (!onlyTranslate) g.transform(tTransform.clone());
        else if (hasTrans) g.translate(tTransform.tx, tTransform.ty);

        var childs: any[] = node.child;
        var tTex: Texture;
        if (tNodeG.skin) {
            tTex = this._getTextureByUrl(tNodeG.skin);
            if (tTex) {
                g.drawImage(tTex, 0, 0, tNodeG.width, tNodeG.height);
            }
        }

        if (childs) {
            var i: number, len: number;
            len = childs.length;
            for (i = 0; i < len; i++) {
                this._updateNodeGraphic2(childs[i], frame, g);
            }
        }

        if (ifSave) {
            g.restore();
        } else {
            if (!onlyTranslate) {
                g.transform(tTransform.clone().invert());
            } else if (hasTrans) {
                g.translate(-tTransform.tx, -tTransform.ty);
            }
        }
    }

    /**
     * @private 
     * @override
    */
    protected _calculateKeyFrames(node: any): void {
        super._calculateKeyFrames(node);
        this._nodeIDAniDic[node.target] = node;
    }

    /**@private */
    protected getNodeDataByID(nodeID: number): any {
        return this._nodeIDAniDic[nodeID];
    }

    /**@private */
    protected _getParams(obj: any, params: any[], frame: number, obj2: any): any[] {
        var rst: any[] = GraphicAnimation._temParam;
        rst.length = params.length;
        var i: number, len: number = params.length;
        for (i = 0; i < len; i++) {
            rst[i] = this._getObjVar(obj, params[i][0], frame, params[i][1], obj2);
        }
        return rst;
    }

    /**@private */
    private _getObjVar(obj: any, key: string, frame: number, noValue: any, obj2: any): any {
        if (key in obj) {
            var vArr: any[] = obj[key];
            if (frame >= vArr.length) frame = vArr.length - 1;
            return obj[key][frame];
        }
        if (key in obj2) {
            return obj2[key];
        }
        return noValue;
    }
    /**
     * @internal
     * @param nodeID 
     * @param frame 
     * @param rst 
     */
    protected _getNodeGraphicData(nodeID: number, frame: number, rst: GraphicNode): GraphicNode {
        if (!rst)
            rst = new GraphicNode();
        if (!rst.transform) {
            rst.transform = new Matrix();
        } else {
            rst.transform.identity();
        }

        var node: any = this.getNodeDataByID(nodeID);
        if (!node) return rst;
        var frameData: any = node.frames;
        var params: any[] = this._getParams(frameData, GraphicAnimation._drawTextureCmd, frame, this._nodeDefaultProps[nodeID]);
        var url: string = params[0];
        var width: number, height: number;
        var px: number = params[5], py: number = params[6];
        var aX: number = params[13], aY: number = params[14];
        var sx: number = params[7], sy: number = params[8];
        var rotate: number = params[9];
        var skewX: number = params[11], skewY: number = params[12]
        width = params[3];
        height = params[4];
        if (width == 0 || height == 0) url = null;
        if (width == -1) width = 0;
        if (height == -1) height = 0;
        var tex: Texture;
        rst.skin = url;
        rst.width = width;
        rst.height = height;
        if (url) {
            tex = this._getTextureByUrl(url);
            if (tex) {
                if (!width)
                    width = tex.sourceWidth;
                if (!height)
                    height = tex.sourceHeight;
            } else {
                console.warn("lost skin:", url, ",you may load pics first");
            }
        }

        rst.alpha = params[10];

        var m: Matrix = rst.transform;
        if (aX != 0) {
            px = aX * width;
        }
        if (aY != 0) {
            py = aY * height;
        }
        if (px != 0 || py != 0) {
            m.translate(-px, -py);
        }
        var tm: Matrix = null;
        if (rotate || sx !== 1 || sy !== 1 || skewX || skewY) {
            tm = GraphicAnimation._tempMt;
            tm.identity();
            tm._bTransform = true;
            var skx: number = (rotate - skewX) * 0.0174532922222222; //laya.CONST.PI180;
            var sky: number = (rotate + skewY) * 0.0174532922222222;
            var cx: number = Math.cos(sky);
            var ssx: number = Math.sin(sky);
            var cy: number = Math.sin(skx);
            var ssy: number = Math.cos(skx);
            tm.a = sx * cx;
            tm.b = sx * ssx;
            tm.c = -sy * cy;
            tm.d = sy * ssy;
            tm.tx = tm.ty = 0;
        }
        if (tm) {
            m = Matrix.mul(m, tm, m);
        }

        m.translate(params[1], params[2]);

        return rst;
    }
    private static _tempMt: Matrix = new Matrix();

    /**@private */
    protected _getTextureByUrl(url: string): any {
        return Loader.getRes(url);
    }

    /**@private */
    setAniData(uiView: any, aniName: string = null): void {
        if (uiView.animations) {
            this._nodeDefaultProps = {};
            this._nodeGDic = {};
            if (this._nodeList) this._nodeList.length = 0;
            this._rootNode = uiView;
            this._parseNodeList(uiView);
            var aniDic: any = {};
            var anilist: any[] = [];
            var animations: any[] = uiView.animations;
            var i: number, len: number = animations.length;
            var tAniO: any;
            for (i = 0; i < len; i++) {
                tAniO = animations[i];
                this._labels = null;
                if (aniName && aniName != tAniO.name) {
                    continue;
                }
                if (!tAniO)
                    continue;
                try {
                    this._calGraphicData(tAniO);
                } catch (e) {
                    console.warn("parse animation fail:" + tAniO.name + ",empty animation created");
                    this._gList = [];
                }
                var frameO: any = {};
                frameO.interval = 1000 / tAniO["frameRate"];
                frameO.frames = this._gList;
                frameO.labels = this._labels;
                frameO.name = tAniO.name;
                anilist.push(frameO);
                aniDic[tAniO.name] = frameO;
            }
            this.animationList = anilist;
            this.animationDic = aniDic;
        }
        GraphicAnimation._temParam.length = 0;

    }

    parseByData(aniData: any): any {
        var rootNode: any, aniO: any;
        rootNode = aniData.nodeRoot;
        aniO = aniData.aniO;
        delete aniData.nodeRoot;
        delete aniData.aniO;
        this._nodeDefaultProps = {};
        this._nodeGDic = {};
        if (this._nodeList) this._nodeList.length = 0;
        this._rootNode = rootNode;
        this._parseNodeList(rootNode);
        this._labels = null;
        try {
            this._calGraphicData(aniO);
        } catch (e) {
            console.warn("parse animation fail:" + aniO.name + ",empty animation created");
            this._gList = [];
        }
        var frameO: any = aniData;
        frameO.interval = 1000 / aniO["frameRate"];
        frameO.frames = this._gList;
        frameO.labels = this._labels;
        frameO.name = aniO.name;
        return frameO;
    }

    /**@private */
    setUpAniData(uiView: any): void {
        if (uiView.animations) {
            var aniDic: any = {};
            var anilist: any[] = [];
            var animations: any[] = uiView.animations;
            var i: number, len: number = animations.length;
            var tAniO: any;
            for (i = 0; i < len; i++) {
                tAniO = animations[i];
                if (!tAniO) continue;
                var frameO: any = {};
                frameO.name = tAniO.name;
                frameO.aniO = tAniO;
                frameO.nodeRoot = uiView;
                anilist.push(frameO);
                aniDic[tAniO.name] = frameO;
            }
            this.animationList = anilist;
            this.animationDic = aniDic;
        }
    }

    /**@private */
    protected _clear(): void {
        this.animationList = null;
        this.animationDic = null;
        this._gList = null;
        this._nodeGDic = null;
    }

    static parseAnimationByData(animationObject: any): any {
        if (!GraphicAnimation._I) GraphicAnimation._I = new GraphicAnimation();
        var rst: any;
        rst = GraphicAnimation._I.parseByData(animationObject);
        GraphicAnimation._I._clear();
        return rst;
    }

    static parseAnimationData(aniData: any): any {
        if (!GraphicAnimation._I) GraphicAnimation._I = new GraphicAnimation();
        GraphicAnimation._I.setUpAniData(aniData);
        var rst: any;
        rst = {};
        rst.animationList = GraphicAnimation._I.animationList;
        rst.animationDic = GraphicAnimation._I.animationDic;
        GraphicAnimation._I._clear();
        return rst;
    }
}


/**@internal */
class GraphicNode {
    skin: string;
    transform: Matrix;
    resultTransform: Matrix;
    width: number;
    height: number;
    alpha: number = 1;
}
