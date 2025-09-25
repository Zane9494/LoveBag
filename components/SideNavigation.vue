<template>
	<view class="side-nav-overlay" v-if="visible" @click="closeSideNav">
		<view class="side-nav-container" @click.stop>
			<view class="side-nav-header" :style="{paddingTop: statusBarHeight + 'px'}">
				<view class="nav-header-content">
					<text class="nav-title">{{ isEditMode ? '编辑导航' : '导航菜单' }}</text>
					<view class="nav-settings-btn" @click="toggleEditMode">
						<text class="iconfont" :class="isEditMode ? 'icon-check' : 'icon-gengduo'" :style="{ fontSize: '28rpx', color: 'white', marginRight: isEditMode ? '0' : '5rpx' }"></text>
						<text class="settings-text" v-if="!isEditMode">设置</text>
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
							<text class="iconfont icon-gengduo drag-icon"></text>
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
					<button
						class="action-btn reset-btn"
						:class="{ 'disabled': !hasChanges }"
						:disabled="!hasChanges"
						@click="resetToDefault"
					>
						恢复默认
					</button>
					
					<view class="main-actions">
						<button class="action-btn cancel-btn" @click="cancelEdit">
							取消
						</button>
						<button class="action-btn save-btn" @click="saveAndExit">
							保存
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
				dragOffset: 0
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
						uni.vibrateShort({
							type: 'light'
						});
					}
				}
			},

			endDrag(e) {
				if (!this.isDragging) return;

				this.isDragging = false;
				
				// 延迟重置，让动画完成
				setTimeout(() => {
					this.dragIndex = -1;
					this.dragOffset = 0;
				}, 200);
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
		transition: all 0.2s ease;
		background: white;
		position: relative;
	}

	.nav-item-edit:last-child {
		border-bottom: none;
	}

	.nav-item-edit.dragging {
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(78, 205, 196, 0.3);
		border-radius: 12rpx;
		margin: 8rpx 16rpx;
		z-index: 100;
		border: 2rpx solid rgba(78, 205, 196, 0.2);
	}

	.drag-handle {
		margin-right: 20rpx;
		opacity: 0.5;
		padding: 10rpx;
		transition: opacity 0.2s ease;
	}

	.drag-icon {
		font-size: 28rpx;
		color: #999;
		transform: rotate(90deg);
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
		gap: 20rpx;
	}

	.main-actions {
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		border: none;
		border-radius: 12rpx;
		font-size: 28rpx;
		transition: all 0.2s ease;
		flex: 1;
		padding: 24rpx;
	}

	.action-btn::after {
		border: none;
	}

	.reset-btn {
		background: white;
		color: #666;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	}

	.reset-btn.disabled {
		background: #f0f0f0;
		color: #ccc;
		box-shadow: none;
	}

	.reset-btn:not(.disabled):active {
		background: #f0f0f0;
		transform: scale(0.98);
	}

	.cancel-btn {
		background: white;
		color: #666;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	}

	.cancel-btn:active {
		background: #f0f0f0;
		transform: scale(0.98);
	}

	.save-btn {
		background: #4ecdc4;
		color: white;
		box-shadow: 0 2rpx 8rpx rgba(78, 205, 196, 0.3);
	}

	.save-btn:active {
		background: #45b7b8;
		transform: scale(0.98);
	}
</style>
