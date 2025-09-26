/**
 * 贪吃蛇游戏逻辑类
 */
export class SnakeGame {
	constructor(canvasSize, ctx) {
		this.canvasSize = canvasSize
		this.ctx = ctx
		this.gridSize = 20 // 网格大小
		this.gridCount = Math.floor(canvasSize / this.gridSize) // 网格数量
		
		// 游戏状态
		this.isRunning = false
		this.isPaused = false
		this.gameLoop = null
		this.speed = 150 // 初始速度(ms)
		this.minSpeed = 80 // 最快速度
		
		// 蛇的状态
		this.snake = []
		this.direction = { x: 1, y: 0 } // 初始方向：向右
		this.nextDirection = { x: 1, y: 0 }
		
		// 食物状态
		this.food = { x: 0, y: 0 }
		
		// 分数
		this.score = 0
		
		// 回调函数
		this.onScoreChange = null
		this.onGameOver = null
		
		this.init()
	}
	
	// 初始化游戏
	init() {
		// 初始化蛇的位置（居中）
		const centerX = Math.floor(this.gridCount / 2)
		const centerY = Math.floor(this.gridCount / 2)
		
		this.snake = [
			{ x: centerX, y: centerY },
			{ x: centerX - 1, y: centerY },
			{ x: centerX - 2, y: centerY }
		]
		
		this.direction = { x: 1, y: 0 }
		this.nextDirection = { x: 1, y: 0 }
		this.score = 0
		this.speed = 150
		
		this.generateFood()
	}
	
	// 生成食物
	generateFood() {
		let validPosition = false
		let attempts = 0
		const maxAttempts = 100
		
		while (!validPosition && attempts < maxAttempts) {
			this.food = {
				x: Math.floor(Math.random() * this.gridCount),
				y: Math.floor(Math.random() * this.gridCount)
			}
			
			// 检查食物是否与蛇身重叠
			validPosition = !this.snake.some(segment => 
				segment.x === this.food.x && segment.y === this.food.y
			)
			
			attempts++
		}
		
		// 如果找不到有效位置，游戏结束（蛇太长了）
		if (!validPosition) {
			this.gameOver()
		}
	}
	
	// 开始游戏
	start() {
		if (this.isRunning) return
		
		this.isRunning = true
		this.isPaused = false
		this.gameLoop = setInterval(() => {
			this.update()
		}, this.speed)
	}
	
	// 暂停游戏
	pause() {
		this.isPaused = true
		if (this.gameLoop) {
			clearInterval(this.gameLoop)
			this.gameLoop = null
		}
	}
	
	// 继续游戏
	resume() {
		if (!this.isRunning || !this.isPaused) return
		
		this.isPaused = false
		this.gameLoop = setInterval(() => {
			this.update()
		}, this.speed)
	}
	
	// 停止游戏
	stop() {
		this.isRunning = false
		this.isPaused = false
		if (this.gameLoop) {
			clearInterval(this.gameLoop)
			this.gameLoop = null
		}
	}
	
	// 销毁游戏
	destroy() {
		this.stop()
	}
	
	// 改变方向
	changeDirection(direction) {
		if (!this.isRunning || this.isPaused) return
		
		const directions = {
			'up': { x: 0, y: -1 },
			'down': { x: 0, y: 1 },
			'left': { x: -1, y: 0 },
			'right': { x: 1, y: 0 }
		}
		
		const newDirection = directions[direction]
		if (!newDirection) return
		
		// 防止反向移动
		const currentDir = this.direction
		if (newDirection.x === -currentDir.x && newDirection.y === -currentDir.y) {
			return
		}
		
		this.nextDirection = newDirection
	}
	
	// 游戏更新逻辑
	update() {
		if (!this.isRunning || this.isPaused) return
		
		// 更新方向
		this.direction = this.nextDirection
		
		// 计算蛇头新位置
		const head = this.snake[0]
		const newHead = {
			x: head.x + this.direction.x,
			y: head.y + this.direction.y
		}
		
		// 检查碰撞
		if (this.checkCollision(newHead)) {
			this.gameOver()
			return
		}
		
		// 添加新头部
		this.snake.unshift(newHead)
		
		// 检查是否吃到食物
		if (newHead.x === this.food.x && newHead.y === this.food.y) {
			// 吃到食物，增加分数
			this.score += 10
			if (this.onScoreChange) {
				this.onScoreChange(this.score)
			}
			
			// 生成新食物
			this.generateFood()
			
			// 增加速度
			this.increaseSpeed()
		} else {
			// 没吃到食物，移除尾部
			this.snake.pop()
		}
		
		// 重新绘制
		this.draw()
	}
	
	// 检查碰撞
	checkCollision(head) {
		// 检查墙壁碰撞
		if (head.x < 0 || head.x >= this.gridCount || 
			head.y < 0 || head.y >= this.gridCount) {
			return true
		}
		
		// 检查自身碰撞
		return this.snake.some(segment => 
			segment.x === head.x && segment.y === head.y
		)
	}
	
	// 增加游戏速度
	increaseSpeed() {
		if (this.speed > this.minSpeed) {
			this.speed = Math.max(this.minSpeed, this.speed - 3)
			
			// 重新设置定时器
			if (this.gameLoop) {
				clearInterval(this.gameLoop)
				this.gameLoop = setInterval(() => {
					this.update()
				}, this.speed)
			}
		}
	}
	
	// 游戏结束
	gameOver() {
		this.stop()
		if (this.onGameOver) {
			this.onGameOver()
		}
	}
	
	// 绘制游戏画面
	draw() {
		if (!this.ctx) return
		
		// 清空画布
		this.ctx.fillStyle = '#2c3e50'
		this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize)
		
		// 绘制网格线（可选）
		this.drawGrid()
		
		// 绘制蛇
		this.drawSnake()
		
		// 绘制食物
		this.drawFood()
		
		// 提交绘制
		this.ctx.draw()
	}
	
	// 绘制网格线
	drawGrid() {
		this.ctx.strokeStyle = '#34495e'
		this.ctx.lineWidth = 0.5
		
		// 绘制垂直线
		for (let i = 0; i <= this.gridCount; i++) {
			const x = i * this.gridSize
			this.ctx.beginPath()
			this.ctx.moveTo(x, 0)
			this.ctx.lineTo(x, this.canvasSize)
			this.ctx.stroke()
		}
		
		// 绘制水平线
		for (let i = 0; i <= this.gridCount; i++) {
			const y = i * this.gridSize
			this.ctx.beginPath()
			this.ctx.moveTo(0, y)
			this.ctx.lineTo(this.canvasSize, y)
			this.ctx.stroke()
		}
	}
	
	// 绘制蛇
	drawSnake() {
		this.snake.forEach((segment, index) => {
			const x = segment.x * this.gridSize
			const y = segment.y * this.gridSize
			
			if (index === 0) {
				// 绘制蛇头
				this.ctx.fillStyle = '#27ae60'
				this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2)
				
				// 绘制眼睛
				this.ctx.fillStyle = '#ffffff'
				const eyeSize = 3
				const eyeOffset = 5
				
				// 根据方向调整眼睛位置
				let eye1X, eye1Y, eye2X, eye2Y
				if (this.direction.x === 1) { // 向右
					eye1X = x + this.gridSize - eyeOffset
					eye1Y = y + eyeOffset
					eye2X = x + this.gridSize - eyeOffset
					eye2Y = y + this.gridSize - eyeOffset
				} else if (this.direction.x === -1) { // 向左
					eye1X = x + eyeOffset
					eye1Y = y + eyeOffset
					eye2X = x + eyeOffset
					eye2Y = y + this.gridSize - eyeOffset
				} else if (this.direction.y === -1) { // 向上
					eye1X = x + eyeOffset
					eye1Y = y + eyeOffset
					eye2X = x + this.gridSize - eyeOffset
					eye2Y = y + eyeOffset
				} else { // 向下
					eye1X = x + eyeOffset
					eye1Y = y + this.gridSize - eyeOffset
					eye2X = x + this.gridSize - eyeOffset
					eye2Y = y + this.gridSize - eyeOffset
				}
				
				this.ctx.fillRect(eye1X - eyeSize/2, eye1Y - eyeSize/2, eyeSize, eyeSize)
				this.ctx.fillRect(eye2X - eyeSize/2, eye2Y - eyeSize/2, eyeSize, eyeSize)
				
			} else {
				// 绘制蛇身
				const alpha = 1 - (index * 0.1) // 渐变透明度
				this.ctx.fillStyle = `rgba(46, 204, 113, ${Math.max(alpha, 0.3)})`
				this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4)
			}
		})
	}
	
	// 绘制食物
	drawFood() {
		const x = this.food.x * this.gridSize
		const y = this.food.y * this.gridSize
		
		// 绘制食物（红色圆形）
		this.ctx.fillStyle = '#e74c3c'
		const centerX = x + this.gridSize / 2
		const centerY = y + this.gridSize / 2
		const radius = this.gridSize / 3
		
		this.ctx.beginPath()
		this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
		this.ctx.fill()
		
		// 添加高光效果
		this.ctx.fillStyle = '#ffffff'
		this.ctx.beginPath()
		this.ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, 2 * Math.PI)
		this.ctx.fill()
	}
	
	// 获取当前分数
	getScore() {
		return this.score
	}
	
	// 获取蛇的长度
	getLength() {
		return this.snake.length
	}
	
	// 获取当前速度
	getSpeed() {
		return this.speed
	}
	
	// 检查游戏是否结束
	isGameOver() {
		return !this.isRunning
	}
	
	// 检查游戏是否暂停
	isGamePaused() {
		return this.isPaused
	}
}
