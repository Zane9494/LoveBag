<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="navbar-left">
					<view class="back-btn" @click="goBack">
						<text class="iconfont icon-fanhui back-icon"></text>
					</view>
				</view>
				<text class="navbar-title">2048</text>
				<view class="navbar-right">
					<view class="restart-btn" @click="restartGame">
						<text class="iconfont icon-shuaxin restart-icon"></text>
					</view>
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
				<view class="score-box">
					<text class="score-label">最高分</text>
					<text class="score-value">{{ bestScore }}</text>
				</view>
			</view>

			<!-- 游戏说明 -->
			<view class="game-info">
				<text class="info-text">滑动合并相同数字，达到2048就获胜！</text>
			</view>

			<!-- 游戏网格 -->
			<view class="game-grid" @touchstart="onTouchStart" @touchend="onTouchEnd">
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

			<!-- 游戏状态提示 -->
			<view class="game-status" v-if="gameStatus">
				<view class="status-overlay">
					<view class="status-content">
						<text class="status-title">{{ gameStatus === 'win' ? '恭喜获胜！' : '游戏结束' }}</text>
						<text class="status-subtitle">{{ gameStatus === 'win' ? '你达到了2048！' : '没有可移动的方块了' }}</text>
						<view class="status-buttons">
							<view class="status-btn" @click="restartGame">
								<text class="btn-text">重新开始</text>
							</view>
							<view class="status-btn secondary" @click="goBack" v-if="gameStatus === 'lose'">
								<text class="btn-text">返回</text>
							</view>
							<view class="status-btn secondary" @click="continueGame" v-if="gameStatus === 'win'">
								<text class="btn-text">继续游戏</text>
							</view>
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
				minSwipeDistance: 50
			}
		},
		
		onLoad() {
			this.getSystemInfo()
			this.initGame()
			this.loadBestScore()
		},
		
		onUnload() {
			this.saveBestScore()
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
			updateDisplay() {
				this.grid = this.game.getGrid()
				this.score = this.game.getScore()
				this.checkGameStatus()
			},
			
			// 检查游戏状态
			checkGameStatus() {
				if (this.game.hasWon() && this.gameStatus !== 'win') {
					this.gameStatus = 'win'
					this.saveBestScore()
					uni.vibrateShort({ type: 'heavy' })
				} else if (this.game.isGameOver()) {
					this.gameStatus = 'lose'
					this.saveBestScore()
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
				
				const touch = event.touches[0]
				this.touchStartX = touch.clientX
				this.touchStartY = touch.clientY
			},
			
			// 触摸结束
			onTouchEnd(event) {
				if (this.gameStatus) return
				
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
			handleMove(direction) {
				const moved = this.game.move(direction)
				if (moved) {
					this.updateDisplay()
					uni.vibrateShort({ type: 'light' })
				}
			},
			
			// 重新开始游戏
			restartGame() {
				this.initGame()
				uni.showToast({
					title: '游戏重新开始',
					icon: 'none',
					duration: 1500
				})
			},
			
			// 继续游戏
			continueGame() {
				this.gameStatus = null
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载最高分
			loadBestScore() {
				try {
					const saved = uni.getStorageSync('game2048_best_score')
					this.bestScore = saved || 0
				} catch (e) {
					this.bestScore = 0
				}
			},
			
			// 保存最高分
			saveBestScore() {
				if (this.score > this.bestScore) {
					this.bestScore = this.score
					try {
						uni.setStorageSync('game2048_best_score', this.bestScore)
					} catch (e) {
						console.log('保存最高分失败:', e)
					}
				}
			}
		}
	}
</script>

<style>
	@import './2048.css';
</style>
