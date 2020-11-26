import localforage from 'localforage'
const VERSION = 'v1'

// 缓存
self.addEventListener('install', function (event) {
  console.log('----------install')
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll([])
    })
  )
})

// 缓存更新
self.addEventListener('activate', function (event) {
  console.log('----------activate')
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        // cacheNames.map(function (cacheName) {
        //   // 如果当前版本和缓存版本不一致
        //   if (cacheName !== VERSION) {
        //     return caches.delete(cacheName)
        //   }
        // })
      )
    })
  )
})

let fetchUrls = []

// 捕获请求并返回缓存数据
self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request).catch(function () {
    return fetch(event.request)
  }).then(function (response) {
    fetchUrls.push(event.request.url)
    // console.log('----------fetch', event.request)
    return fetch(event.request)
    // caches.open(VERSION).then(function (cache) {
    //   cache.put(event.request, response)
    // })
    // return response.clone()
  }).catch(function () {
    return fetch(event.request)
    // return caches.match('./static/mm1.jpg')
  }))
})

function saveFetchUrls () {
  localforage.getItem('fetchUrls').then(function (value) {
    if (!fetchUrls.length) {
      return true
    }

    let result = value || []
    result = Array.from(new Set(result.concat(fetchUrls)))
    fetchUrls = []
    console.log('-------------fetchUrls', result, result.length, value)

    localforage.setItem('fetchUrls', result)
  }).catch(function (err) {
    console.log('localforage error:', err)
  })
}

setInterval(saveFetchUrls, 1000 * 3)
