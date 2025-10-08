import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`SELECT total_plays FROM game_stats LIMIT 1`;
    const totalPlays = rows[0]?.total_plays ?? 0;
    return NextResponse.json({ totalPlays });
  } catch (error) {
    console.error("Failed to fetch total plays:", error);
    return NextResponse.json(
      { error: "Failed to fetch total plays" },
      { status: 500 }
    );
  }
}
