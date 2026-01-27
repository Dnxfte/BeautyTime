export const getNextDays = () => {
  const days = [];
  const months = [
    "Січня", "Лютого", "Березня", "Квітня", "Травня", "Червня",
    "Липня", "Серпня", "Вересня", "Жовтня", "Листопада", "Грудня",
  ];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push({ day: d.getDate(), month: months[d.getMonth()], fullDate: d });
  }
  return days;
};

export const parseDateString = (dateStr) => {
  try {
    const monthsMap = {
      "січня": 0, "лютого": 1, "березня": 2, "квітня": 3,
      "травня": 4, "червня": 5, "липня": 6, "серпня": 7,
      "вересня": 8, "жовтня": 9, "листопада": 10, "грудня": 11,
      "Січня": 0, "Лютого": 1, "Березня": 2, "Квітня": 3,
      "Травня": 4, "Червня": 5, "Липня": 6, "Серпня": 7,
      "Вересня": 8, "Жовтня": 9, "Листопада": 10, "Грудня": 11,
    };
    const parts = dateStr.split(" ");
    if (parts.length < 5) return new Date();
    const day = parseInt(parts[0], 10);
    const month = monthsMap[parts[1]];
    const year = parseInt(parts[2], 10);
    const timeParts = parts[4].split(":");
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    return new Date(year, month, day, hour, minute);
  } catch (e) {
    return new Date();
  }
};
