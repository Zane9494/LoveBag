/**
 * 打地鼠游戏逻辑类
 * 管理游戏状态、地鼠出现逻辑、计分系统等
 */
export class WhackMoleGame {
	constructor(holeCount = 9) {
		this.holeCount = holeCount
		this.holes = []
		this.score = 0
		this.hits = 0
		this.misses = 0
		this.gameRunning = false
		this.moleTimer = null
		this.currentMoleIndex = -1
		this.moleVisibleTime = 1500 // 地鼠可见时间（毫秒）
		this.moleInterval = 800 // 地鼠出现间隔（毫秒）
		this.combo = 0 // 连击数
		this.updateCallback = null
		this.gameEndCallback = null
		
		this.initHoles()
	}
	
	// 初始化洞穴
	initHoles() {
		this.holes = []
		for (let i = 0; i < this.holeCount; i++) {
			this.holes.push({
				hasMole: false,
				isVisible: false,
				isHit: false,
				isAppearing: false
			})
		}
	}
	
	// 开始游戏
	start() {
		this.gameRunning = true
		this.score = 0
		this.hits = 0
		this.misses = 0
		this.combo = 0
		this.initHoles()
		this.startMoleSpawning()
		console.log('打地鼠游戏开始')
	}
	
	// 停止游戏
	stop() {
		this.gameRunning = false
		this.clearMoleTimer()
		this.hideAllMoles()
		console.log('打地鼠游戏结束，最终得分:', this.score)
	}
	
	// 销毁游戏
	destroy() {
		this.stop()
		this.updateCallback = null
		this.gameEndCallback = null
	}
	
	// 开始地鼠生成
	startMoleSpawning() {
		if (!this.gameRunning) return
		
		this.spawnMole()
		
		// 设置下一次生成地鼠的定时器
		this.moleTimer = setTimeout(() => {
			this.startMoleSpawning()
		}, this.moleInterval + Math.random() * 500) // 随机延迟0-500ms
	}
	
	// 生成地鼠
	spawnMole() {
		if (!this.gameRunning) return
		
		// 随机选择一个没有地鼠的洞穴
		const availableHoles = this.holes
			.map((hole, index) => ({ hole, index }))
			.filter(item => !item.hole.hasMole)
		
		if (availableHoles.length === 0) return
		
		const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)]
		const index = randomHole.index
		
		// 设置地鼠出现
		this.holes[index].hasMole = true
		this.holes[index].isVisible = true
		this.holes[index].isAppearing = true
		this.holes[index].isHit = false
		this.currentMoleIndex = index
		
		console.log('地鼠出现在洞穴', index)
		
		// 触发界面更新
		this.triggerUpdate()
		
		// 设置地鼠消失定时器
		setTimeout(() => {
			this.hideMole(index)
		}, this.moleVisibleTime)
		
		// 短暂延迟后移除出现动画类
		setTimeout(() => {
			if (this.holes[index]) {
				this.holes[index].isAppearing = false
				this.triggerUpdate()
			}
		}, 200)
	}
	
	
	// 隐藏指定地鼠
	hideMole(index) {
		if (index < 0 || index >= this.holes.length) return
		
		const hole = this.holes[index]
		if (!hole.hasMole) return
		
		// 如果地鼠没有被击中，算作失误
		if (!hole.isHit) {
			this.misses++
			this.combo = 0 // 重置连击
			console.log('地鼠逃脱，失误+1，当前失误:', this.misses)
		}
		
		// 隐藏地鼠
		hole.hasMole = false
		hole.isVisible = false
		hole.isHit = false
		hole.isAppearing = false
		
		if (this.currentMoleIndex === index) {
			this.currentMoleIndex = -1
		}
		
		this.triggerUpdate()
	}
	
	// 隐藏所有地鼠
	hideAllMoles() {
		for (let i = 0; i < this.holes.length; i++) {
			if (this.holes[i].hasMole) {
				this.hideMole(i)
			}
		}
	}
	
	// 击打地鼠
	whack(index) {
		if (!this.gameRunning) return false
		if (index < 0 || index >= this.holes.length) return false
		
		const hole = this.holes[index]
		
		// 检查是否有地鼠且可见
		if (!hole.hasMole || !hole.isVisible || hole.isHit) {
			// 打空了，算作失误
			this.misses++
			this.combo = 0
			console.log('打空了，失误+1，当前失误:', this.misses)
			this.triggerUpdate()
			return false
		}
		
		// 击中地鼠
		hole.isHit = true
		this.hits++
		this.combo++
		
		// 计算得分（基础分10分，连击加成）
		let points = 10
		if (this.combo > 1) {
			points += Math.min(this.combo - 1, 10) * 2 // 连击加成，最多20额外分
		}
		
		this.score += points
		
		console.log(`击中地鼠！洞穴${index}，连击${this.combo}，得分+${points}，总分:${this.score}`)
		
		// 短暂延迟后隐藏地鼠
		setTimeout(() => {
			this.hideMole(index)
		}, 300)
		
		this.triggerUpdate()
		return true
	}
	
	// 清除地鼠定时器
	clearMoleTimer() {
		if (this.moleTimer) {
			clearTimeout(this.moleTimer)
			this.moleTimer = null
		}
	}
	
	// 触发界面更新回调
	triggerUpdate() {
		if (this.updateCallback) {
			this.updateCallback()
		}
	}
	
	// 设置更新回调
	onUpdate(callback) {
		this.updateCallback = callback
	}
	
	// 设置游戏结束回调
	onGameEnd(callback) {
		this.gameEndCallback = callback
	}
	
	// 获取游戏状态
	getHoles() {
		return [...this.holes] // 返回副本
	}
	
	getScore() {
		return this.score
	}
	
	getHits() {
		return this.hits
	}
	
	getMisses() {
		return this.misses
	}
	
	getCombo() {
		return this.combo
	}
	
	isRunning() {
		return this.gameRunning
	}
	
	// 调整游戏难度
	setDifficulty(level) {
		switch (level) {
			case 'easy':
				this.moleVisibleTime = 2000
				this.moleInterval = 1200
				break
			case 'normal':
				this.moleVisibleTime = 1500
				this.moleInterval = 800
				break
			case 'hard':
				this.moleVisibleTime = 1000
				this.moleInterval = 600
				break
			case 'expert':
				this.moleVisibleTime = 800
				this.moleInterval = 400
				break
			default:
				// 默认normal难度
				this.moleVisibleTime = 1500
				this.moleInterval = 800
		}
		console.log(`难度设置为${level}，地鼠可见时间:${this.moleVisibleTime}ms，出现间隔:${this.moleInterval}ms`)
	}
	
	// 获取游戏统计
	getStats() {
		const total = this.hits + this.misses
		const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 0
		
		return {
			score: this.score,
			hits: this.hits,
			misses: this.misses,
			accuracy: accuracy,
			combo: this.combo,
			totalClicks: total
		}
	}
}

