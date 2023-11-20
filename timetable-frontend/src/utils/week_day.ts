export const week_day_string = (week_day: number): string => {
  switch (week_day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "Invalid Day";
  }
};

export const get_week_day = (): number => {
  return new Date().getDay();
};
