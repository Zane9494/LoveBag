/**
 * 2048游戏逻辑类
 */
export class Game2048 {
	constructor() {
		this.size = 4 // 4x4网格
		this.grid = []
		this.score = 0
		this.hasWon = false
		this.init()
	}

	// 初始化游戏
	init() {
		this.grid = this.createEmptyGrid()
		this.score = 0
		this.hasWon = false
		this.addRandomTile()
		this.addRandomTile()
	}

	// 创建空网格
	createEmptyGrid() {
		const grid = []
		for (let i = 0; i < this.size; i++) {
			grid[i] = []
			for (let j = 0; j < this.size; j++) {
				grid[i][j] = 0
			}
		}
		return grid
	}

	// 获取网格
	getGrid() {
		return this.grid
	}

	// 获取分数
	getScore() {
		return this.score
	}

	// 是否获胜
	hasWon() {
		return this.hasWon
	}

	// 添加随机方块
	addRandomTile() {
		const emptyCells = this.getEmptyCells()
		if (emptyCells.length === 0) return false

		const randomIndex = Math.floor(Math.random() * emptyCells.length)
		const cell = emptyCells[randomIndex]
		// 90%概率生成2，10%概率生成4
		const value = Math.random() < 0.9 ? 2 : 4
		this.grid[cell.row][cell.col] = value
		return true
	}

	// 获取空格子
	getEmptyCells() {
		const emptyCells = []
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.grid[i][j] === 0) {
					emptyCells.push({ row: i, col: j })
				}
			}
		}
		return emptyCells
	}

	// 移动方块
	move(direction) {
		const previousGrid = this.copyGrid(this.grid)
		const previousScore = this.score

		switch (direction) {
			case 'left':
				this.moveLeft()
				break
			case 'right':
				this.moveRight()
				break
			case 'up':
				this.moveUp()
				break
			case 'down':
				this.moveDown()
				break
		}

		// 检查是否有移动
		const hasMoved = !this.gridsEqual(previousGrid, this.grid)
		
		if (hasMoved) {
			this.addRandomTile()
			// 检查是否达到2048
			if (!this.hasWon && this.hasReached2048()) {
				this.hasWon = true
			}
		}

		return hasMoved
	}

	// 向左移动
	moveLeft() {
		for (let i = 0; i < this.size; i++) {
			const row = this.grid[i].filter(cell => cell !== 0)
			const merged = this.mergeRow(row)
			this.grid[i] = merged.concat(new Array(this.size - merged.length).fill(0))
		}
	}

	// 向右移动
	moveRight() {
		for (let i = 0; i < this.size; i++) {
			const row = this.grid[i].filter(cell => cell !== 0)
			const merged = this.mergeRow(row.reverse()).reverse()
			this.grid[i] = new Array(this.size - merged.length).fill(0).concat(merged)
		}
	}

	// 向上移动
	moveUp() {
		for (let j = 0; j < this.size; j++) {
			const column = []
			for (let i = 0; i < this.size; i++) {
				if (this.grid[i][j] !== 0) {
					column.push(this.grid[i][j])
				}
			}
			const merged = this.mergeRow(column)
			for (let i = 0; i < this.size; i++) {
				this.grid[i][j] = merged[i] || 0
			}
		}
	}

	// 向下移动
	moveDown() {
		for (let j = 0; j < this.size; j++) {
			const column = []
			for (let i = 0; i < this.size; i++) {
				if (this.grid[i][j] !== 0) {
					column.push(this.grid[i][j])
				}
			}
			const merged = this.mergeRow(column.reverse()).reverse()
			for (let i = 0; i < this.size; i++) {
				this.grid[i][j] = merged[i] || 0
			}
		}
	}

	// 合并行
	mergeRow(row) {
		const merged = []
		let i = 0

		while (i < row.length) {
			if (i < row.length - 1 && row[i] === row[i + 1]) {
				// 合并相同的方块
				const mergedValue = row[i] * 2
				merged.push(mergedValue)
				this.score += mergedValue
				i += 2 // 跳过已合并的两个方块
			} else {
				merged.push(row[i])
				i++
			}
		}

		return merged
	}

	// 复制网格
	copyGrid(grid) {
		return grid.map(row => [...row])
	}

	// 比较两个网格是否相等
	gridsEqual(grid1, grid2) {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (grid1[i][j] !== grid2[i][j]) {
					return false
				}
			}
		}
		return true
	}

	// 检查是否达到2048
	hasReached2048() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.grid[i][j] === 2048) {
					return true
				}
			}
		}
		return false
	}

	// 检查游戏是否结束
	isGameOver() {
		// 如果有空格子，游戏未结束
		if (this.getEmptyCells().length > 0) {
			return false
		}

		// 检查是否还能合并
		return !this.canMove()
	}

	// 检查是否还能移动
	canMove() {
		// 检查水平方向
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size - 1; j++) {
				if (this.grid[i][j] === this.grid[i][j + 1]) {
					return true
				}
			}
		}

		// 检查垂直方向
		for (let i = 0; i < this.size - 1; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.grid[i][j] === this.grid[i + 1][j]) {
					return true
				}
			}
		}

		return false
	}

	// 重置游戏
	reset() {
		this.init()
	}
}
