/**
 * SkillBridge BD - Database Seed Script
 *
 * Demo Accounts:
 * - Admin:       ADMIN_EMAIL (from .env, default: admin@example.com)
 * - Employer 1:  employer1@techcorp.bd (TechCorp Bangladesh)
 * - Employer 2:  employer2@greenpath.bd (GreenPath Digital)
 * - Candidate 1: candidate.rahim@gmail.com (Rahim Ahmed - Junior Full-Stack Dev)
 * - Candidate 2: candidate.fatima@gmail.com (Fatima Begum - UI/UX Designer & Frontend)
 *
 * Password for demo accounts: SEED_DEMO_PASSWORD env var or "Demo@12345"
 * Admin password: ADMIN_PASSWORD from .env
 *
 * This script is fully idempotent (safe to run multiple times without duplicating data).
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import {
  Role,
  ExperienceLevel,
  JobType,
  WorkArrangement,
  JobStatus,
  ProjectKind,
} from "../src/generated/prisma/enums";

interface SkillSeedData {
  name: string;
  slug: string;
  aliases: string[];
}

const SKILLS_DATA: SkillSeedData[] = [
  // Programming Languages
  { name: "JavaScript", slug: "javascript", aliases: ["js"] },
  { name: "TypeScript", slug: "typescript", aliases: ["ts"] },
  { name: "Python", slug: "python", aliases: ["py"] },
  { name: "Java", slug: "java", aliases: [] },
  { name: "C#", slug: "csharp", aliases: ["c#", "cs"] },
  { name: "C++", slug: "cpp", aliases: ["c++"] },
  { name: "PHP", slug: "php", aliases: [] },
  { name: "Go", slug: "golang", aliases: ["golang", "go-lang"] },
  { name: "Rust", slug: "rust", aliases: ["rustlang"] },
  { name: "SQL", slug: "sql", aliases: [] },

  // Frontend Frameworks & Libraries
  { name: "React", slug: "react", aliases: ["reactjs", "react.js"] },
  { name: "Next.js", slug: "nextjs", aliases: ["next", "next.js"] },
  { name: "Vue.js", slug: "vuejs", aliases: ["vue", "vue.js"] },
  { name: "Angular", slug: "angular", aliases: ["angularjs", "ng"] },
  { name: "HTML5", slug: "html5", aliases: ["html"] },
  { name: "CSS3", slug: "css3", aliases: ["css"] },
  { name: "Tailwind CSS", slug: "tailwindcss", aliases: ["tailwind", "tailwind-css"] },
  { name: "Bootstrap", slug: "bootstrap", aliases: ["bs"] },
  { name: "SASS", slug: "sass", aliases: ["scss"] },

  // Backend Frameworks & Runtimes
  { name: "Node.js", slug: "nodejs", aliases: ["node", "node.js"] },
  { name: "Express.js", slug: "expressjs", aliases: ["express", "express.js"] },
  { name: "NestJS", slug: "nestjs", aliases: ["nest"] },
  { name: "Django", slug: "django", aliases: [] },
  { name: "FastAPI", slug: "fastapi", aliases: [] },
  { name: "Flask", slug: "flask", aliases: [] },
  { name: "Spring Boot", slug: "spring-boot", aliases: ["spring", "springboot"] },
  { name: ".NET", slug: "dotnet", aliases: [".net", "dotnet core", "dot-net"] },
  { name: "Laravel", slug: "laravel", aliases: ["laravel-framework"] },

  // Databases & ORMs
  { name: "PostgreSQL", slug: "postgresql", aliases: ["postgres", "psql"] },
  { name: "MySQL", slug: "mysql", aliases: ["my-sql"] },
  { name: "MongoDB", slug: "mongodb", aliases: ["mongo"] },
  { name: "Redis", slug: "redis", aliases: [] },
  { name: "Prisma", slug: "prisma", aliases: ["prisma orm"] },

  // DevOps & Cloud
  { name: "Git", slug: "git", aliases: ["github", "gitlab"] },
  { name: "Docker", slug: "docker", aliases: ["containerization"] },
  { name: "Kubernetes", slug: "kubernetes", aliases: ["k8s"] },
  { name: "Linux", slug: "linux", aliases: ["bash", "shell"] },
  { name: "AWS", slug: "aws", aliases: ["amazon web services"] },
  { name: "Microsoft Azure", slug: "azure", aliases: ["azure"] },
  { name: "Google Cloud", slug: "gcp", aliases: ["google cloud platform", "gcp"] },
  { name: "CI/CD", slug: "cicd", aliases: ["ci-cd", "continuous integration"] },

  // APIs & Architecture
  { name: "REST API", slug: "rest-api", aliases: ["rest", "restful", "restful api"] },
  { name: "GraphQL", slug: "graphql", aliases: ["gql"] },

  // Testing & Quality Assurance
  { name: "Jest", slug: "jest", aliases: [] },
  { name: "Vitest", slug: "vitest", aliases: [] },
  { name: "Playwright", slug: "playwright", aliases: [] },
  { name: "Cypress", slug: "cypress", aliases: [] },

  // Design & Creative
  { name: "Figma", slug: "figma", aliases: [] },
  { name: "Adobe XD", slug: "adobe-xd", aliases: ["xd"] },
  { name: "UI/UX Design", slug: "ui-ux-design", aliases: ["ui/ux", "ux", "ui design", "ux design"] },
  { name: "Graphic Design", slug: "graphic-design", aliases: ["graphics", "visual design"] },
  { name: "Adobe Photoshop", slug: "photoshop", aliases: ["photoshop", "ps"] },
  { name: "Adobe Illustrator", slug: "illustrator", aliases: ["illustrator", "ai"] },

  // Marketing, Writing & Analytics
  { name: "SEO", slug: "seo", aliases: ["search engine optimization"] },
  { name: "Digital Marketing", slug: "digital-marketing", aliases: ["online marketing"] },
  { name: "Content Writing", slug: "content-writing", aliases: ["copywriting", "technical writing"] },
  { name: "Social Media Marketing", slug: "social-media-marketing", aliases: ["smm"] },
  { name: "Google Analytics", slug: "google-analytics", aliases: ["ga4", "analytics"] },
  { name: "Microsoft Excel", slug: "excel", aliases: ["ms excel", "spreadsheets"] },
  { name: "Data Analysis", slug: "data-analysis", aliases: ["data analytics"] },
  { name: "Power BI", slug: "power-bi", aliases: ["powerbi"] },
  { name: "Machine Learning", slug: "machine-learning", aliases: ["ml"] },
];

async function main() {
  console.log("🌱 Starting SkillBridge BD database seed...");

  // 1. Password Hashes
  const demoRawPassword = process.env.SEED_DEMO_PASSWORD || "Demo@12345";
  const demoPasswordHash = await bcrypt.hash(demoRawPassword, 10);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminRawPassword = process.env.ADMIN_PASSWORD || "change-me";
  const adminPasswordHash = await bcrypt.hash(adminRawPassword, 10);

  // 2. Seed Skills & Aliases
  console.log(`Seeding ${SKILLS_DATA.length} skills and aliases...`);
  const skillMap = new Map<string, string>(); // slug -> id

  for (const s of SKILLS_DATA) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: { name: s.name },
      create: { name: s.name, slug: s.slug },
    });
    skillMap.set(s.slug, skill.id);

    for (const alias of s.aliases) {
      const lowerAlias = alias.trim().toLowerCase();
      await prisma.skillAlias.upsert({
        where: { alias: lowerAlias },
        update: { skillId: skill.id },
        create: { alias: lowerAlias, skillId: skill.id },
      });
    }
  }

  // Helper to get skill ID by slug
  const getSkillId = (slug: string): string => {
    const id = skillMap.get(slug);
    if (!id) throw new Error(`Skill with slug "${slug}" not found in seed map.`);
    return id;
  };

  // 3. Seed Admin User
  console.log("Seeding Admin user...");
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "System Administrator",
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
    },
    create: {
      email: adminEmail,
      name: "System Administrator",
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  // 4. Seed Employers and Organizations
  console.log("Seeding Employers and Organizations...");
  const employer1 = await prisma.user.upsert({
    where: { email: "employer1@techcorp.bd" },
    update: {
      name: "Tanvir Hasan",
      role: Role.EMPLOYER,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "employer1@techcorp.bd",
      name: "Tanvir Hasan",
      role: Role.EMPLOYER,
      passwordHash: demoPasswordHash,
    },
  });

  const org1 = await prisma.organization.upsert({
    where: { ownerUserId: employer1.id },
    update: {
      name: "TechCorp Bangladesh",
      description:
        "Premier software engineering firm delivering modern cloud, web, and mobile solutions for enterprises in Bangladesh and abroad.",
      website: "https://techcorp.bd",
      location: "Dhaka",
    },
    create: {
      ownerUserId: employer1.id,
      name: "TechCorp Bangladesh",
      description:
        "Premier software engineering firm delivering modern cloud, web, and mobile solutions for enterprises in Bangladesh and abroad.",
      website: "https://techcorp.bd",
      location: "Dhaka",
    },
  });

  const employer2 = await prisma.user.upsert({
    where: { email: "employer2@greenpath.bd" },
    update: {
      name: "Nasreen Akter",
      role: Role.EMPLOYER,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "employer2@greenpath.bd",
      name: "Nasreen Akter",
      role: Role.EMPLOYER,
      passwordHash: demoPasswordHash,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { ownerUserId: employer2.id },
    update: {
      name: "GreenPath Digital",
      description:
        "Modern digital agency focused on creative UI/UX, product design, frontend web platforms, and digital growth.",
      website: "https://greenpath.bd",
      location: "Chattogram",
    },
    create: {
      ownerUserId: employer2.id,
      name: "GreenPath Digital",
      description:
        "Modern digital agency focused on creative UI/UX, product design, frontend web platforms, and digital growth.",
      website: "https://greenpath.bd",
      location: "Chattogram",
    },
  });

  // 5. Seed 10 Fictional PUBLISHED Jobs
  console.log("Seeding 10 published jobs...");
  const jobsData = [
    {
      organizationId: org1.id,
      title: "Frontend Developer (React/Next.js)",
      description:
        "Join our agile product team to build responsive, accessible web portals using React, Next.js, and modern CSS tooling. You will collaborate closely with UI/UX designers and backend developers.",
      experienceLevel: ExperienceLevel.JUNIOR,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      location: "Dhaka",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      skills: ["react", "nextjs", "typescript", "tailwindcss"],
    },
    {
      organizationId: org1.id,
      title: "Backend Engineer (Node.js & PostgreSQL)",
      description:
        "Looking for a backend developer to architect resilient REST APIs, microservices, and high-performance database schemas with Node.js and PostgreSQL.",
      experienceLevel: ExperienceLevel.MID,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.ONSITE,
      location: "Dhaka",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      skills: ["nodejs", "expressjs", "postgresql", "rest-api", "docker"],
    },
    {
      organizationId: org1.id,
      title: "Software Engineering Intern",
      description:
        "Exciting 3-month internship opportunity for ambitious computer science students and fresh graduates to work on real-world web apps under senior mentorship.",
      experienceLevel: ExperienceLevel.INTERN,
      jobType: JobType.INTERNSHIP,
      workArrangement: WorkArrangement.ONSITE,
      location: "Cumilla",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      skills: ["javascript", "python", "git"],
    },
    {
      organizationId: org1.id,
      title: "Senior Cloud & DevOps Architect",
      description:
        "Lead our cloud infrastructure, automated CI/CD deployment pipelines, and Kubernetes container orchestration across multi-region cloud setups.",
      experienceLevel: ExperienceLevel.SENIOR,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.REMOTE,
      location: "Remote",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      skills: ["docker", "kubernetes", "aws", "cicd", "linux"],
    },
    {
      organizationId: org1.id,
      title: "Full Stack Engineer (Contract)",
      description:
        "6-month contract role building an enterprise workflow and reporting system with React, TypeScript, Node.js, and PostgreSQL.",
      experienceLevel: ExperienceLevel.MID,
      jobType: JobType.CONTRACT,
      workArrangement: WorkArrangement.REMOTE,
      location: "Sylhet",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      skills: ["typescript", "react", "nodejs", "postgresql"],
    },
    {
      organizationId: org2.id,
      title: "Junior UI/UX Designer",
      description:
        "Design user-centered interfaces, user flows, and wireframes for mobile and web applications. Conduct quick user testing and build accessible Figma components.",
      experienceLevel: ExperienceLevel.JUNIOR,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.ONSITE,
      location: "Chattogram",
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      skills: ["figma", "ui-ux-design", "graphic-design", "illustrator"],
    },
    {
      organizationId: org2.id,
      title: "Digital Marketing & SEO Specialist",
      description:
        "Drive organic visibility, optimize website search rankings, coordinate social campaigns, and analyze key marketing KPIs using Google Analytics.",
      experienceLevel: ExperienceLevel.ENTRY,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      location: "Chattogram",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      skills: ["seo", "digital-marketing", "google-analytics", "content-writing"],
    },
    {
      organizationId: org2.id,
      title: "Content Writer & Copywriter (Part-Time)",
      description:
        "Create compelling blog posts, technical articles, and social media copy for digital agency clients. Part-time flexibility with 20 hours per week.",
      experienceLevel: ExperienceLevel.ENTRY,
      jobType: JobType.PART_TIME,
      workArrangement: WorkArrangement.REMOTE,
      location: "Sylhet",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      skills: ["content-writing", "seo", "social-media-marketing"],
    },
    {
      organizationId: org2.id,
      title: "Entry-Level Frontend Designer",
      description:
        "Turn Figma designs into pixel-perfect, mobile-friendly landing pages and interactive components using HTML5, CSS3, and Tailwind CSS.",
      experienceLevel: ExperienceLevel.ENTRY,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.HYBRID,
      location: "Cumilla",
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      skills: ["html5", "css3", "tailwindcss", "javascript"],
    },
    {
      organizationId: org2.id,
      title: "Senior Product Designer",
      description:
        "Shape the visual identity and user experience for international client web apps. Lead client design workshops and maintain comprehensive design systems.",
      experienceLevel: ExperienceLevel.SENIOR,
      jobType: JobType.FULL_TIME,
      workArrangement: WorkArrangement.REMOTE,
      location: "Remote",
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      skills: ["ui-ux-design", "figma", "photoshop", "graphic-design"],
    },
  ];

  for (const jobData of jobsData) {
    // Check if job with same organizationId and title already exists
    let job = await prisma.job.findFirst({
      where: {
        organizationId: jobData.organizationId,
        title: jobData.title,
      },
    });

    if (job) {
      job = await prisma.job.update({
        where: { id: job.id },
        data: {
          description: jobData.description,
          experienceLevel: jobData.experienceLevel,
          jobType: jobData.jobType,
          workArrangement: jobData.workArrangement,
          location: jobData.location,
          deadline: jobData.deadline,
          status: JobStatus.PUBLISHED,
        },
      });
    } else {
      job = await prisma.job.create({
        data: {
          organizationId: jobData.organizationId,
          title: jobData.title,
          description: jobData.description,
          experienceLevel: jobData.experienceLevel,
          jobType: jobData.jobType,
          workArrangement: jobData.workArrangement,
          location: jobData.location,
          deadline: jobData.deadline,
          status: JobStatus.PUBLISHED,
        },
      });
    }

    // Connect required skills
    for (const skillSlug of jobData.skills) {
      const skillId = getSkillId(skillSlug);
      await prisma.jobSkill.upsert({
        where: {
          jobId_skillId: {
            jobId: job.id,
            skillId,
          },
        },
        update: {},
        create: {
          jobId: job.id,
          skillId,
        },
      });
    }
  }

  // 6. Seed Demo Candidate 1: Rahim Ahmed
  console.log("Seeding Candidate 1 (Rahim Ahmed)...");
  const candidateUser1 = await prisma.user.upsert({
    where: { email: "candidate.rahim@gmail.com" },
    update: {
      name: "Rahim Ahmed",
      role: Role.CANDIDATE,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "candidate.rahim@gmail.com",
      name: "Rahim Ahmed",
      role: Role.CANDIDATE,
      passwordHash: demoPasswordHash,
    },
  });

  const profile1 = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser1.id },
    update: {
      headline: "Junior Full-Stack Web Developer",
      bio: "Motivated computer science graduate passionate about building clean, performant, accessible web applications with React, Node.js, and PostgreSQL.",
      location: "Dhaka",
      phone: "+8801712345678",
      links: [
        { label: "GitHub", url: "https://github.com/rahim-dev" },
        { label: "Portfolio", url: "https://rahim.dev" },
      ],
    },
    create: {
      userId: candidateUser1.id,
      headline: "Junior Full-Stack Web Developer",
      bio: "Motivated computer science graduate passionate about building clean, performant, accessible web applications with React, Node.js, and PostgreSQL.",
      location: "Dhaka",
      phone: "+8801712345678",
      links: [
        { label: "GitHub", url: "https://github.com/rahim-dev" },
        { label: "Portfolio", url: "https://rahim.dev" },
      ],
    },
  });

  // Candidate 1 Skills (5 skills)
  const candidate1SkillSlugs = ["javascript", "react", "nodejs", "postgresql", "tailwindcss"];
  const candidate1SkillMap = new Map<string, string>(); // slug -> candidateSkill.id

  for (const slug of candidate1SkillSlugs) {
    const skillId = getSkillId(slug);
    const candidateSkill = await prisma.candidateSkill.upsert({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: profile1.id,
          skillId,
        },
      },
      update: {},
      create: {
        candidateProfileId: profile1.id,
        skillId,
      },
    });
    candidate1SkillMap.set(slug, candidateSkill.id);
  }

  // Candidate 1 Projects (2 projects)
  let proj1_1 = await prisma.project.findFirst({
    where: {
      candidateProfileId: profile1.id,
      title: "E-Commerce Storefront & Admin Portal",
    },
  });
  if (proj1_1) {
    proj1_1 = await prisma.project.update({
      where: { id: proj1_1.id },
      data: {
        description:
          "Full-stack online shopping platform with product catalog, cart checkout, and role-based inventory management built with React, Node.js, and PostgreSQL.",
        url: "https://github.com/rahim-dev/ecommerce-shop",
        kind: ProjectKind.PROJECT,
      },
    });
  } else {
    proj1_1 = await prisma.project.create({
      data: {
        candidateProfileId: profile1.id,
        title: "E-Commerce Storefront & Admin Portal",
        description:
          "Full-stack online shopping platform with product catalog, cart checkout, and role-based inventory management built with React, Node.js, and PostgreSQL.",
        url: "https://github.com/rahim-dev/ecommerce-shop",
        kind: ProjectKind.PROJECT,
      },
    });
  }

  let proj1_2 = await prisma.project.findFirst({
    where: {
      candidateProfileId: profile1.id,
      title: "Personal Developer Portfolio Website",
    },
  });
  if (proj1_2) {
    proj1_2 = await prisma.project.update({
      where: { id: proj1_2.id },
      data: {
        description:
          "Responsive personal portfolio website showcasing projects, skill badges, and contact inquiries built with React and Tailwind CSS.",
        url: "https://rahim.dev",
        kind: ProjectKind.PORTFOLIO,
      },
    });
  } else {
    proj1_2 = await prisma.project.create({
      data: {
        candidateProfileId: profile1.id,
        title: "Personal Developer Portfolio Website",
        description:
          "Responsive personal portfolio website showcasing projects, skill badges, and contact inquiries built with React and Tailwind CSS.",
        url: "https://rahim.dev",
        kind: ProjectKind.PORTFOLIO,
      },
    });
  }

  // Candidate 1 Skill Evidence Linking
  // Project 1 links to: JavaScript, React, Node.js, PostgreSQL
  for (const slug of ["javascript", "react", "nodejs", "postgresql"]) {
    const candidateSkillId = candidate1SkillMap.get(slug);
    if (candidateSkillId) {
      await prisma.skillEvidence.upsert({
        where: {
          candidateSkillId_projectId: {
            candidateSkillId,
            projectId: proj1_1.id,
          },
        },
        update: {},
        create: {
          candidateSkillId,
          projectId: proj1_1.id,
        },
      });
    }
  }

  // Project 2 links to: React, Tailwind CSS
  for (const slug of ["react", "tailwindcss"]) {
    const candidateSkillId = candidate1SkillMap.get(slug);
    if (candidateSkillId) {
      await prisma.skillEvidence.upsert({
        where: {
          candidateSkillId_projectId: {
            candidateSkillId,
            projectId: proj1_2.id,
          },
        },
        update: {},
        create: {
          candidateSkillId,
          projectId: proj1_2.id,
        },
      });
    }
  }

  // 7. Seed Demo Candidate 2: Fatima Begum
  console.log("Seeding Candidate 2 (Fatima Begum)...");
  const candidateUser2 = await prisma.user.upsert({
    where: { email: "candidate.fatima@gmail.com" },
    update: {
      name: "Fatima Begum",
      role: Role.CANDIDATE,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "candidate.fatima@gmail.com",
      name: "Fatima Begum",
      role: Role.CANDIDATE,
      passwordHash: demoPasswordHash,
    },
  });

  const profile2 = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser2.id },
    update: {
      headline: "UI/UX Designer & Frontend Developer",
      bio: "Creative product designer crafting user-centric design systems in Figma and translating them into modern, accessible frontend code.",
      location: "Chattogram",
      phone: "+8801812345678",
      links: [
        { label: "Behance", url: "https://behance.net/fatima-design" },
        { label: "GitHub", url: "https://github.com/fatima-ux" },
      ],
    },
    create: {
      userId: candidateUser2.id,
      headline: "UI/UX Designer & Frontend Developer",
      bio: "Creative product designer crafting user-centric design systems in Figma and translating them into modern, accessible frontend code.",
      location: "Chattogram",
      phone: "+8801812345678",
      links: [
        { label: "Behance", url: "https://behance.net/fatima-design" },
        { label: "GitHub", url: "https://github.com/fatima-ux" },
      ],
    },
  });

  // Candidate 2 Skills (5 skills)
  const candidate2SkillSlugs = ["figma", "ui-ux-design", "html5", "css3", "tailwindcss"];
  const candidate2SkillMap = new Map<string, string>(); // slug -> candidateSkill.id

  for (const slug of candidate2SkillSlugs) {
    const skillId = getSkillId(slug);
    const candidateSkill = await prisma.candidateSkill.upsert({
      where: {
        candidateProfileId_skillId: {
          candidateProfileId: profile2.id,
          skillId,
        },
      },
      update: {},
      create: {
        candidateProfileId: profile2.id,
        skillId,
      },
    });
    candidate2SkillMap.set(slug, candidateSkill.id);
  }

  // Candidate 2 Projects (2 projects)
  let proj2_1 = await prisma.project.findFirst({
    where: {
      candidateProfileId: profile2.id,
      title: "Fintech Mobile & Web Design System",
    },
  });
  if (proj2_1) {
    proj2_1 = await prisma.project.update({
      where: { id: proj2_1.id },
      data: {
        description:
          "Comprehensive design system with 50+ reusable Figma components, user flows, and wireframes for mobile money transfers.",
        url: "https://behance.net/fatima-design/fintech",
        kind: ProjectKind.PORTFOLIO,
      },
    });
  } else {
    proj2_1 = await prisma.project.create({
      data: {
        candidateProfileId: profile2.id,
        title: "Fintech Mobile & Web Design System",
        description:
          "Comprehensive design system with 50+ reusable Figma components, user flows, and wireframes for mobile money transfers.",
        url: "https://behance.net/fatima-design/fintech",
        kind: ProjectKind.PORTFOLIO,
      },
    });
  }

  let proj2_2 = await prisma.project.findFirst({
    where: {
      candidateProfileId: profile2.id,
      title: "SaaS Landing Page & UI Kit",
    },
  });
  if (proj2_2) {
    proj2_2 = await prisma.project.update({
      where: { id: proj2_2.id },
      data: {
        description:
          "Interactive, mobile-first marketing landing page implemented with clean HTML5, CSS3, and Tailwind CSS based on custom Figma mockups.",
        url: "https://github.com/fatima-ux/saas-landing",
        kind: ProjectKind.PROJECT,
      },
    });
  } else {
    proj2_2 = await prisma.project.create({
      data: {
        candidateProfileId: profile2.id,
        title: "SaaS Landing Page & UI Kit",
        description:
          "Interactive, mobile-first marketing landing page implemented with clean HTML5, CSS3, and Tailwind CSS based on custom Figma mockups.",
        url: "https://github.com/fatima-ux/saas-landing",
        kind: ProjectKind.PROJECT,
      },
    });
  }

  // Candidate 2 Skill Evidence Linking
  // Project 1 links to: Figma, UI/UX Design
  for (const slug of ["figma", "ui-ux-design"]) {
    const candidateSkillId = candidate2SkillMap.get(slug);
    if (candidateSkillId) {
      await prisma.skillEvidence.upsert({
        where: {
          candidateSkillId_projectId: {
            candidateSkillId,
            projectId: proj2_1.id,
          },
        },
        update: {},
        create: {
          candidateSkillId,
          projectId: proj2_1.id,
        },
      });
    }
  }

  // Project 2 links to: HTML5, CSS3, Tailwind CSS, Figma
  for (const slug of ["html5", "css3", "tailwindcss", "figma"]) {
    const candidateSkillId = candidate2SkillMap.get(slug);
    if (candidateSkillId) {
      await prisma.skillEvidence.upsert({
        where: {
          candidateSkillId_projectId: {
            candidateSkillId,
            projectId: proj2_2.id,
          },
        },
        update: {},
        create: {
          candidateSkillId,
          projectId: proj2_2.id,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
