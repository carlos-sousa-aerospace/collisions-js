import { Shape } from "./Shape.js";

export class CanvasDrag {
    constructor(canvas, shapesArray) {
        this.shapesArray = [...shapesArray]; // Shallow copy

        const bb = canvas.getBoundingClientRect();
        this.offsetX = bb.left;
        this.offsetY = bb.top;

        this.startX;
        this.startY;
        this.isDragging = false;
        this.activeShape = null;

        document.getElementById("x-coord").innerText = "X:\xa00.0";
        document.getElementById("y-coord").innerText = "Y:\xa00.0";

        this.initCollisionLists();

        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmouseup = this.mouseUp.bind(this);
        canvas.onmousemove = this.mouseMove.bind(this);
    }

    initCollisionLists() {
        const len = this.shapesArray.length;
        for (let i = 0, ilen = len - 1; i < ilen; i++) {
            const a = this.shapesArray[i];
            for (let j = i + 1; j < len; j++) {
                const b = this.shapesArray[j];
                if (a.isColliding(b) && !a.collisionList.includes(b)) {
                    a.collisionList.push(b);
                    a.svgArray.find(svg => svg.shape === b).style.display = "initial";

                    b.collisionList.push(a);
                    b.svgArray.find(svg => svg.shape === a).style.display = "initial";
                }
            }
        }

        // Shapes with non-empty collisionList should be stroked red
        // Shapes with empty collisionList should be stroked blue
        this.shapesArray.forEach( shape => {
            if (shape.collisionList.length) {
                if (shape.strokeStyle === Shape.regularStrokeStyle) {
                    shape.strokeStyle = Shape.collisionStrokeStyle;
                }

                shape.svgArray[0].style.display = "initial";
                shape.svgArray[1].style.display = "initial";
                shape.svgRoot.style.display = "block";

                if (shape.collisionList.length === 1) {
                    const tvec = shape.isColliding(shape.collisionList[0]);
                    shape.translateMTV(tvec);
                }
            }
            else {
                if (shape.strokeStyle === Shape.collisionStrokeStyle) {
                    shape.strokeStyle = Shape.regularStrokeStyle;
                }

                shape.svgArray[0].style.display = "none";
                shape.svgArray[1].style.display = "none";
                shape.svgRoot.style.display = "none";
            }
        });
    }

    reset(shapesArray) {
        this.shapesArray = [...shapesArray]; // Shallow copy
        const bb = canvas.getBoundingClientRect();
        this.offsetX = bb.left;
        this.offsetY = bb.top;
        this.isDragging = false;
        this.activeShape = null;

        // Reset collision lists and SVG Collision Nodes
        this.shapesArray.forEach( shape => shape.reset() );

        this.initCollisionLists();
    }

    addCollision(shape1, shape2){
        if (!shape1.collisionList.length) {
            shape1.strokeStyle = Shape.collisionStrokeStyle;
            shape1.svgArray[0].style.display = "initial";
            shape1.svgArray[1].style.display = "initial";
            shape1.svgRoot.style.display = "block";
        }

        shape1.collisionList.push(shape2);
        shape1.svgArray.find(svg => svg.shape === shape2).style.display = "initial";
    }

    removeCollision(shape1, shape2) {
        const idx = shape1.collisionList.indexOf(shape2);

        if (idx !== -1) {
            shape1.collisionList.splice(idx, 1);
            shape1.svgArray.find(svg => svg.shape === shape2).style.display = "none";

            if (!shape1.collisionList.length) {
                shape1.strokeStyle = Shape.regularStrokeStyle;
                shape1.svgArray[0].style.display = "none";
                shape1.svgArray[1].style.display = "none";
                shape1.svgRoot.style.display = "none";
            }
        }
    }

    mouseDown(event) {
        event.preventDefault();
        event.stopPropagation();

        this.startX = event.clientX - this.offsetX;
        this.startY = event.clientY - this.offsetY;

        // Check shapes with hit region under mouse
        // Search in reverse order, because active shape will be at the end of the array

        if (this.shapesArray.length) {
            let i = this.shapesArray.findIndex(shape => shape.hitTest(this.startX, this.startY));
    
            if ( i !== -1 ) {
                this.activeShape = this.shapesArray[i];
                this.activeShape.activate();
                this.isDragging = true;
                
                // Z order Sorting for drawing
                // This ensures that the active shape is always on top
                const lastIdx = this.shapesArray.length - 1;
                if (i < lastIdx) {
                    while (i < lastIdx) {
                        this.shapesArray[i] = this.shapesArray[++i];
                    }
                    this.shapesArray[i] = this.activeShape;
                }
            }
        }
    }
    
    mouseUp(event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.activeShape) {
            this.activeShape.deactivate();
            this.activeShape = null;
            this.isDragging = false;
        }

        // Compute translation vectors
        const shapes = this.shapesArray.filter(shape => shape.collisionList.length === 1);
        let a, b, i, tVec;
        while (shapes.length) {
            a = shapes.pop();
            b = a.collisionList[0];
            tVec = a.isColliding(b);
            a.translateMTV(tVec);
            b.translateMTV([-tVec[0], -tVec[1]]);
            i = shapes.indexOf(b);
            if (i !== -1) {
                shapes.splice(i, 1);
            }
        }
    }
    
    mouseMove(event) {
        event.preventDefault();
        event.stopPropagation();

        const x = event.clientX - this.offsetX;
        const y = event.clientY - this.offsetY;

        document.getElementById("x-coord").innerText = `X:\xa0${x.toFixed(1)}`;
        document.getElementById("y-coord").innerText = `Y:\xa0${y.toFixed(1)}`;

        if (this.isDragging && this.activeShape) {
            // Compute translation vector based on current mouse position
            const dx = x - this.startX;
            const dy = y - this.startY
            this.activeShape.translate([dx, dy]);

            // Check collision between any two shapes
            // Since the shapes array is sorted such that the active shape is the last element
            // there is no need to test the active shape against the last element (itself)
            for (let i = 0, testShape, tVec, len = this.shapesArray.length - 1; i < len; i++) {
                testShape = this.shapesArray[i];
                tVec = this.activeShape.isColliding(testShape);

                if (tVec) {
                    if (!( this.activeShape.collisionList.length && this.activeShape.collisionList.includes(testShape) )) {
                            this.addCollision(this.activeShape, testShape);
                            this.addCollision(testShape, this.activeShape);
                    }

                    if (this.activeShape.collisionList.length === 1) {
                        this.activeShape.translateMTV(tVec);
                    }
                }
                else if (this.activeShape.collisionList.length && this.activeShape.collisionList.includes(testShape)) {
                    this.removeCollision(this.activeShape, testShape);
                    this.removeCollision(testShape, this.activeShape);
                }
            }

            // Update start position
            this.startX = x;
            this.startY = y;
        }
    }
}