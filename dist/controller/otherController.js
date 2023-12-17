import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/statsModel.js";
export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
    const statsData = [];
    for (let i = 0; i < stats.length; i++) {
        statsData.unshift(stats[i]);
    }
    const requiredSize = 12 - stats.length;
    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift(new Stats({
            views: 0,
            users: 0,
            subscriptions: 0,
        }));
    }
    const userCount = statsData[11].users;
    const subscriptionsCount = statsData[11].subscriptions;
    const viewsCount = statsData[11].views;
    let userProfit = true, viewsProfit = true, subscriptionsProfit = true;
    let userPercentage = 0, viewsPercentage = 0, subscriptionsPercentage = 0;
    if (statsData[10].users === 0) {
        userPercentage = userCount * 100;
    }
    if (statsData[10].subscriptions === 0) {
        subscriptionsPercentage = subscriptionsCount * 100;
    }
    if (statsData[10].views === 0) {
        viewsPercentage = viewsCount * 100;
    }
    else {
        const differnce = {
            users: userCount - statsData[10].users,
            subscriptions: subscriptionsCount - statsData[10].subscriptions,
            views: viewsCount - statsData[10].views
        };
        userPercentage = (differnce.users / statsData[10].users) * 100;
        subscriptionsPercentage = (differnce.subscriptions / statsData[10].subscriptions) * 100;
        viewsPercentage = (differnce.views / statsData[10].views) * 100;
        if (userPercentage < 0) {
            userProfit = false;
        }
        if (subscriptionsPercentage < 0) {
            subscriptionsProfit = false;
        }
        if (viewsPercentage < 0) {
            viewsProfit = false;
        }
    }
    res.status(201).json({
        success: true,
        stats: statsData,
        userProfit,
        viewsProfit,
        subscriptionsProfit,
        userPercentage,
        viewsPercentage,
        subscriptionsPercentage,
        userCount,
        subscriptionsCount,
        viewsCount
    });
});
