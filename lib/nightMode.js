function updateNightMode() {
  const hour = new Date().getHours();
  const isNightTime = hour >= 18 || hour < 6; // 晚上6点到早上6点
  
  const container = document.querySelector('.container'); // 确保有一个容器元素
  if (isNightTime) {
    container.classList.add('night-mode');
  } else {
    container.classList.remove('night-mode');
  }
}

// 初始检查
updateNightMode();

// 每分钟检查一次
setInterval(updateNightMode, 60000); 