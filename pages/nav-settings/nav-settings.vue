<template>
	<view class="nav-settings-page">
		<view class="nav-bar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="nav-bar-content">
				<text class="iconfont icon-back nav-back" @click="goBack"></text>
				<text class="nav-title">导航设置</text>
				<text class="nav-save" @click="saveSettings">保存</text>
			</view>
		</view>

		<view class="settings-content">
			<view class="section">
				<text class="section-title">功能项设置</text>
				<text class="section-desc">长按拖拽调整顺序，点击开关控制显示</text>
			</view>

			<view class="nav-items-list">
				<view
					class="nav-item-setting"
					v-for="(item, index) in navItems"
					:key="item.key + '_' + index"
					:class="{ 'dragging': dragIndex === index }"
					:style="getDragStyle(index)"
					@longpress="startDrag($event, index)"
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
				<button
					class="reset-btn"
					:class="{ 'disabled': !hasChanges }"
					:disabled="!hasChanges"
					@click="resetToDefault"
				>
					恢复默认设置
				</button>
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
				navItems: [],
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
				dragIndex: -1,
				isDragging: false,
				startY: 0,
				dragOffset: 0
			}
		},
		mounted() {
			this.getSystemInfo();
			this.loadSettings();
		},
		computed: {
			hasChanges() {
				// 检查顺序是否变化
				const orderChanged = this.navItems.some((item, index) => {
					return item.key !== this.defaultNavItems[index].key;
				});

				// 检查可见性是否变化
				const visibilityChanged = this.navItems.some((item, index) => {
					const defaultItem = this.defaultNavItems.find(def => def.key === item.key);
					return defaultItem && item.visible !== defaultItem.visible;
				});

				return orderChanged || visibilityChanged;
			}
		},
		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync();
				this.statusBarHeight = systemInfo.statusBarHeight || 0;
			},

			loadSettings() {
				try {
					const savedSettings = uni.getStorageSync('navSettings');
					if (savedSettings && savedSettings.length > 0) {
						this.navItems = savedSettings;
					} else {
						this.navItems = JSON.parse(JSON.stringify(this.defaultNavItems));
					}
				} catch (e) {
					console.log('加载导航设置失败:', e);
					this.navItems = JSON.parse(JSON.stringify(this.defaultNavItems));
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

			startDrag(e, index) {
				this.isDragging = true;
				this.dragIndex = index;
				this.startY = e.touches[0].clientY;
				this.dragOffset = 0;

				// 添加触感反馈
				if (uni.vibrateShort) {
					uni.vibrateShort();
				}
			},

			onDrag(e) {
				if (!this.isDragging || this.dragIndex === -1) return;

				e.preventDefault();
				const currentY = e.touches[0].clientY;
				this.dragOffset = currentY - this.startY;

				// 计算目标位置
				const itemHeight = 84; // rpx转换成实际高度大约84px
				const moveSteps = Math.round(this.dragOffset / itemHeight);
				const targetIndex = Math.max(0, Math.min(this.navItems.length - 1, this.dragIndex + moveSteps));

				if (targetIndex !== this.dragIndex && Math.abs(moveSteps) >= 1) {
					// 移动元素
					const dragItem = this.navItems[this.dragIndex];
					this.navItems.splice(this.dragIndex, 1);
					this.navItems.splice(targetIndex, 0, dragItem);

					// 更新拖拽索引和起始位置
					this.dragIndex = targetIndex;
					this.startY = currentY;
					this.dragOffset = 0;

					// 添加触感反馈
					if (uni.vibrateShort) {
						uni.vibrateShort();
					}
				}
			},

			endDrag(e) {
				if (!this.isDragging) return;

				this.isDragging = false;
				this.dragIndex = -1;
				this.dragOffset = 0;
			},

			getDragStyle(index) {
				if (this.dragIndex === index && this.isDragging) {
					return {
						transform: `translateY(${this.dragOffset}px)`,
						zIndex: 100,
						opacity: 0.8
					};
				}
				return {};
			},

			resetToDefault() {
				if (!this.hasChanges) return;

				uni.showModal({
					title: '确认重置',
					content: '是否恢复为默认的导航设置？',
					success: (res) => {
						if (res.confirm) {
							this.navItems = JSON.parse(JSON.stringify(this.defaultNavItems));

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
		transition: all 0.2s ease;
		background: white;
		position: relative;
	}

	.nav-item-setting:last-child {
		border-bottom: none;
	}

	.nav-item-setting:active:not(.dragging) {
		background: #f8f9fa;
	}

	.nav-item-setting.dragging {
		background: #fff;
		box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.15);
		border-radius: 12rpx;
		margin: 8rpx 16rpx;
		z-index: 100;
	}

	.drag-handle {
		margin-right: 20rpx;
		opacity: 0.5;
		padding: 10rpx;
		transition: opacity 0.2s ease;
	}

	.drag-handle .iconfont {
		font-size: 24rpx;
		color: #999;
	}

	.nav-item-setting.dragging .drag-handle {
		opacity: 0.8;
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
		border: none;
		border-radius: 50rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
		transition: all 0.2s ease;
	}

	.reset-btn::after {
		border: none;
	}

	.reset-btn.disabled {
		background: #f0f0f0;
		color: #ccc;
		box-shadow: none;
		cursor: not-allowed;
	}

	.reset-btn:not(.disabled):active {
		background: #f0f0f0;
		transform: scale(0.98);
	}

	.dragging {
		opacity: 0.7;
		transform: scale(1.05);
	}
</style>
