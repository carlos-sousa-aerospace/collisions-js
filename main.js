"use strict";
import { CanvasController } from "./classes/CanvasController.js";
import { CanvasDrag } from "./classes/CanvasDrag.js";

const root = document.documentElement;
const topMargin = Number.parseFloat(getComputedStyle(root).getPropertyValue("--top-margin"), 10);
const lrbMargin = Number.parseFloat(getComputedStyle(root).getPropertyValue("--lrb-margin"), 10);
const col0MinWidth = Number.parseFloat(getComputedStyle(root).getPropertyValue("--col0-min-width"), 10);
const col1LimWidth = 3 * col0MinWidth; // col1 width = 3 fourths of container width

const canvas = document.getElementById("canvas");
updateCanvas();

// Drawing context
const ctx = canvas.getContext("2d");

// Instantiates the canvas controller
const ccontroller = new CanvasController(canvas.width, canvas.height);
ccontroller.resetShapes(); // Distributes the shapes evenly spaced in the canvas

// Instantiates the canvas dragging functionality
const cdrag = new CanvasDrag(canvas, ccontroller.shapes);

// Force a resize to update css variables and offsets for dragging operations
resizeCanvas();

// Application loop
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the shapes
    cdrag.shapesArray.forEach( shape => shape.draw(ctx) );

    window.requestAnimationFrame(render);
}

// Starts the render loop
render();


//---------------------------------------------------------------------------------//
// Event Listeners
//---------------------------------------------------------------------------------//

// Window resize event listener
window.addEventListener("resize", resizeCanvas, false);

// Reset button event listener
document.getElementById("reset").onclick = resetCanvas;

//---------------------------------------------------------------------------------//
// Functions
//---------------------------------------------------------------------------------//

// Update the width and height of the canvas
function updateCanvas() {
    const lrb = lrbMargin * window.innerWidth / 100;
    const containerWidth = window.innerWidth - 2 * lrb;
    const w = 0.75 * containerWidth;

    if (w < col1LimWidth) {
        canvas.width = containerWidth - col0MinWidth;
    }
    else {
        canvas.width = w;
    }
    canvas.height = window.innerHeight - topMargin - lrb;
}


// Callback function called when browser window is resized
function resizeCanvas() {
    updateCanvas();
    ccontroller.update(canvas.width, canvas.height);

    root.style.setProperty("--canvas-width", canvas.width + "px");
    root.style.setProperty("--canvas-height", canvas.height + "px");

    const bb = canvas.getBoundingClientRect();
    cdrag.offsetX = bb.left;
    cdrag.offsetY = bb.top;
}

// Callback function called when reset button is pressed
function resetCanvas() {
    ccontroller.resetShapes();
    cdrag.reset(ccontroller.shapes);
}