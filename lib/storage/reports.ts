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
 * Service de stockage local des rapports (fichiers JSON)
 */
export class ReportsStorage {
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


