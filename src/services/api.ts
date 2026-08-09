import { supabase } from "./supabaseClient";
import { compressAndConvertToWebP } from "../utils/image";

// Helper to infer MIME type from file extension if file.type is empty (common in mobile WebViews)
export const getMimeType = (fileName: string, fileType?: string): string => {
  if (fileType && fileType.trim() !== "") {
    return fileType;
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/jpeg"; // fallback to jpeg for images
  }
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendanceService = {
  saveAttendance: async (records: AttendanceRecord[]) => {
    const { data, error } = await supabase
      .from("study_attendance")
      .upsert(records, { onConflict: "group_id,member_id,date" })
      .select();
    if (error) throw error;
    return data;
  },

  getAttendanceHistory: async (groupId: string) => {
    const { data, error } = await supabase
      .from("study_attendance")
      .select(`*, members(full_name, image_url)`)
      .eq("group_id", groupId)
      .order("date", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Web-compatible upload using HTML5 File objects
  uploadSessionPhotos: async (
    groupId: string,
    date: string,
    files: File[]
  ): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      // Compress and convert to WebP on the client side
      const compressedFile = await compressAndConvertToWebP(file, 1200, 1200, 0.8);
      const ext = "webp";
      const path = `${groupId}/${date}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const contentType = "image/webp";

      const { error } = await supabase.storage
        .from("attendance-photos")
        .upload(path, compressedFile, { upsert: false, contentType });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("attendance-photos")
        .getPublicUrl(path);
      urls.push(publicUrl);
    }
    return urls;
  },

  // Save the uploaded URLs into attendance_session_photos table
  saveSessionPhotos: async (
    groupId: string,
    date: string,
    photoUrls: string[],
    uploadedBy: string
  ) => {
    const rows = photoUrls.map((url) => ({
      group_id: groupId,
      date,
      photo_url: url,
      uploaded_by: uploadedBy,
    }));
    const { data, error } = await supabase
      .from("attendance_session_photos")
      .insert(rows)
      .select();
    if (error) throw error;
    return data;
  },

  // Fetch already-saved session photos for a group
  getSessionPhotos: async (groupId: string): Promise<SessionPhoto[]> => {
    try {
      const { data, error } = await supabase
        .from("attendance_session_photos")
        .select("*")
        .eq("group_id", groupId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    } catch {
      return []; // table may not exist yet
    }
  },
};

// ─── Study Progress ───────────────────────────────────────────────────────────

export const studyService = {
  saveStudy: async (study: StudyRecord) => {
    const { data, error } = await supabase
      .from("study_progress")
      .insert([study])
      .select();
    if (error) throw error;
    return data;
  },

  getStudyHistory: async (groupId: string) => {
    const { data, error } = await supabase
      .from("study_progress")
      .select("*")
      .eq("group_id", groupId)
      .order("completion_date", { ascending: false });
    if (error) throw error;
    return data;
  },
};

// ─── Members ──────────────────────────────────────────────────────────────────

const isKidsMember = (m: any): boolean => {
  if (!m) return false;
  if (m.type === "kid") return true;

  if (m.age_group) {
    const ag = String(m.age_group).toLowerCase().trim();
    if (
      ag.includes("kid") ||
      ag.includes("child") ||
      ag.includes("ህፃን") ||
      ag.includes("ህጻን") ||
      ag.includes("ህፃናት") ||
      ag.includes("ህጻናት") ||
      ag.includes("children")
    ) {
      return true;
    }
  }

  if (m.role) {
    const r = String(m.role).toLowerCase().trim();
    if (r.includes("kid") || r.includes("child") || r.includes("student")) return true;
  }

  if (Array.isArray(m.ministries)) {
    return m.ministries.some((min: string) => {
      const ms = String(min).toLowerCase().trim();
      return (
        ms.includes("kid") ||
        ms.includes("child") ||
        ms.includes("ህፃን") ||
        ms.includes("ህጻን") ||
        ms.includes("ህፃናት") ||
        ms.includes("ህጻናት") ||
        ms.includes("children")
      );
    });
  }

  if (typeof m.ministries === "string") {
    const ms = String(m.ministries).toLowerCase().trim();
    if (
      ms.includes("kid") ||
      ms.includes("child") ||
      ms.includes("ህፃን") ||
      ms.includes("ህጻን") ||
      ms.includes("ህፃናት") ||
      ms.includes("ህጻናት") ||
      ms.includes("children")
    ) return true;
  }

  return false;
};

export const memberService = {
  getMembers: async () => {
    const { data, error } = await supabase
      .from("members")
      .select(`*, bible_study_groups(group_name)`)
      .order("full_name");
    if (error) throw error;
    return data;
  },

  getKidsMinistryMembers: async () => {
    try {
      const { data: membersData } = await supabase
        .from("members")
        .select("*, bible_study_groups(group_name)");

      const kidsFromMembers = (membersData || [])
        .filter(m => isKidsMember(m))
        .map(m => ({
          id: m.id,
          full_name: m.full_name,
          birth_date: m.date_of_birth,
          gender: m.gender || "Unspecified",
          image_url: m.image_url,
          phone: m.phone,
          parent_name: m.emergency_contact_name || m.parent_name || null,
          class_id: m.kids_class_id || null,
          growth_notes: m.notes || m.growth_notes || "",
          source: "members",
          members: { full_name: m.emergency_contact_name || "Church Member" }
        }));

      let kidsTableData: any[] = [];
      try {
        const { data: kidsData } = await supabase
          .from("kids")
          .select("*, kids_classes(class_name), members(full_name)")
          .order("full_name");
        kidsTableData = (kidsData || []).map(k => ({
          ...k,
          birth_date: k.birth_date || k.date_of_birth || k.dob,
          source: "kids"
        }));
      } catch (e) {}

      const combined = [...kidsTableData, ...kidsFromMembers];
      const nameMap = new Map<string, any>();
      for (const item of combined) {
        if (!item.full_name) continue;
        const key = item.full_name.trim().toLowerCase();
        if (!nameMap.has(key)) {
          nameMap.set(key, item);
        } else {
          const existing = nameMap.get(key);
          nameMap.set(key, {
            ...existing,
            ...item,
            image_url: existing.image_url || item.image_url || null,
            birth_date: existing.birth_date || item.birth_date || null,
            class_id: existing.class_id || item.class_id || null,
            kids_classes: existing.kids_classes || item.kids_classes || null,
          });
        }
      }

      return Array.from(nameMap.values());
    } catch (err) {
      console.error("getKidsMinistryMembers error:", err);
      return [];
    }
  },

  getYouthMinistryMembers: async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*, bible_study_groups(group_name)")
        .order("full_name");
      if (error) throw error;
      const list = data || [];
      return list.filter((m: any) => {
        const ag = (m.age_group || "").toLowerCase();
        const role = (m.role || "").toLowerCase();
        const min = Array.isArray(m.ministries)
          ? m.ministries.join(" ").toLowerCase()
          : (m.ministries || "").toLowerCase();
        return (
          ag.includes("youth") || ag.includes("teen") || ag.includes("young") || ag.includes("ወጣት") || ag.includes("ታዳጊ") ||
          role.includes("youth") || role.includes("teen") ||
          min.includes("youth") || min.includes("teen")
        );
      });
    } catch (err) {
      console.error("getYouthMinistryMembers error:", err);
      return [];
    }
  },
};

// ─── Youth Service ────────────────────────────────────────────────────────────

export const youthService = {
  getAttendance: async (date?: string) => {
    try {
      let query = supabase.from("youth_attendance").select("*").order("date", { ascending: false });
      if (date) {
        query = query.eq("date", date);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("getYouthAttendance error:", err);
      return [];
    }
  },

  saveAttendance: async (records: { member_id: string; date: string; status: string; recorded_by?: string }[]) => {
    try {
      const { data, error } = await supabase.from("youth_attendance").upsert(records, { onConflict: "member_id,date" });
      if (error) {
        // Fallback to manual check if upsert constraint differs
        for (const r of records) {
          const { data: existing } = await supabase
            .from("youth_attendance")
            .select("id")
            .eq("member_id", r.member_id)
            .eq("date", r.date)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("youth_attendance")
              .update({ status: r.status, recorded_by: r.recorded_by })
              .eq("id", existing.id);
          } else {
            await supabase.from("youth_attendance").insert(r);
          }
        }
      }
      return data;
    } catch (err) {
      console.error("saveYouthAttendance error:", err);
      throw err;
    }
  },
};

// ─── Groups ───────────────────────────────────────────────────────────────────

export const groupService = {
  getGroups: async () => {
    const { data, error } = await supabase
      .from("bible_study_groups")
      .select(`*, group_leaders(profiles(full_name, role)), members(id)`)
      .order("group_name");
    if (error) throw error;
    return (data ?? []).map((g: any) => ({
      ...g,
      leaders: g.group_leaders?.map((gl: any) => gl.profiles) ?? [],
      members_count: g.members?.length ?? 0,
    }));
  },

  assignLeader: async (groupId: string, userId: string) => {
    const { data, error } = await supabase
      .from("group_leaders")
      .insert({ group_id: groupId, user_id: userId })
      .select();
    if (error) throw error;
    return data;
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messageService = {
  fetchMessages: async (channel: string | null, userId: string, targetId?: string) => {
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (channel) {
      query = query.eq("channel", channel);
    } else if (targetId) {
      query = query
        .is("channel", null)
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${targetId}),and(sender_id.eq.${targetId},recipient_id.eq.${userId})`
        );
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  sendMessage: async (payload: {
    sender_id: string;
    content: string;
    channel?: string;
    recipient_id?: string;
  }) => {
    const { data, error } = await supabase
      .from("messages")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  fetchProfiles: async () => {
    const { data } = await supabase
      .from("profiles")
      .select(`
        *,
        group_leaders (
          bible_study_groups (
            group_name
          )
        )
      `);
    const map: Record<string, any> = {};
    (data ?? []).forEach((p: any) => {
      const groupName = p.group_leaders?.[0]?.bible_study_groups?.group_name;
      map[p.id] = {
        ...p,
        group_name: groupName || undefined
      };
    });
    return map;
  },

  fetchRecentDMs: async (userId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, created_at")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .is("channel", null)
      .order("created_at", { ascending: false });

    const uniqueIds = new Set<string>();
    (data ?? []).forEach((m: any) => {
      if (m.sender_id !== userId) uniqueIds.add(m.sender_id);
      if (m.recipient_id !== userId) uniqueIds.add(m.recipient_id);
    });
    return Array.from(uniqueIds);
  },

  fetchAllUsers: async (excludeId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select(`
        *,
        group_leaders (
          bible_study_groups (
            group_name
          )
        )
      `)
      .neq("id", excludeId);
    return (data ?? []).map((p: any) => {
      const groupName = p.group_leaders?.[0]?.bible_study_groups?.group_name;
      return {
        ...p,
        group_name: groupName || undefined
      };
    });
  },

  fetchBibleStudyGroups: async () => {
    const { data } = await supabase.from("bible_study_groups").select("*");
    return data ?? [];
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  member_id: string;
  group_id: string;
  status: "Present" | "Absent" | "Excused";
  date: string;
}

export interface SessionPhoto {
  id?: string;
  group_id: string;
  date: string;
  photo_url: string;
  uploaded_by: string;
  created_at?: string;
}

export interface StudyRecord {
  study_topic: string;
  completion_date: string;
  notes: string;
  group_id: string;
  leader_id: string;
}

export interface Member {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  image_url?: string;
  leave_status?: string;
  group_id?: string;
}

export interface Group {
  id: string;
  group_name: string;
  location?: string;
  leaders: any[];
  members_count: number;
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export const appSettingsService = {
  getSetting: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error || !data) return defaultValue;
      return data.value as T;
    } catch {
      return defaultValue;
    }
  },
};
