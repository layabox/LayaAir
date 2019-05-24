import { FrameAnimation } from "../display/FrameAnimation";
import { Graphics } from "../display/Graphics";
import { Matrix } from "../maths/Matrix";
import { Loader } from "../net/Loader";
/**
 * Graphics动画解析器
 * @private
 */
export class GraphicAnimation extends FrameAnimation {
    constructor() {
        super(...arguments);
        /**@private */
        this._nodeIDAniDic = {};
    }
    /**@private */
    _parseNodeList(uiView) {
        if (!this._nodeList)
            this._nodeList = [];
        this._nodeDefaultProps[uiView.compId] = uiView.props;
        if (uiView.compId)
            this._nodeList.push(uiView.compId);
        var childs = uiView.child;
        if (childs) {
            var i, len = childs.length;
            for (i = 0; i < len; i++) {
                this._parseNodeList(childs[i]);
            }
        }
    }
    /**@private */
    _calGraphicData(aniData) {
        this._setUp(null, aniData);
        this._createGraphicData();
        if (this._nodeIDAniDic) {
            var key;
            for (key in this._nodeIDAniDic) {
                this._nodeIDAniDic[key] = null;
            }
        }
    }
    /**@private */
    _createGraphicData() {
        var gList = [];
        var i, len = this.count;
        var animationDataNew = this._usedFrames;
        if (!animationDataNew)
            animationDataNew = [];
        var preGraphic;
        for (i = 0; i < len; i++) {
            if (animationDataNew[i] || !preGraphic) {
                preGraphic = this._createFrameGraphic(i);
            }
            gList.push(preGraphic);
        }
        this._gList = gList;
    }
    /**@private */
    _createFrameGraphic(frame) {
        var g = new Graphics();
        if (!GraphicAnimation._rootMatrix)
            GraphicAnimation._rootMatrix = new Matrix();
        this._updateNodeGraphic(this._rootNode, frame, GraphicAnimation._rootMatrix, g);
        //_updateNodeGraphic2(_rootNode, frame, g);
        return g;
    }
    _updateNodeGraphic(node, frame, parentTransfrom, g, alpha = 1) {
        var tNodeG;
        tNodeG = this._nodeGDic[node.compId] = this._getNodeGraphicData(node.compId, frame, this._nodeGDic[node.compId]);
        if (!tNodeG.resultTransform)
            tNodeG.resultTransform = new Matrix();
        var tResultTransform;
        tResultTransform = tNodeG.resultTransform;
        Matrix.mul(tNodeG.transform, parentTransfrom, tResultTransform);
        var tTex;
        var tGraphicAlpha = tNodeG.alpha * alpha;
        if (tGraphicAlpha < 0.01)
            return;
        if (tNodeG.skin) {
            tTex = this._getTextureByUrl(tNodeG.skin);
            if (tTex) {
                if (tResultTransform._checkTransform()) {
                    g.drawTexture(tTex, 0, 0, tNodeG.width, tNodeG.height, tResultTransform, tGraphicAlpha);
                    tNodeG.resultTransform = null;
                }
                else {
                    g.drawTexture(tTex, tResultTransform.tx, tResultTransform.ty, tNodeG.width, tNodeG.height, null, tGraphicAlpha);
                }
            }
        }
        var childs = node.child;
        if (!childs)
            return;
        var i, len;
        len = childs.length;
        for (i = 0; i < len; i++) {
            this._updateNodeGraphic(childs[i], frame, tResultTransform, g, tGraphicAlpha);
        }
    }
    _updateNoChilds(tNodeG, g) {
        if (!tNodeG.skin)
            return;
        var tTex = this._getTextureByUrl(tNodeG.skin);
        if (!tTex)
            return;
        var tTransform = tNodeG.transform;
        tTransform._checkTransform();
        var onlyTranslate;
        onlyTranslate = !tTransform._bTransform;
        if (!onlyTranslate) {
            g.drawTexture(tTex, 0, 0, tNodeG.width, tNodeG.height, tTransform.clone(), tNodeG.alpha);
        }
        else {
            g.drawTexture(tTex, tTransform.tx, tTransform.ty, tNodeG.width, tNodeG.height, null, tNodeG.alpha);
        }
    }
    _updateNodeGraphic2(node, frame, g) {
        var tNodeG;
        tNodeG = this._nodeGDic[node.compId] = this._getNodeGraphicData(node.compId, frame, this._nodeGDic[node.compId]);
        if (!node.child) {
            this._updateNoChilds(tNodeG, g);
            return;
        }
        var tTransform = tNodeG.transform;
        tTransform._checkTransform();
        var onlyTranslate;
        onlyTranslate = !tTransform._bTransform;
        var hasTrans;
        hasTrans = onlyTranslate && (tTransform.tx != 0 || tTransform.ty != 0);
        var ifSave;
        ifSave = (tTransform._bTransform) || tNodeG.alpha != 1;
        if (ifSave)
            g.save();
        if (tNodeG.alpha != 1)
            g.alpha(tNodeG.alpha);
        if (!onlyTranslate)
            g.transform(tTransform.clone());
        else if (hasTrans)
            g.translate(tTransform.tx, tTransform.ty);
        var childs = node.child;
        var tTex;
        if (tNodeG.skin) {
            tTex = this._getTextureByUrl(tNodeG.skin);
            if (tTex) {
                g.drawImage(tTex, 0, 0, tNodeG.width, tNodeG.height);
            }
        }
        if (childs) {
            var i, len;
            len = childs.length;
            for (i = 0; i < len; i++) {
                this._updateNodeGraphic2(childs[i], frame, g);
            }
        }
        if (ifSave) {
            g.restore();
        }
        else {
            if (!onlyTranslate) {
                g.transform(tTransform.clone().invert());
            }
            else if (hasTrans) {
                g.translate(-tTransform.tx, -tTransform.ty);
            }
        }
    }
    /**@private */
    /*override*/ _calculateKeyFrames(node) {
        super._calculateKeyFrames(node);
        this._nodeIDAniDic[node.target] = node;
    }
    /**@private */
    getNodeDataByID(nodeID) {
        return this._nodeIDAniDic[nodeID];
    }
    /**@private */
    _getParams(obj, params, frame, obj2) {
        var rst = GraphicAnimation._temParam;
        rst.length = params.length;
        var i, len = params.length;
        for (i = 0; i < len; i++) {
            rst[i] = this._getObjVar(obj, params[i][0], frame, params[i][1], obj2);
        }
        return rst;
    }
    /**@private */
    _getObjVar(obj, key, frame, noValue, obj2) {
        if (obj.hasOwnProperty(key)) {
            var vArr = obj[key];
            if (frame >= vArr.length)
                frame = vArr.length - 1;
            return obj[key][frame];
        }
        if (obj2.hasOwnProperty(key)) {
            return obj2[key];
        }
        return noValue;
    }
    _getNodeGraphicData(nodeID, frame, rst) {
        if (!rst)
            rst = new GraphicNode();
        if (!rst.transform) {
            rst.transform = new Matrix();
        }
        else {
            rst.transform.identity();
        }
        var node = this.getNodeDataByID(nodeID);
        if (!node)
            return rst;
        var frameData = node.frames;
        var params = this._getParams(frameData, GraphicAnimation._drawTextureCmd, frame, this._nodeDefaultProps[nodeID]);
        var url = params[0];
        var width, height;
        var px = params[5], py = params[6];
        var aX = params[13], aY = params[14];
        var sx = params[7], sy = params[8];
        var rotate = params[9];
        var skewX = params[11], skewY = params[12];
        width = params[3];
        height = params[4];
        if (width == 0 || height == 0)
            url = null;
        if (width == -1)
            width = 0;
        if (height == -1)
            height = 0;
        var tex;
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
            }
            else {
                console.warn("lost skin:", url, ",you may load pics first");
            }
        }
        rst.alpha = params[10];
        var m = rst.transform;
        if (aX != 0) {
            px = aX * width;
        }
        if (aY != 0) {
            py = aY * height;
        }
        if (px != 0 || py != 0) {
            m.translate(-px, -py);
        }
        var tm = null;
        if (rotate || sx !== 1 || sy !== 1 || skewX || skewY) {
            tm = GraphicAnimation._tempMt;
            tm.identity();
            tm._bTransform = true;
            var skx = (rotate - skewX) * 0.0174532922222222; //laya.CONST.PI180;
            var sky = (rotate + skewY) * 0.0174532922222222;
            var cx = Math.cos(sky);
            var ssx = Math.sin(sky);
            var cy = Math.sin(skx);
            var ssy = Math.cos(skx);
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
    /**@private */
    _getTextureByUrl(url) {
        return Loader.getRes(url);
    }
    /**@private */
    setAniData(uiView, aniName = null) {
        if (uiView.animations) {
            this._nodeDefaultProps = {};
            this._nodeGDic = {};
            if (this._nodeList)
                this._nodeList.length = 0;
            this._rootNode = uiView;
            this._parseNodeList(uiView);
            var aniDic = {};
            var anilist = [];
            var animations = uiView.animations;
            var i, len = animations.length;
            var tAniO;
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
                }
                catch (e) {
                    console.warn("parse animation fail:" + tAniO.name + ",empty animation created");
                    this._gList = [];
                }
                var frameO = {};
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
    parseByData(aniData) {
        var rootNode, aniO;
        rootNode = aniData.nodeRoot;
        aniO = aniData.aniO;
        delete aniData.nodeRoot;
        delete aniData.aniO;
        this._nodeDefaultProps = {};
        this._nodeGDic = {};
        if (this._nodeList)
            this._nodeList.length = 0;
        this._rootNode = rootNode;
        this._parseNodeList(rootNode);
        this._labels = null;
        try {
            this._calGraphicData(aniO);
        }
        catch (e) {
            console.warn("parse animation fail:" + aniO.name + ",empty animation created");
            this._gList = [];
        }
        var frameO = aniData;
        frameO.interval = 1000 / aniO["frameRate"];
        frameO.frames = this._gList;
        frameO.labels = this._labels;
        frameO.name = aniO.name;
        return frameO;
    }
    /**@private */
    setUpAniData(uiView) {
        if (uiView.animations) {
            var aniDic = {};
            var anilist = [];
            var animations = uiView.animations;
            var i, len = animations.length;
            var tAniO;
            for (i = 0; i < len; i++) {
                tAniO = animations[i];
                if (!tAniO)
                    continue;
                var frameO = {};
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
    _clear() {
        this.animationList = null;
        this.animationDic = null;
        this._gList = null;
        this._nodeGDic = null;
    }
    static parseAnimationByData(animationObject) {
        if (!GraphicAnimation._I)
            GraphicAnimation._I = new GraphicAnimation();
        var rst;
        rst = GraphicAnimation._I.parseByData(animationObject);
        GraphicAnimation._I._clear();
        return rst;
    }
    static parseAnimationData(aniData) {
        if (!GraphicAnimation._I)
            GraphicAnimation._I = new GraphicAnimation();
        GraphicAnimation._I.setUpAniData(aniData);
        var rst;
        rst = {};
        rst.animationList = GraphicAnimation._I.animationList;
        rst.animationDic = GraphicAnimation._I.animationDic;
        GraphicAnimation._I._clear();
        return rst;
    }
}
/**@private */
GraphicAnimation._drawTextureCmd = [["skin", null], ["x", 0], ["y", 0], ["width", -1], ["height", -1], ["pivotX", 0], ["pivotY", 0], ["scaleX", 1], ["scaleY", 1], ["rotation", 0], ["alpha", 1], ["skewX", 0], ["skewY", 0], ["anchorX", 0], ["anchorY", 0]];
/**@private */
GraphicAnimation._temParam = [];
GraphicAnimation._tempMt = new Matrix();
class GraphicNode {
    constructor() {
        this.alpha = 1;
    }
}
