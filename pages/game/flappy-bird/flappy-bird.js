/**
 * 飞翔的小鸟游戏逻辑
 */

export class FlappyBirdGame {
	constructor(canvas, callbacks = {}) {
		this.canvas = canvas
		this.callbacks = callbacks
		
		// 游戏状态
		this.isRunning = false
		this.isPaused = false
		this.score = 0
		
		// 画布尺寸
		this.canvasWidth = 350
		this.canvasHeight = 500
		
		// 小鸟属性
		this.bird = {
			x: 80,
			y: 250,
			width: 20,
			height: 20,
			velocity: 0,
			gravity: 0.5,
			jumpStrength: -8,
			color: '#FFD700'
		}
		
		// 管道属性
		this.pipes = []
		this.pipeWidth = 60
		this.pipeGap = 120
		this.pipeSpeed = 2
		this.pipeSpacing = 200
		
		// 地面属性
		this.ground = {
			y: this.canvasHeight - 50,
			height: 50
		}
		
		// 天空颜色
		this.skyColor = '#87CEEB'
		this.groundColor = '#8FBC8F'
		this.pipeColor = '#228B22'
		
		// 云朵
		this.clouds = []
		this.initClouds()
		
		// 初始化画布
		this.initCanvas()
	}
	
	// 初始化画布
	initCanvas() {
		this.canvas.scale(1, 1)
		this.resizeCanvas()
	}
	
	// 调整画布大小
	resizeCanvas() {
		// 设置画布大小（这里使用固定尺寸，实际项目中可以根据屏幕尺寸调整）
		this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
	}
	
	// 初始化云朵
	initClouds() {
		this.clouds = []
		for (let i = 0; i < 3; i++) {
			this.clouds.push({
				x: Math.random() * this.canvasWidth,
				y: Math.random() * 150 + 50,
				size: Math.random() * 30 + 20,
				speed: Math.random() * 0.5 + 0.2
			})
		}
	}
	
	// 开始游戏
	start() {
		this.isRunning = true
		this.isPaused = false
		this.resetGame()
		this.gameLoop()
	}
	
	// 暂停游戏
	pause() {
		this.isPaused = true
	}
	
	// 恢复游戏
	resume() {
		if (this.isPaused) {
			this.isPaused = false
			this.gameLoop()
		}
	}
	
	// 重置游戏
	resetGame() {
		this.score = 0
		this.bird.y = 250
		this.bird.velocity = 0
		this.pipes = []
		this.generatePipe()
		
		// 通知分数更新
		if (this.callbacks.onScoreUpdate) {
			this.callbacks.onScoreUpdate(this.score)
		}
	}
	
	// 渲染初始状态（用于倒计时期间显示）
	renderInitialState() {
		// 确保有初始的管道
		if (this.pipes.length === 0) {
			this.generatePipe()
		}
		
		// 渲染游戏画面但不更新游戏逻辑
		this.render()
	}
	
	// 小鸟跳跃
	flap() {
		if (this.isRunning) {
			this.bird.velocity = this.bird.jumpStrength
		}
	}
	
	// 生成管道
	generatePipe() {
		const gapStart = Math.random() * (this.canvasHeight - this.pipeGap - this.ground.height - 100) + 50
		
		this.pipes.push({
			x: this.canvasWidth,
			topHeight: gapStart,
			bottomY: gapStart + this.pipeGap,
			bottomHeight: this.ground.y - (gapStart + this.pipeGap),
			passed: false
		})
	}
	
	// 更新游戏状态
	update() {
		if (!this.isRunning || this.isPaused) return
		
		// 更新小鸟
		this.updateBird()
		
		// 更新管道
		this.updatePipes()
		
		// 更新云朵
		this.updateClouds()
		
		// 检查碰撞
		this.checkCollisions()
		
		// 检查得分
		this.checkScore()
	}
	
	// 更新小鸟
	updateBird() {
		this.bird.velocity += this.bird.gravity
		this.bird.y += this.bird.velocity
		
		// 限制小鸟不要飞出屏幕顶部
		if (this.bird.y < 0) {
			this.bird.y = 0
			this.bird.velocity = 0
		}
	}
	
	// 更新管道
	updatePipes() {
		// 移动管道
		for (let i = this.pipes.length - 1; i >= 0; i--) {
			this.pipes[i].x -= this.pipeSpeed
			
			// 移除屏幕外的管道
			if (this.pipes[i].x + this.pipeWidth < 0) {
				this.pipes.splice(i, 1)
			}
		}
		
		// 生成新管道
		if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvasWidth - this.pipeSpacing) {
			this.generatePipe()
		}
	}
	
	// 更新云朵
	updateClouds() {
		for (let cloud of this.clouds) {
			cloud.x -= cloud.speed
			
			// 云朵移出屏幕后重新生成
			if (cloud.x + cloud.size < 0) {
				cloud.x = this.canvasWidth + Math.random() * 100
				cloud.y = Math.random() * 150 + 50
				cloud.size = Math.random() * 30 + 20
				cloud.speed = Math.random() * 0.5 + 0.2
			}
		}
	}
	
	// 检查碰撞
	checkCollisions() {
		// 检查是否撞到地面
		if (this.bird.y + this.bird.height >= this.ground.y) {
			this.gameOver()
			return
		}
		
		// 检查是否撞到管道
		for (let pipe of this.pipes) {
			if (this.bird.x < pipe.x + this.pipeWidth &&
				this.bird.x + this.bird.width > pipe.x) {
				
				// 检查上管道
				if (this.bird.y < pipe.topHeight) {
					this.gameOver()
					return
				}
				
				// 检查下管道
				if (this.bird.y + this.bird.height > pipe.bottomY) {
					this.gameOver()
					return
				}
			}
		}
	}
	
	// 检查得分
	checkScore() {
		for (let pipe of this.pipes) {
			if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
				pipe.passed = true
				this.score++
				
				// 通知分数更新
				if (this.callbacks.onScoreUpdate) {
					this.callbacks.onScoreUpdate(this.score)
				}
			}
		}
	}
	
	// 游戏结束
	gameOver() {
		this.isRunning = false
		
		// 通知游戏结束
		if (this.callbacks.onGameOver) {
			this.callbacks.onGameOver()
		}
	}
	
	// 渲染游戏
	render() {
		// 清空画布
		this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
		
		// 绘制天空背景
		this.canvas.setFillStyle(this.skyColor)
		this.canvas.fillRect(0, 0, this.canvasWidth, this.ground.y)
		
		// 绘制云朵
		this.renderClouds()
		
		// 绘制管道
		this.renderPipes()
		
		// 绘制地面
		this.canvas.setFillStyle(this.groundColor)
		this.canvas.fillRect(0, this.ground.y, this.canvasWidth, this.ground.height)
		
		// 绘制小鸟
		this.renderBird()
		
		// 提交绘制
		this.canvas.draw()
	}
	
	// 绘制云朵
	renderClouds() {
		this.canvas.setFillStyle('#FFFFFF')
		for (let cloud of this.clouds) {
			// 绘制简单的云朵形状
			this.canvas.beginPath()
			this.canvas.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, 2 * Math.PI)
			this.canvas.arc(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.4, 0, 2 * Math.PI)
			this.canvas.arc(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.4, 0, 2 * Math.PI)
			this.canvas.fill()
		}
	}
	
	// 绘制小鸟
	renderBird() {
		this.canvas.setFillStyle(this.bird.color)
		
		// 绘制小鸟身体（圆形）
		this.canvas.beginPath()
		this.canvas.arc(
			this.bird.x + this.bird.width / 2,
			this.bird.y + this.bird.height / 2,
			this.bird.width / 2,
			0,
			2 * Math.PI
		)
		this.canvas.fill()
		
		// 绘制小鸟嘴巴
		this.canvas.setFillStyle('#FF6347')
		this.canvas.fillRect(
			this.bird.x + this.bird.width,
			this.bird.y + this.bird.height / 2 - 2,
			6,
			4
		)
		
		// 绘制小鸟眼睛
		this.canvas.setFillStyle('#000000')
		this.canvas.beginPath()
		this.canvas.arc(
			this.bird.x + this.bird.width / 2 + 3,
			this.bird.y + this.bird.height / 2 - 3,
			2,
			0,
			2 * Math.PI
		)
		this.canvas.fill()
	}
	
	// 绘制管道
	renderPipes() {
		this.canvas.setFillStyle(this.pipeColor)
		
		for (let pipe of this.pipes) {
			// 绘制上管道
			this.canvas.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight)
			
			// 绘制下管道
			this.canvas.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight)
			
			// 绘制管道边缘（装饰）
			this.canvas.setFillStyle('#006400')
			this.canvas.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20)
			this.canvas.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20)
			this.canvas.setFillStyle(this.pipeColor)
		}
	}
	
	// 游戏主循环
	gameLoop() {
		if (!this.isRunning || this.isPaused) return
		
		this.update()
		this.render()
		
		// 下一帧
		setTimeout(() => {
			this.gameLoop()
		}, 1000 / 60) // 60 FPS
	}
	
	// 销毁游戏
	destroy() {
		this.isRunning = false
		this.isPaused = false
	}
	
	// 获取当前分数
	getScore() {
		return this.score
	}
}
