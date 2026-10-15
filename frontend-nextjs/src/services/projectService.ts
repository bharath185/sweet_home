import { HomePlan, User } from '../types/plan';
import { sarahPlan, davidPlan, emmaPlan } from './api';

export interface UserProjectSummary {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  floorsCount: number;
  roomsCount: number;
  furnitureCount: number;
  plan: HomePlan;
}

export interface StarterTemplateOption {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  floors: number;
  area: string;
  icon: string;
  basePlan: HomePlan;
}

export const BLANK_CANVAS_PLAN: HomePlan = {
  id: 'plan_blank_canvas',
  name: 'New Custom Home Plan',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 260 },
  ],
  walls: [
    { id: 'w_b1', xStart: -300, yStart: -250, xEnd: 300, yEnd: -250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w_b2', xStart: 300, yStart: -250, xEnd: 300, yEnd: 250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w_b3', xStart: 300, yStart: 250, xEnd: -300, yEnd: 250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w_b4', xStart: -300, yStart: 250, xEnd: -300, yEnd: -250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
  ],
  furniture: [],
  rooms: [
    {
      id: 'r_blank_1',
      name: 'Open Living Space',
      floorLevel: 0,
      points: [
        { x: -300, y: -250 },
        { x: 300, y: -250 },
        { x: 300, y: 250 },
        { x: -300, y: 250 },
      ],
      floorColor: '#f1f5f9',
      areaSquareMeters: 30.0,
    },
  ],
  dimensionLines: [],
  textNotes: [],
  preferences: {
    unitSystem: 'cm',
    defaultWallThickness: 15,
    defaultWallHeight: 260,
    gridSize: 20,
    magnetismEnabled: true,
    showRulers: true,
  },
};

export const STARTER_TEMPLATES: StarterTemplateOption[] = [
  {
    id: 'starter-sarah-suite',
    name: 'Modern 2-Bedroom Duplex',
    subtitle: 'Sarah Suite Architecture',
    badge: 'Popular Duplex',
    description: 'Two-story modern home with ground floor open-concept living, staircase, master bedroom, and ensuite bath.',
    floors: 2,
    area: '59 m²',
    icon: '🏡',
    basePlan: sarahPlan,
  },
  {
    id: 'starter-david-villa',
    name: 'Luxury Multi-Story Villa',
    subtitle: 'David Villa Architecture',
    badge: 'Luxury Duplex',
    description: 'Grand foyer with interior staircase, private presidential suites, luxury spa tub, and entertainer lounge.',
    floors: 2,
    area: '90 m²',
    icon: '🏰',
    basePlan: davidPlan,
  },
  {
    id: 'starter-emma-studio',
    name: 'Urban Minimalist Studio Loft',
    subtitle: 'Emma Studio Architecture',
    badge: 'Single Story',
    description: 'Chic open-concept urban loft with integrated kitchen island, lounge, daybed, and industrial bookcase.',
    floors: 1,
    area: '20 m²',
    icon: '🏙️',
    basePlan: emmaPlan,
  },
  {
    id: 'starter-blank-canvas',
    name: 'Blank Architectural Canvas',
    subtitle: 'Clean Slate Blueprint',
    badge: 'Custom Build',
    description: 'Fresh architectural boundaries ready for you to build your custom rooms, walls, stairs, and interior layout.',
    floors: 1,
    area: 'Custom',
    icon: '📐',
    basePlan: BLANK_CANVAS_PLAN,
  },
];

const getStorageKey = (userId: string) => `sweethome_user_projects_${userId}`;

export function getUserProjects(userId: string): UserProjectSummary[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load user projects', err);
    return [];
  }
}

/**
 * Fetches user projects from Supabase Cloud Database and updates local cache
 */
export async function syncUserProjectsWithCloud(userId: string, userEmail?: string): Promise<UserProjectSummary[]> {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const res = await fetch(`/api/projects?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail || '')}`);
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.projects)) {
      const cloudSummaries: UserProjectSummary[] = data.projects.map((p: any) => ({
        id: p.id,
        name: p.name || 'Untitled Project',
        userId: p.user_id || userId,
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
        floorsCount: p.data?.floors?.length || 1,
        roomsCount: p.data?.rooms?.length || 0,
        furnitureCount: p.data?.furniture?.length || 0,
        plan: p.data,
      }));

      // Merge cloud projects with local storage
      const local = getUserProjects(userId);
      const mergedMap = new Map<string, UserProjectSummary>();
      for (const p of cloudSummaries) mergedMap.set(p.id, p);
      for (const p of local) {
        if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
      }
      const mergedList = Array.from(mergedMap.values());
      localStorage.setItem(getStorageKey(userId), JSON.stringify(mergedList));
      return mergedList;
    }
  } catch (e) {
    console.warn('Could not sync cloud projects:', e);
  }
  return getUserProjects(userId);
}

export function saveUserProject(userId: string, plan: HomePlan, userEmail?: string): UserProjectSummary[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const current = getUserProjects(userId);
    const existingIdx = current.findIndex((p) => p.id === plan.id);

    const summary: UserProjectSummary = {
      id: plan.id,
      name: plan.name || 'Untitled Project',
      userId,
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      floorsCount: plan.floors?.length || 1,
      roomsCount: plan.rooms?.length || 0,
      furnitureCount: plan.furniture?.length || 0,
      plan: { ...plan, updatedAt: new Date().toISOString() },
    };

    let updatedList: UserProjectSummary[];
    if (existingIdx >= 0) {
      updatedList = [...current];
      updatedList[existingIdx] = summary;
    } else {
      updatedList = [summary, ...current];
    }

    localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedList));
    // Also save individual plan cache
    localStorage.setItem(`sweethome_plan_${plan.id}`, JSON.stringify(summary.plan));

    // Asynchronously synchronize to Supabase Cloud Database
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: plan.id,
        userId,
        userEmail: userEmail || undefined,
        name: plan.name || 'Untitled Project',
        data: summary.plan,
      }),
    }).catch((err) => console.warn('Cloud project sync notice:', err));

    return updatedList;
  } catch (err) {
    console.error('Failed to save project', err);
    return [];
  }
}

export function deleteUserProject(userId: string, projectId: string): UserProjectSummary[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const current = getUserProjects(userId);
    const updated = current.filter((p) => p.id !== projectId);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    localStorage.removeItem(`sweethome_plan_${projectId}`);

    // Asynchronously delete from Supabase Cloud Database
    fetch(`/api/projects?id=${encodeURIComponent(projectId)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Cloud project delete notice:', err));

    return updated;
  } catch (err) {
    console.error('Failed to delete project', err);
    return [];
  }
}

export function createNewProjectFromTemplate(
  userId: string,
  template: StarterTemplateOption,
  customName?: string
): HomePlan {
  const newId = `plan_${userId}_${Date.now()}`;
  const base = template.basePlan;
  const newPlan: HomePlan = {
    ...JSON.parse(JSON.stringify(base)),
    id: newId,
    name: customName?.trim() || `${template.name} (${new Date().toLocaleDateString()})`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUserProject(userId, newPlan);
  return newPlan;
}

export function exportPlanAsJson(plan: HomePlan, user?: User | null) {
  const exportPayload = {
    format: 'sweethome-project',
    app: 'DecoForge 3D Studio',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    author: user ? { id: user.id, name: user.name, email: user.email } : undefined,
    plan,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeFilename = (plan.name || 'sweethome_project')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .concat('.sweethome.json');

  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = safeFilename;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

export function parseAndValidateProjectJson(rawJson: string): HomePlan {
  const parsed = JSON.parse(rawJson);
  const candidate: HomePlan = parsed.plan && parsed.plan.walls ? parsed.plan : parsed;

  if (!candidate || !Array.isArray(candidate.walls) || !Array.isArray(candidate.furniture)) {
    throw new Error('Invalid project file: The selected file does not contain valid walls and furniture data.');
  }

  // Ensure clean format
  const sanitizedPlan: HomePlan = {
    ...candidate,
    id: candidate.id || `plan_imported_${Date.now()}`,
    name: candidate.name || 'Imported Architectural Project',
    floors: candidate.floors && candidate.floors.length > 0 ? candidate.floors : [{ level: 0, name: 'Ground Floor', height: 260, elevation: 0 }],
    walls: candidate.walls || [],
    rooms: candidate.rooms || [],
    furniture: candidate.furniture || [],
    updatedAt: new Date().toISOString(),
  };

  return sanitizedPlan;
}
