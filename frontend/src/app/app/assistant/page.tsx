"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Conversation = {
  id: string;
  title: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRole = "user" | "assistant";

type Message = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
};

type ChatResponse = {
  conversation_id: string;
  message: Message;
};

type ApiError = {
  error?: {
    message?: string;
  };
  detail?: string;
};

type SpeechRecognitionResultEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

const SUGGESTIONS = [
  {
    title: "Plan my day",
    text: "What should I focus on today?",
    icon: "◷",
  },
  {
    title: "Organize my week",
    text: "Help me plan my week.",
    icon: "▦",
  },
  {
    title: "Review my goals",
    text: "Help me organize and prioritize my goals.",
    icon: "◎",
  },
  {
    title: "Productivity",
    text: "What can I do to become more productive?",
    icon: "✦",
  },
];

export default function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  const [speakingMessageId, setSpeakingMessageId] =
    useState<string | null>(null);

  const [copiedMessageId, setCopiedMessageId] =
    useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(null);

  const lastUserMessageRef = useRef("");

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/ai/conversations`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load conversations.");
      }

      const data: Conversation[] = await response.json();

      setConversations(data);

      return data;
    } catch (requestError) {
      console.error("Conversation loading error:", requestError);
      return [];
    }
  }, []);

  const openConversation = useCallback(
    async (id: string) => {
      if (loadingHistory || id === conversationId) {
        return;
      }

      setLoadingHistory(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/ai/conversations/${id}/messages`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        const data: Message[] | ApiError =
          await response.json();

        if (!response.ok) {
          const apiError = data as ApiError;

          throw new Error(
            apiError.error?.message ||
              apiError.detail ||
              "Unable to load this conversation.",
          );
        }

        setConversationId(id);
        setMessages(data as Message[]);
      } catch (requestError) {
        console.error("Message loading error:", requestError);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load conversation.",
        );
      } finally {
        setLoadingHistory(false);
      }
    },
    [conversationId, loadingHistory],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const data = await loadConversations();

      const initialConversation = data[0];

      if (!cancelled && initialConversation) {
        setConversationId(initialConversation.id);

        try {
          const response = await fetch(
            `${API_BASE}/ai/conversations/${initialConversation.id}/messages`,
            {
              credentials: "include",
              cache: "no-store",
            },
          );

          if (!response.ok) {
            return;
          }

          const history: Message[] = await response.json();

          if (!cancelled) {
            setMessages(history);
          }
        } catch (requestError) {
          console.error(
            "Initial conversation error:",
            requestError,
          );
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [loadConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180,
    )}px`;
  }

  function startNewConversation() {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();

    setConversationId(null);
    setMessages([]);
    setInput("");
    setError(null);
    setListening(false);
    setSpeakingMessageId(null);
  }

  async function sendMessage(
    event?: FormEvent,
    forcedText?: string,
  ) {
    event?.preventDefault();

    const text = (forcedText ?? input).trim();

    if (!text || loading) {
      return;
    }

    setError(null);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    lastUserMessageRef.current = text;

    const temporaryId = `temporary-${Date.now()}`;

    const temporaryMessage: Message = {
      id: temporaryId,
      conversation_id: conversationId ?? "",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      temporaryMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/ai/chat`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: text,
          }),
        },
      );

      const result: ChatResponse | ApiError =
        await response.json();

      if (!response.ok) {
        const apiError = result as ApiError;

        throw new Error(
          apiError.error?.message ||
            apiError.detail ||
            `AI request failed with status ${response.status}.`,
        );
      }

      const data = result as ChatResponse;

      setConversationId(data.conversation_id);

      setMessages((current) =>
        current.map((message) =>
          message.id === temporaryId
            ? {
                ...message,
                conversation_id:
                  data.conversation_id,
              }
            : message,
        ),
      );

      setMessages((current) => [
        ...current,
        data.message,
      ]);

      await loadConversations();

      // Voice Mode:
      // Automatically speak the AI response.
      if (voiceMode) {
        requestAnimationFrame(() => {
          speakMessage(data.message);
        });
      }
    } catch (requestError) {
      console.error("AI chat error:", requestError);

      setMessages((current) =>
        current.filter(
          (message) => message.id !== temporaryId,
        ),
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "LifeOS AI could not process your message.",
      );
    } finally {
      setLoading(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  function handleComposerKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage();
    }
  }

  function getSpeechRecognition() {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      null
    );
  }

  function startVoiceRecognition() {
    const SpeechRecognition =
      getSpeechRecognition();

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Try Chrome or Edge.",
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        transcript +=
          event.results[index]?.[0]?.transcript ?? "";
      }

      setInput(transcript);

      requestAnimationFrame(resizeTextarea);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error,
      );

      setListening(false);

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access.",
        );
      } else if (event.error === "no-speech") {
        setError("I couldn't hear anything.");
      } else {
        setError(
          "Voice input could not be started.",
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (recognitionError) {
      console.error(
        "Recognition start error:",
        recognitionError,
      );

      setListening(false);
      recognitionRef.current = null;
    }
  }

  function stopVoiceRecognition() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function toggleVoiceInput() {
    if (listening) {
      stopVoiceRecognition();
      return;
    }

    startVoiceRecognition();
  }

  function toggleVoiceMode() {
    const nextMode = !voiceMode;

    setVoiceMode(nextMode);

    if (!nextMode) {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);
    }

    if (nextMode) {
      setError(null);
    }
  }

  function speakMessage(message: Message) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      setError(
        "Voice playback is not supported in this browser.",
      );

      return;
    }

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, "code block")
      .replace(/[*_#>`~]/g, "")
      .trim();

    if (!cleanText) {
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(cleanText);

    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeakingMessageId(message.id);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(
        message.content,
      );

      setCopiedMessageId(message.id);

      window.setTimeout(() => {
        setCopiedMessageId((current) =>
          current === message.id
            ? null
            : current,
        );
      }, 1500);
    } catch (copyError) {
      console.error("Copy error:", copyError);

      setError("Could not copy the message.");
    }
  }

  function regenerateResponse() {
    if (
      !lastUserMessageRef.current ||
      loading
    ) {
      return;
    }

    setInput(lastUserMessageRef.current);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      resizeTextarea();
    });
  }

  function renderFormattedText(content: string) {
    const lines = content.split("\n");

    return lines.map((line, index) => {
      const isBullet =
        /^\s*[-*]\s+/.test(line);

      const formattedLine = line
        .replace(/^\s*[-*]\s+/, "")
        .replace(/\*\*(.*?)\*\*/g, "$1");

      return (
        <div
          key={`${index}-${line}`}
          className={
            isBullet
              ? "flex gap-2"
              : undefined
          }
        >
          {isBullet && (
            <span className="text-white/40">
              •
            </span>
          )}

          <span>{formattedLine}</span>
        </div>
      );
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090d] text-white shadow-2xl">

      {/* Desktop Sidebar */}

      <aside className="hidden w-[290px] shrink-0 border-r border-white/[0.08] bg-[#0c0d12] lg:flex lg:flex-col">

        <div className="border-b border-white/[0.08] p-4">

          <button
            type="button"
            onClick={startNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium transition hover:bg-white/[0.1]"
          >
            <span className="text-lg leading-none">
              +
            </span>

            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">

          <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Recent conversations
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs leading-5 text-white/30">
              Your conversations will appear here.
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(
                (conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      void openConversation(
                        conversation.id,
                      )
                    }
                    className={`group w-full rounded-xl px-3 py-3 text-left transition ${
                      conversationId ===
                      conversation.id
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.045]"
                    }`}
                  >
                    <div className="truncate text-sm font-medium text-white/80 group-hover:text-white">
                      {conversation.title ||
                        "New conversation"}
                    </div>

                    <div className="mt-1 text-[11px] text-white/30">
                      {conversation.last_message_at
                        ? new Date(
                            conversation.last_message_at,
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )
                        : "New"}
                    </div>
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.08] p-4">

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                ✦
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium">
                  LifeOS AI
                </div>

                <div className="mt-0.5 text-[11px] text-white/30">
                  Private local intelligence
                </div>
              </div>

              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}

      <main className="flex min-w-0 flex-1 flex-col">

        {/* Header */}

        <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/[0.08] px-4 md:px-6">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-200 ring-1 ring-white/10">
              ✦
            </div>

            <div className="min-w-0">

              <h1 className="truncate text-sm font-semibold md:text-base">
                LifeOS AI
              </h1>

              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/35">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                {voiceMode
                  ? "Voice assistant"
                  : "Local assistant"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Voice Mode */}

            <button
              type="button"
              onClick={toggleVoiceMode}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                voiceMode
                  ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07] hover:text-white"
              }`}
              title={
                voiceMode
                  ? "Turn voice mode off"
                  : "Turn voice mode on"
              }
            >
              {voiceMode
                ? "🎙 Voice ON"
                : "🎙 Voice"}
            </button>

            <button
              type="button"
              onClick={startNewConversation}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55 transition hover:bg-white/[0.07] hover:text-white lg:hidden"
            >
              + New
            </button>

          </div>
        </header>

        {/* Error */}

        {error && (
          <div className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-4xl items-center justify-between gap-4 rounded-xl border border-red-400/10 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200/80">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 text-red-200/50 hover:text-red-200"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Chat */}

        <div className="flex-1 overflow-y-auto">

          {messages.length === 0 &&
          !loadingHistory ? (
            <div className="flex min-h-full items-center justify-center px-5 py-12">

              <div className="w-full max-w-2xl">

                <div className="text-center">

                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-cyan-500/10 text-3xl text-violet-200 ring-1 ring-white/10">
                    ✦
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    How can I help?
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/35">
                    Your personal AI assistant for
                    planning, productivity,
                    organization and your LifeOS
                    data.
                  </p>

                  {voiceMode && (
                    <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-200/80">
                      <span className="animate-pulse">
                        ●
                      </span>
                      Voice mode is ready
                    </div>
                  )}

                </div>

                <div className="mt-9 grid gap-2 sm:grid-cols-2">

                  {SUGGESTIONS.map(
                    (suggestion) => (
                      <button
                        key={suggestion.title}
                        type="button"
                        onClick={() => {
                          setInput(
                            suggestion.text,
                          );

                          requestAnimationFrame(
                            () => {
                              textareaRef.current?.focus();
                              resizeTextarea();
                            },
                          );
                        }}
                        className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition hover:border-white/[0.15] hover:bg-white/[0.05]"
                      >
                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-sm text-white/50 transition group-hover:text-white">
                          {suggestion.icon}
                        </div>

                        <div className="text-sm font-medium text-white/75">
                          {suggestion.title}
                        </div>

                        <div className="mt-1 text-xs leading-5 text-white/30">
                          {suggestion.text}
                        </div>
                      </button>
                    ),
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">

              {loadingHistory ? (
                <div className="flex justify-center py-16">

                  <div className="flex items-center gap-2 text-xs text-white/35">

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />

                    Loading conversation
                  </div>
                </div>
              ) : (
                <div className="space-y-8">

                  {messages.map((message) => {

                    const isUser =
                      message.role === "user";

                    const isSpeaking =
                      speakingMessageId ===
                      message.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        {!isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-white/10">
                            ✦
                          </div>
                        )}

                        <div
                          className={`min-w-0 ${
                            isUser
                              ? "max-w-[82%] rounded-2xl rounded-br-md bg-violet-600/90 px-4 py-3"
                              : "max-w-[88%] pt-0.5"
                          }`}
                        >

                          <div
                            className={`text-sm leading-7 ${
                              isUser
                                ? "text-white"
                                : "text-white/75"
                            }`}
                          >
                            {renderFormattedText(
                              message.content,
                            )}
                          </div>

                          {!isUser && (
                            <div className="mt-3 flex flex-wrap items-center gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  void copyMessage(
                                    message,
                                  )
                                }
                                className="rounded-lg px-2 py-1 text-[11px] text-white/25 transition hover:bg-white/[0.05] hover:text-white/60"
                              >
                                {copiedMessageId ===
                                message.id
                                  ? "✓ Copied"
                                  : "Copy"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  speakMessage(
                                    message,
                                  )
                                }
                                className={`rounded-lg px-2 py-1 text-[11px] transition ${
                                  isSpeaking
                                    ? "bg-violet-500/15 text-violet-200"
                                    : "text-white/25 hover:bg-white/[0.05] hover:text-white/60"
                                }`}
                              >
                                {isSpeaking
                                  ? "⏹ Stop"
                                  : "🔊 Read aloud"}
                              </button>

                              {message.id ===
                                messages[
                                  messages.length -
                                    1
                                ]?.id && (
                                <button
                                  type="button"
                                  onClick={
                                    regenerateResponse
                                  }
                                  disabled={loading}
                                  className="rounded-lg px-2 py-1 text-[11px] text-white/25 transition hover:bg-white/[0.05] hover:text-white/60 disabled:opacity-30"
                                >
                                  Regenerate
                                </button>
                              )}

                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-white/10">
                        ✦
                      </div>

                      <div className="flex items-center gap-1 pt-2">

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30 [animation-delay:-0.3s]" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30 [animation-delay:-0.15s]" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30" />

                      </div>
                    </div>
                  )}

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>
          )}
        </div>

        {/* Composer */}

        <div className="shrink-0 border-t border-white/[0.08] bg-[#08090d]/95 px-4 pb-4 pt-3 backdrop-blur-xl md:px-6 md:pb-5">

          <form
            onSubmit={(event) =>
              void sendMessage(event)
            }
            className="mx-auto max-w-4xl"
          >

            <div
              className={`rounded-2xl border p-2 shadow-xl transition ${
                listening
                  ? "border-violet-400/30 bg-violet-500/[0.04]"
                  : "border-white/[0.1] bg-white/[0.035]"
              }`}
            >

              <div className="flex items-end gap-1">

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => {
                    setInput(
                      event.target.value,
                    );

                    resizeTextarea();
                  }}
                  onKeyDown={
                    handleComposerKeyDown
                  }
                  placeholder={
                    listening
                      ? "🎙 Listening..."
                      : voiceMode
                        ? "Speak or type to LifeOS AI..."
                        : "Message LifeOS AI..."
                  }
                  rows={1}
                  disabled={loading}
                  maxLength={20000}
                  className="max-h-[180px] min-h-[48px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Message LifeOS AI"
                />

                <div className="flex shrink-0 items-center gap-1 pb-1">

                  {/* Mic */}

                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    disabled={loading}
                    aria-label={
                      listening
                        ? "Stop voice input"
                        : "Start voice input"
                    }
                    title={
                      listening
                        ? "Stop listening"
                        : "Voice input"
                    }
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      listening
                        ? "bg-red-500/15 text-red-300 ring-1 ring-red-400/30"
                        : "text-white/35 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >

                    {listening && (
                      <>
                        <span className="absolute inset-1 animate-ping rounded-xl bg-red-400/10" />
                        <span className="absolute inset-0 rounded-xl ring-1 ring-red-400/20" />
                      </>
                    )}

                    <span className="relative text-base">
                      {listening
                        ? "■"
                        : "🎙"}
                    </span>

                  </button>

                  {/* Send */}

                  <button
                    type="submit"
                    disabled={
                      !input.trim() ||
                      loading
                    }
                    aria-label="Send message"
                    title="Send message"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    ↑
                  </button>

                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] text-white/20">

              <span>
                Enter to send
              </span>

              <span>•</span>

              <span>
                Shift + Enter for new line
              </span>

              <span>•</span>

              <span>
                🎙 Voice input
              </span>

              <span>•</span>

              <span>
                {voiceMode
                  ? "Voice mode ON"
                  : "Local AI"}
              </span>

            </div>

          </form>
        </div>
      </main>
    </div>
  );
}