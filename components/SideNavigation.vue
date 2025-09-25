<template>
	<view class="side-nav-overlay" v-if="visible" @click="closeSideNav">
		<view class="side-nav-container" @click.stop>
			<view class="side-nav-header" :style="{paddingTop: statusBarHeight + 'px'}">
				<view class="nav-header-content">
					<text class="nav-title">{{ isEditMode ? '编辑导航' : '导航菜单' }}</text>
					<view class="header-actions">
						<view class="nav-settings-btn" @click="saveAndExit" v-if="isEditMode">
							<text class="iconfont icon-baocun" :style="{ fontSize: '28rpx', color: 'white', marginRight: '5rpx' }"></text>
							<text class="settings-text">保存</text>
						</view>
						<view class="nav-settings-btn" @click="toggleEditMode" v-else>
							<text class="iconfont icon-shezhi" :style="{ fontSize: '28rpx', color: 'white', marginRight: '5rpx' }"></text>
							<text class="settings-text">设置</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 正常导航模式 -->
			<view class="nav-items" v-if="!isEditMode">
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

			<!-- 编辑模式 -->
			<view class="edit-content" v-else>
				<view class="edit-desc">
					<text class="desc-text">长按 ⋮⋮ 拖拽调整顺序，点击右侧切换显示</text>
				</view>

				<view class="nav-items-edit">
					<view
						class="nav-item-edit"
						v-for="(item, index) in navItems"
						:key="item.key + '_' + index"
						:class="{ 'dragging': dragIndex === index }"
						:style="getDragStyle(index)"
						@longpress="startDrag($event, index)"
						@touchmove="onDrag"
						@touchend="endDrag"
					>
					<view class="drag-handle">
						<text class="drag-icon">⋮⋮</text>
					</view>

						<view class="item-info">
							<text :class="['iconfont', item.icon, 'item-icon']"></text>
							<text class="item-name">{{ item.name }}</text>
						</view>

						<view class="toggle-switch" @click="toggleItemVisibility(index)">
							<view class="switch-track" :class="{ 'active': item.visible }">
								<view class="switch-thumb" :class="{ 'active': item.visible }"></view>
							</view>
						</view>
					</view>
				</view>

				<view class="edit-actions">
					<view class="bottom-actions">
						<button class="action-btn reset-btn" :class="{ 'disabled': !hasChanges }" :disabled="!hasChanges" @click="resetToDefault">
							<text class="btn-text">恢复默认</text>
						</button>
						<button class="action-btn cancel-btn" @click="cancelEdit">
							<text class="btn-text">取消</text>
						</button>
					</view>
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
				isEditMode: false,
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
				visibleNavItems: [],
				backupSettings: null,
				dragIndex: -1,
				isDragging: false,
				startY: 0,
				dragOffset: 0,
				lastTargetIndex: -1 // 记录上一次的目标位置，避免重复移动
			}
		},
		mounted() {
			this.getSystemInfo();
			this.loadNavSettings();
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
		watch: {
			visible(newVal) {
				if (newVal) {
					// 每次打开侧边栏时重新加载设置
					this.loadNavSettings();
				} else {
					// 关闭侧边栏时退出编辑模式
					this.isEditMode = false;
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

			toggleEditMode() {
				if (!this.isEditMode) {
					// 进入编辑模式时备份当前设置
					this.backupSettings = JSON.parse(JSON.stringify(this.navItems));
				}
				this.isEditMode = !this.isEditMode;
			},

			saveAndExit() {
				this.saveSettings();
				this.isEditMode = false;
				
				uni.showToast({
					title: '设置已保存',
					icon: 'success',
					duration: 1500
				});
			},

			cancelEdit() {
				// 恢复到编辑前的状态
				if (this.backupSettings) {
					this.navItems = JSON.parse(JSON.stringify(this.backupSettings));
					this.updateVisibleNavItems();
				}
				this.isEditMode = false;
			},

			saveSettings() {
				try {
					uni.setStorageSync('navSettings', this.navItems);
					this.updateVisibleNavItems();
				} catch (e) {
					console.log('保存导航设置失败:', e);
				}
			},

			toggleItemVisibility(index) {
				this.navItems[index].visible = !this.navItems[index].visible;
			},

			startDrag(e, index) {
				this.isDragging = true;
				this.dragIndex = index;
				this.lastTargetIndex = index; // 初始化上一次目标位置
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

				// 计算目标位置，支持跨越多个位置
				const itemHeight = 80; // 每个项目的高度
				const moveSteps = Math.round(this.dragOffset / itemHeight);
				const targetIndex = Math.max(0, Math.min(this.navItems.length - 1, this.dragIndex + moveSteps));

				// 只有当目标位置与上一次的目标位置不同时才进行移动，避免重复操作
				if (targetIndex !== this.lastTargetIndex && targetIndex !== this.dragIndex) {
					// 移动元素到目标位置
					const dragItem = this.navItems[this.dragIndex];
					this.navItems.splice(this.dragIndex, 1);
					this.navItems.splice(targetIndex, 0, dragItem);

					// 更新拖拽索引和上一次目标位置
					this.dragIndex = targetIndex;
					this.lastTargetIndex = targetIndex;

					// 添加触感反馈
					if (uni.vibrateShort) {
						uni.vibrateShort({
							type: 'light'
						});
					}
				}
			},

			endDrag(e) {
				if (!this.isDragging) return;

				// 先重置拖拽状态
				this.isDragging = false;
				this.dragOffset = 0;
				this.lastTargetIndex = -1;
				
				// 使用nextTick确保DOM更新后再重置dragIndex
				this.$nextTick(() => {
					this.dragIndex = -1;
				});
			},

			getDragStyle(index) {
				// 只有在正在拖拽且是当前拖拽元素时才应用特殊样式
				if (this.dragIndex === index && this.isDragging) {
					// 计算当前应该显示的偏移量
					const itemHeight = 80;
					const currentSteps = Math.round(this.dragOffset / itemHeight);
					const remainingOffset = this.dragOffset - (currentSteps * itemHeight);
					
					return {
						transform: `translateY(${remainingOffset}px)`,
						zIndex: 100,
						opacity: 0.8,
						transition: 'none' // 拖拽时禁用过渡动画
					};
				}
				// 拖拽结束后恢复正常样式，添加过渡动画
				return {
					transform: 'translateY(0px)',
					zIndex: 'auto',
					opacity: 1,
					transition: 'all 0.2s ease'
				};
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

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: white;
	}

	.nav-settings-btn {
		display: flex;
		align-items: center;
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

	/* 编辑模式样式 */
	.edit-content {
		flex: 1;
		padding: 20rpx 0;
		display: flex;
		flex-direction: column;
	}

	.edit-desc {
		padding: 20rpx 30rpx;
		background: rgba(78, 205, 196, 0.1);
		margin: 0 20rpx 20rpx 20rpx;
		border-radius: 12rpx;
	}

	.desc-text {
		font-size: 24rpx;
		color: #666;
		text-align: center;
	}

	.nav-items-edit {
		flex: 1;
		background: white;
		margin: 0 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.1);
		overflow: hidden;
	}

	.nav-item-edit {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		background: white;
		position: relative;
		/* 移除默认过渡，通过JS动态控制 */
	}

	.nav-item-edit:last-child {
		border-bottom: none;
	}

	.nav-item-edit.dragging {
		background: #fff;
		box-shadow: 0 16rpx 48rpx rgba(78, 205, 196, 0.4);
		border-radius: 16rpx;
		margin: 12rpx 20rpx;
		z-index: 100;
		border: 2rpx solid rgba(78, 205, 196, 0.3);
		transform: scale(1.02);
	}

	.drag-handle {
		margin-right: 20rpx;
		opacity: 0.5;
		padding: 10rpx;
		transition: opacity 0.2s ease;
	}

	.drag-icon {
		font-size: 32rpx;
		color: #999;
		font-weight: bold;
		line-height: 1;
	}

	.nav-item-edit.dragging .drag-handle {
		opacity: 1;
	}

	.nav-item-edit.dragging .drag-icon {
		color: #4ecdc4;
	}

	.nav-item-edit:active .drag-handle {
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

	/* 自定义开关样式 */
	.toggle-switch {
		padding: 10rpx;
	}

	.switch-track {
		width: 60rpx;
		height: 32rpx;
		background: #ddd;
		border-radius: 16rpx;
		position: relative;
		transition: all 0.3s ease;
	}

	.switch-track.active {
		background: #4ecdc4;
	}

	.switch-thumb {
		width: 28rpx;
		height: 28rpx;
		background: white;
		border-radius: 50%;
		position: absolute;
		top: 2rpx;
		left: 2rpx;
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
	}

	.switch-thumb.active {
		transform: translateX(28rpx);
	}

	/* 编辑操作按钮区域 */
	.edit-actions {
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.bottom-actions {
		display: flex;
		gap: 16rpx;
	}

	.action-btn {
		border: none;
		border-radius: 16rpx;
		font-size: 28rpx;
		transition: all 0.15s ease;
		padding: 26rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		font-weight: 500;
	}

	.action-btn::after {
		border: none;
	}

	.btn-text {
		font-size: 28rpx;
	}


	.reset-btn {
		background: rgba(78, 205, 196, 0.1);
		color: #4ecdc4;
		border: 2rpx solid rgba(78, 205, 196, 0.2);
		flex: 1;
	}

	.reset-btn.disabled {
		background: #f5f5f5;
		color: #ccc;
		border-color: #f0f0f0;
	}

	.reset-btn:not(.disabled):active {
		background: rgba(78, 205, 196, 0.2);
		transform: scale(0.96);
	}

	.cancel-btn {
		background: #f8f9fa;
		color: #666;
		border: 2rpx solid #e9ecef;
		flex: 1;
	}

	.cancel-btn:active {
		background: #e9ecef;
		transform: scale(0.96);
	}

</style>
