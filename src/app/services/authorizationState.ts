export enum AuthorizationStateType {
  Notauthorized, //未授权
  Authorized, //已授权
  Expired, //已过期
  TrialAuthorized, //试用期已授权
  TrialExpired, //试用期已过期
}
export const AuthorizationState = [AuthorizationStateType.Authorized, AuthorizationStateType.TrialAuthorized];
