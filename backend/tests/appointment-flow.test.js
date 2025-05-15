const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");

describe("Comprehensive Appointment Flow", () => {
  let studentA1Token, studentA2Token, professorP1Token;
  let professorP1Id;
  let timeSlotT1Id, timeSlotT2Id;
  let appointmentA1Id;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    } catch (error) {
      console.error("Cleanup error:", error);
      throw error;
    }
  });

  describe("1. User Authentication", () => {
    test("Student A1 authenticates to access the system", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "studentA1@test.com",
        password: "password123",
        name: "Student A1",
        role: "student",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      studentA1Token = response.body.token;
    });

    test("Professor P1 authenticates to access the system", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "professorP1@test.com",
        password: "password123",
        name: "Professor P1",
        role: "professor",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      professorP1Token = response.body.token;

      const decodedToken = require("jsonwebtoken").verify(
        professorP1Token,
        process.env.JWT_SECRET
      );
      professorP1Id = decodedToken.userId;
    });
  });

  describe("2. Professor Availability Management", () => {
    test("Professor P1 specifies which time slots he is free for appointments", async () => {
      const startTimeT1 = new Date();
      startTimeT1.setHours(startTimeT1.getHours() + 1);
      const endTimeT1 = new Date(startTimeT1);
      endTimeT1.setHours(endTimeT1.getHours() + 1);

      const responseT1 = await request(app)
        .post("/api/availability")
        .set("Authorization", `Bearer ${professorP1Token}`)
        .send({
          startTime: startTimeT1.toISOString(),
          endTime: endTimeT1.toISOString(),
        });

      expect(responseT1.status).toBe(201);
      timeSlotT1Id = responseT1.body._id;

      const startTimeT2 = new Date(endTimeT1);
      const endTimeT2 = new Date(startTimeT2);
      endTimeT2.setHours(endTimeT2.getHours() + 1);

      const responseT2 = await request(app)
        .post("/api/availability")
        .set("Authorization", `Bearer ${professorP1Token}`)
        .send({
          startTime: startTimeT2.toISOString(),
          endTime: endTimeT2.toISOString(),
        });

      expect(responseT2.status).toBe(201);
      timeSlotT2Id = responseT2.body._id;
    });

    test("Student A1 views available time slots for Professor P1", async () => {
      const response = await request(app)
        .get(`/api/availability/${professorP1Id}`)
        .set("Authorization", `Bearer ${studentA1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe("3. Appointment Booking", () => {
    test("Student A1 books an appointment with Professor P1 for time T1", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${studentA1Token}`)
        .send({
          slotId: timeSlotT1Id,
          professorId: professorP1Id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      appointmentA1Id = response.body._id;
    });

    test("Student A2 authenticates to access the system", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "studentA2@test.com",
        password: "password123",
        name: "Student A2",
        role: "student",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      studentA2Token = response.body.token;
    });

    test("Student A2 books an appointment with Professor P1 for time T2", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${studentA2Token}`)
        .send({
          slotId: timeSlotT2Id,
          professorId: professorP1Id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
    });
  });

  describe("4. Appointment Cancellation and Verification", () => {
    test("Professor P1 cancels the appointment with Student A1", async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentA1Id}`)
        .set("Authorization", `Bearer ${professorP1Token}`);

      expect(response.status).toBe(200);
    });

    test("Student A1 checks their appointments and has no pending appointments", async () => {
      const response = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${studentA1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const pendingAppointments = response.body.filter(
        (appointment) => appointment.status === "scheduled"
      );
      expect(pendingAppointments.length).toBe(0);

      const cancelledAppointment = response.body.find(
        (appointment) => appointment._id === appointmentA1Id
      );
      expect(cancelledAppointment.status).toBe("cancelled");
    });
  });
});