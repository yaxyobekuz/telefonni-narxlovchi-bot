const texts = {
  error: { uz: "Xatolik", oz: "Хатолик", ru: "Ошибка" },
  success: { uz: "Muvaffaqiyatli", oz: "Муваффақиятли", ru: "Успешный" },
  language_selection_success: (language) => {
    return {
      uz: `Til muvaffaqiyatli ${language} qilib tanlandi.`,
      oz: `Тил муваффақиятли ${language} қилиб танланди.`,
      ru: `Язык успешно установлен на ${language}.`,
    };
  },
  contact: {
    uz: "Yordam olish uchun quyidagi adminga yozing 👇\nAdmin: @adminbek",
    oz: "Ёрдам олиш учун қуйидаги админга ёзинг 👇\nАдмин: @adminbek",
    ru: "Для получения помощи напишите следующему администратору 👇\nАдмин: @adminbek",
  },
  help: {
    uz: "Yordam olish ☎️",
    oz: "Ёрдам олиш ☎️",
    ru: "Получить помощь ☎️",
  },
  pricing: {
    uz: "Telefonni narxlash 💵",
    oz: "Телефонни нархлаш 💵",
    ru: "Оценка стоимости телефона 💵",
  },
  change_language: {
    uz: "Tilni o'zgartirish 🌐",
    oz: "Тилни ўзгартириш 🌐",
    ru: "Изменить язык 🌐",
  },
  nailing: {
    uz: "*Juda soz* 👌\n\nQuyidagi qurilmalardan o'zingizga keraklisini tanlang.",
    oz: "*Жуда соз* 👌\n\nҚуйидаги қурилмалардан ўзиңизга кераклисини танланг.",
    ru: "*Очень хорошо* 👌\n\nВыберите нужное устройство из списка ниже.",
  },
  back: {
    uz: "⬅️ Ortga qaytish",
    oz: "⬅️ Орқага қайтиш",
    ru: "⬅️ Вернуться назад",
  },
  invalid_device: {
    uz: "*Xatolik* ❌\n\nQurilma nomi noto'g'ri kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nҚурилма номи нотўғри киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nНазвание устройства введено неправильно. Пожалуйста, попробуйте снова.",
  },
  cancel: {
    uz: "Amal bekor qilindi ❌",
    oz: "Амал бекор қилинди ❌",
    ru: "Действие отменено ❌",
  },
  0: {
    uz: "",
    oz: "",
    ru: "",
  },
};

module.exports = texts;
