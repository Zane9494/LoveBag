/**
 * 跳一跳游戏逻辑类
 */
export class JumpJumpGame {
	constructor(canvasId, callbacks = {}) {
		this.canvasId = canvasId
		this.callbacks = callbacks
		
		// 游戏状态
		this.score = 0
		this.gameRunning = false
		this.gamePaused = false
		this.gameStarted = false
		
		// 画布相关
		this.canvas = null
		this.ctx = null
		this.canvasWidth = 0
		this.canvasHeight = 0
		this.dpr = 1
		
		// 游戏对象
		this.player = null
		this.currentBlock = null
		this.nextBlock = null
		this.blocks = []
		
		// 物理参数
		this.gravity = 0.8
		this.jumpPower = 0
		this.maxJumpPower = 25
		this.charging = false
		this.chargeStartTime = 0
		
		// 动画
		this.animationId = null
		
		// 连击系统
		this.combo = 0
		this.lastLandingPosition = null
		
		// 相机
		this.camera = {
			x: 0,
			y: 0,
			targetX: 0,
			targetY: 0
		}
		
		// 粒子系统
		this.particles = []
	}

	// 初始化游戏
	init() {
		try {
			// 获取设备像素比
			const systemInfo = uni.getSystemInfoSync()
			this.dpr = systemInfo.pixelRatio || 1
			
			// 创建canvas上下文
			this.ctx = uni.createCanvasContext(this.canvasId)
			
			// 获取canvas节点信息
			const query = uni.createSelectorQuery()
			query.select('.game-canvas').boundingClientRect(data => {
				if (data) {
					this.canvasWidth = data.width * this.dpr
					this.canvasHeight = data.height * this.dpr
					
					// 初始化游戏对象
					this.initGameObjects()
					
					// 开始游戏循环
					this.gameLoop()
				}
			}).exec()
			
		} catch (error) {
			console.error('初始化游戏失败:', error)
		}
	}

	// 初始化游戏对象
	initGameObjects() {
		// 初始化玩家
		this.player = {
			x: this.canvasWidth * 0.3,
			y: this.canvasHeight * 0.6,
			width: 30,
			height: 30,
			velocityX: 0,
			velocityY: 0,
			onGround: true,
			jumping: false,
			color: '#FF6B6B'
		}
		
		// 初始化方块
		this.blocks = []
		
		// 第一个方块（起始方块）
		this.currentBlock = {
			x: this.canvasWidth * 0.2,
			y: this.canvasHeight * 0.7,
			width: 100,
			height: 20,
			color: '#4ECDC4'
		}
		this.blocks.push(this.currentBlock)
		
		// 生成下一个方块
		this.generateNextBlock()
		
		// 重置相机
		this.camera.x = 0
		this.camera.y = 0
		this.camera.targetX = 0
		this.camera.targetY = 0
	}

	// 生成下一个方块
	generateNextBlock() {
		const lastBlock = this.blocks[this.blocks.length - 1]
		
		// 随机距离和高度
		const distance = 120 + Math.random() * 100 // 120-220像素距离
		const heightOffset = (Math.random() - 0.5) * 60 // 高度变化
		
		this.nextBlock = {
			x: lastBlock.x + distance,
			y: lastBlock.y + heightOffset,
			width: 80 + Math.random() * 40, // 80-120像素宽度
			height: 20,
			color: this.getRandomBlockColor()
		}
		
		this.blocks.push(this.nextBlock)
		
		// 限制方块数量，移除过远的方块
		if (this.blocks.length > 10) {
			this.blocks.shift()
		}
	}

	// 获取随机方块颜色
	getRandomBlockColor() {
		const colors = ['#4ECDC4', '#45B7D1', '#F39C12', '#E74C3C', '#9B59B6', '#2ECC71']
		return colors[Math.floor(Math.random() * colors.length)]
	}

	// 开始蓄力
	startCharge() {
		if (!this.gameRunning && !this.gameStarted) {
			this.gameRunning = true
			this.gameStarted = true
			if (this.callbacks.onGameStart) {
				this.callbacks.onGameStart()
			}
		}
		
		if (this.player.onGround && !this.charging) {
			this.charging = true
			this.chargeStartTime = Date.now()
		}
	}

	// 跳跃
	jump(chargeTime) {
		if (!this.charging || !this.player.onGround) return
		
		this.charging = false
		
		// 计算跳跃力度（基于蓄力时间）
		const chargeDuration = Math.min(chargeTime, 1000) // 最大蓄力1秒
		const chargeRatio = chargeDuration / 1000
		
		// 跳跃向量计算
		const jumpAngle = -Math.PI / 4 // 45度角
		const jumpForce = 12 + chargeRatio * 13 // 12-25的跳跃力度
		
		this.player.velocityX = Math.cos(jumpAngle) * jumpForce
		this.player.velocityY = Math.sin(jumpAngle) * jumpForce
		this.player.onGround = false
		this.player.jumping = true
		
		// 震动反馈
		uni.vibrateShort({ type: 'light' })
	}

	// 更新游戏状态
	update() {
		if (!this.gameRunning || this.gamePaused) return
		
		// 更新玩家物理
		this.updatePlayer()
		
		// 更新相机
		this.updateCamera()
		
		// 更新粒子
		this.updateParticles()
		
		// 检查碰撞
		this.checkCollisions()
	}

	// 更新玩家
	updatePlayer() {
		// 应用重力
		if (!this.player.onGround) {
			this.player.velocityY += this.gravity
		}
		
		// 更新位置
		this.player.x += this.player.velocityX
		this.player.y += this.player.velocityY
		
		// 水平阻力
		if (this.player.onGround) {
			this.player.velocityX *= 0.8
		}
		
		// 检查是否掉出屏幕
		if (this.player.y > this.canvasHeight + 100) {
			this.gameOver()
		}
	}

	// 更新相机
	updateCamera() {
		// 相机跟随玩家
		this.camera.targetX = this.player.x - this.canvasWidth * 0.4
		this.camera.targetY = this.player.y - this.canvasHeight * 0.6
		
		// 平滑移动
		this.camera.x += (this.camera.targetX - this.camera.x) * 0.1
		this.camera.y += (this.camera.targetY - this.camera.y) * 0.1
	}

	// 更新粒子
	updateParticles() {
		this.particles = this.particles.filter(particle => {
			particle.x += particle.vx
			particle.y += particle.vy
			particle.vy += 0.2 // 重力
			particle.life--
			particle.alpha = particle.life / particle.maxLife
			
			return particle.life > 0
		})
	}

	// 检查碰撞
	checkCollisions() {
		// 检查与方块的碰撞
		for (let block of this.blocks) {
			if (this.checkPlayerBlockCollision(this.player, block)) {
				if (this.player.velocityY > 0) { // 向下移动时才着陆
					// 着陆
					this.player.y = block.y - this.player.height
					this.player.velocityY = 0
					this.player.onGround = true
					this.player.jumping = false
					
					// 检查是否是新方块
					if (block === this.nextBlock) {
						this.landOnBlock(block)
					}
					break
				}
			}
		}
	}

	// 检查玩家与方块碰撞
	checkPlayerBlockCollision(player, block) {
		return player.x < block.x + block.width &&
			   player.x + player.width > block.x &&
			   player.y < block.y + block.height &&
			   player.y + player.height > block.y
	}

	// 着陆在方块上
	landOnBlock(block) {
		// 计算着陆位置（相对于方块中心）
		const blockCenter = block.x + block.width / 2
		const playerCenter = this.player.x + this.player.width / 2
		const distance = Math.abs(playerCenter - blockCenter)
		
		// 判断是否完美着陆
		const perfectRange = block.width * 0.2 // 20%的完美范围
		let points = 1
		
		if (distance <= perfectRange) {
			// 完美着陆
			this.combo++
			points = 1 + this.combo
			this.createPerfectLandingEffect(playerCenter, block.y)
		} else {
			// 普通着陆
			this.combo = 0
		}
		
		// 更新分数
		this.score += points
		if (this.callbacks.onScoreUpdate) {
			this.callbacks.onScoreUpdate(this.score)
		}
		
		// 更新当前方块
		this.currentBlock = block
		
		// 生成下一个方块
		this.generateNextBlock()
		
		// 创建着陆粒子效果
		this.createLandingParticles(playerCenter, block.y)
		
		// 震动反馈
		uni.vibrateShort({ type: 'light' })
	}

	// 创建完美着陆特效
	createPerfectLandingEffect(x, y) {
		// 添加更多粒子
		for (let i = 0; i < 8; i++) {
			this.particles.push({
				x: x,
				y: y,
				vx: (Math.random() - 0.5) * 8,
				vy: -Math.random() * 6 - 2,
				life: 30,
				maxLife: 30,
				alpha: 1,
				color: '#FFD700',
				size: 4
			})
		}
	}

	// 创建着陆粒子
	createLandingParticles(x, y) {
		for (let i = 0; i < 5; i++) {
			this.particles.push({
				x: x,
				y: y,
				vx: (Math.random() - 0.5) * 4,
				vy: -Math.random() * 3 - 1,
				life: 20,
				maxLife: 20,
				alpha: 1,
				color: '#FFFFFF',
				size: 2
			})
		}
	}

	// 渲染游戏
	render() {
		// 清空画布
		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
		
		// 设置相机变换
		this.ctx.save()
		this.ctx.translate(-this.camera.x, -this.camera.y)
		
		// 绘制背景渐变
		this.drawBackground()
		
		// 绘制方块
		this.drawBlocks()
		
		// 绘制玩家
		this.drawPlayer()
		
		// 绘制粒子
		this.drawParticles()
		
		// 绘制蓄力指示器
		if (this.charging) {
			this.drawChargeIndicator()
		}
		
		this.ctx.restore()
		
		// 绘制UI（不受相机影响）
		this.drawUI()
		
		// 提交绘制
		this.ctx.draw()
	}

	// 绘制背景
	drawBackground() {
		// 创建渐变
		const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight)
		gradient.addColorStop(0, '#87CEEB')
		gradient.addColorStop(1, '#98FB98')
		
		this.ctx.fillStyle = gradient
		this.ctx.fillRect(
			this.camera.x - 100, 
			this.camera.y - 100, 
			this.canvasWidth + 200, 
			this.canvasHeight + 200
		)
	}

	// 绘制方块
	drawBlocks() {
		for (let block of this.blocks) {
			// 方块阴影
			this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
			this.ctx.fillRect(block.x + 2, block.y + 2, block.width, block.height)
			
			// 方块主体
			this.ctx.fillStyle = block.color
			this.ctx.fillRect(block.x, block.y, block.width, block.height)
			
			// 方块高光
			this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
			this.ctx.fillRect(block.x, block.y, block.width, 4)
		}
	}

	// 绘制玩家
	drawPlayer() {
		// 玩家阴影
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
		this.ctx.fillRect(this.player.x + 2, this.player.y + 2, this.player.width, this.player.height)
		
		// 玩家主体
		this.ctx.fillStyle = this.player.color
		this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height)
		
		// 玩家高光
		this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
		this.ctx.fillRect(this.player.x, this.player.y, this.player.width, 6)
		
		// 眼睛
		this.ctx.fillStyle = '#FFFFFF'
		this.ctx.fillRect(this.player.x + 6, this.player.y + 8, 4, 4)
		this.ctx.fillRect(this.player.x + 16, this.player.y + 8, 4, 4)
		
		this.ctx.fillStyle = '#000000'
		this.ctx.fillRect(this.player.x + 7, this.player.y + 9, 2, 2)
		this.ctx.fillRect(this.player.x + 17, this.player.y + 9, 2, 2)
	}

	// 绘制粒子
	drawParticles() {
		for (let particle of this.particles) {
			this.ctx.globalAlpha = particle.alpha
			this.ctx.fillStyle = particle.color
			this.ctx.fillRect(
				particle.x - particle.size / 2, 
				particle.y - particle.size / 2, 
				particle.size, 
				particle.size
			)
		}
		this.ctx.globalAlpha = 1
	}

	// 绘制蓄力指示器
	drawChargeIndicator() {
		const chargeTime = Date.now() - this.chargeStartTime
		const chargeRatio = Math.min(chargeTime / 1000, 1)
		
		// 在玩家上方绘制蓄力条
		const barWidth = 40
		const barHeight = 6
		const barX = this.player.x + (this.player.width - barWidth) / 2
		const barY = this.player.y - 15
		
		// 背景
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
		this.ctx.fillRect(barX, barY, barWidth, barHeight)
		
		// 蓄力条
		const chargeColor = chargeRatio < 0.8 ? '#4ECDC4' : '#E74C3C'
		this.ctx.fillStyle = chargeColor
		this.ctx.fillRect(barX, barY, barWidth * chargeRatio, barHeight)
	}

	// 绘制UI
	drawUI() {
		// 连击显示
		if (this.combo > 0) {
			this.ctx.fillStyle = '#FFD700'
			this.ctx.font = 'bold 24px Arial'
			this.ctx.textAlign = 'center'
			this.ctx.fillText(`连击 x${this.combo}`, this.canvasWidth / 2, 50)
		}
	}

	// 游戏循环
	gameLoop() {
		this.update()
		this.render()
		
		if (this.gameRunning) {
			this.animationId = requestAnimationFrame(() => this.gameLoop())
		}
	}

	// 游戏结束
	gameOver() {
		this.gameRunning = false
		if (this.animationId) {
			cancelAnimationFrame(this.animationId)
		}
		
		if (this.callbacks.onGameOver) {
			this.callbacks.onGameOver()
		}
	}

	// 重新开始
	restart() {
		// 停止当前游戏循环
		if (this.animationId) {
			cancelAnimationFrame(this.animationId)
		}
		
		// 重置游戏状态
		this.score = 0
		this.combo = 0
		this.gameRunning = false
		this.gamePaused = false
		this.gameStarted = false
		this.charging = false
		this.particles = []
		
		// 重新初始化游戏对象
		this.initGameObjects()
		
		// 重新开始游戏循环
		this.gameLoop()
	}

	// 暂停游戏
	pause() {
		this.gamePaused = true
	}

	// 继续游戏
	resume() {
		this.gamePaused = false
	}

	// 销毁游戏
	destroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId)
		}
		this.gameRunning = false
	}
}
