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
				<view class="navbar-right">
					<view class="info-btn" @click="showInfo">
						<text class="iconfont icon-gengduo1 info-icon"></text>
					</view>
				</view>
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
				<view class="content-placeholder">
					<text class="iconfont icon-youxi placeholder-icon"></text>
					<text class="placeholder-title">游戏功能开发中</text>
					<text class="placeholder-desc">敬请期待精彩的游戏内容</text>
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
				}
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
		padding: 60rpx 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		min-height: 400rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content-placeholder {
		text-align: center;
	}

	.placeholder-icon {
		font-size: 80rpx;
		color: #4ecdc4;
		display: block;
		margin-bottom: 24rpx;
	}

	.placeholder-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 12rpx;
	}

	.placeholder-desc {
		font-size: 26rpx;
		color: #6c757d;
		display: block;
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
