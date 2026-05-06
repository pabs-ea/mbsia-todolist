export type TodoActionType =
  | "created"
  | "completed"
  | "reopened"
  | "deleted";

export interface TodoHistoryEntry {
  type: TodoActionType;
  timestamp: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  history: TodoHistoryEntry[];
}

export interface TodoActivity {
  id: string;
  todoId: string;
  todoText: string;
  type: TodoActionType;
  timestamp: number;
}

export type TodoFilter = "all" | "active" | "completed";
