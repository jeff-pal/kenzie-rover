import MinHeap from './heap';
import { Coordinate } from '../types';

export default class GreedyBestFirstSearch {
	destinationPoint : Coordinate;
	originPoint      : Coordinate;
	totalCols        : number;
	totalRows        : number;
	wall			 : Coordinate[] ;
	bestPath		 : Coordinate[] = [];
	plateauMeshMatrix: any[]        = [];
	
	constructor(
		wall: Coordinate[],
		topRightCorner: Coordinate,
		origin: Coordinate,
		destination: Coordinate
	) {
		this.totalRows = topRightCorner[0] + 1;
		this.totalCols = topRightCorner[1] + 1;
		this.originPoint = origin;
		this.destinationPoint = destination;
		this.wall = wall;
		this.wall.forEach(item => {
			const i = item[0];
			const j = item[1];
			if(this.plateauMeshMatrix[i]) {
				this.plateauMeshMatrix[i][j] = true;
			} else {
				this.plateauMeshMatrix[i] = [];
				this.plateauMeshMatrix[i][j] = true;
			}
		})
	}
	
	createPrev(){
		const prev = [];
		for (let i = 0; i < this.totalRows; i++){
			const row = [];
			for (let j = 0; j < this.totalCols; j++){
				row.push(null);
			}
			prev.push(row);
		}
		return prev;
	}
	
	createDistances(){
		const distances = [];
		for (let i = 0; i < this.totalRows; i++){
			const row = [];
			for (let j = 0; j < this.totalCols; j++){
				row.push(Number.POSITIVE_INFINITY);
			}
			distances.push(row);
		}
		return distances;
	}
	
	createVisited(){
		const visited = [];
		for (let i = 0; i < this.totalRows; i++){
			const row = [];
			for (let j = 0; j < this.totalCols; j++){
				if (this.cellIsAWall(i, j)){
					row.push(true);
				} else {
					row.push(false);
				}
			}
			visited.push(row);
		}
		return visited;
	}
	
	cellIsAWall(i, j){
		return this.plateauMeshMatrix[i]?.[j];
	}
	
	getNeighbors(i, j){
		const neighbors = [];
		if ( i > 0 ){ neighbors.push( [i - 1, j] );}
		if ( j > 0 ){ neighbors.push( [i, j - 1] );}
		if ( i < (this.totalRows - 1) ){ neighbors.push( [i + 1, j] );}
		if ( j < (this.totalCols - 1) ){ neighbors.push( [i, j + 1] );}
		return neighbors;
	}

	assert(array, i, j, value) {
		if(array[i]) {
			array[i][j] =  value;
		} else {
			array[i] = [];
			array[i][j] =  value;
		}
	}
	
	search() {
		let pathFound = false;
		const myHeap = new MinHeap();
		const prev = this.createPrev();
		const costs = this.createDistances();
		const visited = this.createVisited();
	
		costs[ this.originPoint[0] ][ this.originPoint[1] ] = 0;
		myHeap.push([0, [this.originPoint[0], this.originPoint[1]]]);
		this.plateauMeshMatrix[this.originPoint[0], this.originPoint[1]] = [[this.originPoint[0], this.originPoint[1]], "searching"];
	
		while (!myHeap.isEmpty()){
			const cell = myHeap.getMin();
			let i = cell[1][0];
			let j = cell[1][1];
			if (visited[i][j]){ continue; }
			visited[i][j] = true;
			this.assert(this.plateauMeshMatrix, i, j, [[i,j], "visited"]);
	
			if (i == this.destinationPoint[0] && j == this.destinationPoint[1]){
				pathFound = true;
				break;
			}
			const neighbors = this.getNeighbors(i, j);
			for (let k = 0; k < neighbors.length; k++){
				const m = neighbors[k][0];
				const n = neighbors[k][1];
				if (visited[m][n]){ continue; }
				const newCost = Math.abs(this.destinationPoint[0] - m) + Math.abs(this.destinationPoint[1] - n);
				if (newCost < costs[m][n]){
					prev[m][n] = [i, j];
					costs[m][n] = newCost;
					myHeap.push([newCost, [m, n]]);
					this.assert(this.plateauMeshMatrix, m, n, [[i,j], "searching"])
				}
			}
		}
	
		while ( !myHeap.isEmpty() ){
			const cell = myHeap.getMin();
			const i = cell[1][0];
			const j = cell[1][1];
			if (visited[i][j]){ continue; }
			visited[i][j] = true;
			this.assert(this.plateauMeshMatrix, i, j, [[i,j], "visited"])
		}
	
		if (pathFound) {
			let i = this.destinationPoint[0];
			let j = this.destinationPoint[1];
			this.assert(this.plateauMeshMatrix, i, j, [[i,j], "success"]);
			this.bestPath.unshift([i,j]);
			while (prev[i][j] != null){
				const prevCell = prev[i][j];
				i = prevCell[0];
				j = prevCell[1];
				this.assert(this.plateauMeshMatrix, i, j, [[i,j], "success"]);
				this.bestPath.unshift([i,j]);
			}
		}
		return this.bestPath;
	}
}