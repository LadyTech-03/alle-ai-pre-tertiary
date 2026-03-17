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
  course_name?: string;
  number: number;
  type: QuestionRequestType;
  time_limit: number | null;
  allows_explanation: boolean | number | null;
  hints_count: number | null;
  course_files: string[] | null;
  is_public: boolean;
  difficulty: string;
  additional_note: string | null;
  generation_cost: string | null;
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

export interface GetQuestionRequestParams {
  organisationId: number | string;
  requestId: number | string;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface CreateQuestionRequestPayload {
  organisationId: number | string;
  title: string;
  courseUuid: string;
  number: number;
  type: QuestionRequestType;
  hintLimit: number | null;
  timeLimitSeconds: number | null;
  allowsExplanation: boolean;
  courseFiles?: string[] | null;
  additionalNote?: string | null;
  topics?: string[] | null;
  useMock?: boolean;
}

interface CreateQuestionRequestResponse {
  message: string;
  question_request: EduQuestionRequest;
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
  questionId?: string | number;
  order: number;
  kind: GeneratedQuestionKind;
  prompt: string;
  options: GeneratedQuestionOption[];
  correctOptionId: string | null;
  subjectId: string;
  subjectName: string;
  hint: string | null;
  explanation: string | null;
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
  totalQuestions?: number;
  subjectId?: string;
  subjectName?: string;
}

interface EduGeneratedQuestionItem {
  id?: number | string;
  question_id?: number | string;
  edu_question_id?: number | string;
  edu_question_request_id: number;
  question: string;
  options: string[];
  points: number | null;
  answer: string | null;
  updated_at: string;
  created_at: string;
}

interface EduGeneratedQuestionResponse {
  data: EduGeneratedQuestionItem[];
}

export interface SaveQuestionAnswerPayload {
  organisationId: number | string;
  attemptId: number | string;
  questionId: number | string;
  answer: string | null;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface CreateQuestionAttemptPayload {
  organisationId: number | string;
  requestId: number | string;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface CreateQuestionAttemptResponse {
  id: number;
}

export interface FinishQuestionAttemptPayload {
  organisationId: number | string;
  attemptId: number | string;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface FinishQuestionAttemptResponse {
  id: number;
  attempted_questions: number;
  correct_answers: number;
  total_questions: number;
  remaining_time: number | null;
}

export interface QuestionAttemptResponseQuestion {
  id: number;
  edu_question_request_id: number;
  question: string;
  options: string[];
  points: string | number | null;
  answer: string | null;
  updated_at: string;
  created_at: string;
}

export interface QuestionAttemptResponseItem {
  id: number;
  edu_question_request_attempt_id: number;
  edu_question: QuestionAttemptResponseQuestion;
  answer: string | null;
  is_correct: number | boolean;
  hints: string | null;
  explanation: string | null;
  score: string | number | null;
  usage_cost: string | number | null;
  created_at: string;
  updated_at: string;
}

export interface GetQuestionAttemptResponsesPayload {
  organisationId: number | string;
  attemptId: number | string;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface RequestQuestionHintPayload {
  organisationId: number | string;
  attemptId: number | string;
  questionId: number | string;
  endUserType?: EndUserType;
  useMock?: boolean;
}

export interface CreateMockQuestionSessionPayload {
  organisationId: number | string;
  title: string;
  type: QuestionRequestType;
  difficulty?: string;
  number: number;
  timeLimitSeconds: number | null;
  allowsExplanation: boolean;
  hintsCount: number;
  focus?: string;
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
const MOCK_BATCH_INTERVAL_MS = 1500;
const DEFAULT_BATCH_SIZE = 10;

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
    return `Explain the key concept in ${subjectName} at a ${difficulty} level, using a practical example.`;
  }

  if (requestType === "flashcards") {
    return `Define an important ${subjectName} term and mention one real use case.`;
  }

  return `Which option best answers this ${difficulty} ${subjectName} objective item?`;
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
    const correctOptionId = kind === "mcq" ? optionIds[index % optionIds.length] : null;
    const explanation =
      kind === "mcq"
        ? `Option ${correctOptionId} is correct because it best matches the core ${subject.name} principle tested in this item.`
        : kind === "theory"
          ? `A complete answer should define the concept, explain why it matters, and apply it to a concrete ${subject.name} scenario.`
          : `A strong flash-card response should include the definition and one practical real-world example.`;

    return {
      id: `${subject.id}-q-${order}`,
      questionId: `${subject.id}-q-${order}`,
      order,
      kind,
      prompt: generatePrompt(payload.type, order, subject.name, payload.difficulty || 'medium'),
      options:
        kind === "mcq"
          ? optionIds.map((id, optionIndex) => ({
              id,
              text: `${subject.name} option ${optionIndex + 1} for question ${order}`,
            }))
          : [],
      correctOptionId,
      subjectId: subject.id,
      subjectName: subject.name,
      hint:
        payload.hintsCount > 0
          ? `Hint: recall the core ${subject.name} principle before answering.`
          : null,
      explanation: payload.allowsExplanation ? explanation : null,
    };
  });
};

const parseOptionLabel = (rawOption: string, index: number): GeneratedQuestionOption => {
  const trimmed = rawOption.trim();
  const match = trimmed.match(/^([A-Za-z])[\.\)]\s*(.+)$/);
  if (match) {
    return {
      id: match[1].toUpperCase(),
      text: match[2].trim(),
    };
  }

  const fallbackId = String.fromCharCode(65 + index);
  return {
    id: fallbackId,
    text: trimmed,
  };
};

const normalizeGeneratedQuestions = (
  items: EduGeneratedQuestionItem[],
  subjectId: string,
  subjectName: string,
  requestId: number
): GeneratedExamQuestion[] => {
  const sorted = [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return sorted.map((item, index) => {
    const options = Array.isArray(item.options) ? item.options.filter((option) => typeof option === "string") : [];
    const parsedOptions = options.map((option, optionIndex) =>
      parseOptionLabel(option, optionIndex)
    );
    const externalQuestionId =
      item.id ??
      item.question_id ??
      item.edu_question_id ??
      `${requestId}-${index + 1}`;

    return {
      id: String(externalQuestionId),
      questionId: externalQuestionId,
      order: index + 1,
      kind: options.length > 0 ? "mcq" : "theory",
      prompt: item.question,
      options: parsedOptions,
      correctOptionId: null,
      subjectId,
      subjectName,
      hint: null,
      explanation: null,
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
  getQuestionRequest: async ({
    organisationId,
    requestId,
    endUserType = "Student",
    useMock,
  }: GetQuestionRequestParams): Promise<EduQuestionRequest> => {
    const shouldUseMock = useMock ?? useMockByDefault();

    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      const match = mockQuestionRequests.find((request) => request.id === Number(requestId));
      if (!match) {
        throw new Error("Question request not found");
      }
      return match;
    }

    const response = await api.get<Record<string, any>>(
      `/organisations/${organisationId}/edu-question-request/${requestId}`,
      {
        headers: {
          EndUserType: endUserType,
        },
      }
    );

    return response.data?.question_request ?? response.data?.data ?? response.data;
  },

  createQuestionRequest: async (
    payload: CreateQuestionRequestPayload
  ): Promise<EduQuestionRequest> => {
    const shouldUseMock = payload.useMock ?? useMockByDefault();

    if (shouldUseMock) {
      return eduQuestionRequestsApi.simulateGenerateQuestionRequest({
        organisationId: payload.organisationId,
        title: payload.title,
        courseUuid: payload.courseUuid,
        number: payload.number,
        type: payload.type,
        timeLimitSeconds: payload.timeLimitSeconds,
        allowsExplanation: payload.allowsExplanation,
        hintsCount: payload.hintLimit ?? 0,
        difficulty: "medium",
        additionalNote: payload.additionalNote ?? undefined,
        courseFiles: payload.courseFiles ?? undefined,
      });
    }

    const response = await api.post<CreateQuestionRequestResponse>(
      `/organisations/${payload.organisationId}/edu-question-request`,
      {
        course: payload.courseUuid,
        title: payload.title,
        number: payload.number,
        type: payload.type,
        hint_limit: payload.hintLimit,
        time_limit: payload.timeLimitSeconds,
        allows_explanation: payload.allowsExplanation,
        course_files: payload.courseFiles ?? null,
        // additional_note: payload.additionalNote ?? null,
        // topics: payload.topics ?? null,
      },
      {
        headers: {
          EndUserType: "Student",
        },
      }
    );

    console.log(response, 'Create question request response');

    return response.data.question_request;
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
      difficulty: payload.difficulty || 'medium',
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
    totalQuestions,
    subjectId,
    subjectName,
  }: GetQuestionBatchParams): Promise<QuestionBatchResponse> => {
    const shouldUseMock = useMock ?? useMockByDefault();

    if (shouldUseMock) {
      await sleep(MOCK_BATCH_DELAY_MS);
      const session = ensureSessionExistsForRequest(requestId, perPage);
      return buildQuestionBatch(session, page);
    }

    if (!organisationId) {
      throw new Error("Organisation ID is required to fetch generated questions.");
    }

    const endpoint = `/organisations/${organisationId}/edu-question-request/${requestId}/questions`;

    const response = await api.get<EduGeneratedQuestionResponse>(endpoint, {
      headers: {
        EndUserType: endUserType,
      },
    });
    console.log(response, 'Exam batch generation response')
    const normalizedPage = Math.max(1, page);
    const resolvedSubjectId = subjectId ?? `${requestId}`;
    const resolvedSubjectName = subjectName ?? "Selected Subject";
    const generated = normalizeGeneratedQuestions(
      response.data.data ?? [],
      resolvedSubjectId,
      resolvedSubjectName,
      requestId
    );
    const resolvedTotalQuestions = totalQuestions ?? generated.length;
    const totalPages = Math.max(1, Math.ceil(resolvedTotalQuestions / perPage));
    const safePage = Math.min(normalizedPage, totalPages);
    const startIndex = (safePage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const availableCount = generated.length;
    const readyThroughPage = availableCount === 0 ? 0 : Math.ceil(availableCount / perPage);
    const isReady = startIndex < availableCount;
    const data = isReady ? generated.slice(startIndex, endIndex) : [];

    return {
      requestId,
      page: safePage,
      perPage,
      totalQuestions: resolvedTotalQuestions,
      totalPages,
      readyThroughPage,
      isReady,
      isGenerating: availableCount < resolvedTotalQuestions,
      data,
    };
  },

  createQuestionAttempt: async ({
    organisationId,
    requestId,
    endUserType = "Student",
    useMock,
  }: CreateQuestionAttemptPayload): Promise<CreateQuestionAttemptResponse> => {
    const shouldUseMock = useMock ?? useMockByDefault();
    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      return { id: Math.floor(Math.random() * 9000) + 1000 };
    }

    const response = await api.post<{ status: boolean; data?: { id?: number } }>(
      `/organisations/${organisationId}/edu-question-request/${requestId}/attempt`,
      {},
      {
        headers: {
          EndUserType: endUserType,
        },
      }
    );

    const attemptId = response.data?.data?.id;
    if (!attemptId) {
      throw new Error("Attempt ID missing from response");
    }

    return { id: attemptId };
  },

  finishQuestionAttempt: async ({
    organisationId,
    attemptId,
    endUserType = "Student",
    useMock,
  }: FinishQuestionAttemptPayload): Promise<FinishQuestionAttemptResponse> => {
    const shouldUseMock = useMock ?? useMockByDefault();
    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      return {
        id: Number(attemptId),
        attempted_questions: Math.floor(Math.random() * 10) + 1,
        correct_answers: Math.floor(Math.random() * 5) + 1,
        total_questions: 30,
        remaining_time: null,
      };
    }

    const response = await api.post<{ status: boolean; data?: FinishQuestionAttemptResponse }>(
      `/organisations/${organisationId}/edu-question-attempt/${attemptId}/finish`,
      {},
      {
        headers: {
          EndUserType: endUserType,
        },
      }
    );

    if (!response.data?.data) {
      throw new Error("Finish response missing data");
    }

    return response.data.data;
  },

  getQuestionAttemptResponses: async ({
    organisationId,
    attemptId,
    endUserType = "Student",
    useMock,
  }: GetQuestionAttemptResponsesPayload): Promise<QuestionAttemptResponseItem[]> => {
    const shouldUseMock = useMock ?? useMockByDefault();
    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      return [
        {
          id: 1,
          edu_question_request_attempt_id: Number(attemptId),
          edu_question: {
            id: 1,
            edu_question_request_id: 1,
            question: "Sample question text",
            options: ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
            points: "1.00",
            answer: "B",
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          answer: "A",
          is_correct: 0,
          hints: null,
          explanation: null,
          score: "0.00",
          usage_cost: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    const response = await api.get<{ data?: QuestionAttemptResponseItem[] }>(
      `/organisations/${organisationId}/edu-question-attempt/${attemptId}/responses`,
      {
        headers: {
          EndUserType: endUserType,
        },
      }
    );

    return response.data?.data ?? [];
  },

  saveQuestionAnswer: async ({
    organisationId,
    attemptId,
    questionId,
    answer,
    endUserType = "Student",
    useMock,
  }: SaveQuestionAnswerPayload): Promise<void> => {
    const shouldUseMock = useMock ?? useMockByDefault();
    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      return;
    }

    console.log('Saving question answer:', { organisationId, attemptId, questionId, answer });

    await api.post(
      `/organisations/${organisationId}/edu-question-attempt/${attemptId}/answer`,
      {
        question_id: questionId,
        answer,
      },
      {
        headers: {
          EndUserType: endUserType,
        },
      }
    );
  },

  requestQuestionHint: async ({
    organisationId,
    attemptId,
    questionId,
    endUserType = "Student",
    useMock,
  }: RequestQuestionHintPayload): Promise<string | null> => {
    const shouldUseMock = useMock ?? useMockByDefault();
    if (shouldUseMock) {
      await sleep(MOCK_DELAY_MS);
      return "Hint: review the most likely option based on the prompt.";
    }

    const response = await api.post<Record<string, any>>(
      `/organisations/${organisationId}/edu-question-attempt/${attemptId}/hint`,
      {
        question_id: questionId,
      },
      {
        headers: {
          EndUserType: endUserType,
        },
      }
    );

    const rawHints = response.data?.data?.hints ?? response.data?.hints ?? null;
    if (Array.isArray(rawHints)) {
      return rawHints.filter(Boolean).join("\n") || null;
    }

    if (typeof rawHints === "string") {
      try {
        const parsed = JSON.parse(rawHints);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).join("\n") || null;
        }
      } catch {
        // fall through to returning the raw string
      }
      return rawHints;
    }

    return response.data?.message ?? null;
  },

  resetMockQuestionRequests: () => {
    mockQuestionRequests = [...mockSeed];
    mockExamSessions.clear();
  },
};
