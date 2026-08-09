export interface KidMember {
  id: string;
  full_name: string;
  birth_date?: string;
  date_of_birth?: string;
  dob?: string;
  class_id?: string | null;
  class_name?: string | null;
  [key: string]: any;
}

export interface KidsClass {
  id: string;
  class_name: string;
  min_age?: number | null;
  max_age?: number | null;
  [key: string]: any;
}

/**
 * Calculates exact age in years from any birth date string
 */
export const calculateAgeInYears = (dobString?: string | null): number | null => {
  if (!dobString) return null;
  
  let dateObj: Date | null = null;
  try {
    const raw = String(dobString).trim();
    dateObj = new Date(raw);
  } catch {
    dateObj = new Date(dobString);
  }

  if (!dateObj || isNaN(dateObj.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dateObj.getFullYear();
  const m = today.getMonth() - dateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

/**
 * Determines the matching class for a kid based on their age or explicit class_id
 */
export const getAutoAssignedClass = (kid: KidMember, classes: KidsClass[]): KidsClass | null => {
  if (!classes || classes.length === 0) return null;

  // 1. Explicit class_id assignment
  if (kid.class_id) {
    const found = classes.find(c => c.id === kid.class_id);
    if (found) return found;
  }

  // 2. Explicit class_name match
  if (kid.class_name) {
    const found = classes.find(c => c.class_name?.toLowerCase().trim() === kid.class_name?.toLowerCase().trim());
    if (found) return found;
  }

  // 3. Automatic Age-based Assignment
  const age = calculateAgeInYears(kid.birth_date || kid.date_of_birth || kid.dob);
  if (age === null) return null;

  const matchedClass = classes.find(c => {
    const min = c.min_age !== null && c.min_age !== undefined ? c.min_age : 0;
    const max = c.max_age !== null && c.max_age !== undefined ? c.max_age : 99;
    return age >= min && age <= max;
  });

  return matchedClass || null;
};

/**
 * Groups kids list by class ID including auto-assigned kids
 */
export const groupKidsByClass = (kids: KidMember[], classes: KidsClass[]) => {
  const map = new Map<string, KidMember[]>();
  classes.forEach(c => map.set(c.id, []));
  const unassigned: KidMember[] = [];

  kids.forEach(kid => {
    const assignedClass = getAutoAssignedClass(kid, classes);
    if (assignedClass) {
      const list = map.get(assignedClass.id) || [];
      list.push({ ...kid, auto_class_name: assignedClass.class_name });
      map.set(assignedClass.id, list);
    } else {
      unassigned.push(kid);
    }
  });

  return { classMap: map, unassigned };
};
