/**
 * @file generateMapJob.ts
 * @brief Cron job that generates an interactive map every 30 minutes.
 * @author Juan Diaz
 */

import { Cron, scheduledJobs } from 'croner';
import { measurementsService } from '../../services/measurementsService';
import { generateHTMLMap } from '../../utils/generateMapUtils';
import { uploadMapToCloudinary } from '../../services/cloudinaryService';
import { CloudinaryFolders } from '../../types/users/CloudinaryFolders';
import { historicAirQualityMapsService } from '../../services/historicAirQualityMapsService';

export const frequencyInMinutes = 30;
const pattern = `*/${frequencyInMinutes} * * * *`;
const name = 'generateAirQualityMapJob';

/**
 *
 * Sets up a cron job that generates an interactive map of air quality data every 30 minutes.
 *
 * @returns void
 */
export const setUpGenerateAirQualityMapJob = (): void => {
    const generateAirQualityMapJob = new Cron(
        pattern,
        {
            name: name,
            protect: true,
        },
        generateAirQualityMap
    );

    console.log('Triggering generateAirQualityMapJob for the first time...');

    generateAirQualityMapJob.trigger();

    console.log(
        'Next run for generateAirQualityMapJob:',
        generateAirQualityMapJob.nextRun()
    );
};

/**
 *
 * Generates an air quality map using data from the measurements service.
 * The map is generated in HTML and uploaded to Cloudinary
 *
 * generateAirQualityMapJob -> Promise<void>
 *
 * @returns Promise<void>
 */
const generateAirQualityMap = async (): Promise<void> => {
    console.log('Executing generateAirQualityMapJob():', new Date());

    const timeRange = {
        start: new Date(Date.now() - frequencyInMinutes * 60 * 1000),
        end: new Date(),
    };
    
    const airQualityMapTimestamp = new Date(timeRange.end);

    airQualityMapTimestamp.setSeconds(0, 0);
    
    try {
        const mapsGeolocatedAirQualityReadings =
            await measurementsService.getMapsGeolocatedAirQualityReadingsInRange(
                timeRange
            );

        console.log(
            'Geolocated air quality readings:',
            JSON.stringify(mapsGeolocatedAirQualityReadings, null, 2)
        );

        const html = await generateHTMLMap(mapsGeolocatedAirQualityReadings);

        const newMapUrl = await uploadMapToCloudinary(
            html,
            CloudinaryFolders.AIR_QUALITY_MAPS
        );

        await historicAirQualityMapsService.saveHistoricAirQualityMap(newMapUrl, airQualityMapTimestamp)
        
        console.log('Task executed successfully.');
        console.log('New map URL:', newMapUrl);
    } catch (error) {
        console.error('Error occurred during task execution:', error);
    }
};
