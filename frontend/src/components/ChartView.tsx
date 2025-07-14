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
  const values = data.map((d) => d[y])

  const chartData = {
    labels,
    datasets: [
      {
        label: y,
        data: values,
      },
    ],
  }

  if (chartType === 'bar') return <Bar data={chartData} />
  if (chartType === 'line') return <Line data={chartData} />
  if (chartType === 'scatter') {
    const scatterData = {
      datasets: [
        {
          label: `${y} vs ${x}`,
          data: data.map((d) => ({ x: d[x], y: d[y] })),
        },
      ],
    }
    return <Scatter data={scatterData} />
  }

  return null
}
