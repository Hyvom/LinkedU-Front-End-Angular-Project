import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import { AdminDashboardStatistics, AdminStudentProgressStageRow } from '../../shared/models/models';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class AdminStatisticsComponent implements OnInit {
  stats: AdminDashboardStatistics | null = null;
  loading = false;
  errorMsg = '';

  /** Largest single count in the progress table (for scaling bar charts). */
  private maxSingleCount = 0;

  readonly stageLabels: Record<string, string> = {
    ORIENTATION: 'Orientation & Planning',
    DOSSIER_PREPARATION: 'Dossier Preparation',
    DOCUMENT_COLLECTION: 'Document Collection',
    LANGUAGE_TESTS: 'Language Tests',
    UNIVERSITY_SELECTION: 'University Selection',
    APPLICATION_SUBMISSION: 'Application Submission',
    INTERVIEW_PREPARATION: 'Interview Preparation',
    ACCEPTANCE_LETTER: 'Acceptance Letter',
    VISA_APPLICATION: 'Visa Application',
    ACCOMMODATION: 'Accommodation',
    TRAVEL_PLANNING: 'Travel Planning',
    PRE_DEPARTURE: 'Pre-Departure',
    ARRIVAL_SETTLEMENT: 'Arrival & Settlement'
  };

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getDashboardStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.recomputeChartScales();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load statistics.';
        this.loading = false;
      }
    });
  }

  stageLabel(row: AdminStudentProgressStageRow): string {
    return this.stageLabels[row.stage] || row.stage.split('_').join(' ');
  }

  /** Short label for dense charts (first words). */
  stageShortLabel(row: AdminStudentProgressStageRow): string {
    const full = this.stageLabel(row);
    return full.length > 22 ? full.slice(0, 20) + '…' : full;
  }

  private recomputeChartScales(): void {
    this.maxSingleCount = 0;
    if (!this.stats?.studentProgressByStage?.length) return;
    for (const row of this.stats.studentProgressByStage) {
      this.maxSingleCount = Math.max(
        this.maxSingleCount,
        row.notStarted,
        row.inProgress,
        row.completed
      );
    }
  }

  /** Conic gradient for donut: students, agents, everyone else. */
  userMixDonutStyle(): Record<string, string> {
    if (!this.stats?.users) {
      return { background: 'conic-gradient(#334155 0% 100%)' };
    }
    const u = this.stats.users;
    const t = u.total;
    if (t <= 0) {
      return { background: 'conic-gradient(#334155 0% 100%)' };
    }
    const pStudents = Math.min(100, (u.students / t) * 100);
    const pAgents = Math.min(100 - pStudents, (u.agents / t) * 100);
    const pRest = Math.max(0, 100 - pStudents - pAgents);
    const a1 = pStudents;
    const a2 = a1 + pAgents;
    const grad = `conic-gradient(from -90deg, #3b82f6 0% ${a1}%, #d9c682 ${a1}% ${a2}%, #64748b ${a2}% 100%)`;
    return { background: grad };
  }

  rowTotal(row: AdminStudentProgressStageRow): number {
    return row.notStarted + row.inProgress + row.completed;
  }

  /** Width % within the row’s own stacked bar (sums to 100% of bar for that stage). */
  stackedSegmentPct(row: AdminStudentProgressStageRow, part: 'notStarted' | 'inProgress' | 'completed'): number {
    const total = this.rowTotal(row);
    if (total <= 0) return 0;
    return (row[part] / total) * 100;
  }

  barPct(value: number): number {
    if (value <= 0 || this.maxSingleCount <= 0) return 0;
    return (value / this.maxSingleCount) * 100;
  }

  /** Stage where most students are still “in progress” (current bottleneck). */
  peakInProgressStage(): AdminStudentProgressStageRow | null {
    if (!this.stats?.studentProgressByStage?.length) return null;
    let best: AdminStudentProgressStageRow | null = null;
    for (const row of this.stats.studentProgressByStage) {
      if (!best || row.inProgress > best.inProgress) best = row;
    }
    return best && best.inProgress > 0 ? best : null;
  }

  /** Stage with the largest “not started” backlog. */
  peakNotStartedStage(): AdminStudentProgressStageRow | null {
    if (!this.stats?.studentProgressByStage?.length) return null;
    let best: AdminStudentProgressStageRow | null = null;
    for (const row of this.stats.studentProgressByStage) {
      if (!best || row.notStarted > best.notStarted) best = row;
    }
    return best && best.notStarted > 0 ? best : null;
  }

  /** All roles except students and agents (admins, teachers, guests, etc.). */
  otherUserCount(): number {
    if (!this.stats?.users) return 0;
    const u = this.stats.users;
    return Math.max(0, u.total - u.students - u.agents);
  }

  pctOfTotal(part: number): string {
    if (!this.stats?.users?.total || this.stats.users.total <= 0) return '0';
    return ((Math.min(part, this.stats.users.total) / this.stats.users.total) * 100).toFixed(1);
  }

  isPeakInProgress(row: AdminStudentProgressStageRow): boolean {
    const peak = this.peakInProgressStage();
    return !!peak && peak.stage === row.stage && peak.inProgress > 0;
  }

  isPeakNotStarted(row: AdminStudentProgressStageRow): boolean {
    const peak = this.peakNotStartedStage();
    return !!peak && peak.stage === row.stage && peak.notStarted > 0;
  }
}
