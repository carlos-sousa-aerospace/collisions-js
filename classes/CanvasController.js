// This class generates the geometric shapes to render in the 2D canvas
// It positions the shapes in the canvas according to the width and height of the canvas
// Such that relative distances are preserved

import { Polygon } from "./Polygon.js";
import { RegularPolygon } from "./RegularPolygon.js";
import { Circle } from "./Circle.js";
import createSVGArrow from "../utility/SVGArrow.js";

export class CanvasController {
    // Input: width and height of canvas
    constructor(width, height) {
        // Canvas width and height
        this.width = width;
        this.height = height;

        // Random convex polygons

        // Polygon 1
        this.vertexArray1 = [
            [280, 350],
            [260, 280],
            [190, 260],
            [130, 300],
            [160, 390]
        ];

        // Polygon 2
        this.vertexArray2 = [
            [150, 200],
            [170, 130],
            [130, 100],
            [30, 150],
            [50, 240]
        ];

        // Array with 7 shapes
        this.shapes = [
            new Polygon(this.vertexArray1),
            new Polygon(this.vertexArray2),
            new RegularPolygon(6, 70),
            new RegularPolygon(4, 70),
            new RegularPolygon(3, 70),
            new Circle(70),
            new Circle(40)
        ];

        // Margin for positioning such that shapes do not touch canvas border
        // Given as a percentage of width and height of the canvas
        this.rl = 0.05 * width;
        this.tb = 0.05 * height;

        // Initialize Display SVG Nodes
        const msg = document.getElementById("shape-collisions");

        this.shapes.forEach( shape => {
            shape.svgRoot = document.createElement("div");
            shape.svgRoot.className = "svg-icon";

            // First child is the shape.svg of the shape itself
            shape.svgRoot.appendChild(shape.createSVGShapeProfile());

            // Second child is an svg arrow
            shape.svgRoot.appendChild(createSVGArrow());

            this.shapes.filter(s => s != shape).forEach(s => shape.svgRoot.appendChild(s.createSVGShapeProfile()));

            msg.appendChild(shape.svgRoot);

            // At this point, the live list returned by root.children is not needed anymore.
            // The live list is copied into an array of elements.
            // Note: Array.from removes the custom property "shape" from the svg element
            shape.svgArray = [...shape.svgRoot.children];
            shape.svgArray.forEach(svg => svg.style.display = "none");
        });
    }

    resetShapes() {
        // Calculates and applies the translation vectors needed to displace
        // each shape such that they are uniformly distributed in the canvas space and
        // arranged into a linear pattern
        // Works for a distribution of 7 shapes

        // Translate all shapes to origin. The tanslation base point is the shape's centroid
        // Only take into account nonzero centroid coordinates
        this.shapes.filter( shape => shape.centroid[0] ).forEach( shape => {
            shape.translateX(-shape.centroid[0]);
            shape.centroid[0] = 0;
        });

        this.shapes.filter( shape => shape.centroid[1] ).forEach( shape => {
            shape.translateY(-shape.centroid[1]);
            shape.centroid[1] = 0;
        });

        // Shape 0
        let x = (this.width + this.rl) / 3;
        let y = this.tb + this.shapes[0].ymax();
        this.shapes[0].translate([x, y]);

        // Shape 5
        // Shares x coordinate
        y = this.height - this.tb - this.shapes[5].ymin();
        this.shapes[5].translate([x, y]);

        // Shape 1
        x = (2 * this.width - this.rl) / 3;
        y = this.tb + this.shapes[1].ymax();
        this.shapes[1].translate([x, y]);

        // Shape 6
        // Shares x coordinate
        y = this.height - this.tb - this.shapes[6].ymin();
        this.shapes[6].translate([x, y]);

        // Shape 2
        x = this.rl + this.shapes[2].xmin();
        y = this.height / 2;
        this.shapes[2].translate([x, y]);

        // Shape 3
        x = this.width / 2;
        // Shares the same y coordinate as shape 2
        this.shapes[3].translate([x, y]);

        // Shape 4
        x = this.width - this.rl - this.shapes[4].xmax();
        // Shares the same y coordinate as shape 2
        this.shapes[4].translate([x, y]);
    }

    // Update controller variables on window resize
    update(width, height) {
        this.width = width;
        this.height = height;
        this.rl = 0.05 * width;
        this.tb = 0.05 * height;
    }
}