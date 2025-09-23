<template>
	<view class="nav-settings-page">
		<view class="status-bar" :style="{height: statusBarHeight + 'px'}"></view>

		<view class="nav-bar">
			<view class="nav-bar-content">
				<text class="iconfont icon-back nav-back" @click="goBack"></text>
				<text class="nav-title">导航设置</text>
				<text class="nav-save" @click="saveSettings">保存</text>
			</view>
		</view>

		<view class="settings-content">
			<view class="section">
				<text class="section-title">功能项设置</text>
				<text class="section-desc">拖拽调整顺序，点击开关控制显示</text>
			</view>

			<view class="nav-items-list">
				<view
					class="nav-item-setting"
					v-for="(item, index) in navItems"
					:key="item.key"
					:data-index="index"
					@longpress="startDrag"
					@touchmove="onDrag"
					@touchend="endDrag"
				>
					<view class="drag-handle">
						<text class="iconfont icon-drag"></text>
					</view>

					<view class="item-info">
						<text :class="['iconfont', item.icon, 'item-icon']"></text>
						<text class="item-name">{{ item.name }}</text>
					</view>

					<switch
						:checked="item.visible"
						@change="toggleItemVisibility(index)"
						color="#4ecdc4"
					/>
				</view>
			</view>

			<view class="reset-section">
				<button class="reset-btn" @click="resetToDefault">恢复默认设置</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'NavSettings',
		data() {
			return {
				statusBarHeight: 0,
				navItems: [
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
				dragIndex: -1,
				isDragging: false,
				startY: 0
			}
		},
		mounted() {
			this.getSystemInfo();
			this.loadSettings();
		},
		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync();
				this.statusBarHeight = systemInfo.statusBarHeight || 0;
			},

			loadSettings() {
				try {
					const savedSettings = uni.getStorageSync('navSettings');
					if (savedSettings) {
						this.navItems = savedSettings;
					}
				} catch (e) {
					console.log('加载导航设置失败:', e);
				}
			},

			saveSettings() {
				try {
					uni.setStorageSync('navSettings', this.navItems);
					uni.showToast({
						title: '设置已保存',
						icon: 'success',
						duration: 1500
					});

					// 延迟返回，让用户看到保存提示
					setTimeout(() => {
						this.goBack();
					}, 1500);
				} catch (e) {
					uni.showToast({
						title: '保存失败',
						icon: 'error',
						duration: 2000
					});
				}
			},

			toggleItemVisibility(index) {
				this.navItems[index].visible = !this.navItems[index].visible;
			},

			startDrag(e) {
				this.isDragging = true;
				this.dragIndex = parseInt(e.currentTarget.dataset.index);
				this.startY = e.touches[0].clientY;

				// 添加拖拽样式
				e.currentTarget.style.opacity = '0.7';
				e.currentTarget.style.transform = 'scale(1.05)';
			},

			onDrag(e) {
				if (!this.isDragging || this.dragIndex === -1) return;

				e.preventDefault();
				const currentY = e.touches[0].clientY;
				const deltaY = currentY - this.startY;

				// 计算目标位置
				const itemHeight = 120; // 大概的项目高度
				const targetIndex = Math.max(0, Math.min(this.navItems.length - 1,
					this.dragIndex + Math.round(deltaY / itemHeight)));

				if (targetIndex !== this.dragIndex) {
					// 交换位置
					const dragItem = this.navItems[this.dragIndex];
					this.navItems.splice(this.dragIndex, 1);
					this.navItems.splice(targetIndex, 0, dragItem);
					this.dragIndex = targetIndex;
					this.startY = currentY;
				}
			},

			endDrag(e) {
				if (!this.isDragging) return;

				this.isDragging = false;
				this.dragIndex = -1;

				// 恢复样式
				e.currentTarget.style.opacity = '';
				e.currentTarget.style.transform = '';
			},

			resetToDefault() {
				uni.showModal({
					title: '确认重置',
					content: '是否恢复为默认的导航设置？',
					success: (res) => {
						if (res.confirm) {
							this.navItems = [
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
							];

							uni.showToast({
								title: '已恢复默认',
								icon: 'success',
								duration: 1500
							});
						}
					}
				});
			},

			goBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style scoped>
	.nav-settings-page {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.status-bar {
		background: #4ecdc4;
	}

	.nav-bar {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	}

	.nav-bar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 30rpx;
	}

	.nav-back {
		font-size: 32rpx;
		color: white;
		padding: 10rpx;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: white;
		flex: 1;
		text-align: center;
	}

	.nav-save {
		font-size: 28rpx;
		color: white;
		padding: 10rpx;
	}

	.settings-content {
		padding: 30rpx;
	}

	.section {
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 10rpx;
		display: block;
	}

	.section-desc {
		font-size: 24rpx;
		color: #666;
		display: block;
	}

	.nav-items-list {
		background: white;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.1);
		overflow: hidden;
	}

	.nav-item-setting {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		transition: all 0.3s ease;
		background: white;
	}

	.nav-item-setting:last-child {
		border-bottom: none;
	}

	.nav-item-setting:active {
		background: #f8f9fa;
	}

	.drag-handle {
		margin-right: 20rpx;
		opacity: 0.5;
	}

	.drag-handle .iconfont {
		font-size: 24rpx;
		color: #999;
	}

	.item-info {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.item-icon {
		font-size: 32rpx;
		color: #4ecdc4;
		margin-right: 20rpx;
		width: 40rpx;
		text-align: center;
	}

	.item-name {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.reset-section {
		margin-top: 60rpx;
		text-align: center;
	}

	.reset-btn {
		background: white;
		color: #666;
		border: 2rpx solid #ddd;
		border-radius: 50rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
	}

	.reset-btn:active {
		background: #f0f0f0;
	}
</style>
