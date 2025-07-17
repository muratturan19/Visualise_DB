import { forwardRef } from 'react'
import { Bar, Line, Scatter, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

interface RangeFilterOptions {
  start?: number
  end?: number
}

const rangeFilterPlugin = {
  id: 'rangeFilter',
  beforeInit(chart: ChartJS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(chart as any).originalData = chart.data.datasets.map((d: any) => [...d.data])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(chart as any).originalLabels = chart.data.labels ? [...(chart.data.labels as any[])] : []
  },
  beforeDatasetsUpdate(chart: ChartJS, _args: unknown, opts: RangeFilterOptions) {
    const { start = 0, end } = opts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origData = (chart as any).originalData as any[][]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origLabels = (chart as any).originalLabels as any[]
    if (!origData || !origLabels) return
    const sliceEnd = end ?? origLabels.length
    chart.data.labels = origLabels.slice(start, sliceEnd)
    chart.data.datasets.forEach((ds, idx) => {
      ds.data = origData[idx].slice(start, sliceEnd)
    })
  },
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  rangeFilterPlugin
)

// eslint-disable-next-line react-refresh/only-export-components
export const defaultPalette = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1']

// eslint-disable-next-line react-refresh/only-export-components
export const baseOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: { enabled: true },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy' as const,
      },
      pan: {
        enabled: true,
        mode: 'xy' as const,
      },
    },
  },
}

interface Props {
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'doughnut'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartWrapper = forwardRef<any, Props>(
  ({ type, data, options }, ref) => {
    const opts = { ...baseOptions, ...options }
    if (type === 'bar') return <Bar ref={ref} data={data} options={opts} />
    if (type === 'line') return <Line ref={ref} data={data} options={opts} />
    if (type === 'scatter') return <Scatter ref={ref} data={data} options={opts} />
    if (type === 'pie') return <Pie ref={ref} data={data} options={opts} />
    if (type === 'doughnut') return <Doughnut ref={ref} data={data} options={opts} />
    return null
  }
)

export default ChartWrapper
