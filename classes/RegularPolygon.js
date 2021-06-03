// Defines a closed, convex and regular polygon object

import { Shape } from "./Shape.js";

export class RegularPolygon extends Shape {
    constructor(edgeCount, radius = 100) {
        const alpha = Math.PI / edgeCount; // Rotation of the regular polygon relative to x axis
        const theta = 2 * alpha;
        const vertices = Array.from({length: edgeCount}, (_, i) => [
            radius * Math.cos(i * theta + alpha),
            - radius * Math.sin(i * theta + alpha) // Negative sign because coord sys has positive Y downwards
        ]);

        super(vertices); // Parent constructor

        this.radius = radius;
        this.edgeLength = 2 * radius * Math.sin(Math.PI / edgeCount);
    }

    get edgeLengthArray() {
        return this.edgeLengths;
    }

    // Computes the MTV (Minimum Translation Vector) between this regular polygon and the input shape
    // Returns the MTV if no gap is found otherwise returns null
    mtv(shape) {
        //--------------------------------------------------------------------
        // First iteration
        //--------------------------------------------------------------------

        // Coordinates of the normal vector aligned with the projection axis
        let mx = (this.vertices[0][1] - this.vertices[1][1]) / this.edgeLength;
        let my = (this.vertices[1][0] - this.vertices[0][0]) / this.edgeLength;

        // Compute projections of this polygon into this axis
        let [aMin, aMax] = this.projectPolygonJ(mx, my, 1);

        // Compute projections of input polygon into this axis
        let [bMin, bMax] = shape.projectPolygon(mx, my);
        
        // Check if gap is found
        if (aMin > bMax || bMin > aMax) {
            return null; // Gap found. There is no collision
        }

        // No Gap found. Compute first overlap
        let m = aMin > bMin? bMax - aMin : bMin - aMax;

        //--------------------------------------------------------------------
        // Second iteration onwards
        //--------------------------------------------------------------------

        for (let i = 1, j = 2, nx, ny, n; i < this.vertexCount; i++, j++) {
            nx = (this.vertices[i][1] - this.vertices[j][1]) / this.edgeLength;
            ny = (this.vertices[j][0] - this.vertices[i][0]) / this.edgeLength;
            [aMin, aMax] = this.projectPolygonJ(nx, ny, j);
            [bMin, bMax] = shape.projectPolygon(nx, ny);
            
            if (aMin > bMax || bMin > aMax) {
                return null; // Gap found. There is no collision
            }

            // No Gap found. Compute minimum overlap
            n = aMin > bMin? bMax - aMin : bMin - aMax;

            if (Math.abs(n) < Math.abs(m)) {
                m = n;
                mx = nx;
                my = ny;
            }
        }

        // No Gap found. There is collision between this polygon and the test shape
        // Returns the mtv
        return [m, mx, my];
    }
}