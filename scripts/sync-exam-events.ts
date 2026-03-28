import mongoose from "mongoose";
import Exam from "../src/models/Exam";
import Event from "../src/models/Event";
import { syncExamEvent } from "../src/lib/calendar";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required.");
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const exams = await Exam.find().select("_id").lean();
    let synced = 0;

    for (const exam of exams) {
      await syncExamEvent(exam._id.toString());
      synced += 1;
    }

    const totalExamEvents = await Event.countDocuments({ type: "Exam", linkedExam: { $ne: null } });
    console.log(`Synced ${synced} exam events.`);
    console.log(`Calendar now has ${totalExamEvents} linked exam events.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to sync exam events:", error);
    process.exit(1);
  }
}

run();
