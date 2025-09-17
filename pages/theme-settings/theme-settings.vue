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
				<view class="preview-content">
					<image class="preview-logo" src="/static/logo.png" mode="aspectFit"></image>
					<view class="preview-text">
						<text class="preview-title">{{ getThemeName(selectedTheme) }}</text>
						<text class="preview-subtitle">{{ selectedTheme === currentTheme ? '当前使用的主题' : '预览主题效果' }}</text>
					</view>
				</view>
			</view>

			<!-- 主题选择 -->
			<view class="theme-section">
				<view class="section-header">
					<text class="section-title">选择主题</text>
				</view>

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
							<view class="theme-selected" v-if="selectedTheme === key && selectedTheme !== currentTheme">
								<text class="selected-icon">●</text>
							</view>
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
			if (this.selectedTheme === this.currentTheme) {
				return {
					background: '#e9ecef',
					color: '#6c757d',
					boxShadow: 'none'
				}
			}
			const colors = this.themeColors[this.selectedTheme]
			return {
				background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
				color: 'white',
				boxShadow: `0 8rpx 24rpx ${colors.primary}40`
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
			const isCurrent = this.currentTheme === key

			if (isSelected && !isCurrent) {
				return {
					borderColor: theme.primary,
					boxShadow: `0 6rpx 20rpx ${theme.primary}40`,
					background: 'white',
					transform: 'scale(1.02)'
				}
			}

			return {
				borderColor: 'transparent',
				boxShadow: '0 4rpx 12rpx rgba(0,0,0,0.08)',
				background: 'white'
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
	display: flex;
	flex-direction: column;
}

.preview-section {
	background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
	border-radius: 24rpx;
	padding: 50rpx 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 12rpx 40rpx rgba(78, 205, 196, 0.3);
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
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	flex: 1;
	margin-bottom: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
}

.section-header {
	text-align: center;
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #2c3e50;
	margin-bottom: 15rpx;
}

.theme-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 30rpx;
	padding: 10rpx 0;
}

.theme-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 30rpx;
	border: 3rpx solid transparent;
	border-radius: 24rpx;
	background-color: #f8f9fa;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	position: relative;
}

.theme-card:active {
	transform: scale(0.98);
}

.theme-preview {
	width: 140rpx;
	height: 140rpx;
	border-radius: 70rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.15);
	position: relative;
	overflow: hidden;
}

.theme-check {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50rpx;
	height: 50rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: checkBounce 0.4s ease;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
}

.theme-selected {
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
	animation: selectedPulse 0.3s ease;
}

@keyframes checkBounce {
	0% { transform: translate(-50%, -50%) scale(0); }
	60% { transform: translate(-50%, -50%) scale(1.15); }
	100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes selectedPulse {
	0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
	100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.check-icon {
	font-size: 24rpx;
	color: #27ae60;
	font-weight: bold;
}

.selected-icon {
	font-size: 20rpx;
	color: #3498db;
	font-weight: bold;
}

.theme-name {
	font-size: 28rpx;
	color: #2c3e50;
	font-weight: 600;
	text-align: center;
	margin-bottom: 8rpx;
}

.confirm-section {
	background-color: white;
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
	text-align: center;
}

.confirm-btn {
	width: 100%;
	height: 100rpx;
	border: none;
	border-radius: 50rpx;
	font-size: 34rpx;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.15);
}

.confirm-btn:active:not(.disabled) {
	transform: translateY(-3rpx);
	box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.2);
}

.confirm-btn.disabled {
	cursor: not-allowed;
	opacity: 0.6;
	transform: none !important;
	box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.1);
}
</style>
