import type { IncomingMessage, ServerResponse } from 'node:http';
import { type BrowserEntry, type Preview } from './protocol.ts';
interface HostContext {
    sessions: SessionLookup;
    webServer: {
        register(route: {
            kind: 'exact';
            path: string;
            handler(req: IncomingMessage, res: ServerResponse): Promise<void>;
        }): () => void;
    };
    on(name: never, listener: never): void;
    effect(callback: () => (() => void), label?: string): void;
}
export interface Config {
    maxTextBytes?: number;
    maxImageBytes?: number;
    searchMaxResults?: number;
}
export declare const inject: string[];
declare function inside(root: string, input?: string): {
    absolute: string;
    path: string;
};
declare function insideExisting(root: string, input?: string): Promise<{
    absolute: string;
    path: string;
}>;
declare function insideWritable(root: string, input?: string): Promise<{
    absolute: string;
    path: string;
}>;
declare function writeWorkspaceFile(root: string, input: string, content: string): Promise<{
    absolute: string;
    path: string;
}>;
declare function list(root: string, input: string): Promise<BrowserEntry[]>;
declare function search(root: string, input: string, limit: number): Promise<{
    matches: BrowserEntry[];
    truncated: boolean;
}>;
declare function preview(root: string, input: string, maxText: number, maxImage: number): Promise<Preview>;
type SessionRecord = {
    id: string;
    header: {
        cwd?: string;
    };
};
type SessionLookup = {
    get(id: never): SessionRecord | undefined;
};
export declare function apply(ctx: HostContext, config?: Config): void;
export { inside, insideExisting, insideWritable, list, preview, search, writeWorkspaceFile };
