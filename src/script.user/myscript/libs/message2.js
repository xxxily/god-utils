// 创建消息提示类
class Message {
  static initializedClasses = new Set()

  constructor (options) {
    this.options = options

    // 初始化样式
    if (!Message.initializedClasses.has(this.options.className)) {
      const style = document.createElement('style')
      style.innerHTML = `
        .${this.options.className} {
          position: fixed;
          padding: 10px;
          border-radius: 5px;
          color: white;
          opacity: 0;
          transition: opacity 0.3s, transform 0.3s;
          transform: translateX(100%);
        }
        .${this.options.className}.show {
          opacity: 1;
          transform: translateX(0);
        }
      `
      document.head.appendChild(style)
      Message.initializedClasses.add(this.options.className)
    }
  }

  showMessage (type, message, duration) {
    const msgBox = document.createElement('div')
    msgBox.className = this.options.className + ' ' + type
    msgBox.textContent = message
    msgBox.style.backgroundColor = this.options.colors[type]
    msgBox.style.opacity = this.options.opacity
    msgBox.style.bottom = (this.options.position.bottom + document.getElementsByClassName(this.options.className).length * 50) + 'px'
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
  const msg1 = new Message({
    className: 'god-message',
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

  const msg2 = new Message({
    className: 'god-message2',
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

  msg1.info('这是一条信息消息', 3000)
  msg1.success('这是一条成功消息', 3000)
  msg1.error('这是一条错误消息', 3000)
  msg1.warning('这是一条警告消息', 3000)

  setTimeout(() => {
    msg2.info('这是一条信息消息', 3000)
    msg2.success('这是一条成功消息', 3000)
    msg2.error('这是一条错误消息', 3000)
    msg2.warning('这是一条警告消息', 3000)
  }, 4000)
}

demo()
