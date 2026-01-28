const MONTHS_UA = [
  'Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
  'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'
];

export const getNextDays = () => {
  const days = [];
  for (let i = 0; i < 4; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push({
      day: d.getDate(),
      month: MONTHS_UA[d.getMonth()],
      fullDate: d,
    });
  }
  return days;
};

export const getTomorrowStr = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getDate()}.${tomorrow.getMonth() + 1}.${tomorrow.getFullYear()}`;
};
