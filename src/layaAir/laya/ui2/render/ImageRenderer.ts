import { Laya } from "../../../Laya";
import { LayaEnv } from "../../../LayaEnv";
import { HideFlags } from "../../Const";
import { Draw9GridTextureCmd } from "../../display/cmd/Draw9GridTextureCmd";
import { DrawTextureCmd } from "../../display/cmd/DrawTextureCmd";
import { FillTextureCmd } from "../../display/cmd/FillTextureCmd";
import { Mesh2DRender } from "../../display/Scene2DSpecial/Mesh2DRender";
import { Sprite } from "../../display/Sprite";
import { Color } from "../../maths/Color";
import { Vector4 } from "../../maths/Vector4";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { Mesh2D, VertexMesh2D } from "../../resource/Mesh2D";
import { Texture } from "../../resource/Texture";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

const defaultVertice = new Float32Array(new Array(36).fill(0));
const defaultIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

export class ImageRenderer {
    _meshFactory: IMeshFactory;
    _color: Color;
    _tex: Texture;
    _onReload: Function;

    private _owner: Sprite;
    private _drawCmd: DrawTextureCmd | Draw9GridTextureCmd;
    private _meshRender: Mesh2DRender;
    private _mesh: Mesh2D;
    private _isChanged: boolean = false;

    constructor(owner: Sprite) {
        this._owner = owner;
        this._color = new Color();
    }

    destroy() {
        if (this._mesh) {
            this._mesh.destroy();
            this._mesh = null;
        }
        if (this._tex) {
            if (!LayaEnv.isPlaying)
                this._tex.off("reload", this, this.onTextureReload);
            this._tex = null;
        }
    }

    setTexture(value: Texture) {
        if (this._tex && !LayaEnv.isPlaying)
            this._tex.off("reload", this, this.onTextureReload);

        this._tex = value;
        if (value) {
            if (!LayaEnv.isPlaying)
                value.on("reload", this, this.onTextureReload);

            if (this._meshFactory) {
                this._meshRender.sharedMesh = this._mesh;
                this.changeTexture();
            }
            else
                this.createCmd();
        }
        else {
            if (this._meshFactory) {
                this._meshRender.texture = null;
                this._meshRender.sharedMesh = null;
            }
            else if (this._drawCmd)
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
            if (!this._meshRender) {
                let declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV,COLOR"], false)[0];
                this._mesh = Mesh2D.createMesh2DByPrimitive([defaultVertice], [declaration],
                    defaultIndices, IndexFormat.UInt16,
                    [{ length: defaultIndices.length, start: 0 }]);
                this._mesh.lock = true;

                this._meshRender = this._owner.addComponent(Mesh2DRender);
                this._meshRender.hideFlags |= HideFlags.HideAndDontSave;
            }

            this._meshRender.sharedMesh = this._mesh;
            this._meshRender.color = this._color;

            if (this._drawCmd)
                this._drawCmd = this._owner.graphics.replaceCmd(this._drawCmd, null, true);
            if (this._tex)
                this.changeTexture();
        }
        else {
            if (this._meshRender) {
                this._meshRender.texture = null;
                this._meshRender.sharedMesh = null;
            }
            if (this._tex && !this._drawCmd)
                this.createCmd();
        }
    }

    setColor(value: string) {
        this._color.parse(value);
        if (this._meshFactory)
            this._meshRender.color = this._color;
        else if (this._drawCmd)
            this._drawCmd.color = this._color.getABGR();
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
        let cmd: any;
        if (this._tex._sizeGrid)
            cmd = Draw9GridTextureCmd.create(this._tex, 0, 0, 1, 1, this._tex._sizeGrid, true, null);
        else
            cmd = DrawTextureCmd.create(this._tex, 0, 0, 1, 1, null, 1, null, null, null, true);
        cmd.color = this._color.getABGR();
        this._drawCmd = this._owner.graphics.replaceCmd(this._drawCmd, cmd, true);
    }

    private changeTexture() {
        this._meshRender.texture = this._tex.bitmap;
        let uv = this._tex.uvrect;
        this._meshRender.textureRange = Vector4.TEMP.setValue(uv[0], uv[1], uv[0] + uv[2], uv[1] + uv[3]);
        this._meshRender.textureRangeIsClip = !(uv[0] === 0 && uv[1] === 0 && uv[2] === 1 && uv[3] === 1);
        this.updateMesh();
    }

    private _updateMesh() {
        this._isChanged = false;
        let tex = this._tex;
        if (!this._meshFactory || !tex)
            return;

        let vb = VertexStream.pool.take(tex, true);
        vb.contentRect.setTo(0, 0, this._owner.width, this._owner.height);

        try {
            this._meshFactory.onPopulateMesh(vb);
        } catch (e) {
            console.error(e);
        }

        let mesh = this._mesh;

        let c = vb.getVertices();
        let offsetX = -this._owner.pivotX;
        let offsetY = -this._owner.pivotY;
        if (offsetX != 0 || offsetY != 0) {
            for (let i = 0, n = c.length, step = vb.vertexStride; i < n; i += step) {
                c[i] += offsetX;
                c[i + 1] += offsetY;
            }
        }
        mesh._vertexBuffers[0].setDataLength(c.byteLength);
        mesh._vertexBuffers[0].setData(<ArrayBuffer>c.buffer, 0, 0, c.byteLength);

        let c2 = vb.getIndices();
        mesh._indexBuffer._setIndexDataLength(c2.byteLength);
        mesh._indexBuffer._setIndexData(c2, 0);

        mesh._setBuffers(mesh._vertexBuffers, mesh._indexBuffer);
        mesh._subMeshes[0].clearRenderParams();
        mesh._subMeshes[0].setDrawElemenParams(c2.length, 0);

        VertexStream.pool.recover(vb);

        this._meshRender.sharedMesh = mesh;
    }
}