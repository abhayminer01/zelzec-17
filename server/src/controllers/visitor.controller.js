const Visitor = require('../models/visitor.model');

exports.recordVisit = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Try to create a new visitor entry
    // The unique index on { ip: 1, date: 1 } will prevent duplicates
    await Visitor.create({
      ip,
      userAgent,
      date
    });

    res.status(200).json({ message: 'Visit recorded' });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate entry (already visited today), just ignore
      return res.status(200).json({ message: 'Visit already recorded for today' });
    }
    console.error('Error recording visit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getVisitorStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Hourly Stats (For Today)
    // We need to parse timestamp, so we look for docs where date == todayStr
    // Then group by hour
    const hourlyStats = await Visitor.aggregate([
      { $match: { date: todayStr } },
      {
        $project: {
          hour: { $hour: "$timestamp" }
        }
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing hours (0-23)
    const activeHours = hourlyStats.map(h => h._id);
    const completeHourlyStats = [];
    for (let i = 0; i < 24; i++) {
      const found = hourlyStats.find(h => h._id === i);
      completeHourlyStats.push({
        hour: i,
        count: found ? found.count : 0
      });
    }


    // 2. Daily Stats (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const dailyStats = await Visitor.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgoStr }
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date ascending
      }
    ]);

    // 3. Monthly Stats (Last 12 Months)
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 11); // Go back 11 months + current
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0].substring(0, 7); // YYYY-MM

    const monthlyStats = await Visitor.aggregate([
      {
        $project: {
          month: { $substr: ['$date', 0, 7] } // Extract YYYY-MM
        }
      },
      {
        $match: {
          month: { $gte: oneYearAgoStr }
        }
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // 4. Browser Stats (Pie Chart)
    // Simple regex to detect Chrome, Firefox, Safari, Edge, Others
    // Note: UserAgent strings are complex, this is a basic approximation
    const allVisitors = await Visitor.find({}, 'userAgent');
    const browserCounts = { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Others: 0 };

    allVisitors.forEach(v => {
      const ua = v.userAgent || '';
      if (ua.includes('Chrome') && !ua.includes('Edg')) browserCounts.Chrome++;
      else if (ua.includes('Firefox')) browserCounts.Firefox++;
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browserCounts.Safari++;
      else if (ua.includes('Edg')) browserCounts.Edge++;
      else browserCounts.Others++;
    });

    const browserStats = Object.keys(browserCounts).map(key => ({
      name: key,
      value: browserCounts[key]
    })).filter(b => b.value > 0); // Only return non-zero

    // 5. Total
    const totalVisitors = await Visitor.countDocuments();

    res.status(200).json({
      hourly: completeHourlyStats,
      daily: dailyStats,
      monthly: monthlyStats,
      browsers: browserStats,
      total: totalVisitors
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
