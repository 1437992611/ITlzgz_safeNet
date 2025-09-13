// 数据存储键名
const STORAGE_KEY = 'qqPhishingDemoData';

// 保存登录数据
function saveLoginData(username, password, time) {
    // 获取现有数据
    let data = getStoredData();
    
    // 添加新数据
    data.push({
        time: time || new Date().toLocaleString(),
        username: username,
        password: password
    });
    
    // 保存回本地存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // 触发存储事件，以便教师页面可以监听更新
    window.dispatchEvent(new Event('storage'));
}

// 获取存储的数据
function getStoredData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 清除所有数据
function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('storage'));
}

// 在教师页面显示数据
function displayTeacherData() {
    const data = getStoredData();
    const dataBody = document.getElementById('dataBody');
    
    if (!dataBody) return;
    
    dataBody.innerHTML = '';
    
    if (data.length === 0) {
        dataBody.innerHTML = '<tr><td colspan="3" class="no-data">暂无登录数据</td></tr>';
        return;
    }
    
    // 显示最新数据在前
    const reversedData = [...data].reverse();
    
    reversedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.username}</td>
            <td>${item.password}</td>
        `;
        dataBody.appendChild(row);
    });
}

// 更新统计数据
function updateStats() {
    const data = getStoredData();
    
    if (document.getElementById('totalAttempts')) {
        document.getElementById('totalAttempts').textContent = data.length;
    }
    
    if (document.getElementById('lastActivity') && data.length > 0) {
        document.getElementById('lastActivity').textContent = data[data.length - 1].time;
    }
}

// 导出数据为CSV
function exportDataToCSV() {
    const data = getStoredData();
    
    if (data.length === 0) {
        alert('没有数据可导出');
        return;
    }
    
    // 创建CSV内容
    let csvContent = "时间,QQ号码,密码\n";
    data.forEach(item => {
        csvContent += `"${item.time}","${item.username}","${item.password}"\n`;
    });
    
    // 创建下载链接
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "qq_login_data.csv");
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    document.body.removeChild(link);
}

// 监听存储事件（用于教师页面实时更新）
window.addEventListener('storage', function() {
    if (window.location.pathname.includes('teacher.html')) {
        displayTeacherData();
        updateStats();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果是在教师页面，初始加载数据
    if (window.location.pathname.includes('teacher.html')) {
        displayTeacherData();
        updateStats();
    }
});
