import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NodeId, nodes } from '../../assets/data';

export type Direction = "left" | "right";

@Component({
    selector: 'rdmp-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
    public nodes = nodes;
    public sections: NodeId[];

    constructor() {
        this.sections = this.generateSections();
        this.getSvgConnectedCardPairIds();
    }

    ngOnInit(): void { }

    private generateSections(): NodeId[] {
        return Object.keys(this.nodes).reduce((acc, curr) => {
            return this.nodes[curr].mainKnot ? [...acc, curr] : acc;
        }, [] as string[])
    }

    public generateChildrenOfNode(id: NodeId, direction: Direction, isSubchild = false): NodeId[] {
        const children = this.nodes[id].children
        if (isSubchild) {
            return children;
        }
        const middle = Math.ceil(children.length / 2);
        const start = direction === "left" ? 0 : middle;
        const end = direction === "left" ? middle : children.length;
        return children.slice(start, end);
    }

    public getSvgConnectedCardPairIds(): NodeId[][] {
        const nodeIds = Object.keys(this.nodes) as NodeId[];
        const pairs: NodeId[][] = [];
        const mainKnots: NodeId[] = [];

        for (const id of nodeIds) {
            const childIds = this.nodes[id].children;

            if (nodes[id].mainKnot) {
                mainKnots.push(id);
            }

            for (const childId of childIds) {
                pairs.push([id, childId])
            }
        }

        for (let i = 0; i < mainKnots.length; i++) {
            if (mainKnots[i + 1]) {
                pairs.push([mainKnots[i], mainKnots[i + 1]]);
            }
        }

        return pairs;
    }
}
