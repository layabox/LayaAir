import { Laya } from "../../../Laya";
import { NodeFlags } from "../../Const";
import { Draw9GridTextureCmd } from "../../display/cmd/Draw9GridTextureCmd";
import { DrawTextureCmd } from "../../display/cmd/DrawTextureCmd";
import { DrawTrianglesCmd } from "../../display/cmd/DrawTrianglesCmd";
import { Sprite } from "../../display/Sprite";
import { Color } from "../../maths/Color";
import { Texture } from "../../resource/Texture";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

const defaultVertice = new Float32Array(new Array(8).fill(0));
const defaultIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

export class ImageRenderer {
    _meshFactory: IMeshFactory;
    _color: Color;
    _tex: Texture;
    _onReload: Function;

    private _owner: Sprite;
    private _drawCmd: DrawTextureCmd | Draw9GridTextureCmd | DrawTrianglesCmd;
    private _isChanged: boolean = false;

    constructor(owner: Sprite) {
        this._owner = owner;
        this._color = new Color();
    }

    destroy() {
        if (this._tex) {
            if (this._owner._getBit(NodeFlags.EDITING_NODE))
                this._tex.off("reload", this, this.onTextureReload);
            this._tex = null;
        }
    }

    setTexture(value: Texture) {
        if (this._tex && this._owner._getBit(NodeFlags.EDITING_NODE))
            this._tex.off("reload", this, this.onTextureReload);

        this._tex = value;
        if (value) {
            if (this._owner._getBit(NodeFlags.EDITING_NODE))
                value.on("reload", this, this.onTextureReload);

            this.createCmd();
        }
        else {
            if (this._drawCmd)
                this._drawCmd = this._owner.graphics.replaceCmd(this._drawCmd, null, true);
        }
    }

    setMesh(value: IMeshFactory) {
        if (this._meshFactory === value) {
            this.updateMesh();
            return;
        }
        this._meshFactory = value;
        if (value) {
            if (this._drawCmd)
                this._drawCmd = this._owner.graphics.replaceCmd(this._drawCmd, null, true);
            if (this._tex)
                this.updateMesh();
        }
        else {
            if (this._tex && !this._drawCmd)
                this.createCmd();
        }
    }

    setColor(value: string) {
        this._color.parse(value);
        if (this._drawCmd) {
            this._drawCmd.color = this._color.getABGR();
            this._owner.graphics.repaint();
        }
    }

    updateMesh(delay?: boolean): void {
        if (!this._meshFactory || !this._tex)
            return;

        if (!this._isChanged) {
            if (delay == null || delay) {
                this._isChanged = true;
                Laya.timer.callLater(this, this._updateMesh);
            }
            else
                this._updateMesh();
        }
        else if (delay === false)
            Laya.timer.runCallLater(this, this._updateMesh, true);
    }

    private onTextureReload() {
        this._onReload?.();
        this.setTexture(this._tex);
    }

    private createCmd() {
        let cmd: DrawTextureCmd | Draw9GridTextureCmd | DrawTrianglesCmd;
        if (this._meshFactory) {
            cmd = DrawTrianglesCmd.create(this._tex, 0, 0, defaultVertice, defaultVertice, defaultIndices);
            this.updateMesh();
        }
        else if (this._tex._sizeGrid)
            cmd = Draw9GridTextureCmd.create(this._tex, 0, 0, 1, 1, this._tex._sizeGrid, true, null);
        else
            cmd = DrawTextureCmd.create(this._tex, 0, 0, 1, 1, null, 1, null, null, null, true);
        cmd.lock = true;
        cmd.color = this._color.getABGR();
        this._drawCmd = this._owner.graphics.replaceCmd(this._drawCmd, cmd, true);
    }

    private _updateMesh() {
        this._isChanged = false;
        let tex = this._tex;
        if (!this._meshFactory || !tex)
            return;

        let vb = VertexStream.pool.take(tex);
        vb.contentRect.setTo(0, 0, this._owner.width, this._owner.height);

        try {
            this._meshFactory.onPopulateMesh(vb);
        } catch (e) {
            console.error(e);
        }

        let cmd = (<DrawTrianglesCmd>this._drawCmd);
        cmd.vertices = vb.getVertices();
        cmd.uvs = vb.getUVs();
        cmd.indices = vb.getIndices();
        cmd.colors = vb.getColors();
        this._owner.graphics.repaint();

        VertexStream.pool.recover(vb);
    }
}