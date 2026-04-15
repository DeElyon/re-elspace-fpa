// server/src/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mobile-development' },
      update: {},
      create: {
        name: 'Mobile Development',
        slug: 'mobile-development',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ui-ux-design' },
      update: {},
      create: {
        name: 'UI/UX Design',
        slug: 'ui-ux-design',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'content-writing' },
      update: {},
      create: {
        name: 'Content Writing',
        slug: 'content-writing',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'digital-marketing' },
      update: {},
      create: {
        name: 'Digital Marketing',
        slug: 'digital-marketing',
      },
    }),
  ])

  console.log('✅ Categories created')

  // Create skills
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React', category: 'Web Development' },
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js', category: 'Web Development' },
    }),
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript', category: 'Web Development' },
    }),
    prisma.skill.upsert({
      where: { name: 'Python' },
      update: {},
      create: { name: 'Python', category: 'Web Development' },
    }),
    prisma.skill.upsert({
      where: { name: 'React Native' },
      update: {},
      create: { name: 'React Native', category: 'Mobile Development' },
    }),
    prisma.skill.upsert({
      where: { name: 'Figma' },
      update: {},
      create: { name: 'Figma', category: 'UI/UX Design' },
    }),
  ])

  console.log('✅ Skills created')

  // Create admin user
  const adminPassword = await hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elspace.tech' },
    update: {},
    create: {
      email: 'admin@elspace.tech',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      uniqueUserId: 'ELSP_AD_000001',
      emailVerified: new Date(),
      profile: {
        create: {
          title: 'Platform Administrator',
          bio: 'EL SPACE platform administrator',
        },
      },
      wallet: {
        create: {
          availableBalance: 0,
          currency: 'USD',
        },
      },
    },
  })

  console.log('✅ Admin user created')

  // Create test freelancer
  const freelancerPassword = await hash('Freelancer123!', 12)
  const freelancer = await prisma.user.upsert({
    where: { email: 'freelancer@example.com' },
    update: {},
    create: {
      email: 'freelancer@example.com',
      password: freelancerPassword,
      firstName: 'John',
      lastName: 'Developer',
      role: 'FREELANCER',
      uniqueUserId: 'ELSP_FR_000001',
      emailVerified: new Date(),
      headline: 'Full-Stack Developer | React & Node.js Expert',
      bio: 'Experienced full-stack developer with 5+ years of experience building web applications.',
      location: 'San Francisco, CA',
      profile: {
        create: {
          title: 'Senior Full-Stack Developer',
          hourlyRate: 75,
          yearsExperience: 5,
          skills: {
            connect: [{ name: 'React' }, { name: 'Node.js' }, { name: 'TypeScript' }],
          },
        },
      },
      freelancerProfile: {
        create: {
          verificationLevel: 'VERIFIED',
          portfolioVerified: true,
          identityVerified: true,
        },
      },
      wallet: {
        create: {
          availableBalance: 1250.00,
          totalEarned: 15750.00,
          currency: 'USD',
        },
      },
    },
  })

  console.log('✅ Test freelancer created')

  // Create test client
  const clientPassword = await hash('Client123!', 12)
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: clientPassword,
      firstName: 'Sarah',
      lastName: 'Startup',
      role: 'CLIENT',
      uniqueUserId: 'ELSP_CL_000001',
      emailVerified: new Date(),
      profile: {
        create: {
          title: 'Founder & CEO',
        },
      },
      clientProfile: {
        create: {
          companyName: 'TechStart Inc.',
          industry: 'SaaS',
          verifiedClient: true,
          totalSpent: 25000.00,
          projectsPosted: 8,
        },
      },
      wallet: {
        create: {
          availableBalance: 5000.00,
          totalSpent: 25000.00,
          currency: 'USD',
        },
      },
    },
  })

  console.log('✅ Test client created')

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      clientId: client.id,
      title: 'E-commerce Website Development',
      description: 'Looking for an experienced developer to build a modern e-commerce website using React and Node.js. The site should include product listings, shopping cart, payment integration, and an admin dashboard.',
      categoryId: categories[0].id,
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      budgetType: 'RANGE',
      budgetMin: 3000,
      budgetMax: 5000,
      currency: 'USD',
      duration: 'ONE_TO_THREE_MONTHS',
      status: 'OPEN',
      publishedAt: new Date(),
      proposalCount: 3,
    },
  })

  console.log('✅ Sample project created')

  // Create sample community
  const community = await prisma.community.upsert({
    where: { slug: 'react-developers' },
    update: {},
    create: {
      name: 'React Developers',
      slug: 'react-developers',
      description: 'A community for React developers to share knowledge, ask questions, and network.',
      type: 'PUBLIC',
      ownerId: freelancer.id,
      membersCount: 1,
      members: {
        create: {
          userId: freelancer.id,
          role: 'OWNER',
        },
      },
    },
  })

  console.log('✅ Sample community created')

  // Create system settings
  await prisma.systemSetting.upsert({
    where: { key: 'platform_fee_percentage' },
    update: {},
    create: {
      key: 'platform_fee_percentage',
      value: { value: 7 },
      description: 'Platform fee percentage charged on transactions',
    },
  })

  await prisma.systemSetting.upsert({
    where: { key: 'instant_withdrawal_fee' },
    update: {},
    create: {
      key: 'instant_withdrawal_fee',
      value: { value: 5 },
      description: 'Fee percentage for instant withdrawals',
    },
  })

  console.log('✅ System settings created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
