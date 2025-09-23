<template>
	<view class="side-nav-overlay" v-if="visible" @click="closeSideNav">
		<view class="side-nav-container" @click.stop>
			<view class="side-nav-header" :style="{paddingTop: statusBarHeight + 'px'}">
				<view class="nav-header-content">
					<text class="nav-title">导航菜单</text>
					<view class="nav-settings-btn" @click="openNavSettings">
						<text class="iconfont icon-gengduo settings-icon"></text>
						<text class="settings-text">设置</text>
					</view>
				</view>
			</view>

			<view class="nav-items">
				<view
					class="nav-item"
					v-for="item in visibleNavItems"
					:key="item.key"
					@click="handleNavClick(item.key)"
				>
					<text :class="['iconfont', item.icon, 'nav-icon']"></text>
					<text class="nav-text">{{ item.name }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'SideNavigation',
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				defaultNavItems: [
					{
						key: 'cards',
						name: '恋爱卡片',
						icon: 'icon-icons-ic-card',
						visible: true,
						route: '/pages/index/index'
					},
					{
						key: 'pills',
						name: '药丸记录',
						icon: 'icon-drug-full',
						visible: true,
						route: '/pages/pills/pills'
					},
					{
						key: 'hotpot',
						name: '小锅伴',
						icon: 'icon-diancanling',
						visible: true,
						route: '/pages/hotpot/hotpot'
					}
				],
				navItems: [],
				visibleNavItems: []
			}
		},
		mounted() {
			this.getSystemInfo();
			this.loadNavSettings();
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					// 每次打开侧边栏时重新加载设置
					this.loadNavSettings();
				}
			}
		},
		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync();
				this.statusBarHeight = systemInfo.statusBarHeight || 0;
			},

			loadNavSettings() {
				try {
					const savedSettings = uni.getStorageSync('navSettings');
					if (savedSettings && savedSettings.length > 0) {
						this.navItems = savedSettings;
					} else {
						this.navItems = [...this.defaultNavItems];
					}
					this.updateVisibleNavItems();
				} catch (e) {
					console.log('加载导航设置失败:', e);
					this.navItems = [...this.defaultNavItems];
					this.updateVisibleNavItems();
				}
			},

			updateVisibleNavItems() {
				this.visibleNavItems = this.navItems.filter(item => item.visible);
			},

			closeSideNav() {
				this.$emit('close');
			},

			openNavSettings() {
				// 先关闭侧边栏
				this.closeSideNav();

				// 跳转到导航设置页面
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/nav-settings/nav-settings',
						animationType: 'slide-in-right',
						animationDuration: 200
					});
				}, 100);
			},

			handleNavClick(type) {
				// 先关闭侧边栏
				this.closeSideNav();

				// 减少延迟时间，让切换更快
				setTimeout(() => {
					// 获取当前页面路由
					const pages = getCurrentPages();
					const currentPage = pages[pages.length - 1];
					const currentRoute = currentPage.route;

					// 根据 type 找到对应的路由
					const targetItem = this.navItems.find(item => item.key === type);
					if (!targetItem) return;

					const targetRoute = targetItem.route.replace('/', '');

					if (currentRoute !== targetRoute) {
						uni.reLaunch({
							url: targetItem.route,
							animationType: 'slide-in-right',
							animationDuration: 200
						});
					} else {
						uni.showToast({
							title: '当前页面',
							icon: 'none',
							duration: 1000
						});
					}
				}, 100);
			}
		}
	}
</script>

<style scoped>
	.side-nav-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 2000;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.side-nav-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 480rpx;
		height: 100vh;
		background: white;
		box-shadow: 2rpx 0 16rpx rgba(0, 0, 0, 0.15);
		animation: slideIn 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	@keyframes slideIn {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.side-nav-header {
		width: 100%;
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
		color: white;
	}

	.nav-header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 88rpx;
		padding: 0 30rpx;
		position: relative;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: white;
	}

	.nav-settings-btn {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.settings-icon {
		font-size: 28rpx;
		color: white;
		margin-right: 5rpx;
	}

	.settings-text {
		font-size: 28rpx;
		color: white;
	}

	.nav-items {
		flex: 1;
		padding: 20rpx 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		padding: 30rpx 40rpx;
		transition: all 0.3s ease;
		border-left: 4rpx solid transparent;
	}

	.nav-item:active {
		background: rgba(78, 205, 196, 0.1);
		border-left-color: #4ecdc4;
	}

	.nav-icon {
		font-size: 32rpx;
		color: #495057;
		margin-right: 20rpx;
		width: 40rpx;
		text-align: center;
	}

	.nav-text {
		font-size: 28rpx;
		color: #495057;
		font-weight: 500;
	}
</style>
