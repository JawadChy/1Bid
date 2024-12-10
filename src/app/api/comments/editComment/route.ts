// api/comments/editComment
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  // Break down request
  const { comment_id, content } = await request.json();


  const supabase = await createClient();

  // Call the function to update the comment content. Timestamp update will be done automatically.
  const { error } = await supabase.rpc("update_comment", {
    p_comment_id: comment_id,  // Provide the comment ID
    p_content: content,        // Provide the new content
  });

  // Return success or error response
  if (error) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }

  return NextResponse.json({ message: 'Comment updated successfully' }, { status: 200 });
}

/* Sample Body
{
  "comment_id": "",
  "content": "Updated comment content here."
}
*/
