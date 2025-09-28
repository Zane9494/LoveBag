<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">飞翔的小鸟</text>
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

			<!-- 游戏说明 -->
			<view class="game-info">
				<text class="info-text">点击屏幕控制小鸟飞行，避开管道获得高分！</text>
			</view>

			<!-- 游戏画布区域 -->
			<view class="game-canvas-container">
				<canvas 
					canvas-id="flappyBirdCanvas" 
					class="game-canvas"
					@touchstart="handleTap"
					disable-scroll="true"
				></canvas>
				
				<!-- 游戏开始/结束遮罩 -->
				<view class="game-overlay" v-if="gameStatus !== 'playing'">
					<view class="overlay-content">
						<view v-if="gameStatus === 'ready'">
							<text class="overlay-title">🐦 飞翔的小鸟</text>
							<text class="overlay-subtitle">点击屏幕开始游戏</text>
							<view class="start-btn" @click="startGame">
								<text class="start-btn-text">开始游戏</text>
							</view>
						</view>
						
						<view v-if="gameStatus === 'gameOver'">
							<text class="overlay-title">💀 游戏结束</text>
							<text class="overlay-subtitle">最终得分: {{ score }}</text>
							<view class="restart-btn" @click="restartGame">
								<text class="restart-btn-text">重新开始</text>
							</view>
						</view>
					</view>
				</view>
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
							<text class="rule-desc">控制小鸟飞行，穿过尽可能多的管道获得高分！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 点击屏幕让小鸟向上飞</text>
							<text class="rule-desc">• 松开手指小鸟会下降</text>
							<text class="rule-desc">• 控制好节奏穿过管道间隙</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🏆 计分规则</text>
							<text class="rule-desc">• 成功穿过一对管道得1分</text>
							<text class="rule-desc">• 连续穿过更多管道挑战高分</text>
							<text class="rule-desc">• 挑战你的最高分记录！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 掌握好点击的节奏</text>
							<text class="rule-desc">• 保持小鸟在屏幕中间高度</text>
							<text class="rule-desc">• 不要连续快速点击</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">⚠️ 失败条件</text>
							<text class="rule-desc">• 小鸟撞到管道</text>
							<text class="rule-desc">• 小鸟撞到地面或飞出屏幕顶部</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { FlappyBirdGame } from './flappy-bird.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				score: 0,
				// 专门的最高分存储变量
				_bestScoreData: 0, // 内部存储最高分的变量
				gameStatus: 'ready', // 'ready', 'playing', 'gameOver'
				showInfoModal: false, // 游戏说明弹窗可见性
				isNewRecord: false, // 是否创造了新记录
				showNewRecordEffect: false // 显示新纪录特效
			}
		},
		
		computed: {
			// 最高分的计算属性 - 基于专门的存储变量
			bestScore() {
				return this._bestScoreData || 0
			}
		},
		
		onLoad() {
			console.log('=== 飞翔的小鸟页面onLoad开始 ===')
			this.getSystemInfo()
			this.loadBestScore() // 同步加载最高分
			this.initGame()
			console.log('=== 飞翔的小鸟页面onLoad完成，bestScore:', this.bestScore, '===')
		},
		
		onShow() {
			console.log('=== 飞翔的小鸟页面onShow开始 ===')
			// 每次显示页面时重新加载最高分，确保显示正确
			this.loadBestScore()
			console.log('=== 飞翔的小鸟页面onShow完成，_bestScoreData:', this._bestScoreData, 'bestScore:', this.bestScore, '===')
		},
		
		onUnload() {
			this.saveBestScore()
			if (this.game) {
				this.game.destroy()
			}
		},
		
		onHide() {
			// 页面隐藏时暂停游戏
			if (this.game && this.gameStatus === 'playing') {
				this.game.pause()
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
				const canvas = uni.createCanvasContext('flappyBirdCanvas', this)
				this.game = new FlappyBirdGame(canvas, {
					onScoreUpdate: (score) => {
						this.score = score
					},
					onGameOver: () => {
						this.gameStatus = 'gameOver'
						this.checkAndShowNewRecord()
						uni.vibrateShort({ type: 'heavy' })
					}
				})
				this.gameStatus = 'ready'
				this.score = 0
			},
			
			// 开始游戏
			startGame() {
				if (this.game) {
					this.gameStatus = 'playing'
					this.game.start()
				}
			},
			
			// 重新开始游戏
			restartGame() {
				// 重置特效状态
				this.isNewRecord = false
				this.showNewRecordEffect = false
				
				// 重新初始化游戏
				this.initGame()
				this.startGame()
				
				// 显示提示
				uni.showToast({
					title: '游戏重新开始',
					icon: 'none',
					duration: 1500
				})
			},
			
			// 处理点击事件
			handleTap() {
				if (this.gameStatus === 'ready') {
					this.startGame()
				} else if (this.gameStatus === 'playing' && this.game) {
					this.game.flap()
					uni.vibrateShort({ type: 'light' })
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载最高分 - 使用专门的存储变量
			loadBestScore() {
				try {
					console.log('开始加载飞翔的小鸟最高分...')
					const saved = uni.getStorageSync('flappybird_best_score')
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
					console.log('加载飞翔的小鸟最高分失败:', e)
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
					uni.setStorageSync('flappybird_best_score', scoreToSave)
					console.log('飞翔的小鸟最高分已保存:', scoreToSave)
				} catch (e) {
					console.log('保存飞翔的小鸟最高分失败:', e)
				}
			},

			// 保存最高分（兼容旧版本）
			saveBestScore() {
				if (this.score > this.bestScore) {
					console.log('保存飞翔的小鸟最高分，当前分数:', this.score, '原最高分:', this.bestScore)
					this._bestScoreData = this.score
					this.saveBestScoreToStorage()
					console.log('保存飞翔的小鸟最高分完成，新最高分:', this.bestScore)
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
	@import './flappy-bird.css';
</style>
