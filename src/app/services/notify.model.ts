export interface Notify {
  type: NotifyType;
  status: NotifyStatus;
  content?: string;
  delay?: number;
}
export enum NotifyType {
  Bulletin = 1,
  Reminder,
  Recommend,
  Clear,
  JobError,
  Installed
}
export enum NotifyStatus {
  Unknown,
  Success,
  Error,
}
