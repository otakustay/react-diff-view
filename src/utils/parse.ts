import parser, {Change, File, Hunk} from 'gitdiff-parser';

export type {File as FileData, Hunk as HunkData, Change as ChangeData};

export interface ParseOptions {
    nearbySequences?: 'zip';
}

function zipChanges(changes: Change[]) {
    const [result] = changes.reduce<[Change[], Change | null, number]>(
        ([result, last, lastDeletionIndex], current, i) => {
            if (!last) {
                result.push(current);
                return [result, current, current.isDelete ? i : -1];
            }

            if (current.isInsert && lastDeletionIndex >= 0) {
                result.splice(lastDeletionIndex + 1, 0, current);
                // The new `lastDeletionIndex` may be out of range, but `splice` will fix it
                return [result, current, lastDeletionIndex + 2];
            }

            result.push(current);

            // Keep the `lastDeletionIndex` if there are lines of deletions,
            // otherwise update it to the new deletion line
            const newLastDeletionIndex = current.isDelete ? (last.isDelete ? lastDeletionIndex : i) : i;

            return [result, current, newLastDeletionIndex];
        },
        [[], null, -1]
    );
    return result;
}

function mapHunk(hunk: Hunk, options: ParseOptions) {
    const changes = options.nearbySequences === 'zip' ? zipChanges(hunk.changes) : hunk.changes;

    return {
        ...hunk,
        isPlain: false,
        changes: changes,
    };
}

function mapFile(file: File, options: ParseOptions) {
    const hunks = file.hunks.map(hunk => mapHunk(hunk, options));

    return {...file, hunks};
}

function normalizeDiffText(text: string) {
    // Git diff header:
    //
    // diff --git a/test/fixture/test/ci.go b/test/fixture/test/ci.go
    // index 6829b8a2..4c565f1b 100644
    // --- a/test/fixture/test/ci.go
    // +++ b/test/fixture/test/ci.go
    if (text.startsWith('diff --git')) {
        return text;
    }

    // Unidiff header:
    //
    // --- /test/fixture/test/ci.go 2002-02-21 23:30:39.942229878 -0800
    // +++ /test/fixture/test/ci.go 2002-02-21 23:30:50.442260588 -0800
    const indexOfFirstLineBreak = text.indexOf('\n');
    const indexOfSecondLineBreak = text.indexOf('\n', indexOfFirstLineBreak + 1);
    const firstLine = text.slice(0, indexOfFirstLineBreak);
    const secondLine = text.slice(indexOfFirstLineBreak + 1, indexOfSecondLineBreak);
    const oldPath = firstLine.split(' ').slice(1, -3).join(' ');
    const newPath = secondLine.split(' ').slice(1, -3).join(' ');
    const segments = [
        `diff --git a/${oldPath} b/${newPath}`,
        'index 1111111..2222222 100644',
        `--- a/${oldPath}`,
        `+++ b/${newPath}`,
        text.slice(indexOfSecondLineBreak + 1),
    ];

    return segments.join('\n');
}

export function parseDiff(text: string, options: ParseOptions = {}): File[] {
    const diffText = normalizeDiffText(text.trim());
    const files = parser.parse(diffText);

    return files.map(file => mapFile(file, options));
}
