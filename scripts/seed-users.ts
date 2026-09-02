import 'dotenv/config';
import { PrismaClient, WorkspaceType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Environment fallback
const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/codevault';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Starting CodeVault Admin & User Setup...');

  await prisma.workspace.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.session.deleteMany();
  await prisma.member.deleteMany()

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@codevault.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const userEmail = (process.env.USER_EMAIL || 'user@codevault.com').toLowerCase().trim();
  const userPassword = process.env.USER_PASSWORD || 'User@123456';
  const userName = process.env.USER_NAME || 'Regular User';

  const workspaceName = process.env.WORKSPACE_NAME || 'CodeVault Workspace';
  const workspaceSlug = process.env.WORKSPACE_SLUG || 'codevault-workspace';

  // 1. Create or update Admin User
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      emailVerified: true,
    },
  });

  // Upsert Account for Admin
  await prisma.account.upsert({
    where: {
      providerId_providerAccountId: {
        providerId: 'credential',
        providerAccountId: adminEmail,
      },
    },
    update: {
      password: adminPasswordHash,
      userId: adminUser.id,
    },
    create: {
      userId: adminUser.id,
      providerId: 'credential',
      providerAccountId: adminEmail,
      password: adminPasswordHash,
    },
  });

  console.log(`✅ Admin Account ready: ${adminEmail}`);

  // 2. Create or update Regular User
  const userPasswordHash = await bcrypt.hash(userPassword, 12);

  const regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      name: userName,
      emailVerified: true,
    },
    create: {
      email: userEmail,
      name: userName,
      emailVerified: true,
    },
  });

  // Upsert Account for Regular User
  await prisma.account.upsert({
    where: {
      providerId_providerAccountId: {
        providerId: 'credential',
        providerAccountId: userEmail,
      },
    },
    update: {
      password: userPasswordHash,
      userId: regularUser.id,
    },
    create: {
      userId: regularUser.id,
      providerId: 'credential',
      providerAccountId: userEmail,
      password: userPasswordHash,
    },
  });

  console.log(`✅ User Account ready: ${userEmail}`);

  // 3. Create or find Workspace
  let workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
        type: WorkspaceType.ORGANIZATION,
        ownerId: adminUser.id,
      },
    });
    console.log(`✅ Workspace created: ${workspace.name} (${workspace.slug})`);
  } else {
    console.log(`ℹ️  Workspace already exists: ${workspace.name} (${workspace.slug})`);
  }

  // 4. Ensure System Roles exist for this workspace
  const rolesDef = [
    {
      name: 'Owner',
      description: 'Full workspace access',
      permissions: ['*'],
    },
    {
      name: 'Admin',
      description: 'Administrative access',
      permissions: [
        'workspace:update',
        'member:manage',
        'role:manage',
        'invite:manage',
        'doc:create',
        'doc:read',
        'doc:update',
        'doc:delete',
        'comment:create',
        'comment:read',
        'comment:update',
        'comment:delete',
        'comment:resolve',
        'webhook:manage',
        'apikey:manage',
        'audit:read',
        'billing:read',
      ],
    },
    {
      name: 'Member',
      description: 'Standard member access',
      permissions: [
        'doc:create',
        'doc:read',
        'doc:update',
        'comment:create',
        'comment:read',
        'comment:update',
        'member:read',
      ],
    },
    {
      name: 'Guest',
      description: 'Read-only access',
      permissions: ['doc:read', 'comment:read', 'member:read'],
    },
  ];

  const createdRoles: Record<string, string> = {};

  for (const rDef of rolesDef) {
    const role = await prisma.role.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name: rDef.name,
        },
      },
      update: {
        permissions: rDef.permissions,
        description: rDef.description,
        isSystem: true,
      },
      create: {
        workspaceId: workspace.id,
        name: rDef.name,
        description: rDef.description,
        isSystem: true,
        permissions: rDef.permissions,
      },
    });
    createdRoles[rDef.name] = role.id;
  }
  console.log(`✅ System roles initialized (${Object.keys(createdRoles).join(', ')})`);

  // 5. Add Admin User as Owner in Member table
  await prisma.member.upsert({
    where: {
      userId_workspaceId: {
        userId: adminUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {
      roleId: createdRoles['Owner'],
      isActive: true,
    },
    create: {
      userId: adminUser.id,
      workspaceId: workspace.id,
      roleId: createdRoles['Owner'],
      isActive: true,
    },
  });
  console.log(`✅ Admin (${adminEmail}) assigned to 'Owner' role in workspace`);

  // 6. Add Regular User as Member in Member table
  await prisma.member.upsert({
    where: {
      userId_workspaceId: {
        userId: regularUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {
      roleId: createdRoles['Member'],
      isActive: true,
    },
    create: {
      userId: regularUser.id,
      workspaceId: workspace.id,
      roleId: createdRoles['Member'],
      isActive: true,
    },
  });
  console.log(`✅ User (${userEmail}) assigned to 'Member' role in workspace`);

  console.log('\n🎉 Setup Completed Successfully!');
  console.log('──────────────────────────────────────────────────');
  console.log('📋 CREATED CREDENTIALS:');
  console.log(`👑 ADMIN:`);
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role:     Owner`);
  console.log(`👤 USER:`);
  console.log(`   Email:    ${userEmail}`);
  console.log(`   Password: ${userPassword}`);
  console.log(`   Role:     Member`);
  console.log(`🏢 WORKSPACE:`);
  console.log(`   Name:     ${workspace.name}`);
  console.log(`   Slug:     ${workspace.slug}`);
  console.log('──────────────────────────────────────────────────\n');
}

seed()
  .catch((e) => {
    console.error('❌ Error executing seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
