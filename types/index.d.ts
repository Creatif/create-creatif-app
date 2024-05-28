export interface Options {
    appDirectory: string | undefined;
    projectName: string;
}

export function create(options: Options): Promise<void>;
export type onErrorCallback = (() => void) | null;