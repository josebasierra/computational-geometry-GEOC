/**
 TODO Replace this by your own, correct, triangulation function
 Triangles should be return as arrays of array of indexes
 e.g., [[1,2,3],[2,3,4]] encodes two triangles, where the indices are relative to the array points
**/
function computeTriangulation(points) {
	// Note that this does NOT return a triangulation, just some triangles
	var k = Math.floor(points.length/3); 
	var outputTriangles = new Array(k); 
	
	for (i=0;i<k;i++) {
		// This is how one triangle is represented: array of three point indices
		outputTriangles[i] = [3*i, 3*i+1, 3*i+2]; // Store INDICES, not points
	}

	return outputTriangles;
}



