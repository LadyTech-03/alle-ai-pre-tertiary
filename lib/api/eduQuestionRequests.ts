import api from "./axios";

export type EndUserType = "Faculty" | "Student";
export type QuestionRequestType = "flashcards" | "theory" | "mcqs";

export interface EduQuestionRequest {
  id: number;
  title: string;
  organisation_id: number;
  user_id: number;
  course_uuid: string;
  number: number;
  type: QuestionRequestType;
  time_limit: number | null;
  allows_explanation: number | null;
  hints_count: number | null;
  course_files: string[];
  is_public: boolean;
  difficulty: string;
  additional_note: string | null;
  generation_cost: string;
  updated_at?: string;
  updaetd_at?: string;
  created_at: string;
}

interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

interface PaginationMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface EduQuestionRequestsResponse {
  data: EduQuestionRequest[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface GetQuestionRequestsParams {
  organisationId: number | string;
  endUserType: EndUserType;
  page?: number;
  perPage?: number;
  useMock?: boolean;
}

export interface SimulateGenerateQuestionRequestPayload {
  organisationId: number | string;
  userId?: number;
  title: string;
  courseUuid: string;
  number: number;
  type: QuestionRequestType;
  timeLimitSeconds: number | null;
  allowsExplanation: boolean;
  hintsCount: number;
  difficulty: string;
  additionalNote?: string;
  courseFiles?: string[];
  isPublic?: boolean;
}

const mockSeed: EduQuestionRequest[] = [
  {
    id: 48,
    title: "Personal Quiz 1",
    organisation_id: 1,
    user_id: 104,
    course_uuid: "c9a5303d-ab96-446e-994f-15c5489afa12",
    number: 30,
    type: "mcqs",
    time_limit: 3600,
    allows_explanation: 0,
    hints_count: 3,
    course_files: ["d9689bf1-91f2-4b5a-b6ca-2a97dfda688c"],
    is_public: false,
    difficulty: "medium",
    additional_note: "This is a bulk question set for a course.",
    generation_cost: "0.0000000000",
    updaetd_at: "2026-02-23T09:03:17.000000Z",
    created_at: "2026-02-23T09:03:17.000000Z",
  },
  {
    id: 46,
    title: "Personal Quiz 1",
    organisation_id: 1,
    user_id: 104,
    course_uuid: "c9a5303d-ab96-446e-994f-15c5489afa12",
    number: 30,
    type: "mcqs",
    time_limit: null,
    allows_explanation: null,
    hints_count: 3,
    course_files: ["d9689bf1-91f2-4b5a-b6ca-2a97dfda688c"],
    is_public: false,
    difficulty: "medium",
    additional_note: "This is a bulk question set for a course.",
    generation_cost: "0.0008584500",
    updaetd_at: "2026-02-19T10:26:02.000000Z",
    created_at: "2026-02-19T10:25:34.000000Z",
  },
];

let mockQuestionRequests: EduQuestionRequest[] = [...mockSeed];

const MOCK_DELAY_MS = 650;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const useMockByDefault = () => process.env.NEXT_PUBLIC_USE_MOCK_QUESTION_REQUESTS !== "false";

const buildMockResponse = (
  entries: EduQuestionRequest[],
  organisationId: number | string,
  page: number,
  perPage: number
): EduQuestionRequestsResponse => {
  const total = entries.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * perPage;
  const pagedData = entries.slice(start, start + perPage);
  const from = pagedData.length === 0 ? null : start + 1;
  const to = pagedData.length === 0 ? null : start + pagedData.length;
  const path = `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"}/organisations/${organisationId}/edu-question-requests`;
  const firstPageUrl = `${path}?page=1`;
  const lastPageUrl = `${path}?page=${lastPage}`;
  const prevPageUrl = currentPage > 1 ? `${path}?page=${currentPage - 1}` : null;
  const nextPageUrl = currentPage < lastPage ? `${path}?page=${currentPage + 1}` : null;

  return {
    data: pagedData,
    links: {
      first: firstPageUrl,
      last: lastPageUrl,
      prev: prevPageUrl,
      next: nextPageUrl,
    },
    meta: {
      current_page: currentPage,
      from,
      last_page: lastPage,
      links: [
        {
          url: prevPageUrl,
          label: "\u00ab Previous",
          active: false,
        },
        {
          url: `${path}?page=${currentPage}`,
          label: `${currentPage}`,
          active: true,
        },
        {
          url: nextPageUrl,
          label: "Next \u00bb",
          active: false,
        },
      ],
      path,
      per_page: perPage,
      to,
      total,
    },
  };
};

export const eduQuestionRequestsApi = {
  getQuestionRequests: async ({
    organisationId,
    endUserType,
    page = 1,
    perPage = 15,
    useMock,
  }: GetQuestionRequestsParams): Promise<EduQuestionRequestsResponse> => {
    const shouldUseMock = useMock ?? useMockByDefault();

    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      const sorted = [...mockQuestionRequests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return buildMockResponse(sorted, organisationId, page, perPage);
    }

    const response = await api.get<EduQuestionRequestsResponse>(
      `/organisations/${organisationId}/edu-question-requests`,
      {
        headers: {
          EndUserType: endUserType,
        },
        params: {
          page,
          per_page: perPage,
        },
      }
    );

    return response.data;
  },

  simulateGenerateQuestionRequest: async (
    payload: SimulateGenerateQuestionRequestPayload
  ): Promise<EduQuestionRequest> => {
    await sleep(MOCK_DELAY_MS);
    const now = new Date().toISOString();
    const nextId =
      mockQuestionRequests.length > 0
        ? Math.max(...mockQuestionRequests.map((item) => item.id)) + 1
        : 1;

    const generated: EduQuestionRequest = {
      id: nextId,
      title: payload.title,
      organisation_id: Number(payload.organisationId),
      user_id: payload.userId ?? 104,
      course_uuid: payload.courseUuid,
      number: payload.number,
      type: payload.type,
      time_limit: payload.timeLimitSeconds,
      allows_explanation: payload.allowsExplanation ? 1 : 0,
      hints_count: payload.hintsCount,
      course_files: payload.courseFiles ?? [],
      is_public: payload.isPublic ?? false,
      difficulty: payload.difficulty,
      additional_note: payload.additionalNote ?? null,
      generation_cost: "0.0000000000",
      updated_at: now,
      updaetd_at: now,
      created_at: now,
    };

    mockQuestionRequests = [generated, ...mockQuestionRequests];
    return generated;
  },

  resetMockQuestionRequests: () => {
    mockQuestionRequests = [...mockSeed];
  },
};
