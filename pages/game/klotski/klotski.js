/**
 * 华容道游戏逻辑类
 * 经典15数字拼图游戏
 */
export class KlotskiGame {
	constructor() {
		this.size = 4; // 4x4网格
		this.puzzle = [];
		this.moves = 0;
		this.emptyIndex = 15; // 空格位置索引
		this.init();
	}
	
	/**
	 * 初始化游戏
	 */
	init() {
		// 创建已完成状态的拼图 (1-15, 0代表空格)
		this.puzzle = [];
		for (let i = 1; i < 16; i++) {
			this.puzzle.push(i);
		}
		this.puzzle.push(0); // 空格在最后
		this.emptyIndex = 15;
		this.moves = 0;
		
		// 打乱拼图
		this.shuffle();
	}
	
	/**
	 * 重置游戏到初始状态
	 */
	reset() {
		this.moves = 0;
		this.emptyIndex = 15;
		// 重新创建已完成状态
		this.puzzle = [];
		for (let i = 1; i < 16; i++) {
			this.puzzle.push(i);
		}
		this.puzzle.push(0);
	}
	
	/**
	 * 打乱拼图
	 */
	shuffle() {
		// 执行随机移动来打乱拼图，确保有解
		const shuffleMoves = 1000;
		const originalMoves = this.moves;
		
		for (let i = 0; i < shuffleMoves; i++) {
			const movablePositions = this.getMovablePositions();
			if (movablePositions.length > 0) {
				const randomIndex = Math.floor(Math.random() * movablePositions.length);
				const moveIndex = movablePositions[randomIndex];
				this.moveWithoutCount(moveIndex);
			}
		}
		
		// 重置步数计数
		this.moves = originalMoves;
	}
	
	/**
	 * 获取当前拼图状态
	 */
	getPuzzle() {
		return [...this.puzzle];
	}
	
	/**
	 * 获取当前步数
	 */
	getMoves() {
		return this.moves;
	}
	
	/**
	 * 检查是否完成
	 */
	isComplete() {
		// 检查1-15是否按顺序排列，空格在最后
		for (let i = 0; i < 15; i++) {
			if (this.puzzle[i] !== i + 1) {
				return false;
			}
		}
		return this.puzzle[15] === 0;
	}
	
	/**
	 * 检查指定位置的方块是否可以移动
	 */
	canMove(index) {
		if (index < 0 || index >= 16) return false;
		if (this.puzzle[index] === 0) return false;
		
		return this.isAdjacent(index, this.emptyIndex);
	}
	
	/**
	 * 移动方块
	 */
	move(index) {
		if (!this.canMove(index)) {
			return false;
		}
		
		// 交换方块和空格
		this.puzzle[this.emptyIndex] = this.puzzle[index];
		this.puzzle[index] = 0;
		this.emptyIndex = index;
		this.moves++;
		
		return true;
	}
	
	/**
	 * 移动但不计数（用于打乱）
	 */
	moveWithoutCount(index) {
		if (!this.canMove(index)) {
			return false;
		}
		
		// 交换方块和空格
		this.puzzle[this.emptyIndex] = this.puzzle[index];
		this.puzzle[index] = 0;
		this.emptyIndex = index;
		
		return true;
	}
	
	/**
	 * 检查两个位置是否相邻
	 */
	isAdjacent(index1, index2) {
		const row1 = Math.floor(index1 / this.size);
		const col1 = index1 % this.size;
		const row2 = Math.floor(index2 / this.size);
		const col2 = index2 % this.size;
		
		// 检查是否在同一行或同一列，且距离为1
		return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
			   (Math.abs(col1 - col2) === 1 && row1 === row2);
	}
	
	/**
	 * 获取所有可移动的位置
	 */
	getMovablePositions() {
		const movable = [];
		for (let i = 0; i < 16; i++) {
			if (this.canMove(i)) {
				movable.push(i);
			}
		}
		return movable;
	}
	
	/**
	 * 获取空格周围的位置
	 */
	getAdjacentPositions(index) {
		const adjacent = [];
		const row = Math.floor(index / this.size);
		const col = index % this.size;
		
		// 上
		if (row > 0) {
			adjacent.push(index - this.size);
		}
		// 下
		if (row < this.size - 1) {
			adjacent.push(index + this.size);
		}
		// 左
		if (col > 0) {
			adjacent.push(index - 1);
		}
		// 右
		if (col < this.size - 1) {
			adjacent.push(index + 1);
		}
		
		return adjacent;
	}
	
	/**
	 * 获取提示移动
	 */
	getHint() {
		// 简单的提示：找到应该在正确位置但不在的最小数字
		for (let i = 0; i < 15; i++) {
			if (this.puzzle[i] !== i + 1) {
				// 找到这个数字应该在的位置
				const targetValue = i + 1;
				const currentIndex = this.puzzle.indexOf(targetValue);
				
				// 如果这个数字可以移动，返回它
				if (this.canMove(currentIndex)) {
					return currentIndex;
				}
			}
		}
		
		// 如果没有直接可移动的，返回第一个可移动的位置
		const movable = this.getMovablePositions();
		return movable.length > 0 ? movable[0] : -1;
	}
	
	/**
	 * 检查拼图是否可解
	 * 使用逆序对数量判断
	 */
	isSolvable() {
		let inversions = 0;
		const puzzle = this.puzzle.filter(x => x !== 0); // 移除空格
		
		for (let i = 0; i < puzzle.length - 1; i++) {
			for (let j = i + 1; j < puzzle.length; j++) {
				if (puzzle[i] > puzzle[j]) {
					inversions++;
				}
			}
		}
		
		// 对于4x4网格，空格在奇数行时，逆序对必须是偶数
		// 空格在偶数行时，逆序对必须是奇数
		const emptyRow = Math.floor(this.emptyIndex / this.size) + 1;
		
		if (emptyRow % 2 === 1) {
			return inversions % 2 === 0;
		} else {
			return inversions % 2 === 1;
		}
	}
	
	/**
	 * 获取游戏统计信息
	 */
	getStats() {
		return {
			moves: this.moves,
			isComplete: this.isComplete(),
			movableCount: this.getMovablePositions().length,
			emptyPosition: this.emptyIndex
		};
	}
}
