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
				<text class="navbar-title">药丸记录</text>
				<view class="navbar-right">
					<view class="info-btn" @click="showInfo">
						<text class="iconfont icon-gengduo info-icon"></text>
					</view>
				</view>
			</view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 顶部状态卡片 -->
			<view class="status-card" :style="currentThemeStyles" @click="handleStatusCardClick">
				<view class="status-icon">
					<text class="iconfont" :class="todayIconClass" :style="todayIconStyle"></text>
				</view>
				<view class="status-info">
					<text class="status-title">{{todayStatusTitle}}</text>
					<text class="status-desc">{{todayStatusDesc}}</text>
					<text class="cycle-info">{{cycleInfo}}</text>
				</view>
			</view>

			<!-- 今日操作区 -->
			<view class="today-action" v-if="shouldShowTodayAction">
				<view class="action-title">今日操作</view>
				<view class="action-buttons">
					<button class="action-btn taken-btn" :style="takenBtnStyle" @click="recordTaken(true)">
						<text class="iconfont icon-drug-full btn-icon"></text>
						<text class="btn-text">已服用</text>
					</button>
					<button class="action-btn missed-btn" @click="recordTaken(false)">
						<text class="iconfont icon-jinggao btn-icon"></text>
						<text class="btn-text">未服用</text>
					</button>
				</view>
			</view>

			<!-- 日历区域 -->
			<view class="calendar-section">
				<view class="calendar-header">
					<view class="month-nav">
						<view class="nav-btn" @click="prevMonth">
							<text class="iconfont icon-zuojiantou"></text>
						</view>
						<text class="month-title">{{currentMonthTitle}}</text>
						<view class="nav-btn" @click="nextMonth">
							<text class="iconfont icon-youjiantou"></text>
						</view>
					</view>
				</view>

				<view class="calendar-grid">
					<!-- 星期标题 -->
					<view class="weekday-row">
						<text class="weekday" v-for="day in weekDays" :key="day">{{day}}</text>
					</view>

					<!-- 日期网格 -->
					<view class="date-row" v-for="(week, weekIndex) in calendarDays" :key="weekIndex">
						<view class="date-cell"
							  v-for="(day, dayIndex) in week"
							  :key="dayIndex"
							  :class="getDayCellClass(day)"
							  @click="selectDay(day)">
							<text class="date-number" :class="{'other-month': !day.isCurrentMonth}">
								{{day.date}}
							</text>
							<view class="date-status" v-if="day.isCurrentMonth && day.status">
								<text class="iconfont" :class="getDayIconClass(day)" :style="getDayIconStyle(day)"></text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 周期统计 -->
			<view class="stats-section">
				<view class="stats-title">本周期统计</view>
				<view class="stats-grid">
					<view class="stat-item">
						<text class="stat-number">{{currentCycleStats.taken}}</text>
						<text class="stat-label">已服用</text>
					</view>
					<view class="stat-item">
						<text class="stat-number">{{currentCycleStats.missed}}</text>
						<text class="stat-label">未服用</text>
					</view>
					<view class="stat-item">
						<text class="stat-number">{{currentCycleStats.remaining}}</text>
						<text class="stat-label">剩余天数</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 侧边导航栏组件 -->
		<SideNavigation
			:visible="sideNavVisible"
			@close="hideSideNav"
			@navigate="handleNavigation"
		/>

		<!-- 详情弹窗 -->
		<view class="modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">{{selectedDay.dateStr}}</text>
					<view class="modal-close" @click="closeDetailModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="day-detail">
						<view class="detail-status">
							<text class="iconfont" :class="getDayIconClass(selectedDay)" :style="getDayIconStyle(selectedDay)"></text>
							<text class="status-text">{{getDayStatusText(selectedDay)}}</text>
						</view>
						<view class="detail-actions" v-if="canModifyDay(selectedDay)">
							<button class="detail-btn taken-btn" :style="takenBtnStyle" @click="recordTaken(true, selectedDay)">
								已服用
							</button>
							<button class="detail-btn missed-btn" @click="recordTaken(false, selectedDay)">
								未服用
							</button>
							<button class="detail-btn clear-btn" @click="clearRecord(selectedDay)" v-if="selectedDay.status">
								清除记录
							</button>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 说明弹窗 -->
		<view class="modal-overlay" v-if="showInfoModal" @click="closeInfoModal">
			<view class="modal-content info-modal" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">服用说明</text>
					<view class="modal-close" @click="closeInfoModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="info-section">
						<view class="info-item">
							<text class="iconfont icon-drug-full info-icon taken-color"></text>
							<text class="info-text">已服用 - 按时服药</text>
						</view>
						<view class="info-item">
							<text class="iconfont icon-yaowan info-icon pending-color"></text>
							<text class="info-text">待服用 - 今日还未记录</text>
						</view>
						<view class="info-item">
							<text class="iconfont icon-jinggao info-icon warning-color"></text>
							<text class="info-text">未服用 - 忘记服药或主动跳过</text>
						</view>
					</view>
					<view class="rules-section">
						<text class="rules-title">服用规则</text>
						<text class="rules-text">• 21+7 规律：连续服用21天，停药7天</text>
						<text class="rules-text">• 每天固定时间服用，误差不超过3小时</text>
						<text class="rules-text">• 漏服不超过48小时可补服</text>
						<text class="rules-text">• 停药期结束后开始新周期</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 新周期设置弹窗 -->
		<view class="modal-overlay" v-if="showNewCycleModal" @click="closeNewCycleModal">
			<view class="modal-content new-cycle-modal" @click.stop>
				<view class="modal-header" :style="currentThemeStyles">
					<text class="modal-title">开始新的服药周期</text>
					<view class="modal-close" @click="closeNewCycleModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="cycle-setup">
						<view class="setup-section">
							<text class="setup-label">选择周期开始日期</text>
							<picker mode="date" :value="newCycleStartDate" @change="onDateChange" :start="minDate" :end="maxDate">
								<view class="date-picker">
									<text class="date-text">{{formatDisplayDate(newCycleStartDate)}}</text>
									<text class="iconfont icon-youjiantou picker-icon"></text>
								</view>
							</picker>
						</view>

						<view class="setup-section">
							<text class="setup-description">
								• 如果选择今天之前的日期，系统将按照21+7规律计算到今天应有的服药状态
								<br>• 如果选择今天之后的日期，将预设未来的服药计划
								<br>• 建议选择实际开始服药的日期以获得准确的记录
							</text>
						</view>

						<view class="setup-actions">
							<button class="setup-btn confirm-btn" :style="takenBtnStyle" @click="confirmNewCycle">
								<text class="btn-icon">✓</text>
								<text class="btn-text">开始周期</text>
							</button>
							<button class="setup-btn cancel-btn" @click="closeNewCycleModal">
								取消
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
				currentDate: new Date(),
				viewDate: new Date(), // 当前查看的月份
				selectedDay: {},
				showDetailModal: false,
				showInfoModal: false,
				showNewCycleModal: false, // 新周期设置弹窗可见性
				weekDays: ['日', '一', '二', '三', '四', '五', '六'],
				sideNavVisible: false, // 侧边导航栏可见性

				// 周期数据
				cycleStartDate: null, // 当前周期开始日期
				newCycleStartDate: new Date(), // 新周期开始日期
				records: {}, // 服药记录 格式: {'2025-09-22': true/false}

				// 主题相关
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
				},

				// 日期限制
				minDate: '',
				maxDate: ''
			}
		},
		computed: {
			// 当前主题样式
			currentThemeStyles() {
				const colors = this.themeColors[this.currentTheme]
				return {
					background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
				}
			},

			// 今日状态
			todayStatus() {
				const today = this.formatDate(this.currentDate)
				const cycleDay = this.getCycleDay(this.currentDate)

				if (cycleDay === null) return 'no-cycle'
				if (cycleDay > 21) return 'break-period' // 停药期

				const hasRecord = this.records.hasOwnProperty(today)
				const isOverdue = this.isOverdue(this.currentDate)

				if (!hasRecord && !isOverdue) return 'pending' // 今天待服用
				if (!hasRecord && isOverdue) return 'overdue' // 已过期未记录
				if (hasRecord && this.records[today]) return 'taken' // 已服用
				if (hasRecord && !this.records[today]) return 'missed' // 未服用

				return 'pending'
			},

			// 今日图标类名
			todayIconClass() {
				switch(this.todayStatus) {
					case 'taken': return 'icon-drug-full'
					case 'pending': return 'icon-yaowan'
					case 'overdue':
					case 'missed': return 'icon-jinggao'
					default: return 'icon-yaowan'
				}
			},

			// 今日图标样式
			todayIconStyle() {
				const colors = this.themeColors[this.currentTheme]
				switch(this.todayStatus) {
					case 'taken': return { color: colors.primary, fontSize: '48rpx' }
					case 'pending': return { color: '#ffa726', fontSize: '48rpx' }
					case 'overdue':
					case 'missed': return { color: '#ef5350', fontSize: '48rpx' }
					default: return { color: '#9e9e9e', fontSize: '48rpx' }
				}
			},

			// 今日状态标题
			todayStatusTitle() {
				switch(this.todayStatus) {
					case 'taken': return '今日已服用'
					case 'pending': return '今日待服用'
					case 'overdue': return '已过期未记录'
					case 'missed': return '今日未服用'
					case 'break-period': return '停药期'
					default: return '未开始周期'
				}
			},

			// 今日状态描述
			todayStatusDesc() {
				switch(this.todayStatus) {
					case 'taken': return '按时服药，保持良好习惯'
					case 'pending': return '请按时服用今日药丸'
					case 'overdue': return '可以补充记录服药情况'
					case 'missed': return '明日请按时服用'
					case 'break-period': return '正在停药期，无需服药'
					default: return '点击开始新的服药周期'
				}
			},

			// 周期信息
			cycleInfo() {
				if (!this.cycleStartDate) return '未开始周期'

				const cycleDay = this.getCycleDay(this.currentDate)
				if (cycleDay === null) return '周期已结束'

				if (cycleDay <= 21) {
					return `服药期第 ${cycleDay} 天 (共21天)`
				} else {
					return `停药期第 ${cycleDay - 21} 天 (共7天)`
				}
			},

			// 是否显示今日操作
			shouldShowTodayAction() {
				return this.todayStatus === 'pending' || this.todayStatus === 'overdue'
			},

			// 已服用按钮样式
			takenBtnStyle() {
				const colors = this.themeColors[this.currentTheme]
				return {
					background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
				}
			},

			// 当前月份标题
			currentMonthTitle() {
				const year = this.viewDate.getFullYear()
				const month = this.viewDate.getMonth() + 1
				return `${year}年${month}月`
			},

			// 日历天数数组
			calendarDays() {
				const year = this.viewDate.getFullYear()
				const month = this.viewDate.getMonth()

				// 当月第一天
				const firstDay = new Date(year, month, 1)

				// 日历开始日期（可能包含上月末尾几天）
				const startDate = new Date(firstDay)
				startDate.setDate(startDate.getDate() - firstDay.getDay())

				// 生成6周的日历
				const weeks = []
				const currentDate = new Date(startDate)

				for (let week = 0; week < 6; week++) {
					const days = []
					for (let day = 0; day < 7; day++) {
						const date = currentDate.getDate()
						const isCurrentMonth = currentDate.getMonth() === month
						const dateStr = this.formatDate(currentDate)

						days.push({
							date,
							dateStr,
							isCurrentMonth,
							fullDate: new Date(currentDate),
							status: this.getDayStatus(currentDate)
						})

						currentDate.setDate(currentDate.getDate() + 1)
					}
					weeks.push(days)
				}

				return weeks
			},

			// 当前周期统计
			currentCycleStats() {
				if (!this.cycleStartDate) {
					return { taken: 0, missed: 0, remaining: 0 }
				}

				let taken = 0
				let missed = 0

				// 计算当前周期的服药情况
				const startDate = new Date(this.cycleStartDate)
				for (let i = 0; i < 21; i++) {
					const date = new Date(startDate)
					date.setDate(date.getDate() + i)
					const dateStr = this.formatDate(date)

					if (this.records.hasOwnProperty(dateStr)) {
						if (this.records[dateStr]) {
							taken++
						} else {
							missed++
						}
					}
				}

				const cycleDay = this.getCycleDay(this.currentDate)
				const remaining = cycleDay && cycleDay <= 21 ? 21 - cycleDay + 1 : 0

				return { taken, missed, remaining }
			}
		},

		onLoad() {
			this.getSystemInfo()
			this.loadTheme()
			this.loadData()
			// 记录当前使用的页面
			this.recordCurrentPage()
		},

		onShow() {
			// 页面显示时记录当前使用的页面
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

			// 加载数据
			loadData() {
				try {
					const savedRecords = uni.getStorageSync('pillRecords')
					const savedCycleStart = uni.getStorageSync('pillCycleStart')

					if (savedRecords) {
						this.records = savedRecords
					}

					if (savedCycleStart) {
						this.cycleStartDate = new Date(savedCycleStart)
					}
				} catch (e) {
					console.log('加载数据失败:', e)
				}
			},

			// 保存数据
			saveData() {
				try {
					uni.setStorageSync('pillRecords', this.records)
					if (this.cycleStartDate) {
						uni.setStorageSync('pillCycleStart', this.cycleStartDate.toISOString())
					}
				} catch (e) {
					console.log('保存数据失败:', e)
				}
			},

			// 格式化日期
			formatDate(date) {
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				return `${year}-${month}-${day}`
			},

			// 格式化显示用日期
			formatDisplayDate(date) {
				const d = new Date(date)
				const year = d.getFullYear()
				const month = d.getMonth() + 1
				const day = d.getDate()
				return `${year}年${month}月${day}日`
			},

			// 获取周期天数
			getCycleDay(date) {
				if (!this.cycleStartDate) return null

				const diffTime = date.getTime() - this.cycleStartDate.getTime()
				const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

				if (diffDays < 1) return null

				// 计算在28天周期中的位置
				return ((diffDays - 1) % 28) + 1
			},

			// 判断是否过期
			isOverdue(date) {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const targetDate = new Date(date)
				targetDate.setHours(0, 0, 0, 0)
				return targetDate < today
			},

			// 获取某天的状态
			getDayStatus(date) {
				const cycleDay = this.getCycleDay(date)
				if (cycleDay === null || cycleDay > 21) return null

				const dateStr = this.formatDate(date)
				const hasRecord = this.records.hasOwnProperty(dateStr)
				const isOverdue = this.isOverdue(date)

				if (!hasRecord && !isOverdue) return 'pending'
				if (!hasRecord && isOverdue) return 'overdue'
				if (hasRecord && this.records[dateStr]) return 'taken'
				if (hasRecord && !this.records[dateStr]) return 'missed'

				return null
			},

			// 获取日期单元格样式类
			getDayCellClass(day) {
				const classes = ['date-cell']

				if (!day.isCurrentMonth) {
					classes.push('other-month')
					return classes
				}

				// 判断是否是今天
				const today = this.formatDate(this.currentDate)
				if (day.dateStr === today) {
					classes.push('today')
				}

				// 添加状态样式
				if (day.status) {
					classes.push(`status-${day.status}`)
				}

				return classes
			},

			// 获取日期图标类名
			getDayIconClass(day) {
				if (!day.status) return ''

				switch(day.status) {
					case 'taken': return 'icon-drug-full'
					case 'pending': return 'icon-yaowan'
					case 'overdue':
					case 'missed': return 'icon-jinggao'
					default: return ''
				}
			},

			// 获取日期图标样式
			getDayIconStyle(day) {
				if (!day.status) return {}

				switch(day.status) {
					case 'taken': return { color: '#4ecdc4' }
					case 'pending': return { color: '#ffa726' }
					case 'overdue':
					case 'missed': return { color: '#ef5350' }
					default: return {}
				}
			},

			// 获取日期状态文本
			getDayStatusText(day) {
				switch(day.status) {
					case 'taken': return '已服用'
					case 'pending': return '待服用'
					case 'overdue': return '已过期未记录'
					case 'missed': return '未服用'
					default: return '无需服药'
				}
			},

			// 判断是否可以修改某天的记录
			canModifyDay(day) {
				if (!day.isCurrentMonth) return false
				const cycleDay = this.getCycleDay(day.fullDate)
				return cycleDay !== null && cycleDay <= 21
			},

			// 记录服药情况
			recordTaken(taken, day = null) {
				const targetDate = day ? day.fullDate : this.currentDate
				const dateStr = this.formatDate(targetDate)

				// 如果还没有开始周期，则开始新周期
				if (!this.cycleStartDate) {
					this.startNewCycle(targetDate)
				}

				this.records[dateStr] = taken
				this.saveData()

				if (day) {
					day.status = this.getDayStatus(day.fullDate)
					this.closeDetailModal()
				}

				uni.showToast({
					title: taken ? '已记录服用' : '已记录未服用',
					icon: 'success',
					duration: 1500
				})
			},

			// 清除记录
			clearRecord(day) {
				const dateStr = this.formatDate(day.fullDate)
				delete this.records[dateStr]
				this.saveData()

				day.status = this.getDayStatus(day.fullDate)
				this.closeDetailModal()

				uni.showToast({
					title: '已清除记录',
					icon: 'success',
					duration: 1500
				})
			},

			// 开始新周期
			startNewCycle(startDate) {
				this.cycleStartDate = new Date(startDate)
				this.cycleStartDate.setHours(0, 0, 0, 0)
				this.saveData()
			},

			// 选择日期
			selectDay(day) {
				if (!day.isCurrentMonth) return

				this.selectedDay = day
				this.showDetailModal = true
			},

			// 上一月
			prevMonth() {
				this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1)
			},

			// 下一月
			nextMonth() {
				this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1)
			},

			// 关闭详情弹窗
			closeDetailModal() {
				this.showDetailModal = false
				this.selectedDay = {}
			},

			// 显示说明
			showInfo() {
				this.showInfoModal = true
			},

			// 关闭说明弹窗
			closeInfoModal() {
				this.showInfoModal = false
			},

			// 显示新周期设置弹窗
			showNewCycle() {
				// 设置日期选择器的范围
				const today = new Date()
				const oneMonthAgo = new Date(today)
				oneMonthAgo.setMonth(today.getMonth() - 1)
				const oneMonthLater = new Date(today)
				oneMonthLater.setMonth(today.getMonth() + 1)

				this.minDate = this.formatDate(oneMonthAgo)
				this.maxDate = this.formatDate(oneMonthLater)
				this.newCycleStartDate = this.formatDate(today) // 默认选择今天
				this.showNewCycleModal = true
			},

			// 关闭新周期设置弹窗
			closeNewCycleModal() {
				this.showNewCycleModal = false
			},

			// 日期改变处理
			onDateChange(event) {
				this.newCycleStartDate = event.detail.value
			},

			// 确认开始新周期
			confirmNewCycle() {
				const selectedDate = new Date(this.newCycleStartDate)
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				selectedDate.setHours(0, 0, 0, 0)

				// 清除之前的记录
				this.records = {}

				// 如果选择的是过去的日期，需要根据21+7规律生成理想的服药记录
				if (selectedDate < today) {
					this.generatePastRecords(selectedDate, today)
				}

				// 开始新周期
				this.startNewCycle(selectedDate)

				uni.showToast({
					title: '已开始新的服药周期',
					icon: 'success',
					duration: 1500
				})

				this.closeNewCycleModal()
			},

			// 生成过去的理想服药记录
			generatePastRecords(startDate, endDate) {
				const currentDate = new Date(startDate)
				let dayCount = 1

				while (currentDate <= endDate) {
					const dateStr = this.formatDate(currentDate)
					const cycleDay = ((dayCount - 1) % 28) + 1

					// 只在服药期（前21天）生成记录
					if (cycleDay <= 21) {
						// 模拟理想的服药情况，偶尔有少量漏服
						const shouldTake = Math.random() > 0.05 // 95%的概率按时服药
						this.records[dateStr] = shouldTake
					}

					currentDate.setDate(currentDate.getDate() + 1)
					dayCount++
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

			// 处理导航点击
			handleNavigation(type) {
				// 先关闭侧边栏
				this.hideSideNav()

				// 延迟一点执行跳转，确保侧边栏动画完成
				setTimeout(() => {
					switch(type) {
						case 'cards':
							// 跳转到恋爱卡片页面，使用reLaunch替换当前页面栈
							uni.reLaunch({
								url: '/pages/index/index'
							})
							break
						case 'pills':
							// 当前就是药丸记录页面
							uni.showToast({
								title: '当前页面',
								icon: 'none',
								duration: 1500
							})
							break
					}
				}, 200)
			},

			// 返回
			goBack() {
				uni.navigateBack()
			},

			// 记录当前使用的页面
			recordCurrentPage() {
				try {
					uni.setStorageSync('lastUsedPage', 'pills')
				} catch (e) {
					console.log('记录页面失败:', e)
				}
			},

			// 处理状态卡片点击
			handleStatusCardClick() {
				// 如果未开始周期，显示新周期设置弹窗
				if (this.todayStatus === 'no-cycle') {
					this.showNewCycle()
				} else {
					// 其他状态显示提示
					let message = ''
					switch(this.todayStatus) {
						case 'taken':
							message = '今日已按时服药，继续保持！'
							break
						case 'pending':
							message = '请及时服用今日药丸'
							break
						case 'overdue':
							message = '可以补充记录服药情况'
							break
						case 'missed':
							message = '明日请按时服用'
							break
						case 'break-period':
							message = '正在停药期，请按计划停药'
							break
						default:
							message = '点击查看状态详情'
							break
					}

					uni.showToast({
						title: message,
						icon: 'none',
						duration: 2000
					})
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

	.more-btn, .info-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.more-btn:active, .info-btn:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.05);
	}

	.more-icon, .info-icon {
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

	/* 状态卡片 */
	.status-card {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		color: white;
		display: flex;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(78, 205, 196, 0.4);
	}

	.status-icon {
		margin-right: 24rpx;
	}

	.status-info {
		flex: 1;
	}

	.status-title {
		font-size: 32rpx;
		font-weight: 600;
		display: block;
		margin-bottom: 8rpx;
	}

	.status-desc {
		font-size: 24rpx;
		opacity: 0.9;
		display: block;
		margin-bottom: 8rpx;
	}

	.cycle-info {
		font-size: 22rpx;
		opacity: 0.8;
		display: block;
	}

	/* 今日操作区 */
	.today-action {
		background: white;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	.action-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 20rpx;
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.action-btn {
		flex: 1;
		height: 80rpx;
		border: none;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.taken-btn {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
	}

	.missed-btn {
		background: #ef5350;
		color: white;
	}

	.action-btn:active {
		transform: translateY(2rpx);
	}

	.btn-icon {
		font-size: 24rpx;
		margin-right: 8rpx;
	}

	/* 日历区域 */
	.calendar-section {
		background: white;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	.calendar-header {
		margin-bottom: 24rpx;
	}

	.month-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.nav-btn:active {
		background: rgba(0,0,0,0.05);
		transform: scale(0.9);
	}

	.month-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #495057;
	}

	.calendar-grid {
		width: 100%;
	}

	.weekday-row {
		display: flex;
		margin-bottom: 16rpx;
	}

	.weekday {
		flex: 1;
		text-align: center;
		font-size: 24rpx;
		color: #6c757d;
		font-weight: 500;
		padding: 8rpx 0;
	}

	.date-row {
		display: flex;
		margin-bottom: 8rpx;
	}

	.date-cell {
		flex: 1;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		transition: all 0.2s ease;
		position: relative;
		margin: 2rpx;
	}

	.date-cell:active {
		background: rgba(0,0,0,0.05);
		transform: scale(0.9);
	}

	.date-cell.today {
		background: rgba(78, 205, 196, 0.1);
		border: 2rpx solid #4ecdc4;
	}

	.date-number {
		font-size: 26rpx;
		color: #495057;
		font-weight: 500;
		margin-bottom: 4rpx;
	}

	.date-number.other-month {
		color: #adb5bd;
	}

	.date-status {
		font-size: 20rpx;
		line-height: 1;
	}

	/* 统计区域 */
	.stats-section {
		background: white;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
	}

	.stats-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 20rpx;
	}

	.stats-grid {
		display: flex;
		justify-content: space-around;
	}

	.stat-item {
		text-align: center;
	}

	.stat-number {
		font-size: 36rpx;
		font-weight: 700;
		color: #4ecdc4;
		display: block;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-size: 24rpx;
		color: #6c757d;
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

	.info-modal {
		max-width: 700rpx;
	}

	.modal-header {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
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
		font-size: 28rpx;
		color: white;
		font-weight: bold;
	}

	.modal-body {
		padding: 30rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	/* 日期详情 */
	.day-detail {
		text-align: center;
	}

	.detail-status {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}

	.detail-status .iconfont {
		font-size: 32rpx;
		margin-right: 12rpx;
	}

	.status-text {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
	}

	.detail-actions {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.detail-btn {
		height: 72rpx;
		border: none;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.detail-btn.taken-btn {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
	}

	.detail-btn.missed-btn {
		background: #ef5350;
		color: white;
	}

	.detail-btn.clear-btn {
		background: #6c757d;
		color: white;
	}

	.detail-btn:active {
		transform: translateY(2rpx);
	}

	/* 说明弹窗 */
	.info-section {
		margin-bottom: 30rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		padding: 16rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}

	.info-icon {
		font-size: 24rpx;
		margin-right: 16rpx;
		width: 32rpx;
		text-align: center;
	}

	.taken-color {
		color: #4ecdc4;
	}

	.pending-color {
		color: #ffa726;
	}

	.warning-color {
		color: #ef5350;
	}

	.info-text {
		font-size: 26rpx;
		color: #495057;
		flex: 1;
	}

	.rules-section {
		border-top: 1rpx solid #e9ecef;
		padding-top: 24rpx;
	}

	.rules-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		margin-bottom: 16rpx;
		display: block;
	}

	.rules-text {
		font-size: 24rpx;
		color: #6c757d;
		line-height: 1.6;
		margin-bottom: 12rpx;
		display: block;
	}

	/* 新周期设置弹窗样式 */
	.new-cycle-modal {
		width: 100%;
		max-width: 500rpx;
	}

	.cycle-setup {
		padding: 20rpx;
	}

	.setup-section {
		margin-bottom: 24rpx;
	}

	.setup-label {
		font-size: 28rpx;
		font-weight: 600;
		color: #495057;
		display: block;
		margin-bottom: 8rpx;
	}

	.date-picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx;
		border: 1rpx solid #ced4da;
		border-radius: 8rpx;
		background: #f8f9fa;
		cursor: pointer;
	}

	.date-text {
		font-size: 26rpx;
		color: #495057;
	}

	.picker-icon {
		font-size: 24rpx;
		color: #6c757d;
	}

	.setup-description {
		font-size: 24rpx;
		color: #6c757d;
		line-height: 1.6;
		margin-bottom: 24rpx;
		display: block;
	}

	.setup-actions {
		display: flex;
		justify-content: flex-end;
		gap: 16rpx;
	}

	.setup-btn {
		flex: 1;
		height: 56rpx;
		border: none;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #4ecdc4 0%, #2ba3a8 100%);
		color: white;
	}

	.cancel-btn {
		background: #f8f9fa;
		color: #495057;
		border: 1rpx solid #ced4da;
	}

	.setup-btn:active {
		transform: translateY(2rpx);
	}
</style>
