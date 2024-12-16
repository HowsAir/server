/**
 * @file index.ts
 * @brief Cron jobs initialization file.
 * @author Juan Diaz
 */

import { setUpGenerateAirQualityMapJob } from './jobs/airQualityMapJob';

/**
 * 
 * Initialize all cron jobs in the application.
 * 
 */
export const initializeCronJobs = () => {
    console.log('Initializing cron jobs...');

    setUpGenerateAirQualityMapJob();

    console.log('All cron jobs initialized!');
};