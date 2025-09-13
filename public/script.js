// 通用工具函数

// 生成简单的MD5哈希（用于认证）
async function simpleMD5(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    // 设置背景颜色基于类型
    const colors = {
        info: '#12b7f5',
        success: '#2ed573',
        warning: '#ffa502',
        error: '#ff4757'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 格式化时间
function formatTime(date) {
    return new Date(date).toLocaleString('zh-CN');
}

// 导出数据为CSV
function exportToCSV(data, filename) {
    if (data.length === 0) {
        showNotification('没有数据可导出', 'warning');
        return;
    }
    
    // 获取所有可能的键（列名）
    const keys = new Set();
    data.forEach(item => {
        Object.keys(item).forEach(key => keys.add(key));
    });
    
    const columns = Array.from(keys);
    
    // 创建CSV内容
    let csvContent = columns.join(',') + '\n';
    data.forEach(item => {
        const row = columns.map(key => {
            const value = item[key] || '';
            // 处理值中的逗号和引号
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvContent += row.join(',') + '\n';
    });
    
    // 创建下载链接
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    document.body.removeChild(link);
    
    showNotification('数据已导出', 'success');
}
