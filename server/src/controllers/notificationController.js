const Notification = require('../models/Notification');

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ owner: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ owner: req.user._id, isRead: false }, { isRead: true });
    } else {
      await Notification.updateOne({ _id: id, owner: req.user._id }, { isRead: true });
    }
    res.status(200).json({
      success: true,
      message: 'Notification(s) marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listNotifications,
  markAsRead,
};
