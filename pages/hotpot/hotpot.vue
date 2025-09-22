<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="navbar-left">
					<view class="more-btn" @click="showSideNav">
						<text class="iconfont icon-gengduo more-icon"></text>
					</view>
				</view>
				<text class="navbar-title">小锅伴</text>
				<view class="navbar-right">
					<view class="add-btn" @click="showAddTimer">
						<text class="iconfont icon-add more-icon"></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 顶部介绍卡片 -->
			<view class="hero-section" :style="currentThemeStyles">
				<view class="hero-icon">
					<text class="iconfont icon-diancanling hero-icon-text"></text>
				</view>
				<view class="hero-text">
					<text class="subtitle">火锅计时助手</text>
					<text class="description">让每种食材都恰到好处</text>
				</view>
			</view>

			<!-- 快速添加区域 -->
			<view class="quick-add-section">
				<view class="section-title">快速添加</view>
				<scroll-view class="quick-scroll" scroll-x="true" show-scrollbar="false">
					<view class="quick-list">
						<view class="quick-item"
							  v-for="item in quickItems"
							  :key="item.name"
							  @click="addQuickTimer(item)">
							<view class="quick-icon">{{item.icon}}</view>
							<text class="quick-name">{{item.name}}</text>
							<text class="quick-time">{{item.time}}s</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 活跃计时器区域 -->
			<view class="active-timers-section" v-if="activeTimers.length > 0">
				<view class="section-title">进行中的计时</view>
				<view class="timers-grid">
					<view class="timer-card"
						  v-for="timer in activeTimers"
						  :key="timer.id"
						  :class="getTimerCardClass(timer)">
						<view class="timer-header">
							<view class="timer-info">
								<text class="timer-icon">{{timer.icon}}</text>
								<text class="timer-name">{{timer.name}}</text>
							</view>
							<view class="timer-close" @click="removeTimer(timer.id)">
								<text class="close-icon">×</text>
							</view>
						</view>
						<view class="timer-display">
							<text class="timer-time" :class="getTimerTimeClass(timer)">
								{{formatTime(timer.remainingTime)}}
							</text>
							<view class="timer-progress">
								<view class="progress-bar" :style="getProgressStyle(timer)"></view>
							</view>
						</view>
						<view class="timer-actions">
							<button class="timer-btn pause-btn"
									v-if="!timer.isPaused"
									@click="pauseTimer(timer.id)">
								<text class="iconfont icon-pause btn-icon"></text>
								<text class="btn-text">暂停</text>
							</button>
							<button class="timer-btn resume-btn"
									v-else
									@click="resumeTimer(timer.id)">
								<text class="iconfont icon-play btn-icon"></text>
								<text class="btn-text">继续</text>
							</button>
							<button class="timer-btn reset-btn" @click="resetTimer(timer.id)">
								<text class="iconfont icon-refresh btn-icon"></text>
								<text class="btn-text">重置</text>
							</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 无计时器提示 -->
			<view class="empty-state" v-if="activeTimers.length === 0">
				<text class="empty-icon">🍲</text>
				<text class="empty-title">还没有计时器</text>
				<text class="empty-subtitle">添加食材开始计时吧</text>
			</view>

			<!-- 历史记录区域 -->
			<view class="history-section" v-if="completedTimers.length > 0">
				<view class="section-title">最近完成</view>
				<view class="history-list">
					<view class="history-item"
						  v-for="timer in recentCompleted"
						  :key="timer.id">
						<view class="history-info">
							<text class="history-icon">{{timer.icon}}</text>
							<text class="history-name">{{timer.name}}</text>
							<text class="history-time">{{timer.originalTime}}s</text>
						</view>
						<view class="history-action" @click="addQuickTimer(timer)">
							<text class="iconfont icon-add"></text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 侧边导航栏组件 -->
		<SideNavigation
			:visible="sideNavVisible"
			@close="hideSideNav"
		/>

		<!-- 添加计时器弹窗 -->
		<view class="modal-overlay" v-if="showAddModal" @click="closeAddModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">添加计时器</text>
					<view class="modal-close" @click="closeAddModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="add-form">
						<view class="form-section">
							<text class="form-label">食材名称</text>
							<input class="form-input"
								   v-model="newTimer.name"
								   placeholder="请输入食材名称"
								   maxlength="10" />
						</view>
						<view class="form-section">
							<text class="form-label">计时时间/秒）</text>
							<input class="form-input"
								   v-model.number="newTimer.time"
								   type="number"
								   placeholder="请输入计时时间" />
						</view>
						<view class="form-section">
							<text class="form-label">选择图标</text>
							<view class="icon-grid">
								<view class="icon-item"
									  v-for="icon in availableIcons"
									  :key="icon"
									  :class="{'active': newTimer.icon === icon}"
									  @click="selectIcon(icon)">
									<text class="icon-text">{{icon}}</text>
								</view>
							</view>
						</view>
						<view class="form-actions">
							<button class="form-btn cancel-btn" @click="closeAddModal">
								取消
							</button>
							<button class="form-btn confirm-btn"
									:style="currentThemeStyles"
									@click="addCustomTimer">
								添加
							</button>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import SideNavigation from '../../components/SideNavigation.vue'

	export default {
		components: {
			SideNavigation
		},
		data() {
			return {
				statusBarHeight: 0,
				sideNavVisible: false,
				showAddModal: false,
				activeTimers: [],
				completedTimers: [],
				timerInterval: null,
				nextTimerId: 1,

				// 主题相关
				currentTheme: 'teal',
				themeColors: {
					teal: { primary: '#4ecdc4', secondary: '#2ba3a8' },
					purple: { primary: '#8b5cf6', secondary: '#a78bfa' },
					pink: { primary: '#ff9a9e', secondary: '#fecfef' },
					orange: { primary: '#fa709a', secondary: '#fee140' },
					blue: { primary: '#3b82f6', secondary: '#1e40af' },
					green: { primary: '#10b981', secondary: '#059669' }
				},

				// 快速添加项目
				quickItems: [
					{ name: '毛肚', time: 15, icon: '🥩' },
					{ name: '鸭肠', time: 10, icon: '🦆' },
					{ name: '虾滑', time: 30, icon: '🦐' },
					{ name: '土豆片', time: 60, icon: '🥔' },
					{ name: '冬瓜', time: 90, icon: '🥒' },
					{ name: '豆腐', time: 45, icon: '🧊' },
					{ name: '金针菇', time: 120, icon: '🍄' },
					{ name: '白菜', time: 40, icon: '🥬' }
				],

				// 新计时器表单
				newTimer: {
					name: '',
					time: 30,
					icon: '🍲'
				},

				// 可选图标
				availableIcons: ['🍲', '🥩', '🦐', '🥔', '🍄', '🥬', '🥒', '🧊', '🦆', '🐟', '🥕', '🌶️']
			}
		},

		computed: {
			currentThemeStyles() {
				const colors = this.themeColors[this.currentTheme]
				return {
					background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
				}
			},

			recentCompleted() {
				return this.completedTimers.slice(-5).reverse()
			}
		},

		onLoad() {
			this.getSystemInfo()
			this.loadTheme()
			this.loadData()
			this.startTimerUpdate()
			this.recordCurrentPage()
		},

		onShow() {
			this.recordCurrentPage()
		},

		onUnload() {
			if (this.timerInterval) {
				clearInterval(this.timerInterval)
			}
		},

		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},

			loadTheme() {
				try {
					const savedTheme = uni.getStorageSync('currentTheme')
					if (savedTheme && this.themeColors[savedTheme]) {
						this.currentTheme = savedTheme
					}
				} catch (e) {
					console.log('加载主题失败:', e)
				}
			},

			loadData() {
				try {
					const savedTimers = uni.getStorageSync('hotpotActiveTimers')
					const savedCompleted = uni.getStorageSync('hotpotCompletedTimers')
					const savedNextId = uni.getStorageSync('hotpotNextTimerId')

					if (savedTimers) {
						this.activeTimers = savedTimers
					}
					if (savedCompleted) {
						this.completedTimers = savedCompleted
					}
					if (savedNextId) {
						this.nextTimerId = savedNextId
					}
				} catch (e) {
					console.log('加载数据失败:', e)
				}
			},

			saveData() {
				try {
					uni.setStorageSync('hotpotActiveTimers', this.activeTimers)
					uni.setStorageSync('hotpotCompletedTimers', this.completedTimers)
					uni.setStorageSync('hotpotNextTimerId', this.nextTimerId)
				} catch (e) {
					console.log('保存数据失败:', e)
				}
			},

			startTimerUpdate() {
				this.timerInterval = setInterval(() => {
					let hasActiveTimer = false
					this.activeTimers.forEach(timer => {
						if (!timer.isPaused && timer.remainingTime > 0) {
							timer.remainingTime--
							hasActiveTimer = true

							if (timer.remainingTime === 0) {
								this.onTimerComplete(timer)
							}
						}
					})

					if (hasActiveTimer) {
						this.saveData()
					}
				}, 1000)
			},

			addQuickTimer(item) {
				const timer = {
					id: this.nextTimerId++,
					name: item.name,
					icon: item.icon,
					originalTime: item.time,
					remainingTime: item.time,
					isPaused: false,
					startTime: Date.now()
				}

				this.activeTimers.push(timer)
				this.saveData()

				uni.showToast({
					title: `${item.name} 开始计时`,
					icon: 'success',
					duration: 1500
				})
			},

			showAddTimer() {
				this.newTimer = {
					name: '',
					time: 30,
					icon: '🍲'
				}
				this.showAddModal = true
			},

			closeAddModal() {
				this.showAddModal = false
			},

			selectIcon(icon) {
				this.newTimer.icon = icon
			},

			addCustomTimer() {
				if (!this.newTimer.name.trim()) {
					uni.showToast({
						title: '请输入食材名称',
						icon: 'none'
					})
					return
				}

				if (!this.newTimer.time || this.newTimer.time <= 0) {
					uni.showToast({
						title: '请输入正确的时间',
						icon: 'none'
					})
					return
				}

				const timer = {
					id: this.nextTimerId++,
					name: this.newTimer.name.trim(),
					icon: this.newTimer.icon,
					originalTime: this.newTimer.time,
					remainingTime: this.newTimer.time,
					isPaused: false,
					startTime: Date.now()
				}

				this.activeTimers.push(timer)
				this.saveData()
				this.closeAddModal()

				uni.showToast({
					title: `${timer.name} 开始计时`,
					icon: 'success',
					duration: 1500
				})
			},

			pauseTimer(timerId) {
				const timer = this.activeTimers.find(t => t.id === timerId)
				if (timer) {
					timer.isPaused = true
					this.saveData()
				}
			},

			resumeTimer(timerId) {
				const timer = this.activeTimers.find(t => t.id === timerId)
				if (timer) {
					timer.isPaused = false
					this.saveData()
				}
			},

			resetTimer(timerId) {
				const timer = this.activeTimers.find(t => t.id === timerId)
				if (timer) {
					timer.remainingTime = timer.originalTime
					timer.isPaused = false
					this.saveData()
				}
			},

			removeTimer(timerId) {
				const index = this.activeTimers.findIndex(t => t.id === timerId)
				if (index !== -1) {
					this.activeTimers.splice(index, 1)
					this.saveData()
				}
			},

			onTimerComplete(timer) {
				// 添加到完成列表
				this.completedTimers.push({
					...timer,
					completedTime: Date.now()
				})

				// 从活跃列表移除
				const index = this.activeTimers.findIndex(t => t.id === timer.id)
				if (index !== -1) {
					this.activeTimers.splice(index, 1)
				}

				// 限制完成列表长度
				if (this.completedTimers.length > 50) {
					this.completedTimers.splice(0, this.completedTimers.length - 50)
				}

				this.saveData()

				// 提示完成
				uni.showToast({
					title: `${timer.name} 时间到了！`,
					icon: 'success',
					duration: 2000
				})

				// 震动提醒
				uni.vibrateShort()
			},

			formatTime(seconds) {
				const mins = Math.floor(seconds / 60)
				const secs = seconds % 60
				return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
			},

			getTimerCardClass(timer) {
				const classes = ['timer-card']
				if (timer.remainingTime <= 10 && timer.remainingTime > 0) {
					classes.push('warning')
				}
				if (timer.remainingTime === 0) {
					classes.push('completed')
				}
				if (timer.isPaused) {
					classes.push('paused')
				}
				return classes
			},

			getTimerTimeClass(timer) {
				const classes = ['timer-time']
				if (timer.remainingTime <= 10 && timer.remainingTime > 0) {
					classes.push('warning')
				}
				if (timer.remainingTime === 0) {
					classes.push('completed')
				}
				return classes
			},

			getProgressStyle(timer) {
				const progress = (timer.originalTime - timer.remainingTime) / timer.originalTime * 100
				const colors = this.themeColors[this.currentTheme]
				return {
					width: progress + '%',
					background: timer.remainingTime <= 10 && timer.remainingTime > 0
						? '#ef5350'
						: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
				}
			},

			showSideNav() {
				this.sideNavVisible = true
			},

			hideSideNav() {
				this.sideNavVisible = false
			},

			// 记录当前使用的页面
			recordCurrentPage() {
				try {
					uni.setStorageSync('lastUsedPage', 'hotpot')
				} catch (e) {
					console.log('记录页面失败:', e)
				}
			}
		}
	}
</script>

<style scoped>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f9fa;
	}

	/* 导航栏样式 */
	.custom-navbar {
		width: 100%;
		background-color: #fff;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.navbar-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 88rpx;
		padding: 0 40rpx;
		position: relative;
	}

	.navbar-left, .navbar-right {
		display: flex;
		align-items: center;
		width: 56rpx;
	}

	.more-btn, .add-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.more-btn:active, .add-btn:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.05);
	}

	.more-icon {
		font-size: 28rpx;
		color: #495057;
	}

	.navbar-title {
		font-size: 32rpx;
		color: #495057;
		font-weight: 600;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	/* 主内容区 */
	.main-content {
		flex: 1;
		padding: 20rpx;
	}

	/* 顶部卡片 */
	.hero-section {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(78, 205, 196, 0.4);
	}

	.hero-icon {
		margin-right: 20rpx;
	}

	.hero-icon-text {
		font-size: 48rpx;
		color: white;
	}

	.hero-text {
		text-align: left;
	}

	.subtitle {
		font-size: 28rpx;
		margin-bottom: 8rpx;
		font-weight: 600;
		display: block;
	}

	.description {
		font-size: 24rpx;
		line-height: 1.4;
		opacity: 0.9;
		display: block;
	}

	/* 区域标题 */
	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 20rpx;
	}

	/* 快速添加区域 */
	.quick-add-section {
		margin-bottom: 30rpx;
	}

	.quick-scroll {
		overflow-x: auto;
		padding: 10rpx 0;
	}

	.quick-list {
		display: flex;
		gap: 15rpx;
		padding: 0 5rpx;
	}

	.quick-item {
		flex-shrink: 0;
		width: 120rpx;
		padding: 20rpx 15rpx;
		background: white;
		border-radius: 16rpx;
		text-align: center;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		transition: all 0.2s ease;
	}

	.quick-item:active {
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.1);
	}

	.quick-icon {
		font-size: 36rpx;
		margin-bottom: 8rpx;
	}

	.quick-name {
		font-size: 24rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 4rpx;
	}

	.quick-time {
		font-size: 20rpx;
		color: #6c757d;
		display: block;
	}

	/* 计时器网格 */
	.timers-grid {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.timer-card {
		background: white;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		transition: all 0.3s ease;
		border-left: 4rpx solid #4ecdc4;
	}

	.timer-card.warning {
		border-left-color: #ffa726;
		animation: pulse 1s infinite;
	}

	.timer-card.completed {
		border-left-color: #ef5350;
		background: #fff5f5;
	}

	.timer-card.paused {
		border-left-color: #6c757d;
		background: #f8f9fa;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02); }
	}

	.timer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.timer-info {
		display: flex;
		align-items: center;
	}

	.timer-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
	}

	.timer-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
	}

	.timer-close {
		width: 36rpx;
		height: 36rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background: rgba(0,0,0,0.05);
		transition: all 0.2s ease;
	}

	.timer-close:active {
		background: rgba(0,0,0,0.1);
		transform: scale(0.9);
	}

	.close-icon {
		font-size: 24rpx;
		color: #6c757d;
		font-weight: bold;
	}

	.timer-display {
		text-align: center;
		margin-bottom: 20rpx;
	}

	.timer-time {
		font-size: 64rpx;
		font-weight: 700;
		color: #4ecdc4;
		font-family: 'Courier New', monospace;
		display: block;
		margin-bottom: 16rpx;
	}

	.timer-time.warning {
		color: #ffa726;
	}

	.timer-time.completed {
		color: #ef5350;
	}

	.timer-progress {
		width: 100%;
		height: 8rpx;
		background: #e9ecef;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #4ecdc4 0%, #2ba3a8 100%);
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	.timer-actions {
		display: flex;
		gap: 12rpx;
	}

	.timer-btn {
		flex: 1;
		height: 64rpx;
		border: none;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.pause-btn, .resume-btn {
		background: #6c757d;
		color: white;
	}

	.reset-btn {
		background: #ffa726;
		color: white;
	}

	.timer-btn:active {
		transform: translateY(2rpx);
	}

	.btn-icon {
		font-size: 20rpx;
		margin-right: 6rpx;
	}

	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 80rpx 40rpx;
		background: white;
		border-radius: 20rpx;
		margin-top: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	.empty-icon {
		font-size: 80rpx;
		display: block;
		margin-bottom: 20rpx;
	}

	.empty-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 12rpx;
	}

	.empty-subtitle {
		font-size: 24rpx;
		color: #6c757d;
		display: block;
	}

	/* 历史记录 */
	.history-section {
		margin-top: 30rpx;
	}

	.history-list {
		background: white;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	.history-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 24rpx;
		border-bottom: 1rpx solid #f1f3f4;
	}

	.history-item:last-child {
		border-bottom: none;
	}

	.history-info {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.history-icon {
		font-size: 28rpx;
		margin-right: 12rpx;
	}

	.history-name {
		font-size: 26rpx;
		font-weight: 500;
		color: #495057;
		margin-right: 12rpx;
	}

	.history-time {
		font-size: 22rpx;
		color: #6c757d;
	}

	.history-action {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background: #f8f9fa;
		transition: all 0.2s ease;
	}

	.history-action:active {
		background: #e9ecef;
		transform: scale(0.9);
	}

	/* 弹窗样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		padding: 40rpx;
		box-sizing: border-box;
	}

	.modal-content {
		background: white;
		border-radius: 20rpx;
		width: 100%;
		max-width: 600rpx;
		max-height: 80vh;
		overflow: hidden;
		box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.15);
	}

	.modal-header {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
		padding: 30rpx;
		position: relative;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
	}

	.modal-close {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 48rpx;
		height: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		transition: all 0.2s ease;
	}

	.modal-close:active {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(0.9);
	}

	.modal-body {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	/* 表单样式 */
	.form-section {
		margin-bottom: 24rpx;
	}

	.form-label {
		font-size: 26rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 12rpx;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #495057;
		box-sizing: border-box;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		border-color: #4ecdc4;
		box-shadow: 0 0 0 4rpx rgba(78, 205, 196, 0.1);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 12rpx;
	}

	.icon-item {
		aspect-ratio: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		background: #f8f9fa;
		transition: all 0.2s ease;
	}

	.icon-item.active {
		border-color: #4ecdc4;
		background: rgba(78, 205, 196, 0.1);
	}

	.icon-item:active {
		transform: scale(0.9);
	}

	.icon-text {
		font-size: 32rpx;
	}

	.form-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 30rpx;
	}

	.form-btn {
		flex: 1;
		height: 72rpx;
		border: none;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.cancel-btn {
		background: #f8f9fa;
		color: #495057;
		border: 2rpx solid #e9ecef;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
	}

	.form-btn:active {
		transform: translateY(2rpx);
	}
</style>
