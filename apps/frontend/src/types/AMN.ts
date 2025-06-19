export type MasterNodeResponse = {
  listed: boolean;
  endorsor: string;
  identity: string;
  active: boolean;
};

export type MasterNodeStorage = {
  address?: string;
  checked: boolean;
};
