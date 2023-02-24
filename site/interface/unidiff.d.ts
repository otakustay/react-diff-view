declare module 'unidiff' {
    export interface FormatOptions {
        context?: number;
    }

    export function diffLines(x: string, y: string): string[];

    export function formatLines(line: string[], options?: FormatOptions): string;
}
