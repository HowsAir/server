/**
 * @file seed.ts
 * @brief Seed file to populate the database with initial data for users, nodes, measurements, and daily stats
 * @author Juan Diaz
 */

import { PrismaClient, NodeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const saltQuantity = 10;
const password = 'Hola1234.';

async function main() {
    const hashedPassword = await bcrypt.hash(password, saltQuantity);

    // Upsert roles with predefined IDs
    const userRole = await prisma.role.upsert({
        where: { id: 1 },
        update: { name: 'User' },
        create: {
            id: 1,
            name: 'User',
        },
    });

    const adminRole = await prisma.role.upsert({
        where: { id: 2 },
        update: { name: 'Admin' },
        create: {
            id: 2,
            name: 'Admin',
        },
    });

    // Create 12 users
    let users: any = [];
    for (let i = 1; i <= 12; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@gmail.com` },
            update: {},
            create: {
                name: `User`,
                surnames: `Number${i}`,
                email: `user${i}@gmail.com`,
                phone: `+1234567890${i}`, // Assign unique phone number
                password: hashedPassword,
                roleId: i === 1 ? adminRole.id : userRole.id, // First user as admin, others as users
            },
        });
        users.push(user);
    }

    // Create nodes for users except the admin (users[0]) and one random user
    const nodes: any = [];
    for (let i = 1; i < users.length - 1; i++) {
        const node = await prisma.node.upsert({
            where: { id: i },
            update: {},
            create: {
                userId: users[i].id,
                status: NodeStatus.ACTIVE,
                lastStatusUpdate: new Date(),
            },
        });
        nodes.push(node);
    }

    // Generate measurements for each node from 8am to 8pm, 3 per hour
    const today = new Date();
    const baseLatitude = 39.47; // Base latitude
    const baseLongitude = -0.376; // Base longitude

    // Helper function to generate values with required precision and probability
    function generateValue(
        max: number,
        threshold: number,
        extra: number,
        min?: number
    ): number {
        let value = parseFloat((Math.random() * max).toFixed(3));
        if (min !== undefined && Math.random() < 0.7) {
            // 70% probability to get values below min
            value = parseFloat((Math.random() * min).toFixed(3));
        }
        return value > threshold
            ? parseFloat((value + Math.random() * extra).toFixed(3))
            : value;
    }

    for (const node of nodes) {
        const measurements: any = [];
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const dates = [yesterday, today];
        dates.forEach((date) => {
            for (let hour = 8; hour <= 20; hour++) {
                // From 8 AM to 8 PM
                for (let count = 0; count < 3; count++) {
                    // 3 measurements per hour
                    const timestamp = new Date(date);
                    timestamp.setHours(hour, Math.floor(Math.random() * 60)); // Random minutes

                    const coValue = generateValue(13, 12, 9, 9);
                    const no2Value = generateValue(0.12, 0.1, 0.11, 0.053);
                    const o3Value = generateValue(0.12, 0.1, 0.11, 0.05);

                    // Max degree variation for ~30 meters
                    const maxLatitudeVariation = 30 / 111320; // ≈ 0.000269 degrees
                    const maxLongitudeVariation =
                        maxLatitudeVariation /
                        Math.cos((baseLatitude * Math.PI) / 180);

                    // Generate latitude and longitude
                    const latitude = parseFloat(
                        (
                            baseLatitude +
                            (Math.random() * maxLatitudeVariation * 2 -
                                maxLatitudeVariation)
                        ).toFixed(6)
                    );
                    const longitude = parseFloat(
                        (
                            baseLongitude +
                            (Math.random() * maxLongitudeVariation * 2 -
                                maxLongitudeVariation)
                        ).toFixed(6)
                    );

                    measurements.push({
                        o3Value,
                        coValue,
                        no2Value,
                        latitude,
                        longitude,
                        nodeId: node.id,
                        timestamp,
                    });
                }
            }
        });

        await prisma.measurement.createMany({
            data: measurements,
        });
    }

    // Create 10,000 random measurements linked to nodes[0] within the last 30 minutes
    const maxLatitudeVariation = -0.04;
    const maxLongitudeVariation = 0.04;

    const recentMeasurements: any = [];
    const now = new Date();
    for (let i = 0; i < 50; i++) {
        const timestamp = new Date(
            now.getTime() - Math.random() * 30 * 60 * 1000 // Random time in the last 30 minutes
        );

        const latitude = parseFloat(
            (
                baseLatitude +
                (Math.random() * maxLatitudeVariation * 2 -
                    maxLatitudeVariation)
            ).toFixed(6)
        );
        const longitude = parseFloat(
            (
                baseLongitude +
                (Math.random() * maxLongitudeVariation * 2 -
                    maxLongitudeVariation)
            ).toFixed(6)
        );

        const coValue = generateValue(13, 12, 9, 9);
        const no2Value = generateValue(0.12, 0.1, 0.11, 0.053);
        const o3Value = generateValue(0.12, 0.1, 0.11, 0.05);

        recentMeasurements.push({
            o3Value,
            coValue,
            no2Value,
            latitude,
            longitude,
            nodeId: nodes[0].id,
            timestamp,
        });
    }

    await prisma.measurement.createMany({
        data: recentMeasurements,
    });

    // Create 2 daily stats for each user for the last two days
    for (const user of users) {
        const dailyStats: any = [];
        for (let k = 1; k <= 2; k++) {
            // Last two days
            const date = new Date();
            date.setDate(date.getDate() - k);

            const activeHours = parseFloat(
                (0.5 + Math.random() * 5.5).toFixed(1)
            ); // Between 0.5 and 6 hours, 1 decimal place
            const distance = Math.floor(100 + Math.random() * 3900); // Between 100 and 4000 meters, no decimals

            dailyStats.push({
                userId: user.id,
                date: date,
                activeHours,
                distance,
            });
        }

        await prisma.dailyStat.createMany({
            data: dailyStats,
        });
    }

    // Create some historic air quality maps
    const historicMaps: any[] = [];
    for (let i = 1; i <= 5; i++) {
        const timestamp = new Date();
        timestamp.setDate(new Date().getDate() - i); // Last 5 days
        timestamp.setHours(Math.floor(Math.random() * 24)); // Random hour
        timestamp.setMinutes(Math.floor(Math.random() * 60)); // Random minute
        const mapUrl = `https://cloudinary.com/maps/air-quality-map-${timestamp.toISOString()}`;
        historicMaps.push({
            url: mapUrl,
            timestamp,
        });
    }

    // Save the historic maps to the database
    await prisma.historicAirQualityMap.createMany({
        data: historicMaps,
    });

    console.log(
        'Seed data created successfully with users, nodes, measurements, and daily stats.'
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
