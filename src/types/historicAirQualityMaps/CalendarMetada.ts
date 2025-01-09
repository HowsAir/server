
/**
 * CalendarMetadata is the response object for the getCalendarMetadata service method.
 * 
 * Groups available dates and times for a specific year and month.
 * 
 * Also includes the first available year for the calendar.
 * 
 * So then the client can request a specific historic air quality map by timestamp.
 */
export interface CalendarMetadata {
    firstAvailableYear: number | null; 
    year: number; 
    month: number; 
    availableDates: Array<{
        date: Date; 
        times: string[]; 
    }>;
}
