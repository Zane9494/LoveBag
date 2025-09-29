<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">跳一跳</text>
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
				<text class="info-text">长按蓄力，松开跳跃，精准落在下一个方块上！</text>
			</view>

			<!-- 游戏画布区域 -->
			<view class="game-canvas-container">
				<canvas 
					canvas-id="jumpGameCanvas" 
					class="game-canvas"
					@touchstart="onTouchStart"
					@touchend="onTouchEnd"
				></canvas>
			</view>

			<!-- 游戏状态显示 -->
			<view class="game-status" v-if="gameStatus">
				<view class="status-content">
					<text class="status-title">{{ gameStatus === 'over' ? '游戏结束' : '暂停' }}</text>
					<text class="status-subtitle" v-if="gameStatus === 'over'">得分: {{ score }}</text>
					<view class="status-buttons">
						<view class="status-btn restart-btn" @click="restartGame">
							<text class="btn-text">重新开始</text>
						</view>
						<view class="status-btn resume-btn" v-if="gameStatus === 'paused'" @click="resumeGame">
							<text class="btn-text">继续游戏</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 操作提示 -->
			<view class="control-tips" v-if="!gameStarted">
				<text class="tip-text">长按屏幕蓄力</text>
				<text class="tip-text">松开手指跳跃</text>
				<text class="tip-text">精准落在下一个方块上</text>
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
			<view class="particle" v-for="i in 8" :key="i" :class="`particle-${i}`">
				<text class="particle-icon">✨</text>
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
							<text class="rule-desc">控制小人跳跃到下一个方块上，连续成功跳跃获得高分！</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 长按屏幕开始蓄力</text>
							<text class="rule-desc">• 蓄力时间越长，跳跃距离越远</text>
							<text class="rule-desc">• 松开手指，小人会跳跃</text>
							<text class="rule-desc">• 精准落在下一个方块中心获得更高分</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🏆 计分规则</text>
							<text class="rule-desc">• 成功跳跃到下一个方块得1分</text>
							<text class="rule-desc">• 连续跳跃中心位置可获得连击奖励</text>
							<text class="rule-desc">• 连击数越高，单次得分越多</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 观察下一个方块的距离</text>
							<text class="rule-desc">• 控制蓄力时间，找到合适的力度</text>
							<text class="rule-desc">• 尽量跳跃到方块中心获得连击</text>
							<text class="rule-desc">• 保持节奏，不要着急</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { JumpJumpGame } from './jump-jump.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				score: 0,
				_bestScoreData: 0, // 内部存储最高分的变量
				gameStatus: null, // null, 'over', 'paused'
				gameStarted: false,
				showInfoModal: false, // 游戏说明弹窗可见性
				isNewRecord: false, // 是否创造了新记录
				showNewRecordEffect: false, // 显示新纪录特效
				charging: false, // 是否在蓄力
				chargeStartTime: 0 // 蓄力开始时间
			}
		},
		
		computed: {
			// 最高分的计算属性
			bestScore() {
				return this._bestScoreData || 0
			}
		},
		
		onLoad() {
			console.log('=== 跳一跳页面onLoad开始 ===')
			this.getSystemInfo()
			this.loadBestScore()
			this.initGame()
		},
		
		onShow() {
			console.log('=== 跳一跳页面onShow开始 ===')
			this.loadBestScore()
		},
		
		onUnload() {
			this.saveBestScore()
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
				this.$nextTick(() => {
					this.game = new JumpJumpGame('jumpGameCanvas', {
						onScoreUpdate: this.onScoreUpdate,
						onGameOver: this.onGameOver,
						onGameStart: this.onGameStart
					})
					this.game.init()
					this.gameStatus = null
					this.gameStarted = false
				})
			},
			
			// 分数更新回调
			onScoreUpdate(newScore) {
				this.score = newScore
			},
			
			// 游戏开始回调
			onGameStart() {
				this.gameStarted = true
			},
			
			// 游戏结束回调
			onGameOver() {
				this.gameStatus = 'over'
				this.checkAndShowNewRecord()
				uni.vibrateShort({ type: 'heavy' })
			},
			
			// 触摸开始 - 开始蓄力
			onTouchStart(event) {
				if (this.gameStatus) return
				
				event.preventDefault()
				this.charging = true
				this.chargeStartTime = Date.now()
				
				if (this.game) {
					this.game.startCharge()
				}
			},
			
			// 触摸结束 - 释放跳跃
			onTouchEnd(event) {
				if (this.gameStatus || !this.charging) return
				
				event.preventDefault()
				this.charging = false
				
				const chargeTime = Date.now() - this.chargeStartTime
				
				if (this.game) {
					this.game.jump(chargeTime)
				}
			},
			
			// 重新开始游戏
			restartGame() {
				// 重置特效状态
				this.isNewRecord = false
				this.showNewRecordEffect = false
				
				// 重置游戏状态
				this.score = 0
				this.gameStatus = null
				this.gameStarted = false
				this.charging = false
				
				// 重新初始化游戏
				if (this.game) {
					this.game.restart()
				}
				
				// 显示提示
				uni.showToast({
					title: '游戏重新开始',
					icon: 'none',
					duration: 1500
				})
			},
			
			// 继续游戏
			resumeGame() {
				this.gameStatus = null
				if (this.game) {
					this.game.resume()
				}
			},
			
			// 暂停游戏
			pauseGame() {
				this.gameStatus = 'paused'
				if (this.game) {
					this.game.pause()
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 加载最高分
			loadBestScore() {
				try {
					console.log('开始加载跳一跳最高分...')
					const saved = uni.getStorageSync('jump_jump_best_score')
					console.log('从存储读取的原始数据:', saved, '类型:', typeof saved)
					
					let newBestScore = 0
					if (saved !== null && saved !== undefined && saved !== '') {
						const numValue = Number(saved)
						if (!isNaN(numValue) && numValue >= 0) {
							newBestScore = Math.floor(numValue)
						}
					}
					
					console.log('计算出的最高分:', newBestScore)
					this._bestScoreData = newBestScore
					
				} catch (e) {
					console.log('加载最高分失败:', e)
					this._bestScoreData = 0
				}
			},
			
			// 检查并显示新纪录
			checkAndShowNewRecord() {
				if (this.score > this.bestScore) {
					console.log('检测到新纪录，当前分数:', this.score, '原最高分:', this.bestScore)
					
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
					uni.setStorageSync('jump_jump_best_score', scoreToSave)
					console.log('跳一跳最高分已保存:', scoreToSave)
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
	@import './jump-jump.css';
</style>
