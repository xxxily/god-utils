// ==UserScript==
// @name         网页访问加速器
// @name:en      Web Access Accelerator
// @name:zh      网页访问加速器
// @name:zh-TW   網頁訪問加速器
// @name:ja      ウェブ アクセス アクセラレータ
// @name:ko      웹 액세스 가속기
// @name:de      Webzugriffsbeschleuniger
// @namespace    https://github.com/xxxily
// @version      2.3.0
// @description  基于谷歌quicklink的网页访问加速器，加快网页打开速度，提升浏览体验
// @description:en Web page access accelerator based on Google quicklink to speed up the opening of web pages and improve browsing experience
// @description:zh 基于谷歌quicklink的网页访问加速器，加快网页打开速度，提升浏览体验
// @description:zh-TW  基於谷歌quicklink的網頁訪問加速器，加快網頁打開速度，提升瀏覽體驗
// @description:ja  Google クイックリンクに基づく Web ページ アクセス アクセラレータで、Web ページを開く速度を上げ、ブラウジング エクスペリエンスを向上させます
// @description:ko  웹 페이지 열기 속도를 높이고 브라우징 경험을 개선하기 위한 Google 퀵링크 기반 웹 페이지 액세스 가속기
// @description:de  Beschleuniger für den Zugriff auf Webseiten, basierend auf Google Quicklink, um das Öffnen von Webseiten zu beschleunigen und das Surferlebnis zu verbessern
// @author       ankvps
// @icon         https://lh3.googleusercontent.com/5b2IeKOldW9hxPQaV7oyRfdAgN2V7Ot1bGcpE4QT5Uq4yt7yNtdgh0ABq4NCEwvsDdEU4HWKVXwUjYuem2JyJ_JrSu8=w128-h128-e365-rj-sc0x00ffffff
// @match        *://*/*
// @grant        none
// @license      Apache License 2.0
// @run-at       document-start
// ==/UserScript==
/* eslint-disable */
(function (w) { if (w) { w.name = 'quicklink-user-script' } })()

/**
 * Quicklink 2.3.0
 * 官网地址：https://getquick.link/
 * 项目地址：https://github.com/GoogleChromeLabs/quicklink
 * 源码CDN：https://unpkg.com/quicklink@2.3.0/dist/quicklink.umd.js
 */
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(e.quicklink={})}(this,function(e){function n(e){return new Promise(function(n,r,t){(t=new XMLHttpRequest).open("GET",e,t.withCredentials=!0),t.onload=function(){200===t.status?n():r()},t.send()})}var r,t=(r=document.createElement("link")).relList&&r.relList.supports&&r.relList.supports("prefetch")?function(e){return new Promise(function(n,r,t){(t=document.createElement("link")).rel="prefetch",t.href=e,t.onload=n,t.onerror=r,document.head.appendChild(t)})}:n,o=window.requestIdleCallback||function(e){var n=Date.now();return setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-n))}})},1)},i=new Set,c=new Set,u=!1;function a(e){if(e){if(e.saveData)return new Error("Save-Data is enabled");if(/2g/.test(e.effectiveType))return new Error("network conditions are poor")}return!0}function s(e,r,o){var s=a(navigator.connection);return s instanceof Error?Promise.reject(new Error("Cannot prefetch, "+s.message)):(c.size>0&&!u&&console.warn("[Warning] You are using both prefetching and prerendering on the same document"),Promise.all([].concat(e).map(function(e){if(!i.has(e))return i.add(e),(r?function(e){return window.fetch?fetch(e,{credentials:"include"}):n(e)}:t)(new URL(e,location.href).toString())})))}function f(e,n){var r=a(navigator.connection);if(r instanceof Error)return Promise.reject(new Error("Cannot prerender, "+r.message));if(!HTMLScriptElement.supports("speculationrules"))return s(e),Promise.reject(new Error("This browser does not support the speculation rules API. Falling back to prefetch."));if(document.querySelector('script[type="speculationrules"]'))return Promise.reject(new Error("Speculation Rules is already defined and cannot be altered."));for(var t=0,o=[].concat(e);t<o.length;t+=1){var f=o[t];if(window.location.origin!==new URL(f,window.location.href).origin)return Promise.reject(new Error("Only same origin URLs are allowed: "+f));c.add(f)}i.size>0&&!u&&console.warn("[Warning] You are using both prefetching and prerendering on the same document");var l=function(e){var n=document.createElement("script");n.type="speculationrules",n.text='{"prerender":[{"source": "list","urls": ["'+Array.from(e).join('","')+'"]}]}';try{document.head.appendChild(n)}catch(e){return e}return!0}(c);return!0===l?Promise.resolve():Promise.reject(l)}e.listen=function(e){if(e||(e={}),window.IntersectionObserver){var n=function(e){e=e||1;var n=[],r=0;function t(){r<e&&n.length>0&&(n.shift()(),r++)}return[function(e){n.push(e)>1||t()},function(){r--,t()}]}(e.throttle||1/0),r=n[0],t=n[1],a=e.limit||1/0,l=e.origins||[location.hostname],d=e.ignores||[],h=e.delay||0,p=[],m=e.timeoutFn||o,w="function"==typeof e.hrefFn&&e.hrefFn,g=e.prerender||!1;u=e.prerenderAndPrefetch||!1;var v=new IntersectionObserver(function(n){n.forEach(function(n){if(n.isIntersecting)p.push((n=n.target).href),function(e,n){n?setTimeout(e,n):e()}(function(){-1!==p.indexOf(n.href)&&(v.unobserve(n),(u||g)&&c.size<1?f(w?w(n):n.href).catch(function(n){if(!e.onError)throw n;e.onError(n)}):i.size<a&&!g&&r(function(){s(w?w(n):n.href,e.priority).then(t).catch(function(n){t(),e.onError&&e.onError(n)})}))},h);else{var o=p.indexOf((n=n.target).href);o>-1&&p.splice(o)}})},{threshold:e.threshold||0});return m(function(){(e.el||document).querySelectorAll("a").forEach(function(e){l.length&&!l.includes(e.hostname)||function e(n,r){return Array.isArray(r)?r.some(function(r){return e(n,r)}):(r.test||r).call(r,n.href,n)}(e,d)||v.observe(e)})},{timeout:e.timeout||2e3}),function(){i.clear(),v.disconnect()}}},e.prefetch=s,e.prerender=f});