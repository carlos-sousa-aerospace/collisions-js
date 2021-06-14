// Defines a Circle

import { Shape } from "./Shape.js";

export class Circle extends Shape {
    constructor (radius) {
        // Superclass constructor initializes centroid with this.getCentroid() of subclass
        // The centroid is equal to the centerpoint of the circle at (0, 0)
        super();

        // Coordinates of center of circle
        this.radius = radius;
    }

    getCentroid() {
        return this.centroid; // Centroid is at the coordinate (0,0) of any regular polygon
    }

    xmax() {
        return this.radius;
    }

    xmin() {
        return this.radius;
    }

    ymax() {
        return this.radius;
    }

    ymin() {
        return this.radius;
    }

    translate(tVector) {
        // Translate centroid of shape (center of hit region)
        this.centroid[0] += tVector[0];
        this.centroid[1] += tVector[1];
    }

    translateX(x) {
        this.centroid[0] += x;
    }

    translateY(y) {
        this.centroid[1] += y;
    }

    projectPolygon(nx, ny) {
        const p = this.centroid[0] * nx + this.centroid[1] * ny;
        return [p - this.radius, p + this.radius];
    }

    // Computes and returns the unit vector that defines an axis that passes through the
    // centroid of this circle and the closest vertex of the input shape. The vector points
    // from the closest point to the centroid of the circle.
    // Input shape must be a polygon or regular polygon defined by its vertices
    vectorFromClosestVertexOf(shape) {
        let v = shape.vertices[0];
        let mx = this.centroid[0] - v[0];
        let my = this.centroid[1] - v[1];
        let m = mx**2 + my**2; // Min distance squared
        for (let i = 1, u, nx, ny, n; i < shape.vertexCount; i++) {
            u = shape.vertices[i];
            nx = this.centroid[0] - u[0];
            ny = this.centroid[1] - u[1];
            n = nx**2 + ny**2;
            if (n < m) {
                m = n;
                mx = nx;
                my = ny;
            }
        }

        m = Math.sqrt(m);
        return [ mx/m, my/m ];
    }

    mtv(shape) {
        if (shape instanceof Circle) {
            // Compute difference between center of circles
            let mx = this.centroid[0] - shape.centroid[0];
            let my = this.centroid[1] - shape.centroid[1];
            let m = mx**2 + my**2;

            if ( m < (this.radius + shape.radius)**2 ) {
                // No gap found. Collision detected
                m = Math.sqrt(m);
                return [ this.radius + shape.radius - m, mx/m, my/m ];
            }
            else {
                // Gap found. There is no collision
                return null;
            }
        }
        else {
            // Corner cases when shape is a circle
            const [mx, my] = this.vectorFromClosestVertexOf(shape);

            // Compute projections of this circle
            const [aMin, aMax] = this.projectPolygon(mx, my);

            // Compute projections of input polygon
            const [bMin, bMax] = shape.projectPolygon(mx, my);
            
            // Check if gap is found
            if (aMin > bMax || bMin > aMax) {
                return null; // Gap found. There is no collision
            }

            // No Gap found. Compute minimum overlap
            const m = aMin > bMin? bMax - aMin : bMin - aMax;
            
            return [m, mx, my];
        }
    }

    // Overide
    draw(context) {
        // Circle
        context.beginPath();
        context.arc(this.centroid[0], this.centroid[1], this.radius, 0, 2 * Math.PI, true);
        context.fillStyle = this.fillStyle;
        context.fill();
        context.strokeStyle = this.strokeStyle;
        context.stroke();

        // Hit region
        context.beginPath();
        context.arc(this.centroid[0], this.centroid[1], this.hitRadius, 0, 2 * Math.PI, true);
        context.fillStyle = Shape.hitRegionFillStyle;
        context.fill();
        context.strokeStyle = Shape.hitRegionStrokeStyle;
        context.stroke();

        // Translated Shape by the MTV
        if (this.active && this.collisionList.length === 1) {
            context.beginPath();
            context.arc(this.mtvCentroid[0], this.mtvCentroid[1], this.radius, 0, 2 * Math.PI, true);
            context.strokeStyle = Shape.mtvShapeStrokeStyle;
            context.stroke();
        }
    }

    // Overide
    createSVGShapeProfile() {
        // Generates an SVG icon to display inside the messages div
        const box = [28, 28]; // Width and Height of the svg box
        const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgNode.setAttributeNS(null, "viewBox", `0 0 ${box[0]} ${box[1]}`);
        svgNode.setAttributeNS(null, "width", box[0]);
        svgNode.setAttributeNS(null, "height", box[1]);

        Object.defineProperty(svgNode, "shape", {
            value: this,
            writable: false,
            configurable: false,
            enumerable: false
        });

        const shapeNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        // Scale the coordinates and then join
        const scale = 0.18;
        shapeNode.setAttributeNS(null, "cx", box[0] / 2);
        shapeNode.setAttributeNS(null, "cy", box[1] / 2);
        shapeNode.setAttributeNS(null, "r", scale * this.radius);
        shapeNode.setAttributeNS(null, "fill", Shape.regularFillStyle);
        shapeNode.setAttributeNS(null, "stroke", Shape.regularStrokeStyle);
        
        svgNode.appendChild(shapeNode);
        return svgNode;
    }

    translateMTV(tVector) {
        this.mtvCentroid = [this.centroid[0] + tVector[0], this.centroid[1] + tVector[1]];
    }

    // Overide. Addresses the collision test case between two circles
    isColliding(shape) {
        if (shape instanceof Circle) {
            const a = this.mtv(shape);
            if (a) {
                return [a[0] * a[1], a[0] * a[2]];
            }
            else {
                return false;
            }
        }

        return super.isColliding(shape);
    }
}