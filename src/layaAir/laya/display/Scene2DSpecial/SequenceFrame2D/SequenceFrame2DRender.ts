import { ILaya } from "../../../../ILaya";
import { LayaEnv } from "../../../../LayaEnv";
import { Event } from "../../../events/Event";
import { Sprite } from "../../Sprite";
import { BaseRender2DType } from "../../SpriteConst";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Texture } from "../../../resource/Texture";
import { Texture2D } from "../../../resource/Texture2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Render2DProcessor } from "../../Render2DProcessor";
import { SequenceFrame2DShader } from "./SequenceFrame2DShader";

type SequenceFrame2DElement = IRenderElement2D & {
    _sequenceFrame2DRender?: SequenceFrame2DRender;
};

export class SequenceFrame2DRender extends BaseRenderNode2D {
    static defaultMaterial: Material;

    /**
     * Instance data lives in class-level expandable buffers. Enabled components
     * own one instance ID, and their local runtime/config arrays are views into
     * the matching slice. Batch assembly can then copy large contiguous ranges
     * instead of gathering many tiny per-renderer arrays.
     */
    private static _instanceCapacity: number = 0;
    private static _nextInstanceID: number = 0;
    private static _freeInstanceIDs: number[] = [];
    private static _activeRenderers: (SequenceFrame2DRender | null)[] = [];
    private static _runtimeDataBuffer: Float32Array = new Float32Array(0);
    private static _configDataBuffer: Float32Array = new Float32Array(0);

    static __init__(): void {
        if (SequenceFrame2DRender.defaultMaterial)
            return;

        SequenceFrame2DShader.__init__();

        const mat = SequenceFrame2DRender.defaultMaterial = new Material();
        mat.lock = true;
        mat.setShaderName("SequenceFrame2D");
        mat.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
        mat.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        mat.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        mat.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        mat.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        mat.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        mat.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
    }

    private static _allocateInstanceID(renderer: SequenceFrame2DRender): number {
        const id = SequenceFrame2DRender._freeInstanceIDs.length > 0
            ? SequenceFrame2DRender._freeInstanceIDs.pop()!
            : SequenceFrame2DRender._nextInstanceID++;

        SequenceFrame2DRender._ensureInstanceCapacity(id + 1);
        SequenceFrame2DRender._activeRenderers[id] = renderer;
        return id;
    }

    private static _releaseInstanceID(id: number): void {
        if (id < 0)
            return;
        SequenceFrame2DRender._activeRenderers[id] = null;
        SequenceFrame2DRender._freeInstanceIDs.push(id);
    }

    private static _ensureInstanceCapacity(requiredCount: number): void {
        if (requiredCount <= SequenceFrame2DRender._instanceCapacity)
            return;

        let newCapacity = SequenceFrame2DRender._instanceCapacity || 256;
        while (newCapacity < requiredCount)
            newCapacity <<= 1;

        const runtimeBuffer = new Float32Array(newCapacity * SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE);
        const configBuffer = new Float32Array(newCapacity * SequenceFrame2DShader.CONFIG_FLOAT_STRIDE);
        runtimeBuffer.set(SequenceFrame2DRender._runtimeDataBuffer);
        configBuffer.set(SequenceFrame2DRender._configDataBuffer);
        SequenceFrame2DRender._runtimeDataBuffer = runtimeBuffer;
        SequenceFrame2DRender._configDataBuffer = configBuffer;
        SequenceFrame2DRender._instanceCapacity = newCapacity;

        // Growing replaces the ArrayBuffer, so every active subarray view must
        // be rebound to keep future property writes hitting the shared storage.
        const renderers = SequenceFrame2DRender._activeRenderers;
        for (let i = 0, n = renderers.length; i < n; i++)
            renderers[i]?._bindInstanceDataViews();
    }

    declare readonly owner: Sprite;

    private _cycles: number = 1;
    private _tiles: Vector2 = new Vector2(1, 1);
    private _startFrame: number = 0;
    private _lifeTime: number = 1;
    private _playOnAwake: boolean = true;
    private _loop: boolean = false;
    private _autoDestroyAtComplete: boolean = false;
    private _unitPixels: number = 50;
    private _color: Color = new Color(1, 1, 1, 1);
    private _texture: BaseTexture | Texture;
    private _baseRender2DTexture: BaseTexture;
    private _textureUVRect: Vector4 = new Vector4(0, 0, 1, 1);

    private _elapsedTime: number = 0;
    private _startTime: number = 0;
    private _playing: boolean = false;
    private _paused: boolean = false;
    private _needRuntimeUpload: boolean = true;
    private _needConfigUpload: boolean = true;
    private _configVersion: number = 0;
    private _instanceID: number = -1;
    private _lastMatrix: Float32Array = new Float32Array([NaN, NaN, NaN, NaN, NaN, NaN]);
    private _lastAlpha: number = NaN;

    private _renderGeometry: IRenderGeometryElement;
    private _runtimeVertexBuffer: IVertexBuffer;
    private _configVertexBuffer: IVertexBuffer;
    private _runtimeBufferData: Float32Array;
    private _configBufferData: Float32Array;
    private _activeInstanceCount: number = 0;

    get cycles(): number {
        return this._cycles;
    }

    set cycles(value: number) {
        value = Math.max(0, value || 0);
        if (this._cycles === value)
            return;
        this._cycles = value;
        this._markConfigDirty();
    }

    get tiles(): Vector2 {
        return this._tiles;
    }

    set tiles(value: Vector2) {
        const x = value ? Math.max(1, Math.floor(value.x || 1)) : 1;
        const y = value ? Math.max(1, Math.floor(value.y || 1)) : 1;
        if (this._tiles.x === x && this._tiles.y === y)
            return;
        this._tiles.setValue(x, y);
        this._markConfigDirty(true);
    }

    get startFrame(): number {
        return this._startFrame;
    }

    set startFrame(value: number) {
        value = Math.max(0, Math.floor(value || 0));
        if (this._startFrame === value)
            return;
        this._startFrame = value;
        this._markConfigDirty();
    }

    get lifeTime(): number {
        return this._lifeTime;
    }

    set lifeTime(value: number) {
        value = Math.max(0.0001, value || 0.0001);
        if (this._lifeTime === value)
            return;
        this._lifeTime = value;
        this._elapsedTime = Math.min(this._getPlaybackAge(), value);
        this._startTime = this._getCurrentTime() - this._elapsedTime;
        this._needRuntimeUpload = true;
        this._markConfigDirty();
    }

    get playOnAwake(): boolean {
        return this._playOnAwake;
    }

    set playOnAwake(value: boolean) {
        this._playOnAwake = !!value;
    }

    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = !!value;
        this._needRuntimeUpload = true;
        this._notifyDataChange();
    }

    get autoDestroyAtComplete(): boolean {
        return this._autoDestroyAtComplete;
    }

    set autoDestroyAtComplete(value: boolean) {
        this._autoDestroyAtComplete = !!value;
    }

    get unitPixels(): number {
        return this._unitPixels;
    }

    set unitPixels(value: number) {
        value = Math.max(0.0001, value || 0.0001);
        if (this._unitPixels === value)
            return;
        this._unitPixels = value;
        this._markConfigDirty(true);
    }

    get color(): Color {
        return this._color;
    }

    set color(value: Color) {
        (value || Color.WHITE).cloneTo(this._color);
        this._needRuntimeUpload = true;
        this._markConfigDirty();
    }

    get texture(): BaseTexture | Texture {
        return this._texture;
    }

    set texture(value: BaseTexture | Texture) {
        if (this._texture instanceof Texture)
            this._texture._removeReference();

        this._texture = value;
        if (value instanceof Texture) {
            value._addReference();
            this._baseRender2DTexture = value.bitmap || Texture2D.whiteTexture;
            this._textureUVRect.setValue(value.uvrect[0], value.uvrect[1], value.uvrect[2], value.uvrect[3]);
        } else {
            this._baseRender2DTexture = value || Texture2D.whiteTexture;
            this._textureUVRect.setValue(0, 0, 1, 1);
        }

        this._applyTextureToShaderData(this._baseRender2DTexture);
        this._markConfigDirty(true);
    }

    get isPlaying(): boolean {
        return this._playing;
    }

    get sharedMaterial(): Material {
        return this._materials[0];
    }

    set sharedMaterial(value: Material) {
        if (value && !this._isMaterialVaild(value))
            return;

        const lastValue = this._materials[0];
        if (lastValue === value)
            return;

        const element = this._renderElements[0];
        if (element)
            BaseRenderNode2D._removeRenderElement2DMaterial(element, this._getElementMaterial(0));

        this._materials[0] = value;
        lastValue && lastValue._removeReference();
        value && value._addReference();

        if (element)
            BaseRenderNode2D._setRenderElement2DMaterial(element, this._getElementMaterial(0));
        this._notifyDataChange();
    }

    /** @internal */
    get activeInstanceCount(): number {
        return this._activeInstanceCount;
    }

    /** @internal */
    get instanceID(): number {
        return this._instanceID;
    }

    /** @internal */
    get runtimeBufferData(): Float32Array {
        return this._runtimeBufferData;
    }

    /** @internal */
    get configBufferData(): Float32Array {
        return this._configBufferData;
    }

    /** @internal */
    get configVersion(): number {
        return this._configVersion;
    }

    /** @internal */
    _copyRuntimeDataRange(target: Float32Array, targetOffset: number, startID: number, count: number): void {
        const stride = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE;
        const start = startID * stride;
        target.set(SequenceFrame2DRender._runtimeDataBuffer.subarray(start, start + count * stride), targetOffset);
    }

    /** @internal */
    _copyConfigDataRange(target: Float32Array, targetOffset: number, startID: number, count: number): void {
        const stride = SequenceFrame2DShader.CONFIG_FLOAT_STRIDE;
        const start = startID * stride;
        target.set(SequenceFrame2DRender._configDataBuffer.subarray(start, start + count * stride), targetOffset);
    }

    /** @internal */
    _uploadRuntimeDataRange(vertexBuffer: IVertexBuffer, startID: number, count: number): void {
        const stride = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE * 4;
        vertexBuffer.setData(SequenceFrame2DRender._runtimeDataBuffer.buffer, 0, startID * stride, count * stride);
    }

    /** @internal */
    _uploadConfigDataRange(vertexBuffer: IVertexBuffer, startID: number, count: number): void {
        const stride = SequenceFrame2DShader.CONFIG_FLOAT_STRIDE * 4;
        vertexBuffer.setData(SequenceFrame2DRender._configDataBuffer.buffer, 0, startID * stride, count * stride);
    }

    private _ensureInstanceID(): void {
        if (this._instanceID >= 0)
            return;

        // Enable-time allocation: the component's runtime/config views map
        // directly into the class-level buffers at instanceID * stride.
        this._instanceID = SequenceFrame2DRender._allocateInstanceID(this);
        this._bindInstanceDataViews();
        this._needRuntimeUpload = true;
        this._needConfigUpload = true;

        if (this._renderGeometry)
            this._renderGeometry.instanceCount = this._activeInstanceCount;
    }

    private _releaseInstanceID(): void {
        if (this._instanceID < 0)
            return;

        SequenceFrame2DRender._releaseInstanceID(this._instanceID);
        this._instanceID = -1;
        this._activeInstanceCount = 0;
        this._runtimeBufferData = null;
        this._configBufferData = null;
        this._lastMatrix.fill(NaN);
        this._lastAlpha = NaN;

        if (this._renderGeometry)
            this._renderGeometry.instanceCount = 0;
    }

    private _bindInstanceDataViews(): void {
        if (this._instanceID < 0)
            return;

        // These views do not own storage. They are just the renderer's slot
        // inside the shared SOA buffers, so writes are already batch-ready.
        const runtimeStride = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE;
        const configStride = SequenceFrame2DShader.CONFIG_FLOAT_STRIDE;
        const runtimeOffset = this._instanceID * runtimeStride;
        const configOffset = this._instanceID * configStride;
        this._runtimeBufferData = SequenceFrame2DRender._runtimeDataBuffer.subarray(runtimeOffset, runtimeOffset + runtimeStride);
        this._configBufferData = SequenceFrame2DRender._configDataBuffer.subarray(configOffset, configOffset + configStride);
    }

    private _setInstanceActive(active: boolean): void {
        const count = active && this._instanceID >= 0 ? 1 : 0;
        if (this._activeInstanceCount === count) {
            if (this._renderGeometry)
                this._renderGeometry.instanceCount = count;
            return;
        }

        this._activeInstanceCount = count;
        if (this._renderGeometry)
            this._renderGeometry.instanceCount = count;
    }

    constructor() {
        super();
        this._renderType = BaseRender2DType.sequenceFrame2D;
        this._renderElements = [];
        this._materials = [];
    }

    protected _getElementMaterial(index: number): Material {
        return this._materials[index] || SequenceFrame2DRender.defaultMaterial;
    }

    protected _isMaterialVaild(value: Material): boolean {
        return value.checkType(ShaderFeatureType.Default);
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D"];
    }

    protected _initDefaultRenderData(): void {
        SequenceFrame2DRender.__init__();
        this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        this._initRender();
        this.texture = this._texture || Texture2D.whiteTexture;
        this._needConfigUpload = true;
        this._needRuntimeUpload = true;
    }

    play(restart: boolean = true): void {
        if (this._renderGeometry && this.enabled && this.owner?.activeInHierarchy)
            this._ensureInstanceID();

        const now = this._getCurrentTime();
        this._elapsedTime = restart ? 0 : this._getPlaybackAge(now);
        this._startTime = now - this._elapsedTime;
        this._playing = true;
        this._paused = false;
        this._setInstanceActive(true);
        this._markRuntimeDirty();
    }

    pause(): void {
        if (this._playing && !this._paused) {
            this._elapsedTime = this._getPlaybackAge();
            this._paused = true;
            this._markRuntimeDirty();
            return;
        }
        this._paused = true;
    }

    resume(): void {
        if (!this._playing || !this._paused)
            return;
        this._startTime = this._getCurrentTime() - this._elapsedTime;
        this._paused = false;
        this._markRuntimeDirty();
    }

    stop(resetFrame: boolean = true): void {
        const holdAge = this._getPlaybackAge();
        this._playing = false;
        this._paused = false;
        this._elapsedTime = resetFrame ? 0 : holdAge;
        this._startTime = this._getCurrentTime() - this._elapsedTime;
        this._setInstanceActive(false);
        this._markRuntimeDirty();
    }

    renderUpdate(_context: IRenderContext2D): void {
        if (!this._renderGeometry)
            return;

        const now = this._getCurrentTime();
        if (this._playing && !this._paused && !this._loop && now - this._startTime >= this._lifeTime)
            this._completePlayback();

        if (this._needConfigUpload) {
            this._needConfigUpload = false;
            this._updateConfigData();
        }

        if (this._activeInstanceCount > 0 && (this._needRuntimeUpload || this.boundsChange || this._isRuntimeStateDirty())) {
            this._needRuntimeUpload = false;
            this._updateRuntimeData();
        } else if (this._activeInstanceCount <= 0) {
            this._needRuntimeUpload = false;
            this.boundsChange = false;
        }

        this._updateLight();
    }

    onEnable(): void {
        this._ensureInstanceID();
        if (LayaEnv.isPlaying && this._playOnAwake)
            this.play(true);
        else
            this._markRuntimeDirty();
    }

    onDisable(): void {
        this.stop(true);
        this._releaseInstanceID();
    }

    onDestroy(): void {
        this._releaseInstanceID();
        if (this._texture instanceof Texture)
            this._texture._removeReference();
        this._runtimeVertexBuffer?.destroy();
        this._configVertexBuffer?.destroy();
        this._renderGeometry?.bufferState?.destroy();
        this._renderGeometry?.destroy();
        this._runtimeVertexBuffer = null;
        this._configVertexBuffer = null;
        this._renderGeometry = null;
        this._runtimeBufferData = null;
        this._configBufferData = null;
        this._texture = null;
        this._baseRender2DTexture = null;
    }

    _cloneTo(dest: SequenceFrame2DRender): void {
        super._cloneTo(dest);
        dest.cycles = this._cycles;
        dest.tiles = this._tiles;
        dest.startFrame = this._startFrame;
        dest.lifeTime = this._lifeTime;
        dest.playOnAwake = this._playOnAwake;
        dest.loop = this._loop;
        dest.autoDestroyAtComplete = this._autoDestroyAtComplete;
        dest.unitPixels = this._unitPixels;
        dest.color = this._color;
        dest.texture = this._texture;
    }

    /** @internal */
    _canBatchWith(other: SequenceFrame2DRender): boolean {
        return this._baseRender2DTexture === other._baseRender2DTexture;
    }

    private _markRuntimeDirty(): void {
        this._needRuntimeUpload = true;
        this._notifyDataChange();
    }

    private _markConfigDirty(boundsChange: boolean = false): void {
        this._needConfigUpload = true;
        this._configVersion++;
        if (boundsChange)
            this.boundsChange = true;
        this._notifyDataChange();
    }

    private _getCurrentTime(): number {
        return Render2DProcessor.renderTime;
    }

    private _getPlaybackAge(now: number = this._getCurrentTime()): number {
        const age = this._playing && !this._paused ? now - this._startTime : this._elapsedTime;
        if (this._playing && !this._paused && this._loop)
            return ((age % this._lifeTime) + this._lifeTime) % this._lifeTime;
        return Math.min(Math.max(age, 0), this._lifeTime);
    }

    private _completePlayback(): void {
        this._elapsedTime = this._lifeTime;
        this._playing = false;
        this._paused = false;
        this._setInstanceActive(false);
        this._needRuntimeUpload = false;
        this._notifyDataChange();

        const owner = this.owner;
        owner?.event(Event.COMPLETE);
        if (this._autoDestroyAtComplete && owner && !owner.destroyed)
            ILaya.timer.callLater(owner, owner.destroy, [true]);
    }

    private _isRuntimeStateDirty(): boolean {
        const matrix = this.owner._globalTrans.getMatrix();
        const alpha = this._color.a * this._struct.globalAlpha;
        const last = this._lastMatrix;
        return matrix.a !== last[0] || matrix.b !== last[1] || matrix.c !== last[2]
            || matrix.d !== last[3] || matrix.tx !== last[4] || matrix.ty !== last[5]
            || alpha !== this._lastAlpha;
    }

    private _initRender(): void {
        this._resizeInstanceBuffers();

        const geometry = this._renderGeometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
        geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        geometry.indexFormat = IndexFormat.UInt16;
        geometry.setDrawElemenParams(6, 0);
        geometry.instanceCount = this._activeInstanceCount;
        geometry.bufferState.applyState([SequenceFrame2DShader._vbs, this._runtimeVertexBuffer, this._configVertexBuffer], SequenceFrame2DShader._ibs);

        const renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        renderElement.geometry = geometry;
        renderElement.value2DShaderData = this._spriteShaderData;
        renderElement.renderStateIsBySprite = false;
        renderElement.nodeCommonMap = this._getcommonUniformMap();
        renderElement.owner = this._struct;
        (renderElement as SequenceFrame2DElement)._sequenceFrame2DRender = this;
        BaseRenderNode2D._setRenderElement2DMaterial(renderElement, this._getElementMaterial(0));

        this._renderElements[0] = renderElement;
        this._struct.renderElements = this._renderElements;
    }

    private _resizeInstanceBuffers(): void {
        if (!this._runtimeVertexBuffer)
            this._runtimeVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        if (!this._configVertexBuffer)
            this._configVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);

        this._runtimeVertexBuffer.vertexDeclaration = SequenceFrame2DShader.runtimeDeclaration;
        this._runtimeVertexBuffer.instanceBuffer = true;
        this._configVertexBuffer.vertexDeclaration = SequenceFrame2DShader.configDeclaration;
        this._configVertexBuffer.instanceBuffer = true;

        const runtimeStride = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE;
        const configStride = SequenceFrame2DShader.CONFIG_FLOAT_STRIDE;
        this._runtimeVertexBuffer.setDataLength(runtimeStride * 4);
        this._configVertexBuffer.setDataLength(configStride * 4);
        this._bindInstanceDataViews();

        if (this._renderGeometry)
            this._renderGeometry.bufferState.applyState([SequenceFrame2DShader._vbs, this._runtimeVertexBuffer, this._configVertexBuffer], SequenceFrame2DShader._ibs);
    }

    private _applyTextureToShaderData(value: BaseTexture): void {
        if (!this._spriteShaderData || !value)
            return;
        this._spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value.gammaCorrection !== 1)
            this._spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        else
            this._spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
    }

    private _updateRuntimeData(): void {
        if (this._activeInstanceCount <= 0) {
            if (this._renderGeometry)
                this._renderGeometry.instanceCount = 0;
            this.boundsChange = false;
            return;
        }

        this._ensureInstanceID();

        const matrix = this.owner._globalTrans.getMatrix();
        const data = this._runtimeBufferData;
        const alpha = this._color.a * this._struct.globalAlpha;
        const last = this._lastMatrix;

        data[0] = last[0] = matrix.a;
        data[1] = last[2] = matrix.c;
        data[2] = last[4] = matrix.tx;
        data[3] = 0;
        data[4] = last[1] = matrix.b;
        data[5] = last[3] = matrix.d;
        data[6] = last[5] = matrix.ty;
        data[7] = 0;
        data[8] = this._startTime;
        data[9] = this._lastAlpha = alpha;
        data[10] = this._getPlaybackAge();
        data[11] = this._playing && !this._paused ? (this._loop ? 2 : 1) : 0;

        this._setInstanceActive(true);
        this._runtimeVertexBuffer.setData(data.buffer, 0, data.byteOffset, SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE * 4);
        this.boundsChange = false;
    }

    private _updateConfigData(): void {
        this._ensureInstanceID();

        const tilesX = Math.max(1, Math.floor(this._tiles.x || 1));
        const tilesY = Math.max(1, Math.floor(this._tiles.y || 1));
        const frameCount = tilesX * tilesY;
        const unitPixels = Math.max(0.0001, this._unitPixels);
        const texture = this._texture instanceof Texture ? this._texture : this._baseRender2DTexture;
        const sourceFrameWidth = ((texture && texture.width) ? texture.width : unitPixels * tilesX) / tilesX;
        const sourceFrameHeight = ((texture && texture.height) ? texture.height : unitPixels * tilesY) / tilesY;
        const maxSourceFrameSize = Math.max(sourceFrameWidth, sourceFrameHeight, 0.0001);
        const displayWidth = sourceFrameWidth / maxSourceFrameSize * unitPixels;
        const displayHeight = sourceFrameHeight / maxSourceFrameSize * unitPixels;
        const data = this._configBufferData;

        data[0] = this._startFrame;
        data[1] = this._lifeTime;
        data[2] = this._cycles;
        data[3] = frameCount;
        // SizeTiles.xy keeps source frame pixels for exact sprite-sheet
        // sampling; unitPixels controls the displayed max frame size.
        data[4] = sourceFrameWidth;
        data[5] = sourceFrameHeight;
        data[6] = tilesX;
        data[7] = tilesY;
        data[8] = this._color.r;
        data[9] = this._color.g;
        data[10] = this._color.b;
        data[11] = unitPixels;
        data[12] = this._textureUVRect.x;
        data[13] = this._textureUVRect.y;
        data[14] = this._textureUVRect.z;
        data[15] = this._textureUVRect.w;
        this._configVertexBuffer.setData(data.buffer, 0, data.byteOffset, SequenceFrame2DShader.CONFIG_FLOAT_STRIDE * 4);

        this._rect.setValue(-displayWidth * 0.5, -displayHeight * 0.5, displayWidth * 0.5, displayHeight * 0.5);
        this.boundsChange = false;
    }
}
