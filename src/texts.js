const texts = {
  channel: { uz: "Kanal", oz: "Канал", ru: "Канал", en: "Channel" },
  error: { uz: "Xatolik", oz: "Хатолик", ru: "Ошибка", en: "Error" },
  success: {
    uz: "Muvaffaqiyatli",
    oz: "Муваффақиятли",
    ru: "Успешный",
    en: "Successful",
  },
  greeting: {
    uz: "*Assalomu alaykum* 👋 \nHurmatli foydalanuvchi bosh menyuga xush kelibsiz!",
    oz: "*Ассалому алайкум* 👋 \nҲурматли фойдаланувчи бош менюга хуш келибсиз!",
    ru: "*Ассаламу алейкум* 👋 \nУважаемый пользователь, добро пожаловать в главное меню!",
    en: "*Hello* 👋 \nDear user, welcome to the main menu!",
  },
  request_contact: {
    uz: "Ro'yxatdan o'tish uchun iltimos telefon raqamingizni kiriting: 👇",
    oz: "Рўйхатдан ўтиш учун илтимос телефон рақамингизни киритинг: 👇",
    ru: "Для регистрации введите, пожалуйста, свой номер телефона: 👇",
    en: "Please enter your phone number to register: 👇",
  },
  registration_successful: {
    uz: "Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉",
    oz: "Муваффақиятли рўйхатдан ўтдингиз! 🎉",
    ru: "Вы успешно зарегистрировались! 🎉",
    en: "You have successfully registered! 🎉",
  },
  send_contact: {
    uz: "📞 Telefon raqamimni kiritish",
    oz: "📞 Телефон рақамимни киритиш",
    ru: "📞 Ввести мой номер телефона",
    en: "📞 Enter my phone number",
  },
  membership_required: {
    uz: "*Kanallarga obuna bo'lmadingiz* ❌\n\nQuyida keltirilgan kanallarga obuna bo'lib, botdan cheklovlarsiz foydalaning.",
    oz: "*Каналларга обуна бўлмадингиз* ❌\n\nҚуйида келтирилган каналларга обуна бўлиб, ботдан чекловларсиз фойдаланинг.",
    ru: "*Вы не подписались на каналы* ❌\n\nПодпишитесь на указанные ниже каналы, чтобы пользоваться ботом без ограничений.",
    en: "*You have not subscribed to the channels* ❌\n\nSubscribe to the channels below to use the bot without restrictions.",
  },
  check_membership: {
    uz: "A'zolikni tekshirish",
    oz: "Аъзоликни текшириш",
    ru: "Проверить членство",
    en: "Check Membership",
  },
  membership_confirmed: {
    uz: "Rahmat! Endi botdan foydalanishingiz mumkin.",
    oz: "Рахмат! Энди ботдан фойдаланишингиз мумкин.",
    ru: "Спасибо за вступление! Теперь вы можете использовать бота.",
    en: "Thank you for joining! You can now use the bot.",
  },
  language_selection_success: (language) => {
    return {
      uz: `Til muvaffaqiyatli ${language} qilib tanlandi.`,
      oz: `Тил муваффақиятли ${language} қилиб танланди.`,
      ru: `Язык успешно установлен на ${language}.`,
      en: `Language successfully set to ${language}.`,
    };
  },
  contact: {
    uz: "Yordam olish uchun quyidagi adminga yozing 👇\nAdmin: @adminbek",
    oz: "Ёрдам олиш учун қуйидаги админга ёзинг 👇\nАдмин: @adminbek",
    ru: "Для получения помощи напишите следующему администратору 👇\nАдмин: @adminbek",
    en: "For assistance, write to the following admin 👇\nAdmin: @adminbek",
  },
  help: {
    uz: "Yordam olish ☎️",
    oz: "Ёрдам олиш ☎️",
    ru: "Получить помощь ☎️",
    en: "Get help ☎️",
  },
  pricing: {
    uz: "Qurilmani narxlash 💵",
    oz: "Қурилмани нархлаш 💵",
    ru: "Оценка стоимости устройства 💵",
    en: "Device Pricing 💵",
  },
  change_language: {
    uz: "Tilni o'zgartirish 🌐",
    oz: "Тилни ўзгартириш 🌐",
    ru: "Изменить язык 🌐",
    en: "Change Language 🌐",
  },
  back: {
    uz: "⬅️ Ortga qaytish",
    oz: "⬅️ Орқага қайтиш",
    ru: "⬅️ Вернуться назад",
    en: "⬅️ Go Back",
  },
  invalid_device: {
    uz: "*Xatolik* ❌\n\nQurilma nomi noto'g'ri kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nҚурилма номи нотўғри киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nНазвание устройства введено неправильно. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nThe device name is incorrect. Please try again.",
  },
  invalid_model: {
    uz: "*Xatolik* ❌\n\nQurilma modeli noto'g'ri kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nҚурилма модели нотўғри киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nМодель устройства введена неверно. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nThe device model is incorrect. Please try again.",
  },
  invalid_box_docs: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri javob kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри жавоб киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный ответ. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nInvalid response entered. Please try again.",
  },
  invalid_battery: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri batareya sig'imi kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри батарея сиғими киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведена неверная ёмкость батареи. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nIncorrect battery capacity entered. Please try again.",
  },
  invalid_color: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri rang kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри ранг киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный цвет. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nInvalid color entered. Please try again.",
  },
  invalid_value: {
    uz: "❌ Noto'g'ri qiymat kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "❌ Нотўғри қиймат киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "❌ Введено неверное значение. Пожалуйста, попробуйте снова.",
    en: "❌ Invalid value entered. Please try again.",
  },
  invalid_memory: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri xotira hajmi kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри хотира ҳажми киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный объем памяти. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nInvalid storage capacity entered. Please try again.",
  },
  invalid_country: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri davlat kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри давлат киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведена неверная страна. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nInvalid country entered. Please try again.",
  },
  invalid_damaged: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri javob kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри жавоб киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведен неверный ответ. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nInvalid response entered. Please try again.",
  },
  invalid_contact: {
    uz: "*Xatolik* ❌\n\nNoto'g'ri telefon raqam kiritildi. Iltimos, qaytadan urinib ko'ring.",
    oz: "*Хатолик* ❌\n\nНотўғри телефон рақам киритилди. Илтимос, қайтадан уриниб кўринг.",
    ru: "*Ошибка* ❌\n\nВведён неверный номер телефона. Пожалуйста, попробуйте снова.",
    en: "*Error* ❌\n\nInvalid phone number entered. Please try again.",
  },
  device_screen_scratch: {
    uz: "📺 Qurilma ekrani qanday darajada tirnalganini kiriting:\n 0-30% kichik tirnalish\n 30-100% o'rta va yuqori darajadagi tirnalish",
    oz: "📺 Қурилма экрани қандай даражада тирналганини киритинг:\n 0-30% кичик тирналиш\n 30-100% ўрта ва юқори даражадаги тирналиш",
    ru: "📺 Введите степень царапин на экране устройства:\n 0-30% небольшая царапина\n 30-100% средняя и высокая царапина",
    en: "📺 Enter the level of screen scratches on the device:\n 0-30% small scratch\n 30-100% medium and high scratch",
  },
  cancel: {
    uz: "Amal bekor qilindi ❌",
    oz: "Амал бекор қилинди ❌",
    ru: "Действие отменено ❌",
    en: "Action Cancelled ❌",
  },
  select_device: {
    uz: "📱 Qurilmalardan birini tanlang:",
    oz: "📱 Қурилмалардан бирини танланг:",
    ru: "📱 Выберите одно из устройств:",
    en: "📱 Select one of the devices:",
  },
  device_model: {
    uz: "🧩 Qurilma modelini tanlang:",
    oz: "🧩 Қурилма моделини танланг:",
    ru: "🧩 Выберите модель устройства:",
    en: "🧩 Select device model:",
  },
  device_memory: {
    uz: "🧠 Qurilmaning xotira hajmini tanlang:",
    oz: "🧠 Қурилманинг хотира ҳажмини танланг:",
    ru: "🧠 Выберите объем памяти устройства:",
    en: "🧠 Select the storage capacity of the device:",
  },
  device_status: {
    uz: "🛠 Qurilma holatini kiriting:",
    oz: "🛠 Қурилма ҳолатини киритинг:",
    ru: "🛠 Введите состояние устройства:",
    en: "🛠 Enter device condition:",
  },
  device_box_docs: {
    uz: "📦 Qurilma qutisi va hujjatlari bormi?",
    oz: "📦 Қурилма қутиси ва ҳужжатлари борми?",
    ru: "📦 Есть ли коробка и документы от устройства?",
    en: "📦 Does the device have a box and documents?",
  },
  device_cable: {
    uz: "🔌 Qurilma kabeli bormi?",
    oz: "🔌 Қурилма кабели борми?",
    ru: "🔌 Есть ли кабель у устройства?",
    en: "🔌 Does the device have a cable?",
  },
  device_appearance: {
    uz: "✨ Qurilma ko'rinishini kiriting:",
    oz: "✨ Қурилма кўринишини киритинг:",
    ru: "✨ Введите внешний вид устройства:",
    en: "✨ Enter the device appearance:",
  },
  device_color: {
    uz: "🎨 Qurilma rangini tanlang:",
    oz: "🎨 Қурилма рангини танланг:",
    ru: "🎨 Выберите цвет устройства:",
    en: "🎨 Select the color of the device:",
  },
  device_battery_capacity: {
    uz: "🔋 Qurilma batareyasining sig'imini tanlang:",
    oz: "🔋 Қурилма батареясининг сиғимини танланг:",
    ru: "🔋 Выберите ёмкость батареи устройства:",
    en: "🔋 Select the battery capacity of the device:",
  },
  device_country: {
    uz: "🌎 Qurilma ishlab chiqarilgan davlatni kiriting:",
    oz: "🌎 Қурилма ишлаб чиқарилган давлатни киритинг:",
    ru: "🌎 Введите страну производства устройства:",
    en: "🌎 Enter the country of manufacture of the device:",
  },
  device_strap: {
    uz: "⛓️ Qurilma tasmasi bormi?",
    oz: "⛓️ Қурилма тасмаси борми?",
    ru: "⛓️ Есть ли ремешок у устройства?",
    en: "⛓️ Does the device have a strap?",
  },
  device_charger: {
    uz: "⚡️ Qurilma quvvatlovchisi bormi?",
    oz: "⚡️ Қурилма қувватловчиси борми?",
    ru: "⚡️ Есть ли зарядное устройство у устройства?",
    en: "⚡️ Does the device have a charger?",
  },
  device_size: {
    uz: "📏 Qurilma o'lchamini kiriting:",
    oz: "📏 Қурилма ўлчамини киритинг:",
    ru: "📏 Введите размер устройства:",
    en: "📏 Enter the device size:",
  },
  device_adapter: {
    uz: "🖲 Qurilma adapterining turini kiriting:",
    oz: "🖲 Қурилма адаптерининг турини киритинг:",
    ru: "🖲 Введите тип адаптера устройства:",
    en: "🖲 Enter the type of device adapter:",
  },
  update_success: {
    uz: "✅ Ma'lumotlar muvaffaqiyatli yangilandi!",
    oz: "✅ Маълумотлар муваффақиятли янгиланди!",
    ru: "✅ Данные успешно обновлены!",
    en: "✅ Data successfully updated!",
  },
  update_error: {
    uz: "❌ Ma'lumotlarni yangilashda xatolik!",
    oz: "❌ Маълумотларни янгилашда хатолик!",
    ru: "❌ Ошибка при обновлении данных!",
    en: "❌ Error updating data!",
  },
  home: {
    uz: "⬅️ Bosh sahifa ",
    oz: "⬅️ Бош саҳифа ",
    ru: "⬅️ Главная страница ",
    en: "⬅️ Home ",
  },
  enter_new_price: {
    uz: "💸 Yangi narxni kiriting. Masalan, 99",
    oz: "💸 Янги нархни киритинг. Масалан, 99",
    ru: "💸 Введите новую цену. Например, 99",
    en: "💸 Enter the new price. For example, 99",
  },
  update_device_price: {
    uz: "Qurilma narxini o'zgartirish 🔄",
    oz: "Қурилма нархини ўзгартириш 🔄",
    ru: "Изменить цену устройства 🔄",
    en: "Update device price 🔄",
  },
  admins: {
    uz: "Adminlar 👥",
    oz: "Админлар 👥",
    ru: "Администраторы 👥",
    en: "Admins 👥",
  },
  channels: {
    uz: "Kanallar 📣",
    oz: "Каналлар 📣",
    ru: "Каналы 📣",
    en: "Channels 📣",
  },
  step_7: {
    uz: "💥 Qurilmaga shikast yetganmi?",
    oz: "💥 Қурилмага шикаст етганми?",
    ru: "💥 Устройство повреждено?",
    en: "💥 Is the device damaged?",
  },
  step_8: {
    uz: "*Qurilmangiz necha foiz shikastlangan* ❓\n\n*0-15%* - Qurilma qirilgan, chaqasi bor, batareya almashgan. \n\n*15-30%* - Qurilma ekrani yoki boshqa bir qismi almashgan.\n\n*30-50%* - Qurilma barmoq skanneri ishlamaydi, Face ID ishlamaydi, katta miqdorda zarar yetgan, dog'i bor.",
    oz: "*Қурилмангиз неча фоиз шикастланган* ❓\n\n*0-15%* - Қурилма қирилган, чақаси бор, батарея алмашган. \n\n*15-30%* - Қурилма экрани ёки бошқа бир қисми алмашган.\n\n*30-50%* - Қурилма бармоқ сканнери ишламайди, Face ID ишламайди, катта миқдорда зарар етган, доғи бор.",
    ru: "*Насколько повреждено ваше устройство* ❓\n\n*0-15%* - Устройство поцарапано, есть сколы, заменена батарея. \n\n*15-30%* - Заменен экран или другая часть устройства.\n\n*30-50%* - Не работает сканер отпечатков, Face ID, нанесен значительный ущерб, есть пятна.",
    en: "*How damaged is your device* ❓\n\n*0-15%* - Device is scratched, chipped, or battery replaced.\n\n*15-30%* - Device screen or another part replaced.\n\n*30-50%* - Fingerprint scanner not working, Face ID not working, significant damage, or stains.",
  },
  yes: {
    uz: "Ha ✅",
    oz: "Ҳа ✅",
    ru: "Да ✅",
    en: "Yes ✅",
  },
  no: {
    uz: "Yo'q ❌",
    oz: "Йўқ ❌",
    ru: "Нет ❌",
    en: "No ❌",
  },
  free: {
    uz: "Olinmaydi ❌",
    oz: "Олинмайди ❌",
    ru: "Не доступно ❌",
    en: "Not available ❌",
  },
  subscribe_prompt: {
    uz: "Bizning ijtimoiy tarmoqlarimizga obuna bo'lishni unutmang!",
    oz: "Бизнинг ижтимоий тармоқларимизга обуна бўлишни унутманг!",
    ru: "Не забудьте подписаться на наши социальные сети!",
    en: "Don't forget to subscribe to our social media!",
  },
  share: {
    uz: "» Ulashish «",
    oz: "» Улашиш «",
    ru: "» Поделиться «",
    en: "» Share «",
  },
  contact_admin: {
    uz: "Agar qurilmangizni sotmoqchi bo'lsangiz @adminbek ga murojaat qiling! 😊",
    oz: "Агар қурилмангизни сотмоқчи бўлсангиз @adminbek га мурожаат қилинг! 😊",
    ru: "Если вы хотите продать своё устройство, свяжитесь с @adminbek! 😊",
    en: "If you want to sell your device, contact @adminbek! 😊",
  },
  exists: {
    uz: "Bor",
    oz: "Бор",
    ru: "Есть",
    en: "Exists",
  },
  not_exists: {
    uz: "Yo'q",
    oz: "Йўқ",
    ru: "Нет",
    en: "Doesn't Exist",
  },
  excellent: {
    uz: "A'lo",
    oz: "Аъло",
    ru: "Отлично",
    en: "Excellent",
  },
  device: {
    uz: "Qurilma",
    oz: "Қурилма",
    ru: "Устройство",
    en: "Device",
  },
  battery: {
    uz: "Batareya",
    oz: "Батарея",
    ru: "Батарея",
    en: "Battery",
  },
  size: {
    uz: "O'lcham",
    oz: "Ўлчам",
    ru: "Размер",
    en: "Size",
  },
  box: {
    uz: "Quti",
    oz: "Қути",
    ru: "Коробка",
    en: "Box",
  },
  price: {
    uz: "Narx",
    oz: "Нарх",
    ru: "Цена",
    en: "Price",
  },
  condition: {
    uz: "Holat",
    oz: "Ҳолат",
    ru: "Состояние",
    en: "Condition",
  },
  memory: {
    uz: "Xotira",
    oz: "Хотира",
    ru: "Память",
    en: "Memory",
  },
  adapter: {
    uz: "Adapter",
    oz: "Адаптер",
    ru: "Адаптер",
    en: "Adapter",
  },
  appearance: {
    uz: "Ko'rinish",
    oz: "Кўриниш",
    ru: "Внешний вид",
    en: "Appearance",
  },
  country: {
    uz: "Mamlakat",
    oz: "Мамлакат",
    ru: "Страна",
    en: "Country",
  },
  cable: {
    uz: "Kabel",
    oz: "Кабель",
    ru: "Кабель",
    en: "Cable",
  },
  screen: {
    uz: "Ekran",
    oz: "Экран",
    ru: "Экран",
    en: "Screen",
  },
  charger: {
    uz: "Quvvatlagich",
    oz: "Қувватлагич",
    ru: "Зарядное устройство",
    en: "Charger",
  },
  strap: {
    uz: "Tasma",
    oz: "Тасма",
    ru: "Ремешок",
    en: "Strap",
  },
};

module.exports = texts;
