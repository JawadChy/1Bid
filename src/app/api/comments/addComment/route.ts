// api/comments/addComment
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";  // Import Supabase client

export async function POST(request: NextRequest) {
  try {
    // Get body of request
    const body = await request.json();

    // Break down contents
    const { listing_id, user_id, visitor, content } = body;

    // Ensure nothing is missing
    if (!listing_id || (!user_id && !visitor) || !content) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }


    const supabase = await createClient();

    // Call the function in supabase and pass needed parameters
    const { data, error } = await supabase.rpc("create_comment", {
      p_listing_id: listing_id,
      p_user_id: user_id || null,  // Set user_id to null if it's a visitor
      p_visitor: visitor,
      p_content: content,
    });


    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to add comment" }, 
        { status: 500 }
      );
    }

    // Return success response with the result from the procedure
    return NextResponse.json({ message: 'Comment added successfully'}, { status: 200 });
  } catch (error: unknown) {
    // Catch and log any unexpected errors
    console.error("Error adding comment:", error);


    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    // Return the error message with a 500 status
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}

/* Sample body with request
{
  "listing_id": "",
  "user_id": "", 
  "visitor": false,
  "content": ""
}
*/