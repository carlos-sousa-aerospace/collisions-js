"use strict";
import { Polygon } from "./classes/Polygon.js";
import { RegularPolygon } from "./classes/RegularPolygon.js";
import { Circle } from "./classes/Circle.js";
import { CanvasDrag } from "./classes/CanvasDrag.js";
import createSVGArrow from "./utility/SVGArrow.js";

const root = document.documentElement;
const topMargin = Number.parseInt(getComputedStyle(root).getPropertyValue("--top-margin"), 10);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Polygon 1
const vertexArray1 = [
    [280, 350],
    [260, 280],
    [190, 260],
    [130, 300],
    [160, 390]
];

// Polygon 2
const vertexArray2 = [
    [150, 200],
    [170, 130],
    [130, 100],
    [30, 150],
    [50, 240]
];

// Shapes array
const shapes = [
    new Polygon(vertexArray1),
    new Polygon(vertexArray2),
    new RegularPolygon(6, 70),
    new RegularPolygon(4, 70),
    new RegularPolygon(3, 70),
    new Circle(70),
    new Circle(40)
];

// Translations to initial positions in canvas space
const tvec = [
    null,
    null,
    [460, 110],
    [700, 185],
    [500, 280],
    [540, 470],
    [750, 350]];

translateShapes(tvec);

// Initialize Display SVG Nodes
const msg = document.getElementById("shape-collisions");

shapes.forEach( shape => {
    shape.svgRoot = document.createElement("div");
    shape.svgRoot.className = "svg-icon";

    // First child is the shape.svg of the shape itself
    shape.svgRoot.appendChild(shape.createSVGShapeProfile());

    // Second child is an svg arrow
    shape.svgRoot.appendChild(createSVGArrow());

    shapes.filter(s => s != shape).forEach(s => shape.svgRoot.appendChild(s.createSVGShapeProfile()));

    msg.appendChild(shape.svgRoot);

    // At this point, the live list returned by root.children is not needed anymore.
    // The live list is copied into an array of elements.
    // Note: Array.from removes the custom property "shape" from the svg element
    shape.svgArray = [...shape.svgRoot.children];
    shape.svgArray.forEach(svg => svg.style.display = "none");
});

function translateShapes(tVecArray) {
    // Translates all shapes according to the input translation vector array
    if (tVecArray.length !== shapes.length) {
        console.error("Input array must have the same length as the shapes array");
    }
    else {
        shapes.forEach( (shape, i) => {
            if (tVecArray[i]) {
                shape.translate(tVecArray[i]);
            }
        });
    }
}


const cdrag = new CanvasDrag(canvas, shapes);

// Window resize
window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
    canvas.width = 0.75 * window.innerWidth;
    canvas.height = window.innerHeight - topMargin - 0.025 * window.innerWidth;

    root.style.setProperty("--canvas-width", canvas.width + "px");
    root.style.setProperty("--canvas-height", canvas.height + "px");

    const bb = canvas.getBoundingClientRect();
    cdrag.offsetX = bb.left;
    cdrag.offsetY = bb.top;
}

// Reset button
document.getElementById("reset").onclick = resetCanvas;

function resetCanvas() {
    shapes.forEach( shape => shape.reset() );
    translateShapes(tvec);
    cdrag.reset();
}

// Application loop
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the shapes
    cdrag.shapesArray.forEach( shape => shape.draw(ctx) );

    window.requestAnimationFrame(render);
}

resizeCanvas();
render();
