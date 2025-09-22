<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查上次使用的页面
			this.checkLastUsedPage()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			checkLastUsedPage() {
				try {
					const lastUsedPage = uni.getStorageSync('lastUsedPage')
					console.log('上次使用的页面:', lastUsedPage)

					// 如果有记录且不是默认首页，则跳转
					if (lastUsedPage && lastUsedPage !== 'index') {
						setTimeout(() => {
							let targetUrl = ''
							switch(lastUsedPage) {
								case 'pills':
									targetUrl = '/pages/pills/pills'
									break
								case 'cards':
								default:
									targetUrl = '/pages/index/index'
									break
							}

							if (targetUrl && targetUrl !== '/pages/index/index') {
								uni.redirectTo({
									url: targetUrl,
									success: function(res) {
										console.log('跳转到上次使用页面成功:', targetUrl)
									},
									fail: function(err) {
										console.error('跳转到上次使用页面失败:', err)
									}
								})
							}
						}, 100) // 延迟一点确保应用完全启动
					}
				} catch (e) {
					console.log('检查上次使用页面失败:', e)
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url('./static/iconfont/iconfont.css');
</style>
