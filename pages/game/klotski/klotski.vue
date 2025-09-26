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
			<!-- 分数区域 -->
			<view class="score-container">
				<view class="score-box">
					<text class="score-label">步数</text>
					<text class="score-value">{{ moves }}</text>
				</view>
				<view class="score-box">
					<text class="score-label">时间</text>
					<text class="score-value">{{ formatTime(time) }}</text>
				</view>
				<view class="best-score-wrapper">
					<view class="score-box best-score-box" :class="{ 'new-record-glow': isNewRecord }">
						<text class="score-label">最少步数</text>
						<text class="score-value">{{ bestMoves }}</text>
					</view>
					<view class="new-record-badge" v-if="isNewRecord">
						<text class="badge-text">新纪录!</text>
					</view>
				</view>
			</view>

			<!-- 游戏说明 -->
			<view class="game-desc">
				<text class="desc-text">移动数字方块，按顺序排列1-8，空格在右下角即获胜！</text>
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
			
			<!-- 新纪录特效 -->
			<view class="new-record-effect" v-if="showNewRecordEffect">
				<!-- 闪光效果 -->
				<view class="flash-overlay"></view>
				
				<!-- 主文本 -->
				<view class="record-text-container">
					<text class="record-main-text">🏆 新纪录 🏆</text>
					<text class="record-sub-text">恭喜创造最少步数记录！</text>
				</view>
				
				<!-- 粒子效果 -->
				<view class="particle" v-for="i in 12" :key="i" :class="`particle-${i}`">
					<text class="particle-icon">✨</text>
				</view>
				
				<!-- 光环效果 -->
				<view class="light-ring"></view>
				<view class="light-ring light-ring-2"></view>
			</view>
			
			<!-- 操作按钮区域 -->
			<view class="button-container">
				<view class="game-btn shuffle-btn" @click="shufflePuzzle" v-if="!isComplete">
					<text class="btn-text">打乱</text>
				</view>
				<view class="game-btn restart-btn" @click="restartGame" v-if="isComplete">
					<text class="btn-text">重新挑战</text>
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
							<text class="rule-desc">将数字方块按顺序排列，1-8从左到右、从上到下，空格在右下角。</text>
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
				// 专门的最少步数存储变量
				_bestMovesData: 0, // 内部存储最少步数的变量
				isComplete: false,
				isNewRecord: false, // 是否创造了新记录
				showNewRecordEffect: false, // 显示新纪录特效
				showInfoModal: false,
				timer: null
			}
		},
		
		computed: {
			// 最少步数的计算属性 - 基于专门的存储变量
			bestMoves() {
				return this._bestMovesData || 0
			}
		},
		
		onLoad() {
			console.log('=== 页面onLoad开始 ===')
			this.getSystemInfo()
			this.loadBestMoves() // 同步加载最少步数
			this.initGame()
			console.log('=== 页面onLoad完成，bestMoves:', this.bestMoves, '===')
		},
		
		onShow() {
			console.log('=== 页面onShow开始 ===')
			// 每次显示页面时重新加载最少步数，确保显示正确
			this.loadBestMoves()
			console.log('=== 页面onShow完成，_bestMovesData:', this._bestMovesData, 'bestMoves:', this.bestMoves, '===')
		},
		
		onUnload() {
			this.saveBestMoves()
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
					this.checkAndShowNewRecord()
					uni.vibrateShort({ type: 'heavy' })
				}
			},
			
			// 检查并显示新纪录（仅在游戏结束时）
			checkAndShowNewRecord() {
				if (this.bestMoves === 0 || this.moves < this.bestMoves) {
					// 创造了新纪录
					console.log('检测到新纪录，当前步数:', this.moves, '原最少步数:', this.bestMoves)
					
					// 直接更新专门的存储变量
					this._bestMovesData = this.moves
					this.isNewRecord = true
					
					console.log('创造新纪录，更新后的_bestMovesData:', this._bestMovesData, 'bestMoves:', this.bestMoves)
					
					// 保存到本地存储
					this.saveBestMovesToStorage()
					
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
				// 重置特效状态
				this.isNewRecord = false
				this.showNewRecordEffect = false
				
				this.resetGame()
				this.game.reset()
				this.game.shuffle() // 重新开始后要打乱棋盘
				this.updateDisplay()
				this.startTimer()
				
				// 显示提示
				uni.showToast({
					title: '游戏重新开始',
					icon: 'none',
					duration: 1500
				})
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
			
			// 加载最少步数 - 使用专门的存储变量
			loadBestMoves() {
				try {
					console.log('开始加载最少步数...')
					const saved = uni.getStorageSync('klotski_best_moves')
					console.log('从存储读取的原始数据:', saved, '类型:', typeof saved)
					
					let newBestMoves = 0
					if (saved !== null && saved !== undefined && saved !== '') {
						const numValue = Number(saved)
						if (!isNaN(numValue) && numValue >= 0) {
							newBestMoves = Math.floor(numValue)
						}
					}
					
					console.log('计算出的最少步数:', newBestMoves)
					
					// 直接设置专门的存储变量
					this._bestMovesData = newBestMoves
					
					console.log('设置后的_bestMovesData:', this._bestMovesData)
					console.log('计算属性bestMoves:', this.bestMoves)
					
				} catch (e) {
					console.log('加载最少步数失败:', e)
					this._bestMovesData = 0
				}
			},

			// 保存最少步数到本地存储 - 基于专门的存储变量
			saveBestMovesToStorage() {
				try {
					const movesToSave = this._bestMovesData
					uni.setStorageSync('klotski_best_moves', movesToSave)
					console.log('最少步数已保存:', movesToSave)
				} catch (e) {
					console.log('保存最少步数失败:', e)
				}
			},

			// 保存最少步数（兼容旧版本）
			saveBestMoves() {
				if (this.bestMoves === 0 || this.moves < this.bestMoves) {
					console.log('保存最少步数，当前步数:', this.moves, '原最少步数:', this.bestMoves)
					this._bestMovesData = this.moves
					this.saveBestMovesToStorage()
					console.log('保存最少步数完成，新最少步数:', this.bestMoves)
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
			},
			
			// 测试方法：清除最少步数存储（仅用于调试）
			clearBestMoves() {
				try {
					uni.removeStorageSync('klotski_best_moves')
					this._bestMovesData = 0
					console.log('最少步数存储已清除，_bestMovesData:', this._bestMovesData, 'bestMoves:', this.bestMoves)
				} catch (e) {
					console.log('清除最少步数失败:', e)
				}
			}
		}
	}
</script>

<style>
	@import './klotski.css';
</style>
