import api from "./axios";

export interface LessonMeetingDay {
  day: string;
  duration: string;
}

export interface CreateLessonNotePayload {
  organisationId: number | string;
  courseUuid: string;
  title?: string;
  meetingDays: LessonMeetingDay[];
}

export interface LessonNoteResponse {
  id: number;
  user_organisation_id?: number;
  edu_academic_period_id?: number;
  title?: string;
  required_sections?: Record<string, unknown>;
  topics?: string[] | null;
  body?: string | null;
  status?: string | null;
  course_uuid?: string;
  week_start?: string | null;
  meeting_days?: LessonMeetingDay[];
  submitted?: boolean;
  usage_cost?: number | string;
  class_group?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonNoteApiResponse {
  status?: boolean;
  message?: string;
  data?: LessonNoteResponse;
}

export const lessonNotesApi = {
  createLessonNote: async (payload: CreateLessonNotePayload): Promise<LessonNoteResponse> => {
    const response = await api.post<LessonNoteApiResponse | LessonNoteResponse>(
      `/organisations/${payload.organisationId}/lesson-note`,
      {
        course_uuid: payload.courseUuid,
        title: payload.title,
        meeting_days: payload.meetingDays,
      }
    );

    const responseData = response.data as LessonNoteApiResponse | LessonNoteResponse;
    if ("data" in responseData && responseData.data) {
      return responseData.data;
    }

    return responseData as LessonNoteResponse;
  },
};
