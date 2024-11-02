/**
 * @file seed.ts
 * @brief Seed file to populate the database with initial data
 * @author Juan Diaz
 */

import { PrismaClient, NodeStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const userRole = await prisma.role.upsert({
        where: { name: 'User' },
        update: {},
        create: { name: 'User' },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin' },
    });

    const user1 = await prisma.user.upsert({
        where: { email: 'user1@example.com' },
        update: {},
        create: {
            name: 'User',
            surnames: 'One',
            email: 'user1@example.com',
            password: 'hashed_password_1',
            roleId: userRole.id,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'user2@example.com' },
        update: {},
        create: {
            name: 'User',
            surnames: 'Two',
            email: 'user2@example.com',
            password: 'hashed_password_2',
            roleId: userRole.id,
        },
    });

    const node1 = await prisma.node.upsert({
        where: { id: 1 },
        update: {},
        create: {
            userId: user1.id,
            status: NodeStatus.ACTIVE,
            lastStatusUpdate: new Date(),
        },
    });

    const measurements = [
        {
            o3Value: 0.4,
            coValue: 1.0,
            no2Value: 0.6,
            latitude: 40.7128,
            longitude: -74.006,
            nodeId: node1.id,
        },
        {
            o3Value: 0.5,
            coValue: 1.2,
            no2Value: 0.7,
            latitude: 40.7138,
            longitude: -74.005,
            nodeId: node1.id,
        },
        {
            o3Value: 0.3,
            coValue: 1.1,
            no2Value: 0.5,
            latitude: 40.7118,
            longitude: -74.007,
            nodeId: node1.id,
        },
        {
            o3Value: 0.6,
            coValue: 1.4,
            no2Value: 0.8,
            latitude: 40.712,
            longitude: -74.008,
            nodeId: node1.id,
        },
        {
            o3Value: 0.2,
            coValue: 0.9,
            no2Value: 0.4,
            latitude: 40.7135,
            longitude: -74.009,
            nodeId: node1.id,
        },
    ];

    await Promise.all(
        measurements.map((measurement) =>
            prisma.measurement.create({
                data: {
                    ...measurement,
                    timestamp: new Date(),
                },
            })
        )
    );

    await prisma.dailyStat.create({
        data: {
            userId: user1.id,
            date: new Date(),
            activeHours: 2.5,
            distance: 5.1,
        },
    });

    console.log('Seed data created successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
