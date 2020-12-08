if ('serviceWorker' in navigator) {
  // 开始注册service workers
  navigator.serviceWorker.register('/sw.user.js', {
    scope: '/'
  }).then(function (registration) {
    console.log('serviceWorker registration success')

    let serviceWorker
    if (registration.installing) {
      serviceWorker = registration.installing
      console.log('serviceWorker installing')
    } else if (registration.waiting) {
      serviceWorker = registration.waiting
      console.log('serviceWorker waiting')
    } else if (registration.active) {
      serviceWorker = registration.active
      console.log('serviceWorker active')
    }
    if (serviceWorker) {
      console.log('serviceWorker state:', serviceWorker.state)
      serviceWorker.addEventListener('statechange', function (e) {
        console.log('&emsp;state cheage to:', e.target.state)
      })
    }
  }).catch(function (error) {
    console.log('serviceWorker registration failed', error)
  })
} else {
  console.log('Your browser does not support service workers')
}
