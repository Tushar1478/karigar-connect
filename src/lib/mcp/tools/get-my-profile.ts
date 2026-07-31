import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description: "Get the signed-in user's KarigarHub profile, and their karigar listing if they are a karigar.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name,email,phone,location,role")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const { data: karigar } = await supabase
      .from("karigars")
      .select("id,name,skill,location,price,rating,review_count,availability,completed_jobs,total_earnings")
      .eq("user_id", userId)
      .maybeSingle();

    const result = { profile: profile ?? null, karigar: karigar ?? null };
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
