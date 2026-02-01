export const formatLocalDateToIsoDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentLocalDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const getStartOfCurrentMonthLocalDate = (): Date => {
  return getStartOfMonthLocalDate(new Date());
};

export const getStartOfMonthLocalDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfCurrentMonthLocalDate = (): Date => {
  return getEndOfMonthLocalDate(new Date());
};

export const getEndOfMonthLocalDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getLocalDateFromIsoDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
