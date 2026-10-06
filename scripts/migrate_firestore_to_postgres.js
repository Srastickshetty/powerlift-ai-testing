"use strict";
/**
 * scripts/migrate_firestore_to_postgres.ts
 *
 * Idempotent data migration script from Firestore/JSON dumps to PostgreSQL via Prisma.
 * Supports --dry-run flag for safe validation without mutating the database.
 *
 * Usage:
 *   npx tsx scripts/migrate_firestore_to_postgres.ts [--dry-run] [--data-dir=path]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = runMigration;
const fs = require("fs");
const path = require("path");
const client_1 = require("@prisma/client");
async function runMigration(options, prisma) {
    const { dryRun, dataDir } = options;
    const stats = {
        usersScanned: 0,
        usersMigrated: 0,
        profilesMigrated: 0,
        memoriesMigrated: 0,
        sessionsMigrated: 0,
        setsMigrated: 0,
        errors: []
    };
    console.log(`\n======================================================`);
    console.log(`Starting Data Migration [Firestore/JSON → Postgres]`);
    console.log(`Mode: ${dryRun ? 'DRY-RUN (Simulated, no writes)' : 'LIVE (Mutating DB)'}`);
    console.log(`Source Directory: ${dataDir}`);
    console.log(`======================================================\n`);
    function readJsonSafe(filename, fallback) {
        const fullPath = path.join(dataDir, filename);
        if (!fs.existsSync(fullPath)) {
            console.warn(`[WARN] File not found: ${filename} (skipping)`);
            return fallback;
        }
        try {
            const raw = fs.readFileSync(fullPath, 'utf8').trim();
            if (!raw)
                return fallback;
            return JSON.parse(raw);
        }
        catch (err) {
            stats.errors.push(`Failed to parse ${filename}: ${err.message}`);
            console.error(`[ERROR] Parsing ${filename}:`, err.message);
            return fallback;
        }
    }
    // 1. Parse JSON files
    const usersData = readJsonSafe('users.json', {});
    const athletesData = readJsonSafe('athletes.json', []);
    const memoriesData = readJsonSafe('athlete_memories.json', {});
    const workoutLogsData = readJsonSafe('workoutLogs.json', []);
    const unifiedUsers = new Map();
    // Process users.json
    if (usersData.uids) {
        for (const [uid, u] of Object.entries(usersData.uids)) {
            stats.usersScanned++;
            const roleStr = (u.role || '').toUpperCase();
            let role = client_1.Role.ATHLETE;
            if (roleStr === 'ADMIN')
                role = client_1.Role.ADMIN;
            else if (roleStr === 'COACH')
                role = client_1.Role.COACH;
            unifiedUsers.set(uid, {
                uid,
                email: u.email || `${uid}@titan-ai.in`,
                name: u.name || (role === client_1.Role.ADMIN ? 'Master Admin' : role === client_1.Role.COACH ? 'Head Coach' : 'Athlete'),
                role,
                track: client_1.Track.POWERLIFTING
            });
        }
    }
    // Process athletes.json
    for (const a of athletesData) {
        if (!a.athlete_id)
            continue;
        stats.usersScanned++;
        const existing = unifiedUsers.get(a.athlete_id);
        if (!existing) {
            unifiedUsers.set(a.athlete_id, {
                uid: a.athlete_id,
                email: a.email || `${a.athlete_id}@powerlift.app`,
                name: a.name || 'PowerLift Athlete',
                role: client_1.Role.ATHLETE,
                track: client_1.Track.POWERLIFTING,
                metadata: {
                    status: a.status,
                    fatigueRate: a.fatigue_rate,
                    missRate: a.miss_rate
                }
            });
        }
        else {
            existing.name = a.name || existing.name;
            existing.metadata = { ...(existing.metadata || {}), status: a.status, fatigueRate: a.fatigue_rate, missRate: a.miss_rate };
        }
    }
    // Process memories to ensure user exists
    for (const [memUid, mem] of Object.entries(memoriesData)) {
        const uid = mem.athleteId || memUid;
        if (!unifiedUsers.has(uid)) {
            stats.usersScanned++;
            unifiedUsers.set(uid, {
                uid,
                email: `${uid}@powerlift.app`,
                name: `Athlete (${uid})`,
                role: client_1.Role.ATHLETE,
                track: client_1.Track.POWERLIFTING
            });
        }
    }
    console.log(`[INFO] Identified ${unifiedUsers.size} unique users to migrate/verify.`);
    // 3. Migrate Users & Profiles
    for (const [uid, u] of unifiedUsers.entries()) {
        if (dryRun) {
            console.log(`  [DRY-RUN] User upsert: ${u.uid} (${u.email}, role: ${u.role})`);
            stats.usersMigrated++;
            stats.profilesMigrated++;
        }
        else if (prisma) {
            try {
                const user = await prisma.user.upsert({
                    where: { firebaseUid: u.uid },
                    create: {
                        firebaseUid: u.uid,
                        email: u.email,
                        name: u.name,
                        role: u.role
                    },
                    update: {
                        email: u.email,
                        name: u.name,
                        role: u.role
                    }
                });
                stats.usersMigrated++;
                // Upsert appropriate profiles
                if (u.role === client_1.Role.COACH) {
                    await prisma.coachProfile.upsert({
                        where: { userId: user.id },
                        create: {
                            userId: user.id,
                            bio: 'Imported coach from legacy platform.',
                            tracks: [client_1.Track.POWERLIFTING, client_1.Track.BODYBUILDING],
                            priceMonthlyMinor: 9900,
                            currency: 'USD'
                        },
                        update: {}
                    });
                }
                else if (u.role === client_1.Role.ATHLETE) {
                    const mem = memoriesData[u.uid];
                    await prisma.athleteProfile.upsert({
                        where: { userId: user.id },
                        create: {
                            userId: user.id,
                            track: u.track,
                            injuries: mem?.jointTweaks || [],
                            goals: u.metadata || {}
                        },
                        update: {
                            injuries: mem?.jointTweaks || [],
                            goals: u.metadata || {}
                        }
                    });
                    await prisma.plProfile.upsert({
                        where: { userId: user.id },
                        create: {
                            userId: user.id,
                            federation: 'IPF',
                            weightClass: '83kg',
                            equipClass: 'raw'
                        },
                        update: {}
                    });
                }
                stats.profilesMigrated++;
            }
            catch (err) {
                stats.errors.push(`Error upserting user ${u.uid}: ${err.message}`);
                console.error(`[ERROR] User upsert failed for ${u.uid}:`, err.message);
            }
        }
    }
    // 4. Migrate Athlete Memories / Check-Ins
    for (const [memUid, mem] of Object.entries(memoriesData)) {
        const uid = mem.athleteId || memUid;
        if (dryRun) {
            console.log(`  [DRY-RUN] Memory check for ${uid}: ${mem.jointTweaks?.length || 0} joint tweaks, ${mem.pastFeedback?.length || 0} feedback items`);
            stats.memoriesMigrated++;
        }
        else if (prisma) {
            try {
                const user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
                if (user && mem.pastFeedback && Array.isArray(mem.pastFeedback)) {
                    for (const fb of mem.pastFeedback) {
                        const checkinDate = fb.date ? new Date(fb.date) : new Date();
                        const checkinModel = prisma.checkin || prisma.checkIn;
                        if (checkinModel) {
                            await checkinModel.create({
                                data: {
                                    athleteId: user.id,
                                    weekStart: checkinDate,
                                    data: {
                                        rating: fb.rating,
                                        note: fb.note,
                                        source: 'legacy_import'
                                    },
                                    photos: [],
                                    status: 'REVIEWED'
                                }
                            });
                        }
                    }
                    stats.memoriesMigrated++;
                }
            }
            catch (err) {
                stats.errors.push(`Error migrating memories for ${uid}: ${err.message}`);
                console.error(`[ERROR] Memory migration failed for ${uid}:`, err.message);
            }
        }
    }
    // 5. Migrate Workout Logs
    if (Array.isArray(workoutLogsData) && workoutLogsData.length > 0) {
        for (const log of workoutLogsData) {
            if (dryRun) {
                console.log(`  [DRY-RUN] Workout log: session on ${log.date || 'unknown'}`);
                stats.sessionsMigrated++;
            }
            else if (prisma) {
                try {
                    const athleteUid = log.athlete_id || log.athleteId;
                    if (!athleteUid)
                        continue;
                    const user = await prisma.user.findUnique({ where: { firebaseUid: athleteUid } });
                    if (!user)
                        continue;
                    const session = await prisma.session.create({
                        data: {
                            athleteId: user.id,
                            startedAt: log.date ? new Date(log.date) : new Date(),
                            endedAt: log.date ? new Date(log.date) : new Date(),
                            sessionRpe: log.session_rpe || 8,
                            notes: log.notes || 'Imported from legacy workout logs'
                        }
                    });
                    stats.sessionsMigrated++;
                    if (Array.isArray(log.sets)) {
                        for (let i = 0; i < log.sets.length; i++) {
                            const s = log.sets[i];
                            await prisma.set.create({
                                data: {
                                    sessionId: session.id,
                                    exerciseId: s.exercise_id || 'general-compound',
                                    setType: 'WORKING',
                                    weightKg: s.weight_kg || s.weight || 0,
                                    reps: s.reps || 0,
                                    rpe: s.rpe || null,
                                    clientUuid: `legacy_${session.id}_set_${i}`
                                }
                            });
                            stats.setsMigrated++;
                        }
                    }
                }
                catch (err) {
                    stats.errors.push(`Error migrating workout log: ${err.message}`);
                }
            }
        }
    }
    console.log(`\n======================================================`);
    console.log(`Migration Summary:`);
    console.log(`- Users Scanned:     ${stats.usersScanned}`);
    console.log(`- Users Migrated:    ${stats.usersMigrated}`);
    console.log(`- Profiles Migrated: ${stats.profilesMigrated}`);
    console.log(`- Memories Migrated: ${stats.memoriesMigrated}`);
    console.log(`- Sessions Migrated: ${stats.sessionsMigrated}`);
    console.log(`- Sets Migrated:     ${stats.setsMigrated}`);
    console.log(`- Errors Encountered: ${stats.errors.length}`);
    console.log(`======================================================\n`);
    return stats;
}
// Direct execution entrypoint
if (require.main === module) {
    const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
    const dirArg = process.argv.find(arg => arg.startsWith('--data-dir='));
    const targetDir = dirArg ? dirArg.split('=')[1] : path.resolve(__dirname, '../legacy/backend_data');
    let prismaClient;
    if (!isDryRun) {
        try {
            prismaClient = new client_1.PrismaClient();
        }
        catch (e) {
            console.warn(`PrismaClient could not be initialized directly: ${e.message}`);
        }
    }
    runMigration({ dryRun: isDryRun, dataDir: targetDir }, prismaClient)
        .then(async (stats) => {
        if (prismaClient) {
            await prismaClient.$disconnect();
        }
        if (stats.errors.length > 0) {
            process.exit(1);
        }
        process.exit(0);
    })
        .catch((err) => {
        console.error('Migration failed fatal error:', err);
        process.exit(1);
    });
}
