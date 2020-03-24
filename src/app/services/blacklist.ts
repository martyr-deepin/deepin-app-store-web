export interface BlacklistData {
  match: {
    arch?: string;
    mode?: string;
    platform?: string;
    region?: string;
    language?: string;
    display?: string;
  };
  ids: number[];
  operation: BlacklistOperation;
}
export enum BlacklistOperation {
  Hidden = 'hidden',
  Disable = 'disable',
}
