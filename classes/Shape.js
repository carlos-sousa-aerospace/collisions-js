// This is the Parent class for all geometric objects
// It represents a basic shape defined by its vertices
// A shape does not have direct information about its edge length and other intrinsic properties
// Defines a mouse hit circle for mouse operations like dragging

export class Shape {
    // Internal colors for styling the shape
    static regularStrokeStyle = "#0095DD";
    static regularFillStyle = "rgba(240, 245, 255, 0.80)";
    static activeFillStyle = "rgba(140, 254, 180, 0.75)";
    static collisionStrokeStyle = "rgba(254, 100, 110, 1.0)";
    static hitRegionStrokeStyle = "rgba(200, 120, 70, 0.9)";
    static hitRegionFillStyle = "rgba(200, 120, 70, 0.4)";
    static mtvShapeStrokeStyle = "#000";

    constructor(vertices = null) {
        if (vertices && Array.isArray(vertices)) {
            this.vertices = vertices
            this.vertexCount = vertices.length; // Number of distinct vertices of polygon

            // Needed for circular loops
            // Note that only the reference to the first element is pushed!
            // Changing the first element also changes the last
            this.vertices.push(this.vertices[0]);

            // Centroid of hit circular region for canvas dragging
            this.centroid = this.getCentroid();
        }
        else {
            // Represents a curved shape with no vertices (no cusps)
            // The actual geometry of the shape is handled in the subclass
            this.vertices = [];
            this.vertexCount = 0;
            this.centroid = [0, 0];
        }

        // Keeps track of every shape that is colliding with this shape
        this.collisionList = [];

        // Array of SVG shape profiles for display active collisions
        this.svgArray;

        // Root node of the SVG shape profiles
        this.svgRoot;

        // Centroid and radius of hit circular region for canvas dragging
        this.hitRadius = 10;

        // Active flag to indicate that the shape is currently selected
        this.active = false;

        // Flag to indicate if shape is draggable
        this.draggable = true;

        // The MTV Shape properties
        this.mtvVertices = [];

        // Style properties
        this.strokeStyle = Shape.regularStrokeStyle;
        this.fillStyle = Shape.regularFillStyle;
    }

    get vCount() {
        return this.vertexCount;
    }

    get vertexArray() {
        // Returns a copy without the duplicate last vertex
        return this.vertices.slice(0, this.vertexCount);
    }

    get vertexCircularArray() {
        return this.vertices;
    }

    get isActive() {
        return this.active;
    }

    updateEdgeLengths() {
        // Actual size of this.vertices is this.vertexCount+1
        // Last element is passed by reference and is equal to the first element
        const out = new Array(this.vertexCount);
        for (let i = 0, j = 1; i < this.vertexCount; i++, j++) {
            out[i] = Math.sqrt((this.vertices[j][0] - this.vertices[i][0])**2 + (this.vertices[j][1] - this.vertices[i][1])**2);
        }
        return out;
    }

    getCentroid() {
        // Computes centroid of non-intersecting polygon defined by its vertices
        let area = 0;
        let x = 0;
        let y = 0;
        for (let i = 0, j = 1, tmp; i < this.vertexCount; i++, j++) {
            tmp = this.vertices[i][0] * this.vertices[j][1] - this.vertices[j][0] * this.vertices[i][1];
            area += tmp;
            x += (this.vertices[i][0] + this.vertices[j][0]) * tmp;
            y += (this.vertices[i][1] + this.vertices[j][1]) * tmp;
        }
        area *= 3;
        x /= area;
        y /= area;
        return [x, y];
    }

    xmax() {
        // Return value is positive and calculated with respect to the shape's centroid
        const va = this.vertexArray;
        return Math.abs(va.reduce((a, b) => Math.max(a, b[0]), va[0][0]) - this.centroid[0]);
    }

    xmin() {
        // Return value is positive and calculated with respect to the shape's centroid
        const va = this.vertexArray;
        return Math.abs(va.reduce((a, b) => Math.min(a, b[0]), va[0][0]) - this.centroid[0]);
    }

    ymax() {
        // Return value is positive and calculated with respect to the shape's centroid
        const va = this.vertexArray;
        return Math.abs(va.reduce((a, b) => Math.max(a, b[1]), va[0][1]) - this.centroid[1]);
    }

    ymin() {
        // Return value is positive and calculated with respect to the shape's centroid
        const va = this.vertexArray;
        return Math.abs(va.reduce((a, b) => Math.min(a, b[1]), va[0][1]) - this.centroid[1]);
    }

    translate(tVector) {
        // Note that this loop changes the last element of this.vertices
        // at index i = this.vertexCount because it was copied by reference
        for (let i = 0; i < this.vertexCount; i++) {
            this.vertices[i][0] += tVector[0];
            this.vertices[i][1] += tVector[1];
        }

        // Translate centroid of shape (center of hit region)
        this.centroid[0] += tVector[0];
        this.centroid[1] += tVector[1];
    }

    translateX(x) {
        for (let i = 0; i < this.vertexCount; i++) {
            this.vertices[i][0] += x;
        }
    }

    translateY(y) {
        for (let i = 0; i < this.vertexCount; i++) {
            this.vertices[i][1] += y;
        }
    }

    reset() {
        this.collisionList = [];
        this.svgArray.forEach( svg => svg.style.display = "none" );
        this.svgRoot.style.display = "none";
        this.mtvVertices = [];
    }

    hitTest(x, y) {
        // Checks if point with coordinates x, y is inside the hit region
        return Math.sqrt( (this.centroid[0] - x)**2 + (this.centroid[1] - y)**2 ) < this.hitRadius;
    }

    activate() {
        this.fillStyle = Shape.activeFillStyle;
        this.svgArray[0].firstElementChild.style.fill = Shape.activeFillStyle;
        this.active = true;
    }

    deactivate() {
        this.fillStyle = Shape.regularFillStyle;
        this.svgArray[0].firstElementChild.style.fill = Shape.regularFillStyle;
        this.active = false;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.vertices[0][0], this.vertices[0][1]);
        for (let i = 1; i < this.vertexCount; i++) {
            context.lineTo(this.vertices[i][0], this.vertices[i][1]);
        }
        context.closePath();
        context.fillStyle = this.fillStyle;
        context.fill();
        context.strokeStyle = this.strokeStyle;
        context.stroke();

        // Hit region
        if (this.draggable) {
            context.beginPath();
            context.arc(this.centroid[0], this.centroid[1], this.hitRadius, 0, 2 * Math.PI, true);
            context.fillStyle = Shape.hitRegionFillStyle;
            context.fill();
            context.strokeStyle = Shape.hitRegionStrokeStyle;
            context.stroke();
        }

        // Translated Shape by the MTV
        if (this.active && this.collisionList.length === 1) {
            context.beginPath();
            context.moveTo(this.mtvVertices[0][0], this.mtvVertices[0][1]);
            for (let i = 1; i < this.vertexCount; i++) {
                context.lineTo(this.mtvVertices[i][0], this.mtvVertices[i][1]);
            }
            context.closePath();
            context.strokeStyle = Shape.mtvShapeStrokeStyle;
            context.stroke();
        }
    }

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

        const shapeNode = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        // Scale the coordinates and then join
        const scale = 0.18;
        const points = this.vertexArray.map( pt => pt.map( (c, i) => scale * (c - this.centroid[i]) +  box[i]/2).join() ).join(" ");
        shapeNode.setAttributeNS(null, "points", points);
        shapeNode.setAttributeNS(null, "fill", Shape.regularFillStyle);
        shapeNode.setAttributeNS(null, "stroke", Shape.regularStrokeStyle);
        
        svgNode.appendChild(shapeNode);
        return svgNode;
    }

    projectPolygon(nx, ny) {
        // Projects polygon vertices along free axis
        // Arguments:
        //      nx is the x coordinate of the normal to the edge being tested
        //      ny is the y coordinate of the normal to the edge being tested
        let max, min;
        max = min = this.vertices[0][0] * nx + this.vertices[0][1] * ny;
        for (let i = 1, p; i < this.vertexCount; i++) {
            p = this.vertices[i][0] * nx + this.vertices[i][1] * ny;

            if (p > max) {
                max = p;
            }
            else if (p < min) {
                min = p;
            }
        }
        return [min, max];
    }

    projectPolygonJ(nx, ny, j) {
        // Projects polygon vertices along axis aligned with the normal vector to
        // the edge defined by vertices P_(j-1) and P_j
        // Projection of vertex P_j is skiped because it is the same value as the
        // projection of P_(j-1)
        // Arguments:
        //      nx is the x coordinate of the normal to the edge being tested
        //      ny is the y coordinate of the normal to the edge being tested
        //      j is the index of the redundant vertex P_j at the edge being tested
        let max, min;
        max = min = this.vertices[0][0] * nx + this.vertices[0][1] * ny;
        for (let i = 1, p; i < this.vertexCount; i++) {
            if (i !== j) {
                p = this.vertices[i][0] * nx + this.vertices[i][1] * ny;

                if (p > max) {
                    max = p;
                }
                else if (p < min) {
                    min = p;
                }
            }
        }
        return [min, max];
    }

    // Checks if two convex polygons or a polygon and a circle are colliding with each other.
    // It implements the Separating Axes Theorem and computes the Minimum Translation Vector
    isColliding(shape) {

        const a = this.mtv(shape);

        if (!a) { return false; }

        const b = shape.mtv(this);

        if (!b) { return false; }

        if (Math.abs(a[0]) < Math.abs(b[0])) {
            return [a[0] * a[1], a[0] * a[2]];
        }
        else {
            // Invert sign of the mtv
            return [-b[0] * b[1], -b[0] * b[2]];
        }
    }

    translateMTV(tVector) {
        this.mtvVertices = Array.from( this.vertices, v => [v[0] + tVector[0], v[1] + tVector[1]] );
    }
}