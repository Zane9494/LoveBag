<template>
	<view class="page" @click="handleScreenClick">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="navbar-left">
					<view class="more-btn" @click="showSideNav">
						<text class="iconfont icon-gengduo more-icon"></text>
					</view>
				</view>
				<text class="navbar-title">{{title}}</text>
				<view class="navbar-right"></view>
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
					<text class="card-count">{{displayCards.length}}种</text>
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

			<!-- 爱的特效 -->
			<view v-if="showLoveEffect" class="love-effect-overlay">
				<view class="love-effect-blur"></view>
				<view class="love-effect-center">
					<view class="gift-box" :class="{open: loveBoxOpen}">
						<view class="box-lid"></view>
						<view class="box-body"></view>
					</view>
					<view class="love-effect-burst">
						<view v-for="n in 18" :key="'star'+n" class="burst-star" :style="getBurstStyle(n, 'star')"></view>
						<view v-for="n in 12" :key="'ribbon'+n" class="burst-ribbon" :style="getBurstStyle(n, 'ribbon')"></view>
					</view>
					<view class="love-effect-text" v-if="loveBoxOpen">我也爱你</view>
				</view>
			</view>
		</view>

		<!-- 彩带特效 -->
		<view v-for="confetti in confettiList" :key="confetti.id" class="confetti-container" :style="confetti.containerStyle">
			<view v-for="n in 20" :key="'confetti-'+confetti.id+'-'+n" class="confetti-piece" :style="getConfettiStyle(confetti, n)"></view>
		</view>

		<!-- 侧边导航栏组件 -->
		<SideNavigation
			:visible="sideNavVisible"
			@close="hideSideNav"
		/>

		<!-- 卡片详情弹窗 -->
		<view class="modal-overlay" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<!-- 关闭按钮 -->
				<view class="modal-close-btn" @click="closeModal">
					<text class="close-icon">×</text>
				</view>

				<!-- 卡片头部 -->
				<view class="modal-header" :style="currentThemeStyles">
					<view class="header-decoration">
						<view class="decoration-circle"></view>
						<view class="decoration-circle delay-1"></view>
						<view class="decoration-circle delay-2"></view>
					</view>
					<view class="header-content">
						<text class="modal-title">{{selectedCard.name}}</text>
						<view class="modal-rarity-container">
							<text class="rarity-label">稀有度</text>
							<view class="modal-rarity" :class="'rarity-' + selectedCard.rarity">
								<text class="rarity-icon">✦</text>
								<text class="rarity-text">{{getRarityText(selectedCard.rarity)}}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 卡片内容 -->
				<view class="modal-body">
					<!-- 描述部分 -->
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<view class="section-header">
							<text class="section-icon">📝</text>
							<text class="section-title">卡片描述</text>
						</view>
						<text class="section-content">{{selectedCard.description}}</text>
					</view>

					<!-- 使用方法部分 -->
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<view class="section-header">
							<text class="section-icon">💡</text>
							<text class="section-title">使用方法</text>
						</view>
						<text class="section-content">{{selectedCard.usage}}</text>
					</view>

					<!-- 使用技巧部分 -->
					<view class="detail-section" :style="{ borderLeft: `4rpx solid ${themeColor.primary}` }">
						<view class="section-header">
							<text class="section-icon">⭐</text>
							<text class="section-title">使用技巧</text>
						</view>
						<text class="section-content">{{selectedCard.tips}}</text>
					</view>

					<!-- 心声部分 -->
					<view class="detail-section quote-section">
						<view class="section-header">
							<text class="section-icon">💭</text>
							<text class="section-title">内心独白</text>
						</view>
						<view class="quote-container" :style="{ background: `linear-gradient(135deg, ${themeColor.primary}15 0%, ${themeColor.secondary}15 100%)` }">
							<text class="quote-mark">"</text>
							<text class="section-content quote">{{selectedCard.quote}}</text>
							<text class="quote-mark quote-end">"</text>
						</view>
					</view>
				</view>

				<!-- 底部操作区 -->
				<view class="modal-footer">
					<view class="footer-decoration"></view>
					<button class="close-btn" :style="currentThemeStyles" @click="closeModal">
						<text class="btn-icon">✓</text>
						<text class="btn-text">我知道了</text>
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import cardsData from '../../jsons/cards-data/cards-data.json'
	import SideNavigation from '../../components/SideNavigation.vue'

	export default {
		components: {
			SideNavigation
		},
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
				searchFocused: false, // 搜索框聚焦状态
				showLoveEffect: false,
				loveEffectTimer: null,
				loveBoxOpen: false,
				sideNavVisible: false, // 侧边导航栏可见性
				confettiList: [], // 彩带列表
				confettiId: 0 // 彩带ID计数器
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
				return '全部卡片'
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
			// 记录当前使用的页面
			this.recordCurrentPage()
		},

		onShow() {
			// 页面显示时重新加载主题，以防用户从主题设置页面返回
			this.loadTheme()
			// 记录当前使用的页面
			this.recordCurrentPage()
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
				const searchTerm = this.searchText.toLowerCase().trim()
				if (searchTerm === '我爱你') {
					this.showLoveEffect = true
					this.loveBoxOpen = false
					clearTimeout(this.loveEffectTimer)
					setTimeout(() => {
						this.loveBoxOpen = true
					}, 350)
				this.loveEffectTimer = setTimeout(() => {
					this.showLoveEffect = false
					this.loveBoxOpen = false
					// 特效结束后清空搜索框并回到初始状态
					this.searchText = ''
					// 重置分类选择
					this.selectedCategory = ''
					this.updateDisplayCards()
				}, 2200)
					// 保持当前显示状态，不清空
					return
				}
				if (this.searchText.trim() === '') {
					// 未搜索时显示已搜索过的卡片
					this.displayCards = this.searchedCards
					this.filteredCards = this.searchedCards
				} else {
					// 搜索时显示所有匹配的卡片（只匹配name）
					// 如果搜索的是"卡"字，返回空结果，因为所有卡片都包含"卡"字
					if (searchTerm === '卡') {
						this.filteredCards = []
					} else {
						this.filteredCards = this.allCards.filter(card => {
							return card.name.toLowerCase().includes(searchTerm)
						})
					}
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
					url: '/pages/index/theme-settings'
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
			},
			getStarStyle(n) {
				// 随机生成星星位置和动画参数
				const left = Math.random() * 100
				const top = Math.random() * 100
				const duration = 1.2 + Math.random() * 1.2
				const delay = Math.random() * 1.2
				const size = 12 + Math.random() * 16
				return {
					left: left + '%',
					top: top + '%',
					width: size + 'rpx',
					height: size + 'rpx',
					animationDuration: duration + 's',
					animationDelay: delay + 's'
				}
			},
			getBurstStyle(n, type) {
				// 爆发轨迹：从中心随机角度和距离迸发
				const angle = Math.random() * 360
				const distance = 120 + Math.random() * 80
				const duration = 0.8 + Math.random() * 0.7
				const delay = 0.2 + Math.random() * 0.3
				const size = type === 'star' ? (18 + Math.random() * 16) : (22 + Math.random() * 12)
				const color = type === 'star' ? '#ffd700' : `hsl(${Math.floor(Math.random()*360)},80%,70%)`
				return {
					transform: `rotate(${angle}deg) translateY(-${distance}rpx) scale(1)`,
					background: type === 'star' ? `radial-gradient(circle, #ffd700 60%, #fff 100%)` : color,
					width: size + 'rpx',
					height: type === 'star' ? size + 'rpx' : (size/3 + 'rpx'),
					borderRadius: type === 'star' ? '50%' : '8rpx',
					opacity: 0.85,
					animation: type === 'star' ? `burst-star ${duration}s ${delay}s cubic-bezier(.7,.2,.4,1) forwards` : `burst-ribbon ${duration}s ${delay}s cubic-bezier(.7,.2,.4,1) forwards`
				}
			},
			// 显示侧边导航栏
			showSideNav() {
				this.sideNavVisible = true
			},

			// 隐藏侧边导航栏
			hideSideNav() {
				this.sideNavVisible = false
			},

			// 记录当前使用的页面
			recordCurrentPage() {
				try {
					uni.setStorageSync('lastUsedPage', 'cards')
				} catch (e) {
					console.log('记录页面失败:', e)
				}
			},

			// 处理屏幕点击事件
			handleScreenClick(event) {
				// 获取点击位置
				const x = event.detail.x || 0
				const y = event.detail.y || 0
				
				// 创建彩带效果
				this.createConfetti(x, y)
			},

			// 创建彩带效果
			createConfetti(x, y) {
				const confettiId = ++this.confettiId
				const confetti = {
					id: confettiId,
					x: x,
					y: y,
					containerStyle: {
						position: 'fixed',
						left: x + 'px',
						top: y + 'px',
						width: '1px',
						height: '1px',
						pointerEvents: 'none',
						zIndex: 9998
					}
				}
				
				this.confettiList.push(confetti)
				
				// 2秒后移除彩带
				setTimeout(() => {
					const index = this.confettiList.findIndex(item => item.id === confettiId)
					if (index > -1) {
						this.confettiList.splice(index, 1)
					}
				}, 2000)
			},

			// 获取彩带样式
			getConfettiStyle(confetti, n) {
				// 计算角度，让彩带向四面八方飞散
				const angle = (n * 18) % 360 // 每个彩带间隔18度
				const distance = 80 + Math.random() * 120 // 随机距离
				const duration = 1.2 + Math.random() * 0.8 // 随机持续时间
				const delay = Math.random() * 0.3 // 随机延迟
				const size = 8 + Math.random() * 12 // 随机大小
				
				// 随机颜色
				const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
				const color = colors[Math.floor(Math.random() * colors.length)]
				
				// 计算最终位置
				const radian = (angle * Math.PI) / 180
				const endX = Math.cos(radian) * distance
				const endY = Math.sin(radian) * distance
				
				// 创建唯一的动画名称
				const animationName = `confetti-burst-${confetti.id}-${n}`
				
				// 动态创建CSS动画（这里我们用transform直接设置）
				return {
					position: 'absolute',
					left: '0px',
					top: '0px',
					width: size + 'px',
					height: (size / 3) + 'px',
					backgroundColor: color,
					borderRadius: '2px',
					opacity: 1,
					transform: `translate(0px, 0px) rotate(${angle}deg)`,
					animation: `confetti-burst-${n % 8} ${duration}s ${delay}s ease-out forwards`
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
		justify-content: space-between;
		align-items: center;
		height: 88rpx;
		padding: 0 40rpx;
		position: relative;
	}

	.navbar-left {
		display: flex;
		align-items: center;
		height: 100%;
	}

	.navbar-right {
		width: 56rpx; /* 与左侧按钮宽度保持一致，用于平衡布局 */
	}

	.more-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.more-btn:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.05);
	}

	.more-icon {
		font-size: 28rpx;
		color: #495057;
		font-weight: bold;
	}

	.navbar-title {
		font-size: 32rpx;
		color: #495057;
		font-weight: 600;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
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
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(10rpx);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		padding: 40rpx;
		box-sizing: border-box;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			backdrop-filter: blur(0rpx);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(10rpx);
		}
	}

	.modal-content {
		background: white;
		border-radius: 24rpx;
		width: 100%;
		max-width: 640rpx;
		max-height: 85vh;
		overflow: hidden;
		box-shadow: 0 24rpx 48rpx rgba(0,0,0,0.15), 0 8rpx 16rpx rgba(0,0,0,0.1);
		animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		position: relative;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(60rpx) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-close-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 56rpx;
		height: 56rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 50%;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 1010;
		backdrop-filter: blur(10rpx);
	}

	.modal-close-btn:hover {
		background: rgba(255, 255, 255, 1);
		transform: scale(1.05);
		box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.2);
	}

	.modal-close-btn:active {
		transform: scale(0.95);
	}

	.close-icon {
		font-size: 32rpx;
		color: #495057;
		font-weight: bold;
		line-height: 1;
	}

	.modal-header {
		padding: 40rpx 30rpx 30rpx;
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		border-radius: 24rpx 24rpx 0 0;
		color: white;
		position: relative;
		overflow: hidden;
	}

	.header-decoration {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		pointer-events: none;
		opacity: 0.1;
	}

	.decoration-circle {
		position: absolute;
		width: 120rpx;
		height: 120rpx;
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		top: 20%;
		left: 80%;
	}

	.decoration-circle.delay-1 {
		width: 80rpx;
		height: 80rpx;
		top: 60%;
		left: 10%;
		animation: float 8s ease-in-out infinite;
		animation-delay: 1s;
	}

	.decoration-circle.delay-2 {
		width: 60rpx;
		height: 60rpx;
		top: 10%;
		left: 20%;
		animation: float 6s ease-in-out infinite;
		animation-delay: 3s;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0) rotate(0deg);
			opacity: 0.3;
		}
		50% {
			transform: translateY(-20rpx) rotate(180deg);
			opacity: 0.6;
		}
	}

	.header-content {
		position: relative;
		z-index: 2;
	}

	.modal-title {
		font-size: 36rpx;
		font-weight: 700;
		color: white;
		margin-bottom: 15rpx;
		text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
		line-height: 1.2;
	}

	.modal-rarity-container {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
	}

	.rarity-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-right: 12rpx;
		font-weight: 500;
	}

	.modal-rarity {
		display: flex;
		align-items: center;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10rpx);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		font-weight: 600;
		font-size: 22rpx;
	}

	.rarity-icon {
		font-size: 20rpx;
		margin-right: 6rpx;
		animation: sparkle 2s ease-in-out infinite;
	}

	@keyframes sparkle {
		0%, 100% { transform: scale(1) rotate(0deg); }
		50% { transform: scale(1.1) rotate(180deg); }
	}

	.modal-body {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
		background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
	}

	.detail-section {
		margin-bottom: 25rpx;
		padding: 24rpx;
		background: white;
		border-radius: 16rpx;
		border-left: 4rpx solid #4ecdc4;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.detail-section:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.08);
	}

	.detail-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2rpx;
		background: linear-gradient(90deg, transparent 0%, rgba(78, 205, 196, 0.3) 50%, transparent 100%);
	}

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.section-icon {
		font-size: 28rpx;
		margin-right: 12rpx;
		width: 32rpx;
		text-align: center;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		flex: 1;
	}

	.section-content {
		font-size: 26rpx;
		color: #6c757d;
		line-height: 1.7;
		display: block;
		margin-left: 44rpx;
	}

	.quote-section {
		border-left: 4rpx solid #6fa8dc;
	}

	.quote-container {
		position: relative;
		padding: 24rpx;
		border-radius: 12rpx;
		margin-left: 44rpx;
		border: 1rpx solid rgba(111, 168, 220, 0.2);
	}

	.quote-mark {
		font-size: 40rpx;
		color: rgba(111, 168, 220, 0.4);
		position: absolute;
		font-family: serif;
		font-weight: bold;
	}

	.quote-mark:first-child {
		top: 8rpx;
		left: 12rpx;
	}

	.quote-mark.quote-end {
		bottom: 8rpx;
		right: 12rpx;
		transform: rotate(180deg);
	}

	.quote {
		font-style: italic;
		color: #495057;
		font-size: 26rpx;
		line-height: 1.6;
		padding: 20rpx 30rpx;
		position: relative;
		z-index: 1;
		margin: 0;
	}

	.modal-footer {
		padding: 30rpx;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 0 0 24rpx 24rpx;
		text-align: center;
		position: relative;
		border-top: 1rpx solid rgba(0,0,0,0.05);
	}

	.footer-decoration {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2rpx;
		background: linear-gradient(90deg, transparent 0%, rgba(78, 205, 196, 0.2) 50%, transparent 100%);
	}

	.close-btn {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
		border: none;
		border-radius: 28rpx;
		padding: 18rpx 48rpx;
		font-size: 28rpx;
		font-weight: 600;
		box-shadow: 0 6rpx 20rpx rgba(78, 205, 196, 0.3);
		transition: all 0.3s ease;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		min-width: 200rpx;
		position: relative;
		overflow: hidden;
	}

	.close-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
		transition: left 0.5s ease;
	}

	.close-btn:hover::before {
		left: 100%;
	}

	.close-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 3rpx 12rpx rgba(78, 205, 196, 0.4);
	}

	.btn-icon {
		font-size: 26rpx;
		margin-right: 8rpx;
		animation: checkmark 0.6s ease-in-out;
	}

	@keyframes checkmark {
		0% { transform: scale(0.5) rotate(-45deg); opacity: 0; }
		50% { transform: scale(1.2) rotate(0deg); opacity: 0.8; }
		100% { transform: scale(1) rotate(0deg); opacity: 1; }
	}

	.btn-text {
		position: relative;
		z-index: 1;
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

	.love-effect-overlay {
		position: fixed;
		top: 0; left: 0; width: 100vw; height: 100vh;
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: auto;
	}

	.love-effect-blur {
		position: absolute;
		top: 0; left: 0; width: 100vw; height: 100vh;
		background: rgba(255,255,255,0.7);
		backdrop-filter: blur(16rpx);
		z-index: 1;
	}

	.love-effect-center {
		position: absolute;
		top: 50%; left: 50%; transform: translate(-50%, -50%);
		z-index: 10;
		width: 420rpx;
		height: 420rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.gift-box {
		position: absolute;
		left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1);
		width: 120rpx; height: 120rpx;
		z-index: 12;
		transition: transform 0.4s cubic-bezier(.7,.2,.4,1);
	}

	.gift-box.open {
		transform: translate(-50%, -50%) scale(1.15) rotate(-8deg);
	}

	.box-lid {
		position: absolute;
		left: 0; top: 0;
		width: 120rpx; height: 40rpx;
		background: linear-gradient(90deg, #fa709a 60%, #ffd700 100%);
		border-radius: 18rpx 18rpx 8rpx 8rpx;
		box-shadow: 0 6rpx 16rpx #fa709a44;
		transition: transform 0.4s cubic-bezier(.7,.2,.4,1);
	}

	.gift-box.open .box-lid {
		transform: translateY(-38rpx) rotate(-18deg);
	}

	.box-body {
		position: absolute;
		left: 0; top: 38rpx;
		width: 120rpx; height: 82rpx;
		background: linear-gradient(135deg, #ffd700 60%, #fa709a 100%);
		border-radius: 0 0 18rpx 18rpx;
		box-shadow: 0 8rpx 24rpx #ffd70044;
	}

	.love-effect-burst {
		position: absolute;
		left: 50%; top: 50%; transform: translate(-50%, -50%);
		width: 320rpx; height: 320rpx;
		pointer-events: none;
		z-index: 11;
	}

	.burst-star {
		position: absolute;
		left: 50%; top: 50%; transform: translate(-50%, -50%) scale(0.2);
		opacity: 0.7;
	}

	.burst-ribbon {
		position: absolute;
		left: 50%; top: 50%; transform: translate(-50%, -50%) scale(0.2);
		opacity: 0.7;
	}

	@keyframes burst-star {
		0% { transform: scale(0.2) translateY(0); opacity: 0.5; }
		60% { transform: scale(1.2) translateY(-60rpx); opacity: 1; }
		100% { transform: scale(1) translateY(-120rpx); opacity: 0; }
	}

	@keyframes burst-ribbon {
		0% { transform: scale(0.2) translateY(0); opacity: 0.5; }
		60% { transform: scale(1.1) translateY(-80rpx); opacity: 1; }
		100% { transform: scale(1) translateY(-160rpx); opacity: 0; }
	}

	.love-effect-text {
		position: absolute;
		top: 50%; left: 50%; transform: translate(-50%, -50%);
		font-size: 60rpx;
		color: #fa709a;
		font-weight: bold;
		text-shadow: 0 4rpx 24rpx #fff, 0 2rpx 8rpx #fa709a44;
		z-index: 20;
		letter-spacing: 8rpx;
		animation: love-fade-in 1.2s cubic-bezier(.6,.2,.4,1);
	}

	@keyframes love-fade-in {
		0% { opacity: 0; transform: scale(0.8) translate(-50%, -50%); }
		80% { opacity: 1; transform: scale(1.1) translate(-50%, -50%); }
		100% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
	}

	/* 彩带特效样式 */
	.confetti-container {
		position: fixed;
		pointer-events: none;
		z-index: 9998;
	}

	.confetti-piece {
		position: absolute;
		pointer-events: none;
	}

	@keyframes confetti-burst-0 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(120px, -80px) rotate(720deg) scale(0.3); }
	}
	@keyframes confetti-burst-1 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(80px, -120px) rotate(-720deg) scale(0.3); }
	}
	@keyframes confetti-burst-2 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(-80px, -120px) rotate(720deg) scale(0.3); }
	}
	@keyframes confetti-burst-3 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(-120px, -80px) rotate(-720deg) scale(0.3); }
	}
	@keyframes confetti-burst-4 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(-120px, 80px) rotate(720deg) scale(0.3); }
	}
	@keyframes confetti-burst-5 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(-80px, 120px) rotate(-720deg) scale(0.3); }
	}
	@keyframes confetti-burst-6 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(80px, 120px) rotate(720deg) scale(0.3); }
	}
	@keyframes confetti-burst-7 {
		0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); }
		100% { opacity: 0; transform: translate(120px, 80px) rotate(-720deg) scale(0.3); }
	}
</style>
