<template>
	<view class="side-nav-overlay" v-if="visible" @click="closeSideNav">
		<view class="side-nav-container" @click.stop>
			<view class="side-nav-header" :style="{paddingTop: statusBarHeight + 'px'}">
				<view class="nav-header-content">
					<text class="nav-title">导航菜单</text>
				</view>
			</view>

			<view class="nav-items">
				<view class="nav-item" @click="handleNavClick('cards')">
					<text class="iconfont icon-icons-ic-card nav-icon"></text>
					<text class="nav-text">恋爱卡片</text>
				</view>

				<view class="nav-item" @click="handleNavClick('pills')">
					<text class="iconfont icon-drug-full nav-icon"></text>
					<text class="nav-text">药丸记录</text>
				</view>

				<view class="nav-item" @click="handleNavClick('hotpot')">
					<text class="iconfont icon-diancanling nav-icon"></text>
					<text class="nav-text">小锅伴</text>
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
				statusBarHeight: 0
			}
		},
		mounted() {
			this.getSystemInfo()
		},
		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},

			closeSideNav() {
				this.$emit('close');
			},

			handleNavClick(type) {
				this.$emit('navigate', type);
				this.closeSideNav();
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
		justify-content: flex-start;
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
