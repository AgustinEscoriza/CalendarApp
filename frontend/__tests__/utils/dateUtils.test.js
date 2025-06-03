import {
  // Conversión y validación
  toDate,
  toISOString,
  toTimestamp,
  
  // Comparación
  isSameDay,
  isDateInRange,
  
  // Formateo
  formatDisplayDate,
  formatMonthYear,
  formatTime,
  formatTimeRange,
  formatEventDate,
  
  // Operaciones
  startOfDay,
  endOfDay,
  addDays,
  addHours,
  
  // Utilidades del calendario
  getTodayEvents,
  getUpcomingEvents,
  getDefaultEventDates,
  
  // Constantes
  DATE_FORMATS
} from '../../src/utils/dateUtils.js';

describe('dateUtils', () => {
  // Fechas de prueba fijas para consistencia
  const testDate = new Date('2024-01-15T14:30:00.000Z'); // Lunes 15 enero 2024, 14:30
  const testDateString = '2024-01-15T14:30:00.000Z';
  const testTimestamp = testDate.getTime();
  
  describe('toDate', () => {
    it('should convert valid Date object', () => {
      const result = toDate(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should convert valid ISO string', () => {
      const result = toDate(testDateString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should convert valid timestamp', () => {
      const result = toDate(testTimestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should return null for invalid inputs', () => {
      expect(toDate(null)).toBeNull();
      expect(toDate(undefined)).toBeNull();
      expect(toDate('')).toBeNull();
      expect(toDate('invalid-date')).toBeNull();
      expect(toDate(new Date('invalid'))).toBeNull();
    });

    it('should handle edge cases', () => {
      expect(toDate(0)).toBeInstanceOf(Date); // Unix epoch
      expect(toDate('invalid-date-string')).toBeNull(); // Realmente inválida
      expect(toDate(NaN)).toBeNull();
    });
  });

  describe('toISOString', () => {
    it('should convert valid date to ISO string', () => {
      const result = toISOString(testDate);
      expect(result).toBe(testDateString);
    });

    it('should convert timestamp to ISO string', () => {
      const result = toISOString(testTimestamp);
      expect(result).toBe(testDateString);
    });

    it('should return null for invalid inputs', () => {
      expect(toISOString(null)).toBeNull();
      expect(toISOString('invalid-date')).toBeNull();
      expect(toISOString(undefined)).toBeNull();
    });
  });

  describe('toTimestamp', () => {
    it('should convert valid date to timestamp', () => {
      const result = toTimestamp(testDate);
      expect(result).toBe(testTimestamp);
    });

    it('should convert ISO string to timestamp', () => {
      const result = toTimestamp(testDateString);
      expect(result).toBe(testTimestamp);
    });

    it('should return null for invalid inputs', () => {
      expect(toTimestamp(null)).toBeNull();
      expect(toTimestamp('invalid-date')).toBeNull();
      expect(toTimestamp(undefined)).toBeNull();
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day dates', () => {
      const date1 = new Date('2024-01-15T09:00:00');
      const date2 = new Date('2024-01-15T22:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = new Date('2024-01-16T12:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should handle different input types', () => {
      const date1 = new Date('2024-01-15T12:00:00');
      const date2 = '2024-01-15T14:30:00';
      const date3 = new Date('2024-01-15T16:00:00').getTime();
      
      expect(isSameDay(date1, date2)).toBe(true);
      expect(isSameDay(date2, date3)).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isSameDay(null, testDate)).toBe(false);
      expect(isSameDay(testDate, null)).toBe(false);
      expect(isSameDay(null, null)).toBe(false);
      expect(isSameDay('invalid', testDate)).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    const startDate = new Date('2024-01-10');
    const endDate = new Date('2024-01-20');

    it('should return true for date within range', () => {
      const dateInRange = new Date('2024-01-15');
      expect(isDateInRange(dateInRange, startDate, endDate)).toBe(true);
    });

    it('should return true for date at range boundaries', () => {
      expect(isDateInRange(startDate, startDate, endDate)).toBe(true);
      expect(isDateInRange(endDate, startDate, endDate)).toBe(true);
    });

    it('should return false for date outside range', () => {
      const dateBefore = new Date('2024-01-05');
      const dateAfter = new Date('2024-01-25');
      
      expect(isDateInRange(dateBefore, startDate, endDate)).toBe(false);
      expect(isDateInRange(dateAfter, startDate, endDate)).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(isDateInRange(null, startDate, endDate)).toBe(false);
      expect(isDateInRange(testDate, null, endDate)).toBe(false);
      expect(isDateInRange(testDate, startDate, null)).toBe(false);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format valid date correctly', () => {
      const result = formatDisplayDate(testDate);
      // El resultado depende del locale, pero debería incluir día, mes y año
      expect(result).toMatch(/\d+.*enero.*2024/i);
    });

    it('should return error message for invalid date', () => {
      expect(formatDisplayDate(null)).toBe('Fecha inválida');
      expect(formatDisplayDate('invalid')).toBe('Fecha inválida');
      expect(formatDisplayDate(undefined)).toBe('Fecha inválida');
    });

    it('should handle different input types', () => {
      const dateString = formatDisplayDate(testDateString);
      const dateTimestamp = formatDisplayDate(testTimestamp);
      const dateObject = formatDisplayDate(testDate);
      
      expect(dateString).toBe(dateObject);
      expect(dateTimestamp).toBe(dateObject);
    });
  });

  describe('formatMonthYear', () => {
    it('should format month and year correctly', () => {
      const result = formatMonthYear(testDate);
      expect(result).toMatch(/enero.*2024/i);
    });

    it('should return error message for invalid date', () => {
      expect(formatMonthYear(null)).toBe('Fecha inválida');
      expect(formatMonthYear('invalid')).toBe('Fecha inválida');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly in 24h format', () => {
      const result = formatTime(testDate);
      // Debería mostrar hora en formato 24h
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should return error message for invalid date', () => {
      expect(formatTime(null)).toBe('Hora inválida');
      expect(formatTime('invalid')).toBe('Hora inválida');
    });
  });

  describe('formatTimeRange', () => {
    it('should format time range correctly', () => {
      const start = new Date('2024-01-15T14:30:00');
      const end = new Date('2024-01-15T16:00:00');
      
      const result = formatTimeRange(start, end);
      expect(result).toMatch(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/);
    });

    it('should return error for invalid start time', () => {
      const validEnd = new Date('2024-01-15T16:00:00');
      const result = formatTimeRange(null, validEnd);
      expect(result).toBe('Hora inválida');
    });

    it('should return start time when end time is invalid', () => {
      const validStart = new Date('2024-01-15T14:30:00');
      const result = formatTimeRange(validStart, null);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatEventDate', () => {
    it('should format event date with weekday', () => {
      const result = formatEventDate(testDate);
      // Debería incluir día de la semana abreviado
      expect(result).toMatch(/\w{3,}/); // Al menos 3 caracteres para día de semana
    });

    it('should return error message for invalid date', () => {
      expect(formatEventDate(null)).toBe('Fecha inválida');
      expect(formatEventDate('invalid')).toBe('Fecha inválida');
    });
  });

  describe('startOfDay', () => {
    it('should return start of day', () => {
      const result = startOfDay(testDate);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should preserve date part', () => {
      const result = startOfDay(testDate);
      expect(result.getFullYear()).toBe(testDate.getFullYear());
      expect(result.getMonth()).toBe(testDate.getMonth());
      expect(result.getDate()).toBe(testDate.getDate());
    });

    it('should return null for invalid input', () => {
      expect(startOfDay(null)).toBeNull();
      expect(startOfDay('invalid')).toBeNull();
    });
  });

  describe('endOfDay', () => {
    it('should return end of day', () => {
      const result = endOfDay(testDate);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should preserve date part', () => {
      const result = endOfDay(testDate);
      expect(result.getFullYear()).toBe(testDate.getFullYear());
      expect(result.getMonth()).toBe(testDate.getMonth());
      expect(result.getDate()).toBe(testDate.getDate());
    });

    it('should return null for invalid input', () => {
      expect(endOfDay(null)).toBeNull();
      expect(endOfDay('invalid')).toBeNull();
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const result = addDays(testDate, 5);
      const expected = new Date(testDate);
      expected.setDate(testDate.getDate() + 5);
      
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should subtract days with negative input', () => {
      const result = addDays(testDate, -3);
      const expected = new Date(testDate);
      expected.setDate(testDate.getDate() - 3);
      
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle month/year boundaries', () => {
      const endOfMonth = new Date(2024, 0, 31);
      const result = addDays(endOfMonth, 1);
      
      expect(result.getMonth()).toBe(1); // February (0-indexed)
      expect(result.getDate()).toBe(1);
    });

    it('should return null for invalid input', () => {
      expect(addDays(null, 5)).toBeNull();
      expect(addDays('invalid', 5)).toBeNull();
    });
  });

  describe('addHours', () => {
    it('should add positive hours', () => {
      const result = addHours(testDate, 2);
      const expected = new Date(testDate);
      expected.setHours(testDate.getHours() + 2);
      
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should subtract hours with negative input', () => {
      const result = addHours(testDate, -1);
      const expected = new Date(testDate);
      expected.setHours(testDate.getHours() - 1);
      
      expect(result.getTime()).toBe(expected.getTime());
    });

    it('should handle day boundaries', () => {
      const lateEvening = new Date('2024-01-15T23:00:00');
      const result = addHours(lateEvening, 2);
      
      expect(result.getDate()).toBe(16); // Next day
      expect(result.getHours()).toBe(1);
    });

    it('should return null for invalid input', () => {
      expect(addHours(null, 2)).toBeNull();
      expect(addHours('invalid', 2)).toBeNull();
    });
  });

  describe('getTodayEvents', () => {
    const mockEvents = [
      { id: 1, start: new Date(), title: 'Today Event 1' },
      { id: 2, start: new Date('2024-01-15'), title: 'Other Day Event' },
      { id: 3, start: new Date(), title: 'Today Event 2' },
      { id: 4, start: addDays(new Date(), 1), title: 'Tomorrow Event' }
    ];

    it('should return only today events', () => {
      const result = getTodayEvents(mockEvents);
      expect(result).toHaveLength(2);
      expect(result.every(event => isSameDay(event.start, new Date()))).toBe(true);
    });

    it('should return empty array for no events today', () => {
      const eventsOtherDays = [
        { id: 1, start: addDays(new Date(), 1), title: 'Tomorrow' },
        { id: 2, start: addDays(new Date(), -1), title: 'Yesterday' }
      ];
      
      const result = getTodayEvents(eventsOtherDays);
      expect(result).toHaveLength(0);
    });

    it('should handle empty events array', () => {
      const result = getTodayEvents([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUpcomingEvents', () => {
    const now = new Date();
    const mockEvents = [
      { id: 1, start: addDays(now, 1), title: 'Tomorrow' },
      { id: 2, start: addDays(now, 3), title: 'In 3 days' },
      { id: 3, start: addDays(now, 10), title: 'Next week+' }, // Outside 7 day range
      { id: 4, start: addDays(now, -1), title: 'Yesterday' }, // Past event
      { id: 5, start: addDays(now, 2), title: 'In 2 days' },
      { id: 6, start: addDays(now, 5), title: 'In 5 days' }
    ];

    it('should return events within next 7 days', () => {
      const result = getUpcomingEvents(mockEvents);
      
      // Should exclude past events and events beyond 7 days
      expect(result).toHaveLength(4);
      expect(result.every(event => {
        const eventDate = toDate(event.start);
        return eventDate > now && eventDate <= addDays(now, 7);
      })).toBe(true);
    });

    it('should sort events by date ascending', () => {
      const result = getUpcomingEvents(mockEvents);
      
      for (let i = 1; i < result.length; i++) {
        const prevDate = toDate(result[i-1].start);
        const currDate = toDate(result[i].start);
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
      }
    });

    it('should respect limit parameter', () => {
      const result = getUpcomingEvents(mockEvents, 2);
      expect(result).toHaveLength(2);
    });

    it('should use default limit of 5', () => {
      const manyEvents = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        start: addDays(now, i + 1),
        title: `Event ${i}`
      }));
      
      const result = getUpcomingEvents(manyEvents);
      expect(result).toHaveLength(5);
    });

    it('should handle empty events array', () => {
      const result = getUpcomingEvents([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getDefaultEventDates', () => {
    it('should return object with start and end dates', () => {
      const result = getDefaultEventDates();
      
      expect(result).toHaveProperty('start');
      expect(result).toHaveProperty('end');
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });

    it('should have end date 1 hour after start', () => {
      const result = getDefaultEventDates();
      const timeDiff = result.end.getTime() - result.start.getTime();
      const oneHourInMs = 60 * 60 * 1000;
      
      expect(timeDiff).toBe(oneHourInMs);
    });

    it('should return recent dates', () => {
      const result = getDefaultEventDates();
      const now = new Date();
      
      // Start should be very close to now (within 1 second)
      const timeDiff = Math.abs(result.start.getTime() - now.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('DATE_FORMATS constants', () => {
    it('should have all expected format constants', () => {
      expect(DATE_FORMATS).toHaveProperty('DISPLAY_DATE');
      expect(DATE_FORMATS).toHaveProperty('TIME_12H');
      expect(DATE_FORMATS).toHaveProperty('DATE_LONG');
      expect(DATE_FORMATS).toHaveProperty('DATE_SHORT');
      expect(DATE_FORMATS).toHaveProperty('MONTH_YEAR');
      expect(DATE_FORMATS).toHaveProperty('WEEKDAY_SHORT');
    });

    it('should have correct format values', () => {
      expect(DATE_FORMATS.DISPLAY_DATE).toBe('es-ES');
      expect(DATE_FORMATS.TIME_12H).toHaveProperty('hour12', false);
    });
  });
}); 