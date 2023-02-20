export interface TokenNode {
    [key: string]: any;
    type: string;
    children?: TokenNode[];
}

export interface TextNode extends TokenNode {
    type: 'text';
    value: string;
}

export interface ProcessingNode {
    [key: string]: any;
    type: string;
}

export type TokenPath = ProcessingNode[];

export type Pair<T> = [oldSide: T, newSide: T];

export type TokenizeEnhancer = (input: Pair<TokenPath[][]>) => Pair<TokenPath[][]>;
