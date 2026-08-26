import { SoundChannel } from "./SoundChannel"
import { Browser } from "../utils/Browser"
import { PAL } from "../platform/PlatformAdapters";
import { IPool, Pool } from "../utils/Pool";

/**
 * @ignore
 */
export class WebAudioChannel extends SoundChannel {
    private _gainNode: GainNode;
    private _sourceNode: AudioBufferSourceNode;
    private _buffer: AudioBuffer;

    private static gainNodePool: IPool<GainNode> = Pool.createPool2(() => createGainNode(), node => initGainNode(node), node => resetGainNode(node));

    get duration(): number {
        if (this._buffer)
            return this._buffer.duration;
        else
            return 0;
    }

    protected onPlay(url: string): void {
        PAL.media.audioDataCache.get(url, this.onLoaded, this);
    }

    protected onPlayAgain(): void {
        this.reset();
        this.startPlay(false);
    }

    protected onStop(): void {
        this.reset();
        this._buffer = null;
    }

    protected onPause(): void {
        this.reset();
    }

    protected onResume(): void {
        this.startPlay(true);
    }

    protected onVolumeChanged() {
        if (!this._sourceNode)
            return;

        let volume = this._muted ? 0 : this._volume;
        if (this._gainNode.gain.setTargetAtTime)
            this._gainNode.gain.setTargetAtTime(volume, PAL.media.audioCtx.currentTime, 0.001);
        else
            this._gainNode.gain.value = volume;
    }

    protected onMuted(): void {
        this.onVolumeChanged();
    }

    protected onPlaybackRateChanged(): void {
        this.applyPlaybackRate();
    }

    private onLoaded(buffer: AudioBuffer): void {
        if (!this._started)
            return;

        this._buffer = buffer;
        if (!buffer || this.startTime >= this.duration) {
            this.stop();
            return;
        }

        this._loaded = true;
        if (this._paused)
            return;

        this.startPlay(false);
    }

    private startPlay(isResuming: boolean) {
        let ctx = PAL.media.audioCtx;

        // iOS may leave the AudioContext suspended or interrupted after losing focus.
        // Do not create or start a source until the context has been resumed.
        let state = ctx.state as string;
        if (state === "closed") {
            this.stop();
            return;
        }

        if (state != null && state !== "running") {
            let resumeTime = isResuming ? this._pauseTime : this.startTime;
            this._startTime = 0;
            PAL.media.resumeUntilGotFocus(this);
            this._pauseTime = resumeTime;
            return;
        }

        this._gainNode = WebAudioChannel.gainNodePool.take();

        let sourceNode = this._sourceNode = ctx.createBufferSource();
        sourceNode.buffer = this._buffer;
        sourceNode.connect(this._gainNode);
        sourceNode.onended = () => this.onPlayEnd();
        this.applyPlaybackRate();
        sourceNode.loop = this.loops === 0;
        sourceNode.loopStart = this.startTime;
        sourceNode.loopEnd = this._buffer.duration;
        this._gainNode.gain.value = this._muted ? 0 : this._volume;
        sourceNode.start(0, isResuming ? this._pauseTime : this.startTime);
        this._startTime = performance.now();
    }

    private applyPlaybackRate(): void {
        let playbackRate = this._sourceNode?.playbackRate;
        if (!playbackRate) //douyin真机这个为空
            return;

        if (playbackRate.setTargetAtTime)
            playbackRate.setTargetAtTime(this.playbackRate, PAL.media.audioCtx.currentTime, 0.001);
        else
            playbackRate.value = this.playbackRate;
    }

    private reset(): void {
        if (!this._sourceNode)
            return;

        let sourceNode = this._sourceNode;
        if (sourceNode.stop)
            sourceNode.stop(0);
        else
            (sourceNode as any).noteOff(0);
        sourceNode.disconnect();
        sourceNode.onended = null;
        this._sourceNode = null;

        WebAudioChannel.gainNodePool.recover(this._gainNode);
        this._gainNode = null;
    }
}

function createGainNode(): GainNode {
    let node: GainNode;
    if (PAL.media.audioCtx.createGain)
        node = PAL.media.audioCtx.createGain();
    else
        node = (PAL.media.audioCtx as any).createGainNode();
    return node;
}

function initGainNode(node: GainNode) {
    node.connect(PAL.media.audioCtx.destination);
}

function resetGainNode(node: GainNode) {
    node.disconnect();
}