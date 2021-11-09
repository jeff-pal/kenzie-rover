export default class MinHeap {
	heap = [];

	isEmpty(): boolean{
		return this.heap.length === 0;
	}

	clear(){
		this.heap = [];
	}

	getMin(){
		if (this.isEmpty()){
			return null;
		}
		const min = this.heap[0];
		this.heap[0] = this.heap[this.heap.length - 1];
		this.heap[this.heap.length - 1] = min;
		this.heap.pop();
		if (!this.isEmpty()){
			this.siftDown(0);
		}
		return min;
	}

	push(item){
		this.heap.push(item);
		this.siftUp(this.heap.length - 1);
		return;
	}

	parent(index){
		if (index == 0){
			return null;
		}
		return Math.floor((index - 1) / 2);
	}

	children(index){
		return [(index * 2) + 1, (index * 2) + 2];
	}

	siftDown(index){
		const children = this.children(index);
		const leftChildValid = (children[0] <= (this.heap.length - 1));
		const rightChildValid = (children[1] <= (this.heap.length - 1));
		let newIndex = index;
		if (leftChildValid && this.heap[newIndex][0] > this.heap[children[0]][0]){
			newIndex = children[0];
		}
		if (rightChildValid && this.heap[newIndex][0] > this.heap[children[1]][0]){
			newIndex = children[1];
		}
		// No sifting down needed
		if (newIndex === index){ return; }
		const val = this.heap[index];
		this.heap[index] = this.heap[newIndex];
		this.heap[newIndex] = val;
		this.siftDown(newIndex);
		return;
	}

	siftUp(index){
		const parent = this.parent(index);
		if (parent !== null && this.heap[index][0] < this.heap[parent][0]){
			const val = this.heap[index];
			this.heap[index] = this.heap[parent];
			this.heap[parent] = val;
			this.siftUp(parent);
		}
		return;
	}
}