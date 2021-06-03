// Defines a closed and convex polygon object

import { Shape } from "./Shape.js";

export class Polygon extends Shape {
    constructor(vertices) {
        super(vertices);
        this.edgeLengths = this.updateEdgeLengths();
    }

    get edgeLengthArray() {
        return this.edgeLengths;
    }

    // Computes the MTV (Minimum Translation Vector) between this polygon and the input shape
    // Returns the MTV if no gap is found otherwise returns null
    mtv(shape) {
        //--------------------------------------------------------------------
        // First iteration
        //--------------------------------------------------------------------

        // Pre-computed edge length to get normal unit vector
        let edgeLength = this.edgeLengths[0];

        // Coordinates of the normal vector aligned with the projection axis
        let mx = (this.vertices[0][1] - this.vertices[1][1]) / edgeLength;
        let my = (this.vertices[1][0] - this.vertices[0][0]) / edgeLength;

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
            n = this.edgeLengths[i];
            nx = (this.vertices[i][1] - this.vertices[j][1]) / n;
            ny = (this.vertices[j][0] - this.vertices[i][0]) / n;
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