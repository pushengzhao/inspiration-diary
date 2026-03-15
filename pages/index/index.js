Page({
  data: {
    currentDate: '',
    weekday: '',
    inspirations: [],
    events: [],
    thoughts: [],
    inspirationCount: 0,
    eventCount: 0,
    thoughtCount: 0,
    totalCount: 0
  },

  onLoad: function () {
    this.initDate();
    this.loadTodayEntries();
  },

  onShow: function () {
    this.loadTodayEntries();
  },

  initDate: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    this.setData({
      currentDate: `${year}-${month}-${day}`,
      weekday: weekday
    });
  },

  loadTodayEntries: function () {
    // 模拟数据，实际应从云数据库加载
    const today = this.data.currentDate;
    
    // 从云数据库加载今日记录
    if (wx.cloud) {
      const db = wx.cloud.database();
      const _ = db.command;
      
      db.collection('daily_entries').where({
        date: today
      }).orderBy('createTime', 'desc').get().then(res => {
        const inspirations = res.data.filter(item => item.type === 'inspiration');
        const events = res.data.filter(item => item.type === 'event');
        const thoughts = res.data.filter(item => item.type === 'thought');
        
        this.setData({
          inspirations: inspirations,
          events: events,
          thoughts: thoughts,
          inspirationCount: inspirations.length,
          eventCount: events.length,
          thoughtCount: thoughts.length,
          totalCount: res.data.length
        });
      }).catch(err => {
        console.error('加载数据失败:', err);
        // 使用示例数据
        this.setMockData();
      });
    } else {
      this.setMockData();
    }
  },

  setMockData: function () {
    // 示例数据用于演示
    this.setData({
      inspirations: [
        { id: 1, content: '突然想到可以用 AI 辅助写作，让日记更生动', time: '09:30', type: 'inspiration' }
      ],
      events: [
        { id: 2, content: '早上参加了产品评审会，讨论了新功能的设计方案', time: '10:00', type: 'event' }
      ],
      thoughts: [
        { id: 3, content: '读《深度工作》有感：专注力是这个时代最稀缺的资源', time: '20:00', type: 'thought' }
      ],
      inspirationCount: 1,
      eventCount: 1,
      thoughtCount: 1,
      totalCount: 3
    });
  },

  generateDiary: function () {
    const total = this.data.totalCount;
    
    if (total === 0) {
      wx.showToast({
        title: '今天还没有记录',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/diary/diary'
    });
  }
});
