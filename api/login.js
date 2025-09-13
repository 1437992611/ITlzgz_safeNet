const { createHash } = require('crypto');

// 简单的内存存储（在实际应用中应该使用数据库）
let loginData = [];

module.exports = async (req, res) => {
  // 设置 CORS 头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, action, auth } = req.body;

    // 教师认证检查
    if (action === 'get_data' || action === 'clear_data') {
      const teacherPassword = process.env.TEACHER_PASSWORD || 'demo123';
      const expectedAuth = createHash('md5').update(teacherPassword).digest('hex');
      
      if (auth !== expectedAuth) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // 处理不同操作
    switch (action) {
      case 'login':
        // 记录登录尝试
        const loginAttempt = {
          id: Date.now(),
          time: new Date().toLocaleString('zh-CN'),
          username,
          password,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };
        
        loginData.push(loginAttempt);
        
        // 限制数据大小（最多保留100条记录）
        if (loginData.length > 100) {
          loginData = loginData.slice(-100);
        }
        
        return res.status(200).json({ 
          success: true, 
          message: '登录尝试已记录',
          data: loginAttempt
        });

      case 'get_data':
        // 获取所有登录数据
        return res.status(200).json({
          success: true,
          data: loginData
        });

      case 'clear_data':
        // 清除所有数据
        loginData = [];
        return res.status(200).json({
          success: true,
          message: '数据已清除'
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
