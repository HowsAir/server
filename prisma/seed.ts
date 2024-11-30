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
    for (const node of nodes) {
        const measurements: any = [];
        const today = new Date();
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

                    // Helper function to generate values with required precision and probability
                    function generateValue(max: number, threshold: number, extra: number, min?: number): number {
                        let value = parseFloat((Math.random() * max).toFixed(3));
                        if (min !== undefined && Math.random() < 0.7) { // 70% probability to get values below min
                            value = parseFloat((Math.random() * min).toFixed(3));
                        }
                        return value > threshold ? parseFloat((value + Math.random() * extra).toFixed(3)) : value;
                    }

                    const coValue = generateValue(13, 12, 9, 9);
                    const no2Value = generateValue(0.12, 0.1, 0.11, 0.053);
                    const o3Value = generateValue(0.12, 0.1, 0.11, 0.05);

                    const latitude = parseFloat((40.7128 + Math.random() * 0.01).toFixed(6));
                    const longitude = parseFloat((-74.006 + Math.random() * 0.01).toFixed(6));

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
