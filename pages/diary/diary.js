Page({
  data: {
    currentDate: '',
    weekday: '',
    diaryGenerated: false,
    diaryContent: {
      inspirations: '',
      events: '',
      thoughts: '',
      summary: ''
    }
  },

  onLoad: function () {
    this.initDate();
    this.generateDiary();
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

  generateDiary: function () {
    wx.showLoading({
      title: '生成中...'
    });

    // 从云数据库加载今日所有记录
    if (wx.cloud) {
      const db = wx.cloud.database();
      const today = this.data.currentDate;
      
      db.collection('daily_entries')
        .where({
          date: today
        })
        .orderBy('createTime', 'asc')
        .get()
        .then(res => {
          this.processDiaryContent(res.data);
        })
        .catch(err => {
          console.error('加载数据失败:', err);
          this.useMockData();
        });
    } else {
      this.useMockData();
    }
  },

  processDiaryContent: function (entries) {
    const inspirations = entries.filter(item => item.type === 'inspiration');
    const events = entries.filter(item => item.type === 'event');
    const thoughts = entries.filter(item => item.type === 'thought');

    // 生成日记内容
    let diaryContent = {
      inspirations: '今天还没有记录灵感',
      events: '今天还没有记录事件',
      thoughts: '今天还没有读书感悟',
      summary: '今天是平静的一天，期待明天有更多的收获。'
    };

    if (inspirations.length > 0) {
      diaryContent.inspirations = '今天产生了' + inspirations.length + '个灵感：' + 
        inspirations.map((item, index) => `(${index + 1}) ${item.content}`).join('；');
    }

    if (events.length > 0) {
      diaryContent.events = '今天经历了' + events.length + '件事：' + 
        events.map((item, index) => `(${index + 1}) ${item.time} - ${item.content}`).join('；');
    }

    if (thoughts.length > 0) {
      diaryContent.thoughts = '今天有' + thoughts.length + '点感悟：' + 
        thoughts.map((item, index) => `(${index + 1}) ${item.content}`).join('；');
    }

    // 生成总结
    const total = entries.length;
    if (total > 0) {
      diaryContent.summary = `今天总共记录了${total}条内容，` +
        `${inspirations.length > 0 ? '包括一些有趣的灵感，' : ''}` +
        `${events.length > 0 ? '经历了一些难忘的事情，' : ''}` +
        `${thoughts.length > 0 ? '还有一些深刻的思考。' : ''}` +
        '这些都是生活的珍贵片段，值得被记录和回味。';
    }

    // 模拟 AI 生成延迟
    setTimeout(() => {
      this.setData({
        diaryContent: diaryContent,
        diaryGenerated: true
      });
      wx.hideLoading();
    }, 1500);
  },

  useMockData: function () {
    // 使用示例数据
    setTimeout(() => {
      this.setData({
        diaryContent: {
          inspirations: '今天产生了 1 个灵感：(1) 突然想到可以用 AI 辅助写作，让日记更生动',
          events: '今天经历了 1 件事：(1) 10:00 - 早上参加了产品评审会，讨论了新功能的设计方案',
          thoughts: '今天有 1 点感悟：(1) 读《深度工作》有感：专注力是这个时代最稀缺的资源',
          summary: '今天总共记录了 3 条内容，包括一些有趣的灵感，经历了一些难忘的事情，还有一些深刻的思考。这些都是生活的珍贵片段，值得被记录和回味。'
        },
        diaryGenerated: true
      });
      wx.hideLoading();
    }, 1500);
  },

  copyDiary: function () {
    const content = this.formatDiaryForCopy();
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  shareDiary: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  saveDiary: function () {
    const diary = {
      date: this.data.currentDate,
      content: this.data.diaryContent,
      createTime: Date.now()
    };

    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('diaries')
        .add({
          data: diary
        })
        .then(res => {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        })
        .catch(err => {
          console.error('保存失败:', err);
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        });
    } else {
      wx.showToast({
        title: '保存成功（模拟）',
        icon: 'success'
      });
    }
  },

  formatDiaryForCopy: function () {
    const { currentDate, weekday, diaryContent } = this.data;
    return `【${currentDate} ${weekday}】\n\n` +
      `💡 灵感闪现\n${diaryContent.inspirations}\n\n` +
      `📅 今日事件\n${diaryContent.events}\n\n` +
      `📖 读书感悟\n${diaryContent.thoughts}\n\n` +
      `✨ 今日总结\n${diaryContent.summary}`;
  },

  onShareAppMessage: function () {
    return {
      title: '我的今日日记',
      path: '/pages/index/index'
    };
  },

  onShareTimeline: function () {
    return {
      title: '我的今日日记',
      query: ''
    };
  }
});
