// Client-side analytics tracker for Mahi Beast landing page
import { initBrowserAnalytics, recordLinkClick } from './browserAnalytics';

const VISITOR_ID_KEY = 'mb_visitor_id';

class AnalyticsTracker {
  private visitorId: string;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
  }

  private getOrCreateVisitorId(): string {
    try {
      let id = localStorage.getItem(VISITOR_ID_KEY);
      if (!id) {
        id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(VISITOR_ID_KEY, id);
      }
      return id;
    } catch {
      return `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  public init() {
    // Initialize browser-side storage analytics
    initBrowserAnalytics();
  }

  public trackTelegramClick(source: string, destinationUrl: string = 'https://t.me/mahibeast1M') {
    recordLinkClick(destinationUrl, `Telegram (${source})`);
  }

  public getVisitorId(): string {
    return this.visitorId;
  }
}

export const analytics = new AnalyticsTracker();
