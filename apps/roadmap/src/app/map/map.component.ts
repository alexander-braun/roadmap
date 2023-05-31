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
    }

    ngOnInit(): void { }

    private generateSections(): NodeId[] {
        return Object.keys(this.nodes).reduce((acc, curr) => {
            return this.nodes[curr].mainKnot ? [...acc, curr] : acc;
        }, [] as string[])
    }

    public generateChildrenOfNode(id: NodeId, direction: Direction): NodeId[] {
        const children = this.nodes[id].children
        const middle = Math.ceil(children.length / 2);
        const start = direction === "left" ? 0 : middle;
        const end = direction === "left" ? middle : children.length;
        return children.slice(start, end);
    }
}
