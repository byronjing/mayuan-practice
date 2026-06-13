import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const emptyRecords = {
  attempts: [],
  wrongBook: {},
  answerOverrides: {},
  backupMeta: {
    backupVersion: 1,
    questionBankVersion: "2026-05-28-release",
    updatedAt: null
  }
};

function getSecretKey() {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) return JSON.parse(secretKeys).default;
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function assertStudentId(value: unknown) {
  const studentId = String(value || "").trim();
  if (!/^[A-Za-z0-9._-]+$/.test(studentId)) {
    throw new Error("学号只能包含字母、数字、点、横线或下划线。");
  }
  return studentId;
}

function studentEmail(studentId: string) {
  return `${studentId}@${Deno.env.get("STUDENT_EMAIL_DOMAIN") || "mayuan.local"}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
    const anonKey = publishableKeys ? JSON.parse(publishableKeys).default : Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = getSecretKey();
    const authHeader = req.headers.get("Authorization") || "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: current, error: currentError } = await userClient.auth.getUser();
    if (currentError || !current.user) return jsonResponse({ error: "请先登录。" }, 401);

    const { data: adminProfile, error: adminError } = await adminClient
      .from("app_users")
      .select("student_id,role,is_active")
      .eq("user_id", current.user.id)
      .maybeSingle();
    if (adminError) throw adminError;
    if (adminProfile?.role !== "admin" || !adminProfile?.is_active) {
      return jsonResponse({ error: "只有管理员可以管理账号。" }, 403);
    }

    const body = await req.json();
    const action = String(body.action || "");

    if (action === "list") {
      const { data, error } = await adminClient
        .from("app_users")
        .select("student_id,display_name,role,is_active,created_at")
        .order("student_id", { ascending: true });
      if (error) throw error;
      return jsonResponse({ users: data || [] });
    }

    if (action === "create") {
      const studentId = assertStudentId(body.studentId);
      const password = String(body.password || "");
      if (password.length < 6) throw new Error("密码至少 6 位。");
      const displayName = String(body.displayName || "").trim();

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: studentEmail(studentId),
        password,
        email_confirm: true,
        user_metadata: { student_id: studentId, display_name: displayName }
      });
      if (createError) throw createError;
      const userId = created.user?.id;
      if (!userId) throw new Error("创建账号失败。");

      const { error: profileError } = await adminClient.from("app_users").insert({
        user_id: userId,
        student_id: studentId,
        display_name: displayName,
        role: "student",
        is_active: true
      });
      if (profileError) throw profileError;

      const { error: recordError } = await adminClient.from("practice_records").insert({
        user_id: userId,
        records: emptyRecords,
        question_bank_version: emptyRecords.backupMeta.questionBankVersion
      });
      if (recordError) throw recordError;
      return jsonResponse({ ok: true });
    }

    if (action === "resetPassword") {
      const studentId = assertStudentId(body.studentId);
      const password = String(body.password || "");
      if (password.length < 6) throw new Error("密码至少 6 位。");
      const { data: profile, error: profileError } = await adminClient
        .from("app_users")
        .select("user_id")
        .eq("student_id", studentId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error("账号不存在。");
      const { error } = await adminClient.auth.admin.updateUserById(profile.user_id, { password });
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    if (action === "setActive") {
      const studentId = assertStudentId(body.studentId);
      const isActive = Boolean(body.isActive);
      if (!isActive && studentId === adminProfile.student_id) {
        throw new Error("不能停用当前登录的管理员账号。");
      }
      const { error } = await adminClient
        .from("app_users")
        .update({ is_active: isActive })
        .eq("student_id", studentId);
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "操作失败。" }, 400);
  }
});
