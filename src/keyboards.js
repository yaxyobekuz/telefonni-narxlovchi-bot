const texts = require("./texts");
const { devices } = require("./db");

const keyboards = {
  user: {
    home: (language) => [
      [{ text: texts.pricing[language] }],
      [
        { text: texts.help[language] },
        { text: texts.change_language[language] },
      ],
    ],
    step_1: (language) => [
      Object.keys(devices).map((device) => ({
        text: devices[device].name,
      })),
      [{ text: texts.back[language] }],
    ],
    step_2: (language, device) => {
      const models = devices[device].models;
      return [
        models.map((model) => ({ text: model.name })),
        [{ text: texts.back[language] }],
      ];
    },
  },
};

module.exports = keyboards;
