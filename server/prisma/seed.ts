import { PrismaClient, MovieStatus } from '@prisma/client';

const prisma = new PrismaClient();

// TMDB IDs for popular movies to ensure realism
const TMDB_MOVIE_IDS = [
    278, 19995, 13, 238, 550, 49026, 429617, 157336, 11, 680 // The Shawshank Redemption, Avatar, Forrest Gump, The Godfather, Fight Club, The Hobbit, Shazam, Interstellar, Star Wars, Pulp Fiction
];

async function main() {
    // Dynamic import to handle ES Module compatibility with ts-node
    const { faker } = await import('@faker-js/faker');
    console.log('--- Start Seeding ---');

    // --- 1. CLEANUP ---
    await prisma.userMovieEntry.deleteMany({});
    await prisma.userMovieData.deleteMany({});
    await prisma.friendship.deleteMany({});
    await prisma.friendRequest.deleteMany({});
    await prisma.movies.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Previous data cleared.');

    const NUM_USERS = 50;
    const users = [];

    // 2. GENERATE DUMMY USERS
    // Note: Password is 'password123' hashed (in production, use bcrypt)
    // For testing: all users have password 'password123'
    const hashedPassword = '$2a$10$Nkt6lv00Day4lfzoPd9Y5.otDwn3XcGueGnB8U10bUCesfAsL767.'; // bcrypt hash of 'password123'

    // Create special "God" user first
    const godUser = await prisma.user.create({
        data: {
            email: 'god@g.gg',
            username: 'God',
            name: 'God',
            bio: 'The omnipresent user - friend to all',
            avatar: faker.image.avatar(),
            password: hashedPassword,
            createdAt: new Date(),
        },
    });
    users.push(godUser);
    console.log('Created special God user (god@g.gg).');

    // Create regular users
    for (let i = 0; i < NUM_USERS; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                username: faker.internet.username(),
                name: faker.person.fullName(),
                bio: faker.lorem.sentences(1),
                avatar: faker.image.avatar(),
                password: hashedPassword, // Add password for login capability
                createdAt: faker.date.past({ years: 2 }),
            },
        });
        users.push(user);
    }
    console.log(`Created ${NUM_USERS} regular users with password 'password123'.`);

    // -----------------------------------------------------
    // 3. SEED CORE MOVIE DATA (Movies)
    // -----------------------------------------------------
    for (const tmdbId of TMDB_MOVIE_IDS) {
        await prisma.movies.upsert({
            where: { id: tmdbId },
            update: {},
            create: {
                id: tmdbId,
            },
        });
    }
    console.log(`Seeded ${TMDB_MOVIE_IDS.length} movies.`);

    const movies = await prisma.movies.findMany();

    // 4. GENERATE FRIENDSHIPS AND REQUESTS

    // First, make God user friends with EVERYONE
    console.log('Creating friendships for God user...');
    let godFriendshipCount = 0;
    for (const user of users) {
        // Skip God user itself
        if (user.id === godUser.id) continue;

        const [friend_a_id, friend_b_id] = [godUser.id, user.id].sort();

        try {
            await prisma.friendship.create({
                data: {
                    friend_a_id: friend_a_id,
                    friend_b_id: friend_b_id,
                    createdAt: new Date(),
                },
            });
            godFriendshipCount++;
        } catch (e: any) {
            if (e.code !== 'P2002') {
                console.error('Error creating God friendship:', e);
            }
        }
    }
    console.log(`God user is now friends with ${godFriendshipCount} users.`);

    // Now generate regular friendships between other users
    for (const userA of users) {
        // Skip God user (already has all friendships)
        if (userA.id === godUser.id) continue;

        // a. ACCEPTED FRIENDSHIPS
        const numFriends = faker.number.int({ min: 1, max: 8 });
        for (let i = 0; i < numFriends; i++) {
            const userB = faker.helpers.arrayElement(users.filter(u => u.id !== userA.id && u.id !== godUser.id));
            const [friend_a_id, friend_b_id] = [userA.id, userB.id].sort();

            try {
                await prisma.friendship.create({
                    data: {
                        friend_a_id: friend_a_id,
                        friend_b_id: friend_b_id,
                        createdAt: faker.date.recent({ days: 60 }),
                    },
                });
            } catch (e: any) {
                // Ignore P2002 duplicates (unique constraint violations)
                if (e.code !== 'P2002') {
                    console.error('Error creating friendship:', e);
                }
            }
        }

        // b. PENDING FRIEND REQUESTS (3% chance a user has a pending request)
        if (faker.datatype.boolean(0.03)) {
            const receiver = faker.helpers.arrayElement(users.filter(u => u.id !== userA.id));
            try {
                await prisma.friendRequest.create({
                    data: {
                        senderId: userA.id,
                        receiverId: receiver.id,
                    }
                });
            } catch (e: any) {
                // Ignore P2002 duplicates (unique constraint violations)
                if (e.code !== 'P2002') {
                    console.error('Error creating friend request:', e);
                }
            }
        }
    }
    console.log('Friendships and requests created.');

    // Update friendCount for all users
    console.log('Updating friendCount for all users...');
    for (const user of users) {
        const friendCount = await prisma.friendship.count({
            where: {
                OR: [
                    { friend_a_id: user.id },
                    { friend_b_id: user.id }
                ]
            }
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { friendCount: friendCount }
        });
    }
    console.log('Updated friendCount for all users.');


    // 5. GENERATE MOVIE DATA (Ratings & Entries)
    for (const user of users) {
        const numActions = faker.number.int({ min: 10, max: 30 });

        for (let i = 0; i < numActions; i++) {
            const randomMovie = faker.helpers.arrayElement(movies);

            // MOVIE ENTRY (WATCHED/PLANNED)
            const status = faker.helpers.arrayElement([MovieStatus.WATCHED, MovieStatus.PLANNED]);
            try {
                await prisma.userMovieEntry.create({
                    data: {
                        user_id: user.id,
                        movie_id: randomMovie.id,
                        status: status,
                    }
                });
            } catch (e: any) {
                // Ignore P2002 duplicates (unique constraint violations)
                if (e.code !== 'P2002') {
                    console.error('Error creating user movie entry:', e);
                }
            }

            // RATING/REVIEW (Only for WATCHED entries, 70% chance)
            if (status === MovieStatus.WATCHED && faker.datatype.boolean(0.7)) {
                try {
                    await prisma.userMovieData.create({
                        data: {
                            user_id: user.id,
                            movie_id: randomMovie.id,
                            rating: faker.number.int({ min: 1, max: 10 }),
                            description: faker.datatype.boolean(0.5) ? faker.lorem.sentences(1) : null,
                        }
                    });
                } catch (e: any) {
                    // Check for P2002 (Unique constraint failed) and skip.
                    if (e.code === 'P2002') {
                        // This means the user already rated this movie in a previous loop iteration.
                    } else {
                        // Log any other unexpected error
                        console.error('Error creating user movie data:', e);
                    }
                }
            }
        }
    }
    console.log('User movie data and entries created.');

    console.log('--- Seeding finished. ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });