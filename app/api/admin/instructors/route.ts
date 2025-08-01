import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

// GET - Fetch instructors from users table with instructor role and real-time counts
// route.ts - Updated GET handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // First verify database connection
    await sql`SELECT 1`;
    console.log("✅ Database connection verified");

    // Get total count
    let totalQuery = sql`SELECT COUNT(*) as total FROM users WHERE role = 'instructor'`;
    if (search) {
      totalQuery = sql`${totalQuery} AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`;
    }
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.total) || 0;
    const totalPages = Math.ceil(total / limit);

    // Get instructors data
    let query = sql`
      SELECT 
        id as user_id,
        full_name as name,
        email,
        phone,
        'active' as status,
        '' as specialization,
        0 as experience,
        0 as trainings_count,
        0 as students_count,
        TO_CHAR(created_at, 'YYYY-MM-DD') as join_date,
        0 as upcoming_sessions
      FROM users 
      WHERE role = 'instructor'
    `;

    if (search) {
      query = sql`${query} AND (full_name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`;
    }

    query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const instructors = await query;

    return NextResponse.json({
      instructors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Detailed error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch instructors",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// POST - Create new instructor (creates user first, then instructor record)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, specialization, experience, status, password } = body

    console.log("🚀 Creating new instructor user:", { name, email, specialization })

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user with instructor role first
    const user = await sql`
      INSERT INTO users (full_name, email, phone, role, password_hash, created_at, updated_at)
      VALUES (${name}, ${email}, ${phone}, 'instructor', ${passwordHash}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `

    const userId = user[0].id

    // Create instructor record linked to user
    const instructor = await sql`
      INSERT INTO instructors (
        user_id, full_name, email, phone, specialization, experience, 
        status, password_hash, trainings_count, students_count,
        created_at, updated_at
      )
      VALUES (
        ${userId}, ${name}, ${email}, ${phone}, ${specialization}, ${experience}, 
        ${status}, ${passwordHash}, 0, 0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    console.log("✅ Instructor user created successfully with user_id:", userId)
    return NextResponse.json({ instructor: { ...instructor[0], user_id: userId } })
  } catch (error) {
    console.error("❌ Error creating instructor:", error)
    return NextResponse.json({ error: "Failed to create instructor" }, { status: 500 })
  }
}

// PUT - Update instructor (updates both user and instructor records)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, specialization, experience, status, password } = body

    console.log("🔄 Updating instructor user:", { id, name, email })

    // Hash password if provided
    let passwordHash = null
    if (password) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Get user_id from instructor
    const instructorRecord = await sql`
      SELECT user_id FROM instructors WHERE id = ${id}
    `

    if (instructorRecord.length === 0) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const userId = instructorRecord[0].user_id

    // Update user record
    if (passwordHash) {
      await sql`
        UPDATE users 
        SET full_name = ${name}, email = ${email}, phone = ${phone}, 
            password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    } else {
      await sql`
        UPDATE users 
        SET full_name = ${name}, email = ${email}, phone = ${phone}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `
    }

    // Update instructor record
    let instructor
    if (passwordHash) {
      instructor = await sql`
        UPDATE instructors 
        SET full_name = ${name}, email = ${email}, phone = ${phone}, specialization = ${specialization}, 
            experience = ${experience}, status = ${status}, password_hash = ${passwordHash}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      instructor = await sql`
        UPDATE instructors 
        SET full_name = ${name}, email = ${email}, phone = ${phone}, specialization = ${specialization}, 
            experience = ${experience}, status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    }

    console.log("✅ Instructor user updated successfully")
    return NextResponse.json({ instructor: instructor[0] })
  } catch (error) {
    console.error("❌ Error updating instructor:", error)
    return NextResponse.json({ error: "Failed to update instructor" }, { status: 500 })
  }
}

// DELETE - Delete instructor (removes both instructor and user records)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 })
    }

    console.log("🗑️ Deleting instructor user:", id)

    // Get user_id from instructor
    const instructorRecord = await sql`
      SELECT user_id FROM instructors WHERE id = ${id}
    `

    if (instructorRecord.length === 0) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 })
    }

    const userId = instructorRecord[0].user_id

    // Delete instructor record first
    await sql`DELETE FROM instructors WHERE id = ${id}`

    // Delete user record
    if (userId) {
      await sql`DELETE FROM users WHERE id = ${userId}`
    }

    console.log("✅ Instructor user deleted successfully")
    return NextResponse.json({ message: "Instructor and user account deleted successfully" })
  } catch (error) {
    console.error("❌ Error deleting instructor:", error)
    return NextResponse.json({ error: "Failed to delete instructor" }, { status: 500 })
  }
}
