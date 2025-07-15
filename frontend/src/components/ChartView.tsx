import { Bar, Line, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  chartType: 'bar' | 'line' | 'scatter'
  x: string
  y: string
}

export default function ChartView({ data, chartType, x, y }: Props) {
  if (!data || data.length === 0) {
    return <p>No results for chart.</p>
  }

  const labels = data.map((d) => d[x])

  // Determine which columns to plot on the y axis. Handle comma separated
  // lists or fallback to any numeric columns found in the result set.
  let yKeys = Array.isArray(y) ? y : y.split(',').map((s) => s.trim())
  if (!yKeys[0]) {
    yKeys = Object.keys(data[0]).filter((k) => k !== x)
  }
  yKeys = yKeys.filter((k) => typeof data[0][k] === 'number')

  const palette = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1']
  const datasets = yKeys.map((key, idx) => ({
    label: key,
    data: data.map((d) => d[key]),
    borderColor: palette[idx % palette.length],
    backgroundColor: palette[idx % palette.length],
    fill: false,
  }))

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: yKeys.join(' vs ') },
    },
  }

  if (chartType === 'bar') return <Bar data={{ labels, datasets }} options={options} />
  if (chartType === 'line') return <Line data={{ labels, datasets }} options={options} />
  if (chartType === 'scatter') {
    const scatterData = {
      datasets: yKeys.slice(0, 2).map((key, idx) => ({
        label: key,
        data: data.map((d) => ({ x: d[x], y: d[key] })),
        borderColor: palette[idx % palette.length],
        backgroundColor: palette[idx % palette.length],
      })),
    }
    return <Scatter data={scatterData} options={options} />
  }

  return null
}
