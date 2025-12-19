import { GeneratedReport } from '../services/openai';

export interface StoredReport extends GeneratedReport {
  keyword: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stockage en mémoire des rapports (compatible avec Vercel serverless)
 * Note: Les données sont perdues au redémarrage, mais évite les erreurs EROFS
 */
class InMemoryStorage {
  private reports: Map<string, StoredReport> = new Map();
  private keywordIndex: Map<string, string> = new Map(); // keyword (lowercase) -> slug

  /**
   * Charge tous les rapports depuis la mémoire
   */
  loadReports(): StoredReport[] {
    return Array.from(this.reports.values());
  }

  /**
   * Sauvegarde un rapport en mémoire
   */
  saveReport(keyword: string, report: GeneratedReport): StoredReport {
    const now = new Date().toISOString();
    const keywordLower = keyword.toLowerCase();

    // Vérifier si un rapport avec le même slug existe déjà
    const existingSlug = this.keywordIndex.get(keywordLower);
    const existingReport = existingSlug ? this.reports.get(existingSlug) : null;

    const storedReport: StoredReport = {
      ...report,
      keyword,
      createdAt: existingReport?.createdAt || now,
      updatedAt: now,
    };

    // Stocker le rapport
    this.reports.set(report.slug, storedReport);
    this.keywordIndex.set(keywordLower, report.slug);

    return storedReport;
  }

  /**
   * Récupère un rapport par son slug
   */
  getReportBySlug(slug: string): StoredReport | null {
    return this.reports.get(slug) || null;
  }

  /**
   * Récupère un rapport par son mot-clé (pour éviter les doublons)
   */
  getReportByKeyword(keyword: string): StoredReport | null {
    const keywordLower = keyword.toLowerCase();
    const slug = this.keywordIndex.get(keywordLower);
    if (!slug) return null;
    return this.reports.get(slug) || null;
  }
}

// Instance singleton partagée
const storage = new InMemoryStorage();

/**
 * Service de stockage en mémoire des rapports (compatible Vercel)
 */
export class ReportsStorage {
  /**
   * Charge tous les rapports depuis la mémoire
   */
  async loadReports(): Promise<StoredReport[]> {
    return storage.loadReports();
  }

  /**
   * Sauvegarde un rapport en mémoire
   */
  async saveReport(
    keyword: string,
    report: GeneratedReport
  ): Promise<StoredReport> {
    return storage.saveReport(keyword, report);
  }

  /**
   * Récupère un rapport par son slug
   */
  async getReportBySlug(slug: string): Promise<StoredReport | null> {
    return storage.getReportBySlug(slug);
  }

  /**
   * Récupère un rapport par son mot-clé (pour éviter les doublons)
   */
  async getReportByKeyword(keyword: string): Promise<StoredReport | null> {
    return storage.getReportByKeyword(keyword);
  }
}


