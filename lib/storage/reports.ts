import { promises as fs } from 'fs';
import path from 'path';
import { GeneratedReport } from '../services/openai';

const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

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

/**
 * Stockage fichier pour le développement local
 */
class FileStorage {
  /**
   * Initialise le répertoire de données s'il n'existe pas
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      // Le répertoire existe déjà, c'est OK
    }
  }

  /**
   * Charge tous les rapports depuis le fichier JSON
   */
  async loadReports(): Promise<StoredReport[]> {
    await this.ensureDataDir();
    
    try {
      const data = await fs.readFile(REPORTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Le fichier n'existe pas encore, retourner un tableau vide
      return [];
    }
  }

  /**
   * Sauvegarde un rapport dans le fichier JSON
   */
  async saveReport(
    keyword: string,
    report: GeneratedReport
  ): Promise<StoredReport> {
    await this.ensureDataDir();
    
    const reports = await this.loadReports();
    const now = new Date().toISOString();

    const storedReport: StoredReport = {
      ...report,
      keyword,
      createdAt: now,
      updatedAt: now,
    };

    // Vérifier si un rapport avec le même slug existe déjà
    const existingIndex = reports.findIndex((r) => r.slug === report.slug);
    
    if (existingIndex >= 0) {
      // Mettre à jour le rapport existant
      storedReport.createdAt = reports[existingIndex].createdAt;
      reports[existingIndex] = storedReport;
    } else {
      // Ajouter un nouveau rapport
      reports.push(storedReport);
    }

    await fs.writeFile(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
    return storedReport;
  }

  /**
   * Récupère un rapport par son slug
   */
  async getReportBySlug(slug: string): Promise<StoredReport | null> {
    const reports = await this.loadReports();
    return reports.find((r) => r.slug === slug) || null;
  }

  /**
   * Récupère un rapport par son mot-clé (pour éviter les doublons)
   */
  async getReportByKeyword(keyword: string): Promise<StoredReport | null> {
    const reports = await this.loadReports();
    // Recherche insensible à la casse
    return (
      reports.find(
        (r) => r.keyword.toLowerCase() === keyword.toLowerCase()
      ) || null
    );
  }
}

// Détecter si on est sur Vercel (production) ou en local
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

// Utiliser le stockage fichier en local, mémoire en production/Vercel
const memoryStorage = new InMemoryStorage();
const fileStorage = new FileStorage();

/**
 * Service de stockage des rapports (hybride : fichier en local, mémoire en production)
 */
export class ReportsStorage {
  /**
   * Charge tous les rapports
   */
  async loadReports(): Promise<StoredReport[]> {
    if (isVercel || isProduction) {
      return memoryStorage.loadReports();
    }
    try {
      return await fileStorage.loadReports();
    } catch (error) {
      // En cas d'erreur, utiliser la mémoire
      return memoryStorage.loadReports();
    }
  }

  /**
   * Sauvegarde un rapport
   */
  async saveReport(
    keyword: string,
    report: GeneratedReport
  ): Promise<StoredReport> {
    if (isVercel || isProduction) {
      return memoryStorage.saveReport(keyword, report);
    }
    try {
      return await fileStorage.saveReport(keyword, report);
    } catch (error) {
      // En cas d'erreur (ex: EROFS), utiliser la mémoire
      console.warn('Erreur lors de la sauvegarde fichier, utilisation de la mémoire:', error);
      return memoryStorage.saveReport(keyword, report);
    }
  }

  /**
   * Récupère un rapport par son slug
   */
  async getReportBySlug(slug: string): Promise<StoredReport | null> {
    if (isVercel || isProduction) {
      return memoryStorage.getReportBySlug(slug);
    }
    try {
      return await fileStorage.getReportBySlug(slug);
    } catch (error) {
      return memoryStorage.getReportBySlug(slug);
    }
  }

  /**
   * Récupère un rapport par son mot-clé (pour éviter les doublons)
   */
  async getReportByKeyword(keyword: string): Promise<StoredReport | null> {
    if (isVercel || isProduction) {
      return memoryStorage.getReportByKeyword(keyword);
    }
    try {
      return await fileStorage.getReportByKeyword(keyword);
    } catch (error) {
      return memoryStorage.getReportByKeyword(keyword);
    }
  }
}


