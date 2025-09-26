<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">贪吃蛇</text>
				<view class="info-btn" @click="showInfo">
					<text class="iconfont icon-gengduo1 info-icon"></text>
				</view>
			</view>
		</view>

		<!-- 游戏区域 -->
		<view class="game-container">
			<!-- 分数区域 -->
			<view class="score-container">
				<view class="score-box">
					<text class="score-label">分数</text>
					<text class="score-value">{{ score }}</text>
				</view>
				<view class="score-box best-score-box" :class="{ 'new-record-glow': isNewRecord }">
					<text class="score-label">最高分</text>
					<text class="score-value">{{ bestScore }}</text>
					<view class="new-record-badge" v-if="isNewRecord">
						<text class="badge-text">新纪录!</text>
					</view>
				</view>
			</view>

			<!-- 游戏说明 -->
			<view class="game-info">
				<text class="info-text">控制蛇吃食物，避免撞墙和撞自己！</text>
			</view>

			<!-- 游戏画布区域 -->
			<view class="game-canvas-container">
				<canvas 
					canvas-id="snakeCanvas" 
					class="game-canvas" 
					:style="canvasStyle"
					@touchstart="onTouchStart" 
					@touchmove="onTouchMove" 
					@touchend="onTouchEnd"
				></canvas>
			</view>

			<!-- 控制按钮区域 -->
			<view class="control-container" v-if="!gameRunning || gameStatus">
				<view class="control-btn start-btn" @click="startGame" v-if="!gameRunning && !gameStatus">
					<text class="btn-text">开始游戏</text>
				</view>
				<view class="control-btn restart-btn" @click="restartGame" v-if="gameStatus">
					<text class="btn-text">重新开始</text>
				</view>
			</view>

			<!-- 游戏控制区域 -->
			<view class="game-control-area" v-if="gameRunning && !gameStatus">
				<!-- 暂停按钮 -->
				<view class="control-btn pause-btn" @click="pauseGame">
					<text class="btn-text">{{ isPaused ? '继续' : '暂停' }}</text>
				</view>
				
				<!-- 方向控制手柄 -->
				<view class="direction-controller">
					<!-- 上方向按钮 -->
					<view class="direction-btn up-btn" @click="handleDirectionClick('up')">
						<text class="iconfont icon-shangxiazuoyou- direction-icon up-icon"></text>
					</view>
					
					<!-- 中间行：左、中心、右 -->
					<view class="middle-row">
						<view class="direction-btn left-btn" @click="handleDirectionClick('left')">
							<text class="iconfont icon-shangxiazuoyou-1 direction-icon left-icon"></text>
						</view>
						<view class="center-area">
							<text class="center-text">方向</text>
						</view>
						<view class="direction-btn right-btn" @click="handleDirectionClick('right')">
							<text class="iconfont icon-shangxiazuoyou-2 direction-icon right-icon"></text>
						</view>
					</view>
					
					<!-- 下方向按钮 -->
					<view class="direction-btn down-btn" @click="handleDirectionClick('down')">
						<text class="iconfont icon-xia direction-icon down-icon"></text>
					</view>
				</view>
			</view>

			<!-- 游戏结束状态 -->
			<view class="game-over-info" v-if="gameStatus">
				<text class="game-over-title">{{ gameStatus === 'win' ? '🎉 恭喜获胜！' : '💀 游戏结束' }}</text>
				<text class="game-over-subtitle">{{ gameStatus === 'win' ? '你创造了奇迹！' : '蛇撞到了障碍物' }}</text>
				<text class="final-score">最终得分: {{ score }}</text>
			</view>
			
			<!-- 新纪录特效 -->
			<view class="new-record-effect" v-if="showNewRecordEffect">
				<!-- 闪光效果 -->
				<view class="flash-overlay"></view>
				
				<!-- 主文本 -->
				<view class="record-text-container">
					<text class="record-main-text">🏆 新纪录 🏆</text>
					<text class="record-sub-text">恭喜创造最高分记录！</text>
				</view>
				
				<!-- 粒子效果 -->
				<view class="particle" v-for="i in 12" :key="i" :class="`particle-${i}`">
					<text class="particle-icon">✨</text>
				</view>
				
				<!-- 光环效果 -->
				<view class="light-ring"></view>
				<view class="light-ring light-ring-2"></view>
			</view>
		</view>

		<!-- 游戏说明弹窗 -->
		<view class="modal-overlay" v-if="showInfoModal" @click="closeInfoModal">
			<view class="modal-content info-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">游戏说明</text>
					<view class="modal-close" @click="closeInfoModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="info-section">
						<view class="rule-item">
							<text class="rule-title">🎯 游戏目标</text>
							<text class="rule-desc">控制蛇吃食物长大，获得更高分数！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 滑动屏幕控制蛇的移动方向</text>
							<text class="rule-desc">• 上下左右四个方向移动</text>
							<text class="rule-desc">• 蛇会自动持续移动</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🍎 游戏规则</text>
							<text class="rule-desc">• 吃到食物蛇身会变长，分数增加</text>
							<text class="rule-desc">• 撞到墙壁或自己身体游戏结束</text>
							<text class="rule-desc">• 蛇移动速度会逐渐加快</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 提前规划移动路径</text>
							<text class="rule-desc">• 避免把自己困在死角</text>
							<text class="rule-desc">• 速度越快分数奖励越高</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { SnakeGame } from './snake.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				ctx: null,
				score: 0,
				// 专门的最高分存储变量
				_bestScoreData: 0,
				gameStatus: null, // null, 'win', 'lose'
				gameRunning: false,
				isPaused: false,
				touchStartX: 0,
				touchStartY: 0,
				minSwipeDistance: 30,
				showInfoModal: false,
				isNewRecord: false,
				showNewRecordEffect: false,
				canvasSize: 300
			}
		},
		
		computed: {
			// 最高分的计算属性
			bestScore() {
				return this._bestScoreData || 0
			},
			// 画布样式
			canvasStyle() {
				return {
					width: this.canvasSize + 'px',
					height: this.canvasSize + 'px'
				}
			}
		},
		
		onLoad() {
			this.getSystemInfo()
			this.loadBestScore()
			this.initCanvas()
		},
		
		onShow() {
			this.loadBestScore()
		},
		
		onUnload() {
			this.saveBestScore()
			if (this.game) {
				this.game.destroy()
			}
		},
		
		onHide() {
			// 页面隐藏时暂停游戏
			if (this.gameRunning && !this.gameStatus) {
				this.pauseGame()
			}
		},
		
		methods: {
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
				
				// 根据屏幕大小调整画布尺寸
				const screenWidth = systemInfo.screenWidth
				this.canvasSize = Math.min(screenWidth - 40, 350)
			},
			
			// 初始化画布
			initCanvas() {
				this.ctx = uni.createCanvasContext('snakeCanvas', this)
				this.initGame()
			},
			
			// 初始化游戏
			initGame() {
				this.game = new SnakeGame(this.canvasSize, this.ctx)
				this.game.onScoreChange = (score) => {
					this.score = score
				}
				this.game.onGameOver = () => {
					this.gameStatus = 'lose'
					this.gameRunning = false
					this.checkAndShowNewRecord()
					uni.vibrateShort({ type: 'heavy' })
				}
				this.game.draw()
				this.gameStatus = null
				this.gameRunning = false
				this.isPaused = false
			},
			
			// 开始游戏
			startGame() {
				if (!this.game) return
				
				this.gameRunning = true
				this.gameStatus = null
				this.game.start()
				
				uni.showToast({
					title: '游戏开始！',
					icon: 'none',
					duration: 1000
				})
			},
			
			// 暂停/继续游戏
			pauseGame() {
				if (!this.game || !this.gameRunning) return
				
				if (this.isPaused) {
					this.game.resume()
					this.isPaused = false
					uni.showToast({
						title: '游戏继续',
						icon: 'none',
						duration: 1000
					})
				} else {
					this.game.pause()
					this.isPaused = true
					uni.showToast({
						title: '游戏暂停',
						icon: 'none',
						duration: 1000
					})
				}
			},
			
			// 重新开始游戏
			restartGame() {
				// 重置特效状态
				this.isNewRecord = false
				this.showNewRecordEffect = false
				
				// 重新初始化游戏
				this.initGame()
				this.score = 0
				
				// 显示提示
				uni.showToast({
					title: '游戏重新开始',
					icon: 'none',
					duration: 1500
				})
			},
			
			// 触摸开始
			onTouchStart(event) {
				if (!this.gameRunning || this.gameStatus || this.isPaused) return
				
				event.preventDefault()
				event.stopPropagation()
				
				const touch = event.touches[0]
				this.touchStartX = touch.clientX
				this.touchStartY = touch.clientY
			},
			
			// 触摸移动
			onTouchMove(event) {
				event.preventDefault()
				event.stopPropagation()
			},
			
			// 触摸结束
			onTouchEnd(event) {
				if (!this.gameRunning || this.gameStatus || this.isPaused) return
				
				event.preventDefault()
				event.stopPropagation()
				
				const touch = event.changedTouches[0]
				const deltaX = touch.clientX - this.touchStartX
				const deltaY = touch.clientY - this.touchStartY
				
				const absDeltaX = Math.abs(deltaX)
				const absDeltaY = Math.abs(deltaY)
				
				// 检查是否达到最小滑动距离
				if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
					return
				}
				
				let direction = null
				
				// 确定滑动方向
				if (absDeltaX > absDeltaY) {
					direction = deltaX > 0 ? 'right' : 'left'
				} else {
					direction = deltaY > 0 ? 'down' : 'up'
				}
				
				this.handleDirectionChange(direction)
			},
			
			// 处理方向变化
			handleDirectionChange(direction) {
				if (this.game) {
					this.game.changeDirection(direction)
					uni.vibrateShort({ type: 'light' })
				}
			},
			
			// 处理方向按钮点击
			handleDirectionClick(direction) {
				if (!this.gameRunning || this.gameStatus || this.isPaused) return
				
				this.handleDirectionChange(direction)
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载最高分
			loadBestScore() {
				try {
					const saved = uni.getStorageSync('snake_best_score')
					let newBestScore = 0
					if (saved !== null && saved !== undefined && saved !== '') {
						const numValue = Number(saved)
						if (!isNaN(numValue) && numValue >= 0) {
							newBestScore = Math.floor(numValue)
						}
					}
					this._bestScoreData = newBestScore
				} catch (e) {
					console.log('加载最高分失败:', e)
					this._bestScoreData = 0
				}
			},
			
			// 检查并显示新纪录
			checkAndShowNewRecord() {
				if (this.score > this.bestScore) {
					this._bestScoreData = this.score
					this.isNewRecord = true
					
					// 保存到本地存储
					this.saveBestScoreToStorage()
					
					// 显示新纪录特效
					this.showNewRecordEffect = true
					
					// 震动反馈
					uni.vibrateShort({ type: 'heavy' })
					
					// 4秒后隐藏特效
					setTimeout(() => {
						this.showNewRecordEffect = false
					}, 4000)
					
					// 6秒后隐藏新纪录标识
					setTimeout(() => {
						this.isNewRecord = false
					}, 6000)
				}
			},

			// 保存最高分到本地存储
			saveBestScoreToStorage() {
				try {
					const scoreToSave = this._bestScoreData
					uni.setStorageSync('snake_best_score', scoreToSave)
					console.log('贪吃蛇最高分已保存:', scoreToSave)
				} catch (e) {
					console.log('保存最高分失败:', e)
				}
			},

			// 保存最高分
			saveBestScore() {
				if (this.score > this.bestScore) {
					this._bestScoreData = this.score
					this.saveBestScoreToStorage()
				}
			},
			
			// 显示游戏说明
			showInfo() {
				this.showInfoModal = true
			},
			
			// 关闭游戏说明弹窗
			closeInfoModal() {
				this.showInfoModal = false
			}
		}
	}
</script>

<style>
	@import './snake.css';
</style>
