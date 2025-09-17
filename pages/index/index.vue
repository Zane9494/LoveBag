<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<text class="navbar-title">{{title}}</text>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 顶部卡片介绍区域 -->
			<view class="hero-section" :style="currentThemeStyles">
				<image class="logo" src="/static/logo.png" mode="aspectFit" @click="goToThemeSettings"></image>
				<view class="hero-text">
					<text class="subtitle">专属恋爱秘籍</text>
					<text class="description">每一张卡片都是爱的魔法</text>
				</view>
			</view>

			<!-- 搜索框 -->
			<view class="search-section">
				<view class="search-box" :class="{'focused': searchFocused}" :style="searchBoxStyle">
					<text class="iconfont icon-sousuo search-icon"></text>
					<input class="search-input"
						   v-model="searchText"
						   placeholder="搜索你需要的魔法卡片..."
						   @input="onSearchInput"
						   @focus="searchFocused = true"
						   @blur="searchFocused = false" />
					<view class="search-clear" v-if="searchText" @click="clearSearch">
						<text class="clear-icon">×</text>
					</view>
				</view>
			</view>

			<!-- 默认状态提示 -->
			<view class="default-hint-section" v-if="!searchText && searchedCards.length === 0">
				<text class="default-hint">搜索卡片查看详情</text>
			</view>

			<!-- 分类选择器 -->
			<view class="category-section" v-if="!searchText && searchedCards.length > 0">
				<scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
					<view class="category-list">
						<view class="category-item"
							  :class="{'active': selectedCategory === ''}"
							  :style="getCategoryItemStyle('')"
							  @click="selectCategory('')">
							<view class="category-content">
								<text class="category-name">全部</text>
								<text class="category-count">{{searchedCards.length}}</text>
							</view>
						</view>
						<view class="category-item"
							  v-for="category in availableCategories"
							  :key="category.rarity"
							  :class="{'active': selectedCategory === category.rarity}"
							  :style="getCategoryItemStyle(category.rarity)"
							  @click="selectCategory(category.rarity)">
							<view class="category-content">
								<text class="category-name">{{category.name}}</text>
								<text class="category-count">{{category.count}}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 卡片列表 -->
			<view class="cards-section" v-if="displayCards.length > 0">
				<view class="section-header">
					<text class="section-title">{{sectionTitle}}</text>
					<text class="card-count">{{displayCards.length}}张</text>
				</view>

				<view class="cards-grid">
					<view class="card-item"
						  v-for="card in displayCards"
						  :key="card.id"
						  @click="showCardDetail(card)">
						<view class="card-inner">
							<view class="card-header">
								<text class="card-name">{{card.name}}</text>
								<view class="card-rarity" :class="'rarity-' + card.rarity">
									<text class="rarity-text">{{getRarityText(card.rarity)}}</text>
								</view>
							</view>
							<text class="card-description">{{card.description}}</text>
							<view class="card-footer">
								<text class="card-hint">点击查看详情</text>
								<text class="iconfont icon-youjiantou arrow-icon"></text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 搜索结果提示 -->
			<view class="search-result" v-if="searchText && filteredCards.length > 0">
				<text class="result-text">找到 {{filteredCards.length}} 张相关卡片</text>
			</view>

			<!-- 无结果提示 -->
			<view class="empty-state" v-if="searchText && filteredCards.length === 0">
				<text class="empty-icon">🔍</text>
				<text class="empty-title">未找到相关卡片</text>
				<text class="empty-subtitle">试试其他关键词吧</text>
			</view>
		</view>

		<!-- 卡片详情弹窗 -->
		<view class="modal-overlay" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">{{selectedCard.name}}</text>
					<text class="modal-rarity" :class="'rarity-' + selectedCard.rarity">{{getRarityText(selectedCard.rarity)}}</text>
				</view>
				<view class="modal-body">
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<text class="section-title">描述</text>
						<text class="section-content">{{selectedCard.description}}</text>
					</view>
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<text class="section-title">使用方法</text>
						<text class="section-content">{{selectedCard.usage}}</text>
					</view>
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<text class="section-title">使用技巧</text>
						<text class="section-content">{{selectedCard.tips}}</text>
					</view>
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<text class="section-title">心声</text>
						<text class="section-content quote">{{selectedCard.quote}}</text>
					</view>
				</view>
				<view class="modal-footer">
					<button class="close-btn" :style="currentThemeStyles" @click="closeModal">关闭</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import cardsData from '../../jsons/cards-data/cards-data.json'

	export default {
		data() {
			return {
				title: '恋爱卡片',
				searchText: '',
				allCards: [],
				filteredCards: [],
				displayCards: [],
				searchedCards: [],
				showModal: false,
				selectedCard: {},
				statusBarHeight: 0,
				selectedCategory: '', // 当前选择的分类
				currentTheme: 'teal', // 当前主题
				themeColors: {
					teal: {
						primary: '#4ecdc4',
						secondary: '#2ba3a8'
					},
					purple: {
						primary: '#8b5cf6',
						secondary: '#a78bfa'
					},
					pink: {
						primary: '#ff9a9e',
						secondary: '#fecfef'
					},
					orange: {
						primary: '#fa709a',
						secondary: '#fee140'
					},
					blue: {
						primary: '#3b82f6',
						secondary: '#1e40af'
					},
					green: {
						primary: '#10b981',
						secondary: '#059669'
					}
				},
				searchFocused: false // 搜索框聚焦状态
			}
		},
		computed: {
			sectionTitle() {
				if (this.searchText) {
					return '搜索结果'
				}
				if (this.selectedCategory) {
					return this.getRarityText(this.selectedCategory) + '卡片'
				}
				return '已搜索卡片'
			},
			// 可用的分类列表（只显示有搜索过卡片的分类）
			availableCategories() {
				const categories = [
					{ rarity: 'common', name: '普通' },
					{ rarity: 'rare', name: '稀有' },
					{ rarity: 'legend', name: '传说' }
				]
				return categories.filter(category => {
					const count = this.searchedCards.filter(card => card.rarity === category.rarity).length
					if (count > 0) {
						category.count = count
						return true
					}
					return false
				})
			},
			// 当前主题的样式
			currentThemeStyles() {
				const colors = this.themeColors[this.currentTheme]
				return {
					background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
					boxShadow: `0 8rpx 32rpx ${colors.primary}40`
				}
			},
			// 当前主题的颜色
			themeColor() {
				return this.themeColors[this.currentTheme]
			},
			// 搜索框样式
			searchBoxStyle() {
				const colors = this.themeColors[this.currentTheme]
				return {
					borderColor: this.searchFocused ? colors.primary : '#dee2e6',
					boxShadow: this.searchFocused ? `0 4rpx 12rpx ${colors.primary}30` : 'none'
				}
			}
		},
		onLoad() {
			this.getSystemInfo()
			this.loadTheme()
			this.loadCards()
		},
		onShow() {
			// 页面显示时重新加载主题，以防用户从主题设置页面返回
			this.loadTheme()
		},
		methods: {
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},

			// 加载主题
			loadTheme() {
				try {
					const savedTheme = uni.getStorageSync('currentTheme')
					if (savedTheme && this.themeColors[savedTheme]) {
						this.currentTheme = savedTheme
					}
				} catch (e) {
					console.log('加载主题失败:', e)
				}
			},

			loadCards() {
				this.allCards = cardsData.cards || []

				// 从本地存储加载搜索状态
				this.loadSearchedStatus()

				// 初始显示已搜索的卡片
				this.updateDisplayCards()
			},

			// 加载搜索状态
			loadSearchedStatus() {
				try {
					const searchedIds = uni.getStorageSync('searchedCardIds') || []
					this.allCards.forEach(card => {
						card.isSearched = searchedIds.includes(card.id)
					})
				} catch (e) {
					console.log('加载搜索状态失败:', e)
				}
			},

			// 保存搜索状态
			saveSearchedStatus() {
				try {
					const searchedIds = this.allCards
						.filter(card => card.isSearched)
						.map(card => card.id)
					uni.setStorageSync('searchedCardIds', searchedIds)
				} catch (e) {
					console.log('保存搜索状态失败:', e)
				}
			},

			// 更新显示的卡片
			updateDisplayCards() {
				this.searchedCards = this.allCards.filter(card => card.isSearched)

				if (this.searchText.trim() === '') {
					// 未搜索时显示已搜索过的卡片
					this.displayCards = this.searchedCards
					this.filteredCards = this.searchedCards
				} else {
					// 搜索时显示所有匹配的卡片
					this.filteredCards = this.allCards.filter(card => {
						return card.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
							   card.description.toLowerCase().includes(this.searchText.toLowerCase())
					})
					this.displayCards = this.filteredCards
				}
			},

			onSearchInput() {
				this.updateDisplayCards()
			},

			// 清除搜索
			clearSearch() {
				this.searchText = ''
				this.updateDisplayCards()
			},

			showCardDetail(card) {
				this.selectedCard = card
				this.showModal = true

				// 标记卡片为已搜索并保存
				if (!card.isSearched) {
					card.isSearched = true
					this.saveSearchedStatus()
					this.updateDisplayCards()
				}
			},

			closeModal() {
				this.showModal = false
				this.selectedCard = {}
			},

			getRarityText(rarity) {
				const rarityMap = {
					'common': '普通',
					'rare': '稀有',
					'legend': '传说'
				}
				return rarityMap[rarity] || '未知'
			},
			// 选择分类
			selectCategory(rarity) {
				this.selectedCategory = rarity

				if (rarity === '') {
					// 全部分类
					this.displayCards = this.searchedCards
				} else {
					// 根据选择的稀有度过滤卡片
					this.displayCards = this.searchedCards.filter(card => card.rarity === rarity)
				}
			},
			goToThemeSettings() {
				// 跳转到主题设置页面的逻辑
				uni.navigateTo({
					url: '/pages/theme-settings/theme-settings'
				})
			},
			// 获取分类项样式
			getCategoryItemStyle(rarity) {
				const colors = this.themeColors[this.currentTheme]
				if (this.selectedCategory === rarity) {
					return {
						background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
						color: 'white',
						border: `2rpx solid ${colors.primary}`
					}
				}
				return {
					background: 'white',
					color: '#495057',
					border: '2rpx solid transparent'
				}
			}
		}
	}
</script>

<style>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f9fa;
		width: 100%;
		box-sizing: border-box;
	}

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
		justify-content: center;
		align-items: center;
		height: 88rpx;
		padding: 0 40rpx;
	}

	.navbar-title {
		font-size: 32rpx;
		color: #495057;
		font-weight: 600;
	}

	.main-content {
		flex: 1;
		width: 100%;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.hero-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
		padding: 40rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(78, 205, 196, 0.4);
	}

	.logo {
		height: 120rpx;
		width: 120rpx;
		margin-bottom: 20rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.logo:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
	}

	.hero-text {
		text-align: center;
	}

	.subtitle {
		font-size: 28rpx;
		margin-bottom: 10rpx;
		font-weight: 600;
	}

	.description {
		font-size: 24rpx;
		line-height: 1.4;
		opacity: 0.9;
	}

	/* 搜索框样式 */
	.search-section {
		margin-bottom: 30rpx;
	}

	.search-box {
		width: 100%;
		height: 80rpx;
		border: 2rpx solid #dee2e6;
		border-radius: 40rpx;
		padding: 0 30rpx;
		display: flex;
		align-items: center;
		background-color: white;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.search-box.focused {
		border-color: #4ecdc4;
		box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.3);
	}

	.search-icon {
		font-size: 28rpx;
		color: #8b9dc3;
		margin-right: 10rpx;
	}

	.search-input {
		flex: 1;
		height: 100%;
		border: none;
		outline: none;
		font-size: 28rpx;
		color: #495057;
		background: transparent;
	}

	.search-input::placeholder {
		color: #adb5bd;
	}

	.search-clear {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background: rgba(0,0,0,0.04);
		transition: all 0.2s ease;
	}

	.search-clear:active {
		transform: scale(0.9);
		background: rgba(0,0,0,0.08);
	}

	.clear-icon {
		font-size: 24rpx;
		color: #8b9dc3;
		font-weight: bold;
	}

	/* 卡片列表样式 */
	.cards-section {
		width: 100%;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 0 5rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
	}

	.card-count {
		font-size: 24rpx;
		color: #6c757d;
		background-color: #f8f9fa;
		padding: 6rpx 16rpx;
		border-radius: 15rpx;
	}

	.search-result {
		text-align: center;
		padding: 20rpx;
		background-color: #e7f3ff;
		border-radius: 15rpx;
		margin-bottom: 20rpx;
	}

	.result-text {
		font-size: 26rpx;
		color: #495057;
		font-weight: 500;
	}

	.cards-grid {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.card-item {
		background-color: white;
		border-radius: 20rpx;
		padding: 25rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
		transition: all 0.2s ease;
		position: relative;
		width: 100%;
		box-sizing: border-box;
	}

	.card-item.searched {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border: 2rpx solid #dee2e6;
	}

	.card-item.searched::before {
		content: '✓';
		position: absolute;
		top: 15rpx;
		right: 15rpx;
		width: 30rpx;
		height: 30rpx;
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
		color: white;
		border-radius: 50%;
		font-size: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.card-item:active {
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.1);
	}

	.card-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.card-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		line-height: 1.3;
		flex: 1;
		margin-right: 10rpx;
	}

	.card-item.searched .card-name {
		color: #6c757d;
	}

	.card-rarity {
		font-size: 20rpx;
		padding: 6rpx 12rpx;
		border-radius: 15rpx;
		color: white;
		font-weight: 500;
	}

	.rarity-common {
		background: linear-gradient(135deg, #8d9498 0%, #7a8388 100%);
	}

	.rarity-rare {
		background: linear-gradient(135deg, #6fa8dc 0%, #5a96c7 100%);
	}

	.rarity-legend {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #fff;
	}

	.card-description {
		font-size: 24rpx;
		color: #6c757d;
		line-height: 1.5;
		flex-grow: 1;
		margin-bottom: 15rpx;
	}

	.card-item.searched .card-description {
		color: #868e96;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 15rpx;
		border-top: 1rpx solid #f1f3f4;
	}

	.card-hint {
		font-size: 22rpx;
		color: #adb5bd;
		font-weight: 500;
	}

	.card-item.searched .card-hint {
		color: #28a745;
		font-weight: 600;
	}

	/* 默认提示区域样式 */
	.default-hint-section {
		text-align: center;
		padding: 30rpx 40rpx;
		background-color: white;
		border-radius: 15rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
		border: 2rpx solid #f8f9fa;
	}

	.default-hint-section .default-hint {
		font-size: 26rpx;
		color: #6c757d;
		font-weight: 500;
	}

	.empty-icon {
		font-size: 60rpx;
		display: block;
		margin-bottom: 20rpx;
	}

	/* 无已搜索卡片提示样式 */
	.no-searched-cards {
		text-align: center;
		padding: 80rpx 40rpx;
		background-color: white;
		border-radius: 20rpx;
		margin-top: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	/* 空状态样式 */
	.empty-state {
		text-align: center;
		padding: 80rpx 40rpx;
		background-color: white;
		border-radius: 20rpx;
		margin-top: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	/* 弹窗样式优化 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
		padding: 40rpx;
		box-sizing: border-box;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		background: white;
		border-radius: 20rpx;
		width: 100%;
		max-width: 600rpx;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.25);
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f1f3f4;
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		border-radius: 20rpx 20rpx 0 0;
		color: white;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
		color: white;
	}

	.modal-rarity {
		font-size: 22rpx;
		padding: 8rpx 16rpx;
		border-radius: 15rpx;
		color: white;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.2);
	}

	.modal-body {
		padding: 30rpx;
	}

	.detail-section {
		margin-bottom: 30rpx;
		padding: 20rpx;
		background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
		border-radius: 15rpx;
		border-left: 4rpx solid #4ecdc4;
	}

	.section-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 15rpx;
	}

	.section-content {
		font-size: 24rpx;
		color: #6c757d;
		line-height: 1.6;
		display: block;
	}

	.quote {
		font-style: italic;
		color: #495057;
		background: linear-gradient(135deg, #e7f3ff 0%, #d6ebff 100%);
		padding: 20rpx;
		border-radius: 15rpx;
		border-left: 4rpx solid #6fa8dc;
	}

	.modal-footer {
		padding: 30rpx;
		border-top: 1rpx solid #f1f3f4;
		text-align: center;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 0 0 20rpx 20rpx;
	}

	.close-btn {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
		border: none;
		border-radius: 25rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.4);
		transition: all 0.2s ease;
	}

	.close-btn:active {
		transform: translateY(1rpx);
		box-shadow: 0 2rpx 8rpx rgba(78, 205, 196, 0.5);
	}

	.arrow-icon {
		font-size: 20rpx;
		color: #8b9dc3;
	}

	/* 分类选择器样式 */
	.category-section {
		margin-bottom: 40rpx;
		padding: 0 5rpx;
		position: relative;
		z-index: 2;
	}

	.category-scroll {
		overflow-x: auto;
		padding: 20rpx 0 25rpx 0;
		white-space: nowrap;
	}

	.category-list {
		display: flex;
		align-items: center;
		padding: 0 10rpx;
		gap: 15rpx;
	}

	.category-item {
		background-color: white;
		border-radius: 20rpx;
		transition: all 0.2s ease;
		flex-shrink: 0;
		min-height: 60rpx;
		display: flex;
		align-items: center;
		border: 2rpx solid transparent;
		position: relative;
		z-index: 1;
	}

	.category-content {
		display: flex;
		align-items: center;
		padding: 15rpx 25rpx;
		white-space: nowrap;
	}

	.category-item .category-name {
		font-size: 26rpx;
		font-weight: 500;
		color: #495057;
		transition: all 0.2s ease;
	}

	.category-item.active .category-name {
		font-weight: 700;
		color: white;
	}

	.category-item .category-count {
		font-size: 22rpx;
		color: #adb5bd;
		margin-left: 10rpx;
		background: rgba(0,0,0,0.04);
		padding: 4rpx 8rpx;
		border-radius: 10rpx;
		min-width: 24rpx;
		text-align: center;
		transition: all 0.2s ease;
	}

	.category-item.active .category-count {
		background: rgba(255, 255, 255, 0.25);
		color: rgba(255, 255, 255, 0.95);
		font-weight: 600;
	}

	.category-item:active {
		transform: translateY(-2rpx);
	}
</style>
