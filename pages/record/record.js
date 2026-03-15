Page({
  data: {
    selectedType: 'inspiration',
    content: '',
    contentLength: 0,
    currentTag: '',
    tags: [],
    todayCount: 0,
    recentEntries: []
  },

  onLoad: function () {
    this.loadTodayEntries();
  },

  onShow: function () {
    this.loadTodayEntries();
  },

  selectType: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type
    });
  },

  onContentInput: function (e) {
    const content = e.detail.value;
    this.setData({
      content: content,
      contentLength: content.length
    });
  },

  onTagInput: function (e) {
    this.setData({
      currentTag: e.detail.value
    });
  },

  addTag: function () {
    const tag = this.data.currentTag.trim();
    if (tag && !this.data.tags.includes(tag)) {
      this.setData({
        tags: [...this.data.tags, tag],
        currentTag: ''
      });
    }
  },

  removeTag: function (e) {
    const index = e.currentTarget.dataset.index;
    const newTags = this.data.tags.filter((_, i) => i !== index);
    this.setData({
      tags: newTags
    });
  },

  loadTodayEntries: function () {
    const today = this.getTodayDate();
    
    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('daily_entries')
        .where({
          date: today
        })
        .orderBy('createTime', 'desc')
        .limit(10)
        .get()
        .then(res => {
          this.setData({
            todayCount: res.data.length,
            recentEntries: res.data
          });
        })
        .catch(err => {
          console.error('加载数据失败:', err);
        });
    }
  },

  getTodayDate: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  submitEntry: function () {
    const { selectedType, content, tags } = this.data;
    
    if (!content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    const now = new Date();
    const entry = {
      type: selectedType,
      content: content.trim(),
      tags: tags,
      date: this.getTodayDate(),
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      createTime: now.getTime(),
      _id: Date.now().toString()
    };

    // 保存到云数据库
    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('daily_entries')
        .add({
          data: entry
        })
        .then(res => {
          wx.hideLoading();
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 重置表单
          this.setData({
            content: '',
            contentLength: 0,
            tags: []
          });
          
          // 刷新列表
          this.loadTodayEntries();
        })
        .catch(err => {
          wx.hideLoading();
          console.error('保存失败:', err);
          wx.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          });
        });
    } else {
      // 模拟保存（用于测试）
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功（模拟）',
          icon: 'success'
        });
        
        this.setData({
          content: '',
          contentLength: 0,
          tags: [],
          todayCount: this.data.todayCount + 1,
          recentEntries: [entry, ...this.data.recentEntries]
        });
      }, 500);
    }
  }
});
