declare const contentTestUser: {
    username: string;
    walletAddress: string;
};
declare const sourcePatterns: {
    news: RegExp;
    fashion: RegExp;
    sneaker: RegExp;
    social: RegExp;
    vision: RegExp;
};
declare function categorizeSource(domain: string): string;
declare function extractSources(text: string): string[];
declare function checkForLinks(): {
    totalLinks: number;
    chatgptLinks: number;
    utmLinks: number;
};
declare function processMessage(messageElement: Element): void;
declare function observeMessages(): void;
declare function checkForChatGPTReferral(): boolean;
declare function setupURLMonitoring(): void;
declare function isRelevantPage(): boolean;
declare function initialize(): void;
//# sourceMappingURL=content.d.ts.map