<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">打地鼠</text>
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
				<view class="best-score-wrapper">
					<view class="score-box best-score-box" :class="{ 'new-record-glow': isNewRecord }">
						<text class="score-label">最高分</text>
						<text class="score-value">{{ bestScore }}</text>
					</view>
					<view class="new-record-badge" v-if="isNewRecord">
						<text class="badge-text">新纪录!</text>
					</view>
				</view>
			</view>

			<!-- 游戏信息 -->
			<view class="game-info">
				<view class="game-stats">
					<view class="stat-item">
						<text class="stat-label">时间</text>
						<text class="stat-value">{{ formatTime(timeLeft) }}</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">命中</text>
						<text class="stat-value">{{ hits }}</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">失误</text>
						<text class="stat-value">{{ misses }}</text>
					</view>
				</view>
			</view>

			<!-- 游戏网格 -->
			<view class="game-grid">
				<view 
					class="hole" 
					v-for="(hole, index) in holes" 
					:key="index"
					@click="whackMole(index)"
				>
					<view class="hole-background"></view>
					<view 
						class="mole" 
						v-if="hole.hasMole && hole.isVisible"
						:class="{ 'hit': hole.isHit, 'mole-appear': hole.isAppearing }"
					>
						<text class="mole-emoji">🐹</text>
					</view>
				</view>
			</view>

			<!-- 游戏控制按钮 -->
			<view class="game-controls">
				<view 
					class="start-btn" 
					@click="startGame" 
					v-if="!gameRunning && !gameEnded"
				>
					<text class="start-btn-text">开始游戏</text>
				</view>
				<view 
					class="restart-btn" 
					@click="restartGame" 
					v-if="gameEnded"
				>
					<text class="restart-btn-text">重新开始</text>
				</view>
			</view>

			<!-- 游戏结束信息 -->
			<view class="game-over-info" v-if="gameEnded">
				<text class="game-over-title">🎉 游戏结束！</text>
				<text class="game-over-subtitle">你的最终得分: {{ score }}</text>
				<text class="game-over-subtitle">命中率: {{ hitRate }}%</text>
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
							<text class="rule-desc">在规定时间内尽可能多地击中地鼠，获得高分！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 点击开始游戏按钮开始</text>
							<text class="rule-desc">• 地鼠出现时快速点击击中</text>
							<text class="rule-desc">• 击中地鼠获得分数</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🏆 计分规则</text>
							<text class="rule-desc">• 每击中一只地鼠得10分</text>
							<text class="rule-desc">• 连续击中有额外加分</text>
							<text class="rule-desc">• 挑战你的最高分记录！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 保持注意力集中</text>
							<text class="rule-desc">• 快速反应是关键</text>
							<text class="rule-desc">• 地鼠出现时间很短，要抓紧时机</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { WhackMoleGame } from './whack-mole.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				holes: [],
				score: 0,
				hits: 0,
				misses: 0,
				timeLeft: 60,
				gameRunning: false,
				gameEnded: false,
				// 专门的最高分存储变量
				_bestScoreData: 0, // 内部存储最高分的变量
				showInfoModal: false, // 游戏说明弹窗可见性
				isNewRecord: false, // 是否创造了新记录
				showNewRecordEffect: false // 显示新纪录特效
			}
		},
		
		computed: {
			// 最高分的计算属性 - 基于专门的存储变量
			bestScore() {
				return this._bestScoreData || 0
			},
			
			// 命中率
			hitRate() {
				const total = this.hits + this.misses
				return total > 0 ? Math.round((this.hits / total) * 100) : 0
			}
		},
		
		onLoad() {
			console.log('=== 页面onLoad开始 ===')
			this.getSystemInfo()
			this.loadBestScore() // 同步加载最高分
			this.initGame()
			console.log('=== 页面onLoad完成，bestScore:', this.bestScore, '===')
		},
		
		onShow() {
			console.log('=== 页面onShow开始 ===')
			// 每次显示页面时重新加载最高分，确保显示正确
			this.loadBestScore()
			console.log('=== 页面onShow完成，_bestScoreData:', this._bestScoreData, 'bestScore:', this.bestScore, '===')
		},
		
		onUnload() {
			this.saveBestScore()
			// 清理游戏定时器
			if (this.game) {
				this.game.destroy()
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
				this.game = new WhackMoleGame(9) // 3x3网格
				this.holes = this.game.getHoles()
				this.score = 0
				this.hits = 0
				this.misses = 0
				this.timeLeft = 60
				this.gameRunning = false
				this.gameEnded = false
				this.updateDisplay()
			},
			
			// 更新显示
			updateDisplay() {
				this.holes = this.game.getHoles()
				this.score = this.game.getScore()
				this.hits = this.game.getHits()
				this.misses = this.game.getMisses()
			},
			
			// 开始游戏
			startGame() {
				this.gameRunning = true
				this.gameEnded = false
				this.game.start()
				this.startGameTimer()
				
				// 游戏事件监听
				this.game.onUpdate(() => {
					this.updateDisplay()
				})
				
				this.game.onGameEnd(() => {
					this.endGame()
				})
			},
			
			// 开始游戏计时器
			startGameTimer() {
				const timer = setInterval(() => {
					this.timeLeft--
					if (this.timeLeft <= 0) {
						clearInterval(timer)
						this.endGame()
					}
				}, 1000)
			},
			
			// 结束游戏
			endGame() {
				this.gameRunning = false
				this.gameEnded = true
				this.game.stop()
				this.checkAndShowNewRecord()
				
				// 震动反馈
				uni.vibrateShort({ type: 'heavy' })
			},
			
			// 击打地鼠
			whackMole(index) {
				if (!this.gameRunning) return
				
				const hit = this.game.whack(index)
				if (hit) {
					// 击中震动反馈
					uni.vibrateShort({ type: 'light' })
				}
				this.updateDisplay()
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
			
			// 格式化时间显示
			formatTime(seconds) {
				const mins = Math.floor(seconds / 60)
				const secs = seconds % 60
				return `${mins}:${secs.toString().padStart(2, '0')}`
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载最高分 - 使用专门的存储变量
			loadBestScore() {
				try {
					console.log('开始加载最高分...')
					const saved = uni.getStorageSync('whack_mole_best_score')
					console.log('从存储读取的原始数据:', saved, '类型:', typeof saved)
					
					let newBestScore = 0
					if (saved !== null && saved !== undefined && saved !== '') {
						const numValue = Number(saved)
						if (!isNaN(numValue) && numValue >= 0) {
							newBestScore = Math.floor(numValue)
						}
					}
					
					console.log('计算出的最高分:', newBestScore)
					
					// 直接设置专门的存储变量
					this._bestScoreData = newBestScore
					
					console.log('设置后的_bestScoreData:', this._bestScoreData)
					console.log('计算属性bestScore:', this.bestScore)
					
				} catch (e) {
					console.log('加载最高分失败:', e)
					this._bestScoreData = 0
				}
			},
			
			// 检查并显示新纪录（仅在游戏结束时）
			checkAndShowNewRecord() {
				if (this.score > this.bestScore) {
					// 创造了新纪录
					console.log('检测到新纪录，当前分数:', this.score, '原最高分:', this.bestScore)
					
					// 直接更新专门的存储变量
					this._bestScoreData = this.score
					this.isNewRecord = true
					
					console.log('创造新纪录，更新后的_bestScoreData:', this._bestScoreData, 'bestScore:', this.bestScore)
					
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

			// 保存最高分到本地存储 - 基于专门的存储变量
			saveBestScoreToStorage() {
				try {
					const scoreToSave = this._bestScoreData
					uni.setStorageSync('whack_mole_best_score', scoreToSave)
					console.log('最高分已保存:', scoreToSave)
				} catch (e) {
					console.log('保存最高分失败:', e)
				}
			},

			// 保存最高分（兼容旧版本）
			saveBestScore() {
				if (this.score > this.bestScore) {
					console.log('保存最高分，当前分数:', this.score, '原最高分:', this.bestScore)
					this._bestScoreData = this.score
					this.saveBestScoreToStorage()
					console.log('保存最高分完成，新最高分:', this.bestScore)
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
	@import './whack-mole.css';
</style>

