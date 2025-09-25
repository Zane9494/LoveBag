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
						class="game-card" 
						v-for="(game, index) in games" 
						:key="index"
						@click="playGame(game)"
						:style="getGameCardStyle(game)"
					>
						<view class="game-icon">
							<text :class="'iconfont ' + game.icon" :style="{color: game.color}"></text>
						</view>
						<text class="game-name">{{ game.name }}</text>
						<text class="game-desc">{{ game.desc }}</text>
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

				// 固定使用绿色主题
				themeColors: {
					primary: '#4ecdc4',
					secondary: '#2ba3a8'
				},

				// 游戏列表数据
				games: [
					{
						id: '2048',
						name: '2048',
						desc: '数字合并游戏',
						icon: 'icon-shuzi',
						color: '#FF6B6B',
						bgColor: '#FFE5E5'
					},
					{
						id: 'sudoku',
						name: '数独',
						desc: '逻辑推理游戏',
						icon: 'icon-jiugongge',
						color: '#4ECDC4',
						bgColor: '#E5F9F7'
					},
					{
						id: 'snake',
						name: '贪吃蛇',
						desc: '经典街机游戏',
						icon: 'icon-she',
						color: '#45B7D1',
						bgColor: '#E5F3F9'
					},
					{
						id: 'klotski',
						name: '华容道',
						desc: '益智滑块游戏',
						icon: 'icon-tuozhuai',
						color: '#F7B731',
						bgColor: '#FEF3E0'
					},
					{
						id: 'whack-mole',
						name: '打地鼠',
						desc: '反应速度游戏',
						icon: 'icon-dishu',
						color: '#5F27CD',
						bgColor: '#F0E8FF'
					},
					{
						id: 'flappy-bird',
						name: '飞翔的小鸟',
						desc: '躲避障碍游戏',
						icon: 'icon-xiaoniao',
						color: '#00D2D3',
						bgColor: '#E0F8F8'
					},
					{
						id: 'jump-jump',
						name: '跳一跳',
						desc: '跳跃挑战游戏',
						icon: 'icon-tiaoyue',
						color: '#FF9FF3',
						bgColor: '#FFF0FE'
					},
					{
						id: 'match-game',
						name: '连连看',
						desc: '图案配对游戏',
						icon: 'icon-lianliankan',
						color: '#54A0FF',
						bgColor: '#E8F4FF'
					},
					{
						id: 'breakout',
						name: '打砖块',
						desc: '弹球消砖游戏',
						icon: 'icon-zhuankuai',
						color: '#26DE81',
						bgColor: '#E8FFF3'
					},
					{
						id: 'spider-solitaire',
						name: '蜘蛛牌',
						desc: '纸牌策略游戏',
						icon: 'icon-zhipai',
						color: '#FD79A8',
						bgColor: '#FFEBF0'
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

		methods: {
			// 获取游戏卡片样式
			getGameCardStyle(game) {
				return {
					background: game.bgColor,
					borderColor: game.color
				}
			},

			// 点击游戏卡片
			playGame(game) {
				uni.showToast({
					title: `即将开始${game.name}`,
					icon: 'none',
					duration: 1500
				})
				
				// 这里可以根据游戏ID跳转到对应的游戏逻辑
				console.log('开始游戏:', game.name, game.id)
				
				// 简单的游戏启动提示
				setTimeout(() => {
					uni.showModal({
						title: game.name,
						content: `${game.desc}\n\n游戏功能正在开发中，敬请期待！`,
						showCancel: false,
						confirmText: '知道了'
					})
				}, 1600)
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
		gap: 20rpx;
		width: 100%;
	}

	/* 游戏卡片样式 */
	.game-card {
		aspect-ratio: 1;
		border-radius: 16rpx;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
	}

	.game-card:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
	}

	.game-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
		transform: translateX(-100%);
		transition: transform 0.6s ease;
	}

	.game-card:active::before {
		transform: translateX(100%);
	}

	/* 游戏图标 */
	.game-icon {
		margin-bottom: 12rpx;
	}

	.game-icon .iconfont {
		font-size: 48rpx;
		font-weight: bold;
	}

	/* 游戏名称 */
	.game-name {
		font-size: 26rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 6rpx;
		line-height: 1.2;
	}

	/* 游戏描述 */
	.game-desc {
		font-size: 20rpx;
		color: #6c757d;
		line-height: 1.3;
		opacity: 0.8;
	}

	/* 响应式适配 */
	@media screen and (max-width: 750rpx) {
		.games-grid {
			gap: 16rpx;
		}
		
		.game-card {
			padding: 16rpx;
		}
		
		.game-icon .iconfont {
			font-size: 44rpx;
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
			gap: 12rpx;
		}
		
		.game-card {
			padding: 12rpx;
		}
		
		.game-icon .iconfont {
			font-size: 40rpx;
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
