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
				<text class="navbar-title">欠欠清单</text>
				<view class="navbar-right">
					<view class="add-btn" @click="showAddCategory">
						<text class="iconfont icon-add more-icon"></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 顶部介绍卡片 -->
			<view class="hero-section" :style="currentThemeStyles">
				<view class="hero-icon">
					<text class="iconfont icon-lingyong hero-icon-text"></text>
				</view>
				<view class="hero-text">
					<text class="subtitle">欠欠清单</text>
					<text class="description">记录他欠我的小美好</text>
				</view>
			</view>

			<!-- 欠债列表 -->
			<view class="debt-list-section" v-if="activeDebts.length > 0">
				<view class="section-title">欠债记录</view>
				<view class="debt-grid">
					<view class="debt-card"
						  v-for="debt in activeDebts"
						  :key="debt.id">
						<view class="debt-header">
							<view class="debt-info">
								<text class="debt-icon">{{debt.icon}}</text>
								<view class="debt-details">
									<text class="debt-name">{{debt.name}}</text>
									<text class="debt-amount">{{debt.amount}}{{debt.unit}}</text>
								</view>
							</view>
							<view class="debt-actions">
								<view class="action-btn decrease-btn" @click="decreaseDebt(debt.id)">
									<text class="action-icon">-</text>
								</view>
								<view class="action-btn increase-btn" @click="increaseDebt(debt.id)">
									<text class="action-icon">+</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 类别管理区域 -->
			<view class="category-section">
				<view class="section-header">
					<view class="section-title">类别管理</view>
					<view class="manage-btn" @click="showAddCategory">
						<text class="iconfont icon-add add-icon"></text>
						<text class="add-text">添加类别</text>
					</view>
				</view>
				<view class="category-grid">
					<view class="category-card"
						  v-for="category in categories"
						  :key="category.id"
						  @click="quickAddDebt(category)"
						  @longpress="editCategory(category)">
						<view class="category-icon-wrapper">
							<text class="category-icon">{{category.icon}}</text>
						</view>
						<view class="category-content">
							<text class="category-name">{{category.name}}</text>
							<text class="category-unit">+{{category.increment}}{{category.unit}}</text>
						</view>
						<view class="category-actions" @click.stop>
							<view class="action-menu" @click="showCategoryActions(category)">
								<text class="iconfont icon-gengduo action-menu-icon"></text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 无数据提示 -->
			<view class="empty-state" v-if="activeDebts.length === 0 && categories.length === 0">
				<text class="empty-icon">📝</text>
				<text class="empty-title">还没有记录</text>
				<text class="empty-subtitle">添加类别开始记录欠债吧</text>
			</view>
		</view>

		<!-- 侧边导航栏组件 -->
		<SideNavigation
			:visible="sideNavVisible"
			@close="hideSideNav"
		/>

		<!-- 添加/编辑类别弹窗 -->
		<view class="modal-overlay" v-if="showAddModal" @click="closeAddModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">{{isEditMode ? '编辑类别' : '添加类别'}}</text>
					<view class="modal-close" @click="closeAddModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="add-form">
						<view class="form-section">
							<text class="form-label">类别名称</text>
							<input class="form-input"
								   v-model="newCategory.name"
								   placeholder="请输入类别名称"
								   maxlength="10" />
						</view>
						<view class="form-section">
							<text class="form-label">单位</text>
							<input class="form-input"
								   v-model="newCategory.unit"
								   placeholder="个、杯、份等"
								   maxlength="5" />
						</view>
						<view class="form-section">
							<text class="form-label">每次增加量</text>
							<input class="form-input"
								   v-model.number="newCategory.increment"
								   type="digit"
								   placeholder="如：0.5、1、2等" />
						</view>
						<view class="form-section">
							<text class="form-label">选择图标</text>
							<view class="icon-grid">
								<view class="icon-item"
									  v-for="icon in availableIcons"
									  :key="icon"
									  :class="{'active': newCategory.icon === icon}"
									  @click="selectIcon(icon)">
									<text class="icon-text">{{icon}}</text>
								</view>
							</view>
						</view>
						<view class="form-actions">
							<button class="form-btn cancel-btn" @click="closeAddModal">
								取消
							</button>
							<button class="form-btn confirm-btn"
									:style="currentThemeStyles"
									@click="isEditMode ? updateCategory() : addCategory()">
								{{isEditMode ? '更新' : '添加'}}
							</button>
							<button class="form-btn delete-btn"
									v-if="isEditMode"
									@click="deleteCurrentCategory">
								删除
							</button>
						</view>
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
				sideNavVisible: false,
				showAddModal: false,
				isEditMode: false,
				editingCategory: null,
				nextCategoryId: 1,
				nextDebtId: 1,

				// 固定使用粉色主题
				themeColors: {
					primary: '#ff6b9d',
					secondary: '#ff8fab'
				},

				// 类别列表
				categories: [],

				// 欠债记录列表
				debtList: [],

				// 新类别表单
				newCategory: {
					name: '',
					unit: '个',
					increment: 1,
					icon: '🍰'
				},

				// 可选图标
				availableIcons: [
					'🍰', '🍉', '🍠', '🌰', '🧋', '🍎', '🍊', '🍌', '🍇', '🍓', 
					'🥝', '🍑', '🥭', '🍍', '🥥', '🍒', '🍈', '🍋', '🥑', '🥒',
					'🍕', '🍔', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥘', '🍗'
				]
			}
		},

		computed: {
			// 固定粉色主题样式
			currentThemeStyles() {
				return {
					background: `linear-gradient(135deg, ${this.themeColors.primary} 0%, ${this.themeColors.secondary} 100%)`
				}
			},

			// 过滤出有欠债的记录
			activeDebts() {
				return this.debtList.filter(debt => debt.amount > 0)
			}
		},

		onLoad() {
			this.getSystemInfo()
			this.loadData()
			this.recordCurrentPage()
		},

		onShow() {
			this.recordCurrentPage()
		},

		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},

			loadData() {
				try {
					const savedCategories = uni.getStorageSync('debtCategories')
					const savedDebts = uni.getStorageSync('debtList')
					const savedCategoryId = uni.getStorageSync('nextCategoryId')
					const savedDebtId = uni.getStorageSync('nextDebtId')

					if (savedCategories) {
						this.categories = savedCategories
					}
					if (savedDebts) {
						this.debtList = savedDebts
					}
					if (savedCategoryId) {
						this.nextCategoryId = savedCategoryId
					}
					if (savedDebtId) {
						this.nextDebtId = savedDebtId
					}
				} catch (e) {
					console.log('加载数据失败:', e)
				}
			},

			saveData() {
				try {
					uni.setStorageSync('debtCategories', this.categories)
					uni.setStorageSync('debtList', this.debtList)
					uni.setStorageSync('nextCategoryId', this.nextCategoryId)
					uni.setStorageSync('nextDebtId', this.nextDebtId)
				} catch (e) {
					console.log('保存数据失败:', e)
				}
			},

			showAddCategory() {
				this.isEditMode = false
				this.editingCategory = null
				this.newCategory = {
					name: '',
					unit: '个',
					increment: 1,
					icon: '🍰'
				}
				this.showAddModal = true
			},

			editCategory(category) {
				this.isEditMode = true
				this.editingCategory = category
				this.newCategory = {
					name: category.name,
					unit: category.unit,
					increment: category.increment,
					icon: category.icon
				}
				this.showAddModal = true

				uni.vibrateShort()
			},

			showCategoryActions(category) {
				uni.showActionSheet({
					itemList: ['编辑类别', '删除类别'],
					success: (res) => {
						if (res.tapIndex === 0) {
							this.editCategory(category)
						} else if (res.tapIndex === 1) {
							this.showDeleteCategory(category)
						}
					}
				})
			},

			closeAddModal() {
				this.showAddModal = false
			},

			selectIcon(icon) {
				this.newCategory.icon = icon
			},

			addCategory() {
				if (!this.newCategory.name.trim()) {
					uni.showToast({
						title: '请输入类别名称',
						icon: 'none'
					})
					return
				}

				if (!this.newCategory.unit.trim()) {
					uni.showToast({
						title: '请输入单位',
						icon: 'none'
					})
					return
				}

				if (!this.newCategory.increment || this.newCategory.increment <= 0) {
					uni.showToast({
						title: '请输入正确的增加量',
						icon: 'none'
					})
					return
				}

				const category = {
					id: this.nextCategoryId++,
					name: this.newCategory.name.trim(),
					unit: this.newCategory.unit.trim(),
					increment: this.newCategory.increment,
					icon: this.newCategory.icon
				}

				this.categories.push(category)
				this.saveData()
				this.closeAddModal()

				uni.showToast({
					title: '类别添加成功',
					icon: 'success',
					duration: 1500
				})
			},

			updateCategory() {
				if (!this.newCategory.name.trim()) {
					uni.showToast({
						title: '请输入类别名称',
						icon: 'none'
					})
					return
				}

				if (!this.newCategory.unit.trim()) {
					uni.showToast({
						title: '请输入单位',
						icon: 'none'
					})
					return
				}

				if (!this.newCategory.increment || this.newCategory.increment <= 0) {
					uni.showToast({
						title: '请输入正确的增加量',
						icon: 'none'
					})
					return
				}

				// 更新类别
				this.editingCategory.name = this.newCategory.name.trim()
				this.editingCategory.unit = this.newCategory.unit.trim()
				this.editingCategory.increment = this.newCategory.increment
				this.editingCategory.icon = this.newCategory.icon

				// 更新相关的欠债记录
				this.debtList.forEach(debt => {
					if (debt.categoryId === this.editingCategory.id) {
						debt.name = this.editingCategory.name
						debt.icon = this.editingCategory.icon
						debt.unit = this.editingCategory.unit
						debt.increment = this.editingCategory.increment
					}
				})

				this.saveData()
				this.closeAddModal()

				uni.showToast({
					title: '类别更新成功',
					icon: 'success',
					duration: 1500
				})
			},

			deleteCurrentCategory() {
				if (!this.editingCategory) return

				uni.showModal({
					title: '确认删除',
					content: `确定要删除 "${this.editingCategory.name}" 类别吗？相关的欠债记录也会被删除。`,
					success: (res) => {
						if (res.confirm) {
							this.deleteCategory(this.editingCategory)
							this.closeAddModal()
						}
					}
				})
			},

			quickAddDebt(category) {
				// 查找是否已有该类别的欠债记录
				let existingDebt = this.debtList.find(debt => debt.categoryId === category.id)
				
				if (existingDebt) {
					// 如果已存在，增加数量
					existingDebt.amount += category.increment
				} else {
					// 如果不存在，创建新记录
					const debt = {
						id: this.nextDebtId++,
						categoryId: category.id,
						name: category.name,
						icon: category.icon,
						unit: category.unit,
						amount: category.increment,
						increment: category.increment
					}
					this.debtList.push(debt)
				}

				this.saveData()

				uni.showToast({
					title: `${category.name} +${category.increment}${category.unit}`,
					icon: 'success',
					duration: 1500
				})
			},

			increaseDebt(debtId) {
				const debt = this.debtList.find(d => d.id === debtId)
				if (debt) {
					debt.amount += debt.increment
					this.saveData()

					uni.showToast({
						title: `${debt.name} +${debt.increment}${debt.unit}`,
						icon: 'success',
						duration: 1000
					})
				}
			},

			decreaseDebt(debtId) {
				const debt = this.debtList.find(d => d.id === debtId)
				if (debt) {
					debt.amount = Math.max(0, debt.amount - debt.increment)
					
					if (debt.amount === 0) {
						uni.showToast({
							title: `${debt.name} 已还清！`,
							icon: 'success',
							duration: 1500
						})
					} else {
						uni.showToast({
							title: `${debt.name} -${debt.increment}${debt.unit}`,
							icon: 'success',
							duration: 1000
						})
					}
					
					this.saveData()
				}
			},

			showDeleteCategory(category) {
				uni.showModal({
					title: '删除类别',
					content: `确定要删除 "${category.name}" 类别吗？相关的欠债记录也会被删除。`,
					success: (res) => {
						if (res.confirm) {
							this.deleteCategory(category)
						}
					}
				})
			},

			deleteCategory(category) {
				// 删除类别
				const categoryIndex = this.categories.findIndex(c => c.id === category.id)
				if (categoryIndex !== -1) {
					this.categories.splice(categoryIndex, 1)
				}

				// 删除相关的欠债记录
				this.debtList = this.debtList.filter(debt => debt.categoryId !== category.id)

				this.saveData()

				uni.showToast({
					title: '删除成功',
					icon: 'success',
					duration: 1500
				})
			},

			showSideNav() {
				this.sideNavVisible = true
			},

			hideSideNav() {
				this.sideNavVisible = false
			},

			// 记录当前使用的页面
			recordCurrentPage() {
				try {
					uni.setStorageSync('lastUsedPage', 'debt-list')
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

	.more-btn, .add-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.more-btn:active, .add-btn:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.05);
	}

	.more-icon {
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

	/* 顶部卡片 */
	.hero-section {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
		color: white;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(255, 107, 157, 0.4);
	}

	.hero-icon {
		margin-right: 20rpx;
	}

	.hero-icon-text {
		font-size: 48rpx;
		color: white;
		transform: scaleX(-1); /* 水平对称 */
	}

	.hero-text {
		text-align: left;
	}

	.subtitle {
		font-size: 28rpx;
		margin-bottom: 8rpx;
		font-weight: 600;
		display: block;
	}

	.description {
		font-size: 24rpx;
		line-height: 1.4;
		opacity: 0.9;
		display: block;
	}

	/* 区域标题 */
	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 20rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.manage-btn {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.add-icon {
		font-size: 28rpx;
		color: #ff6b9d;
		margin-right: 8rpx;
	}

	.add-text {
		font-size: 24rpx;
		color: #495057;
	}

	/* 欠债列表区域 */
	.debt-list-section {
		margin-bottom: 30rpx;
	}

	.debt-grid {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.debt-card {
		background: white;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		border-left: 4rpx solid #ff6b9d;
	}

	.debt-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.debt-info {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.debt-icon {
		font-size: 36rpx;
		margin-right: 16rpx;
	}

	.debt-details {
		display: flex;
		flex-direction: column;
	}

	.debt-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 4rpx;
	}

	.debt-amount {
		font-size: 24rpx;
		color: #ff6b9d;
		font-weight: 600;
	}

	.debt-actions {
		display: flex;
		gap: 12rpx;
	}

	.action-btn {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.2s ease;
	}

	.decrease-btn {
		background: #6c757d;
	}

	.increase-btn {
		background: #ff6b9d;
	}

	.action-btn:active {
		transform: scale(0.9);
	}

	.action-icon {
		font-size: 32rpx;
		color: white;
		font-weight: bold;
	}

	/* 类别管理区域 */
	.category-section {
		margin-bottom: 30rpx;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16rpx;
	}

	.category-card {
		background: white;
		border-radius: 16rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		transition: all 0.2s ease;
		position: relative;
		border: 2rpx solid transparent;
	}

	.category-card:active {
		transform: scale(0.98);
		border-color: rgba(255, 107, 157, 0.3);
		box-shadow: 0 6rpx 20rpx rgba(255, 107, 157, 0.2);
	}

	.category-icon-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: 12rpx;
	}

	.category-icon {
		font-size: 48rpx;
	}

	.category-content {
		text-align: center;
	}

	.category-name {
		font-size: 26rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 4rpx;
		display: block;
	}

	.category-unit {
		font-size: 22rpx;
		color: #ff6b9d;
		font-weight: 500;
		display: block;
	}

	.category-actions {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
	}

	.action-menu {
		width: 32rpx;
		height: 32rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}

	.action-menu:active {
		background: rgba(0, 0, 0, 0.1);
		transform: scale(0.9);
	}

	.action-menu-icon {
		font-size: 20rpx;
		color: #6c757d;
	}

	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 80rpx 40rpx;
		background: white;
		border-radius: 20rpx;
		margin-top: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	.empty-icon {
		font-size: 80rpx;
		display: block;
		margin-bottom: 20rpx;
	}

	.empty-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 12rpx;
	}

	.empty-subtitle {
		font-size: 24rpx;
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

	.modal-header {
		background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
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
		font-size: 32rpx;
		color: white;
		font-weight: bold;
	}

	.modal-body {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	/* 表单样式 */
	.form-section {
		margin-bottom: 24rpx;
	}

	.form-label {
		font-size: 26rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 12rpx;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #495057;
		box-sizing: border-box;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		border-color: #ff6b9d;
		box-shadow: 0 0 0 4rpx rgba(255, 107, 157, 0.1);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 12rpx;
	}

	.icon-item {
		aspect-ratio: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		background: #f8f9fa;
		transition: all 0.2s ease;
	}

	.icon-item.active {
		border-color: #ff6b9d;
		background: rgba(255, 107, 157, 0.1);
	}

	.icon-item:active {
		transform: scale(0.9);
	}

	.icon-text {
		font-size: 32rpx;
	}

	.form-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 30rpx;
		flex-wrap: wrap;
	}

	.form-btn {
		flex: 1;
		height: 72rpx;
		border: none;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.2s ease;
		outline: none;
		box-sizing: border-box;
	}

	.form-btn::after,
	.form-btn::before {
		display: none !important;
	}

	.cancel-btn {
		background: #f8f9fa;
		color: #495057;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
		color: white;
	}

	.delete-btn {
		background: #ef5350;
		color: white;
		flex: 1;
		min-width: 120rpx;
	}

	.form-btn:active {
		transform: translateY(2rpx);
	}
</style>
