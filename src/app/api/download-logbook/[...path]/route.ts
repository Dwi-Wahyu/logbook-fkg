import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFileSync, statSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> } // Use Promise for params
) {
  try {
    // Await params to get the path array
    const { path } = await params;

    // Validate path
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const filePath = join(process.cwd(), "generated_logbook", path[0]);
    const stats = statSync(filePath);

    if (!stats.isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = readFileSync(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${path[0]}"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
