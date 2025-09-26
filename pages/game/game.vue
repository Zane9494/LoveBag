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
				<text class="navbar-title">游戏</text>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 游戏状态卡片 -->
			<view class="status-card" :style="currentThemeStyles">
				<view class="status-icon">
					<text class="iconfont icon-youxi" :style="gameIconStyle"></text>
				</view>
				<view class="status-info">
					<text class="status-title">欢迎来到游戏中心</text>
					<text class="status-desc">享受有趣的游戏时光</text>
					<text class="game-info">准备开始你的游戏之旅</text>
				</view>
			</view>

			<!-- 游戏内容区域 -->
			<view class="game-content">
				<view class="games-grid">
					<view 
						:class="['game-card', { 
							'coming-soon': game.isComingSoon,
							'clicked': clickedGameId === game.id
						}]" 
						v-for="(game, index) in games" 
						:key="index"
						@click="playGame(game)"
						:style="getGameCardStyle(game)"
					>
						<!-- 游戏图标 -->
						<view class="game-icon">
							<text :class="'iconfont ' + game.icon" :style="{color: game.color}"></text>
						</view>
						
						<!-- 游戏信息 -->
						<view class="game-info">
							<text class="game-name">{{ game.name }}</text>
							<text class="game-desc">{{ game.desc }}</text>
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

		<!-- 说明弹窗 -->
		<view class="modal-overlay" v-if="showInfoModal" @click="closeInfoModal">
			<view class="modal-content info-modal" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">游戏说明</text>
					<view class="modal-close" @click="closeInfoModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="info-section">
						<view class="info-item">
							<text class="iconfont icon-youxi info-icon game-color"></text>
							<text class="info-text">游戏中心 - 娱乐休闲功能</text>
						</view>
					</view>
					<view class="rules-section">
						<text class="rules-title">功能说明</text>
						<text class="rules-text">• 游戏功能正在开发中</text>
						<text class="rules-text">• 将提供多种有趣的小游戏</text>
						<text class="rules-text">• 敬请期待后续更新</text>
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
				showInfoModal: false,
				sideNavVisible: false, // 侧边导航栏可见性
				clickedGameId: null, // 当前被点击的游戏ID
				clickTimeout: null, // 点击效果定时器

				// 固定使用绿色主题
				themeColors: {
					primary: '#4ecdc4',
					secondary: '#2ba3a8'
				},

				// 游戏列表数据 - 使用game目录中的图标
				games: [
					{
						id: '2048',
						name: '2048',
						desc: '数字合并游戏',
						icon: 'icon-i2048',
						color: '#FF6B6B',
						bgColor: 'linear-gradient(135deg, #FFE5E5 0%, #FFD6D6 100%)',
						shadowColor: 'rgba(255, 107, 107, 0.3)',
						path: '/pages/game/2048/2048' // 已完成 - 有跳转链接
					},
					{
						id: 'sudoku',
						name: '数独',
						desc: '逻辑推理游戏',
						icon: 'icon-wode-shududaochu',
						color: '#4ECDC4',
						bgColor: 'linear-gradient(135deg, #E5F9F7 0%, #D6F5F2 100%)',
						shadowColor: 'rgba(78, 205, 196, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'snake',
						name: '贪吃蛇',
						desc: '经典街机游戏',
						icon: 'icon-snake',
						color: '#45B7D1',
						bgColor: 'linear-gradient(135deg, #E5F3F9 0%, #D6EDF7 100%)',
						shadowColor: 'rgba(69, 183, 209, 0.3)',
						path: '/pages/game/snake/snake' // 已完成 - 有跳转链接
					},
					{
						id: 'klotski',
						name: '华容道',
						desc: '益智滑块游戏',
						icon: 'icon-game-controller-',
						color: '#F39C12',
						bgColor: 'linear-gradient(135deg, #FEF3E0 0%, #FDF0D5 100%)',
						shadowColor: 'rgba(243, 156, 18, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'whack-mole',
						name: '打地鼠',
						desc: '反应速度游戏',
						icon: 'icon-dadishu',
						color: '#8E44AD',
						bgColor: 'linear-gradient(135deg, #F4ECFF 0%, #EEDDFF 100%)',
						shadowColor: 'rgba(142, 68, 173, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'flappy-bird',
						name: '飞翔的小鸟',
						desc: '躲避障碍游戏',
						icon: 'icon-ghost',
						color: '#E74C3C',
						bgColor: 'linear-gradient(135deg, #FDEDEC 0%, #FADBD8 100%)',
						shadowColor: 'rgba(231, 76, 60, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'jump-jump',
						name: '跳一跳',
						desc: '跳跃挑战游戏',
						icon: 'icon-pawn',
						color: '#FF9FF3',
						bgColor: 'linear-gradient(135deg, #FFF0FE 0%, #FFE8FD 100%)',
						shadowColor: 'rgba(255, 159, 243, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'breakout',
						name: '打砖块',
						desc: '弹球消砖游戏',
						icon: 'icon-relitu',
						color: '#27AE60',
						bgColor: 'linear-gradient(135deg, #E8FFF3 0%, #DFFFEC 100%)',
						shadowColor: 'rgba(39, 174, 96, 0.3)',
						path: '/pages/game/breakout/breakout' // 已完成 - 有跳转链接
					},
					{
						id: 'pacman',
						name: '吃豆人',
						desc: '经典街机游戏',
						icon: 'icon-pacman',
						color: '#F7B731',
						bgColor: 'linear-gradient(135deg, #FEF9E7 0%, #FCF3CF 100%)',
						shadowColor: 'rgba(247, 183, 49, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'tetris',
						name: '俄罗斯方块',
						desc: '经典消除游戏',
						icon: 'icon-tetris',
						color: '#00D2D3',
						bgColor: 'linear-gradient(135deg, #E0F8F8 0%, #D1F5F5 100%)',
						shadowColor: 'rgba(0, 210, 211, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'tic-tac-toe',
						name: '井字游戏',
						desc: '策略对战游戏',
						icon: 'icon-tic-tac-toe',
						color: '#3498DB',
						bgColor: 'linear-gradient(135deg, #EBF5FB 0%, #D6EAF8 100%)',
						shadowColor: 'rgba(52, 152, 219, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'match-game',
						name: '连连看',
						desc: '图案配对游戏',
						icon: 'icon-lianliankan',
						color: '#54A0FF',
						bgColor: 'linear-gradient(135deg, #E8F4FF 0%, #DCF0FF 100%)',
						shadowColor: 'rgba(84, 160, 255, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'spider-solitaire',
						name: '蜘蛛牌',
						desc: '纸牌策略游戏',
						icon: 'icon-spades',
						color: '#2C3E50',
						bgColor: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
						shadowColor: 'rgba(44, 62, 80, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'dice',
						name: '骰子游戏',
						desc: '运气与策略',
						icon: 'icon-dice',
						color: '#FD79A8',
						bgColor: 'linear-gradient(135deg, #FFEBF0 0%, #FFE2EC 100%)',
						shadowColor: 'rgba(253, 121, 168, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'space-invaders',
						name: '太空入侵者',
						desc: '射击防御游戏',
						icon: 'icon-space-invaders',
						color: '#9B59B6',
						bgColor: 'linear-gradient(135deg, #F4ECF7 0%, #EBDEF0 100%)',
						shadowColor: 'rgba(155, 89, 182, 0.3)'
						// 无跳转链接 - 开发中
					},
					{
						id: 'coming-soon',
						name: '敬请期待',
						desc: '更多精彩游戏',
						icon: 'icon-caidan-',
						color: '#95A5A6',
						bgColor: 'linear-gradient(135deg, #F8F9FA 0%, #ECF0F1 100%)',
						shadowColor: 'rgba(149, 165, 166, 0.3)',
						isComingSoon: true
					}
				]
			}
		},
		computed: {
			// 当前主题样式 - 固定绿色
			currentThemeStyles() {
				return {
					background: `linear-gradient(135deg, ${this.themeColors.primary} 0%, ${this.themeColors.secondary} 100%)`
				}
			},

			// 游戏图标样式
			gameIconStyle() {
				return { color: 'white', fontSize: '48rpx' }
			}
		},

		onLoad() {
			this.getSystemInfo()
			// 记录当前使用的页面
			this.recordCurrentPage()
		},

		onShow() {
			// 页面显示时记录当前使用的页面
			this.recordCurrentPage()
		},

		onUnload() {
			// 页面卸载时清理定时器和状态
			if (this.clickTimeout) {
				clearTimeout(this.clickTimeout)
			}
			this.clickedGameId = null
		},

		methods: {
			// 获取游戏卡片样式
			getGameCardStyle(game) {
				const baseStyle = {
					background: game.bgColor,
					borderColor: game.color,
					boxShadow: `0 8rpx 24rpx ${game.shadowColor}`,
					transform: 'translateY(0)'
				}
				
				// 为敬请期待卡片添加特殊样式
				if (game.isComingSoon) {
					baseStyle.opacity = '0.8'
					baseStyle.border = '2rpx dashed #95A5A6'
				}
				
				return baseStyle
			},

			// 点击游戏卡片
			playGame(game) {
				// 清除之前的定时器
				if (this.clickTimeout) {
					clearTimeout(this.clickTimeout)
				}
				
				// 立即设置点击状态
				this.clickedGameId = game.id
				
				// 900ms后清除点击状态，让元素通过CSS过渡回到初始样式
				this.clickTimeout = setTimeout(() => {
					this.clickedGameId = null
				}, 900)
				
				// 添加点击反馈效果
				uni.vibrateShort({
					type: 'light'
				})
				
				// 特殊处理敬请期待卡片
				if (game.isComingSoon) {
					uni.showModal({
						title: '敬请期待',
						content: '更多精彩游戏正在紧张开发中，\n敬请期待后续更新！',
						showCancel: false,
						confirmText: '了解了'
					})
					return
				}
				
				// 根据是否有跳转链接判断游戏是否完成
				if (game.path) {
					// 已完成的游戏 - 显示启动提示后跳转
					uni.showToast({
						title: `${game.name} 即将启动`,
						icon: 'none',
						duration: 1500
					})
					
					// 延迟跳转，让用户看到提示信息
					setTimeout(() => {
						console.log('跳转到游戏:', game.name, game.path)
						uni.navigateTo({
							url: game.path
						})
					}, 800)
				} else {
					// 开发中的游戏 - 直接提示，不需要确认
					uni.showToast({
						title: `${game.name}正在开发中`,
						icon: 'none',
						duration: 2000
					})
				}
			},
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},

			// 显示说明
			showInfo() {
				this.showInfoModal = true
			},

			// 关闭说明弹窗
			closeInfoModal() {
				this.showInfoModal = false
			},

			// 显示侧边导航栏
			showSideNav() {
				this.sideNavVisible = true
			},

			// 隐藏侧边导航栏
			hideSideNav() {
				this.sideNavVisible = false
			},

			// 返回
			goBack() {
				uni.navigateBack()
			},

			// 记录当前使用的页面
			recordCurrentPage() {
				try {
					uni.setStorageSync('lastUsedPage', 'game')
				} catch (e) {
					console.log('记录页面失败:', e)
				}
			}
		}
	}
</script>

<style scoped>
	/* 引入游戏图标 */
	@import url('/static/game/iconfont.css');
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

	.more-btn, .info-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.more-btn:active, .info-btn:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.05);
	}

	.more-icon, .info-icon {
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

	/* 状态卡片 */
	.status-card {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		color: white;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(78, 205, 196, 0.4);
	}

	.status-icon {
		margin-right: 24rpx;
	}

	.status-info {
		flex: 1;
	}

	.status-title {
		font-size: 32rpx;
		font-weight: 600;
		display: block;
		margin-bottom: 8rpx;
	}

	.status-desc {
		font-size: 24rpx;
		opacity: 0.9;
		display: block;
		margin-bottom: 8rpx;
	}

	.game-info {
		font-size: 22rpx;
		opacity: 0.8;
		display: block;
	}

	/* 游戏内容区域 */
	.game-content {
		background: white;
		border-radius: 16rpx;
		padding: 30rpx 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		min-height: 400rpx;
	}

	/* 游戏网格布局 */
	.games-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24rpx;
		width: 100%;
		padding: 10rpx;
	}

	/* 游戏卡片样式 */
	.game-card {
		aspect-ratio: 1;
		border-radius: 24rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		border: 3rpx solid transparent;
		transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
		cursor: pointer;
		backdrop-filter: blur(10rpx);
	}

	/* 完全通过JavaScript控制点击效果 */
	.game-card.clicked {
		transform: scale(0.92) translateY(4rpx) !important;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2) !important;
		filter: brightness(0.95) !important;
		transition: all 0.9s cubic-bezier(0.4, 0, 0.2, 1) !important;
	}

	/* 禁用默认的active状态 */
	.game-card:active {
		transform: none !important;
		box-shadow: none !important;
		filter: none !important;
	}

	.game-card:hover {
		transform: translateY(-6rpx) scale(1.02);
		box-shadow: 0 12rpx 32rpx rgba(0,0,0,0.15);
		border-color: currentColor;
		filter: brightness(1.05);
	}

	.game-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
		transform: translateX(-100%) rotate(45deg);
		transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		pointer-events: none;
	}

	.game-card:active::before {
		transform: translateX(100%) rotate(45deg);
	}

	/* 游戏卡片光效 */
	.game-card::after {
		content: '';
		position: absolute;
		top: -2rpx;
		left: -2rpx;
		right: -2rpx;
		bottom: -2rpx;
		border-radius: 22rpx;
		background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: -1;
	}

	.game-card:hover::after {
		opacity: 1;
	}


	/* 游戏图标 */
	.game-icon {
		position: relative;
		transition: all 0.3s ease;
		margin-bottom: 16rpx;
	}

	.game-icon .iconfont {
		font-size: 52rpx;
		font-weight: bold;
		transition: all 0.3s ease;
		filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1));
	}

	.game-card:hover .game-icon {
		transform: scale(1.1) rotate(5deg);
	}

	.game-card:active .game-icon {
		transform: scale(0.95);
	}

	/* 游戏信息容器 */
	.game-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	/* 游戏名称 */
	.game-name {
		font-size: 26rpx;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 6rpx;
		line-height: 1.2;
		transition: all 0.3s ease;
		text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);
	}

	.game-card:hover .game-name {
		color: #1a252f;
		transform: translateY(-2rpx);
	}

	/* 游戏描述 */
	.game-desc {
		font-size: 20rpx;
		color: #6c757d;
		line-height: 1.3;
		opacity: 0.85;
		transition: all 0.3s ease;
		font-weight: 500;
	}

	.game-card:hover .game-desc {
		opacity: 1;
		color: #495057;
		transform: translateY(-1rpx);
	}



	/* 敬请期待卡片特殊样式 */
	.game-card.coming-soon {
		position: relative;
		overflow: hidden;
		opacity: 0.8;
		border: 2rpx dashed #95A5A6;
	}

	.game-card.coming-soon::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	.game-card.coming-soon .game-icon {
		animation: pulse 1.5s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		0% {
			opacity: 0.7;
			transform: scale(1);
		}
		100% {
			opacity: 1;
			transform: scale(1.05);
		}
	}

	.game-card.coming-soon .game-name {
		color: #7F8C8D;
		font-style: italic;
	}

	.game-card.coming-soon .game-desc {
		color: #95A5A6;
		font-size: 18rpx;
	}

	/* 响应式适配 */
	@media screen and (max-width: 750rpx) {
		.games-grid {
			gap: 20rpx;
			padding: 8rpx;
		}
		
		.game-card {
			padding: 18rpx;
			border-radius: 20rpx;
		}
		
		.game-icon .iconfont {
			font-size: 48rpx;
		}
		
		.game-name {
			font-size: 24rpx;
		}
		
		.game-desc {
			font-size: 18rpx;
		}
	}

	/* 更小屏幕的适配 */
	@media screen and (max-width: 600rpx) {
		.game-content {
			padding: 24rpx 16rpx;
		}
		
		.games-grid {
			gap: 16rpx;
			padding: 6rpx;
		}
		
		.game-card {
			padding: 16rpx;
			border-radius: 18rpx;
		}
		
		.game-icon .iconfont {
			font-size: 44rpx;
		}
		
		.game-name {
			font-size: 22rpx;
		}
		
		.game-desc {
			font-size: 16rpx;
		}
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

	.info-modal {
		max-width: 700rpx;
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

	.close-icon {
		font-size: 28rpx;
		color: white;
		font-weight: bold;
	}

	.modal-body {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	/* 说明弹窗 */
	.info-section {
		margin-bottom: 30rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 16rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}

	.info-icon {
		font-size: 24rpx;
		margin-right: 16rpx;
		width: 32rpx;
		text-align: center;
	}

	.game-color {
		color: #4ecdc4;
	}

	.info-text {
		font-size: 26rpx;
		color: #495057;
		flex: 1;
	}

	.rules-section {
		border-top: 1rpx solid #e9ecef;
		padding-top: 24rpx;
	}

	.rules-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 16rpx;
		display: block;
	}

	.rules-text {
		font-size: 24rpx;
		color: #6c757d;
		line-height: 1.6;
		margin-bottom: 12rpx;
		display: block;
	}
</style>
