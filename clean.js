(function () {
  // 添加调试日志，帮助找出问题
  console.log("clean.js 已加载");
  
  // 检查URL参数
  const url = new URL(window.location.href);
  const cleanMode = url.searchParams.get("clean_player") === "true";
  
  console.log("URL参数检查:", { 
    fullUrl: window.location.href,
    cleanMode: cleanMode,
    hasCleanParam: url.searchParams.has("clean_player"),
    cleanParamValue: url.searchParams.get("clean_player")
  });
  
  // 如果不是通过插件打开的，则不执行清理
  if (!cleanMode) {
    console.log("不是通过插件打开的页面，clean.js 将不执行清理");
    return;
  }

  console.log("通过插件打开的页面，准备执行清理");

  function getQueryParam(name) {
    return decodeURIComponent(url.searchParams.get(name) || "");
  }

  function waitForPlayerToLoad() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60; // 最多尝试30秒 (60 * 500ms)
      
      const checkPlayer = () => {
        attempts++;
        console.log(`检查播放器加载情况，尝试次数: ${attempts}`);
        
        const player = document.querySelector(".bpx-player-container");
        if (player) {
          // 确保视频元素存在
          const video = player.querySelector("video") || document.querySelector("video");
          if (video) {
            console.log("播放器和视频元素已找到!");
            resolve(true);
            return;
          }
        }
        
        if (attempts >= maxAttempts) {
          console.log("达到最大尝试次数，未能找到完整播放器");
          resolve(false);
          return;
        }
        
        setTimeout(checkPlayer, 500);
      };
      
      checkPlayer();
    });
  }

  async function cleanPage() {
    console.log("开始清理页面...");
    
    // 等待播放器完全加载
    const playerLoaded = await waitForPlayerToLoad();
    if (!playerLoaded) {
      console.error("无法找到播放器，清理操作终止");
      return;
    }
    
    // 获取播放器相关元素
    const playerContainer = document.querySelector(".bpx-player-container");
    if (!playerContainer) {
      console.error("找不到播放器容器，清理操作终止");
      return;
    }
    
    console.log("播放器容器已找到:", playerContainer);
    const sendingArea = document.querySelector('.bpx-player-sending-area');
    if (sendingArea) {
      sendingArea.remove();
    }
    // 尝试找到播放器的父级容器
    const possibleParents = [
      document.querySelector(".bpx-player-primary-area"),
      document.querySelector(".bpx-player-control-bottom"),
      document.querySelector(".player-container"),
      document.querySelector(".bpx-player"),
      playerContainer.parentElement
    ];
    
    const playerArea = possibleParents;
    console.log("使用播放器区域:", playerArea);
    
    // 获取视频元素
    const videoElement = document.querySelector("video");
    if (videoElement) {
      console.log("视频元素已找到:", videoElement);
    } else {
      console.warn("未找到视频元素");
    }
    
    // 获取自定义标题
    const titleText = getQueryParam("title") || document.title || "Bilibili Player";
    console.log("设置标题为:", titleText);
    
    // 创建一个新的容器
    const wrapper = document.createElement("div");
    wrapper.id = "clean-player-wrapper";
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: #000;
      margin: 0;
      padding: 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    // 将包装器添加到文档中
    document.body.appendChild(wrapper);
    console.log("创建并添加了播放器包装容器");
    
    try {
      // 调整播放器样式并移动到新容器
      playerArea.style.cssText = `
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
      `;
      wrapper.appendChild(playerArea);
      console.log("成功将播放器区域移动到新容器");
    } catch (error) {
      console.error("移动播放器区域时出错:", error);
      
      // 备用方案：如果移动失败，尝试直接操作播放器容器
      try {
        playerContainer.style.cssText = `
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        `;
        wrapper.appendChild(playerContainer);
        console.log("使用备用方案：成功将播放器容器移动到新容器");
      } catch (backupError) {
        console.error("备用方案也失败:", backupError);
      }
    }
    
    // 隐藏所有其他元素
    console.log("开始隐藏其他页面元素");
    Array.from(document.body.children).forEach(child => {
      if (child !== wrapper) {
        child.style.display = "none";
        console.log("隐藏了元素:", child);
      }
    });
    
    // 设置标题
    document.title = titleText;
    
    // 设置favicon
    try {
       const svgIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g>
          <path fill="none" d="M0 0h24v24H0z"/>
          <path fill-rule="nonzero" d="M9 8.482v7.036L15.03 12 9 8.482zM7.752 5.44l10.508 6.13a.5.5 0 0 1 0 .863l-10.508 6.13A.5.5 0 0 1 7 18.128V5.871a.5.5 0 0 1 .752-.432z"/>
      </g>
  </svg>
  `;
      // const iconUrl = chrome.runtime.getURL("colors.svg");
      const iconUrl =`data:image/svg+xml;utf8,${encodeURIComponent(svgIcon)}`;
      document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = iconUrl;
      document.head.appendChild(link);
      console.log("设置了自定义图标");
    } catch (iconError) {
      console.error("设置图标时出错:", iconError);
    }
    
    // 尝试播放视频
    if (videoElement) {
      // 添加视频事件监听
      videoElement.addEventListener('error', (e) => {
        console.error('视频加载错误:', e);
      });
      
      console.log("设置了视频事件监听器");
      
      // 200ms后尝试播放视频（给UI更新一些时间）
      setTimeout(() => {
        try {
          console.log("尝试播放视频");
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log("视频开始播放");
            }).catch(error => {
              console.log('自动播放被阻止:', error);
              // 创建一个播放按钮
              const playButton = document.createElement('button');
              playButton.textContent = '点击播放';
              playButton.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 10px 20px;
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                z-index: 10000;
              `;
              wrapper.appendChild(playButton);
              playButton.onclick = () => {
                videoElement.play().then(() => {
                  console.log("通过按钮触发播放成功");
                }).catch(e => {
                  console.error("通过按钮触发播放失败:", e);
                });
                playButton.remove();
              };
              console.log("创建了播放按钮");
            });
          }
        } catch (e) {
          console.error('播放视频时出错:', e);
        }
      }, 200);
    }
    
    console.log("清理页面完成");
  }

  // 立即执行一次检查，不等待load事件
  console.log("立即检查播放器");
  cleanPage();
  
  // 同时也监听load事件作为后备
  window.addEventListener('load', () => {
    console.log("页面加载完成，再次检查播放器");
    cleanPage();
  });
})();