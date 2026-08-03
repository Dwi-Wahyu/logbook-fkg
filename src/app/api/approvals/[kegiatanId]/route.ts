import { NextRequest, NextResponse } from "next/server";
import { getApprovalsByKegiatan } from "@/app/_lib/queries/approvalQueries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kegiatanId: string }> },
) {
  try {
    const { kegiatanId } = await params;

    if (!kegiatanId) {
      return NextResponse.json(
        { error: "Kegiatan ID required" },
        { status: 400 },
      );
    }

    const data = await getApprovalsByKegiatan(kegiatanId);

    return NextResponse.json({
      data: data,
    });
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
