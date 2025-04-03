const texts = require("./texts");
const { languages, mandatory_channels } = require("./db");

const two_row = (language, data) => {
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

const yes_or_no = (language) => {
  return [
    [{ text: texts.yes[language] }, { text: texts.no[language] }],
    [{ text: texts.back[language] }],
  ];
};

const keyboards = {
  user: {
    two_row,
    yes_or_no,
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
        [formatted_languages[2], formatted_languages[3]],
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
