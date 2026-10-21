const output = document.querySelector('#results');
const results = [];
let assertions = 0;
let failures = 0;

function check(actual, expected, label) {
    assertions++;
    if (Math.abs(actual - expected) > 1) {
        failures++;
        if (results.length < 40) results.push(`FAIL ${label}: expected ${expected}, got ${actual}`);
    }
}

function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function runVariant(gl, webgl2, cascades, filter, source) {
    const label = `${webgl2 ? 'WebGL2' : 'WebGL1'} / ${cascades} cascade(s) / ${filter}`;
    const initialFailures = failures;
    const header = (webgl2 ? '#version 300 es\n' : '') + 'precision highp float;\nprecision highp int;\n';
    const defines = '#define RECEIVESHADOW\n#define SHADOW\n'
        + (cascades > 1 ? '#define SHADOW_CASCADE\n' : '')
        + (filter === 'SoftLow' ? '#define SHADOW_SOFT_SHADOW_LOW\n' : '')
        + (filter === 'SoftHigh' ? '#define SHADOW_SOFT_SHADOW_HIGH\n' : '')
        + (webgl2 ? '#define GRAPHICS_API_GLES3\n#define varying in\n#define texture2DLodEXT textureLod\nout vec4 resultColor;\n' : '');
    const vertex = compile(gl, gl.VERTEX_SHADER, header
        + `${webgl2 ? 'in' : 'attribute'} vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, header + defines + source + `
uniform vec3 testPosition;
uniform vec4 testCoord;
uniform int testMode;
void main() {
    vec4 coord = testMode == 1 ? testCoord : getShadowCoord(testPosition);
    float value = testMode == 2
        ? (coord.z < 0.0 && coord.w > 0.0 ? 1.0 : 0.0)
        : sampleShadowmap(coord);
    ${webgl2 ? 'resultColor' : 'gl_FragColor'} = vec4(vec3(value), 1.0);
}`);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const uniform = name => gl.getUniformLocation(program, name);
    const width = 64, height = cascades === 2 ? 32 : 64;
    const tileSize = cascades === 1 ? 64 : 32;
    gl.uniform4f(uniform('u_ShadowMapSize'), 1 / width, 1 / height, width, height);
    gl.uniform4f(uniform('u_ShadowParams'), 1, 0, 0, 0);
    const spheres = new Float32Array(16);
    for (let i = 0; i < cascades; i++) spheres.set([i * 10, 0, 0, 4], i * 4);
    gl.uniform4fv(uniform('u_ShadowSplitSpheres[0]'), spheres);
    const matrices = new Float32Array(64);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform('u_ShadowMap'), 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (webgl2) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LESS);
    }
    function fillAtlas(litTile) {
        const data = webgl2 ? new Uint16Array(width * height) : new Uint8Array(width * height * 4);
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
            const tile = cascades === 1 ? 0 : Math.floor(x / tileSize) + 2 * Math.floor(y / tileSize);
            const value = tile === litTile ? 1 : 0;
            if (webgl2) data[y * width + x] = value * 65535;
            else data.set([value * 255, value * 255, value * 255, 255], (y * width + x) * 4);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, webgl2 ? gl.DEPTH_COMPONENT16 : gl.RGBA, width, height,
            0, webgl2 ? gl.DEPTH_COMPONENT : gl.RGBA, webgl2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_BYTE, data);
    }
    function coordinate(tile, u, v, z = 0.5, w = 1) {
        matrices.fill(0);
        // Constant projections isolate matrix selection from receiver position.
        matrices.set([u * w, v * w, z * w, w], tile * 16 + 12);
        gl.uniformMatrix4fv(uniform('u_ShadowMatrices[0]'), false, matrices);
        gl.uniform3f(uniform('testPosition'), tile * 10, 0, 0);
        gl.uniform1i(uniform('testMode'), 0);
    }
    const pixel = new Uint8Array(4);
    function sample(expected, name) {
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        check(pixel[0], expected, `${label}: ${name}`);
        check(gl.getError(), gl.NO_ERROR, `${label}: GL error at ${name}`);
    }
    for (let tile = 0; tile < cascades; tile++) {
        const left = cascades === 1 ? 0 : (tile % 2) * tileSize / width;
        const bottom = cascades === 1 ? 0 : Math.floor(tile / 2) * tileSize / height;
        const right = left + tileSize / width, top = bottom + tileSize / height;
        const cx = (left + right) / 2, cy = (bottom + top) / 2;
        coordinate(tile, cx, cy);
        fillAtlas(-1);
        sample(0, `tile ${tile} interior remains shadowed`);
        gl.uniform4f(uniform('u_ShadowParams'), 0.5, 0, 0, 0);
        sample(128, 'shadow strength');
        gl.uniform4f(uniform('u_ShadowParams'), 1, 0, 0, 0);
        for (const w of [0.25, 2.5]) {
            coordinate(tile, cx, cy, 0.5, w);
            sample(0, `tile ${tile} interior with w=${w}`);
        }
        for (const [u, v] of [[left - 0.01, cy], [right + 0.01, cy], [cx, bottom - 0.01], [cx, top + 0.01]]) {
            coordinate(tile, u, v);
            sample(255, `tile ${tile} outside XY`);
        }
        fillAtlas(tile); // Neighbouring tiles contain occluders; any PCF leakage darkens this tile.
        for (const w of [0.25, 2.5]) {
            coordinate(tile, left, bottom, 0.5, w);
            sample(255, `tile ${tile} PCF corner with w=${w}`);
        }
        for (const inset of [0, 0.125, 0.49, 0.5, 1, 2.49, 2.5, 3]) {
            const dx = inset / width, dy = inset / height;
            for (const [u, v] of [[left + dx, cy], [right - dx, cy], [cx, bottom + dy], [cx, top - dy],
                [left + dx, bottom + dy], [right - dx, top - dy]]) {
                coordinate(tile, u, v);
                sample(255, `tile ${tile} PCF edge inset ${inset}`);
            }
        }
        for (const w of [0, -1]) {
            coordinate(tile, cx, cy, 0.5, w);
            gl.uniform1i(uniform('testMode'), 2);
            sample(255, `invalid projection w=${w} returns finite sentinel`);
        }
    }
    fillAtlas(-1);
    if (cascades > 1) {
        coordinate(cascades - 1, 0.75, 0.75);
        gl.uniform3f(uniform('testPosition'), 1000, 0, 0);
        sample(255, 'outside every sphere');
        gl.uniform1i(uniform('testMode'), 2);
        sample(255, 'outside every sphere returns finite sentinel');
    }
    gl.uniform1i(uniform('testMode'), 1);
    for (const coord of [[0.5, 0.5, 0.5, 0], [0.5, 0.5, 0.5, -1], [-0.1, 0.5, 0.5, 1],
        [1.1, 0.5, 0.5, 1], [0.5, -0.1, 0.5, 1], [0.5, 1.1, 0.5, 1], [0.5, 0.5, 0, 1], [0.5, 0.5, 1, 1]]) {
        gl.uniform4fv(uniform('testCoord'), coord);
        sample(255, `invalid direct sample ${coord}`);
    }
    if (failures === initialFailures) results.push(`PASS ${label}`);
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
}

try {
    const names = ['ShadowSampler.glsl', 'ShadowSampleTent.glsl', 'ShadowCommon.glsl'];
    const sources = Object.fromEntries(await Promise.all(names.map(async name => [name, await (await fetch('/' + name)).text()])));
    const source = sources['ShadowSampler.glsl'].replace(/#include\s+"([^"]+)";?/g, (_, name) => sources[name]);
    for (const api of ['webgl', 'webgl2']) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const gl = canvas.getContext(api, { antialias: false });
        if (!gl) {
            failures++;
            results.push(`UNAVAILABLE ${api}; this backend was not tested`);
            continue;
        }
        for (const cascades of [1, 2, 4]) for (const filter of ['Hard', 'SoftLow', 'SoftHigh']) {
            runVariant(gl, api === 'webgl2', cascades, filter, source);
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
} catch (error) {
    failures++;
    results.push(String(error.stack || error));
}
output.textContent = `${failures ? 'FAIL' : 'PASS'}: ${assertions} assertions, ${failures} failures\n\n` + results.join('\n');
