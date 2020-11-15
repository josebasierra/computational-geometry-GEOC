
//#region  DCEL 

var vertexTable = [];
var vertexCount = 0;

var faceTable = [];
var faceCount = 0;

var edgeTable = [];
var edgeCount = 0;

var enclosingTriangleAdded = false;


//p0,p1,p2 are the points defining the enclosing initial triangle
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

	var f1,f2;
	if (det(vertexTable[0], vertexTable[1], vertexTable[2]) < 0){  //check face side
		f1 = 0;
		f2 = -1; //infinit face
	}
	else {
		f1 = -1;
		f2 = 0;
	}

	//init edges
	edgeTable[0] = {vOrigin: 0, fRight: f1, eN: 2, eTwin: 1};
	edgeTable[1] = {vOrigin: 1, fRight: f2, eN: 5, eTwin: 0};

	edgeTable[2] = {vOrigin: 1, fRight: f1, eN: 4, eTwin: 3};
	edgeTable[3] = {vOrigin: 2, fRight: f2, eN: 1, eTwin: 2};

	edgeTable[4] = {vOrigin: 2, fRight: f1, eN: 0, eTwin: 5};
	edgeTable[5] = {vOrigin: 0, fRight: f2, eN: 3, eTwin: 4};

	edgeCount += 6;

	//init faces
	faceTable[0] = {e: f1 == 0 ? 0 : 1}
	faceCount += 1;
}


function addPoint(point){
	var face = findFace(point);
	var faceEdges = getFaceEdges(face);

	// add new vertex

	// add new edges
	
	// remove face & add new faces

	// update old edges
}

// TODO: replace 
function findFace(point){
	for (var i = 0; i < faceTable.length; i++) {
		var faceVertices = getFaceVertices(i);
		if (isPointInTriangle(point, faceVertices)) {
			return i;
		} 
	}
	return 0;
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
	for (i=0;i<faceTable.length;i++) {
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
		x: box.xmin - (box.xmax - box.xmin)/2 - xOffset, 
		y: box.ymin - yOffset
	};
	var p2 = {
		x: box.xmax + (box.xmax - box.xmin)/2 + xOffset, 
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





