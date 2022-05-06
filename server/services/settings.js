const Setting = require("../models/setting");

exports.getSettings = async (name) => {
  const setting = await Setting.findOne({ name: name }).lean().exec();
  return setting.value;
};

exports.updateSettings = async (name, value) => {
  return await Setting.findByIdAndUpdate(
    { name: name },
    { value: value },
    { upsert: true }
  );
};
