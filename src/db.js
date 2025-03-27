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
    models: [
      {
        name: "Iphone 11",
        price: 1000,
        box_and_doc: 35,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [
          { minus: 0, name: "Black" },
          { minus: 0, name: "Red" },
          { minus: 0, name: "Blue" },
          { minus: 0, name: "Green" },
          { minus: 0, name: "Gold" },
          { minus: 0, name: "Titanium" },
        ],
        battery_levels: [
          { minus: 165, name: "60-70%" },
          { minus: 110, name: "70-74%" },
          { minus: 95, name: "74-77%" },
          { minus: 80, name: "77-80%" },
          { minus: 70, name: "80-83%" },
          { minus: 60, name: "83-86%" },
          { minus: 50, name: "86-89%" },
          { minus: 40, name: "89-92%" },
          { minus: 30, name: "92-96%" },
          { minus: 20, name: "96-97%" },
          { minus: 10, name: "97-99%" },
          { minus: 0, name: "100%" },
        ],
        storages: [
          { minus: 100, name: "128 GB" },
          { minus: 50, name: "256 GB" },
        ],
      },
      {
        name: "Iphone 11 Pro",
        price: 1200,
        box_and_doc: 30,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [
          { minus: 0, name: "Black" },
          { minus: 0, name: "Red" },
          { minus: 0, name: "Gold" },
          { minus: 0, name: "Titanium" },
        ],
        battery_levels: [
          { minus: 40, name: "89-92%" },
          { minus: 30, name: "92-96%" },
          { minus: 20, name: "96-97%" },
          { minus: 10, name: "97-99%" },
          { minus: 0, name: "100%" },
        ],
        storages: [
          { minus: 50, name: "256 GB" },
          { minus: 25, name: "512 GB" },
          { minus: 0, name: "1 TB" },
        ],
      },
      {
        name: "Iphone 11 Pro Max",
        price: 1500,
        box_and_doc: 30,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [
          { minus: 0, name: "Black" },
          { minus: 0, name: "Gold" },
          { minus: 0, name: "Titanium" },
        ],
        battery_levels: [
          { minus: 20, name: "96-97%" },
          { minus: 10, name: "97-99%" },
          { minus: 0, name: "100%" },
        ],
        storages: [
          { minus: 20, name: "512 GB" },
          { minus: 0, name: "1 TB" },
        ],
      },
      {
        name: "Iphone 12",
        price: 1150,
        box_and_doc: 40,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [
          { minus: 0, name: "Gold" },
          { minus: 0, name: "Titanium" },
        ],
        battery_levels: [
          { minus: 20, name: "96-97%" },
          { minus: 10, name: "97-99%" },
          { minus: 0, name: "100%" },
        ],
        storages: [
          { minus: 10, name: "256 GB" },
          { minus: 0, name: "512 GB" },
        ],
      },
    ],
  },
  samsung: {
    name: "Samsung 🪐",
    models: [
      {
        name: "Samsung Galaxy S21",
        price: 800,
        box_and_doc: 25,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [{ minus: 0, name: "Black" }],
        battery_levels: [
          { minus: 100, name: "4000-4250mAh" },
          { minus: 50, name: "4250-4500mAh" },
          { minus: 0, name: "4500-5000mAh" },
        ],
        storages: [
          { minus: 100, name: "128 GB" },
          { minus: 50, name: "256 GB" },
        ],
      },
      {
        name: "Samsung Galaxy S21+",
        price: 1300,
        box_and_doc: 30,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [
          { minus: 0, name: "Black" },
          { minus: 0, name: "Red" },
          { minus: 0, name: "Gold" },
          { minus: 0, name: "Titanium" },
        ],
        battery_levels: [
          { minus: 100, name: "4000-4250mAh" },
          { minus: 50, name: "4250-4500mAh" },
          { minus: 0, name: "4500-5000mAh" },
        ],
        storages: [
          { minus: 50, name: "256 GB" },
          { minus: 25, name: "512 GB" },
          { minus: 0, name: "1 TB" },
        ],
      },
      {
        name: "Samsung Galaxy S21 Ultra",
        price: 1400,
        box_and_doc: 35,
        damaged: {
          "0-15%": 50,
          "15-30%": 150,
          "30-50%": 350,
        },
        countries: [
          { name: "RU/A", minus: 0 },
          { name: "ZA/A", minus: 0 },
          { name: "JP/A", minus: 0 },
          { name: "AE/A", minus: 0 },
          { name: "VC/A", minus: 0 },
          { name: "KH/A", minus: 0 },
          { name: "RM/A", minus: 0 },
          { name: "VN/A", minus: 0 },
        ],
        colors: [
          { minus: 0, name: "Black" },
          { minus: 0, name: "Gold" },
          { minus: 0, name: "Titanium" },
        ],
        battery_levels: [
          { minus: 100, name: "4000-4250mAh" },
          { minus: 50, name: "4250-4500mAh" },
          { minus: 0, name: "4500-5000mAh" },
        ],
        storages: [
          { minus: 50, name: "256 GB" },
          { minus: 20, name: "512 GB" },
        ],
      },
    ],
  },
};

const languages = {
  uz: { value: "uz", name: "O'zbekcha 🇺🇿" },
  oz: { value: "oz", name: "Узбекча (кирилл) 🇺🇿" },
  ru: { value: "ru", name: "Русский 🇷🇺" },
};

const mandatory_channels = [
  { username: "@mol_uzb", chat_id: -1001829398323 },
  { username: "@frontendtv", chat_id: -1001906193267 },
];

module.exports = { users, languages, devices, mandatory_channels };
