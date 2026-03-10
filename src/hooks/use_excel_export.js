const ExcelJS = require("exceljs");

const normalize_value = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};

const flatten_object = (input, prefix = "", result = {}) => {
  if (!input || typeof input !== "object" || input instanceof Date) {
    if (prefix) result[prefix] = normalize_value(input);
    return result;
  }

  for (const key of Object.keys(input)) {
    const value = input[key];
    const next_key = prefix ? `${prefix}.${key}` : key;

    if (value instanceof Date) {
      result[next_key] = normalize_value(value);
      continue;
    }

    if (Array.isArray(value)) {
      result[next_key] = JSON.stringify(value);
      continue;
    }

    if (value && typeof value === "object") {
      flatten_object(value, next_key, result);
      continue;
    }

    result[next_key] = normalize_value(value);
  }

  return result;
};

const build_excel_buffer = async ({ sheet_name, rows }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheet_name || "Export");

  const flattened_rows = rows.map((row) => flatten_object(row));
  const headers = Array.from(
    flattened_rows.reduce((set, row) => {
      for (const key of Object.keys(row)) set.add(key);
      return set;
    }, new Set()),
  );

  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: 24,
  }));

  for (const row of flattened_rows) {
    const prepared = {};
    for (const header of headers) {
      prepared[header] = normalize_value(row[header]);
    }
    worksheet.addRow(prepared);
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
};

const to_valid_date = (value) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date;
};

const format_uzbek_date = (value) => {
  const date = to_valid_date(value);
  if (!date) return "";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());

  return `${dd}.${mm}.${yyyy}`;
};

const format_time_hhmm = (value) => {
  const date = to_valid_date(value);
  if (!date) return "";

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${hh}:${min}`;
};

const format_currency_usd = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (Number.isNaN(number)) return "";
  return `${number}$`;
};

const get_top_model_value = (top_models_by_device, device_key, rank) => {
  const models = Array.isArray(top_models_by_device?.[device_key])
    ? top_models_by_device[device_key]
    : [];
  const item = models[rank - 1];

  if (!item) return "-";

  return `${item?.model_name || "-"} (soni: ${item?.count || 0}, oxirgi narx: ${item?.last_final_price || 0})`;
};

const build_users_excel_buffer = async (users) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Foydalanuvchilar");

  worksheet.columns = [
    { header: "Chat ID", key: "chat_id", width: 16 },
    { header: "F.I.SH", key: "first_name", width: 26 },
    { header: "Username", key: "username", width: 24 },
    { header: "Telefon raqam", key: "phone", width: 18 },
    { header: "Til kodi", key: "language_code", width: 14 },
    { header: "Jami narxlashlar", key: "all_pricings", width: 16 },
    { header: "Oxirgi qurilma", key: "last_device_type", width: 16 },
    { header: "iPhone narxlashlari", key: "iphone_count", width: 16 },
    { header: "iPad narxlashlari", key: "ipad_count", width: 16 },
    { header: "MacBook narxlashlari", key: "macbook_count", width: 18 },
    { header: "iWatch narxlashlari", key: "iwatch_count", width: 16 },
    { header: "AirPods narxlashlari", key: "airpods_count", width: 18 },
    { header: "iPhone Top-1 model", key: "iphone_top_1", width: 32 },
    { header: "iPhone Top-2 model", key: "iphone_top_2", width: 32 },
    { header: "iPhone Top-3 model", key: "iphone_top_3", width: 32 },
    { header: "iPad Top-1 model", key: "ipad_top_1", width: 32 },
    { header: "iPad Top-2 model", key: "ipad_top_2", width: 32 },
    { header: "iPad Top-3 model", key: "ipad_top_3", width: 32 },
    { header: "MacBook Top-1 model", key: "macbook_top_1", width: 34 },
    { header: "MacBook Top-2 model", key: "macbook_top_2", width: 34 },
    { header: "MacBook Top-3 model", key: "macbook_top_3", width: 34 },
    { header: "iWatch Top-1 model", key: "iwatch_top_1", width: 32 },
    { header: "iWatch Top-2 model", key: "iwatch_top_2", width: 32 },
    { header: "iWatch Top-3 model", key: "iwatch_top_3", width: 32 },
    { header: "AirPods Top-1 model", key: "airpods_top_1", width: 34 },
    { header: "AirPods Top-2 model", key: "airpods_top_2", width: 34 },
    { header: "AirPods Top-3 model", key: "airpods_top_3", width: 34 },
    { header: "Ro'yxatdan o'tgan sana", key: "created_date", width: 20 },
    { header: "Ro'yxatdan o'tgan vaqt", key: "created_time", width: 18 },
  ];

  for (const user of users) {
    const totals = user?.quick_stats?.totals || {};
    const by_device = totals?.by_device || {};
    const top_models_by_device = user?.quick_stats?.top_models_by_device || {};

    worksheet.addRow({
      chat_id: normalize_value(user?.chat_id),
      first_name: normalize_value(user?.first_name),
      username: normalize_value(user?.username),
      phone: normalize_value(user?.phone),
      language_code: normalize_value(user?.language_code),
      all_pricings: normalize_value(totals?.all_pricings || 0),
      last_device_type: normalize_value(totals?.last_device_type || "-"),
      iphone_count: normalize_value(by_device?.iphone || 0),
      ipad_count: normalize_value(by_device?.ipad || 0),
      macbook_count: normalize_value(by_device?.macbook || 0),
      iwatch_count: normalize_value(by_device?.iwatch || 0),
      airpods_count: normalize_value(by_device?.airpods || 0),
      iphone_top_1: get_top_model_value(top_models_by_device, "iphone", 1),
      iphone_top_2: get_top_model_value(top_models_by_device, "iphone", 2),
      iphone_top_3: get_top_model_value(top_models_by_device, "iphone", 3),
      ipad_top_1: get_top_model_value(top_models_by_device, "ipad", 1),
      ipad_top_2: get_top_model_value(top_models_by_device, "ipad", 2),
      ipad_top_3: get_top_model_value(top_models_by_device, "ipad", 3),
      macbook_top_1: get_top_model_value(top_models_by_device, "macbook", 1),
      macbook_top_2: get_top_model_value(top_models_by_device, "macbook", 2),
      macbook_top_3: get_top_model_value(top_models_by_device, "macbook", 3),
      iwatch_top_1: get_top_model_value(top_models_by_device, "iwatch", 1),
      iwatch_top_2: get_top_model_value(top_models_by_device, "iwatch", 2),
      iwatch_top_3: get_top_model_value(top_models_by_device, "iwatch", 3),
      airpods_top_1: get_top_model_value(top_models_by_device, "airpods", 1),
      airpods_top_2: get_top_model_value(top_models_by_device, "airpods", 2),
      airpods_top_3: get_top_model_value(top_models_by_device, "airpods", 3),
      created_date: format_uzbek_date(user?.created_at),
      created_time: format_time_hhmm(user?.created_at),
    });
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.eachRow((row) => {
    row.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
};

const build_pricing_events_excel_buffer = async (events) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pricing Eventlar");

  worksheet.columns = [
    { header: "Event ID", key: "event_id", width: 28 },
    { header: "Chat ID", key: "chat_id", width: 14 },
    { header: "F.I.SH", key: "first_name", width: 24 },
    { header: "Username", key: "username", width: 20 },
    { header: "Telefon", key: "phone", width: 18 },
    { header: "Qurilma turi", key: "device_type", width: 16 },
    { header: "Model", key: "model_name", width: 28 },
    { header: "Xotira", key: "memory_name", width: 16 },
    { header: "Rang", key: "color_name", width: 14 },
    { header: "Ekran", key: "screen_name", width: 14 },
    { header: "Batareya", key: "battery_name", width: 14 },
    { header: "SIM", key: "sim_name", width: 14 },
    { header: "Ko'rinish", key: "appearance_name", width: 14 },
    { header: "O'lcham", key: "size_name", width: 12 },
    { header: "Tasma", key: "strap", width: 12 },
    { header: "Quvvatlagich", key: "charger", width: 14 },
    { header: "Holat", key: "status_name", width: 14 },
    { header: "Quti/Hujjat", key: "box_docs", width: 14 },
    { header: "Narx", key: "initial_price", width: 16 },
    { header: "Chegirma", key: "minus", width: 14 },
    { header: "Baholangan narx", key: "final_price", width: 14 },
    { header: "Ekrandan chegirma", key: "screen_deduction", width: 14 },
    { header: "Batareyadan chegirma", key: "battery_deduction", width: 16 },
    { header: "Qutidan chegirma", key: "box_deduction", width: 14 },
    { header: "SIMdan chegirma", key: "sim_deduction", width: 14 },
    { header: "Ko'rinishdan chegirma", key: "appearance_deduction", width: 16 },
    { header: "Tasmadan chegirma", key: "strap_deduction", width: 14 },
    { header: "Quvvatlagichdan chegirma", key: "charger_deduction", width: 18 },
    { header: "Holatdan chegirma", key: "condition_deduction", width: 14 },
    { header: "Til kodi", key: "language_code", width: 12 },
    { header: "Yaratilgan sana", key: "created_date", width: 16 },
    { header: "Yaratilgan vaqt", key: "created_time", width: 12 },
    { header: "Xabar matni", key: "share_text", width: 48 },
  ];

  for (const event of events) {
    const user_snapshot = event?.user_snapshot || {};
    const state_data = event?.state_data_snapshot || {};
    const device_snapshot = event?.device_snapshot || {};
    const pricing = event?.pricing || {};

    worksheet.addRow({
      event_id: event?._id ? String(event._id) : "",
      chat_id: normalize_value(event?.chat_id),
      first_name: normalize_value(user_snapshot?.first_name),
      username: normalize_value(user_snapshot?.username),
      phone: normalize_value(user_snapshot?.phone),
      device_type: normalize_value(event?.device_type),
      model_name: normalize_value(
        device_snapshot?.model_name || state_data?.model?.name,
      ),
      memory_name: normalize_value(
        device_snapshot?.memory_name || state_data?.memory?.name,
      ),
      color_name: normalize_value(
        device_snapshot?.color_name || state_data?.color?.name,
      ),
      screen_name: normalize_value(
        device_snapshot?.screen_name || state_data?.screen?.name,
      ),
      battery_name: normalize_value(
        device_snapshot?.battery_name || state_data?.battery_capacity?.name,
      ),
      sim_name: normalize_value(
        device_snapshot?.sim_name || state_data?.sim?.name,
      ),
      appearance_name: normalize_value(
        device_snapshot?.appearance_name || state_data?.appearance?.name,
      ),
      size_name: normalize_value(
        device_snapshot?.size_name || state_data?.size?.name,
      ),
      strap: normalize_value(device_snapshot?.strap || state_data?.strap),
      charger: normalize_value(device_snapshot?.charger || state_data?.charger),
      status_name: normalize_value(
        device_snapshot?.status_name || state_data?.status?.name,
      ),
      box_docs: normalize_value(
        device_snapshot?.box_docs || state_data?.box_docs,
      ),
      initial_price: format_currency_usd(pricing?.initial_price),
      minus: format_currency_usd(pricing?.minus),
      final_price: format_currency_usd(pricing?.final_price),
      screen_deduction: format_currency_usd(pricing?.screen_deduction),
      battery_deduction: format_currency_usd(pricing?.battery_deduction),
      box_deduction: format_currency_usd(pricing?.box_deduction),
      sim_deduction: format_currency_usd(pricing?.sim_deduction),
      appearance_deduction: format_currency_usd(pricing?.appearance_deduction),
      strap_deduction: format_currency_usd(pricing?.strap_deduction),
      charger_deduction: format_currency_usd(pricing?.charger_deduction),
      condition_deduction: format_currency_usd(pricing?.condition_deduction),
      language_code: normalize_value(event?.language_code),
      created_date: format_uzbek_date(event?.created_at),
      created_time: format_time_hhmm(event?.created_at),
      share_text: normalize_value(event?.telegram_payload?.share_text),
    });
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.eachRow((row) => {
    row.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
};

module.exports = {
  build_excel_buffer,
  build_users_excel_buffer,
  build_pricing_events_excel_buffer,
};
