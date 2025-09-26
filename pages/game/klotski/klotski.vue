<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">华容道</text>
				<view class="info-btn" @click="showInfo">
					<text class="iconfont icon-gengduo1 info-icon"></text>
				</view>
			</view>
		</view>

		<!-- 游戏区域 -->
		<view class="game-container">
			<!-- 游戏信息区域 -->
			<view class="game-info-container">
				<view class="info-item">
					<text class="info-label">步数</text>
					<text class="info-value">{{ moves }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">时间</text>
					<text class="info-value">{{ formatTime(time) }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">最少步数</text>
					<text class="info-value">{{ bestMoves > 0 ? bestMoves : '--' }}</text>
				</view>
			</view>

			<!-- 游戏说明 -->
			<view class="game-desc">
				<text class="desc-text">移动数字方块，按顺序排列1-15，空格在右下角即获胜！</text>
			</view>

			<!-- 游戏网格 -->
			<view class="game-grid">
				<view 
					class="grid-cell" 
					v-for="(cell, index) in puzzle" 
					:key="index"
					:class="getCellClass(cell, index)"
					@click="moveBlock(index)"
				>
					<text v-if="cell !== 0" class="cell-number">{{ cell }}</text>
				</view>
			</view>

			<!-- 游戏完成状态 -->
			<view class="game-complete-info" v-if="isComplete">
				<text class="complete-title">🎉 恭喜完成！</text>
				<text class="complete-subtitle">用时 {{ formatTime(time) }}，共 {{ moves }} 步</text>
				<text class="complete-record" v-if="isNewRecord">🏆 创造新纪录！</text>
			</view>
			
			<!-- 操作按钮区域 -->
			<view class="button-container">
				<view class="game-btn shuffle-btn" @click="shufflePuzzle">
					<text class="btn-text">打乱</text>
				</view>
				<view class="game-btn restart-btn" @click="restartGame">
					<text class="btn-text">重新开始</text>
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
							<text class="rule-desc">将数字方块按顺序排列，1-15从左到右、从上到下，空格在右下角。</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 点击数字方块移动到相邻的空位</text>
							<text class="rule-desc">• 只能移动与空格相邻的方块</text>
							<text class="rule-desc">• 每次移动步数+1</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🏆 计分规则</text>
							<text class="rule-desc">• 用最少的步数完成挑战</text>
							<text class="rule-desc">• 记录你的最佳成绩</text>
							<text class="rule-desc">• 挑战更快的完成时间</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 先排列前两行的数字</text>
							<text class="rule-desc">• 从左到右逐列完成</text>
							<text class="rule-desc">• 保持空格的灵活性</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { KlotskiGame } from './klotski.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				puzzle: [],
				moves: 0,
				time: 0,
				bestMoves: 0,
				isComplete: false,
				isNewRecord: false,
				showInfoModal: false,
				timer: null
			}
		},
		
		onLoad() {
			this.getSystemInfo()
			this.loadBestRecord()
			this.initGame()
		},
		
		onShow() {
			this.loadBestRecord()
		},
		
		onUnload() {
			this.saveBestRecord()
			if (this.timer) {
				clearInterval(this.timer)
			}
		},
		
		methods: {
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},
			
			// 初始化游戏
			initGame() {
				this.game = new KlotskiGame()
				this.updateDisplay()
				this.startTimer()
			},
			
			// 更新显示
			updateDisplay() {
				this.puzzle = this.game.getPuzzle()
				this.moves = this.game.getMoves()
				this.checkComplete()
			},
			
			// 检查是否完成
			checkComplete() {
				if (this.game.isComplete() && !this.isComplete) {
					this.isComplete = true
					this.stopTimer()
					this.checkNewRecord()
					uni.vibrateShort({ type: 'heavy' })
				}
			},
			
			// 检查新纪录
			checkNewRecord() {
				if (this.bestMoves === 0 || this.moves < this.bestMoves) {
					this.bestMoves = this.moves
					this.isNewRecord = true
					this.saveBestRecord()
				}
			},
			
			// 获取方块样式类名
			getCellClass(value, index) {
				const classes = []
				if (value === 0) {
					classes.push('empty-cell')
				} else {
					classes.push('number-cell')
				}
				
				// 检查是否可移动
				if (value !== 0 && this.game.canMove(index)) {
					classes.push('movable')
				}
				
				return classes.join(' ')
			},
			
			// 移动方块
			moveBlock(index) {
				if (this.isComplete) return
				
				const moved = this.game.move(index)
				if (moved) {
					this.updateDisplay()
					uni.vibrateShort({ type: 'light' })
				}
			},
			
			// 打乱拼图
			shufflePuzzle() {
				this.game.shuffle()
				this.resetGame()
				this.updateDisplay()
				this.startTimer()
			},
			
			// 重新开始游戏
			restartGame() {
				this.resetGame()
				this.game.reset()
				this.game.shuffle() // 重新开始后要打乱棋盘
				this.updateDisplay()
				this.startTimer()
			},
			
			// 重置游戏状态
			resetGame() {
				this.isComplete = false
				this.isNewRecord = false
				this.time = 0
				this.stopTimer()
			},
			
			// 开始计时
			startTimer() {
				this.stopTimer()
				this.timer = setInterval(() => {
					if (!this.isComplete) {
						this.time++
					}
				}, 1000)
			},
			
			// 停止计时
			stopTimer() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			},
			
			// 格式化时间显示
			formatTime(seconds) {
				const minutes = Math.floor(seconds / 60)
				const secs = seconds % 60
				return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
			},
			
			// 加载最佳纪录
			loadBestRecord() {
				try {
					const saved = uni.getStorageSync('klotski_best_moves')
					if (saved && !isNaN(saved)) {
						this.bestMoves = parseInt(saved)
					}
				} catch (e) {
					console.log('加载最佳纪录失败:', e)
				}
			},
			
			// 保存最佳纪录
			saveBestRecord() {
				try {
					if (this.bestMoves > 0) {
						uni.setStorageSync('klotski_best_moves', this.bestMoves)
					}
				} catch (e) {
					console.log('保存最佳纪录失败:', e)
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
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
	@import './klotski.css';
</style>
