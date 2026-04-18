import { Component, effect, OnInit, ViewChild, ElementRef, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { AnalyticsSignalStore } from '../../signal_stores/analytics.signal.store';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-weaknesses',
  imports: [SidebarComponent, TranslatePipe],
  templateUrl: './weaknesses.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class WeaknessesPage implements OnInit {
  tag = localStorage.getItem('tag');
  constructor(
    public analyticsStore: AnalyticsSignalStore,
    private destroyRef: DestroyRef,
    private translate: TranslateService,
  ) {
    effect(() => {
      if (this.tag != null) {
        this.analyticsStore.loadSummary(this.tag);
        this.analyticsStore.loadWeaknesses(this.tag);
        this.analyticsStore.loadProblematicCards(this.tag);
      }
    });

    effect(() => {
      const wr = this.analyticsStore.weaknesses();
      if (wr) {
        const tryCreate = (attempt = 0) => {
          if (this.chartRef?.nativeElement) {
            this.createOrUpdateChart();
            return;
          }
          if (attempt < 10) {
            setTimeout(() => tryCreate(attempt + 1), 100);
          }
        };
        tryCreate();
      }
    });
  }

  @ViewChild('weaknessesChart', { static: false }) private chartRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  public get barChartOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { title: { display: true, text: this.translate.instant('PAGES.WEAKNESSES.ARCHETYPE') } },
        y: {
          title: { display: true, text: this.translate.instant('PAGES.WEAKNESSES.BATTLES_LABEL') },
          beginAtZero: true,
        },
      },
    } as ChartOptions;
  }

  private createOrUpdateChart() {
    const wr = this.analyticsStore.weaknesses();
    if (!wr || !this.chartRef?.nativeElement) return;
    let byArchetype: any[] = [];
    if (Array.isArray((wr as any).byArchetype)) {
      byArchetype = (wr as any).byArchetype;
    } else if (typeof (wr as any).byArchetypeJson === 'string') {
      try {
        byArchetype = JSON.parse((wr as any).byArchetypeJson);
      } catch (e) {
        console.warn('WeaknessesPage: error parsing byArchetypeJson', e);
        return;
      }
    } else {
      // No tenemos datos en el formato esperado
      return;
    }

    const labels = byArchetype.map((a: any) => a.archetype);
    const data = byArchetype.map((a: any) => a.battles);
    const bgColors = byArchetype.map((a: any) => {
      if (a.label && a.label.toLowerCase().includes('fort')) return 'rgba(46, 204, 113, 0.9)';
      if (a.label && a.label.toLowerCase().includes('debil')) return 'rgba(231, 76, 60, 0.9)';
      return 'rgba(149, 165, 166, 0.9)';
    });

    const config = {
      type: 'bar' as const,
      data: {
        labels,
        datasets: [
          {
            label: this.translate.instant('PAGES.WEAKNESSES.BATTLES_LABEL'),
            data,
            backgroundColor: bgColors,
            borderColor: bgColors,
            borderWidth: 1,
          },
        ],
      },
      options: this.barChartOptions,
    };
    Chart.register(...registerables);

    if (this.chart) {
      this.chart.data.labels = config.data.labels as any;
      this.chart.data.datasets = config.data.datasets as any;
      this.chart.options = config.options as any;
      this.chart.update();
    } else {
      const ctx = this.chartRef.nativeElement.getContext('2d');
      if (!ctx) return;
      this.chart = new Chart(ctx, config as any);
    }
  }

  ngOnInit(): void {
    if (this.chartRef?.nativeElement) {
      this.createOrUpdateChart();
    }

    // Registrar la limpieza del chart cuando el componente sea destruido.
    this.destroyRef.onDestroy(() => {
      if (this.chart) {
        this.chart.destroy();
        this.chart = undefined;
      }
    });
  }
}
