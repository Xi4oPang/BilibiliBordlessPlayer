chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background收到消息:", msg);
  
  if (msg.action === "openCleanPlayer") {
    // 添加clean_player=true参数来标记这是通过插件打开的
    const url = new URL(msg.url);
    
    // 确保删除任何已存在的相同参数，防止重复
    url.searchParams.delete("clean_player");
    url.searchParams.delete("title");
    
    // 添加必要的参数
    url.searchParams.set("clean_player", "true");
    url.searchParams.set("title", msg.title || "Bilibili Player");
    
    console.log("准备打开窗口:", url.toString());
    
    chrome.windows.create({
      url: url.toString(),
      type: "popup",
      width: 1000,
      height: 700
    }, (window) => {
      if (chrome.runtime.lastError) {
        console.error("创建窗口错误:", chrome.runtime.lastError);
      } else {
        console.log("成功创建窗口:", window);
      }
    });
    
    // 回应消息发送者
    sendResponse({success: true});
  }
  
  // 返回true表示我们会异步发送响应
  return true;
});