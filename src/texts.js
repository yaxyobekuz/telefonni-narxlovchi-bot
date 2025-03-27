const texts = {
  greeting: {
    uz: "*Assalomu alaykum* 👋 \nHurmatli foydalanuvchi bosh menyuga xush kelibsiz!",
    oz: "*Ассалому алайкум* 👋 \nҲурматли фойдаланувчи бош менюга хуш келибсиз!",
    ru: "*Ассаламу алейкум* 👋 \nУважаемый пользователь, добро пожаловать в главное меню!",
  },
  error: { uz: "Xatolik", oz: "Хатолик", ru: "Ошибка" },
  success: { uz: "Muvaffaqiyatli", oz: "Муваффақиятли", ru: "Успешный" },
  request_contact: {
    uz: "Ro'yxatdan o'tish uchun iltimos telefon raqamingizni kiriting: 👇",
    oz: "Рўйхатдан ўтиш учун илтимос телефон рақамингизни киритинг: 👇",
    ru: "Для регистрации введите, пожалуйста, свой номер телефона: 👇",
  },
  registration_successful: {  
    uz: "Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉",  
    oz: "Муваффақиятли рўйхатдан ўтдингиз! 🎉",  
    ru: "Вы успешно зарегистрировались! 🎉",  
  },    
  send_contact: {  
    uz: "📞 Telefon raqamimni kiritish",  
    oz: "📞 Телефон рақамимни киритиш",  
    ru: "📞 Ввести мой номер телефона",  
  },    
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
  invalid_model: {
    uz: "*Xatolik* ❌\n\nQurilma modeli noto'g'ri kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nҚурилма модели нотўғри киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nМодель устройства введена неверно. Пожалуйста, попробуйте снова.",
  },
  invalid_box_and_doc: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri javob kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри жавоб киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный ответ. Пожалуйста, попробуйте снова.",
  },
  invalid_battery_level: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri batareya sig'imi kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри батарея сиғими киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведена неверная ёмкость батареи. Пожалуйста, попробуйте снова.",
  },
  invalid_color: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri rang kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри ранг киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный цвет. Пожалуйста, попробуйте снова.",
  },
  invalid_storage: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri xotira hajmi kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри хотира ҳажми киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный объем памяти. Пожалуйста, попробуйте снова.",
  },
  invalid_country: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri davlat kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри давлат киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведена неверная страна. Пожалуйста, попробуйте снова.",
  },
  invalid_damaged: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri javob kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри жавоб киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный ответ. Пожалуйста, попробуйте снова.",
  },
  invalid_contact: {  
    uz: "*Xatolik* ❌\n\nNoto'g'ri telefon raqam kiritildi. Iltimos, qaytadan urinib ko'ring.",  
    oz: "*Хатолик* ❌\n\nНотўғри телефон рақам киритилди. Илтимос, қайтадан уриниб кўринг.",  
    ru: "*Ошибка* ❌\n\nВведён неверный номер телефона. Пожалуйста, попробуйте снова.",  
  },    
  cancel: {
    uz: "Amal bekor qilindi ❌",
    oz: "Амал бекор қилинди ❌",
    ru: "Действие отменено ❌",
  },
  step_0: {
    uz: "📱 Qurilmalardan birini tanlang:",
    oz: "📱 Қурилмалардан бирини танланг:",
    ru: "📱 Выберите одно из устройств:",
  },
  step_1: {
    uz: "🧩 Qurilma modelini tanlang:",
    oz: "🧩 Қурилма моделини танланг:",
    ru: "🧩 Выберите модель устройства:",
  },
  step_2: {
    uz: "🔋 Qurilma batareyasining sig'imini tanlang:",
    oz: "🔋 Қурилма батареясининг сиғимини танланг:",
    ru: "🔋 Выберите ёмкость батареи устройства:",
  },
  step_3: {
    uz: "📦 Qurilma qutisi va hujjatlari bormi?",
    oz: "📦 Қурилма қутиси ва ҳужжатлари борми?",
    ru: "📦 Есть ли коробка и документы от устройства?",
  },
  step_4: {
    uz: "🎨 Qurilma rangini tanlang:",
    oz: "🎨 Қурилма рангини танланг:",
    ru: "🎨 Выберите цвет устройства:",
  },
  step_5: {
    uz: "🧠 Qurilmaning xotira hajmini tanlang:",
    oz: "🧠 Қурилманинг хотира ҳажмини танланг:",
    ru: "🧠 Выберите объем памяти устройства:",
  },
  step_6: {
    uz: "🌎 Qurilma ishlab chiqarilgan davlatni tanlang:",
    oz: "🌎 Қурилма ишлаб чиқарилган давлатни танланг:",
    ru: "🌎 Выберите страну производства устройства:",
  },
  step_7: {
    uz: "💥 Qurilmaga shikast yetganmi?",
    oz: "💥 Қурилмага шикаст етганми?",
    ru: "💥 Устройство повреждено?",
  },
  step_8: {
    uz: "*Qurilmangiz necha foiz shikastlangan* ❓\n\n*0-15%* - Qurilma qirilgan, chaqasi bor, batareya almashgan. \n\n*15-30%* - Qurilma ekrani yoki boshqa bir qismi almashgan.\n\n*30-50%* - Qurilma barmoq skanneri ishlamaydi, Face ID ishlamaydi, katta miqdorda zarar yetgan, dog'i bor.",
    oz: "*Қурилмангиз неча фоиз шикастланган* ❓\n\n*0-15%* - Қурилма қирилган, чақаси бор, батарея алмашган. \n\n*15-30%* - Қурилма экрани ёки бошқа бир қисми алмашган.\n\n*30-50%* - Қурилма бармоқ сканнери ишламайди, Face ID ишламайди, катта миқдорда зарар етган, доғи бор.",
    ru: "*Насколько повреждено ваше устройство* ❓\n\n*0-15%* - Устройство поцарапано, есть сколы, заменена батарея. \n\n*15-30%* - Заменен экран или другая часть устройства.\n\n*30-50%* - Не работает сканер отпечатков, Face ID, нанесен значительный ущерб, есть пятна.",
  },
  yes: {
    uz: "Ha ✅",
    oz: "Ҳа ✅",
    ru: "Да ✅",
  },
  no: {
    uz: "Yo'q ❌",
    oz: "Йўқ ❌",
    ru: "Нет ❌",
  },
  subscribe_prompt: {
    uz: "Bizning ijtimoiy tarmoqlarimizga obuna bo'lishni unutmang!",
    oz: "Бизнинг ижтимоий тармоқларимизга обуна бўлишни унутманг!",
    ru: "Не забудьте подписаться на наши социальные сети!",
  },
  share: {
    uz: "» Ulashish «",
    oz: "» Улашиш «",
    ru: "» Поделиться «",
  },
  contact_admin: {
    uz: "Agar qurilmangizni sotmoqchi bo'lsangiz @adminbek ga murojaat qiling! 😊",
    oz: "Агар қурилмангизни сотмоқчи бўлсангиз @adminbek га мурожаат қилинг! 😊",
    ru: "Если вы хотите продать своё устройство, свяжитесь с @adminbek! 😊",
  },
  exists: {
    uz: "Bor",
    oz: "Бор",
    ru: "Есть",
  },
  not_exists: {
    uz: "Yo'q",
    oz: "Йўқ",
    ru: "Нет",
  },
  excellent: {
    uz: "A'lo",
    oz: "Аъло",
    ru: "Отлично",
  },
};

module.exports = texts;
