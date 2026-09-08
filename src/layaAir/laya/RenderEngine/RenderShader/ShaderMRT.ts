/** @internal Shader-side MRT contract; attachment semantics remain the caller's responsibility. */
export class ShaderMRT {
    static readonly defineName = "LAYA_MRT";
    /** Internal attachment-count variant key, paired with the target-controlled LAYA_MRT define. */
    static readonly targetDefinePrefix = "LAYA_MRT_TARGET_";

    static getTargetCount(defines: readonly string[]): number {
        let count = 0;
        for (const define of defines) {
            if (!define.startsWith(this.targetDefinePrefix)) continue;
            const value = Number(define.substring(this.targetDefinePrefix.length));
            if (!Number.isSafeInteger(value) || value < 1 || (count && count !== value))
                throw new Error("Invalid MRT shader target count.");
            count = value;
        }
        return count;
    }

    /**
     * Keep legacy color at location 0 and write zero to missing target outputs.
     * Run BEFORE native GLSL preprocessing. Markers accompany declarations inside
     * their original #if branches; the GLSL preprocessor resolves locations and
     * chooses defaults. Do not guess active outputs by scanning unexpanded code.
     */
    static prepare(source: string, count: number): string {
        if (!Number.isSafeInteger(count) || count < 1)
            throw new Error("Invalid MRT shader target count.");
        const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,
            comment => comment.replace(/[^\r\n]/g, " "));
        let prefix = "laya_MRT_";
        while (code.indexOf(prefix) !== -1) prefix += "x";
        const edits: { position: number; text: string }[] = [];
        const tokens = /^[ \t]*#(?:\\\r?\n|[^\r\n])*|[A-Za-z_]\w*|\d+|[^\s]/gm;
        let braces = 0, parentheses = 0, start = 0, output = false;
        let token: RegExpExecArray | null;
        const legacy = `\n#define ${prefix}LEGACY\n`;
        while ((token = tokens.exec(code))) {
            const word = token[0].trim();
            if (word[0] === "#") {
                if (/^#\s*define\b/.test(word) && /\b(gl_FragColor|pc_fragColor)\b/.test(word))
                    edits.push({ position: token.index, text: legacy });
                if (braces === 0 && !output) start = tokens.lastIndex;
                continue;
            }
            if (!output && (word === "gl_FragColor" || word === "pc_fragColor"))
                edits.push({ position: token.index, text: legacy });
            if (word === "gl_FragData")
                edits.push({ position: token.index, text: "\n#error LAYA_MRT does not support gl_FragData\n" });
            if (word === "out" && braces === 0 && parentheses === 0) output = true;
            if (word === "(") parentheses++;
            else if (word === ")") parentheses--;
            else if (word === "{") {
                if (output) throw new Error("LAYA_MRT output blocks are not supported.");
                braces++;
            } else if (word === "}") {
                braces--;
                if (braces === 0) start = tokens.lastIndex;
            } else if (word === ";" && braces === 0 && parentheses === 0) {
                if (output) {
                    const declaration = code.slice(start, tokens.lastIndex);
                    const match = /^\s*layout\s*\(\s*location\s*=\s*(\d+|[A-Za-z_]\w*)\s*\)\s*out\s+(?:(?:highp|mediump|lowp)\s+)?vec4\s+([A-Za-z_]\w*)\s*;\s*$/.exec(declaration);
                    let marker = "\n";
                    if (!match || match[2] === "pc_fragColor") {
                        marker += "#error LAYA_MRT requires explicitly located vec4 outputs with non-reserved names\n";
                    } else {
                        const location = match[1];
                        // Extra shader outputs may be ignored by the target. Only
                        // mark bound slots; native compilation validates locations.
                        for (let i = 0; i < count; i++) {
                            const flag = `${prefix}HAS_${i}`;
                            marker += `#if (${location}) == ${i}\n#ifdef ${flag}\n#error Duplicate MRT output location\n#endif\n#define ${flag}\n#endif\n`;
                        }
                    }
                    edits.push({ position: tokens.lastIndex, text: marker });
                }
                start = tokens.lastIndex;
                output = false;
            }
        }
        // Append missing declarations after user code: only the generated wrapper
        // references them. Existing output declarations and variable scopes stay intact.
        let body = source;
        for (let i = edits.length - 1; i >= 0; i--) {
            const edit = edits[i];
            body = body.slice(0, edit.position) + edit.text + body.slice(edit.position);
        }
        let tail = `\n#undef main\n#if defined(${prefix}LEGACY) && defined(${prefix}HAS_0)\n#error LAYA_MRT legacy output conflicts with explicit location 0\n#endif\n`;
        for (let i = 0; i < count; i++)
            tail += `#ifndef ${prefix}HAS_${i}\nlayout(location = ${i}) out highp vec4 ${prefix}color${i};\n#endif\n`;
        tail += "void main() {\npc_fragColor = vec4(0.0);\n";
        for (let i = 1; i < count; i++)
            tail += `#ifndef ${prefix}HAS_${i}\n${prefix}color${i} = vec4(0.0);\n#endif\n`;
        tail += `${prefix}main();\n#ifndef ${prefix}HAS_0\n${prefix}color0 = pc_fragColor;\n#endif\n}\n`;
        return `highp vec4 pc_fragColor;\n#define gl_FragColor pc_fragColor\n#define main ${prefix}main\n${body}${tail}`;
    }

    /**
     * Extract global, explicitly located vec4 outputs after the backend's GLSL preprocessing.
     * This is not a GLSL preprocessor; #if/defines must already be resolved by the compiler.
     * Arrays and interface blocks are not supported by this initial WebGPU conversion path.
     * Function out parameters and comments must never be mistaken for fragment outputs.
     */
    static extract(source: string, prepared: boolean = false): { declarations: string; source: string } {
        const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,
            comment => comment.replace(/[^\r\n]/g, " "));
        const tokens = /^[ \t]*#(?:\\\r?\n|[^\r\n])*|[A-Za-z_]\w*|\d+|[^\s]/gm;
        const locations = new Set<number>();
        const names = new Set<string>();
        const declarations: string[] = [];
        const spans: [number, number][] = [];
        let braces = 0, parentheses = 0, conditional = 0, start = 0;
        let output = false, conditionalOutput = false;
        let token: RegExpExecArray | null;
        while ((token = tokens.exec(code))) {
            const word = token[0].trim();
            if (word[0] === "#") {
                if (/^#\s*(if|ifdef|ifndef)\b/.test(word)) conditional++;
                else if (/^#\s*endif\b/.test(word)) conditional--;
                if (braces === 0 && !output) start = tokens.lastIndex;
                continue;
            }
            if (word === "gl_FragData" || (!prepared && (word === "gl_FragColor" || word === "pc_fragColor")))
                throw new Error("LAYA_MRT cannot use legacy/default fragment outputs; declare layout(location = N) out vec4 outputs.");
            if (word === "out" && braces === 0 && parentheses === 0) {
                output = true;
                conditionalOutput = conditional !== 0;
            }
            if (word === "(") parentheses++;
            else if (word === ")") parentheses--;
            else if (word === "{") {
                if (output) throw new Error("LAYA_MRT output blocks are not supported.");
                braces++;
            } else if (word === "}") {
                braces--;
                if (braces === 0) start = tokens.lastIndex;
            } else if (word === ";" && braces === 0 && parentheses === 0) {
                if (output) {
                    if (conditionalOutput)
                        throw new Error("LAYA_MRT output extraction requires preprocessed GLSL; found an unresolved #if branch.");
                    const declaration = code.slice(start, tokens.lastIndex);
                    const match = /^\s*layout\s*\(\s*location\s*=\s*(\d+)\s*\)\s*out\s+(?:(highp|mediump|lowp)\s+)?vec4\s+([A-Za-z_]\w*)\s*;\s*$/.exec(declaration);
                    if (!match)
                        throw new Error("LAYA_MRT requires 'layout(location = N) out [precision] vec4 name;' with a literal non-negative integer location.");
                    const location = Number(match[1]), name = match[3];
                    if (!Number.isSafeInteger(location) || locations.has(location))
                        throw new Error(`LAYA_MRT has an invalid or duplicate output location ${match[1]}.`);
                    if (names.has(name)) throw new Error(`LAYA_MRT has a duplicate output name '${name}'.`);
                    locations.add(location);
                    names.add(name);
                    declarations.push(`layout(location = ${location}) out ${match[2] ? match[2] + " " : ""}vec4 ${name};`);
                    spans.push([start, tokens.lastIndex]);
                }
                start = tokens.lastIndex;
                output = false;
                conditionalOutput = false;
            }
        }
        if (!declarations.length || output)
            throw new Error("LAYA_MRT requires explicit fragment output declarations.");
        // Preserve comments, directives and source positions outside the extracted declarations.
        let stripped = source;
        for (let i = spans.length - 1; i >= 0; i--) {
            const [begin, end] = spans[i];
            stripped = stripped.slice(0, begin) + stripped.slice(begin, end).replace(/[^\r\n]/g, " ") + stripped.slice(end);
        }
        return { declarations: declarations.join("\n"), source: stripped };
    }
}
