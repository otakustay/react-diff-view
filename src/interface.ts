/**
 * @file react-diff-view 类型文件
 * @author zhangcong06
 */
/* eslint-disable init-declarations */

import {ReactNode} from 'react';

interface InsertChange {
    type: 'insert';
    content: string;
    isInsert: true;
    isDelete?: boolean;
    isNormal?: boolean;
    lineNumber: number;
}

interface DeleteChange {
    type: 'delete';
    content: string;
    isInsert?: boolean;
    isDelete: true;
    isNormal?: boolean;
    lineNumber: number;
}

interface NormalChange {
    type: 'normal';
    content: string;
    isInsert?: boolean;
    isDelete?: boolean;
    isNormal: true;
    oldLineNumber: number;
    newLineNumber: number;
}

export type Change = InsertChange | DeleteChange | NormalChange;

export interface HunkType {
    content: string;
    oldStart: number;
    newStart: number;
    oldLines: number;
    newLines: number;
    changes: Change[];

    // react-diff-view 新增
    isPlain: boolean;
}

export interface DiffType {
    hunks: HunkType[];
    oldPath: string;
    newPath: string;
    oldEndingNewLine: boolean;
    newEndingNewLine: boolean;
    oldMode: string;
    newMode: string;
    oldRevision: string;
    newRevision: string;
    similarity: number;
    isBinary: boolean;
    // 'rename' 和 'copy' 理论上存在但实际很少用到
    type: 'add' | 'delete' | 'modify' | 'rename' | 'copy';

}

interface Options {
    nearbySequences?: 'zip';
}

export type ParseDiff = (source: string, options?: Options) => DiffType[];

export type GetChangeKey = (change: Change) => string;

export type ComputeOldLineNumber = (change: Change) => number;

export type ComputeNewLineNumber = (change: Change) => number;

export type RawCodeOrLines = string | string[];

export type ExpandFromRawCode = (
    hunks: HunkType[],
    rawCodeOrLines: RawCodeOrLines,
    start: number,
    end: number
) => HunkType[];

type Predicate = (lines: number, oldStart?: number, newStart?: number) => boolean;

export type ExpandCollapsedBlockBy = (
    hunks: HunkType[],
    rawCodeOrLines: RawCodeOrLines,
    predicate: Predicate
) => HunkType[];

export type FindChangeByOldLineNumber = (hunks: HunkType[], lineNumber: number) => Change | undefined;

export type FindChangeByNewLineNumber = (hunks: HunkType[], lineNumber: number) => Change | undefined;

export type GetCollapsedLinesCountBetween = (previousHunk: HunkType, nextHunk: HunkType) => number;

export type GetCorrespondingOldLineNumber = (hunks: HunkType[], lineNumber: number) => number;

export type GetCorrespondingNewLineNumber = (hunks: HunkType[], lineNumber: number) => number;

interface TokenizeResult {
    tokens: any | null;
    tokenizationFailReason: any | null;
}

// NOTE consider T
type Payload = any;

export interface TokenizeOptions {
    shouldTokenize?: (current: Payload, previous: Payload) => boolean;
}

export type UseTokenizeWorker = (worker: Worker, payload: Payload, options?: TokenizeOptions) => TokenizeResult;

export interface DiffProps {
    diffType: 'add' | 'delete' | 'modify' | 'rename' | 'copy';
    viewType: 'unified' | 'split';
    hunks: HunkType[];
    children?: (hunks: HunkType[]) => any;
    oldSource?: string;
    gutterType?: 'default' | 'none' | 'anchor';
    generateAnchorID?: (change: Change) => any;
    selectedChanges?: string[];
    tokens?: any[] | null;
    widgets?: {
        [key: string]: any;
    };
    optimizeSelection?: boolean;
    className?: string;
    renderToken?: () => any;
    renderGutter?: () => any;
}

export interface HunkProps {
    hunk: HunkType;
    className?: string;
    lineClassName?: string;
    gutterClassName?: string;
    contentClassName?: string;
    gutterEvents?: {
        [key: string]: any;
    };
    codeEvents?: {
        [key: string]: any;
    };
}

export interface DecorationProps {
    className?: string;
    gutterClassName?: string;
    contentClassName?: string;
    children?: ReactNode;
    hideGutter?: boolean;
}

export interface DetailedDecorationProps {
    className?: string;
    gutterClassName?: string;
    contentClassName?: string;
    children?: ReactNode;
    hideGutter?: boolean;
    monotonous?: boolean;
}
