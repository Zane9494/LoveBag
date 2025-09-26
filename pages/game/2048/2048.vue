<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">2048</text>
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
					<text class="score-value">{{ bestScore || 0 }}</text>
					<view class="new-record-badge" v-if="isNewRecord">
						<text class="badge-text">新纪录!</text>
					</view>
				</view>
			</view>


			<!-- 游戏说明 -->
			<view class="game-info">
				<text class="info-text">滑动合并相同数字，达到2048就获胜！</text>
			</view>

			<!-- 游戏网格 -->
			<view class="game-grid" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
				<view class="grid-row" v-for="(row, rowIndex) in grid" :key="rowIndex">
					<view 
						class="grid-cell" 
						v-for="(cell, colIndex) in row" 
						:key="colIndex"
						:class="getCellClass(cell)"
					>
						<text v-if="cell !== 0" class="cell-number">{{ cell }}</text>
					</view>
				</view>
			</view>

			<!-- 游戏结束状态 -->
			<view class="game-over-info" v-if="gameStatus">
				<text class="game-over-title">{{ gameStatus === 'win' ? '🎉 恭喜获胜！' : '😔 游戏结束' }}</text>
				<text class="game-over-subtitle">{{ gameStatus === 'win' ? '你达到了2048！' : '没有可移动的方块了' }}</text>
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
			
			<!-- 重新开始按钮 -->
			<view class="restart-button-container" v-if="gameStatus">
				<view class="restart-btn" @click="restartGame">
					<text class="restart-btn-text">重新开始</text>
				</view>
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
							<text class="rule-desc">滑动方块，合并相同数字，达到2048就获胜！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 上下左右滑动屏幕移动所有方块</text>
							<text class="rule-desc">• 相同数字的方块碰撞时会合并</text>
							<text class="rule-desc">• 每次移动后会随机生成新方块</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🏆 计分规则</text>
							<text class="rule-desc">• 每次合并获得合并后数字的分数</text>
							<text class="rule-desc">• 数字越大，获得的分数越高</text>
							<text class="rule-desc">• 挑战你的最高分记录！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 尽量将大数字放在角落</text>
							<text class="rule-desc">• 保持数字按大小排列</text>
							<text class="rule-desc">• 避免随意滑动，要有策略</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { Game2048 } from './2048.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				grid: [],
				score: 0,
				bestScore: 0,
				gameStatus: null, // null, 'win', 'lose'
				touchStartX: 0,
				touchStartY: 0,
				minSwipeDistance: 50,
				showInfoModal: false, // 游戏说明弹窗可见性
				isNewRecord: false, // 是否创造了新记录
				showNewRecordEffect: false // 显示新纪录特效
			}
		},
		
		async onLoad() {
			this.getSystemInfo()
			await this.loadBestScore() // 确保最高分加载完成
			this.initGame()
		},
		
		async onUnload() {
			await this.saveBestScore()
		},
		
		methods: {
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},
			
			// 初始化游戏
			initGame() {
				this.game = new Game2048()
				this.updateDisplay()
				this.gameStatus = null
			},
			
			// 更新显示
			async updateDisplay() {
				this.grid = this.game.getGrid()
				this.score = this.game.getScore()
				
				// 实时更新最高分显示（如果当前分数超过最高分）
				if (this.score > this.bestScore) {
					// 不立即更新bestScore，只在游戏结束时更新
					// 但确保显示是正确的
				}
				
				await this.checkGameStatus()
				
				// 强制更新视图确保分数显示正确
				this.$nextTick(() => {
					this.$forceUpdate()
				})
			},
			
			// 检查游戏状态
			async checkGameStatus() {
				if (this.game.hasWon() && this.gameStatus !== 'win') {
					this.gameStatus = 'win'
					await this.checkAndShowNewRecord()
					uni.vibrateShort({ type: 'heavy' })
				} else if (this.game.isGameOver()) {
					this.gameStatus = 'lose'
					await this.checkAndShowNewRecord()
					uni.vibrateShort({ type: 'heavy' })
				}
			},
			
			// 获取方块样式类名
			getCellClass(value) {
				return value !== 0 ? `cell-${value}` : ''
			},
			
			// 触摸开始
			onTouchStart(event) {
				if (this.gameStatus) return
				
				// 阻止默认行为，防止页面滚动
				event.preventDefault()
				event.stopPropagation()
				
				const touch = event.touches[0]
				this.touchStartX = touch.clientX
				this.touchStartY = touch.clientY
			},
			
			// 触摸移动
			onTouchMove(event) {
				// 阻止默认的滚动行为
				event.preventDefault()
				event.stopPropagation()
			},
			
			// 触摸结束
			onTouchEnd(event) {
				if (this.gameStatus) return
				
				// 阻止默认行为，防止页面滚动
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
				
				this.handleMove(direction)
			},
			
			// 处理移动
			async handleMove(direction) {
				const moved = this.game.move(direction)
				if (moved) {
					await this.updateDisplay()
					uni.vibrateShort({ type: 'light' })
				}
			},
			
			// 重新开始游戏
			restartGame() {
				// 重置特效状态
				this.isNewRecord = false
				this.showNewRecordEffect = false
				
				// 重新初始化游戏
				this.initGame()
				
				// 显示提示
				uni.showToast({
					title: '游戏重新开始',
					icon: 'none',
					duration: 1500
				})
			},
			
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载最高分
			async loadBestScore() {
				try {
					// 使用异步方法获取存储数据
					const saved = await new Promise((resolve, reject) => {
						try {
							const result = uni.getStorageSync('game2048_best_score')
							resolve(result)
						} catch (error) {
							reject(error)
						}
					})
					
					// 确保数据类型正确并更新视图
					if (saved !== null && saved !== undefined && typeof saved === 'number' && saved >= 0) {
						this.bestScore = saved
					} else {
						this.bestScore = 0
					}
					
					// 强制更新视图
					this.$forceUpdate()
					console.log('最高分加载成功:', this.bestScore)
				} catch (e) {
					console.log('加载最高分失败:', e)
					this.bestScore = 0
					this.$forceUpdate()
				}
			},
			
			// 检查并显示新纪录（仅在游戏结束时）
			async checkAndShowNewRecord() {
				if (this.score > this.bestScore) {
					// 创造了新纪录
					this.bestScore = this.score
					this.isNewRecord = true
					
					// 立即更新视图
					this.$forceUpdate()
					
					// 保存到本地存储
					await this.saveBestScoreToStorage()
					
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
				} else {
					// 没有新纪录，保存当前分数（如果需要）
					await this.saveBestScore()
				}
			},

			// 保存最高分到本地存储
			async saveBestScoreToStorage() {
				try {
					// 使用异步方法保存数据，确保保存成功
					await new Promise((resolve, reject) => {
						try {
							uni.setStorageSync('game2048_best_score', this.bestScore)
							resolve()
						} catch (error) {
							reject(error)
						}
					})
					
					// 验证保存是否成功
					const verification = uni.getStorageSync('game2048_best_score')
					if (verification === this.bestScore) {
						console.log('最高分已保存并验证:', this.bestScore)
					} else {
						console.warn('最高分保存验证失败')
						// 重试一次
						uni.setStorageSync('game2048_best_score', this.bestScore)
					}
				} catch (e) {
					console.log('保存最高分失败:', e)
					// 重试保存
					try {
						uni.setStorageSync('game2048_best_score', this.bestScore)
						console.log('重试保存最高分成功')
					} catch (retryError) {
						console.log('重试保存最高分也失败:', retryError)
					}
				}
			},

			// 保存最高分（兼容旧版本）
			async saveBestScore() {
				if (this.score > this.bestScore) {
					this.bestScore = this.score
					this.$forceUpdate()
					await this.saveBestScoreToStorage()
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
	@import './2048.css';
</style>
