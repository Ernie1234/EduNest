import { PrismaClient, type Department, type User, type CourseOffering } from '@prisma/client';

const prisma = new PrismaClient();

/** Deterministic demo dates so the seed reads the same every run. */
const DEC = (day: number, hour: number, minute = 0) =>
  new Date(Date.UTC(2025, 11, day, hour, minute));

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Seed data missing: ${what}`);
  return value;
}

async function upsertUser(input: {
  email: string;
  name: string;
  googleId: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' | 'PARENT';
  schoolId: string;
  image?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}): Promise<User> {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: {
      email: input.email,
      name: input.name,
      googleId: input.googleId,
      role: input.role,
      schoolId: input.schoolId,
      image: input.image,
      gender: input.gender,
    },
  });
}

/** Creates `moduleCount` modules with lessons split evenly across them, and
 * marks the first `completedLessons` lessons (in order) as done for `student`. */
async function seedLessons(
  courseOffering: CourseOffering,
  student: User,
  opts: { totalLessons: number; completedLessons: number; moduleCount: number; titlePrefix: string },
) {
  const perModule = Math.ceil(opts.totalLessons / opts.moduleCount);
  let created = 0;
  let remainingCompleted = opts.completedLessons;

  for (let m = 0; m < opts.moduleCount && created < opts.totalLessons; m++) {
    const module = await prisma.courseModule.create({
      data: {
        courseOfferingId: courseOffering.id,
        title: `${opts.titlePrefix} — Module ${m + 1}`,
        order: m + 1,
      },
    });

    for (let l = 0; l < perModule && created < opts.totalLessons; l++, created++) {
      const lesson = await prisma.lesson.create({
        data: {
          courseModuleId: module.id,
          title: `Lesson ${created + 1}`,
          contentType: 'VIDEO',
          order: l + 1,
          durationMinutes: 25,
        },
      });

      if (remainingCompleted > 0) {
        await prisma.lessonProgress.create({
          data: {
            lessonId: lesson.id,
            studentId: student.id,
            completed: true,
            completedAt: DEC(1, 9),
          },
        });
        remainingCompleted--;
      }
    }
  }
}

async function main() {
  // ===================== SCHOOL, DEPARTMENTS, SESSION =====================

  const school = await prisma.school.upsert({
    where: { slug: 'edunest-university' },
    update: {},
    create: {
      name: 'EduNest University',
      slug: 'edunest-university',
      address: 'Lagos, Nigeria',
    },
  });

  const departmentDefs = [
    { code: 'ACC', name: 'Accounting' },
    { code: 'ECO', name: 'Economics' },
    { code: 'CSC', name: 'Computer Science' },
    { code: 'GST', name: 'General Studies' },
    { code: 'BUS', name: 'Business Administration' },
    { code: 'MTH', name: 'Mathematics' },
    { code: 'HIS', name: 'History & Humanities' },
  ];
  const departments: Record<string, Department> = {};
  for (const d of departmentDefs) {
    departments[d.code] = await prisma.department.upsert({
      where: { schoolId_code: { schoolId: school.id, code: d.code } },
      update: {},
      create: { schoolId: school.id, code: d.code, name: d.name },
    });
  }
  const dept = (code: string) => must(departments[code], `department ${code}`);

  const session = await prisma.academicSession.upsert({
    where: {
      schoolId_name_semester: { schoolId: school.id, name: '2025/2026', semester: 'FIRST' },
    },
    update: {},
    create: {
      schoolId: school.id,
      name: '2025/2026',
      semester: 'FIRST',
      startDate: new Date(Date.UTC(2025, 8, 1)),
      endDate: new Date(Date.UTC(2026, 0, 31)),
    },
  });

  // ===================== USERS =====================

  await upsertUser({
    email: 'founder@edunest.com',
    name: 'EduNest Founder Admin',
    googleId: 'seed-google-super-admin',
    role: 'SUPER_ADMIN',
    schoolId: school.id,
  });

  const registrar = await upsertUser({
    email: 'registrar@edunest.com',
    name: 'School Registrar',
    googleId: 'seed-google-registrar',
    role: 'ADMIN',
    schoolId: school.id,
  });

  const teacherDefs = [
    { code: 'ACC', name: 'Dr. Adeyemi Okonkwo', email: 'adeyemi.okonkwo@edunest.com', staffId: 'STF-001' },
    { code: 'ECO', name: 'Prof. Ngozi Okeke', email: 'ngozi.okeke@edunest.com', staffId: 'STF-002' },
    { code: 'CSC', name: 'Dr. Chukwuma Nnamdi', email: 'chukwuma.nnamdi@edunest.com', staffId: 'STF-003' },
    { code: 'GST', name: 'Mrs. Blessing Ajayi', email: 'blessing.ajayi@edunest.com', staffId: 'STF-004' },
    { code: 'BUS', name: 'Mr. Ibrahim Musa', email: 'ibrahim.musa@edunest.com', staffId: 'STF-005' },
    { code: 'MTH', name: 'Dr. Grace Adekunle', email: 'grace.adekunle@edunest.com', staffId: 'STF-006' },
    { code: 'HIS', name: 'Dr. Samuel Eze', email: 'samuel.eze@edunest.com', staffId: 'STF-007' },
  ] as const;

  const teachers: Record<string, User> = {};
  for (const t of teacherDefs) {
    const user = await upsertUser({
      email: t.email,
      name: t.name,
      googleId: `seed-google-${t.staffId}`,
      role: 'TEACHER',
      schoolId: school.id,
    });
    await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        staffId: t.staffId,
        departmentId: dept(t.code).id,
        title: 'Lecturer',
      },
    });
    teachers[t.code] = user;
  }
  const teacher = (code: string) => must(teachers[code], `teacher for ${code}`);

  const nancy = await upsertUser({
    email: 'nancy.graham@edunest.com',
    name: 'Nancy Graham',
    googleId: 'seed-google-nancy',
    role: 'STUDENT',
    schoolId: school.id,
    gender: 'FEMALE',
  });
  await prisma.studentProfile.upsert({
    where: { userId: nancy.id },
    update: {},
    create: {
      userId: nancy.id,
      matricNumber: 'EDU/2023/0001',
      departmentId: dept('ECO').id,
      level: 200,
      admittedAt: new Date(Date.UTC(2023, 8, 1)),
    },
  });

  const classmateDefs = [
    { name: 'Chidi Okafor', email: 'chidi.okafor@edunest.com', matric: 'EDU/2023/0002' },
    { name: 'Amara Nwosu', email: 'amara.nwosu@edunest.com', matric: 'EDU/2023/0003' },
    { name: 'Tunde Adebayo', email: 'tunde.adebayo@edunest.com', matric: 'EDU/2023/0004' },
    { name: 'Emeka Obi', email: 'emeka.obi@edunest.com', matric: 'EDU/2023/0005' },
    { name: 'Abdul Rahman', email: 'abdul.rahman@edunest.com', matric: 'EDU/2023/0006' },
  ];
  const classmates: User[] = [];
  for (const c of classmateDefs) {
    const user = await upsertUser({
      email: c.email,
      name: c.name,
      googleId: `seed-google-${c.matric}`,
      role: 'STUDENT',
      schoolId: school.id,
    });
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, matricNumber: c.matric, departmentId: dept('ECO').id, level: 200 },
    });
    classmates.push(user);
  }

  const nancysParent = await upsertUser({
    email: 'grahams.parent@example.com',
    name: 'Robert Graham',
    googleId: 'seed-google-parent-graham',
    role: 'PARENT',
    schoolId: school.id,
  });
  const parentProfile = await prisma.parentProfile.upsert({
    where: { userId: nancysParent.id },
    update: {},
    create: { userId: nancysParent.id },
  });
  const nancyStudentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: nancy.id } });
  await prisma.parentStudent.upsert({
    where: {
      parentProfileId_studentProfileId: {
        parentProfileId: parentProfile.id,
        studentProfileId: nancyStudentProfile.id,
      },
    },
    update: {},
    create: { parentProfileId: parentProfile.id, studentProfileId: nancyStudentProfile.id },
  });

  // ===================== COURSES & OFFERINGS =====================

  const courseDefs = [
    { code: 'ACC202', title: 'Cost Accounting', dept: 'ACC', credits: 3, level: 200, lessons: 36, completed: 22, status: 'ACTIVE' as const },
    { code: 'ECO201', title: 'Macroeconomics', dept: 'ECO', credits: 3, level: 200, lessons: 36, completed: 22, status: 'ACTIVE' as const },
    { code: 'CSC203', title: 'Data Structures', dept: 'CSC', credits: 3, level: 200, lessons: 30, completed: 24, status: 'ACTIVE' as const },
    { code: 'GST101', title: 'Use of English', dept: 'GST', credits: 2, level: 100, lessons: 28, completed: 16, status: 'ACTIVE' as const },
    { code: 'BUS205', title: 'Principles of Management', dept: 'BUS', credits: 3, level: 200, lessons: 36, completed: 36, status: 'COMPLETED' as const },
    { code: 'MTH201', title: 'Linear Algebra', dept: 'MTH', credits: 3, level: 200, lessons: 20, completed: 8, status: 'ACTIVE' as const },
    { code: 'HIS204', title: 'Research Methods', dept: 'HIS', credits: 2, level: 200, lessons: 18, completed: 18, status: 'COMPLETED' as const },
  ];

  const offerings: Record<string, CourseOffering> = {};
  for (const c of courseDefs) {
    const course = await prisma.course.upsert({
      where: { departmentId_code: { departmentId: dept(c.dept).id, code: c.code } },
      update: {},
      create: {
        departmentId: dept(c.dept).id,
        code: c.code,
        title: c.title,
        creditUnits: c.credits,
        level: c.level,
      },
    });

    const offering = await prisma.courseOffering.upsert({
      where: { courseId_academicSessionId: { courseId: course.id, academicSessionId: session.id } },
      update: {},
      create: { courseId: course.id, academicSessionId: session.id },
    });
    offerings[c.code] = offering;
    const offeringInstructor = teacher(c.dept);

    await prisma.courseInstructor.upsert({
      where: { courseOfferingId_userId: { courseOfferingId: offering.id, userId: offeringInstructor.id } },
      update: {},
      create: { courseOfferingId: offering.id, userId: offeringInstructor.id, isPrimary: true },
    });

    await prisma.enrollment.upsert({
      where: { courseOfferingId_studentId: { courseOfferingId: offering.id, studentId: nancy.id } },
      update: {},
      create: { courseOfferingId: offering.id, studentId: nancy.id, status: c.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE' },
    });

    const existingModules = await prisma.courseModule.count({ where: { courseOfferingId: offering.id } });
    if (existingModules === 0) {
      await seedLessons(offering, nancy, {
        totalLessons: c.lessons,
        completedLessons: c.completed,
        moduleCount: 4,
        titlePrefix: c.title,
      });
    }
  }
  const offering = (code: string) => must(offerings[code], `offering ${code}`);

  // ===================== LIVE CLASS + CHAT (ECO201) =====================

  const ecoOffering = offering('ECO201');
  const ecoTeacher = teacher('ECO');
  const liveClass = await prisma.liveClass.upsert({
    where: { id: 'seed-live-class-eco201' },
    update: {},
    create: {
      id: 'seed-live-class-eco201',
      courseOfferingId: ecoOffering.id,
      hostId: ecoTeacher.id,
      title: 'National Income Accounting',
      scheduledStart: DEC(1, 16, 50),
      scheduledEnd: DEC(1, 17, 50),
      status: 'LIVE',
    },
  });

  const liveClassParticipants = [ecoTeacher, nancy, ...classmates];
  for (const participant of liveClassParticipants) {
    await prisma.liveClassParticipant.upsert({
      where: { liveClassId_userId: { liveClassId: liveClass.id, userId: participant.id } },
      update: {},
      create: { liveClassId: liveClass.id, userId: participant.id, joinedAt: DEC(1, 16, 48) },
    });
  }

  const chatRoom = await prisma.chatRoom.upsert({
    where: { liveClassId: liveClass.id },
    update: {},
    create: { type: 'LIVE_CLASS', liveClassId: liveClass.id },
  });
  for (const participant of liveClassParticipants) {
    await prisma.chatParticipant.upsert({
      where: { chatRoomId_userId: { chatRoomId: chatRoom.id, userId: participant.id } },
      update: {},
      create: { chatRoomId: chatRoom.id, userId: participant.id },
    });
  }

  const byName = (name: string) => must(liveClassParticipants.find((u) => u.name === name), `participant ${name}`);

  const chatMessages = [
    { sender: byName('Chidi Okafor'), content: 'Good morning everyone! 👋', at: DEC(1, 16, 50) },
    { sender: byName('Amara Nwosu'), content: 'Morning! Ready to learn about GDP today?', at: DEC(1, 16, 51) },
    {
      sender: byName('Prof. Ngozi Okeke'),
      content:
        "Good morning class! We'll be covering National Income Accounting today. Please feel free to ask questions in the chat",
      at: DEC(1, 16, 51),
    },
    {
      sender: nancy,
      content: 'Prof, can you explain the difference between GDP and GNP again?',
      at: DEC(1, 17, 0),
    },
    { sender: nancy, content: '@Tunde Adebayo @Emeka Obi', at: DEC(1, 17, 2) },
    {
      sender: byName('Emeka Obi'),
      content: 'Prof, does that mean if a Nigerian company operates in Ghana, it counts toward GNP?',
      at: DEC(1, 17, 15),
    },
    { sender: byName('Abdul Rahman'), content: 'Prof, will this be in the CAT? 😅', at: DEC(1, 17, 20) },
    { sender: nancy, content: '😂😂 bro asking the real questions', at: DEC(1, 17, 22) },
    { sender: byName('Chidi Okafor'), content: 'This lecture is 🔥 honestly', at: DEC(1, 17, 25) },
    {
      sender: byName('Amara Nwosu'),
      content: "For real! Way better than last semester's eco class",
      at: DEC(1, 17, 25),
    },
  ];
  for (const m of chatMessages) {
    const existing = await prisma.chatMessage.findFirst({
      where: { chatRoomId: chatRoom.id, senderId: m.sender.id, content: m.content },
    });
    if (!existing) {
      await prisma.chatMessage.create({
        data: { chatRoomId: chatRoom.id, senderId: m.sender.id, content: m.content, createdAt: m.at },
      });
    }
  }

  await prisma.aiJob.upsert({
    where: { id: 'seed-ai-job-eco201-summary' },
    update: {},
    create: {
      id: 'seed-ai-job-eco201-summary',
      type: 'LIVE_CLASS_SUMMARY',
      status: 'COMPLETED',
      requestedById: nancy.id,
      liveClassId: liveClass.id,
      resultText:
        'Class covered National Income Accounting: GDP vs GNP, and how cross-border company activity is attributed. Students asked about CAT coverage; Prof. Okeke confirmed National Income Accounting is examinable.',
    },
  });
  await prisma.aiJob.upsert({
    where: { id: 'seed-ai-job-eco201-transcription' },
    update: {},
    create: {
      id: 'seed-ai-job-eco201-transcription',
      type: 'LIVE_CLASS_TRANSCRIPTION',
      status: 'COMPLETED',
      requestedById: ecoTeacher.id,
      liveClassId: liveClass.id,
      resultText: '[00:00] Good morning class, today we are covering National Income Accounting...',
    },
  });

  // ===================== CALENDAR EVENTS (timetable) =====================

  const calendarEvents = [
    { title: 'Comprehension & Essay Writing', code: 'GST101', start: DEC(1, 8, 0), end: DEC(1, 13, 0) },
    { title: 'Binary Trees & Implementation', code: 'CSC203', start: DEC(1, 9, 0), end: DEC(1, 10, 0) },
    { title: 'National Income Accounting', code: 'ECO201', start: DEC(1, 10, 0), end: DEC(1, 12, 0) },
    { title: 'Linear Algebra', code: 'MTH201', start: DEC(1, 14, 0), end: DEC(1, 16, 0) },
  ];
  for (const e of calendarEvents) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { schoolId: school.id, title: e.title, startAt: e.start },
    });
    if (!existing) {
      await prisma.calendarEvent.create({
        data: {
          schoolId: school.id,
          courseOfferingId: offering(e.code).id,
          title: e.title,
          type: 'CLASS',
          startAt: e.start,
          endAt: e.end,
          publishState: 'PUBLISHED',
        },
      });
    }
  }

  // ===================== ASSESSMENTS, SUBMISSIONS & GRADES =====================

  const accPerformance = [
    { title: 'CAT 1', type: 'CAT' as const, score: 80 },
    { title: 'CAT 2', type: 'CAT' as const, score: 88 },
    { title: 'CAT 3', type: 'CAT' as const, score: 78 },
    { title: 'Assignment 1', type: 'ASSIGNMENT' as const, score: 92 },
    { title: 'Mid-Semester', type: 'EXAM' as const, score: 80 },
    { title: 'CAT 4', type: 'CAT' as const, score: 96 },
  ];
  for (const a of accPerformance) {
    const assessment = await prisma.assessment.upsert({
      where: { id: `seed-acc202-${a.title.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `seed-acc202-${a.title.replace(/\s+/g, '-').toLowerCase()}`,
        courseOfferingId: offering('ACC202').id,
        title: a.title,
        type: a.type,
        maxScore: 100,
        weightPercent: a.type === 'EXAM' ? 30 : a.type === 'ASSIGNMENT' ? 20 : 10,
        dueAt: DEC(1, 0),
      },
    });
    await prisma.grade.upsert({
      where: { assessmentId_studentId: { assessmentId: assessment.id, studentId: nancy.id } },
      update: {},
      create: {
        assessmentId: assessment.id,
        studentId: nancy.id,
        score: a.score,
        gradedById: teacher('ACC').id,
      },
    });
  }

  const assignmentsPanel = [
    { code: 'ECO201', title: 'Group Assignment', dueOffset: -3, submitted: false, graded: false },
    { code: 'ACC202', title: 'Case Study', dueOffset: -2, submitted: false, graded: false },
    { code: 'GST101', title: 'Essay Submission', dueOffset: 4, submitted: false, graded: false },
    { code: 'MTH201', title: 'Problem Set', dueOffset: 5, submitted: false, graded: false },
    { code: 'CSC203', title: 'Lab Project', dueOffset: -10, submitted: false, graded: false },
    { code: 'BUS205', title: 'Business Plan', dueOffset: -15, submitted: true, graded: true },
    { code: 'HIS204', title: 'Research Paper', dueOffset: -20, submitted: true, graded: true },
  ];
  for (const a of assignmentsPanel) {
    const id = `seed-${a.code.toLowerCase()}-${a.title.replace(/\s+/g, '-').toLowerCase()}`;
    const assessment = await prisma.assessment.upsert({
      where: { id },
      update: {},
      create: {
        id,
        courseOfferingId: offering(a.code).id,
        title: a.title,
        type: 'ASSIGNMENT',
        maxScore: 100,
        weightPercent: 20,
        dueAt: DEC(1 + a.dueOffset, 23, 59),
      },
    });
    if (a.submitted) {
      await prisma.submission.upsert({
        where: { assessmentId_studentId: { assessmentId: assessment.id, studentId: nancy.id } },
        update: {},
        create: {
          assessmentId: assessment.id,
          studentId: nancy.id,
          content: `${a.title} submission`,
          status: 'GRADED',
          submittedAt: DEC(1 + a.dueOffset, 20, 0),
        },
      });
    }
    if (a.graded) {
      await prisma.grade.upsert({
        where: { assessmentId_studentId: { assessmentId: assessment.id, studentId: nancy.id } },
        update: {},
        create: { assessmentId: assessment.id, studentId: nancy.id, score: 85, gradedById: teachers[a.code.replace(/[0-9]/g, '')]?.id ?? registrar.id },
      });
    }
  }

  // ===================== ATTENDANCE (92% rate) =====================

  for (let i = 0; i < 25; i++) {
    const date = DEC(1 - i, 10);
    const id = `seed-attendance-${i}`;
    await prisma.attendanceRecord.upsert({
      where: { id },
      update: {},
      create: {
        id,
        studentId: nancy.id,
        date,
        status: i < 23 ? 'PRESENT' : 'ABSENT',
      },
    });
  }

  // ===================== ANNOUNCEMENTS =====================

  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-cat-schedule' },
    update: {},
    create: {
      id: 'seed-announcement-cat-schedule',
      schoolId: school.id,
      authorId: registrar.id,
      title: 'CAT Schedule Released',
      body: 'The First Semester CAT schedule has been published on the timetable. Please check your course pages for exact dates.',
      publishedAt: DEC(1, 7, 0),
    },
  });

  // ===================== ADMISSIONS =====================

  const admissionCycle = await prisma.admissionCycle.upsert({
    where: { id: 'seed-admission-cycle-2026' },
    update: {},
    create: {
      id: 'seed-admission-cycle-2026',
      schoolId: school.id,
      name: '2026/2027 Undergraduate Intake',
      opensAt: new Date(Date.UTC(2026, 0, 1)),
      closesAt: new Date(Date.UTC(2026, 5, 30)),
    },
  });
  const admissionApplicants = [
    { name: 'Bisi Adeyemi', email: 'bisi.adeyemi@example.com', status: 'SUBMITTED' as const, dept: 'CSC' },
    { name: 'Femi Bakare', email: 'femi.bakare@example.com', status: 'UNDER_REVIEW' as const, dept: 'ECO' },
    { name: 'Chiamaka Umeh', email: 'chiamaka.umeh@example.com', status: 'ACCEPTED' as const, dept: 'BUS' },
  ];
  for (const app of admissionApplicants) {
    const id = `seed-admission-${app.email}`;
    await prisma.admissionApplication.upsert({
      where: { id },
      update: {},
      create: {
        id,
        admissionCycleId: admissionCycle.id,
        applicantName: app.name,
        applicantEmail: app.email,
        desiredDepartmentId: dept(app.dept).id,
        status: app.status,
      },
    });
  }

  // ===================== JOBS & APPLICATIONS =====================

  const jobPosting = await prisma.jobPosting.upsert({
    where: { id: 'seed-job-csc-lecturer' },
    update: {},
    create: {
      id: 'seed-job-csc-lecturer',
      schoolId: school.id,
      postedById: registrar.id,
      title: 'Lecturer II - Computer Science',
      department: 'Computer Science',
      description: 'Teach undergraduate data structures & algorithms courses.',
      employmentType: 'Full-time',
      status: 'OPEN',
    },
  });
  const jobApplicants = [
    { name: 'Tobi Fashola', email: 'tobi.fashola@example.com', status: 'SUBMITTED' as const },
    { name: 'Ngozi Umeadi', email: 'ngozi.umeadi@example.com', status: 'SHORTLISTED' as const },
  ];
  for (const applicant of jobApplicants) {
    const id = `seed-job-application-${applicant.email}`;
    await prisma.jobApplication.upsert({
      where: { id },
      update: {},
      create: {
        id,
        jobPostingId: jobPosting.id,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        status: applicant.status,
        coverLetter: `Cover letter from ${applicant.name}`,
      },
    });
  }

  // ===================== HOSTELS =====================

  const queensHall = await prisma.hostel.upsert({
    where: { id: 'seed-hostel-queens' },
    update: {},
    create: { id: 'seed-hostel-queens', schoolId: school.id, name: 'Queens Hall', gender: 'FEMALE', address: 'North Campus' },
  });
  await prisma.hostel.upsert({
    where: { id: 'seed-hostel-unity' },
    update: {},
    create: { id: 'seed-hostel-unity', schoolId: school.id, name: 'Unity Hall', gender: 'MALE', address: 'South Campus' },
  });
  const room = await prisma.hostelRoom.upsert({
    where: { hostelId_roomNumber: { hostelId: queensHall.id, roomNumber: '101' } },
    update: {},
    create: { hostelId: queensHall.id, roomNumber: '101', capacity: 4 },
  });
  const existingAllocation = await prisma.hostelAllocation.findFirst({
    where: { hostelRoomId: room.id, studentId: nancy.id },
  });
  if (!existingAllocation) {
    await prisma.hostelAllocation.create({
      data: { hostelRoomId: room.id, studentId: nancy.id },
    });
  }

  // ===================== COMPLAINTS =====================

  const complaint = await prisma.complaint.upsert({
    where: { id: 'seed-complaint-noisy-roommate' },
    update: {},
    create: {
      id: 'seed-complaint-noisy-roommate',
      raisedById: nancy.id,
      assignedToId: registrar.id,
      category: 'Hostel',
      subject: 'Noisy roommate during exam period',
      description: 'My roommate in Queens Hall room 101 has been playing loud music late at night during CAT week.',
      status: 'IN_PROGRESS',
    },
  });
  await prisma.complaintComment.upsert({
    where: { id: 'seed-complaint-comment-1' },
    update: {},
    create: {
      id: 'seed-complaint-comment-1',
      complaintId: complaint.id,
      authorId: registrar.id,
      content: "Thanks for reporting this — I've spoken with the hostel warden and we'll follow up this week.",
    },
  });

  console.log('Seed complete:', {
    school: school.name,
    departments: Object.keys(departments).length,
    teachers: Object.keys(teachers).length,
    students: classmates.length + 1,
    courses: Object.keys(offerings).length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
