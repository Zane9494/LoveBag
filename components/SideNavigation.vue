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

					<view class="nav-items-edit" ref="sortableContainer">
						<view
							class="nav-item-edit"
							v-for="(item, index) in navItems"
							:key="item.key"
							:data-index="index"
							:class="{ 
								'dragging': dragState.isDragging && dragState.dragIndex === index,
								'drag-over': dragState.dragOverIndex === index && dragState.dragOverIndex !== dragState.dragIndex
							}"
							@touchstart="onDragStart($event, index)"
							@touchmove.prevent="onDragMove"
							@touchend="onDragEnd"
							@touchcancel="onDragEnd"
						>
							<view class="drag-handle">
								<text class="drag-icon" :class="{ 'active': dragState.isDragging && dragState.dragIndex === index }">⋮⋮</text>
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
					},
					{
						key: 'game',
						name: '游戏',
						icon: 'icon-youxi',
						visible: true,
						route: '/pages/game/game'
					}
				],
				navItems: [],
				visibleNavItems: [],
				backupSettings: null,
				// 轻量级拖拽状态
				dragState: {
					isDragging: false,
					dragIndex: -1,
					dragOverIndex: -1,
					startY: 0,
					currentY: 0,
					itemHeight: 60,
					longPressTimer: null,
					isAnimating: false
				}
			}
		},
		mounted() {
			this.getSystemInfo();
			this.loadNavSettings();
		},
		beforeDestroy() {
			// 清理定时器
			if (this.dragState.longPressTimer) {
				clearTimeout(this.dragState.longPressTimer);
			}
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
						// 合并保存的设置和新的默认项目
						this.navItems = this.mergeNavSettings(savedSettings, this.defaultNavItems);
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

			// 合并导航设置，确保新功能能被添加
			mergeNavSettings(savedSettings, defaultSettings) {
				const merged = [...savedSettings];
				
				// 检查是否有新的默认项目需要添加
				defaultSettings.forEach(defaultItem => {
					const existingItem = merged.find(item => item.key === defaultItem.key);
					if (!existingItem) {
						// 添加新的默认项目到末尾
						merged.push({...defaultItem});
					}
				});
				
				return merged;
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

			// 轻量级拖拽开始
			onDragStart(e, index) {
				if (!e.touches || e.touches.length === 0) return;
				
				const touch = e.touches[0];
				
				// 清除之前的定时器
				if (this.dragState.longPressTimer) {
					clearTimeout(this.dragState.longPressTimer);
				}
				
				// 记录触摸起始位置
				this.dragState.startY = touch.clientY;
				
				// 设置长按定时器
				this.dragState.longPressTimer = setTimeout(() => {
					this.startDragging(index, touch.clientY);
				}, 400); // 400ms长按触发
			},

			// 开始拖拽
			startDragging(index, startY) {
				this.dragState.isDragging = true;
				this.dragState.dragIndex = index;
				this.dragState.dragOverIndex = index;
				this.dragState.startY = startY;
				this.dragState.currentY = startY;
				
				// 触觉反馈
				if (uni.vibrateShort) {
					uni.vibrateShort({
						type: 'heavy'
					});
				}
			},

			// 拖拽移动
			onDragMove(e) {
				if (!e.touches || e.touches.length === 0) return;
				
				const touch = e.touches[0];
				const moveDistance = Math.abs(touch.clientY - this.dragState.startY);
				
				// 如果移动距离超过阈值，取消长按
				if (moveDistance > 15 && this.dragState.longPressTimer && !this.dragState.isDragging) {
					clearTimeout(this.dragState.longPressTimer);
					this.dragState.longPressTimer = null;
					return;
				}
				
				// 如果正在拖拽，处理移动
				if (this.dragState.isDragging) {
					this.dragState.currentY = touch.clientY;
					this.updateDragOverIndex();
				}
			},

			// 更新拖拽悬停索引
			updateDragOverIndex() {
				const dragOffset = this.dragState.currentY - this.dragState.startY;
				const steps = Math.round(dragOffset / this.dragState.itemHeight);
				const targetIndex = Math.max(0, Math.min(
					this.navItems.length - 1,
					this.dragState.dragIndex + steps
				));
				
				if (targetIndex !== this.dragState.dragOverIndex) {
					this.dragState.dragOverIndex = targetIndex;
					
					// 轻触觉反馈
					if (uni.vibrateShort) {
						uni.vibrateShort({ type: 'light' });
					}
				}
			},

			// 拖拽结束
			onDragEnd(e) {
				// 清除长按定时器
				if (this.dragState.longPressTimer) {
					clearTimeout(this.dragState.longPressTimer);
					this.dragState.longPressTimer = null;
				}
				
				if (this.dragState.isDragging) {
					this.finishDrag();
				}
			},

			// 完成拖拽
			finishDrag() {
				const fromIndex = this.dragState.dragIndex;
				const toIndex = this.dragState.dragOverIndex;
				
				// 如果位置有变化，启动动画
				if (fromIndex !== toIndex) {
					this.animateItemMove(fromIndex, toIndex);
				} else {
					// 没有移动，直接重置状态
					this.resetDragState();
				}
			},
			
			// 动画移动项目
			animateItemMove(fromIndex, toIndex) {
				this.dragState.isAnimating = true;
				
				// 先移动数据
				this.moveItem(fromIndex, toIndex);
				
				// 等待一帧让DOM更新
				this.$nextTick(() => {
					// 300ms后重置状态
					setTimeout(() => {
						this.resetDragState();
					}, 300);
				});
			},
			
			// 重置拖拽状态
			resetDragState() {
				this.dragState.isDragging = false;
				this.dragState.dragIndex = -1;
				this.dragState.dragOverIndex = -1;
				this.dragState.isAnimating = false;
			},

			// 移动数组元素
			moveItem(fromIndex, toIndex) {
				if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
				if (fromIndex >= this.navItems.length || toIndex >= this.navItems.length) return;
				
				const newItems = [...this.navItems];
				const [movedItem] = newItems.splice(fromIndex, 1);
				newItems.splice(toIndex, 0, movedItem);
				this.navItems = newItems;
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
		transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.nav-item-edit:last-child {
		border-bottom: none;
	}

	.nav-item-edit.dragging {
		background: #fff;
		box-shadow: 0 16rpx 48rpx rgba(78, 205, 196, 0.4);
		border-radius: 16rpx;
		margin: 8rpx 16rpx;
		z-index: 1000;
		border: 2rpx solid rgba(78, 205, 196, 0.3);
		transform: scale(1.02);
		transition: none;
	}
	
	/* 动画完成后的平滑过渡 */
	.nav-item-edit:not(.dragging):not(.drag-over) {
		transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.nav-item-edit.drag-over {
		background: rgba(78, 205, 196, 0.05);
		border: 2rpx dashed rgba(78, 205, 196, 0.3);
		transform: scale(0.98);
		transition: all 0.2s ease;
	}

	.drag-handle {
		margin-right: 15rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 30rpx;
	}

	.drag-icon {
		font-size: 28rpx;
		color: #ccc;
		font-weight: bold;
		line-height: 1;
		transition: color 0.2s ease;
	}

	.drag-icon.active {
		color: #4ecdc4;
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
