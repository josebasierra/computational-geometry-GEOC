
//#region DCEL 

var vertexTable = [];
var vertexCount = 0;

var faceTable = [];
var faceCount = 0;

var edgeTable = [];
var edgeCount = 0;

//hierarchy of triangles used to find face of a point
var rootTriangle = {};

var enclosingTriangleAdded = false;


//p0,p1,p2 are the points defining the enclosing initial triangle (assuming clockwise order)
function initializeDCEL(p0, p1, p2){

	//clean data
	vertexTable = []; vertexCount = 0;
	faceTable = []; faceCount = 0;
	edgeTable = []; edgeCount = 0;

	//init vertices
	vertexTable[0] = {x: p0.x, y: p0.y, e: 0};
	vertexTable[1] = {x: p1.x, y: p1.y, e: 2};
	vertexTable[2] = {x: p2.x, y: p2.y, e: 4};
	vertexCount += 3;

	//init edges  (-1 indicates infinite face)
	edgeTable[0] = {vOrigin: 0, fRight: 0, eN: 2, eTwin: 1};
	edgeTable[1] = {vOrigin: 1, fRight: -1, eN: 5, eTwin: 0};

	edgeTable[2] = {vOrigin: 1, fRight: 0, eN: 4, eTwin: 3};
	edgeTable[3] = {vOrigin: 2, fRight: -1, eN: 1, eTwin: 2};

	edgeTable[4] = {vOrigin: 2, fRight: 0, eN: 0, eTwin: 5};
	edgeTable[5] = {vOrigin: 0, fRight: -1, eN: 3, eTwin: 4};

	edgeCount += 6;

	//init faces
	faceTable[0] = {e: 0}
	faceCount += 1;

	//init triangle hierarchy
	rootTriangle = {e0: 0, e1: 2, e2: 4, subtriangles: []};
}


function addPoint(point){

	//var face = findFace(point);
	var findResult = findFaceHierarchy(point, rootTriangle);
	var face = findResult.face;
	var triangleRef = findResult.triangleRef;

	//TODO: check degenerate case (point on edge/corner)

	var faceEdges = getFaceEdges(face);

	// new identifiers
	var newVertex = vertexCount;
	vertexCount += 1;

	var newFace0 = face;   //reusing index of the face we need to remove
	var newFace1 = faceCount;
	var newFace2 = faceCount + 1;
	faceCount += 2;

	var newEdge0 = edgeCount;
	var newEdge0Twin = edgeCount + 1;
	var newEdge1 = edgeCount + 2;
	var newEdge1Twin = edgeCount + 3;
	var newEdge2 = edgeCount + 4;
	var newEdge2Twin = edgeCount + 5;
	edgeCount += 6;

	// add new vertex
	vertexTable[newVertex] = {x: point.x, y: point.y };

	// add new dual edges
	edgeTable[newEdge0] = {vOrigin: newVertex, fRight: newFace0, eN: faceEdges[0], eTwin: newEdge0Twin};
	edgeTable[newEdge0Twin] = {vOrigin: edgeTable[faceEdges[0]].vOrigin, fRight: newFace2, eN: newEdge2, eTwin: newEdge0};

	edgeTable[newEdge1] = {vOrigin: newVertex, fRight: newFace1, eN: faceEdges[1], eTwin: newEdge1Twin};
	edgeTable[newEdge1Twin] = {vOrigin: edgeTable[faceEdges[1]].vOrigin, fRight: newFace0, eN: newEdge1, eTwin: newEdge1};

	edgeTable[newEdge2] = {vOrigin: newVertex, fRight: newFace2, eN: faceEdges[2], eTwin: newEdge2Twin};
	edgeTable[newEdge2Twin] = {vOrigin: edgeTable[faceEdges[2]].vOrigin, fRight: newFace1, eN: newEdge0, eTwin: newEdge2};

	// remove face & add new faces
	faceTable[newFace0] = {e: newEdge0};
	faceTable[newFace1] = {e: newEdge1};
	faceTable[newFace2] = {e: newEdge2};

	// update old edges
	edgeTable[faceEdges[0]].fRight = newFace0;
	edgeTable[faceEdges[1]].fRight = newFace1;
	edgeTable[faceEdges[2]].fRight = newFace2;

	edgeTable[faceEdges[0]].eN = newEdge1Twin;
	edgeTable[faceEdges[1]].eN = newEdge2Twin;
	edgeTable[faceEdges[2]].eN = newEdge0Twin;

	//update hierarchy
	triangleRef.subtriangles = [
		{e0: newEdge0, e1: faceEdges[0] , e2: newEdge1Twin , subtriangles: []},
		{e0: newEdge1, e1: faceEdges[1] , e2: newEdge2Twin , subtriangles: []},
		{e0: newEdge2, e1: faceEdges[2] , e2: newEdge0Twin , subtriangles: []}
	]
}


// Slow version, linear time
function findFace(point){
	for (var i = 0; i < faceTable.length; i++) {
		var faceVertices = getFaceVertices(i);
		if (isPointInTriangle(point, [ vertexTable[faceVertices[0]], vertexTable[faceVertices[1]], vertexTable[faceVertices[2]] ])) {
			return i;
		} 
	}
	return 0;
}

// Improved version, log(n) complexity in average if balanced hierarchy
function findFaceHierarchy(point, triangle){

	// base case
	if (triangle.subtriangles.length == 0) {
		return {face: edgeTable[triangle.e0].fRight, triangleRef: triangle};
	}

	// recursion
	var subtriangles = triangle.subtriangles;
	for (var i = 0; i < subtriangles.length; i++){

		var currentTriangle = subtriangles[i];
		var v0 = edgeTable[currentTriangle.e0].vOrigin;
		var v1 = edgeTable[currentTriangle.e1].vOrigin;
		var v2 = edgeTable[currentTriangle.e2].vOrigin;

		if (isPointInTriangle(point, [ vertexTable[v0], vertexTable[v1], vertexTable[v2] ])){
			return findFaceHierarchy(point, currentTriangle);
		}
	}
	return null;
}


function getFaceEdges(faceIndex){
	var edges = new Array(3);

	edges[0] = faceTable[faceIndex].e;
	edges[1] = edgeTable[edges[0]].eN;
	edges[2] = edgeTable[edges[1]].eN;

	return edges;
}


function getFaceVertices(faceIndex){
	var vertices = new Array(3);
	var edges = getFaceEdges(faceIndex);

	vertices[0] = edgeTable[edges[0]].vOrigin;
	vertices[1] = edgeTable[edges[1]].vOrigin;
	vertices[2] = edgeTable[edges[2]].vOrigin;

	return vertices;
}

//#endregion


// #region Triangulation

function computeTriangulation(points) {

	prependEnclosingTriangle(points);

	initializeDCEL(points[0], points[1], points[2]);
	for (var i = 3; i < points.length; i++){
		addPoint(points[i]);
	}

	var outputTriangles = new Array(faceTable.length); 
	for (i=0; i<outputTriangles.length; i++) {
		var faceVertices = getFaceVertices(i);
		outputTriangles[i] = [faceVertices[0], faceVertices[1], faceVertices[2]]; // Store INDICES, not points
	}
	return outputTriangles;
}


function prependEnclosingTriangle(points){
	if (enclosingTriangleAdded) return;

	var box = getBoundingBox(points);

	var xOffset = (box.xmax - box.xmin)*0.1;
	var yOffset = (box.ymax - box.ymin)*0.1;

	var p0 = {
		x: (box.xmin + box.xmax)/2, 
		y: box.ymax + (box.ymax - box.ymin)
	};
	var p1 = {
		x: box.xmax + (box.xmax - box.xmin)/2 + xOffset, 
		y: box.ymin - yOffset
	};
	var p2 = {
		x: box.xmin - (box.xmax - box.xmin)/2 - xOffset, 
		y: box.ymin - yOffset
	};

	
	points.unshift(p0,p1,p2);
	enclosingTriangleAdded = true;
}

// #endregion


//#region Utility functions

function getBoundingBox(points) {
	var xmin, xmax, ymin, ymax;
	xmin = xmax = points[0].x;
	ymin = ymax = points[0].y;

	points.forEach(point => {
		if(point.x < xmin) xmin = point.x;
		else if (point.x > xmax) xmax = point.x;

		if(point.y < ymin) ymin = point.y;
		else if (point.y > ymax) ymax = point.y;
	});

	return {xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax};
}


function det(p, q, r){
	return (q.x - p.x)*(r.y - p.y) - (r.x - p.x)*(q.y - p.y);
}


function isPointInTriangle(p, triangle) {

	//determinant signs of the triangles segments
	var d_s1 = Math.sign(det(triangle[0], triangle[1], p));
	var d_s2 = Math.sign(det(triangle[1], triangle[2], p));
	var d_s3 = Math.sign(det(triangle[2], triangle[0], p));
	
	//we check where the point lies for every segment (-1:'sideA, 0:'onLine', 1:sideB) to study its case
	var insideTriangle = (d_s1 == d_s2 && d_s1 == d_s3);
	var onEdge =  (d_s1 == 0 && d_s2 == d_s3) || (d_s2 == 0 && d_s1 == d_s3) || (d_s3 == 0 && d_s1 == d_s2);
	var onCorner = Math.abs(d_s1) + Math.abs(d_s2) + Math.abs(d_s3) == 1;
  
	return (insideTriangle || onEdge || onCorner);
  }

  //#endregion





