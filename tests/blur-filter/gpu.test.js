// Real GPU regression tests for PR #2444. See README.md for the runner.
(async () => {
    const checks = [], errors = window.__bootstrapErrors || [], captures = {};
    const options = new URLSearchParams(location.search);
    const check = (condition, name, detail) => checks.push({name, passed: !!condition, detail});
    const frames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.addEventListener('error', event => errors.push(event.message));
    window.addEventListener('unhandledrejection', event => errors.push(String(event.reason?.stack || event.reason)));
    try {
        if (options.has('webgl1')) Laya.Config.useWebGL2 = false;
        await Laya.init(1024, 768);
        if (options.get('backend') === 'webgpu') {
            const device = Laya.LayaGL.renderEngine.getDevice();
            device.addEventListener('uncapturederror', event => errors.push(event.error.message));
            check(!!device, 'requested WebGPU backend');
        } else {
            check(Laya.LayaGL.renderEngine.isWebGL2 === !options.has('webgl1'), 'requested WebGL version');
        }
        const empty = new Laya.Texture2D(1, 1, Laya.TextureFormat.R8G8B8A8, false, false);
        empty.setPixelsData(new Uint8Array(4), false, false);

        async function read(rt) {
            const pixels = new Uint8Array(rt.width * rt.height * 4);
            await rt.getDataAsync(0, 0, rt.width, rt.height, pixels);
            return pixels;
        }
        // Readback rows are bottom-up on the WebGL backend.
        function pixel(pixels, rt, x, y) {
            const offset = ((rt.height - 1 - y) * rt.width + x) * 4;
            return Array.from(pixels.subarray(offset, offset + 4));
        }
        function saveImage(name, pixels, rt) {
            const canvas = document.createElement('canvas');
            canvas.width = rt.width; canvas.height = rt.height;
            const context = canvas.getContext('2d');
            const image = context.createImageData(rt.width, rt.height);
            for (let y = 0; y < rt.height; y++) for (let x = 0; x < rt.width; x++) {
                const color = pixel(pixels, rt, x, y), offset = (y * rt.width + x) * 4;
                for (let c = 0; c < 3; c++) image.data[offset + c] = Math.min(255, color[c] + 136 * (1 - color[3] / 255));
                image.data[offset + 3] = 255;
            }
            context.putImageData(image, 0, 0);
            captures[name] = canvas.toDataURL('image/png');
        }
        function solidSource(width, height, alpha) {
            const source = new Laya.RenderTexture2D(width, height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None);
            const command = new Laya.CommandBuffer2D(), value = alpha / 255;
            command.setRenderTarget(source, true, new Laya.Color(value, value, value, value));
            // WebGPU starts its clear pass lazily at the first draw.
            command.blitTextureQuad(empty, source);
            command.apply(true);
            command.clear();
            return source;
        }
        function process(source, strength, count = 1) {
            const pp = new Laya.PostProcess2D();
            pp.effects = Array.from({length: count}, () => new Laya.BlurEffect2D(strength));
            pp.setResource(source);
            pp._render();
            pp.apply();
            return pp;
        }
        for (const count of [1, 2]) for (const alpha of [255, 128, 64]) {
            const source = solidSource(64, 32, alpha), pp = process(source, 4, count);
            const rt = pp.getDestRT(), pixels = await read(rt);
            const center = pixel(pixels, rt, rt.width / 2, rt.height / 2);
            check(Math.abs(center[3] - alpha) <= 1 && center.slice(0, 3).every(value => Math.abs(value - center[3]) <= 1),
                `premultiplied white stays white: alpha=${alpha}, effects=${count}`, {center});
            pp.destroy(); source.destroy();
        }
        for (const [width, height] of [[64, 32], [65, 33], [1, 1], [7, 3]]) for (const strength of [2, 4, 10]) {
            const source = solidSource(width, height, 255), pp = process(source, strength);
            const rt = pp.getDestRT(), pixels = await read(rt);
            let maxDifference = 0;
            for (let y = 0; y < rt.height; y++) for (let x = 0; x < rt.width; x++) {
                const a = pixel(pixels, rt, x, y)[3];
                maxDifference = Math.max(maxDifference,
                    Math.abs(a - pixel(pixels, rt, rt.width - 1 - x, y)[3]),
                    Math.abs(a - pixel(pixels, rt, x, rt.height - 1 - y)[3]));
            }
            check(pixels.some((value, i) => i % 4 === 3 && value > 0) && maxDifference <= 1,
                `symmetric Gaussian edges: ${width}x${height}, strength=${strength}`, {maxDifference});
            pp.destroy(); source.destroy();
        }

        // 3.4 has a paired glow kernel. Retain that kernel and its intensity
        // while checking transparent borders even when taps leave the padded RT.
        for (const [blur, offset] of [[4, 0], [100, 0], [4, 100]]) {
            const source = solidSource(64, 32, 128), pp = new Laya.PostProcess2D();
            pp.effects = [new Laya.GlowEffect2D('#ffffff', blur, offset, 0)];
            pp.setResource(source); pp._render(); pp.apply();
            const rt = pp.getDestRT(), pixels = await read(rt);
            check(rt.width === 164 && rt.height === 132, `glow padding: ${blur}/${offset}`);
            let difference = 0, colorDifference = 0;
            for (let y = 0; y < rt.height; y++) for (let x = 0; x < rt.width; x++) {
                const color = pixel(pixels, rt, x, y);
                colorDifference = Math.max(colorDifference, ...color.slice(0, 3).map(value => Math.abs(value - color[3])));
                if (!offset) difference = Math.max(difference,
                    Math.abs(color[3] - pixel(pixels, rt, rt.width - 1 - x, y)[3]),
                    Math.abs(color[3] - pixel(pixels, rt, x, rt.height - 1 - y)[3]));
            }
            check(pixels.some((value, i) => i % 4 === 3 && value > 0) && colorDifference <= 1,
                `glow premultiplied color: ${blur}/${offset}`, {colorDifference});
            if (!offset) check(difference <= 1, `glow symmetric edges: ${blur}`, {maxDifference: difference});
            else check(pixel(pixels, rt, 1, 66)[3] === 0, 'offset glow does not wrap to opposite edge');
            pp.destroy(); source.destroy();
        }

        // A summed-area mask checks the Gaussian support independently of its
        // weights. Pixels farther than five texels from all source alpha must
        // stay transparent; repeated opposite-edge image fragments fail this.
        function ghostPixels(pixels, rt, sourcePixels, width, height) {
            const stride = width + 1, prefix = new Uint32Array(stride * (height + 1));
            for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
                const i = (y + 1) * stride + x + 1;
                prefix[i] = (sourcePixels[(y * width + x) * 4 + 3] > 0 ? 1 : 0)
                    + prefix[i - 1] + prefix[i - stride] - prefix[i - stride - 1];
            }
            let ghosts = 0;
            for (let y = 0; y < rt.height; y++) for (let x = 0; x < rt.width; x++) {
                if (pixel(pixels, rt, x, y)[3] <= 2) continue;
                const x0 = Math.max(0, x - 55), x1 = Math.min(width, x - 44);
                const y0 = Math.max(0, y - 55), y1 = Math.min(height, y - 44);
                const supported = x0 < x1 && y0 < y1 &&
                    prefix[y1 * stride + x1] - prefix[y0 * stride + x1] - prefix[y1 * stride + x0] + prefix[y0 * stride + x0] > 0;
                if (!supported) ghosts++;
            }
            return ghosts;
        }
        async function checkImage(image, sourcePixels, width, height, name, classicFilter) {
            image.pos(120, 40);
            image.size(width, height);
            if (classicFilter) image.filters = [new Laya.BlurFilter(10)];
            else {
                const pp = new Laya.PostProcess2D();
                pp.effects = [new Laya.BlurEffect2D(10)];
                image.postProcess = pp;
            }
            Laya.stage.addChild(image);
            await frames();
            const rt = image.postProcess.getDestRT(), pixels = await read(rt);
            const ghosts = ghostPixels(pixels, rt, sourcePixels, width, height);
            check(rt.width === width + 100 && rt.height === height + 100, `${name}: output padding`);
            check(pixels.some((value, i) => i % 4 === 3 && value > 2), `${name}: image actually rendered`);
            check(ghosts === 0, `${name}: no opposite-edge ghosts`, {ghosts});
            saveImage(name, pixels, rt);
            image.destroy();
            return {rt, pixels};
        }
        const width = 64, height = 32, input = new Uint8Array(width * height * 4);
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
            if (x < 16 && y < 16) continue;
            input.set(x < 32 ? [255, 0, 0, 255] : [0, 255, 0, 255], (y * width + x) * 4);
        }
        const bitmap = new Laya.Texture2D(width, height, Laya.TextureFormat.R8G8B8A8, false, false);
        bitmap.setPixelsData(input, true, false);
        const texture = new Laya.Texture(bitmap);
        for (const classic of [false, true]) {
            const image = new Laya.Image(); image.source = texture;
            const name = classic ? 'classic-filter' : 'post-process';
            const {rt, pixels} = await checkImage(image, input, width, height, name, classic);
            const left = pixel(pixels, rt, 50, 50 + 24), right = pixel(pixels, rt, 50 + width - 1, 50 + 24);
            check(left[1] === 0 && right[0] === 0, `${name}: opposite edge colors do not bleed`, {left, right});
        }
        texture.destroy(); bitmap.destroy();

        if (options.has('fixture')) {
            const decoded = await createImageBitmap(await (await fetch('/reported.png')).blob());
            const canvas = document.createElement('canvas'); canvas.width = decoded.width; canvas.height = decoded.height;
            const context = canvas.getContext('2d'); context.drawImage(decoded, 0, 0);
            const original = context.getImageData(0, 0, canvas.width, canvas.height);
            const image = new Laya.Image();
            const loaded = new Promise(resolve => image.once(Laya.Event.LOADED, null, resolve));
            image.skin = '/reported.png'; await loaded;
            await checkImage(image, original.data, canvas.width, canvas.height, 'reported-image', false);
            decoded.close();
        }
        empty.destroy();
        window.__gpuReport = {checks, errors, passed: checks.every(item => item.passed) && !errors.length};
    } catch (error) {
        window.__gpuReport = {checks, errors, passed: false, error: String(error.stack || error)};
    }
    window.__blurCaptures = captures;
    document.querySelector('pre').textContent = JSON.stringify(window.__gpuReport, null, 2);
})();
