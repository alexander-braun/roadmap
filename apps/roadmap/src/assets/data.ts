
export type Node = {
    children: string[];
    mainKnot?: boolean;
};

export interface Nodes {
    [key: string]: Node;
}

export type NodeId = string;

export const nodes: Nodes = {
    'p1': {
        mainKnot: true,
        children: [
            'c1',
            'c2',
            'c3',
        ],
    },
    'c1': {
        mainKnot: false,
        children: [
            's1',
            's2',
            's3'
        ]
    },
    'c2': {
        mainKnot: false,
        children: [
            's4',
            's5',
            's6'
        ]
    },
    'c3': {
        mainKnot: false,
        children: [
            's7'
        ]
    },
    's1': {
        mainKnot: false,
        children: []
    },
    's2': {
        mainKnot: false,
        children: []
    },
    's3': {
        mainKnot: false,
        children: []
    },
    's4': {
        mainKnot: false,
        children: []
    },
    's5': {
        mainKnot: false,
        children: []
    },
    's6': {
        mainKnot: false,
        children: []
    },
    's7': {
        mainKnot: false,
        children: []
    },
    'p2': {
        mainKnot: true,
        children: [
            'c4'
        ]
    },
    'c4': {
        mainKnot: false,
        children: [
            's8'
        ]
    },
    's8': {
        mainKnot: false,
        children: []
    }
};
