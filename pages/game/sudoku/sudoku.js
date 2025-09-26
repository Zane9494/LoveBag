/**
 * 数独游戏逻辑类
 */
export class SudokuGame {
	constructor(difficulty = 'easy') {
		this.size = 9 // 9x9网格
		this.grid = []
		this.solution = []
		this.difficulty = difficulty
		this.init()
	}

	// 初始化游戏
	init() {
		this.generateSolution()
		this.createPuzzle()
	}

	// 生成完整的数独解答
	generateSolution() {
		this.solution = this.createEmptyGrid()
		this.fillGrid(this.solution)
	}

	// 创建空网格
	createEmptyGrid() {
		const grid = []
		for (let i = 0; i < this.size; i++) {
			grid[i] = []
			for (let j = 0; j < this.size; j++) {
				grid[i][j] = {
					value: 0,
					isFixed: false,
					isError: false
				}
			}
		}
		return grid
	}

	// 填充完整的数独网格
	fillGrid(grid) {
		// 使用回溯算法生成完整的数独解答
		return this.solveSudoku(grid)
	}

	// 数独求解算法（回溯法）
	solveSudoku(grid) {
		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				if (grid[row][col].value === 0) {
					// 随机化数字顺序，增加解的多样性
					const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
					
					for (let num of numbers) {
						if (this.isValidPlacement(grid, row, col, num)) {
							grid[row][col].value = num
							
							if (this.solveSudoku(grid)) {
								return true
							}
							
							grid[row][col].value = 0
						}
					}
					return false
				}
			}
		}
		return true
	}

	// 检查数字放置是否有效
	isValidPlacement(grid, row, col, num) {
		// 检查行
		for (let j = 0; j < 9; j++) {
			if (grid[row][j].value === num) {
				return false
			}
		}

		// 检查列
		for (let i = 0; i < 9; i++) {
			if (grid[i][col].value === num) {
				return false
			}
		}

		// 检查3x3宫格
		const boxRow = Math.floor(row / 3) * 3
		const boxCol = Math.floor(col / 3) * 3
		for (let i = boxRow; i < boxRow + 3; i++) {
			for (let j = boxCol; j < boxCol + 3; j++) {
				if (grid[i][j].value === num) {
					return false
				}
			}
		}

		return true
	}

	// 创建谜题（从完整解答中移除一些数字）
	createPuzzle() {
		// 复制解答到游戏网格
		this.grid = this.createEmptyGrid()
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				this.grid[i][j].value = this.solution[i][j].value
			}
		}

		// 根据难度确定要移除的数字数量
		const cellsToRemove = this.getCellsToRemove()
		const positions = []
		
		// 生成所有位置
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				positions.push({ row: i, col: j })
			}
		}

		// 随机打乱位置
		const shuffledPositions = this.shuffleArray(positions)

		// 简化版：直接移除指定数量的数字
		for (let i = 0; i < cellsToRemove && i < shuffledPositions.length; i++) {
			const pos = shuffledPositions[i]
			this.grid[pos.row][pos.col].value = 0
		}

		// 标记固定的数字（非零的数字）
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.grid[i][j].value !== 0) {
					this.grid[i][j].isFixed = true
				} else {
					this.grid[i][j].isFixed = false
				}
			}
		}
	}

	// 根据难度获取要移除的单元格数量
	getCellsToRemove() {
		const difficultySettings = {
			easy: Math.floor(Math.random() * 6) + 35,    // 35-40个空格
			medium: Math.floor(Math.random() * 6) + 45,  // 45-50个空格
			hard: Math.floor(Math.random() * 6) + 55,    // 55-60个空格
			expert: Math.floor(Math.random() * 6) + 60   // 60-65个空格
		}
		return difficultySettings[this.difficulty] || difficultySettings.easy
	}


	// 随机打乱数组
	shuffleArray(array) {
		const shuffled = [...array]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled
	}

	// 获取网格
	getGrid() {
		return this.grid
	}

	// 输入数字
	inputNumber(row, col, number) {
		// 检查是否为固定数字
		if (this.grid[row][col].isFixed) {
			return { valid: false, message: '不能修改固定数字' }
		}

		// 清除之前的错误状态
		this.clearErrors()

		// 检查是否有效
		const isValid = this.isValidPlacement(this.grid, row, col, number)
		
		// 设置数字
		this.grid[row][col].value = number

		if (!isValid) {
			// 标记错误
			this.markConflicts(row, col, number)
			return { valid: false, message: '数字冲突' }
		}

		return { valid: true }
	}

	// 擦除单元格
	eraseCell(row, col) {
		if (!this.grid[row][col].isFixed) {
			this.grid[row][col].value = 0
			this.clearErrors()
		}
	}

	// 清除所有错误标记
	clearErrors() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				this.grid[i][j].isError = false
			}
		}
	}

	// 标记冲突的数字
	markConflicts(row, col, number) {
		// 标记当前单元格
		this.grid[row][col].isError = true

		// 标记同行冲突
		for (let j = 0; j < 9; j++) {
			if (j !== col && this.grid[row][j].value === number) {
				this.grid[row][j].isError = true
			}
		}

		// 标记同列冲突
		for (let i = 0; i < 9; i++) {
			if (i !== row && this.grid[i][col].value === number) {
				this.grid[i][col].isError = true
			}
		}

		// 标记同宫格冲突
		const boxRow = Math.floor(row / 3) * 3
		const boxCol = Math.floor(col / 3) * 3
		for (let i = boxRow; i < boxRow + 3; i++) {
			for (let j = boxCol; j < boxCol + 3; j++) {
				if ((i !== row || j !== col) && this.grid[i][j].value === number) {
					this.grid[i][j].isError = true
				}
			}
		}
	}

	// 检查游戏是否完成
	isComplete() {
		// 检查是否所有格子都填满
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.grid[i][j].value === 0) {
					return false
				}
			}
		}

		// 检查是否有错误
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.grid[i][j].isError) {
					return false
				}
			}
		}

		// 最终验证：检查所有行、列、宫格是否正确
		return this.isValidSolution()
	}

	// 验证解答是否正确
	isValidSolution() {
		// 检查所有行
		for (let i = 0; i < 9; i++) {
			const row = new Set()
			for (let j = 0; j < 9; j++) {
				const val = this.grid[i][j].value
				if (val < 1 || val > 9 || row.has(val)) {
					return false
				}
				row.add(val)
			}
		}

		// 检查所有列
		for (let j = 0; j < 9; j++) {
			const col = new Set()
			for (let i = 0; i < 9; i++) {
				const val = this.grid[i][j].value
				if (val < 1 || val > 9 || col.has(val)) {
					return false
				}
				col.add(val)
			}
		}

		// 检查所有3x3宫格
		for (let boxRow = 0; boxRow < 3; boxRow++) {
			for (let boxCol = 0; boxCol < 3; boxCol++) {
				const box = new Set()
				for (let i = boxRow * 3; i < boxRow * 3 + 3; i++) {
					for (let j = boxCol * 3; j < boxCol * 3 + 3; j++) {
						const val = this.grid[i][j].value
						if (val < 1 || val > 9 || box.has(val)) {
							return false
						}
						box.add(val)
					}
				}
			}
		}

		return true
	}

	// 获取提示
	getHint() {
		// 寻找一个空格子，并返回正确答案
		const emptyCells = []
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.grid[i][j].value === 0) {
					emptyCells.push({ row: i, col: j })
				}
			}
		}

		if (emptyCells.length === 0) {
			return null
		}

		// 随机选择一个空格子
		const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
		const correctValue = this.solution[randomCell.row][randomCell.col].value

		return {
			row: randomCell.row,
			col: randomCell.col,
			value: correctValue
		}
	}

	// 重置游戏
	reset() {
		this.init()
	}
}
