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
			<view class="preview-section" :style="currentThemeStyles">
				<view class="preview-content">
					<image class="preview-logo" src="/static/logo.png" mode="aspectFit"></image>
					<view class="preview-text">
						<text class="preview-title">{{ getThemeName(currentTheme) }}</text>
						<text class="preview-subtitle">当前选择的主题</text>
					</view>
				</view>
			</view>

			<!-- 主题选择 -->
			<view class="theme-section">
				<view class="section-header">
					<text class="section-title">选择主题</text>
					<text class="section-subtitle">点击下方主题进行切换</text>
				</view>

				<view class="theme-grid">
					<view
						class="theme-card"
						v-for="(theme, key) in themeColors"
						:key="key"
						:class="{ 'active': currentTheme === key }"
						:style="getThemeCardStyle(theme, key)"
						@click="selectTheme(key)">
						<view class="theme-preview" :style="{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }">
							<view class="theme-check" v-if="currentTheme === key">
								<text class="check-icon">✓</text>
							</view>
						</view>
						<text class="theme-name">{{ getThemeName(key) }}</text>
					</view>
				</view>
			</view>

			<!-- 主题说明 -->
			<view class="info-section">
				<text class="info-title">主题说明</text>
				<view class="info-item">
					<text class="info-icon">🎨</text>
					<text class="info-text">主题会影响整个应用的颜色风格</text>
				</view>
				<view class="info-item">
					<text class="info-icon">💾</text>
					<text class="info-text">设置会自动保存到本地</text>
				</view>
				<view class="info-item">
					<text class="info-icon">🔄</text>
					<text class="info-text">返回主页即可看到新主题效果</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 0,
			currentTheme: 'teal',
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
		currentThemeStyles() {
			const colors = this.themeColors[this.currentTheme]
			return {
				background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
				boxShadow: `0 8rpx 32rpx ${colors.primary}40`
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
				}
			} catch (e) {
				console.log('加载主题失败:', e)
			}
		},

		selectTheme(themeKey) {
			this.currentTheme = themeKey
			try {
				uni.setStorageSync('currentTheme', themeKey)
				uni.showToast({
					title: '主题已切换',
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
			const isActive = this.currentTheme === key
			return {
				borderColor: isActive ? theme.primary : 'transparent',
				boxShadow: isActive ? `0 4rpx 12rpx ${theme.primary}40` : '0 2rpx 8rpx rgba(0,0,0,0.1)'
			}
		},

		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #f8f9fa;
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
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
	background-color: #f8f9fa;
	transition: all 0.2s ease;
}

.back-btn:active {
	transform: scale(0.9);
	background-color: #e9ecef;
}

.back-icon {
	font-size: 32rpx;
	color: #495057;
	font-weight: bold;
}

.navbar-title {
	font-size: 32rpx;
	color: #495057;
	font-weight: 600;
}

.placeholder {
	width: 60rpx;
}

.main-content {
	flex: 1;
	padding: 20rpx;
}

.preview-section {
	background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(78, 205, 196, 0.4);
}

.preview-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: white;
}

.preview-logo {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.9);
	margin-bottom: 20rpx;
}

.preview-text {
	text-align: center;
}

.preview-title {
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 10rpx;
}

.preview-subtitle {
	font-size: 24rpx;
	opacity: 0.9;
}

.theme-section {
	background-color: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
}

.section-header {
	text-align: center;
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #495057;
	margin-bottom: 10rpx;
}

.section-subtitle {
	font-size: 24rpx;
	color: #6c757d;
}

.theme-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.theme-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 25rpx;
	border: 3rpx solid transparent;
	border-radius: 20rpx;
	background-color: #f8f9fa;
	transition: all 0.3s ease;
	cursor: pointer;
	position: relative;
}

.theme-card:active {
	transform: translateY(-2rpx);
}

.theme-card.active {
	background-color: white;
	border-color: #4ecdc4;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
}

.theme-preview {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-bottom: 20rpx;
	box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.15);
	position: relative;
	overflow: hidden;
}

.theme-check {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 40rpx;
	height: 40rpx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: checkPulse 0.3s ease;
}

@keyframes checkPulse {
	0% { transform: translate(-50%, -50%) scale(0); }
	50% { transform: translate(-50%, -50%) scale(1.2); }
	100% { transform: translate(-50%, -50%) scale(1); }
}

.check-icon {
	font-size: 20rpx;
	color: #4caf50;
	font-weight: bold;
}

.theme-name {
	font-size: 26rpx;
	color: #495057;
	font-weight: 500;
	text-align: center;
}

.theme-card.active .theme-name {
	color: #495057;
	font-weight: 600;
}

.info-section {
	background-color: white;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
}

.info-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #495057;
	margin-bottom: 20rpx;
}

.info-item {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
	padding: 15rpx 20rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 15rpx;
}

.info-icon {
	font-size: 28rpx;
	margin-right: 15rpx;
}

.info-text {
	font-size: 24rpx;
	color: #6c757d;
	line-height: 1.4;
}
</style>
