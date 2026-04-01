import { NodeFlags } from "../Const";
import { Draw9GridTextureCmd } from "../display/cmd/Draw9GridTextureCmd";
import { DrawTextureCmd } from "../display/cmd/DrawTextureCmd";
import { DrawTrianglesCmd } from "../display/cmd/DrawTrianglesCmd";
import { IGraphicsCmd } from "../display/IGraphics";
import { Sprite } from "../display/Sprite";
import { Color } from "../maths/Color";
import { Texture } from "../resource/Texture";
import { IMeshFactory } from "../display/mesh/MeshFactory";

/** @ignore */
export class ImageRenderer {
    _meshFactory: IMeshFactory;
    _color: Color;
    _tex: Texture;
    _onReload: Function;

    private _owner: Sprite;
    private _drawCmd: DrawTextureCmd | Draw9GridTextureCmd | DrawTrianglesCmd;

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
        if (this._drawCmd) {
            (this._drawCmd as IGraphicsCmd).lock = false;
            this._drawCmd.recover();
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
            this._owner.graphics.repaint();
            return;
        }
        this._meshFactory = value;
        if (this._tex)
            this.createCmd();
    }

    setColor(value: string) {
        this._color.parse(value);
        if (this._drawCmd) {
            this._drawCmd.color = this._color.getABGR();
            this._owner.graphics.repaint();
        }
    }

    private onTextureReload() {
        this._onReload?.();
        this.setTexture(this._tex);
    }

    private createCmd() {
        let drawClass: typeof DrawTextureCmd | typeof Draw9GridTextureCmd | typeof DrawTrianglesCmd;
        if (this._meshFactory)
            drawClass = DrawTrianglesCmd;
        else if (this._tex._sizeGrid)
            drawClass = Draw9GridTextureCmd;
        else
            drawClass = DrawTextureCmd;
        if (this._drawCmd && this._drawCmd.cmdID === drawClass.ID) {
            let oldTexture = this._drawCmd.texture;
            if (oldTexture !== this._tex) {
                oldTexture?._removeReference();
                this._tex?._addReference();
            }
            this._drawCmd.texture = this._tex;
            if (drawClass === DrawTrianglesCmd)
                (this._drawCmd as DrawTrianglesCmd).mesh = this._meshFactory;
            else if (drawClass === Draw9GridTextureCmd)
                (this._drawCmd as Draw9GridTextureCmd).sizeGrid = this._tex._sizeGrid;
            this._owner.graphics.repaint();
            return;
        }

        let cmd: DrawTextureCmd | Draw9GridTextureCmd | DrawTrianglesCmd;
        if (this._meshFactory)
            cmd = DrawTrianglesCmd.create2(this._tex, this._meshFactory);
        else if (this._tex._sizeGrid)
            cmd = Draw9GridTextureCmd.create(this._tex, 0, 0, 1, 1, this._tex._sizeGrid, true);
        else
            cmd = DrawTextureCmd.create(this._tex, 0, 0, 1, 1, null, 1, null, null, null, true);
        (cmd as IGraphicsCmd).lock = true;
        cmd.color = this._color.getABGR();
        this._drawCmd = this._owner.graphics.replaceCmd(this._drawCmd, cmd, true);
    }
}