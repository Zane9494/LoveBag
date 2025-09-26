<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar" :style="{paddingTop: statusBarHeight + 'px'}">
			<view class="navbar-content">
				<view class="back-btn" @click="goBack">
					<text class="iconfont icon-zuojiantou back-icon"></text>
				</view>
				<text class="navbar-title">数独</text>
				<view class="info-btn" @click="showInfo">
					<text class="iconfont icon-gengduo1 info-icon"></text>
				</view>
			</view>
		</view>

		<!-- 游戏区域 -->
		<view class="game-container">
			<!-- 游戏状态区域 -->
			<view class="status-container">
				<view class="status-box">
					<text class="status-label">难度</text>
					<text class="status-value">{{ difficultyText }}</text>
				</view>
				<view class="status-box">
					<text class="status-label">时间</text>
					<text class="status-value">{{ formatTime(gameTime) }}</text>
				</view>
				<view class="status-box">
					<text class="status-label">错误</text>
					<text class="status-value">{{ mistakes }}/3</text>
				</view>
			</view>

			<!-- 控制按钮 -->
			<view class="control-buttons">
				<view class="control-btn" @click="newGame">
					<text class="control-btn-text">新游戏</text>
				</view>
				<view class="control-btn" @click="pauseGame" v-if="!gameStatus">
					<text class="control-btn-text">{{ isPaused ? '继续' : '暂停' }}</text>
				</view>
				<view class="control-btn" @click="showHint" v-if="!gameStatus && !isPaused">
					<text class="control-btn-text">提示</text>
				</view>
			</view>

			<!-- 数独网格 -->
			<view class="sudoku-grid" v-if="!isPaused">
				<view class="grid-row" v-for="(row, rowIndex) in grid" :key="rowIndex">
					<view 
						class="grid-cell" 
						v-for="(cell, colIndex) in row" 
						:key="colIndex"
						:class="getCellClass(rowIndex, colIndex)"
						@click="selectCell(rowIndex, colIndex)"
					>
						<text v-if="cell.value !== 0" class="cell-number" :class="getCellNumberClass(rowIndex, colIndex)">
							{{ cell.value }}
						</text>
					</view>
				</view>
			</view>

			<!-- 暂停界面 -->
			<view class="pause-screen" v-if="isPaused">
				<text class="pause-title">游戏已暂停</text>
				<text class="pause-subtitle">点击继续按钮恢复游戏</text>
			</view>

			<!-- 数字输入面板 -->
			<view class="number-panel" v-if="!gameStatus && !isPaused">
				<view class="panel-row">
					<view 
						class="number-btn" 
						v-for="num in [1,2,3,4,5]" 
						:key="num"
						@click="inputNumber(num)"
						:class="{ 'disabled': isNumberComplete(num) }"
					>
						<text class="number-text">{{ num }}</text>
						<text class="count-text">{{ getNumberCount(num) }}/9</text>
					</view>
				</view>
				<view class="panel-row">
					<view 
						class="number-btn" 
						v-for="num in [6,7,8,9]" 
						:key="num"
						@click="inputNumber(num)"
						:class="{ 'disabled': isNumberComplete(num) }"
					>
						<text class="number-text">{{ num }}</text>
						<text class="count-text">{{ getNumberCount(num) }}/9</text>
					</view>
					<view class="number-btn erase-btn" @click="eraseCell">
						<text class="number-text">×</text>
						<text class="count-text">擦除</text>
					</view>
				</view>
			</view>

			<!-- 游戏完成状态 -->
			<view class="game-complete-info" v-if="gameStatus === 'win'">
				<text class="complete-title">🎉 恭喜完成！</text>
				<text class="complete-subtitle">用时：{{ formatTime(gameTime) }}</text>
				<text class="complete-subtitle">错误：{{ mistakes }}次</text>
			</view>
			
			<!-- 游戏失败状态 -->
			<view class="game-over-info" v-if="gameStatus === 'lose'">
				<text class="game-over-title">😔 游戏结束</text>
				<text class="game-over-subtitle">错误次数过多</text>
			</view>
			
			<!-- 重新开始按钮 -->
			<view class="restart-button-container" v-if="gameStatus">
				<view class="restart-btn" @click="newGame">
					<text class="restart-btn-text">重新开始</text>
				</view>
			</view>
		</view>

		<!-- 游戏说明弹窗 -->
		<view class="modal-overlay" v-if="showInfoModal" @click="closeInfoModal">
			<view class="modal-content info-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">数独游戏说明</text>
					<view class="modal-close" @click="closeInfoModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="info-section">
						<view class="rule-item">
							<text class="rule-title">🎯 游戏目标</text>
							<text class="rule-desc">在9×9的网格中填入数字1-9，使每行、每列和每个3×3宫格都包含1-9的所有数字</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🎮 操作方法</text>
							<text class="rule-desc">• 点击空格选中要填入的位置</text>
							<text class="rule-desc">• 点击下方数字按钮填入数字</text>
							<text class="rule-desc">• 点击擦除按钮清除选中格子的数字</text>
							<text class="rule-desc">• 使用提示功能获得帮助</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">🏆 游戏规则</text>
							<text class="rule-desc">• 每行必须包含1-9的所有数字</text>
							<text class="rule-desc">• 每列必须包含1-9的所有数字</text>
							<text class="rule-desc">• 每个3×3宫格必须包含1-9的所有数字</text>
							<text class="rule-desc">• 错误3次游戏失败</text>
						</view>
						<view class="rule-item">
							<text class="rule-title">💡 游戏技巧</text>
							<text class="rule-desc">• 从数字较多的行、列、宫格开始分析</text>
							<text class="rule-desc">• 使用排除法确定唯一可能的数字</text>
							<text class="rule-desc">• 适当使用提示功能避免错误</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 难度选择弹窗 -->
		<view class="modal-overlay" v-if="showDifficultyModal" @click="closeDifficultyModal">
			<view class="modal-content difficulty-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择难度</text>
					<view class="modal-close" @click="closeDifficultyModal">
						<text class="close-icon">×</text>
					</view>
				</view>
				<view class="modal-body">
					<view class="difficulty-options">
						<view 
							class="difficulty-btn" 
							v-for="level in difficultyLevels" 
							:key="level.key"
							@click="selectDifficulty(level.key)"
						>
							<text class="difficulty-name">{{ level.name }}</text>
							<text class="difficulty-desc">{{ level.desc }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入游戏逻辑
	import { SudokuGame } from './sudoku.js'

	export default {
		data() {
			return {
				statusBarHeight: 0,
				game: null,
				grid: [],
				gameTime: 0,
				timer: null,
				mistakes: 0,
				gameStatus: null, // null, 'win', 'lose'
				isPaused: false,
				selectedRow: -1,
				selectedCol: -1,
				showInfoModal: false,
				showDifficultyModal: false,
				difficulty: 'easy',
				
				difficultyLevels: [
					{ key: 'easy', name: '简单', desc: '45-50个提示数字' },
					{ key: 'medium', name: '中等', desc: '35-40个提示数字' },
					{ key: 'hard', name: '困难', desc: '25-30个提示数字' },
					{ key: 'expert', name: '专家', desc: '17-22个提示数字' }
				]
			}
		},
		
		computed: {
			difficultyText() {
				const level = this.difficultyLevels.find(l => l.key === this.difficulty)
				return level ? level.name : '简单'
			}
		},
		
		onLoad() {
			this.getSystemInfo()
			this.showDifficultyModal = true
		},
		
		onUnload() {
			this.stopTimer()
		},
		
		methods: {
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.statusBarHeight = systemInfo.statusBarHeight || 0
			},
			
			// 初始化游戏
			initGame(difficulty = 'easy') {
				this.game = new SudokuGame(difficulty)
				this.grid = this.game.getGrid()
				this.gameTime = 0
				this.mistakes = 0
				this.gameStatus = null
				this.isPaused = false
				this.selectedRow = -1
				this.selectedCol = -1
				this.difficulty = difficulty
				this.startTimer()
			},
			
			// 开始计时器
			startTimer() {
				this.stopTimer()
				this.timer = setInterval(() => {
					if (!this.isPaused && !this.gameStatus) {
						this.gameTime++
					}
				}, 1000)
			},
			
			// 停止计时器
			stopTimer() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			},
			
			// 格式化时间显示
			formatTime(seconds) {
				const mins = Math.floor(seconds / 60)
				const secs = seconds % 60
				return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
			},
			
			// 选择难度
			selectDifficulty(difficulty) {
				this.closeDifficultyModal()
				this.initGame(difficulty)
			},
			
			// 关闭难度选择弹窗
			closeDifficultyModal() {
				this.showDifficultyModal = false
			},
			
			// 新游戏
			newGame() {
				this.showDifficultyModal = true
			},
			
			// 暂停/继续游戏
			pauseGame() {
				this.isPaused = !this.isPaused
			},
			
			// 选择单元格
			selectCell(row, col) {
				if (this.gameStatus || this.isPaused) return
				if (this.grid[row][col].isFixed) return
				
				this.selectedRow = row
				this.selectedCol = col
				
				// 震动反馈
				uni.vibrateShort({ type: 'light' })
			},
			
			// 输入数字
			inputNumber(number) {
				if (this.selectedRow === -1 || this.selectedCol === -1) {
					uni.showToast({
						title: '请先选择一个空格',
						icon: 'none',
						duration: 1500
					})
					return
				}
				
				const result = this.game.inputNumber(this.selectedRow, this.selectedCol, number)
				this.updateDisplay()
				
				if (!result.valid) {
					this.mistakes++
					uni.vibrateShort({ type: 'heavy' })
					
					// 显示错误提示
					uni.showToast({
						title: '数字冲突！',
						icon: 'none',
						duration: 1000
					})
					
					// 检查是否游戏失败
					if (this.mistakes >= 3) {
						this.gameStatus = 'lose'
						this.stopTimer()
					}
				} else {
					uni.vibrateShort({ type: 'light' })
					
					// 检查是否获胜
					if (this.game.isComplete()) {
						this.gameStatus = 'win'
						this.stopTimer()
						uni.vibrateShort({ type: 'heavy' })
					}
				}
			},
			
			// 擦除单元格
			eraseCell() {
				if (this.selectedRow === -1 || this.selectedCol === -1) {
					uni.showToast({
						title: '请先选择一个格子',
						icon: 'none',
						duration: 1500
					})
					return
				}
				
				this.game.eraseCell(this.selectedRow, this.selectedCol)
				this.updateDisplay()
				uni.vibrateShort({ type: 'light' })
			},
			
			// 显示提示
			showHint() {
				const hint = this.game.getHint()
				if (hint) {
					this.selectedRow = hint.row
					this.selectedCol = hint.col
					
					uni.showModal({
						title: '提示',
						content: `位置(${hint.row + 1}, ${hint.col + 1})可以填入数字${hint.value}`,
						showCancel: true,
						confirmText: '填入',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								this.inputNumber(hint.value)
							}
						}
					})
				} else {
					uni.showToast({
						title: '暂无可用提示',
						icon: 'none',
						duration: 1500
					})
				}
			},
			
			// 更新显示
			updateDisplay() {
				this.grid = this.game.getGrid()
			},
			
			// 获取单元格样式类名
			getCellClass(row, col) {
				const classes = []
				
				// 选中状态
				if (row === this.selectedRow && col === this.selectedCol) {
					classes.push('selected')
				}
				
				// 高亮相关行列和宫格
				if (this.selectedRow !== -1 && this.selectedCol !== -1) {
					if (row === this.selectedRow || col === this.selectedCol) {
						classes.push('highlighted')
					}
					
					// 同一宫格
					const boxRow = Math.floor(row / 3)
					const boxCol = Math.floor(col / 3)
					const selectedBoxRow = Math.floor(this.selectedRow / 3)
					const selectedBoxCol = Math.floor(this.selectedCol / 3)
					if (boxRow === selectedBoxRow && boxCol === selectedBoxCol) {
						classes.push('highlighted')
					}
				}
				
				// 宫格边界
				if (row % 3 === 0 && row !== 0) classes.push('top-border')
				if (col % 3 === 0 && col !== 0) classes.push('left-border')
				
				// 错误状态
				if (this.grid[row] && this.grid[row][col] && this.grid[row][col].isError) {
					classes.push('error')
				}
				
				return classes
			},
			
			// 获取数字样式类名
			getCellNumberClass(row, col) {
				const cell = this.grid[row][col]
				if (!cell) return []
				
				const classes = []
				if (cell.isFixed) classes.push('fixed')
				if (cell.isError) classes.push('error-text')
				
				return classes
			},
			
			// 检查数字是否已完成
			isNumberComplete(number) {
				return this.getNumberCount(number) >= 9
			},
			
			// 获取数字使用次数
			getNumberCount(number) {
				let count = 0
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						if (this.grid[i] && this.grid[i][j] && this.grid[i][j].value === number) {
							count++
						}
					}
				}
				return count
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 显示游戏说明
			showInfo() {
				this.showInfoModal = true
			},
			
			// 关闭游戏说明弹窗
			closeInfoModal() {
				this.showInfoModal = false
			}
		}
	}
</script>

<style>
	@import './sudoku.css';
</style>
