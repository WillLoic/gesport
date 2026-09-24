import { apiFetch } from './apiClient';
import { AcademyStudent } from '../types';

export interface BackendAcademyStudent {
  id: number;
  member: number | null;
  member_id?: number | null;
  member_detail?: {
    id: number;
    first_name: string;
    last_name: string;
    category?: string;
    date_of_birth?: string;
    phone?: string;
  } | null;
  school_name: string;
  grade_level: string;
  academic_gpa?: number;
  age?: number;
  parents_name?: string;
  tutor_name?: string;
  tutor_phone?: string;
  school_support_needed?: boolean;
  observations?: string;
  created_at?: string;
}

export function mapBackendAcademyStudentToFrontend(b: BackendAcademyStudent): AcademyStudent {
  const memberName = b.member_detail
    ? `${b.member_detail.first_name} ${b.member_detail.last_name}`
    : 'Élève Académie';

  let age = 16;
  if (b.age !== undefined && b.age !== null && b.age > 0) {
    age = b.age;
  } else if (b.member_detail?.date_of_birth) {
    const birthYear = new Date(b.member_detail.date_of_birth).getFullYear();
    if (!isNaN(birthYear)) {
      age = new Date().getFullYear() - birthYear;
    }
  }

  const category = (b.member_detail?.category || 'U18 Espoirs') as any;

  return {
    id: String(b.id),
    memberId: b.member ? String(b.member) : (b.member_detail ? String(b.member_detail.id) : '1'),
    studentName: memberName,
    category,
    age,
    tutorCoachName: b.tutor_name || 'Non assigné',
    schoolGrade: `${b.grade_level}${b.school_name ? ` (${b.school_name})` : ''}`,
    schoolSupportNeeded: b.school_support_needed ?? (b.academic_gpa !== undefined && b.academic_gpa < 10.0),
    progressScores: [
      {
        quarter: 'Trimestre en cours (Bilan Global)',
        technicalScore: Math.round(((b.academic_gpa || 14) / 20) * 20),
        tacticalScore: Math.round(((b.academic_gpa || 14) / 20) * 19),
        athleticScore: Math.round(((b.academic_gpa || 14) / 20) * 18),
        attitudeScore: Math.round(((b.academic_gpa || 14) / 20) * 20),
      },
    ],
    parentsName: b.parents_name || 'Parents Référents',
    parentsPhone: b.tutor_phone || 'Non renseigné',
    coachComments: b.observations || 'Aucune observation enregistrée.',
  };
}

export function mapFrontendAcademyStudentToBackend(f: Partial<AcademyStudent>): Partial<BackendAcademyStudent> {
  const memberIdNum = f.memberId ? parseInt(f.memberId, 10) : undefined;
  
  return {
    ...(memberIdNum && !isNaN(memberIdNum) ? { member_id: memberIdNum } : {}),
    school_name: f.schoolGrade?.includes('(') ? f.schoolGrade.split('(')[1].replace(')', '').trim() : 'Établissement scolaire',
    grade_level: f.schoolGrade?.includes('(') ? f.schoolGrade.split('(')[0].trim() : (f.schoolGrade || 'Scolarité'),
    academic_gpa: f.schoolSupportNeeded ? 9.5 : 14.0,
    age: f.age || 16,
    parents_name: f.parentsName || '',
    tutor_name: f.tutorCoachName || '',
    tutor_phone: f.parentsPhone || '',
    school_support_needed: Boolean(f.schoolSupportNeeded),
    observations: f.coachComments || '',
  };
}

export const academyService = {
  async getStudents(clubId: number = 1): Promise<AcademyStudent[]> {
    const data = await apiFetch<BackendAcademyStudent[]>(`/sport/academy/students/?club_id=${clubId}`);
    return data.map(mapBackendAcademyStudentToFrontend);
  },

  async createOrUpdateStudent(student: Partial<AcademyStudent>): Promise<AcademyStudent> {
    const payload = mapFrontendAcademyStudentToBackend(student);
    const isUpdate = student.id && !student.id.startsWith('acad-');

    if (isUpdate) {
      const data = await apiFetch<BackendAcademyStudent>(`/sport/academy/students/${student.id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return mapBackendAcademyStudentToFrontend(data);
    }

    const data = await apiFetch<BackendAcademyStudent>('/sport/academy/students/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendAcademyStudentToFrontend(data);
  },

  async deleteStudent(id: string): Promise<void> {
    if (id.startsWith('acad-')) return;
    await apiFetch(`/sport/academy/students/${id}/`, {
      method: 'DELETE',
    });
  },
};

