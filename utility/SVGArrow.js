export default function() {
    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgNode.setAttributeNS(null, "viewBox", `0 0 26 26`);
    svgNode.setAttributeNS(null, "width", "26");
    svgNode.setAttributeNS(null, "height", "26");

    const shapeNode = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

    shapeNode.setAttributeNS(null, "points", "5,10 15,11 15,7 25,14 15,21 15,17 5,18");
    shapeNode.setAttributeNS(null, "fill", "white");
    shapeNode.setAttributeNS(null, "stroke", "black");
    shapeNode.setAttributeNS(null, "stroke-width", "1.5");

    svgNode.appendChild(shapeNode);
    return svgNode;
}