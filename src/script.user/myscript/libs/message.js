// 创建样式
const style = document.createElement('style')
style.innerHTML = `
  .message {
    position: fixed;
    padding: 10px;
    border-radius: 5px;
    color: white;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    transform: translateX(100%);
  }
  .message.show {
    opacity: 1;
    transform: translateX(0);
  }
`
document.head.appendChild(style)

// 创建消息提示类
class Message {
  constructor (options) {
    this.options = options
    this.queue = []
    this.isShowingMessage = false
  }

  showMessage (type, message, duration) {
    this.queue.push({ type, message, duration })

    if (!this.isShowingMessage) {
      this.showNextMessage()
    }
  }

  showNextMessage () {
    if (this.queue.length === 0) {
      this.isShowingMessage = false
      return
    }

    this.isShowingMessage = true
    const { type, message, duration } = this.queue.shift()
    const msgBox = document.createElement('div')
    msgBox.className = 'message ' + type
    msgBox.textContent = message
    msgBox.style.backgroundColor = this.options.colors[type]
    msgBox.style.opacity = this.options.opacity
    msgBox.style.bottom = this.options.position.bottom + 'px'
    msgBox.style.right = this.options.position.right + 'px'
    document.body.appendChild(msgBox)

    // 显示消息提示框
    setTimeout(function () {
      msgBox.classList.add('show')
    }, 0)

    // duration毫秒后隐藏消息提示框
    setTimeout(() => {
      msgBox.classList.remove('show')

      // 完全隐藏后移除元素
      setTimeout(() => {
        document.body.removeChild(msgBox)
        this.showNextMessage()
      }, 500)
    }, duration)
  }

  info (message, duration) {
    this.showMessage('info', message, duration)
  }

  success (message, duration) {
    this.showMessage('success', message, duration)
  }

  error (message, duration) {
    this.showMessage('error', message, duration)
  }

  warning (message, duration) {
    this.showMessage('warning', message, duration)
  }
}

function demo () {
  const msg = new Message({
    colors: {
      info: '#2196F3',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800'
    },
    opacity: '0.8',
    position: {
      bottom: 20,
      right: 20
    }
  })

  msg.info('这是一条信息消息', 3000)
  msg.success('这是一条成功消息', 3000)
  msg.error('这是一条错误消息', 3000)
  msg.warning('这是一条警告消息', 3000)
}
demo()
