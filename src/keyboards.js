const texts = require("./texts");
const { devices, languages, mandatory_channels } = require("./db");

const get_two_row_keyboards = (language, data) => {
  const keyboards = [];
  for (let i = 0; i < data.length; i = i + 2) {
    const item_1 = data[i];
    const item_2 = data[i + 1];

    if (item_2) {
      keyboards.push([{ text: item_1.name }, { text: item_2.name }]);
    } else {
      keyboards.push([{ text: item_1.name }]);
    }
  }
  keyboards.push([{ text: texts.back[language] }]);
  return keyboards;
};

const get_yes_or_no_keyboards = (language) => {
  return [
    [{ text: texts.yes[language] }, { text: texts.no[language] }],
    [{ text: texts.back[language] }],
  ];
};

const keyboards = {
  user: {
    home: (language) => [
      [{ text: texts.pricing[language] }],
      [
        { text: texts.help[language] },
        { text: texts.change_language[language] },
      ],
    ],
    request_contact: (language) => [
      [
        {
          request_contact: true,
          text: texts.send_contact[language],
        },
      ],
    ],
    languages: (() => {
      const formatted_languages = Object.keys(languages).map((lang) => ({
        text: languages[lang].name,
      }));

      return [
        [formatted_languages[0], formatted_languages[1]],
        [formatted_languages[2]],
      ];
    })(),
    mandatory_channels: (language) => [
      ...mandatory_channels.map(({ username }, index) => [
        {
          url: `https://t.me/${username.substring(1)}`,
          text: `${texts.channel[language]} #${index + 1}`,
        },
      ]),
    ],
    share: (language, message) => [
      [{ text: texts.share[language], switch_inline_query: message }],
    ],
    step_0: (language) => [
      ...Object.keys(devices).map((device) => [{ text: devices[device].name }]),
      [{ text: texts.back[language] }],
    ],
    step_1: (language, device) => {
      const models = devices[device].models;
      return [
        ...models.map((model) => [{ text: model.name }]),
        [{ text: texts.back[language] }],
      ];
    },
    step_2: get_two_row_keyboards,
    step_3: get_yes_or_no_keyboards,
    step_4: get_two_row_keyboards,
    step_5: get_two_row_keyboards,
    step_6: get_two_row_keyboards,
    step_7: get_yes_or_no_keyboards,
    step_8: (language) => {
      return [
        [{ text: "0-15%" }, { text: "15-30%" }],
        [{ text: "30-50%" }],
        [{ text: texts.back[language] }],
      ];
    },
  },
};

module.exports = keyboards;
