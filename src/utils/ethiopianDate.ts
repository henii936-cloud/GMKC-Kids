import { EtDatetime } from "abushakir";

export const ET_MONTHS = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን",
];

const AMHARIC_DAYS = ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];

export const getEthiopianDayOfWeek = (dateInput: any) => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return "";
  return AMHARIC_DAYS[dt.getDay()];
};

export const formatEthiopianTime = (dateInput: any) => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return "";

  const hours = dt.getHours();
  const minutes = dt.getMinutes().toString().padStart(2, "0");

  let ethHour = (hours + 6) % 12;
  if (ethHour === 0) ethHour = 12;

  let period = "";
  if (hours >= 6 && hours < 12) {
    period = "ጠዋት";
  } else if (hours >= 12 && hours < 18) {
    period = "ከሰዓት";
  } else if (hours >= 18 && hours < 24) {
    period = "ምሽት";
  } else {
    period = "ሌሊት";
  }

  return `${ethHour}:${minutes} ${period}`;
};

export const formatToEthiopian = (dateInput: string | Date | null): string => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return String(dateInput);
  try {
    const et = new EtDatetime(dt.getTime());
    return `${et.monthGeez} ${et.day}, ${et.year}`;
  } catch {
    return dt.toLocaleDateString();
  }
};

export const formatToEthiopianShort = (dateInput: string | Date | null): string => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return String(dateInput);
  try {
    const et = new EtDatetime(dt.getTime());
    const monthName: string = et.monthGeez ?? ET_MONTHS[et.month - 1];
    return `${monthName.substring(0, 3)} ${et.day}, ${et.year}`;
  } catch {
    return dt.toLocaleDateString();
  }
};

export const getCurrentEtDate = (): { year: number; month: number; day: number } => {
  const et = new EtDatetime(Date.now());
  return { year: et.year, month: et.month, day: et.day };
};

export const etToGregorian = (year: number, month: number, day: number): string => {
  try {
    const et = new EtDatetime(year, month, day);
    return new Date(et.moment).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

export const gregorianToEt = (isoDate: string): { year: number; month: number; day: number } | null => {
  try {
    const dt = new Date(isoDate);
    const et = new EtDatetime(dt.getTime());
    return { year: et.year, month: et.month, day: et.day };
  } catch {
    return null;
  }
};
