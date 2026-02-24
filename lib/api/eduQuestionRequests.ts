import api from "./axios";

export type EndUserType = "Faculty" | "Student";
export type QuestionRequestType = "flashcards" | "theory" | "mcqs";
export type GeneratedQuestionKind = "mcq" | "theory" | "flashcard";

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

export interface GeneratedQuestionOption {
  id: string;
  text: string;
}

export interface GeneratedExamQuestion {
  id: string;
  order: number;
  kind: GeneratedQuestionKind;
  prompt: string;
  options: GeneratedQuestionOption[];
  correctOptionId: string | null;
  subjectId: string;
  subjectName: string;
  hint: string | null;
}

export interface QuestionBatchResponse {
  requestId: number;
  page: number;
  perPage: number;
  totalQuestions: number;
  totalPages: number;
  readyThroughPage: number;
  isReady: boolean;
  isGenerating: boolean;
  data: GeneratedExamQuestion[];
}

export interface GetQuestionBatchParams {
  organisationId?: number | string;
  requestId: number;
  page: number;
  perPage?: number;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface CreateMockQuestionSessionPayload {
  organisationId: number | string;
  title: string;
  type: QuestionRequestType;
  difficulty: string;
  number: number;
  timeLimitSeconds: number | null;
  allowsExplanation: boolean;
  hintsCount: number;
  focus: string;
  subjects: Array<{ id: string; name: string }>;
  additionalNote?: string;
  batchSize?: number;
}

export interface CreateMockQuestionSessionResponse {
  request: EduQuestionRequest;
  firstBatch: QuestionBatchResponse;
}

interface MockSessionState {
  request: EduQuestionRequest;
  questions: GeneratedExamQuestion[];
  pageSize: number;
  createdAtMs: number;
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
const mockExamSessions = new Map<number, MockSessionState>();

const MOCK_DELAY_MS = 650;
const MOCK_BATCH_DELAY_MS = 450;
const MOCK_BATCH_INTERVAL_MS = 2500;
const DEFAULT_BATCH_SIZE = 5;

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

const generatePrompt = (
  requestType: QuestionRequestType,
  order: number,
  subjectName: string,
  difficulty: string
) => {
  if (requestType === "theory") {
    return `Question ${order}: Explain the key concept in ${subjectName} at a ${difficulty} level, using a practical example.`;
  }

  if (requestType === "flashcards") {
    return `Flash card ${order}: Define an important ${subjectName} term and mention one real use case.`;
  }

  return `Question ${order}: Which option best answers this ${difficulty} ${subjectName} objective item?`;
};

const buildGeneratedQuestions = (payload: CreateMockQuestionSessionPayload): GeneratedExamQuestion[] => {
  const sourceSubjects =
    payload.subjects.length > 0
      ? payload.subjects
      : [{ id: "general", name: "General Studies" }];

  return Array.from({ length: payload.number }, (_, index) => {
    const order = index + 1;
    const subject = sourceSubjects[index % sourceSubjects.length];
    const kind: GeneratedQuestionKind =
      payload.type === "mcqs"
        ? "mcq"
        : payload.type === "theory"
          ? "theory"
          : "flashcard";
    const optionIds = ["A", "B", "C", "D"] as const;

    return {
      id: `${subject.id}-q-${order}`,
      order,
      kind,
      prompt: generatePrompt(payload.type, order, subject.name, payload.difficulty),
      options:
        kind === "mcq"
          ? optionIds.map((id, optionIndex) => ({
              id,
              text: `${subject.name} option ${optionIndex + 1} for question ${order}`,
            }))
          : [],
      correctOptionId: kind === "mcq" ? optionIds[index % optionIds.length] : null,
      subjectId: subject.id,
      subjectName: subject.name,
      hint:
        payload.hintsCount > 0
          ? `Hint: recall the core ${subject.name} principle before answering.`
          : null,
    };
  });
};

const createSessionFromRequest = (
  request: EduQuestionRequest,
  pageSize: number,
  createdAtOffsetMs: number = 0
) => {
  const subject = {
    id: request.course_uuid,
    name: "Selected Subject",
  };
  const questions = buildGeneratedQuestions({
    organisationId: request.organisation_id,
    title: request.title,
    type: request.type,
    difficulty: request.difficulty,
    number: request.number,
    timeLimitSeconds: request.time_limit,
    allowsExplanation: Boolean(request.allows_explanation),
    hintsCount: request.hints_count ?? 0,
    focus: "mixed",
    subjects: [subject],
    additionalNote: request.additional_note ?? undefined,
    batchSize: pageSize,
  });

  return {
    request,
    questions,
    pageSize,
    createdAtMs: Date.now() - createdAtOffsetMs,
  };
};

const ensureSessionExistsForRequest = (requestId: number, pageSize: number) => {
  const existing = mockExamSessions.get(requestId);
  if (existing) {
    return existing;
  }

  const fallbackRequest = mockQuestionRequests.find((request) => request.id === requestId);
  if (!fallbackRequest) {
    throw new Error("Question session not found");
  }

  const seededSession = createSessionFromRequest(
    fallbackRequest,
    pageSize,
    MOCK_BATCH_INTERVAL_MS * 2
  );
  mockExamSessions.set(requestId, seededSession);
  return seededSession;
};

const buildQuestionBatch = (session: MockSessionState, page: number): QuestionBatchResponse => {
  const totalQuestions = session.questions.length;
  const perPage = session.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / perPage));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const elapsedMs = Date.now() - session.createdAtMs;
  const generatedPageCount = 1 + Math.floor(elapsedMs / MOCK_BATCH_INTERVAL_MS);
  const readyThroughPage = Math.min(totalPages, generatedPageCount);
  const availableQuestionCount = Math.min(totalQuestions, readyThroughPage * perPage);
  const startIndex = (normalizedPage - 1) * perPage;
  const isReady = startIndex < availableQuestionCount;
  const endIndex = Math.min(startIndex + perPage, availableQuestionCount);

  return {
    requestId: session.request.id,
    page: normalizedPage,
    perPage,
    totalQuestions,
    totalPages,
    readyThroughPage,
    isReady,
    isGenerating: availableQuestionCount < totalQuestions,
    data: isReady ? session.questions.slice(startIndex, endIndex) : [],
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

  createMockQuestionSession: async (
    payload: CreateMockQuestionSessionPayload
  ): Promise<CreateMockQuestionSessionResponse> => {
    const primarySubjectId = payload.subjects[0]?.id ?? "general";
    const pageSize = Math.max(1, payload.batchSize ?? DEFAULT_BATCH_SIZE);

    const request = await eduQuestionRequestsApi.simulateGenerateQuestionRequest({
      organisationId: payload.organisationId,
      title: payload.title,
      courseUuid: primarySubjectId,
      number: payload.number,
      type: payload.type,
      timeLimitSeconds: payload.timeLimitSeconds,
      allowsExplanation: payload.allowsExplanation,
      hintsCount: payload.hintsCount,
      difficulty: payload.difficulty,
      additionalNote: payload.additionalNote,
    });

    const questions = buildGeneratedQuestions(payload);
    const sessionState: MockSessionState = {
      request,
      questions,
      pageSize,
      createdAtMs: Date.now(),
    };
    mockExamSessions.set(request.id, sessionState);

    return {
      request,
      firstBatch: buildQuestionBatch(sessionState, 1),
    };
  },

  getQuestionBatch: async ({
    organisationId,
    requestId,
    page,
    perPage = DEFAULT_BATCH_SIZE,
    endUserType = "Student",
    useMock,
  }: GetQuestionBatchParams): Promise<QuestionBatchResponse> => {
    const shouldUseMock = useMock ?? useMockByDefault();

    if (shouldUseMock) {
      await sleep(MOCK_BATCH_DELAY_MS);
      const session = ensureSessionExistsForRequest(requestId, perPage);
      return buildQuestionBatch(session, page);
    }

    const endpoint = organisationId
      ? `/organisations/${organisationId}/edu-question-requests/${requestId}/questions`
      : `/edu-question-requests/${requestId}/questions`;

    const response = await api.get<QuestionBatchResponse>(endpoint, {
      headers: {
        EndUserType: endUserType,
      },
      params: {
        page,
        per_page: perPage,
      },
    });

    return response.data;
  },

  resetMockQuestionRequests: () => {
    mockQuestionRequests = [...mockSeed];
    mockExamSessions.clear();
  },
};
