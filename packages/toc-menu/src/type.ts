export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Config {
  contentElement: HTMLElement;
  tocElement: HTMLElement;
  useHash: boolean;
}
