<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">主题设置</text>
				<view class="placeholder"></view>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 当前主题预览 -->
			<view class="preview-section" :style="previewThemeStyles">
				<image class="preview-logo" src="/static/logo.png" mode="aspectFit"></image>
				<view class="preview-text">
					<text class="preview-title">{{ getThemeName(selectedTheme) }}</text>
					<text class="preview-subtitle">{{ selectedTheme === currentTheme ? '当前使用的主题' : '预览主题效果' }}</text>
				</view>
			</view>

			<!-- 主题选择 -->
			<view class="theme-section">
				<view class="theme-grid">
					<view
						class="theme-card"
						v-for="(theme, key) in themeColors"
						:key="key"
						:class="{ 'active': selectedTheme === key, 'current': currentTheme === key }"
						:style="getThemeCardStyle(theme, key)"
						@click="selectTheme(key)">
						<view class="theme-preview" :style="{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }">
							<view class="theme-check" v-if="currentTheme === key">
								<text class="check-icon">✓</text>
							</view>
							<!-- 移除被选中主题的 selected-icon -->
						</view>
						<text class="theme-name">{{ getThemeName(key) }}</text>
					</view>
				</view>
			</view>

			<!-- 确认按钮区域 -->
			<view class="confirm-section">
				<button
					class="confirm-btn"
					:class="{ 'disabled': selectedTheme === currentTheme }"
					:style="confirmButtonStyle"
					@click="confirmTheme"
					:disabled="selectedTheme === currentTheme">
					{{ selectedTheme === currentTheme ? '当前主题' : '确认更换主题' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 0,
			currentTheme: 'teal', // 当前正在使用的主题
			selectedTheme: 'teal', // 当前选择的主题（用于预览）
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
			}
		}
	},
	computed: {
		previewThemeStyles() {
			const colors = this.themeColors[this.selectedTheme]
			return {
				background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
				boxShadow: `0 8rpx 32rpx ${colors.primary}40`
			}
		},
		confirmButtonStyle() {
			// 确认按钮跟随选中的主题颜色变化
			const colors = this.themeColors[this.selectedTheme]
			return {
				background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
				color: 'white',
				boxShadow: `0 8rpx 24rpx ${colors.primary}40`,
				opacity: this.selectedTheme === this.currentTheme ? '0.6' : '1'
			}
		}
	},
	onLoad() {
		this.getSystemInfo()
		this.loadTheme()
	},
	methods: {
		getSystemInfo() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 0
		},

		loadTheme() {
			try {
				const savedTheme = uni.getStorageSync('currentTheme')
				if (savedTheme && this.themeColors[savedTheme]) {
					this.currentTheme = savedTheme
					this.selectedTheme = savedTheme // 初始选择也设为当前主题
				}
			} catch (e) {
				console.log('加载主题失败:', e)
			}
		},

		selectTheme(themeKey) {
			this.selectedTheme = themeKey // 只更新选择状态，不保存
		},

		confirmTheme() {
			if (this.selectedTheme === this.currentTheme) {
				return // 如果选择的是当前主题，不做任何操作
			}

			try {
				uni.setStorageSync('currentTheme', this.selectedTheme)
				this.currentTheme = this.selectedTheme
				uni.showToast({
					title: '主题已更换',
					icon: 'success',
					duration: 1500
				})
			} catch (e) {
				console.log('保存主题失败:', e)
				uni.showToast({
					title: '保存失败',
					icon: 'error'
				})
			}
		},

		getThemeName(key) {
			const names = {
				teal: '清新蓝绿',
				purple: '优雅紫色',
				pink: '温馨粉色',
				orange: '活力橙色',
				blue: '深邃蓝色',
				green: '自然绿色'
			}
			return names[key] || '未知主题'
		},

		getThemeCardStyle(theme, key) {
			const isSelected = this.selectedTheme === key
			// 选中时只显示边框，不做其他效果变化
			if (isSelected) {
				return {
					borderColor: theme.primary,
					borderWidth: '3rpx',
					borderStyle: 'solid'
				}
			}

			return {
				borderColor: 'transparent',
				borderWidth: '3rpx',
				borderStyle: 'solid'
			}
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	height: 100vh;
	background: #f8f9fa;
	display: flex;
	flex-direction: column;
}

.custom-navbar {
	background: white;
	border-bottom: 1rpx solid #e9ecef;
	z-index: 1000;
}

.navbar-content {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 32rpx;
}

.back-btn {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.back-icon {
	font-size: 40rpx;
	color: #333;
}

.navbar-title {
	font-size: 32rpx;
	font-weight: 600;
  color: #495057;
}

.placeholder {
	width: 88rpx;
}

.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 40rpx 32rpx;
}

.preview-section {
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

.preview-content {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	color: white;
}

.preview-logo {
	height: 120rpx;
	width: 120rpx;
	margin-bottom: 20rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
}

.preview-text {
	text-align: center;
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.preview-title {
	font-size: 28rpx;
	font-weight: 600;
}

.preview-subtitle {
	font-size: 24rpx;
	line-height: 1.4;
	opacity: 0.9;
}

.theme-section {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.theme-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
	flex: 1;
}

.theme-card {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.theme-preview {
	width: 100%;
	height: 160rpx;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.theme-check {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 48rpx;
	height: 48rpx;
	background: rgba(255,255,255,0.9);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	font-size: 24rpx;
	color: #10b981;
	font-weight: bold;
}

.theme-selected {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.selected-icon {
	font-size: 20rpx;
	color: white;
}

.theme-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.confirm-section {
	margin-top: 40rpx;
	padding-top: 40rpx;
}

.confirm-btn {
	width: 100%;
	height: 96rpx;
	border-radius: 25rpx;
	border: none;
	font-size: 28rpx;
	font-weight: 600;
	transition: all 0.2s ease;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.confirm-btn.disabled {
	cursor: not-allowed;
}
</style>
