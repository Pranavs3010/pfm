const moment = require("moment");

exports.calculateBudgetPeriod = (period, startDate = new Date()) => {
  const start = moment(startDate).startOf("day");
  let end;

  switch (period) {
    case "weekly":
      end = moment(start).add(7, "days").endOf("day");
      break;
    case "monthly":
      end = moment(start).add(1, "month").endOf("day");
      break;
    case "yearly":
      end = moment(start).add(1, "year").endOf("day");
      break;
    default:
      end = moment(start).add(1, "month").endOf("day");
  }

  return {
    startDate: start.toDate(),
    endDate: end.toDate(),
  };
};

exports.calculateBudgetUtilization = (spent, limit) => {
  if (limit === 0) return 0;
  return Math.round((spent / limit) * 100);
};

exports.isBudgetExceeded = (spent, limit) => {
  return spent > limit;
};

exports.shouldSendAlert = (spent, limit, alertThreshold) => {
  const utilization = (spent / limit) * 100;
  return utilization >= alertThreshold && utilization < 100;
};
