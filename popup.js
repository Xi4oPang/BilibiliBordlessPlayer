document.addEventListener("DOMContentLoaded", () => {
  console.log("popup.js 已加载");
  
  // 尝试从剪贴板读取文本
  try {
    navigator.clipboard.readText().then(text => {
      console.log("从剪贴板读取:", text);
      if (text && text.includes("bilibili.com/video/")) {
        document.getElementById("url").value = text;
        console.log("找到B站链接，已自动填充");
      }
    }).catch((e) => {
      console.log("无法读取剪贴板:", e);
    });
  } catch (e) {
    console.log("剪贴板API不可用:", e);
  }

  // 打开播放器按钮点击事件
  document.getElementById("openBtn").addEventListener("click", () => {
    const url = document.getElementById("url").value.trim();
    const title = document.getElementById("title").value.trim() || "Bilibili Player";
    
    console.log("准备打开:", { url, title });

    if (!url.includes("bilibili.com/video/")) {
      alert("请输入有效的B站视频链接");
      return;
    }

    // 发送消息给background.js
    chrome.runtime.sendMessage(
      { 
        action: "openCleanPlayer", 
        url: url, 
        title: title 
      },
      (response) => {
        console.log("收到background响应:", response);
        if (chrome.runtime.lastError) {
          console.error("发送消息错误:", chrome.runtime.lastError);
        }
        // 无论成功与否，都关闭弹出窗口
        window.close();
      }
    );
  });
  
  // 添加回车键监听
  document.getElementById("url").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("openBtn").click();
    }
  });
  
  document.getElementById("title").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("openBtn").click();
    }
  });

  console.log("popup.js 初始化完成");
});