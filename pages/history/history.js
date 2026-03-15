Page({
  data: {
    currentYear: 2024,
    currentMonth: 1,
    calendarDays: [],
    selectedDate: '',
    dayEntries: [],
    monthStats: {
      total: 0,
      inspirations: 0,
      events: 0,
      thoughts: 0
    }
  },

  onLoad: function () {
    this.initCalendar();
  },

  initCalendar: function () {
    const now = new Date();
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    });
    this.generateCalendarDays();
    this.loadMonthStats();
  },

  generateCalendarDays: function () {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeek = firstDay.getDay();
    
    // 获取当月有多少天
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 获取上个月有多少天
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    
    const days = [];
    const today = new Date();
    const todayStr = this.formatDate(today);
    
    // 添加上个月的日期
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = this.formatDate(new Date(year, month - 2, day));
      days.push({
        date: date,
        day: day,
        isCurrentMonth: false,
        hasRecord: false,
        recordCount: 0,
        isToday: false
      });
    }
    
    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.formatDate(new Date(year, month - 1, day));
      days.push({
        date: date,
        day: day,
        isCurrentMonth: true,
        hasRecord: false,
        recordCount: 0,
        isToday: date === todayStr
      });
    }
    
    // 添加下个月的日期（补齐 42 天）
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = this.formatDate(new Date(year, month, day));
      days.push({
        date: date,
        day: day,
        isCurrentMonth: false,
        hasRecord: false,
        recordCount: 0,
        isToday: false
      });
    }
    
    this.setData({
      calendarDays: days
    });
    
    this.loadMonthRecords();
  },

  formatDate: function (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  prevMonth: function () {
    let year = this.data.currentYear;
    let month = this.data.currentMonth - 1;
    
    if (month === 0) {
      month = 12;
      year--;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month
    });
    
    this.generateCalendarDays();
    this.loadMonthStats();
  },

  nextMonth: function () {
    let year = this.data.currentYear;
    let month = this.data.currentMonth + 1;
    
    if (month === 13) {
      month = 1;
      year++;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month
    });
    
    this.generateCalendarDays();
    this.loadMonthStats();
  },

  loadMonthRecords: function () {
    const prefix = `${this.data.currentYear}-${String(this.data.currentMonth).padStart(2, '0')}`;
    
    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('daily_entries')
        .where({
          date: db.RegExp({
            regexp: `^${prefix}`,
            options: 'i'
          })
        })
        .get()
        .then(res => {
          this.updateCalendarWithRecords(res.data);
        })
        .catch(err => {
          console.error('加载记录失败:', err);
        });
    }
  },

  updateCalendarWithRecords: function (entries) {
    const recordMap = {};
    
    entries.forEach(entry => {
      if (!recordMap[entry.date]) {
        recordMap[entry.date] = 0;
      }
      recordMap[entry.date]++;
    });
    
    const updatedDays = this.data.calendarDays.map(day => {
      const count = recordMap[day.date] || 0;
      return {
        ...day,
        hasRecord: count > 0,
        recordCount: count
      };
    });
    
    this.setData({
      calendarDays: updatedDays
    });
  },

  loadMonthStats: function () {
    // 模拟统计数据
    this.setData({
      monthStats: {
        total: Math.floor(Math.random() * 30),
        inspirations: Math.floor(Math.random() * 10),
        events: Math.floor(Math.random() * 10),
        thoughts: Math.floor(Math.random() * 10)
      }
    });
  },

  selectDay: function (e) {
    const date = e.currentTarget.dataset.date;
    this.setData({
      selectedDate: date,
      dayEntries: []
    });
    
    // 加载该日期的记录
    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('daily_entries')
        .where({
          date: date
        })
        .orderBy('createTime', 'asc')
        .get()
        .then(res => {
          this.setData({
            dayEntries: res.data
          });
        })
        .catch(err => {
          console.error('加载失败:', err);
        });
    }
  },

  goToRecord: function () {
    wx.switchTab({
      url: '/pages/record/record'
    });
  },

  viewDiary: function () {
    if (this.data.dayEntries.length > 0) {
      wx.navigateTo({
        url: '/pages/diary/diary'
      });
    } else {
      wx.showToast({
        title: '这天还没有日记',
        icon: 'none'
      });
    }
  }
});
