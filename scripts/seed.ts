import mongoose from "mongoose";
import Attendance from "../src/models/Attendance";
import CertificateTemplate from "../src/models/CertificateTemplate";
import ClassModel from "../src/models/Class";
import Course from "../src/models/Course";
import Event from "../src/models/Event";
import Exam from "../src/models/Exam";
import FeeStructure from "../src/models/FeeStructure";
import Payment from "../src/models/Payment";
import Result from "../src/models/Result";
import Setting from "../src/models/Setting";
import Student from "../src/models/Student";
import Subject from "../src/models/Subject";
import Syllabus from "../src/models/Syllabus";
import Teacher from "../src/models/Teacher";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const GRADES = Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`);
const SECTIONS = ["A", "B"];
const ACADEMIC_YEAR = "2026-2027";
const SCHOOL_NAME = "Green Valley Public School";

const FIRST_NAMES = [
  "Aarav", "Aditi", "Arjun", "Anaya", "Dev", "Diya", "Ishaan", "Kiara", "Kabir", "Meera",
  "Rohan", "Saanvi", "Vihaan", "Myra", "Advik", "Anika", "Reyansh", "Tara", "Yuvan", "Zoya",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Mehta", "Patel", "Reddy", "Nair", "Singh", "Iyer", "Kapoor",
];

const TEACHER_PROFILES = [
  { name: "Nisha Sharma", subject: "English", qualification: "MA English", experience: 8, gender: "Female" },
  { name: "Rahul Verma", subject: "Mathematics", qualification: "MSc Mathematics", experience: 10, gender: "Male" },
  { name: "Priya Menon", subject: "Science", qualification: "MSc Physics", experience: 7, gender: "Female" },
  { name: "Arvind Rao", subject: "Social Studies", qualification: "MA History", experience: 9, gender: "Male" },
  { name: "Kavya Iyer", subject: "Computer Science", qualification: "MTech Computer Science", experience: 6, gender: "Female" },
  { name: "Suresh Patel", subject: "Hindi", qualification: "MA Hindi", experience: 11, gender: "Male" },
  { name: "Fatima Khan", subject: "Biology", qualification: "MSc Biology", experience: 5, gender: "Female" },
  { name: "Amit Joshi", subject: "Chemistry", qualification: "MSc Chemistry", experience: 12, gender: "Male" },
  { name: "Sneha Das", subject: "Physics", qualification: "MSc Physics", experience: 8, gender: "Female" },
  { name: "Manoj Kulkarni", subject: "Commerce", qualification: "MCom", experience: 10, gender: "Male" },
  { name: "Ritu Bansal", subject: "Economics", qualification: "MA Economics", experience: 7, gender: "Female" },
  { name: "Deepak Jain", subject: "Accountancy", qualification: "MCom", experience: 13, gender: "Male" },
  { name: "Pooja Thomas", subject: "Art", qualification: "BFA", experience: 6, gender: "Female" },
  { name: "Harshad Desai", subject: "Physical Education", qualification: "MPEd", experience: 9, gender: "Male" },
  { name: "Neetu Arora", subject: "General Knowledge", qualification: "MA Education", experience: 4, gender: "Female" },
  { name: "Varun Malik", subject: "EVS", qualification: "MSc Environmental Science", experience: 5, gender: "Male" },
];

function getSubjectsForGrade(gradeNumber: number) {
  if (gradeNumber <= 5) {
    return ["English", "Mathematics", "EVS", "Hindi", "Art", "General Knowledge"];
  }
  if (gradeNumber <= 8) {
    return ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer Science"];
  }
  if (gradeNumber <= 10) {
    return ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Social Studies", "Computer Science"];
  }
  return ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "Accountancy", "Commerce"];
}

function getCourseName(gradeNumber: number) {
  if (gradeNumber <= 5) return "Primary Foundation Programme";
  if (gradeNumber <= 8) return "Middle School Integrated Programme";
  if (gradeNumber <= 10) return "Secondary Academic Programme";
  return "Senior Secondary Board Preparation";
}

function getSubjectCode(subjectName: string, gradeNumber: number) {
  const codeMap: Record<string, string> = {
    English: "ENG",
    Mathematics: "MAT",
    EVS: "EVS",
    Hindi: "HIN",
    Art: "ART",
    "General Knowledge": "GKN",
    Science: "SCI",
    "Social Studies": "SST",
    Physics: "PHY",
    Chemistry: "CHE",
    Biology: "BIO",
    "Computer Science": "CSC",
    Economics: "ECO",
    Accountancy: "ACC",
    Commerce: "COM",
  };

  return `${codeMap[subjectName] || subjectName.slice(0, 3).toUpperCase()}-${String(gradeNumber).padStart(2, "0")}`;
}

function getFeePlan(gradeNumber: number) {
  const tuition = 18000 + gradeNumber * 1800;
  const transport = 6000 + gradeNumber * 400;
  const activity = 3500 + gradeNumber * 250;
  return [
    { title: "Annual Tuition Fee", category: "Tuition", amount: tuition, dueDate: new Date("2026-04-10") },
    { title: "Transport Fee", category: "Transport", amount: transport, dueDate: new Date("2026-04-15") },
    { title: "Activity & Exam Fee", category: "Examination", amount: activity, dueDate: new Date("2026-05-05") },
  ];
}

function buildStudentName(index: number) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

function makeEmail(name: string, suffix: string) {
  return `${name.toLowerCase().replace(/\s+/g, ".")}.${suffix}@greenvalley.edu`.replace(/[^a-z0-9.@]/g, "");
}

function getStudentStatus(globalIndex: number) {
  if (globalIndex % 17 === 0) return "Pending";
  if (globalIndex % 29 === 0) return "Inactive";
  return "Active";
}

function getAttendanceStatus(seed: number) {
  if (seed % 19 === 0) return "Absent";
  if (seed % 11 === 0) return "Late";
  if (seed % 23 === 0) return "Excused";
  return "Present";
}

function getRemarks(status: string) {
  if (status === "Absent") return "Parent informed";
  if (status === "Late") return "Arrived after assembly";
  if (status === "Excused") return "Approved by class teacher";
  return "";
}

function getMark(totalMarks: number, seed: number) {
  const score = 52 + (seed % 45);
  return Math.min(score, totalMarks);
}

function getPaymentRatio(studentIndex: number) {
  if (studentIndex % 7 === 0) return 1;
  if (studentIndex % 5 === 0) return 0.8;
  if (studentIndex % 3 === 0) return 0.55;
  return 0.35;
}

function buildCertificateTemplates() {
  return [
    {
      name: "Bonafide Certificate",
      slug: "bonafide-certificate",
      category: "Certificate",
      audience: "Student",
      description: "Official bonafide certificate for currently enrolled students.",
      placeholders: ["studentName", "grade", "section", "academicYear", "issueDate"],
      orientation: "portrait",
      paperSize: "A4",
      isActive: true,
    },
    {
      name: "Transfer Certificate",
      slug: "transfer-certificate",
      category: "Certificate",
      audience: "Student",
      description: "Transfer certificate for student withdrawal or migration.",
      placeholders: ["studentName", "admissionNo", "dateOfBirth", "lastClass", "reason", "issueDate"],
      orientation: "portrait",
      paperSize: "A4",
      isActive: true,
    },
    {
      name: "Character Certificate",
      slug: "character-certificate",
      category: "Certificate",
      audience: "Student",
      description: "Character and conduct certificate for school students.",
      placeholders: ["studentName", "grade", "session", "conductRemark", "issueDate"],
      orientation: "portrait",
      paperSize: "A4",
      isActive: true,
    },
    {
      name: "Student ID Card",
      slug: "student-id-card",
      category: "ID Card",
      audience: "Student",
      description: "Printable student identity card template.",
      placeholders: ["studentName", "grade", "section", "rollNo", "contactNumber"],
      orientation: "landscape",
      paperSize: "ID-1",
      isActive: true,
    },
    {
      name: "Teacher ID Card",
      slug: "teacher-id-card",
      category: "ID Card",
      audience: "Teacher",
      description: "Printable teacher identity card template.",
      placeholders: ["teacherName", "employeeCode", "department", "contactNumber"],
      orientation: "landscape",
      paperSize: "ID-1",
      isActive: true,
    },
    {
      name: "Fee Receipt",
      slug: "fee-receipt",
      category: "Receipt",
      audience: "School",
      description: "Standard payment receipt issued for fee collection.",
      placeholders: ["receiptNo", "studentName", "amount", "paymentDate", "mode"],
      orientation: "portrait",
      paperSize: "A4",
      isActive: true,
    },
    {
      name: "Progress Report Card",
      slug: "progress-report-card",
      category: "Report",
      audience: "Student",
      description: "Printable term report card with grades and remarks.",
      placeholders: ["studentName", "grade", "examName", "marksTable", "teacherRemark"],
      orientation: "portrait",
      paperSize: "A4",
      isActive: true,
    },
    {
      name: "Exam Admit Card",
      slug: "exam-admit-card",
      category: "Report",
      audience: "Student",
      description: "Admit card for term examinations.",
      placeholders: ["studentName", "grade", "examName", "rollNo", "examSchedule"],
      orientation: "portrait",
      paperSize: "A4",
      isActive: true,
    },
  ];
}

async function clearCollections() {
  await Promise.all([
    Attendance.deleteMany({}),
    CertificateTemplate.deleteMany({}),
    ClassModel.deleteMany({}),
    Course.deleteMany({}),
    Event.deleteMany({}),
    Exam.deleteMany({}),
    FeeStructure.deleteMany({}),
    Payment.deleteMany({}),
    Result.deleteMany({}),
    Setting.deleteMany({}),
    Student.deleteMany({}),
    Subject.deleteMany({}),
    Syllabus.deleteMany({}),
    Teacher.deleteMany({}),
  ]);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB -> 'skool' database");

    await clearCollections();
    console.log("Cleared existing school data");

    const setting = await Setting.create({
      schoolName: SCHOOL_NAME,
      schoolAddress: "12 Knowledge Park Road, Sector 8, Bengaluru, Karnataka",
      contactEmail: "office@greenvalley.edu",
      contactPhone: "+91 80 4000 1200",
      academicYear: ACADEMIC_YEAR,
      currencySymbol: "Rs. ",
      timezone: "Asia/Calcutta",
    });

    const teachers = await Teacher.insertMany(
      TEACHER_PROFILES.map((teacher, index) => ({
        name: teacher.name,
        email: makeEmail(teacher.name, `t${index + 1}`),
        phone: `900100${String(index + 1).padStart(4, "0")}`,
        subject: teacher.subject,
        qualification: teacher.qualification,
        experience: teacher.experience,
        status: index % 11 === 0 ? "On Leave" : "Active",
        joinDate: new Date(2015 + (index % 8), (index % 12), 5 + (index % 20)),
        salary: 32000 + index * 3500,
        gender: teacher.gender as "Male" | "Female" | "Other",
        address: `${index + 1} Faculty Enclave, Green Valley Campus`,
        classes: [],
      }))
    );
    console.log(`Inserted ${teachers.length} teachers`);

    const classTeacherMap = new Map<string, any>();
    const classesPayload = GRADES.flatMap((grade, gradeIndex) =>
      SECTIONS.map((section, sectionIndex) => {
        const teacher = teachers[(gradeIndex * 2 + sectionIndex) % teachers.length];
        const classKey = `${grade}-${section}`;
        classTeacherMap.set(classKey, teacher);
        return {
          grade,
          section,
          capacity: 30,
          classTeacher: teacher._id,
        };
      })
    );
    const classes = await ClassModel.insertMany(classesPayload);
    console.log(`Inserted ${classes.length} classes`);

    const teacherClassAssignments = new Map<string, string[]>();
    classes.forEach((classDoc: any) => {
      const teacherId = classDoc.classTeacher.toString();
      const current = teacherClassAssignments.get(teacherId) || [];
      current.push(`${classDoc.grade}-${classDoc.section}`);
      teacherClassAssignments.set(teacherId, current);
    });

    await Promise.all(
      teachers.map((teacher: any) =>
        Teacher.findByIdAndUpdate(teacher._id, {
          $set: { classes: teacherClassAssignments.get(teacher._id.toString()) || [] },
        })
      )
    );

    const courseDocs = await Course.insertMany(
      GRADES.map((grade, index) => ({
        name: getCourseName(index + 1),
        code: `CRS-${String(index + 1).padStart(2, "0")}`,
        grade,
        description: `${grade} curriculum structure for ${ACADEMIC_YEAR}.`,
        coreSubjects: getSubjectsForGrade(index + 1),
        isActive: true,
      }))
    );
    console.log(`Inserted ${courseDocs.length} courses`);

    const subjectTeacherByName = new Map<string, any>();
    teachers.forEach((teacher: any) => {
      subjectTeacherByName.set(teacher.subject, teacher);
    });

    const subjectsPayload = GRADES.flatMap((grade, gradeIndex) =>
      getSubjectsForGrade(gradeIndex + 1).map((subjectName) => ({
        name: subjectName,
        code: getSubjectCode(subjectName, gradeIndex + 1),
        grade,
        assignedTeacher: subjectTeacherByName.get(subjectName)?._id,
      }))
    );
    const subjects = await Subject.insertMany(subjectsPayload);
    console.log(`Inserted ${subjects.length} subjects`);

    const syllabusDocs = await Syllabus.insertMany(
      subjects.map((subject: any) => ({
        grade: subject.grade,
        subject: subject._id,
        academicYear: ACADEMIC_YEAR,
        units: [
          {
            title: `${subject.name} Foundations`,
            objectives: [`Understand core concepts of ${subject.name}`, `Build classroom confidence in ${subject.name}`],
            recommendedWeeks: 4,
          },
          {
            title: `${subject.name} Applications`,
            objectives: [`Practice problem solving in ${subject.name}`, `Prepare for periodic assessments`],
            recommendedWeeks: 5,
          },
          {
            title: `${subject.name} Revision & Projects`,
            objectives: ["Consolidate unit learnings", "Complete assignment-based review"],
            recommendedWeeks: 3,
          },
        ],
        referenceBooks: [`${subject.name} Textbook`, `${subject.name} Workbook`],
        assessmentPattern: "20% periodic tests, 30% assignments, 50% term examinations",
      }))
    );
    console.log(`Inserted ${syllabusDocs.length} syllabi`);

    let globalStudentIndex = 0;
    const studentsPayload = GRADES.flatMap((grade, gradeIndex) =>
      SECTIONS.flatMap((section, sectionIndex) =>
        Array.from({ length: 5 }, (_, localIndex) => {
          const studentIndex = globalStudentIndex++;
          const name = buildStudentName(studentIndex);
          const parentName = `${buildStudentName(studentIndex + 30)} ${studentIndex % 2 === 0 ? "Sr." : "Mrs."}`;
          const classKey = `${grade}-${section}`;
          const rollNumber = `${gradeIndex + 1}${section}${String(localIndex + 1).padStart(2, "0")}`;
          const admissionNumber = `ADM-2026-${String(studentIndex + 1).padStart(4, "0")}`;
          return {
            name,
            email: makeEmail(name, `s${studentIndex + 1}`),
            phone: `800200${String(studentIndex + 1).padStart(4, "0")}`,
            admissionNumber,
            grade,
            section,
            status: getStudentStatus(studentIndex),
            enrollmentDate: new Date(2026, 3, 2 + (studentIndex % 20)),
            parentName,
            parentPhone: `700300${String(studentIndex + 1).padStart(4, "0")}`,
            address: `${studentIndex + 10} Learning Street, ${section} Block, Green Valley Township`,
            dateOfBirth: new Date(2010 - gradeIndex, (studentIndex + sectionIndex) % 12, 1 + (localIndex * 3)),
            gender: (studentIndex + sectionIndex) % 3 === 0 ? "Female" : (studentIndex % 5 === 0 ? "Other" : "Male"),
            fees: { total: 0, paid: 0, pending: 0 },
            avatar: "",
            classKey,
            rollNumber,
          };
        })
      )
    );

    const students = await Student.insertMany(
      studentsPayload.map(({ classKey, ...student }) => ({
        ...student,
        address: student.address,
      }))
    );
    console.log(`Inserted ${students.length} students`);

    const subjectMap = new Map<string, any[]>();
    subjects.forEach((subject: any) => {
      const current = subjectMap.get(subject.grade) || [];
      current.push(subject);
      subjectMap.set(subject.grade, current);
    });

    const feeStructuresPayload = GRADES.flatMap((grade, gradeIndex) =>
      getFeePlan(gradeIndex + 1).map((fee) => ({
        grade,
        title: fee.title,
        amount: fee.amount,
        dueDate: fee.dueDate,
        category: fee.category as "Tuition" | "Transport" | "Library" | "Examination" | "Miscellaneous",
        description: `${fee.title} for ${grade} in ${ACADEMIC_YEAR}`,
        isActive: true,
      }))
    );
    const feeStructures = await FeeStructure.insertMany(feeStructuresPayload);
    console.log(`Inserted ${feeStructures.length} fee structures`);

    const feeStructureMap = new Map<string, any[]>();
    feeStructures.forEach((fee: any) => {
      const current = feeStructureMap.get(fee.grade) || [];
      current.push(fee);
      feeStructureMap.set(fee.grade, current);
    });

    const paymentsPayload: any[] = [];
    await Promise.all(
      students.map(async (student: any, index: number) => {
        const gradeFees = feeStructureMap.get(student.grade) || [];
        const total = gradeFees.reduce((sum, fee) => sum + fee.amount, 0);
        const paymentRatio = getPaymentRatio(index);
        const targetPaid = Math.round(total * paymentRatio);
        let accumulated = 0;

        gradeFees.forEach((fee, feeIndex) => {
          const remaining = targetPaid - accumulated;
          if (remaining <= 0) return;
          const amount = Math.min(
            fee.amount,
            feeIndex === gradeFees.length - 1 ? remaining : Math.max(Math.round(fee.amount * paymentRatio), Math.round(remaining / 2))
          );
          accumulated += amount;
          paymentsPayload.push({
            studentId: student._id,
            feeStructureId: fee._id,
            grade: student.grade,
            amount,
            date: new Date(2026, 3 + feeIndex, 8 + (index % 12)),
            mode: ["Cash", "Online", "Bank Transfer"][index % 3],
            receiptNo: `RCPT-${String(gradeFees[0].grade.replace("Grade ", "")).padStart(2, "0")}-${String(index + 1).padStart(4, "0")}-${feeIndex + 1}`,
            notes: feeIndex === 0 ? "Initial installment received." : "Follow-up installment received.",
          });
        });

        await Student.findByIdAndUpdate(student._id, {
          $set: {
            fees: {
              total,
              paid: accumulated,
              pending: Math.max(total - accumulated, 0),
            },
          },
        });
      })
    );
    const payments = await Payment.insertMany(paymentsPayload);
    console.log(`Inserted ${payments.length} payments`);

    const examsPayload = subjects.flatMap((subject: any, index: number) => [
      {
        name: `${subject.name} Unit Test 1`,
        subject: subject._id,
        grade: subject.grade,
        date: new Date(2026, 5, 5 + (index % 18)),
        totalMarks: 50,
      },
      {
        name: `${subject.name} Term 1`,
        subject: subject._id,
        grade: subject.grade,
        date: new Date(2026, 8, 10 + (index % 12)),
        totalMarks: 100,
      },
    ]);
    const exams = await Exam.insertMany(examsPayload);
    console.log(`Inserted ${exams.length} exams`);

    const studentsByGrade = new Map<string, any[]>();
    students.forEach((student: any) => {
      const current = studentsByGrade.get(student.grade) || [];
      current.push(student);
      studentsByGrade.set(student.grade, current);
    });

    const resultsPayload = exams.flatMap((exam: any, examIndex: number) =>
      (studentsByGrade.get(exam.grade) || []).map((student: any, studentIndex: number) => ({
        student: student._id,
        exam: exam._id,
        marksObtained: getMark(exam.totalMarks, studentIndex * 7 + examIndex * 3),
        remarks: studentIndex % 6 === 0 ? "Consistent performance" : "Progressing well",
      }))
    );
    const results = await Result.insertMany(resultsPayload);
    console.log(`Inserted ${results.length} results`);

    const attendanceDates = [
      new Date("2026-06-15"),
      new Date("2026-06-16"),
      new Date("2026-06-17"),
      new Date("2026-06-18"),
      new Date("2026-06-19"),
      new Date("2026-07-20"),
      new Date("2026-07-21"),
      new Date("2026-07-22"),
    ];

    const attendancePayload = classes.map((classDoc: any, classIndex: number) => {
      const classStudents = students.filter(
        (student: any) => student.grade === classDoc.grade && student.section === classDoc.section
      );

      return attendanceDates.map((date, dateIndex) => ({
        date,
        grade: classDoc.grade,
        section: classDoc.section,
        recordedBy: classTeacherMap.get(`${classDoc.grade}-${classDoc.section}`)?._id,
        records: classStudents.map((student: any, studentIndex: number) => {
          const status = getAttendanceStatus(studentIndex + classIndex * 2 + dateIndex * 5);
          return {
            studentId: student._id,
            status,
            remarks: getRemarks(status),
          };
        }),
      }));
    }).flat();
    const attendance = await Attendance.insertMany(attendancePayload);
    console.log(`Inserted ${attendance.length} attendance sheets`);

    const eventDocs = await Event.insertMany([
      {
        title: "School Reopening Day",
        type: "Activity",
        startDate: new Date("2026-06-10"),
        endDate: new Date("2026-06-10"),
        audience: "School",
        description: "First working day of the academic session.",
        isHoliday: false,
      },
      {
        title: "Independence Day Celebration",
        type: "Activity",
        startDate: new Date("2026-08-15"),
        endDate: new Date("2026-08-15"),
        audience: "School",
        description: "Assembly, cultural programme, and flag hoisting.",
        isHoliday: false,
      },
      {
        title: "Gandhi Jayanti Holiday",
        type: "Holiday",
        startDate: new Date("2026-10-02"),
        endDate: new Date("2026-10-02"),
        audience: "School",
        description: "National holiday.",
        isHoliday: true,
      },
      {
        title: "Parent Teacher Meeting - Term 1",
        type: "Meeting",
        startDate: new Date("2026-09-26"),
        endDate: new Date("2026-09-26"),
        audience: "Parents",
        description: "Term 1 parent-teacher review meeting.",
        isHoliday: false,
      },
      {
        title: "Senior Secondary Practical Exams",
        type: "Exam",
        startDate: new Date("2026-11-18"),
        endDate: new Date("2026-11-22"),
        audience: "Students",
        grade: "Grade 11",
        description: "Practical assessment window for science stream.",
        isHoliday: false,
      },
    ]);
    console.log(`Inserted ${eventDocs.length} events`);

    const certificateTemplates = await CertificateTemplate.insertMany(buildCertificateTemplates());
    console.log(`Inserted ${certificateTemplates.length} certificate/print templates`);

    console.log("");
    console.log("School dataset ready:");
    console.log(`- Settings: ${setting.schoolName}`);
    console.log(`- Teachers: ${teachers.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- Courses: ${courseDocs.length}`);
    console.log(`- Subjects: ${subjects.length}`);
    console.log(`- Syllabi: ${syllabusDocs.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Fee structures: ${feeStructures.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Exams: ${exams.length}`);
    console.log(`- Results: ${results.length}`);
    console.log(`- Attendance sheets: ${attendance.length}`);
    console.log(`- Events: ${eventDocs.length}`);
    console.log(`- Templates: ${certificateTemplates.length}`);
    console.log("");
    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
