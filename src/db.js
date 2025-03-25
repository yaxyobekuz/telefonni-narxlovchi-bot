const users = {
  0: {
    id: 0,
    role: "owner",
    username: null,
    first_name: "Ega",
    language_code: "uz",
  },
};

const devices = {
  iphone: {
    name: "Iphone 🍎",
    price: 1000,
    models: [
      {
        name: "Iphone 11",
        colors: [{ name: "Black" }],
        battery_levels: [{ name: "70-74%" }],
      },
    ],
  },
};

const languages = {
  uz: { value: "uz", name: "O'zbekcha 🇺🇿" },
  oz: { value: "oz", name: "Узбекча (кирилл) 🇺🇿" },
  ru: { value: "ru", name: "Русский 🇷🇺" },
};

module.exports = { users, languages, devices };
